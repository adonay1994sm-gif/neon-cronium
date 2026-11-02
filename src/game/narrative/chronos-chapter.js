/**
 * Chapter-one story policy. The route owns elapsed seconds; the existing game
 * loop owns play/pause, controls, damage, rendering, audio and persistence.
 * This module emits presentation cues, never gameplay rewards or route events.
 */
export const CHRONOS_CHAPTER_VERSION = 'chronos-chapter-v1';
export const CHRONOS_CHAPTER_STORY_KEY = 'neonCronium.chronosChapterStory.v1';
export const CHRONOS_CHAPTER_OPENING_SECONDS = 26;
// En el juego el inicio es una animación: sin HUD, sin nave y sin control
// hasta que Cronos Prime se marcha (12,6 s) y pasa un instante.
export const CHRONOS_CHAPTER_CINEMATIC_SECONDS = 14;
export const CHRONOS_CHAPTER_AFTERMATH_SECONDS = 8;
export const CHRONOS_CHAPTER_ROUTE_SECONDS = 360;
const ROUTE_ID = 'chronos-to-gaia';
const NOOP = () => {};
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finiteTime = value => Number.isFinite(value) && value >= 0;
const freeze = value => Object.freeze(value);

export const CHRONOS_CHAPTER_ACTORS = freeze({
  lira: freeze({id: 'lira', name: 'Lira', label: 'LIRA · CONTROL CHRONOS',
    role: 'Operadora científica; prioriza la evacuación y conservar el registro.'}),
  mira: freeze({id: 'mira', name: 'Mira', label: 'MIRA · FORJA C9',
    role: 'Mecánica del corredor; mantiene la ruta abierta y cobra por sus mejoras.'}),
  atlas: freeze({id: 'atlas', name: 'Atlas', label: 'GUARDIAN ATLAS',
    role: 'Defensa autónoma de Gaia; ejecuta un bloqueo basado en identificación falsificada.'}),
  iria: freeze({id: 'iria', name: 'Iria', label: 'COMANDANTE IRIA · GAIA',
    role: 'Mando de Gaia; protege la frontera y puede revocar el protocolo al verificar pruebas.'}),
  n7: freeze({id: 'n7', name: 'N-7', label: 'N-7 · NAVEGACIÓN',
    role: 'Asistente de a bordo; interpreta el rastro sin sustituir a los personajes.'})
});

function dialogue(id, speakerId, text, duration, extra = {}) {
  return freeze({id: `chapter1:${id}`, type: 'transmission', speakerId,
    speaker: CHRONOS_CHAPTER_ACTORS[speakerId].label, text, duration, ...extra});
}

/** Six shots share the existing rupture at 9 s and its 9–16.2 s wave. */
export const CHRONOS_CHAPTER_OPENING = freeze([
  dialogue('routine', 'lira', 'Chronos, turno de guardia. La ruta del CRONIUM está estable.', 3,
    {at: 0, shotIndex: 0, phase: 'opening', visualCue: 'chronos-routine', audioCue: 'chronos-room-tone'}),
  dialogue('convoy-clearance', 'lira', 'Convoy C-17: firma aceptada. Abro el escudo del reactor.', 3.3,
    {at: 3, shotIndex: 1, phase: 'opening', visualCue: 'convoy-clearance', audioCue: 'radio-valid'}),
  dialogue('false-clearance', 'lira', 'Esa firma era falsa… ¡Algo enorme se posa sobre la torre!', 2.7,
    {at: 6.3, shotIndex: 2, phase: 'opening', visualCue: 'sabotage-lock', audioCue: 'access-anomaly'}),
  dialogue('evacuate', 'lira', '¡Ha perforado el reactor! Todas las naves: evacuación.', 4.2,
    {at: 9, shotIndex: 3, phase: 'opening', visualCue: 'reactor-breach', audioCue: 'reactor-trip'}),
  dialogue('log-transfer', 'lira', 'Te envío el registro. Las claves del convoy fueron alteradas.', 6,
    {at: 13.2, shotIndex: 4, phase: 'opening', visualCue: 'log-transfer', audioCue: 'memory-transfer'}),
  dialogue('escape-order', 'lira', 'Llévalo a Gaia. No permitas que recuperen el registro.', 6.8,
    {at: 19.2, shotIndex: 5, phase: 'opening', visualCue: 'perimeter-escape', audioCue: 'emergency-route'})
]);

