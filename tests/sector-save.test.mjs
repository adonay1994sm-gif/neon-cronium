import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTOR_SAVE_KEY, createSectorSave, normalizeSectorSave, startSectorRun, enterStage, buyBeacon,
  useRevive, dieInSector, continuePoint, completeSector} from '../src/game/progression/sector-save.js';

const running = () => startSectorRun(createSectorSave(), 1);

test('the save has its own key and starts empty', () => {
  assert.equal(SECTOR_SAVE_KEY, 'neonCronium.sectors.v1');
  assert.deepEqual(createSectorSave(), {version: 1, unlocked: 1, sectors: {}, run: null});
});

test('revive gives 25 hull once per attempt', () => {
  let save = enterStage(running(), 7, 60);
  const first = useRevive(save);
  assert.equal(first.hull, 25);
  assert.equal(useRevive(first.save), null);
  save = dieInSector(first.save);
  assert.equal(useRevive(save).hull, 25);
});

test('death restarts at stage 1, or 6 with the beacon', () => {
  assert.equal(dieInSector(enterStage(running(), 8, 40)).run.stageNumber, 1);
  const withBeacon = buyBeacon(enterStage(running(), 6, 70), 1);
  const after = dieInSector(enterStage(withBeacon, 8, 40));
  assert.deepEqual({stage: after.run.stageNumber, hull: after.run.stageHull}, {stage: 6, hull: 100});
});

test('the beacon lasts every attempt until the sector is completed', () => {
  let save = buyBeacon(running(), 1);
  save = dieInSector(dieInSector(save));
  assert.equal(save.run.stageNumber, 6);
  save = completeSector(save, 1, 2);
  assert.equal(save.sectors[1].beacon, false);
});

test('continue resumes at the start of the current stage with its entry hull', () => {
  assert.deepEqual(continuePoint(enterStage(running(), 4, 63)), {sector: 1, stageNumber: 4, hull: 63});
  assert.equal(continuePoint(createSectorSave()), null);
});

test('completing keeps the best stars and unlocks the next sector', () => {
  let save = completeSector(running(), 1, 3);
  save = completeSector(startSectorRun(save, 1), 1, 1);
  assert.deepEqual({stars: save.sectors[1].stars, done: save.sectors[1].completed, unlocked: save.unlocked, run: save.run},
    {stars: 3, done: true, unlocked: 2, run: null});
});

test('functions never change the save they receive', () => {
  const save = running(), copy = structuredClone(save);
  enterStage(save, 3, 50); buyBeacon(save, 1); dieInSector(save); useRevive(save); completeSector(save, 1, 2);
  assert.deepEqual(save, copy);
});

test('corrupt saves read as no save', () => {
  const good = enterStage(running(), 3, 50);
  assert.deepEqual(normalizeSectorSave(structuredClone(good)), good);
  for (const bad of ['{', null, {version: 9}, {...good, unlocked: 0}, {...good, sectors: {1: {completed: true, stars: 7, beacon: false}}},
    {...good, run: {...good.run, stageNumber: 11}}, {...good, run: {...good.run, stageHull: 140}}]) {
    assert.equal(normalizeSectorSave(bad), null, JSON.stringify(bad));
  }
});

test('bad values are refused instead of writing a save that would be lost', () => {
  const save = running();
  assert.throws(() => enterStage(save, 11, 50), RangeError);
  assert.throws(() => enterStage(save, 3, Number.NaN), RangeError);
  assert.throws(() => buyBeacon(save, 11), RangeError);
  assert.throws(() => completeSector(save, 1, Number.NaN), RangeError);
  assert.throws(() => completeSector(save, 0, 2), RangeError);
});

test('every valid write survives JSON and normalize', () => {
  let save = buyBeacon(enterStage(running(), 6, 47.5), 1);
  for (const step of [s => s, s => useRevive(s).save, dieInSector, s => completeSector(s, 1, 2)]) {
    save = step(save);
    assert.deepEqual(normalizeSectorSave(JSON.parse(JSON.stringify(save))), save);
  }
});

// Reintento en el subguardián (propietario, 09/11/2026): morir en su tramo te
// devuelve a él una vez por intento; la segunda vez, al tramo 1.
test('dying at the sub-boss stage returns to it once per attempt', () => {
  const atSubBoss = enterStage(running(), 5, 40);
  const retry = dieInSector(atSubBoss, {subBossStage: 5});
  assert.deepEqual(retry.run, {sector: 1, stageNumber: 5, stageHull: 100, reviveUsed: false, subRetryUsed: true});
  const second = dieInSector(retry, {subBossStage: 5});
  assert.deepEqual(second.run, {sector: 1, stageNumber: 1, stageHull: 100, reviveUsed: false}, 'the second death restarts the sector');
  assert.equal(dieInSector(enterStage(second, 5, 80), {subBossStage: 5}).run.stageNumber, 5, 'a new attempt has its retry again');
  assert.equal(dieInSector(enterStage(running(), 4, 40), {subBossStage: 5}).run.stageNumber, 1, 'other stages still restart the sector');
  assert.equal(dieInSector(atSubBoss).run.stageNumber, 1, 'without a sub-boss stage nothing changes');
});

test('the sub-boss retry keeps the spent revive and survives a reload', () => {
  const revived = useRevive(enterStage(running(), 5, 40)).save;
  const retry = dieInSector(revived, {subBossStage: 5});
  assert.equal(retry.run.reviveUsed, true, 'the ad revive is not given back inside the same attempt');
  assert.deepEqual(normalizeSectorSave(JSON.parse(JSON.stringify(retry))), retry);
  assert.equal(normalizeSectorSave({...retry, run: {...retry.run, subRetryUsed: 'yes'}}), null);
  assert.equal('subRetryUsed' in normalizeSectorSave(JSON.parse(JSON.stringify(atStage5()))).run, false);
});
const atStage5 = () => enterStage(running(), 5, 40);
