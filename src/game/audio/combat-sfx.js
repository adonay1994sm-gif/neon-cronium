/** Original rendered combat foley on the existing Web Audio graph.
 *
 * No AudioContext, RAF, timer, auto-play or permanent oscillator is created.
 * The current game event owner calls play once; policy suppresses duplicates,
 * prioritises damage and heavy machinery, and immediately stops paused audio.
 */
export const COMBAT_SFX_VERSION = 2;
export const COMBAT_SFX_SRC = 'assets/combat_sfx_atlas_v2.m4a';
export const COMBAT_SFX_DURATION = 15.96;
export const COMBAT_SFX_VOICE_LIMIT = 8;
export const COMBAT_SFX_GAIN_BUDGET = .95;

const cue = (offsets, duration, gain, priority, cooldown, polyphony) => Object.freeze({
  variants: Object.freeze(offsets.map(offset => Object.freeze({offset, duration}))),
  gain, priority, cooldown, polyphony
});

// Exact seconds in the 48 kHz authoring master; 120 ms silent inter-cue guards.
// assets/combat_sfx_atlas_v2.json is the traceable authoring/inventory equivalent.
// Existing v1 performances retain their offsets; new weapon emissions are not
// impacts and must be played by the real projectile/volley event owner.
export const COMBAT_SFX_CUES = Object.freeze({
  'phaser': cue([0, .32], .20, .15, 1, .045, 3),
  'missile-launch': cue([.64, 1.34], .58, .31, 5, .25, 2),
  'impact-metal': cue([2.04, 2.60], .44, .23, 3, .04, 3),
  'impact-plasma': cue([3.16, 3.68], .40, .23, 3, .04, 3),
  'hull-hit': cue([4.20, 4.90], .58, .29, 6, .12, 2),
  'enemy-break': cue([5.60, 6.67], .95, .31, 5, .10, 2),
  'atlas-charge': cue([7.74, 8.74], .88, .28, 7, .30, 1),
  'atlas-collapse': cue([9.74, 11.71], 1.85, .40, 9, 1, 1),
  'enemy-phaser': cue([13.68, 14.08], .28, .19, 2, .055, 3),
  'enemy-heavy': cue([14.48, 15.22], .62, .28, 5, .16, 2)
});

// El banco de interfaz (ui-sfx.js) reutiliza este reproductor con su propio atlas.
const COMBAT_BANK = Object.freeze({version: COMBAT_SFX_VERSION, src: COMBAT_SFX_SRC, duration: COMBAT_SFX_DURATION,
  cues: COMBAT_SFX_CUES, voiceLimit: COMBAT_SFX_VOICE_LIMIT, gainBudget: COMBAT_SFX_GAIN_BUDGET});

const disconnect = node => { try { node?.disconnect(); } catch { /* ended node */ } };
const clamp = (value, low, high) => Math.max(low, Math.min(high, Number(value) || 0));

