import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CLASSIC_WEAPON_RULES, createClassicWeapons, selectClassicWeapon, unlockClassicWeapon,
  triggerClassicWeapon, advanceClassicWeapons, hitClassicProjectile,
  classicWeaponSnapshot, setClassicRechargeInterval, setClassicUnlimitedFire,
  canTriggerClassicMissile, triggerClassicMissile, setClassicWeaponTuning, setClassicWeaponLevels, setClassicMaxCharges, setClassicHotReload} from '../src/game/combat/classic-weapons.js';

const origin = {x: 360, y: 1000};
const run = (state, seconds, events = []) => {
  let remaining = seconds;
  while (remaining > 1e-9) {
    const delta = Math.min(1 / 60, remaining);
    events.push(...advanceClassicWeapons(state, delta));
    remaining -= delta;
  }
  return events;
};

test('a match starts with twenty pulses and a trigger cannot spend through cooldown', () => {
  const state = createClassicWeapons();
  assert.equal(state.version, 'classic-weapons-v4');
  assert.equal(CLASSIC_WEAPON_RULES.maxCharges, 20);
  assert.equal(state.charges, 20);
  const first = triggerClassicWeapon(state, origin);
  assert.equal(first.accepted, true);
  assert.equal(first.projectiles.length, 1);
  assert.equal(state.charges, 19);
  const before = classicWeaponSnapshot(state);
  assert.equal(triggerClassicWeapon(state, origin).reason, 'cooldown');
  assert.deepEqual(classicWeaponSnapshot(state), before);
  run(state, .24);
  assert.equal(triggerClassicWeapon(state, origin).accepted, true);
  run(state, .24);
  assert.equal(triggerClassicWeapon(state, origin).accepted, true);
  assert.equal(state.charges, 17);
});

test('continuous fire depletes the twenty-round magazine without stopping gradual recharge', () => {
  const state = createClassicWeapons();
  const rechargeEvents = [];
  let emitted = 0;
  while (state.charges > 0 && emitted < 40) {
    const result = triggerClassicWeapon(state, origin);
    assert.equal(result.accepted, true);
    emitted++;
    if (state.charges > 0) run(state, CLASSIC_WEAPON_RULES.types.pulse.cooldown, rechargeEvents);
  }
  assert.equal(state.charges, 0);
  assert.equal(emitted, 22, 'twenty stored shots plus two recovered during the burst');
  assert.equal(rechargeEvents.filter(event => event.type === 'recharged').length, 2);
  const before = classicWeaponSnapshot(state);
  assert.equal(triggerClassicWeapon(state, origin).reason, 'empty');
  assert.deepEqual(classicWeaponSnapshot(state), before);
  const untilRecovery = CLASSIC_WEAPON_RULES.rechargeSeconds - state.recharge;
  assert.ok(untilRecovery > .01 && untilRecovery < 2);
  run(state, untilRecovery - .01);
  assert.equal(state.charges, 0);
  const events = run(state, .01);
  assert.equal(state.charges, 1, 'empty magazines recover one round rather than filling at once');
  assert.equal(events.filter(event => event.type === 'recharged').length, 1);
  assert.equal(triggerClassicWeapon(state, origin).accepted, true);
  assert.equal(state.charges, 0);
});

test('recharge gives one round per two played seconds and does not restart on another shot', () => {
  const state = createClassicWeapons();
  assert.equal(CLASSIC_WEAPON_RULES.rechargeSeconds, 2);
  triggerClassicWeapon(state, origin);
  run(state, 1);
  triggerClassicWeapon(state, origin);
  run(state, .99);
  assert.equal(state.charges, 18);
  const events = run(state, .01);
  assert.equal(state.charges, 19);
  assert.equal(events.filter(event => event.type === 'recharged').length, 1);
  run(state, 2);
  assert.equal(state.charges, 20);
  assert.equal(state.recharge, 0);
  run(state, 10);
  triggerClassicWeapon(state, origin);
  assert.equal(state.recharge, 0, 'full magazines cannot bank free ammunition');
  run(state, 1.99);
  assert.equal(state.charges, 19);
});

test('C9 cooling uses its configured interval while the base magazine still recovers every two seconds', () => {
  const standard = createClassicWeapons();
  const cooled = createClassicWeapons({rechargeSeconds: 1.5});
  const intermediate = createClassicWeapons({rechargeSeconds: 1.75});
  assert.equal(standard.rechargeSeconds, 2);
  assert.equal(cooled.rechargeSeconds, 1.5);
  assert.equal(intermediate.rechargeSeconds, 1.75);
  for (const state of [standard, cooled]) {
    triggerClassicWeapon(state, origin);
    run(state, 1.49);
    assert.equal(state.charges, 19);
  }
  assert.equal(run(cooled, .01).filter(event => event.type === 'recharged').length, 1);
  assert.equal(cooled.charges, 20);
  assert.equal(classicWeaponSnapshot(cooled).rechargeProgress, 0);
  run(standard, .01);
  assert.equal(standard.charges, 19);
  assert.ok(Math.abs(classicWeaponSnapshot(standard).rechargeProgress - .75) < 1e-9);
  run(standard, .5);
  assert.equal(standard.charges, 20);
});

