import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createClassicEquipment, normalizeClassicEquipment, prepareClassicTwin,
  awardClassicBossWeapon, canEquipClassicWeapon, syncClassicWorkshopWeapons} from '../src/game/progression/classic-arsenal.js';

import {createScrapRecord, createScrapLedger} from '../src/game/progression/scrap-economy.js';

const oldTwin = {version: 1, recoveredTwin: true, unlocked: ['pulse', 'twin'], selected: 'twin'};
const oldLance = {...oldTwin, unlocked: ['pulse', 'twin', 'lance'], selected: 'lance', lanceCalibrated: true};

test('fresh equipment has only the central pulse and no inferred boss victory', () => {
  const equipment = createClassicEquipment();
  assert.deepEqual(equipment, {version: 1, recoveredTwin: false, unlocked: ['pulse'],
    selected: 'pulse', twinPrepared: false, bossRewards: []});
  assert.equal(canEquipClassicWeapon(equipment, 'pulse'), true);
  assert.equal(canEquipClassicWeapon(equipment, 'twin'), false);
  assert.equal(canEquipClassicWeapon(equipment, 'lance'), false);
  assert.deepEqual(normalizeClassicEquipment(equipment), equipment);
  const second = createClassicEquipment();
  equipment.unlocked.push('twin'); equipment.bossRewards.push('guardian-atlas');
  assert.deepEqual(second.unlocked, ['pulse']);
  assert.deepEqual(second.bossRewards, []);
});

// dec-armas-plan (01/11/2026): Lanza, Abanico y Aguja salen; un guardado
// antiguo las pierde y vuelve a Pulso (Gemelo se queda).
const withoutLance = equipment => equipment === oldLance ? {...oldLance, unlocked: oldLance.unlocked.filter(id => id !== 'lance'), selected: oldLance.selected === 'lance' ? 'pulse' : oldLance.selected} : equipment;
test('valid historical Twin saves keep their weapon; an old Lance falls back to Pulse', () => {
  for (const equipment of [oldTwin, oldLance]) {
    const normalized = normalizeClassicEquipment(equipment);
    assert.deepEqual(normalized, withoutLance(equipment));
    assert.notEqual(normalized, equipment);
    assert.notEqual(normalized.unlocked, equipment.unlocked);
    assert.equal(canEquipClassicWeapon(normalized, normalized.selected), true);
    assert.equal(canEquipClassicWeapon(normalized, 'lance'), false);
    assert.equal('bossRewards' in normalized, false, 'old equipment is not proof of an Atlas victory');
  }
});

test('normalization keeps known optional flags, deduplicates arrays and does not alias saved data', () => {
  const saved = {...oldTwin, unlocked: ['pulse', 'twin', 'twin'], lanceCalibrated: false,
    twinPrepared: true, bossRewards: ['guardian-atlas', 'guardian-atlas'], unknown: 'ignored'};
  const normalized = normalizeClassicEquipment(saved);
  assert.deepEqual(normalized, {...oldTwin, lanceCalibrated: false,
    twinPrepared: true, bossRewards: ['guardian-atlas']});
  normalized.unlocked.push('lance'); normalized.bossRewards.length = 0;
  assert.deepEqual(saved.unlocked, ['pulse', 'twin', 'twin']);
  assert.deepEqual(saved.bossRewards, ['guardian-atlas', 'guardian-atlas']);
});

test('invalid records fail closed without stripping or rewriting an old save', () => {
  const fresh = createClassicEquipment();
  const invalid = [null, undefined, false, [], 'equipment', {},
    {...fresh, version: 2}, {...fresh, recoveredTwin: 1},
    {...fresh, unlocked: []}, {...fresh, unlocked: ['pulse', 'unknown']},
    {...fresh, unlocked: ['pulse', ...new Array(1)]},
    {...fresh, unlocked: ['pulse', 'twin']}, {...fresh, selected: 'twin'},
    {...oldLance, recoveredTwin: false}, {...oldLance, lanceCalibrated: false},
    {...oldLance, unlocked: ['pulse', 'lance']}, {...fresh, lanceCalibrated: 'yes'},
    {...fresh, twinPrepared: true}, {...fresh, twinPrepared: 'yes'},
    {...fresh, bossRewards: 'guardian-atlas'}, {...fresh, bossRewards: ['future-boss']},
    {...oldTwin, bossRewards: new Array(1)},
    {...fresh, bossRewards: ['guardian-atlas']},
    {...oldTwin, bossRewards: ['toString']}, {...fresh, bossRewards: undefined},
    {...fresh, twinPrepared: undefined}];
  for (const value of invalid) {
    const before = JSON.stringify(value);
    assert.equal(normalizeClassicEquipment(value), null, before);
    assert.equal(JSON.stringify(value), before);
  }
});

test('recovering and preparing a component never unlocks or equips the second pulse', () => {
  const fresh = createClassicEquipment();
  assert.deepEqual(prepareClassicTwin(fresh), fresh);
  assert.notEqual(prepareClassicTwin(fresh), fresh);
  const recovered = {...fresh, recoveredTwin: true};
  const before = structuredClone(recovered);
  const prepared = prepareClassicTwin(recovered);
  assert.deepEqual(prepared.unlocked, ['pulse']);
  assert.equal(prepared.selected, 'pulse');
  assert.equal(prepared.twinPrepared, true);
  assert.equal(canEquipClassicWeapon(prepared, 'twin'), false);
  assert.equal(canEquipClassicWeapon(prepared, 'lance'), false);
  assert.deepEqual(prepared.bossRewards, []);
  assert.deepEqual(recovered, before);
  assert.deepEqual(prepareClassicTwin(prepared), prepared);
  assert.notEqual(prepareClassicTwin(prepared).unlocked, prepared.unlocked);
});

