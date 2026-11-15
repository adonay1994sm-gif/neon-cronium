import test from 'node:test';
import assert from 'node:assert/strict';
import {GAIA_ENEMY_RULES, createGaiaEnemy, advanceGaiaEnemy, advanceMine, advanceCrossBomb} from '../src/game/combat/gaia-enemies.js';
import {createAttackTokens, requestAttack, releaseAttack} from '../src/game/combat/attack-tokens.js';

// Plan F3b: enemigos nuevos de Gaia (biblia §3.1) sobre la IA de perfiles.
const DT = 1 / 60, BOUNDS = {w: 720, h: 1280};

function spawn(kind, {x = 360, y = 300, id = kind} = {}) {
  const gaia = createGaiaEnemy({kind, x, y, now: 0});
  return {id, x, y, hp: gaia.hp, maxHp: gaia.maxHp, gaia};
}

function sim(item, seconds, {player = {x: 360, y: 1050}, tokens = createAttackTokens({max: 2}), allies = [], anchor, onStep} = {}) {
  const events = [], warnings = [];
  let now = 0, wasPending = false;
  for (let frame = 0; frame < Math.round(seconds / DT); frame++) {
    now += DT;
    advanceGaiaEnemy(item, DT, {now, player: {...player, hull: 100, reloading: false}, bounds: BOUNDS,
      allies: [item, ...allies], tokens, anchor}, event => events.push({...event, at: now}));
    if (item.gaia.pending && !wasPending) warnings.push({at: now, aim: {...item.gaia.aim}, ability: item.gaia.pending});
    wasPending = Boolean(item.gaia.pending);
    onStep?.(now, item);
  }
  return {events, warnings};
}

const pointLineDistance = (p, a, v) => Math.abs((p.x - a.x) * v.vy - (p.y - a.y) * v.vx) / Math.hypot(v.vx, v.vy);

test('the tracker enters from below and stays behind the ship', () => {
  const item = spawn('tracker', {y: 1320}), player = {x: 360, y: 1050};
  sim(item, 4, {player});
  assert.ok(item.y > player.y, `y=${item.y}`);
});

test('the tracker warns before shooting upward at the ship', () => {
  const item = spawn('tracker', {y: 1320}), player = {x: 300, y: 1050};
  const {events, warnings} = sim(item, 8, {player});
  const shot = events.find(event => event.type === 'shot');
  assert.ok(shot, 'it shoots');
  const warning = warnings.filter(w => w.ability === 'basic' && w.at <= shot.at).at(-1);
  assert.ok(shot.at - warning.at >= GAIA_ENEMY_RULES.tracker.warning - 1e-9);
  assert.ok(shot.vy < 0, 'upward');
  assert.ok(pointLineDistance(warning.aim, shot, shot) < 30);
});

test('the tracker marks the ship every 9 seconds', () => {
  const item = spawn('tracker', {y: 1320});
  const marks = sim(item, 30).events.filter(event => event.type === 'mark');
  // Se va como mucho a los 12 s (revisión F3b): le da tiempo a una marca.
  assert.ok(marks.length >= 1);
  assert.equal(marks[0].seconds, 4);
  for (let index = 1; index < marks.length; index++) assert.ok(marks[index].at - marks[index - 1].at >= 9 - 1e-9);
});

test('it never attacks without a token', () => {
  const tokens = createAttackTokens({max: 1});
  requestAttack(tokens, {id: 'other', bornAt: -1}, 0);
  const item = spawn('tracker', {y: 1320});
  const {events} = sim(item, 10, {tokens});
  assert.equal(events.filter(event => event.type === 'shot').length, 0);
});

test('same seed, same events', () => {
  const a = sim(spawn('tracker', {y: 1320}), 12).events, b = sim(spawn('tracker', {y: 1320}), 12).events;
  assert.deepEqual(a, b);
});