test('installing cooling preserves partial recovery and does not refill or bypass cooldown', () => {
  const state = createClassicWeapons({unlocked: ['pulse', 'twin']});
  triggerClassicWeapon(state, origin);
  run(state, .5);
  triggerClassicWeapon(state, origin);
  const before = classicWeaponSnapshot(state);
  assert.equal(setClassicRechargeInterval(state, 1.5), 1.5);
  assert.equal(state.rechargeSeconds, 1.5);
  assert.equal(state.recharge, before.recharge, 'played recovery seconds survive installation');
  assert.equal(state.charges, before.charges);
  assert.equal(state.cooldown, before.cooldown);
  assert.equal(state.elapsed, before.elapsed);
  assert.equal(state.eventSequence, before.eventSequence);
  assert.deepEqual(state.projectiles, before.projectiles);
  assert.ok(Math.abs(classicWeaponSnapshot(state).rechargeProgress - 1 / 3) < 1e-9);
  const installed = classicWeaponSnapshot(state);
  setClassicRechargeInterval(state, 1.5);
  assert.deepEqual(classicWeaponSnapshot(state), installed, 'repeated installation is idempotent');
  selectClassicWeapon(state, 'twin');
  assert.equal(state.rechargeSeconds, 1.5);
  assert.equal(state.charges, before.charges);
  assert.equal(state.recharge, before.recharge);
  assert.equal(triggerClassicWeapon(state, origin).reason, 'cooldown');
  run(state, .99);
  assert.equal(state.charges, 18);
  assert.equal(run(state, .01).filter(event => event.type === 'recharged').length, 1);
  assert.equal(state.charges, 19);
});

test('late cooling installation waits for played time instead of issuing ammunition while paused', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin);
  run(state, 1.9);
  const sequence = state.eventSequence;
  setClassicRechargeInterval(state, 1.5);
  assert.equal(state.charges, 19);
  assert.ok(state.recharge >= 0 && state.recharge < 1.5);
  assert.equal(state.eventSequence, sequence);
  const paused = classicWeaponSnapshot(state);
  for (let frame = 0; frame < 60; frame++) assert.deepEqual(advanceClassicWeapons(state, 0), []);
  assert.deepEqual(classicWeaponSnapshot(state), paused);
  const resumed = advanceClassicWeapons(state, 86400);
  assert.equal(resumed.filter(event => event.type === 'recharged').length, 1);
  assert.equal(state.charges, 20);
  assert.equal(state.recharge, 0);
  assert.ok(Math.abs(state.elapsed - paused.elapsed - .05) < 1e-9);
  setClassicRechargeInterval(state, 2);
  assert.equal(state.charges, 20);
  assert.equal(state.recharge, 0);
  triggerClassicWeapon(state, origin);
  run(state, 1.5);
  assert.equal(state.charges, 19, 'returning to the base module restores its actual interval');
});

test('invalid cooling intervals reject before mutating the match or constructing an unsupported model', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin);
  run(state, .1);
  const before = classicWeaponSnapshot(state);
  for (const invalid of [.99, 2.01, -1, 0, NaN, Infinity, -Infinity, '1.5', null]) {
    assert.throws(() => createClassicWeapons({rechargeSeconds: invalid}));
    assert.throws(() => setClassicRechargeInterval(state, invalid));
    assert.deepEqual(classicWeaponSnapshot(state), before);
  }
});

test('rank II cooling recovers one round per played second without granting a free refill', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin); run(state, .4);
  const before = classicWeaponSnapshot(state);
  setClassicRechargeInterval(state, 1);
  assert.equal(state.charges, before.charges);
  assert.equal(state.recharge, before.recharge);
  advanceClassicWeapons(state, 0);
  assert.equal(state.charges, 19);
  run(state, .59); assert.equal(state.charges, 19);
  run(state, .01); assert.equal(state.charges, 20);
});

test('Abanico is a short physical three-bolt cone that spends one charge and expires before a distant target', () => {
  const state = createClassicWeapons({type: 'scatter', unlocked: ['pulse', 'scatter']});
  const fired = triggerClassicWeapon(state, origin);
  assert.equal(fired.projectiles.length, 3);
  assert.equal(state.charges, 19);
  assert.ok(fired.projectiles[0].vx < 0 && fired.projectiles[2].vx > 0);
  assert.ok(Math.abs(fired.projectiles[1].vx) < 1e-9);
  assert.equal(fired.projectiles.reduce((sum, bolt) => sum + bolt.damage, 0), 3);
  run(state, .34);
  assert.equal(state.projectiles.length, 0, 'short range is enforced by lifetime, not a cosmetic taper');
});

test('Abanico II changes future range and cone while already emitted bolts and recovery stay intact', () => {
  const state = createClassicWeapons({type: 'scatter', unlocked: ['pulse', 'scatter']});
  triggerClassicWeapon(state, origin);
  const before = classicWeaponSnapshot(state);
  const result = setClassicWeaponTuning(state, {scatter: 2});
  result.scatter = 1;
  assert.deepEqual(state.projectiles, before.projectiles);
  assert.equal(state.charges, before.charges); assert.equal(state.cooldown, before.cooldown);
  assert.equal(state.recharge, before.recharge); assert.equal(state.elapsed, before.elapsed);
  run(state, .4);
  const fired = triggerClassicWeapon(state, origin);
  assert.equal(fired.projectiles[0].duration, .48);
  assert.ok(Math.abs(fired.projectiles[0].vx) < Math.abs(before.projectiles[0].vx));
  assert.match(classicWeaponSnapshot(state).description, /317/);
});

