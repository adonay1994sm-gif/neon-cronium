/**
 * Llegada de C9 en la parada del tramo 6 (propietario, 02/11/2026; concepto en
 * docs/design/C9_CONCEPTO.md). Alto el fuego total mientras dura. C9 entra
 * desde arriba, se para y abre la compuerta de abajo; el jugador mete la nave
 * por la compuerta (o el haz tractor la recoge si tarda), la nave entra y se
 * abre la Forja. Al salir de la Forja, C9 suelta la nave y se marcha.
 * Puro: reloj de juego que pasa el llamador. dt = 0 no cambia nada (pausa).
 */
export const C9_DOCKING_RULES = Object.freeze({
  arriveSeconds: 1.8, openSeconds: .9, tractorSeconds: 1, releaseSeconds: .8, leaveSeconds: 1.6,
  // La nave tiene que quedarse este tiempo en la compuerta; si no llega, el
  // haz la recoge sola pasado autoCatchSeconds.
  dwellSeconds: .6, autoCatchSeconds: 6,
  holdY: .3, gateOffset: 150, gateRadius: 90, size: 440
});

export function createC9Docking({width, height}) {
  if (![width, height].every(Number.isFinite) || width < 280 || height < 540) throw new RangeError('Invalid C9 docking arena');
  const holdY = height * C9_DOCKING_RULES.holdY;
  return {width, height, x: width / 2, y: -C9_DOCKING_RULES.size / 2, holdY,
    phase: 'arrive', phaseTime: 0, dwell: 0, done: false};
}

/** Punto de la compuerta, donde tiene que entrar la nave. */
export function c9Gate(scene) {
  return {x: scene.x, y: scene.y + C9_DOCKING_RULES.gateOffset};
}

function enter(scene, phase, emit) {
  scene.phase = phase; scene.phaseTime = 0;
  emit({type: phase});
}

/** Avanza la escena. ship: posición de la nave. Eventos: open, await,
 * tractor, docked (abrir la Forja), release, leave y done. */
export function advanceC9Docking(scene, dt, ship, emit = () => {}) {
  if (!(dt > 0) || scene.done || scene.phase === 'docked') return;
  const rules = C9_DOCKING_RULES;
  scene.phaseTime += dt;
  if (scene.phase === 'arrive') {
    const progress = Math.min(1, scene.phaseTime / rules.arriveSeconds);
    scene.y = -rules.size / 2 + (scene.holdY + rules.size / 2) * (1 - (1 - progress) ** 3);
    if (progress >= 1) enter(scene, 'open', emit);
  } else if (scene.phase === 'open') {
    if (scene.phaseTime >= rules.openSeconds) enter(scene, 'await', emit);
  } else if (scene.phase === 'await') {
    const gate = c9Gate(scene);
    const inside = Math.hypot(ship.x - gate.x, ship.y - gate.y) <= rules.gateRadius;
    scene.dwell = inside ? scene.dwell + dt : 0;
    if (scene.dwell >= rules.dwellSeconds || scene.phaseTime >= rules.autoCatchSeconds) enter(scene, 'tractor', emit);
  } else if (scene.phase === 'tractor') {
    if (scene.phaseTime >= rules.tractorSeconds) enter(scene, 'docked', emit);
  } else if (scene.phase === 'release') {
    if (scene.phaseTime >= rules.releaseSeconds) enter(scene, 'leave', emit);
  } else if (scene.phase === 'leave') {
    const progress = Math.min(1, scene.phaseTime / rules.leaveSeconds);
    scene.y = scene.holdY - (scene.holdY + rules.size) * progress * progress;
    if (progress >= 1) { scene.done = true; emit({type: 'done'}); }
  }
}

/** Tras salir de la Forja: C9 suelta la nave y se va. */
export function releaseC9Docking(scene, emit = () => {}) {
  if (scene.phase !== 'docked') return false;
  enter(scene, 'release', emit);
  return true;
}

/** Hoja de la estación C9 (2×2): 0 cerrada, 1 abriéndose, 2 atracando, 3 abierta con luces. */
export function c9DockingFrame(scene) {
  if (scene.phase === 'arrive' || scene.phase === 'leave') return 0;
  if (scene.phase === 'open') return scene.phaseTime < C9_DOCKING_RULES.openSeconds / 2 ? 1 : 3;
  if (scene.phase === 'tractor' || scene.phase === 'docked' || scene.phase === 'release') return 2;
  return 3;
}

/** Mientras dura la escena no hay combate (alto el fuego total, 02/11). */
export function c9CeasefireActive(scene) {
  return Boolean(scene) && !scene.done;
}
