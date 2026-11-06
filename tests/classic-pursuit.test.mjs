import test from 'node:test';
import assert from 'node:assert/strict';
import {createClassicPursuer, advanceClassicPursuer, CLASSIC_PURSUIT_VERSION, CLASSIC_PURSUIT_VOLLEY} from '../src/game/combat/classic-pursuit.js';

const DT = .02;
function enemyAt({x = 360, y = -85, role = 'raider', seed = 0, width = 720, height = 1280,
  minAttackY = 135} = {}) {
  return {type: 'scout', x, y, s: 150, r: 38, hp: 2, maxHp: 2,
    classicScout: createClassicPursuer({x, role, seed, width, height, minAttackY})};
}
function step(item, player, shots, dt = DT) {
  item.y += item.s * dt;
  advanceClassicPursuer(item, dt, player, shot => shots.push({...shot, at: item.classicScout.age,
    target: item.classicScout.lockedTarget}));
}
function until(item, player, predicate, shots = [], maxFrames = 1000) {
  for (let index = 0; index < maxFrames && !predicate(); index++) step(item, player, shots);
  assert.ok(predicate(), 'expected encounter state reached in bounded time');
  return shots;
}

test('new pursuit keeps the legacy item contract and has no independent timer', () => {
  const item = enemyAt(), enemy = item.classicScout;
  assert.equal(enemy.tacticsVersion, CLASSIC_PURSUIT_VERSION);
  assert.equal(enemy.animator.getFrame().state, 'spawn');
  const frame = enemy.animator.getFrame();
  assert.ok(frame.rect.width > 0);
  assert.equal(enemy.stage, 'entry');
  const before = {age: enemy.age, x: item.x, y: item.y, s: item.s, frame: frame.frameIndex};
  advanceClassicPursuer(item, 0, {x: 360, y: 1080}, () => assert.fail('paused shot'));
  assert.deepEqual({age: enemy.age, x: item.x, y: item.y, s: item.s,
    frame: enemy.animator.getFrame().frameIndex}, before);
  assert.throws(() => createClassicPursuer({x: NaN}), /spawn/);
  assert.throws(() => createClassicPursuer({x: 360, role: 'boss'}), /spawn/);
  assert.throws(() => advanceClassicPursuer(item, -.01, {x: 360, y: 1080}, () => {}), /delta/);
});

test('short mechanical deployment locks its sampled aim and waits for the authored fire event', () => {
  const item = enemyAt({x: 210}), player = {x: 510, y: 1080}, shots = [];
  until(item, player, () => item.classicScout.state === 'charge', shots);
  const chargedAt = item.classicScout.age, lock = item.classicScout.lockedTarget;
  assert.deepEqual(lock, {x: 510, y: 1080});
  player.x = 80;
  for (let index = 0; index < 14; index++) {
    step(item, player, shots);
    assert.equal(shots.length, 0, 'no shot before the short weapon-deployment pose');
    assert.deepEqual(item.classicScout.lockedTarget, lock, 'aim does not follow later input');
  }
  until(item, player, () => shots.length > 0, shots);
  assert.ok(shots[0].at - chargedAt >= .32);
  assert.ok(shots[0].vx > 0, 'shot travels toward the observed right-hand target, not the new left position');
  assert.ok(shots[0].vy > 0);
  assert.ok(Math.abs(Math.hypot(shots[0].vx, shots[0].vy) - 360) < 1e-8);
  assert.equal(shots[0].classicScoutProjectile, true);
  const velocity = {vx: shots[0].vx, vy: shots[0].vy};
  for (let index = 0; index < 20; index++) step(item, player, shots);
  assert.deepEqual({vx: shots[0].vx, vy: shots[0].vy}, velocity, 'there is no homing after launch');
  assert.equal(shots.filter(shot => shot.attackSerial === 1).length, 1, 'one emission for the animation');
});

test('damage cancels charging with real hurt frames and no hidden projectile or immediate retry', () => {
  const item = enemyAt(), player = {x: 360, y: 1080}, shots = [];
  until(item, player, () => item.classicScout.attackScheduled, shots);
  assert.equal(shots.length, 0);
  item.hp = 1;
  step(item, player, shots);
  assert.equal(item.classicScout.state, 'reposition');
  assert.equal(item.classicScout.animator.getFrame().state, 'hurt');
  assert.equal(item.classicScout.telegraph, 0);
  assert.equal(item.classicScout.lockedTarget, null);
  assert.equal(item.classicScout.attackScheduled, false);
  for (let index = 0; index < 45; index++) step(item, player, shots);
  assert.equal(shots.length, 0);
});

