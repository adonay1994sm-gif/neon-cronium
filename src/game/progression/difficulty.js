/**
 * Dificultad de la campaña (orden del propietario, 21/10/2026): la presión
 * sube siempre de un viaje al siguiente y hay cuatro modos (DIFÍCIL, orden del
 * propietario del 25/10, entre Normal y Hardcore). Puro: transforma
 * las reglas de tramo de las fichas; el juego aplica el resultado.
 *
 * - Curva: la presión media del viaje n (1…50) debe ser la de S1-V1 por
 *   `voyagePressure(n)`. Cada ficha se calibra (`calibrate`) a ese objetivo:
 *   así sube siempre aunque las fichas se escribieran con valores sueltos, y
 *   los respiros dentro de cada viaje se conservan. S1-V1 vale 1 (igual que
 *   siempre en Normal).
 * - Modos: multiplican esa curva (Normal = 1).
 */
const freeze = Object.freeze;

export const DIFFICULTY_MODES = freeze({
  facil: freeze({id: 'facil', label: 'Fácil', note: 'Menos enemigos y daño; para disfrutar la historia',
    pressure: .72, capDelta: -1, damage: .6, bossHealth: .67, repairEarlier: 4}),
  normal: freeze({id: 'normal', label: 'Normal', note: 'La experiencia prevista',
    pressure: 1, capDelta: 0, damage: 1, bossHealth: 1, repairEarlier: 0}),
  dificil: freeze({id: 'dificil', label: 'Difícil', note: 'Más presión, daño y jefes más duros; para quien ya domina Normal',
    pressure: 1.09, capDelta: 0, damage: 1.12, bossHealth: 1.15, repairEarlier: -3}),
  hardcore: freeze({id: 'hardcore', label: 'Hardcore', note: 'Más enemigos, más rápidos y más daño; sin descanso',
    pressure: 1.18, capDelta: 1, damage: 1.25, bossHealth: 1.3, repairEarlier: -6})
});
export const DIFFICULTY_DEFAULT = 'normal';
export const normalizeDifficulty = value => (DIFFICULTY_MODES[value] ? value : DIFFICULTY_DEFAULT);

/** Número global del viaje (S1-V1 = 1 … S10-V5 = 50). */
export const voyageNumber = ficha => (Math.max(1, ficha?.sector || 1) - 1) * 5 + Math.max(1, ficha?.number || 1);

/** Presión de la curva: +7 % por viaje hasta el 10, luego +3 % (tope 3×). */
export function voyagePressure(number) {
  const n = Math.max(1, Math.trunc(Number(number) || 1));
  return Math.min(3, 1 + .07 * Math.min(n - 1, 9) + .03 * Math.max(0, n - 10));
}

/** Índice de presión de un tramo: patrullas por segundo + peligros por segundo. */
export const stagePressure = rules => (rules.patrol ? rules.patrol.cap / rules.patrol.gap : 0) +
  rules.hazards.cap / ((rules.hazards.gap[0] + rules.hazards.gap[1]) / 2);

/**
 * Factor de una ficha para que su presión media sea la del objetivo:
 * referencia (media de S1-V1) × curva del viaje ÷ su propia media.
 */
export function calibrate(stageRules, {voyage = 1, reference}) {
  const mean = stageRules.reduce((sum, rules) => sum + stagePressure(rules), 0) / stageRules.length;
  return voyage === 1 ? 1 : reference * voyagePressure(voyage) / mean;
}

// Límites de justicia (crítico de juego, 21/10): la exigencia sale de la
// densidad, nunca de quitar avisos ni el hueco garantizado de los peligros.
export const DIFFICULTY_LIMITS = freeze({patrolGapMin: 5, patrolCapMax: 4, hazardGapMin: .45, hazardCapMax: 6, speedMax: 1.3});

/** Reglas de tramo ajustadas por el factor del viaje (`calibrate`) y el modo. */
export function applyDifficulty(rules, {factor = 1, mode = DIFFICULTY_DEFAULT} = {}) {
  if (!rules) return rules;
  const settings = DIFFICULTY_MODES[normalizeDifficulty(mode)];
  const pressure = factor * settings.pressure;
  if (pressure === 1 && settings.capDelta === 0 && settings.repairEarlier === 0) return rules;
  const patrol = rules.patrol && freeze({...rules.patrol,
    cap: Math.max(1, Math.min(DIFFICULTY_LIMITS.patrolCapMax, rules.patrol.cap + settings.capDelta)),
    gap: Math.max(Math.min(rules.patrol.gap, DIFFICULTY_LIMITS.patrolGapMin), rules.patrol.gap / pressure)});
  const hazards = rules.hazards && freeze({...rules.hazards,
    gap: freeze(rules.hazards.gap.map(value => Math.max(DIFFICULTY_LIMITS.hazardGapMin, value / pressure))),
    cap: Math.max(1, Math.min(DIFFICULTY_LIMITS.hazardCapMax, rules.hazards.cap + settings.capDelta)),
    speed: freeze(rules.hazards.speed.map(value => Math.round(value * Math.min(DIFFICULTY_LIMITS.speedMax, Math.sqrt(pressure)))))});
  const repairAt = rules.repairAt === null ? null : Math.max(6, rules.repairAt - settings.repairEarlier);
  return freeze({...rules, patrol, hazards, repairAt});
}