// Tarea 5: Sembrador, minas y bomba en cruz.
// Sembrador rehecho (propietario, 30/10 y 15/11/2026): «que tire unas cuantas
// minas repartidas por donde vas a pasar y que se vaya». Entra por arriba,
// cruza la franja alta, lanza 4 minas en zigzag delante de la nave y se marcha.
const SHIP = {x: 360, y: 1050};
function sowerRun(seconds = 16, player = SHIP) {
  const item = spawn('sower', {x: 216, y: -70});
  let lowest = -Infinity, lastMineAt = 0, goneAt = null;
  const {events} = sim(item, seconds, {player, onStep: (now, it) => {
    lowest = Math.max(lowest, it.y);
    if (goneAt === null && it.gaia.leaving && it.y < -80) goneAt = now;
  }});
  const mines = events.filter(event => event.type === 'mine');
  if (mines.length) lastMineAt = mines.at(-1).at;
  return {item, events, mines, lowest, lastMineAt, goneAt};
}

test('the sower enters from above and works the upper band, far from the ship', () => {
  const {lowest} = sowerRun();
  assert.ok(lowest <= .22 * BOUNDS.h + 40, `comes down to y=${lowest.toFixed(0)}`);
  assert.ok(lowest <= SHIP.y - 600);
});

test('the sower throws exactly four mines spread across the ship\'s path, then leaves', () => {
  const {mines, lastMineAt, goneAt} = sowerRun();
  assert.equal(mines.length, 4);
  const xs = mines.map(mine => mine.tx).sort((a, b) => a - b);
  for (const mine of mines) {
    assert.ok(mine.tx >= 60 && mine.tx <= BOUNDS.w - 60, `x ${mine.tx}`);
    assert.ok(mine.ty >= SHIP.y - 450 && mine.ty <= SHIP.y - 250, `lands ahead of the ship at y ${mine.ty}`);
    assert.ok(mine.y < mine.ty, 'thrown down from the sower');
  }
  assert.ok(xs[0] <= SHIP.x - 150 && xs[3] >= SHIP.x + 150, `covers both sides: ${xs}`);
  // Zigzag: entre dos minas vecinas queda hueco para pasar (estallan a 70 px).
  const byX = [...mines].sort((a, b) => a.tx - b.tx);
  for (let k = 1; k < byX.length; k++) {
    const gap = Math.hypot(byX[k].tx - byX[k - 1].tx, byX[k].ty - byX[k - 1].ty);
    assert.ok(gap - 2 * 70 >= 70, `a gap of ${(gap - 140).toFixed(0)} px between mines ${k - 1} and ${k}`);
  }
  assert.ok(goneAt !== null && goneAt - lastMineAt < 5, `gone ${goneAt} s, last mine ${lastMineAt} s`);
});

test('the four mines are laid around where the ship was when the run began', () => {
  const left = sowerRun(16, {x: 120, y: 1050}).mines.map(mine => mine.tx);
  const right = sowerRun(16, {x: 600, y: 1050}).mines.map(mine => mine.tx);
  assert.ok(Math.min(...left) < Math.min(...right) || Math.max(...left) < Math.max(...right));
});

test('a thrown mine flies to its spot, arms, then drifts down across the ship\'s lane', () => {
  const mine = {x: 300, y: 260, tx: 200, ty: 640, age: 0, armed: false};
  const far = {x: 900, y: 0};
  for (let t = 0; t < .5 - 1e-9; t += DT) advanceMine(mine, DT, far);
  assert.ok(Math.hypot(mine.x - 200, mine.y - 640) < 6, `lands at ${mine.x.toFixed(0)},${mine.y.toFixed(0)}`);
  const landed = mine.y;
  for (let t = 0; t < 2; t += DT) advanceMine(mine, DT, far);
  assert.ok(mine.armed);
  assert.ok(mine.y - landed > 120 && mine.y - landed < 240, `drifts ${(mine.y - landed).toFixed(0)} px in 2 s`);
  assert.ok(Math.abs(mine.x - 200) < 1e-9, 'straight down');
});