test('a close approach or a player crossing above the enemy cancels the locked attack', () => {
  for (const y of [280, 360, 120]) {
    const item = enemyAt({y: 180}), player = {x: 360, y: 1080}, shots = [];
    until(item, player, () => item.classicScout.state === 'charge', shots);
    player.y = y;
    step(item, player, shots);
    assert.equal(item.classicScout.state, 'reposition');
    for (let index = 0; index < 100; index++) step(item, player, shots);
    assert.equal(shots.length, 0, 'never fires from close range or behind the player');
  }
});

test('death stops attacks and plays the terminal produced animation', () => {
  const item = enemyAt(), player = {x: 360, y: 1080}, shots = [];
  until(item, player, () => item.classicScout.state === 'charge', shots);
  item.hp = 0;
  for (let index = 0; index < 80; index++) step(item, player, shots);
  assert.equal(shots.length, 0);
  assert.equal(item.classicScout.state, 'destroyed');
  assert.equal(item.classicScout.animator.getFrame().state, 'destroy');
  assert.equal(item.classicScout.animator.getFrame().done, true);
});

test('roles choose distinct interior repositioning lanes with bounded movement and deterministic replay', () => {
  const player = {x: 530, y: 1100}, results = {};
  for (const role of ['raider', 'scout', 'interceptor']) {
    const item = enemyAt({x: 190, role}), replay = enemyAt({x: 190, role});
    let frames = 0;
    while (item.classicScout.state !== 'reposition' && frames++ < 600) {
      step(item, player, []); step(replay, player, []);
      assert.equal(item.x, replay.x);
      assert.equal(item.y, replay.y);
      assert.equal(item.classicScout.state, replay.classicScout.state);
      assert.ok(Math.abs(item.classicScout.vx) <= 176 + 1e-8);
    }
    assert.equal(item.classicScout.state, 'reposition');
    results[role] = item.classicScout.targetX;
    assert.ok(results[role] >= item.classicScout.combatMinX);
    assert.ok(results[role] <= item.classicScout.combatMaxX);
  }
  assert.notEqual(results.scout, results.raider);
  assert.notEqual(results.interceptor, results.raider);
});

test('large resume deltas are capped rather than skipping an unobserved attack warning', () => {
  const item = enemyAt({y: 180}), player = {x: 360, y: 1080};
  const before = item.classicScout.age;
  advanceClassicPursuer(item, 10, player, () => assert.fail('resume cannot emit an instant attack'));
  assert.equal(item.classicScout.age - before, .05);
});

test('100 seeds across three roles keep readable, finite, bounded attacks and an evadeable trajectory', () => {
  let totalShots = 0;
  for (let seed = 0; seed < 100; seed++) {
    const role = ['raider', 'scout', 'interceptor'][seed % 3];
    const width = seed % 2 ? 720 : 390;
    const player = {x: width * (.22 + (seed % 6) * .1), y: 1080};
    const item = enemyAt({x: 52 + (seed * 83 % Math.floor(width - 104)), width, seed, role});
    const shots = [], charges = new Map();
    for (let frame = 0; frame < 2000 && item.y < 1240; frame++) {
      const previousX = item.x;
      step(item, player, shots);
      const enemy = item.classicScout;
      if (enemy.state === 'charge' && !charges.has(enemy.chargeSerial)) {
        charges.set(enemy.chargeSerial, enemy.chargeStartedAt);
      }
      assert.ok(item.x >= 52 && item.x <= width - 52);
      assert.ok(Math.abs(item.x - previousX) <= 176 * DT + 1e-8);
      assert.ok(Number.isFinite(item.s) && item.s >= -82 && item.s <= 202.5);
    }
    assert.ok(shots.length > 0, `${role}/${seed} presents an actual attack`);
    const serials = new Set(shots.map(shot => shot.attackSerial));
    // 40 s de combate: sin retirada (propietario, 21/10), pero con un ritmo
    // acotado incluso en la intensidad máxima (recarga ×0,46).
    const fastestGap = {raider: 1.25, scout: 1.6, interceptor: 1.15}[role] * .46 * .65 + .6;
    assert.ok(serials.size <= Math.ceil(40 / fastestGap), 'bounded number of attacks');
    for (const serial of serials) {
      assert.ok(shots.filter(shot => shot.attackSerial === serial).length <= CLASSIC_PURSUIT_VOLLEY.maxProjectiles,
        'one charge emits at most a three-shot volley');
    }
    assert.equal(shots.filter(shot => shot.attackSerial === Math.min(...serials)).length, 1,
      'the first attack is always a single teaching shot');
    for (const shot of shots) {
      totalShots++;
      assert.ok(shot.y <= player.y - 230 + 1e-8, 'minimum reaction distance');
      assert.ok(shot.y >= 135 + 38, 'weapon is visible below the HUD');
      assert.ok(shot.at - charges.get(shot.attackSerial) >= .3 - 1e-8);
      // Even the minimum vertical spacing permits a 180 px/s player to clear
      // a 38+9px combined collision radius before this non-homing shot arrives.
      const travelTime = (player.y - shot.y) / shot.vy;
      assert.ok(travelTime * 180 > 47 * 2, 'a visible ballistic shot has room for an evasive response');
      assert.ok(shot.damage >= 12 && shot.damage <= 15);
    }
  }
  assert.ok(totalShots >= 100);
});


