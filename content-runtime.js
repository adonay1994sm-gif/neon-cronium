var NeonCampaign = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/game/progression/legacy-content-entry.js
  var legacy_content_entry_exports = {};
  __export(legacy_content_entry_exports, {
    AIMED_METEOR_RULES: () => AIMED_METEOR_RULES,
    CH03_RULES: () => CH03_RULES,
    CHRONOS_CHAPTER_ROUTE_SECONDS: () => CHRONOS_CHAPTER_ROUTE_SECONDS,
    CHRONOS_INTRO_TIMELINE: () => CHRONOS_INTRO_TIMELINE,
    CHRONOS_VOYAGE_KEY: () => CHRONOS_VOYAGE_KEY,
    CHRONOS_VOYAGE_STAGES: () => CHRONOS_VOYAGE_STAGES,
    CLASSIC_PURSUIT_VERSION: () => CLASSIC_PURSUIT_VERSION,
    CLASSIC_WEAPON_RULES: () => CLASSIC_WEAPON_RULES,
    DIFFICULTY_MODES: () => DIFFICULTY_MODES,
    ENEMY_AI_PROFILES: () => ENEMY_AI_PROFILES,
    GAIA_ENEMY_RULES: () => GAIA_ENEMY_RULES,
    GUARDIAN_ATLAS_RULES: () => GUARDIAN_ATLAS_RULES,
    HORDE_RULES: () => HORDE_RULES,
    MENU_UNLOCKS_KEY: () => MENU_UNLOCKS_KEY,
    PLAYABLE_VOYAGES: () => PLAYABLE_VOYAGES,
    SCRAP_CONSUMABLES: () => SCRAP_CONSUMABLES,
    SCRAP_ECONOMY_KEY: () => SCRAP_ECONOMY_KEY,
    SCRAP_UPGRADES: () => SCRAP_UPGRADES,
    SECTORS: () => SECTORS,
    SECTOR_MAPS: () => SECTOR_MAPS,
    SECTOR_SAVE_KEY: () => SECTOR_SAVE_KEY,
    SHIP_FLEET: () => SHIP_FLEET,
    SHIP_FLEET_SAVE_KEY: () => SHIP_FLEET_SAVE_KEY,
    SHIP_ROSTER: () => SHIP_ROSTER,
    SHIP_ROSTER_KEY: () => SHIP_ROSTER_KEY,
    VOYAGES: () => VOYAGES,
    advanceAimedMeteorRain: () => advanceAimedMeteorRain,
    advanceCh03Satellite: () => advanceCh03Satellite,
    advanceClassicPursuer: () => advanceClassicPursuer,
    advanceClassicScout: () => advanceClassicScout,
    advanceClassicWeapons: () => advanceClassicWeapons,
    advanceCometShower: () => advanceCometShower,
    advanceCrossBomb: () => advanceCrossBomb,
    advanceGaiaEnemy: () => advanceGaiaEnemy,
    advanceGuardianAtlas: () => advanceGuardianAtlas,
    advanceMine: () => advanceMine,
    advanceShipBank: () => advanceShipBank,
    advanceShowerComet: () => advanceShowerComet,
    advanceVoyageHazardField: () => advanceVoyageHazardField,
    attackHolders: () => attackHolders,
    awardClassicBossWeapon: () => awardClassicBossWeapon,
    baseConversation: () => baseConversation,
    beginFlightInput: () => beginFlightInput,
    buyBeacon: () => buyBeacon,
    buyShipWithScrap: () => buyShipWithScrap,
    calculateFlightBounds: () => calculateFlightBounds,
    canTriggerClassicMissile: () => canTriggerClassicMissile,
    ch03HitsShip: () => ch03HitsShip,
    chooseShip: () => chooseShip,
    classicWeaponSnapshot: () => classicWeaponSnapshot,
    classicWorkshopState: () => classicWorkshopState,
    cometShowerSnapshot: () => cometShowerSnapshot,
    completeSector: () => completeSector,
    continuePoint: () => continuePoint,
    createAimedMeteorRain: () => createAimedMeteorRain,
    createAttackTokens: () => createAttackTokens,
    createCh01Animator: () => createCh01Animator,
    createCh02Animator: () => createCh02Animator,
    createCh03Satellite: () => createCh03Satellite,
    createChapterScore: () => createChapterScore,
    createChronosChapterStory: () => createChronosChapterStory,
    createChronosVoyage: () => createChronosVoyage,
    createChronosVoyageCheckpoint: () => createChronosVoyageCheckpoint,
    createClassicPursuer: () => createClassicPursuer,
    createClassicScout: () => createClassicScout,
    createClassicWeapons: () => createClassicWeapons,
    createCombatSfx: () => createCombatSfx,
    createCometShower: () => createCometShower,
    createCompletionJournal: () => createCompletionJournal,
    createFlightTutorial: () => createFlightTutorial,
    createGaiaEnemy: () => createGaiaEnemy,
    createGuardianAtlas: () => createGuardianAtlas,
    createHordeWave: () => createHordeWave,
    createRelativeFlightInput: () => createRelativeFlightInput,
    createScrapLedger: () => createScrapLedger,
    createSectorSave: () => createSectorSave,
    createVoyageHazardField: () => createVoyageHazardField,
    createVoyageRoute: () => createVoyageRoute,
    createVoyageScore: () => createVoyageScore,
    decideEnemyIntent: () => decideEnemyIntent,
    decideEnemyIntents: () => decideEnemyIntents,
    dieInSector: () => dieInSector,
    endFlightInput: () => endFlightInput,
    enterStage: () => enterStage,
    forgetEnemy: () => forgetEnemy,
    formatDenominations: () => formatDenominations,
    getChronosDestructionPose: () => getChronosDestructionPose,
    getChronosIntroPose: () => getChronosIntroPose,
    getSectorFicha: () => getSectorFicha,
    getVoyageFicha: () => getVoyageFicha,
    getVoyageStageRules: () => getVoyageStageRules,
    getVoyageStageRulesFor: () => getVoyageStageRulesFor,
    getVoyageTransitionPresentation: () => getVoyageTransitionPresentation,
    guardianAtlasAnimation: () => guardianAtlasAnimation,
    hitCh03Satellite: () => hitCh03Satellite,
    hitClassicProjectile: () => hitClassicProjectile,
    hitGuardianAtlas: () => hitGuardianAtlas,
    markMenuSeen: () => markMenuSeen,
    menuView: () => menuView,
    moveFlightInput: () => moveFlightInput,
    normalizeChronosChapterCheckpoint: () => normalizeChronosChapterCheckpoint,
    normalizeChronosVoyageCheckpoint: () => normalizeChronosVoyageCheckpoint,
    normalizeClassicEquipment: () => normalizeClassicEquipment,
    normalizeDifficulty: () => normalizeDifficulty,
    normalizeMenuUnlocks: () => normalizeMenuUnlocks,
    normalizeSectorSave: () => normalizeSectorSave,
    normalizeShipLoadout: () => normalizeShipLoadout,
    normalizeShipSave: () => normalizeShipSave,
    ownedShips: () => ownedShips,
    prepareClassicTwin: () => prepareClassicTwin,
    releaseAttack: () => releaseAttack,
    releaseCometShowerItem: () => releaseCometShowerItem,
    requestAttack: () => requestAttack,
    resolveHullReinforcement: () => resolveHullReinforcement,
    rewardForEnemy: () => rewardForEnemy,
    sectorMapState: () => sectorMapState,
    sectorPlanetPose: () => sectorPlanetPose,
    selectClassicWeapon: () => selectClassicWeapon,
    setClassicRechargeInterval: () => setClassicRechargeInterval,
    setClassicUnlimitedFire: () => setClassicUnlimitedFire,
    setClassicWeaponTuning: () => setClassicWeaponTuning,
    shipAssemblyPose: () => shipAssemblyPose,
    shipNozzleAnchors: () => shipNozzleAnchors,
    shipPartFrame: () => shipPartFrame,
    startSectorRun: () => startSectorRun,
    syncClassicWorkshopWeapons: () => syncClassicWorkshopWeapons,
    triggerClassicMissile: () => triggerClassicMissile,
    triggerClassicWeapon: () => triggerClassicWeapon,
    unlockClassicWeapon: () => unlockClassicWeapon,
    useRevive: () => useRevive
  });

  // src/game/narrative/flight-tutorial.js
  var FLIGHT_TUTORIAL_VERSION = "flight-tutorial-v2";
  var FLIGHT_TUTORIAL_CUES = Object.freeze([
    Object.freeze({
      id: `${FLIGHT_TUTORIAL_VERSION}:pilot`,
      at: 1,
      until: 100,
      seconds: 4,
      text: "Desliza el pulgar izquierdo para maniobrar.",
      target: 56
    }),
    Object.freeze({
      id: `${FLIGHT_TUTORIAL_VERSION}:fire`,
      at: 27,
      until: 140,
      seconds: 4,
      text: "Sin soltar el pilotaje, mant\xE9n DISPARAR con el otro pulgar.",
      target: 1
    }),
    Object.freeze({
      id: `${FLIGHT_TUTORIAL_VERSION}:recovery`,
      at: 40,
      until: 170,
      seconds: 4,
      text: "Ac\xE9rcate al CRONIUM brillante para recuperar su energ\xEDa.",
      target: 1
    }),
    Object.freeze({
      id: `${FLIGHT_TUTORIAL_VERSION}:missile`,
      at: 80,
      until: 320,
      seconds: 4,
      text: "MISIL da\xF1a m\xE1s. Res\xE9rvalo para una buena oportunidad; tienes tres.",
      target: 1,
      optional: true
    }),
    Object.freeze({
      id: `${FLIGHT_TUTORIAL_VERSION}:workshop`,
      at: 65,
      until: 332,
      seconds: 4,
      text: "Pieza recuperada. Abre C9 para ver las mejoras de tu nave.",
      target: 1
    })
  ]);
  var NOOP = () => {
  };
  var validTime = (value) => Number.isFinite(value) && value >= 0;
  var validCount = (value) => Number.isSafeInteger(value) && value >= 0;
  var names = ["pilot", "fire", "recovery", "missile", "workshop"];
  var cueById = new Map(FLIGHT_TUTORIAL_CUES.map((cue2) => [cue2.id, cue2]));
  var cueFor = (name) => FLIGHT_TUTORIAL_CUES[names.indexOf(name)];
  var listIsValid = (value) => Array.isArray(value) && new Set(value).size === value.length && value.every((id) => cueById.has(id));
  var clamp = (value) => Math.max(0, Math.min(1, value));
  function restoreCheckpoint(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 2 || value.contentVersion !== FLIGHT_TUTORIAL_VERSION || !listIsValid(value.completed) || !listIsValid(value.skipped) || !listIsValid(value.emitted) || value.completed.some((id) => value.skipped.includes(id))) {
      return null;
    }
    return value;
  }
  function createFlightTutorial({
    routeElapsed = 0,
    checkpoint = null,
    replay = false,
    enabled = true
  } = {}) {
    if (!validTime(routeElapsed) || typeof replay !== "boolean" || typeof enabled !== "boolean") {
      throw new RangeError("Valid tutorial route time and options required");
    }
    const restored = checkpoint === null ? null : restoreCheckpoint(checkpoint);
    let elapsed = routeElapsed, suspended = false;
    const completed = new Set(replay ? [] : restored?.completed || []);
    const skipped = new Set(replay ? [] : restored?.skipped || []);
    const emitted = new Set(replay ? [] : restored?.emitted || []);
    const stats = {
      pilotDistance: 0,
      shots: 0,
      collected: 0,
      missilesFired: 0,
      workshopOpened: false,
      moduleRecovered: false
    };
    let context = {
      playing: true,
      channelBusy: false,
      bossActive: false,
      missileReady: false,
      missileOpportunity: false
    };
    const offset = replay ? routeElapsed : 0;
    if (routeElapsed > 0 && !restored && !replay) {
      for (const cue2 of FLIGHT_TUTORIAL_CUES) if (cue2.at <= routeElapsed) skipped.add(cue2.id);
    }
    const done = (cue2) => completed.has(cue2.id) || skipped.has(cue2.id);
    function reconcile() {
      const successes = [
        stats.pilotDistance >= cueFor("pilot").target,
        stats.shots > 0,
        stats.collected > 0,
        stats.missilesFired > 0,
        stats.workshopOpened
      ];
      for (let index = 0; index < successes.length; index++) {
        const cue2 = FLIGHT_TUTORIAL_CUES[index];
        if (successes[index] && !done(cue2)) completed.add(cue2.id);
      }
    }
    function progress(cue2) {
      if (completed.has(cue2.id)) return 1;
      if (cue2 === cueFor("pilot")) return clamp(stats.pilotDistance / cue2.target);
      return 0;
    }
    function currentCue() {
      if (!enabled || !context.playing || context.bossActive) return null;
      for (const cue2 of FLIGHT_TUTORIAL_CUES) {
        if (done(cue2)) continue;
        if (cue2.optional && !(context.missileReady && context.missileOpportunity)) continue;
        if (cue2.optional && stats.moduleRecovered && !stats.workshopOpened) continue;
        if (cue2 === cueFor("workshop") && !stats.moduleRecovered) return null;
        if (elapsed < cue2.at + offset) return null;
        return cue2;
      }
      return null;
    }
    function checkpointView() {
      return Object.freeze({
        version: 2,
        contentVersion: FLIGHT_TUTORIAL_VERSION,
        completed: Object.freeze([...completed]),
        skipped: Object.freeze([...skipped]),
        emitted: Object.freeze([...emitted])
      });
    }
    function snapshot() {
      const cue2 = currentCue();
      return Object.freeze({
        version: FLIGHT_TUTORIAL_VERSION,
        elapsed,
        enabled,
        emitted: Object.freeze([...emitted]),
        completed: Object.freeze([...completed]),
        skipped: Object.freeze([...skipped]),
        pending: Object.freeze(FLIGHT_TUTORIAL_CUES.filter((item) => !done(item)).map((item) => item.id)),
        active: cue2 ? Object.freeze({ ...cue2, progress: progress(cue2) }) : null,
        complete: FLIGHT_TUTORIAL_CUES.filter((item) => !item.optional).every((item) => completed.has(item.id)),
        finished: FLIGHT_TUTORIAL_CUES.every(done)
      });
    }
    function observe(action = {}) {
      if (!action || typeof action !== "object" || ![
        "pilot",
        "fire",
        "recovery",
        "missile",
        "module",
        "workshop"
      ].includes(action.type) || action.type === "pilot" && !validTime(action.distance)) {
        throw new TypeError("Valid successful tutorial action required");
      }
      if (!enabled || suspended || !context.playing || context.bossActive) return snapshot();
      if (action.type === "pilot") stats.pilotDistance += action.distance;
      if (action.type === "fire") stats.shots++;
      if (action.type === "recovery") stats.collected++;
      if (action.type === "missile") stats.missilesFired++;
      if (action.type === "module") stats.moduleRecovered = true;
      if (action.type === "workshop") stats.workshopOpened = true;
      reconcile();
      return snapshot();
    }
    function advance({
      elapsed: next,
      playing = true,
      shots = 0,
      collected = 0,
      workshopOpened = false,
      channelBusy = false,
      pilotDistance = 0,
      missilesFired = 0,
      moduleRecovered = false,
      missileReady = false,
      missileOpportunity = false,
      bossActive = false
    } = {}, emit = NOOP) {
      if (!validTime(next) || !validTime(pilotDistance) || !validCount(shots) || !validCount(collected) || !validCount(missilesFired) || [
        playing,
        workshopOpened,
        channelBusy,
        moduleRecovered,
        missileReady,
        missileOpportunity,
        bossActive
      ].some((value) => typeof value !== "boolean") || typeof emit !== "function") {
        throw new TypeError("Valid tutorial route view and event callback required");
      }
      if (!playing) {
        suspended = true;
        return [];
      }
      if (next < elapsed) throw new RangeError("Create a new tutorial when restoring an earlier route checkpoint");
      suspended = false;
      context = { playing, channelBusy, bossActive, missileReady, missileOpportunity };
      if (!enabled || next === elapsed) return [];
      elapsed = next;
      stats.pilotDistance = Math.max(stats.pilotDistance, pilotDistance);
      stats.shots = Math.max(stats.shots, shots);
      stats.collected = Math.max(stats.collected, collected);
      stats.missilesFired = Math.max(stats.missilesFired, missilesFired);
      stats.workshopOpened ||= workshopOpened;
      stats.moduleRecovered ||= moduleRecovered;
      reconcile();
      for (const cue3 of FLIGHT_TUTORIAL_CUES) {
        if (!done(cue3) && elapsed >= cue3.until + offset) skipped.add(cue3.id);
      }
      const cue2 = currentCue();
      if (!cue2 || context.channelBusy || emitted.has(cue2.id)) return [];
      const event2 = Object.freeze({
        type: "tutorial",
        ...cue2,
        routeElapsed: elapsed,
        expiresAt: cue2.until + offset,
        progress: progress(cue2)
      });
      emitted.add(cue2.id);
      emit(event2);
      return [event2];
    }
    return Object.freeze({ advance, observe, snapshot, checkpoint: checkpointView });
  }

  // src/game/audio/voyage-score.js
  var VOYAGE_SCORE_VERSION = "chronos-score-v1";
  var SCORE_VOICE_LIMIT = 12;
  var note = (beat, midi, length, voice = "glass", level = 0.095) => Object.freeze({ beat, midi, length, voice, level });
  var phrase = (bpm, beats, notes) => Object.freeze({
    bpm,
    beats,
    notes: Object.freeze([...notes].sort((a, b) => a.beat - b.beat))
  });
  var transit = phrase(84, 32, [
    ...[38, 34, 41, 36].flatMap((root, bar) => [
      note(bar * 8, root, 3.5, "hull", 0.13),
      note(bar * 8 + 4, root + 12, 2.8, "hull", 0.075)
    ]),
    note(0, 62, 2.6, "air", 0.055),
    note(0, 69, 2.6, "air", 0.045),
    note(8, 65, 2.6, "air", 0.055),
    note(8, 69, 2.6, "air", 0.045),
    note(16, 65, 2.6, "air", 0.055),
    note(16, 72, 2.6, "air", 0.045),
    note(24, 64, 2.6, "air", 0.055),
    note(24, 67, 2.6, "air", 0.045),
    ...[
      [1.5, 74],
      [3, 69],
      [5.5, 77],
      [7, 76],
      [10, 74],
      [13, 69],
      [17.5, 77],
      [19, 79],
      [21.5, 81],
      [23, 77],
      [26, 76],
      [29, 74]
    ].map(([beat, midi]) => note(beat, midi, 0.85))
  ]);
  var atlas = phrase(120, 16, [
    ...[0, 2, 4, 6, 8, 10, 12, 14].map((beat, index) => note(beat, [38, 38, 41, 39, 38, 45, 39, 45][index], 0.65, "hull", 0.14)),
    ...[0, 1.5, 3, 4, 5.5, 7, 8, 9.5, 11, 12, 13.5, 15].map((beat, index) => note(beat, [62, 69, 65, 63, 69, 65, 62, 72, 69, 63, 69, 74][index], 0.34, "pulse", 0.075)),
    note(2.5, 74, 1, "glass", 0.085),
    note(6.5, 75, 1, "glass", 0.085),
    note(10.5, 77, 1, "glass", 0.085),
    note(14.5, 76, 0.8, "glass", 0.085)
  ]);
  var station = phrase(76, 16, [
    note(0, 41, 3.5, "hull", 0.1),
    note(4, 48, 2.5, "hull", 0.075),
    note(8, 46, 3.5, "hull", 0.1),
    note(12, 48, 2.5, "hull", 0.075),
    ...[[0, 65], [0, 69], [8, 62], [8, 69]].map(([beat, midi]) => note(beat, midi, 2.5, "air", 0.045)),
    ...[[1, 72], [3, 69], [5, 67], [7, 65], [9, 69], [11, 72], [14, 74]].map(([beat, midi]) => note(beat, midi, 1.1, "glass", 0.07))
  ]);
  var arrival = phrase(92, 16, [
    note(0, 38, 3.5, "hull", 0.11),
    note(4, 41, 3.5, "hull", 0.11),
    note(8, 36, 3.5, "hull", 0.1),
    note(12, 38, 3.5, "hull", 0.11),
    ...[[0, 62], [0, 69], [4, 65], [4, 72], [8, 64], [8, 67], [12, 66], [12, 69]].map(([beat, midi]) => note(beat, midi, 2.8, "air", 0.045)),
    ...[[0.5, 74], [2, 77], [4.5, 79], [6, 81], [8.5, 79], [10, 76], [12.5, 78], [14, 81]].map(([beat, midi]) => note(beat, midi, 1.15, "glass", 0.09))
  ]);
  var VOYAGE_SCORE_PHRASES = Object.freeze({ transit, atlas, station, arrival });
  var safeDisconnect = (node) => {
    try {
      node.disconnect();
    } catch {
    }
  };
  function createVoyageScore({ context, output }) {
    if (!context || !output) throw new TypeError("A shared AudioContext and music output are required");
    const active = /* @__PURE__ */ new Set();
    let selected = "transit", beat = 0, cursor = 0, cycles = 0;
    let enabled = true, paused = false, disposed = false, totalVoices = 0;
    function release(record) {
      if (!active.delete(record)) return;
      safeDisconnect(record.oscillator);
      safeDisconnect(record.gain);
      safeDisconnect(record.filter);
    }
    function stopVoices() {
      for (const record of [...active]) {
        try {
          record.oscillator.stop(context.currentTime);
        } catch {
        }
        release(record);
      }
    }
    function play(event2, delay) {
      if (active.size >= SCORE_VOICE_LIMIT) return;
      const now = context.currentTime + Math.max(0, delay);
      const seconds = Math.min(4, Math.max(0.07, event2.length * 60 / VOYAGE_SCORE_PHRASES[selected].bpm));
      const oscillator = context.createOscillator(), gain = context.createGain(), filter = context.createBiquadFilter();
      const hull = event2.voice === "hull", air = event2.voice === "air";
      oscillator.type = hull ? "triangle" : air ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(440 * 2 ** ((event2.midi - 69) / 12), now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(hull ? 360 : air ? 1400 : event2.voice === "pulse" ? 1700 : 3500, now);
      filter.Q.setValueAtTime(0.65, now);
      const attack = Math.min(seconds * 0.25, air ? 0.25 : hull ? 0.035 : 0.012);
      gain.gain.setValueAtTime(1e-4, now);
      gain.gain.linearRampToValueAtTime(event2.level, now + attack);
      gain.gain.exponentialRampToValueAtTime(1e-4, now + seconds);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      const record = { oscillator, gain, filter, end: now + seconds + 0.015 };
      active.add(record);
      totalVoices++;
      oscillator.onended = () => release(record);
      oscillator.start(now);
      oscillator.stop(record.end);
    }
    function advance(seconds) {
      if (disposed || !enabled || paused || context.state !== "running") return;
      const dt = Number.isFinite(seconds) ? Math.max(0, Math.min(0.1, seconds)) : 0;
      if (!dt) return;
      for (const record of [...active]) if (record.end <= context.currentTime) release(record);
      const phrase2 = VOYAGE_SCORE_PHRASES[selected], beatsPerSecond = phrase2.bpm / 60;
      const endBeat = beat + dt * beatsPerSecond;
      while (cursor < phrase2.notes.length && phrase2.notes[cursor].beat <= endBeat) {
        const event2 = phrase2.notes[cursor++];
        play(event2, Math.max(0, event2.beat - beat) / beatsPerSecond);
      }
      beat = endBeat;
      if (beat >= phrase2.beats) {
        beat -= phrase2.beats;
        cursor = 0;
        cycles++;
      }
    }
    return Object.freeze({
      advance,
      setContext(value) {
        if (disposed || !Object.prototype.hasOwnProperty.call(VOYAGE_SCORE_PHRASES, value) || value === selected) return false;
        stopVoices();
        selected = value;
        beat = 0;
        cursor = 0;
        cycles = 0;
        return true;
      },
      setEnabled(value) {
        const next = value === true;
        if (disposed || enabled === next) return;
        enabled = next;
        if (!enabled) stopVoices();
      },
      setPaused(value) {
        const next = value === true;
        if (disposed || paused === next) return;
        paused = next;
        if (paused) stopVoices();
      },
      snapshot: () => Object.freeze({
        version: VOYAGE_SCORE_VERSION,
        context: selected,
        beat,
        cycles,
        activeVoices: active.size,
        totalVoices,
        enabled,
        paused,
        disposed
      }),
      dispose() {
        if (!disposed) {
          stopVoices();
          disposed = true;
        }
      }
    });
  }

  // src/game/audio/chapter-score.js
  function createChapterScore({ context, output, createAudio = () => new Audio() } = {}) {
    if (!context?.createMediaElementSource || !output) return null;
    const audio = createAudio();
    audio.preload = "auto";
    const source = context.createMediaElementSource(audio);
    source.connect(output);
    let selected = null, enabled = true, paused = true, failed = false, pending = false, disposed = false, generation = 0;
    function stop() {
      generation++;
      pending = false;
      audio.pause();
    }
    function play() {
      if (disposed || failed || paused || !enabled || pending || !audio.paused) return;
      pending = true;
      const attempt = ++generation;
      try {
        Promise.resolve(audio.play()).catch((error) => {
          if (attempt === generation && !paused && enabled && !disposed && error?.name !== "AbortError") failed = true;
        }).finally(() => {
          if (attempt === generation) pending = false;
        });
      } catch {
        pending = false;
        failed = true;
      }
    }
    return Object.freeze({
      update({ active, elapsed = 0, paused: nextPaused = false, enabled: nextEnabled = true } = {}) {
        if (disposed) return false;
        enabled = nextEnabled;
        paused = nextPaused || !active;
        if (!active || !enabled || paused) {
          stop();
          return active && !failed;
        }
        const next = elapsed < 28 ? "opening" : "voyage";
        if (next !== selected) {
          stop();
          selected = next;
          failed = false;
          audio.src = `assets/chapter1_${next === "opening" ? "opening" : "voyage"}_score_v1.m4a`;
          audio.loop = next === "voyage";
        }
        if (next === "opening" && Number.isFinite(audio.duration) && Math.abs(audio.currentTime - elapsed) > 0.35)
          audio.currentTime = Math.max(0, Math.min(audio.duration - 0.02, elapsed));
        play();
        return !failed;
      },
      suspend() {
        paused = true;
        stop();
      },
      snapshot: () => Object.freeze({ selected, enabled, paused, failed, pending, disposed }),
      dispose() {
        if (disposed) return;
        disposed = true;
        stop();
        audio.removeAttribute("src");
        audio.load();
        source.disconnect();
      }
    });
  }

  // src/game/narrative/chronos-chapter.js
  var CHRONOS_CHAPTER_VERSION = "chronos-chapter-v1";
  var CHRONOS_CHAPTER_OPENING_SECONDS = 26;
  var CHRONOS_CHAPTER_CINEMATIC_SECONDS = 14;
  var CHRONOS_CHAPTER_AFTERMATH_SECONDS = 8;
  var CHRONOS_CHAPTER_ROUTE_SECONDS = 360;
  var ROUTE_ID = "chronos-to-gaia";
  var NOOP2 = () => {
  };
  var clamp2 = (value, low, high) => Math.max(low, Math.min(high, value));
  var finiteTime = (value) => Number.isFinite(value) && value >= 0;
  var freeze = (value) => Object.freeze(value);
  var CHRONOS_CHAPTER_ACTORS = freeze({
    lira: freeze({
      id: "lira",
      name: "Lira",
      label: "LIRA \xB7 CONTROL CHRONOS",
      role: "Operadora cient\xEDfica; prioriza la evacuaci\xF3n y conservar el registro."
    }),
    mira: freeze({
      id: "mira",
      name: "Mira",
      label: "MIRA \xB7 TALLER C9",
      role: "Mec\xE1nica del corredor; mantiene la ruta abierta y cobra por sus mejoras."
    }),
    atlas: freeze({
      id: "atlas",
      name: "Atlas",
      label: "GUARDIAN ATLAS",
      role: "Defensa aut\xF3noma de Gaia; ejecuta un bloqueo basado en identificaci\xF3n falsificada."
    }),
    iria: freeze({
      id: "iria",
      name: "Iria",
      label: "COMANDANTE IRIA \xB7 GAIA",
      role: "Mando de Gaia; protege la frontera y puede revocar el protocolo al verificar pruebas."
    }),
    n7: freeze({
      id: "n7",
      name: "N-7",
      label: "N-7 \xB7 NAVEGACI\xD3N",
      role: "Asistente de a bordo; interpreta el rastro sin sustituir a los personajes."
    })
  });
  function dialogue(id, speakerId, text, duration, extra = {}) {
    return freeze({
      id: `chapter1:${id}`,
      type: "transmission",
      speakerId,
      speaker: CHRONOS_CHAPTER_ACTORS[speakerId].label,
      text,
      duration,
      ...extra
    });
  }
  var CHRONOS_CHAPTER_OPENING = freeze([
    dialogue(
      "routine",
      "lira",
      "Chronos, turno de guardia. La ruta del CRONIUM est\xE1 estable.",
      3,
      { at: 0, shotIndex: 0, phase: "opening", visualCue: "chronos-routine", audioCue: "chronos-room-tone" }
    ),
    dialogue(
      "convoy-clearance",
      "lira",
      "Convoy C-17: firma aceptada. Abro el escudo del reactor.",
      3.3,
      { at: 3, shotIndex: 1, phase: "opening", visualCue: "convoy-clearance", audioCue: "radio-valid" }
    ),
    dialogue(
      "false-clearance",
      "lira",
      "Esa firma era falsa\u2026 \xA1Algo enorme se posa sobre la torre!",
      2.7,
      { at: 6.3, shotIndex: 2, phase: "opening", visualCue: "sabotage-lock", audioCue: "access-anomaly" }
    ),
    dialogue(
      "evacuate",
      "lira",
      "\xA1Ha perforado el reactor! Todas las naves: evacuaci\xF3n.",
      4.2,
      { at: 9, shotIndex: 3, phase: "opening", visualCue: "reactor-breach", audioCue: "reactor-trip" }
    ),
    dialogue(
      "log-transfer",
      "lira",
      "Te env\xEDo el registro. Las claves del convoy fueron alteradas.",
      6,
      { at: 13.2, shotIndex: 4, phase: "opening", visualCue: "log-transfer", audioCue: "memory-transfer" }
    ),
    dialogue(
      "escape-order",
      "lira",
      "Ll\xE9valo a Gaia. No permitas que recuperen el registro.",
      6.8,
      { at: 19.2, shotIndex: 5, phase: "opening", visualCue: "perimeter-escape", audioCue: "emergency-route" }
    )
  ]);
  var ROUTE_DIALOGUES = freeze([
    dialogue(
      "pursuit-motive",
      "lira",
      "Los asaltantes quieren borrar ese registro. No te detengas.",
      5.2,
      { at: 38, phase: "route", visualCue: "pursuit-contact", audioCue: "radio-distress" }
    ),
    dialogue(
      "wreckage-trail",
      "n7",
      "El CRONIUM marca su trayectoria. Recuperarlo nos llevar\xE1 hasta ellos.",
      5.4,
      { at: 76, phase: "route", visualCue: "cronium-trail", audioCue: "navigation-confirm" }
    ),
    dialogue(
      "chronos-astern",
      "n7",
      "Chronos queda atr\xE1s. Conservo el registro y la ruta hacia Gaia.",
      5,
      { at: 112, phase: "route", visualCue: "chronos-astern", audioCue: "navigation-confirm" }
    ),
    dialogue(
      "c9-contact",
      "mira",
      "Enlace C9 disponible en tu panel. Puedo configurar tu nave sin desviar la ruta.",
      5.2,
      { at: 177, phase: "route", visualCue: "c9-contact", audioCue: "c9-radio" }
    ),
    dialogue(
      "gaia-visible",
      "n7",
      "Gaia Nova al frente. Su red defensiva sigue activa.",
      4.8,
      { at: 256, phase: "route", visualCue: "gaia-reveal", audioCue: "gaia-beacon" }
    ),
    dialogue(
      "atlas-border",
      "atlas",
      "Corredor restringido. Toda carga de CRONIUM debe identificarse.",
      4.5,
      { at: 292, phase: "route", visualCue: "atlas-identification", audioCue: "atlas-hail" }
    ),
    dialogue(
      "forged-identity",
      "n7",
      "Han copiado nuestra firma. Atlas cree que atacamos Chronos.",
      5,
      { at: 332, phase: "route", visualCue: "forged-identity", audioCue: "identity-mismatch" }
    )
  ]);
  var SIGNAL_DIALOGUES = freeze({
    "module-recovered": dialogue(
      "module-recovered",
      "mira",
      "Emisor a bordo. Abre C9 en tu panel y preparar\xE9 sus anclajes.",
      5.2,
      { phase: "event", visualCue: "recovered-emitter", audioCue: "salvage-identified" }
    ),
    "c9-arrival": dialogue(
      "c9-arrival",
      "mira",
      "Enlace estable. Reparaci\xF3n de emergencia completada; mejoras disponibles en C9.",
      5.2,
      { phase: "event", visualCue: "c9-docking", audioCue: "c9-dock" }
    ),
    "c9-departure": dialogue(
      "c9-departure",
      "mira",
      "Sigue las balizas hasta Gaia. Que ese registro llegue entero.",
      4.8,
      { phase: "event", visualCue: "c9-departure", audioCue: "c9-release" }
    ),
    "atlas-entry": dialogue(
      "atlas-entry",
      "atlas",
      "Tu firma coincide con el convoy atacante. Entrega el CRONIUM.",
      5,
      { phase: "event", visualCue: "atlas-blockade", audioCue: "atlas-challenge" }
    ),
    "atlas-phase-two": dialogue(
      "atlas-phase-two",
      "atlas",
      "Registro contradictorio. Manteniendo el bloqueo de frontera.",
      3.8,
      { phase: "event", visualCue: "atlas-reassessment", audioCue: "atlas-phase" }
    )
  });
  var CHRONOS_CHAPTER_AFTERMATH = freeze([
    dialogue(
      "atlas-log-verified",
      "atlas",
      "Registro verificado. Suspendiendo el bloqueo.",
      2,
      { at: 0, phase: "aftermath", visualCue: "atlas-disengage", audioCue: "atlas-release" }
    ),
    dialogue(
      "iria-identification",
      "iria",
      "Comandante Iria. Usaron tu se\xF1al para atacar Chronos.",
      3,
      { at: 2, phase: "aftermath", visualCue: "iria-contact", audioCue: "gaia-command" }
    ),
    dialogue(
      "vulkar-lead",
      "iria",
      "El convoy vino de Vulkar. Tienes paso libre.",
      3,
      { at: 5, phase: "aftermath", visualCue: "vulkar-route", audioCue: "route-authorized" }
    )
  ]);
  var CHRONOS_CHAPTER_DIALOGUES = freeze([
    ...CHRONOS_CHAPTER_OPENING,
    ...ROUTE_DIALOGUES,
    ...Object.values(SIGNAL_DIALOGUES),
    ...CHRONOS_CHAPTER_AFTERMATH
  ]);
  var TIMED_DIALOGUES = [...CHRONOS_CHAPTER_OPENING, ...ROUTE_DIALOGUES];
  var dialogueById = new Map(CHRONOS_CHAPTER_DIALOGUES.map((cue2) => [cue2.id, cue2]));
  var signalNames = /* @__PURE__ */ new Set([...Object.keys(SIGNAL_DIALOGUES), "atlas-disabled"]);
  var minimumRouteTime = freeze({
    "module-recovered": 72,
    "c9-arrival": 180,
    "c9-departure": 180,
    "atlas-entry": 359,
    "atlas-phase-two": 359,
    "atlas-disabled": 359
  });
  var signalForCue = new Map(Object.entries(SIGNAL_DIALOGUES).map(([name, cue2]) => [cue2.id, name]));
  var uniqueStrings = (value) => Array.isArray(value) && value.every((id) => typeof id === "string") && new Set(value).size === value.length;
  function normalizeChronosChapterCheckpoint(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1 || value.contentVersion !== CHRONOS_CHAPTER_VERSION || value.routeId !== ROUTE_ID || !finiteTime(value.routeElapsed) || value.routeElapsed > CHRONOS_CHAPTER_ROUTE_SECONDS || !finiteTime(value.aftermathElapsed) || value.aftermathElapsed > CHRONOS_CHAPTER_AFTERMATH_SECONDS || typeof value.introSeen !== "boolean" || typeof value.introSkipped !== "boolean" || value.introSkipped && !value.introSeen || !uniqueStrings(value.eventIds) || value.eventIds.length > CHRONOS_CHAPTER_DIALOGUES.length || !uniqueStrings(value.signalIds) || value.signalIds.some((name) => !signalNames.has(name) || minimumRouteTime[name] > value.routeElapsed + 0.05) || value.signalIds.includes("c9-departure") && !value.signalIds.includes("c9-arrival") || value.signalIds.some((name) => ["atlas-phase-two", "atlas-disabled"].includes(name)) && !value.signalIds.includes("atlas-entry") || value.aftermathElapsed > 0 && !value.signalIds.includes("atlas-disabled")) return null;
    for (const id of value.eventIds) {
      const cue2 = dialogueById.get(id);
      if (!cue2) return null;
      if (cue2.phase === "opening" && cue2.at > value.routeElapsed + 0.05 && !value.introSeen) return null;
      if (cue2.phase === "route" && cue2.at > value.routeElapsed + 0.05) return null;
      if (cue2.phase === "event" && !value.signalIds.includes(signalForCue.get(id))) return null;
      if (cue2.phase === "aftermath" && (!value.signalIds.includes("atlas-disabled") || cue2.at > value.aftermathElapsed + 0.05)) return null;
    }
    return freeze({
      version: 1,
      contentVersion: CHRONOS_CHAPTER_VERSION,
      routeId: ROUTE_ID,
      routeElapsed: value.routeElapsed,
      aftermathElapsed: value.aftermathElapsed,
      introSeen: value.introSeen,
      introSkipped: value.introSkipped,
      eventIds: freeze([...value.eventIds]),
      signalIds: freeze([...value.signalIds])
    });
  }
  function createChronosChapterStory({
    checkpoint = null,
    routeElapsed = checkpoint?.routeElapsed ?? 0,
    introEnabled = true,
    replayIntro = false,
    presentation = "cinematic"
  } = {}) {
    if (!finiteTime(routeElapsed) || routeElapsed > CHRONOS_CHAPTER_ROUTE_SECONDS || typeof introEnabled !== "boolean" || typeof replayIntro !== "boolean" || !["cinematic", "in-world"].includes(presentation)) throw new RangeError("Invalid chapter story options");
    const restored = checkpoint === null ? null : normalizeChronosChapterCheckpoint(checkpoint);
    if (checkpoint !== null && !restored) throw new RangeError("Invalid chapter story checkpoint");
    let elapsed = routeElapsed, aftermathElapsed = 0;
    let introSeen = restored?.introSeen || false, introSkipped = restored?.introSkipped || false;
    const canOpen = (introEnabled || replayIntro) && (!introSeen || replayIntro) && routeElapsed < CHRONOS_CHAPTER_OPENING_SECONDS;
    let openingEnabled = canOpen;
    if (replayIntro && canOpen) {
      introSeen = false;
      introSkipped = false;
    }
    const fired = /* @__PURE__ */ new Set(), signals = /* @__PURE__ */ new Set();
    for (const name of restored?.signalIds || []) if (minimumRouteTime[name] <= routeElapsed + 0.05) signals.add(name);
    if (signals.has("atlas-disabled")) aftermathElapsed = restored.aftermathElapsed;
    for (const id of restored?.eventIds || []) {
      const cue2 = dialogueById.get(id);
      if (cue2.phase === "opening") {
        if (!replayIntro || cue2.at < routeElapsed) fired.add(id);
      } else if (cue2.phase === "route" && cue2.at <= routeElapsed) fired.add(id);
      else if (cue2.phase === "event" && signals.has(signalForCue.get(id))) fired.add(id);
      else if (cue2.phase === "aftermath" && signals.has("atlas-disabled") && cue2.at <= aftermathElapsed) fired.add(id);
    }
    for (const cue2 of TIMED_DIALOGUES) {
      if (cue2.at < routeElapsed) fired.add(cue2.id);
    }
    if (routeElapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) introSeen = true;
    function snapshot() {
      const active = openingEnabled && elapsed < CHRONOS_CHAPTER_OPENING_SECONDS;
      const shot = [...CHRONOS_CHAPTER_OPENING].reverse().find((cue2) => elapsed >= cue2.at) || CHRONOS_CHAPTER_OPENING[0];
      const film = active && presentation === "in-world" && elapsed < CHRONOS_CHAPTER_CINEMATIC_SECONDS;
      const aftermathActive = signals.has("atlas-disabled") && aftermathElapsed < CHRONOS_CHAPTER_AFTERMATH_SECONDS;
      const line2 = aftermathActive ? [...CHRONOS_CHAPTER_AFTERMATH].reverse().find((cue2) => aftermathElapsed >= cue2.at) : null;
      return freeze({
        version: CHRONOS_CHAPTER_VERSION,
        routeId: ROUTE_ID,
        routeElapsed: elapsed,
        introSeen,
        opening: freeze({
          active: active && presentation === "cinematic" || film,
          controlsLocked: active && presentation === "cinematic" && elapsed < 9 || film,
          canSkip: active && presentation === "cinematic" || film,
          film,
          shotIndex: shot.shotIndex,
          visualCue: shot.visualCue,
          progress: clamp2(elapsed / CHRONOS_CHAPTER_OPENING_SECONDS, 0, 1),
          shotProgress: clamp2((elapsed - shot.at) / shot.duration, 0, 1),
          // The new opening illustration reveals the existing station and its
          // one authored wave; it never draws another reactor destruction.
          backgroundAlpha: active && presentation === "cinematic" ? 1 - clamp2((elapsed - 9) / 2.4, 0, 1) : 0,
          dialogue: active ? shot : null
        }),
        aftermath: freeze({ active: aftermathActive, elapsed: aftermathElapsed, dialogue: line2 }),
        aftermathReady: signals.has("atlas-disabled") && aftermathElapsed >= CHRONOS_CHAPTER_AFTERMATH_SECONDS,
        carriesRecord: elapsed >= 13.2,
        eventIds: freeze([...fired]),
        signalIds: freeze([...signals])
      });
    }
    function emitOnce(cue2, emit) {
      if (fired.has(cue2.id)) return false;
      fired.add(cue2.id);
      emit(freeze({
        ...cue2,
        chapter: 1,
        storyVersion: CHRONOS_CHAPTER_VERSION,
        routeElapsed: elapsed,
        ...cue2.phase === "aftermath" ? { aftermathElapsed } : {}
      }));
      return true;
    }
    function advance(view, emit = NOOP2) {
      if (!view || !finiteTime(view.elapsed) || typeof emit !== "function" || view.playing !== void 0 && typeof view.playing !== "boolean" || view.aftermathElapsed !== void 0 && !finiteTime(view.aftermathElapsed)) throw new RangeError("Invalid chapter story view");
      if (view.playing === false) return snapshot();
      const next = Math.min(view.elapsed, CHRONOS_CHAPTER_ROUTE_SECONDS);
      if (next + 1e-9 < elapsed) throw new RangeError("Create a new story controller when restoring an earlier route checkpoint");
      elapsed = Math.max(elapsed, next);
      for (const cue2 of TIMED_DIALOGUES) {
        if (cue2.at > elapsed + 1e-9 || fired.has(cue2.id)) continue;
        if (cue2.phase === "opening" && !openingEnabled || elapsed >= cue2.at + cue2.duration) fired.add(cue2.id);
        else emitOnce(cue2, emit);
      }
      if (elapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) {
        introSeen = true;
        openingEnabled = false;
      }
      if (signals.has("atlas-disabled") && view.aftermathElapsed !== void 0) {
        const nextAftermath = Math.min(view.aftermathElapsed, CHRONOS_CHAPTER_AFTERMATH_SECONDS);
        if (nextAftermath + 1e-9 < aftermathElapsed) throw new RangeError("Aftermath clock must be monotonic");
        aftermathElapsed = Math.max(aftermathElapsed, nextAftermath);
        for (const cue2 of CHRONOS_CHAPTER_AFTERMATH) {
          if (cue2.at > aftermathElapsed + 1e-9 || fired.has(cue2.id)) continue;
          if (aftermathElapsed >= cue2.at + cue2.duration) fired.add(cue2.id);
          else emitOnce(cue2, emit);
        }
      }
      return snapshot();
    }
    function signal(name, emit = NOOP2) {
      if (!signalNames.has(name) || typeof emit !== "function") throw new RangeError("Unknown chapter story signal");
      if (signals.has(name) || minimumRouteTime[name] > elapsed + 0.05 || name === "c9-departure" && !signals.has("c9-arrival") || ["atlas-phase-two", "atlas-disabled"].includes(name) && !signals.has("atlas-entry")) return false;
      signals.add(name);
      if (name === "atlas-disabled") {
        aftermathElapsed = 0;
        emitOnce(CHRONOS_CHAPTER_AFTERMATH[0], emit);
      } else emitOnce(SIGNAL_DIALOGUES[name], emit);
      return true;
    }
    function skipIntro() {
      if (!openingEnabled || elapsed >= CHRONOS_CHAPTER_OPENING_SECONDS) return false;
      introSeen = true;
      introSkipped = true;
      openingEnabled = false;
      for (const cue2 of CHRONOS_CHAPTER_OPENING) fired.add(cue2.id);
      return true;
    }
    function checkpointRecord() {
      return freeze({
        version: 1,
        contentVersion: CHRONOS_CHAPTER_VERSION,
        routeId: ROUTE_ID,
        routeElapsed: elapsed,
        aftermathElapsed,
        introSeen,
        introSkipped,
        eventIds: freeze([...fired]),
        signalIds: freeze([...signals])
      });
    }
    return freeze({ advance, signal, skipIntro, snapshot, checkpoint: checkpointRecord });
  }

  // src/game/combat/hull-reinforcement.js
  var finite = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  var HULL_REINFORCEMENT_RULES = Object.freeze({
    version: "hull-reinforcement-v1",
    maxHull: 100,
    baseCapacity: 30,
    reinforcedCapacity: 45,
    advancedCapacity: 65,
    phaserDamage: 10,
    heavyPhaserDamage: 15,
    largeAsteroidHullDamage: 38,
    protectedLargeAsteroidHullDamage: 20
  });
  function resolveHullReinforcement({
    hull,
    reserve,
    capacity = 30,
    amount,
    kind = "collision",
    largeAsteroid = false,
    largeAsteroidScale = 1
  } = {}) {
    finite(hull, "hull");
    finite(reserve, "reserve");
    finite(capacity, "capacity");
    finite(amount, "damage");
    finite(largeAsteroidScale, "largeAsteroidScale");
    if (hull < 0 || hull > 100 || ![30, 45, 65].includes(capacity) || reserve < 0 || reserve > capacity || amount < 0 || typeof largeAsteroid !== "boolean" || largeAsteroidScale <= 0 || largeAsteroidScale > 1 || !["collision", "phaser", "heavyPhaser", "largeAsteroid"].includes(kind)) {
      throw new RangeError("Invalid reinforced hull damage request");
    }
    let incoming = amount;
    if (amount > 0 && kind === "phaser") incoming = HULL_REINFORCEMENT_RULES.phaserDamage;
    if (amount > 0 && kind === "heavyPhaser") incoming = HULL_REINFORCEMENT_RULES.heavyPhaserDamage;
    const large = (largeAsteroid || kind === "largeAsteroid") && incoming > 0;
    const reserveDamage = large ? reserve : Math.min(reserve, incoming);
    const hullImpact = large ? Math.round((reserve > 0 ? HULL_REINFORCEMENT_RULES.protectedLargeAsteroidHullDamage : HULL_REINFORCEMENT_RULES.largeAsteroidHullDamage) * largeAsteroidScale) : Math.max(0, incoming - reserveDamage);
    const nextHull = Math.max(0, hull - hullImpact), nextReserve = reserve - reserveDamage;
    return {
      hull: nextHull,
      reserve: nextReserve,
      capacity,
      reserveDamage,
      hullDamage: hull - nextHull,
      requestedHullDamage: hullImpact,
      absorbed: incoming > 0 && reserveDamage > 0 && hullImpact === 0,
      shieldBroken: reserve > 0 && nextReserve === 0,
      destroyed: nextHull === 0
    };
  }

  // src/game/progression/completion-journal.js
  function createCompletionJournal({
    storage,
    keys,
    levelCount,
    checkpointKey = null,
    validateCheckpoint = null,
    equipmentKey = null,
    validateEquipment = null
  } = {}) {
    const names2 = ["stars", "unlocked", "best", "levelBest"];
    if (!storage || !["readRaw", "set", "setJSON"].every((name) => typeof storage[name] === "function")) {
      throw new TypeError("Storage facade with tagged readRaw/set/setJSON required");
    }
    if (!Number.isSafeInteger(levelCount) || levelCount < 1 || !keys || !names2.every((name) => typeof keys[name] === "string" && keys[name])) {
      throw new TypeError("Existing campaign keys and positive levelCount required");
    }
    keys = Object.freeze(Object.fromEntries(names2.map((name) => [name, keys[name]])));
    const targets = names2.map((name) => keys[name]);
    const optionalKeys = [checkpointKey, equipmentKey].filter((key) => key !== null);
    if (optionalKeys.some((key) => typeof key !== "string" || !key) || (/* @__PURE__ */ new Set([...targets, ...optionalKeys])).size !== targets.length + optionalKeys.length) {
      throw new TypeError("Save keys must be distinct");
    }
    if (checkpointKey !== null && typeof validateCheckpoint !== "function") {
      throw new TypeError("Checkpoint writes require the runtime validator");
    }
    if (equipmentKey !== null && typeof validateEquipment !== "function") {
      throw new TypeError("Equipment writes require the runtime validator");
    }
    const journalKey = `${keys.unlocked}:completion-journal:v1`;
    if ([...targets, ...optionalKeys].includes(journalKey)) throw new TypeError("Journal key collision");
    const scope = JSON.stringify([...targets, checkpointKey, levelCount]);
    const unreadable = Object.freeze({});
    const integer2 = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
    const result = (ok, status, extra = {}) => ({ ok, status, ...extra });
    const blocked = (reason, key) => result(false, "blocked", { reason, key });
    const read = (key) => {
      try {
        const outcome = storage.readRaw(key);
        return outcome?.ok === true && (outcome.value === null || typeof outcome.value === "string") ? outcome.value : unreadable;
      } catch {
        return unreadable;
      }
    };
    const write = (key, value, json = false) => {
      try {
        return (json ? storage.setJSON(key, value) : storage.set(key, value)) === true;
      } catch {
        return false;
      }
    };
    const checkpointValid = (value) => {
      try {
        return validateCheckpoint(value) === true;
      } catch {
        return false;
      }
    };
    const equipmentValid = (value) => {
      try {
        return validateEquipment(value) === true;
      } catch {
        return false;
      }
    };
    const equipmentBeforeValid = (raw) => {
      if (raw === null) return true;
      if (typeof raw !== "string") return false;
      try {
        return equipmentValid(JSON.parse(raw));
      } catch {
        return false;
      }
    };
    function parseNumber(raw, fallback, min = 0) {
      if (raw === null || raw === "") return fallback;
      const value = Number(raw);
      return integer2(value, min) ? value : null;
    }
    function parseMap(raw) {
      if (raw === null) return {};
      try {
        const value = JSON.parse(raw);
        return value && typeof value === "object" && !Array.isArray(value) ? value : null;
      } catch {
        return null;
      }
    }
    function readSave() {
      const raw = {};
      for (const name of names2) {
        raw[name] = read(keys[name]);
        if (raw[name] === unreadable) return { error: blocked("storage-read-denied", keys[name]) };
      }
      const save = {
        raw,
        stars: parseMap(raw.stars),
        levelBest: parseMap(raw.levelBest),
        unlocked: parseNumber(raw.unlocked, 1, 1),
        best: parseNumber(raw.best, 0)
      };
      for (const name of names2) if (save[name] === null) return { error: blocked("invalid-existing-save", keys[name]) };
      return save;
    }
    function validRecord(record) {
      if (!record || typeof record !== "object" || record.version !== 1 || record.scope !== scope || !["pending", "committed"].includes(record.phase) || typeof record.id !== "string" || record.id.length < 1 || record.id.length > 200 || !integer2(record.level, 1) || record.level > levelCount || !integer2(record.stars, 1) || record.stars > 3 || !integer2(record.score) || !integer2(record.unlockTo, 1) || record.unlockTo > levelCount) return false;
      if (record.checkpoint !== null && !(checkpointKey !== null && record.checkpoint && (record.checkpoint.before === null || typeof record.checkpoint.before === "string") && checkpointValid(record.checkpoint.after))) return false;
      if (record.equipment === void 0 || record.equipment === null) return true;
      return equipmentKey !== null && record.equipment && !Array.isArray(record.equipment) && equipmentBeforeValid(record.equipment.before) && equipmentValid(record.equipment.after);
    }
    function readRecord() {
      const raw = read(journalKey);
      if (raw === unreadable) return { error: blocked("storage-read-denied", journalKey) };
      if (raw === null) return { record: null };
      try {
        const record = JSON.parse(raw);
        return validRecord(record) ? { record } : { error: blocked("invalid-journal", journalKey) };
      } catch {
        return { error: blocked("invalid-journal", journalKey) };
      }
    }
    function replay(record) {
      const save = readSave();
      if (save.error) return save.error;
      const key = String(record.level);
      const oldStars = parseNumber(save.stars[key] === void 0 ? null : save.stars[key], 0);
      const oldBest = parseNumber(save.levelBest[key] === void 0 ? null : save.levelBest[key], 0);
      if (oldStars === null || oldStars > 3) return blocked("invalid-existing-save", keys.stars);
      if (oldBest === null) return blocked("invalid-existing-save", keys.levelBest);
      let checkpointRaw = null, checkpointAfter = null;
      if (record.checkpoint !== null) {
        checkpointRaw = read(checkpointKey);
        if (checkpointRaw === unreadable) return blocked("storage-read-denied", checkpointKey);
        checkpointAfter = JSON.stringify(record.checkpoint.after);
        if (checkpointRaw !== record.checkpoint.before && checkpointRaw !== checkpointAfter) {
          return blocked("checkpoint-conflict", checkpointKey);
        }
      }
      let equipmentRaw = null;
      if (record.equipment !== void 0 && record.equipment !== null) {
        equipmentRaw = read(equipmentKey);
        if (equipmentRaw === unreadable) return blocked("storage-read-denied", equipmentKey);
        const equipmentAfter = JSON.stringify(record.equipment.after);
        if (equipmentRaw !== record.equipment.before && equipmentRaw !== equipmentAfter) {
          return blocked("equipment-conflict", equipmentKey);
        }
      }
      const stars = { ...save.stars, [key]: Math.max(oldStars, record.stars) };
      const bests = { ...save.levelBest, [key]: Math.max(oldBest, record.score) };
      const writes = [
        [keys.stars, stars, true, save.raw.stars],
        [keys.levelBest, bests, true, save.raw.levelBest],
        [keys.best, Math.max(save.best, record.score), false, save.raw.best],
        ...record.checkpoint === null ? [] : [[checkpointKey, record.checkpoint.after, true, checkpointRaw]],
        ...record.equipment === void 0 || record.equipment === null ? [] : [[equipmentKey, record.equipment.after, true, equipmentRaw]],
        [keys.unlocked, Math.max(save.unlocked, record.unlockTo), false, save.raw.unlocked]
      ];
      for (const [target, value, json, current] of writes) {
        if ((json ? JSON.stringify(value) : String(value)) === current) continue;
        if (!write(target, value, json)) return result(false, "pending", { reason: "storage-write-denied", key: target, completionId: record.id });
      }
      if (!write(journalKey, { ...record, phase: "committed" }, true)) {
        return result(false, "pending", { reason: "receipt-write-denied", key: journalKey, completionId: record.id });
      }
      return result(true, "committed", {
        completionId: record.id,
        newlyUnlocked: record.unlockTo > save.unlocked
      });
    }
    function recover() {
      const loaded = readRecord();
      if (loaded.error) return loaded.error;
      if (!loaded.record) return result(true, "idle");
      if (loaded.record.phase === "committed") return result(true, "committed", {
        completionId: loaded.record.id,
        duplicate: true
      });
      return { ...replay(loaded.record), recovered: true };
    }
    function complete({ completionId, level, stars, score, checkpoint = null, equipment = null } = {}) {
      if (typeof completionId !== "string" || !completionId || completionId.length > 200 || !integer2(level, 1) || level > levelCount || !integer2(stars, 1) || stars > 3 || !integer2(score)) {
        throw new TypeError("Valid completionId, campaign level, stars and score required");
      }
      const recovery = recover();
      if (!recovery.ok || recovery.completionId === completionId) return recovery;
      const save = readSave();
      if (save.error) return save.error;
      if (save.unlocked > levelCount) return blocked("unsupported-campaign-progress", keys.unlocked);
      let checkpointIntent = null;
      if (checkpoint !== null) {
        if (!checkpointKey || !checkpointValid(checkpoint)) throw new TypeError("Invalid completion checkpoint");
        const before = read(checkpointKey);
        if (before === unreadable) return blocked("storage-read-denied", checkpointKey);
        if (before !== null) {
          try {
            if (!checkpointValid(JSON.parse(before))) return blocked("invalid-existing-checkpoint", checkpointKey);
          } catch {
            return blocked("invalid-existing-checkpoint", checkpointKey);
          }
        }
        let after;
        try {
          after = JSON.parse(JSON.stringify(checkpoint));
        } catch {
          throw new TypeError("Checkpoint must be JSON data");
        }
        if (!checkpointValid(after)) throw new TypeError("Invalid JSON checkpoint");
        checkpointIntent = { before, after };
      }
      let equipmentIntent = null;
      if (equipment !== null) {
        if (!equipmentKey || !equipmentValid(equipment)) throw new TypeError("Invalid completion equipment");
        const before = read(equipmentKey);
        if (before === unreadable) return blocked("storage-read-denied", equipmentKey);
        if (!equipmentBeforeValid(before)) return blocked("invalid-existing-equipment", equipmentKey);
        let after;
        try {
          after = JSON.parse(JSON.stringify(equipment));
        } catch {
          throw new TypeError("Equipment must be JSON data");
        }
        if (!equipmentValid(after)) throw new TypeError("Invalid JSON equipment");
        equipmentIntent = { before, after };
      }
      const record = {
        version: 1,
        scope,
        phase: "pending",
        id: completionId,
        level,
        stars,
        score,
        unlockTo: save.unlocked === level ? Math.min(levelCount, level + 1) : save.unlocked,
        checkpoint: checkpointIntent,
        ...equipmentIntent === null ? {} : { equipment: equipmentIntent }
      };
      if (!write(journalKey, record, true)) return result(false, "blocked", {
        reason: "intent-write-denied",
        key: journalKey,
        completionId
      });
      return replay(record);
    }
    return Object.freeze({ complete, recover, journalKey });
  }

  // src/game/progression/scrap-economy.js
  var SCRAP_ECONOMY_KEY = "neonCronium.classicSalvage.v1";
  var SCRAP_ECONOMY_RULES = Object.freeze({
    version: 1,
    revision: 2,
    silver: 1e5,
    gold: 1e7,
    stellar: 1e8,
    baseHullReserve: 30,
    reinforcedHullReserve: 45,
    maxMissiles: 3,
    missileUnitPrice: 6,
    maxDropReceipts: 512,
    maxPurchaseReceipts: 128,
    maxInvalidBackups: 8
  });
  var SCRAP_REWARDS = Object.freeze({ raider: 6, scout: 9, interceptor: 15, atlas: 600, debris: 6, satellite: 18, ch03: 120 });
  var upgrade = (definition) => Object.freeze({
    ...definition,
    requires: Object.freeze([...definition.requires || []]),
    receiptPrices: Object.freeze([...definition.receiptPrices || [definition.price]])
  });
  var SCRAP_UPGRADES = Object.freeze({
    "twin-preparation": upgrade({
      id: "twin-preparation",
      price: 24,
      label: "Preparar emisor",
      description: "Prepara la pieza recuperada; Gemelo sigue requiriendo vencer a Atlas."
    }),
    "hull-reinforcement": upgrade({
      id: "hull-reinforcement",
      price: 30,
      label: "Blindaje I",
      branch: "defense",
      rank: 1,
      description: "Ampl\xEDa la reserva de integridad de 30 a 45; absorbe da\xF1o sin temporizador."
    }),
    "coolant-feed": upgrade({
      id: "coolant-feed",
      price: 45,
      label: "Refrigeraci\xF3n I",
      branch: "cooling",
      rank: 1,
      description: "Recupera un proyectil cada 1,5 segundos en lugar de cada dos."
    }),
    "hull-plating-ii": upgrade({
      id: "hull-plating-ii",
      price: 90,
      branch: "defense",
      rank: 2,
      requires: ["hull-reinforcement"],
      label: "Blindaje II",
      description: "Ampl\xEDa la reserva de casco de 45 a 65. No repara la reserva ya consumida."
    }),
    "coolant-feed-ii": upgrade({
      id: "coolant-feed-ii",
      price: 110,
      branch: "cooling",
      rank: 2,
      requires: ["coolant-feed"],
      label: "Refrigeraci\xF3n II",
      description: "Recupera un proyectil cada segundo de vuelo; conserva la carga y recuperaci\xF3n en curso."
    }),
    "weapon-scatter": upgrade({
      id: "weapon-scatter",
      price: 70,
      weaponId: "scatter",
      branch: "scatter",
      rank: 1,
      requires: ["twin-preparation"],
      label: "Abanico I",
      description: "Tres pulsos divergentes de 1 de da\xF1o; alcance corto para interceptar grupos cercanos.",
      tradeoff: "Exige acercarse: sus pulsos se disipan antes que un Phaser."
    }),
    "scatter-focus": upgrade({
      id: "scatter-focus",
      price: 120,
      weaponId: "scatter",
      branch: "scatter",
      rank: 2,
      requires: ["weapon-scatter"],
      label: "Abanico II \xB7 convergencia",
      description: "Concentra la apertura de 18\xB0 a 13\xB0 y ampl\xEDa el alcance de 224 a 317; mantiene tres pulsos.",
      tradeoff: "Gana alcance pero cubre menos anchura."
    }),
    "weapon-needle": upgrade({
      id: "weapon-needle",
      price: 95,
      weaponId: "needle",
      branch: "needle",
      rank: 1,
      requires: ["twin-preparation"],
      label: "Aguja I",
      description: "Proyectil estrecho de 2 de da\xF1o que perfora hasta tres objetivos alineados.",
      tradeoff: "Menor anchura de impacto y cadencia m\xE1s lenta que el Phaser."
    }),
    "needle-resonance": upgrade({
      id: "needle-resonance",
      price: 140,
      weaponId: "needle",
      branch: "needle",
      rank: 2,
      requires: ["weapon-needle"],
      label: "Aguja II \xB7 resonancia",
      description: "Perfora cuatro objetivos y dispara cada 0,46 s en lugar de cada 0,56 s.",
      tradeoff: "Mantiene el da\xF1o directo de 2: destaca frente a objetivos alineados."
    })
  });
  var SCRAP_CONSUMABLES = Object.freeze({ "sector-beacon": Object.freeze({ price: 40 }) });
  var integer = (value) => Number.isSafeInteger(value) && value >= 0;
  var object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  var identifier = (value) => typeof value === "string" && value.length > 0 && value.length <= 160 && !/[\u0000-\u001f\u007f]/.test(value);
  var copy = (value) => JSON.parse(JSON.stringify(value));
  var has = (value, key) => Object.hasOwn(value, key);
  var enemyAliases = Object.freeze({
    "ch-01": "scout",
    "ch01": "scout",
    "ch-02": "interceptor",
    "ch02": "interceptor",
    "guardian-atlas": "atlas",
    "ship-fragment": "debris",
    "satellite-fragment": "satellite"
  });
  var enemyName = (type) => typeof type !== "string" ? null : has(SCRAP_REWARDS, type) ? type : has(enemyAliases, type) ? enemyAliases[type] : null;
  function rewardForEnemy(type) {
    const name = enemyName(type);
    return name === null ? 0 : SCRAP_REWARDS[name];
  }
  function hullReserveCapacity(record) {
    const upgrades = Array.isArray(record?.upgrades) ? record.upgrades : [];
    return upgrades.includes("hull-plating-ii") ? 65 : upgrades.some((sku) => sku === "hull-reinforcement" || sku === "shield-cell") ? SCRAP_ECONOMY_RULES.reinforcedHullReserve : SCRAP_ECONOMY_RULES.baseHullReserve;
  }
  function classicWorkshopState(record) {
    const saved = normalizeScrapRecord(record);
    const upgrades = saved?.upgrades || [];
    const owns2 = (sku) => upgrades.includes(sku);
    return {
      reserveCapacity: hullReserveCapacity(saved),
      rechargeSeconds: owns2("coolant-feed-ii") ? 1 : owns2("coolant-feed") ? 1.5 : 2,
      defenseRank: owns2("hull-plating-ii") ? 2 : owns2("hull-reinforcement") ? 1 : 0,
      coolingRank: owns2("coolant-feed-ii") ? 2 : owns2("coolant-feed") ? 1 : 0,
      weaponIds: ["scatter", "needle"].filter((id) => owns2(`weapon-${id}`)),
      weaponRanks: {
        scatter: owns2("scatter-focus") ? 2 : owns2("weapon-scatter") ? 1 : 0,
        needle: owns2("needle-resonance") ? 2 : owns2("weapon-needle") ? 1 : 0
      }
    };
  }
  var upgradeName = (sku) => sku === "shield-cell" ? "hull-reinforcement" : sku;
  var REWARD_HISTORY = Object.freeze({ atlas: Object.freeze([180]), ch03: Object.freeze([120]) });
  var historicalReward = (type, amount) => amount === SCRAP_REWARDS[type] || (REWARD_HISTORY[type] || []).includes(amount);
  var operationSequence = (id, prefix) => {
    if (typeof id !== "string" || !id.startsWith(prefix)) return null;
    const tail = id.slice(prefix.length);
    if (!/^[1-9]\d*$/.test(tail)) return null;
    const sequence = Number(tail);
    return Number.isSafeInteger(sequence) ? sequence : null;
  };
  function formatDenominations(balance) {
    if (!integer(balance)) throw new TypeError("Salvage balance must be a nonnegative safe integer");
    let remaining = balance;
    const stellar = Math.floor(remaining / SCRAP_ECONOMY_RULES.stellar);
    remaining %= SCRAP_ECONOMY_RULES.stellar;
    const gold = Math.floor(remaining / SCRAP_ECONOMY_RULES.gold);
    remaining %= SCRAP_ECONOMY_RULES.gold;
    const silver = Math.floor(remaining / SCRAP_ECONOMY_RULES.silver);
    const scrap = remaining % SCRAP_ECONOMY_RULES.silver;
    const parts = [
      [stellar, "estelar", "estelares"],
      [gold, "oro", "oro"],
      [silver, "plata", "plata"],
      [scrap, "chatarra", "chatarra"]
    ].filter(([amount]) => amount > 0).map(([amount, singular, plural]) => `${amount} ${amount === 1 ? singular : plural}`);
    return { scrap, silver, gold, stellar, label: parts.join(" \xB7 ") || "0 chatarra" };
  }
  function createScrapRecord() {
    return {
      version: 1,
      revision: 2,
      balance: 0,
      earned: 0,
      spent: 0,
      runSequence: 0,
      activeRun: null,
      upgrades: [],
      purchases: [],
      missileAmmo: 3,
      missileShotsSpent: 0,
      missileRoundsPurchased: 0,
      missileRefillSequence: 0,
      lastMissileRefill: null,
      consumableSpent: 0,
      lastConsumable: null
    };
  }
  function normalizeScrapRecord(value) {
    const legacy = object(value) && !has(value, "revision") && [
      "missileAmmo",
      "missileShotsSpent",
      "missileRoundsPurchased",
      "missileRefillSequence",
      "lastMissileRefill"
    ].every((key) => !has(value, key));
    const upgrades = Array.isArray(value?.upgrades) ? value.upgrades.map(upgradeName) : [];
    if (!object(value) || value.version !== 1 || !legacy && value.revision !== SCRAP_ECONOMY_RULES.revision || !["balance", "earned", "spent", "runSequence"].every((key) => integer(value[key])) || value.earned < value.spent || value.balance !== value.earned - value.spent || !Array.isArray(value.upgrades) || value.upgrades.length > Object.keys(SCRAP_UPGRADES).length || upgrades.some((sku) => typeof sku !== "string" || !has(SCRAP_UPGRADES, sku)) || new Set(upgrades).size !== upgrades.length || !Array.isArray(value.purchases) || value.purchases.length > SCRAP_ECONOMY_RULES.maxPurchaseReceipts) return null;
    const missileAmmo = legacy ? 3 : value.missileAmmo;
    const missileShotsSpent = legacy ? 0 : value.missileShotsSpent;
    const missileRoundsPurchased = legacy ? 0 : value.missileRoundsPurchased;
    const missileRefillSequence = legacy ? 0 : value.missileRefillSequence;
    const lastMissileRefill = legacy ? null : value.lastMissileRefill;
    if (![missileAmmo, missileShotsSpent, missileRoundsPurchased, missileRefillSequence].every(integer) || missileAmmo > SCRAP_ECONOMY_RULES.maxMissiles || !Number.isSafeInteger(missileRoundsPurchased * SCRAP_ECONOMY_RULES.missileUnitPrice) || !Number.isSafeInteger(SCRAP_ECONOMY_RULES.maxMissiles + missileRoundsPurchased) || SCRAP_ECONOMY_RULES.maxMissiles + missileRoundsPurchased - missileShotsSpent !== missileAmmo || missileRoundsPurchased < missileRefillSequence || missileRoundsPurchased > missileRefillSequence * 3) return null;
    if (missileRefillSequence === 0) {
      if (lastMissileRefill !== null) return null;
    } else if (!object(lastMissileRefill) || lastMissileRefill.sequence !== missileRefillSequence || lastMissileRefill.id !== `c9:missiles:${missileRefillSequence}` || !integer(lastMissileRefill.amount) || lastMissileRefill.amount < 1 || lastMissileRefill.amount > 3 || lastMissileRefill.price !== lastMissileRefill.amount * SCRAP_ECONOMY_RULES.missileUnitPrice) return null;
    const consumableSpent = has(value, "consumableSpent") ? value.consumableSpent : 0;
    const lastConsumable = has(value, "lastConsumable") ? value.lastConsumable : null;
    if (!integer(consumableSpent)) return null;
    if (lastConsumable === null) {
      if (consumableSpent !== 0) return null;
    } else if (!object(lastConsumable) || !identifier(lastConsumable.id) || typeof lastConsumable.sku !== "string" || !has(SCRAP_CONSUMABLES, lastConsumable.sku) || !integer(lastConsumable.price) || lastConsumable.price < 1 || lastConsumable.price > consumableSpent) return null;
    const transactionIds = /* @__PURE__ */ new Set(), purchased = /* @__PURE__ */ new Set();
    let spent = 0;
    for (const receipt of value.purchases) {
      const sku = upgradeName(receipt?.sku);
      if (!object(receipt) || !identifier(receipt.id) || transactionIds.has(receipt.id) || typeof sku !== "string" || !has(SCRAP_UPGRADES, sku) || purchased.has(sku) || !SCRAP_UPGRADES[sku].receiptPrices.includes(receipt.price)) return null;
      transactionIds.add(receipt.id);
      purchased.add(sku);
      spent += receipt.price;
    }
    if ([...purchased].some((sku) => SCRAP_UPGRADES[sku].requires.some((required) => !purchased.has(required)))) return null;
    if (spent + missileRoundsPurchased * SCRAP_ECONOMY_RULES.missileUnitPrice + consumableSpent !== value.spent || upgrades.length !== purchased.size || upgrades.some((sku) => !purchased.has(sku))) return null;
    if (value.activeRun !== null) {
      const run = value.activeRun;
      if (!object(run) || run.sequence !== value.runSequence || run.sequence < 1 || run.id !== `salvage-run:${run.sequence}` || !identifier(run.scope) || !Array.isArray(run.claimed) || run.claimed.length > SCRAP_ECONOMY_RULES.maxDropReceipts) return null;
      const dropIds = /* @__PURE__ */ new Set();
      let earnedThisRun = 0;
      for (const receipt of run.claimed) {
        if (!object(receipt) || !identifier(receipt.id) || dropIds.has(receipt.id) || typeof receipt.enemyType !== "string" || !has(SCRAP_REWARDS, receipt.enemyType) || !historicalReward(receipt.enemyType, receipt.amount)) return null;
        dropIds.add(receipt.id);
        earnedThisRun += receipt.amount;
      }
      if (earnedThisRun > value.earned) return null;
    } else if (value.runSequence !== 0) return null;
    return {
      version: 1,
      revision: 2,
      balance: value.balance,
      earned: value.earned,
      spent: value.spent,
      runSequence: value.runSequence,
      activeRun: value.activeRun === null ? null : {
        id: value.activeRun.id,
        scope: value.activeRun.scope,
        sequence: value.activeRun.sequence,
        claimed: value.activeRun.claimed.map((receipt) => ({
          id: receipt.id,
          enemyType: receipt.enemyType,
          amount: receipt.amount
        }))
      },
      upgrades,
      purchases: value.purchases.map((receipt) => ({
        id: receipt.id,
        sku: upgradeName(receipt.sku),
        price: receipt.price
      })),
      missileAmmo,
      missileShotsSpent,
      missileRoundsPurchased,
      missileRefillSequence,
      lastMissileRefill: lastMissileRefill === null ? null : {
        id: lastMissileRefill.id,
        sequence: lastMissileRefill.sequence,
        amount: lastMissileRefill.amount,
        price: lastMissileRefill.price
      },
      consumableSpent,
      lastConsumable: lastConsumable === null ? null : { id: lastConsumable.id, sku: lastConsumable.sku, price: lastConsumable.price }
    };
  }
  function createScrapLedger({ storage, key = SCRAP_ECONOMY_KEY } = {}) {
    if (!storage || typeof storage.readRaw !== "function" || typeof storage.setJSON !== "function" || !identifier(key)) throw new TypeError("Tagged readRaw/setJSON storage and a valid save key are required");
    const backupKey = `${key}:invalid-backups`;
    const migrationBackupKey = `${key}:migration-backups`;
    let current = null;
    const blocked = (reason, extra = {}) => ({ ok: false, status: "blocked", reason, ...extra });
    const success = (status, extra = {}) => ({ ok: true, status, state: copy(current), ...extra });
    function read(target) {
      try {
        const result = storage.readRaw(target);
        return result?.ok === true && (result.value === null || typeof result.value === "string") ? result : { ok: false };
      } catch {
        return { ok: false };
      }
    }
    function writeJSON(target, value) {
      try {
        return storage.setJSON(target, value) === true;
      } catch {
        return false;
      }
    }
    function backupRaw(raw, target) {
      const loaded = read(target);
      if (!loaded.ok) return blocked("backup-read-denied", { key: target });
      let records = [];
      if (loaded.value !== null) {
        try {
          const backup = JSON.parse(loaded.value);
          if (!object(backup) || backup.version !== 1 || !Array.isArray(backup.records) || backup.records.length > SCRAP_ECONOMY_RULES.maxInvalidBackups || backup.records.some((record) => typeof record !== "string")) return blocked("invalid-backup", { key: target });
          records = backup.records;
        } catch {
          return blocked("invalid-backup", { key: target });
        }
      }
      if (records.includes(raw)) return { ok: true };
      if (records.length >= SCRAP_ECONOMY_RULES.maxInvalidBackups) return blocked("backup-capacity", { key: target });
      const snapshot = { version: 1, records: [...records, raw] };
      writeJSON(target, snapshot);
      const after = read(target);
      return after.ok && after.value === JSON.stringify(snapshot) ? { ok: true } : blocked("backup-write-denied", { key: target });
    }
    function preserveInvalid(raw) {
      const saved = backupRaw(raw, backupKey);
      if (!saved.ok) return saved;
      return blocked("invalid-save-backed-up", { key, backupKey });
    }
    function readState() {
      current = null;
      const loaded = read(key);
      if (!loaded.ok) return { error: blocked("storage-read-denied", { key }) };
      if (loaded.value === null) {
        current = createScrapRecord();
        return { raw: null };
      }
      let parsed;
      try {
        parsed = JSON.parse(loaded.value);
      } catch {
        return { error: preserveInvalid(loaded.value) };
      }
      if (object(parsed) && integer(parsed.version) && parsed.version !== 1) {
        return { error: blocked("unsupported-save-version", { key }) };
      }
      if (object(parsed) && has(parsed, "revision") && integer(parsed.revision) && parsed.revision !== 2) {
        return { error: blocked("unsupported-save-revision", { key }) };
      }
      current = normalizeScrapRecord(parsed);
      if (current === null) return { error: preserveInvalid(loaded.value) };
      const migrating = !has(parsed, "revision") || parsed.upgrades.includes("shield-cell") || parsed.purchases.some((receipt) => receipt.sku === "shield-cell");
      if (migrating) {
        const backup = backupRaw(loaded.value, migrationBackupKey);
        if (!backup.ok) {
          current = null;
          return { error: backup };
        }
        const migrated = commit(current, loaded.value);
        return migrated.ok ? { raw: JSON.stringify(current), migrated: true } : { error: migrated };
      }
      return { raw: loaded.value };
    }
    function commit(next, beforeRaw, extra = {}) {
      const normalized = normalizeScrapRecord(next);
      if (normalized === null) throw new TypeError("Invalid salvage transaction");
      const before = read(key);
      if (!before.ok) {
        current = null;
        return blocked("storage-read-denied", { key });
      }
      if (before.value !== beforeRaw) {
        current = null;
        return blocked("save-conflict", { key });
      }
      const snapshot = copy(normalized);
      const written = writeJSON(key, snapshot);
      const after = read(key);
      if (!after.ok || after.value !== JSON.stringify(snapshot)) {
        current = null;
        return blocked(after.ok && written ? "save-conflict" : "storage-write-denied", { key });
      }
      current = normalized;
      return success("committed", extra);
    }
    function load() {
      const loaded = readState();
      return loaded.error || success(loaded.migrated ? "migrated" : loaded.raw === null ? "new" : "loaded");
    }
    function beginRun({ scope, fresh = false } = {}) {
      if (!identifier(scope) || typeof fresh !== "boolean") throw new TypeError("A stable run scope and boolean fresh flag are required");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      if (current.activeRun && !fresh) {
        if (current.activeRun.scope !== scope) return blocked("run-scope-conflict", { runId: current.activeRun.id });
        return success("resumed", { runId: current.activeRun.id, duplicate: true });
      }
      if (current.runSequence === Number.MAX_SAFE_INTEGER) return blocked("run-capacity");
      const next = copy(current), sequence = next.runSequence + 1;
      next.runSequence = sequence;
      next.activeRun = { id: `salvage-run:${sequence}`, sequence, scope, claimed: [] };
      return commit(next, loaded.raw, { runId: next.activeRun.id });
    }
    function claimDrop({ runId, dropId, enemyType } = {}) {
      const type = enemyName(enemyType);
      if (!identifier(runId) || !identifier(dropId) || type === null) throw new TypeError("A known enemy and stable run/drop IDs are required");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      if (!current.activeRun || current.activeRun.id !== runId) return blocked("inactive-run");
      const prior = current.activeRun.claimed.find((receipt) => receipt.id === dropId);
      if (prior) return prior.enemyType === type ? success("duplicate", { duplicate: true, amount: 0, originalAmount: prior.amount }) : blocked("drop-id-conflict");
      if (current.activeRun.claimed.length >= SCRAP_ECONOMY_RULES.maxDropReceipts) return blocked("drop-receipt-capacity");
      const amount = SCRAP_REWARDS[type];
      if (!Number.isSafeInteger(current.earned + amount)) return blocked("balance-capacity");
      const next = copy(current);
      next.balance += amount;
      next.earned += amount;
      next.activeRun.claimed.push({ id: dropId, enemyType: type, amount });
      return commit(next, loaded.raw, { amount, duplicate: false, runId, dropId });
    }
    function refillMissiles(transactionId) {
      const sequence = operationSequence(transactionId, "c9:missiles:");
      if (sequence === null) throw new TypeError("Missile refills require c9:missiles:<next sequence>");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      if (current.purchases.some((receipt) => receipt.id === transactionId)) return blocked("transaction-id-conflict");
      if (sequence <= current.missileRefillSequence) return success("duplicate", {
        duplicate: true,
        sku: "missile-refill",
        price: 0,
        amount: 0,
        remaining: current.missileAmmo
      });
      if (sequence !== current.missileRefillSequence + 1) return blocked("refill-sequence-conflict");
      const amount = SCRAP_ECONOMY_RULES.maxMissiles - current.missileAmmo;
      if (amount === 0) return { ok: false, status: "unavailable", reason: "missiles-full", state: copy(current) };
      const price = amount * SCRAP_ECONOMY_RULES.missileUnitPrice;
      if (current.balance < price) return {
        ok: false,
        status: "unavailable",
        reason: "insufficient-funds",
        price,
        missing: price - current.balance,
        state: copy(current)
      };
      if (!Number.isSafeInteger(current.missileRoundsPurchased + amount) || !Number.isSafeInteger((current.missileRoundsPurchased + amount) * SCRAP_ECONOMY_RULES.missileUnitPrice)) return blocked("missile-capacity");
      const next = copy(current);
      next.balance -= price;
      next.spent += price;
      next.missileAmmo += amount;
      next.missileRoundsPurchased += amount;
      next.missileRefillSequence = sequence;
      next.lastMissileRefill = { id: transactionId, sequence, amount, price };
      return commit(next, loaded.raw, {
        sku: "missile-refill",
        price,
        amount,
        remaining: next.missileAmmo,
        duplicate: false,
        transactionId
      });
    }
    function spendMissile({ shotId } = {}) {
      const sequence = operationSequence(shotId, "missile:");
      if (sequence === null) throw new TypeError("A durable missile:<next sequence> shot ID is required");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      if (sequence <= current.missileShotsSpent) return success("duplicate", {
        duplicate: true,
        shotId,
        remaining: current.missileAmmo
      });
      if (sequence !== current.missileShotsSpent + 1) return blocked("missile-sequence-conflict");
      if (current.missileAmmo === 0) return { ok: false, status: "unavailable", reason: "missiles-empty", state: copy(current) };
      const next = copy(current);
      next.missileAmmo--;
      next.missileShotsSpent = sequence;
      return commit(next, loaded.raw, { duplicate: false, shotId, remaining: next.missileAmmo });
    }
    function purchase({ transactionId, sku: requestedSku } = {}) {
      const sku = upgradeName(requestedSku);
      if (!identifier(transactionId) || typeof sku !== "string" || !has(SCRAP_UPGRADES, sku) && sku !== "missile-refill") throw new TypeError("A stable transaction ID and catalogue SKU are required");
      if (sku === "missile-refill") return refillMissiles(transactionId);
      if (transactionId.startsWith("c9:missiles:")) throw new TypeError("Missile refill transaction IDs are reserved");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      const prior = current.purchases.find((receipt) => receipt.id === transactionId);
      if (prior) return prior.sku === sku ? success("duplicate", { duplicate: true, sku, price: 0 }) : blocked("transaction-id-conflict");
      if (current.lastConsumable?.id === transactionId) return blocked("transaction-id-conflict");
      if (current.upgrades.includes(sku)) return { ok: false, status: "unavailable", reason: "already-owned", state: copy(current) };
      if (current.purchases.length >= SCRAP_ECONOMY_RULES.maxPurchaseReceipts) return blocked("purchase-receipt-capacity");
      const requires = SCRAP_UPGRADES[sku].requires.filter((required) => !current.upgrades.includes(required));
      if (requires.length) return {
        ok: false,
        status: "unavailable",
        reason: "prerequisite-required",
        requires,
        state: copy(current)
      };
      const price = SCRAP_UPGRADES[sku].price;
      if (current.balance < price) return {
        ok: false,
        status: "unavailable",
        reason: "insufficient-funds",
        price,
        missing: price - current.balance,
        state: copy(current)
      };
      const next = copy(current);
      next.balance -= price;
      next.spent += price;
      next.upgrades.push(sku);
      next.purchases.push({ id: transactionId, sku, price });
      return commit(next, loaded.raw, { sku, price, duplicate: false });
    }
    function buyConsumable({ transactionId, sku } = {}) {
      if (!identifier(transactionId) || typeof sku !== "string" || !has(SCRAP_CONSUMABLES, sku) || transactionId.startsWith("c9:missiles:")) throw new TypeError("A stable transaction ID and consumable SKU are required");
      const loaded = readState();
      if (loaded.error) return loaded.error;
      if (current.lastConsumable?.id === transactionId) return current.lastConsumable.sku === sku ? success("duplicate", { duplicate: true, sku, price: 0 }) : blocked("transaction-id-conflict");
      if (current.purchases.some((receipt) => receipt.id === transactionId)) return blocked("transaction-id-conflict");
      const price = SCRAP_CONSUMABLES[sku].price;
      if (!Number.isSafeInteger(current.consumableSpent + price)) return blocked("consumable-capacity");
      if (current.balance < price) return {
        ok: false,
        status: "unavailable",
        reason: "insufficient-funds",
        price,
        missing: price - current.balance,
        state: copy(current)
      };
      const next = copy(current);
      next.balance -= price;
      next.spent += price;
      next.consumableSpent += price;
      next.lastConsumable = { id: transactionId, sku, price };
      return commit(next, loaded.raw, { sku, price, duplicate: false });
    }
    return Object.freeze({
      key,
      backupKey,
      migrationBackupKey,
      load,
      beginRun,
      claimDrop,
      grant: ({ runId, rewardId, enemyType } = {}) => claimDrop({ runId, dropId: rewardId, enemyType }),
      purchase,
      buyConsumable,
      spendMissile,
      nextMissileShotId: () => current === null ? null : `missile:${current.missileShotsSpent + 1}`,
      nextMissileRefillId: () => current === null ? null : `c9:missiles:${current.missileRefillSequence + 1}`,
      getState: () => current === null ? null : copy(current),
      getBalance: () => current?.balance ?? null
    });
  }

  // src/game/progression/voyage-hazards.js
  var VOYAGE_HAZARD_VERSION = "voyage-hazards-v2";
  var VOYAGE_HAZARD_RULES = Object.freeze({
    maxDelta: 0.05,
    upperBand: 0.45,
    gapMargin: 50,
    footprint: 1.3,
    edgeMargin: 46,
    attempts: 8
  });
  var profile = (gap, cap, cluster, mix3, speed, { start = 0, damageScale = 1 } = {}) => Object.freeze({
    gap: Object.freeze(gap),
    cap,
    cluster,
    mix: Object.freeze(mix3),
    speed: Object.freeze(speed),
    start,
    damageScale
  });
  var VOYAGE_HAZARD_PROFILES = Object.freeze({
    // 1.1: el campo nace con la ruptura (9 s de ruta); 8 s de respiro desde
    // ahí, dos a la vez como mucho y medio daño mientras el piloto se sitúa
    // (prueba del propietario, 20/10).
    1: profile([1.7, 2.7], 2, 0.15, { meteor: 0.45, debris: 0.55 }, [170, 260], { start: 8, damageScale: 0.5 }),
    2: profile([1.1, 1.9], 4, 0.3, { meteor: 0.3, debris: 0.55, satellite: 0.15 }, [160, 250], { damageScale: 0.5 }),
    // 1.3: daño al 75 % (crítico de juego, 21/10: era el pico más duro del
    // juego y llegaba en el primer viaje).
    3: profile([0.9, 1.6], 5, 0.35, { meteor: 0.35, debris: 0.5, satellite: 0.15 }, [170, 270], { damageScale: 0.75 }),
    4: profile([1.3, 2.1], 4, 0.25, { meteor: 0.5, debris: 0.4, satellite: 0.1 }, [190, 290]),
    5: profile([2.3, 3.4], 2, 0.1, { meteor: 0.8, debris: 0.2 }, [210, 320]),
    6: profile([2.8, 4], 2, 0.05, { meteor: 0.6, debris: 0.4 }, [170, 250]),
    7: profile([1.5, 2.3], 3, 0.2, { meteor: 0.55, debris: 0.35, satellite: 0.1 }, [200, 300]),
    8: profile([1.2, 2], 4, 0.3, { meteor: 0.55, debris: 0.35, satellite: 0.1 }, [210, 310]),
    9: profile([1.6, 2.5], 3, 0.2, { meteor: 0.5, debris: 0.35, satellite: 0.15 }, [210, 320]),
    10: profile([1, 1.7], 5, 0.35, { meteor: 0.45, debris: 0.4, satellite: 0.15 }, [220, 330])
  });
  var VULKAR_HAZARD_SHARE = Object.freeze({ lavaCore: 0.2, plasmaMine: 0.15 });
  var vulkarProfile = (base) => {
    const total = Object.values(base.mix).reduce((sum, weight) => sum + weight, 0);
    const keep = 1 - VULKAR_HAZARD_SHARE.lavaCore - VULKAR_HAZARD_SHARE.plasmaMine;
    const mix3 = Object.fromEntries(Object.entries(base.mix).map(([type, weight]) => [type, weight / total * keep]));
    return Object.freeze({ ...base, mix: Object.freeze({ ...mix3, ...VULKAR_HAZARD_SHARE }) });
  };
  var VULKAR_HAZARD_PROFILES = Object.freeze(Object.fromEntries(
    Object.entries(VOYAGE_HAZARD_PROFILES).map(([stage, base]) => [stage, vulkarProfile(base)])
  ));
  var finite2 = (value, label) => {
    if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite`);
    return value;
  };
  var randomFor = (seed) => {
    let state = seed >>> 0;
    return () => {
      state += 1831565813;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  };
  var RADIUS_ESTIMATE = Object.freeze({ meteor: 42, debris: 35, satellite: 46, lavaCore: 44, plasmaMine: 36 });
  function createVoyageHazardField({
    stageNumber,
    seed = 0,
    width = 720,
    height = 1280,
    shipWidth = 208 * 0.52,
    profile: profile2 = null
  } = {}) {
    for (const [label, value] of Object.entries({ stageNumber, seed, width, height, shipWidth })) finite2(value, label);
    const stage = profile2 || VOYAGE_HAZARD_PROFILES[stageNumber];
    if (!stage || width < 250 || height < 300 || shipWidth <= 0) throw new RangeError("Invalid voyage hazard stage or viewport");
    const random = randomFor(Math.trunc(seed) >>> 0 ^ Math.imul(stageNumber, 2654435769));
    return {
      version: VOYAGE_HAZARD_VERSION,
      stageNumber,
      profile: stage,
      width,
      height,
      shipWidth,
      random,
      // La primera aparición llega pronto para que el tramo no empiece vacío.
      wait: stage.start + 0.6 + random() * 0.8,
      emitted: 0,
      skipped: 0
    };
  }
  function pickType(mix3, random) {
    const entries = Object.entries(mix3);
    let roll = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return entries[entries.length - 1][0];
  }
  function largestUpperGap(field, threats) {
    const band = field.height * VOYAGE_HAZARD_RULES.upperBand;
    const spans = threats.filter((item) => item.y < band).map((item) => [item.x - item.r * VOYAGE_HAZARD_RULES.footprint, item.x + item.r * VOYAGE_HAZARD_RULES.footprint]).sort((a, b) => a[0] - b[0]);
    let cursor = 0, best = 0;
    for (const [left, right] of spans) {
      best = Math.max(best, left - cursor);
      cursor = Math.max(cursor, right);
    }
    return Math.max(best, field.width - cursor);
  }
  function placeHazard(field, profileData, threats) {
    const required = field.shipWidth + VOYAGE_HAZARD_RULES.gapMargin;
    const type = pickType(profileData.mix, field.random);
    const r = RADIUS_ESTIMATE[type];
    for (let attempt = 0; attempt < VOYAGE_HAZARD_RULES.attempts; attempt++) {
      const margin = VOYAGE_HAZARD_RULES.edgeMargin;
      const x = margin + field.random() * (field.width - margin * 2);
      if (threats.some((item) => item.y < field.height * 0.2 && Math.abs(item.x - x) < item.r + r + 24)) continue;
      const candidate = { x, y: -95, r };
      if (largestUpperGap(field, [...threats, candidate]) < required) continue;
      const [low, high] = profileData.speed;
      return { type, x, speed: low + field.random() * (high - low), r };
    }
    return null;
  }
  function advanceVoyageHazardField(field, delta, threats, emit) {
    if (field?.version !== VOYAGE_HAZARD_VERSION) throw new TypeError("Voyage hazard field required");
    if (typeof emit !== "function") throw new TypeError("Voyage hazard callback required");
    finite2(delta, "delta");
    if (delta < 0) throw new RangeError("delta must not be negative");
    const step = Math.min(delta, VOYAGE_HAZARD_RULES.maxDelta);
    const profileData = field.profile;
    field.wait -= step;
    if (field.wait > 0) return 0;
    const [low, high] = profileData.gap;
    field.wait = low + field.random() * (high - low);
    const live = threats.map((item) => ({ x: item.x, y: item.y, r: item.r }));
    const wanted = field.random() < profileData.cluster ? 2 + (field.random() < 0.35 ? 1 : 0) : 1;
    let count = 0;
    for (let index = 0; index < wanted && live.length < profileData.cap; index++) {
      const hazard = placeHazard(field, profileData, live);
      if (!hazard) {
        field.skipped++;
        break;
      }
      live.push({ x: hazard.x, y: -95 - index * 70, r: hazard.r });
      field.emitted++;
      count++;
      emit(Object.freeze({
        type: hazard.type,
        x: hazard.x,
        speed: hazard.speed,
        delayY: index * 70,
        damageScale: profileData.damageScale
      }));
    }
    return count;
  }

  // src/game/progression/voyage-engine.js
  var VOYAGE_MAX_DELTA = 0.034;
  var clamp3 = (value, min, max) => Math.max(min, Math.min(max, value));
  var smooth = (value, start, end) => {
    const t = clamp3((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  };
  var immutable = (object2) => Object.freeze(object2);
  var NOOP3 = () => {
  };
  function createVoyageRoute(ficha) {
    const { chapter, version, routeId, eventPrefix, baseGoal, service } = ficha;
    const stageCount = ficha.stages.length;
    let offset = 0;
    const STAGES = immutable(ficha.stages.map((data, index) => {
      const [name, duration, goal, objective, origin, destination, event2, nebulaOpacity, starDensity, threatRate] = data;
      const stage = immutable({
        id: `${chapter}.${index + 1}`,
        stageId: `${chapter}.${index + 1}`,
        number: index + 1,
        stageNumber: index + 1,
        chapter,
        contentVersion: version,
        routeId,
        name,
        duration,
        goal,
        objective,
        origin,
        destination,
        event: event2,
        offset,
        nebulaOpacity,
        starDensity,
        threatRate
      });
      offset += duration;
      return stage;
    }));
    const MIN_DURATION = offset;
    const voyageGoal = (stage, goal) => Math.ceil(stage.goal * goal / baseGoal);
    const validateGoal = (goal) => {
      if (!Number.isInteger(goal) || goal < 1) throw new RangeError("goal must be a positive integer");
    };
    const entryEventId = (number) => `${eventPrefix}:${chapter}.${number}:start`;
    const checkpointEventId = (number) => `${eventPrefix}:${chapter}.${number}:checkpoint`;
    const completionEventId = (number) => `${eventPrefix}:${chapter}.${number}:complete`;
    const EVENTS = immutable(ficha.events.map((event2) => immutable({ ...event2 })));
    const SERVICE_EVENT_ID = service ? `${eventPrefix}:${chapter}.${service.stage}:service` : null;
    const SERVICE_COMPLETE_ID = service ? `${eventPrefix}:${chapter}.${service.stage}:service-complete` : null;
    const serviceIndex = service ? service.stage - 1 : -1;
    const ARRIVAL_EVENT_ID = `${eventPrefix}-arrival`;
    const validEventIds = /* @__PURE__ */ new Set([
      ...EVENTS.map((event2) => event2.id),
      ...service ? [SERVICE_EVENT_ID, SERVICE_COMPLETE_ID] : [],
      ARRIVAL_EVENT_ID,
      ...STAGES.flatMap((stage) => [entryEventId(stage.number), checkpointEventId(stage.number), completionEventId(stage.number)])
    ]);
    function checkpointForStage(stageNumber, goal, collected, eventIds = [], serviceWaiting = false) {
      const stage = STAGES[stageNumber - 1];
      return immutable({
        version: 2,
        contentVersion: version,
        routeId,
        stageIndex: stageNumber - 1,
        stageId: stage.id,
        stageNumber,
        goal,
        collected,
        eventIds: immutable([...new Set(eventIds)]),
        ...serviceWaiting ? { serviceWaiting: true } : {}
      });
    }
    function createCheckpoint(stageNumber = 1, { goal = baseGoal, collected } = {}) {
      validateGoal(goal);
      if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > stageCount) {
        throw new RangeError(`stageNumber must be between 1 and ${stageCount}`);
      }
      const minimum = stageNumber === 1 ? 0 : voyageGoal(STAGES[stageNumber - 2], goal);
      const count = collected === void 0 ? minimum : collected;
      if (!Number.isFinite(count) || count < minimum) throw new RangeError("collected is below the stage entry requirement");
      const boundary = STAGES[stageNumber - 1].offset;
      const events = EVENTS.filter((event2) => event2.at <= boundary).map((event2) => event2.id);
      for (let number = 1; number < stageNumber; number++) events.push(entryEventId(number), checkpointEventId(number), completionEventId(number));
      if (service && stageNumber > service.stage) events.push(SERVICE_EVENT_ID, SERVICE_COMPLETE_ID);
      return checkpointForStage(stageNumber, goal, Math.min(goal, Math.floor(count)), events);
    }
    function normalizeCheckpoint(value, { goal = baseGoal } = {}) {
      validateGoal(goal);
      if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 2 || value.contentVersion !== version || value.routeId !== routeId || value.goal !== goal || !Number.isInteger(value.stageNumber) || value.stageNumber < 1 || value.stageNumber > stageCount || value.stageIndex !== value.stageNumber - 1 || value.stageId !== `${chapter}.${value.stageNumber}` || !Number.isFinite(value.collected) || value.collected < 0 || !Array.isArray(value.eventIds) || value.eventIds.some((id) => typeof id !== "string" || !validEventIds.has(id)) || value.serviceWaiting !== void 0 && typeof value.serviceWaiting !== "boolean" || value.serviceWaiting && (!service || value.stageNumber !== service.stage)) return null;
      const collected = Math.min(goal, Math.floor(value.collected));
      const minimum = value.stageNumber === 1 ? 0 : voyageGoal(STAGES[value.stageNumber - 2], goal);
      if (collected < minimum || value.serviceWaiting && collected < voyageGoal(STAGES[serviceIndex], goal)) return null;
      const canonical = createCheckpoint(value.stageNumber, { goal, collected });
      const currentIds = value.eventIds.filter((id) => id === entryEventId(value.stageNumber) || id === checkpointEventId(value.stageNumber));
      if (service && value.stageNumber === service.stage) {
        const completedServicePair = value.eventIds.includes(SERVICE_EVENT_ID) && value.eventIds.includes(SERVICE_COMPLETE_ID);
        if ((value.serviceWaiting || completedServicePair) && value.eventIds.includes(completionEventId(service.stage))) {
          currentIds.push(completionEventId(service.stage));
        }
        if (!value.serviceWaiting && completedServicePair) currentIds.push(SERVICE_EVENT_ID, SERVICE_COMPLETE_ID);
      }
      return checkpointForStage(value.stageNumber, goal, collected, [
        ...canonical.eventIds,
        ...currentIds,
        ...value.serviceWaiting ? [SERVICE_EVENT_ID] : []
      ], Boolean(value.serviceWaiting));
    }
    function create({ goal = baseGoal, checkpoint = null } = {}) {
      validateGoal(goal);
      const restored = checkpoint === null ? null : normalizeCheckpoint(checkpoint, { goal });
      if (checkpoint !== null && !restored) throw new TypeError(ficha.invalidCheckpointMessage || "Invalid voyage checkpoint");
      let stageIndex = restored?.stageIndex || 0, collected = restored?.collected || 0;
      const restoredServiceCompleted = service && stageIndex === serviceIndex && restored?.eventIds.includes(SERVICE_COMPLETE_ID);
      const restoredLegacyService = service && stageIndex === serviceIndex && restored?.eventIds.includes(completionEventId(service.stage)) && (restored.serviceWaiting || restoredServiceCompleted);
      let stageElapsed = restoredLegacyService ? STAGES[stageIndex].duration : restored?.serviceWaiting || restoredServiceCompleted ? service.approach : 0;
      let serviceWaiting = Boolean(restored?.serviceWaiting), arrived = false;
      const fired = new Set(restored?.eventIds || []);
      let entryCheckpoint = restored || createCheckpoint(1, { goal });
      function exportCheckpoint() {
        if (serviceWaiting) return checkpointForStage(service.stage, goal, collected, [...fired], true);
        return entryCheckpoint;
      }
      function relayState(elapsed, serviceCompleted) {
        if (!service) return { visible: false, arrival: 0, exit: 0, active: false, state: "approach" };
        const serviceAt = STAGES[serviceIndex].offset + service.approach;
        const arrival2 = smooth(elapsed, serviceAt - service.visibleApproach, serviceAt);
        const exit = serviceCompleted && stageIndex === serviceIndex ? smooth(stageElapsed, service.approach, service.approach + service.departure) : 0;
        const visible = stageIndex <= serviceIndex && elapsed >= serviceAt - service.visibleApproach && (!serviceCompleted || exit < 1);
        const state = serviceWaiting ? "service" : serviceCompleted ? "departing" : arrival2 < 0.48 ? "approach" : "docking";
        return { visible, arrival: arrival2, exit, active: serviceWaiting, state };
      }
      function snapshot() {
        const stage = STAGES[stageIndex], stageProgress = clamp3(stageElapsed / stage.duration, 0, 1);
        const elapsed = stage.offset + stageElapsed, p = elapsed / MIN_DURATION;
        const stageGoal = voyageGoal(stage, goal);
        const objectiveComplete = collected >= goal, quotaComplete = collected >= stageGoal;
        const serviceCompleted = Boolean(service) && fired.has(SERVICE_COMPLETE_ID);
        const renamed = service && stageIndex === serviceIndex && serviceCompleted;
        const scenery = ficha.scenery({ elapsed, p, stageIndex, stage, arrived, relay: relayState(elapsed, serviceCompleted) });
        return immutable({
          version,
          contentVersion: version,
          routeId,
          chapter,
          elapsed,
          minDuration: MIN_DURATION,
          cinematicDuration: ficha.cinematicDuration,
          routeProgress: p,
          phase: arrived ? "arrived" : ficha.phase(stageIndex, elapsed),
          stageId: stage.id,
          stageNumber: stage.number,
          stageName: renamed ? service.renamedStage : stage.name,
          stageProgress,
          stageElapsed,
          stageDuration: stage.duration,
          stageGoal,
          stageObjective: renamed ? service.renamedObjective : stage.objective,
          stageOrigin: stage.origin,
          stageDestination: stage.destination,
          stageEvent: stage.event,
          stageQuotaComplete: quotaComplete,
          threatRate: stage.threatRate,
          origin: ficha.origin,
          destination: ficha.destination,
          collected,
          goal,
          remaining: Math.max(0, goal - collected),
          collectionFraction: collected / goal,
          objectiveComplete,
          canFinish: arrived,
          recoveryActive: elapsed >= ficha.recoveryAt && !arrived,
          waitingFor: serviceWaiting ? "service" : stageProgress === 1 && !quotaComplete ? "cronium" : null,
          ...scenery,
          distance: immutable({ unit: "tramo", covered: p, total: 1, stage: stage.number, stages: stageCount })
        });
      }
      function emitOnce(event2, emit) {
        if (fired.has(event2.id)) return;
        fired.add(event2.id);
        if (event2.type === "checkpoint") entryCheckpoint = checkpointForStage(stageIndex + 1, goal, collected, [...fired]);
        if (event2.type === "service-complete") entryCheckpoint = checkpointForStage(stageIndex + 1, goal, collected, [...fired]);
        emit(immutable({
          ...event2,
          version,
          stageId: `${chapter}.${stageIndex + 1}`,
          stageNumber: stageIndex + 1,
          elapsed: STAGES[stageIndex].offset + stageElapsed,
          routeProgress: snapshot().routeProgress,
          ...event2.type === "checkpoint" ? { checkpoint: entryCheckpoint } : {}
        }));
      }
      function ensureEntryEvents(emit) {
        emitOnce({ id: entryEventId(stageIndex + 1), type: "stage-start" }, emit);
        emitOnce({ id: checkpointEventId(stageIndex + 1), type: "checkpoint" }, emit);
      }
      function enterNextStage(emit) {
        stageIndex++;
        stageElapsed = 0;
        entryCheckpoint = checkpointForStage(stageIndex + 1, goal, collected, [...fired]);
        ensureEntryEvents(emit);
      }
      function resolveService(emit = NOOP3) {
        if (typeof emit !== "function") throw new TypeError("emit must be a function");
        if (!serviceWaiting) return snapshot();
        serviceWaiting = false;
        emitOnce({ id: SERVICE_COMPLETE_ID, type: "service-complete" }, emit);
        if (stageElapsed === STAGES[stageIndex].duration) enterNextStage(emit);
        return snapshot();
      }
      function advance(dt, collectionCount = collected, emit = NOOP3) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError("Finite nonnegative delta required");
        if (!Number.isFinite(collectionCount) || collectionCount < 0) throw new RangeError("collectionCount must be nonnegative");
        if (typeof emit !== "function") throw new TypeError("emit must be a function");
        if (dt === 0 || arrived || serviceWaiting) return snapshot();
        ensureEntryEvents(emit);
        collected = Math.min(goal, Math.max(collected, Math.floor(collectionCount)));
        const stage = STAGES[stageIndex];
        stageElapsed = Math.min(stage.duration, stageElapsed + Math.min(dt, VOYAGE_MAX_DELTA));
        if (stage.duration - stageElapsed < 1e-8) stageElapsed = stage.duration;
        const elapsed = stage.offset + stageElapsed;
        for (const event2 of EVENTS) {
          if (elapsed + 1e-10 >= event2.at) emitOnce(event2, emit);
        }
        if (service && stage.number === service.stage && !fired.has(SERVICE_COMPLETE_ID) && stageElapsed + 1e-10 >= service.approach && collected >= voyageGoal(stage, goal)) {
          stageElapsed = service.approach;
          serviceWaiting = true;
          emitOnce({ id: SERVICE_EVENT_ID, type: "service", stationId: "c9" }, emit);
          return snapshot();
        }
        if (stageElapsed === stage.duration && collected >= voyageGoal(stage, goal)) {
          emitOnce({ id: completionEventId(stage.number), type: "stage-complete" }, emit);
          if (stage.number === stageCount) {
            arrived = true;
            emitOnce({ id: ARRIVAL_EVENT_ID, type: "arrival", destinationId: ficha.arrivalDestinationId }, emit);
          } else enterNextStage(emit);
        }
        return snapshot();
      }
      return immutable({ advance, snapshot, exportCheckpoint, resolveService });
    }
    return immutable({
      id: ficha.id,
      chapter,
      version,
      saveKey: ficha.saveKey,
      routeId,
      stages: STAGES,
      minDuration: MIN_DURATION,
      stageCount,
      createCheckpoint,
      normalizeCheckpoint,
      create
    });
  }

  // src/game/progression/voyages/s1-v1-chronos-gaia.js
  var immutable2 = (object2) => Object.freeze(object2);
  var ROSTERS = immutable2({
    escape: immutable2(["raider"]),
    mixed: immutable2(["raider", "scout", "raider"]),
    hunters: immutable2(["scout", "raider", "interceptor"]),
    ambush: immutable2(["interceptor", "raider", "scout", "interceptor"])
  });
  var encounter = (stage, patrol, { comets = false, repairAt = null } = {}) => immutable2({
    patrol: patrol && immutable2({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[stage],
    comets,
    repairAt
  });
  var S1_V1_CHRONOS_GAIA = immutable2({
    id: "S1-V1",
    sector: 1,
    number: 1,
    title: "Escapa de Chronos",
    chapter: 1,
    version: "chronos-voyage-v2",
    saveKey: "neonCronium.chronosVoyage.v2",
    routeId: "chronos-to-gaia",
    eventPrefix: "chronos-voyage",
    baseGoal: 36,
    origin: "Centro Chronos",
    destination: "Baliza de acceso a Gaia Nova",
    arrivalDestinationId: "gaia-atlas-approach",
    cinematicDuration: 90,
    recoveryAt: 9,
    invalidCheckpointMessage: "Invalid Chronos voyage checkpoint",
    stages: immutable2([
      ["Emergencia en Chronos", 36, 4, "Recupera los primeros fragmentos del reactor", "Chronos \xB7 reactor", "Per\xEDmetro destruido", "reactor-strike", 0.18, 0.7, 0.36],
      ["Per\xEDmetro destruido", 36, 8, "Cruza los restos y recupera el rastro de CRONIUM", "Per\xEDmetro destruido", "Campo de restos", "wreckage-crossing", 0.15, 0.8, 0.48],
      ["Campo de restos", 36, 12, "Sigue el rastro y rescata el emisor si lo encuentras", "Campo de restos", "Salida orbital", "recoverable-module", 0.12, 0.72, 0.56],
      ["Salida orbital", 36, 16, "Abandona la \xF3rbita de Chronos sin perder la se\xF1al", "Salida orbital", "Corredor exterior", "origin-retreat", 0.08, 0.52, 0.42],
      ["El gran vac\xEDo", 38, 18, "Atraviesa el vac\xEDo; observa el cometa anunciado", "Corredor exterior", "Corredor de enlace", "comet-crossing", 0.025, 0.26, 0.22],
      ["Enlace C9", 32, 18, "Configura la nave desde C9 en el HUD mientras sigues el corredor", "Corredor de enlace", "Ruta exterior de Gaia", "service-stop", 0.035, 0.34, 0.12],
      ["Estela de regreso", 38, 24, "Prueba tu nave y recupera la se\xF1al en espacio abierto", "Ruta exterior de Gaia", "Ruta de Gaia", "equipment-trial", 0.025, 0.28, 0.44],
      ["Gaia en la distancia", 36, 28, "Mant\xE9n la ruta hacia el planeta que crece al frente", "Ruta de Gaia", "Baliza exterior de Gaia", "destination-reveal", 0.06, 0.4, 0.52],
      ["Se\xF1ales de Atlas", 36, 32, "Cruza la patrulla y localiza el acceso orbital", "Baliza exterior de Gaia", "Acceso orbital de Gaia", "atlas-identification", 0.12, 0.52, 0.72],
      ["Llegada a Gaia", 36, 36, "Completa el rastro y alcanza la baliza de llegada", "Acceso orbital de Gaia", "Baliza de acceso a Gaia Nova", "persistent-arrival", 0.18, 0.62, 0.82]
    ].map((stage) => immutable2(stage))),
    events: immutable2([
      { id: "chronos-voyage-intruder", type: "attack", at: 2.25, attackerId: "cronium-raider", targetId: "chronos-reactor" },
      { id: "chronos-voyage-breach", type: "rupture", at: 9, resourceId: "cronium", cause: "hostile-reactor-strike" },
      { id: "chronos-voyage-perimeter-exit", type: "departure", at: 108, originId: "chronos-scientific-centre" },
      { id: "chronos-voyage-recovered-module", type: "twin-module-marker", at: 90, moduleId: "twin-emitter", resourceId: "cronium" },
      { id: "chronos-voyage-gaia-beacon", type: "gaia-beacon", at: 292, destinationId: "gaia-atlas-approach" }
    ].map((event2) => immutable2(event2))),
    // C9 atraca poco después de entrar en el tramo 6 (aproximación visible) y
    // el resto del tramo es la salida tras el servicio.
    service: immutable2({
      stage: 6,
      approach: 1.2,
      visibleApproach: 2.4,
      departure: 2.4,
      renamedStage: "Corredor de Gaia",
      renamedObjective: "Prueba tu nave en el corredor; C9 contin\xFAa disponible en el panel"
    }),
    encounters: immutable2([
      encounter(1, [1, ROSTERS.escape, 9]),
      encounter(2, [2, ROSTERS.escape, 9]),
      encounter(3, [3, ROSTERS.mixed, 8]),
      encounter(4, [2, ROSTERS.mixed, 8], { repairAt: 15 }),
      encounter(5, null, { comets: true }),
      encounter(6, null),
      encounter(7, [2, ROSTERS.hunters, 8]),
      encounter(8, [3, ROSTERS.hunters, 8], { repairAt: 15 }),
      encounter(9, [3, ROSTERS.ambush, 6], { comets: true }),
      encounter(10, [3, ROSTERS.ambush, 6])
    ]),
    phase(stageIndex, elapsed) {
      return stageIndex === 0 ? elapsed < 9 ? "emergency" : "recovery" : stageIndex < 3 ? "recovery" : stageIndex === 3 ? "departure" : stageIndex < 7 ? "deep-space" : "gaia-approach";
    },
    scenery({ elapsed, p, stageIndex, stage, arrived, relay }) {
      const departure = smooth(p, 0.025, 0.43), approach2 = smooth(p, 0.7, 1);
      const attackApproach = smooth(elapsed, 1.35, 4.95), attackExit = smooth(elapsed, 10.8, 21.6);
      const reactorState = elapsed < 6.3 ? "stable" : elapsed < 9 ? "struck" : "ruptured";
      const attackerState = elapsed < 4.95 ? "approach" : elapsed < 6.3 ? "charge" : elapsed < 9 ? "fire" : "retreat";
      return {
        station: immutable2({
          x: 0.48 - 0.72 * departure,
          y: 0.43 + 0.94 * departure,
          scale: 1.12 * Math.pow(0.032, departure),
          rotation: -0.1 * departure,
          visible: p < 0.44,
          alpha: 1,
          state: reactorState
        }),
        planet: immutable2({
          x: 0.79 - 0.15 * approach2,
          y: 0.06 + 0.03 * approach2,
          scale: 0.014 + 0.71 * approach2 * approach2,
          rotation: 0.06 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable2({
          x: 0.54 + 0.08 * (1 - approach2),
          y: 0.16 + 0.1 * approach2,
          scale: 0.012 + 0.216 * approach2,
          visible: p >= 0.8,
          alpha: 1,
          active: p >= 292 / 360
        }),
        relay: immutable2({
          visible: relay.visible,
          x: 0.77 - 0.09 * relay.arrival - 0.48 * relay.exit,
          y: 0.08 + 0.16 * relay.arrival + 0.84 * relay.exit,
          scale: (0.025 + 0.15 * relay.arrival) * (1 - 0.85 * relay.exit),
          alpha: 1,
          active: relay.active,
          state: relay.state
        }),
        attacker: immutable2({
          x: 1.12 - 0.48 * attackApproach - 0.95 * attackExit,
          y: 0.13 + 0.11 * attackApproach - 0.15 * attackExit,
          scale: 0.1 + 0.07 * attackApproach - 0.05 * attackExit,
          rotation: -0.18 - 0.65 * attackExit,
          visible: elapsed >= 1.35 && elapsed < 21.6,
          state: attackerState
        }),
        deepSpace: immutable2({
          travel: p,
          offsetX: -0.16 * p,
          offsetY: 2.4 * p,
          speed: 0.2 + 0.8 * smooth(p, 0.25, 0.46),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: stageIndex >= 4 && stageIndex <= 6 ? 0.1 : 0.32
        }),
        debris: immutable2({
          visible: elapsed >= 9 && !arrived,
          travel: p,
          directionX: -0.28,
          directionY: 0.96,
          depth: smooth(p, 0.025, 0.35),
          density: stageIndex >= 4 && stageIndex <= 6 ? 0.22 : 0.7
        })
      };
    }
  });

  // src/game/progression/difficulty.js
  var freeze2 = Object.freeze;
  var DIFFICULTY_MODES = freeze2({
    facil: freeze2({
      id: "facil",
      label: "F\xE1cil",
      note: "Menos enemigos y da\xF1o; para disfrutar la historia",
      pressure: 0.72,
      capDelta: -1,
      damage: 0.6,
      bossHealth: 0.67,
      repairEarlier: 4
    }),
    normal: freeze2({
      id: "normal",
      label: "Normal",
      note: "La experiencia prevista",
      pressure: 1,
      capDelta: 0,
      damage: 1,
      bossHealth: 1,
      repairEarlier: 0
    }),
    dificil: freeze2({
      id: "dificil",
      label: "Dif\xEDcil",
      note: "M\xE1s presi\xF3n, da\xF1o y jefes m\xE1s duros; para quien ya domina Normal",
      pressure: 1.09,
      capDelta: 0,
      damage: 1.12,
      bossHealth: 1.15,
      repairEarlier: -3
    }),
    hardcore: freeze2({
      id: "hardcore",
      label: "Hardcore",
      note: "M\xE1s enemigos, m\xE1s r\xE1pidos y m\xE1s da\xF1o; sin descanso",
      pressure: 1.18,
      capDelta: 1,
      damage: 1.25,
      bossHealth: 1.3,
      repairEarlier: -6
    })
  });
  var DIFFICULTY_DEFAULT = "normal";
  var normalizeDifficulty = (value) => DIFFICULTY_MODES[value] ? value : DIFFICULTY_DEFAULT;
  var voyageNumber = (ficha) => (Math.max(1, ficha?.sector || 1) - 1) * 5 + Math.max(1, ficha?.number || 1);
  function voyagePressure(number) {
    const n = Math.max(1, Math.trunc(Number(number) || 1));
    return Math.min(3, 1 + 0.07 * Math.min(n - 1, 9) + 0.03 * Math.max(0, n - 10));
  }
  var stagePressure = (rules) => (rules.patrol ? rules.patrol.cap / rules.patrol.gap : 0) + rules.hazards.cap / ((rules.hazards.gap[0] + rules.hazards.gap[1]) / 2);
  function calibrate(stageRules, { voyage = 1, reference }) {
    const mean = stageRules.reduce((sum, rules) => sum + stagePressure(rules), 0) / stageRules.length;
    return voyage === 1 ? 1 : reference * voyagePressure(voyage) / mean;
  }
  var DIFFICULTY_LIMITS = freeze2({ patrolGapMin: 5, patrolCapMax: 4, hazardGapMin: 0.45, hazardCapMax: 6, speedMax: 1.3 });
  function applyDifficulty(rules, { factor = 1, mode = DIFFICULTY_DEFAULT } = {}) {
    if (!rules) return rules;
    const settings = DIFFICULTY_MODES[normalizeDifficulty(mode)];
    const pressure = factor * settings.pressure;
    if (pressure === 1 && settings.capDelta === 0 && settings.repairEarlier === 0) return rules;
    const patrol = rules.patrol && freeze2({
      ...rules.patrol,
      cap: Math.max(1, Math.min(DIFFICULTY_LIMITS.patrolCapMax, rules.patrol.cap + settings.capDelta)),
      gap: Math.max(Math.min(rules.patrol.gap, DIFFICULTY_LIMITS.patrolGapMin), rules.patrol.gap / pressure)
    });
    const hazards = rules.hazards && freeze2({
      ...rules.hazards,
      gap: freeze2(rules.hazards.gap.map((value) => Math.max(DIFFICULTY_LIMITS.hazardGapMin, value / pressure))),
      cap: Math.max(1, Math.min(DIFFICULTY_LIMITS.hazardCapMax, rules.hazards.cap + settings.capDelta)),
      speed: freeze2(rules.hazards.speed.map((value) => Math.round(value * Math.min(DIFFICULTY_LIMITS.speedMax, Math.sqrt(pressure)))))
    });
    const repairAt = rules.repairAt === null ? null : Math.max(6, rules.repairAt - settings.repairEarlier);
    return freeze2({ ...rules, patrol, hazards, repairAt });
  }

  // src/game/progression/voyages/s1-v2-gaia-outer-net.js
  var immutable3 = (object2) => Object.freeze(object2);
  var ROSTERS2 = immutable3({
    watch: immutable3(["scout"]),
    net: immutable3(["scout", "raider", "scout"]),
    quarantine: immutable3(["interceptor", "scout", "raider", "scout"])
  });
  var encounter2 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable3({
    patrol: patrol && immutable3({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S1_V2_GAIA_OUTER_NET = immutable3({
    id: "S1-V2",
    sector: 1,
    number: 2,
    title: "Cruza la red exterior de Gaia",
    chapter: 2,
    version: "s1-v2-voyage-v1",
    saveKey: "neonCronium.voyage.S1-V2.v1",
    routeId: "gaia-outer-net",
    eventPrefix: "s1-v2",
    baseGoal: 36,
    origin: "Baliza exterior de Gaia",
    destination: "Anillo de sat\xE9lites",
    arrivalDestinationId: "gaia-satellite-ring",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S1-V2 voyage checkpoint",
    stages: immutable3([
      ["Baliza en silencio", 30, 4, "Deja atr\xE1s la baliza; la red a\xFAn no te ha visto", "Baliza exterior de Gaia", "Red exterior", "net-edge", 0.1, 0.5, 0.3],
      ["Primer barrido", 32, 10, "Esquiva los barridos de identificaci\xF3n", "Red exterior", "Malla de sensores", "identity-sweep", 0.12, 0.56, 0.4],
      ["Malla de sensores", 32, 16, "Cruza la malla sin atraer a los sat\xE9lites", "Malla de sensores", "Hueco de N-7", "sensor-mesh", 0.14, 0.6, 0.48],
      ["El hueco de N-7", 30, 21, "Sigue el hueco que encuentra N-7 entre dos sat\xE9lites", "Hueco de N-7", "Cuarentena", "net-gap", 0.08, 0.44, 0.36],
      ["Cuarentena", 34, 27, "Resiste el escudo de cuarentena de la red", "Cuarentena", "Sombra de Gaia", "quarantine", 0.16, 0.62, 0.62],
      ["Sombra de Gaia", 32, 32, "Avanza bajo la sombra del planeta", "Sombra de Gaia", "Anillo de sat\xE9lites", "gaia-shadow", 0.12, 0.52, 0.54],
      ["Anillo de sat\xE9lites", 34, 36, "Alcanza el anillo; Iria sigue sin responder", "Anillo de sat\xE9lites", "Anillo de sat\xE9lites", "ring-arrival", 0.18, 0.64, 0.7]
    ].map((stage) => immutable3(stage))),
    events: immutable3([
      { id: "s1-v2-gaia-beacon", type: "gaia-beacon", at: 3, destinationId: "gaia-satellite-ring" }
    ].map((event2) => immutable3(event2))),
    service: null,
    encounters: immutable3([
      encounter2(3, [1, ROSTERS2.watch, 9]),
      encounter2(4, [2, ROSTERS2.watch, 8]),
      encounter2(7, [2, ROSTERS2.net, 8], { repairAt: 16 }),
      encounter2(5, null, { comets: true }),
      encounter2(8, [3, ROSTERS2.quarantine, 7]),
      encounter2(9, [2, ROSTERS2.net, 7], { repairAt: 16 }),
      encounter2(10, [3, ROSTERS2.quarantine, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 3 ? "gaia-net" : stageIndex < 5 ? "quarantine" : "gaia-approach";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1), leave = smooth(p, 0, 0.18);
      return {
        // La estación de Chronos ya no está: este viaje empieza lejos de ella.
        station: immutable3({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        // Gaia ya ocupa el cielo y sigue creciendo hasta el anillo.
        planet: immutable3({
          x: 0.7 - 0.12 * approach2,
          y: 0.09 + 0.05 * approach2,
          scale: 0.3 + 0.42 * approach2,
          rotation: 0.04 * p,
          visible: true,
          alpha: 1
        }),
        // Atlas espera al final del sector (S1-V5): aquí no se dibuja su baliza.
        beacon: immutable3({
          x: 0.46 - 0.3 * leave,
          y: 0.3 + 0.8 * leave,
          scale: 0.22 * (1 - 0.7 * leave),
          visible: false,
          alpha: 0,
          active: false
        }),
        relay: immutable3({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable3({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable3({
          travel: p,
          offsetX: -0.1 * p,
          offsetY: 1.6 * p,
          speed: 0.45 + 0.25 * smooth(p, 0.1, 0.4),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.18
        }),
        debris: immutable3({
          visible: !arrived && stageIndex >= 1,
          travel: p,
          directionX: -0.18,
          directionY: 0.98,
          depth: 0.3,
          density: stageIndex === 3 ? 0.12 : 0.3
        })
      };
    }
  });

  // src/game/progression/voyages/s1-v3-evacuee-escort.js
  var immutable4 = (object2) => Object.freeze(object2);
  var ROSTERS3 = immutable4({
    hunters: immutable4(["raider", "raider", "scout"]),
    alpha: immutable4(["interceptor", "raider", "interceptor", "scout"])
  });
  var encounter3 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable4({
    patrol: patrol && immutable4({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S1_V3_EVACUEE_ESCORT = immutable4({
    id: "S1-V3",
    sector: 1,
    number: 3,
    title: "Escolta a los evacuados",
    chapter: 3,
    version: "s1-v3-voyage-v1",
    saveKey: "neonCronium.voyage.S1-V3.v1",
    routeId: "gaia-evacuee-escort",
    eventPrefix: "s1-v3",
    baseGoal: 36,
    origin: "Anillo de sat\xE9lites",
    destination: "\xD3rbita alta de Gaia",
    arrivalDestinationId: "gaia-high-orbit",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S1-V3 voyage checkpoint",
    stages: immutable4([
      ["Naves sin permiso", 30, 5, "Localiza a los evacuados de Chronos", "Anillo de sat\xE9lites", "Columna civil", "civilian-contact", 0.1, 0.52, 0.34],
      ["Columna civil", 32, 11, "Mantente junto a la columna y recupera su CRONIUM", "Columna civil", "Cazadores del C-17", "escort-start", 0.12, 0.56, 0.46],
      ["Cazadores del C-17", 34, 17, "Derriba a los perseguidores antes de que alcancen la columna", "Cazadores del C-17", "Paso estrecho", "hunter-wave", 0.14, 0.6, 0.6],
      ["Paso estrecho", 30, 22, "Abre paso entre restos para las naves lentas", "Paso estrecho", "Alfa del C-17", "narrow-pass", 0.16, 0.62, 0.52],
      ["Alfa del C-17", 34, 29, "Resiste al interceptor Alfa que lidera la caza", "Alfa del C-17", "\xD3rbita alta", "alpha-hunt", 0.18, 0.66, 0.7],
      ["\xD3rbita alta", 34, 36, "Lleva a los evacuados hasta la \xF3rbita alta de Gaia", "\xD3rbita alta", "\xD3rbita alta de Gaia", "high-orbit-arrival", 0.12, 0.58, 0.58]
    ].map((stage) => immutable4(stage))),
    events: immutable4([]),
    service: null,
    encounters: immutable4([
      encounter3(3, [2, ROSTERS3.hunters, 8]),
      encounter3(4, [2, ROSTERS3.hunters, 7]),
      encounter3(8, [3, ROSTERS3.hunters, 6], { repairAt: 16 }),
      encounter3(7, [2, ROSTERS3.alpha, 8], { comets: true }),
      encounter3(9, [3, ROSTERS3.alpha, 6], { repairAt: 18 }),
      encounter3(10, [3, ROSTERS3.alpha, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "escort" : stageIndex < 5 ? "hunt" : "gaia-approach";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable4({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable4({
          x: 0.62 - 0.1 * approach2,
          y: 0.12 + 0.04 * approach2,
          scale: 0.58 + 0.3 * approach2,
          rotation: 0.05 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable4({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable4({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable4({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable4({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.24
        }),
        debris: immutable4({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex === 3 ? 0.7 : 0.34
        })
      };
    }
  });

  // src/game/progression/voyages/s1-v4-false-signal.js
  var immutable5 = (object2) => Object.freeze(object2);
  var ROSTERS4 = immutable5({
    decoys: immutable5(["scout", "scout", "raider"]),
    escort: immutable5(["interceptor", "raider", "scout", "raider"])
  });
  var encounter4 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable5({
    patrol: patrol && immutable5({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S1_V4_FALSE_SIGNAL = immutable5({
    id: "S1-V4",
    sector: 1,
    number: 4,
    title: "Sigue la se\xF1al falsa",
    chapter: 4,
    version: "s1-v4-voyage-v1",
    saveKey: "neonCronium.voyage.S1-V4.v1",
    routeId: "gaia-false-signal",
    eventPrefix: "s1-v4",
    baseGoal: 36,
    origin: "\xD3rbita alta de Gaia",
    destination: "Lado nocturno de Gaia",
    arrivalDestinationId: "gaia-night-side",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S1-V4 voyage checkpoint",
    stages: immutable5([
      ["Tu propia firma", 30, 4, "N-7 capta tu firma emitida desde otra nave", "\xD3rbita alta de Gaia", "Terminador", "false-signature", 0.1, 0.46, 0.36],
      ["El terminador", 32, 9, "Cruza la l\xEDnea entre el d\xEDa y la noche de Gaia", "Terminador", "Lado nocturno", "terminator", 0.08, 0.34, 0.42],
      ["Se\xF1uelos", 32, 15, "Distingue los se\xF1uelos de la nave que emite tu firma", "Lado nocturno", "Rastro de la escolta", "decoys", 0.06, 0.24, 0.54],
      ["Solo luces y disparos", 34, 21, "Avanza a oscuras gui\xE1ndote por los disparos", "Rastro de la escolta", "Ciudades dormidas", "darkness", 0.04, 0.16, 0.62],
      ["Ciudades dormidas", 30, 26, "Sobrevuela las luces de Gaia sin perder el rastro", "Ciudades dormidas", "Escolta del C-17", "sleeping-cities", 0.06, 0.22, 0.5],
      ["Escolta del C-17", 34, 31, "Alcanza a la escolta: huye da\xF1ada hacia el acceso", "Escolta del C-17", "Acceso nocturno", "escort-chase", 0.08, 0.28, 0.72],
      ["Acceso nocturno", 32, 36, "Llega al acceso nocturno; Atlas vigila al otro lado", "Acceso nocturno", "Lado nocturno de Gaia", "night-arrival", 0.1, 0.32, 0.6]
    ].map((stage) => immutable5(stage))),
    events: immutable5([]),
    service: null,
    encounters: immutable5([
      encounter4(3, [2, ROSTERS4.decoys, 8]),
      encounter4(4, [2, ROSTERS4.decoys, 8]),
      encounter4(7, [3, ROSTERS4.decoys, 7], { repairAt: 16 }),
      encounter4(5, [2, ROSTERS4.escort, 8], { comets: true }),
      encounter4(8, [3, ROSTERS4.escort, 7]),
      encounter4(9, [3, ROSTERS4.escort, 6], { repairAt: 18 }),
      encounter4(10, [3, ROSTERS4.escort, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "gaia-approach" : "night-side";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const night = smooth(p, 0.1, 0.45);
      return {
        station: immutable5({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable5({
          x: 0.6 - 0.3 * night,
          y: 0.14 + 0.02 * night,
          scale: 0.82 - 0.12 * night,
          rotation: 0.02 + 0.05 * p,
          visible: true,
          alpha: 1 - 0.55 * night
        }),
        beacon: immutable5({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable5({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable5({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable5({
          travel: p,
          offsetX: -0.06 * p,
          offsetY: 1.5 * p,
          speed: 0.48 + 0.2 * smooth(p, 0.2, 0.6),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.12
        }),
        debris: immutable5({
          visible: !arrived && stageIndex >= 2,
          travel: p,
          directionX: -0.14,
          directionY: 0.99,
          depth: 0.3,
          density: 0.2
        })
      };
    }
  });

  // src/game/progression/voyages/s1-v5-convince-atlas.js
  var immutable6 = (object2) => Object.freeze(object2);
  var ROSTERS5 = immutable6({
    pickets: immutable6(["scout", "interceptor", "scout"]),
    defence: immutable6(["interceptor", "scout", "interceptor", "raider"])
  });
  var encounter5 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable6({
    patrol: patrol && immutable6({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S1_V5_CONVINCE_ATLAS = immutable6({
    id: "S1-V5",
    sector: 1,
    number: 5,
    title: "Convence a Atlas",
    boss: "atlas",
    chapter: 5,
    version: "s1-v5-voyage-v1",
    saveKey: "neonCronium.voyage.S1-V5.v1",
    routeId: "gaia-atlas-gate",
    eventPrefix: "s1-v5",
    baseGoal: 36,
    origin: "Lado nocturno de Gaia",
    destination: "Acceso orbital de Gaia Nova",
    arrivalDestinationId: "gaia-atlas-approach",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S1-V5 voyage checkpoint",
    stages: immutable6([
      ["Amanecer en Gaia", 30, 4, "Sal del lado nocturno hacia la luz del acceso", "Lado nocturno de Gaia", "Cintur\xF3n de meteoritos", "gaia-dawn", 0.1, 0.5, 0.36],
      ["Lluvia en el acceso", 34, 9, "Cruza la lluvia de meteoritos del acceso", "Cintur\xF3n de meteoritos", "Piquetes de Gaia", "meteor-rain", 0.14, 0.58, 0.58],
      ["Piquetes de Gaia", 32, 14, "Atraviesa los piquetes sin responder al fuego de Gaia", "Piquetes de Gaia", "Haz de enlace", "pickets", 0.12, 0.56, 0.52],
      ["Haz de enlace", 32, 19, "Dos sat\xE9lites enlazados por un haz cierran el paso", "Haz de enlace", "Defensa orbital", "linked-beam", 0.14, 0.6, 0.62],
      ["Defensa orbital", 34, 24, "Resiste la defensa orbital mientras Atlas se activa", "Defensa orbital", "Baliza de Atlas", "orbital-defence", 0.16, 0.62, 0.66],
      ["Baliza de Atlas", 30, 28, "Atlas exige que detengas los motores", "Baliza de Atlas", "Corredor bloqueado", "atlas-identification", 0.14, 0.56, 0.6],
      ["Corredor bloqueado", 32, 32, "Ac\xE9rcate al escudo de Atlas con el registro", "Corredor bloqueado", "Acceso orbital", "blocked-corridor", 0.16, 0.6, 0.7],
      ["Acceso orbital", 32, 36, "Llega ante Atlas: tendr\xE1 que verificar el registro", "Acceso orbital", "Acceso orbital de Gaia Nova", "atlas-gate", 0.18, 0.62, 0.78]
    ].map((stage) => immutable6(stage))),
    events: immutable6([
      { id: "s1-v5-gaia-beacon", type: "gaia-beacon", at: 160, destinationId: "gaia-atlas-approach" }
    ].map((event2) => immutable6(event2))),
    service: null,
    encounters: immutable6([
      encounter5(3, [2, ROSTERS5.pickets, 8]),
      encounter5(9, [2, ROSTERS5.pickets, 8], { comets: true }),
      encounter5(7, [3, ROSTERS5.pickets, 7], { repairAt: 16 }),
      encounter5(8, [3, ROSTERS5.defence, 7]),
      encounter5(9, [3, ROSTERS5.defence, 6], { repairAt: 18 }),
      encounter5(5, [2, ROSTERS5.defence, 8]),
      encounter5(10, [3, ROSTERS5.defence, 6]),
      encounter5(10, [3, ROSTERS5.defence, 6], { repairAt: 14 })
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "gaia-approach" : "atlas-approach";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const dawn = smooth(p, 0, 0.25), gate = smooth(p, 0.55, 1);
      return {
        station: immutable6({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable6({
          x: 0.34 + 0.2 * dawn,
          y: 0.16 - 0.04 * gate,
          scale: 0.72 + 0.2 * gate,
          rotation: 0.07 + 0.04 * p,
          visible: true,
          alpha: 0.45 + 0.55 * dawn
        }),
        // Atlas se ve venir: su plataforma crece al frente en la segunda mitad.
        beacon: immutable6({
          x: 0.54,
          y: 0.14 + 0.1 * gate,
          scale: 0.03 + 0.2 * gate,
          visible: p >= 0.55,
          alpha: 1,
          active: stageIndex >= 5
        }),
        relay: immutable6({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable6({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable6({
          travel: p,
          offsetX: -0.1 * p,
          offsetY: 1.9 * p,
          speed: 0.5 + 0.3 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.22
        }),
        debris: immutable6({
          visible: !arrived && stageIndex <= 2,
          travel: p,
          directionX: -0.22,
          directionY: 0.97,
          depth: 0.35,
          density: stageIndex === 1 ? 0.7 : 0.3
        })
      };
    }
  });

  // src/game/progression/voyages/s2-v1-gaia-departure.js
  var immutable7 = (object2) => Object.freeze(object2);
  var ROSTERS6 = immutable7({
    rogue: immutable7(["scout", "scout", "interceptor"]),
    rogueRaid: immutable7(["interceptor", "raider", "scout"])
  });
  var encounter6 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable7({
    patrol: patrol && immutable7({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VULKAR_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S2_V1_GAIA_DEPARTURE = immutable7({
    id: "S2-V1",
    sector: 2,
    number: 1,
    title: "Sal de Gaia con paso libre",
    planet: "volcanico",
    chapter: 6,
    version: "s2-v1-voyage-v1",
    saveKey: "neonCronium.voyage.S2-V1.v1",
    routeId: "gaia-free-passage",
    eventPrefix: "s2-v1",
    baseGoal: 36,
    origin: "Gaia Nova",
    destination: "Borde del sistema de Gaia",
    arrivalDestinationId: "gaia-system-edge",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S2-V1 voyage checkpoint",
    stages: immutable7([
      ["Paso libre", 30, 4, "Despega de Gaia con la autorizaci\xF3n de Iria", "Gaia Nova", "Tr\xE1fico civil", "free-passage", 0.1, 0.52, 0.3],
      ["Tr\xE1fico civil", 32, 10, "Cruza el tr\xE1fico de Gaia sin da\xF1ar a sus naves", "Tr\xE1fico civil", "Sat\xE9lites sordos", "civil-traffic", 0.1, 0.54, 0.36],
      ["Sat\xE9lites sordos", 32, 16, "Unidades CH desconectadas no reciben la orden de Iria", "Sat\xE9lites sordos", "Malla rota", "rogue-units", 0.12, 0.58, 0.52],
      ["Malla rota", 30, 21, "Atraviesa la malla rota del per\xEDmetro", "Malla rota", "Gaia atr\xE1s", "broken-mesh", 0.12, 0.56, 0.46],
      ["Gaia atr\xE1s", 32, 26, "Deja atr\xE1s Gaia; Vulkar aparece en el horizonte", "Gaia atr\xE1s", "Primer resplandor", "gaia-astern", 0.08, 0.48, 0.4],
      ["Primer resplandor", 32, 31, "Sigue el resplandor rojo de las forjas", "Primer resplandor", "Borde del sistema", "first-glow", 0.12, 0.52, 0.56],
      ["Borde del sistema", 34, 36, "Alcanza el borde del sistema de Gaia", "Borde del sistema", "Borde del sistema de Gaia", "system-edge", 0.14, 0.56, 0.62]
    ].map((stage) => immutable7(stage))),
    events: immutable7([]),
    service: null,
    encounters: immutable7([
      encounter6(3, [1, ROSTERS6.rogue, 9]),
      encounter6(4, [2, ROSTERS6.rogue, 8]),
      encounter6(7, [3, ROSTERS6.rogue, 7], { repairAt: 16 }),
      encounter6(5, [2, ROSTERS6.rogue, 8]),
      encounter6(5, null, { comets: true }),
      encounter6(8, [3, ROSTERS6.rogueRaid, 7], { repairAt: 16 }),
      encounter6(9, [3, ROSTERS6.rogueRaid, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "gaia-departure" : "deep-space";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable7({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable7({
          x: 0.8 - 0.1 * approach2,
          y: 0.1 + 0.04 * approach2,
          scale: 0.04 + 0.2 * approach2,
          rotation: 0.03 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable7({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable7({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable7({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable7({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.26
        }),
        debris: immutable7({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex >= 4 ? 0.2 : 0.34
        })
      };
    }
  });

  // src/game/progression/voyages/s2-v2-follow-c17.js
  var immutable8 = (object2) => Object.freeze(object2);
  var ROSTERS7 = immutable8({
    escort: immutable8(["raider", "raider", "interceptor"]),
    rearguard: immutable8(["interceptor", "raider", "interceptor", "scout"])
  });
  var encounter7 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable8({
    patrol: patrol && immutable8({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VULKAR_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S2_V2_FOLLOW_C17 = immutable8({
    id: "S2-V2",
    sector: 2,
    number: 2,
    title: "Sigue al C-17",
    planet: "volcanico",
    chapter: 7,
    version: "s2-v2-voyage-v1",
    saveKey: "neonCronium.voyage.S2-V2.v1",
    routeId: "c17-pursuit",
    eventPrefix: "s2-v2",
    baseGoal: 36,
    origin: "Borde del sistema de Gaia",
    destination: "Ruta de carga abandonada",
    arrivalDestinationId: "abandoned-cargo-route",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S2-V2 voyage checkpoint",
    stages: immutable8([
      ["Una nave negra", 30, 5, "El C-17 aparece al frente: no lo pierdas de vista", "Borde del sistema de Gaia", "Estela del C-17", "black-ship", 0.1, 0.5, 0.42],
      ["Estela del C-17", 32, 11, "Sigue su estela entre los restos de su escolta", "Estela del C-17", "Escoltas", "c17-wake", 0.12, 0.54, 0.52],
      ["Escoltas", 32, 17, "Derriba a las escoltas que cubren la huida", "Escoltas", "Ruta de carga", "escorts", 0.14, 0.58, 0.64],
      ["Ruta de carga", 30, 22, "Entra en la ruta de carga abandonada", "Ruta de carga", "Contenedores a la deriva", "cargo-route", 0.12, 0.54, 0.48],
      ["Contenedores a la deriva", 32, 27, "Esquiva los contenedores que suelta el C-17", "Contenedores a la deriva", "Retaguardia", "drifting-cargo", 0.16, 0.58, 0.58],
      ["Retaguardia", 32, 32, "Rompe la retaguardia antes de que cierre la ruta", "Retaguardia", "Fin de la ruta", "rearguard", 0.16, 0.6, 0.7],
      ["Fin de la ruta", 34, 36, "Llega al final de la ruta: el C-17 se escapa hacia Vulkar", "Fin de la ruta", "Ruta de carga abandonada", "route-end", 0.14, 0.56, 0.62]
    ].map((stage) => immutable8(stage))),
    events: immutable8([]),
    service: null,
    encounters: immutable8([
      encounter7(4, [2, ROSTERS7.escort, 8]),
      encounter7(7, [2, ROSTERS7.escort, 7]),
      encounter7(8, [3, ROSTERS7.escort, 6], { repairAt: 16 }),
      encounter7(3, [2, ROSTERS7.escort, 8]),
      encounter7(9, [2, ROSTERS7.rearguard, 7], { comets: true }),
      encounter7(9, [3, ROSTERS7.rearguard, 6], { repairAt: 16 }),
      encounter7(10, [3, ROSTERS7.rearguard, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "pursuit" : "cargo-route";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable8({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable8({
          x: 0.72 - 0.14 * approach2,
          y: 0.1 + 0.04 * approach2,
          scale: 0.16 + 0.22 * approach2,
          rotation: 0.03 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable8({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable8({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable8({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable8({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.26
        }),
        debris: immutable8({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex === 4 ? 0.7 : 0.36
        })
      };
    }
  });

  // src/game/progression/voyages/s2-v3-slag-belt.js
  var immutable9 = (object2) => Object.freeze(object2);
  var ROSTERS8 = immutable9({
    scavengers: immutable9(["raider", "scout", "raider"]),
    lava: immutable9(["interceptor", "raider", "raider", "scout"])
  });
  var encounter8 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable9({
    patrol: patrol && immutable9({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VULKAR_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S2_V3_SLAG_BELT = immutable9({
    id: "S2-V3",
    sector: 2,
    number: 3,
    title: "Cruza el cintur\xF3n de escoria",
    planet: "volcanico",
    chapter: 8,
    version: "s2-v3-voyage-v1",
    saveKey: "neonCronium.voyage.S2-V3.v1",
    routeId: "slag-belt",
    eventPrefix: "s2-v3",
    baseGoal: 36,
    origin: "Ruta de carga abandonada",
    destination: "Cintur\xF3n de escoria",
    arrivalDestinationId: "vulkar-slag-belt",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S2-V3 voyage checkpoint",
    stages: immutable9([
      ["Primeras brasas", 30, 4, "Entra en el cintur\xF3n siguiendo el CRONIUM fundido", "Ruta de carga abandonada", "Escoria fina", "first-embers", 0.12, 0.5, 0.4],
      ["Escoria fina", 32, 9, "Recupera el CRONIUM entre la escoria fina", "Escoria fina", "Lluvia de escoria", "fine-slag", 0.14, 0.54, 0.48],
      ["Lluvia de escoria", 34, 15, "Cruza la lluvia de escoria incandescente", "Lluvia de escoria", "Chatarreros", "slag-rain", 0.18, 0.58, 0.62],
      ["Chatarreros", 32, 20, "Los chatarreros del sindicato reclaman el bot\xEDn", "Chatarreros", "N\xFAcleo de lava", "scavengers", 0.14, 0.56, 0.58],
      ["N\xFAcleo de lava", 34, 26, "Un n\xFAcleo de lava se parte al calentarse", "N\xFAcleo de lava", "Vetas de CRONIUM", "lava-core", 0.18, 0.6, 0.7],
      ["Vetas de CRONIUM", 32, 31, "Rescata las vetas antes de que se fundan", "Vetas de CRONIUM", "Salida del cintur\xF3n", "cronium-veins", 0.16, 0.58, 0.6],
      ["Salida del cintur\xF3n", 32, 36, "Sal del cintur\xF3n hacia la \xF3rbita de Vulkar", "Salida del cintur\xF3n", "Cintur\xF3n de escoria", "belt-exit", 0.14, 0.54, 0.56]
    ].map((stage) => immutable9(stage))),
    events: immutable9([]),
    service: null,
    encounters: immutable9([
      encounter8(5, [2, ROSTERS8.scavengers, 8]),
      encounter8(7, [2, ROSTERS8.scavengers, 8]),
      encounter8(9, [2, ROSTERS8.scavengers, 7], { comets: true }),
      encounter8(8, [3, ROSTERS8.scavengers, 7], { repairAt: 16 }),
      encounter8(9, [3, ROSTERS8.lava, 6]),
      encounter8(8, [3, ROSTERS8.lava, 6], { repairAt: 16 }),
      encounter8(10, [3, ROSTERS8.lava, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "slag-belt" : "vulkar-approach";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable9({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable9({
          x: 0.66 - 0.12 * approach2,
          y: 0.1 + 0.04 * approach2,
          scale: 0.3 + 0.24 * approach2,
          rotation: 0.03 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable9({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable9({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable9({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable9({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.26
        }),
        debris: immutable9({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex === 2 ? 0.8 : 0.5
        })
      };
    }
  });

  // src/game/progression/voyages/s2-v4-yara-call.js
  var immutable10 = (object2) => Object.freeze(object2);
  var ROSTERS9 = immutable10({
    mines: immutable10(["scout", "raider", "scout"]),
    forge: immutable10(["interceptor", "scout", "interceptor", "raider"])
  });
  var encounter9 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable10({
    patrol: patrol && immutable10({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VULKAR_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S2_V4_YARA_CALL = immutable10({
    id: "S2-V4",
    sector: 2,
    number: 4,
    title: "Responde a la llamada de Yara",
    planet: "volcanico",
    chapter: 9,
    version: "s2-v4-voyage-v1",
    saveKey: "neonCronium.voyage.S2-V4.v1",
    routeId: "yara-call",
    eventPrefix: "s2-v4",
    baseGoal: 36,
    origin: "Cintur\xF3n de escoria",
    destination: "\xD3rbita alta de Vulkar",
    arrivalDestinationId: "vulkar-high-orbit",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S2-V4 voyage checkpoint",
    stages: immutable10([
      ["Llamada de Yara", 30, 4, "Yara Kest pide ayuda desde la refiner\xEDa", "Cintur\xF3n de escoria", "Nubes de ceniza", "yara-call", 0.14, 0.48, 0.36],
      ["Nubes de ceniza", 32, 10, "Avanza entre la ceniza sin perder la se\xF1al", "Nubes de ceniza", "Campo de minas", "ash-clouds", 0.2, 0.36, 0.46],
      ["Campo de minas", 32, 15, "Abre paso entre las minas de la refiner\xEDa", "Campo de minas", "Cargueros atrapados", "minefield", 0.16, 0.44, 0.58],
      ["Cargueros atrapados", 34, 21, "Protege a los cargueros de obreros", "Cargueros atrapados", "Bater\xEDa de forja", "trapped-freighters", 0.16, 0.5, 0.62],
      ["Bater\xEDa de forja", 34, 27, "Silencia la bater\xEDa de forja de tres torretas", "Bater\xEDa de forja", "Rampa de salida", "forge-battery", 0.18, 0.54, 0.72],
      ["Rampa de salida", 30, 32, "Escolta a los cargueros fuera de la ceniza", "Rampa de salida", "\xD3rbita alta", "exit-ramp", 0.14, 0.5, 0.58],
      ["\xD3rbita alta", 32, 36, "Llega a la \xF3rbita alta: Yara te debe una", "\xD3rbita alta", "\xD3rbita alta de Vulkar", "high-orbit", 0.12, 0.54, 0.54]
    ].map((stage) => immutable10(stage))),
    events: immutable10([]),
    service: null,
    encounters: immutable10([
      encounter9(4, [2, ROSTERS9.mines, 8]),
      encounter9(5, [2, ROSTERS9.mines, 8]),
      encounter9(8, [3, ROSTERS9.mines, 7], { repairAt: 16 }),
      encounter9(7, [3, ROSTERS9.forge, 7]),
      encounter9(9, [3, ROSTERS9.forge, 6], { repairAt: 18 }),
      encounter9(9, [2, ROSTERS9.forge, 7], { comets: true }),
      encounter9(10, [3, ROSTERS9.forge, 6])
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "ash-clouds" : "vulkar-orbit";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable10({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable10({
          x: 0.6 - 0.12 * approach2,
          y: 0.1 + 0.04 * approach2,
          scale: 0.48 + 0.24 * approach2,
          rotation: 0.03 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable10({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable10({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable10({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable10({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.26
        }),
        debris: immutable10({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex === 2 ? 0.6 : 0.3
        })
      };
    }
  });

  // src/game/progression/voyages/s2-v5-vulkar-titan.js
  var immutable11 = (object2) => Object.freeze(object2);
  var ROSTERS10 = immutable11({
    drones: immutable11(["interceptor", "interceptor", "scout"]),
    titanGuard: immutable11(["interceptor", "raider", "interceptor", "raider"])
  });
  var encounter10 = (profile2, patrol, { comets = false, repairAt = null } = {}) => immutable11({
    patrol: patrol && immutable11({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VULKAR_HAZARD_PROFILES[profile2],
    comets,
    repairAt
  });
  var S2_V5_VULKAR_TITAN = immutable11({
    id: "S2-V5",
    sector: 2,
    number: 5,
    title: "Det\xE9n al Tit\xE1n de Vulkar",
    planet: "volcanico",
    chapter: 10,
    version: "s2-v5-voyage-v1",
    saveKey: "neonCronium.voyage.S2-V5.v1",
    routeId: "vulkar-titan",
    eventPrefix: "s2-v5",
    baseGoal: 36,
    origin: "\xD3rbita alta de Vulkar",
    destination: "Descenso a las forjas",
    arrivalDestinationId: "vulkar-forges",
    cinematicDuration: 0,
    recoveryAt: 0,
    invalidCheckpointMessage: "Invalid S2-V5 voyage checkpoint",
    stages: immutable11([
      ["Rastro de descarga", 30, 4, "Sigue el rastro de la descarga del C-17", "\xD3rbita alta de Vulkar", "Columnas de plasma", "unload-trail", 0.14, 0.52, 0.44],
      ["Columnas de plasma", 34, 9, "Atento a los avisos: el planeta escupe plasma", "Columnas de plasma", "Drones de escoria", "plasma-columns", 0.18, 0.56, 0.58],
      ["Drones de escoria", 32, 14, "Una pareja de drones de escoria te corta el paso", "Drones de escoria", "Puerta de las forjas", "slag-drones", 0.16, 0.58, 0.66],
      ["Puerta de las forjas", 32, 19, "Cruza la puerta de las forjas abierta por el C-17", "Puerta de las forjas", "Sombra del Tit\xE1n", "forge-gate", 0.16, 0.56, 0.62],
      ["Sombra del Tit\xE1n", 34, 24, "Algo enorme se mueve bajo la lava", "Sombra del Tit\xE1n", "Guardia del Tit\xE1n", "titan-shadow", 0.2, 0.6, 0.7],
      ["Guardia del Tit\xE1n", 32, 28, "Rompe la guardia que protege el descenso", "Guardia del Tit\xE1n", "Calor extremo", "titan-guard", 0.18, 0.6, 0.74],
      ["Calor extremo", 30, 32, "Aguanta el calor del descenso", "Calor extremo", "Descenso", "extreme-heat", 0.2, 0.62, 0.68],
      ["Descenso a las forjas", 34, 36, "Alcanza el descenso: el Tit\xE1n te espera", "Descenso", "Descenso a las forjas", "forge-descent", 0.22, 0.64, 0.78]
    ].map((stage) => immutable11(stage))),
    events: immutable11([]),
    service: null,
    encounters: immutable11([
      encounter10(7, [2, ROSTERS10.drones, 8]),
      encounter10(9, [2, ROSTERS10.drones, 7], { comets: true }),
      encounter10(8, [3, ROSTERS10.drones, 7], { repairAt: 16 }),
      encounter10(7, [3, ROSTERS10.titanGuard, 7]),
      encounter10(9, [3, ROSTERS10.titanGuard, 6], { repairAt: 18 }),
      encounter10(10, [3, ROSTERS10.titanGuard, 6]),
      encounter10(9, [3, ROSTERS10.titanGuard, 6], { comets: true }),
      encounter10(10, [3, ROSTERS10.titanGuard, 6], { repairAt: 14 })
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "plasma" : "forge-descent";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const approach2 = smooth(p, 0, 1);
      return {
        station: immutable11({ x: 0.5, y: 1.4, scale: 0.01, rotation: 0, visible: false, alpha: 0, state: "ruptured" }),
        planet: immutable11({
          x: 0.56 - 0.1 * approach2,
          y: 0.1 + 0.04 * approach2,
          scale: 0.66 + 0.3 * approach2,
          rotation: 0.03 * p,
          visible: true,
          alpha: 1
        }),
        beacon: immutable11({ x: 0.5, y: 1.2, scale: 0, visible: false, alpha: 0, active: false }),
        relay: immutable11({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable11({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable11({
          travel: p,
          offsetX: -0.08 * p,
          offsetY: 1.8 * p,
          speed: 0.5 + 0.25 * smooth(p, 0.1, 0.5),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: 0.26
        }),
        debris: immutable11({
          visible: !arrived,
          travel: p,
          directionX: -0.2,
          directionY: 0.98,
          depth: 0.35,
          density: stageIndex >= 4 ? 0.4 : 0.3
        })
      };
    }
  });

  // src/game/progression/sectors/s1-gaia.js
  var immutable12 = (object2) => Object.freeze(object2);
  var ROSTERS11 = immutable12({
    escape: immutable12(["raider", "scout"]),
    flank: immutable12(["raider", "tracker", "scout"]),
    mines: immutable12(["sower", "raider", "interceptor"]),
    shield: immutable12(["aegis", "interceptor", "tracker", "scout"]),
    elite: immutable12(["alpha", "aegis", "interceptor", "sower"]),
    gate: immutable12(["interceptor", "tracker", "aegis", "raider"])
  });
  var HORDE = immutable12({ every: 14, size: 5 });
  var encounter11 = (profile2, patrol, { comets = false, repairAt = null, boss = null, attackers = 2, horde = null } = {}) => immutable12({
    patrol: patrol && immutable12({ cap: patrol[0], roster: patrol[1], gap: patrol[2] }),
    hazards: VOYAGE_HAZARD_PROFILES[profile2],
    comets,
    repairAt,
    boss: boss && immutable12(boss),
    attackers,
    horde
  });
  var S1_GAIA = immutable12({
    id: "S1",
    sector: 1,
    number: 1,
    title: "Escapa de Chronos",
    boss: "atlas",
    // El tramo 1 abre con el inicio de Chronos y el tutorial (propietario, 23/10/2026).
    intro: true,
    chapter: 1,
    version: "s1-sector-v1",
    saveKey: "neonCronium.sector.S1.v1",
    routeId: "sector-1-gaia",
    eventPrefix: "sector-1",
    baseGoal: 60,
    origin: "Centro Chronos",
    destination: "Acceso orbital de Gaia Nova",
    arrivalDestinationId: "gaia-atlas-approach",
    cinematicDuration: 90,
    recoveryAt: 9,
    invalidCheckpointMessage: "Invalid sector 1 checkpoint",
    stages: immutable12([
      ["Emergencia en Chronos", 48, 5, "Recupera los primeros fragmentos del reactor", "Chronos \xB7 reactor", "Campo de restos", "reactor-strike", 0.18, 0.7, 0.4],
      ["Campo de restos", 50, 11, "Cruza los restos; algo te sigue por detr\xE1s", "Campo de restos", "Salida orbital", "wreckage-crossing", 0.15, 0.8, 0.52],
      ["La red exterior", 52, 17, "La red de Gaia siembra minas en tu ruta", "Salida orbital", "Red exterior de Gaia", "net-edge", 0.12, 0.6, 0.58],
      ["Cuarentena", 52, 23, "Rompe los escudos de la \xC9gida y sigue adelante", "Red exterior de Gaia", "Anillo de sat\xE9lites", "quarantine", 0.16, 0.62, 0.64],
      ["El sat\xE9lite CH-03", 56, 27, "Derriba el sat\xE9lite de defensa que cierra el anillo", "Anillo de sat\xE9lites", "Corredor de enlace", "sub-boss", 0.18, 0.66, 0.7],
      ["Enlace C9", 48, 27, "Repara en C9 y prueba tu nave en el corredor", "Corredor de enlace", "Lado nocturno", "service-stop", 0.06, 0.34, 0.3],
      ["El Alfa", 54, 38, "El Alfa del C-17 lidera la caza en la oscuridad", "Lado nocturno", "Escolta del C-17", "alpha-hunt", 0.08, 0.28, 0.72],
      ["Lluvia en el acceso", 52, 44, "Cruza la lluvia de meteoritos sin dejar de combatir", "Escolta del C-17", "Piquetes de Gaia", "meteor-rain", 0.14, 0.58, 0.76],
      ["Defensa orbital", 54, 50, "Resiste la defensa orbital mientras Atlas se activa", "Piquetes de Gaia", "Acceso orbital", "orbital-defence", 0.16, 0.62, 0.82],
      ["Atlas", 60, 54, "Vence a Atlas para que verifique el registro", "Acceso orbital", "Acceso orbital de Gaia Nova", "boss", 0.18, 0.62, 0.9]
    ].map((stage) => immutable12(stage))),
    events: immutable12([
      { id: "sector-1-intruder", type: "attack", at: 2.25, attackerId: "cronium-raider", targetId: "chronos-reactor" },
      { id: "sector-1-breach", type: "rupture", at: 9, resourceId: "cronium", cause: "hostile-reactor-strike" },
      { id: "sector-1-perimeter-exit", type: "departure", at: 108, originId: "chronos-scientific-centre" },
      { id: "sector-1-gaia-beacon", type: "gaia-beacon", at: 470, destinationId: "gaia-atlas-approach" }
    ].map((event2) => immutable12(event2))),
    service: immutable12({
      stage: 6,
      approach: 1.2,
      visibleApproach: 2.4,
      departure: 2.4,
      renamedStage: "Corredor de Gaia",
      renamedObjective: "Prueba tu nave en el corredor; C9 vuelve tras vencer a Atlas"
    }),
    encounters: immutable12([
      encounter11(1, [2, ROSTERS11.escape, 8], { attackers: 1 }),
      encounter11(2, [3, ROSTERS11.flank, 7], { attackers: 1 }),
      encounter11(3, [3, ROSTERS11.mines, 7], { repairAt: 30, horde: HORDE }),
      encounter11(7, [4, ROSTERS11.shield, 6], { comets: "aimed" }),
      encounter11(4, [2, ROSTERS11.flank, 9], { boss: { id: "ch03", role: "subjefe" } }),
      encounter11(5, [2, ROSTERS11.escape, 8], { attackers: 3 }),
      encounter11(8, [4, ROSTERS11.elite, 6], { repairAt: 32, attackers: 3, horde: HORDE }),
      encounter11(9, [4, ROSTERS11.elite, 6], { comets: "aimed", attackers: 3 }),
      encounter11(10, [5, ROSTERS11.gate, 5], { repairAt: 30, attackers: 3, horde: HORDE }),
      encounter11(10, [2, ROSTERS11.gate, 8], { boss: { id: "guardian-atlas", role: "jefe" } })
    ]),
    phase(stageIndex) {
      return stageIndex < 2 ? "recovery" : stageIndex < 5 ? "gaia-net" : stageIndex < 8 ? "deep-space" : "atlas-approach";
    },
    scenery({ p, stageIndex, stage, arrived }) {
      const departure = smooth(p, 0, 0.25), gate = smooth(p, 0.75, 1);
      return {
        station: immutable12({
          x: 0.48 - 0.72 * departure,
          y: 0.43 + 0.94 * departure,
          scale: 1.12 * Math.pow(0.032, departure),
          rotation: -0.1 * departure,
          visible: p < 0.25,
          alpha: 1,
          state: "ruptured"
        }),
        planet: immutable12({
          x: 0.79 - 0.4 * smooth(p, 0.2, 1),
          y: 0.08 + 0.08 * gate,
          scale: 0.02 + 0.9 * smooth(p, 0.2, 1) ** 2,
          rotation: 0.06 * p,
          visible: true,
          alpha: 0.5 + 0.5 * smooth(p, 0.1, 0.4)
        }),
        beacon: immutable12({ x: 0.54, y: 0.14 + 0.1 * gate, scale: 0.03 + 0.2 * gate, visible: p >= 0.75, alpha: 1, active: stageIndex >= 9 }),
        relay: immutable12({ visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: "approach" }),
        attacker: immutable12({ x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: "retreat" }),
        deepSpace: immutable12({
          travel: p,
          offsetX: -0.12 * p,
          offsetY: 2.2 * p,
          speed: 0.45 + 0.45 * smooth(p, 0.05, 0.3),
          alpha: 1,
          nebulaOpacity: stage.nebulaOpacity,
          starDensity: stage.starDensity,
          dustDensity: stageIndex === 5 ? 0.1 : 0.26
        }),
        debris: immutable12({
          visible: !arrived && stageIndex <= 1,
          travel: p,
          directionX: -0.26,
          directionY: 0.96,
          depth: 0.35,
          density: stageIndex === 1 ? 0.7 : 0.4
        })
      };
    }
  });

  // src/game/progression/sectors/index.js
  var SECTORS = Object.freeze([S1_GAIA]);
  var byId = new Map(SECTORS.map((ficha) => [ficha.id, ficha]));
  var getSectorFicha = (id) => byId.get(id) || null;

  // src/game/progression/voyages/index.js
  var VOYAGES = Object.freeze([
    S1_V1_CHRONOS_GAIA,
    S1_V2_GAIA_OUTER_NET,
    S1_V3_EVACUEE_ESCORT,
    S1_V4_FALSE_SIGNAL,
    S1_V5_CONVINCE_ATLAS,
    S2_V1_GAIA_DEPARTURE,
    S2_V2_FOLLOW_C17,
    S2_V3_SLAG_BELT,
    S2_V4_YARA_CALL,
    S2_V5_VULKAR_TITAN
  ]);
  var PLAYABLE_VOYAGES = Object.freeze(VOYAGES.filter((ficha) => ficha.playable !== false));
  var byRoute = new Map([...VOYAGES, ...SECTORS].map((ficha) => [ficha.routeId, ficha]));
  var getVoyageFicha = (routeId) => byRoute.get(routeId) || null;
  var rulesOf = (ficha) => ficha.encounters;
  var REFERENCE = rulesOf(S1_V1_CHRONOS_GAIA).reduce((sum, rules) => sum + stagePressure(rules), 0) / S1_V1_CHRONOS_GAIA.encounters.length;
  var FACTORS = new Map(VOYAGES.map((ficha) => [
    ficha.routeId,
    ficha === S1_V1_CHRONOS_GAIA ? 1 : calibrate(rulesOf(ficha), { voyage: voyageNumber(ficha), reference: REFERENCE })
  ]));
  function getVoyageStageRulesFor(routeId, stageNumber, mode = "normal") {
    return applyDifficulty(getVoyageStageRules(routeId, stageNumber), { factor: FACTORS.get(routeId) ?? 1, mode });
  }
  function getVoyageStageRules(routeId, stageNumber) {
    return getVoyageFicha(routeId)?.encounters[stageNumber - 1] || null;
  }

  // src/game/progression/menu-unlocks.js
  var MENU_UNLOCKS_KEY = "neonCronium.menu.v1";
  var HANGAR_STAGE = 6;
  var STAGE_COUNT = 10;
  function normalizeMenuUnlocks(raw) {
    const valid = Boolean(raw) && typeof raw === "object" && raw.version === 1 && typeof raw.hangar === "boolean" && raw.seen && typeof raw.seen === "object" && !Array.isArray(raw.seen);
    return {
      version: 1,
      hangar: valid ? raw.hangar : false,
      seen: { hangar: valid && raw.seen.hangar === true, intro: valid && raw.seen.intro === true }
    };
  }
  function menuView(sectorSave, unlocks) {
    const run = sectorSave.run, done = sectorSave.sectors[1]?.completed === true;
    const hangar = unlocks.hangar || done || (run?.stageNumber ?? 0) >= HANGAR_STAGE;
    const play = run && run.stageNumber > 1 ? { label: "CONTINUAR VIAJE", detail: `SECTOR 1 \xB7 TRAMO ${run.stageNumber}/${STAGE_COUNT}${sectorSave.sectors[1]?.beacon ? " \xB7 CON BALIZA" : ""}` } : done ? { label: "REPETIR SECTOR", detail: "SECTOR 1 COMPLETADO" } : { label: "JUGAR", detail: "SECTOR 1 \xB7 CHRONOS \u2192 GAIA" };
    return {
      play,
      hangar: { visible: hangar, isNew: hangar && !unlocks.seen.hangar },
      unlocks: { version: 1, hangar, seen: { ...unlocks.seen } }
    };
  }
  function markMenuSeen(unlocks, button) {
    return { version: 1, hangar: unlocks.hangar, seen: { ...unlocks.seen, [button]: true } };
  }

  // src/game/ship/ship-roster.js
  var SHIP_ROSTER_KEY = "neonCronium.ships.v1";
  var DEFAULT_SHIP = "aster";
  var FREE = (sector) => ({ type: "free", sector });
  var SCRAP = (price) => ({ type: "scrap", price });
  var PAID = { type: "paid" };
  var ship = (number, id, name, role, access, exclusive, cooldown, exclusiveText, ultimate, ultimateText) => Object.freeze({
    number,
    id,
    name,
    role,
    access: Object.freeze({ ...access }),
    exclusive: Object.freeze({ name: exclusive, cooldown, text: exclusiveText }),
    ultimate: Object.freeze({ name: ultimate, text: ultimateText })
  });
  var SHIP_ROSTER = Object.freeze([
    ship("01", "aster", "Ast\xE9r", "Exploradora", FREE(0), "Salto de fase", 8, "Esquiva lateral instant\xE1nea: durante 0,4 s no recibe da\xF1o.", "Lluvia de estrellas", "Caen del cielo 24 dardos de luz que buscan a cada enemigo en pantalla."),
    ship("02", "bastion", "Basti\xF3n", "Acorazada", FREE(1), "Muralla", 14, "Escudo frontal que detiene los disparos de delante durante 3 s.", "Fortaleza", "Una c\xFApula de 6 s que devuelve cada proyectil enemigo a quien lo dispar\xF3."),
    ship("03", "vertice", "V\xE9rtice", "Perforadora", SCRAP(1e4), "Lanza", 10, "Disparo cargado que atraviesa toda la columna.", "Prisma", "Un rayo que se abre en 5 haces y barre la pantalla durante 4 s."),
    ship("04", "mantarraya", "Mantarraya", "Guardiana de cola", SCRAP(5e4), "Estela", 12, "Deja detr\xE1s una estela que da\xF1a a lo que llega por la retaguardia.", "Marea", "Una onda saca de la pantalla proyectiles y meteoritos y aturde 2 s."),
    ship("05", "arpon", "Arp\xF3n", "Cazadora", SCRAP(15e4), "Arp\xF3n", 12, "Engancha a un enemigo y lo arrastra; suelta el doble de chatarra.", "Riel", "Un ca\xF1\xF3n de riel atraviesa la pantalla con un da\xF1o enorme a los jefes."),
    ship("06", "orion", "Ori\xF3n", "Comandante", PAID, "Alas", 16, "Dos drones disparan contigo durante 8 s.", "Constelaci\xF3n", "Seis drones forman una estrella y disparan en todas las direcciones 6 s."),
    ship("07", "quimera", "Quimera", "Enga\xF1o", PAID, "Se\xF1uelo", 14, "Un holograma de tu nave atrae los disparos durante 4 s.", "Enjambre", "Doce mininaves buscan a los enemigos y estallan al alcanzarlos."),
    ship("08", "nomada", "N\xF3mada", "Recolectora", PAID, "Im\xE1n", 15, "Atrae CRONIUM y chatarra de toda la pantalla y repara 5 de casco.", "Forja m\xF3vil", "Repara el 40 % del casco y llena munici\xF3n y misiles."),
    ship("09", "eclipse", "Eclipse", "Sombra", PAID, "Sombra", 15, "Durante 2 s es invisible: los enemigos pierden el blanco.", "Eclipse total", "La pantalla se oscurece y todo se detiene 3 s, salvo tu nave."),
    ship("10", "titan", "Tit\xE1n", "Artillera", PAID, "Andanada", 16, "Una salva de 8 misiles peque\xF1os que buscan a los enemigos cercanos.", "Supernova", "Carga 1,5 s y estalla en una onda que borra lo peque\xF1o.")
  ]);
  var byId2 = (id) => SHIP_ROSTER.find((entry) => entry.id === id);
  var isScrapShip = (id) => byId2(id)?.access.type === "scrap";
  function ownedShips(sectorSave, shipSave) {
    return SHIP_ROSTER.filter(({ id, access }) => access.type === "free" ? access.sector === 0 || sectorSave.sectors[access.sector]?.completed === true : access.type === "scrap" && shipSave.bought.includes(id)).map((entry) => entry.id);
  }
  function normalizeShipSave(raw, sectorSave) {
    const valid = Boolean(raw) && typeof raw === "object" && raw.version === 1 && Array.isArray(raw.bought);
    const bought = valid ? [...new Set(raw.bought.filter(isScrapShip))] : [];
    const selected = valid && ownedShips(sectorSave, { bought }).includes(raw.selected) ? raw.selected : DEFAULT_SHIP;
    return { version: 1, selected, bought };
  }
  function chooseShip(shipSave, id, sectorSave) {
    return ownedShips(sectorSave, shipSave).includes(id) ? { version: 1, selected: id, bought: [...shipSave.bought] } : null;
  }
  function buyShipWithScrap(shipSave, id, scrap) {
    const price = isScrapShip(id) ? byId2(id).access.price : null;
    if (price === null || shipSave.bought.includes(id) || scrap < price) return null;
    return { save: { version: 1, selected: shipSave.selected, bought: [...shipSave.bought, id] }, price };
  }

  // src/game/progression/sector-map.js
  var freeze3 = Object.freeze;
  var SECTOR_MAPS = freeze3({
    1: freeze3({
      id: 1,
      title: "SECTOR 1 \xB7 HUIDA DE CHRONOS",
      places: freeze3([
        freeze3({ id: "chronos", label: "Chronos", note: "Estaci\xF3n en ruinas", kind: "ruin", x: 0.16, y: 0.07 }),
        freeze3({ id: "baliza", label: "Baliza exterior", kind: "waypoint", x: 0.8, y: 0.24 }),
        freeze3({ id: "anillo", label: "Anillo de sat\xE9lites", kind: "waypoint", x: 0.2, y: 0.41 }),
        freeze3({ id: "orbita", label: "\xD3rbita alta", kind: "waypoint", x: 0.8, y: 0.57 }),
        freeze3({ id: "nocturno", label: "Lado nocturno", kind: "waypoint", x: 0.22, y: 0.72 }),
        freeze3({ id: "gaia", label: "Gaia Nova", note: "Base \xB7 Iria", kind: "base", actor: "iria", x: 0.76, y: 0.86 }),
        freeze3({ id: "c9", label: "Taller C9", note: "Base m\xF3vil \xB7 Mira", kind: "base", actor: "mira", x: 0.88, y: 0.4 })
      ]),
      routes: freeze3([
        freeze3({ voyage: "S1-V1", title: "Escapa de Chronos", from: "chronos", to: "baliza" }),
        freeze3({ voyage: "S1-V2", title: "Cruza la red exterior de Gaia", from: "baliza", to: "anillo" }),
        freeze3({ voyage: "S1-V3", title: "Escolta a los evacuados", from: "anillo", to: "orbita" }),
        freeze3({ voyage: "S1-V4", title: "Sigue la se\xF1al falsa", from: "orbita", to: "nocturno" }),
        freeze3({ voyage: "S1-V5", title: "Convence a Atlas", from: "nocturno", to: "gaia" })
      ])
    }),
    2: freeze3({
      id: 2,
      title: "SECTOR 2 \xB7 EL RASTRO DEL C-17",
      places: freeze3([
        freeze3({ id: "gaia", label: "Gaia Nova", note: "Paso libre", kind: "planet", x: 0.18, y: 0.07 }),
        freeze3({ id: "borde", label: "Borde de Gaia", kind: "waypoint", x: 0.78, y: 0.24 }),
        freeze3({ id: "carga", label: "Ruta de carga", kind: "waypoint", x: 0.2, y: 0.41 }),
        freeze3({ id: "escoria", label: "Cintur\xF3n de escoria", kind: "waypoint", x: 0.8, y: 0.57 }),
        freeze3({ id: "orbita-vulkar", label: "\xD3rbita de Vulkar", kind: "waypoint", x: 0.22, y: 0.72 }),
        freeze3({ id: "vulkar", label: "Forjas de Vulkar", note: "Tit\xE1n de Vulkar", kind: "planet", x: 0.74, y: 0.86 }),
        freeze3({ id: "c9", label: "Taller C9", note: "Base m\xF3vil \xB7 Mira", kind: "base", actor: "mira", x: 0.88, y: 0.4 })
      ]),
      routes: freeze3([
        freeze3({ voyage: "S2-V1", title: "Sal de Gaia con paso libre", from: "gaia", to: "borde" }),
        freeze3({ voyage: "S2-V2", title: "Sigue al C-17", from: "borde", to: "carga" }),
        freeze3({ voyage: "S2-V3", title: "Cruza el cintur\xF3n de escoria", from: "carga", to: "escoria" }),
        freeze3({ voyage: "S2-V4", title: "Responde a la llamada de Yara", from: "escoria", to: "orbita-vulkar" }),
        freeze3({ voyage: "S2-V5", title: "Det\xE9n al Tit\xE1n de Vulkar", from: "orbita-vulkar", to: "vulkar" })
      ])
    })
  });
  function sectorMapState(sectorId, { playable = [], completed = [] } = {}) {
    const map = SECTOR_MAPS[sectorId];
    if (!map) return null;
    const canPlay = new Set(playable), done = new Set(completed);
    const previous = SECTOR_MAPS[sectorId - 1];
    let previousDone = !previous || done.has(previous.routes.at(-1).voyage);
    const routes = map.routes.map((route) => {
      const status = done.has(route.voyage) ? "done" : previousDone && canPlay.has(route.voyage) ? "open" : "locked";
      previousDone = status === "done";
      return freeze3({ ...route, status });
    });
    return freeze3({ ...map, open: !previous || done.has(previous.routes.at(-1).voyage), routes: freeze3(routes) });
  }

  // src/game/narrative/base-dialogues.js
  var freeze4 = Object.freeze;
  var line = (text) => freeze4({ text });
  var BASE_ACTORS = freeze4({
    mira: freeze4({ id: "mira", name: "Mira", role: "Mec\xE1nica del taller C9" }),
    iria: freeze4({ id: "iria", name: "Comandante Iria", role: "Mando de Gaia Nova" })
  });
  var SCRIPTS = freeze4({
    c9: freeze4({ actor: "mira", before: freeze4([
      line("Llegas con el casco humeante y un registro que quema. T\xEDpico."),
      line("Tr\xE1eme chatarra de los restos y te dejo la nave como nueva."),
      line("Ese emisor gemelo de Chronos\u2026 si lo rescatas, puedo montarlo."),
      line("Y no me mires as\xED: el taller cobra, la guerra no paga facturas.")
    ]), after: freeze4([
      line("As\xED que Atlas te dej\xF3 pasar. Te debo una cena, piloto."),
      line("Si vas a Vulkar, vas a necesitar m\xE1s que un casco remendado."),
      line("Trae piezas. Yo pongo las manos.")
    ]) }),
    gaia: freeze4({ actor: "iria", before: freeze4([
      line("\u2026aqu\xED Gaia Nova. Su firma coincide con el convoy atacante."),
      line("Detenga los motores. Atlas tiene orden de bloquear el corredor."),
      line("Si trae pruebas, tendr\xE1 que llegar hasta Atlas con ellas.")
    ]), after: freeze4([
      line("El registro es aut\xE9ntico. Le pido disculpas, piloto."),
      line("El convoy C-17 sali\xF3 de Vulkar. Alguien pag\xF3 esas firmas."),
      line("Gaia le abre su corredor. Encuentre a quien lo pag\xF3.")
    ]) })
  });
  function baseConversation(baseId, { atlasConvinced = false } = {}) {
    const script = SCRIPTS[baseId];
    if (!script) return null;
    return freeze4({
      baseId,
      actor: BASE_ACTORS[script.actor],
      lines: atlasConvinced ? script.after : script.before
    });
  }

  // src/game/progression/comet-shower.js
  var COMET_SHOWER_VERSION = "comet-shower-v4";
  var COMET_SHOWER_RULES = Object.freeze({
    // v4: oleadas más grandes y dispersas (cada cometa con su propio borde,
    // lado del pasillo e intervalo) en lugar de trenes de 3-4 en fila.
    maxActive: 9,
    warningSeconds: 2,
    resumeGraceSeconds: 7,
    burstSizes: Object.freeze([7, 9, 8]),
    spawnGap: Object.freeze([0.18, 0.75]),
    maxDelta: 0.05,
    shipWidth: 208 * 0.52,
    shipSideClearance: 119 * 0.52,
    corridorClearance: 40,
    minSpeed: 700,
    maxSpeed: 950,
    boundsMargin: 128,
    burstStarts: Object.freeze([7, 16, 25])
  });
  var clamp4 = (value, low, high) => Math.max(low, Math.min(high, value));
  var finite3 = (value, label) => {
    if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite`);
    return value;
  };
  var randomFor2 = (seed) => {
    let state = seed >>> 0;
    return () => {
      state += 1831565813;
      let value = Math.imul(state ^ state >>> 15, 1 | state);
      value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  };
  var validateDelta = (delta) => {
    finite3(delta, "delta");
    if (delta < 0) throw new RangeError("delta must not be negative");
    return Math.min(delta, COMET_SHOWER_RULES.maxDelta);
  };
  var positionAt = (item, seconds) => ({
    x: item.x + item.vx * seconds + item.ax * seconds * seconds / 2,
    y: item.y + item.vy * seconds + item.ay * seconds * seconds / 2
  });
  function corridorFor(width, height, seed, burst, shipWidth, shipSideClearance) {
    const corridorWidth = shipWidth + COMET_SHOWER_RULES.corridorClearance;
    const minimum = Math.min(Math.max(shipSideClearance, corridorWidth / 2), width / 2);
    const maximum = width - minimum;
    const random = randomFor2(seed ^ Math.imul(burst + 3, 2654435769));
    const side = random() < 0.5 ? -1 : 1;
    const center = clamp4(width * (side < 0 ? 0.22 + random() * 0.15 : 0.63 + random() * 0.15), minimum, maximum);
    return Object.freeze({
      center,
      width: corridorWidth,
      left: center - corridorWidth / 2,
      right: center + corridorWidth / 2,
      top: height * 0.48,
      bottom: height + 128,
      side,
      burst
    });
  }
  function boundaryTimes(position, velocity, acceleration, boundary, lifetime) {
    const a = acceleration / 2, b = velocity, c = position - boundary;
    if (Math.abs(a) < 1e-10) {
      const time = Math.abs(b) < 1e-10 ? -1 : -c / b;
      return time > 0 && time < lifetime ? [time] : [];
    }
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [];
    const root = Math.sqrt(discriminant);
    return [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter((time) => time > 0 && time < lifetime);
  }
  function staysOutsideCorridor(item, corridor) {
    const clearance = item.r + 12;
    const left = corridor.left - clearance, right = corridor.right + clearance;
    const top = corridor.top - clearance, bottom = corridor.bottom + clearance;
    const times = [
      0,
      item.life,
      ...boundaryTimes(item.x, item.vx, item.ax, left, item.life),
      ...boundaryTimes(item.x, item.vx, item.ax, right, item.life),
      ...boundaryTimes(item.y, item.vy, item.ay, top, item.life),
      ...boundaryTimes(item.y, item.vy, item.ay, bottom, item.life)
    ].sort((a, b) => a - b);
    const inside = (seconds) => {
      const point = positionAt(item, seconds);
      return point.y >= top - 1e-8 && point.y <= bottom + 1e-8 && point.x >= left - 1e-8 && point.x <= right + 1e-8;
    };
    for (let index = 0; index < times.length; index++) {
      if (inside(times[index]) || index > 0 && inside((times[index] + times[index - 1]) / 2)) return false;
    }
    return true;
  }
  function makeCandidate(state, burst, ordinal, mode, attempt = 0) {
    const { width, height } = state, corridor = state.corridors[burst];
    const random = randomFor2(state.seed + burst * 1013 + ordinal * 7919 + mode * 211 + attempt * 65537);
    const speed = COMET_SHOWER_RULES.minSpeed + random() * (COMET_SHOWER_RULES.maxSpeed - COMET_SHOWER_RULES.minSpeed);
    const margin = 96, dangerSide = -corridor.side;
    let x, y, vx, vy, ax, ay, entryEdge;
    if (mode === 0) {
      const direction = random() < 0.5 ? -1 : 1;
      x = direction > 0 ? -margin : width + margin;
      entryEdge = direction > 0 ? "left" : "right";
      y = height * (0.09 + random() * 0.13);
      vy = speed * (random() * 2 - 1) * Math.min(0.15, height * 0.1 / (width + margin * 2));
      vx = direction * Math.sqrt(speed * speed - vy * vy);
      ax = -direction * (15 + random() * 35);
      ay = (random() * 2 - 1) * Math.min(28, height * 0.025);
    } else {
      const lanes = [[24, corridor.left - 42, -1], [corridor.right + 42, width - 24, 1]].filter(([low, high]) => high - low >= 30);
      const lane = lanes.length ? lanes[Math.floor(random() * lanes.length)] : null;
      const laneSide = lane ? lane[2] : dangerSide;
      const laneMinimum = lane ? lane[0] : 1, laneMaximum = lane ? lane[1] : 0;
      const referenceX = laneMinimum <= laneMaximum ? clamp4(width * (0.4 + random() * 0.2), laneMinimum, laneMaximum) : width / 2;
      y = mode === 1 ? -margin : height + margin;
      entryEdge = mode === 1 ? "top" : "bottom";
      const verticalDirection = mode === 1 ? 1 : -1;
      ax = laneSide * (16 + random() * 65) * (random() < 0.32 ? -1 : 1);
      ay = verticalDirection * (10 + random() * 20);
      const referenceY = height * (0.6 + random() * 0.24);
      const referenceTime = Math.abs(referenceY - y) / speed;
      vx = laneSide * (18 + random() * 130) - ax * referenceTime;
      vx = clamp4(vx, -speed * 0.32, speed * 0.32);
      vy = verticalDirection * Math.sqrt(speed * speed - vx * vx);
      const time = (-Math.abs(vy) + Math.sqrt(vy * vy + 2 * Math.abs(ay) * Math.abs(referenceY - y))) / Math.abs(ay);
      x = referenceX - vx * time - ax * time * time / 2;
    }
    const id = `${COMET_SHOWER_VERSION}:${state.stageId}:${state.seed}:${burst}:${ordinal}`;
    const radius = 15 + random() * 4;
    const crossingDistance = (mode === 0 ? width : height) + margin * 2;
    const travelSpeed = Math.max(500, Math.abs(mode === 0 ? vx : vy) - 70);
    return {
      id,
      type: "meteor",
      flightComet: true,
      showerComet: true,
      showerVersion: COMET_SHOWER_VERSION,
      showerBurst: burst,
      showerWidth: width,
      showerHeight: height,
      entryEdge,
      crossingMode: mode,
      x,
      y,
      previousX: x,
      previousY: y,
      baseX: x,
      vx,
      vy,
      ax,
      ay,
      r: radius,
      s: vy,
      damage: 18,
      hp: 2,
      maxHp: 2,
      special: "comet",
      spriteKey: "comet",
      visualScale: 1,
      rot: Math.atan2(vy, vx),
      rs: 0,
      p: 0,
      phase: ordinal + burst * 3,
      amp: 0,
      alpha: 1,
      life: crossingDistance / travelSpeed + 0.35
    };
  }
  function makeComet(state, burst, ordinal) {
    const primaryMode = state.burstModes[burst];
    const roll = randomFor2(state.seed + burst * 211 + ordinal * 2017)();
    const mode = ordinal === 0 || roll < 0.4 ? primaryMode : roll < 0.6 ? 0 : roll < 0.8 ? 1 : 2;
    for (let attempt = 0; attempt < 18; attempt++) {
      const item = makeCandidate(state, burst, ordinal, mode, attempt);
      if (item.x < -128 || item.x > state.width + 128) continue;
      if (staysOutsideCorridor(item, state.corridors[burst])) return item;
    }
    const fallback = makeCandidate(state, burst, ordinal, 0);
    return staysOutsideCorridor(fallback, state.corridors[burst]) ? fallback : null;
  }
  function createCometShower({
    width = 720,
    height = 1280,
    seed = 0,
    stageId = "1.5",
    elapsed = 0,
    shipWidth = COMET_SHOWER_RULES.shipWidth,
    shipSideClearance = COMET_SHOWER_RULES.shipSideClearance
  } = {}) {
    for (const [label, value] of Object.entries({ width, height, seed, elapsed, shipWidth, shipSideClearance })) finite3(value, label);
    if (width < 250 || height < 300 || elapsed < 0 || shipWidth <= 0 || shipSideClearance < shipWidth / 2 || // Qué tramos tienen lluvia lo decide la ficha del viaje (getVoyageStageRules).
    typeof stageId !== "string" || !/^\d+\.\d+$/.test(stageId)) {
      throw new RangeError("Invalid comet shower route or viewport");
    }
    const normalizedSeed = Math.trunc(seed) >>> 0;
    const random = randomFor2(normalizedSeed ^ 2230561051), burstModes = [0, 1, 2];
    for (let index = burstModes.length - 1; index > 0; index--) {
      const swap = Math.floor(random() * (index + 1));
      [burstModes[index], burstModes[swap]] = [burstModes[swap], burstModes[index]];
    }
    const graceUntil = elapsed > 0 ? elapsed + COMET_SHOWER_RULES.resumeGraceSeconds : 0;
    const schedule = [];
    for (let burst = 0; burst < COMET_SHOWER_RULES.burstStarts.length; burst++) {
      const at = COMET_SHOWER_RULES.burstStarts[burst];
      if (at <= elapsed || at < graceUntil) continue;
      const warningAt = at - COMET_SHOWER_RULES.warningSeconds;
      if (warningAt <= elapsed) continue;
      schedule.push({ at: warningAt, kind: "warning", burst });
      const count = COMET_SHOWER_RULES.burstSizes[burst];
      const [gapLow, gapHigh] = COMET_SHOWER_RULES.spawnGap;
      const timing = randomFor2(normalizedSeed ^ Math.imul(burst + 11, 668265263));
      for (let ordinal = 0, offset = 0; ordinal < count; ordinal++) {
        schedule.push({ at: at + offset, kind: "spawn", burst, ordinal });
        offset += gapLow + timing() * (gapHigh - gapLow);
      }
    }
    schedule.sort((left, right) => left.at - right.at);
    return {
      version: COMET_SHOWER_VERSION,
      width,
      height,
      seed: normalizedSeed,
      stageId,
      shipWidth,
      shipSideClearance,
      burstModes: Object.freeze(burstModes),
      elapsed,
      initialElapsed: elapsed,
      schedule,
      cursor: 0,
      active: [],
      emittedIds: /* @__PURE__ */ new Set(),
      skipped: 0,
      spawned: 0,
      warnings: 0,
      corridors: [0, 1, 2].map((burst) => corridorFor(width, height, normalizedSeed, burst, shipWidth, shipSideClearance))
    };
  }
  function advanceCometShower(state, delta, player, emit) {
    const step = validateDelta(delta);
    if (state?.version !== COMET_SHOWER_VERSION) throw new TypeError("Comet shower state required");
    if (typeof emit !== "function") throw new TypeError("Comet shower callback required");
    if (!Number.isFinite(player?.x) || !Number.isFinite(player?.y)) throw new TypeError("Finite player position required");
    if (step === 0) return cometShowerSnapshot(state);
    state.elapsed += step;
    state.active = state.active.filter((entry) => entry.item.life > 0 && entry.item.hp > 0);
    while (state.cursor < state.schedule.length && state.schedule[state.cursor].at <= state.elapsed + 1e-8) {
      const scheduled = state.schedule[state.cursor++];
      const id = `${COMET_SHOWER_VERSION}:${state.stageId}:${state.seed}:${scheduled.burst}:${scheduled.kind}:${scheduled.ordinal ?? "all"}`;
      if (state.emittedIds.has(id)) continue;
      state.emittedIds.add(id);
      if (scheduled.kind === "warning") {
        state.warnings++;
        const first = makeComet(state, scheduled.burst, 0);
        const entrance = first && {
          left: "desde la izquierda",
          right: "desde la derecha",
          top: "desde arriba",
          bottom: "desde abajo"
        }[first.entryEdge];
        emit(Object.freeze({
          id,
          type: "warning",
          text: `Se aproxima lluvia de cometas${entrance ? ` \xB7 ${entrance}` : ""}`,
          stageId: state.stageId,
          burst: scheduled.burst,
          at: scheduled.at,
          firstCometAt: scheduled.at + COMET_SHOWER_RULES.warningSeconds,
          corridor: state.corridors[scheduled.burst]
        }));
        continue;
      }
      if (state.active.length >= COMET_SHOWER_RULES.maxActive) {
        state.skipped++;
        continue;
      }
      if (state.active.some((entry) => entry.item.showerBurst !== scheduled.burst)) {
        state.skipped++;
        continue;
      }
      const item = makeComet(state, scheduled.burst, scheduled.ordinal);
      if (!item) {
        state.skipped++;
        continue;
      }
      state.spawned++;
      state.active.push({ item, until: scheduled.at + item.life });
      emit(Object.freeze({
        id,
        type: "spawn",
        stageId: state.stageId,
        burst: scheduled.burst,
        at: scheduled.at,
        corridor: state.corridors[scheduled.burst],
        item
      }));
    }
    return cometShowerSnapshot(state);
  }
  function advanceShowerComet(item, delta) {
    const step = validateDelta(delta);
    if (!item?.showerComet || item.showerVersion !== COMET_SHOWER_VERSION) {
      throw new TypeError("Shower comet item required");
    }
    if (step === 0) return item.life > 0;
    const point = positionAt(item, step);
    item.previousX = item.x;
    item.previousY = item.y;
    item.x = point.x;
    item.y = point.y;
    item.vx += item.ax * step;
    item.vy += item.ay * step;
    item.s = item.vy;
    item.rot = Math.atan2(item.vy, item.vx);
    item.life -= step;
    const margin = COMET_SHOWER_RULES.boundsMargin;
    return item.life > 0 && item.x >= -margin && item.x <= item.showerWidth + margin && item.y >= -margin && item.y <= item.showerHeight + margin;
  }
  function releaseCometShowerItem(state, item) {
    if (state?.version !== COMET_SHOWER_VERSION) throw new TypeError("Comet shower state required");
    const id = typeof item === "string" ? item : item?.id;
    const before = state.active.length;
    state.active = state.active.filter((entry) => entry.item.id !== id);
    return state.active.length < before;
  }
  function cometShowerSnapshot(state) {
    return Object.freeze({
      version: state.version,
      stageId: state.stageId,
      elapsed: state.elapsed,
      active: state.active.length,
      spawned: state.spawned,
      skipped: state.skipped,
      warnings: state.warnings,
      done: state.cursor >= state.schedule.length && state.active.length === 0
    });
  }

  // src/game/progression/classic-arsenal.js
  var WEAPON_IDS = Object.freeze(["pulse", "twin", "lance", "scatter", "needle"]);
  var BOSS_WEAPONS = Object.freeze({ "guardian-atlas": "twin" });
  var owns = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  function normalizeClassicEquipment(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1 || typeof value.recoveredTwin !== "boolean" || !Array.isArray(value.unlocked) || !value.unlocked.includes("pulse") || [...value.unlocked].some((id) => !WEAPON_IDS.includes(id)) || !WEAPON_IDS.includes(value.selected) || !value.unlocked.includes(value.selected) || value.unlocked.includes("twin") && !value.recoveredTwin || owns(value, "lanceCalibrated") && typeof value.lanceCalibrated !== "boolean" || value.unlocked.includes("lance") && (!value.lanceCalibrated || !value.unlocked.includes("twin")) || owns(value, "twinPrepared") && typeof value.twinPrepared !== "boolean" || value.twinPrepared && !value.recoveredTwin || owns(value, "bossRewards") && (!Array.isArray(value.bossRewards) || [...value.bossRewards].some((id) => typeof id !== "string" || !owns(BOSS_WEAPONS, id)))) return null;
    if (value.bossRewards?.some((id) => !value.unlocked.includes(BOSS_WEAPONS[id]))) return null;
    return {
      version: 1,
      recoveredTwin: value.recoveredTwin,
      unlocked: [...new Set(value.unlocked)],
      selected: value.selected,
      ...owns(value, "lanceCalibrated") ? { lanceCalibrated: value.lanceCalibrated } : {},
      ...owns(value, "twinPrepared") ? { twinPrepared: value.twinPrepared } : {},
      ...owns(value, "bossRewards") ? { bossRewards: [...new Set(value.bossRewards)] } : {}
    };
  }
  function equipmentCopy(equipment) {
    const normalized = normalizeClassicEquipment(equipment);
    if (!normalized) throw new RangeError("Invalid classic equipment");
    return normalized;
  }
  function prepareClassicTwin(equipment) {
    const next = equipmentCopy(equipment);
    if (next.recoveredTwin) next.twinPrepared = true;
    return next;
  }
  function awardClassicBossWeapon(equipment, bossId) {
    if (typeof bossId !== "string" || !owns(BOSS_WEAPONS, bossId)) throw new RangeError("Unknown classic boss");
    const next = equipmentCopy(equipment);
    const weaponId = BOSS_WEAPONS[bossId];
    const granted = !next.unlocked.includes(weaponId);
    next.bossRewards = [.../* @__PURE__ */ new Set([...next.bossRewards || [], bossId])];
    next.recoveredTwin = true;
    next.twinPrepared = true;
    if (granted) next.unlocked.push(weaponId);
    return { equipment: next, granted, weaponId };
  }
  function syncClassicWorkshopWeapons(equipment, record) {
    const next = equipmentCopy(equipment);
    for (const weaponId of classicWorkshopState(record).weaponIds) {
      if (!next.unlocked.includes(weaponId)) next.unlocked.push(weaponId);
    }
    return next;
  }

  // art-source/enemies/ch01/ch01-atlas-v1.json
  var ch01_atlas_v1_default = {
    schemaVersion: 1,
    id: "gaia.ch01.scout",
    revision: "ch01-art-v1",
    productionStatus: "IN_REVIEW",
    image: "ch01-atlas-v1.webp",
    proposedRuntimeImage: "assets/ch01_atlas_v1.webp",
    master: "ch01-master-v2.png",
    sourceHistorical: "ch01-master-v1.png",
    dimensions: {
      width: 1024,
      height: 1536
    },
    layout: {
      columns: 4,
      rows: 6,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 24
    },
    pivot: {
      x: 0.5,
      y: 0.5
    },
    forward: {
      x: 0,
      y: 1
    },
    recommendedDrawSizeLogical: 128,
    transparent: true,
    decodedRgbaBytes: 6291456,
    frames: [
      {
        index: 0,
        stateRow: "spawn",
        rect: {
          x: 0,
          y: 0,
          width: 256,
          height: 256
        }
      },
      {
        index: 1,
        stateRow: "spawn",
        rect: {
          x: 256,
          y: 0,
          width: 256,
          height: 256
        }
      },
      {
        index: 2,
        stateRow: "spawn",
        rect: {
          x: 512,
          y: 0,
          width: 256,
          height: 256
        }
      },
      {
        index: 3,
        stateRow: "spawn",
        rect: {
          x: 768,
          y: 0,
          width: 256,
          height: 256
        }
      },
      {
        index: 4,
        stateRow: "idle",
        rect: {
          x: 0,
          y: 256,
          width: 256,
          height: 256
        }
      },
      {
        index: 5,
        stateRow: "idle",
        rect: {
          x: 256,
          y: 256,
          width: 256,
          height: 256
        }
      },
      {
        index: 6,
        stateRow: "idle",
        rect: {
          x: 512,
          y: 256,
          width: 256,
          height: 256
        }
      },
      {
        index: 7,
        stateRow: "idle",
        rect: {
          x: 768,
          y: 256,
          width: 256,
          height: 256
        }
      },
      {
        index: 8,
        stateRow: "flight",
        rect: {
          x: 0,
          y: 512,
          width: 256,
          height: 256
        }
      },
      {
        index: 9,
        stateRow: "flight",
        rect: {
          x: 256,
          y: 512,
          width: 256,
          height: 256
        }
      },
      {
        index: 10,
        stateRow: "flight",
        rect: {
          x: 512,
          y: 512,
          width: 256,
          height: 256
        }
      },
      {
        index: 11,
        stateRow: "flight",
        rect: {
          x: 768,
          y: 512,
          width: 256,
          height: 256
        }
      },
      {
        index: 12,
        stateRow: "attack",
        rect: {
          x: 0,
          y: 768,
          width: 256,
          height: 256
        }
      },
      {
        index: 13,
        stateRow: "attack",
        rect: {
          x: 256,
          y: 768,
          width: 256,
          height: 256
        }
      },
      {
        index: 14,
        stateRow: "attack",
        rect: {
          x: 512,
          y: 768,
          width: 256,
          height: 256
        }
      },
      {
        index: 15,
        stateRow: "attack",
        rect: {
          x: 768,
          y: 768,
          width: 256,
          height: 256
        }
      },
      {
        index: 16,
        stateRow: "hurt",
        rect: {
          x: 0,
          y: 1024,
          width: 256,
          height: 256
        }
      },
      {
        index: 17,
        stateRow: "hurt",
        rect: {
          x: 256,
          y: 1024,
          width: 256,
          height: 256
        }
      },
      {
        index: 18,
        stateRow: "hurt",
        rect: {
          x: 512,
          y: 1024,
          width: 256,
          height: 256
        }
      },
      {
        index: 19,
        stateRow: "hurt",
        rect: {
          x: 768,
          y: 1024,
          width: 256,
          height: 256
        }
      },
      {
        index: 20,
        stateRow: "destroy",
        rect: {
          x: 0,
          y: 1280,
          width: 256,
          height: 256
        }
      },
      {
        index: 21,
        stateRow: "destroy",
        rect: {
          x: 256,
          y: 1280,
          width: 256,
          height: 256
        }
      },
      {
        index: 22,
        stateRow: "destroy",
        rect: {
          x: 512,
          y: 1280,
          width: 256,
          height: 256
        }
      },
      {
        index: 23,
        stateRow: "destroy",
        rect: {
          x: 768,
          y: 1280,
          width: 256,
          height: 256
        }
      }
    ],
    animations: {
      spawn: {
        frames: [
          0,
          1,
          2,
          3
        ],
        durationMs: [
          100,
          100,
          100,
          130
        ],
        loop: false,
        locked: true,
        next: "idle"
      },
      idle: {
        frames: [
          4,
          5,
          6,
          7
        ],
        durationMs: [
          125,
          125,
          125,
          125
        ],
        loop: true,
        locked: false
      },
      flight: {
        frames: [
          9,
          11
        ],
        durationMs: [
          100,
          100
        ],
        loop: true,
        locked: false
      },
      bankLeft: {
        frames: [
          8
        ],
        durationMs: [
          100
        ],
        loop: true,
        locked: false
      },
      bankRight: {
        frames: [
          10
        ],
        durationMs: [
          100
        ],
        loop: true,
        locked: false
      },
      attack: {
        frames: [
          12,
          13,
          14,
          15
        ],
        durationMs: [
          160,
          80,
          90,
          170
        ],
        loop: false,
        locked: true,
        next: "idle",
        events: [
          {
            frameOffset: 0,
            name: "charge"
          },
          {
            frameOffset: 1,
            name: "fire"
          }
        ]
      },
      hurt: {
        frames: [
          16,
          17,
          18,
          19
        ],
        durationMs: [
          55,
          55,
          65,
          75
        ],
        loop: false,
        locked: true,
        next: "idle"
      },
      damaged: {
        frames: [
          18,
          19
        ],
        durationMs: [
          160,
          160
        ],
        loop: true,
        locked: false
      },
      destroy: {
        frames: [
          20,
          21,
          22,
          23
        ],
        durationMs: [
          80,
          100,
          130,
          180
        ],
        loop: false,
        locked: true,
        terminal: true,
        events: [
          {
            frameOffset: 1,
            name: "coreBurst"
          }
        ],
        completionEvent: "removeVisual"
      }
    },
    transitionRules: {
      priority: [
        "destroy",
        "hurt",
        "attack",
        "spawn",
        "bankLeft",
        "bankRight",
        "flight",
        "idle"
      ],
      destroyCannotBeInterrupted: true,
      gameplayCollisionIndependentOfArt: true,
      banking: "Choose left/right pose from actual lateral velocity; do not cycle left/right while flying straight.",
      fire: "Runtime must emit each animation event once; the atlas does not spawn gameplay projectiles.",
      destroy: "Gameplay hitbox must be removed when death starts; retain only the visual until animation completion."
    },
    palette: {
      titanium: "#E8EDF0",
      graphite: "#15202D",
      cyan: "#5CF5FF",
      warning: "#E84036"
    },
    catalogEntries: [
      "gaia-ch01-move",
      "gaia-ch01-attack",
      "gaia-ch01-destroy"
    ],
    provenance: {
      method: "OpenAI image_gen generation plus image_gen correction; lossless-alpha WebP export with ImageMagick",
      reference: "art-source/references/gaia_enemy_dossier_v1.jpeg",
      generatorOutputOriginal: "exec-72a4f9e1-be52-44d1-aef3-7db3b77916ad.png",
      generatorOutputCorrection: "exec-4925397f-381b-4ed8-bdd5-88d7456f959a.png",
      generatedAtUtcDate: "2026-10-14",
      preparedAtUtcDate: "2026-10-15",
      rights: "Generated for this project from an existing project design reference. No third-party stock downloaded. Rights to the inherited dossier reference were not independently audited; no legal clearance is claimed."
    },
    checksums: {
      "ch01-master-v1.png": "e5169673719ac12ddb442a1b0c8e28560ca7aa97b195decb82ce5ed25f4d32ff",
      "ch01-master-v2.png": "d0c9305f072cf37b6d4af5bd7e4d8252d23c83c65a6b734d2586e59fbb04bd63",
      "ch01-atlas-v1.webp": "ec2d3c48e3715450b4aefd6757dd0b49236437f699ac719c07e03c45360be430"
    },
    verificationLimits: [
      "Asset-only inspection and pixel analysis do not certify game integration.",
      "Combat animation transitions and fire timing still require real gameplay verification.",
      "No iPhone performance or memory measurement has been performed for this atlas."
    ]
  };

  // src/game/animation/ch01-animator.js
  var EPSILON_MS = 1e-7;
  var finite4 = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  var clamp5 = (value, min, max) => Math.max(min, Math.min(max, value));
  var rectangles = Object.freeze(ch01_atlas_v1_default.frames.map((frame) => {
    const { x, y, width, height } = frame.rect;
    if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > ch01_atlas_v1_default.dimensions.width || y + height > ch01_atlas_v1_default.dimensions.height) {
      throw new RangeError("CH-01 frame lies outside its atlas");
    }
    return Object.freeze({ ...frame.rect });
  }));
  var animations = Object.freeze(Object.fromEntries(Object.entries(ch01_atlas_v1_default.animations).map(([name, definition]) => {
    if (definition.frames.length !== definition.durationMs.length || !definition.frames.length || definition.frames.some((index) => !Number.isInteger(index) || !rectangles[index]) || definition.durationMs.some((duration) => !Number.isFinite(duration) || duration <= 0)) {
      throw new RangeError(`Invalid CH-01 animation: ${name}`);
    }
    const durations = Object.freeze([...definition.durationMs]);
    const events = Object.freeze((definition.events || []).map((event2) => {
      if (!Number.isInteger(event2.frameOffset) || event2.frameOffset < 0 || event2.frameOffset >= definition.frames.length) {
        throw new RangeError(`Invalid CH-01 event: ${name}`);
      }
      return Object.freeze({ ...event2, atMs: durations.slice(0, event2.frameOffset).reduce((sum, value) => sum + value, 0) });
    }).sort((a, b) => a.atMs - b.atMs));
    return [name, Object.freeze({
      ...definition,
      frames: Object.freeze([...definition.frames]),
      durationMs: durations,
      totalMs: durations.reduce((sum, value) => sum + value, 0),
      events
    })];
  })));
  var priority = (name) => {
    const index = ch01_atlas_v1_default.transitionRules.priority.indexOf(name);
    return index < 0 ? ch01_atlas_v1_default.transitionRules.priority.length : index;
  };
  var pivot = Object.freeze({ ...ch01_atlas_v1_default.pivot });
  var CH01_ATLAS = Object.freeze({
    image: ch01_atlas_v1_default.proposedRuntimeImage,
    revision: ch01_atlas_v1_default.revision,
    width: ch01_atlas_v1_default.dimensions.width,
    height: ch01_atlas_v1_default.dimensions.height,
    frameCount: rectangles.length,
    pivot,
    drawSize: ch01_atlas_v1_default.recommendedDrawSizeLogical
  });
  function createCh01Animator({
    hp = 2,
    maxHp = 2,
    maxDeltaSeconds = 0.05,
    bankThreshold = 16,
    initialState = "spawn"
  } = {}) {
    finite4(maxHp, "maxHp");
    finite4(hp, "hp");
    finite4(maxDeltaSeconds, "maxDeltaSeconds");
    finite4(bankThreshold, "bankThreshold");
    if (maxHp <= 0 || maxDeltaSeconds <= 0 || maxDeltaSeconds > 1 || bankThreshold < 0) {
      throw new RangeError("Invalid CH-01 animator bounds");
    }
    if (!Object.hasOwn(animations, initialState)) throw new RangeError("Unknown CH-01 initial state");
    let health = clamp5(hp, 0, maxHp), maximumHealth = maxHp;
    let state = health === 0 ? "destroy" : initialState;
    if (state === "destroy") health = 0;
    let elapsedMs = 0, eventCursor = 0, done = false;
    let vx = 0, vy = 0, attackCounter = 0, attackId = state === "attack" ? ++attackCounter : null;
    let attackFired = false;
    let pending = [];
    function frameIndex() {
      const definition = animations[state];
      let end = 0;
      for (let offset = 0; offset < definition.frames.length; offset++) {
        end += definition.durationMs[offset];
        if (elapsedMs < end - EPSILON_MS) return definition.frames[offset];
      }
      return definition.frames.at(-1);
    }
    function baseState() {
      if (health / maximumHealth <= 0.5) return "damaged";
      if (vx < -bankThreshold) return "bankLeft";
      if (vx > bankThreshold) return "bankRight";
      return Math.abs(vy) > bankThreshold ? "flight" : "idle";
    }
    function enter2(next) {
      state = next;
      elapsedMs = 0;
      eventCursor = 0;
      done = false;
      attackId = next === "attack" ? ++attackCounter : null;
      attackFired = false;
      if (next === "destroy") health = 0;
    }
    function request(next) {
      if (!Object.hasOwn(animations, next)) throw new RangeError(`Unknown CH-01 animation: ${next}`);
      if (animations[state].terminal || state === next) return false;
      if (animations[state].locked && priority(next) >= priority(state)) return false;
      if (state === "attack") {
        pending.push({
          name: "attackCanceled",
          state,
          frameIndex: frameIndex(),
          atMs: elapsedMs,
          attackId,
          fired: attackFired
        });
      }
      enter2(next);
      return true;
    }
    function update(dt, sample = {}) {
      finite4(dt, "dt");
      if (dt < 0) throw new RangeError("dt must be nonnegative");
      const nextMax = sample.maxHp === void 0 ? maximumHealth : finite4(sample.maxHp, "maxHp");
      if (nextMax <= 0) throw new RangeError("maxHp must be positive");
      const nextHealth = clamp5(sample.hp === void 0 ? health : finite4(sample.hp, "hp"), 0, nextMax);
      const nextVx = sample.vx === void 0 ? vx : finite4(sample.vx, "vx");
      const nextVy = sample.vy === void 0 ? vy : finite4(sample.vy, "vy");
      if (dt === 0) return [];
      if (!animations[state].terminal) {
        const lostHealth = nextHealth < health;
        health = nextHealth;
        maximumHealth = nextMax;
        vx = nextVx;
        vy = nextVy;
        if (health === 0) request("destroy");
        else if (lostHealth) request("hurt");
        else if (!animations[state].locked && state !== baseState()) enter2(baseState());
      }
      const emitted = pending;
      pending = [];
      let remaining = Math.min(dt, maxDeltaSeconds) * 1e3;
      while (remaining > EPSILON_MS && !done) {
        const definition = animations[state];
        const step = Math.min(remaining, definition.totalMs - elapsedMs);
        elapsedMs += step;
        remaining -= step;
        while (eventCursor < definition.events.length && definition.events[eventCursor].atMs <= elapsedMs + EPSILON_MS) {
          const event2 = definition.events[eventCursor++];
          if (event2.name === "fire") attackFired = true;
          emitted.push({
            name: event2.name,
            state,
            frameIndex: definition.frames[event2.frameOffset],
            atMs: event2.atMs,
            attackId
          });
        }
        if (elapsedMs + EPSILON_MS < definition.totalMs) break;
        if (definition.terminal) {
          done = true;
          if (definition.completionEvent) emitted.push({
            name: definition.completionEvent,
            state,
            frameIndex: frameIndex(),
            atMs: definition.totalMs,
            attackId
          });
        } else if (definition.loop) {
          elapsedMs = 0;
          eventCursor = 0;
        } else {
          enter2(baseState());
        }
      }
      return emitted;
    }
    function getFrame() {
      const index = frameIndex();
      return {
        state,
        frameIndex: index,
        rect: rectangles[index],
        pivot,
        drawSize: CH01_ATLAS.drawSize,
        image: CH01_ATLAS.image,
        done,
        terminal: Boolean(animations[state].terminal),
        damageRatio: 1 - health / maximumHealth,
        damaged: health / maximumHealth <= 0.5,
        attackId,
        hp: health,
        maxHp: maximumHealth
      };
    }
    return Object.freeze({ request, update, getFrame });
  }

  // src/game/progression/classic-scout.js
  var clamp6 = (value, low, high) => Math.max(low, Math.min(high, value));
  function createClassicScout({ x, phase = 0, width = 720 } = {}) {
    if (![x, phase, width].every(Number.isFinite) || width < 250) throw new RangeError("Invalid scout spawn");
    return {
      age: 0,
      baseX: x,
      phase,
      width,
      nextFire: 1.7,
      fireInterval: 1.9,
      fired: 0,
      telegraph: 0,
      attackScheduled: false,
      animator: createCh01Animator({ hp: 2, maxHp: 2 })
    };
  }
  function advanceClassicScout(item, dt, player, spawnProjectile) {
    if (!Number.isFinite(dt) || dt < 0) throw new RangeError("Invalid scout delta");
    if (typeof spawnProjectile !== "function") throw new TypeError("Spawn callback required");
    const scout = item.classicScout;
    if (!scout || dt === 0) return;
    scout.age += dt;
    const previousX = item.x;
    item.x = clamp6(
      scout.baseX + Math.sin(scout.age * 1.35 + scout.phase) * 28,
      52,
      scout.width - 52
    );
    const inRange = item.y >= 0 && item.y < player.y - 270;
    if (inRange && scout.fired < 2 && scout.age >= scout.nextFire - 0.46 && !scout.attackScheduled) {
      scout.attackScheduled = scout.animator.request("attack");
    }
    const events = scout.animator.update(dt, {
      hp: item.hp,
      maxHp: item.maxHp,
      vx: (item.x - previousX) / dt,
      vy: item.s
    });
    for (const event2 of events) {
      if (event2.name === "attackCanceled" && !event2.fired) {
        scout.attackScheduled = false;
        scout.nextFire = scout.age + 1.1;
      }
    }
    scout.telegraph = inRange && scout.attackScheduled ? clamp6(1 - (scout.nextFire - scout.age) / 0.46, 0, 1) : 0;
    if (!inRange || scout.fired >= 2 || !events.some((event2) => event2.name === "fire")) return;
    spawnProjectile({
      type: "meteor",
      x: item.x,
      baseX: item.x,
      y: item.y + 38,
      r: 9,
      s: 295,
      damage: 16,
      rot: 0,
      rs: 0,
      p: 0,
      phase: 0,
      amp: 0,
      special: "",
      alpha: 1,
      hp: 1,
      maxHp: 1,
      classicScoutProjectile: true
    });
    scout.fired++;
    scout.nextFire = scout.age + scout.fireInterval;
    scout.attackScheduled = false;
    scout.telegraph = 0;
  }

  // src/game/combat/attack-tokens.js
  var WAIT_EXPIRY = 0.5;
  function createAttackTokens({ max }) {
    if (!Number.isInteger(max) || max < 1) throw new RangeError("max must be a positive integer");
    return { max, holders: /* @__PURE__ */ new Map(), waiting: /* @__PURE__ */ new Map() };
  }
  function requestAttack(tokens, enemy, now) {
    const { holders, waiting } = tokens;
    if (holders.has(enemy.id)) return true;
    for (const [id, entry] of waiting) if (now - entry.at > WAIT_EXPIRY) waiting.delete(id);
    const olderWaiting = [...waiting].some(([id, entry]) => id !== enemy.id && entry.bornAt < enemy.bornAt);
    if (holders.size < tokens.max && !olderWaiting) {
      waiting.delete(enemy.id);
      holders.set(enemy.id, { bornAt: enemy.bornAt, grantedAt: now });
      return true;
    }
    waiting.set(enemy.id, { bornAt: enemy.bornAt, at: now });
    return false;
  }
  function releaseAttack(tokens, enemyId) {
    tokens.holders.delete(enemyId);
  }
  function forgetEnemy(tokens, enemyId) {
    tokens.holders.delete(enemyId);
    tokens.waiting.delete(enemyId);
  }
  var attackHolders = (tokens) => [...tokens.holders.keys()];

  // src/game/combat/classic-pursuit.js
  var CLASSIC_PURSUIT_VERSION = "classic-pursuit-v5";
  var clamp7 = (value, low, high) => Math.max(low, Math.min(high, value));
  var approach = (value, target, amount) => value + clamp7(target - value, -amount, amount);
  var MAX_LATERAL_SPEED = 176;
  var profiles = Object.freeze({
    raider: Object.freeze({
      warning: 0.32,
      recovery: 1.25,
      maxAttacks: 8,
      holdSeconds: 9,
      depth: 0.3,
      lateralSpeed: 140,
      acceleration: 265,
      sampleInterval: 0.24,
      orbitRate: 0.96,
      lateralSweep: 0.68,
      depthSweep: 25,
      projectileSpeed: 360,
      leadSeconds: 0.32,
      damage: 14,
      volleys: Object.freeze({ single: 0.45, double: 0.35, spread: 0.2 }),
      flipChance: 0.7,
      dashChance: 0.15
    }),
    scout: Object.freeze({
      warning: 0.38,
      recovery: 1.6,
      maxAttacks: 7,
      holdSeconds: 10,
      depth: 0.29,
      lateralSpeed: 104,
      acceleration: 190,
      sampleInterval: 0.32,
      orbitRate: 0.76,
      lateralSweep: 0.72,
      depthSweep: 32,
      projectileSpeed: 335,
      leadSeconds: 0.22,
      damage: 12,
      volleys: Object.freeze({ single: 0.5, double: 0.15, spread: 0.35 }),
      flipChance: 0.6,
      dashChance: 0.1
    }),
    interceptor: Object.freeze({
      warning: 0.3,
      recovery: 1.15,
      maxAttacks: 10,
      holdSeconds: 11,
      depth: 0.27,
      lateralSpeed: 176,
      acceleration: 315,
      sampleInterval: 0.2,
      orbitRate: 1.23,
      lateralSweep: 0.9,
      depthSweep: 40,
      projectileSpeed: 390,
      leadSeconds: 0.38,
      damage: 15,
      volleys: Object.freeze({ single: 0.25, double: 0.45, spread: 0.3 }),
      flipChance: 0.75,
      dashChance: 0.35
    })
  });
  function observePlayer(enemy, player, interval) {
    if (enemy.age + 1e-9 < enemy.nextObservationAt) return;
    const prior = enemy.observation, elapsed = prior ? enemy.age - prior.at : 0;
    const vx = elapsed > 0 ? clamp7((player.x - prior.x) / elapsed, -720, 720) : 0;
    const vy = elapsed > 0 ? clamp7((player.y - prior.y) / elapsed, -560, 560) : 0;
    enemy.observation = {
      x: player.x,
      y: player.y,
      at: enemy.age,
      vx: prior ? prior.vx * 0.35 + vx * 0.65 : 0,
      vy: prior ? prior.vy * 0.35 + vy * 0.65 : 0
    };
    enemy.nextObservationAt = enemy.age + interval;
  }
  function variationFor(seed) {
    let value = Math.imul(Math.trunc(seed) >>> 0 ^ 2654435769, 2246822507);
    value = Math.imul(value ^ value >>> 16, 3266489909);
    return ((value ^ value >>> 13) >>> 0) / 4294967296;
  }
  function nextRandom(enemy) {
    enemy.rng = enemy.rng + 1831565813 >>> 0;
    let value = Math.imul(enemy.rng ^ enemy.rng >>> 15, 1 | enemy.rng);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }
  function chooseVolley(enemy, weights) {
    if (enemy.fired === 0) return "single";
    let roll = nextRandom(enemy);
    for (const [kind, weight] of Object.entries(weights)) {
      roll -= weight;
      if (roll <= 0) return kind;
    }
    return "single";
  }
  var CLASSIC_PURSUIT_VOLLEY = Object.freeze({ maxProjectiles: 5, doubleGap: 0.2, spreadAngle: 0.3, spreadCount: 5, cone: 1.2 });
  function createClassicPursuer({
    x,
    width = 720,
    height = 1280,
    role = "scout",
    seed = 0,
    minAttackY = Math.max(96, height * 0.105),
    baseSpeed = null
  } = {}) {
    if (![x, width, height, seed, minAttackY].every(Number.isFinite) || width < 250 || height < 300 || !Object.hasOwn(profiles, role) || baseSpeed !== null && (!Number.isFinite(baseSpeed) || baseSpeed <= 0)) {
      throw new RangeError("Invalid classic pursuer spawn");
    }
    const side = Math.abs(Math.trunc(seed)) % 2 ? -1 : 1;
    const combatMargin = Math.min(width * 0.32, Math.max(80, width * 0.18));
    const entryInset = Math.min(16, (width - combatMargin * 2) * 0.15);
    return {
      tacticsVersion: CLASSIC_PURSUIT_VERSION,
      role,
      width,
      height,
      minAttackY,
      seed,
      side,
      phase: Math.abs(seed) * 0.61803398875 % 1 * Math.PI * 2,
      // Stable individual flight signatures, rather than changing random numbers
      // every frame. They change intent targets, never teleport the physical body.
      manoeuvreRate: 0.84 + variationFor(seed) * 0.32,
      sweepScale: 0.82 + variationFor(seed + 107) * 0.36,
      manoeuvre: role === "scout" ? "survey-orbit" : role === "interceptor" ? "flank-arc" : "attack-strafe",
      age: 0,
      state: "entry",
      stage: "entry",
      stateAge: 0,
      baseX: clamp7(x, combatMargin, width - combatMargin),
      targetX: clamp7(x, combatMargin + entryInset, width - combatMargin - entryInset),
      vx: 0,
      combatMinX: combatMargin,
      combatMaxX: width - combatMargin,
      holdY: null,
      combatStartedAt: null,
      retreatReason: null,
      repositionCount: 0,
      intensity: 0,
      observation: null,
      nextObservationAt: 0,
      observedTarget: null,
      leadOffset: 0,
      baseSpeed,
      nextTargetAt: 0,
      nextFire: 1.25,
      fired: 0,
      telegraph: 0,
      lockedTarget: null,
      attackScheduled: false,
      chargeSerial: 0,
      firedSerial: -1,
      previousHp: null,
      chargeStartedAt: null,
      rng: (Math.imul(Math.trunc(seed) >>> 0, 2654435769) ^ 1374496523) >>> 0,
      volley: "single",
      followUp: null,
      dashing: false,
      bornAt: null,
      animator: createCh01Animator({ hp: 2, maxHp: 2 })
    };
  }
  function advanceClassicPursuer(item, dt, player, spawnProjectile, gate = null) {
    if (!Number.isFinite(dt) || dt < 0) throw new RangeError("Invalid pursuer delta");
    if (typeof spawnProjectile !== "function") throw new TypeError("Spawn callback required");
    const enemy = item.classicScout;
    if (!enemy || dt === 0) return;
    if (![item.x, item.y, item.s, player?.x, player?.y].every(Number.isFinite)) {
      throw new TypeError("Finite pursuer and player positions required");
    }
    const step = Math.min(dt, 0.05), profile2 = profiles[enemy.role];
    const hp = item.hp ?? 2, maxHp = item.maxHp ?? 2;
    enemy.baseSpeed ??= Math.max(1, item.s);
    enemy.age += step;
    enemy.stateAge += step;
    if (gate) enemy.bornAt ??= gate.now;
    const releaseTurn = () => {
      if (gate) releaseAttack(gate.tokens, item.id);
    };
    observePlayer(enemy, player, profile2.sampleInterval);
    const lostHealth = enemy.previousHp !== null && hp < enemy.previousHp;
    enemy.previousHp = hp;
    const enter2 = (state) => {
      enemy.state = enemy.stage = state;
      enemy.stateAge = 0;
    };
    const combatX = (value) => clamp7(value, enemy.combatMinX, enemy.combatMaxX);
    const minimumHoldY = enemy.minAttackY + 52;
    const maximumHoldY = Math.max(minimumHoldY, Math.min(enemy.height * 0.52, player.y - 350));
    const flightPhase = enemy.phase + enemy.age * profile2.orbitRate * enemy.manoeuvreRate;
    const depthArc = Math.cos(flightPhase) * profile2.depthSweep * (["charge", "fire"].includes(enemy.state) ? 0.35 : 1);
    enemy.holdY = clamp7(
      enemy.height * profile2.depth + depthArc + Math.sin(enemy.phase) * 12,
      minimumHoldY,
      maximumHoldY
    );
    const canAttack = () => hp > 0 && enemy.state !== "retreat" && !enemy.holdFire && item.y >= enemy.minAttackY && item.y + 38 <= player.y - 230;
    const clearCharge = () => {
      enemy.telegraph = 0;
      enemy.attackScheduled = false;
      enemy.lockedTarget = null;
    };
    const laneTarget = () => {
      const sample = enemy.observation;
      const observedX = combatX(sample.x + clamp7(sample.vx * 0.18, -64, 64));
      const span = Math.min(enemy.width * 0.24, 140);
      const sweep = Math.sin(flightPhase) * span * profile2.lateralSweep * enemy.sweepScale;
      return combatX(enemy.role === "interceptor" ? observedX + enemy.side * span * 0.68 + sweep : enemy.role === "scout" ? enemy.baseX * 0.45 + observedX * 0.55 + enemy.side * span * 0.2 + sweep : observedX + enemy.side * span * 0.42 + sweep);
    };
    const reposition = () => {
      releaseTurn();
      clearCharge();
      enemy.followUp = null;
      if (nextRandom(enemy) < profile2.flipChance) enemy.side *= -1;
      enemy.dashing = nextRandom(enemy) < profile2.dashChance;
      enemy.repositionCount++;
      enemy.targetX = laneTarget();
      enemy.nextTargetAt = enemy.age + profile2.sampleInterval;
      enemy.nextFire = enemy.age + profile2.recovery * (1 - 0.18 * enemy.intensity) * (0.65 + nextRandom(enemy) * 0.7);
      enter2("reposition");
    };
    const retreat = (reason) => {
      releaseTurn();
      clearCharge();
      enemy.followUp = null;
      enemy.retreatReason = reason;
      enemy.targetX = player.x < enemy.width / 2 ? enemy.width - 56 : 56;
      enter2("retreat");
    };
    if (hp <= 0) {
      releaseTurn();
      clearCharge();
      enemy.followUp = null;
      if (enemy.state !== "destroyed") enter2("destroyed");
    } else if (enemy.state !== "retreat" && enemy.state !== "destroyed") {
      const heldFor = enemy.combatStartedAt === null ? 0 : enemy.age - enemy.combatStartedAt;
      enemy.intensity = gate ? 0 : Math.min(2, Math.floor(heldFor / profile2.holdSeconds));
      if (enemy.fired === 0 && heldFor >= profile2.holdSeconds || enemy.combatStartedAt === null && enemy.age >= profile2.holdSeconds + 8) {
        retreat("time-limit");
      } else if (lostHealth && !["entry", "brake"].includes(enemy.state)) {
        reposition();
      } else if (enemy.state === "charge" && !canAttack()) {
        reposition();
      }
    }
    if (enemy.state === "entry" && item.y >= enemy.holdY - 110) enter2("brake");
    if (enemy.state === "brake" && Math.abs(item.y - enemy.holdY) <= 32 && Math.abs(item.s) <= 62 && item.x >= enemy.combatMinX && item.x <= enemy.combatMaxX) {
      enemy.combatStartedAt ??= enemy.age;
      enemy.targetX = laneTarget();
      enemy.nextTargetAt = enemy.age + profile2.sampleInterval;
      enter2("track");
    }
    if (enemy.state === "fire" && enemy.stateAge >= 0.34) {
      reposition();
    }
    if (enemy.state === "reposition" && enemy.age >= enemy.nextFire) enter2("track");
    if (enemy.state === "reposition" && enemy.age >= enemy.nextTargetAt) {
      enemy.targetX = laneTarget();
      enemy.nextTargetAt = enemy.age + profile2.sampleInterval;
    }
    if (enemy.state === "track") {
      if (enemy.age >= enemy.nextTargetAt) {
        enemy.targetX = laneTarget();
        enemy.nextTargetAt = enemy.age + profile2.sampleInterval;
      }
      if (canAttack() && enemy.age >= enemy.nextFire && !lostHealth && Math.abs(item.y - enemy.holdY) <= 45 && Math.abs(item.s) <= 62 && (!gate || requestAttack(gate.tokens, { id: item.id, bornAt: enemy.bornAt }, gate.now))) {
        const sample = enemy.observation;
        enemy.leadOffset = clamp7(sample.vx * profile2.leadSeconds * (player.marked ? 1.5 : 1), -110, 110);
        enemy.observedTarget = Object.freeze({ ...sample });
        enemy.lockedTarget = Object.freeze({
          x: clamp7(sample.x + enemy.leadOffset, 24, enemy.width - 24),
          y: clamp7(sample.y + clamp7(sample.vy * 0.12, -48, 48), item.y + 268, enemy.height - 24)
        });
        enemy.targetX = item.x;
        enemy.chargeStartedAt = enemy.age;
        enemy.chargeSerial++;
        enemy.volley = chooseVolley(enemy, profile2.volleys);
        enter2("charge");
      }
    }
    if (enemy.state === "charge") {
      const warningElapsed = enemy.age - enemy.chargeStartedAt;
      enemy.telegraph = clamp7(warningElapsed / profile2.warning, 0, 1);
      if (warningElapsed >= profile2.warning && !enemy.attackScheduled) {
        enemy.attackScheduled = enemy.animator.request("attack");
      }
    }
    const previousX = item.x;
    const lateralLimit = enemy.dashing && enemy.state === "reposition" ? Math.min(MAX_LATERAL_SPEED, profile2.lateralSpeed * 1.3) : profile2.lateralSpeed;
    const desiredVelocity = ["charge", "fire", "destroyed"].includes(enemy.state) ? 0 : clamp7((enemy.targetX - item.x) * 2.8, -lateralLimit, lateralLimit);
    enemy.vx = approach(enemy.vx, desiredVelocity, profile2.acceleration * step);
    const minimumX = enemy.state === "retreat" ? 52 : Math.min(item.x, enemy.combatMinX);
    const maximumX = enemy.state === "retreat" ? enemy.width - 52 : Math.max(item.x, enemy.combatMaxX);
    item.x = clamp7(item.x + enemy.vx * step, minimumX, maximumX);
    enemy.vx = (item.x - previousX) / step;
    const desiredVertical = enemy.state === "destroyed" ? 0 : enemy.state === "retreat" ? enemy.baseSpeed * 1.35 : clamp7((enemy.holdY - item.y) * 1.8, -82, enemy.baseSpeed);
    item.s = approach(item.s, desiredVertical, enemy.baseSpeed * 1.8 * step);
    const events = enemy.animator.update(step, { hp, maxHp, vx: enemy.vx, vy: item.s });
    const launch = (angleOffset) => {
      const aim = enemy.lockedTarget;
      const dy = Math.max(1, aim.y - (item.y + 38));
      const dx = clamp7(aim.x - item.x, -dy * CLASSIC_PURSUIT_VOLLEY.cone, dy * CLASSIC_PURSUIT_VOLLEY.cone);
      const limit = Math.atan(CLASSIC_PURSUIT_VOLLEY.cone);
      const half = enemy.volley === "spread" ? CLASSIC_PURSUIT_VOLLEY.spreadAngle * (CLASSIC_PURSUIT_VOLLEY.spreadCount - 1) / 2 : 0;
      const angle = clamp7(Math.atan2(dx, dy), -limit + half, limit - half) + angleOffset;
      const speed = profile2.projectileSpeed;
      spawnProjectile({
        type: "meteor",
        x: item.x,
        baseX: item.x,
        y: item.y + 38,
        r: 9,
        s: speed,
        vx: Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        life: 5,
        damage: profile2.damage,
        rot: 0,
        rs: 0,
        p: 0,
        phase: 0,
        amp: 0,
        special: "",
        alpha: 1,
        hp: 1,
        maxHp: 1,
        classicScoutProjectile: true,
        tacticsVersion: CLASSIC_PURSUIT_VERSION,
        attackSerial: enemy.chargeSerial,
        role: enemy.role,
        volley: enemy.volley,
        observedTarget: { ...enemy.observedTarget },
        leadOffset: enemy.leadOffset
      });
    };
    if (enemy.followUp !== null && enemy.state === "fire" && enemy.age >= enemy.followUp) {
      enemy.followUp = null;
      if (canAttack() && enemy.lockedTarget) launch(0);
    }
    for (const event2 of events) {
      if (event2.name === "attackCanceled" && enemy.state === "charge") reposition();
      if (event2.name !== "fire" || enemy.state !== "charge" || !enemy.attackScheduled || enemy.firedSerial === enemy.chargeSerial || !canAttack()) continue;
      enemy.firedSerial = enemy.chargeSerial;
      enemy.fired++;
      enemy.telegraph = 0;
      enemy.attackScheduled = false;
      enter2("fire");
      if (enemy.volley === "spread") {
        const { spreadAngle, spreadCount } = CLASSIC_PURSUIT_VOLLEY;
        for (let k = 0; k < spreadCount; k++) launch((k - (spreadCount - 1) / 2) * spreadAngle);
      } else {
        launch(0);
        if (enemy.volley === "double") enemy.followUp = enemy.age + CLASSIC_PURSUIT_VOLLEY.doubleGap;
      }
    }
  }

  // art-source/enemies/ch02/ch02-atlas-v1.json
  var ch02_atlas_v1_default = {
    schemaVersion: 1,
    id: "gaia.ch02.interceptor",
    revision: "ch02-art-v1",
    productionStatus: "IN_REVIEW",
    technicalAcceptance: "ASSET_AND_ANIMATOR_VALIDATED_RUNTIME_PENDING",
    artisticAcceptance: "PENDING_OWNER",
    physicalAcceptance: "PENDING",
    image: "ch02-atlas-v1.webp",
    proposedRuntimeImage: "assets/ch02_interceptor_atlas_v1.webp",
    master: "ch02-master-v2.png",
    sourceHistorical: "ch02-master-v1.png",
    dimensions: {
      width: 1024,
      height: 1024
    },
    layout: {
      columns: 4,
      rows: 4,
      frameWidth: 256,
      frameHeight: 256,
      frameCount: 16
    },
    pivot: {
      x: 0.5,
      y: 0.5
    },
    forward: {
      x: 0,
      y: 1
    },
    recommendedDrawSizeLogical: 108,
    transparent: true,
    decodedRgbaBytes: 4194304,
    runtimeBytes: 252886,
    frames: [
      {
        index: 0,
        stateRow: "navigation",
        sourceRect: {
          x: 0,
          y: 32,
          width: 314,
          height: 306
        },
        rect: {
          x: 0,
          y: 0,
          width: 256,
          height: 256
        },
        rgbaSha256: "760e99a0fdfe1e847cdbfcd2dac8d969f986969250ecd27cea1806b5691bf498",
        alphaBounds: {
          minX: 36,
          minY: 47,
          maxX: 224,
          maxY: 222
        },
        maximumBorderAlpha: 0
      },
      {
        index: 1,
        stateRow: "navigation",
        sourceRect: {
          x: 314,
          y: 32,
          width: 313,
          height: 306
        },
        rect: {
          x: 256,
          y: 0,
          width: 256,
          height: 256
        },
        rgbaSha256: "7fa96f8444836653f0c84888308b0625926a42798f6fb74bc8167135c33fcd15",
        alphaBounds: {
          minX: 32,
          minY: 29,
          maxX: 228,
          maxY: 218
        },
        maximumBorderAlpha: 0
      },
      {
        index: 2,
        stateRow: "navigation",
        sourceRect: {
          x: 627,
          y: 32,
          width: 314,
          height: 306
        },
        rect: {
          x: 512,
          y: 0,
          width: 256,
          height: 256
        },
        rgbaSha256: "37f85e624042be660ec0116321987ba9d49a6e09fa676040d6722440f84a5cae",
        alphaBounds: {
          minX: 17,
          minY: 43,
          maxX: 222,
          maxY: 215
        },
        maximumBorderAlpha: 0
      },
      {
        index: 3,
        stateRow: "navigation",
        sourceRect: {
          x: 941,
          y: 32,
          width: 313,
          height: 306
        },
        rect: {
          x: 768,
          y: 0,
          width: 256,
          height: 256
        },
        rgbaSha256: "a0e893b537c5d11ec22ee1527066e3b149ce1f9fbc3db5f9cecf1ff5be8deadf",
        alphaBounds: {
          minX: 39,
          minY: 48,
          maxX: 216,
          maxY: 212
        },
        maximumBorderAlpha: 0
      },
      {
        index: 4,
        stateRow: "attack",
        sourceRect: {
          x: 0,
          y: 329,
          width: 314,
          height: 294
        },
        rect: {
          x: 0,
          y: 256,
          width: 256,
          height: 256
        },
        rgbaSha256: "6f7d7fce0fb53c04bf2b4320f6dfabee260f9e2c50fa8dfab6beb6a00d667392",
        alphaBounds: {
          minX: 27,
          minY: 41,
          maxX: 239,
          maxY: 216
        },
        maximumBorderAlpha: 0
      },
      {
        index: 5,
        stateRow: "attack",
        sourceRect: {
          x: 314,
          y: 329,
          width: 313,
          height: 294
        },
        rect: {
          x: 256,
          y: 256,
          width: 256,
          height: 256
        },
        rgbaSha256: "4330b7f5c5909bc554e7347c050c1d970035638630626794b39f20bf3a8cab53",
        alphaBounds: {
          minX: 29,
          minY: 41,
          maxX: 232,
          maxY: 232
        },
        maximumBorderAlpha: 0
      },
      {
        index: 6,
        stateRow: "attack",
        sourceRect: {
          x: 627,
          y: 329,
          width: 314,
          height: 294
        },
        rect: {
          x: 512,
          y: 256,
          width: 256,
          height: 256
        },
        rgbaSha256: "fa3837055b958d776048512a8ee3f9e312c395c5b48b01431b8bd8e58de0d2bc",
        alphaBounds: {
          minX: 27,
          minY: 42,
          maxX: 232,
          maxY: 232
        },
        maximumBorderAlpha: 0
      },
      {
        index: 7,
        stateRow: "attack",
        sourceRect: {
          x: 941,
          y: 329,
          width: 313,
          height: 294
        },
        rect: {
          x: 768,
          y: 256,
          width: 256,
          height: 256
        },
        rgbaSha256: "a618fc24201f0b8fb7dcc3dd29871e6e7558830d2ef2c0e4ceafb851674ce0bc",
        alphaBounds: {
          minX: 31,
          minY: 41,
          maxX: 228,
          maxY: 220
        },
        maximumBorderAlpha: 0
      },
      {
        index: 8,
        stateRow: "damage",
        sourceRect: {
          x: 0,
          y: 624,
          width: 314,
          height: 298
        },
        rect: {
          x: 0,
          y: 512,
          width: 256,
          height: 256
        },
        rgbaSha256: "fd6eb8aa613e2ea4fb71ebc33e46f3677ff551fe93504272f002edac13af51aa",
        alphaBounds: {
          minX: 29,
          minY: 47,
          maxX: 229,
          maxY: 220
        },
        maximumBorderAlpha: 0
      },
      {
        index: 9,
        stateRow: "damage",
        sourceRect: {
          x: 314,
          y: 624,
          width: 313,
          height: 298
        },
        rect: {
          x: 256,
          y: 512,
          width: 256,
          height: 256
        },
        rgbaSha256: "f18b66c17d287637015b0eee25faf93deea6e143397966af79bd4b61341a363b",
        alphaBounds: {
          minX: 28,
          minY: 21,
          maxX: 228,
          maxY: 219
        },
        maximumBorderAlpha: 0
      },
      {
        index: 10,
        stateRow: "damage",
        sourceRect: {
          x: 627,
          y: 624,
          width: 314,
          height: 298
        },
        rect: {
          x: 512,
          y: 512,
          width: 256,
          height: 256
        },
        rgbaSha256: "125c381ec01f6ee8bc11c689fcb48c30f37c5b8ebc1614c53904e7b56e86d10c",
        alphaBounds: {
          minX: 26,
          minY: 21,
          maxX: 233,
          maxY: 233
        },
        maximumBorderAlpha: 0
      },
      {
        index: 11,
        stateRow: "damage",
        sourceRect: {
          x: 941,
          y: 624,
          width: 313,
          height: 298
        },
        rect: {
          x: 768,
          y: 512,
          width: 256,
          height: 256
        },
        rgbaSha256: "fa1d015cac8ac14d8caca984c8b27ab2e3dbead7005fbdfcbe53752ea0466140",
        alphaBounds: {
          minX: 29,
          minY: 24,
          maxX: 227,
          maxY: 220
        },
        maximumBorderAlpha: 0
      },
      {
        index: 12,
        stateRow: "destroy",
        sourceRect: {
          x: 0,
          y: 926,
          width: 314,
          height: 302
        },
        rect: {
          x: 0,
          y: 768,
          width: 256,
          height: 256
        },
        rgbaSha256: "c0dad9f867370dfedebf3677bb621711d1ddc80c0dc690a0d4a70c9b1d646f4c",
        alphaBounds: {
          minX: 35,
          minY: 26,
          maxX: 232,
          maxY: 225
        },
        maximumBorderAlpha: 0
      },
      {
        index: 13,
        stateRow: "destroy",
        sourceRect: {
          x: 314,
          y: 926,
          width: 313,
          height: 302
        },
        rect: {
          x: 256,
          y: 768,
          width: 256,
          height: 256
        },
        rgbaSha256: "7ac82ef3a1a0edce9d6b3326ada764aca225531ee1186551d20c8604fa15919c",
        alphaBounds: {
          minX: 29,
          minY: 22,
          maxX: 239,
          maxY: 216
        },
        maximumBorderAlpha: 0
      },
      {
        index: 14,
        stateRow: "destroy",
        sourceRect: {
          x: 627,
          y: 926,
          width: 314,
          height: 302
        },
        rect: {
          x: 512,
          y: 768,
          width: 256,
          height: 256
        },
        rgbaSha256: "24673e19a13f1c9b175a49ea199e03915e7b1434e3b812de0b70c1e0c7f27ba5",
        alphaBounds: {
          minX: 16,
          minY: 20,
          maxX: 226,
          maxY: 219
        },
        maximumBorderAlpha: 0
      },
      {
        index: 15,
        stateRow: "destroy",
        sourceRect: {
          x: 941,
          y: 926,
          width: 313,
          height: 302
        },
        rect: {
          x: 768,
          y: 768,
          width: 256,
          height: 256
        },
        rgbaSha256: "5334a37b83b1e12db440797acfb0b89f90c77c1f90f6df3c24e1f5830dd57b43",
        alphaBounds: {
          minX: 27,
          minY: 24,
          maxX: 209,
          maxY: 220
        },
        maximumBorderAlpha: 0
      }
    ],
    animations: {
      spawn: {
        frames: [
          0,
          1
        ],
        durationMs: [
          130,
          190
        ],
        loop: false,
        locked: true,
        next: "idle"
      },
      idle: {
        frames: [
          0,
          1
        ],
        durationMs: [
          180,
          180
        ],
        loop: true,
        locked: false
      },
      flight: {
        frames: [
          1,
          0
        ],
        durationMs: [
          100,
          100
        ],
        loop: true,
        locked: false
      },
      bankLeft: {
        frames: [
          2
        ],
        durationMs: [
          100
        ],
        loop: true,
        locked: false
      },
      bankRight: {
        frames: [
          3
        ],
        durationMs: [
          100
        ],
        loop: true,
        locked: false
      },
      attack: {
        frames: [
          4,
          5,
          6,
          7
        ],
        durationMs: [
          160,
          80,
          90,
          170
        ],
        loop: false,
        locked: true,
        next: "idle",
        events: [
          {
            frameOffset: 0,
            name: "charge"
          },
          {
            frameOffset: 1,
            name: "fire"
          }
        ]
      },
      hurt: {
        frames: [
          8,
          9,
          10
        ],
        durationMs: [
          65,
          75,
          100
        ],
        loop: false,
        locked: true,
        next: "idle"
      },
      damaged: {
        frames: [
          10,
          11
        ],
        durationMs: [
          150,
          150
        ],
        loop: true,
        locked: false
      },
      destroy: {
        frames: [
          12,
          13,
          14,
          15
        ],
        durationMs: [
          90,
          110,
          140,
          200
        ],
        loop: false,
        locked: true,
        terminal: true,
        events: [
          {
            frameOffset: 1,
            name: "coreBurst"
          }
        ],
        completionEvent: "removeVisual"
      }
    },
    transitionRules: {
      priority: [
        "destroy",
        "hurt",
        "attack",
        "spawn",
        "bankLeft",
        "bankRight",
        "flight",
        "idle"
      ],
      destroyCannotBeInterrupted: true,
      gameplayCollisionIndependentOfArt: true,
      banking: "Use the bank pose matching actual lateral velocity; do not animate left/right while stationary.",
      fire: "Only the returned fire event may release projectiles; the visible muzzle pose is cell 5 at 160 ms.",
      destroy: "Remove gameplay hitbox at death; retain this visual until removeVisual, emitted once."
    },
    palette: {
      titanium: "#E8EDF0",
      graphite: "#15202D",
      cyan: "#5CF5FF",
      hostile: "#B92328"
    },
    catalogEntries: [
      "gaia-ch02-move",
      "gaia-ch02-attack",
      "gaia-ch02-destroy"
    ],
    provenance: {
      method: "OpenAI image_gen generation and image_gen correction; ImageMagick crop/repack/WebP export",
      generatorOutputOriginal: "exec-82980262-9067-4dce-adb2-589ed069ef5b.png",
      generatorOutputCorrection: "exec-70db54ea-4dff-402e-b4cb-2524f0dee78d.png",
      generatedAtUtcDate: "2026-10-18",
      preparedAtUtcDate: "2026-10-18",
      prompts: "PROVENANCE.md",
      rights: "Original generated design for this project. Existing project CH-01 and modular player ship inspected for style; neither was submitted as a generation reference. Correction references only the first generated CH-02. No downloaded stock or copied franchise assets; legal clearance is not asserted."
    },
    checksums: {
      "ch02-master-v1.png": "236cfee991023926667775798fdc0c612b5073d183c713f8d0e589a8386042ff",
      "ch02-master-v2.png": "c63a6e176de139edb7e0807a62a3e4a581b924e90f69becab0c731d982fe8a69",
      "ch02-atlas-v1.webp": "0b1b84b7a14edbc315136339f6f423989d685c7ea4c6122a7a7b88939be78729"
    },
    verificationLimits: [
      "Runtime integration, natural encounters and offline precache require root integration and browser QA.",
      "Artistic acceptance remains with the owner. Sixteen distinct poses are not a skeletal or high-frame-rate animation.",
      "Generative poses can have minor registration differences; source rectangles preserve the same fuselage pivot approximately.",
      "The generated master has irregular vertical spacing. Recorded source rectangles isolate each row before transparent padding.",
      "No physical iPhone or decoded GPU memory measurement has been performed."
    ]
  };

  // src/game/animation/ch02-animator.js
  var EPSILON_MS2 = 1e-7;
  var finite5 = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  var clamp8 = (value, min, max) => Math.max(min, Math.min(max, value));
  var rectangles2 = Object.freeze(ch02_atlas_v1_default.frames.map((frame) => {
    const { x, y, width, height } = frame.rect;
    if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > ch02_atlas_v1_default.dimensions.width || y + height > ch02_atlas_v1_default.dimensions.height) {
      throw new RangeError("CH-02 frame lies outside its atlas");
    }
    return Object.freeze({ ...frame.rect });
  }));
  var animations2 = Object.freeze(Object.fromEntries(Object.entries(ch02_atlas_v1_default.animations).map(([name, definition]) => {
    if (definition.frames.length !== definition.durationMs.length || !definition.frames.length || definition.frames.some((index) => !Number.isInteger(index) || !rectangles2[index]) || definition.durationMs.some((duration) => !Number.isFinite(duration) || duration <= 0)) {
      throw new RangeError(`Invalid CH-02 animation: ${name}`);
    }
    const durations = Object.freeze([...definition.durationMs]);
    const events = Object.freeze((definition.events || []).map((event2) => {
      if (!Number.isInteger(event2.frameOffset) || event2.frameOffset < 0 || event2.frameOffset >= definition.frames.length) {
        throw new RangeError(`Invalid CH-02 event: ${name}`);
      }
      return Object.freeze({ ...event2, atMs: durations.slice(0, event2.frameOffset).reduce((sum, value) => sum + value, 0) });
    }).sort((a, b) => a.atMs - b.atMs));
    return [name, Object.freeze({
      ...definition,
      frames: Object.freeze([...definition.frames]),
      durationMs: durations,
      totalMs: durations.reduce((sum, value) => sum + value, 0),
      events
    })];
  })));
  var priority2 = (name) => {
    const index = ch02_atlas_v1_default.transitionRules.priority.indexOf(name);
    return index < 0 ? ch02_atlas_v1_default.transitionRules.priority.length : index;
  };
  var pivot2 = Object.freeze({ ...ch02_atlas_v1_default.pivot });
  var CH02_ATLAS = Object.freeze({
    image: ch02_atlas_v1_default.proposedRuntimeImage,
    revision: ch02_atlas_v1_default.revision,
    width: ch02_atlas_v1_default.dimensions.width,
    height: ch02_atlas_v1_default.dimensions.height,
    frameCount: rectangles2.length,
    pivot: pivot2,
    drawSize: ch02_atlas_v1_default.recommendedDrawSizeLogical
  });
  function createCh02Animator({
    hp = 3,
    maxHp = 3,
    maxDeltaSeconds = 0.05,
    bankThreshold = 16,
    initialState = "spawn"
  } = {}) {
    finite5(maxHp, "maxHp");
    finite5(hp, "hp");
    finite5(maxDeltaSeconds, "maxDeltaSeconds");
    finite5(bankThreshold, "bankThreshold");
    if (maxHp <= 0 || maxDeltaSeconds <= 0 || maxDeltaSeconds > 1 || bankThreshold < 0) {
      throw new RangeError("Invalid CH-02 animator bounds");
    }
    if (!Object.hasOwn(animations2, initialState)) throw new RangeError("Unknown CH-02 initial state");
    let health = clamp8(hp, 0, maxHp), maximumHealth = maxHp;
    let state = health === 0 ? "destroy" : initialState;
    if (state === "destroy") health = 0;
    let elapsedMs = 0, eventCursor = 0, done = false;
    let vx = 0, vy = 0, attackCounter = 0, attackId = state === "attack" ? ++attackCounter : null;
    let attackFired = false;
    let pending = [];
    function frameIndex() {
      const definition = animations2[state];
      let end = 0;
      for (let offset = 0; offset < definition.frames.length; offset++) {
        end += definition.durationMs[offset];
        if (elapsedMs < end - EPSILON_MS2) return definition.frames[offset];
      }
      return definition.frames.at(-1);
    }
    function baseState() {
      if (health / maximumHealth <= 0.5) return "damaged";
      if (vx < -bankThreshold) return "bankLeft";
      if (vx > bankThreshold) return "bankRight";
      return Math.abs(vy) > bankThreshold ? "flight" : "idle";
    }
    function enter2(next) {
      state = next;
      elapsedMs = 0;
      eventCursor = 0;
      done = false;
      attackId = next === "attack" ? ++attackCounter : null;
      attackFired = false;
      if (next === "destroy") health = 0;
    }
    function request(next) {
      if (!Object.hasOwn(animations2, next)) throw new RangeError(`Unknown CH-02 animation: ${next}`);
      if (animations2[state].terminal || state === next) return false;
      if (animations2[state].locked && priority2(next) >= priority2(state)) return false;
      if (state === "attack") {
        pending.push({
          name: "attackCanceled",
          state,
          frameIndex: frameIndex(),
          atMs: elapsedMs,
          attackId,
          fired: attackFired
        });
      }
      enter2(next);
      return true;
    }
    function update(dt, sample = {}) {
      finite5(dt, "dt");
      if (dt < 0) throw new RangeError("dt must be nonnegative");
      const nextMax = sample.maxHp === void 0 ? maximumHealth : finite5(sample.maxHp, "maxHp");
      if (nextMax <= 0) throw new RangeError("maxHp must be positive");
      const nextHealth = clamp8(sample.hp === void 0 ? health : finite5(sample.hp, "hp"), 0, nextMax);
      const nextVx = sample.vx === void 0 ? vx : finite5(sample.vx, "vx");
      const nextVy = sample.vy === void 0 ? vy : finite5(sample.vy, "vy");
      if (dt === 0) return [];
      if (!animations2[state].terminal) {
        const lostHealth = nextHealth < health;
        health = nextHealth;
        maximumHealth = nextMax;
        vx = nextVx;
        vy = nextVy;
        if (health === 0) request("destroy");
        else if (lostHealth) request("hurt");
        else if (!animations2[state].locked && state !== baseState()) enter2(baseState());
      }
      const emitted = pending;
      pending = [];
      let remaining = Math.min(dt, maxDeltaSeconds) * 1e3;
      while (remaining > EPSILON_MS2 && !done) {
        const definition = animations2[state];
        const step = Math.min(remaining, definition.totalMs - elapsedMs);
        elapsedMs += step;
        remaining -= step;
        while (eventCursor < definition.events.length && definition.events[eventCursor].atMs <= elapsedMs + EPSILON_MS2) {
          const event2 = definition.events[eventCursor++];
          if (event2.name === "fire") attackFired = true;
          emitted.push({
            name: event2.name,
            state,
            frameIndex: definition.frames[event2.frameOffset],
            atMs: event2.atMs,
            attackId
          });
        }
        if (elapsedMs + EPSILON_MS2 < definition.totalMs) break;
        if (definition.terminal) {
          done = true;
          if (definition.completionEvent) emitted.push({
            name: definition.completionEvent,
            state,
            frameIndex: frameIndex(),
            atMs: definition.totalMs,
            attackId
          });
        } else if (definition.loop) {
          elapsedMs = 0;
          eventCursor = 0;
        } else {
          enter2(baseState());
        }
      }
      return emitted;
    }
    function getFrame() {
      const index = frameIndex();
      return {
        state,
        frameIndex: index,
        rect: rectangles2[index],
        pivot: pivot2,
        drawSize: CH02_ATLAS.drawSize,
        image: CH02_ATLAS.image,
        done,
        terminal: Boolean(animations2[state].terminal),
        damageRatio: 1 - health / maximumHealth,
        damaged: health / maximumHealth <= 0.5,
        attackId,
        hp: health,
        maxHp: maximumHealth
      };
    }
    return Object.freeze({ request, update, getFrame });
  }

  // src/game/combat/horde.js
  var HORDE_RULES = Object.freeze({ speed: 260, spacingX: 90, spacingY: 70, drift: 0.45 });
  function createHordeWave({ size, width, seed = 0 }) {
    if (!Number.isInteger(size) || size < 1 || !Number.isFinite(width) || width < 250) throw new RangeError("Invalid horde wave");
    const { speed, spacingX, spacingY, drift } = HORDE_RULES;
    const direction = Math.abs(Math.trunc(seed)) % 2 ? 1 : -1;
    const centerX = width * (direction > 0 ? 0.3 : 0.7);
    const vx = direction * speed * drift, vy = speed * Math.sqrt(1 - drift * drift);
    return Array.from({ length: size }, (_, index) => {
      const rank = Math.ceil(index / 2), side = index === 0 ? 0 : index % 2 ? -1 : 1;
      return { x: centerX + side * rank * spacingX, y: -60 - rank * spacingY, vx, vy, delay: 0 };
    });
  }

  // src/game/progression/aimed-meteors.js
  var AIMED_METEOR_RULES = Object.freeze({
    warning: 0.8,
    speed: 470,
    gap: 0.75,
    jitter: 0.5,
    first: 1,
    count: 10,
    radius: 22,
    damage: 14,
    margin: 40,
    entryY: -40
  });
  function nextRandom2(state) {
    state.rng = state.rng + 1831565813 >>> 0;
    let value = Math.imul(state.rng ^ state.rng >>> 15, 1 | state.rng);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }
  function createAimedMeteorRain({ seed = 0, width, height, count = AIMED_METEOR_RULES.count }) {
    if (![seed, width, height].every(Number.isFinite) || !Number.isInteger(count) || count < 1) throw new RangeError("Invalid aimed meteor rain");
    return {
      width,
      height,
      count,
      clock: 0,
      next: AIMED_METEOR_RULES.first,
      announced: 0,
      pending: [],
      done: false,
      rng: (Math.imul(Math.trunc(seed) >>> 0, 2654435769) ^ 625341585) >>> 0
    };
  }
  function advanceAimedMeteorRain(state, dt, player, emit) {
    if (state.done || !(dt > 0)) return;
    const { warning, speed, gap, jitter, margin, entryY, damage } = AIMED_METEOR_RULES;
    state.clock += dt;
    while (state.announced < state.count && state.clock >= state.next) {
      const id = `aimed-meteor:${state.announced}`;
      const x = margin + nextRandom2(state) * (state.width - margin * 2);
      state.pending.push({ id, at: state.next + warning, x, y: entryY, aim: { x: player.x, y: player.y } });
      emit({ type: "warning", id, x, y: 0 });
      state.announced++;
      state.next += gap + nextRandom2(state) * jitter;
    }
    while (state.pending.length && state.clock >= state.pending[0].at) {
      const meteor = state.pending.shift();
      const dx = meteor.aim.x - meteor.x, dy = meteor.aim.y - meteor.y, length = Math.hypot(dx, dy) || 1;
      emit({ type: "meteor", id: meteor.id, x: meteor.x, y: meteor.y, vx: dx / length * speed, vy: dy / length * speed, damage });
    }
    state.done = state.announced === state.count && state.pending.length === 0;
  }

  // src/game/combat/ch03-satellite.js
  var CH03_RULES = Object.freeze({
    hp: 40,
    entrySeconds: 2,
    holdY: 0.24,
    warning: 0.8,
    rest: 1.2,
    defeatSeconds: 1.4,
    // ±0,5 rad: a la altura de la nave el rayo recorre la pantalla de borde a borde.
    sweep: Object.freeze({ range: 0.5, speed: 0.3, width: 28, damage: 14 }),
    ring: Object.freeze({ count: 8, speed: 260, gap: 0.5, tail: 0.3, damage: 12 }),
    grid: Object.freeze({ columns: 6, steps: 4, warning: 0.7, active: 0.5, damage: 16 })
  });
  var ORDER = Object.freeze(["sweep", "ring", "grid"]);
  function nextRandom3(boss) {
    boss.rng = boss.rng + 1831565813 >>> 0;
    let value = Math.imul(boss.rng ^ boss.rng >>> 15, 1 | boss.rng);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  }
  function createCh03Satellite({ width, height, seed = 0 }) {
    if (![width, height, seed].every(Number.isFinite) || width < 280 || height < 540) throw new RangeError("Invalid CH-03 arena");
    return {
      width,
      height,
      x: width / 2,
      y: -120,
      holdY: height * CH03_RULES.holdY,
      hp: CH03_RULES.hp,
      maxHp: CH03_RULES.hp,
      state: "entry",
      stateTime: 0,
      attack: null,
      attacks: 0,
      beam: null,
      grid: null,
      ringsFired: 0,
      resolved: false,
      defeatAnnounced: false,
      rng: (Math.imul(Math.trunc(seed) >>> 0, 2654435769) ^ 1128804403) >>> 0
    };
  }
  function chooseAttack(boss) {
    if (boss.attacks < ORDER.length) return ORDER[boss.attacks];
    const options = ORDER.filter((attack) => attack !== boss.attack);
    return options[Math.floor(nextRandom3(boss) * options.length)];
  }
  function enter(boss, state) {
    boss.state = state;
    boss.stateTime = 0;
  }
  function startAttack(boss, emit) {
    enter(boss, "attack");
    if (boss.attack === "sweep") {
      const direction = nextRandom3(boss) < 0.5 ? -1 : 1;
      boss.beam = { angle: -direction * CH03_RULES.sweep.range, direction, active: true };
    } else if (boss.attack === "ring") {
      boss.ringsFired = 0;
      fireRing(boss, emit);
    } else {
      boss.grid = {
        columns: CH03_RULES.grid.columns,
        step: 0,
        safe: Math.floor(nextRandom3(boss) * CH03_RULES.grid.columns),
        active: false,
        time: 0
      };
    }
  }
  function fireRing(boss, emit) {
    const { count, speed, damage } = CH03_RULES.ring, offset = boss.ringsFired * Math.PI / count;
    for (let k = 0; k < count; k++) {
      const angle = offset + k * 2 * Math.PI / count;
      emit({ type: "projectile", x: boss.x, y: boss.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage });
    }
    boss.ringsFired++;
  }
  function endAttack(boss) {
    boss.beam = null;
    boss.grid = null;
    boss.attacks++;
    enter(boss, "idle");
  }
  function advanceAttack(boss, dt, emit) {
    if (boss.attack === "sweep") {
      const { range: range2, speed } = CH03_RULES.sweep;
      boss.beam.angle += boss.beam.direction * speed * dt;
      if (Math.abs(boss.beam.angle) >= range2 && Math.sign(boss.beam.angle) === boss.beam.direction) endAttack(boss);
    } else if (boss.attack === "ring") {
      const { gap, tail } = CH03_RULES.ring;
      if (boss.ringsFired === 1 && boss.stateTime >= gap) fireRing(boss, emit);
      if (boss.stateTime >= gap + tail) endAttack(boss);
    } else {
      const rules = CH03_RULES.grid, grid = boss.grid;
      grid.time += dt;
      if (!grid.active && grid.time >= rules.warning) {
        grid.active = true;
        grid.time = 0;
      } else if (grid.active && grid.time >= rules.active) {
        grid.step++;
        if (grid.step >= rules.steps) {
          endAttack(boss);
          return;
        }
        const step = grid.safe === 0 ? 1 : grid.safe === rules.columns - 1 ? -1 : nextRandom3(boss) < 0.5 ? -1 : 1;
        grid.safe += step;
        grid.active = false;
        grid.time = 0;
      }
    }
  }
  function advanceCh03Satellite(boss, dt, emit) {
    if (!(dt > 0) || boss.resolved) return;
    boss.stateTime += dt;
    if (boss.state === "entry") {
      const progress = Math.min(1, boss.stateTime / CH03_RULES.entrySeconds);
      boss.y = -120 + (boss.holdY + 120) * (1 - (1 - progress) ** 3);
      if (progress >= 1) enter(boss, "idle");
    } else if (boss.state === "idle") {
      if (boss.stateTime >= CH03_RULES.rest) {
        boss.attack = chooseAttack(boss);
        enter(boss, "warning");
        emit({ type: "warning", attack: boss.attack });
      }
    } else if (boss.state === "warning") {
      if (boss.stateTime >= CH03_RULES.warning) startAttack(boss, emit);
    } else if (boss.state === "attack") advanceAttack(boss, dt, emit);
    else if (boss.state === "defeated") {
      if (!boss.defeatAnnounced) {
        boss.defeatAnnounced = true;
        emit({ type: "defeated" });
      }
      if (boss.stateTime >= CH03_RULES.defeatSeconds) boss.resolved = true;
    }
  }
  function ch03HitsShip(boss, ship2) {
    if (boss.state !== "attack") return 0;
    if (boss.attack === "sweep" && boss.beam?.active) {
      const dx = Math.sin(boss.beam.angle), dy = Math.cos(boss.beam.angle);
      const along = (ship2.x - boss.x) * dx + (ship2.y - boss.y) * dy;
      if (along <= 0) return 0;
      const across = Math.abs((ship2.x - boss.x) * dy - (ship2.y - boss.y) * dx);
      return across <= CH03_RULES.sweep.width / 2 + ship2.r ? CH03_RULES.sweep.damage : 0;
    }
    if (boss.attack === "grid" && boss.grid?.active) {
      const column = Math.floor(ship2.x / (boss.width / boss.grid.columns));
      return column === boss.grid.safe ? 0 : CH03_RULES.grid.damage;
    }
    return 0;
  }
  function hitCh03Satellite(boss, damage = 1) {
    if (!(damage > 0) || boss.state === "entry" || boss.state === "defeated") return { accepted: false, hp: boss.hp };
    boss.hp = Math.max(0, boss.hp - damage);
    if (boss.hp === 0) {
      boss.beam = null;
      boss.grid = null;
      enter(boss, "defeated");
    }
    return { accepted: true, hp: boss.hp };
  }

  // src/game/progression/chronos-flight.js
  var immutable13 = (object2) => Object.freeze(object2);
  var CHRONOS_FLIGHT_EVENTS = immutable13([
    immutable13({ id: "chronos-intruder", type: "attack", at: 0.025, attackerId: "cronium-raider", targetId: "chronos-reactor" }),
    immutable13({ id: "chronos-breach", type: "rupture", at: 0.1, resourceId: "cronium", cause: "hostile-reactor-strike" }),
    immutable13({ id: "chronos-perimeter-exit", type: "departure", at: 0.3, originId: "chronos-scientific-centre" }),
    immutable13({ id: "chronos-recovered-module", type: "twin-module-marker", at: 0.6, moduleId: "twin-emitter", resourceId: "cronium" }),
    immutable13({ id: "gaia-navigation-beacon", type: "gaia-beacon", at: 0.83, destinationId: "gaia-atlas-approach" }),
    immutable13({ id: "chronos-flight-arrival", type: "arrival", at: 1, destinationId: "gaia-atlas-approach" })
  ]);
  var PHASES = immutable13([
    immutable13({ id: "emergency", from: 0, to: 0.1, name: "Emergencia en Chronos" }),
    immutable13({ id: "recovery", from: 0.1, to: 0.3, name: "Recuperar el CRONIUM disperso" }),
    immutable13({ id: "departure", from: 0.3, to: 0.52, name: "Salir del per\xEDmetro orbital" }),
    immutable13({ id: "deep-space", from: 0.52, to: 0.82, name: "Rastro de CRONIUM en espacio profundo" }),
    immutable13({ id: "gaia-approach", from: 0.82, to: 1, name: "Aproximaci\xF3n a la baliza de Gaia" })
  ]);
  var CHRONOS_VOYAGE_ROUTE = createVoyageRoute(S1_V1_CHRONOS_GAIA);
  var CHRONOS_VOYAGE_VERSION = S1_V1_CHRONOS_GAIA.version;
  var CHRONOS_VOYAGE_KEY = S1_V1_CHRONOS_GAIA.saveKey;
  var CHRONOS_VOYAGE_ROUTE_ID = S1_V1_CHRONOS_GAIA.routeId;
  var CHRONOS_VOYAGE_STAGES = CHRONOS_VOYAGE_ROUTE.stages;
  var CHRONOS_VOYAGE_MIN_DURATION = CHRONOS_VOYAGE_ROUTE.minDuration;
  var createChronosVoyageCheckpoint = CHRONOS_VOYAGE_ROUTE.createCheckpoint;
  var normalizeChronosVoyageCheckpoint = CHRONOS_VOYAGE_ROUTE.normalizeCheckpoint;
  var createChronosVoyage = CHRONOS_VOYAGE_ROUTE.create;

  // src/game/presentation/voyage-transitions.js
  var VOYAGE_CROSSING_SECONDS = 1.6;
  var clamp9 = (value, min, max) => Math.max(min, Math.min(max, value));
  var smooth2 = (value) => value * value * (3 - 2 * value);
  var mix = (from, to, amount) => from + (to - from) * amount;
  function getVoyageTransitionPresentation(view, { reducedEffects = false } = {}) {
    if (!view || view.version && view.version !== CHRONOS_VOYAGE_VERSION || !Number.isInteger(view.stageNumber) || view.stageNumber < 1 || view.stageNumber > 10 || !Number.isFinite(view.stageElapsed) || !Number.isFinite(view.stageDuration) || view.stageDuration <= 0) return null;
    const number = view.stageNumber;
    const seconds = clamp9(view.stageElapsed, 0, view.stageDuration);
    const definition = CHRONOS_VOYAGE_STAGES[number - 1];
    const previous = CHRONOS_VOYAGE_STAGES[Math.max(0, number - 2)];
    const settled = number === 1 ? 1 : smooth2(clamp9(seconds / VOYAGE_CROSSING_SECONDS, 0, 1));
    const targetNebula = Number.isFinite(view.deepSpace?.nebulaOpacity) ? clamp9(view.deepSpace.nebulaOpacity, 0, 1) : definition.nebulaOpacity;
    const targetStars = Number.isFinite(view.deepSpace?.starDensity) ? clamp9(view.deepSpace.starDensity, 0, 1) : definition.starDensity;
    const environment = Object.freeze({
      // Do not swap a painting or dissolve the station/planet. Only the distant
      // ambient illumination and tiny star density settle into their next region.
      nebulaOpacity: mix(previous.nebulaOpacity, targetNebula, settled),
      starDensity: mix(previous.starDensity, targetStars, settled)
    });
    let boundary = null, progress = 0;
    if (number > 1 && seconds < VOYAGE_CROSSING_SECONDS) {
      boundary = number - 1;
      progress = 0.5 + seconds / (VOYAGE_CROSSING_SECONDS * 2);
    } else if (number < 10 && seconds >= view.stageDuration - VOYAGE_CROSSING_SECONDS) {
      boundary = number;
      progress = Math.min(0.5, (seconds - (view.stageDuration - VOYAGE_CROSSING_SECONDS)) / (VOYAGE_CROSSING_SECONDS * 2));
    }
    const cueAllowed = boundary !== null && boundary !== 5 && boundary !== 6 && !reducedEffects;
    const side = boundary % 2 ? 1 : -1;
    const depth = clamp9(progress, 0, 1);
    const cue2 = cueAllowed ? Object.freeze({
      kind: boundary <= 3 ? "chronos-remnant" : "navigation-beacon",
      side,
      x: 0.5 + side * (0.19 + 0.52 * Math.pow(depth, 1.9)),
      y: 0.16 + 0.94 * Math.pow(depth, 1.45),
      scale: 0.018 + 0.3 * Math.pow(depth, 1.8),
      rotation: side * (0.12 + depth * 0.45)
    }) : null;
    return Object.freeze({
      active: boundary !== null,
      boundary,
      progress: depth,
      cue: cue2,
      environment,
      // Navigation stars are secondary presentation; comfort mode retains the
      // same route/environment but removes this brief acceleration embellishment.
      starStretch: boundary !== null && !reducedEffects ? Math.sin(depth * Math.PI) : 0
    });
  }

  // src/game/presentation/sector-planets.js
  var SECTOR_PLANET_FRAMES = 7;
  var SECTOR_PLANET_FRAME_SECONDS = 0.9;
  var SECTOR_PLANETS = Object.freeze({
    3: Object.freeze({ key: "volcanico", x: 0.76, y: 0.25, size: 0.52 }),
    4: Object.freeze({ key: "glacial", x: 0.74, y: 0.24, size: 0.5 }),
    5: Object.freeze({ key: "glacial", x: 0.26, y: 0.25, size: 0.56 }),
    6: Object.freeze({ key: "violeta", x: 0.76, y: 0.24, size: 0.52 }),
    7: Object.freeze({ key: "violeta", x: 0.27, y: 0.26, size: 0.54 }),
    8: Object.freeze({ key: "tormentoso", x: 0.74, y: 0.25, size: 0.54 })
  });
  var clamp01 = (value) => Math.max(0, Math.min(1, value));
  function sectorPlanetPose(levelIndex, elapsed, progress = 0) {
    const planet = SECTOR_PLANETS[levelIndex];
    if (!planet || !Number.isFinite(elapsed) || elapsed < 0) return null;
    const done = clamp01(Number.isFinite(progress) ? progress : 0);
    const position = elapsed / SECTOR_PLANET_FRAME_SECONDS;
    const frame = Math.floor(position) % SECTOR_PLANET_FRAMES;
    return Object.freeze({
      key: planet.key,
      frame,
      next: (frame + 1) % SECTOR_PLANET_FRAMES,
      blend: position % 1,
      x: planet.x + Math.sin(elapsed * 0.03) * 0.01,
      y: planet.y + done * 0.03,
      size: planet.size * (1 + done * 0.15)
    });
  }

  // src/game/combat/guardian-atlas.js
  var clamp10 = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  var finite6 = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  var GUARDIAN_ATLAS_RULES = Object.freeze({
    version: "guardian-atlas-v9",
    maxHp: 96,
    maxDelta: 0.05,
    // v9 (plan F3c, spec §6.11): furia al 30 % de vida, no al 50 %.
    furyAt: 0.3,
    furyEscorts: 4,
    entrySeconds: 2.2,
    closedSeconds: 0.85,
    // v8: ventana de núcleo más corta (antes 3,8 s) y más corta aún en la fase 2.
    openingSeconds: 0.65,
    exposedSeconds: 3,
    exposedPhaseTwoSeconds: 2.5,
    closingSeconds: 0.55,
    phaseBreakSeconds: 1.25,
    shutdownSeconds: 1.55,
    hurtSeconds: 0.16,
    coreRadius: 42,
    maxProjectilesPerAttack: 10,
    tailClearance: 56,
    phaseOne: Object.freeze({ projectileSpeed: 460, projectileDamage: 13 }),
    phaseTwo: Object.freeze({ projectileSpeed: 520, projectileDamage: 15 }),
    motion: Object.freeze({
      acceleration: 200,
      maxSpeed: 132,
      maxVerticalSpeed: 26,
      exposedSpeed: 32,
      exposedPhaseTwoSpeed: 38,
      observationSeconds: 0.22
    }),
    // Tres ataques habituales: cañones gemelos (basic), abanico abierto (medium)
    // y despliegue de drones (superpower, sin disparos propios: los lanza el juego).
    attacks: Object.freeze({
      basic: Object.freeze({ chargeSeconds: 0.36, volleyTimes: Object.freeze([0, 0.24]), damage: 13 }),
      medium: Object.freeze({ chargeSeconds: 0.52, volleyTimes: Object.freeze([0]), damage: 15 }),
      superpower: Object.freeze({ chargeSeconds: 0.86, volleyTimes: Object.freeze([0]), damage: 0 }),
      // Fulminante: carga larga y visible, luego un rayo sobre la mitad de la nave.
      fulminant: Object.freeze({ chargeSeconds: 1.05, volleyTimes: Object.freeze([0]), damage: 26 })
    }),
    twin: Object.freeze({ projectiles: 2, spread: 0.045 }),
    fan: Object.freeze({ projectiles: 7, spread: 0.7, speed: 360, minGap: 150 }),
    drones: Object.freeze({ count: 2 }),
    // El rayo cubre del borde a la nave observada: entre el 45 % y el 50 % del
    // ancho, así la otra mitad siempre queda libre. everyAttacks cuenta los
    // ataques normales entre dos Fulminantes (en furia, uno cada 2–3 ataques).
    fulminant: Object.freeze({
      width: 0.45,
      maxWidth: 0.5,
      reach: 40,
      beamSeconds: 1.2,
      everyAttacks: Object.freeze([3, 5]),
      phaseTwoEveryAttacks: Object.freeze([1, 2])
    }),
    // Fase 1: tras presentar las rutinas, a veces encadena un ataque más antes de
    // abrir el núcleo. En furia siempre encadena dos.
    chains: Object.freeze({ phaseOneChance: 0.45, phaseTwo: 1 }),
    patterns: Object.freeze({ basic: "twinCannons", medium: "openFan", superpower: "droneLaunch", fulminant: "fulminantBeam" })
  });
  function createGuardianAtlas({
    width = 720,
    height = 1280,
    playerY = height - 135,
    seed = 1096043585
  } = {}) {
    finite6(width, "width");
    finite6(height, "height");
    finite6(playerY, "playerY");
    if (width < 280 || height < 540 || playerY < 180 || playerY > height - 16 || !Number.isInteger(seed)) throw new RangeError("Invalid Guardian Atlas arena");
    const radius = Math.min(104, width * 0.19);
    const targetY = Math.max(64, Math.min(height * 0.22, playerY - 240));
    return {
      type: "guardianAtlas",
      version: GUARDIAN_ATLAS_RULES.version,
      width,
      height,
      playerY,
      seed: seed >>> 0 || 1,
      x: width / 2,
      y: -radius * 1.6,
      baseX: width / 2,
      targetY,
      r: radius,
      coreRadius: Math.min(GUARDIAN_ATLAS_RULES.coreRadius, width * 0.085),
      s: 0,
      rot: 0,
      rs: 0,
      p: 0,
      amp: 0,
      alpha: 1,
      hp: GUARDIAN_ATLAS_RULES.maxHp,
      maxHp: GUARDIAN_ATLAS_RULES.maxHp,
      age: 0,
      state: "entry",
      stateTime: 0,
      phase: 1,
      phaseAttacks: 0,
      vulnerability: false,
      coreExposure: 0,
      armorClosed: true,
      telegraph: null,
      disabled: false,
      resolved: false,
      attackId: 0,
      attackTier: null,
      volley: 0,
      attackClearanceSeconds: 0,
      observation: null,
      nextObservationAt: 0,
      lastPattern: null,
      attackDecision: null,
      tacticalManeuver: "patrol",
      attacksSinceSuperpower: 0,
      attacksSinceFulminant: 0,
      nextFulminantAfter: 4,
      chainRemaining: 0,
      motionDecision: 0,
      nextMotionAt: 0,
      motionX: width / 2,
      motionY: targetY,
      motionVx: 0,
      motionVy: 0,
      motionSide: seed % 2 ? -1 : 1,
      flash: 0,
      lastHitAt: null,
      protocol: "falsified-identification",
      recordId: "chronos-sabotage-atlas-log"
    };
  }
  function nextRandom4(boss) {
    let value = boss.seed;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    boss.seed = value >>> 0;
    return boss.seed / 4294967296;
  }
  var phaseRules = (boss) => boss.phase === 1 ? GUARDIAN_ATLAS_RULES.phaseOne : GUARDIAN_ATLAS_RULES.phaseTwo;
  var attackRules = (boss) => GUARDIAN_ATLAS_RULES.attacks[boss.attackTier];
  var volleyTimes = (boss) => attackRules(boss).volleyTimes;
  function updateCore(boss) {
    boss.vulnerability = boss.state === "exposed" && !boss.disabled;
    boss.coreExposure = boss.state === "exposed" ? 1 : boss.state === "opening" ? clamp10(boss.stateTime / GUARDIAN_ATLAS_RULES.openingSeconds, 0, 1) : boss.state === "closing" ? 1 - clamp10(boss.stateTime / GUARDIAN_ATLAS_RULES.closingSeconds, 0, 1) : 0;
    boss.armorClosed = !boss.vulnerability;
  }
  function observePlayer2(boss, player) {
    if (boss.age + 1e-9 < boss.nextObservationAt) return;
    const previous = boss.observation, elapsed = previous ? boss.age - previous.at : 0;
    const x = clamp10(player.x, 24, boss.width - 24);
    const y = clamp10(Number.isFinite(player.y) ? player.y : boss.playerY, 24, boss.height - 16);
    const vx = elapsed > 0 ? clamp10((x - previous.x) / elapsed, -720, 720) : 0;
    boss.observation = { x, y, at: boss.age, vx: previous ? previous.vx * 0.4 + vx * 0.6 : 0 };
    boss.nextObservationAt = boss.age + GUARDIAN_ATLAS_RULES.motion.observationSeconds;
  }
  function motionBounds(boss) {
    const margin = Math.min(boss.width * 0.42, Math.max(
      boss.r + Math.min(18, boss.width * 0.025),
      Number.isFinite(boss.presentationHalfWidth) ? boss.presentationHalfWidth + 8 : 0
    ));
    const top = Math.max(64, boss.targetY - 16);
    return {
      left: margin,
      right: boss.width - margin,
      top,
      bottom: Math.max(top, Math.min(boss.playerY - 210, boss.targetY + 24))
    };
  }
  function planMotion(boss) {
    const bounds = motionBounds(boss), sample = boss.observation || { x: boss.width / 2, vx: 0 };
    const exposed = boss.state === "exposed";
    const underFire = boss.lastHitAt !== null && boss.age - boss.lastHitAt < 0.55;
    const space = bounds.right - bounds.left;
    if (boss.x > bounds.right - Math.min(40, space * 0.2)) boss.motionSide = -1;
    else if (boss.x < bounds.left + Math.min(40, space * 0.2)) boss.motionSide = 1;
    else if (!exposed && (underFire || Math.abs(boss.x - boss.motionX) < Math.min(26, space * 0.12))) {
      boss.motionSide = -boss.motionSide;
    }
    const tacticalAttack = boss.state === "charge" || boss.state === "fire";
    if (tacticalAttack && boss.tacticalManeuver === "flank") {
      boss.motionSide = boss.telegraph.sweepDirection;
    }
    const flank = exposed ? space * 0.24 : space * (0.28 + nextRandom4(boss) * 0.17);
    const lead = clamp10(sample.vx * 0.24, -boss.width * 0.1, boss.width * 0.1);
    const target = exposed ? boss.x + boss.motionSide * flank : tacticalAttack && boss.tacticalManeuver === "withdraw" ? boss.width / 2 + boss.motionSide * space * 0.34 : sample.x + lead + boss.motionSide * flank;
    boss.motionX = clamp10(target, bounds.left, bounds.right);
    const verticalPhase = boss.motionDecision * 1.7 + boss.phase * 0.9;
    boss.motionY = clamp10(boss.targetY + (tacticalAttack && boss.tacticalManeuver === "withdraw" ? -16 : Math.sin(verticalPhase) * 18), bounds.top, bounds.bottom);
    boss.nextMotionAt = boss.age + (exposed ? 1.15 : tacticalAttack ? 0.8 : 1.25 + nextRandom4(boss) * 0.5);
    boss.motionDecision++;
  }
  function moveAtlas(boss, dt) {
    if (!dt || boss.disabled || boss.state === "entry") return;
    if (boss.age + 1e-9 >= boss.nextMotionAt) planMotion(boss);
    const rules = GUARDIAN_ATLAS_RULES.motion, bounds = motionBounds(boss);
    const exposed = boss.state === "exposed";
    const maxSpeed = exposed ? boss.phase === 2 ? rules.exposedPhaseTwoSpeed : rules.exposedSpeed : boss.state === "opening" ? 68 : boss.phase === 2 ? rules.maxSpeed : 108;
    const desiredVx = clamp10((boss.motionX - boss.x) * 2.4, -maxSpeed, maxSpeed);
    const desiredVy = clamp10((boss.motionY - boss.y) * 2, -rules.maxVerticalSpeed, rules.maxVerticalSpeed);
    boss.motionVx += clamp10(desiredVx - boss.motionVx, -rules.acceleration * dt, rules.acceleration * dt);
    boss.motionVy += clamp10(desiredVy - boss.motionVy, -rules.acceleration * dt, rules.acceleration * dt);
    const x = boss.x + boss.motionVx * dt, y = boss.y + boss.motionVy * dt;
    boss.x = clamp10(x, bounds.left, bounds.right);
    boss.y = clamp10(y, bounds.top, bounds.bottom);
    if (boss.x !== x) boss.motionVx = 0;
    if (boss.y !== y) boss.motionVy = 0;
  }
  function transition(boss, next, events) {
    boss.state = next;
    boss.stateTime = 0;
    if (next === "closed" || next === "opening" || next === "exposed") boss.nextMotionAt = boss.age;
    updateCore(boss);
    events.push({ type: "state", state: next, phase: boss.phase, attackId: boss.attackId });
    if (next === "opening") events.push({ type: "opening", phase: boss.phase });
    if (next === "exposed") events.push({
      type: "coreExposed",
      phase: boss.phase,
      seconds: boss.phase === 1 ? GUARDIAN_ATLAS_RULES.exposedSeconds : GUARDIAN_ATLAS_RULES.exposedPhaseTwoSeconds,
      coreRadius: boss.coreRadius
    });
    if (next === "closing") events.push({ type: "coreClosed", phase: boss.phase });
  }
  function scheduleFulminant(boss) {
    const [low, high] = boss.phase === 1 ? GUARDIAN_ATLAS_RULES.fulminant.everyAttacks : GUARDIAN_ATLAS_RULES.fulminant.phaseTwoEveryAttacks;
    boss.nextFulminantAfter = low + Math.floor(nextRandom4(boss) * (high - low + 1));
  }
  function beginCharge(boss, player, events, chained = false) {
    boss.attackId++;
    boss.phaseAttacks++;
    boss.volley = 0;
    boss.attackClearanceSeconds = 0;
    const sample = boss.observation || { x: player.x, y: boss.playerY, vx: 0, at: boss.age };
    const teaching = boss.phase === 1 && boss.phaseAttacks <= 3;
    if (teaching) {
      boss.attackTier = ["basic", "medium", "superpower"][boss.phaseAttacks - 1];
      boss.attackDecision = "introduce-routine";
    } else if (boss.attacksSinceFulminant >= boss.nextFulminantAfter) {
      boss.attackTier = "fulminant";
      boss.attackDecision = "fulminant-beam";
    } else if (boss.attacksSinceSuperpower >= 3) {
      boss.attackTier = "superpower";
      boss.attackDecision = "reactor-recharged";
    } else if (Math.abs(sample.vx) >= 85 || Math.abs(sample.x - boss.width / 2) >= boss.width * 0.27) {
      boss.attackTier = nextRandom4(boss) < 0.7 ? "medium" : "basic";
      boss.attackDecision = "intercept-flank";
    } else {
      boss.attackTier = nextRandom4(boss) < 0.5 ? "medium" : "basic";
      boss.attackDecision = "pressure-observed-lane";
    }
    boss.attacksSinceSuperpower = boss.attackTier === "superpower" ? 0 : boss.attacksSinceSuperpower + 1;
    if (boss.attackTier === "fulminant") {
      boss.attacksSinceFulminant = 0;
      scheduleFulminant(boss);
    } else if (!teaching) boss.attacksSinceFulminant++;
    if (!chained) {
      boss.chainRemaining = boss.phase === 2 ? GUARDIAN_ATLAS_RULES.chains.phaseTwo : teaching ? 0 : nextRandom4(boss) < GUARDIAN_ATLAS_RULES.chains.phaseOneChance ? 1 : 0;
    }
    const tier = boss.attackTier, pattern = GUARDIAN_ATLAS_RULES.patterns[tier];
    const leadOffset = tier === "basic" && boss.phase === 1 ? 0 : clamp10(sample.vx * 0.28, -100, 100);
    const originY = boss.y + boss.r * 0.7;
    boss.lastPattern = pattern;
    const sweepDirection = sample.vx ? Math.sign(sample.vx) : sample.x < boss.width / 2 ? 1 : -1;
    boss.tacticalManeuver = tier === "fulminant" || tier === "superpower" ? "withdraw" : tier === "medium" ? "flank" : "pressure";
    boss.nextMotionAt = boss.age;
    boss.telegraph = {
      kind: "mechanicalDeployment",
      pattern,
      attackTier: tier,
      progress: 0,
      targetX: clamp10(sample.x + leadOffset, 24, boss.width - 24),
      // A pilot moving above the guns must not produce upward/negative-lifetime
      // ordnance. Arena layout remains the integration's responsibility.
      targetY: Math.max(originY + 180, sample.y),
      observedX: sample.x,
      observedVx: sample.vx,
      observedAt: sample.at,
      leadOffset,
      originX: boss.x,
      originY,
      seconds: attackRules(boss).chargeSeconds,
      safeGap: null,
      attackId: boss.attackId,
      decision: boss.attackDecision,
      sweepDirection,
      maneuver: boss.tacticalManeuver,
      beam: tier === "fulminant" ? fulminantBeam(boss, sample.x) : null
    };
    transition(boss, "charge", events);
    events.push({ type: "warning", phase: boss.phase, ...boss.telegraph });
    if (tier === "fulminant") events.push({
      type: "fulminant",
      phase: boss.phase,
      attackId: boss.attackId,
      seconds: attackRules(boss).chargeSeconds,
      ...boss.telegraph.beam
    });
  }
  function fulminantBeam(boss, observedX) {
    const rule = GUARDIAN_ATLAS_RULES.fulminant, width = boss.width;
    const side = observedX < width / 2 ? -1 : 1;
    const reach = clamp10(
      side < 0 ? observedX + rule.reach : width - observedX + rule.reach,
      width * rule.width,
      width * rule.maxWidth
    );
    return side < 0 ? { side, x0: 0, x1: reach } : { side, x0: width - reach, x1: width };
  }
  function projectile(boss, x, y, vx, vy, ordinal, targetX) {
    const aim = boss.telegraph;
    const damage = boss.attackTier === "basic" ? phaseRules(boss).projectileDamage : attackRules(boss).damage;
    return {
      type: "meteor",
      guardianProjectile: true,
      pattern: aim.pattern,
      attackTier: boss.attackTier,
      attackId: boss.attackId,
      volley: boss.volley,
      projectileId: `${boss.attackId}:${boss.volley}:${ordinal}`,
      x,
      baseX: x,
      y,
      vx,
      vy,
      s: vy,
      r: 10,
      damage,
      duration: 7,
      life: 7,
      telegraphSeconds: aim.seconds,
      safeGap: null,
      observedX: aim.observedX,
      observedVx: aim.observedVx,
      leadOffset: aim.leadOffset,
      targetX,
      targetY: aim.targetY,
      rot: Math.atan2(vy, vx) - Math.PI / 2,
      rs: 0,
      p: 0,
      phase: 0,
      amp: 0,
      special: "",
      alpha: 1,
      hp: 1,
      maxHp: 1
    };
  }
  function fireVolley(boss, events, fireTime = boss.stateTime) {
    const aim = boss.telegraph, tier = boss.attackTier, originY = boss.y + boss.r * 0.7;
    if (tier === "superpower") {
      events.push({ type: "drones", count: GUARDIAN_ATLAS_RULES.drones.count, x: boss.x, y: originY, attackId: boss.attackId });
    } else if (tier === "fulminant") {
      const rule = GUARDIAN_ATLAS_RULES.fulminant;
      boss.attackClearanceSeconds = Math.max(boss.attackClearanceSeconds, fireTime + rule.beamSeconds);
      events.push({
        type: "beam",
        ...aim.beam,
        seconds: rule.beamSeconds,
        damage: attackRules(boss).damage,
        attackId: boss.attackId,
        x: boss.x,
        y: originY
      });
    } else {
      const fan = tier === "medium", rule = fan ? GUARDIAN_ATLAS_RULES.fan : GUARDIAN_ATLAS_RULES.twin;
      const targetY = Math.max(originY + 180, aim.targetY);
      const targetX = clamp10(
        aim.targetX + (fan ? 0 : (boss.volley === 0 ? -0.018 : 0.018) * boss.width * aim.sweepDirection),
        24,
        boss.width - 24
      );
      const aimed2 = Math.atan2(targetY - originY, targetX - boss.x), distance2 = Math.hypot(targetY - originY, targetX - boss.x);
      const spread2 = !fan || distance2 * Math.tan(2 * rule.spread / (rule.projectiles - 1)) >= rule.minGap ? rule.spread : Math.atan2(boss.width * 0.2, distance2);
      const direction = fan ? clamp10(aimed2, spread2 + 0.25, Math.PI - spread2 - 0.25) : aimed2;
      const speed = fan ? rule.speed : phaseRules(boss).projectileSpeed;
      for (let index = 0; index < rule.projectiles; index++) {
        const angle = direction + (index / (rule.projectiles - 1) * 2 - 1) * spread2;
        const shot = projectile(boss, boss.x, originY, Math.cos(angle) * speed, Math.sin(angle) * speed, index, targetX);
        shot.targetY = targetY;
        boss.attackClearanceSeconds = Math.max(
          boss.attackClearanceSeconds,
          fireTime + (boss.playerY + GUARDIAN_ATLAS_RULES.tailClearance + shot.r - shot.y) / shot.vy
        );
        events.push({ type: "projectile", projectile: shot });
      }
    }
    events.push({
      type: "volley",
      attackId: boss.attackId,
      phase: boss.phase,
      attackTier: tier,
      volley: boss.volley,
      x: boss.x,
      y: originY,
      fulminant: tier === "fulminant"
    });
    boss.volley++;
  }
  function stateDuration(boss) {
    const rule = GUARDIAN_ATLAS_RULES;
    if (boss.state === "entry") return rule.entrySeconds;
    if (boss.state === "closed") return rule.closedSeconds;
    if (boss.state === "charge") return attackRules(boss).chargeSeconds;
    if (boss.state === "fire") return Math.max(
      volleyTimes(boss).at(-1) + 0.08,
      boss.attackClearanceSeconds + 0.12
    );
    if (boss.state === "opening") return rule.openingSeconds;
    if (boss.state === "exposed") return boss.phase === 1 ? rule.exposedSeconds : rule.exposedPhaseTwoSeconds;
    if (boss.state === "closing") return rule.closingSeconds;
    if (boss.state === "phaseBreak") return rule.phaseBreakSeconds;
    if (boss.state === "disabled") return rule.shutdownSeconds;
    throw new RangeError("Unknown Guardian Atlas state");
  }
  function finishState(boss, player, events) {
    if (boss.state === "entry") {
      boss.y = boss.targetY;
      transition(boss, "closed", events);
      events.push({
        type: "arrival",
        phase: 1,
        reason: "falsified-identification",
        recordId: boss.recordId
      });
    } else if (boss.state === "closed") beginCharge(boss, player, events);
    else if (boss.state === "charge") {
      transition(boss, "fire", events);
      boss.telegraph.progress = 1;
      fireVolley(boss, events);
    } else if (boss.state === "fire") {
      boss.telegraph = null;
      if (boss.chainRemaining > 0) {
        boss.chainRemaining--;
        beginCharge(boss, player, events, true);
      } else transition(boss, "opening", events);
    } else if (boss.state === "opening") transition(boss, "exposed", events);
    else if (boss.state === "exposed") transition(boss, "closing", events);
    else if (boss.state === "closing" || boss.state === "phaseBreak") transition(boss, "closed", events);
    else if (boss.state === "disabled" && !boss.resolved) {
      boss.resolved = true;
      boss.protocol = "identity-restored";
      events.push({
        type: "disabled",
        phase: boss.phase,
        rewardId: "guardian-atlas-access",
        resolution: "identity-restored",
        recordId: boss.recordId
      });
    }
  }
  function advanceGuardianAtlas(boss, dt, player, emit = () => {
  }) {
    finite6(dt, "delta");
    if (dt < 0) throw new RangeError("Finite nonnegative delta required");
    if (typeof emit !== "function") throw new TypeError("Event callback required");
    if (!player || !Number.isFinite(player.x)) throw new TypeError("Player x must be finite");
    if (dt === 0 || boss.resolved) return [];
    const events = [];
    let remaining = Math.min(dt, GUARDIAN_ATLAS_RULES.maxDelta);
    boss.age += remaining;
    observePlayer2(boss, player);
    boss.flash = Math.max(0, boss.flash - remaining);
    while (remaining > 1e-10 && !boss.resolved) {
      const duration = stateDuration(boss);
      const step = Math.min(remaining, Math.max(0, duration - boss.stateTime));
      const before = boss.stateTime;
      boss.stateTime += step;
      remaining -= step;
      if (boss.state === "entry") {
        const progress = clamp10(boss.stateTime / duration, 0, 1);
        boss.y = -boss.r * 1.6 + (boss.targetY + boss.r * 1.6) * (1 - (1 - progress) ** 3);
      } else moveAtlas(boss, step);
      if (boss.state === "charge") boss.telegraph.progress = clamp10(boss.stateTime / duration, 0, 1);
      else if (boss.state === "fire") {
        const schedule = volleyTimes(boss);
        while (boss.volley < schedule.length && before < schedule[boss.volley] + 1e-9 && boss.stateTime + 1e-9 >= schedule[boss.volley]) fireVolley(boss, events, schedule[boss.volley]);
      }
      updateCore(boss);
      if (boss.stateTime + 1e-10 >= stateDuration(boss)) finishState(boss, player, events);
      else break;
    }
    for (const event2 of events) emit(event2);
    return events;
  }
  function hitGuardianAtlas(boss, damage = 1, contact = null) {
    finite6(damage, "damage");
    if (damage <= 0) throw new RangeError("Damage must be positive");
    if (contact !== null) {
      if (!contact || ![contact.x, contact.y, contact.radius ?? 0].every(Number.isFinite) || (contact.radius ?? 0) < 0) throw new TypeError("Finite core contact required");
    }
    if (boss.disabled || !boss.vulnerability) return {
      accepted: false,
      damage: 0,
      events: [],
      reason: boss.disabled ? "disabled" : "armored"
    };
    if (contact && Math.hypot(contact.x - boss.x, contact.y - boss.y) > boss.coreRadius + (contact.radius || 0)) {
      return { accepted: false, damage: 0, events: [], reason: "outside-core" };
    }
    const lost = Math.min(boss.hp, damage);
    boss.hp -= lost;
    boss.flash = 0.14;
    boss.lastHitAt = boss.age;
    const events = [{ type: "hit", damage: lost, hp: boss.hp, maxHp: boss.maxHp }];
    if (boss.hp === 0) {
      boss.disabled = true;
      boss.telegraph = null;
      transition(boss, "disabled", events);
      events.push({ type: "shutdown", rewardId: "guardian-atlas-access", recordId: boss.recordId });
    } else if (boss.phase === 1 && boss.hp <= boss.maxHp * GUARDIAN_ATLAS_RULES.furyAt) {
      boss.phase = 2;
      boss.phaseAttacks = 0;
      boss.telegraph = null;
      boss.chainRemaining = 0;
      boss.attacksSinceFulminant = 0;
      scheduleFulminant(boss);
      transition(boss, "phaseBreak", events);
      events.push({ type: "phase", phase: 2, clearProjectiles: true });
      events.push({ type: "fury", escorts: GUARDIAN_ATLAS_RULES.furyEscorts });
    }
    return { accepted: true, damage: lost, events };
  }

  // src/game/animation/guardian-atlas-animator.js
  var states = /* @__PURE__ */ new Set(["entry", "closed", "charge", "fire", "opening", "exposed", "closing", "phaseBreak", "disabled"]);
  var clamp11 = (value) => Math.max(0, Math.min(1, value));
  function pose(frame, previousFrame = null, blend = 1) {
    const opacity = clamp11(blend);
    return {
      frame,
      previousFrame: opacity < 1 ? previousFrame : null,
      blend: opacity,
      columns: 4,
      rows: 2
    };
  }
  function guardianAtlasAnimation(boss) {
    if (!boss || !states.has(boss.state)) throw new RangeError("Unknown Guardian Atlas animation state");
    if (!Number.isFinite(boss.stateTime) || boss.stateTime < 0) {
      throw new RangeError("Guardian Atlas animation time must be finite and nonnegative");
    }
    if (boss.phase !== 1 && boss.phase !== 2) throw new RangeError("Unknown Guardian Atlas animation phase");
    const { state, stateTime, phase } = boss, openFrame = phase === 2 ? 5 : 1;
    const exposure = state === "disabled" ? 1 : Number.isFinite(boss.coreExposure) ? clamp11(boss.coreExposure) : state === "exposed" ? 1 : state === "opening" ? clamp11(stateTime / GUARDIAN_ATLAS_RULES.openingSeconds) : state === "closing" ? 1 - clamp11(stateTime / GUARDIAN_ATLAS_RULES.closingSeconds) : 0;
    const impactFlash = clamp11((boss.flash || 0) / 0.14);
    let result;
    if (state === "entry" || state === "closed") result = pose(0);
    else if (state === "charge" || state === "phaseBreak") result = pose(2, 0, stateTime / 0.18);
    else if (state === "fire") result = pose(phase === 2 ? 6 : 3);
    else if (state === "opening") result = pose(openFrame, 0, exposure);
    else if (state === "exposed") result = phase === 1 && impactFlash > 0 ? pose(4, openFrame, impactFlash) : pose(openFrame);
    else if (state === "closing") result = pose(0, openFrame, 1 - exposure);
    else result = pose(7, openFrame, stateTime / 0.6);
    return {
      ...result,
      coreCover: 1 - exposure,
      coverFrame: 0,
      coverRect: null,
      impactFlash,
      attackTier: boss.attackTier || null
    };
  }

  // src/game/audio/combat-sfx.js
  var COMBAT_SFX_VERSION = 2;
  var COMBAT_SFX_SRC = "assets/combat_sfx_atlas_v2.m4a";
  var COMBAT_SFX_DURATION = 15.96;
  var COMBAT_SFX_VOICE_LIMIT = 8;
  var COMBAT_SFX_GAIN_BUDGET = 0.95;
  var cue = (offsets, duration, gain, priority3, cooldown, polyphony) => Object.freeze({
    variants: Object.freeze(offsets.map((offset) => Object.freeze({ offset, duration }))),
    gain,
    priority: priority3,
    cooldown,
    polyphony
  });
  var COMBAT_SFX_CUES = Object.freeze({
    "phaser": cue([0, 0.32], 0.2, 0.15, 1, 0.045, 3),
    "missile-launch": cue([0.64, 1.34], 0.58, 0.31, 5, 0.25, 2),
    "impact-metal": cue([2.04, 2.6], 0.44, 0.23, 3, 0.04, 3),
    "impact-plasma": cue([3.16, 3.68], 0.4, 0.23, 3, 0.04, 3),
    "hull-hit": cue([4.2, 4.9], 0.58, 0.29, 6, 0.12, 2),
    "enemy-break": cue([5.6, 6.67], 0.95, 0.31, 5, 0.1, 2),
    "atlas-charge": cue([7.74, 8.74], 0.88, 0.28, 7, 0.3, 1),
    "atlas-collapse": cue([9.74, 11.71], 1.85, 0.4, 9, 1, 1),
    "enemy-phaser": cue([13.68, 14.08], 0.28, 0.19, 2, 0.055, 3),
    "enemy-heavy": cue([14.48, 15.22], 0.62, 0.28, 5, 0.16, 2)
  });
  var disconnect = (node) => {
    try {
      node?.disconnect();
    } catch {
    }
  };
  var clamp12 = (value, low, high) => Math.max(low, Math.min(high, Number(value) || 0));
  function createCombatSfx({ context, output, fetchAsset = (...args) => fetch(...args) } = {}) {
    if (!context?.createBufferSource || !context?.decodeAudioData || !context?.createGain || !output) return null;
    const bus = context.createGain();
    bus.gain.value = 1;
    bus.connect(output);
    const active = /* @__PURE__ */ new Set(), lastPlayed = /* @__PURE__ */ new Map(), variants = /* @__PURE__ */ new Map(), recentIds = /* @__PURE__ */ new Set(), playedByCue = /* @__PURE__ */ new Map();
    let buffer = null, loading = null, disposed = false, paused = true, enabled = true;
    let generation = 0, volume = 1, played = 0, dropped = 0, stolen = 0, failed = false;
    function release(record) {
      if (!active.delete(record)) return;
      record.source.onended = null;
      disconnect(record.source);
      disconnect(record.gain);
      disconnect(record.pan);
    }
    function stop(record) {
      try {
        record.source.stop(context.currentTime);
      } catch {
      }
      release(record);
    }
    function stopAll() {
      for (const record of [...active]) stop(record);
    }
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
        await Promise.resolve();
        try {
          if (disposed || generation !== attempt) return false;
          const response = await fetchAsset(COMBAT_SFX_SRC);
          if (!response?.ok) throw new Error("combat-sfx asset unavailable");
          const bytes = await response.arrayBuffer();
          if (disposed || generation !== attempt) return false;
          if (!(bytes instanceof ArrayBuffer) || bytes.byteLength === 0 || bytes.byteLength > 4 * 1024 * 1024) {
            throw new Error("combat-sfx asset size invalid");
          }
          const decoded = await context.decodeAudioData(bytes);
          if (disposed || generation !== attempt) return false;
          if (!Number.isFinite(decoded?.duration) || decoded.duration < COMBAT_SFX_DURATION - 0.12 || decoded.duration > COMBAT_SFX_DURATION + 0.4) {
            throw new Error("combat-sfx atlas duration invalid");
          }
          buffer = decoded;
          failed = false;
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
    function play(name, { eventId = null, pan = 0 } = {}) {
      if (disposed || !enabled || paused || volume <= 0 || !buffer || context.state !== "running") return false;
      if (!Object.prototype.hasOwnProperty.call(COMBAT_SFX_CUES, name)) return false;
      const definition = COMBAT_SFX_CUES[name];
      if (!definition) return false;
      const id = typeof eventId === "string" && eventId.length > 0 && eventId.length <= 160 ? eventId : Number.isSafeInteger(eventId) && eventId >= 0 ? String(eventId) : null;
      if (id !== null && recentIds.has(id)) {
        dropped++;
        return false;
      }
      const now = context.currentTime;
      if (now - (lastPlayed.get(name) ?? -Infinity) < definition.cooldown) {
        remember(id);
        dropped++;
        return false;
      }
      prune();
      const matching = [...active].filter((record2) => record2.name === name);
      if (matching.length >= definition.polyphony) {
        remember(id);
        dropped++;
        return false;
      }
      const weight = () => [...active].reduce((sum, record2) => sum + record2.level, 0);
      while (active.size >= COMBAT_SFX_VOICE_LIMIT || weight() + definition.gain > COMBAT_SFX_GAIN_BUDGET) {
        const candidate = [...active].filter((record2) => record2.priority < definition.priority).sort((a, b) => a.priority - b.priority || a.end - b.end)[0];
        if (!candidate) {
          remember(id);
          dropped++;
          return false;
        }
        stop(candidate);
        stolen++;
      }
      const index = variants.get(name) || 0;
      const segment = definition.variants[index % definition.variants.length];
      let source, gain, spatial = null, record;
      try {
        source = context.createBufferSource();
        gain = context.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(definition.gain, now);
        source.connect(gain);
        if (context.createStereoPanner) {
          spatial = context.createStereoPanner();
          spatial.pan.setValueAtTime(clamp12(pan, -0.75, 0.75), now);
          gain.connect(spatial);
          spatial.connect(bus);
        } else gain.connect(bus);
        record = {
          source,
          gain,
          pan: spatial,
          name,
          priority: definition.priority,
          level: definition.gain,
          end: now + segment.duration
        };
        active.add(record);
        source.onended = () => release(record);
        source.start(now, segment.offset, segment.duration);
      } catch {
        if (record) stop(record);
        else {
          disconnect(source);
          disconnect(gain);
          disconnect(spatial);
        }
        dropped++;
        return false;
      }
      variants.set(name, index + 1);
      lastPlayed.set(name, now);
      remember(id);
      played++;
      playedByCue.set(name, (playedByCue.get(name) || 0) + 1);
      return true;
    }
    return Object.freeze({
      load,
      play,
      setEnabled(value) {
        if (disposed) return;
        enabled = value === true;
        if (!enabled) stopAll();
      },
      setPaused(value) {
        if (disposed) return;
        paused = value === true;
        if (paused) stopAll();
      },
      setVolume(value) {
        if (disposed) return;
        volume = clamp12(value, 0, 1);
        bus.gain.setTargetAtTime(volume, context.currentTime, 0.02);
        if (volume === 0) stopAll();
      },
      snapshot: () => Object.freeze({
        version: COMBAT_SFX_VERSION,
        ready: Boolean(buffer),
        loading: Boolean(loading),
        failed,
        disposed,
        paused,
        enabled,
        volume,
        activeVoices: active.size,
        activeGain: [...active].reduce((sum, record) => sum + record.level, 0),
        played,
        playedByCue: Object.freeze(Object.fromEntries(playedByCue)),
        dropped,
        stolen,
        decodedBytes: buffer ? buffer.length * buffer.numberOfChannels * 4 : 0
      }),
      dispose() {
        if (disposed) return;
        disposed = true;
        generation++;
        loading = null;
        stopAll();
        buffer = null;
        lastPlayed.clear();
        variants.clear();
        recentIds.clear();
        playedByCue.clear();
        disconnect(bus);
      }
    });
  }

  // src/game/ship/modular-ship.js
  var SHIP_FLEET_SAVE_KEY = "neonCronium.shipFleet.v1";
  var SLOTS = Object.freeze(["hull", "wings", "engines"]);
  var VARIANTS = Object.freeze(["aster", "bastion"]);
  var preset = (id) => Object.freeze({ hull: id, wings: id, engines: id });
  var SHIP_FLEET = Object.freeze([
    Object.freeze({ id: "aster", name: "Aster", loadout: preset("aster") }),
    Object.freeze({ id: "bastion", name: "Bastion", loadout: preset("bastion") })
  ]);
  function ownValue(input, key) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return void 0;
    try {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : void 0;
    } catch {
      return void 0;
    }
  }
  function variantAt(input, slot) {
    const value = ownValue(input, slot);
    return VARIANTS.includes(value) ? value : "aster";
  }
  function normalizeShipLoadout(input) {
    return Object.freeze(Object.fromEntries(SLOTS.map((slot) => [slot, variantAt(input, slot)])));
  }
  var FRAME_LAYOUTS = Object.freeze({
    hull: [
      { source: { x: 146, y: 16, width: 156, height: 409 }, destination: { x: -70, y: -235, width: 140, height: 440 } },
      { source: { x: 136, y: 453, width: 175, height: 410 }, destination: { x: -88, y: -235, width: 176, height: 440 } }
    ],
    wings: [
      { source: { x: 447, y: 165, width: 439, height: 192 }, destination: { x: -242, y: -50, width: 484, height: 212 } },
      { source: { x: 423, y: 572, width: 488, height: 218 }, destination: { x: -242, y: -50, width: 484, height: 216 } }
    ],
    engines: [
      { source: { x: 995, y: 229, width: 232, height: 213 }, destination: { x: -138, y: 20, width: 276, height: 228 } },
      { source: { x: 961, y: 618, width: 306, height: 265 }, destination: { x: -138, y: 20, width: 276, height: 228 } }
    ],
    flames: [
      { source: { x: 1455, y: 143, width: 210, height: 300 }, destination: { x: -147.32568673290473, y: 159.60669014084507, width: 306.99152542372883, height: 145 } },
      { source: { x: 1450, y: 518, width: 216, height: 369 }, destination: { x: -122.43519000520561, y: 160.40309863475994, width: 253.44299843831337, height: 145 } }
    ]
  });
  var NOZZLE_POINTS = Object.freeze([
    Object.freeze([[1040, 375], [1185, 375]].map(Object.freeze)),
    Object.freeze([[1042, 799], [1189, 799]].map(Object.freeze))
  ]);
  var PLUME_LAYOUTS = Object.freeze([
    Object.freeze([
      Object.freeze({ source: Object.freeze({ x: 1455, y: 143, width: 84, height: 300 }), root: Object.freeze({ x: 1498, y: 177 }) }),
      Object.freeze({ source: Object.freeze({ x: 1581, y: 143, width: 84, height: 300 }), root: Object.freeze({ x: 1616, y: 178 }) })
    ]),
    Object.freeze([
      Object.freeze({ source: Object.freeze({ x: 1450, y: 518, width: 86, height: 369 }), root: Object.freeze({ x: 1499, y: 557 }) }),
      Object.freeze({ source: Object.freeze({ x: 1580, y: 518, width: 86, height: 369 }), root: Object.freeze({ x: 1612, y: 557 }) })
    ])
  ]);
  function nozzleAt(row, side) {
    const { source, destination } = FRAME_LAYOUTS.engines[row], point = NOZZLE_POINTS[row][side];
    return Object.freeze({
      x: destination.x + (point[0] - source.x) / source.width * destination.width,
      y: destination.y + (point[1] - source.y) / source.height * destination.height
    });
  }
  function mountedPlumes(row) {
    return Object.freeze(PLUME_LAYOUTS[row].map(({ source, root }, side) => {
      const anchor = nozzleAt(row, side), scale = 145 / source.height;
      return Object.freeze({ source, anchor, destination: Object.freeze({
        x: anchor.x - (root.x - source.x) * scale,
        y: anchor.y - (root.y - source.y) * scale,
        width: source.width * scale,
        height: source.height * scale
      }) });
    }));
  }
  var FRAMES = Object.freeze(Object.fromEntries(["hull", "wings", "engines", "flames"].map((part, column) => [
    part,
    Object.freeze(VARIANTS.map((_, row) => Object.freeze({
      column,
      row,
      columns: 4,
      rows: 2,
      sourceWidth: 1774,
      sourceHeight: 887,
      source: Object.freeze(FRAME_LAYOUTS[part][row].source),
      destination: Object.freeze(FRAME_LAYOUTS[part][row].destination),
      ...part === "flames" ? { plumes: mountedPlumes(row) } : {}
    })))
  ])));
  function shipPartFrame(loadout, part) {
    if (!Object.hasOwn(FRAMES, part)) throw new RangeError("Unknown ship part");
    const variant = variantAt(loadout, part === "flames" ? "engines" : part);
    return FRAMES[part][VARIANTS.indexOf(variant)];
  }
  function shipNozzleAnchors(loadout) {
    const row = shipPartFrame(loadout, "engines").row;
    return Object.freeze(NOZZLE_POINTS[row].map((_, side) => nozzleAt(row, side)));
  }
  function advanceShipBank(current, target, delta) {
    if (!Number.isFinite(delta) || delta < 0) throw new RangeError("Visual bank delta must be nonnegative");
    const before = Number.isFinite(current) ? Math.max(-1, Math.min(1, current)) : 0;
    const desired = Number.isFinite(target) ? Math.max(-1, Math.min(1, target)) : 0;
    if (delta === 0) return before;
    const response = Math.abs(desired) > Math.abs(before) ? 8 : 5;
    return before + (desired - before) * (1 - Math.exp(-Math.min(delta, 0.1) * response));
  }
  var bounded = (value, fallback, min, max) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  function shipAssemblyPose(input = {}) {
    const elapsed = bounded(ownValue(input, "elapsedSeconds"), 0, 0, Number.MAX_VALUE);
    const steering = bounded(ownValue(input, "steering"), 0, -1, 1);
    const impact = bounded(ownValue(input, "impactSeconds"), 0, 0, 1);
    const health = bounded(ownValue(input, "hull"), 100, 0, 100);
    const bankStrength = bounded(ownValue(input, "bankStrength"), 1, 1, 2);
    const wave = (frequency) => Math.sin(elapsed % (Math.PI * 2 / frequency) * frequency);
    const turn = steering * (1.5 - 0.5 * steering * steering);
    const intensity = Math.abs(turn), damage = 1 - health / 100;
    return Object.freeze({
      bankScaleX: 1 - intensity * 0.12,
      bankRotation: turn * 0.1 * bankStrength + wave(43) * impact * 0.018,
      wingSweep: turn * 0.055,
      enginePulse: (1 + wave(17) * 0.075 + intensity * 0.12) * (1 - damage * 0.08)
    });
  }

  // src/game/animation/chronos-destruction.js
  var DEFAULT_MIN_DURATION = 90;
  var RUPTURE_POSITION = 0.1;
  var WAVE_DURATION = 7.2;
  var WAVE_FADE_DURATION = 1.2;
  var WAVE_FRAME_DURATION = WAVE_DURATION / 4;
  var FRAME_ENDS = Object.freeze([0, 0.45, 1.25, 2.4, 4.4]);
  var STATES = Object.freeze(["intact", "impact", "fracture", "rupture", "dispersion", "aftermath"]);
  var clamp13 = (value, min, max) => Math.max(min, Math.min(max, value));
  function getChronosDestructionPose(view) {
    const elapsed = Number.isFinite(view?.elapsed) && view.elapsed >= 0 ? view.elapsed : 0;
    const duration = view?.cinematicDuration ?? view?.minDuration;
    const minDuration = Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_MIN_DURATION;
    const ruptureAt = minDuration * RUPTURE_POSITION;
    const beforeRupture = elapsed < ruptureAt;
    const age = Math.max(0, elapsed - ruptureAt);
    let frame = 0;
    while (frame < FRAME_ENDS.length && elapsed >= ruptureAt + FRAME_ENDS[frame]) frame++;
    let waveFrame = 0;
    while (waveFrame < 3 && elapsed >= ruptureAt + (waveFrame + 1) * WAVE_FRAME_DURATION) waveFrame++;
    const waveVisible = !beforeRupture && elapsed < ruptureAt + WAVE_DURATION;
    const waveProgress = clamp13(age / WAVE_DURATION, 0, 1);
    const waveAlpha = waveVisible ? 0.55 * clamp13((WAVE_DURATION - age) / WAVE_FADE_DURATION, 0, 1) : 0;
    return Object.freeze({
      frame,
      age,
      state: STATES[frame],
      waveFrame,
      waveScale: 0.34 + waveProgress * 1.9,
      waveAlpha,
      waveVisible
    });
  }

  // src/game/animation/chronos-intro.js
  var CHRONOS_INTRO_TIMELINE = Object.freeze({
    omen: 2.8,
    approach: 3.6,
    arrive: 6,
    drain: 6.4,
    beamStart: 8.6,
    rupture: 9,
    fireEnd: 9.2,
    explosionSeconds: 2.2,
    stationGone: 9,
    turn: 10.4,
    leave: 11.5,
    gone: 12.6,
    fragmentsEnd: 17,
    end: 26
  });
  var range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index);
  var CRONOS_PRIME_FRAMES = Object.freeze({
    idle: range(0, 7),
    wake: range(8, 13),
    charge: range(14, 23),
    fire: range(24, 33),
    cooldown: range(34, 39)
  });
  var STATION_BURST_FRAMES = 10;
  var T = CHRONOS_INTRO_TIMELINE;
  var F = CRONOS_PRIME_FRAMES;
  var clamp14 = (value, low, high) => Math.max(low, Math.min(high, value));
  var smooth3 = (value, from, to) => {
    const t = clamp14((value - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  };
  var easeOut = (value, from, to) => 1 - (1 - clamp14((value - from) / (to - from), 0, 1)) ** 3;
  var easeIn = (value, from, to) => clamp14((value - from) / (to - from), 0, 1) ** 2;
  var mix2 = (from, to, amount) => from + (to - from) * amount;
  var wobble = (time, rate, seed) => Math.sin(time * rate + seed) * 0.6 + Math.sin(time * rate * 2.13 + seed * 1.7) * 0.4;
  var SHOTS = Object.freeze([
    [0, "scale"],
    [T.omen, "omen"],
    [T.approach, "arrival"],
    [T.drain, "drain"],
    [T.beamStart, "shot"],
    [T.rupture, "rupture"],
    [T.turn, "scorn"],
    [T.gone, "escape"]
  ]);
  var STATION_FRAME = Object.freeze({ zoom: 0.72, drop: 0.08 });
  var FAR = Object.freeze({ x: 0.72, y: 0.22, scale: 0.07 });
  var HOVER = Object.freeze({ x: 0.48, y: 0.25, scale: 1 });
  var EXIT = Object.freeze({ x: 0.94, y: 0.12, scale: 0.05 });
  var SECTORS2 = 8;
  var FRAGMENTS = Object.freeze([
    [-0.95, -0.35, 1.6],
    [0.9, -0.45, -1.2],
    [-0.55, 0.85, 2.1],
    [0.6, 0.8, -1.8],
    [-0.2, -1, 0.9],
    [1, 0.15, 1.4],
    [-1, 0.2, -2.3],
    [0.15, 1, 1.1]
  ].map(([x, y, spin], cell) => Object.freeze({ cell, x, y, spin })));
  var INACTIVE = Object.freeze({ active: false });
  var spread = (list, from, to) => list.map((frame, index) => [from + (to - from) * index / list.length, frame]);
  var idleLoop = (from, to) => {
    const steps = [];
    for (let at = from, index = 0; at < to - 1e-9; at += 0.16, index++) steps.push([at, F.idle[index % F.idle.length]]);
    return steps;
  };
  var FRAME_TRACK = Object.freeze([
    ...idleLoop(T.approach, T.drain),
    ...spread(F.wake, T.drain, T.drain + 0.9),
    ...spread(F.charge, T.drain + 0.9, T.beamStart),
    [T.beamStart, F.fire[0], "cut"],
    ...spread(F.fire.slice(1), T.beamStart + (T.fireEnd - T.beamStart) / F.fire.length, T.fireEnd),
    ...spread(F.cooldown, T.fireEnd, T.leave),
    ...idleLoop(T.leave, T.gone + 0.2)
  ]);
  function primeFrame(elapsed) {
    let index = 0;
    while (index + 1 < FRAME_TRACK.length && FRAME_TRACK[index + 1][0] <= elapsed) index++;
    const [at, frame] = FRAME_TRACK[index];
    const following = FRAME_TRACK[index + 1];
    if (!following || following[2] === "cut") return { frame, next: frame, blend: 0 };
    return { frame, next: following[1], blend: smooth3(elapsed, at, following[0]) };
  }
  function getChronosIntroPose(elapsed, { reducedEffects = false, holdWreck = false } = {}) {
    if (!Number.isFinite(elapsed) || elapsed < 0) return INACTIVE;
    if (elapsed > T.end && !holdWreck) return INACTIVE;
    const spinClock = elapsed;
    elapsed = Math.min(elapsed, T.end);
    const ruptured = elapsed >= T.rupture;
    const since = elapsed - T.rupture;
    const shotIndex = SHOTS.reduce((found, [at], index) => elapsed >= at ? index : found, 0);
    const motion = reducedEffects ? 0 : 1;
    const push = smooth3(elapsed, T.beamStart, T.rupture) * (1 - smooth3(elapsed, T.rupture + 0.2, T.rupture + 1.5));
    const brake = elapsed >= T.arrive && elapsed < T.arrive + 0.4 ? 0.01 * (1 - (elapsed - T.arrive) / 0.4) : 0;
    const drain = smooth3(elapsed, T.drain, T.beamStart);
    const tremor = drain * (ruptured ? 0 : 1) * 6e-3 + brake + (ruptured ? 0.03 * Math.max(0, 1 - since / 1.1) ** 2 : 0);
    const camera = {
      zoom: mix2(3, 1, smooth3(elapsed, 0, T.drain)) + 0.08 * push,
      cx: mix2(0.48, 0.5, smooth3(elapsed, 0, T.approach)),
      cy: mix2(0.32, 0.5, smooth3(elapsed, T.omen * 0.5, T.drain)),
      shakeX: motion * tremor * wobble(elapsed, 47, 1),
      shakeY: motion * tremor * wobble(elapsed, 53, 4)
    };
    const flicker = elapsed >= T.omen && elapsed < T.drain ? 0.82 + 0.18 * Math.max(0, wobble(elapsed, 31, 2)) : 1;
    const station2 = {
      ringAngle: -0.2 * spinClock,
      wheelAngle: 0.32 * spinClock,
      tiltY: 0.8 + 0.035 * Math.sin(spinClock * 0.45),
      sway: 0.04 * Math.sin(spinClock * 0.3),
      // Al impacto la estación entera pasa a ser la explosión: no queda nada entero.
      whole: elapsed < T.stationGone,
      towerCell: ruptured ? 4 : 3,
      sectorLights: Array.from({ length: SECTORS2 }, (_, index) => ruptured ? 0 : flicker * (1 - smooth3(drain * SECTORS2, index, index + 0.8))),
      zoom: STATION_FRAME.zoom * (1 - 0.5 * smooth3(elapsed, T.rupture + 1, 18)),
      drop: STATION_FRAME.drop,
      // Lo que queda (la torre partida) es fondo: oscuro y lejano.
      alpha: ruptured ? 0.75 * (1 - smooth3(elapsed, T.rupture + 2, T.rupture + 9)) + 0.2 : 1
    };
    const arrival2 = easeOut(elapsed, T.approach, T.arrive);
    const leaving = easeIn(elapsed, T.leave, T.gone);
    const hover = elapsed >= T.arrive ? 6e-3 * Math.sin((elapsed - T.arrive) * 2.2) : 0;
    const recoil = ruptured ? 0.02 * Math.max(0, 1 - since / 0.35) : 0;
    const prime = {
      visible: elapsed >= T.approach && elapsed < T.gone,
      ...primeFrame(elapsed),
      x: mix2(mix2(FAR.x, HOVER.x, arrival2), EXIT.x, leaving),
      y: mix2(mix2(FAR.y, HOVER.y, arrival2), EXIT.y, leaving) + hover - recoil,
      scale: mix2(mix2(FAR.scale, HOVER.scale, arrival2), EXIT.scale, leaving) * (1 + 0.08 * drain),
      alpha: elapsed < T.approach ? 0 : 1,
      // Sin estela: llega y se va por un portal (propietario, 24/10/2026).
      trail: 0,
      heading: elapsed < T.leave ? Math.atan2(HOVER.y - FAR.y, HOVER.x - FAR.x) : Math.atan2(EXIT.y - HOVER.y, EXIT.x - HOVER.x),
      // Onda al frenar en seco.
      brake: elapsed >= T.arrive && elapsed < T.arrive + 0.45 ? 1 - (elapsed - T.arrive) / 0.45 : 0,
      charge: drain,
      nameCard: smooth3(elapsed, T.arrive, T.arrive + 0.25) * (1 - smooth3(elapsed, T.beamStart - 0.6, T.beamStart - 0.2)),
      nameCardPunch: 1 - easeOut(elapsed, T.arrive, T.arrive + 0.3)
    };
    const portal = (x, y, open) => ({ x, y, open, spin: elapsed * 0.35 });
    const portals = [
      portal(FAR.x, FAR.y, smooth3(elapsed, T.omen, T.approach) * (1 - smooth3(elapsed, T.approach + 0.9, T.approach + 1.5))),
      portal(EXIT.x, EXIT.y, smooth3(elapsed, T.leave - 0.6, T.leave) * (1 - smooth3(elapsed, T.gone - 0.1, T.gone + 0.5)))
    ].filter((item) => item.open > 0);
    const drainStreams = elapsed >= T.drain && elapsed < T.rupture ? station2.sectorLights.map((light, index) => ({
      angle: -Math.PI / 2 + (index + 0.5) * Math.PI * 2 / SECTORS2,
      alpha: smooth3(drain * SECTORS2, index - 0.3, index) * (1 - smooth3(drain * SECTORS2, index + 0.8, index + 1.4)) * (1 - smooth3(elapsed, T.beamStart, T.rupture)),
      cell: 1 + (index + Math.floor(elapsed * 14)) % 6,
      progress: ((elapsed - T.drain) * 1.8 + index * 0.37) % 1
    })) : [];
    const beamWindow = smooth3(elapsed, T.beamStart, T.beamStart + 0.1) * (1 - smooth3(elapsed, T.rupture + 0.05, T.fireEnd));
    const beam = { alpha: beamWindow, width: (0.6 + 0.4 * smooth3(elapsed, T.beamStart, T.rupture)) * (1 + 0.1 * Math.sin(elapsed * 60) * motion) };
    const flash = ruptured && since < 0.25 ? (reducedEffects ? 0.25 : 0.7) * (1 - since / 0.25) ** 2 : 0;
    const explosionAge = ruptured ? since / T.explosionSeconds : 1;
    const burstPosition = explosionAge * STATION_BURST_FRAMES;
    const explosion = explosionAge < 1 ? {
      frame: Math.min(STATION_BURST_FRAMES - 1, Math.floor(burstPosition)),
      next: Math.min(STATION_BURST_FRAMES - 1, Math.floor(burstPosition) + 1),
      blend: burstPosition % 1,
      scale: 1.4 + 0.25 * easeOut(explosionAge, 0, 1),
      alpha: 1 - smooth3(explosionAge, 0.8, 1)
    } : null;
    const fragments = elapsed >= T.rupture + 0.35 ? FRAGMENTS.map((item) => {
      const age = elapsed - (T.rupture + 0.35);
      const travel = age * (0.45 + 0.12 * (item.cell % 3)) + age * age * 0.04;
      return {
        cell: item.cell,
        dx: item.x * travel,
        dy: item.y * travel,
        angle: item.spin * age,
        scale: 1 + travel * (item.y > 0 ? 2.2 : 1),
        alpha: 1 - smooth3(elapsed, T.fragmentsEnd - 3, T.fragmentsEnd)
      };
    }) : [];
    const darkness = 0.35 * smooth3(elapsed, T.omen, T.approach) * (1 - smooth3(elapsed, T.rupture, T.rupture + 0.6));
    const phase = SHOTS[shotIndex][1];
    return {
      active: true,
      phase,
      shot: shotIndex + 1,
      clock: elapsed,
      camera,
      darkness,
      portals,
      station: station2,
      prime,
      drainStreams,
      beam,
      flash,
      explosion,
      fragments
    };
  }

  // src/game/combat/classic-weapons.js
  var finite7 = (value, name) => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  };
  var weapon = (definition) => Object.freeze({
    ...definition,
    barrels: Object.freeze(definition.barrels.map((barrel) => Object.freeze({ ...barrel })))
  });
  var CLASSIC_WEAPON_RULES = Object.freeze({
    version: "classic-weapons-v4",
    maxCharges: 20,
    rechargeSeconds: 2,
    maxDelta: 0.05,
    maxProjectiles: 32,
    boundsMargin: 80,
    missile: Object.freeze({ damage: 18, speed: 760, radius: 10, duration: 3.2, cooldown: 0.7 }),
    types: Object.freeze({
      pulse: weapon({
        id: "pulse",
        label: "Phaser",
        damageMultiplier: 1,
        description: "Da\xF1o \xD71: un pulso de 1 de da\xF1o por carga.",
        cooldown: 0.24,
        speed: 920,
        damage: 1,
        radius: 9,
        duration: 2.4,
        barrels: [{ offset: 0, spread: 0 }]
      }),
      twin: weapon({
        id: "twin",
        label: "Gemelo",
        damageMultiplier: 2,
        description: "Da\xF1o \xD72: dos pulsos centrados de 1 de da\xF1o por carga.",
        cooldown: 0.3,
        speed: 900,
        damage: 1,
        radius: 7,
        duration: 2.4,
        barrels: [{ offset: -10, spread: 0 }, { offset: 10, spread: 0 }]
      }),
      lance: weapon({
        id: "lance",
        label: "Lanza",
        damageMultiplier: 3,
        description: "Da\xF1o \xD73: una lanza de 3 de da\xF1o que atraviesa hasta dos objetivos distintos.",
        cooldown: 0.48,
        speed: 1280,
        damage: 3,
        radius: 6,
        duration: 1.8,
        pierce: 2,
        barrels: [{ offset: 0, spread: 0 }]
      }),
      scatter: weapon({
        id: "scatter",
        label: "Abanico",
        damageMultiplier: 3,
        description: "Da\xF1o \xD73 si impactan los tres pulsos: abanico de corto alcance.",
        cooldown: 0.4,
        speed: 660,
        damage: 1,
        radius: 7,
        duration: 0.34,
        barrels: [{ offset: -5, spread: -0.16 }, { offset: 0, spread: 0 }, { offset: 5, spread: 0.16 }]
      }),
      needle: weapon({
        id: "needle",
        label: "Aguja",
        damageMultiplier: 2,
        description: "Da\xF1o \xD72 por objetivo: proyectil estrecho que perfora hasta tres objetivos.",
        cooldown: 0.56,
        speed: 1400,
        damage: 2,
        radius: 4,
        duration: 1.6,
        pierce: 3,
        barrels: [{ offset: 0, spread: 0 }]
      })
    })
  });
  function knownType(type) {
    if (!Object.hasOwn(CLASSIC_WEAPON_RULES.types, type)) {
      throw new RangeError(`Unknown classic weapon: ${String(type)}`);
    }
    return type;
  }
  function rechargeInterval(seconds) {
    finite7(seconds, "recharge interval");
    if (seconds < 1 || seconds > CLASSIC_WEAPON_RULES.rechargeSeconds) {
      throw new RangeError("Recharge interval must be between 1 and 2 seconds");
    }
    return seconds;
  }
  function createClassicWeapons({
    type = "pulse",
    unlocked = ["pulse"],
    width = 720,
    height = 1280,
    rechargeSeconds = CLASSIC_WEAPON_RULES.rechargeSeconds
  } = {}) {
    rechargeInterval(rechargeSeconds);
    finite7(width, "width");
    finite7(height, "height");
    knownType(type);
    if (width < 240 || height < 240) throw new RangeError("Invalid weapon arena");
    if (!Array.isArray(unlocked) || unlocked.length === 0) {
      throw new TypeError("At least one unlocked weapon is required");
    }
    const available = [...new Set(unlocked.map(knownType))];
    if (!available.includes(type)) throw new RangeError("Selected weapon must be unlocked");
    return {
      version: CLASSIC_WEAPON_RULES.version,
      width,
      height,
      selected: type,
      unlocked: available,
      weaponRanks: { scatter: 1, needle: 1 },
      charges: CLASSIC_WEAPON_RULES.maxCharges,
      rechargeSeconds,
      recharge: 0,
      cooldown: 0,
      elapsed: 0,
      unlimitedFire: false,
      missileCooldown: 0,
      missileSequence: 0,
      projectileSequence: 0,
      eventSequence: 0,
      shotSequence: 0,
      projectiles: []
    };
  }
  function event(state, type, details = {}) {
    return { id: `${state.version}:event:${++state.eventSequence}`, type, ...details };
  }
  function setClassicRechargeInterval(state, seconds) {
    rechargeInterval(seconds);
    if (state.rechargeSeconds === seconds) return seconds;
    state.rechargeSeconds = seconds;
    state.recharge = state.charges === CLASSIC_WEAPON_RULES.maxCharges ? 0 : Math.min(state.recharge, seconds - 1e-9);
    return seconds;
  }
  function setClassicWeaponTuning(state, ranks = {}) {
    if (!ranks || typeof ranks !== "object" || Array.isArray(ranks) || Object.keys(ranks).some((id) => id !== "scatter" && id !== "needle")) {
      throw new TypeError("Known weapon ranks required");
    }
    const next = {};
    for (const id of ["scatter", "needle"]) {
      const rank = ranks[id] ?? 1;
      if (!Number.isInteger(rank) || rank < 0 || rank > 2) throw new RangeError("Weapon rank must be 0, 1 or 2");
      next[id] = Math.max(1, rank);
    }
    state.weaponRanks = next;
    return { ...next };
  }
  function tunedWeaponDefinition(state) {
    const base = CLASSIC_WEAPON_RULES.types[state.selected];
    if (state.selected === "scatter" && state.weaponRanks?.scatter === 2) {
      return {
        ...base,
        duration: 0.48,
        description: "Da\xF1o \xD73 si impactan los tres pulsos; apertura concentrada y alcance ampliado de 224 a 317.",
        barrels: base.barrels.map((barrel) => ({ ...barrel, spread: barrel.spread * (0.11 / 0.16) }))
      };
    }
    if (state.selected === "needle" && state.weaponRanks?.needle === 2) {
      return {
        ...base,
        cooldown: 0.46,
        pierce: 4,
        description: "Da\xF1o \xD72 por objetivo: perfora hasta cuatro objetivos y dispara cada 0,46 s."
      };
    }
    return base;
  }
  function setClassicUnlimitedFire(state, active) {
    if (typeof active !== "boolean") throw new TypeError("Unlimited fire flag must be boolean");
    state.unlimitedFire = active;
    return active;
  }
  function canTriggerClassicMissile(state) {
    return state.missileCooldown <= 1e-9 && state.projectiles.length < CLASSIC_WEAPON_RULES.maxProjectiles;
  }
  function triggerClassicMissile(state, { x, y, angle = -Math.PI / 2, shotId } = {}) {
    finite7(x, "origin x");
    finite7(y, "origin y");
    finite7(angle, "angle");
    if (typeof shotId !== "string" || !/^missile:[1-9]\d*$/.test(shotId) || !Number.isSafeInteger(Number(shotId.slice(8)))) throw new TypeError("Durable missile:N receipt required");
    const receipt = Number(shotId.slice(8));
    if (receipt <= state.missileSequence) return { accepted: false, reason: "duplicate", events: [], projectiles: [] };
    if (state.missileCooldown > 1e-9) return { accepted: false, reason: "cooldown", events: [], projectiles: [] };
    if (state.projectiles.length >= CLASSIC_WEAPON_RULES.maxProjectiles)
      return { accepted: false, reason: "capacity", events: [], projectiles: [] };
    const definition = CLASSIC_WEAPON_RULES.missile;
    const projectile2 = {
      id: `${state.version}:projectile:${++state.projectileSequence}`,
      shotId,
      weapon: "missile",
      special: true,
      missile: true,
      barrel: 0,
      x,
      y,
      vx: Math.cos(angle) * definition.speed,
      vy: Math.sin(angle) * definition.speed,
      damage: definition.damage,
      radius: definition.radius,
      pierce: 1,
      duration: definition.duration,
      life: definition.duration,
      hitTargets: []
    };
    state.missileSequence = receipt;
    state.missileCooldown = definition.cooldown;
    state.projectiles.push(projectile2);
    return { accepted: true, shotId, projectiles: [projectile2], events: [
      event(state, "missileFired", { shotId, weapon: "missile", special: true }),
      event(state, "projectile", { projectile: { ...projectile2, hitTargets: [] } })
    ] };
  }
  function unlockClassicWeapon(state, type) {
    knownType(type);
    if (state.unlocked.includes(type)) return { accepted: false, reason: "unlocked", events: [] };
    state.unlocked.push(type);
    return { accepted: true, events: [event(state, "unlocked", { weapon: type })] };
  }
  function selectClassicWeapon(state, type) {
    knownType(type);
    if (!state.unlocked.includes(type)) return { accepted: false, reason: "locked", events: [] };
    if (state.selected === type) return { accepted: false, reason: "selected", events: [] };
    state.selected = type;
    return { accepted: true, events: [event(state, "selected", { weapon: type })] };
  }
  function triggerClassicWeapon(state, { x, y, angle = -Math.PI / 2 } = {}) {
    finite7(x, "origin x");
    finite7(y, "origin y");
    finite7(angle, "angle");
    if (!state.unlimitedFire && state.charges === 0) return { accepted: false, reason: "empty", events: [], projectiles: [] };
    if (state.cooldown > 1e-9) return { accepted: false, reason: "cooldown", events: [], projectiles: [] };
    const definition = tunedWeaponDefinition(state);
    if (state.projectiles.length + definition.barrels.length > CLASSIC_WEAPON_RULES.maxProjectiles) {
      return { accepted: false, reason: "capacity", events: [], projectiles: [] };
    }
    const wasFull = state.charges === CLASSIC_WEAPON_RULES.maxCharges;
    if (!state.unlimitedFire) {
      state.charges--;
      if (wasFull) state.recharge = 0;
    }
    state.cooldown = definition.cooldown;
    const shotId = `${state.version}:shot:${++state.shotSequence}`;
    const events = [event(state, "fired", {
      shotId,
      weapon: state.selected,
      charges: state.charges,
      barrels: definition.barrels.length
    })];
    const projectiles = definition.barrels.map((barrel, barrelIndex) => {
      const direction = angle + barrel.spread;
      const projectile2 = {
        id: `${state.version}:projectile:${++state.projectileSequence}`,
        shotId,
        weapon: state.selected,
        barrel: barrelIndex,
        x: x - Math.sin(angle) * barrel.offset,
        y: y + Math.cos(angle) * barrel.offset,
        vx: Math.cos(direction) * definition.speed,
        vy: Math.sin(direction) * definition.speed,
        damage: definition.damage,
        radius: definition.radius,
        pierce: definition.pierce || 1,
        duration: definition.duration,
        life: definition.duration,
        hitTargets: []
      };
      events.push(event(state, "projectile", { projectile: { ...projectile2, hitTargets: [] } }));
      return projectile2;
    });
    state.projectiles.push(...projectiles);
    return { accepted: true, shotId, events, projectiles };
  }
  function advanceClassicWeapons(state, delta) {
    finite7(delta, "delta");
    if (delta < 0) throw new RangeError("Finite nonnegative delta required");
    if (delta === 0) return [];
    const dt = Math.min(delta, CLASSIC_WEAPON_RULES.maxDelta);
    const events = [];
    state.elapsed += dt;
    state.cooldown = Math.max(0, state.cooldown - dt);
    state.missileCooldown = Math.max(0, state.missileCooldown - dt);
    if (!state.unlimitedFire && state.charges < CLASSIC_WEAPON_RULES.maxCharges) {
      state.recharge += dt;
      while (state.recharge + 1e-9 >= state.rechargeSeconds && state.charges < CLASSIC_WEAPON_RULES.maxCharges) {
        state.charges++;
        state.recharge = Math.max(0, state.recharge - state.rechargeSeconds);
        events.push(event(state, "recharged", { charges: state.charges }));
      }
    }
    if (state.charges === CLASSIC_WEAPON_RULES.maxCharges) state.recharge = 0;
    const margin = CLASSIC_WEAPON_RULES.boundsMargin;
    for (let index = state.projectiles.length - 1; index >= 0; index--) {
      const projectile2 = state.projectiles[index];
      projectile2.x += projectile2.vx * dt;
      projectile2.y += projectile2.vy * dt;
      projectile2.life = Math.max(0, projectile2.life - dt);
      const outside = projectile2.x < -margin || projectile2.x > state.width + margin || projectile2.y < -margin || projectile2.y > state.height + margin;
      if (projectile2.life <= 1e-9 || outside) {
        state.projectiles.splice(index, 1);
        events.push(event(state, "expired", {
          projectileId: projectile2.id,
          reason: outside ? "bounds" : "lifetime"
        }));
      }
    }
    return events;
  }
  function hitClassicProjectile(state, projectileId, targetId) {
    if (typeof projectileId !== "string" || !projectileId) throw new TypeError("Projectile ID required");
    if (!(typeof targetId === "string" && targetId.length > 0 || Number.isSafeInteger(targetId))) {
      throw new TypeError("Stable target ID required");
    }
    const index = state.projectiles.findIndex((projectile3) => projectile3.id === projectileId);
    if (index < 0) return { accepted: false, reason: "inactive", damage: 0, events: [] };
    const projectile2 = state.projectiles[index];
    const key = `${typeof targetId}:${targetId}`;
    if (projectile2.hitTargets.includes(key)) {
      return { accepted: false, reason: "duplicate", damage: 0, events: [] };
    }
    projectile2.hitTargets.push(key);
    projectile2.pierce--;
    if (projectile2.pierce <= 0) state.projectiles.splice(index, 1);
    return {
      accepted: true,
      damage: projectile2.damage,
      events: [event(state, "hit", {
        projectileId,
        shotId: projectile2.shotId,
        targetId,
        damage: projectile2.damage,
        x: projectile2.x,
        y: projectile2.y,
        weapon: projectile2.weapon
      })]
    };
  }
  function classicWeaponSnapshot(state) {
    const definition = tunedWeaponDefinition(state);
    return {
      ...state,
      unlocked: [...state.unlocked],
      weaponRanks: { ...state.weaponRanks },
      label: definition.label,
      description: definition.description,
      damageMultiplier: definition.damageMultiplier,
      rechargeProgress: state.charges === CLASSIC_WEAPON_RULES.maxCharges ? 0 : Math.min(1, state.recharge / state.rechargeSeconds),
      projectiles: state.projectiles.map((projectile2) => ({
        ...projectile2,
        hitTargets: [...projectile2.hitTargets]
      }))
    };
  }

  // src/game/ship/flight-controls.js
  var SIDE_CLEARANCE = 119;
  var NOSE_CLEARANCE = 158;
  var TAIL_CLEARANCE = 104;
  function finite8(value, name) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new RangeError(`${name} must be finite`);
    }
    return value;
  }
  function pointerId(value) {
    if (typeof value === "number" && Number.isSafeInteger(value) || typeof value === "string" && value.length > 0) return value;
    throw new TypeError("A finite integer or nonempty string pointer id is required");
  }
  function inputState(state) {
    if (!state || typeof state !== "object" || typeof state.active !== "boolean") {
      throw new TypeError("A relative flight input state is required");
    }
    if (state.active) {
      pointerId(state.id);
      finite8(state.lastX, "lastX");
      finite8(state.lastY, "lastY");
    }
  }
  function checkedBounds(bounds) {
    if (!bounds || typeof bounds !== "object") throw new TypeError("Flight bounds are required");
    for (const key of ["minX", "maxX", "minY", "maxY"]) finite8(bounds[key], key);
    if (bounds.minX > bounds.maxX || bounds.minY > bounds.maxY) {
      throw new RangeError("Flight bounds must be ordered");
    }
    return bounds;
  }
  var clamp15 = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  function calculateFlightBounds({ width, height, hudBottom, controlsTop, shipScale = 1 }) {
    finite8(width, "width");
    finite8(height, "height");
    finite8(hudBottom, "hudBottom");
    finite8(controlsTop, "controlsTop");
    finite8(shipScale, "shipScale");
    if (width <= 0 || height <= 0 || hudBottom < 0 || controlsTop > height || hudBottom > controlsTop || shipScale <= 0 || shipScale > 4) {
      throw new RangeError("A positive viewport and ordered HUD/control boundaries are required");
    }
    const firstX = SIDE_CLEARANCE * shipScale, lastX = width - SIDE_CLEARANCE * shipScale;
    const firstY = hudBottom + NOSE_CLEARANCE * shipScale, lastY = controlsTop - TAIL_CLEARANCE * shipScale;
    const xFits = firstX <= lastX, yFits = firstY <= lastY;
    const centerY = clamp15(firstY / 2 + lastY / 2, 0, height);
    return Object.freeze({
      minX: xFits ? firstX : width / 2,
      maxX: xFits ? lastX : width / 2,
      minY: yFits ? firstY : centerY,
      maxY: yFits ? lastY : centerY,
      fits: xFits && yFits,
      xFits,
      yFits
    });
  }
  function createRelativeFlightInput() {
    return { active: false, id: null, lastX: null, lastY: null };
  }
  function beginFlightInput(state, { id, x, y }) {
    inputState(state);
    pointerId(id);
    finite8(x, "x");
    finite8(y, "y");
    if (state.active) return false;
    state.active = true;
    state.id = id;
    state.lastX = x;
    state.lastY = y;
    return true;
  }
  function moveFlightInput(state, {
    id,
    x,
    y,
    targetX,
    targetY,
    sensitivity = 1,
    bounds
  }) {
    inputState(state);
    pointerId(id);
    finite8(x, "x");
    finite8(y, "y");
    finite8(targetX, "targetX");
    finite8(targetY, "targetY");
    finite8(sensitivity, "sensitivity");
    checkedBounds(bounds);
    if (sensitivity <= 0) throw new RangeError("Sensitivity must be positive");
    if (!state.active || state.id !== id) {
      return {
        targetX: clamp15(targetX, bounds.minX, bounds.maxX),
        targetY: clamp15(targetY, bounds.minY, bounds.maxY),
        moved: false
      };
    }
    const nextX = targetX + (x - state.lastX) * sensitivity;
    const nextY = targetY + (y - state.lastY) * sensitivity;
    finite8(nextX, "computed targetX");
    finite8(nextY, "computed targetY");
    const moved = x !== state.lastX || y !== state.lastY;
    state.lastX = x;
    state.lastY = y;
    return {
      targetX: clamp15(nextX, bounds.minX, bounds.maxX),
      targetY: clamp15(nextY, bounds.minY, bounds.maxY),
      moved
    };
  }
  function endFlightInput(state, id = null) {
    inputState(state);
    if (id !== null) pointerId(id);
    if (!state.active || id !== null && state.id !== id) return false;
    state.active = false;
    state.id = null;
    state.lastX = null;
    state.lastY = null;
    return true;
  }

  // src/game/combat/enemy-ai.js
  var ENEMY_AI_PROFILES = Object.freeze({
    hunter: Object.freeze({ attackRange: 700, chaseOffset: 170 }),
    artillery: Object.freeze({ preferred: 420, minRange: 250 }),
    escort: Object.freeze({ sideOffset: 55, depthOffset: 40 }),
    opportunist: Object.freeze({ hullThreshold: 35, hover: 320 }),
    ambusher: Object.freeze({ belowOffset: 140, entryLine: 1100 }),
    miner: Object.freeze({ laneShare: 0.78, edge: 60, arrive: 30 })
  });
  var clamp16 = (value, low, high) => Math.max(low, Math.min(high, value));
  var distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function movement(enemy, ctx, rules) {
    const { player, bounds } = ctx, d = distance(enemy, player);
    switch (enemy.profile) {
      case "hunter":
        return { x: player.x, y: player.y - rules.chaseOffset };
      case "artillery": {
        if (d >= rules.preferred || d === 0) return { x: enemy.x, y: enemy.y };
        const k = rules.preferred / d;
        return { x: player.x + (enemy.x - player.x) * k, y: player.y + (enemy.y - player.y) * k };
      }
      case "escort": {
        const allies = ctx.allies.filter((ally) => ally.id !== enemy.id);
        if (!allies.length) return { x: enemy.x, y: enemy.y, guardId: null };
        const weakest = allies.reduce((a, b) => b.hp / b.maxHp < a.hp / a.maxHp ? b : a);
        return {
          x: weakest.x + (enemy.x <= weakest.x ? -rules.sideOffset : rules.sideOffset),
          y: weakest.y + rules.depthOffset,
          guardId: weakest.id
        };
      }
      case "opportunist":
        return { x: enemy.x <= bounds.w / 2 ? bounds.w * 0.2 : bounds.w * 0.8, y: Math.max(120, player.y - rules.hover) };
      case "ambusher":
        return enemy.y > rules.entryLine ? { x: player.x, y: player.y + rules.belowOffset } : { x: enemy.x, y: bounds.h - 100 };
      case "miner": {
        let heading = enemy.heading ?? (enemy.x < bounds.w / 2 ? 1 : -1);
        const goal = heading > 0 ? bounds.w - rules.edge : rules.edge;
        if (Math.abs(enemy.x - goal) < rules.arrive) heading = -heading;
        return { x: heading > 0 ? bounds.w - rules.edge : rules.edge, y: bounds.h * rules.laneShare, heading };
      }
      default:
        throw new RangeError(`Unknown enemy profile: ${enemy.profile}`);
    }
  }
  function wantsToAttack(enemy, ctx, rules) {
    const { player } = ctx, d = distance(enemy, player);
    switch (enemy.profile) {
      case "hunter":
        return d <= rules.attackRange;
      case "artillery":
        return d >= rules.minRange;
      case "opportunist":
        return player.reloading || player.hull < rules.hullThreshold;
      case "ambusher":
        return enemy.y > player.y;
      case "miner":
        return true;
      default:
        return false;
    }
  }
  function decideEnemyIntent(enemy, ctx) {
    const rules = ENEMY_AI_PROFILES[enemy.profile];
    if (!rules) throw new RangeError(`Unknown enemy profile: ${enemy.profile}`);
    const { w, h } = ctx.bounds, move = movement(enemy, ctx, rules);
    const intent = {
      targetX: clamp16(move.x, 40, w - 40),
      targetY: clamp16(move.y, 40, h - 40),
      attack: false,
      ability: null,
      ...move.heading !== void 0 ? { heading: move.heading } : {}
    };
    const ready = enemy.cooldowns.unique <= ctx.now ? "unique" : enemy.cooldowns.basic <= ctx.now ? "basic" : null;
    if (enemy.profile === "escort") return { ...intent, ability: ready === "unique" ? "unique" : null, guardId: move.guardId };
    if (!ready || !wantsToAttack(enemy, ctx, rules) || !requestAttack(ctx.tokens, enemy, ctx.now)) {
      releaseAttack(ctx.tokens, enemy.id);
      return intent;
    }
    return { ...intent, attack: true, ability: ready };
  }
  function decideEnemyIntents(enemies, ctx) {
    const intents = /* @__PURE__ */ new Map();
    for (const enemy of [...enemies].sort((a, b) => a.bornAt - b.bornAt)) intents.set(enemy, decideEnemyIntent(enemy, ctx));
    return enemies.map((enemy) => intents.get(enemy));
  }

  // src/game/combat/gaia-enemies.js
  var GAIA_ENEMY_RULES = Object.freeze({
    tracker: Object.freeze({
      profile: "ambusher",
      hp: 2,
      speed: 230,
      warning: 0.4,
      firstAttack: 1.2,
      salvageRole: "interceptor",
      basic: Object.freeze({ cooldown: 2.4, speed: 380, damage: 12 }),
      unique: Object.freeze({ cooldown: 9, markSeconds: 4 }),
      // Las armas solo disparan hacia arriba: tras 3 ataques o 12 s adelanta a la
      // nave por un lado y sale por arriba, donde se le puede derribar.
      leave: Object.freeze({ attacks: 3, seconds: 12, speed: 260, sideOffset: 120, exitY: -100 })
    }),
    sower: Object.freeze({
      profile: "miner",
      hp: 3,
      speed: 150,
      warning: 0.3,
      firstAttack: 1.2,
      salvageRole: "raider",
      basic: Object.freeze({ cooldown: 2.2 }),
      unique: Object.freeze({ cooldown: 10, speed: 300 }),
      mine: Object.freeze({ arm: 0.8, radius: 70, life: 7, damage: 16 }),
      bomb: Object.freeze({ raySpeed: 320, damage: 12 })
    }),
    aegis: Object.freeze({
      profile: "escort",
      hp: 3,
      speed: 200,
      warning: 0,
      firstAttack: 1.5,
      salvageRole: "scout",
      unique: Object.freeze({ cooldown: 8, hits: 3 })
    }),
    alpha: Object.freeze({
      profile: "hunter",
      hp: 12,
      speed: 170,
      warning: 0.5,
      firstAttack: 1.5,
      clearance: 320,
      salvageRole: "interceptor",
      basic: Object.freeze({ cooldown: 1.6, speed: 360, spacing: 28, damage: 12 }),
      unique: Object.freeze({ cooldown: 7, speed: 240, damage: 12 })
    }),
    // Escolta de la furia de Atlas (plan F3c): gira a su alrededor a 1,6·r y
    // dispara hacia abajo cuando tiene turno de ataque.
    atlasEscort: Object.freeze({
      profile: "escort",
      hp: 3,
      speed: 260,
      warning: 0.35,
      firstAttack: 1.4,
      salvageRole: "scout",
      orbit: Object.freeze({ radius: 1.6, speed: 0.9 }),
      basic: Object.freeze({ cooldown: 2.6, speed: 360, damage: 10 })
    })
  });
  function createGaiaEnemy({ kind, x, y, now = 0, angle = 0 }) {
    const rules = GAIA_ENEMY_RULES[kind];
    if (!rules || ![x, y, now].every(Number.isFinite)) throw new RangeError("Invalid Gaia enemy spawn");
    return {
      kind,
      profile: rules.profile,
      hp: rules.hp,
      maxHp: rules.hp,
      bornAt: now,
      cooldowns: { basic: now + rules.firstAttack, unique: rules.unique ? now + rules.unique.cooldown * 0.5 : Infinity },
      telegraph: 0,
      pending: null,
      aim: null,
      heading: void 0,
      guardId: null,
      attacks: 0,
      leaving: false,
      angle
    };
  }
  function moveToward(item, target, maxStep) {
    const dx = target.x - item.x, dy = target.y - item.y, distance2 = Math.hypot(dx, dy);
    if (distance2 <= maxStep || distance2 === 0) {
      item.x = target.x;
      item.y = target.y;
      return;
    }
    item.x += dx / distance2 * maxStep;
    item.y += dy / distance2 * maxStep;
  }
  function aimed(from, to, speed) {
    const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
    return { vx: dx / length * speed, vy: dy / length * speed };
  }
  function unleash(item, ability, ctx, emit) {
    const { gaia } = item, rules = GAIA_ENEMY_RULES[gaia.kind];
    if (gaia.kind === "tracker") {
      if (ability === "unique") emit({ type: "mark", seconds: rules.unique.markSeconds });
      else {
        const from = { x: item.x, y: item.y - 30 };
        emit({ type: "shot", ...from, ...aimed(from, gaia.aim, rules.basic.speed), damage: rules.basic.damage, sprite: "orb" });
      }
    } else if (gaia.kind === "sower") {
      if (ability === "basic") emit({ type: "mine", x: item.x, y: item.y + 20 });
      else emit({ type: "cross-bomb", x: item.x, y: item.y, vx: (item.x < ctx.bounds.w / 2 ? -1 : 1) * rules.unique.speed });
    } else if (gaia.kind === "atlasEscort") {
      const { speed, damage } = rules.basic;
      emit({ type: "shot", x: item.x, y: item.y + 24, vx: 0, vy: speed, damage, sprite: "orb" });
    } else if (gaia.kind === "alpha") {
      if (ability === "basic") {
        const { spacing, speed, damage } = rules.basic;
        for (let k = 0; k < 4; k++) emit({ type: "shot", x: item.x + (k - 1.5) * spacing, y: item.y + 40, vx: 0, vy: speed, damage, sprite: "missile" });
      } else {
        const { speed, damage } = rules.unique;
        for (let k = 0; k < 8; k++) {
          const angle = k * Math.PI / 4;
          emit({ type: "shot", x: item.x, y: item.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage, sprite: "orb" });
        }
      }
    }
  }
  function advanceMine(mine, dt, player) {
    const rules = GAIA_ENEMY_RULES.sower.mine;
    mine.age += dt;
    mine.armed = mine.age >= rules.arm;
    if (mine.armed && Math.hypot(player.x - mine.x, player.y - mine.y) < rules.radius) return "explode";
    return mine.age >= rules.life ? "expire" : null;
  }
  function advanceCrossBomb(bomb, dt, bounds) {
    bomb.x += bomb.vx * dt;
    if (bomb.x > 0 && bomb.x < bounds.w) return null;
    const { raySpeed: speed, damage } = GAIA_ENEMY_RULES.sower.bomb, x = bomb.x <= 0 ? 0 : bounds.w, inward = x === 0 ? 1 : -1;
    return [
      { x, y: bomb.y, vx: inward * speed, vy: 0, damage },
      { x, y: bomb.y, vx: 0, vy: -speed, damage },
      { x, y: bomb.y, vx: 0, vy: speed, damage }
    ];
  }
  function advanceGaiaEnemy(item, dt, ctx, emit) {
    if (!(dt > 0)) return;
    const { gaia } = item, rules = GAIA_ENEMY_RULES[gaia.kind];
    if (gaia.pending) {
      gaia.telegraph = Math.min(1, gaia.telegraph + dt / Math.max(rules.warning, 1e-6));
      if (gaia.telegraph >= 1) {
        const ability = gaia.pending;
        unleash(item, ability, ctx, emit);
        if (ability === "basic") gaia.attacks++;
        gaia.cooldowns[ability] = ctx.now + rules[ability].cooldown;
        gaia.pending = null;
        gaia.telegraph = 0;
        gaia.aim = null;
        releaseAttack(ctx.tokens, item.id);
      }
      return;
    }
    if (rules.orbit) {
      if (ctx.anchor) {
        gaia.angle += rules.orbit.speed * dt;
        const radius = ctx.anchor.r * rules.orbit.radius;
        moveToward(item, { x: ctx.anchor.x + Math.cos(gaia.angle) * radius, y: ctx.anchor.y + Math.sin(gaia.angle) * radius }, rules.speed * dt);
      }
      if (gaia.cooldowns.basic <= ctx.now && requestAttack(ctx.tokens, { id: item.id, bornAt: gaia.bornAt }, ctx.now)) {
        gaia.pending = "basic";
        gaia.aim = { x: item.x, y: ctx.bounds.h };
        gaia.telegraph = 0;
      }
      return;
    }
    const { leave } = rules;
    if (leave && !gaia.leaving && (gaia.attacks >= leave.attacks || ctx.now - gaia.bornAt >= leave.seconds)) {
      gaia.leaving = true;
      releaseAttack(ctx.tokens, item.id);
    }
    if (gaia.leaving) {
      const side = item.x < ctx.player.x ? -1 : 1, { w } = ctx.bounds;
      moveToward(item, { x: Math.max(40, Math.min(w - 40, ctx.player.x + side * leave.sideOffset)), y: leave.exitY }, leave.speed * dt);
      return;
    }
    const view = {
      id: item.id,
      x: item.x,
      y: item.y,
      hp: item.hp,
      maxHp: item.maxHp,
      profile: gaia.profile,
      cooldowns: gaia.cooldowns,
      bornAt: gaia.bornAt,
      ...gaia.heading !== void 0 ? { heading: gaia.heading } : {}
    };
    const intent = decideEnemyIntent(view, ctx);
    if (intent.heading !== void 0) gaia.heading = intent.heading;
    const targetY = rules.clearance ? Math.min(intent.targetY, ctx.player.y - rules.clearance) : intent.targetY;
    moveToward(item, { x: intent.targetX, y: targetY }, rules.speed * dt);
    if (gaia.profile === "escort") {
      gaia.guardId = intent.guardId;
      if (intent.ability === "unique" && intent.guardId) {
        emit({ type: "shield", targetId: intent.guardId, hits: rules.unique.hits });
        gaia.cooldowns.unique = ctx.now + rules.unique.cooldown;
      }
      return;
    }
    if (intent.attack) {
      gaia.pending = intent.ability;
      gaia.aim = { x: ctx.player.x, y: ctx.player.y };
      gaia.telegraph = 0;
    }
  }

  // src/game/progression/sector-save.js
  var SECTOR_SAVE_KEY = "neonCronium.sectors.v1";
  var SECTOR_COUNT = 10;
  var STAGE_COUNT2 = 10;
  var BEACON_STAGE = 6;
  var REVIVE_HULL = 25;
  var isInt = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;
  var copy2 = (save) => JSON.parse(JSON.stringify(save));
  var sectorRecord = (save, sector) => save.sectors[sector] || { completed: false, stars: 0, beacon: false };
  var createSectorSave = () => ({ version: 1, unlocked: 1, sectors: {}, run: null });
  function normalizeSectorSave(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.version !== 1 || !isInt(raw.unlocked, 1, SECTOR_COUNT)) return null;
    if (!raw.sectors || typeof raw.sectors !== "object" || Array.isArray(raw.sectors)) return null;
    const sectors = {};
    for (const [key, record] of Object.entries(raw.sectors)) {
      const sector = Number(key);
      if (!isInt(sector, 1, SECTOR_COUNT) || !record || typeof record.completed !== "boolean" || !isInt(record.stars, 0, 3) || typeof record.beacon !== "boolean") return null;
      sectors[sector] = { completed: record.completed, stars: record.stars, beacon: record.beacon };
    }
    let run = null;
    if (raw.run !== null) {
      const r = raw.run;
      if (!r || typeof r !== "object" || !isInt(r.sector, 1, raw.unlocked) || !isInt(r.stageNumber, 1, STAGE_COUNT2) || !Number.isFinite(r.stageHull) || r.stageHull <= 0 || r.stageHull > 100 || typeof r.reviveUsed !== "boolean") return null;
      run = { sector: r.sector, stageNumber: r.stageNumber, stageHull: r.stageHull, reviveUsed: r.reviveUsed };
    }
    return { version: 1, unlocked: raw.unlocked, sectors, run };
  }
  function startSectorRun(save, sector) {
    if (!isInt(sector, 1, save.unlocked)) throw new RangeError("sector is locked");
    const next = copy2(save);
    next.run = { sector, stageNumber: 1, stageHull: 100, reviveUsed: false };
    return next;
  }
  function enterStage(save, stageNumber, hull) {
    if (!save.run) throw new Error("no sector run in progress");
    if (!isInt(stageNumber, 1, STAGE_COUNT2) || !Number.isFinite(hull)) throw new RangeError("invalid stage or hull");
    const next = copy2(save);
    next.run.stageNumber = stageNumber;
    next.run.stageHull = Math.min(100, Math.max(1, hull));
    return next;
  }
  function buyBeacon(save, sector) {
    if (!isInt(sector, 1, SECTOR_COUNT)) throw new RangeError("invalid sector");
    const next = copy2(save);
    next.sectors[sector] = { ...sectorRecord(save, sector), beacon: true };
    return next;
  }
  function useRevive(save) {
    if (!save.run || save.run.reviveUsed) return null;
    const next = copy2(save);
    next.run.reviveUsed = true;
    return { save: next, hull: REVIVE_HULL };
  }
  function dieInSector(save) {
    if (!save.run) return copy2(save);
    const next = copy2(save);
    next.run = {
      sector: save.run.sector,
      stageNumber: sectorRecord(save, save.run.sector).beacon ? BEACON_STAGE : 1,
      stageHull: 100,
      reviveUsed: false
    };
    return next;
  }
  function continuePoint(save) {
    return save.run ? { sector: save.run.sector, stageNumber: save.run.stageNumber, hull: save.run.stageHull } : null;
  }
  function completeSector(save, sector, stars) {
    if (!isInt(sector, 1, SECTOR_COUNT) || !Number.isFinite(stars)) throw new RangeError("invalid sector or stars");
    const next = copy2(save), previous = sectorRecord(save, sector);
    next.sectors[sector] = { completed: true, stars: Math.max(previous.stars, Math.trunc(Math.min(3, Math.max(0, stars)))), beacon: false };
    next.unlocked = Math.min(SECTOR_COUNT, Math.max(save.unlocked, sector + 1));
    next.run = null;
    return next;
  }
  return __toCommonJS(legacy_content_entry_exports);
})();