const ROUTE_DIALOGUES = freeze([
  dialogue('pursuit-motive', 'lira', 'Los asaltantes quieren borrar ese registro. No te detengas.', 5.2,
    {at: 38, phase: 'route', visualCue: 'pursuit-contact', audioCue: 'radio-distress'}),
  dialogue('wreckage-trail', 'n7', 'El CRONIUM marca su trayectoria. Recuperarlo nos llevará hasta ellos.', 5.4,
    {at: 76, phase: 'route', visualCue: 'cronium-trail', audioCue: 'navigation-confirm'}),
  dialogue('chronos-astern', 'n7', 'Chronos queda atrás. Conservo el registro y la ruta hacia Gaia.', 5,
    {at: 112, phase: 'route', visualCue: 'chronos-astern', audioCue: 'navigation-confirm'}),
  dialogue('c9-contact', 'mira', 'Enlace C9 disponible en tu panel. Puedo configurar tu nave sin desviar la ruta.', 5.2,
    {at: 177, phase: 'route', visualCue: 'c9-contact', audioCue: 'c9-radio'}),
  dialogue('gaia-visible', 'n7', 'Gaia Nova al frente. Su red defensiva sigue activa.', 4.8,
    {at: 256, phase: 'route', visualCue: 'gaia-reveal', audioCue: 'gaia-beacon'}),
  dialogue('atlas-border', 'atlas', 'Corredor restringido. Toda carga de CRONIUM debe identificarse.', 4.5,
    {at: 292, phase: 'route', visualCue: 'atlas-identification', audioCue: 'atlas-hail'}),
  dialogue('forged-identity', 'n7', 'Han copiado nuestra firma. Atlas cree que atacamos Chronos.', 5,
    {at: 332, phase: 'route', visualCue: 'forged-identity', audioCue: 'identity-mismatch'})
]);

const SIGNAL_DIALOGUES = freeze({
  'module-recovered': dialogue('module-recovered', 'mira', 'Emisor a bordo. Abre C9 en tu panel y prepararé sus anclajes.', 5.2,
    {phase: 'event', visualCue: 'recovered-emitter', audioCue: 'salvage-identified'}),
  'c9-arrival': dialogue('c9-arrival', 'mira', 'Enlace estable. Reparación de emergencia completada; mejoras disponibles en C9.', 5.2,
    {phase: 'event', visualCue: 'c9-docking', audioCue: 'c9-dock'}),
  'c9-departure': dialogue('c9-departure', 'mira', 'Sigue las balizas hasta Gaia. Que ese registro llegue entero.', 4.8,
    {phase: 'event', visualCue: 'c9-departure', audioCue: 'c9-release'}),
  'atlas-entry': dialogue('atlas-entry', 'atlas', 'Tu firma coincide con el convoy atacante. Entrega el CRONIUM.', 5,
    {phase: 'event', visualCue: 'atlas-blockade', audioCue: 'atlas-challenge'}),
  'atlas-phase-two': dialogue('atlas-phase-two', 'atlas', 'Registro contradictorio. Manteniendo el bloqueo de frontera.', 3.8,
    {phase: 'event', visualCue: 'atlas-reassessment', audioCue: 'atlas-phase'})
});

export const CHRONOS_CHAPTER_AFTERMATH = freeze([
  dialogue('atlas-log-verified', 'atlas', 'Registro verificado. Suspendiendo el bloqueo.', 2,
    {at: 0, phase: 'aftermath', visualCue: 'atlas-disengage', audioCue: 'atlas-release'}),
  dialogue('iria-identification', 'iria', 'Comandante Iria. Usaron tu señal para atacar Chronos.', 3,
    {at: 2, phase: 'aftermath', visualCue: 'iria-contact', audioCue: 'gaia-command'}),
  dialogue('vulkar-lead', 'iria', 'El convoy vino de Vulkar. Tienes paso libre.', 3,
    {at: 5, phase: 'aftermath', visualCue: 'vulkar-route', audioCue: 'route-authorized'})
]);