test('a surviving opponent brakes into a visible band and re-engages instead of merely crossing the screen', () => {
  for (const role of ['raider', 'scout', 'interceptor']) {
    const item = enemyAt({role}), player = {x: 360, y: 1080}, shots = [], held = [], states = new Set();
    for (let frame = 0; frame < 1800; frame++) {
      step(item, player, shots);
      const enemy = item.classicScout;
      states.add(enemy.state);
      if (enemy.combatStartedAt !== null && enemy.state !== 'retreat') {
        held.push({age: enemy.age, y: item.y, speed: item.s, x: item.x});
        assert.ok(item.y >= enemy.minAttackY, 'enemy remains visible below the HUD');
        assert.ok(item.y + 38 < player.y - 230, 'combat band leaves a reaction corridor');
        assert.ok(item.x >= enemy.combatMinX && item.x <= enemy.combatMaxX,
          'active opponent does not hide in the old inaccessible edge lane');
      }
    }
    for (const state of ['entry', 'brake', 'charge', 'fire', 'reposition']) {
      assert.ok(states.has(state), `${role} actually traverses ${state}`);
    }
    assert.ok(shots.length >= 3, `${role} completes repeated attacks with real animation events`);
    assert.ok(shots.at(-1).at - shots[0].at >= 6, 'multiple combat opportunities span several seconds');
    assert.ok(held.at(-1).age - held[0].age >= 7, 'the enemy persists as a fightable opponent');
    assert.ok(Math.max(...held.map(q => q.y)) - Math.min(...held.map(q => q.y)) < 110,
      'the new physical depth arcs stay in a bounded combat band, never descending past the ship');
    assert.ok(held.some(q => Math.abs(q.speed) < 1), 'vertical velocity genuinely settles');
    assert.equal(item.hp, 2, 'persistence does not inflate HP');
    // Propietario (21/10): si no lo eliminas, no se va y sube de intensidad.
    assert.notEqual(item.classicScout.state, 'retreat', `${role} keeps fighting while it can attack`);
    assert.ok(item.classicScout.intensity >= 2, `${role} escalates the longer it survives`);
  }
});

test('procedural role manoeuvres trace two-dimensional arcs with individual seeded signatures', () => {
  const signatures = new Set();
  for (const role of ['raider', 'scout', 'interceptor']) for (const seed of [11, 42, 107]) {
    const item = enemyAt({role, seed}), player = {x: 360, y: 1080}, shots = [], trace = [];
    until(item, player, () => item.classicScout.combatStartedAt !== null, shots);
    for (let frame = 0; frame < 600 && item.classicScout.state !== 'retreat'; frame++) {
      const previousVelocity = item.classicScout.vx, previousSpeed = item.s;
      step(item, player, shots);
      const cap = {raider: 265, scout: 190, interceptor: 315}[role];
      assert.ok(Math.abs(item.classicScout.vx - previousVelocity) <= cap * DT + 1e-8,
        'all apparent bank/arc changes come from bounded physical acceleration');
      assert.ok(Math.abs(item.s - previousSpeed) <= 150 * 1.8 * DT + 1e-8);
      trace.push({x: item.x, y: item.y, vx: item.classicScout.vx, vy: item.s});
    }
    const spreadX = Math.max(...trace.map(q => q.x)) - Math.min(...trace.map(q => q.x));
    const spreadY = Math.max(...trace.map(q => q.y)) - Math.min(...trace.map(q => q.y));
    assert.ok(spreadX > 75, `${role}/${seed} changes its fighting lane`);
    assert.ok(spreadY > 20, `${role}/${seed} has genuine depth movement`);
    assert.ok(trace.some(q => q.vx > 25) && trace.some(q => q.vx < -25), 'the opponent reverses its strafe');
    assert.ok(trace.some(q => q.vy > 6) && trace.some(q => q.vy < -6), 'the opponent curves in depth');
    signatures.add(trace.filter((_, index) => index % 50 === 0).map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join('|'));
  }
  assert.equal(signatures.size, 9, 'different roles/seeds cannot replay one identical trajectory');
});

