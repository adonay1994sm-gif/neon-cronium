import {classicWorkshopState} from './scrap-economy.js';

const WEAPON_IDS = Object.freeze(['pulse', 'twin', 'lance', 'scatter', 'needle']);
const BOSS_WEAPONS = Object.freeze({'guardian-atlas': 'twin'});
// Lanza, Abanico y Aguja salieron (dec-armas-plan, 01/11/2026): vuelven con el
// jefe de su sector. Un guardado antiguo las pierde y vuela con Pulso; la
// chatarra que costaron la devuelve la bodega (scrap-economy).
const RETIRED_WEAPONS = Object.freeze(['lance', 'scatter', 'needle']);
const owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

// This is the existing equipment record, not a new campaign or save key.
// Optional reward metadata never turns an old weapon into an inferred victory.
export function createClassicEquipment() {
  return {version: 1, recoveredTwin: false, unlocked: ['pulse'], selected: 'pulse',
    twinPrepared: false, bossRewards: []};
}

export function normalizeClassicEquipment(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      value.version !== 1 || typeof value.recoveredTwin !== 'boolean' ||
      !Array.isArray(value.unlocked) || !value.unlocked.includes('pulse') ||
      [...value.unlocked].some(id => !WEAPON_IDS.includes(id)) ||
      !WEAPON_IDS.includes(value.selected) || !value.unlocked.includes(value.selected) ||
      (value.unlocked.includes('twin') && !value.recoveredTwin) ||
      (owns(value, 'lanceCalibrated') && typeof value.lanceCalibrated !== 'boolean') ||
      (value.unlocked.includes('lance') &&
        (!value.lanceCalibrated || !value.unlocked.includes('twin'))) ||
      (owns(value, 'twinPrepared') && typeof value.twinPrepared !== 'boolean') ||
      (value.twinPrepared && !value.recoveredTwin) ||
      (owns(value, 'bossRewards') && (!Array.isArray(value.bossRewards) ||
        [...value.bossRewards].some(id => typeof id !== 'string' || !owns(BOSS_WEAPONS, id))))) return null;

  // A recorded reward must include its equipment; a partial write is not a
  // valid transaction. The completion journal can retry the complete record.
  if (value.bossRewards?.some(id => !value.unlocked.includes(BOSS_WEAPONS[id]))) return null;

  const unlocked = [...new Set(value.unlocked)].filter(id => !RETIRED_WEAPONS.includes(id));
  return {version: 1, recoveredTwin: value.recoveredTwin,
    unlocked, selected: unlocked.includes(value.selected) ? value.selected : 'pulse',
    ...(owns(value, 'lanceCalibrated') ? {lanceCalibrated: value.lanceCalibrated} : {}),
    ...(owns(value, 'twinPrepared') ? {twinPrepared: value.twinPrepared} : {}),
    ...(owns(value, 'bossRewards') ? {bossRewards: [...new Set(value.bossRewards)]} : {})};
}

function equipmentCopy(equipment) {
  const normalized = normalizeClassicEquipment(equipment);
  if (!normalized) throw new RangeError('Invalid classic equipment');
  return normalized;
}

export function prepareClassicTwin(equipment) {
  const next = equipmentCopy(equipment);
  // Recovering a component and preparing it in C9 cannot grant firepower.
  // Atlas is the first implemented guardian that authorizes the second pulse.
  if (next.recoveredTwin) next.twinPrepared = true;
  return next;
}

export function awardClassicBossWeapon(equipment, bossId) {
  if (typeof bossId !== 'string' || !owns(BOSS_WEAPONS, bossId)) throw new RangeError('Unknown classic boss');
  const next = equipmentCopy(equipment);
  const weaponId = BOSS_WEAPONS[bossId];
  const granted = !next.unlocked.includes(weaponId);
  next.bossRewards = [...new Set([...(next.bossRewards || []), bossId])];
  next.recoveredTwin = true;
  next.twinPrepared = true;
  if (granted) next.unlocked.push(weaponId);
  // The player chooses when to equip it; replaying a victory cannot switch
  // weapons or grant Lance before a later, actually implemented guardian.
  return {equipment: next, granted, weaponId};
}

export function canEquipClassicWeapon(equipment, id) {
  if (!WEAPON_IDS.includes(id)) throw new RangeError('Unknown classic weapon');
  return equipmentCopy(equipment).unlocked.includes(id);
}

/**
 * Money and ownership commit in the ledger first. Rebuilding this equipment
 * projection after an interrupted UI save cannot charge twice or infer a boss
 * victory. Purchases never change the player's equipped weapon.
 */
export function syncClassicWorkshopWeapons(equipment, record) {
  const next = equipmentCopy(equipment);
  for (const weaponId of classicWorkshopState(record).weaponIds) {
    if (!next.unlocked.includes(weaponId)) next.unlocked.push(weaponId);
  }
  return next;
}
