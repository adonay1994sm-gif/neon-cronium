/** Música por momento del juego (propietario, 02/11/2026: synthwave elegida en
 * la sala de escucha). Una pista en bucle para cada momento y un fundido
 * cruzado al cambiar. Las pistas son CC0 (art-source/audio/musica-v1/PROVENANCE.md).
 * El juego decide el momento en cada fotograma; aquí no hay temporizadores ni
 * RAF: el fundido lo hace el AudioContext y la pista vieja se para en la
 * siguiente llamada después de terminar el fundido. */
export const MOOD_MUSIC_TRACKS = Object.freeze({
  menu: 'assets/music_menu_v1.m4a',
  vuelo: 'assets/music_vuelo_v1.m4a',
  subjefe: 'assets/music_subjefe_v1.m4a',
  jefe: 'assets/music_jefe_v1.m4a'
});
export const MOOD_MUSIC_FADE = 1.2;

export function createMoodMusic({context, output, createAudio = () => new Audio()} = {}) {
  if (!context?.createMediaElementSource || !context?.createGain || !output) return null;
  const deck = () => {
    const audio = createAudio(); audio.preload = 'auto'; audio.loop = true;
    const gain = context.createGain(); gain.gain.value = 0; gain.connect(output);
    const source = context.createMediaElementSource(audio); source.connect(gain);
    return {audio, gain, source, stopAt: Infinity};
  };
  const decks = [deck(), deck()];
  let current = null, mood = null;
  const fade = (item, value) => {
    item.gain.gain.cancelScheduledValues?.(context.currentTime);
    item.gain.gain.setTargetAtTime(value, context.currentTime, MOOD_MUSIC_FADE / 3);
  };
  const play = item => { if (item.audio.paused) Promise.resolve(item.audio.play()).catch(() => {}); };
  const pauseAll = () => { for (const item of decks) item.audio.pause(); };

  return Object.freeze({
    update({mood: next = null, paused = false, enabled = true} = {}) {
      if (next !== null && !Object.hasOwn(MOOD_MUSIC_TRACKS, next)) throw new RangeError(`Unknown music mood ${next}`);
      if (!enabled || paused || next === null) { pauseAll(); if (next === null) mood = null; return; }
      if (next !== mood || !current) {
        const old = current;
        current = decks.find(item => item !== old);
        const src = MOOD_MUSIC_TRACKS[next];
        if (current.audio.src !== src) current.audio.src = src;
        current.audio.loop = true; current.audio.currentTime = 0; current.stopAt = Infinity;
        fade(current, 1);
        if (old) { fade(old, 0); old.stopAt = context.currentTime + MOOD_MUSIC_FADE; }
        mood = next;
      }
      play(current);
      for (const item of decks) if (item !== current && context.currentTime >= item.stopAt) { item.audio.pause(); item.stopAt = Infinity; }
    },
    /** Llamar dentro de un toque del jugador: Safari (iPhone) solo deja sonar
     * un elemento de audio si su primer play() llega con un gesto. Arranca y
     * para en silencio el reproductor que no suena, para que el fundido
     * posterior no quede bloqueado. */
    unlock() {
      for (const item of decks) {
        if (item === current || !item.audio.paused) continue;
        if (!item.audio.src) item.audio.src = MOOD_MUSIC_TRACKS.menu;
        Promise.resolve(item.audio.play()).then(() => { if (item !== current) item.audio.pause(); }).catch(() => {});
      }
    },
    suspend: pauseAll,
    snapshot: () => Object.freeze({mood, playing: decks.filter(item => !item.audio.paused).length})
  });
}