test('height corrections use the existing speed field and never integrate Y twice', () => {
  const item = enemyAt(), player = {x: 360, y: 1080}, shots = [];
  until(item, player, () => item.classicScout.state === 'charge', shots);
  const y = item.y;
  advanceClassicPursuer(item, .02, player, shot => shots.push(shot));
  assert.equal(item.y, y, 'only the legacy caller owns positional Y integration');
  // A vertical player manoeuvre moves the legal combat band; the opponent
  // corrects gradually with negative speed rather than snapping to that band.
  player.y = 570;
  for (let frame = 0; frame < 50; frame++) step(item, player, shots);
  assert.ok(item.s < 0, 'the opponent can back up to keep a safe visible band');
  assert.ok(item.s >= -82);
  assert.ok(item.y < y && item.y > item.classicScout.minAttackY);
});

test('an interrupted opponent reloads and resumes the fight after hurt without becoming invulnerable', () => {
  const item = enemyAt(), player = {x: 360, y: 1080}, shots = [];
  until(item, player, () => item.classicScout.attackScheduled, shots);
  const interruptedSerial = item.classicScout.chargeSerial;
  item.hp = 1;
  step(item, player, shots);
  assert.equal(item.classicScout.state, 'reposition');
  assert.equal(item.classicScout.animator.getFrame().state, 'hurt');
  until(item, player, () => shots.length > 0, shots);
  assert.ok(shots[0].attackSerial > interruptedSerial);
  assert.equal(shots.filter(shot => shot.attackSerial === interruptedSerial).length, 0);
  assert.equal(item.hp, 1, 'the policy never heals or grants temporary HP');
  assert.equal(item.classicScout.animator.getFrame().hp, 1);
});

test('small widths preserve reachable fighting lanes, pause freezes the whole engagement, and retreat is bounded', () => {
  for (const width of [250, 320, 390, 720]) {
    for (const role of ['raider', 'scout', 'interceptor']) {
      const item = enemyAt({x: width * .25, width, role, height: 844, minAttackY: 115});
      const player = {x: width * .5, y: 720}, shots = [];
      until(item, player, () => item.classicScout.state === 'charge', shots);
      const enemy = item.classicScout;
      assert.ok(enemy.targetX >= enemy.combatMinX && enemy.targetX <= enemy.combatMaxX);
      const paused = {x: item.x, y: item.y, s: item.s, age: enemy.age, stateAge: enemy.stateAge,
        telegraph: enemy.telegraph, lock: enemy.lockedTarget, frame: enemy.animator.getFrame().frameIndex};
      for (let count = 0; count < 200; count++) advanceClassicPursuer(item, 0, player, () => assert.fail('paused emission'));
      assert.deepEqual({x: item.x, y: item.y, s: item.s, age: enemy.age, stateAge: enemy.stateAge,
        telegraph: enemy.telegraph, lock: enemy.lockedTarget, frame: enemy.animator.getFrame().frameIndex}, paused);
      const firedBefore = shots.length;
      for (let frame = 0; frame < 1500; frame++) step(item, player, shots);
      assert.notEqual(enemy.state, 'retreat', 'a surviving opponent keeps its slot while it can attack');
      assert.ok(shots.length > firedBefore, 'and keeps attacking within the reachable lanes');
      assert.ok(item.x >= enemy.combatMinX && item.x <= enemy.combatMaxX && item.y < 844);
    }
  }
});

test('a ship too close to the HUD cannot provoke an unavoidable shot or an endless stationary enemy', () => {
  const item = enemyAt({role: 'interceptor'}), player = {x: 360, y: 180}, shots = [];
  until(item, player, () => item.classicScout.state === 'retreat', shots, 1900);
  assert.equal(shots.length, 0);
  assert.equal(item.classicScout.retreatReason, 'time-limit');
  until(item, player, () => item.y - item.r > 1280, shots, 1200);
  assert.equal(shots.length, 0);
  assert.ok(item.classicScout.age < 42);
});