export const CHRONOS_CHAPTER_DIALOGUES = freeze([
  ...CHRONOS_CHAPTER_OPENING, ...ROUTE_DIALOGUES,
  ...Object.values(SIGNAL_DIALOGUES), ...CHRONOS_CHAPTER_AFTERMATH
]);
const TIMED_DIALOGUES = [...CHRONOS_CHAPTER_OPENING, ...ROUTE_DIALOGUES];
const dialogueById = new Map(CHRONOS_CHAPTER_DIALOGUES.map(cue => [cue.id, cue]));
const signalNames = new Set([...Object.keys(SIGNAL_DIALOGUES), 'atlas-disabled']);
const minimumRouteTime = freeze({'module-recovered': 72, 'c9-arrival': 180,
  'c9-departure': 180, 'atlas-entry': 359, 'atlas-phase-two': 359, 'atlas-disabled': 359});
const signalForCue = new Map(Object.entries(SIGNAL_DIALOGUES).map(([name, cue]) => [cue.id, name]));
const uniqueStrings = value => Array.isArray(value) && value.every(id => typeof id === 'string') &&
  new Set(value).size === value.length;

/** Validates a separate story record; never changes a route, save or inventory. */
export function normalizeChronosChapterCheckpoint(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1 ||
      value.contentVersion !== CHRONOS_CHAPTER_VERSION || value.routeId !== ROUTE_ID ||
      !finiteTime(value.routeElapsed) || value.routeElapsed > CHRONOS_CHAPTER_ROUTE_SECONDS ||
      !finiteTime(value.aftermathElapsed) || value.aftermathElapsed > CHRONOS_CHAPTER_AFTERMATH_SECONDS ||
      typeof value.introSeen !== 'boolean' || typeof value.introSkipped !== 'boolean' ||
      (value.introSkipped && !value.introSeen) || !uniqueStrings(value.eventIds) ||
      value.eventIds.length > CHRONOS_CHAPTER_DIALOGUES.length || !uniqueStrings(value.signalIds) ||
      value.signalIds.some(name => !signalNames.has(name) || minimumRouteTime[name] > value.routeElapsed + .05) ||
      (value.signalIds.includes('c9-departure') && !value.signalIds.includes('c9-arrival')) ||
      (value.signalIds.some(name => ['atlas-phase-two', 'atlas-disabled'].includes(name)) && !value.signalIds.includes('atlas-entry')) ||
      (value.aftermathElapsed > 0 && !value.signalIds.includes('atlas-disabled'))) return null;
  for (const id of value.eventIds) {
    const cue = dialogueById.get(id);
    if (!cue) return null;
    if (cue.phase === 'opening' && cue.at > value.routeElapsed + .05 && !value.introSeen) return null;
    if (cue.phase === 'route' && cue.at > value.routeElapsed + .05) return null;
    if (cue.phase === 'event' && !value.signalIds.includes(signalForCue.get(id))) return null;
    if (cue.phase === 'aftermath' && (!value.signalIds.includes('atlas-disabled') || cue.at > value.aftermathElapsed + .05)) return null;
  }
  return freeze({version: 1, contentVersion: CHRONOS_CHAPTER_VERSION, routeId: ROUTE_ID,
    routeElapsed: value.routeElapsed, aftermathElapsed: value.aftermathElapsed,
    introSeen: value.introSeen, introSkipped: value.introSkipped,
    eventIds: freeze([...value.eventIds]), signalIds: freeze([...value.signalIds])});
}

/**
 * view = {elapsed: route seconds, playing?: boolean, aftermathElapsed?: seconds}.
 * aftermathElapsed is supplied from the caller's existing play clock since the
 * actual Atlas resolution. No delta, timers or route fast-forward live here.
 */