test('Aguja and resonance use distinct target receipts and bounded three/four-target penetration', () => {
  for (const rank of [1, 2]) {
    const state = createClassicWeapons({type: 'needle', unlocked: ['pulse', 'needle']});
    setClassicWeaponTuning(state, {needle: rank});
    const bolt = triggerClassicWeapon(state, origin).projectiles[0];
    assert.equal(bolt.radius, 4); assert.equal(bolt.damage, 2);
    assert.equal(state.cooldown, rank === 1 ? .56 : .46);
    const targets = rank === 1 ? 3 : 4;
    for (let index = 0; index < targets; index++) {
      assert.equal(hitClassicProjectile(state, bolt.id, `enemy:${index}`).damage, 2);
      if (index < targets - 1) assert.equal(hitClassicProjectile(state, bolt.id, `enemy:${index}`).reason, 'duplicate');
    }
    assert.equal(state.projectiles.length, 0);
    assert.equal(hitClassicProjectile(state, bolt.id, 'another').reason, 'inactive');
  }
});

test('tuning rejects invalid ranks atomically and snapshots cannot mutate installed ranks', () => {
  const state = createClassicWeapons(), before = classicWeaponSnapshot(state);
  for (const ranks of [null, [], {scatter: 3}, {scatter: 2, needle: -1}, {needle: 1.5}, {pulse: 2}]) {
    assert.throws(() => setClassicWeaponTuning(state, ranks));
    assert.deepEqual(classicWeaponSnapshot(state), before);
  }
  setClassicWeaponTuning(state, {scatter: 2, needle: 2});
  const snapshot = classicWeaponSnapshot(state); snapshot.weaponRanks.scatter = 1;
  assert.equal(state.weaponRanks.scatter, 2);
  assert.deepEqual(state.unlocked, ['pulse'], 'tuning cannot grant weapon ownership');
});

test('zero delta freezes cooldown, charge recovery, projectile movement and event identity', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin);
  run(state, .1);
  const before = classicWeaponSnapshot(state);
  for (let index = 0; index < 60; index++) assert.deepEqual(advanceClassicWeapons(state, 0), []);
  assert.deepEqual(classicWeaponSnapshot(state), before);
});

test('a suspended-frame delta cannot refill ammunition or jump projectiles across the arena', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin);
  const beforeY = state.projectiles[0].y;
  advanceClassicWeapons(state, 86400);
  assert.equal(state.charges, 19);
  assert.equal(state.elapsed, .05);
  assert.equal(state.recharge, .05);
  assert.ok(Math.abs(state.projectiles[0].y - beforeY + 920 * .05) < 1e-8);
});

test('twin keeps two centered, parallel muzzles and spends one shared charge', () => {
  const state = createClassicWeapons({type: 'twin', unlocked: ['pulse', 'twin']});
  const result = triggerClassicWeapon(state, origin);
  assert.equal(result.projectiles.length, 2);
  assert.equal(state.charges, 19);
  const [left, right] = result.projectiles;
  assert.equal(left.x, 350); assert.equal(right.x, 370);
  assert.ok(Math.abs(left.vx) < 1e-9 && Math.abs(right.vx) < 1e-9);
  assert.equal(left.vy, -900); assert.equal(right.vy, -900);
  assert.equal(left.damage + right.damage, 2);
  assert.equal(left.shotId, right.shotId);
  assert.notEqual(left.id, right.id);
  assert.equal(result.events.filter(event => event.type === 'fired').length, 1);
  assert.equal(result.events.filter(event => event.type === 'projectile').length, 2);
  // Both pulses overlap a small target on the ship's centerline. At each
  // distance the paths stay narrow rather than separating toward the edges.
  for (const targetY of [925, 700, 250]) {
    const stateAtDistance = createClassicWeapons({type: 'twin', unlocked: ['pulse', 'twin']});
    const shot = triggerClassicWeapon(stateAtDistance, origin);
    run(stateAtDistance, (origin.y - targetY) / 900);
    for (const projectile of shot.projectiles) {
      assert.ok(Math.abs(projectile.x - origin.x) <= 10 + 1e-9);
      assert.ok(Math.hypot(projectile.x - origin.x, projectile.y - targetY) <= projectile.radius + 4,
        `each twin path must intersect a centered four-pixel target at y=${targetY}`);
      assert.equal(hitClassicProjectile(stateAtDistance, projectile.id, `center-${targetY}`).damage, 1);
    }
  }
});

test('muzzles rotate with the direction and selecting a weapon never refills or bypasses cooldown', () => {
  const state = createClassicWeapons({unlocked: ['pulse', 'twin']});
  triggerClassicWeapon(state, origin);
  run(state, .1);
  const timing = {charges: state.charges, cooldown: state.cooldown, recharge: state.recharge};
  assert.equal(selectClassicWeapon(state, 'twin').accepted, true);
  assert.deepEqual({charges: state.charges, cooldown: state.cooldown, recharge: state.recharge}, timing);
  assert.equal(triggerClassicWeapon(state, origin).reason, 'cooldown');
  run(state, .2);
  const result = triggerClassicWeapon(state, {x: 100, y: 200, angle: 0});
  assert.equal(result.projectiles[0].x, 100);
  assert.equal(result.projectiles[0].y, 190);
  assert.equal(result.projectiles[1].y, 210);
  assert.ok(result.projectiles.every(projectile => projectile.vx > 0));
});

