import test from 'node:test';
import assert from 'node:assert/strict';
import {C9_DOCKING_RULES, createC9Docking, advanceC9Docking, releaseC9Docking, c9Gate, c9DockingFrame,
  c9CeasefireActive} from '../src/game/presentation/c9-docking.js';

// Llegada de C9 en el tramo 6 (propietario, 02/11/2026).
const DT = 1 / 60, W = 720, H = 1280;
function run(scene, seconds, ship, events = []) {
  for (let frame = 0; frame < Math.round(seconds / DT); frame++) advanceC9Docking(scene, DT, ship(scene), event => events.push(event.type));
  return events;
}
const far = () => ({x: 100, y: H * .85});
const atGate = scene => c9Gate(scene);

test('C9 flies in, opens its hatch and waits; flying into the hatch docks the ship', () => {
  const scene = createC9Docking({width: W, height: H});
  assert.equal(c9DockingFrame(scene), 0);
  const events = run(scene, C9_DOCKING_RULES.arriveSeconds + C9_DOCKING_RULES.openSeconds + .05, far);
  assert.deepEqual(events, ['open', 'await']);
  assert.ok(Math.abs(scene.y - H * C9_DOCKING_RULES.holdY) < 1, 'it stops in the upper part');
  assert.equal(c9DockingFrame(scene), 3, 'hatch open with its lights');
  run(scene, 1, far);
  assert.equal(scene.phase, 'await', 'it waits for the ship');
  assert.deepEqual(run(scene, C9_DOCKING_RULES.dwellSeconds + C9_DOCKING_RULES.tractorSeconds + .1, atGate), ['tractor', 'docked']);
  assert.equal(c9DockingFrame(scene), 2);
});

test('if the pilot does not come, the tractor beam catches the ship anyway', () => {
  const scene = createC9Docking({width: W, height: H});
  const events = run(scene, C9_DOCKING_RULES.arriveSeconds + C9_DOCKING_RULES.openSeconds + C9_DOCKING_RULES.autoCatchSeconds + C9_DOCKING_RULES.tractorSeconds + .2, far);
  assert.deepEqual(events, ['open', 'await', 'tractor', 'docked']);
});

test('after the Forja, C9 releases the ship and leaves; the ceasefire lasts until it is gone', () => {
  const scene = createC9Docking({width: W, height: H});
  run(scene, 12, atGate);
  assert.equal(scene.phase, 'docked');
  run(scene, 5, atGate);
  assert.equal(scene.phase, 'docked', 'it stays docked while the Forja is open');
  assert.equal(c9CeasefireActive(scene), true);
  assert.equal(releaseC9Docking(scene), true);
  const events = run(scene, C9_DOCKING_RULES.releaseSeconds + C9_DOCKING_RULES.leaveSeconds + .1, far);
  assert.deepEqual(events, ['leave', 'done']);
  assert.ok(scene.y < -C9_DOCKING_RULES.size / 2, 'it flies off the top');
  assert.equal(c9CeasefireActive(scene), false);
  assert.equal(releaseC9Docking(scene), false);
});

test('dt 0 (pause) changes nothing', () => {
  const scene = createC9Docking({width: W, height: H});
  run(scene, 1, far);
  const before = JSON.stringify(scene);
  advanceC9Docking(scene, 0, far(scene), () => assert.fail('no events while paused'));
  assert.equal(JSON.stringify(scene), before);
});
