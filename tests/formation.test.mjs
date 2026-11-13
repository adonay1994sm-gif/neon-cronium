import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormation, updateFormation} from '../src/game/combat/formation.js';

// Formaciones del sector 1 (propietario, 12/11/2026): línea, cuña y pinza.
const AREA = {minX: 130, maxX: 590, topY: 370};
const members = xs => xs.map((x, k) => ({id: `e${k}`, x}));
const place = (kind, xs, playerX = 360) => {
  const formation = createFormation(kind);
  const slots = updateFormation(formation, members(xs), 0, {...AREA, playerX});
  return {formation, slots, list: xs.map((_, k) => slots.get(`e${k}`))};
};
const gaps = list => [...list].sort((a, b) => a.x - b.x).slice(1).map((slot, k, all) =>
  slot.x - (k ? all[k - 1].x : [...list].sort((a, b) => a.x - b.x)[0].x));

test('unknown formations are rejected', () => {
  assert.throws(() => createFormation('circle'), RangeError);
});

test('line: everyone at the same depth, evenly spread and never stacked', () => {
  const {list} = place('line', [360, 360, 360]);
  assert.deepEqual(list.map(slot => slot.y), [370, 370, 370]);
  assert.ok(gaps(list).every(gap => gap >= 100), `gaps ${gaps(list)}`);
});

test('every slot stays inside the combat area, even with a full patrol', () => {
  for (const kind of ['line', 'wedge', 'pincer']) for (const playerX of [0, 360, 720]) {
    const {list} = place(kind, [200, 300, 400, 500, 550], playerX);
    for (const slot of list) assert.ok(slot.x >= 130 && slot.x <= 590, `${kind} x=${slot.x}`);
  }
});

test('members keep their left-to-right order, so nobody crosses to reach a slot', () => {
  const {list} = place('line', [500, 200, 350]);
  assert.ok(list[1].x < list[2].x && list[2].x < list[0].x);
});

test('wedge: the oldest member takes the tip, the wings fall back in a V', () => {
  const {list} = place('wedge', [150, 250, 360, 470, 570]);
  const tip = list[0];
  assert.ok(list.slice(1).every(slot => slot.y < tip.y), 'the tip is the most advanced');
  const xs = list.map(slot => slot.x).sort((a, b) => a - b);
  assert.equal(tip.x, xs[2], 'the tip is in the middle');
  const byX = [...list].sort((a, b) => a.x - b.x);
  assert.deepEqual([byX[0].y, byX[1].y, byX[3].y, byX[4].y], [370, 455, 455, 370]);
});

test('pincer: two groups on the flanks and the centre free', () => {
  const {list} = place('pincer', [150, 250, 300, 420, 500, 570]);
  assert.equal(list.filter(slot => slot.x < 250).length, 3);
  assert.equal(list.filter(slot => slot.x > 470).length, 3);
  assert.ok(list.every(slot => Math.abs(slot.x - 360) >= 140), 'nobody in the centre');
  const left = list.filter(slot => slot.x < 250).map(slot => slot.y).sort((a, b) => a - b);
  assert.ok(left[1] - left[0] >= 80 && left[2] - left[1] >= 80, 'each flank is staggered in depth');
});

test('when one falls the others close the gap', () => {
  const {formation} = place('line', [200, 360, 520]);
  const two = updateFormation(formation, members([200, 360, 520]).filter(m => m.id !== 'e1'), 0, {...AREA, playerX: 360});
  assert.equal(two.size, 2);
  assert.ok(Math.abs((two.get('e0').x + two.get('e2').x) / 2 - 360) < 1, 'the two left are centred again');
  assert.ok(two.get('e2').x - two.get('e0').x <= 160);
});

test('the formation follows the player slowly, never jumping', () => {
  const {formation, slots} = place('line', [300, 420], 360);
  const before = slots.get('e0').x;
  const after = updateFormation(formation, members([300, 420]), 1, {...AREA, playerX: 560}).get('e0').x;
  assert.ok(after > before && after - before <= 60, `moved ${after - before}`);
});

test('slots do not reshuffle while the same members are alive', () => {
  const {formation, slots} = place('line', [200, 360, 520]);
  // Dos se cruzan un instante al maniobrar: cada uno conserva su puesto.
  const again = updateFormation(formation, [{id: 'e0', x: 380}, {id: 'e1', x: 360}, {id: 'e2', x: 520}], 0, {...AREA, playerX: 360});
  assert.equal(again.get('e0').x, slots.get('e0').x);
  assert.equal(again.get('e1').x, slots.get('e1').x);
});

test('an empty formation is fine', () => {
  assert.equal(updateFormation(createFormation('wedge'), [], .016, {...AREA, playerX: 360}).size, 0);
});