test('locked and unknown selections cannot mutate the current match', () => {
  const state = createClassicWeapons();
  const before = classicWeaponSnapshot(state);
  assert.equal(selectClassicWeapon(state, 'twin').reason, 'locked');
  assert.throws(() => selectClassicWeapon(state, 'unknown'), RangeError);
  assert.deepEqual(classicWeaponSnapshot(state), before);
});

test('a repeated unlock reward is idempotent and cannot equip or refill a weapon', () => {
  const state = createClassicWeapons();
  triggerClassicWeapon(state, origin);
  run(state, .1);
  const before = {selected: state.selected, charges: state.charges,
    cooldown: state.cooldown, recharge: state.recharge};
  const first = unlockClassicWeapon(state, 'twin');
  assert.equal(first.accepted, true);
  assert.equal(first.events.length, 1);
  assert.deepEqual(state.unlocked, ['pulse', 'twin']);
  const after = classicWeaponSnapshot(state);
  assert.equal(unlockClassicWeapon(state, 'twin').accepted, false);
  assert.deepEqual(classicWeaponSnapshot(state), after);
  assert.deepEqual({selected: state.selected, charges: state.charges,
    cooldown: state.cooldown, recharge: state.recharge}, before);
  assert.equal(selectClassicWeapon(state, 'twin').accepted, true);
});

test('collision damage is delivered once per projectile and twin barrels remain independent', () => {
  const state = createClassicWeapons({type: 'twin', unlocked: ['pulse', 'twin']});
  const result = triggerClassicWeapon(state, origin);
  const [left, right] = result.projectiles;
  const first = hitClassicProjectile(state, left.id, 'enemy-7');
  assert.equal(first.accepted, true);
  assert.equal(first.damage, 1);
  assert.equal(first.events.filter(event => event.type === 'hit').length, 1);
  for (let index = 0; index < 12; index++) {
    const repeat = hitClassicProjectile(state, left.id, 'enemy-7');
    assert.equal(repeat.accepted, false);
    assert.equal(repeat.damage, 0);
    assert.equal(repeat.events.length, 0);
  }
  assert.equal(hitClassicProjectile(state, right.id, 'enemy-7').accepted, true);
  assert.equal(state.projectiles.length, 0);
});

test('weapon metadata explains exact damage per charge with multipliers 1, 2 and 3', () => {
  for (const [type, multiplier] of [['pulse', 1], ['twin', 2], ['lance', 3]]) {
    const state = createClassicWeapons({type, unlocked: ['pulse', 'twin', 'lance']});
    const definition = CLASSIC_WEAPON_RULES.types[type];
    const snapshot = classicWeaponSnapshot(state);
    assert.equal(snapshot.damageMultiplier, multiplier);
    assert.equal(snapshot.label, definition.label);
    assert.equal(snapshot.description, definition.description);
    assert.match(snapshot.description, new RegExp(`Daño ×${multiplier}`));
    const shot = triggerClassicWeapon(state, origin);
    const damage = shot.projectiles.reduce((total, projectile) =>
      total + hitClassicProjectile(state, projectile.id, 'centered-target').damage, 0);
    assert.equal(damage, multiplier, `${type} must deliver its advertised damage to one centered target`);
    assert.equal(state.charges, 19, 'every weapon spends exactly one shared charge');
  }
});

test('lance is a faster, narrower shot with its own cooldown and bounded lifetime', () => {
  const state = createClassicWeapons({type: 'lance', unlocked: ['pulse', 'lance'],
    width: 100000, height: 100000});
  const result = triggerClassicWeapon(state, {x: 50000, y: 50000});
  assert.equal(result.projectiles.length, 1);
  const projectile = result.projectiles[0];
  assert.equal(projectile.x, 50000);
  assert.equal(projectile.vy, -1280);
  assert.equal(projectile.radius, 6);
  assert.equal(projectile.life, 1.8);
  assert.equal(projectile.pierce, 2);
  assert.equal(state.cooldown, .48);
  run(state, .47);
  assert.equal(triggerClassicWeapon(state, origin).reason, 'cooldown');
  run(state, .01);
  assert.ok(state.cooldown <= 1e-9, 'the cooldown accepts a new trigger at .48 played seconds');
  const events = run(state, 1.32);
  assert.equal(state.projectiles.length, 0);
  assert.equal(events.filter(event => event.type === 'expired' && event.projectileId === projectile.id).length, 1);
});

