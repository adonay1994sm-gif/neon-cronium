import test from 'node:test';
import assert from 'node:assert/strict';
import {DIFFICULTY_MODES, applyDifficulty, voyagePressure, voyageNumber, normalizeDifficulty}
  from '../src/game/progression/difficulty.js';
import {VOYAGES, getVoyageStageRules, getVoyageStageRulesFor} from '../src/game/progression/voyages/index.js';

import {stagePressure} from '../src/game/progression/difficulty.js';
const voyageIndex = (ficha, mode) => {
  let total = 0;
  for (let stage = 1; stage <= ficha.stages.length; stage++) total += stagePressure(getVoyageStageRulesFor(ficha.routeId, stage, mode));
  return total / ficha.stages.length;
};

test('S1-V1 in Normal keeps exactly the rules the owner tuned', () => {
  for (let stage = 1; stage <= 10; stage++) {
    const rules = getVoyageStageRules('chronos-to-gaia', stage);
    assert.equal(getVoyageStageRulesFor('chronos-to-gaia', stage, 'normal'), rules);
  }
});

test('the pressure curve never goes down from one voyage to the next, in every mode', () => {
  for (const mode of Object.keys(DIFFICULTY_MODES)) for (let index = 1; index < VOYAGES.length; index++) {
    const before = voyageIndex(VOYAGES[index - 1], mode), after = voyageIndex(VOYAGES[index], mode);
    assert.ok(after > before, `${mode}: ${VOYAGES[index].id} ${after.toFixed(2)} > ${before.toFixed(2)}`);
  }
  for (let n = 2; n <= 50; n++) assert.ok(voyagePressure(n) > voyagePressure(n - 1), `viaje ${n}`);
  assert.equal(voyagePressure(1), 1); assert.ok(voyagePressure(50) <= 3);
  assert.deepEqual(VOYAGES.map(voyageNumber), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('Easy < Normal < Hard < Hardcore on every voyage and every stage', () => {
  // Propietario (25/10): cuatro modos, con DIFÍCIL entre Normal y Hardcore.
  assert.deepEqual(Object.keys(DIFFICULTY_MODES), ['facil', 'normal', 'dificil', 'hardcore']);
  for (const ficha of VOYAGES) {
    const easy = voyageIndex(ficha, 'facil'), normal = voyageIndex(ficha, 'normal'),
      hard = voyageIndex(ficha, 'dificil'), hardcore = voyageIndex(ficha, 'hardcore');
    assert.ok(easy < normal && normal < hard && hard < hardcore,
      `${ficha.id}: ${easy.toFixed(2)} < ${normal.toFixed(2)} < ${hard.toFixed(2)} < ${hardcore.toFixed(2)}`);
  }
  const {facil, dificil, hardcore} = DIFFICULTY_MODES;
  assert.ok(facil.damage < 1 && dificil.damage > 1 && hardcore.damage > dificil.damage);
  assert.ok(dificil.bossHealth > 1 && hardcore.bossHealth > dificil.bossHealth);
});

test('every mode stays fair: patrols, hazard gaps and speeds have hard limits', () => {
  for (const ficha of VOYAGES) for (const mode of Object.keys(DIFFICULTY_MODES)) {
    for (let stage = 1; stage <= ficha.stages.length; stage++) {
      const rules = getVoyageStageRulesFor(ficha.routeId, stage, mode);
      if (rules.patrol) assert.ok(rules.patrol.cap >= 1 && rules.patrol.cap <= 4 && rules.patrol.gap >= 5, `${ficha.id} ${mode} ${stage}`);
      assert.ok(rules.hazards.gap[0] >= .45 && rules.hazards.cap <= 6);
      assert.ok(rules.hazards.speed[1] <= 330 * 1.3 + 1);
      assert.ok(rules.repairAt === null || rules.repairAt >= 6);
    }
  }
  assert.equal(normalizeDifficulty('imposible'), 'normal');
  assert.equal(normalizeDifficulty('hardcore'), 'hardcore');
  assert.equal(normalizeDifficulty('dificil'), 'dificil');
});