test('a mine arms after 0.8 s and only explodes near the ship', () => {
  const near = {x: 360, y: 1000, age: 0, armed: false}, far = {x: 360, y: 1000, age: 0, armed: false};
  const results = [];
  const {life} = GAIA_ENEMY_RULES.sower.mine;
  for (let t = 0; t < life + .2; t += DT) {
    results.push([t, advanceMine(near, DT, {x: near.x + 60, y: near.y}), advanceMine(far, DT, {x: far.x + 100, y: far.y})]);
  }
  const boom = results.find(([, result]) => result === 'explode');
  assert.ok(boom && boom[0] >= .8 - DT, `explodes at ${boom?.[0]}`);
  assert.ok(!results.some(([, , result]) => result === 'explode'), 'a mine 100 px away never explodes');
  assert.ok(results.some(([t, , result]) => result === 'expire' && t >= life - 2 * DT));
});

test('the cross bomb bursts into three rays at the edge', () => {
  const bomb = {x: 100, y: 900, vx: -300};
  let rays = null;
  for (let frame = 0; frame < 120 && !rays; frame++) rays = advanceCrossBomb(bomb, DT, BOUNDS);
  assert.equal(rays.length, 3);
  assert.ok(rays.some(ray => ray.vx > 0 && ray.vy === 0), 'inward');
  assert.ok(rays.some(ray => ray.vy < 0 && ray.vx === 0), 'up');
  assert.ok(rays.some(ray => ray.vy > 0 && ray.vx === 0), 'down');
  for (const ray of rays) assert.ok(ray.x <= 1 && ray.damage > 0);
});

// La bomba en X sigue disponible para los Sembradores en manada de los tramos
// altos (calendario del sector 1); el de una pasada no la lanza (abajo).
test('the sower throws its cross bomb toward the nearest edge when it has it ready', () => {
  const sower = spawn('sower', {x: 80, y: 256});
  sower.gaia.cooldowns.unique = 0;
  const bombs = sim(sower, 3).events.filter(event => event.type === 'cross-bomb');
  assert.ok(bombs.length >= 1);
  for (const bomb of bombs) assert.equal(Math.sign(bomb.vx), bomb.x < BOUNDS.w / 2 ? -1 : 1);
});

// Tarea 6: Égida y Alfa.
test('the aegis follows the weakest ally and shields it', () => {
  const item = spawn('aegis', {x: 600, y: 300});
  const weak = {id: 'weak', x: 200, y: 400, hp: 2, maxHp: 4}, strong = {id: 'strong', x: 500, y: 300, hp: 4, maxHp: 4};
  const start = Math.hypot(item.x - weak.x, item.y - weak.y);
  const shields = sim(item, 20, {allies: [weak, strong]}).events.filter(event => event.type === 'shield');
  assert.ok(Math.hypot(item.x - weak.x, item.y - weak.y) < start);
  assert.ok(shields.length >= 2);
  assert.deepEqual({targetId: shields[0].targetId, hits: shields[0].hits}, {targetId: 'weak', hits: 3});
  for (let index = 1; index < shields.length; index++) assert.ok(shields[index].at - shields[index - 1].at >= 8 - 1e-9);
});

test('the aegis never shoots and needs no token', () => {
  const tokens = createAttackTokens({max: 1});
  requestAttack(tokens, {id: 'other', bornAt: -1}, 0);
  const {events} = sim(spawn('aegis'), 12, {tokens, allies: [{id: 'ally', x: 300, y: 300, hp: 1, maxHp: 2}]});
  assert.ok(events.some(event => event.type === 'shield'));
  assert.ok(!events.some(event => event.type === 'shot'));
});

test('the alpha keeps 320 px above the ship', () => {
  const player = {x: 360, y: 1050};
  sim(spawn('alpha', {y: 200}), 12, {player, onStep: (now, it) => assert.ok(it.y <= player.y - 320 + 1e-9, `y=${it.y}`)});
});

test('the alpha fires four parallel cannons', () => {
  const shots = sim(spawn('alpha', {y: 200}), 6).events.filter(event => event.type === 'shot');
  const first = shots.filter(shot => shot.at === shots[0].at);
  assert.equal(first.length, 4);
  const xs = first.map(shot => shot.x).sort((a, b) => a - b);
  for (const shot of first) assert.equal(shot.vx, 0);
  for (let index = 1; index < xs.length; index++) assert.ok(Math.abs(xs[index] - xs[index - 1] - 28) < 1e-9);
});