test('lance hits two distinct targets once each and never delivers duplicate damage or reward events', () => {
  const state = createClassicWeapons({type: 'lance', unlocked: ['pulse', 'lance']});
  const projectile = triggerClassicWeapon(state, origin).projectiles[0];
  const first = hitClassicProjectile(state, projectile.id, 'armored-drone');
  assert.equal(first.accepted, true);
  assert.equal(first.damage, 3);
  assert.equal(first.events.length, 1);
  assert.equal(state.projectiles.length, 1, 'the lance remains active after its first target');
  assert.equal(projectile.pierce, 1);
  for (let index = 0; index < 12; index++) {
    const repeated = hitClassicProjectile(state, projectile.id, 'armored-drone');
    assert.equal(repeated.accepted, false);
    assert.equal(repeated.reason, 'duplicate');
    assert.equal(repeated.damage, 0);
    assert.equal(repeated.events.length, 0, 'rendering an impact again cannot dispatch another reward');
    assert.equal(projectile.pierce, 1, 'repeat collisions must not spend penetration');
  }
  const second = hitClassicProjectile(state, projectile.id, 'rear-drone');
  assert.equal(second.accepted, true);
  assert.equal(second.damage, 3);
  assert.equal(second.events.length, 1);
  assert.notEqual(first.events[0].id, second.events[0].id);
  assert.equal(state.projectiles.length, 0);
  for (const targetId of ['armored-drone', 'rear-drone', 'third-drone']) {
    const exhausted = hitClassicProjectile(state, projectile.id, targetId);
    assert.equal(exhausted.accepted, false);
    assert.equal(exhausted.damage, 0);
    assert.equal(exhausted.events.length, 0);
  }
});

test('switching through all three types cannot refill, reset recharge or bypass the lance cooldown', () => {
  const state = createClassicWeapons({type: 'lance', unlocked: ['pulse', 'twin', 'lance']});
  triggerClassicWeapon(state, origin);
  run(state, .1);
  const timing = {charges: state.charges, cooldown: state.cooldown, recharge: state.recharge};
  for (const type of ['twin', 'pulse', 'lance']) {
    assert.equal(selectClassicWeapon(state, type).accepted, true);
    assert.deepEqual({charges: state.charges, cooldown: state.cooldown, recharge: state.recharge}, timing);
    assert.equal(triggerClassicWeapon(state, origin).reason, 'cooldown');
  }
  run(state, .38);
  assert.equal(triggerClassicWeapon(state, origin).accepted, true);
  assert.equal(state.charges, 18);
  assert.ok(Math.abs(state.recharge - .48) < 1e-9);
});

test('v1 saved type identifiers remain accepted and the additive lance type round-trips', () => {
  for (const saved of [
    {version: 'classic-weapons-v1', selected: 'pulse', unlocked: ['pulse']},
    {version: 'classic-weapons-v1', selected: 'twin', unlocked: ['pulse', 'twin']},
    {version: 'classic-weapons-v1', selected: 'lance', unlocked: ['pulse', 'twin', 'lance']}
  ]) {
    const restored = JSON.parse(JSON.stringify(saved));
    const state = createClassicWeapons({type: restored.selected, unlocked: restored.unlocked});
    assert.equal(state.version, 'classic-weapons-v4');
    assert.notEqual(state.version, restored.version, 'a new match adopts current ephemeral rules');
    assert.equal(state.selected, restored.selected);
    assert.deepEqual(state.unlocked, restored.unlocked);
    assert.equal(triggerClassicWeapon(state, origin).accepted, true);
  }
});

test('projectiles have bounded lifetime/space, never exceed capacity and expire only once', () => {
  const state = createClassicWeapons();
  const shot = triggerClassicWeapon(state, {x: 360, y: 1}).projectiles[0];
  const events = run(state, 1);
  assert.equal(state.projectiles.length, 0);
  assert.equal(events.filter(event => event.type === 'expired' && event.projectileId === shot.id).length, 1);
  assert.equal(run(state, 1).filter(event => event.type === 'expired').length, 0);
  // The capacity guard is defensive against a caller that externally retains
  // entities. It must refuse without consuming a charge or dispatching a shot.
  state.projectiles = Array.from({length: CLASSIC_WEAPON_RULES.maxProjectiles}, (_, index) =>
    ({...shot, id: `fixture-${index}`}));
  const before = classicWeaponSnapshot(state);
  const refused = triggerClassicWeapon(state, origin);
  assert.equal(refused.reason, 'capacity');
  assert.deepEqual(classicWeaponSnapshot(state), before);
  const lifetime = createClassicWeapons({width: 100000, height: 100000});
  const lived = triggerClassicWeapon(lifetime, {x: 50000, y: 50000}).projectiles[0];
  const expirations = run(lifetime, 3).filter(event => event.type === 'expired');
  assert.equal(expirations.length, 1);
  assert.equal(expirations[0].projectileId, lived.id);
  assert.equal(expirations[0].reason, 'lifetime');
});

test('a twin volley reserves both projectile slots atomically without spending on refusal', () => {
  const state = createClassicWeapons({type: 'twin', unlocked: ['pulse', 'twin']});
  const prototype = triggerClassicWeapon(state, origin).projectiles[0];
  run(state, 2);
  assert.equal(state.charges, 20);
  state.projectiles = Array.from({length: CLASSIC_WEAPON_RULES.maxProjectiles - 1}, (_, index) =>
    ({...prototype, id: `retained-${index}`, hitTargets: []}));
  const before = classicWeaponSnapshot(state);
  const refused = triggerClassicWeapon(state, origin);
  assert.equal(refused.accepted, false);
  assert.equal(refused.reason, 'capacity');
  assert.equal(refused.projectiles.length, 0);
  assert.equal(refused.events.length, 0);
  assert.deepEqual(classicWeaponSnapshot(state), before, 'no partial volley, charge or sequence change');
  state.projectiles.pop();
  const accepted = triggerClassicWeapon(state, origin);
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.projectiles.length, 2);
  assert.equal(state.projectiles.length, CLASSIC_WEAPON_RULES.maxProjectiles);
  assert.equal(state.charges, 19);
  assert.equal(new Set(state.projectiles.map(projectile => projectile.id)).size,
    CLASSIC_WEAPON_RULES.maxProjectiles);
});

