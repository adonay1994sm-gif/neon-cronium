import test from 'node:test';
import assert from 'node:assert/strict';
import {MENU_UNLOCKS_KEY, normalizeMenuUnlocks, menuView, markMenuSeen} from '../src/game/progression/menu-unlocks.js';
import {createSectorSave, startSectorRun, enterStage, dieInSector, completeSector, buyBeacon} from '../src/game/progression/sector-save.js';

const fresh = () => normalizeMenuUnlocks(null);
const atStage = stage => enterStage(startSectorRun(createSectorSave(), 1), stage, 100);

test('the menu memory has its own key and tolerates broken data', () => {
  assert.equal(MENU_UNLOCKS_KEY, 'neonCronium.menu.v1');
  assert.deepEqual(fresh(), {version: 1, hangar: false, seen: {hangar: false, intro: false}});
  assert.deepEqual(normalizeMenuUnlocks({version: 1, hangar: 'yes', seen: []}), fresh());
  assert.deepEqual(normalizeMenuUnlocks({version: 1, hangar: true, seen: {hangar: true}}), {version: 1, hangar: true, seen: {hangar: true, intro: false}});
  assert.deepEqual(normalizeMenuUnlocks({version: 1, hangar: false, seen: {hangar: false, intro: true}}), {version: 1, hangar: false, seen: {hangar: false, intro: true}});
});

test('a new player only sees JUGAR', () => {
  const view = menuView(createSectorSave(), fresh());
  assert.equal(view.play.label, 'JUGAR');
  assert.equal(view.play.detail, 'SECTOR 1 · CHRONOS → GAIA');
  assert.equal(view.hangar.visible, false);
  assert.equal(view.unlocks.hangar, false);
});

test('JUGAR becomes CONTINUAR VIAJE once the first stage is behind', () => {
  assert.equal(menuView(atStage(1), fresh()).play.label, 'JUGAR');
  const view = menuView(atStage(2), fresh());
  assert.equal(view.play.label, 'CONTINUAR VIAJE');
  assert.equal(view.play.detail, 'SECTOR 1 · TRAMO 2/10');
  assert.equal(menuView(buyBeacon(atStage(7), 1), fresh()).play.detail, 'SECTOR 1 · TRAMO 7/10 · CON BALIZA');
});

test('the hangar opens at stage 6 and stays open after dying', () => {
  assert.equal(menuView(atStage(5), fresh()).hangar.visible, false);
  const reached = menuView(atStage(6), fresh());
  assert.equal(reached.hangar.visible, true);
  assert.equal(reached.hangar.isNew, true);
  assert.equal(reached.unlocks.hangar, true);
  const afterDeath = menuView(dieInSector(atStage(8)), reached.unlocks);
  assert.equal(afterDeath.play.label, 'JUGAR');
  assert.equal(afterDeath.hangar.visible, true);
});

test('NUEVO shows until the hangar is opened once', () => {
  const unlocked = menuView(atStage(6), fresh()).unlocks;
  const seen = markMenuSeen(unlocked, 'hangar');
  assert.equal(unlocked.seen.hangar, false, 'markMenuSeen never mutates its input');
  assert.equal(menuView(atStage(6), seen).hangar.isNew, false);
});

test('beating the sector keeps the hangar and offers to repeat it', () => {
  const done = completeSector(atStage(10), 1, 2);
  const view = menuView(done, fresh());
  assert.equal(view.play.label, 'REPETIR SECTOR');
  assert.equal(view.play.detail, 'SECTOR 1 COMPLETADO');
  assert.equal(view.hangar.visible, true);
});

test('the Chronos opening is remembered once seen, without touching the hangar', () => {
  const seen = markMenuSeen(fresh(), 'intro');
  assert.equal(seen.seen.intro, true);
  assert.equal(seen.seen.hangar, false);
  assert.equal(menuView(atStage(1), seen).unlocks.seen.intro, true, 'the menu keeps the mark');
});