test('the alpha cross volley has eight shots', () => {
  const shots = sim(spawn('alpha', {y: 200}), 12).events.filter(event => event.type === 'shot');
  const volleys = new Map();
  for (const shot of shots) volleys.set(shot.at, [...(volleys.get(shot.at) || []), shot]);
  const cross = [...volleys.values()].find(volley => volley.length === 8);
  assert.ok(cross, 'a cross volley was fired');
  assert.equal(new Set(cross.map(shot => Math.atan2(shot.vy, shot.vx).toFixed(3))).size, 8);
});

// Revisión final F3b: el Rastreador no se queda para siempre detrás de la nave.
test('the tracker overtakes the ship and leaves after three attacks or 12 seconds', () => {
  const item = spawn('tracker', {y: 1320}), player = {x: 360, y: 1050};
  let leftAt = null, aboveShip = false, shotsWhileLeaving = 0;
  const {events} = sim(item, 30, {player, onStep: (now, it) => {
    if (it.gaia.leaving && leftAt === null) leftAt = now;
    if (it.gaia.leaving && it.y < player.y - 100) aboveShip = true;
  }});
  for (const event of events) if (leftAt !== null && event.at > leftAt + 1e-9 && event.type === 'shot') shotsWhileLeaving++;
  assert.ok(leftAt !== null && leftAt <= 12 + 1e-9, `leaves at ${leftAt}`);
  assert.ok(aboveShip, 'it passes in front of the ship, where it can be shot');
  assert.ok(item.y < -60, `ends above the screen (y=${item.y})`);
  assert.equal(shotsWhileLeaving, 0);
});

// Plan F3c: escoltas de la furia de Atlas (3 de vida, órbita de 1,6·r, disparo hacia abajo con turno).
test('atlas escorts circle Atlas and shoot down with a token', () => {
  const anchor = {x: 360, y: 300, r: 100}, tokens = createAttackTokens({max: 1});
  const item = spawn('atlasEscort', {x: 360, y: 140});
  assert.equal(item.hp, 3);
  assert.equal(GAIA_ENEMY_RULES.atlasEscort.salvageRole, 'scout');
  assert.ok(requestAttack(tokens, {id: 'rival', bornAt: -1}, 0), 'a rival holds the only turn');
  const angles = [];
  const held = sim(item, 4, {tokens, anchor, onStep: (now, enemy) => {
    if (now > 2) {
      assert.ok(Math.abs(Math.hypot(enemy.x - anchor.x, enemy.y - anchor.y) - 1.6 * anchor.r) < 12, 'it orbits at 1.6·r');
      angles.push(Math.atan2(enemy.y - anchor.y, enemy.x - anchor.x));
    }
  }});
  assert.equal(held.events.filter(event => event.type === 'shot').length, 0, 'no shot without a turn');
  assert.ok(new Set(angles.map(angle => angle.toFixed(1))).size > 5, 'it keeps circling');
  releaseAttack(tokens, 'rival');
  const {events, warnings} = sim(item, 6, {tokens, anchor});
  const shots = events.filter(event => event.type === 'shot');
  assert.ok(shots.length >= 1 && warnings.length >= 1);
  assert.ok(shots.every(shot => shot.vx === 0 && shot.vy > 0 && shot.damage > 0), 'it shoots straight down');
});

// Revisión del PR #72 (15/11/2026): dos Alfas en fila tampoco se pisan cuando el
// jugador sube y baja, ni al entrar los dos a la vez (radio 58 cada uno).
function packRun(move, seconds = 30, delay = 0) {
  const pack = [spawn('alpha', {x: 216, y: -70, id: 'gaia:0:8:0'})], late = spawn('alpha', {x: 504, y: -70, id: 'gaia:0:8:1'});
  if (!delay) pack.push(late);
  const tokens = createAttackTokens({max: 3});
  let now = 0, closest = Infinity, shots = 0;
  for (let frame = 0; frame < Math.round(seconds / DT); frame++) {
    now += DT;
    if (delay && pack.length === 1 && now >= delay) pack.push(late);
    const player = {...move(now), hull: 100, reloading: false};
    for (const item of pack) {
      const allies = pack.map(other => ({id: other.id, x: other.x, y: other.y, hp: other.hp, maxHp: other.maxHp, profile: other.gaia.profile}));
      advanceGaiaEnemy(item, DT, {now, player, bounds: BOUNDS, allies, tokens}, event => { if (event.type === 'shot') shots++; });
    }
    if (pack.length > 1) closest = Math.min(closest, Math.hypot(pack[0].x - pack[1].x, pack[0].y - pack[1].y));
  }
  return {closest, pack, shots};
}