test('event IDs are unique, diagnostics cannot mutate combat, and events do not move with projectiles', () => {
  const state = createClassicWeapons({unlocked: ['pulse', 'twin']});
  const first = triggerClassicWeapon(state, origin);
  const emittedY = first.events.find(event => event.type === 'projectile').projectile.y;
  const snapshot = classicWeaponSnapshot(state);
  snapshot.unlocked.push('made-up');
  snapshot.projectiles[0].x = -999;
  snapshot.projectiles[0].hitTargets.push('anything');
  const events = [...first.events, ...run(state, 2)];
  assert.equal(state.unlocked.includes('made-up'), false);
  assert.equal(first.events.find(event => event.type === 'projectile').projectile.y, emittedY);
  assert.equal(new Set(events.map(event => event.id)).size, events.length);
});

test('invalid arguments reject before mutating ammunition, clocks or existing projectiles', () => {
  for (const invalid of [-1, NaN, Infinity, -Infinity, '1']) {
    const state = createClassicWeapons();
    triggerClassicWeapon(state, origin);
    const before = classicWeaponSnapshot(state);
    assert.throws(() => advanceClassicWeapons(state, invalid));
    assert.deepEqual(classicWeaponSnapshot(state), before);
  }
  const state = createClassicWeapons();
  const before = classicWeaponSnapshot(state);
  for (const invalid of [{x: NaN, y: 1}, {x: 1, y: Infinity}, {x: 1, y: 1, angle: NaN}, {}]) {
    assert.throws(() => triggerClassicWeapon(state, invalid));
    assert.deepEqual(classicWeaponSnapshot(state), before);
  }
  assert.throws(() => hitClassicProjectile(state, '', 'target'));
  assert.throws(() => hitClassicProjectile(state, 'projectile', {}));
  assert.throws(() => createClassicWeapons({width: 100}));
  assert.throws(() => createClassicWeapons({unlocked: ['missing']}));
  assert.throws(() => createClassicWeapons({type: 'twin'}));
});

test('long play stays bounded and deterministic with the same player inputs', () => {
  const a = createClassicWeapons({unlocked: ['pulse', 'twin']});
  const b = createClassicWeapons({unlocked: ['pulse', 'twin']});
  for (let frame = 0; frame < 60 * 90; frame++) {
    for (const state of [a, b]) {
      if (frame === 1800) selectClassicWeapon(state, 'twin');
      if (frame % 7 === 0) triggerClassicWeapon(state, origin);
      advanceClassicWeapons(state, 1 / 60);
      assert.ok(state.charges >= 0 && state.charges <= 20);
      assert.ok(state.projectiles.length <= CLASSIC_WEAPON_RULES.maxProjectiles);
      assert.ok(state.recharge >= 0 && state.recharge < 2);
    }
  }
  assert.deepEqual(classicWeaponSnapshot(a), classicWeaponSnapshot(b));
});

test('Atlas unlimited basic fire preserves the previous magazine and recharge while obeying cadence and physics', () => {
  for(const selected of ['pulse','twin','lance']) {
    const state=createClassicWeapons({type:selected,unlocked:[selected]});
    triggerClassicWeapon(state,origin);run(state,.13);
    const battery={charges:state.charges,recharge:state.recharge};
    setClassicUnlimitedFire(state,true);
    assert.equal(triggerClassicWeapon(state,origin).reason,'cooldown');
    for(let frame=0;frame<60*12;frame++) {
      triggerClassicWeapon(state,origin);advanceClassicWeapons(state,1/60);
      assert.equal(state.charges,battery.charges);
      assert.equal(state.recharge,battery.recharge);
      assert.ok(state.projectiles.length<=CLASSIC_WEAPON_RULES.maxProjectiles);
    }
    assert.ok(state.shotSequence>20,'The authored boss encounter is not limited to its entering magazine');
    setClassicUnlimitedFire(state,false);
    assert.equal(state.charges,battery.charges);assert.equal(state.recharge,battery.recharge);
    run(state,CLASSIC_WEAPON_RULES.types[selected].cooldown);
    const before=state.charges;
    assert.equal(triggerClassicWeapon(state,origin).accepted,true);assert.equal(state.charges,before-1);
  }
});

test('Atlas can start with an empty magazine without inventing ammunition for the following flight', () => {
  const state=createClassicWeapons();
  while(state.charges>0){triggerClassicWeapon(state,origin);if(state.charges>0)run(state,.24);}
  const battery={charges:state.charges,recharge:state.recharge};
  setClassicUnlimitedFire(state,true);run(state,.24);
  assert.equal(triggerClassicWeapon(state,origin).accepted,true);
  const frozen=classicWeaponSnapshot(state);assert.deepEqual(advanceClassicWeapons(state,0),[]);
  assert.deepEqual(classicWeaponSnapshot(state),frozen);
  setClassicUnlimitedFire(state,false);
  assert.deepEqual({charges:state.charges,recharge:state.recharge},battery);
  assert.equal(triggerClassicWeapon(state,origin).reason,'empty');
  for(const invalid of [1,0,null,'true',undefined]) {
    const before=classicWeaponSnapshot(state);assert.throws(()=>setClassicUnlimitedFire(state,invalid));
    assert.deepEqual(classicWeaponSnapshot(state),before);
  }
});

