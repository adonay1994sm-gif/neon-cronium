/**
 * Formaciones de patrulla (propietario, 12/11/2026): cada perseguidor tiene un
 * puesto en un dibujo que se lee de un vistazo, en vez de buscar al jugador
 * por su cuenta y acabar todos apilados. Solo decide DÓNDE se colocan: vida,
 * daño y turnos de ataque no cambian. Puro: sin reloj propio; quien llama pasa
 * `dt` y la posición del jugador.
 */
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
// Velocidad a la que el dibujo entero sigue al jugador (px/s): despacio.
const FOLLOW_SPEED = 45;
const spread = (count, gap, width) => {
  const step = count > 1 ? Math.min(gap, width / (count - 1)) : 0;
  return Array.from({length: count}, (_, k) => (k - (count - 1) / 2) * step);
};
// Puestos relativos al centro, ordenados de izquierda a derecha; `y` crece hacia el jugador.
const SHAPES = Object.freeze({
  // Línea: un muro a la misma altura.
  line: (count, width) => spread(count, 150, width).map(x => ({x, y: 0})),
  // Cuña: el del centro va adelantado y las alas se retrasan en V.
  wedge: (count, width) => spread(count, 110, width).map((x, k) => ({x,
    y: 85 * (Math.floor((count - 1) / 2) - Math.floor(Math.abs(k - (count - 1) / 2)))})),
  // Pinza: dos grupos escalonados en los flancos y el centro libre. Los
  // flancos van en los bordes, así que la pinza no se desplaza; si solo queda
  // uno, deja el borde y sigue al jugador (si no, no le alcanzaría al otro lado).
  pincer: (count, width) => count === 1 ? [{x: 0, y: 0}] : Array.from({length: count}, (_, k) => {
    const left = k < Math.ceil(count / 2), row = left ? k : k - Math.ceil(count / 2);
    return {x: (left ? -1 : 1) * (width / 2 - (row % 2) * 80), y: 90 * row};
  }).sort((a, b) => a.x - b.x)
});

export function createFormation(kind) {
  if (!Object.hasOwn(SHAPES, kind)) throw new RangeError(`Unknown formation: ${kind}`);
  return {kind, centerX: null, order: []};
}

/** `members = [{id, x}]` en orden de llegada (el primero es el más antiguo).
 * Devuelve Map id → {x, y} con el puesto de cada uno. Los puestos solo se
 * reparten de nuevo cuando alguien entra o cae: así nadie baila de sitio. */
export function updateFormation(formation, members, dt, {playerX, minX, maxX, topY}) {
  const slots = SHAPES[formation.kind](members.length, maxX - minX);
  const same = formation.order.length === members.length && members.every(member => formation.order.includes(member.id));
  if (!same) {
    // De izquierda a derecha según están ahora: nadie cruza para llegar a su puesto.
    const order = [...members].sort((a, b) => a.x - b.x).map(member => member.id);
    if (formation.kind === 'wedge' && order.length) {
      // El más antiguo va en la punta: es quien tiene preferencia para atacar.
      order.splice(order.indexOf(members[0].id), 1);
      order.splice(Math.floor((members.length - 1) / 2), 0, members[0].id);
    }
    formation.order = order;
  }
  const half = slots.reduce((most, slot) => Math.max(most, Math.abs(slot.x)), 0);
  const low = Math.min(minX + half, (minX + maxX) / 2), high = Math.max(maxX - half, (minX + maxX) / 2);
  formation.centerX = clamp(formation.centerX === null ? playerX
    : formation.centerX + clamp(playerX - formation.centerX, -FOLLOW_SPEED * dt, FOLLOW_SPEED * dt), low, high);
  return new Map(formation.order.map((id, k) => [id, {x: formation.centerX + slots[k].x, y: topY + slots[k].y}]));
}
