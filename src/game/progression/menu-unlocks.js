/**
 * Botones de la pantalla principal que se abren con la historia (decisión del
 * propietario, 24/10/2026): al empezar solo JUGAR y ajustes; tras el tramo 1,
 * CONTINUAR VIAJE; en el tramo 6 se abre el hangar y ya no se cierra, aunque
 * mueras y vuelvas al tramo 1. La ruta y las naves llegarán tras el jefe,
 * cuando existan el mapa de la galaxia y la segunda nave.
 * También recuerda si ya se vio la intro de Chronos: los intentos siguientes
 * empiezan tras ella (auditoría del 25/10, A1).
 * Clave propia: no toca el guardado del sector. Funciones puras.
 */
export const MENU_UNLOCKS_KEY = 'neonCronium.menu.v1';
const HANGAR_STAGE = 6, STAGE_COUNT = 10;

export function normalizeMenuUnlocks(raw) {
  const valid = Boolean(raw) && typeof raw === 'object' && raw.version === 1 && typeof raw.hangar === 'boolean'
    && raw.seen && typeof raw.seen === 'object' && !Array.isArray(raw.seen);
  return {version: 1, hangar: valid ? raw.hangar : false,
    seen: {hangar: valid && raw.seen.hangar === true, intro: valid && raw.seen.intro === true}};
}

export function menuView(sectorSave, unlocks) {
  const run = sectorSave.run, done = sectorSave.sectors[1]?.completed === true;
  const hangar = unlocks.hangar || done || (run?.stageNumber ?? 0) >= HANGAR_STAGE;
  const play = run && run.stageNumber > 1
    ? {label: 'CONTINUAR VIAJE', detail: `SECTOR 1 · TRAMO ${run.stageNumber}/${STAGE_COUNT}${sectorSave.sectors[1]?.beacon ? ' · CON BALIZA' : ''}`}
    : done ? {label: 'REPETIR SECTOR', detail: 'SECTOR 1 COMPLETADO'}
      : {label: 'JUGAR', detail: 'SECTOR 1 · CHRONOS → GAIA'};
  return {play, hangar: {visible: hangar, isNew: hangar && !unlocks.seen.hangar},
    unlocks: {version: 1, hangar, seen: {...unlocks.seen}}};
}

export function markMenuSeen(unlocks, button) {
  return {version: 1, hangar: unlocks.hangar, seen: {...unlocks.seen, [button]: true}};
}