test('defeating Atlas grants Twin once, records the actual guardian and leaves Pulse equipped', () => {
  const equipment = createClassicEquipment();
  const before = structuredClone(equipment);
  const first = awardClassicBossWeapon(equipment, 'guardian-atlas');
  assert.equal(first.granted, true);
  assert.equal(first.weaponId, 'twin');
  assert.equal(first.equipment.recoveredTwin, true);
  assert.equal(first.equipment.twinPrepared, true);
  assert.deepEqual(first.equipment.bossRewards, ['guardian-atlas']);
  assert.deepEqual(first.equipment.unlocked, ['pulse', 'twin']);
  assert.equal(first.equipment.selected, 'pulse');
  assert.equal(canEquipClassicWeapon(first.equipment, 'twin'), true);
  assert.equal(canEquipClassicWeapon(first.equipment, 'lance'), false);
  assert.deepEqual(normalizeClassicEquipment(first.equipment), first.equipment);
  const persisted = JSON.parse(JSON.stringify(first.equipment));
  for (let replay = 0; replay < 25; replay++) {
    const repeated = awardClassicBossWeapon(persisted, 'guardian-atlas');
    assert.equal(repeated.granted, false);
    assert.deepEqual(repeated.equipment, first.equipment);
    assert.notEqual(repeated.equipment, persisted);
    assert.notEqual(repeated.equipment.unlocked, persisted.unlocked);
    assert.notEqual(repeated.equipment.bossRewards, persisted.bossRewards);
  }
  assert.deepEqual(equipment, before);
});

test('Atlas victory preserves a legitimate old Twin and does not grant it twice', () => {
  for (const equipment of [oldTwin, oldLance]) {
    const before = structuredClone(equipment);
    const result = awardClassicBossWeapon(equipment, 'guardian-atlas');
    assert.equal(result.granted, false);
    assert.equal(result.equipment.selected, withoutLance(equipment).selected);
    assert.deepEqual(result.equipment.unlocked, withoutLance(equipment).unlocked);
    assert.deepEqual(result.equipment.bossRewards, ['guardian-atlas']);
    assert.deepEqual(equipment, before);
    if (equipment.lanceCalibrated) assert.equal(result.equipment.lanceCalibrated, true);
  }
});

test('unknown guardians and weapon IDs reject without inventing later boss rewards', () => {
  const equipment = createClassicEquipment();
  const before = structuredClone(equipment);
  for (const id of ['future-boss', 'guardian-vulkar', '', undefined, null, 'toString', '__proto__',
    new String('guardian-atlas'), {toString: () => 'guardian-atlas'}]) {
    assert.throws(() => awardClassicBossWeapon(equipment, id), RangeError);
    assert.throws(() => canEquipClassicWeapon(equipment, id), RangeError);
  }
  for (const invalid of [{}, {...equipment, selected: 'lance'}, null]) {
    assert.throws(() => prepareClassicTwin(invalid), RangeError);
    assert.throws(() => awardClassicBossWeapon(invalid, 'guardian-atlas'), RangeError);
    assert.throws(() => canEquipClassicWeapon(invalid, 'pulse'), RangeError);
  }
  assert.deepEqual(equipment, before);
});

test('the arsenal model owns no storage, renderer, random source or update clock', async () => {
  const source = await readFile(new URL('../src/game/progression/classic-arsenal.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /requestAnimationFrame|setInterval|setTimeout|Math\.random|Date\.now|localStorage|document\.|window\./);
});

test('the workshop no longer grants weapons: old Abanico and Aguja purchases are refunded, not projected', () => {
  const map = new Map(), log = createScrapLedger({storage: {
    readRaw: key => ({ok: true, value: map.get(key) ?? null}),
    setJSON: (key, value) => { map.set(key, JSON.stringify(value)); return true; }
  }});
  const run = log.beginRun({scope: 'classic:1'});
  for (let index = 0; index < 25; index++) log.claimDrop({runId: run.runId, dropId: `enemy:${index}`, enemyType: 'scout'});
  assert.equal(log.purchase({transactionId: 'buy:twin-preparation', sku: 'twin-preparation'}).ok, true);
  for (const sku of ['weapon-scatter', 'weapon-needle']) assert.equal(log.purchase({transactionId: `buy:${sku}`, sku}).reason, 'retired');
  const fresh = createClassicEquipment();
  assert.deepEqual(syncClassicWorkshopWeapons(fresh, log.getState()), fresh);
  const old = {version: 1, recoveredTwin: false, unlocked: ['pulse', 'scatter', 'needle'], selected: 'needle'};
  assert.deepEqual(normalizeClassicEquipment(old), {version: 1, recoveredTwin: false, unlocked: ['pulse'], selected: 'pulse'});
});

test('missing or forged workshop rights never unlock new weapons and historical equipment remains recoverable', () => {
  const fresh = createClassicEquipment();
  for (const record of [null, undefined, {}, {...createScrapRecord(), upgrades: ['weapon-scatter']}]) {
    assert.deepEqual(syncClassicWorkshopWeapons(fresh, record), fresh);
    assert.deepEqual(syncClassicWorkshopWeapons(oldLance, record), withoutLance(oldLance));
  }
});