test('two alphas that arrive together settle in a column above a still ship', () => {
  const {closest, pack, shots} = packRun(() => ({x: 360, y: 1050}));
  assert.ok(closest >= 116, `closest ${closest.toFixed(1)}`);
  assert.ok(Math.abs(pack[0].x - 360) < 2 && Math.abs(pack[1].x - 360) < 2, 'both above the ship');
  assert.ok(Math.abs(Math.abs(pack[0].y - pack[1].y) - 140) < 2, 'one 140 px behind the other');
  assert.ok(shots > 40, 'both keep firing');
});

for (const [name, move] of Object.entries({
  'sways sideways': t => ({x: 360 + 250 * Math.sin(t * 1.3), y: 1050}),
  'climbs and dives slowly': t => ({x: 360, y: 900 + 200 * Math.sin(t * .9)}),
  'climbs and dives fast': t => ({x: 360, y: 950 + 150 * Math.sin(t * 2.4)}),
  'moves diagonally': t => ({x: 360 + 200 * Math.sin(t * 1.1), y: 900 + 200 * Math.sin(t * 1.7)}),
  'hugs the edge': t => ({x: 62, y: 1050 - 150 * Math.sin(t)})
})) {
  test(`two alphas never overlap while the ship ${name}`, () => {
    const {closest} = packRun(move);
    assert.ok(closest >= 116, `closest ${closest.toFixed(1)}`);
  });
}

// Revisión del PR #73: la fila no puede empujar al Alfa de delante hacia la nave.
test('with the ship at the top of the screen the alphas still keep their 320 px', () => {
  const {pack} = packRun(() => ({x: 360, y: 418}));
  for (const alpha of pack) {
    assert.ok(alpha.y <= 418 - 320 + 1, `alpha at y=${alpha.y.toFixed(1)}`);
    assert.ok(alpha.y >= 40, 'and stays on screen');
  }
});

test('an alpha that arrives six seconds later joins the column without touching the first', () => {
  const {closest, pack} = packRun(t => ({x: 360 + 120 * Math.sin(t * 1.3), y: 1050}), 30, 6);
  assert.ok(closest >= 116, `closest ${closest.toFixed(1)}`);
  assert.ok(Math.abs(pack[0].y - pack[1].y) >= 139);
});

// Visto en Chromium (15/11/2026): lanzaba las minas al entrar, todavía bajo el
// marcador. Solo lanza cuando ya está en su franja, a la vista.
test('the sower only throws once it has reached its band, in view', () => {
  const {mines} = sowerRun();
  for (const mine of mines) assert.ok(mine.y - 20 >= .22 * BOUNDS.h - 41, `thrown from y=${(mine.y - 20).toFixed(0)}`);
});

// Revisión del PR #76 (15/11/2026).
test('a one-pass sower never throws the cross bomb', () => {
  for (const player of [SHIP, {x: 120, y: 1050}, {x: 600, y: 900}]) {
    const {events} = sowerRun(16, player);
    assert.equal(events.filter(event => event.type === 'cross-bomb').length, 0);
  }
});

test('one mine always lands in the lane of the ship, so standing still is not safe', () => {
  for (const x of [120, 190, 300, 360, 420, 600]) {
    const {mines} = sowerRun(16, {x, y: 1050});
    const nearest = Math.min(...mines.map(mine => Math.abs(mine.tx - x)));
    assert.ok(nearest <= 45, `ship at x=${x}: nearest mine ${nearest.toFixed(0)} px away`);
  }
});

test('with the ship high up the mines still land below the sower, in view', () => {
  const {mines} = sowerRun(16, {x: 360, y: 420});
  for (const mine of mines) assert.ok(mine.ty >= .22 * BOUNDS.h + 100, `lands at y ${mine.ty}`);
});
