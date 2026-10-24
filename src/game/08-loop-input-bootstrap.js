  function render(t) {
    syncShipPresentation();
    drawShipHangar(t);
    drawClassicDock(t);
    ctx.save();
    if (!settings.reduceEffects) {
      ctx.translate(cameraKickX, -cameraKickY);
      if (shake) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    background(t);
    if (typeof drawAtlasFuryScene === "function") drawAtlasFuryScene();
    drawWarp();
    drawTractorCable();
    for (const gate of gates) drawGate(gate);
    drawCometCorridor(t);
    for (const item of items) {
      if (item.guardianProjectile) drawAtlasProjectile(item);
      else if (item.type === "salvage") drawSalvagePickup(item);
      else if (item.type === "flightModule") drawFlightModule(item);
      else if (item.type === "energy") drawEnergy(item);
      else if (item.type === "meteor" || item.type === "scout") { drawMeteor(item); if (typeof drawGaiaShield === "function") drawGaiaShield(item); }
      else if (item.type === "debris") drawDebris(item);
      else if (item.type === "satellite") drawSatellite(item);
      else drawPower(item);
    }
    if (typeof drawMeteorWarnings === "function") drawMeteorWarnings();
    if (typeof drawAtlasBeam === "function") drawAtlasBeam();
    drawGuardianAtlas();
    if (typeof drawCh03Satellite === "function") drawCh03Satellite();
    drawPlayer(t);
    drawShots();
    drawClassicProjectiles();
    drawExplosions();
    drawImpactEffects();
    drawRings();
    drawParts();
    drawCombo();
    drawClassicChapterOpening();
    if (powers.slow > 0) {
      ctx.fillStyle = "rgba(75,125,255,.055)";
      ctx.fillRect(0, 0, W, H);
    }
    if (flash > 0 && !settings.reduceEffects) {
      ctx.fillStyle = `rgba(255,40,80,${Math.min(0.28, flash)})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // Synchronous, idempotent legacy RAF stop; default campaign stays active.
  let legacyRunning = true;
  let legacyFrameId = null;
  function stopLegacyLoop() {
    if (!legacyRunning) return true;
    legacyRunning = false;
    const pending = legacyFrameId;
    legacyFrameId = null;
    if (pending !== null) cancelAnimationFrame(pending);
    return true; // RAF already cancelled; adapter must not cancel twice.
  }
  // Explicit rollback hook for experimental Engine V1 handoff only.
  function restartLegacyLoop() {
    if (legacyRunning) return false;
    legacyRunning = true;
    last = performance.now();
    legacyFrameId = requestAnimationFrame(frame);
    return true;
  }
  // Read-only bridge reference; lifecycle changes require explicit method calls.
  // src/game is concatenated into a classic IIFE, so ES module exports are unavailable.
  Object.defineProperty(window, 'NeonLegacyLoopBridge', {
    value: Object.freeze({stopLegacyLoop, restartLegacyLoop}),
    writable: false,
    configurable: false
  });
  function frame(now) {
    if (!legacyRunning) return;
    legacyFrameId = null;
    // An input handler can reset last after this rendering opportunity began.
    // A queued RAF timestamp must never rewind the simulation or stop its loop.
    const dt = Math.max(0, Math.min(0.034, (now - last) / 1000));
    last = now;
    // Holding the action thumb uses the existing simulation owner. Weapon
    // cooldown and the rechargeable battery still decide whether a shot fires.
    if (state !== "playing") resetGameInput();
    else if (fireInput && !ui.fire.disabled) fireManualShot();
    update(dt);
    if (!legacyRunning) return;
    const servicing = ui.flightDock?.classList.contains("show");
    signalScoreContext(servicing ? "station" : state === "complete" ? "arrival"
      : atlasBoss && !atlasBoss.resolved ? "atlas" : "transit");
    updateScore(dt, document.hidden || (state === "paused" && !servicing)
      || state === "gameover" || state === "destroying");
    render(now);
    if (legacyRunning) legacyFrameId = requestAnimationFrame(frame);
  }

  function pointerX(event, point = event.touches?.[0] || event) {
    const rect = canvas.getBoundingClientRect();
    return (point.clientX - rect.left) * W / rect.width;
  }

  function pointerY(event, point = event.touches?.[0] || event) {
    const rect = canvas.getBoundingClientRect();
    return (point.clientY - rect.top) * H / rect.height;
  }

  let fireInput = null;
  let suppressNextFireClick = false;
  let missileInput = null;
  let suppressNextMissileClick = false;
  let pilotGuideOrigin = null;

  function hidePilotGuide() {
    pilotGuideOrigin=null;
    ui.flightPilotStick?.classList.add("hidden");
    if(ui.flightPilotKnob)ui.flightPilotKnob.style.transform="translate(0px, 0px)";
  }

  function beginPilotGuide(point,id) {
    if(!ui.flightPilotStick||!point||!Number.isFinite(point.clientX)||!Number.isFinite(point.clientY))return;
    const rect=canvas.parentElement.getBoundingClientRect();
    pilotGuideOrigin={id,x:point.clientX,y:point.clientY};
    ui.flightPilotStick.style.left=`${point.clientX-rect.left}px`;
    ui.flightPilotStick.style.top=`${point.clientY-rect.top}px`;
    ui.flightPilotStick.classList.remove("hidden");
    ui.flightPilotHint?.classList.add("used");
  }

  function movePilotGuide(point,id) {
    if(!pilotGuideOrigin||pilotGuideOrigin.id!==id||!ui.flightPilotKnob||!point)return;
    const dx=point.clientX-pilotGuideOrigin.x,dy=point.clientY-pilotGuideOrigin.y;
    const distance=Math.hypot(dx,dy),limit=24,scale=distance>limit?limit/distance:1;
    ui.flightPilotKnob.style.transform=`translate(${(dx*scale).toFixed(1)}px, ${(dy*scale).toFixed(1)}px)`;
  }

  function releaseInputCapture(element, id) {
    if (typeof id !== "number") return;
    try { element.releasePointerCapture?.(id); } catch { /* Capture may already have ended. */ }
  }

  // Lifecycle callers use this as well as blur/cancellation. An action thumb
  // must never survive a pause, restart or return to the menu.
  function resetGameInput() {
    const pilotId = classicFlightInput.active ? classicFlightInput.id : null;
    const previousFire = fireInput;
    const previousMissile = missileInput;
    fireInput = null;
    missileInput = null;
    NeonCampaign.endFlightInput(classicFlightInput);
    hidePilotGuide();
    releaseInputCapture(canvas, pilotId);
    if (previousFire?.kind === "pointer") releaseInputCapture(ui.fire, previousFire.id);
    if (previousMissile?.kind === "pointer") releaseInputCapture(ui.classicMissile, previousMissile.id);
  }

  function moveClassicFlight(event) {
    if(classicChapterControlsLocked())return;
    if (event.type.startsWith("touch") && window.PointerEvent) return;
    const press = event.type === "pointerdown" || event.type === "touchstart";
    let point = event;
    let id = event.pointerId ?? "mouse";
    if (event.touches) {
      const candidates = press ? event.changedTouches : event.touches;
      point = press || !classicFlightInput.active ? candidates?.[0]
        : Array.from(candidates || []).find(touch => touch.identifier === classicFlightInput.id);
      if (!point) return;
      id = point.identifier;
    }
    const x = pointerX(event, point), y = pointerY(event, point);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const bounds = classicFlightBounds || refreshClassicFlightBounds();
    if (!bounds) return;
    if (press) {
      // A press only anchors relative input, regardless of where the finger
      // touches. Captured movement remains continuous outside the canvas.
      const started = NeonCampaign.beginFlightInput(classicFlightInput, { id, x, y });
      if(started)beginPilotGuide(point,id);
      if (started && event.pointerId !== undefined) {
        try { canvas.setPointerCapture?.(event.pointerId); } catch { /* Synthetic events cannot capture. */ }
      }
      return;
    }
    const factor = settings.sensitivity / 100;
    const mouseHover = !event.touches && (!event.pointerType || event.pointerType === "mouse") &&
      !event.buttons && !classicFlightInput.active;
    if (mouseHover) {
      // Desktop hover retains the original accessible horizontal alternative;
      // vertical control requires dragging or the up/down keys.
      player.target = clamp(player.x + (x - player.x) * factor, bounds.minX, bounds.maxX);
      return;
    }
    const next = NeonCampaign.moveFlightInput(classicFlightInput, {
      id, x, y, targetX: player.target, targetY: player.targetY,
      sensitivity: factor, bounds
    });
    player.target = next.targetX;
    player.targetY = next.targetY;
    if(next.moved)movePilotGuide(point,id);
  }

  function move(event) {
    if (state !== "playing") return;
    if (event.type.startsWith("touch") && window.PointerEvent) return;
    event.preventDefault();
    moveClassicFlight(event);
  }

  canvas.addEventListener("pointerdown", move, { passive: false });
  canvas.addEventListener("pointermove", move, { passive: false });
  canvas.addEventListener("touchstart", move, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  function finishFlightInput(event) {
    let ids;
    if (event.type.startsWith("touch")) {
      if (window.PointerEvent) return;
      ids = Array.from(event.changedTouches || [], touch => touch.identifier);
    } else ids = [event.pointerId ?? "mouse"];
    for (const id of ids) {
      if(NeonCampaign.endFlightInput(classicFlightInput, id))hidePilotGuide();
    }
  }
  for (const event of ["pointerup", "pointercancel", "lostpointercapture", "touchend", "touchcancel"]) {
    canvas.addEventListener(event, finishFlightInput);
    // Pointer capture is not available in every embedded/Safari fallback. A
    // release over a control must still end only its own pilot contact.
    if (event !== "lostpointercapture") addEventListener(event, finishFlightInput, {capture: true});
  }
  addEventListener("blur", resetGameInput);

  function startFireInput(event) {
    const touchFallback = event.type === "touchstart";
    if (touchFallback && window.PointerEvent) return;
    if (state !== "playing" || ui.fire.disabled) return;
    if (!touchFallback && event.pointerType === "mouse" && event.button !== 0) return;
    const id = touchFallback ? event.changedTouches?.[0]?.identifier : event.pointerId ?? "mouse";
    if (id === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    if (fireInput) return;
    fireInput = {id, kind: touchFallback ? "touch" : "pointer"};
    suppressNextFireClick = true;
    if (!touchFallback && event.pointerId !== undefined) {
      try { ui.fire.setPointerCapture?.(event.pointerId); } catch { /* Synthetic events cannot capture. */ }
    }
    fireManualShot();
  }

  function finishFireInput(event) {
    if (!fireInput) return;
    const touchFallback = event.type.startsWith("touch");
    if (touchFallback && window.PointerEvent) return;
    const ended = touchFallback
      ? Array.from(event.changedTouches || []).some(touch => touch.identifier === fireInput.id)
      : (event.pointerId ?? "mouse") === fireInput.id;
    if (ended) fireInput = null;
  }

  ui.fire.addEventListener("pointerdown", startFireInput, {passive: false});
  ui.fire.addEventListener("touchstart", startFireInput, {passive: false});
  for (const event of ["pointerup", "pointercancel", "lostpointercapture", "touchend", "touchcancel"]) {
    ui.fire.addEventListener(event, finishFireInput);
    if (event !== "lostpointercapture") addEventListener(event, finishFireInput, {capture: true});
  }

  // Missiles are edge-triggered actions with their own contact owner. A second
  // thumb launches on press while the pilot keeps its existing pointer; a held
  // thumb never spends further paid rounds, even after the cooldown expires.
  function startMissileInput(event) {
    const touchFallback=event.type==="touchstart";
    if(touchFallback&&window.PointerEvent)return;
    if(state!=="playing"||classicChapterControlsLocked()||ui.classicMissile?.disabled)return;
    if(!touchFallback&&event.pointerType==="mouse"&&event.button!==0)return;
    const id=touchFallback?event.changedTouches?.[0]?.identifier:event.pointerId??"mouse";
    if(id===undefined)return;
    event.preventDefault();event.stopPropagation();
    if(missileInput)return;
    missileInput={id,kind:touchFallback?"touch":"pointer"};
    suppressNextMissileClick=true;
    if(!touchFallback&&event.pointerId!==undefined){
      try{ui.classicMissile.setPointerCapture?.(event.pointerId);}catch{ /* Synthetic events cannot capture. */ }
    }
    fireClassicMissile();
  }

  function finishMissileInput(event) {
    if(!missileInput)return;
    const touchFallback=event.type.startsWith("touch");
    if(touchFallback&&window.PointerEvent)return;
    const ended=touchFallback
      ? Array.from(event.changedTouches||[]).some(touch=>touch.identifier===missileInput.id)
      : (event.pointerId??"mouse")===missileInput.id;
    if(ended){
      const previous=missileInput;missileInput=null;
      if(previous.kind==="pointer")releaseInputCapture(ui.classicMissile,previous.id);
    }
  }

  function setupClassicMissileInput() {
    if(!ui.classicMissile)return;
    ui.classicMissile.addEventListener("pointerdown",startMissileInput,{passive:false});
    ui.classicMissile.addEventListener("touchstart",startMissileInput,{passive:false});
    for(const event of ["pointerup","pointercancel","lostpointercapture","touchend","touchcancel"]){
      ui.classicMissile.addEventListener(event,finishMissileInput);
      if(event!=="lostpointercapture")addEventListener(event,finishMissileInput,{capture:true});
    }
    ui.classicMissile.onclick=event=>{
      // Keyboard/assistive activation has detail=0. Pointer compatibility clicks
      // have already launched on down (or were cancelled), so never launch again.
      if(event?.detail&&(window.PointerEvent||suppressNextMissileClick)){
        suppressNextMissileClick=false;return;
      }
      fireClassicMissile();
    };
  }

  addEventListener("keydown", (event) => {
    if (state === "playing" && !classicChapterControlsLocked() && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const bounds = classicFlightBounds || refreshClassicFlightBounds();
      if (bounds) {
        const dx = event.key === "ArrowLeft" ? -85 : event.key === "ArrowRight" ? 85 : 0;
        const dy = event.key === "ArrowUp" ? -85 : event.key === "ArrowDown" ? 85 : 0;
        player.target = clamp(player.target + dx, bounds.minX, bounds.maxX);
        player.targetY = clamp(player.targetY + dy, bounds.minY, bounds.maxY);
      }
    }
    if (event.key === " " && state === "playing") {
      event.preventDefault();
      fireManualShot();
    }
    if(event.key.toLowerCase()==="m"&&state==="playing"&&!event.repeat){event.preventDefault();fireClassicMissile();}
    if (event.key === "Escape") {
      resetGameInput();
      state === "paused" ? resumeGame() : pauseGame();
    }
  });

  // JUGAR abre el sector 1 continuo (decisión del propietario, 23/10/2026).
  $("play").onclick = () => startSector("S1");
  $("levels").onclick = () => { buildLevelGrid(); overlay(ui.levelSelect); };
  // El mapa de viajes antiguo se oculta hasta que exista el de la galaxia (F5).
  $("levels").classList.add("hidden");
  $("levelBack").onclick = () => { closeBaseTalk(); overlay(ui.menu); };
  $("baseTalkClose").onclick = closeBaseTalk;
  $("baseTalkNext").onclick = () => { if (!baseTalkState) return; baseTalkState.index++; showBaseTalkLine(); };
  $("launch").onclick = () => startLevel(pendingLevel);
  $("briefingBack").onclick = closeBriefing;
  $("how").onclick = () => overlay(ui.instructions);
  $("back").onclick = () => overlay(ui.menu);
  $("settings").onclick = () => openSettings("menu");
  $("quickSettings").onclick = () => openSettings("menu");
  $("settingsBack").onclick = closeSettings;
  $("pause").onclick = pauseGame;
  ui.fire.onclick = (event) => {
    // Pointer/touch presses have fired already. Their compatibility click must
    // not consume a second battery charge; keyboard/assistive clicks still work.
    if (event?.detail && (window.PointerEvent || suppressNextFireClick)) {
      suppressNextFireClick = false;
      return;
    }
    fireManualShot();
  };
  $("resume").onclick = resumeGame;
  $("pauseSettings").onclick = () => openSettings("paused");
  $("restart").onclick = () => startLevel(currentLevel);
  $("quit").onclick = goHome;
  $("home").onclick = goHome;
  $("completeHome").onclick = goHome;
  $("retry").onclick = () => startLevel(currentLevel);
  $("replayLevel").onclick = () => startLevel(currentLevel);
  // Tras cualquier viaje: el siguiente viaje del mapa o, si no queda
  // ninguno, el mapa. Nunca un nivel clásico (ya no forman parte del juego).
  ui.nextLevel.onclick = () => {
    if (isSectorRun()) { goHome(); return; }
    const nextVoyage=nextCampaignVoyage();
    if(nextVoyage&&nextVoyage.voyage!=="S1-V1"){startSideVoyage(nextVoyage.voyage);return;}
    // El mapa se abre en el sector del viaje recién hecho.
    const sector=classicSideVoyage?.ficha.sector||1;
    goHome();sectorMapShown=sector;buildLevelGrid();overlay(ui.levelSelect);
  };

  ui.musicVolume.oninput = (event) => {
    settings.music = +event.target.value;
    ui.musicValue.textContent = `${settings.music}%`;
    paintRanges();
    startMusic();
    updateAudioVolumes();
  };
  ui.fxVolume.oninput = (event) => {
    settings.fx = +event.target.value;
    ui.fxValue.textContent = `${settings.fx}%`;
    paintRanges();
    updateAudioVolumes();
    tone(620, 0.05, "triangle", 0.04);
  };
  ui.sensitivity.oninput = (event) => {
    settings.sensitivity = +event.target.value;
    ui.sensitivityValue.textContent = `${settings.sensitivity}%`;
    paintRanges();
  };
  ui.autoFire.onchange = (event) => {
    const previous = settings.autoFire;
    settings.autoFire = event.target.checked;
    if (!saveSettings()) {
      settings.autoFire = previous; event.target.checked = previous;
      toast("No se pudo guardar el modo de disparo");
    }
  };
  ui.vibration.onchange = (event) => {
    settings.vibration = event.target.checked;
    if (settings.vibration) vibrate(20);
  };
  if (ui.difficulty) ui.difficulty.onchange = (event) => {
    settings.difficulty = ["facil", "normal", "dificil", "hardcore"].includes(event.target.value) ? event.target.value : "normal";
  };
  ui.effectsQuality.onchange = (event) => {
    settings.effectsQuality = ["low", "normal", "high"].includes(event.target.value) ? event.target.value : "normal";
    settings.effects = settings.effectsQuality !== "low";
  };
  ui.reduceEffects.onchange = (event) => {
    settings.reduceEffects = event.target.checked;
    document.body.classList.toggle("reduced-effects", settings.reduceEffects);
  };
  ui.leftHanded.onchange = (event) => {
    settings.leftHanded = event.target.checked;
    document.body.classList.toggle("left-handed", settings.leftHanded);
  };

  ui.reward.onclick = async () => {
    ui.reward.disabled = true;
    ui.reward.textContent = "CARGANDO ANUNCIO…";
    try {
      const ok = await window.AdBridge?.showRewarded?.();
      window.AnalyticsManager?.track("rewarded_ad", { level: currentLevel + 1, completed: Boolean(ok) });
      if (ok) resumeReward();
      else toast("Anuncio no disponible");
    } catch {
      toast("Anuncio no disponible");
    } finally {
      ui.reward.disabled = false;
      ui.reward.textContent = "▶ VER ANUNCIO Y REPARAR";
    }
  };

  addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event;
    ui.install.classList.remove("hidden");
  });

  ui.install.onclick = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    ui.install.classList.add("hidden");
  };

  // Al girar el móvil a horizontal el aviso tapa el juego: la partida se pausa.
  window.matchMedia?.("(orientation: landscape) and (pointer: coarse) and (max-height: 600px)")
    ?.addEventListener?.("change", event => {
      if (!event.matches) return;
      resetGameInput();
      if (state === "playing") pauseGame();
    });
  document.addEventListener("visibilitychange", async () => {
    if (!document.hidden) {
      last = performance.now();
      return;
    }
    resetGameInput();
    if (state === "playing") pauseGame();
    await suspendAudio();
  });

  addEventListener("neon-ad-opening", async () => {
    last = performance.now();
    resumeAudioAfterAd = Boolean(audioCtx && audioCtx.state === "running");
    if (resumeAudioAfterAd) await suspendAudio();
  });

  addEventListener("neon-ad-closed", async () => {
    last = performance.now();
    if (resumeAudioAfterAd && audioCtx) {
      await resumeAudio();
    }
    resumeAudioAfterAd = false;
  });

  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  recoverCampaignCompletion();
  currentLevel=0; // solo existe la campaña de viajes (nivel 0)
  setupClassicFlight();
  setupClassicMissileInput();
  resizeCanvas();
  syncSettingsUI();
  window.AnalyticsManager?.track("app_open", { build: BUILD_VERSION });
  addEventListener("pagehide", () => {
    window.AnalyticsManager?.track("session_duration", {
      seconds: Math.round(window.AnalyticsManager.sessionDurationSeconds())
    });
    if (["playing", "paused", "destroying"].includes(state)) {
      window.AnalyticsManager?.track("abandon", { level: currentLevel + 1, state });
    }
  }, { once: true });
  // Panel del modo desarrollo (?dev=1): cualquier viaje y tramo, niveles
  // clásicos, casco invencible y borrado del progreso de prueba.
  function setupDevPanel() {
    const badge = document.createElement("div");
    badge.id = "devBadge"; badge.className = "dev-badge"; badge.textContent = "MODO DESARROLLO";
    const panel = document.createElement("section");
    panel.id = "devPanel"; panel.className = "dev-panel"; panel.setAttribute("aria-label", "Panel de desarrollo");
    const title = document.createElement("h2"); title.textContent = "Desarrollo · elige qué jugar";
    const note = document.createElement("p");
    note.textContent = "Progreso aparte (no toca tu partida). Todo desbloqueado.";
    const close = () => { panel.classList.remove("show"); overlay(ui.menu); };
    const play = start => { panel.classList.remove("show"); classicSideVoyagePending = null; start(); };
    const button = (label, onclick, className = "dev-chip") => {
      const node = document.createElement("button"); node.type = "button"; node.className = className;
      node.textContent = label; node.onclick = onclick; return node;
    };
    panel.append(title, note);
    const options = document.createElement("div"); options.className = "dev-options";
    const god = document.createElement("label");
    god.innerHTML = '<input type="checkbox" id="devInvulnerable"> Casco invencible';
    god.querySelector("input").onchange = event => { DEV.invulnerable = event.target.checked; };
    options.append(god, button("Borrar progreso de prueba", () => {
      const prefix = window.NeonDev.prefix;
      for (const key of Object.keys(window.localStorage)) if (key.startsWith(prefix)) window.localStorage.removeItem(key);
      window.location.reload();
    }), button("Volver", close));
    panel.append(options);
    for (const ficha of [...NeonCampaign.SECTORS, ...NeonCampaign.VOYAGES]) {
      const row = document.createElement("div"); row.className = "dev-row";
      const name = document.createElement("b"); name.textContent = `${ficha.id} · ${NeonCampaign.SECTORS.includes(ficha) ? "Sector · " : ""}${ficha.title}${ficha.boss ? " · jefe" : ""}`;
      const stages = document.createElement("div"); stages.className = "dev-stages";
      const count = NeonCampaign.createVoyageRoute(ficha).stageCount;
      for (let stage = 1; stage <= count; stage++) stages.append(button(String(stage), () => play(() => {
        classicVoyageRequestedStage = stage;
        if (ficha.id !== "S1-V1") classicSideVoyagePending = ficha;
        startLevel(0);
      })));
      row.append(name, stages); panel.append(row);
    }
    canvas.parentElement.append(badge, panel);
    const open = button("DEV", () => { overlay(); panel.classList.add("show"); panel.querySelector("button")?.focus(); }, "secondary dev-open");
    open.id = "devOpen";
    document.querySelector(".menu-actions")?.append(open);
  }
  if (DEV) setupDevPanel();

  console.info(`[NEON CRONIUM] build ${BUILD_VERSION}`);
  setupShipHangar();
  $("openHangar")?.addEventListener("click", markHangarSeen);
  setupAtlasEncounter();
  updateMenu();
  hud();
  resetPowers();
  overlay(ui.menu);
  legacyFrameId = requestAnimationFrame(frame);
})();