test('lead is based only on finite past observations, capped, and a launched projectile never steers', () => {
  const item = enemyAt({role: 'interceptor'}), player = {x: 160, y: 1080}, shots = [];
  for (let frame = 0; frame < 600 && item.classicScout.state !== 'charge'; frame++) {
    player.x = Math.min(550, 160 + frame * 1.1);
    step(item, player, shots);
  }
  const enemy = item.classicScout;
  assert.equal(enemy.state, 'charge');
  assert.ok(enemy.observedTarget.vx > 0);
  assert.ok(enemy.leadOffset > 0 && enemy.leadOffset <= 110);
  assert.ok(enemy.lockedTarget.x >= enemy.observedTarget.x);
  const target = {...enemy.lockedTarget};
  player.x = 119;
  until(item, player, () => shots.length > 0, shots);
  assert.equal(shots[0].leadOffset, enemy.leadOffset);
  const projected = shots[0].x + shots[0].vx * ((target.y - shots[0].y) / shots[0].vy);
  assert.ok(Math.abs(projected - target.x) < 1e-6);
  const launched = {...shots[0]};
  for (let frame = 0; frame < 60; frame++) step(item, {x: frame % 2 ? 601 : 119, y: 1080}, shots);
  assert.deepEqual(shots[0], launched, 'no later pilot sample can steer a projectile');
});

test('undamaged enemies remain engaged beyond three attacks with a bounded projectile lifetime', () => {
  for (const role of ['raider', 'scout', 'interceptor']) {
    const item = enemyAt({role}), player = {x: 360, y: 1080}, shots = [];
    until(item, player, () => shots.length >= 4, shots, 1600);
    assert.notEqual(item.classicScout.state, 'retreat');
    const atFourth = item.classicScout.age;
    assert.ok(item.classicScout.combatStartedAt !== null);
    for (let frame = 0; frame < 1600; frame++) step(item, player, shots);
    assert.notEqual(item.classicScout.state, 'retreat');
    assert.ok(item.classicScout.age - atFourth > 1);
    // A shot occupies the screen until it leaves the bottom edge (or its life ends).
    const onScreen = shot => Math.min(shot.life, (1280 - shot.y) / shot.vy);
    const activeAt = seconds => shots.filter(shot => shot.at <= seconds && shot.at + onScreen(shot) > seconds).length;
    for (let seconds = 0; seconds < item.classicScout.age; seconds += .1) {
      // Un abanico abierto (5) más la ráfaga anterior (hasta 3) siguen en pantalla (plan F3b).
      assert.ok(activeAt(seconds) <= CLASSIC_PURSUIT_VOLLEY.spreadCount + 3, `${role} cannot saturate the screen with unlimited persistent shots`);
    }
    assert.ok(shots.length >= 4 && shots.length <= 40 * CLASSIC_PURSUIT_VOLLEY.maxProjectiles);
    assert.ok(new Set(shots.map(shot => shot.volley)).size >= 2, `${role} varies its volleys`);
  }
});

test('v5 opponents mix single, double and spread volleys with irregular waits instead of one fixed rhythm', () => {
  const kinds = new Set(), waits = new Set();
  let doubles = 0, spreads = 0;
  for (const role of ['raider', 'scout', 'interceptor']) for (const seed of [3, 21, 58, 90]) {
    const item = enemyAt({role, seed}), player = {x: 360, y: 1080}, shots = [];
    for (let frame = 0; frame < 3000; frame++) step(item, player, shots);
    const bySerial = new Map();
    for (const shot of shots) bySerial.set(shot.attackSerial, [...(bySerial.get(shot.attackSerial) || []), shot]);
    const starts = [...bySerial.values()].map(volley => volley[0].at);
    for (let index = 1; index < starts.length; index++) waits.add((starts[index] - starts[index - 1]).toFixed(2));
    for (const volley of bySerial.values()) {
      kinds.add(volley[0].volley);
      if (volley[0].volley === 'double') {
        doubles++;
        if (volley.length === 2) assert.ok(Math.abs(volley[1].at - volley[0].at - CLASSIC_PURSUIT_VOLLEY.doubleGap) < .03);
      }
      if (volley[0].volley === 'spread') {
        spreads++;
        // Abanico abierto desde la F3b (spec 6.10): cinco disparos.
        assert.equal(volley.length, CLASSIC_PURSUIT_VOLLEY.spreadCount);
        assert.ok(new Set(volley.map(shot => shot.vx.toFixed(3))).size === CLASSIC_PURSUIT_VOLLEY.spreadCount, 'a fan has distinct directions');
        for (const shot of volley) assert.ok(shot.vy > 0 && Math.abs(shot.vx / shot.vy) <= CLASSIC_PURSUIT_VOLLEY.spreadCone + 1e-9);
      }
    }
  }
  assert.deepEqual([...kinds].sort(), ['double', 'single', 'spread']);
  assert.ok(doubles > 0 && spreads > 0);
  assert.ok(waits.size >= 10, 'waits between attacks are irregular');
});

