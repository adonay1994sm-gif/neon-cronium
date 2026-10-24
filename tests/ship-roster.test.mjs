import test from 'node:test';
import assert from 'node:assert/strict';
import {SHIP_ROSTER, SHIP_ROSTER_KEY, ownedShips, normalizeShipChoice, chooseShip} from '../src/game/ship/ship-roster.js';
import {createSectorSave, startSectorRun, completeSector} from '../src/game/progression/sector-save.js';

const fresh = createSectorSave();
const beat = (save, sector) => completeSector(startSectorRun({...save, unlocked: Math.max(save.unlocked, sector)}, sector), sector, 1);

test('ten ships in order, each with its exclusive and ultimate', () => {
  assert.equal(SHIP_ROSTER_KEY, 'neonCronium.ships.v1');
  assert.deepEqual(SHIP_ROSTER.map(ship => ship.number), ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);
  assert.deepEqual(SHIP_ROSTER.map(ship => ship.id), ['aster', 'bastion', 'vertice', 'mantarraya', 'arpon', 'orion', 'quimera', 'nomada', 'eclipse', 'titan']);
  for (const ship of SHIP_ROSTER) {
    assert.ok(ship.name && ship.role && ship.exclusive.name && ship.exclusive.cooldown > 0 && ship.exclusive.text, ship.id);
    assert.ok(ship.ultimate.name && ship.ultimate.text, ship.id);
  }
  assert.ok(Object.isFrozen(SHIP_ROSTER) && SHIP_ROSTER.every(Object.isFrozen));
});

test('a new player owns only Astér and flies it', () => {
  assert.deepEqual(ownedShips(fresh), ['aster']);
  assert.deepEqual(normalizeShipChoice(null, fresh), {version: 1, selected: 'aster'});
});

test('each completed sector brings the next ship', () => {
  const afterOne = beat(fresh, 1);
  assert.deepEqual(ownedShips(afterOne), ['aster', 'bastion']);
  assert.deepEqual(ownedShips(beat(afterOne, 2)), ['aster', 'bastion', 'vertice']);
});

test('a ship you do not own cannot be chosen, and a broken choice falls back to Astér', () => {
  assert.equal(chooseShip({version: 1, selected: 'aster'}, 'titan', fresh), null);
  assert.deepEqual(chooseShip({version: 1, selected: 'aster'}, 'bastion', beat(fresh, 1)), {version: 1, selected: 'bastion'});
  assert.deepEqual(normalizeShipChoice({version: 1, selected: 'titan'}, fresh), {version: 1, selected: 'aster'});
  assert.deepEqual(normalizeShipChoice({version: 2, selected: 'bastion'}, beat(fresh, 1)), {version: 1, selected: 'aster'});
});
