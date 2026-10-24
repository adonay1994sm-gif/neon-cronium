  function loadSettings() {
    const saved = storage.getJSON(KEYS.settings, {});
    const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    const finite = (value, fallback, minimum, maximum) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
    };
    const savedQuality = ["low", "normal", "high"].includes(source.effectsQuality)
      ? source.effectsQuality
      : source.effects === false ? "low" : DEFAULT_SETTINGS.effectsQuality;
    // Propietario (25/10): el 100 antiguo pasa una vez a 135; lo elegido después se respeta.
    const savedSensitivity = Math.round(finite(source.sensitivity, DEFAULT_SETTINGS.sensitivity, 60, 150) / 5) * 5;
    return {
      music: Math.round(finite(source.music, DEFAULT_SETTINGS.music, 0, 100)),
      fx: Math.round(finite(source.fx, DEFAULT_SETTINGS.fx, 0, 100)),
      sensitivity: source.sensitivityMigrated !== true && savedSensitivity === 100 ? DEFAULT_SETTINGS.sensitivity : savedSensitivity,
      sensitivityMigrated: true,
      autoFire: source.autoFire === true,
      vibration: typeof source.vibration === "boolean" ? source.vibration : DEFAULT_SETTINGS.vibration,
      reduceEffects: typeof source.reduceEffects === "boolean" ? source.reduceEffects
        : Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
      leftHanded: source.leftHanded === true,
      effectsQuality: savedQuality,
      difficulty: ["facil", "normal", "dificil", "hardcore"].includes(source.difficulty) ? source.difficulty : DEFAULT_SETTINGS.difficulty,
      flightTutorial: source.flightTutorial&&typeof source.flightTutorial==='object' ? source.flightTutorial : null,
      effects: savedQuality !== "low"
    };
  }

  function saveSettings() {
    return storage.setJSON(KEYS.settings, settings);
  }

  function getUnlocked() {
    return Math.trunc(Math.max(1, Math.min(LEVELS.length, storage.getNumber(KEYS.unlocked, 1))));
  }

  function getStars() {
    const saved = storage.getJSON(KEYS.stars, {});
    const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    const normalized = {};
    for (let levelIndex = 1; levelIndex <= LEVELS.length; levelIndex++) {
      const value = Number(source[levelIndex]);
      if (Number.isFinite(value) && value > 0) normalized[levelIndex] = Math.trunc(Math.min(3, value));
    }
    return normalized;
  }

  function getLevelBest() {
    const saved = storage.getJSON(KEYS.levelBest, {});
    const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    const normalized = {};
    for (let levelIndex = 1; levelIndex <= LEVELS.length; levelIndex++) {
      const value = Number(source[levelIndex]);
      if (Number.isFinite(value) && value > 0) {
        normalized[levelIndex] = Math.trunc(Math.min(Number.MAX_SAFE_INTEGER, value));
      }
    }
    return normalized;
  }

  function bestScore() {
    return Math.trunc(Math.max(0, storage.getNumber(KEYS.best, 0)));
  }

  function totalStars() {
    return Object.values(getStars()).reduce((a, b) => a + (+b || 0), 0);
  }

  function level() {
    return LEVELS[currentLevel];
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function isThreat(item) {
    return item && ["meteor", "debris", "satellite", "scout"].includes(item.type);
  }

  const overlayReturnFocus = new WeakMap();
  function overlay(el) {
    const panels = [ui.menu, ui.briefing, ui.levelSelect, ui.settingsPanel, ui.instructions, ui.paused, ui.complete, ui.over, ui.beaconOffer, ui.shipHangar, ui.flightDock].filter(Boolean);
    const previous = panels.find(node => node.classList.contains("show"));
    const opener = document.activeElement;
    const restore = previous && overlayReturnFocus.get(previous);
    if (el && previous !== el && previous?.contains(opener)) overlayReturnFocus.set(el, opener);
    panels.forEach(node => {
      node.classList.remove("show");
      node.inert = node !== el;
      node.setAttribute("aria-hidden", String(node !== el));
    });
    if (!el) { canvas.focus({preventScroll:true}); return; }
    el.classList.add("show");
    // The same visible panel owns focus and pointer input. No extra frame loop.
    const available = node => node && !node.disabled && !node.closest('[hidden],.hidden') &&
      node.ownerDocument.defaultView.getComputedStyle(node).display !== "none";
    const target = restore && el.contains(restore) && available(restore) ? restore
      : [...el.querySelectorAll('.primary:not(:disabled),button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].find(available);
    target?.focus({preventScroll:true});
  }

  addEventListener("keydown", event => {
    const modal = document.querySelector('.overlay.show[role="dialog"]');
    if (!modal || modal === ui.flightDock || modal === ui.shipHangar) return;
    if (event.key === "Escape") {
      const close = {settingsPanel:"settingsBack",briefing:"briefingBack",levelSelect:"levelBack",instructions:"back",paused:"resume",complete:"completeHome",over:"home",beaconOffer:"beaconSkip"}[modal.id];
      if (!close) return;
      event.preventDefault();event.stopPropagation();
      $(close)?.click();
    } else if (event.key === "Tab") {
      const controls = [...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(node => node.getClientRects().length && !node.closest('[hidden],.hidden'));
      const first = controls[0], lastControl = controls.at(-1);
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault();lastControl.focus();
      } else if (!event.shiftKey && (document.activeElement === lastControl || !modal.contains(document.activeElement))) {
        event.preventDefault();first.focus();
      }
    }
  }, true);

  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => ui.toast.classList.remove("show"), 1650);
  }

  addEventListener("game-toast", (event) => toast(event.detail));

  // DOM geometry is sampled on layout changes, never from the drawing loop.
  // All returned coordinates use the same logical Canvas units as collisions.
  function refreshClassicFlightBounds(reset = false) {
    const canvasRect = canvas.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) return classicFlightBounds;
    const verticalScale = H / canvasRect.height;
    const visibleRect = (node) => {
      if (!node || node.classList.contains("hidden")) return null;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return null;
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? rect : null;
    };
    // Reserve only the actual interface footprint, including the fixed-height
    // comms slot. Side panels outside the portrait Canvas do not obstruct it.
    const crossesCanvas = rect => rect && rect.right > canvasRect.left && rect.left < canvasRect.right;
    let hudBottomCss = canvasRect.top;
    for (const node of [ui.hud, ui.flightRoute, ui.flightObjective, ui.atlasEncounter,
      ui.storyTransmission?.classList.contains("show") ? ui.storyTransmission : null]) {
      const rect = visibleRect(node);
      if (crossesCanvas(rect)) hudBottomCss = Math.max(hudBottomCss, rect.bottom);
    }
    let controlsTopCss = canvasRect.bottom - 104;
    for(const node of [ui.fire,ui.flightWeapon,ui.classicMissile]) {
      const rect=visibleRect(node);
      if(crossesCanvas(rect))controlsTopCss=Math.min(controlsTopCss,rect.top);
    }
    const powersRect = visibleRect(ui.powerHud);
    if (crossesCanvas(powersRect)) {
      // Existing N-7 uses an upper power row; the unified classic moves it
      // above the fire control. Never mistake an upper row for a bottom edge.
      if (powersRect.top >= canvasRect.top + canvasRect.height / 2) {
        controlsTopCss = Math.min(controlsTopCss, powersRect.top);
      } else hudBottomCss = Math.max(hudBottomCss, powersRect.bottom);
    }
    const hudBottom = clamp((hudBottomCss - canvasRect.top) * verticalScale, 0, H);
    const controlsTop = clamp((controlsTopCss - canvasRect.top) * verticalScale, hudBottom, H);
    const base = NeonCampaign.calculateFlightBounds({ width: W, height: H, hudBottom, controlsTop, shipScale: SHIP_VISUAL.classicScale });
    let minY = base.minY, maxY = base.maxY, yFits = base.yFits;
    if (atlasBoss) {
      const bossBottom = atlasBoss.targetY + (atlasBoss.visualSize || 350) * .52;
      minY = Math.max(minY, bossBottom + 158 * SHIP_VISUAL.classicScale);
      if (minY > maxY) {
        // Keep the ship within the measured UI envelope even if the boss must
        // be resized by its presentation owner; report that the arena is tight.
        const center = clamp(minY / 2 + maxY / 2, base.minY, base.maxY);
        minY = center; maxY = center; yFits = false;
      }
    }
    classicFlightBounds = Object.freeze({ ...base, minY, maxY, yFits, fits: base.xFits && yFits,
      presentationTop: hudBottom, presentationBottom: controlsTop });
    classicFlightAnchorY = maxY;
    player.x = clamp(player.x, classicFlightBounds.minX, classicFlightBounds.maxX);
    player.target = clamp(player.target, classicFlightBounds.minX, classicFlightBounds.maxX);
    if (reset || !Number.isFinite(player.y)) player.y = classicFlightAnchorY;
    else player.y = clamp(player.y, minY, maxY);
    if (reset || !Number.isFinite(player.targetY)) player.targetY = player.y;
    else player.targetY = clamp(player.targetY, minY, maxY);
    return classicFlightBounds;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const previousBounds = classicFlightBounds;
    const fractionY = previousBounds && previousBounds.maxY > previousBounds.minY
      ? clamp((player.y - previousBounds.minY) / (previousBounds.maxY - previousBounds.minY), 0, 1) : 1;
    const targetFractionY = previousBounds && previousBounds.maxY > previousBounds.minY && Number.isFinite(player.targetY)
      ? clamp((player.targetY - previousBounds.minY) / (previousBounds.maxY - previousBounds.minY), 0, 1) : fractionY;
    W = 720;
    H = Math.max(1180, Math.round(W * rect.height / rect.width));
    // Reasignar el tamaño borra el lienzo aunque sea el mismo valor; Safari
    // lo muestra como un parpadeo al rotar o al mostrar la barra. Solo se
    // asigna si de verdad cambia.
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    refreshClassicFlightBounds(!previousBounds);
    // Atlas derives its arena from a stable lower anchor, not from the
    // player's current vertical maneuver; refresh never calls back into it.
    positionAtlasArena();
    const next = refreshClassicFlightBounds();
    if (next) {
      player.y = next.minY + fractionY * (next.maxY - next.minY);
      player.targetY = next.minY + targetFractionY * (next.maxY - next.minY);
    }
    for (const star of stars) {
      star.x = clamp(star.x, 0, W);
      star.y = clamp(star.y, 0, H);
    }
  }

  addEventListener("resize", resizeCanvas, { passive: true });

  // The score shares the legacy AudioContext. The existing frame owner calls
  // updateScore; no score timer, RAF or permanently running drone is created.
  let voyageScore = null;
  let chapterScore = null;
  let masterBus = null;
  let combatSfx = null;
  let voyageScoreContext = "transit";
  let scoreSuspended = false;
  const activeToneVoices = new Set();

  function ensureAudio() {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // Bus maestro con limitador: música, efectos y tonos pasan por aquí y
      // no saturan cuando coinciden (revisión de audio 22/10, paso 1).
      masterBus = audioCtx.createGain();
      // El compresor añade ~+3,3 dB de compensación automática: el bus baja lo
      // mismo para que la mezcla suene como antes (revisión de audio A1).
      masterBus.gain.value = 0.68;
      // Si el limitador falla, el bus va directo a la salida: nunca mudo (A6).
      try {
        const limiter = audioCtx.createDynamicsCompressor();
        limiter.threshold.value = -6; limiter.knee.value = 0; limiter.ratio.value = 12;
        limiter.attack.value = .003; limiter.release.value = .12;
        masterBus.connect(limiter).connect(audioCtx.destination);
      } catch {
        masterBus.connect(audioCtx.destination);
      }
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(masterBus);
    } catch {
      return null;
    }
    return audioCtx;
  }

  function startMusic() {
    const ac = ensureAudio();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume().catch(() => {});
    if (!voyageScore && typeof NeonCampaign !== "undefined" && typeof NeonCampaign.createVoyageScore === "function") {
      voyageScore = NeonCampaign.createVoyageScore({context: ac, output: musicGain});
      voyageScore.setContext(voyageScoreContext);
    }
    if(!chapterScore&&ac.createMediaElementSource) {
      try {chapterScore=NeonCampaign.createChapterScore({context:ac,output:musicGain});} catch {chapterScore=null;}
    }
    if(!combatSfx&&typeof NeonCampaign.createCombatSfx==="function") {
      combatSfx=NeonCampaign.createCombatSfx({context:ac,output:masterBus||ac.destination});
      combatSfx?.load();
    }
    else if(combatSfx?.snapshot().failed)combatSfx.load();
    scoreSuspended = false;
    updateAudioVolumes();
  }

  function signalScoreContext(context) {
    if (!["transit", "atlas", "station", "arrival"].includes(context)) return false;
    voyageScoreContext = context;
    return voyageScore?.setContext(context) ?? true;
  }

  function updateScore(dt, paused = false) {
    combatSfx?.setPaused(paused||scoreSuspended||state!=="playing");
    if (!voyageScore) return;
    const rendered=chapterScore?.update({active:Boolean(classicChapterStory),
      elapsed:classicFlightView?.elapsed||0,paused:paused||scoreSuspended,enabled:settings.music>0});
    voyageScore.setPaused(paused || scoreSuspended || Boolean(rendered));
    voyageScore.advance(dt);
  }

  function stopToneVoices() {
    for (const voice of [...activeToneVoices]) {
      try { voice.oscillator.stop(audioCtx.currentTime); } catch { /* already ended */ }
      voice.release();
    }
  }

  async function suspendAudio() {
    scoreSuspended = true;
    chapterScore?.suspend();
    combatSfx?.setPaused(true);
    voyageScore?.setPaused(true);
    stopToneVoices();
    if (audioCtx?.state === "running") await audioCtx.suspend().catch(() => {});
  }

  async function resumeAudio() {
    if (audioCtx?.state === "suspended" && (settings.music > 0 || settings.fx > 0)) {
      await audioCtx.resume().catch(() => {});
    }
    scoreSuspended = audioCtx?.state !== "running";
    updateAudioVolumes();
  }

  function updateAudioVolumes() {
    voyageScore?.setEnabled(settings.music > 0);
    combatSfx?.setEnabled(settings.fx>0);
    combatSfx?.setVolume(settings.fx/100);
    combatSfx?.setPaused(scoreSuspended||state!=="playing");
    if (settings.fx <= 0) stopToneVoices();
    if(settings.music<=0)chapterScore?.suspend();
    if (musicGain && audioCtx) {
      const value = (settings.music / 100) * 0.26;
      musicGain.gain.setTargetAtTime(value, audioCtx.currentTime, 0.08);
    }
  }

  function combatSound(cue,x=player.x,eventId=null) {
    if(state!=="playing"||scoreSuspended||settings.fx<=0)return;
    if(combatSfx?.snapshot().ready) {
      // A rejected voice means muted/paused/throttled, never a fallback beep.
      combatSfx.play(cue,{pan:clamp(x/W*2-1,-.75,.75),eventId});return;
    }
    const fallback={phaser:[670,.065,"triangle",.04],"missile-launch":[145,.18,"triangle",.045],
      "enemy-phaser":[280,.08,"triangle",.04],"enemy-heavy":[120,.16,"sawtooth",.045],
      "impact-metal":[620,.05,"triangle",.035],"impact-plasma":[180,.04,"square",.025],
      "hull-hit":[95,.22,"sawtooth",.08],"enemy-break":[920,.05,"triangle",.04],
      "atlas-charge":[135,.28,"triangle",.065],"atlas-collapse":[640,.28,"sine",.06]};
    if(fallback[cue])tone(...fallback[cue]);
  }

  function tone(frequency = 440, duration = 0.06, type = "sine", base = 0.06) {
    if (settings.fx <= 0) { stopToneVoices(); return; }
    const ac = ensureAudio();
    if (!ac || ac.state !== "running" || scoreSuspended) return;
    for (const voice of [...activeToneVoices]) if (voice.end <= ac.currentTime) voice.release();
    if (activeToneVoices.size >= 16) return;
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const length = Math.max(.015, Math.min(2, Number(duration) || .06));
    // Entra desde casi silencio en 5 ms para que no haga clic (paso 4).
    const peak = Math.max(.0001, Math.min(.2, base) * (settings.fx / 100));
    gain.gain.value = 0.0001;
    gain.gain.setValueAtTime(0.0001, ac.currentTime); // punto de partida de la rampa en WebKit (A4)
    gain.gain.linearRampToValueAtTime(peak, ac.currentTime + .005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + Math.max(.01, length));
    oscillator.connect(gain).connect(masterBus || ac.destination);
    const voice = {oscillator, end: ac.currentTime + length, release() {
      if (!activeToneVoices.delete(voice)) return;
      oscillator.disconnect(); gain.disconnect();
    }};
    activeToneVoices.add(voice);
    oscillator.onended = voice.release;
    oscillator.start();
    oscillator.stop(voice.end);
  }

  function vibrate(pattern) {
    if (settings.vibration) navigator.vibrate?.(pattern);
  }

  function syncSettingsUI() {
    document.body.classList.toggle("reduced-effects", settings.reduceEffects);
    document.body.classList.toggle("left-handed", settings.leftHanded);
    ui.musicVolume.value = settings.music;
    ui.fxVolume.value = settings.fx;
    ui.sensitivity.value = settings.sensitivity;
    ui.vibration.checked = settings.vibration;
    ui.effectsQuality.value = settings.effectsQuality;
    if (ui.difficulty) ui.difficulty.value = settings.difficulty;
    ui.reduceEffects.checked = settings.reduceEffects;
    ui.leftHanded.checked = settings.leftHanded;
    ui.autoFire.checked = settings.autoFire;
    ui.musicValue.textContent = `${settings.music}%`;
    ui.fxValue.textContent = `${settings.fx}%`;
    ui.sensitivityValue.textContent = `${settings.sensitivity}%`;
    paintRanges();
  }

  // Las barras pintadas leen la parte recorrida de --fill (0…1) en su fila.
  function paintRanges() {
    for (const range of [ui.musicVolume, ui.fxVolume, ui.sensitivity]) {
      range.parentElement.style.setProperty("--fill", Math.max(.001, (range.value - range.min) / (range.max - range.min)));
    }
  }

  function openSettings(from = "menu") {
    settingsReturn = from;
    syncSettingsUI();
    overlay(ui.settingsPanel);
    startMusic();
  }

  function closeSettings() {
    saveSettings();
    updateAudioVolumes();
    overlay(settingsReturn === "paused" ? ui.paused : ui.menu);
  }