test('special missiles share physical movement but do not spend or recharge the basic magazine', () => {
  const state=createClassicWeapons();triggerClassicWeapon(state,origin);
  const battery={charges:state.charges,cooldown:state.cooldown,recharge:state.recharge};
  assert.equal(canTriggerClassicMissile(state),true);
  const fired=triggerClassicMissile(state,{...origin,shotId:'missile:7'});
  assert.equal(fired.accepted,true);assert.equal(fired.projectiles.length,1);
  const shot=fired.projectiles[0];
  assert.equal(shot.weapon,'missile');assert.equal(shot.missile,true);assert.equal(shot.damage,18);
  assert.equal(shot.vy,-760);assert.ok(Math.abs(shot.vx)<1e-9);assert.equal(shot.pierce,1);
  assert.deepEqual({charges:state.charges,cooldown:state.cooldown,recharge:state.recharge},battery);
  assert.equal(canTriggerClassicMissile(state),false);
  const before=classicWeaponSnapshot(state);assert.deepEqual(advanceClassicWeapons(state,0),[]);
  assert.deepEqual(classicWeaponSnapshot(state),before);
  advanceClassicWeapons(state,10);
  assert.equal(state.elapsed,.05);assert.ok(Math.abs(shot.y-(origin.y-760*.05))<1e-8);
  assert.equal(state.missileSequence,7);assert.equal(state.charges,19);
  assert.equal(fired.events.filter(event=>event.type==='missileFired').length,1);
  assert.equal(fired.events.filter(event=>event.type==='projectile').length,1);
  assert.equal(fired.events.find(event=>event.type==='projectile').projectile.y,origin.y,
    'A dispatched event remains a snapshot while its projectile moves');
});

test('a missile receipt emits once and capacity or cooldown refusal cannot reserve or duplicate its identity', () => {
  const state=createClassicWeapons();
  assert.equal(triggerClassicMissile(state,{...origin,shotId:'missile:1'}).accepted,true);
  let before=classicWeaponSnapshot(state);
  assert.equal(triggerClassicMissile(state,{...origin,shotId:'missile:1'}).reason,'duplicate');
  assert.deepEqual(classicWeaponSnapshot(state),before);
  assert.equal(triggerClassicMissile(state,{...origin,shotId:'missile:2'}).reason,'cooldown');
  assert.deepEqual(classicWeaponSnapshot(state),before);
  run(state,.7);assert.equal(canTriggerClassicMissile(state),true);
  const template=state.projectiles[0];
  state.projectiles=Array.from({length:32},(_,index)=>({...template,id:'fixture-'+index,hitTargets:[]}));
  before=classicWeaponSnapshot(state);assert.equal(canTriggerClassicMissile(state),false);
  assert.equal(triggerClassicMissile(state,{...origin,shotId:'missile:2'}).reason,'capacity');
  assert.deepEqual(classicWeaponSnapshot(state),before);
  state.projectiles.pop();
  assert.equal(triggerClassicMissile(state,{...origin,shotId:'missile:2'}).accepted,true);
  assert.equal(state.projectiles.length,32);assert.equal(state.missileSequence,2);
  assert.equal(state.charges,20,'Special ammunition does not debit the basic magazine');
});

test('a physical missile hits exactly one target once and never creates repeated damage or rewards', () => {
  const state=createClassicWeapons();const shot=triggerClassicMissile(state,{...origin,shotId:'missile:1'}).projectiles[0];
  assert.equal(state.projectiles.length,1);
  const hit=hitClassicProjectile(state,shot.id,'atlas-core');
  assert.equal(hit.accepted,true);assert.equal(hit.damage,18);assert.equal(hit.events.length,1);
  assert.equal(state.projectiles.length,0);
  for(const target of ['atlas-core','next-enemy','atlas-core']) {
    const again=hitClassicProjectile(state,shot.id,target);
    assert.equal(again.accepted,false);assert.equal(again.damage,0);assert.equal(again.events.length,0);
  }
  for(const shotId of ['',null,'shot:1','missile:0','missile:-1','missile:1.5','missile:9007199254740992']) {
    const before=classicWeaponSnapshot(state);assert.throws(()=>triggerClassicMissile(state,{...origin,shotId}));
    assert.deepEqual(classicWeaponSnapshot(state),before);
  }
  const lifetime=createClassicWeapons({width:100000,height:100000});
  const long=triggerClassicMissile(lifetime,{x:50000,y:50000,shotId:'missile:1'}).projectiles[0];
  const expired=run(lifetime,4).filter(event=>event.type==='expired');
  assert.equal(lifetime.projectiles.length,0);assert.equal(expired.length,1);
  assert.equal(expired[0].projectileId,long.id);assert.equal(lifetime.charges,20);
});