export function createCombatSfx({context, output, fetchAsset = (...args) => fetch(...args), bank = COMBAT_BANK} = {}) {
  if (!context?.createBufferSource || !context?.decodeAudioData || !context?.createGain || !output) return null;
  const bus = context.createGain();
  bus.gain.value = 1; bus.connect(output);
  const active = new Set(), lastPlayed = new Map(), variants = new Map(), recentIds = new Set(), playedByCue = new Map();
  let buffer = null, loading = null, disposed = false, paused = true, enabled = true;
  let generation = 0, volume = 1, played = 0, dropped = 0, stolen = 0, failed = false;

  function release(record) {
    if (!active.delete(record)) return;
    record.source.onended = null;
    disconnect(record.source); disconnect(record.gain); disconnect(record.pan);
  }

  function stop(record) {
    // onended may be delayed until the audio rendering thread next runs.
    try { record.source.stop(context.currentTime); } catch { /* already ended */ }
    release(record);
  }

  function stopAll() { for (const record of [...active]) stop(record); }

  function prune() {
    for (const record of [...active]) if (record.end <= context.currentTime) release(record);
  }

  function remember(id) {
    if (id === null) return;
    recentIds.add(id);
    while (recentIds.size > 256) recentIds.delete(recentIds.values().next().value);
  }

  function load() {
    if (disposed) return Promise.resolve(false);
    if (buffer) return Promise.resolve(true);
    if (loading) return loading;
    const attempt = ++generation;
    failed = false;
    loading = (async () => {
      // Also defer synchronous fetch mocks/errors: loading must be assigned
      // before its own cleanup, and a failed explicit retry must remain usable.
      await Promise.resolve();
      try {
        if (disposed || generation !== attempt) return false;
        const response = await fetchAsset(bank.src);
        if (!response?.ok) throw new Error('combat-sfx asset unavailable');
        const bytes = await response.arrayBuffer();
        if (disposed || generation !== attempt) return false;
        if (!(bytes instanceof ArrayBuffer) || bytes.byteLength === 0 || bytes.byteLength > 4 * 1024 * 1024) {
          throw new Error('combat-sfx asset size invalid');
        }
        const decoded = await context.decodeAudioData(bytes);
        if (disposed || generation !== attempt) return false;
        // Allow encoder padding, but never accept the old bank: otherwise an
        // offline mismatch would silently cut off the appended enemy weapons.
        if (!Number.isFinite(decoded?.duration) || decoded.duration < bank.duration - .12 ||
            decoded.duration > bank.duration + .40) {
          throw new Error('combat-sfx atlas duration invalid');
        }
        buffer = decoded; failed = false;
        return true;
      } catch {
        if (!disposed && generation === attempt) failed = true;
        return false;
      } finally {
        if (generation === attempt) loading = null;
      }
    })();
    return loading;
  }

  function play(name, {eventId = null, pan = 0} = {}) {
    if (disposed || !enabled || paused || volume <= 0 || !buffer || context.state !== 'running') return false;
    if (!Object.prototype.hasOwnProperty.call(bank.cues, name)) return false;
    const definition = bank.cues[name];
    if (!definition) return false;
    const id = typeof eventId === 'string' && eventId.length > 0 && eventId.length <= 160
      ? eventId : Number.isSafeInteger(eventId) && eventId >= 0 ? String(eventId) : null;
    if (id !== null && recentIds.has(id)) { dropped++; return false; }
    const now = context.currentTime;
    if (now - (lastPlayed.get(name) ?? -Infinity) < definition.cooldown) { remember(id); dropped++; return false; }
    prune();
    const matching = [...active].filter(record => record.name === name);
    if (matching.length >= definition.polyphony) { remember(id); dropped++; return false; }
    const weight = () => [...active].reduce((sum, record) => sum + record.level, 0);
    // Only higher-priority events can replace a playing burst. The entire
    // master peak is .70 (AAC overshoot measured separately); summed voice
    // gain stays below .95, retaining headroom for the existing music bus.
    while (active.size >= bank.voiceLimit || weight() + definition.gain > bank.gainBudget) {
      const candidate = [...active].filter(record => record.priority < definition.priority)
        .sort((a, b) => a.priority - b.priority || a.end - b.end)[0];
      if (!candidate) { remember(id); dropped++; return false; }
      stop(candidate); stolen++;
    }
    const index = variants.get(name) || 0;
    const segment = definition.variants[index % definition.variants.length];
    let source, gain, spatial = null, record;
    try {
      source = context.createBufferSource(); gain = context.createGain();
      source.buffer = buffer; gain.gain.setValueAtTime(definition.gain, now);
      source.connect(gain);
      if (context.createStereoPanner) {
        spatial = context.createStereoPanner(); spatial.pan.setValueAtTime(clamp(pan, -.75, .75), now);
        gain.connect(spatial); spatial.connect(bus);
      } else gain.connect(bus);
      record = {source, gain, pan: spatial, name, priority: definition.priority, level: definition.gain,
        end: now + segment.duration};
      active.add(record); source.onended = () => release(record);
      source.start(now, segment.offset, segment.duration);
    } catch {
      if (record) stop(record);
      else { disconnect(source); disconnect(gain); disconnect(spatial); }
      dropped++; return false;
    }
    variants.set(name, index + 1); lastPlayed.set(name, now); remember(id); played++;
    playedByCue.set(name, (playedByCue.get(name) || 0) + 1);
    return true;
  }

  return Object.freeze({
    load, play,
    setEnabled(value) { if (disposed) return; enabled = value === true; if (!enabled) stopAll(); },
    setPaused(value) { if (disposed) return; paused = value === true; if (paused) stopAll(); },
    setVolume(value) {
      if (disposed) return;
      volume = clamp(value, 0, 1);
      bus.gain.setTargetAtTime(volume, context.currentTime, .02);
      if (volume === 0) stopAll();
    },
    snapshot: () => Object.freeze({version: bank.version, ready: Boolean(buffer), loading: Boolean(loading),
      failed, disposed, paused, enabled, volume, activeVoices: active.size,
      activeGain: [...active].reduce((sum, record) => sum + record.level, 0),
      played, playedByCue: Object.freeze(Object.fromEntries(playedByCue)), dropped, stolen,
      decodedBytes: buffer ? buffer.length * buffer.numberOfChannels * 4 : 0}),
    dispose() {
      if (disposed) return;
      disposed = true; generation++; loading = null; stopAll(); buffer = null;
      lastPlayed.clear(); variants.clear(); recentIds.clear(); playedByCue.clear(); disconnect(bus);
    }
  });
}
