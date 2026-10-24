import test from 'node:test';
import assert from 'node:assert/strict';
import {SHIP_ROSTER, SHIP_ROSTER_KEY, ownedShips, normalizeShipSave, chooseShip, buyShipWithScrap} from '../src/game/ship/ship-roster.js';
import {createSectorSave, startSectorRun, completeSector} from '../src/game/progression/sector-save.js';

const fresh = createSectorSave();
const afterAtlas = completeSector(startSectorRun(fresh, 1), 1, 1);
const save = (selected = 'aster', bought = []) => ({version: 1, selected, bought});

test('ten ships in order, each with its exclusive, ultimate and way to get it', () => {
  assert.equal(SHIP_ROSTER_KEY, 'neonCronium.ships.v1');
  assert.deepEqual(SHIP_ROSTER.map(ship => ship.number), ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);
  assert.deepEqual(SHIP_ROSTER.map(ship => ship.id), ['aster', 'bastion', 'vertice', 'mantarraya', 'arpon', 'orion', 'quimera', 'nomada', 'eclipse', 'titan']);
  for (const ship of SHIP_ROSTER) {
    assert.ok(ship.name && ship.role && ship.exclusive.name && ship.exclusive.cooldown > 0 && ship.exclusive.text, ship.id);
    assert.ok(ship.ultimate.name && ship.ultimate.text, ship.id);
  }
  assert.deepEqual(SHIP_ROSTER.map(ship => ship.access.type),
    ['free', 'free', 'scrap', 'scrap', 'scrap', 'paid', 'paid', 'paid', 'paid', 'paid']);
  const prices = SHIP_ROSTER.filter(ship => ship.access.type === 'scrap').map(ship => ship.access.price);
  assert.ok(prices.every((price, i) => price > (prices[i - 1] ?? 0)), 'each scrap ship costs more than the last');
  assert.ok(Object.isFrozen(SHIP_ROSTER) && SHIP_ROSTER.every(ship => Object.isFrozen(ship) && Object.isFrozen(ship.access)));
});

test('a new player owns only Astér; beating Atlas gives Bastión', () => {
  assert.deepEqual(ownedShips(fresh, normalizeShipSave(null, fresh)), ['aster']);
  assert.deepEqual(normalizeShipSave(null, fresh), save());
  assert.deepEqual(ownedShips(afterAtlas, save()), ['aster', 'bastion']);
});

test('scrap ships are bought with enough scrap, once, and never the paid ones', () => {
  assert.equal(buyShipWithScrap(save(), 'vertice', 9999), null);
  const bought = buyShipWithScrap(save(), 'vertice', 10000);
  assert.deepEqual(bought, {save: save('aster', ['vertice']), price: 10000});
  assert.deepEqual(ownedShips(fresh, bought.save), ['aster', 'vertice']);
  assert.equal(buyShipWithScrap(bought.save, 'vertice', 1e9), null, 'already owned');
  assert.equal(buyShipWithScrap(save(), 'titan', 1e9), null, 'paid ship');
  assert.equal(buyShipWithScrap(save(), 'bastion', 1e9), null, 'free ship');
});

test('a ship you do not own cannot be chosen, and a broken save falls back to Astér', () => {
  assert.equal(chooseShip(save(), 'titan', fresh), null);
  assert.deepEqual(chooseShip(save(), 'bastion', afterAtlas), save('bastion'));
  assert.deepEqual(chooseShip(save('aster', ['arpon']), 'arpon', fresh), save('arpon', ['arpon']));
  assert.deepEqual(normalizeShipSave(save('titan'), fresh), save());
  assert.deepEqual(normalizeShipSave(save('bastion'), fresh), save(), 'Bastión before beating Atlas');
  assert.deepEqual(normalizeShipSave({version: 2, selected: 'bastion', bought: []}, afterAtlas), save());
  assert.deepEqual(normalizeShipSave({version: 1, selected: 'vertice', bought: ['vertice', 'vertice', 'titan', 7]}, fresh), save('vertice', ['vertice']));
});