test('an enemy you do not destroy stays and attacks more often the longer it survives', () => {
  // Propietario (21/10): «si no lo eliminas, que siga atacando y con más
  // intensidad», para que con muchas patrullas haya que decidir a quién derribar.
  // Propietario (22/10, auditoría J01): tope de intensidad 2.
  for (const role of ['raider', 'scout', 'interceptor']) for (let seed = 0; seed < 4; seed++) {
    const item = enemyAt({role, seed}), player = {x: 220 + seed * 60, y: 1080}, shots = [];
    for (let frame = 0; frame < 2500; frame++) step(item, player, shots);
    const enemy = item.classicScout;
    assert.notEqual(enemy.state, 'retreat', `${role}/${seed} never leaves while it can attack`);
    assert.equal(enemy.intensity, 2, `${role}/${seed} reaches the top intensity (capped at 2)`);
    const starts = [...new Map(shots.map(shot => [shot.attackSerial, shot.at])).values()];
    const gap = list => (list.at(-1) - list[0]) / (list.length - 1);
    const early = starts.filter(at => at < enemy.combatStartedAt + 9), late = starts.filter(at => at > 36);
    assert.ok(early.length >= 2 && late.length >= 2);
    assert.ok(gap(late) < gap(early), `${role}/${seed} attacks more often late (${gap(late).toFixed(2)} s) than early (${gap(early).toFixed(2)} s)`);
  }
});

test('a patrol holds fire while holdFire is set (comet shower ceasefire) and resumes after', () => {
  // Propietario (22/10, auditoría J04): alto el fuego durante la lluvia de cometas.
  for (const role of ['raider', 'scout', 'interceptor']) {
    const item = enemyAt({role}), player = {x: 360, y: 1080}, shots = [];
    for (let frame = 0; frame < 600; frame++) step(item, player, shots);
    assert.ok(shots.length > 0, `${role} fires before the shower`);
    item.classicScout.holdFire = true;
    const before = shots.length;
    for (let frame = 0; frame < 900; frame++) step(item, player, shots);
    assert.equal(shots.length, before, `${role} fires nothing during the ceasefire`);
    assert.notEqual(item.classicScout.state, 'charge');
    item.classicScout.holdFire = false;
    for (let frame = 0; frame < 900; frame++) step(item, player, shots);
    assert.ok(shots.length > before, `${role} attacks again afterwards`);
  }
});

// Auditoría 03/11 (A15, propietario 06/11): el cono grande es solo del abanico
// abierto; los tiros simples y dobles vuelven a ~33° (0,65).
test('only the open fan uses the wide cone; single and double shots stay near 33°', () => {
  let widest = 0, widestFan = 0;
  for (const role of ['raider', 'scout', 'interceptor']) for (const seed of [3, 21, 58, 90]) for (const px of [10, 710]) {
    const item = enemyAt({role, seed}), player = {x: px, y: 640}, shots = [];
    for (let frame = 0; frame < 3000; frame++) step(item, player, shots);
    for (const shot of shots) {
      const slope = Math.abs(shot.vx / shot.vy);
      if (shot.volley === 'spread') widestFan = Math.max(widestFan, slope);
      else widest = Math.max(widest, slope);
    }
  }
  assert.ok(widest <= CLASSIC_PURSUIT_VOLLEY.cone + 1e-9 && CLASSIC_PURSUIT_VOLLEY.cone === .65, `aimed shots reach ${widest}`);
  assert.ok(widestFan > CLASSIC_PURSUIT_VOLLEY.cone && widestFan <= CLASSIC_PURSUIT_VOLLEY.spreadCone + 1e-9, `fans reach ${widestFan}`);
});
