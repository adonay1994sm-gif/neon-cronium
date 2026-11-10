/**
 * Guardado de sectores (diseño de campaña 6.1–6.2): estrellas y marca por
 * sector, sector desbloqueado y la partida en curso. Reglas: revivir con
 * anuncio al 25 % una vez por intento; al morir se vuelve al tramo 1, o al 6
 * con la baliza, que dura hasta completar el sector; morir en el tramo del
 * subguardián devuelve a ese tramo una vez por intento (propietario,
 * 09/11/2026); «Continuar» vuelve al inicio del tramo en curso. Funciones
 * puras: nunca modifican lo que reciben.
 */
export const SECTOR_SAVE_KEY = 'neonCronium.sectors.v1';
const SECTOR_COUNT = 10, STAGE_COUNT = 10, BEACON_STAGE = 6, REVIVE_HULL = 25;

const isInt = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;
// JSON y no structuredClone: el paquete apunta a Safari 15.0.
const copy = save => JSON.parse(JSON.stringify(save));
const sectorRecord = (save, sector) => save.sectors[sector] || {completed: false, stars: 0, beacon: false};

export const createSectorSave = () => ({version: 1, unlocked: 1, sectors: {}, run: null});

export function normalizeSectorSave(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1 || !isInt(raw.unlocked, 1, SECTOR_COUNT)) return null;
  if (!raw.sectors || typeof raw.sectors !== 'object' || Array.isArray(raw.sectors)) return null;
  const sectors = {};
  for (const [key, record] of Object.entries(raw.sectors)) {
    const sector = Number(key);
    if (!isInt(sector, 1, SECTOR_COUNT) || !record || typeof record.completed !== 'boolean' ||
      !isInt(record.stars, 0, 3) || typeof record.beacon !== 'boolean') return null;
    sectors[sector] = {completed: record.completed, stars: record.stars, beacon: record.beacon};
  }
  let run = null;
  if (raw.run !== null) {
    const r = raw.run;
    if (!r || typeof r !== 'object' || !isInt(r.sector, 1, raw.unlocked) || !isInt(r.stageNumber, 1, STAGE_COUNT) ||
      !Number.isFinite(r.stageHull) || r.stageHull <= 0 || r.stageHull > 100 || typeof r.reviveUsed !== 'boolean' ||
      (r.subRetryUsed !== undefined && typeof r.subRetryUsed !== 'boolean')) return null;
    // subRetryUsed solo se guarda cuando ya se gastó el reintento del subguardián.
    run = {sector: r.sector, stageNumber: r.stageNumber, stageHull: r.stageHull, reviveUsed: r.reviveUsed,
      ...(r.subRetryUsed ? {subRetryUsed: true} : {})};
  }
  return {version: 1, unlocked: raw.unlocked, sectors, run};
}

export function startSectorRun(save, sector) {
  if (!isInt(sector, 1, save.unlocked)) throw new RangeError('sector is locked');
  const next = copy(save);
  next.run = {sector, stageNumber: 1, stageHull: 100, reviveUsed: false};
  return next;
}

export function enterStage(save, stageNumber, hull) {
  if (!save.run) throw new Error('no sector run in progress');
  if (!isInt(stageNumber, 1, STAGE_COUNT) || !Number.isFinite(hull)) throw new RangeError('invalid stage or hull');
  const next = copy(save);
  next.run.stageNumber = stageNumber;
  next.run.stageHull = Math.min(100, Math.max(1, hull));
  return next;
}

export function buyBeacon(save, sector) {
  if (!isInt(sector, 1, SECTOR_COUNT)) throw new RangeError('invalid sector');
  const next = copy(save);
  next.sectors[sector] = {...sectorRecord(save, sector), beacon: true};
  return next;
}

export function useRevive(save) {
  if (!save.run || save.run.reviveUsed) return null;
  const next = copy(save);
  next.run.reviveUsed = true;
  return {save: next, hull: REVIVE_HULL};
}

export function dieInSector(save, {subBossStage = null} = {}) {
  if (!save.run) return copy(save);
  const next = copy(save);
  // El reintento del subguardián es parte del mismo intento: no devuelve el revivir.
  if (subBossStage !== null && save.run.stageNumber === subBossStage && !save.run.subRetryUsed) {
    next.run = {sector: save.run.sector, stageNumber: subBossStage, stageHull: 100, reviveUsed: save.run.reviveUsed, subRetryUsed: true};
    return next;
  }
  next.run = {sector: save.run.sector, stageNumber: sectorRecord(save, save.run.sector).beacon ? BEACON_STAGE : 1,
    stageHull: 100, reviveUsed: false};
  return next;
}

export function continuePoint(save) {
  return save.run ? {sector: save.run.sector, stageNumber: save.run.stageNumber, hull: save.run.stageHull} : null;
}

export function completeSector(save, sector, stars) {
  if (!isInt(sector, 1, SECTOR_COUNT) || !Number.isFinite(stars)) throw new RangeError('invalid sector or stars');
  const next = copy(save), previous = sectorRecord(save, sector);
  next.sectors[sector] = {completed: true, stars: Math.max(previous.stars, Math.trunc(Math.min(3, Math.max(0, stars)))), beacon: false};
  next.unlocked = Math.min(SECTOR_COUNT, Math.max(save.unlocked, sector + 1));
  next.run = null;
  return next;
}