export function createChronosChapterStory({checkpoint = null, routeElapsed = checkpoint?.routeElapsed ?? 0,
  introEnabled = true, replayIntro = false, presentation = 'cinematic'} = {}) {
  if (!finiteTime(routeElapsed) || routeElapsed > CHRONOS_CHAPTER_ROUTE_SECONDS ||
      typeof introEnabled !== 'boolean' || typeof replayIntro !== 'boolean' ||
      !['cinematic','in-world'].includes(presentation)) throw new RangeError('Invalid chapter story options');
  const restored = checkpoint === null ? null : normalizeChronosChapterCheckpoint(checkpoint);
  if (checkpoint !== null && !restored) throw new RangeError('Invalid chapter story checkpoint');
  let elapsed = routeElapsed, aftermathElapsed = 0;
  let introSeen = restored?.introSeen || false, introSkipped = restored?.introSkipped || false;
  const canOpen = (introEnabled || replayIntro) && (!introSeen || replayIntro) && routeElapsed < CHRONOS_CHAPTER_OPENING_SECONDS;
  let openingEnabled = canOpen;
  if (replayIntro && canOpen) { introSeen = false; introSkipped = false; }
  const fired = new Set(), signals = new Set();
  for (const name of restored?.signalIds || []) if (minimumRouteTime[name] <= routeElapsed + .05) signals.add(name);
  if (signals.has('atlas-disabled')) aftermathElapsed = restored.aftermathElapsed;
  for (const id of restored?.eventIds || []) {
    const cue = dialogueById.get(id);
    if (cue.phase === 'opening') {
      if (!replayIntro || cue.at < routeElapsed) fired.add(id);
    } else if (cue.phase === 'route' && cue.at <= routeElapsed) fired.add(id);
    else if (cue.phase === 'event' && signals.has(signalForCue.get(id))) fired.add(id);
    else if (cue.phase === 'aftermath' && signals.has('atlas-disabled') && cue.at <= aftermathElapsed) fired.add(id);
  }
  // Re-entry starts at its real checkpoint. Previously crossed lines are not
  // dumped into the comms channel, even when this separate story key is absent.
  for (const cue of TIMED_DIALOGUES) {
    if (cue.at < routeElapsed) fired.add(cue.id);
  }
  if (routeElapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) introSeen = true;

  function snapshot() {
    const active = openingEnabled && elapsed < CHRONOS_CHAPTER_OPENING_SECONDS;
    const shot = [...CHRONOS_CHAPTER_OPENING].reverse().find(cue => elapsed >= cue.at) || CHRONOS_CHAPTER_OPENING[0];
    const film = active && presentation === 'in-world' && elapsed < CHRONOS_CHAPTER_CINEMATIC_SECONDS;
    const aftermathActive = signals.has('atlas-disabled') && aftermathElapsed < CHRONOS_CHAPTER_AFTERMATH_SECONDS;
    const line = aftermathActive ? [...CHRONOS_CHAPTER_AFTERMATH].reverse().find(cue => aftermathElapsed >= cue.at) : null;
    return freeze({version: CHRONOS_CHAPTER_VERSION, routeId: ROUTE_ID, routeElapsed: elapsed,
      introSeen, opening: freeze({active: (active && presentation === 'cinematic') || film,
        controlsLocked: (active && presentation === 'cinematic' && elapsed < 9) || film,
        canSkip: (active && presentation === 'cinematic') || film, film, shotIndex: shot.shotIndex, visualCue: shot.visualCue,
        progress: clamp(elapsed / CHRONOS_CHAPTER_OPENING_SECONDS, 0, 1),
        shotProgress: clamp((elapsed - shot.at) / shot.duration, 0, 1),
        // The new opening illustration reveals the existing station and its
        // one authored wave; it never draws another reactor destruction.
        backgroundAlpha: active && presentation === 'cinematic' ? 1 - clamp((elapsed - 9) / 2.4, 0, 1) : 0,
        dialogue: active ? shot : null}),
      aftermath: freeze({active: aftermathActive, elapsed: aftermathElapsed, dialogue: line}),
      aftermathReady: signals.has('atlas-disabled') && aftermathElapsed >= CHRONOS_CHAPTER_AFTERMATH_SECONDS,
      carriesRecord: elapsed >= 13.2, eventIds: freeze([...fired]), signalIds: freeze([...signals])});
  }

  function emitOnce(cue, emit) {
    if (fired.has(cue.id)) return false;
    fired.add(cue.id); // Before callback: reentrant/throwing consumers cannot duplicate it.
    emit(freeze({...cue, chapter: 1, storyVersion: CHRONOS_CHAPTER_VERSION,
      routeElapsed: elapsed, ...(cue.phase === 'aftermath' ? {aftermathElapsed} : {})}));
    return true;
  }

  function advance(view, emit = NOOP) {
    if (!view || !finiteTime(view.elapsed) || typeof emit !== 'function' ||
        (view.playing !== undefined && typeof view.playing !== 'boolean') ||
        (view.aftermathElapsed !== undefined && !finiteTime(view.aftermathElapsed))) throw new RangeError('Invalid chapter story view');
    if (view.playing === false) return snapshot();
    const next = Math.min(view.elapsed, CHRONOS_CHAPTER_ROUTE_SECONDS);
    if (next + 1e-9 < elapsed) throw new RangeError('Create a new story controller when restoring an earlier route checkpoint');
    elapsed = Math.max(elapsed, next);
    for (const cue of TIMED_DIALOGUES) {
      if (cue.at > elapsed + 1e-9 || fired.has(cue.id)) continue;
      if ((cue.phase === 'opening' && !openingEnabled) || elapsed >= cue.at + cue.duration) fired.add(cue.id);
      else emitOnce(cue, emit);
    }
    if (elapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) { introSeen = true; openingEnabled = false; }
    if (signals.has('atlas-disabled') && view.aftermathElapsed !== undefined) {
      const nextAftermath = Math.min(view.aftermathElapsed, CHRONOS_CHAPTER_AFTERMATH_SECONDS);
      if (nextAftermath + 1e-9 < aftermathElapsed) throw new RangeError('Aftermath clock must be monotonic');
      aftermathElapsed = Math.max(aftermathElapsed, nextAftermath);
      for (const cue of CHRONOS_CHAPTER_AFTERMATH) {
        if (cue.at > aftermathElapsed + 1e-9 || fired.has(cue.id)) continue;
        if (aftermathElapsed >= cue.at + cue.duration) fired.add(cue.id); else emitOnce(cue, emit);
      }
    }
    return snapshot();
  }

  function signal(name, emit = NOOP) {
    if (!signalNames.has(name) || typeof emit !== 'function') throw new RangeError('Unknown chapter story signal');
    if (signals.has(name) || minimumRouteTime[name] > elapsed + .05 ||
        (name === 'c9-departure' && !signals.has('c9-arrival')) ||
        (['atlas-phase-two', 'atlas-disabled'].includes(name) && !signals.has('atlas-entry'))) return false;
    signals.add(name);
    if (name === 'atlas-disabled') {
      aftermathElapsed = 0;
      emitOnce(CHRONOS_CHAPTER_AFTERMATH[0], emit);
    } else emitOnce(SIGNAL_DIALOGUES[name], emit);
    return true;
  }

  function skipIntro() {
    if (!openingEnabled || elapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) return false;
    introSeen = true; introSkipped = true; openingEnabled = false;
    for (const cue of CHRONOS_CHAPTER_OPENING) fired.add(cue.id);
    return true;
  }

  function checkpointRecord() {
    return freeze({version: 1, contentVersion: CHRONOS_CHAPTER_VERSION, routeId: ROUTE_ID,
      routeElapsed: elapsed, aftermathElapsed, introSeen, introSkipped,
      eventIds: freeze([...fired]), signalIds: freeze([...signals])});
  }
  return freeze({advance, signal, skipIntro, snapshot, checkpoint: checkpointRecord});
}
