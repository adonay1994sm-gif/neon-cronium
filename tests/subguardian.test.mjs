import test from 'node:test';
import assert from 'node:assert/strict';
import {SUBGUARDIAN_RULES, createSubguardian, advanceSubguardian, subguardianHitsShip, hitSubguardian,
  subguardianEmitter, subguardianFrame} from '../src/game/combat/subguardian.js';

// Subguardián del tramo 5 (dec-subguardian-plan, 31/10/2026).
const DT = 1 / 60, W = 720, H = 1280, SHIP = {x: W / 2, y: H * .85, r: 30};
const make = (seed = 7) => createSubguardian({width: W, height: H, seed});

function run(boss, seconds, onStep, target = SHIP) {
  const events = [];
  let now = 0;
  for (let frame = 0; frame < Math.round(seconds / DT); frame++) {
    now += DT;
    advanceSubguardian(boss, DT, event => events.push({...event, at: now}), target);
    onStep?.(now, boss);
  }
  return events;
}

test('it flies in, then turns three warned attacks: twin cannons, fan, big laser', () => {
  const boss = make();
  const events = run(boss, 40);
  const warnings = events.filter(event => event.type === 'warning').map(event => event.attack);
  assert.deepEqual(warnings.slice(0, 3), ['twin', 'fan', 'laser']);
  for (let index = 3; index < warnings.length; index++) assert.notEqual(warnings[index], warnings[index - 1]);
  // Cada ataque se avisa antes de disparar, con su tiempo de aviso.
  for (const fire of events.filter(event => event.type === 'fire')) {
    const warning = events.filter(event => event.type === 'warning' && event.at <= fire.at).at(-1);
    assert.equal(warning.attack, fire.attack);
    assert.ok(fire.at - warning.at >= SUBGUARDIAN_RULES[fire.attack].warning - DT * 1.5, fire.attack);
  }
});

test('it is never static: it patrols the top band and changes height between attacks', () => {
  const boss = make(3), xs = [], ys = [];
  run(boss, 30, (now, b) => { if (now > SUBGUARDIAN_RULES.entrySeconds) { xs.push(b.x); ys.push(b.y); } });
  assert.ok(Math.max(...xs) - Math.min(...xs) > W * .3, 'crosses a good part of the screen');
  assert.ok(Math.max(...ys) - Math.min(...ys) > 20, 'changes height');
  assert.ok(xs.every(x => x >= W * SUBGUARDIAN_RULES.motion.minX - 1 && x <= W * SUBGUARDIAN_RULES.motion.maxX + 1));
  assert.ok(ys.every(y => y < H * .3), 'stays in the top band');
});

test('twin cannons aim at the ship; the fan opens in two shifted waves', () => {
  const boss = make();
  const target = {x: W * .2, y: H * .8, r: 30};
  const events = run(boss, 12, null, target);
  const twin = events.filter(event => event.type === 'projectile' && event.damage === SUBGUARDIAN_RULES.twin.damage);
  assert.equal(twin.length, SUBGUARDIAN_RULES.twin.bursts * 2);
  for (const shot of twin) assert.ok(shot.vx < 0 && shot.vy > 0, 'towards the ship on the left');
  const fan = events.filter(event => event.type === 'projectile' && event.damage === SUBGUARDIAN_RULES.fan.damage);
  assert.equal(fan.length, SUBGUARDIAN_RULES.fan.projectiles * SUBGUARDIAN_RULES.fan.waves);
  const angles = wave => fan.slice(wave * 7, wave * 7 + 7).map(shot => Math.atan2(shot.vx, shot.vy));
  assert.notDeepEqual(angles(0), angles(1));
});

test('the laser is silent while it warns, then sweeps from the emitter and burns the ship in its path', () => {
  const boss = make();
  let warned = false, fired = false;
  run(boss, 40, (now, b) => {
    if (b.attack !== 'laser') return;
    if (b.state === 'warning') { warned = true; assert.equal(subguardianHitsShip(b, SHIP), 0); assert.equal(b.vx, 0); }
    if (b.state === 'attack') fired = true;
  });
  assert.ok(warned && fired);
  const laser = make();
  Object.assign(laser, {state: 'attack', attack: 'laser', x: W / 2, y: 260});
  const origin = subguardianEmitter(laser);
  laser.beam = {angle: Math.atan2(SHIP.x - origin.x, SHIP.y - origin.y), direction: 1, active: true};
  assert.equal(subguardianHitsShip(laser, SHIP), SUBGUARDIAN_RULES.laser.damage);
  laser.beam.angle += .4;
  assert.equal(subguardianHitsShip(laser, SHIP), 0);
});

test('60 hits of damage bring it down once; it cannot be hit while flying in', () => {
  const boss = make();
  assert.equal(hitSubguardian(boss, 10).accepted, false, 'entry');
  run(boss, 2.2);
  assert.equal(hitSubguardian(boss, 59).hp, 1);
  assert.equal(hitSubguardian(boss, 5).hp, 0);
  assert.equal(boss.state, 'defeated');
  assert.equal(hitSubguardian(boss, 5).accepted, false);
  const events = run(boss, 2);
  assert.equal(events.filter(event => event.type === 'defeated').length, 1);
  assert.equal(boss.resolved, true);
  assert.equal(subguardianFrame(boss), 7);
});

test('dt 0 (pause) changes nothing', () => {
  const boss = make();
  run(boss, 5);
  const before = JSON.stringify(boss);
  advanceSubguardian(boss, 0, () => assert.fail('no events while paused'), SHIP);
  assert.equal(JSON.stringify(boss), before);
});

test('the sheet frame follows what it is doing', () => {
  const boss = make();
  Object.assign(boss, {state: 'idle', vx: -100});
  assert.equal(subguardianFrame(boss), 1);
  boss.vx = 100; assert.equal(subguardianFrame(boss), 2);
  Object.assign(boss, {vx: 0, hp: 10}); assert.equal(subguardianFrame(boss), 3);
  Object.assign(boss, {state: 'attack', attack: 'twin'}); assert.equal(subguardianFrame(boss), 4);
  Object.assign(boss, {state: 'warning', attack: 'laser'}); assert.equal(subguardianFrame(boss), 5);
  Object.assign(boss, {state: 'attack', attack: 'laser'}); assert.equal(subguardianFrame(boss), 6);
});