test('the model has no independent clock, random source, renderer or persistence', async () => {
  const source = await readFile(new URL('../src/game/combat/classic-weapons.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /requestAnimationFrame|setInterval|setTimeout|Math\.random|Date\.now|localStorage|document\.|window\./);
});

// Armas por niveles (dec-armas-plan, 01/11/2026): Pulso y Gemelo, niveles 1 a 4.
test('Pulse and Twin fire their bought level: damage per volley x1, x1.3, x1.6 and x2', () => {
  for (const [type, base] of [['pulse', 1], ['twin', 2]]) {
    for (const [value, factor, barrels] of [[1, 1, type === 'pulse' ? 1 : 2], [2, 1.3, type === 'pulse' ? 1 : 2], [3, 1.6, type === 'pulse' ? 3 : 4], [4, 2, type === 'pulse' ? 3 : 4]]) {
      const state = createClassicWeapons({type, unlocked: ['pulse', 'twin']});
      setClassicWeaponLevels(state, {[type]: value});
      const shot = triggerClassicWeapon(state, origin);
      assert.equal(shot.projectiles.length, barrels, `${type} ${value}`);
      assert.ok(shot.projectiles.every(projectile => projectile.level === value));
      // Pulso 3 y 4 (propietario, 03/11/2026, dec-pulso-niveles-dano): el pulso
      // central hace el daño entero aunque los laterales fallen a distancia.
      const damage = type === 'pulse' ? shot.projectiles.find(projectile => projectile.barrel === (barrels === 3 ? 1 : 0)).damage
        : shot.projectiles.reduce((total, projectile) => total + projectile.damage, 0);
      assert.ok(Math.abs(damage - base * factor) < 1e-9, `${type} level ${value}: ${damage}`);
      assert.equal(classicWeaponSnapshot(state).damageMultiplier, base * factor);
      assert.equal(state.charges, 19, 'one charge per volley at every level');
    }
  }
  assert.throws(() => setClassicWeaponLevels(createClassicWeapons(), {pulse: 5}), RangeError);
  assert.throws(() => setClassicWeaponLevels(createClassicWeapons(), {scatter: 2}), TypeError);
});

// Árbol ampliado de la Forja (dec-arbol-ampliado, 02/11/2026): munición 20 → 100.
test('a bigger magazine from the Forja adds the new rounds once, recovers up to the new top and rejects bad sizes', () => {
  const state = createClassicWeapons();
  assert.equal(state.maxCharges, 20);
  state.charges = 5;
  assert.equal(setClassicMaxCharges(state, 40), 40);
  assert.equal(state.charges, 25, 'the 20 new rounds arrive loaded');
  assert.equal(setClassicMaxCharges(state, 40), 40);
  assert.equal(state.charges, 25, 'repeating the same size changes nothing');
  run(state, 2 * 20);
  assert.equal(state.charges, 40, 'recovery fills up to the new top');
  assert.equal(classicWeaponSnapshot(state).rechargeProgress, 0);
  for (const bad of [19, 111, 30.5, Number.NaN]) assert.throws(() => setClassicMaxCharges(state, bad));
  assert.equal(state.maxCharges, 40);
  assert.equal(state.charges, 40);
});

// Nodos clave (dec-nodos-clave, 02/11/2026).
test('wide magazine: the Forja may raise the magazine to 110 rounds', () => {
  const state = createClassicWeapons();
  assert.equal(setClassicMaxCharges(state, 110), 110);
  assert.equal(state.charges, 110);
});

test('hot reload: after running dry the magazine recovers twice as fast until it is full again', () => {
  const plain = createClassicWeapons(), hot = createClassicWeapons();
  assert.equal(setClassicHotReload(hot, true), true);
  for (const state of [plain, hot]) state.charges = 0;
  // Sin munición vacía no hay prisa: solo cuenta tras quedarse a cero.
  run(plain, 10); run(hot, 10);
  assert.equal(plain.charges, 5);
  assert.equal(hot.charges, 10, 'double speed while recovering from empty');
  run(hot, 20);
  assert.equal(hot.charges, 20);
  const partial = createClassicWeapons(); setClassicHotReload(partial, true);
  partial.charges = 10; run(partial, 10);
  assert.equal(partial.charges, 15, 'a half magazine recovers at the normal speed');
  assert.throws(() => setClassicHotReload(hot, 'yes'));
});

test('Pulse 3 and 4: the centre pulse alone beats level 2 at range', () => {
  for (const value of [3, 4]) {
    const state = createClassicWeapons();
    setClassicWeaponLevels(state, {pulse: value});
    const [, centre] = triggerClassicWeapon(state, origin).projectiles;
    assert.ok(centre.damage > 1.3, `level ${value} centre ${centre.damage} beats level 2`);
  }
});

// Revisión del PR #57 (P57-04, propietario 09/11): en Pulso 3 y 4 los pulsos
// laterales solo se ven; el daño es exactamente el que dice el hangar.
test('Pulse 3 and 4 side pulses are only visual: they pass through targets without damage', () => {
  for (const value of [3, 4]) {
    const state = createClassicWeapons({type: 'pulse', unlocked: ['pulse']});
    setClassicWeaponLevels(state, {pulse: value});
    const shot = triggerClassicWeapon(state, origin);
    const sides = shot.projectiles.filter(projectile => projectile.barrel !== 1);
    assert.equal(sides.length, 2);
    for (const side of sides) {
      assert.equal(side.damage, 0, `level ${value}`);
      assert.equal(hitClassicProjectile(state, side.id, 'boss').accepted, false, 'a side pulse never hits');
      assert.ok(state.projectiles.some(projectile => projectile.id === side.id), 'it keeps flying');
    }
    const total = shot.projectiles.reduce((sum, projectile) => sum + projectile.damage, 0);
    assert.equal(total, value === 3 ? 1.6 : 2, 'a volley that lands whole does what the hangar says');
  }
});
