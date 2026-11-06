/**
 * Conversaciones en las bases del mapa de sector (MAPA_SECTOR.md §4).
 * Frases cortas (≤ 90 caracteres) que cambian con el avance del sector.
 */
const freeze = Object.freeze;
const line = (text) => freeze({text});

export const BASE_ACTORS = freeze({
  mira: freeze({id: 'mira', name: 'Mira', role: 'Mecánica de la Forja C9'}),
  iria: freeze({id: 'iria', name: 'Comandante Iria', role: 'Mando de Gaia Nova'})
});

const SCRIPTS = freeze({
  c9: freeze({actor: 'mira', before: freeze([
    line('Llegas con el casco humeante y un registro que quema. Típico.'),
    line('Tráeme chatarra de los restos y te dejo la nave como nueva.'),
    line('Ese emisor gemelo de Chronos… si lo rescatas, puedo montarlo.'),
    line('Y no me mires así: el taller cobra, la guerra no paga facturas.')
  ]), after: freeze([
    line('Así que Atlas te dejó pasar. Te debo una cena, piloto.'),
    line('Si vas a Vulkar, vas a necesitar más que un casco remendado.'),
    line('Trae piezas. Yo pongo las manos.')
  ])}),
  gaia: freeze({actor: 'iria', before: freeze([
    line('…aquí Gaia Nova. Su firma coincide con el convoy atacante.'),
    line('Detenga los motores. Atlas tiene orden de bloquear el corredor.'),
    line('Si trae pruebas, tendrá que llegar hasta Atlas con ellas.')
  ]), after: freeze([
    line('El registro es auténtico. Le pido disculpas, piloto.'),
    line('El convoy C-17 salió de Vulkar. Alguien pagó esas firmas.'),
    line('Gaia le abre su corredor. Encuentre a quien lo pagó.')
  ])})
});

/** Conversación de una base según el avance del sector (Atlas convencido o no). */
export function baseConversation(baseId, {atlasConvinced = false} = {}) {
  const script = SCRIPTS[baseId];
  if (!script) return null;
  return freeze({baseId, actor: BASE_ACTORS[script.actor],
    lines: atlasConvinced ? script.after : script.before});
}
