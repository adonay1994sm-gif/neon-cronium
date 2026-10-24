(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  // Modo desarrollo (?dev=1 en la dirección): todo desbloqueado, panel para
  // jugar cualquier viaje o tramo y guardado aparte (prefijo neon-dev-v1:),
  // así el progreso real no se toca. Sin el parámetro el juego no cambia.
  const DEV = (() => {
    let enabled = false;
    try { enabled = new URLSearchParams(window.location.search).get("dev") === "1"; } catch {}
    if (!enabled) return null;
    const base = window.localStorage, prefix = "neon-dev-v1:";
    const store = Object.freeze({
      getItem: key => base.getItem(prefix + key),
      setItem: (key, value) => base.setItem(prefix + key, value),
      removeItem: key => base.removeItem(prefix + key)
    });
    try { if (store.getItem("neon-unlocked-v2") === null) store.setItem("neon-unlocked-v2", "10"); } catch {}
    window.NeonDev = Object.freeze({storage: store, prefix, base});
    return {invulnerable: false};
  })();
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  let W = 720;
  let H = 1280;
  const BUILD_VERSION = "7.2.0";
  const INITIAL_AMMO = 3;
  const MAX_AMMO = 3;
  // Owner revision: 30% larger than the previous 40% ship, not 30% of it.
  const CLASSIC_SHIP_SCALE = 0.52;
  const SHIP_VISUAL_SCALE = 0.8 * CLASSIC_SHIP_SCALE;
  const SHIP_VISUAL = Object.freeze({
    classicScale: CLASSIC_SHIP_SCALE,
    assemblySize: 208 * CLASSIC_SHIP_SCALE,
    muzzleOffset: 125 * CLASSIC_SHIP_SCALE,
    bankStrength: 1.8,
    scale: SHIP_VISUAL_SCALE,
    spriteSize: 248 * SHIP_VISUAL_SCALE,
    fallbackWidth: 232 * SHIP_VISUAL_SCALE,
    fallbackHeight: 265 * SHIP_VISUAL_SCALE,
    shieldSize: 294 * SHIP_VISUAL_SCALE,
    centerYOffset: -24 * SHIP_VISUAL_SCALE,
    tractorMuzzleOffset: 76 * SHIP_VISUAL_SCALE,
    phaserMuzzleOffset: 78 * SHIP_VISUAL_SCALE
  });

  const ui = {
    hud: $("hud"),
    powerHud: $("powerHud"),
    encounterProgress: $("encounterProgress"),
    score: $("score"),
    goal: $("goal"),
    hull: $("hull"),
    hullBar: $("hullBar"),
    hudLevel: $("hudLevel"),
    fire: $("fire"),
    fireWeapon: $("fireWeapon"),
    ammo: $("ammo"),
    best: $("best"),
    unlockedText: $("unlockedText"),
    totalStars: $("totalStars"),
    campaignPercent: $("campaignPercent"),
    campaignFill: $("campaignFill"),
    campaignNodes: $("campaignNodes"),
    playLabel: $("playLabel"),
    playSector: $("playSector"),
    menu: $("menu"),
    briefing: $("briefing"),
    briefingPanel: $("briefingPanel"),
    briefingSector: $("briefingSector"),
    briefingVisual: $("briefingVisual"),
    briefingName: $("briefingName"),
    briefingZone: $("briefingZone"),
    briefingGoal: $("briefingGoal"),
    briefingThreat: $("briefingThreat"),
    briefingSupply: $("briefingSupply"),
    briefingMission: $("briefingMission"),
    levelSelect: $("levelSelect"),
    settingsPanel: $("settingsPanel"),
    instructions: $("instructions"),
    paused: $("paused"),
    complete: $("complete"),
    over: $("over"),
    beaconOffer: $("beaconOffer"),
    sectorMap: $("sectorMap"),
    baseTalk: $("baseTalk"),
    result: $("result"),
    final: $("finalScore"),
    supplyStatus: $("supplyStatus"),
    newBest: $("newBest"),
    reward: $("reward"),
    toast: $("toast"),
    install: $("install"),
    banner: $("levelBanner"),
    bannerSector: $("bannerSector"),
    bannerName: $("bannerName"),
    bannerGoal: $("bannerGoal"),
    hazardWarning: $("hazardWarning"),
    warningText: $("warningText"),
    storyTransmission: $("storyTransmission"),
    storySpeaker: $("storySpeaker"),
    storyText: $("storyText"),
    completeLabel: $("completeLabel"),
    completeVisual: $("completeVisual"),
    completeTitle: $("completeTitle"),
    starsAwarded: $("starsAwarded"),
    levelScore: $("levelScore"),
    levelHull: $("levelHull"),
    maxCombo: $("maxCombo"),
    unlockMessage: $("unlockMessage"),
    nextLevel: $("nextLevel"),
    powerShield: $("powerShield"),
    powerTractor: $("powerTractor"),
    powerSlow: $("powerSlow"),
    powerDouble: $("powerDouble"),
    powerPhaser: $("powerPhaser"),
    musicVolume: $("musicVolume"),
    fxVolume: $("fxVolume"),
    sensitivity: $("sensitivity"),
    vibration: $("vibration"),
    effectsQuality: $("effectsQuality"),
    difficulty: $("difficulty"),
    reduceEffects: $("reduceEffects"),
    leftHanded: $("leftHanded"),
    autoFire: $("autoFire"),
    musicValue: $("musicValue"),
    fxValue: $("fxValue"),
    sensitivityValue: $("sensitivityValue")
  };

  const ORIGINAL_LEVELS = [
    {
      name: "La Onda de Choque", goal: 36, speed: 0.92, spawn: 0.69, meteor: 0.105, power: 0.072,
      accent: "#57f4ff", top: "#173460", mid: "#07172f", hazard: "shockwave", scene: "cronos",
      world: "CRONOS / GAIA NOVA", enemyCue: "Restos temporales",
      zone: "Perímetro exterior del Centro Cronos", desc: "Cruza la zona de impacto",
      mission: "Una nave desconocida ataca Chronos. Recupera 36 fragmentos de CRONIUM mientras abandonas la estación y sigue su rastro hacia Gaia Nova. Rescata el emisor gemelo: Mira puede montarlo en C9.",
      threatLabel: "Roca y restos orbitales", threatPool: ["meteor", "meteor", "debris"], gate: 0
    },
    {
      name: "Perímetro Atlas", goal: 45, speed: 0.94, spawn: 0.72, meteor: 0.095, power: 0.068,
      accent: "#4da2ff", top: "#14245c", mid: "#0a1035", hazard: "fast", scene: "rift",
      world: "GAIA NOVA", enemyCue: "Red defensiva CH",
      zone: "Anillo defensivo de Gaia Nova", desc: "La red Atlas despierta",
      mission: "El CRONIUM de Chronos ha llegado a Gaia. Recupera el rastro orbital, rompe la fijación de CH-01 y los flanqueos de CH-02 y alcanza al guardián Atlas.",
      threatLabel: "CH-01, interceptores CH-02 y restos Atlas", threatPool: ["meteor", "meteor", "meteor", "debris"], gate: 0
    },
    {
      name: "Descenso Ígneo", goal: 60, speed: 1.02, spawn: 0.67, meteor: 0.115, power: 0.066,
      accent: "#ffb35c", top: "#3b2437", mid: "#17101f", hazard: "wave", scene: "belt",
      world: "VULKAR", enemyCue: "Lava Core / Plasma Mine",
      zone: "Órbita exterior de Vulkar", desc: "CRONIUM sobrecalentado",
      mission: "Recupera el CRONIUM entre los restos de la refinería orbital. Mantente en el espacio: Vulkar queda bajo la ruta.",
      threatLabel: "Lava Core y chatarra", threatPool: ["meteor", "meteor", "debris", "debris"], gate: 0
    },
    {
      name: "Rastro de la Serpiente", goal: 75, speed: 1.09, spawn: 0.62, meteor: 0.135, power: 0.064,
      accent: "#ff734d", top: "#342364", mid: "#15102d", hazard: "dart", scene: "ion",
      world: "VULKAR", enemyCue: "Magma Serpent",
      zone: "Túneles magmáticos de Vulkar", desc: "La serpiente abre una ruta",
      mission: "Persigue el rastro de Magma Serpent y atraviesa sus cometas vivos sin quedar encerrado en la caldera.",
      threatLabel: "Cometas y Plasma Mine", threatPool: ["meteor", "meteor", "debris", "satellite"], gate: 0
    },
    {
      name: "Blanco Absoluto", goal: 90, speed: 1.16, spawn: 0.58, meteor: 0.155, power: 0.062,
      accent: "#7ddfff", top: "#552034", mid: "#210b18", hazard: "storm", scene: "crimson",
      world: "CRYON", enemyCue: "Frost Crystal / Ice Drone",
      zone: "Planicie nocturna de Cryon", desc: "Visibilidad mínima",
      mission: "Recupera los registros congelados del Centro Cronos entre cristales vivos y drones blindados.",
      threatLabel: "Frost Crystal e Ice Drone", threatPool: ["meteor", "meteor", "satellite", "debris"], gate: 0
    },
    {
      name: "Fractura Leviatán", goal: 105, speed: 1.22, spawn: 0.54, meteor: 0.175, power: 0.060,
      accent: "#47ffd1", top: "#16463f", mid: "#09241f", hazard: "gravity", scene: "gravity",
      world: "CRYON", enemyCue: "Cryo Mine / señal Leviathan",
      zone: "Grieta glacial Leviatán", desc: "Una señal llega del futuro",
      mission: "Cruza el campo de Cryo Mines y rastrea la silueta que protege una transmisión imposible.",
      threatLabel: "Cryo Mine y hielo orbital", threatPool: ["meteor", "debris", "debris", "satellite"], gate: 15
    },
    {
      name: "Ecos Imposibles", goal: 120, speed: 1.28, spawn: 0.51, meteor: 0.195, power: 0.058,
      accent: "#c48aff", top: "#3a2856", mid: "#160d25", hazard: "phantom", scene: "ghost",
      world: "AETHER", enemyCue: "Time Echo / Rift Orb",
      zone: "Cementerio temporal de Aether", desc: "La realidad se duplica",
      mission: "Distingue los ecos de las amenazas reales y reúne pruebas de las duplicaciones humanas.",
      threatLabel: "Time Echo y Rift Orb", threatPool: ["meteor", "debris", "satellite", "satellite"], gate: 14
    },
    {
      name: "Umbral Fantasma", goal: 135, speed: 1.35, spawn: 0.47, meteor: 0.215, power: 0.056,
      accent: "#fff06b", top: "#514916", mid: "#211d08", hazard: "overdrive", scene: "overdrive",
      world: "AETHER", enemyCue: "Chrono Phantom",
      zone: "Umbral espectral de Aether", desc: "Nada permanece visible",
      mission: "Sobrevive a los saltos del Chrono Phantom y localiza el protocolo oculto CRONOS PRIME.",
      threatLabel: "Chrono Phantom y fisuras", threatPool: ["meteor", "debris", "satellite", "debris"], gate: 12
    },
    {
      name: "Cementerio Gravitatorio", goal: 150, speed: 1.42, spawn: 0.44, meteor: 0.235, power: 0.054,
      accent: "#fb66ff", top: "#40183f", mid: "#190918", hazard: "chaos", scene: "dark",
      world: "TITAN OMEGA", enemyCue: "Gravity Mine / Scrap Collector",
      zone: "Cementerio industrial de Titan Omega", desc: "La gravedad tritura el corredor",
      mission: "Recupera las piezas del retorno mientras las minas gravitatorias atraen toda la chatarra hacia ti.",
      threatLabel: "Gravity Mine y Scrap Collector", threatPool: ["meteor", "meteor", "debris", "satellite"], gate: 11
    },
    {
      name: "Colapso Cronos", goal: 165, speed: 1.50, spawn: 0.40, meteor: 0.255, power: 0.052,
      accent: "#63fff1", top: "#45184b", mid: "#12071e", hazard: "final", scene: "collapse",
      world: "RETORNO A CRONOS", enemyCue: "Todas las firmas detectadas",
      zone: "Reactor CRONIUM en colapso", desc: "Todas las líneas temporales convergen",
      mission: "Combina todos los sistemas para estabilizar el reactor y descubre por qué el incidente no fue accidental.",
      threatLabel: "Colapso total", threatPool: ["meteor", "debris", "satellite", "meteor"], gate: 9
    }
  ];

  const LEVELS = ORIGINAL_LEVELS;
  const KEYS = {
    best: "neon-best-v2",
    unlocked: "neon-unlocked-v2",
    stars: "neon-stars-v2",
    levelBest: "neon-level-best-v2",
    games: "neon-games-v2",
    settings: "neon-settings-v5"
  };
  const LEGACY_KEYS = { best: "neon-best-v1" };
  const DEFAULT_SETTINGS = { music: 35, fx: 70, sensitivity: 135, vibration: true, autoFire: false, effectsQuality: "normal", effects: true, difficulty: "normal" };
  const storage = NeonCore.createStorageService(window.NeonDev?.storage);

  function migrateLegacyStorage() {
    // A denied read is not an absent score: do not overwrite an unreadable
    // current record with a smaller historical one while writes still work.
    const legacyRead = storage.readRaw(LEGACY_KEYS.best);
    const currentRead = storage.readRaw(KEYS.best);
    if (!legacyRead.ok || !currentRead.ok) return false;
    const scoreFromRaw = raw => {
      const value = Number(raw);
      return Number.isFinite(value) ? Math.max(0, value) : null;
    };
    const legacyBest = scoreFromRaw(legacyRead.value);
    const currentBest = scoreFromRaw(currentRead.value);
    if (legacyBest === null || currentBest === null) return false;
    if (legacyBest <= currentBest) return false;
    return storage.set(KEYS.best, legacyBest);
  }

  migrateLegacyStorage();
  let settings = loadSettings();
  // Cosmetic loadout has its own key; campaign checkpoints and collision stay intact.
  const savedShipFleet = storage.getJSON(NeonCampaign.SHIP_FLEET_SAVE_KEY, null);
  // The accepted modular fleet is the single live identity. Old profiles keep
  // their loadout and progress; a historical render-mode flag cannot revive the
  // retired illustration. The next explicit hangar save normalizes the flag.
  let shipRenderMode = "modular";
  let shipLoadout = NeonCampaign.normalizeShipLoadout(savedShipFleet?.loadout);
  let shipHangarDraft = null;
  let shipPresentationSignature = "";

  const stateMachine = NeonCore.createGameState(NeonCore.GAME_STATES.MENU);
  let state = stateMachine.value;
  function setState(next, metadata = {}) {
    state = stateMachine.transition(next, metadata);
    return state;
  }
  let settingsReturn = "menu";
  let briefingReturn = "menu";
  let pendingLevel = 0;
  let last = performance.now();
  let elapsed = 0;
  let spawnTimer = 0;
  let classicScoutTimer = 0;
  let classicScoutAnnounced = false;
  let atlasBoss = null;
  // Old Atlas AUTO was on by default, so its key is not evidence of consent.
  // Explicit opt-in now belongs to Settings; no encounter-local override.
  let atlasFireTimer = 0;
  let atlasReentryGrace = 0;
  let atlasLastStatus = "";
  let warpTimer = 0;
  let score = 0;
  let hull = 100;
  let combo = 1;
  let maxCombo = 1;
  let comboTimer = 0;
  let collected = 0;
  // Solo existe el nivel 0 (la campaña de viajes): los guardados antiguos con
  // niveles clásicos desbloqueados ya no cambian el escenario del menú.
  let currentLevel = 0;
  let continued = false;
  let shake = 0;
  let flash = 0;
  let stormPulse = 0;
  let bannerTimer = 0;
  let deferred = null;
  let destructionTimer = 0;
  let destructionStage = 0;
  let playerVisible = true;
  let damageSmokeSide = 1;
  let damageSmokeLocked = false;
  let impactReactionTimer = 0;
  let impactReactionSide = 1;
  let storyStep = 0;
  let storyTimer = 0;
  let levelOneShockwave = 0;
  let levelOneShockwaveTriggered = false;
  let visualSpeed = 1;
  let cameraKickX = 0;
  let cameraKickY = 0;
  let displayedScore = 0;
  let hudScoreTarget = 0;
  let lastHudCollected = 0;
  let lastHudHull = 100;
  let ammo = INITIAL_AMMO;
  let manualShotCooldown = 0;
  let classicWeapons = null;
  let classicFlight = null;
  let classicFlightView = null;
  let classicFlightBounds = null;
  let classicFlightAnchorY = null;
  const classicFlightInput = NeonCampaign.createRelativeFlightInput();
  let classicEquipment = {version:1, recoveredTwin:false, unlocked:['pulse'], selected:'pulse'};
  let classicEquipmentWritable = true;
  let classicSalvageLedger = null;
  let classicSalvageState = null;
  let classicSalvageRunId = null;
  let classicSalvageEnemySequence = 0;
  let classicSalvageWarningShown = false;
  let classicCometShower = null;
  let classicCometCorridor = null;
  let hullGrace = 0; // s sin daño al casco: tras un golpe (J07) y al reanudar (J06)
  let pauseStartedAt = 0;
  let lastResumeGraceAt = -Infinity; // tiempo de juego de la última gracia por reanudar (R1)
  let classicGuideSeen = null; // lección de un paso: cuándo se mostró por primera vez (G1)
  let reserveHitExplained = false; // N-7 explica una vez el golpe absorbido (G2)
  let classicCroniumWaitNotice = null; // tramo cuyo aviso de CRONIUM pendiente ya salió (G5)
  let classicCroniumWaitAt = -Infinity; // cuándo salió por última vez (R6: se repite cada 10 s)
  let classicCroniumWaitShown = null; // aviso en pantalla y el CRONIUM con que se dijo (C3)
  let classicShieldAge = 0;
  let classicShieldImpact = 0;
  let classicHullReserve = 30;
  let classicHullReserveCapacity = 30;
  let classicTutorial = null;
  let classicTutorialAnchor = null;
  let classicTutorialSignature = '';
  let classicWorkshopOpened = false;
  let classicChapterStory = null;
  let classicChapterView = null;
  let classicShipEntry = 0; // segundos que quedan de la entrada de la nave tras el inicio
  let classicFilmLocked = false;
  let classicPatrolTimer = 0;
  let classicPatrolSequence = 0;
  let classicPursuitAnnounced = new Set();
  let classicCometSequence = 0;
  let classicCometWarning = -1;
  let classicVoyageRecord = null;
  // Viaje secundario (otra ficha que no es S1-V1): {ficha, route} mientras se juega.
  let classicSideVoyage = null, classicSideVoyagePending = null;
  let classicVoyageWritable = true;
  let completionJournal = null;
  let completionPersistenceBlocked = false;
  let classicVoyageRequestedStage = null;
  let classicVoyageSpawnTimer = 0;
  let classicVoyageHazardTimer = 0;
  let classicVoyageHazards = null;
  let classicVoyageStageId = "";
  let classicThreatSequence = 0;
  let flightDockReturn = 'menu';
  let flightHudSignature = '';
  let flightTransmission = null;


  let items = [];
  let gates = [];
  let parts = [];
  const EFFECT_LIMITS = Object.freeze({
    particles: 320,
    shots: 24,
    rings: 32,
    explosions: 20,
    impacts: 24
  });
  const particlePool = NeonCore.createObjectPool(
    () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0, kind: "cyan" }),
    (part) => { part.life = 0; part.vx = 0; part.vy = 0; },
    EFFECT_LIMITS.particles
  );
  let shots = [];
  let rings = [];
  let explosions = [];
  let impactEffects = [];

  let energySpawned = 0;
  let energyBudget = 0;
  let powerSpawned = 0;
  let powerBudget = 0;
  let repairAllowance = 0;
  let repairSpawned = 0;
  let supplyFailed = false;
  let supplyFailureScheduled = false;
  let supplyFailureTimer = 0;
  let runToken = 0;
  let phaserCooldown = 0;
  let tractorTarget = null;
  let gateCountdown = Infinity;

  const powers = { shield: 0, tractor: 0, slow: 0, double: 0, phaser: 0 };
  const player = NeonCore.createPlayerModel(W, H);
  player.w *= SHIP_VISUAL.classicScale;
  player.h *= SHIP_VISUAL.classicScale;

  // Silueta de colisión aproximada al sprite de la nave.
  // Está ligeramente metida hacia dentro para que los roces mínimos no sean injustos,
  // pero incluye morro, fuselaje, alas y motores.
  const SHIP_COLLISION_OUTLINE = [
    [0, -148],
    [18, -137], [28, -112], [34, -91], [44, -74],
    [55, -56], [77, -38], [103, -12], [109, 20],
    [103, 46], [82, 51], [66, 42], [56, 72],
    [41, 94], [28, 73], [0, 92],
    [-28, 73], [-41, 94], [-56, 72], [-66, 42],
    [-82, 51], [-103, 46], [-109, 20], [-103, -12],
    [-77, -38], [-55, -56], [-44, -74], [-34, -91],
    [-28, -112], [-18, -137]
  ];

  // Scale the actual collision silhouette with the owner's smaller classic ship.
  for (const point of SHIP_COLLISION_OUTLINE) {
    point[0] *= SHIP_VISUAL.classicScale * .9;
    point[1] *= SHIP_VISUAL.classicScale * .8;
  }
  const SHIP_COLLISION_HALF_WIDTH = NeonCore.PLAYER_GEOMETRY.collisionHalfWidth * SHIP_VISUAL.classicScale * .9;
  const CORRIDOR_REQUIRED_CLEARANCE = 14;
  const CORRIDOR_TOP = -170;
  const CORRIDOR_BOTTOM_PADDING = 94;
  const FORMATION_SPRITE_KEYS = ["debrisMetal", "debrisPanel", "debrisHot0", "debrisHot1", "meteorSmall", "meteorMedium"];

  // Assets visuales V6.4. Cada imagen tiene respaldo vectorial para que el juego siga
  // funcionando aunque un archivo tarde en cargar.
  function loadSprite(path, eager = true) {
    const image = new Image();
    image.decoding = "async";
    image._assetPath = path;
    image._loadError = false;
    image.onerror = () => { image._loadError = true; };
    if (eager) image.src = path;
    return image;
  }

  function ensureSprite(image) {
    if (image && !image.src && image._assetPath) image.src = image._assetPath;
    return image;
  }

  function spriteReady(image) {
    ensureSprite(image);
    return Boolean(image && image.complete && image.naturalWidth > 0);
  }

  const SPRITE_GROUPS = {
    // Historical poses remain on disk for recovery and the reserved engine's
    // references, but are not requested by the live modular presentation.
    ship: [0,1,2,3,4,5].map((index) => loadSprite(`assets/ship_frame_${String(index).padStart(2,"0")}.webp`, false)),
    core: [0,1,2,3,4,5].map((index) => loadSprite(`assets/core_frame_${String(index).padStart(2,"0")}.webp`, true)),
    phaser: [0,1,2,3,4,5].map((index) => loadSprite(`assets/phaser_frame_${String(index).padStart(2,"0")}.webp`)),
    tractor: [0,1,2,3,4,5].map((index) => loadSprite(`assets/tractor_frame_${String(index).padStart(2,"0")}.webp`)),
    impact: [0,1,2,3].map((index) => loadSprite(`assets/impact_frame_${String(index).padStart(2,"0")}.webp`)),
    smoke: [0,1,2].map((index) => loadSprite(`assets/smoke_frame_${String(index).padStart(2,"0")}.webp`)),
    explosion: [0,1,2,3,4,5,6,7].map((index) => loadSprite(`assets/explosion_frame_${String(index).padStart(2,"0")}.webp`))
  };

  const SPRITES = {
    chapterIntro: loadSprite("assets/chapter1_intro_atlas_v1.webp", false),
    chapterPortraits: loadSprite("assets/chapter1_portraits_v1.webp", false),
    chapterMissile: loadSprite("assets/chapter1_missile_atlas_v1.webp", false),
    croniumEnergy: loadSprite("assets/cronium_energy_atlas_v2.webp", false),
    flightKit: loadSprite("assets/chronos_flight_atlas_v1.webp", false),
    chronosDestruction: loadSprite("assets/chronos_destruction_atlas_v1.webp", false),
    // Inicio de Chronos con las piezas del propietario (carga diferida).
    chronosIntroStation: loadSprite("assets/chronos_intro_station_atlas_v1.webp", false),
    chronosIntroFragments: loadSprite("assets/chronos_intro_fragments_atlas_v1.webp", false),
    // Cronos Prime animado (40 fotogramas del vídeo) y la estación estallando.
    cronosPrimeVideo: loadSprite("assets/cronos_prime_video_atlas_v1.webp", false),
    cronosPrimeTrail: loadSprite("assets/cronos_prime_trail_v1.webp", false),
    // Haz pintado del disparo (propietario, 24/10/2026: el de degradados se veía hecho por código).
    cronosPrimeBeam: loadSprite("assets/cronos_prime_beam_v1.webp", false),
    chronosStationBurst: loadSprite("assets/chronos_station_burst_atlas_v1.webp", false),
    cronosPrimeFx: loadSprite("assets/cronos_prime_fx_atlas_v1.webp", false),
    flightSpace: loadSprite("assets/chronos_flight_space_v1.webp", false),
    flightWeapons: loadSprite("assets/chronos_flight_weapons_v1.webp", false),
    c9Station: loadSprite("assets/c9_station_v1.webp", false),

    shipFallback: SPRITE_GROUPS.ship[0],
    meteorSmall: loadSprite("assets/meteor_small.webp", true),
    meteorSmallAlt: loadSprite("assets/meteor_small_alt.webp"),
    meteorMedium: loadSprite("assets/meteor_medium.webp", true),
    meteorMediumAlt: loadSprite("assets/meteor_medium_alt.webp"),
    meteorLarge: loadSprite("assets/meteor_large.webp"),
    ch01: loadSprite("assets/ch01_atlas_v1.webp", false),
    ch02: loadSprite("assets/ch02_interceptor_atlas_v1.webp", false),
    chronosModule: loadSprite("assets/chronos_detached_module_v1.webp", false),
    modularShip: loadSprite("assets/ship_modular_atlas_v1.webp", true),
    shipIdentity: loadSprite("assets/player_ship_identity_v1.webp", true),
    guardianAtlas: loadSprite("assets/guardian_atlas_states_v2.webp", false),
    atlasVfx: loadSprite("assets/atlas_combat_vfx_v1.webp", false),
    arcadePulse: loadSprite("assets/arcade_pulse_atlas_v2.webp", false),
    hostileOrdnance: loadSprite("assets/hostile_ordnance_atlas_v1.webp", false),
    gaiaPulse: loadSprite("assets/gaia_pulse_atlas_v3.webp", false),
    comet: loadSprite("assets/comet_flight_atlas_v3.webp"),
    hullSparks: loadSprite("assets/hull_impact_sparks_v1.webp"),
    atlasExplosion: loadSprite("assets/atlas_explosion_v1.webp", false),
    // Peligros del sector 2 (baúl, encargo enc-nucleo): núcleo de lava y mina de plasma.
    lavaCoreMine: loadSprite("assets/lava_core_mine_atlas_v1.webp", false),
    // Enemigos nuevos de Gaia y proyectiles hostiles (plan F3b): celdas de 192
    // (Alfa: 4 de 256; proyectiles: 6x4 de 128).
    gaiaTracker: loadSprite("assets/gaia_tracker_atlas_v1.webp", false),
    gaiaSower: loadSprite("assets/gaia_sower_atlas_v1.webp", false),
    gaiaAegis: loadSprite("assets/gaia_aegis_atlas_v1.webp", false),
    gaiaAlpha: loadSprite("assets/gaia_alpha_atlas_v1.webp", false),
    hostileProjectiles2: loadSprite("assets/hostile_projectiles_v2.webp", false),
    // Jefes del sector 1 (plan F3c): CH-03 y Atlas en furia en celdas de 384,
    // escoltas de Atlas y baliza en celdas de 192.
    ch03: loadSprite("assets/ch03_satellite_atlas_v1.webp", false),
    atlasFury: loadSprite("assets/atlas_fury_atlas_v1.webp", false),
    atlasEscorts: loadSprite("assets/atlas_escorts_atlas_v1.webp", false),
    sectorBeacon: loadSprite("assets/sector_beacon_atlas_v1.webp", false),
    debrisMetal: loadSprite("assets/debris_metal.webp"),
    debrisPanel: loadSprite("assets/debris_panel.webp"),
    debrisHot0: loadSprite("assets/debris_hot_00.webp"),
    debrisHot1: loadSprite("assets/debris_hot_01.webp"),
    satellite: loadSprite("assets/satellite_old.webp"),
    repairDrone: loadSprite("assets/repair_drone.webp"),
    shieldEffect: loadSprite("assets/shield_effect.webp"),
    forceShieldAtlas: loadSprite("assets/force_shield_atlas_v1.webp", false),
    shieldIdle: loadSprite("assets/shield_idle.webp"),
    explosionSmall: loadSprite("assets/explosion_small.webp"),
    croniumFragment: loadSprite("assets/cronium_fragment_v1.webp", true),
    chronosShockwave: loadSprite("assets/chronos_shockwave_atlas_v1.webp", false),
    vulkarOrbitPlanet: loadSprite("assets/vulkar_orbit_planet_v1.webp", false),
    planetVolcanico: loadSprite("assets/planet_volcanico_atlas_v1.webp", false),
    planetGlacial: loadSprite("assets/planet_glacial_atlas_v1.webp", false),
    planetVioleta: loadSprite("assets/planet_violeta_atlas_v1.webp", false),
    planetTormentoso: loadSprite("assets/planet_tormentoso_atlas_v1.webp", false),
  };

  function frameFrom(group, index) {
    const frames = SPRITE_GROUPS[group] || [];
    if (!frames.length) return null;
    const frame = frames[((index % frames.length) + frames.length) % frames.length];
    return spriteReady(frame) ? frame : null;
  }

  function drawImageCentered(image, width, height, rotation = 0, alpha = 1, flipX = false) {
    if (!spriteReady(image)) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.rotate(rotation);
    ctx.scale(flipX ? -1 : 1, 1);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
    return true;
  }
  const stars = Array.from({ length: 118 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.35 + Math.random() * 1.55,
    a: 0.18 + Math.random() * 0.7,
    s: 8 + Math.random() * 20,
    layer: 0.35 + Math.random() * 1.25,
    tint: Math.random() > 0.82 ? "#8eeeff" : "#e8f3ff"
  }));
  const spaceDust = Array.from({ length: 46 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.7 + Math.random() * 2.2,
    a: 0.035 + Math.random() * 0.12,
    s: 20 + Math.random() * 42,
    drift: (Math.random() - 0.5) * 8
  }));
  const foregroundParticles = Array.from({ length: 12 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 2.5 + Math.random() * 5.5,
    a: 0.025 + Math.random() * 0.08,
    s: 78 + Math.random() * 115,
    drift: (Math.random() - 0.5) * 22
  }));

  let audioCtx = null;
  let musicGain = null;
  let resumeAudioAfterAd = false;
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
  const CLASSIC_EQUIPMENT_KEY = "neonCronium.flightEquipment.v1";

  function classicChapterControlsLocked() {
    return Boolean(classicChapterView?.opening?.controlsLocked);
  }

  function classicChapterEvent(event) {
    if(event.type!=="transmission")return;
    flightTransmission={speaker:event.speaker,speakerId:event.speakerId,text:event.text,remaining:event.duration||4.6};
    flightHudSignature="";syncClassicFlightHud();
  }

  function signalClassicChapter(name) {
    if(!classicChapterStory)return;
    classicChapterStory.signal(name,classicChapterEvent);
    classicChapterView=classicChapterStory.snapshot();
  }

  function syncClassicChapterPresentation() {
    const opening=classicChapterView?.opening;
    const active=Boolean(state==="playing"&&opening?.active);
    document.body.classList.toggle("chapter-opening",active&&opening.controlsLocked);
    // Al acabar (o saltar) la animación del inicio, la nave entra desde abajo.
    const locked=classicChapterControlsLocked();
    if(classicFilmLocked&&!locked)classicShipEntry=.9;
    classicFilmLocked=locked;
    ui.chapterSkip?.classList.toggle("hidden",!active||!opening.canSkip);
    if(ui.chapterSkip)ui.chapterSkip.disabled=state!=="playing";
    syncClassicMissileHud();
  }

  function syncClassicMissileHud() {
    if(!ui.classicMissile)return;
    const count=classicSalvageState?.missileAmmo??0;
    ui.classicMissileCount.textContent=String(count);
    ui.classicMissile.disabled=state!=="playing"||classicChapterControlsLocked()||count<=0||Boolean(atlasBoss?.disabled);
    ui.classicMissile.setAttribute("aria-label",`Lanzar misil especial. ${count} disponibles. Reposición en C9.`);
  }

  function loadClassicSalvage() {
    if(!classicSalvageLedger)classicSalvageLedger=NeonCampaign.createScrapLedger({storage});
    const result=classicSalvageLedger.load();
    classicSalvageState=result.ok?result.state:null;
    if(!result.ok&&!classicSalvageWarningShown) {
      classicSalvageWarningShown=true;
      toast("La bodega no se puede guardar. Conservamos sus datos y bloqueamos las compras para evitar pérdidas.");
    }
    if(result.ok)projectClassicSalvageUpgrades();
    return result.ok;
  }

  // A purchase owns its entitlement in the same atomic record as its price.
  // The old equipment record is only a replayable projection, never the money
  // transaction. A failed projection can be retried without charging again.
  function projectClassicSalvageUpgrades() {
    const upgrades=classicSalvageState?.upgrades||[];
    let projected=true;
    if(upgrades.includes("twin-preparation")&&classicEquipment.recoveredTwin&&!classicEquipment.twinPrepared) {
      projected=persistClassicEquipment(NeonCampaign.prepareClassicTwin(classicEquipment));
    }
    const workshop=NeonCampaign.classicWorkshopState(classicSalvageState);
    const equipment=NeonCampaign.syncClassicWorkshopWeapons(classicEquipment,classicSalvageState);
    if(JSON.stringify(equipment)!==JSON.stringify(classicEquipment))projected=persistClassicEquipment(equipment)&&projected;
    if(classicWeapons){
      NeonCampaign.setClassicRechargeInterval(classicWeapons,workshop.rechargeSeconds);
      NeonCampaign.setClassicWeaponTuning(classicWeapons,workshop.weaponRanks);
    }
    const capacity=workshop.reserveCapacity;
    if(capacity>classicHullReserveCapacity)classicHullReserve+=capacity-classicHullReserveCapacity;
    classicHullReserveCapacity=capacity;
    classicHullReserve=Math.min(classicHullReserve,capacity);
    return projected;
  }

  function applyClassicSalvageShield() {
    // Kept as the existing checkpoint call site: changing a stage must neither
    // refill reinforcement nor create a timed shield.
    powers.shield=0;
    updatePowerHud();
  }

  function beginClassicSalvageRun(resuming=false) {
    classicSalvageRunId=null;classicSalvageEnemySequence=0;
    if(!loadClassicSalvage())return false;
    const scope=classicSideVoyage?`voyage:${classicSideVoyage.ficha.id}`:`classic:${currentLevel+1}`;
    const canResume=resuming&&classicSalvageState.activeRun?.scope===scope;
    const result=classicSalvageLedger.beginRun({scope,fresh:Boolean(classicSalvageState.activeRun&&!canResume)});
    if(!result.ok)return false;
    classicSalvageRunId=result.runId;classicSalvageState=result.state;
    return true;
  }

  function buyClassicC9Upgrade(sku) {
    if(!classicSalvageLedger)return false;
    if(sku==="twin-preparation"&&(!classicEquipment.recoveredTwin||classicEquipment.twinPrepared||classicEquipment.unlocked.includes("twin")))return false;
    const sequence=classicSalvageState?.missileRefillSequence||0;
    const result=classicSalvageLedger.purchase({transactionId:sku==="missile-refill"?`c9:missiles:${sequence+1}`:`c9:${sku}`,sku});
    if(result.state)classicSalvageState=result.state;
    if(!result.ok&&result.reason!=="already-owned") {
      if(ui.c9PurchaseStatus)ui.c9PurchaseStatus.textContent=result.reason==="insufficient-funds"
        ? `Faltan ${result.missing} de chatarra. Recupera restos de las naves enemigas.`
        : result.reason==="prerequisite-required" ? "Instala primero el módulo anterior de esta rama."
        : "No se ha confirmado el pago. La mejora no se aplica; puedes reintentarlo.";
      updateClassicDock();return false;
    }
    const projected=projectClassicSalvageUpgrades();
    if(ui.c9PurchaseStatus)ui.c9PurchaseStatus.textContent=!projected
      ? "Pago guardado. El montaje queda pendiente; al reabrir C9 se reintentará sin cobrar otra vez."
      : sku==="twin-preparation" ? "Emisor preparado. Atlas sigue custodiando la autorización del segundo cañón."
      : sku==="hull-reinforcement" ? "Placas integradas. La reserva de casco ahora admite 45 puntos, sin temporizador."
      : sku==="missile-refill" ? "Misiles cargados. Cada unidad repuesta cuesta 6 de chatarra."
      : NeonCampaign.SCRAP_UPGRADES[sku] ? `${NeonCampaign.SCRAP_UPGRADES[sku].label}: ${NeonCampaign.SCRAP_UPGRADES[sku].description}`
      : "Mejora instalada y guardada.";
    shipPresentationSignature="";flightHudSignature="";updateClassicDock();updateAmmoHud();hud();
    if(projected)tone(720,.10,"triangle",.035);
    return projected;
  }

  function spawnClassicScrap(target) {
    if(!target||target.salvageDropped||!classicSalvageRunId||!classicSalvageState)return null;
    if(target.salvageRunId&&target.salvageRunId!==classicSalvageRunId)return null;
    const boss=target.bossSalvage===true;
    const wreckage=["debris","satellite"].includes(target.type);
    // Enemigos de Gaia y hordas no llevan piloto clásico, pero también sueltan chatarra.
    const enemy=target.classicScout||target.gaiaEnemy||target.hordeUnit;
    if(!boss&&((!enemy&&!wreckage)||target.classicScoutProjectile||target.guardianProjectile))return null;
    const enemyType=boss?(target.salvageRole||"guardian-atlas"):wreckage?target.type:target.salvageRole||target.classicScout?.role||"scout";
    const amount=NeonCampaign.rewardForEnemy(enemyType);
    if(!amount)return null;
    const stage=classicFlightView?.stageId||`${currentLevel+1}.0`;
    const dropId=target.salvageDropId||`${stage}:enemy:${classicSalvageEnemySequence++}`;
    target.salvageDropId=dropId;target.salvageDropped=true;
    if(classicSalvageState.activeRun?.claimed.some(receipt=>receipt.id===dropId))return null;
    if(items.some(item=>item.salvagePickup&&item.runId===classicSalvageRunId&&item.dropId===dropId))return null;
    if(!boss&&items.filter(item=>item.salvagePickup&&!item.bossSalvage).length>=32)return null;
    const item={id:`salvage:${classicSalvageRunId}:${dropId}`,type:"salvage",salvagePickup:true,
      bossSalvage:boss,runId:classicSalvageRunId,dropId,enemyType,amount,
      x:target.x,y:target.y,baseX:target.x,r:18,s:65,vx:0,vy:65,life:boss?4:14,
      rot:0,rs:.12,p:0,phase:0,amp:0,alpha:1};
    items.push(item);return item;
  }

  function collectClassicScrap(item) {
    if(!item?.salvagePickup||!classicSalvageLedger)return false;
    const result=classicSalvageLedger.claimDrop({runId:item.runId,dropId:item.dropId,enemyType:item.enemyType});
    if(!result.ok) {
      if(!item.salvageSaveWarning){item.salvageSaveWarning=true;toast("No se ha guardado la chatarra. La recogida se reintentará sin duplicarla.");}
      return false;
    }
    classicSalvageState=result.state;
    if(!result.duplicate){tone(760,.045,"sine",.025);toast(`+${result.amount} chatarra`);}
    return true;
  }

  // Meteoritos dirigidos del sector (plan F3b): sin pasillo marcado; avisos en el borde.
  let classicAimedRain=null,classicMeteorWarnings=[];
  function resetClassicCometShower() {
    classicCometShower=null;classicCometCorridor=null;classicAimedRain=null;classicMeteorWarnings=[];
    const view=classicFlightView,comets=view&&NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.comets;
    if(!comets)return;
    if(comets==="aimed"){classicAimedRain=NeonCampaign.createAimedMeteorRain({seed:view.stageNumber*811,width:W,height:H});return;}
    classicCometShower=NeonCampaign.createCometShower({width:W,height:H,seed:view.stageNumber*811,
      shipWidth:SHIP_VISUAL.assemblySize,shipSideClearance:119*SHIP_VISUAL.classicScale,
      stageId:view.stageId,elapsed:view.stageElapsed});
  }

  // Lluvia en curso: desde el aviso hasta que sale el último cometa. Mientras
  // dura, el pasillo seguro se dibuja y las patrullas no disparan (J04).
  function cometShowerActive() {
    if(!classicCometCorridor)return false;
    if((classicFlightView?.stageElapsed??Infinity)<classicCometCorridor.until||items.some(item=>item.showerComet))return true;
    classicCometCorridor=null;return false;
  }

  function recoverCampaignCompletion() {
    if(!completionJournal)completionJournal=NeonCampaign.createCompletionJournal({storage,keys:KEYS,
      levelCount:LEVELS.length,checkpointKey:NeonCampaign.CHRONOS_VOYAGE_KEY,
      validateCheckpoint:value=>normalizeClassicVoyageRecord(value)!==null,
      equipmentKey:CLASSIC_EQUIPMENT_KEY,
      validateEquipment:value=>NeonCampaign.normalizeClassicEquipment(value)!==null});
    const result=completionJournal.recover();
    completionPersistenceBlocked=!result.ok;
    if(result.ok) {
      const recovered=NeonCampaign.normalizeClassicEquipment(storage.getJSON(CLASSIC_EQUIPMENT_KEY,null));
      if(recovered)classicEquipment=recovered;
    }
    if(!result.ok)toast("Guardado pendiente: no se sobrescribirá. Reintenta cuando el almacenamiento esté disponible.");
    return result.ok;
  }

  function setupClassicFlight() {
    loadClassicVoyage();
    const raw = storage.getRaw(CLASSIC_EQUIPMENT_KEY);
    if (raw !== null) {
      try {
        const value = JSON.parse(raw);
        const normalized = NeonCampaign.normalizeClassicEquipment(value);
        if (!normalized) throw new Error("Invalid equipment");
        classicEquipment = normalized;
      } catch {
        const backupKey = CLASSIC_EQUIPMENT_KEY + ":invalid-backups";
        const previous = storage.getJSON(backupKey, []);
        const backups = Array.isArray(previous) ? previous.filter(value => typeof value === "string") : [];
        classicEquipmentWritable = backups.includes(raw) || storage.setJSON(backupKey, [...backups, raw]);
      }
    }
    loadClassicSalvage();
    document.body.classList.add("flight-mode");
    const mount = document.createElement("div");
    mount.innerHTML = `<div id="flightHud" class="flight-hud cockpit-flight hidden">
      <section id="flightRoute" class="flight-route hidden" aria-label="Trayecto espacial"><div><small id="flightDestination">CHRONOS → GAIA NOVA</small><b id="flightStage">Recupera el CRONIUM</b></div><progress id="flightDistance" max="1" value="0" aria-label="Recorrido hasta el destino"></progress></section>
      <p id="flightObjective" class="flight-comms" role="status" aria-live="polite" data-active="false"></p>
      <button id="flightWeapon" class="flight-weapon cockpit-control" type="button"><small id="flightWeaponDamage">DAÑO ×1</small><b id="flightWeaponName">PULSO</b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg></button>
      <div id="flightPilotHint" class="flight-pilot-hint" aria-hidden="true"><span></span>DESLIZA PARA MOVER</div>
      <div id="flightPilotStick" class="flight-pilot-stick hidden" aria-hidden="true"><span id="flightPilotKnob"></span></div>
      </div>
      <div id="flightDock" class="overlay" role="dialog" aria-modal="true" aria-labelledby="c9Title"><section class="panel flight-dock cockpit-dialog"><header class="c9-header cockpit-section-head"><span class="chapter-face" data-actor="mira" aria-hidden="true"></span><div><small>C9 · MIRA</small><h2 id="c9Title">Taller de a bordo</h2></div></header><div class="c9-preview"><canvas id="flightDockCanvas" width="384" height="300" aria-label="Nave con su armamento instalado"></canvas><p id="flightDockStatus"></p></div><aside class="cockpit-ledger" aria-label="Bodega de la nave"><small>CHATARRA DISPONIBLE</small><p id="c9Balance" class="c9-wallet" aria-label="Chatarra disponible">0 chatarra</p></aside><div class="c9-upgrades"><button id="flightInstallTwin" class="primary" type="button"><span class="c9-upgrade-art" data-upgrade="emitter" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>PREPARAR EMISOR · 24 CHATARRA</b><small>Segundo cañón · autorización tras Atlas</small></span></button><button id="c9BuyShield" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="hull" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REFUERZO DE CASCO · 30 CHATARRA</b><small>15 puntos de blindaje adicionales</small></span></button><button id="c9BuyMissiles" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="missiles" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REPONER MISILES</b><small>18 de daño · 6 de chatarra por unidad</small></span></button><button id="c9BuyCoolant" class="secondary" type="button"><span class="c9-upgrade-art" data-upgrade="coolant" aria-hidden="true"></span><span class="c9-upgrade-copy"><b data-c9-label>REFRIGERACIÓN · 45 CHATARRA</b><small>Recuperación de energía un 25 % más rápida</small></span></button></div><p id="c9PurchaseStatus" class="c9-purchase-status" role="status"></p><div class="c9-actions"><button id="flightDockContinue" class="secondary" type="button">VOLVER A PILOTAR</button><button id="flightDockHome" class="secondary" type="button">GUARDAR Y VOLVER AL MENÚ</button></div></section></div>`;
    canvas.parentElement.append(mount);
    const chapterControls=document.createElement("div");
    chapterControls.innerHTML=`<button id="classicC9" class="classic-c9 cockpit-control hidden" type="button" aria-label="Abrir taller C9; pausa el viaje"><b>C9</b><span>TALLER</span></button><button id="chapterSkip" class="chapter-skip hidden" type="button">OMITIR INTRODUCCIÓN →</button><button id="classicMissile" class="classic-missile cockpit-control hidden" type="button" aria-label="Lanzar misil"><span class="missile-symbol" aria-hidden="true"></span><span>MISIL <b id="classicMissileCount">3</b></span></button>`;
    canvas.parentElement.append(chapterControls);
    ui.classicC9=$("classicC9");ui.classicC9.onclick=()=>openClassicDock("hud");
    ui.chapterSkip=$("chapterSkip");ui.classicMissile=$("classicMissile");ui.classicMissileCount=$("classicMissileCount");
    ui.chapterSkip.onclick=()=>{
      if(!classicChapterStory?.skipIntro())return;
      // Omitir lleva el mundo al estado posterior a la ruptura (revisión B1):
      // la cinemática se dibuja con el reloj de la ruta, así que se adelanta
      // hasta que Cronos Prime se ha ido, en vez de seguir bajo el HUD.
      const gone=NeonCampaign.CHRONOS_INTRO_TIMELINE?.gone||0;
      for(let i=0;i<2000&&classicFlight&&classicFlightView.elapsed<gone;i++)
        classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);
      classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
      // Fuera la línea de LIRA de antes de la ruptura (revisión R8).
      flightTransmission=null;
      showStoryTransmission("N-7","Los atacantes nos siguen. Saca el CRONIUM de este campo de restos.",4);
      classicPursuitAnnounced.add("raider"); // ya dicho: el primer perseguidor no lo repite (C1)
    };
    // Missile pointer/touch ownership is installed with the other flight
    // controls in 08-loop-input-bootstrap, including accessible click fallback.
    for (const id of ["flightHud","flightRoute","flightDestination","flightStage","flightWeapon","flightWeaponName","flightWeaponDamage","flightDistance","flightObjective","flightPilotHint","flightPilotStick","flightPilotKnob","flightDock","flightDockCanvas","flightDockStatus","flightInstallTwin","c9Balance","c9BuyShield","c9BuyMissiles","c9BuyCoolant","c9PurchaseStatus"]) ui[id] = $(id);
    const calibrate=document.createElement("button");calibrate.id="flightCalibrateLance";calibrate.className="secondary";calibrate.type="button";
    ui.flightInstallTwin.after(calibrate);ui.flightCalibrateLance=calibrate;
    const loadout = document.createElement("div");
    loadout.id="flightLoadoutChoices";loadout.className="flight-loadout-choices";
    loadout.setAttribute("role","group");loadout.setAttribute("aria-label","Arma al salir de C9");
    ui.flightDockStatus.closest('.c9-preview').after(loadout);
    setupClassicWorkshopSections(loadout,calibrate);
    for(const [type,weapon] of Object.entries(NeonCampaign.CLASSIC_WEAPON_RULES.types)) {
      const button=document.createElement("button");button.type="button";button.dataset.flightLoadout=type;
      button.className="cockpit-loadout-card";
      const roles={pulse:"Precisión · una carga",twin:"Dos pulsos centrados",lance:"Perfora dos objetivos",scatter:"Tres pulsos · corta distancia",needle:"Perfora tres objetivos"};
      const art={pulse:"emitter",twin:"emitter",lance:"needle",scatter:"scatter",needle:"needle"};
      button.innerHTML=`<span class="c9-upgrade-art" data-upgrade="${art[type]}" aria-hidden="true"></span><span class="cockpit-loadout-copy"><b>${weapon.label} ×${weapon.damageMultiplier}</b><small>${roles[type]}</small><em data-loadout-state></em></span>`;
      button.onclick=()=>{
        if(!classicEquipment.unlocked.includes(type))return;
        if(persistClassicEquipment({...classicEquipment,selected:type})) {
          updateClassicDock();syncClassicFlightHud();tone(720,.08,"triangle",.035);
        }
      };
      loadout.append(button);
    }
    ui.flightWeapon.onclick = () => {
      if (classicEquipment.unlocked.length < 2) { toast("El segundo cañón se desbloquea al vencer a Atlas"); return; }
      const selected = classicEquipment.unlocked[(classicEquipment.unlocked.indexOf(classicEquipment.selected)+1)%classicEquipment.unlocked.length];
      if (persistClassicEquipment({...classicEquipment, selected})) { tone(selected === "twin" ? 860 : 650, .12, "triangle", .045); syncClassicFlightHud(); }
    };
    $("beaconBuy").onclick=()=>buySectorBeacon();$("beaconSkip").onclick=()=>closeSectorBeacon();
    ui.flightInstallTwin.onclick = () => buyClassicC9Upgrade("twin-preparation");
    ui.c9BuyShield.onclick=()=>buyClassicC9Upgrade("hull-reinforcement");
    ui.c9BuyMissiles.onclick=()=>buyClassicC9Upgrade("missile-refill");
    ui.c9BuyCoolant.onclick=()=>buyClassicC9Upgrade("coolant-feed");
    // Historical Lanza owners keep their weapon; the workshop no longer grants
    // two power tiers for free before the first real guardian.
    calibrate.onclick=()=>{
      if (!classicEquipment.unlocked.includes("lance")) return;
      if (persistClassicEquipment({...classicEquipment,selected:"lance"})) updateClassicDock();
    };
    $("flightDockContinue").onclick = closeClassicDock;
    ui.flightDock.addEventListener("keydown",event=>{
      if(!ui.flightDock.classList.contains("show"))return;
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();closeClassicDock();return;}
      if(event.key!=="Tab")return;
      const controls=[...ui.flightDock.querySelectorAll("button:not(:disabled)")].filter(node=>!node.classList.contains("hidden")&&node.getClientRects().length);
      const first=controls[0],lastControl=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();lastControl?.focus();}
      else if(!event.shiftKey&&document.activeElement===lastControl){event.preventDefault();first?.focus();}
    });
    $("flightDockHome").onclick = goHome;
    const workshop = document.createElement("button"); workshop.id="openFlightDock"; workshop.className="secondary hidden";
    workshop.type="button"; workshop.textContent="FORJA C9"; workshop.onclick=()=>openClassicDock("menu");
    ui.menu.querySelector(".menu-actions")?.append(workshop);
    const stages = document.createElement("section");
    stages.id="chronosStages"; stages.className="chronos-stages cockpit-stage-list hidden";
    stages.innerHTML='<small>CHRONOS → GAIA · TRAMOS DEL VIAJE</small><div id="chronosStageGrid" class="chronos-stage-grid"></div><p id="chronosStagesNote"></p>';
    // La lista va encima del bloque de botones, que queda fijo abajo del panel.
    ($("briefingActions") || $("launch")).before(stages);
    syncClassicFlightHud();
  }

  function setupClassicWorkshopSections(loadout,calibrate) {
    const panel=ui.flightDock.querySelector('.flight-dock');
    $('c9Title').textContent='FORJA C9';
    panel.querySelector('.c9-header small').textContent='MIRA · INGENIERÍA DE A BORDO';
    ui.classicC9.querySelector('span').textContent='FORJA';
    ui.classicC9.setAttribute('aria-label','Abrir Forja C9. Pausa el viaje.');
    const oldGrid=panel.querySelector('.c9-upgrades');
    const nav=document.createElement('nav');nav.className='c9-navigation';nav.setAttribute('aria-label','Secciones de la Forja');
    const sections={};
    for(const [id,label,description] of [
      ['arsenal','01 · ARSENAL','Elige cómo quieres combatir. Comprar no equipa automáticamente.'],
      ['systems','02 · EVOLUCIÓN','Cada conexión requiere el módulo anterior. Tú eliges la rama.'],
      ['supplies','03 · SUMINISTROS','Tres misiles de reserva. Pagas únicamente las unidades que faltan.']]) {
      const section=document.createElement('section');section.id=`c9-${id}`;section.className='c9-section cockpit-workshop-section';
      const heading=document.createElement('h3');heading.textContent=label;heading.className='cockpit-section-title';
      const help=document.createElement('p');help.className='c9-section-help';help.textContent=description;
      const grid=document.createElement('div');grid.className='c9-upgrades';
      section.append(heading,help,grid);sections[id]={section,grid};
      const link=document.createElement('button');link.type='button';link.textContent=label.slice(5);link.setAttribute('aria-controls',section.id);
      link.onclick=()=>{
        for(const other of nav.querySelectorAll('button'))other.removeAttribute('aria-current');
        link.setAttribute('aria-current','true');
        section.scrollIntoView?.({behavior:settings.reduceEffects?'instant':'smooth',block:'start'});
      };
      if(id==='arsenal')link.setAttribute('aria-current','true');
      nav.append(link);oldGrid.before(section);
    }
    ui.c9Balance.closest('.cockpit-ledger').after(nav);
    sections.arsenal.grid.before(loadout);
    for(const node of [ui.flightInstallTwin,ui.c9BuyShield,ui.c9BuyCoolant,calibrate])sections.systems.grid.append(node);
    sections.supplies.grid.append(ui.c9BuyMissiles);
    oldGrid.remove();
    for(const [sku,definition] of Object.entries(NeonCampaign.SCRAP_UPGRADES)) {
      if(['twin-preparation','hull-reinforcement','coolant-feed'].includes(sku))continue;
      const weapon=sku.startsWith('weapon-'),kind=sku.includes('scatter')?'scatter':sku.includes('needle')?'needle':sku.includes('hull')?'hull-ii':'coolant-ii';
      const button=document.createElement('button');button.type='button';button.className='secondary c9-tree-node';button.dataset.c9Sku=sku;
      const art=document.createElement('span');art.className='c9-upgrade-art';art.dataset.upgrade=kind;art.setAttribute('aria-hidden','true');
      const copy=document.createElement('span');copy.className='c9-upgrade-copy';
      const label=document.createElement('b');label.setAttribute('data-c9-label','');label.textContent=definition.label;
      const detail=document.createElement('small');detail.textContent=definition.description;
      const status=document.createElement('em');status.dataset.c9State='';
      copy.append(label,detail,status);button.append(art,copy);button.onclick=()=>buyClassicC9Upgrade(sku);
      (weapon?sections.arsenal:sections.systems).grid.append(button);
    }
    const repeat=document.createElement('button');repeat.type='button';repeat.id='replayFlightTutorial';repeat.className='secondary';repeat.textContent='REPETIR GUÍA DE VUELO';
    repeat.onclick=()=>{
      settings.flightTutorial=null;saveSettings();
      if(classicFlightView){classicTutorial=NeonCampaign.createFlightTutorial({routeElapsed:classicFlightView.elapsed,replay:true});classicTutorialAnchor={x:player.x,y:player.y};}
      repeat.textContent='GUÍA PREPARADA · VUELVE AL VUELO';
    };
    sections.supplies.section.append(repeat);
    $('replayTutorialSettings').onclick=()=>{
      repeat.click();toast('Guía de vuelo preparada. Aprenderás maniobrando en el viaje.');
    };
    const tree=sections.systems.grid;tree.classList.add('c9-skill-tree');
    for(const [label,first,next] of [
      ['BLINDAJE','hull-reinforcement','hull-plating-ii'],['REFRIGERACIÓN','coolant-feed','coolant-feed-ii'],
      ['ABANICO · CONVERGENCIA',null,'scatter-focus'],['AGUJA · RESONANCIA',null,'needle-resonance']]) {
      const branch=document.createElement('div');branch.className='c9-branch';
      const name=document.createElement('h4');name.textContent=label;branch.append(name);
      if(first)branch.append(first==='hull-reinforcement'?ui.c9BuyShield:ui.c9BuyCoolant);
      const node=tree.querySelector(`[data-c9-sku="${next}"]`);if(node)branch.append(node);
      tree.append(branch);
    }
  }

  function normalizeClassicVoyageRecord(value) {
    try {
      const checkpoint=NeonCampaign.normalizeChronosVoyageCheckpoint(value?.checkpoint,{goal:LEVELS[0].goal});
      if(value?.version!==2 || !checkpoint || !Number.isInteger(value.unlockedStage) || value.unlockedStage<checkpoint.stageNumber || value.unlockedStage>10 ||
        typeof value.completed!=="boolean" || (value.completed && checkpoint.stageNumber!==10) ||
        !Number.isFinite(value.entry?.hull) || value.entry.hull<=0 || value.entry.hull>100 ||
        !Number.isInteger(value.entry?.score) || value.entry.score<0 ||
        !Number.isFinite(value.entry?.maxCombo) || value.entry.maxCombo<1 || value.entry.maxCombo>12 ||
        value.entry?.collected!==checkpoint.collected)throw new Error("Invalid voyage save");
      if(value.entry.reserve!==undefined&&(!Number.isFinite(value.entry.reserve)||value.entry.reserve<0||value.entry.reserve>65))throw new Error("Invalid hull reserve");
      if(value.entry.missed!==undefined&&(!Number.isInteger(value.entry.missed)||value.entry.missed<0))throw new Error("Invalid missed count");
      return {...value,checkpoint,chapter:value.chapter?NeonCampaign.normalizeChronosChapterCheckpoint(value.chapter):null};
    } catch {return null;}
  }

  function loadClassicVoyage() {
    const key=NeonCampaign.CHRONOS_VOYAGE_KEY,raw=storage.getRaw(key);
    if(raw===null)return;
    let normalized=null;
    try {normalized=normalizeClassicVoyageRecord(JSON.parse(raw));} catch {}
    if(normalized)classicVoyageRecord=normalized;
    else {
      const backup=key+":invalid-backups",previous=storage.getJSON(backup,[]);
      const copies=Array.isArray(previous)?previous.filter(value=>typeof value==="string"):[];
      classicVoyageWritable=copies.includes(raw)||storage.setJSON(backup,[...copies,raw]);
    }
  }

  // Al reanudar o reintentar un tramo se restaura el casco guardado a su
  // entrada, pero nunca por debajo de este mínimo: si se entró al tramo de
  // Atlas casi destruido, cada reintento sería una derrota segura. Valor de
  // trabajo reversible; el guardado conserva el casco real de entrada.
  const CLASSIC_RESUME_HULL_FLOOR = 50;

  function classicVoyageCheckpointRecord(checkpoint,completed=false) {
    if(!checkpoint)return null;
    const previous=classicVoyageRecord;
    const entry=completed && previous ? previous.entry : {
      hull:Math.max(1,Math.min(100,hull)),reserve:classicHullReserve,score:Math.max(0,Math.floor(score)),maxCombo,collected:checkpoint.collected,
      // CRONIUM perdido, como en los viajes del mapa (auditoría L03).
      missed:Math.max(0,energySpawned-collected-items.filter(item=>item.type==="energy").length)};
    return {version:2,checkpoint,entry,chapter:classicChapterStory?.checkpoint()||null,unlockedStage:Math.max(previous?.unlockedStage||1,checkpoint.stageNumber),completed};
  }

  function saveClassicVoyageCheckpoint(checkpoint,completed=false) {
    if(!checkpoint)return false;
    if(isSectorRun()){
      const save=loadSectorSave();
      if(!save.run)return false;
      const next=NeonCampaign.enterStage(save,checkpoint.stageNumber,hull),saved=saveSector(next);
      // El hangar queda abierto al pasar por el tramo 6, aunque luego mueras.
      if(saved)rememberMenuUnlocks(NeonCampaign.menuView(next,loadMenuUnlocks()).unlocks);
      return saved;
    }
    if(classicSideVoyage)return saveSideVoyage(checkpoint,completed);
    if(completionPersistenceBlocked&&!recoverCampaignCompletion())return false;
    const record=classicVoyageCheckpointRecord(checkpoint,completed);
    // New route data has its own key. Old classic/N-7 saves are never inferred,
    // renumbered or replaced. Invalid raw data is backed up before any write.
    const saved=classicVoyageWritable&&storage.setJSON(NeonCampaign.CHRONOS_VOYAGE_KEY,record);
    classicVoyageRecord=record;
    if(!saved)toast("No se pudo guardar esta etapa. El guardado anterior sigue conservado.");
    return saved;
  }

  function buildChronosStageGrid() {
    const section=$("chronosStages");if(!section)return;
    section.classList.toggle("hidden",pendingLevel!==0);
    if(pendingLevel!==0)return;
    const selected=classicVoyageRequestedStage||(!classicVoyageRecord?.completed?classicVoyageRecord?.checkpoint.stageNumber:1)||1;
    const unlocked=classicVoyageRecord?.unlockedStage||1,grid=$("chronosStageGrid");grid.innerHTML="";
    for(const stage of NeonCampaign.CHRONOS_VOYAGE_STAGES){
      const number=stage.number||stage.stageNumber||Number(stage.id.split(".")[1]);
      const button=document.createElement("button");button.type="button";button.dataset.voyageStage=String(number);
      button.disabled=number>unlocked;button.classList.toggle("selected",number===selected);
      button.setAttribute("aria-pressed",String(number===selected));
      button.className=`cockpit-stage${number===selected?" selected":""}`;
      const identifier=document.createElement("small");identifier.className="cockpit-stage-number";identifier.textContent=`1.${number}`;
      const name=document.createElement("b");name.textContent=stage.name;
      const status=document.createElement("span");status.className="cockpit-stage-state";
      status.textContent=number>unlocked?"BLOQUEADO":number===selected?"SELECCIONADO":"DISPONIBLE";
      button.append(identifier,name,status);
      button.setAttribute("aria-label",`Tramo 1.${number}. ${stage.name}. ${status.textContent.toLowerCase()}.`);
      button.onclick=()=>{classicVoyageRequestedStage=number;buildChronosStageGrid();};
      grid.append(button);
    }
    $("chronosStagesNote").textContent=`Tramo 1.${selected} · ${unlocked}/10 disponibles. Reanudas desde la entrada del tramo guardado.`;
    const stage=NeonCampaign.CHRONOS_VOYAGE_STAGES[selected-1];
    ui.briefingSector.textContent=`TRAMO 1.${selected} · CHRONOS → GAIA`;
    ui.briefingName.textContent=stage.name;
    ui.briefingZone.textContent=`${stage.origin} → ${stage.destination}`;
    ui.briefingGoal.textContent=`${stage.goal}/36 CRONIUM`;
    ui.briefingSupply.textContent="Rastro recuperable";
    ui.briefingMission.textContent=stage.objective+". La ruta continúa desde el último punto de etapa guardado.";
  }

  function beginClassicVoyageService() {
    if(state!=="playing"||classicFlightView?.waitingFor!=="service")return;
    // Preserve the v2 route checkpoint and one emergency repair, without
    // inserting an orbital station or forcing a workshop/modal interruption.
    signalClassicChapter("c9-arrival");
    hull=100;
    classicFlight.resolveService(classicFlightEvent);classicFlightView=classicFlight.snapshot();
    signalClassicChapter("c9-departure");
    saveClassicVoyageCheckpoint(classicFlight.exportCheckpoint());hud();
    offerSectorBeacon();
  }

  // Baliza de reaparición (plan F3c): se ofrece en la parada de C9 si el CH-03
  // cayó en este intento y el sector no la tiene. La partida queda en pausa.
  // El recibo lleva el id de la partida de chatarra: reintentar no cobra dos veces.
  let sectorBeaconOffered=false;
  function offerSectorBeacon() {
    if(!isSectorRun()||!ch03Beaten||sectorBeaconOffered||state!=="playing")return false;
    if(loadSectorSave().sectors[classicSideVoyage.ficha.sector]?.beacon)return false;
    sectorBeaconOffered=true;
    if(typeof resetGameInput==="function")resetGameInput();
    NeonCampaign.endFlightInput(classicFlightInput);
    setState("paused");pauseStartedAt=performance.now();
    const price=NeonCampaign.SCRAP_CONSUMABLES["sector-beacon"].price,balance=classicSalvageState?.balance??0;
    const buy=$("beaconBuy");
    buy.disabled=!classicSalvageLedger||balance<price;
    buy.textContent=balance<price?`FALTAN ${price-balance} CHATARRA`:`COMPRAR · ${price} CHATARRA`;
    $("beaconStatus").textContent=balance<price?"Recupera restos de las naves enemigas para la próxima vez.":"";
    overlay(ui.beaconOffer);return true;
  }
  function buySectorBeacon() {
    if(!classicSalvageLedger||!classicSalvageRunId||!isSectorRun())return false;
    const result=classicSalvageLedger.buyConsumable({transactionId:`beacon:${classicSalvageRunId}`,sku:"sector-beacon"});
    if(result.state)classicSalvageState=result.state;
    if(!result.ok) {
      $("beaconStatus").textContent=result.reason==="insufficient-funds"
        ? `Faltan ${result.missing} de chatarra.` : "No se ha confirmado el pago. Puedes reintentarlo.";
      return false;
    }
    const sector=classicSideVoyage.ficha.sector;
    if(!saveSector(NeonCampaign.buyBeacon(loadSectorSave(),sector))) {
      $("beaconStatus").textContent="Pago guardado. Pulsa otra vez para activar la baliza sin volver a cobrar.";
      return false;
    }
    tone(720,.10,"triangle",.035);updateAmmoHud();
    closeSectorBeacon();return true;
  }
  function closeSectorBeacon() {
    if(state!=="paused"||!ui.beaconOffer.classList.contains("show"))return;
    // Pagada pero sin guardar en el sector (fallo de escritura): se reintenta
    // al salir, así seguir sin pulsar otra vez no pierde el pago.
    const sector=classicSideVoyage.ficha.sector,save=loadSectorSave();
    if(classicSalvageState?.lastConsumable?.id===`beacon:${classicSalvageRunId}`&&!save.sectors[sector]?.beacon)saveSector(NeonCampaign.buyBeacon(save,sector));
    if(typeof resetGameInput==="function")resetGameInput();
    setState("playing");overlay();last=performance.now();resumeAudio();
    grantResumeGrace();syncClassicFlightHud();hud();
  }

  function resumeClassicVoyageService() {
    if(flightDockReturn!=="voyage"||state!=="paused"||!classicFlight)return;
    if(typeof resetGameInput==="function")resetGameInput();
    setState("playing");overlay();last=performance.now();
    signalClassicChapter("c9-departure");
    classicFlight.resolveService(classicFlightEvent);classicFlightView=classicFlight.snapshot();
    saveClassicVoyageCheckpoint(classicFlight.exportCheckpoint());
    applyClassicSalvageShield();
    syncClassicFlightHud();hud();resumeAudio();
  }

  function persistClassicEquipment(next) {
    if (!classicEquipmentWritable || !storage.setJSON(CLASSIC_EQUIPMENT_KEY,next)) { toast("No se pudo guardar la pieza. Puedes reintentarlo."); return false; }
    classicEquipment = {...next,unlocked:[...next.unlocked]};
    if (classicWeapons) {
      for (const type of next.unlocked) NeonCampaign.unlockClassicWeapon(classicWeapons,type);
      NeonCampaign.selectClassicWeapon(classicWeapons,next.selected);
    }
    if (["twin","lance"].includes(next.selected)) ensureSprite(SPRITES.flightWeapons);
    if (next.selected === "lance") SPRITE_GROUPS.phaser.forEach(ensureSprite);
    shipPresentationSignature="";
    $("openFlightDock")?.classList.toggle("hidden",!next.recoveredTwin);
    return true;
  }

  function openClassicDock(from="menu") {
    if(from==="hud") {
      if(state!=="playing"||atlasBoss||classicChapterControlsLocked())return false;
      if(typeof resetGameInput==="function")resetGameInput();
      NeonCampaign.endFlightInput(classicFlightInput);
      setState("paused");pauseStartedAt=performance.now();classicWorkshopOpened=true;
    } else if(state!=="menu")return false;
    flightDockReturn=from; updateClassicDock(); overlay(ui.flightDock);
    $("flightDockContinue").focus({preventScroll:true});
    ui.flightDock.querySelector(".flight-dock").scrollTop=0;
    // Se abre arriba, en ARSENAL: la pestaña marcada tiene que ser esa (revisión tras el PR #56).
    for(const tab of ui.flightDock.querySelectorAll(".c9-navigation button"))
      tab.getAttribute("aria-controls")==="c9-arsenal"?tab.setAttribute("aria-current","true"):tab.removeAttribute("aria-current");
    return true;
  }

  function closeClassicDock() {
    if(flightDockReturn==="hud"&&state==="paused") {
      if(typeof resetGameInput==="function")resetGameInput();
      setState("playing");overlay();last=performance.now();resumeAudio();
      grantResumeGrace(); // misma gracia que al salir de la pausa (B04)
      syncClassicFlightHud();ui.classicC9?.focus({preventScroll:true});return;
    }
    if(flightDockReturn==="voyage"){resumeClassicVoyageService();return;}
    // Sin niveles clásicos: volver de la Forja nunca abre la ficha de otro nivel.
    goHome();$("openFlightDock")?.focus();
  }

  function setC9Label(button,text) {
    const label=button.querySelector("[data-c9-label]");
    if(label)label.textContent=text;else button.textContent=text;
  }

  function updateClassicDock() {
    loadClassicSalvage();
    const installed=classicEquipment.unlocked.includes("twin");
    const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
    const ownedUpgrades=classicSalvageState?.upgrades||[];
    const tuning={scatter:ownedUpgrades.includes('scatter-focus'),needle:ownedUpgrades.includes('needle-resonance')};
    const selectedUpgrade=tuning[classicEquipment.selected]?NeonCampaign.SCRAP_UPGRADES[classicEquipment.selected==='scatter'?'scatter-focus':'needle-resonance']:null;
    const purchasedWeapon=classicEquipment.unlocked.some(id=>id==='scatter'||id==='needle');
    ui.flightDockStatus.textContent=installed||purchasedWeapon
      ? `${weapon.label}${selectedUpgrade?' II':''} equipado. ${selectedUpgrade?.description||weapon.description} Puedes cambiar de arma antes de volver al vuelo.`
      : classicEquipment.twinPrepared ? "Emisor preparado. Conservas Pulso hasta vencer a Atlas: su autorización desbloquea el segundo cañón."
      : classicEquipment.recoveredTwin ? "Emisor recuperado. Prepáralo por 24 de chatarra; vencer a Atlas autoriza el segundo cañón."
      : "Pulso central equipado. Recupera el módulo de Chronos para desarrollar tu nave.";
    for(const button of $("flightLoadoutChoices").querySelectorAll("button")) {
      const type=button.dataset.flightLoadout,unlocked=classicEquipment.unlocked.includes(type);
      button.disabled=!unlocked;button.setAttribute("aria-pressed",String(type===classicEquipment.selected));
      button.querySelector('[data-loadout-state]').textContent=type===classicEquipment.selected?'EQUIPADA':unlocked?'EQUIPAR':type==='twin'?'REQUIERE ATLAS':'SIN ADQUIRIR';
      button.title=unlocked?NeonCampaign.CLASSIC_WEAPON_RULES.types[type].description:type==="twin"?"Supera a Guardian Atlas":"Una frontera posterior desbloquea esta arma";
      button.classList.toggle('hidden',type==='lance'&&!unlocked);
      button.title=type==='scatter'||type==='needle' ? unlocked?NeonCampaign.CLASSIC_WEAPON_RULES.types[type].description:'Disponible en el arsenal de la Forja':button.title;
      if(type==='scatter'||type==='needle') {
        button.querySelector('b').textContent=`${NeonCampaign.CLASSIC_WEAPON_RULES.types[type].label}${tuning[type]?' II':''} ×${NeonCampaign.CLASSIC_WEAPON_RULES.types[type].damageMultiplier}`;
        button.querySelector('small').textContent=type==='scatter'?(tuning[type]?'Tres pulsos · alcance ampliado':'Tres pulsos · corta distancia'):
          tuning[type]?'Perfora cuatro · cadencia mejorada':'Perfora tres objetivos';
      }
    }
    const balance=classicSalvageState?.balance??0,upgrades=classicSalvageState?.upgrades||[];
    ui.c9Balance.textContent=classicSalvageState ? NeonCampaign.formatDenominations(balance).label : "Bodega no disponible · compras protegidas";
    ui.c9Balance.title="100.000 chatarra = 1 plata · 100 plata = 1 oro · 10 oro = 1 estelar";
    ui.flightInstallTwin.disabled=!classicSalvageState || !classicEquipmentWritable || balance<24 || installed || !classicEquipment.recoveredTwin || Boolean(classicEquipment.twinPrepared);
    setC9Label(ui.flightInstallTwin,installed ? "SEGUNDO CAÑÓN AUTORIZADO" : classicEquipment.twinPrepared ? "EMISOR PREPARADO · FALTA ATLAS" : "PREPARAR EMISOR · 24 CHATARRA");
    ui.c9BuyShield.disabled=!classicSalvageState||balance<30||upgrades.includes("hull-reinforcement");
    setC9Label(ui.c9BuyShield,upgrades.includes("hull-reinforcement")?"REFUERZO DE 45 INSTALADO":"AMPLIAR REFUERZO A 45 · 30 CHATARRA");
    ui.c9BuyShield.title="Añade 15 puntos de placas de casco. El refuerzo se consume por impactos, sin temporizador.";
    const missingMissiles=Math.max(0,3-(classicSalvageState?.missileAmmo??0)),missilePrice=missingMissiles*6;
    ui.c9BuyMissiles.disabled=!classicSalvageState||!missingMissiles||balance<missilePrice;
    setC9Label(ui.c9BuyMissiles,missingMissiles?`REPONER ${missingMissiles} MISIL${missingMissiles>1?"ES":""} · ${missilePrice} CHATARRA`:"TRES MISILES CARGADOS");
    ui.c9BuyMissiles.title="Cada misil repuesto cuesta 6 de chatarra. No se cobra una carga que ya tienes.";
    ui.c9BuyCoolant.disabled=!classicSalvageState||balance<45||upgrades.includes("coolant-feed");
    setC9Label(ui.c9BuyCoolant,upgrades.includes("coolant-feed")?"REFRIGERACIÓN INSTALADA":"REFRIGERACIÓN · 45 CHATARRA");
    ui.c9BuyCoolant.title="Recupera un proyectil cada 1,5 segundos; no cambia el daño ni la cadencia.";
    ui.flightCalibrateLance.classList.toggle("hidden",!classicEquipment.unlocked.includes("lance"));
    ui.flightCalibrateLance.disabled=classicEquipment.selected==="lance";
    ui.flightCalibrateLance.textContent="EQUIPAR LANZA ×3 CONSERVADA";
    for(const button of ui.flightDock.querySelectorAll('[data-c9-sku]')) {
      const sku=button.dataset.c9Sku,definition=NeonCampaign.SCRAP_UPGRADES[sku],owned=upgrades.includes(sku);
      const required=definition.requires||[];
      const requirements=Array.isArray(required)?required:[required];
      const missing=requirements.filter(id=>!upgrades.includes(id));
      button.disabled=!classicSalvageState||owned||missing.length>0||balance<definition.price||!classicEquipmentWritable;
      button.dataset.nodeState=owned?'installed':missing.length?'locked':'available';
      setC9Label(button,definition.label.toUpperCase());
      button.querySelector('[data-c9-state]').textContent=owned?'INSTALADO':missing.length
        ?`REQUIERE ${missing.map(id=>NeonCampaign.SCRAP_UPGRADES[id]?.label||id).join(' + ')}`:`${definition.price} CHATARRA`;
    }
    $("flightDockContinue").textContent=["voyage","hud"].includes(flightDockReturn) ? "VOLVER A PILOTAR →" : "VOLVER AL VIAJE";
  }

  function syncClassicFlightHud() {
    if (!ui.flightRoute) return;
    $("openFlightDock")?.classList.toggle("hidden",!classicEquipment.recoveredTwin);
    const view=classicFlightView;
    if(ui.classicC9){
      const c9Recovered=Boolean(classicEquipment.recoveredTwin),c9Blocked=Boolean(atlasBoss);
      ui.classicC9.disabled=state!=="playing"||c9Blocked;
      ui.classicC9.classList.toggle("hidden",!c9Recovered||c9Blocked||ui.flightHud.classList.contains("hidden"));
      ui.classicC9.title=!c9Recovered?"Recupera primero el módulo C9":c9Blocked?"C9 no está disponible durante el bloqueo de Atlas":"Taller C9 · pausa el viaje para configurar tu nave";
    }
    ui.flightPilotHint?.classList.toggle("hidden",Boolean(classicEquipment.recoveredTwin));
    const stage=atlasBoss ? "ACCESO ATLAS" : view?.stageNumber ? `${view.stageId} · ${view.stageName}` : view?.stageName || level().name;
    // The primary HUD already shows the quota. This reserved, transparent slot
    // is used only for brief contextual comms; it never repeats the counters.
    const tutorialView=typeof classicTutorial!=="undefined"?classicTutorial?.snapshot():null;
    let guide=!atlasBoss&&state==='playing'?tutorialView?.active:null;
    // Revisión G1: una lección de un paso (target 1) se ve sus segundos, se
    // oculta y vuelve una sola vez a los 30 s de juego; sin «· 0 %».
    if(guide&&guide.target===1&&!flightTransmission) {
      if(classicGuideSeen?.id!==guide.id)classicGuideSeen={id:guide.id,at:elapsed};
      const since=elapsed-classicGuideSeen.at,seconds=guide.seconds||4;
      if(!(since<seconds||(since>=30&&since<30+seconds)))guide=null;
    }
    const objective=flightTransmission ? `${flightTransmission.speaker}: ${flightTransmission.text}` : guide ? (guide.target>1&&guide.progress>0?`${guide.text} · ${Math.round(guide.progress*100)} %`:guide.text) : "";
    const signature=[currentLevel,stage,objective,collected,Math.floor((view?.routeProgress||0)*1000),classicEquipment.selected,classicWeapons?.charges,Math.floor((classicWeapons?.recharge||0)*5)].join(":");
    if(signature===flightHudSignature)return;
    flightHudSignature=signature;
    ui.flightStage.textContent=stage;
    if(ui.flightObjective.textContent!==objective) {
      ui.flightObjective.replaceChildren();
      if(["lira","mira","iria"].includes(flightTransmission?.speakerId)) {
        const face=document.createElement("span");face.className="chapter-face";
        face.dataset.actor=flightTransmission.speakerId;face.setAttribute("aria-hidden","true");ui.flightObjective.append(face);
      }
      const text=document.createElement("span");text.textContent=objective;ui.flightObjective.append(text);
    }
    ui.flightObjective.dataset.active=String(Boolean(flightTransmission||guide));
    ui.flightObjective.classList.toggle('tutorial-active',Boolean(!flightTransmission&&guide));
    ui.flightDestination.textContent=classicSideVoyage ? `TRAMO ${view?.stageNumber||1}/${view?.distance?.stages||1}`
      : currentLevel===0 ? `CHRONOS → GAIA · ${view?.stageNumber||1}/10` : `${level().world} · RASTRO ${currentLevel+1}/10`;
    ui.flightDistance.value=view ? view.routeProgress : collected/level().goal;
    ui.flightDistance.setAttribute("aria-label",view ? "Recorrido hasta el destino" : "CRONIUM recuperado");
    ui.flightDistance.setAttribute("aria-valuetext",view ? `Etapa ${view.stageNumber||1} de ${view.distance?.stages||10}. ${Math.round(view.routeProgress*100)}% del recorrido` : `${collected} de ${level().goal} fragmentos`);
    const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
    ui.flightWeaponName.textContent=weapon.label.toUpperCase();
    ui.flightWeaponDamage.textContent=`DAÑO ×${weapon.damageMultiplier}`;
    ui.flightWeapon.title=weapon.description;
    ui.flightWeapon.dataset.switchable=String(classicEquipment.unlocked.length>1);
    ui.flightWeapon.classList.toggle("hidden",classicEquipment.unlocked.length<2);
    ui.flightWeapon.setAttribute("aria-label",`Cambiar arma. ${weapon.label}. ${weapon.description}`);
    updateAmmoHud();
  }

  function advanceClassicTutorial() {
    // Durante la animación del inicio no hay tutorial: empieza al aparecer la nave.
    if(!classicTutorial||!classicFlightView||classicChapterControlsLocked())return;
    classicTutorial.advance({elapsed:classicFlightView.elapsed,playing:state==='playing',
      shots:classicWeapons?.shotSequence||0,collected,workshopOpened:classicWorkshopOpened,
      moduleRecovered:Boolean(classicEquipment.recoveredTwin),missilesFired:classicSalvageState?.missileShotsSpent||0,
      missileReady:(classicSalvageState?.missileAmmo||0)>0,
      missileOpportunity:items.some(item=>isThreat(item)&&item.y<player.y&&Math.abs(item.x-player.x)<90),
      bossActive:Boolean(atlasBoss),channelBusy:Boolean(flightTransmission)},cue=>{
        flightTransmission={speaker:'N-7 · GUÍA',text:cue.text,remaining:cue.seconds};
        flightHudSignature='';
      });
    const checkpoint=classicTutorial.checkpoint(),signature=JSON.stringify(checkpoint);
    if(signature!==classicTutorialSignature){
      settings.flightTutorial=checkpoint;
      if(saveSettings())classicTutorialSignature=signature;
    }
    syncClassicFlightHud();
  }

  function setClassicFlightHudVisible(visible) {
    ui.flightHud?.classList.toggle("hidden",!visible);
    ui.classicMissile?.classList.toggle("hidden",!visible);
    ui.classicC9?.classList.toggle("hidden",!visible||!classicEquipment.recoveredTwin||Boolean(atlasBoss));
    ui.flightWeapon?.classList.toggle("hidden",!visible||classicEquipment.unlocked.length<2);
    ui.flightPilotHint?.classList.toggle("hidden",!visible||Boolean(classicEquipment.recoveredTwin));
    if(!visible)ui.chapterSkip?.classList.add("hidden");
    ui.flightRoute?.classList.toggle("hidden",!visible || Boolean(atlasBoss));
  }

  function classicFlightEvent(event) {
    if(event.type==="checkpoint") {
      classicFlightView=classicFlight.snapshot();
      // Initial assets can finish loading after the player has already fired.
      // Route markers are not scene resets: already visible debris, enemies and
      // real shots keep flying across the boundary. C9 clears its safe dock only.
      classicVoyageStageId=classicFlightView.stageId;
      classicVoyageSpawnTimer=1;classicVoyageHazardTimer=10;
      classicPatrolTimer=classicFlightView.stageNumber===1?4:7;classicCometSequence=0;classicHordeTimer=null;
      classicSalvageEnemySequence=0;resetClassicCometShower();applyClassicSalvageShield();
      resetSectorAttackTokens();
      saveClassicVoyageCheckpoint(event.checkpoint);
    }
    if(event.type==="stage-start") {
      classicFlightView=classicFlight.snapshot();
      if(!classicChapterStory)showStoryTransmission(`TRAYECTO ${classicFlightView.stageId}`,
        `${classicFlightView.stageName} · ${classicFlightView.stageObjective}`,3.2);
      hud();
    }
    if(event.type==="service") { classicFlightView=classicFlight.snapshot();beginClassicVoyageService(); }
    if(event.type==="attack"&&!classicChapterStory) { showStoryTransmission("CONTROL CHRONOS","Nave sin identificación. Está cargando sus armas contra el reactor.",5); tone(180,.25,"sawtooth",.045); }
    if(event.type==="rupture") {
      // The authored reactor/wave layers own this blue temporal rupture. A
      // generic orange/pink combat explosion used to obscure its structure.
      levelOneShockwaveTriggered=true;
      shake=8;stormPulse=.18;tone(72,.5,"sawtooth",.05);
      if(!classicChapterStory)showStoryTransmission("N-7","¡Chronos ha sido alcanzado! Recupera el CRONIUM. Los atacantes siguen en la zona.",6);
    }
    if(event.type==="departure") { if(!classicChapterStory)showStoryTransmission("N-7","Chronos queda atrás. La primera señal conduce a Gaia Nova.",4.6); classicPatrolTimer=.6; }
    if(event.type==="twin-module-marker" && !classicEquipment.recoveredTwin) {
      items.push({type:"flightModule",x:W*.66,baseX:W*.66,y:H*.33,r:29,s:95,rot:0,rs:.12,p:0,phase:0,amp:0,alpha:1});
      showStoryTransmission("MIRA · C9","Hay un emisor gemelo entre los restos. Rescátalo: puedo montarlo en tu nave.",5.5);
    }
    if(event.type==="gaia-beacon") showStoryTransmission("IRIA · GAIA","Tu identificación coincide con el convoy atacante. Atlas exige que detengas los motores.",5);
  }

  // Auditoría B01: el pasillo marcado se vacía de todo lo que no sea cometa:
  // peligros y disparos que entran en él, de frente o de lado. Corre después
  // de mover los objetos, así que no necesita margen (A3).
  function clearCometCorridor() {
    if(!cometShowerActive())return;
    const c=classicCometCorridor.corridor;
    for(let i=items.length-1;i>=0;i--) {
      const item=items[i];
      if(!(item.classicScoutProjectile||(isThreat(item)&&!item.showerComet&&!item.flightPatrol&&!item.classicScout)))continue;
      // Solo lo que tiene el centro dentro del pasillo (A2/C2) y ya toca su
      // zona marcada (P01). La rotura se dibuja sobre la línea y dentro de la
      // propia roca, nunca por encima (A3).
      if(item.x<=c.left||item.x>=c.right||item.y+item.r<=c.top)continue;
      // Lo que se ve no se esfuma: un peligro se rompe con su explosión
      // normal y un disparo con chispas cálidas, nunca cian (R2, C5).
      const breakY=Math.max(item.y,c.top);
      if(item.classicScoutProjectile)burst(item.x,breakY,6,"red");else addExplosion(item.x,breakY,.7,.5);
      items.splice(i,1);
    }
  }

  function advanceClassicFlight(dt) {
    const introBefore=classicFlightView?.elapsed;
    // Mientras el subjefe CH-03 vive, la ruta no avanza (plan F3c).
    if(ch03Holds())return;
    if(classicFlight) classicFlightView=classicFlight.advance(dt,collected,classicFlightEvent);
    // Auditoría J05: en un viaje del mapa, con la cuota del tramo cumplida y
    // 20 s jugados, el reloj del tramo corre al triple para no dejar tiempo
    // muerto. Los eventos siguen en orden. S1-V1 no: su capítulo va narrado.
    // Un tramo con lluvia de cometas tampoco, para no cortar sus tandas (M2).
    const view=classicFlightView;
    if(classicSideVoyage&&view&&!view.canFinish&&view.stageElapsed>=20&&collected>=view.stageGoal&&
      !NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.comets)
      for(let i=0;i<2;i++)classicFlightView=classicFlight.advance(dt,collected,classicFlightEvent);
    // Cronos Prime: suena al frenar sobre la estación, al empezar a alimentarse y al disparar.
    const timeline=NeonCampaign.CHRONOS_INTRO_TIMELINE;
    if(timeline&&Number.isFinite(introBefore)&&classicFlightView) {
      for(const cue of [timeline.arrive,timeline.drain,timeline.beamStart])
        if(introBefore<cue&&classicFlightView.elapsed>=cue)combatSound("atlas-charge",W*.5);
    }
    classicShipEntry=Math.max(0,classicShipEntry-dt);
    if(classicChapterStory&&classicFlightView) {
      classicChapterStory.advance({elapsed:classicFlightView.elapsed,playing:state==="playing"},classicChapterEvent);
      classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
      advanceClassicTutorial();
    }
    if(classicFlightView?.stageNumber) {
      // Revisiones G5 y R6: si el reloj del tramo acaba sin la cuota, el viaje
      // espera; el HUD cuenta la cuota del tramo y N-7 dice cuánto CRONIUM
      // falta, y lo repite cada 10 s de juego mientras siga esperando.
      const wait=classicFlightView;
      if(ui.goal.textContent!==croniumGoalLabel())ui.goal.textContent=croniumGoalLabel();
      const goalTag=ui.goal.previousElementSibling,tag=wait.waitingFor==="cronium"?"TRAMO":"CRONIUM";
      if(goalTag&&goalTag.textContent!==tag)goalTag.textContent=tag;
      // El aviso con la cuenta se retira en cuanto cambia el CRONIUM o acaba la
      // espera, para no contradecir al HUD (revisión C3).
      if(classicCroniumWaitShown!==null&&flightTransmission?.text===classicCroniumWaitShown.text&&
        (collected!==classicCroniumWaitShown.collected||wait.waitingFor!=="cronium")) {
        flightTransmission=null;classicCroniumWaitShown=null;syncClassicFlightHud();
      }
      if(state==="playing"&&wait.waitingFor==="cronium"&&!flightTransmission&&
        (classicCroniumWaitNotice!==wait.stageId||elapsed-classicCroniumWaitAt>=10)) {
        classicCroniumWaitNotice=wait.stageId;classicCroniumWaitAt=elapsed;
        const missing=Math.max(1,wait.stageGoal-collected);
        const text=`${missing===1?"Falta 1":`Faltan ${missing}`} CRONIUM para seguir al siguiente tramo.`;
        showStoryTransmission("N-7",text,4);classicCroniumWaitShown={text,collected};
      }
      if(state==="playing" && !atlasBoss && !ch03Holds() && classicFlightView.waitingFor!=="service") advanceClassicVoyageEncounters(dt);
      syncClassicFlightHud();return;
    }
    if(classicFlightView?.routeProgress>=.30 && classicFlightView.routeProgress<.82) {
      classicPatrolTimer-=dt;
      if(classicPatrolTimer<=0) {
        if(items.filter(item=>item.flightPatrol).length<2) spawnClassicFlightPatrol();
        classicPatrolTimer=9;
      }
    }
    if(classicFlightView) {
      const crossings=[.46,.61,.76],progress=classicFlightView.routeProgress;
      const threshold=crossings[classicCometSequence];
      if(threshold!==undefined && progress>=threshold-.025 && classicCometWarning!==classicCometSequence) {
        classicCometWarning=classicCometSequence;
        showStoryTransmission("N-7","Cometa por babor. Cruza en diagonal; mantén libre su trayectoria.",2.4);
      }
      if(threshold!==undefined && progress>=threshold) {
        classicCometSequence++;
        items.push({id:`chronos-comet:${classicCometSequence}`,type:"meteor",flightComet:true,
          x:-45,y:H*.16,baseX:-45,vx:62,vy:82,r:18,s:82,damage:14,hp:2,maxHp:2,
          special:"comet",spriteKey:"comet",rot:Math.atan2(82,62),rs:0,p:0,phase:classicCometSequence,amp:0,alpha:1,life:16});
      }
    }
    syncClassicFlightHud();
  }

  function advanceClassicVoyageEncounters(dt) {
    const view=classicFlightView,n=view.stageNumber;
    // Los 9 s de espera son el inicio de Chronos (S1-V1 y el sector 1, recoveryAt).
    // Los viajes del mapa no tienen ese inicio: su primer CRONIUM llega en ~1 s.
    if(view.elapsed<(classicSideVoyage?classicSideVoyage.ficha.recoveryAt:9) || view.canFinish || classicChapterControlsLocked())return;
    // Reglas del tramo: salen de la ficha del viaje (patrullas, peligros, cometas y reparación).
    const rules=NeonCampaign.getVoyageStageRulesFor(view.routeId,n,settings.difficulty);
    if(!rules)return;
    classicVoyageSpawnTimer-=dt;
    // Recoverable signals form a short trail rather than an endless rain.
    // Missed fragments are reissued while this stage's objective is incomplete.
    const live=items.filter(item=>item.type==="energy").length;
    if(collected+live<view.stageGoal && live<2 && classicVoyageSpawnTimer<=0) {
      const x=W*(.30+.40*(.5+.5*Math.sin(view.stageElapsed*.31+n)));
      items.push({type:"energy",x,baseX:x,y:-45,r:22,s:175+n*4,rot:0,rs:.2,p:0,phase:n,amp:12,special:"",alpha:1});
      energySpawned++;classicVoyageSpawnTimer=2.8;
    }
    // Escape pressure after the actual rupture, with quiet space and C9 left
    // intact. A two-enemy cap includes survivors from the preceding crossing.
    if(rules.patrol) {
      classicPatrolTimer-=dt;
      if(classicPatrolTimer<=0) {
        // Más presencia y una mezcla de tipos que crece durante el viaje.
        const {cap,roster,gap}=rules.patrol;
        if(items.filter(item=>item.flightPatrol).length<cap)spawnClassicFlightPatrol(roster[classicPatrolSequence%roster.length]);
        classicPatrolTimer=gap*(.8+Math.random()*.4);
      }
    }
    // Hordas de CH-01 en V: la primera a media cadencia y luego cada `every`.
    if(rules.horde) {
      classicHordeTimer=(classicHordeTimer??rules.horde.every/2)-dt;
      if(classicHordeTimer<=0){spawnHordeWave(rules.horde.size);classicHordeTimer=rules.horde.every;}
    }
    // Campo de meteoritos, restos de naves y satélites con densidad propia de
    // cada tramo y un hueco transitable garantizado. Las pruebas que quieren
    // un tramo vacío lo desactivan con un temporizador muy alto (>=900).
    if(classicVoyageHazardTimer<900) {
      if(classicVoyageHazards?.stageNumber!==n)classicVoyageHazards=NeonCampaign.createVoyageHazardField({
        stageNumber:n,profile:rules.hazards,seed:Math.floor(Math.random()*4294967296),width:W,height:H,shipWidth:player.w});
      if(rules.hazards.mix.lavaCore||rules.hazards.mix.plasmaMine)ensureSprite(SPRITES.lavaCoreMine);
      const ambient=items.filter(item=>isThreat(item)&&!item.flightPatrol&&!item.classicScout&&
        !item.classicScoutProjectile&&!item.showerComet&&!item.guardianProjectile);
      NeonCampaign.advanceVoyageHazardField(classicVoyageHazards,dt,ambient,hazard=>{
        // Núcleo de lava y mina de plasma (sector 2); sin su hoja, un meteorito.
        const vulkar=hazard.type==="lavaCore"||hazard.type==="plasmaMine";
        const threat=vulkar&&spriteReady(SPRITES.lavaCoreMine)?createVulkarHazard(hazard.type,level()):
          createThreat(vulkar?"meteor":hazard.type,level());
        threat.x=threat.baseX=hazard.x;threat.y=-95-hazard.delayY;threat.s=hazard.speed*(threat.speedScale||1);threat.amp=0;
        threat.damage=Math.round(threat.damage*(hazard.damageScale??1));threat.hazardDamageScale=hazard.damageScale??1;
        // Durante la lluvia el pasillo marcado es seguro de verdad: nada nuevo
        // cae dentro (revisión L1). Los peligros caen recto (amp=0).
        if(cometShowerActive()){const c=classicCometCorridor.corridor;if(threat.x+threat.r>c.left&&threat.x-threat.r<c.right)return;}
        items.push(threat);
      });
    }
    if(rules.comets==="aimed"&&classicAimedRain) {
      const firstWarning=classicAimedRain.announced===0;
      NeonCampaign.advanceAimedMeteorRain(classicAimedRain,dt,player,event=>{
        if(event.type==="warning"){
          if(firstWarning)showStoryTransmission("N-7","Meteoritos hacia nosotros · esquiva",2);
          classicMeteorWarnings.push({id:event.id,x:event.x,until:elapsed+NeonCampaign.AIMED_METEOR_RULES.warning});
        }
        if(event.type==="meteor") {
          classicMeteorWarnings=classicMeteorWarnings.filter(warning=>warning.id!==event.id);
          items.push({type:"meteor",flightComet:true,aimedMeteor:true,id:event.id,x:event.x,baseX:event.x,y:event.y,
            vx:event.vx,vy:event.vy,r:NeonCampaign.AIMED_METEOR_RULES.radius,s:Math.hypot(event.vx,event.vy),damage:event.damage,
            hp:2,maxHp:2,special:"comet",spriteKey:"comet",rot:Math.atan2(event.vy,event.vx),rs:0,p:0,phase:0,amp:0,alpha:1,life:6});
        }
      });
    }
    classicMeteorWarnings=classicMeteorWarnings.filter(warning=>warning.until>elapsed);
    // Mientras dura la lluvia dirigida solo ataca un enemigo a la vez.
    if(sectorAttackTokens)sectorAttackTokens.max=classicAimedRain&&!classicAimedRain.done?1:sectorAttackTokens.baseMax;
    if(rules.comets&&rules.comets!=="aimed") {
      if(!classicCometShower||classicCometShower.stageId!==view.stageId)resetClassicCometShower();
      NeonCampaign.advanceCometShower(classicCometShower,dt,player,event=>{
        if(event.type==="warning"){showStoryTransmission("N-7",event.text,2);
          classicCometCorridor={corridor:event.corridor,until:view.stageElapsed+2.5};}
        if(event.type==="spawn")items.push(event.item);
      });
    }
    if(rules.repairAt!==null && view.stageElapsed>=rules.repairAt && classicCometWarning!==n) {
      classicCometWarning=n;const x=W*.45;
      items.push({type:"repair",x,baseX:x,y:-45,r:22,s:150,rot:0,rs:.15,p:0,phase:0,amp:18,special:"",alpha:1});
    }
  }

  // Subjefe CH-03 del sector 1 (plan F3c): defiende el tramo 5; mientras vive,
  // la ruta y las patrullas se paran. ch03Beaten: vencido en este intento.
  let ch03Boss=null,ch03Beaten=false;
  const CH03_HIT_RADIUS=90;
  function ch03Holds(){return Boolean(ch03Boss)&&!ch03Boss.resolved;}
  function showBossHud(name,phase,health,status) {
    if(!ui.atlasEncounter)return;
    ui.atlasEncounter.classList.remove("hidden");
    const title=ui.atlasEncounter.querySelector(".atlas-identity b");
    if(title&&title.textContent!==name)title.textContent=name;
    if(ui.atlasPhase.textContent!==phase)ui.atlasPhase.textContent=phase;
    if(ui.atlasHealth.value!==health)ui.atlasHealth.value=health;
    if(ui.atlasStatus.textContent!==status)ui.atlasStatus.textContent=status;
  }
  function maybeStartCh03() {
    const view=classicFlightView;
    if(ch03Boss||ch03Beaten||!isSectorRun()||state!=="playing"||!view)return;
    if(NeonCampaign.getVoyageStageRules(view.routeId,view.stageNumber)?.boss?.id!=="ch03"||view.stageElapsed<6)return;
    ch03Boss=NeonCampaign.createCh03Satellite({width:W,height:H,seed:view.stageNumber*97});
    ensureSprite(SPRITES.ch03);ensureSprite(SPRITES.hostileProjectiles2);
    showStoryTransmission("RED ATLAS","Satélite CH-03 en línea. El anillo de Gaia queda cerrado.",3.4);
  }
  function updateCh03Encounter(dt) {
    maybeStartCh03();
    if(!ch03Boss)return;
    NeonCampaign.advanceCh03Satellite(ch03Boss,dt,event=>{
      if(event.type==="projectile")items.push(gaiaShot({...event,sprite:"orb"}));
      if(event.type==="warning")combatSound("atlas-charge",ch03Boss.x);
      if(event.type==="defeated") {
        ch03Beaten=true;addExplosion(ch03Boss.x,ch03Boss.y,1.4,.9);
        spawnClassicScrap({x:ch03Boss.x,y:ch03Boss.y,bossSalvage:true,salvageRole:"ch03",salvageDropId:"ch03"});
        showStoryTransmission("N-7","CH-03 fuera de combate. El anillo se abre: C9 nos espera.",3.4);
      }
    });
    // Un golpe por barrido y por paso de rejilla. Durante la gracia no cuenta,
    // así el ataque aún puede alcanzar la nave cuando acabe.
    const damage=NeonCampaign.ch03HitsShip(ch03Boss,{x:player.x,y:player.y,r:30});
    const hitKey=damage?`${ch03Boss.attacks}:${ch03Boss.attack}:${ch03Boss.grid?.step??0}`:null;
    if(damage&&hitKey!==ch03Boss.lastHitKey&&hullGrace<=0){ch03Boss.lastHitKey=hitKey;damageShip(damage,player.x,player.y);}
    if(ch03Boss.resolved){ch03Boss=null;ui.atlasEncounter?.classList.add("hidden");return;}
    const status=ch03Boss.state==="warning"?"CARGANDO · prepárate para esquivar"
      :ch03Boss.state==="defeated"?"SATÉLITE ABATIDO":"Dispara al núcleo y esquiva sus láseres.";
    showBossHud("SATÉLITE CH-03","SUBJEFE",ch03Boss.hp/ch03Boss.maxHp,status);
  }

  // Enemigos de la Guardia de Gaia (plan F3b): Rastreador, Sembrador, Égida y
  // Alfa con su IA de perfiles, minas, bombas en cruz, escudo y marca.
  const GAIA_KINDS=new Set(["tracker","sower","aegis","alpha"]);
  let playerMarkedUntil=-Infinity,gaiaFallbackTokens=null;
  // Hordas (plan F3b): null = la primera oleada del tramo aún no está programada.
  let classicHordeTimer=null,classicHordeSequence=0;
  function spawnHordeWave(size) {
    const wave=classicHordeSequence++,stage=classicFlightView?.stageNumber||0;
    NeonCampaign.createHordeWave({size,width:W,seed:wave+stage}).forEach((unit,index)=>{
      const item=createThreat("scout",level());
      Object.assign(item,{id:`horde:${currentLevel}:${stage}:${wave}:${index}`,x:unit.x,baseX:unit.x,y:unit.y,vx:unit.vx,vy:unit.vy,
        s:0,rot:0,rs:0,amp:0,classicScout:null,hordeUnit:true,r:30,hp:1,maxHp:1,damage:12,salvageRole:"raider",
        salvageDropId:`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`,
        hordeAnimator:NeonCampaign.createCh01Animator({hp:1,maxHp:1})});
      items.push(item);
    });
    ensureSprite(SPRITES.ch01);
  }
  function spawnGaiaEnemy(kind) {
    const ordinal=classicPatrolSequence++,stage=classicFlightView?.stageNumber||0,rules=NeonCampaign.GAIA_ENEMY_RULES[kind];
    // El Rastreador entra por abajo, el Sembrador por un lado del carril bajo y los demás por arriba.
    const x=kind==="sower"?(ordinal%2===0?-30:W+30):W*(ordinal%2===0?.3:.7);
    const y=kind==="tracker"?H+30:kind==="sower"?H*.78:-70;
    const item=createThreat("scout",level());
    // Sin el piloto del explorador antiguo: lo mueve su propia IA.
    Object.assign(item,{id:`gaia:${currentLevel}:${stage}:${ordinal}`,x,baseX:x,y,s:0,rot:0,rs:0,amp:0,classicScout:null,
      flightPatrol:true,gaiaEnemy:true,damage:16,r:kind==="alpha"?58:34,hp:rules.hp,maxHp:rules.hp,salvageRole:rules.salvageRole,
      salvageDropId:`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`,
      gaia:NeonCampaign.createGaiaEnemy({kind,x,y,now:elapsed})});
    ensureSprite(SPRITES[{tracker:"gaiaTracker",sower:"gaiaSower",aegis:"gaiaAegis",alpha:"gaiaAlpha",atlasEscort:"atlasEscorts"}[kind]]);
    ensureSprite(SPRITES.hostileProjectiles2);
    items.push(item);
    return item;
  }
  function gaiaHazard(fields) {
    return {type:"meteor",s:0,rot:0,rs:0,p:0,phase:Math.random()*4,amp:0,alpha:1,special:"",hp:1,maxHp:1,...fields};
  }
  function spawnGaiaMine(x,y) {
    const item=gaiaHazard({id:`gaia-mine:${++classicThreatSequence}`,gaiaMine:true,x,baseX:x,y,r:16,
      damage:NeonCampaign.GAIA_ENEMY_RULES.sower.mine.damage,mine:{x,y,age:0,armed:false}});
    items.push(item);return item;
  }
  function gaiaShot(shot) {
    return gaiaHazard({classicScoutProjectile:true,tacticsVersion:NeonCampaign.CLASSIC_PURSUIT_VERSION,gaiaSprite:shot.sprite||"orb",
      x:shot.x,baseX:shot.x,y:shot.y,vx:shot.vx,vy:shot.vy,s:Math.hypot(shot.vx,shot.vy),r:9,life:5,damage:shot.damage});
  }
  function handleGaiaEvent(item,event) {
    if(event.type==="shot"){items.push(gaiaShot(event));combatSound("enemy-phaser",event.x);}
    if(event.type==="mark"){playerMarkedUntil=elapsed+event.seconds;}
    if(event.type==="mine")spawnGaiaMine(event.x,event.y);
    if(event.type==="cross-bomb")items.push(gaiaHazard({id:`gaia-bomb:${++classicThreatSequence}`,gaiaBomb:true,
      x:event.x,baseX:event.x,y:event.y,r:14,damage:NeonCampaign.GAIA_ENEMY_RULES.sower.bomb.damage,bomb:{x:event.x,y:event.y,vx:event.vx}}));
    if(event.type==="shield"){
      const target=items.find(other=>other.id===event.targetId);
      if(target){target.shieldHits=event.hits;target.shieldBy=item.id;}
    }
  }
  /** Avanza un enemigo, mina o bomba de Gaia; false si desaparece. */
  function advanceGaiaItem(item,dt) {
    if(item.gaiaMine) {
      const result=NeonCampaign.advanceMine(item.mine,dt,player);
      if(result==="explode"){addExplosion(item.x,item.y,.6,.4);damageShip(item.damage,item.x,item.y);}
      return result===null;
    }
    if(item.gaiaBomb) {
      const rays=NeonCampaign.advanceCrossBomb(item.bomb,dt,{w:W,h:H});
      item.x=item.bomb.x;
      if(!rays)return true;
      for(const ray of rays)items.push(gaiaShot({...ray,sprite:"orb"}));
      return false;
    }
    const allies=items.filter(other=>other.gaiaEnemy||other.classicScout).map(other=>({id:other.id,x:other.x,y:other.y,hp:other.hp??1,maxHp:other.maxHp??1}));
    const tokens=sectorAttackTokens||(gaiaFallbackTokens??=NeonCampaign.createAttackTokens({max:2}));
    NeonCampaign.advanceGaiaEnemy(item,dt,{now:elapsed,player:{x:player.x,y:player.y,hull,reloading:Boolean(classicWeapons)&&classicWeapons.charges<1},
      bounds:{w:W,h:H},allies,tokens,anchor:atlasAnchor()},event=>handleGaiaEvent(item,event));
    return true;
  }
  function spawnClassicFlightPatrol(role="scout") {
    if(GAIA_KINDS.has(role))return spawnGaiaEnemy(role);
    const ordinal=classicPatrolSequence++;
    const stage=classicFlightView?.stageNumber||0;
    const interceptor=role==="interceptor"&&spriteReady(SPRITES.ch02);
    if(role==="interceptor"&&!interceptor)role="scout";
    ensureSprite(SPRITES.ch01);
    const item=createThreat("scout",level());
    item.id=`${NeonCampaign.CLASSIC_PURSUIT_VERSION}:${currentLevel}:${stage}:${ordinal}`;
    item.x=item.baseX=W*(ordinal%2===0?.25:.75);item.y=-65;item.rot=0;item.rs=0;
    item.flightPatrol=true;item.damage=16;item.s=role==="raider"?150:138;
    item.salvageRole=role;item.salvageDropId=`${classicFlightView?.stageId||`${currentLevel+1}.0`}:enemy:${classicSalvageEnemySequence++}`;
    item.r=interceptor?35:32;item.hp=item.maxHp=interceptor?3:2;
    item.classicScout=NeonCampaign.createClassicPursuer({x:item.x,width:W,height:H,role,
      seed:stage*17+ordinal,minAttackY:(classicFlightBounds?.presentationTop||95)+45,baseSpeed:item.s});
    if(interceptor)item.classicScout.animator=NeonCampaign.createCh02Animator({hp:3,maxHp:3});
    items.push(item);
    if(!classicPursuitAnnounced.has(role)) {
      classicPursuitAnnounced.add(role);
      showStoryTransmission(role==="raider"?"N-7":"RED ATLAS",role==="raider"
        ?"Los atacantes nos siguen. Saca el CRONIUM de este campo de restos."
        :role==="interceptor"?"CH-02 en intercepción. Sus motores le permiten cerrar el flanco."
        :"La red Atlas no reconoce nuestra identificación. Mantén el rumbo hacia Gaia.",4.2);
    }
    return item;
  }

  function fireClassicWeapon() {
    if(!classicWeapons || !spriteReady(SPRITES.atlasVfx))return false;
    if(classicChapterControlsLocked())return false;
    const result=NeonCampaign.triggerClassicWeapon(classicWeapons,{x:player.x,y:player.y-125*SHIP_VISUAL.classicScale});
    if(!result.accepted)return false;
    ammo=classicWeapons.charges;manualShotCooldown=classicWeapons.cooldown;
    if(typeof classicTutorial!=='undefined')classicTutorial?.observe({type:'fire'});
    combatSound("phaser");
    cameraKickY=Math.max(cameraKickY,2.5);vibrate(12);updateAmmoHud();return true;
  }

  function fireClassicMissile() {
    if(state!=="playing"||warpTimer>0||classicChapterControlsLocked()||
      atlasBoss?.disabled||!classicWeapons||!classicSalvageLedger||!NeonCampaign.canTriggerClassicMissile(classicWeapons))return false;
    const inventory=classicSalvageLedger.load();
    if(!inventory.ok){syncClassicMissileHud();return false;}
    classicSalvageState=inventory.state;
    // Commit the inventory receipt before emitting a physical projectile. A
    // failed or repeated write cannot create a free or duplicated missile.
    const spent=classicSalvageLedger.spendMissile({shotId:classicSalvageLedger.nextMissileShotId()});
    if(spent.state)classicSalvageState=spent.state;
    if(!spent.ok||spent.duplicate){syncClassicMissileHud();return false;}
    const fired=NeonCampaign.triggerClassicMissile(classicWeapons,{x:player.x,
      y:player.y-72*SHIP_VISUAL.classicScale,shotId:`missile:${classicSalvageState.missileShotsSpent}`});
    syncClassicMissileHud();
    if(!fired.accepted)return false;
    if(typeof classicTutorial!=='undefined')classicTutorial?.observe({type:'missile'});
    cameraKickY=Math.max(cameraKickY,3);combatSound("missile-launch",player.x,`missile:${classicSalvageState.missileShotsSpent}`);vibrate(16);
    return true;
  }

  function advanceClassicWeaponField(dt) {
    if(!classicWeapons)return;
    for(const shot of classicWeapons.projectiles){shot.previousX=shot.x;shot.previousY=shot.y;}
    const events=NeonCampaign.advanceClassicWeapons(classicWeapons,dt);
    ammo=classicWeapons.charges;
    if(atlasBoss && !atlasBoss.disabled) {
      for(const shot of [...classicWeapons.projectiles]) {
        const radius=atlasBoss.vulnerability?atlasBoss.coreRadius:atlasBoss.r;
        if(squaredDistanceToSegment(atlasBoss.x,atlasBoss.y,shot.previousX??shot.x,shot.previousY??shot.y,shot.x,shot.y) > (radius+shot.radius)**2)continue;
        const contact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,"guardian-atlas");
        if(!contact.accepted)continue;
        // Shield contact consumes a shot too; vulnerability is checked on arrival.
        const dx=shot.x-(shot.previousX??shot.x),dy=shot.y-(shot.previousY??shot.y);
        const length=dx*dx+dy*dy;
        const t=length?clamp(((atlasBoss.x-(shot.previousX??shot.x))*dx+(atlasBoss.y-(shot.previousY??shot.y))*dy)/length,0,1):0;
        resolveAtlasPulse({atlasTarget:atlasBoss,x2:atlasBoss.x,damage:contact.damage,weapon:shot.weapon,
          impactX:(shot.previousX??shot.x)+dx*t,impactY:(shot.previousY??shot.y)+dy*t});
      }
    }
    if(ch03Boss&&ch03Boss.state!=="defeated") {
      for(const shot of [...classicWeapons.projectiles]) {
        if(squaredDistanceToSegment(ch03Boss.x,ch03Boss.y,shot.previousX??shot.x,shot.previousY??shot.y,shot.x,shot.y)>(CH03_HIT_RADIUS+shot.radius)**2)continue;
        const contact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,"ch03");
        if(!contact.accepted)continue;
        if(NeonCampaign.hitCh03Satellite(ch03Boss,contact.damage).accepted){addImpactEffect(shot.x,shot.y,.8);combatSound("impact-metal",ch03Boss.x);}
      }
    }
    if(events.some(event=>event.type==="recharged")){tone(520,.035,"sine",.025);updateAmmoHud();}
  }

  function interceptClassicProjectile(item) {
    if(!classicWeapons || atlasBoss || !isThreat(item))return false;
    if(!item.id)item.id=`classic-target:${++classicThreatSequence}`;
    for(const shot of [...classicWeapons.projectiles]) {
      const ax=shot.previousX??shot.x,ay=shot.previousY??shot.y,dx=shot.x-ax,dy=shot.y-ay;
      const cosine=Math.cos(item.rot||0),sine=Math.sin(item.rot||0);
      const intersects=collisionCircles(item).some(circle=>{
        const x=item.x+circle.x*cosine-circle.y*sine,y=item.y+circle.x*sine+circle.y*cosine;
        return squaredDistanceToSegment(x,y,ax,ay,shot.x,shot.y)<=(circle.r+shot.radius)**2;
      });
      if(!intersects)continue;
      const impact=NeonCampaign.hitClassicProjectile(classicWeapons,shot.id,item.id);
      if(!impact.accepted)continue;
      // El escudo de la Égida recibe el disparo antes que el casco (plan F3b).
      if(item.shieldHits>0){item.shieldHits--;addImpactEffect(item.x,item.y,.6);combatSound("impact-metal",item.x);continue;}
      item.hp=Math.max(0,(item.hp??1)-impact.damage);
      const destroyed=item.hp<=1e-8;
      animateScoutHit(item,destroyed);
      if(shot.weapon==="missile")addMissileImpact(item.x,item.y);else addImpactEffect(item.x,item.y,.8);
      score+=item.classicScoutProjectile?0:(destroyed?10:3);combatSound(destroyed?"enemy-break":"impact-metal",item.x);
      hudScoreTarget=score;
      if(destroyed){
        if(!item.classicScout?.tacticsVersion)addExplosion(item.x,item.y,.7,.5);
        return true;
      }
    }
    return false;
  }

  // Atlas solo se combate en S1-V5 (decisión del propietario, 21/10/2026).
  // S1-V1 termina en la baliza: Atlas avisa de lejos, sin combate.
  function isAtlasMission() {
    return currentLevel === 0 && classicSideVoyage?.ficha.boss === "atlas";
  }

  // Viajes secundarios (fichas distintas de S1-V1, p. ej. S1-V2): guardado en
  // su propia clave, sin historia del capítulo, tutorial, inicio ni Atlas.
  function loadSideVoyageRecord(ficha) {
    const route=NeonCampaign.createVoyageRoute(ficha),raw=storage.getJSON(ficha.saveKey,null);
    const checkpoint=raw?.version===1&&raw.voyage===ficha.id?route.normalizeCheckpoint(raw.checkpoint,{goal:ficha.baseGoal}):null;
    const stars=Math.trunc(Math.min(3,Math.max(0,Number(raw?.stars)||0)));
    // Entrada del tramo (como S1-V1, más el CRONIUM perdido). Los registros
    // antiguos no la tienen y un valor dañado se ignora: se empieza como antes.
    const e=raw?.entry,entry=checkpoint&&Number.isFinite(e?.hull)&&e.hull>0&&e.hull<=100&&
      Number.isInteger(e.score)&&e.score>=0&&Number.isFinite(e.maxCombo)&&e.maxCombo>=1&&e.maxCombo<=12&&
      e.collected===checkpoint.collected&&(e.reserve===undefined||(Number.isFinite(e.reserve)&&e.reserve>=0&&e.reserve<=65))&&
      (e.missed===undefined||(Number.isInteger(e.missed)&&e.missed>=0))?e:null;
    return checkpoint?{version:1,voyage:ficha.id,checkpoint,completed:raw.completed===true,inProgress:raw.inProgress===true,stars,entry}:null;
  }
  function saveSideVoyage(checkpoint,completed=false,stars=0) {
    if(!classicSideVoyage||!checkpoint)return false;
    // Rejugar un viaje hecho no borra su marca ni sus mejores estrellas. La
    // entrada guarda casco y CRONIUM perdido; lo que aún cae no cuenta.
    // inProgress distingue una partida a medias de un viaje solo completado
    // (auditoría L01): así reintentar una rejugada vuelve a su tramo.
    const {ficha}=classicSideVoyage,previous=loadSideVoyageRecord(ficha),record={version:1,voyage:ficha.id,checkpoint,
      completed:completed||previous?.completed===true,inProgress:!completed,stars:Math.max(stars,previous?.stars||0),
      entry:{hull:Math.max(1,Math.min(100,hull)),reserve:classicHullReserve,score:Math.max(0,Math.floor(score)),maxCombo,
        collected:checkpoint.collected,missed:Math.max(0,energySpawned-collected-items.filter(item=>item.type==="energy").length)}};
    const saved=storage.setJSON(ficha.saveKey,record);
    if(!saved)toast("No se pudo guardar este tramo. El guardado anterior sigue conservado.");
    return saved;
  }
  // Sector continuo (plan F3a): su progreso vive solo en el guardado de
  // sectores. Un guardado ilegible o inválido cuenta como partida nueva.
  // Revivir con anuncio en el sector: lo prepara finishGame y lo gasta resumeReward.
  let sectorRevive=null,sectorDeathRecorded=false;
  // Turnos de ataque del tramo (plan F3b): solo en el sector; los viajes
  // antiguos conservan su escalada.
  let sectorAttackTokens=null;
  function resetSectorAttackTokens() {
    const rules=isSectorRun()&&classicFlightView?NeonCampaign.getVoyageStageRules(classicFlightView.routeId,classicFlightView.stageNumber):null;
    sectorAttackTokens=rules?NeonCampaign.createAttackTokens({max:rules.attackers??2}):null;
    if(sectorAttackTokens)sectorAttackTokens.baseMax=sectorAttackTokens.max;
  }
  // La regla de morir se guarda al estallar la nave (tramo 1, o 6 con baliza),
  // no al abrir la derrota: cerrar la app durante la explosión no la salta.
  function recordSectorDeath() {
    if(!isSectorRun()||sectorDeathRecorded)return;
    const save=loadSectorSave();
    sectorRevive=NeonCampaign.useRevive(save);
    saveSector(NeonCampaign.dieInSector(save));
    sectorDeathRecorded=true;
  }
  function isSectorRun() {
    const ficha=classicSideVoyage?.ficha;
    return Boolean(ficha)&&NeonCampaign.getSectorFicha(ficha.id)===ficha;
  }
  function loadSectorSave() {
    return NeonCampaign.normalizeSectorSave(storage.getJSON(NeonCampaign.SECTOR_SAVE_KEY,null))||NeonCampaign.createSectorSave();
  }
  function loadMenuUnlocks() {
    return NeonCampaign.normalizeMenuUnlocks(storage.getJSON(NeonCampaign.MENU_UNLOCKS_KEY,null));
  }
  function rememberMenuUnlocks(unlocks) {
    const stored=loadMenuUnlocks();
    if(unlocks.hangar!==stored.hangar||unlocks.seen.hangar!==stored.seen.hangar)storage.setJSON(NeonCampaign.MENU_UNLOCKS_KEY,unlocks);
  }
  // Al abrir el hangar por primera vez desaparece el aviso NUEVO.
  function markHangarSeen() {
    rememberMenuUnlocks(NeonCampaign.markMenuSeen(loadMenuUnlocks(),"hangar"));
    $("openHangar")?.classList.remove("is-new");
  }
  function saveSector(save) {
    const saved=storage.setJSON(NeonCampaign.SECTOR_SAVE_KEY,save);
    if(!saved)toast("No se pudo guardar este tramo. El guardado anterior sigue conservado.");
    return saved;
  }
  // El inicio de Chronos (historia y tutorial) es de S1-V1 y de las fichas con
  // `intro`, como el sector 1 (propietario, 23/10/2026).
  function fichaHasIntro() {
    return !classicSideVoyage||classicSideVoyage.ficha.intro===true;
  }
  function startSector(id) {
    const ficha=NeonCampaign.getSectorFicha(id);
    if(!ficha)return false;
    classicVoyageRequestedStage=null;classicSideVoyagePending=ficha;startLevel(0);return true;
  }
  function startSideVoyage(voyageId) {
    const ficha=NeonCampaign.getVoyageFicha(NeonCampaign.VOYAGES.find(item=>item.id===voyageId)?.routeId);
    if(!ficha)return false;
    // Un tramo elegido en la ficha de S1-V1 no se arrastra a otro viaje.
    classicVoyageRequestedStage=null;classicSideVoyagePending=ficha;startLevel(0);return true;
  }
  // S1-V5: vencer a Atlas autoriza el segundo cañón (Gemelo). Un registro de
  // equipo corrupto solo se sustituye si sus bytes exactos ya tienen copia de
  // seguridad; si no, no se escribe nada. Repetir la victoria no duplica nada.
  function awardAtlasWeapon() {
    if(!classicEquipmentWritable)return null;
    const raw=storage.getRaw(CLASSIC_EQUIPMENT_KEY);
    let valid=raw===null;
    try {valid=raw===null||NeonCampaign.normalizeClassicEquipment(JSON.parse(raw))!==null;} catch {}
    if(!valid) {
      const backups=storage.getJSON(CLASSIC_EQUIPMENT_KEY+":invalid-backups",[]);
      if(!Array.isArray(backups)||!backups.includes(raw))return null;
    }
    const award=NeonCampaign.awardClassicBossWeapon(classicEquipment,"guardian-atlas");
    return persistClassicEquipment(award.equipment)?award:null;
  }

  // Pantalla de completado de un viaje del mapa: misma pantalla que S1-V1,
  // con su puntuación y «Siguiente viaje». La ficha se conserva mientras se
  // ve, para que «Repetir» vuelva a lanzar este mismo viaje.
  function completeSideVoyage() {
    const {ficha}=classicSideVoyage,sector=isSectorRun();
    const firstTime=sector?loadSectorSave().sectors[ficha.sector]?.completed!==true:loadSideVoyageRecord(ficha)?.completed!==true;
    const earned=runStars();
    // Sin el arma guardada, el viaje del jefe no se marca como completado.
    const atlasVictory=ficha.boss==="atlas"&&Boolean(atlasBoss?.resolved);
    const award=atlasVictory?awardAtlasWeapon():null;
    const saved=(!atlasVictory||award)&&(sector
      ?saveSector(NeonCampaign.completeSector(loadSectorSave(),ficha.sector,earned))
      :saveSideVoyage(classicFlight.exportCheckpoint(),true,earned));
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;cancelSupplyFailureTimer();
    setState("complete");setClassicFlightHudVisible(false);
    if(classicWeapons){classicWeapons.projectiles.length=0;NeonCampaign.setClassicUnlimitedFire(classicWeapons,false);}
    atlasBoss=null;resetAtlasFury();ui.atlasEncounter?.classList.add("hidden");document.body.classList.remove("atlas-combat");
    hideWarning();hideStoryTransmission();
    ui.hud.classList.add("hidden");ui.powerHud.classList.add("hidden");ui.fire.classList.add("hidden");ui.banner.classList.remove("show");
    // Decisión del propietario (tablero, rev32-ads): un viaje del mapa cuenta
    // como partida para los intersticiales solo la primera vez que se completa.
    if(firstTime&&saved&&!continued)registerRun();
    const next=nextCampaignVoyage();
    ui.completeLabel.textContent=`VIAJE COMPLETADO · SECTOR ${ficha.sector}`;
    ui.completeTitle.textContent=`${ficha.id} · ${ficha.title}`;
    if(ui.completeVisual)ui.completeVisual.dataset.scene=ficha.sector===2?"belt":"rift";
    ui.starsAwarded.innerHTML=[1,2,3].map(value=>`<span class="${value<=earned?"":"off"}">★</span>`).join("");
    ui.levelScore.textContent=Math.max(0,Math.floor(score));
    ui.levelHull.textContent=`${Math.ceil(hull)}%`;
    ui.maxCombo.textContent=`x${maxCombo}`;
    ui.unlockMessage.textContent=!saved?"No se pudo guardar el viaje en este dispositivo."
      :next?`Siguiente: ${next.voyage} · ${next.title}.`:"Has completado todos los viajes disponibles.";
    // El sector 2 aún no existe: tras el sector 1 se vuelve al menú.
    if(sector) {
      ui.completeLabel.textContent=`SECTOR ${ficha.sector} COMPLETADO`;
      if(saved)ui.unlockMessage.textContent="El sector 2 llega pronto.";
    }
    if(atlasVictory) {
      ui.completeTitle.textContent="Atlas ha abierto el paso";
      ui.unlockMessage.textContent=!award
        ?"No se pudo guardar el segundo cañón en este dispositivo. El viaje no se ha marcado como completado: repítelo para intentarlo de nuevo."
        :`IRIA · GAIA: Usaron tu señal para atacar Chronos. El convoy vino de Vulkar. Tienes paso libre.${award.granted?" Segundo cañón autorizado: Gemelo ×2 disponible en el taller.":""} ${ui.unlockMessage.textContent}`;
    }
    ui.nextLevel.classList.remove("hidden");
    ui.nextLevel.textContent=sector?"VOLVER AL MENÚ":next?`SIGUIENTE VIAJE: ${next.voyage} →`:"VER EL MAPA →";
    overlay(ui.complete);
    tone(760,.12,"triangle",.08);setTimeout(()=>tone(980,.18,"sine",.07),120);vibrate([30,40,70]);
    updateMenu();
  }

  function setupAtlasEncounter() {
    const mount = document.createElement("section");
    mount.id = "atlasEncounter"; mount.className = "atlas-encounter cockpit-boss-signal hidden";
    mount.setAttribute("aria-label", "Encuentro Guardian Atlas");
    mount.innerHTML = `<div class="atlas-identity"><b>GUARDIAN ATLAS</b><span id="atlasPhase">CONTENCIÓN ORBITAL</span><progress id="atlasHealth" max="1" value="1" aria-label="Integridad de Guardian Atlas"></progress></div><p id="atlasStatus" role="status">Recupera el CRONIUM antes de cruzar el perímetro.</p>`;
    canvas.parentElement.append(mount);
    for (const id of ["atlasEncounter", "atlasHealth", "atlasPhase", "atlasStatus"]) ui[id] = $(id);
    syncAtlasHud();
  }

  function positionAtlasArena() {
    if (!atlasBoss) return;
    const rect = canvas.getBoundingClientRect();
    const horizontal = rect.height < 500;
    const anchorY = classicFlightAnchorY || player.y;
    atlasBoss.width = W; atlasBoss.height = H; atlasBoss.playerY = anchorY;
    const hudBottom = Math.max($('hud').getBoundingClientRect().bottom,
      ui.atlasEncounter?.getBoundingClientRect().bottom || 0,
      ui.flightObjective?.getBoundingClientRect().bottom || 0);
    const headerClearance = (Math.max(0, hudBottom - rect.top) + 8) * H / Math.max(1, rect.height);
    const shipTop = anchorY - 145*SHIP_VISUAL.classicScale;
    // Poses have distinct reactor pivots. Reserve the complete authored cell,
    // including the highest ring and lowest wreckage, rather than half a tile.
    atlasBoss.visualSize = Math.min(horizontal ? 300 : 350,
      Math.max(80, (shipTop - headerClearance - 12) / 1.07));
    atlasBoss.targetY = clamp(H * .30,
      headerClearance + atlasBoss.visualSize * .55,
      shipTop - atlasBoss.visualSize * .52);
    // Reflow the presentation envelope, never reset a moving boss to its anchor
    // whenever a status line changes. The model moves the real core/collider.
    atlasBoss.presentationHalfWidth=atlasBoss.visualSize*.58;
  }

  function beginAtlasEncounter() {
    // La ruta ya exige la cuota de su último tramo (canFinish); la del nivel
    // antiguo (36) no vale aquí: con 33 en el sector, Atlas no llegaba nunca.
    if (!isAtlasMission() || atlasBoss || !classicFlightView?.canFinish || state !== "playing") return false;
    if (typeof resetGameInput === "function") resetGameInput();
    cancelSupplyFailureTimer();
    atlasBoss = NeonCampaign.createGuardianAtlas({width: W, height: H, playerY: player.y});resetAtlasFury();
    // Vida de Atlas según el modo de dificultad (Normal = la de siempre).
    const bossHealth=NeonCampaign.DIFFICULTY_MODES?.[settings.difficulty]?.bossHealth??1;
    if(bossHealth!==1)atlasBoss.hp=atlasBoss.maxHp=Math.round(atlasBoss.maxHp*bossHealth);
    NeonCampaign.setClassicUnlimitedFire(classicWeapons,true);
    document.body.classList.add("atlas-combat");ui.atlasEncounter.classList.remove("hidden");
    positionAtlasArena();
    atlasFireTimer = 0; atlasReentryGrace = 0; atlasLastStatus = "";
    items = []; gates = []; shots = []; tractorTarget = null;
    if(classicWeapons)classicWeapons.projectiles.length=0;
    setClassicFlightHudVisible(true);
    ensureSprite(SPRITES.guardianAtlas); ensureSprite(SPRITES.atlasVfx); ensureSprite(SPRITES.atlasExplosion);
    hideWarning(); ui.banner.classList.remove("show");
    document.body.classList.add("atlas-combat");
    ui.atlasEncounter.classList.remove("hidden");
    ui.goal.previousElementSibling.textContent = "CRONIUM";
    ui.goal.textContent = `${collected}/${level().goal}`;
    syncAtlasHud(); refreshClassicFlightBounds(); updateAmmoHud();
    tone(135, .28, "triangle", .065);
    return true;
  }

  function syncAtlasHud() {
    if (!ui.atlasEncounter) return;
    if (!atlasBoss) return;
    // El mismo panel muestra al CH-03 (plan F3c): el título vuelve a ser el de Atlas.
    const title = ui.atlasEncounter.querySelector(".atlas-identity b");
    if (title && title.textContent !== "GUARDIAN ATLAS") title.textContent = "GUARDIAN ATLAS";
    const health = atlasBoss.hp / atlasBoss.maxHp;
    const phaseLabel = atlasBoss.disabled ? "ENLACE RESTAURADO" : `FASE ${atlasBoss.phase}`;
    if (ui.atlasHealth.value !== health) ui.atlasHealth.value = health;
    let layoutChanged = false;
    if (ui.atlasPhase.textContent !== phaseLabel) { ui.atlasPhase.textContent = phaseLabel; layoutChanged = true; }
    let status;
    if (!spriteReady(SPRITES.guardianAtlas) || !spriteReady(SPRITES.atlasVfx)) status = "Atlas no se ha cargado. Pausa y vuelve al menú para reintentar.";
    else if (atlasReentryGrace > 0) status = "Enlace recuperado. Retoma el control.";
    else if (atlasBoss.state === "entry") status = "Tu carga activa la contención. Desactiva el núcleo para abrir el paso.";
    else if (atlasBoss.state === "disabled") status = "Atlas: «Identidad confirmada. Gaia autoriza el acceso».";
    else if (atlasBoss.state === "phaseBreak") status = "N-7: «Es un bucle de contención. Rompe el enlace, salva al guardián».";
    else if (atlasBoss.state === "charge") status = "CONTENCIÓN ORBITAL ACTIVA";
    else status = atlasBoss.vulnerability ? "NÚCLEO EXPUESTO · alinea la nave y abre fuego." : "BLINDAJE CERRADO · Atlas cambia de flanco.";
    if (status !== atlasLastStatus) { ui.atlasStatus.textContent = status; atlasLastStatus = status; layoutChanged = true; }
    if (layoutChanged) positionAtlasArena();
  }

  // Furia de Atlas (plan F3c): escenario roto, rayo Fulminante (su aviso
  // marca la mitad que va a barrer) y escoltas, nunca más de 4 a la vez.
  let atlasFuryScene=false,atlasBeam=null,atlasBeamWarning=null;
  function resetAtlasFury() { atlasFuryScene=false;atlasBeam=null;atlasBeamWarning=null; }
  function spawnAtlasEscorts(count) {
    if(!atlasBoss)return;
    const alive=items.filter(item=>item.gaia?.kind==="atlasEscort").length;
    for(let k=alive;k<count;k++) {
      const angle=k*Math.PI/2,radius=atlasAnchor().r*NeonCampaign.GAIA_ENEMY_RULES.atlasEscort.orbit.radius;
      const item=spawnGaiaEnemy("atlasEscort");
      item.gaia.angle=angle;item.x=item.baseX=atlasBoss.x+Math.cos(angle)*radius;item.y=atlasBoss.y+Math.sin(angle)*radius;
    }
  }
  function spawnAtlasDrones(event) {
    for(let k=0;k<event.count;k++) {
      const item=spawnClassicFlightPatrol("scout");
      item.atlasDrone=true;item.x=item.baseX=event.x+(k%2?60:-60);item.y=event.y+30;
    }
  }
  // Las escoltas giran a 1,6·r del radio visible de Atlas, no del de colisión:
  // así quedan por fuera de su silueta.
  function atlasAnchor() {
    return atlasBoss&&!atlasBoss.disabled?{x:atlasBoss.x,y:atlasBoss.y,r:(atlasBoss.visualSize||350)*.45}:null;
  }
  function updateAtlasBeam(dt) {
    if(!atlasBeam)return;
    atlasBeam.remaining-=dt;
    if(atlasBeam.remaining<=0){atlasBeam=null;return;}
    // Durante la gracia no cuenta: el rayo aún puede alcanzar la nave cuando acabe.
    if(!atlasBeam.hit&&hullGrace<=0&&player.x+SHIP_COLLISION_HALF_WIDTH>=atlasBeam.x0&&player.x-SHIP_COLLISION_HALF_WIDTH<=atlasBeam.x1) {
      atlasBeam.hit=true;damageShip(atlasBeam.damage,player.x,player.y);
    }
  }

  function consumeAtlasEvent(event) {
    if (event.type === "projectile") items.push(event.projectile);
    if (event.clearProjectiles || event.type === "shutdown") {
      items = items.filter(item => !item.guardianProjectile);
    }
    if (event.type === "volley") combatSound(event.attackTier==="basic"?"enemy-phaser":"enemy-heavy",event.x??atlasBoss.x);
    // Fulminante: alarma durante la carga, que dice qué mitad va a barrer.
    if (event.type === "fulminant") {
      atlasBeamWarning={x0:event.x0,x1:event.x1};
      combatSound("atlas-charge",atlasBoss.x);flash=Math.max(flash,.22);
      showStoryTransmission("COMANDANTE IRIA · GAIA","¡Fulminante! Atlas va a barrer tu mitad: cambia de lado.",1.6);
    }
    if (event.type === "beam") { atlasBeamWarning=null;atlasBeam={x0:event.x0,x1:event.x1,remaining:event.seconds,damage:event.damage,hit:false}; }
    if (event.type === "drones") spawnAtlasDrones(event);
    if (event.type === "fury") { atlasFuryScene=true;ensureSprite(SPRITES.atlasFury);ensureSprite(SPRITES.atlasEscorts);spawnAtlasEscorts(event.escorts); }
    if (event.type === "volley" && event.fulminant) { shake=Math.max(shake,6);cameraKickY=Math.max(cameraKickY,4); }
    if (event.type === "phase") { cameraKickY = Math.max(cameraKickY, 3); tone(180, .3, "triangle", .055); }
    if (event.type === "shutdown") {
      atlasBeam=atlasBeamWarning=null;
      // Las escoltas caen con Atlas.
      for(const escort of items.filter(item=>item.gaia?.kind==="atlasEscort"))addExplosion(escort.x,escort.y,.6,.4);
      items=items.filter(item=>item.gaia?.kind!=="atlasEscort");
      score += 250;combatSound("atlas-collapse",atlasBoss.x);
      // Explosión del baúl durante el apagado (1,55 s): el completado llega
      // como siempre, ~0,75 s después de que se apague. Sin imagen, como antes.
      if(spriteReady(SPRITES.atlasExplosion))addAtlasExplosion(atlasBoss);
      spawnClassicScrap({x:atlasBoss.x,y:atlasBoss.y,bossSalvage:true,salvageDropId:"guardian-atlas"});
    }
    if (event.type === "disabled") completeLevel();
  }

  function updateAtlasEncounter(dt) {
    if (!atlasBoss || dt <= 0) return;
    if (!spriteReady(SPRITES.guardianAtlas) || !spriteReady(SPRITES.atlasVfx)) { syncAtlasHud(); return; }
    if (atlasReentryGrace > 0) { atlasReentryGrace = Math.max(0, atlasReentryGrace - dt); syncAtlasHud(); return; }
    // Slow affects both the guardian's warning/recovery clock and its bullets.
    // A different clock could announce a new corridor over an older curtain.
    const previousState=atlasBoss.state;
    NeonCampaign.advanceGuardianAtlas(atlasBoss, dt * (powers.slow > 0 ? .5 : 1), player, consumeAtlasEvent);
    // En un viaje del mapa la victoria completa el viaje dentro del evento y
    // retira a Atlas; no queda nada que actualizar en este fotograma.
    if(!atlasBoss)return;
    updateAtlasBeam(dt * (powers.slow > 0 ? .5 : 1));
    if(atlasBoss.state==="charge"&&previousState!=="charge")combatSound("atlas-charge",atlasBoss.x);
    if (state !== "playing") return;
    atlasFireTimer = Math.max(0, atlasFireTimer - dt);
    if (settings.autoFire && atlasFireTimer === 0 && atlasBoss.vulnerability && Math.abs(atlasBoss.x - player.x) < 115) {
      if (fireManualShot()) atlasFireTimer = .42;
    }
    syncAtlasHud();
  }

  function fireAtlasPulse(kind) {
    if (!atlasBoss || atlasBoss.disabled || !spriteReady(SPRITES.guardianAtlas)) return false;
    // Exactly the same straight, physical battery projectiles as in the field.
    // A misplaced tap can miss; no ray is bent toward the boss or deleted.
    if (kind !== "phaser") return fireClassicWeapon();
    // A collected temporary phaser is a separate timed power, never AUTO input.
    if (kind === "phaser") {
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({x1:player.x,y1:player.y-125,x2:player.x,y2:atlasBoss.y,
        life:.24,duration:.24,kind:"phaser",atlasPulse:true,atlasTarget:atlasBoss,damage:1});
      return true;
    }
    return false;
  }

  function resolveAtlasPulse(shot) {
    if (state !== "playing" || shot.atlasTarget !== atlasBoss || atlasBoss.disabled) return;
    if (Math.abs(shot.x2 - atlasBoss.x) > atlasBoss.r) return;
    const result = NeonCampaign.hitGuardianAtlas(atlasBoss, shot.damage || 1);
    for (const event of result.events) consumeAtlasEvent(event);
    if (result.accepted) {
      score += 3;
      if (shot.weapon==="missile")addMissileImpact(shot.impactX??atlasBoss.x,shot.impactY??atlasBoss.y);
      else if (settings.effects) {
        if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
        impactEffects.push({x: atlasBoss.x, y: atlasBoss.y, angle: 0, scale: 1,
          life: .24, duration: .24, atlasImpact: true});
      }
      combatSound("impact-metal",atlasBoss.x);
    } else {if(shot.weapon==="missile")addMissileImpact(shot.impactX??atlasBoss.x,shot.impactY??atlasBoss.y);combatSound("impact-plasma",atlasBoss.x);}
    syncAtlasHud();
  }

  function setupShipHangar() {
    if ($("shipHangar")) return;
    const menuActions = ui.menu.querySelector(".menu-actions");
    if (!menuActions) return;

    const openButton = document.createElement("button");
    openButton.id = "openHangar";
    openButton.type = "button";
    openButton.className = "secondary menu-hangar-button hidden";
    openButton.innerHTML = '<span class="menu-button-text"><span>ENTRAR AL HANGAR</span><small>PERSONALIZA · EQUIPA · MEJORA</small></span><b class="menu-new" aria-label="Nuevo">NUEVO</b>';
    menuActions.classList.add("has-hangar");
    menuActions.append(openButton);

    const hangar = document.createElement("div");
    hangar.id = "shipHangar";
    hangar.className = "overlay ship-hangar hidden";
    hangar.setAttribute("role", "dialog");
    hangar.setAttribute("aria-modal", "true");
    hangar.setAttribute("aria-labelledby", "shipHangarTitle");
    hangar.setAttribute("aria-describedby", "shipHangarRules");
    hangar.innerHTML = `<section class="panel ship-hangar-panel cockpit-dialog" tabindex="-1">
      <header class="ship-hangar-header cockpit-section-head"><small>NAVE · COMPONENTES</small><h2 id="shipHangarTitle">HANGAR</h2><p id="shipHangarRules">Configuración visual · mismas reglas de vuelo.</p></header>
      <div class="ship-hangar-layout">
        <figure class="ship-hangar-preview"><canvas id="shipHangarCanvas" width="512" height="512" role="img" aria-label="Vista previa de la nave seleccionada">Vista previa de la configuración de nave.</canvas><figcaption id="shipHangarName">Nave seleccionada</figcaption><p id="shipAtlasNotice" class="hidden" role="status">No se han cargado los componentes. Se muestra la nave de reserva; vuelve a abrir el juego para reintentar.</p></figure>
        <div class="ship-hangar-controls">
          <div class="ship-preset-list" role="group" aria-label="Naves disponibles"><button type="button" data-ship-preset="aster" aria-pressed="false"><b>ASTÉR</b><span>Exploradora</span></button><button type="button" data-ship-preset="bastion" aria-pressed="false"><b>BASTIÓN</b><span>Interceptora</span></button></div>
          <fieldset class="ship-components"><legend>Combina sus componentes</legend><label for="shipHull">Fuselaje<select id="shipHull"><option value="aster">Astér</option><option value="bastion">Bastión</option></select></label><label for="shipWings">Alas<select id="shipWings"><option value="aster">Astér</option><option value="bastion">Bastión</option></select></label><label for="shipEngines">Propulsores<select id="shipEngines"><option value="aster">Astér</option><option value="bastion">Bastión</option></select></label></fieldset>
          <p id="shipHangarStatus" class="ship-hangar-status" role="status">Los cambios se guardan al aplicar.</p>
        </div>
      </div>
      <footer class="ship-hangar-actions"><button id="shipApply" class="primary" type="button">APLICAR CONFIGURACIÓN</button><button id="shipHangarBack" class="secondary" type="button">VOLVER SIN CAMBIAR</button></footer>
    </section>`;
    canvas.closest(".game").append(hangar);
    ui.shipHangar = hangar;
    const panel = hangar.querySelector(".ship-hangar-panel");
    const presetButtons = [...hangar.querySelectorAll("[data-ship-preset]")];
    const components = [["hull", $("shipHull")], ["wings", $("shipWings")], ["engines", $("shipEngines")]];
    const sameLoadout = (first, second) => components.every(([key]) => first[key] === second[key]);

    function refreshDraft() {
      for (const [key, select] of components) {
        select.value = shipHangarDraft.loadout[key];
        select.disabled = false;
      }
      for (const button of presetButtons) {
        const preset = NeonCampaign.SHIP_FLEET.find(entry => entry.id === button.dataset.shipPreset);
        button.setAttribute("aria-pressed", String(Boolean(preset) && sameLoadout(shipHangarDraft.loadout, preset.loadout)));
      }
      const selected = NeonCampaign.SHIP_FLEET.find(entry => sameLoadout(shipHangarDraft.loadout, entry.loadout));
      $("shipHangarName").textContent = selected?.name || "Configuración combinada";
      $("shipHangarCanvas").setAttribute("aria-label", `Vista previa: ${$("shipHangarName").textContent}`);
      $("shipHangarStatus").textContent = "Vista previa · aplica para guardar tu elección.";
    }

    function closeHangar() {
      hangar.classList.remove("show");
      hangar.classList.add("hidden");
      shipHangarDraft = null;
      overlay(ui.menu);
      openButton.focus({ preventScroll: true });
    }

    openButton.onclick = () => {
      if (state !== "menu" || !(ui.menu.classList.contains("show") || ui.briefing.classList.contains("show"))) return;
      shipHangarDraft = { mode: "modular", loadout: { ...NeonCampaign.normalizeShipLoadout(shipLoadout) } };
      refreshDraft();
      hangar.classList.remove("hidden");
      overlay(hangar);
      panel.focus({ preventScroll: true });
    };
    for (const button of presetButtons) button.onclick = () => {
      if (!shipHangarDraft) return;
      const preset = NeonCampaign.SHIP_FLEET.find(entry => entry.id === button.dataset.shipPreset);
      if (!preset) return;
      shipHangarDraft = { mode: "modular", loadout: { ...NeonCampaign.normalizeShipLoadout(preset.loadout) } };
      refreshDraft();
    };
    for (const [key, select] of components) select.onchange = () => {
      if (!shipHangarDraft) return;
      shipHangarDraft = { mode: "modular", loadout: { ...NeonCampaign.normalizeShipLoadout({ ...shipHangarDraft.loadout, [key]: select.value }) } };
      refreshDraft();
    };
    $("shipApply").onclick = () => {
      if (!shipHangarDraft) return;
      const loadout = NeonCampaign.normalizeShipLoadout(shipHangarDraft.loadout);
      if (!storage.setJSON(NeonCampaign.SHIP_FLEET_SAVE_KEY, { version: 1, mode: "modular", loadout })) {
        $("shipHangarStatus").textContent = "No se pudo guardar. Tu nave anterior sigue seleccionada.";
        return;
      }
      shipRenderMode = "modular";
      shipLoadout = loadout;
      syncShipPresentation();
      closeHangar();
      toast("Configuración de nave guardada");
    };
    $("shipHangarBack").onclick = closeHangar;
    hangar.addEventListener("keydown", event => {
      // Keep preview keyboard navigation out of the campaign's global controls.
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        closeHangar();
      } else if (event.key === "Tab") {
        const controls = [...hangar.querySelectorAll("button,select")].filter(element => !element.disabled);
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }

  function updateMenu() {

    ui.best.textContent = bestScore();
    // El menú sigue el sector continuo (decisión del propietario, 23/10/2026:
    // JUGAR abre el sector 1; los viajes antiguos solo en el panel de desarrollo).
    const save=loadSectorSave(),run=save.run,done=save.sectors[1]?.completed===true;
    const stars=Object.values(save.sectors).reduce((sum,record)=>sum+record.stars,0);
    const stage=run?run.stageNumber:done?11:1,percent=Math.round((stage-1)*10);
    ui.unlockedText.textContent=`${save.unlocked}/10`;
    ui.totalStars.textContent=`${stars}/30`;
    ui.campaignPercent.textContent=`${percent}%`;
    ui.campaignFill.style.width=`${percent}%`;
    // Los botones se abren con la historia (propietario, 24/10/2026); en
    // pruebas (?dev=1) el hangar está siempre a mano.
    const view=NeonCampaign.menuView(save,loadMenuUnlocks());
    rememberMenuUnlocks(view.unlocks);
    ui.playLabel.textContent=view.play.label;
    ui.playSector.textContent=view.play.detail;
    const hangarButton=$("openHangar");
    if(hangarButton){
      hangarButton.classList.toggle("hidden",!view.hangar.visible&&!DEV);
      hangarButton.classList.toggle("is-new",view.hangar.isNew);
    }
    ui.campaignNodes.innerHTML=Array.from({length:10},(_,index)=>
      `<span class="${index+1<stage?"done ":""}${index+1===stage?"current":""}"></span>`).join("");
    buildLevelGrid();
  }

  // Mientras el tramo espera CRONIUM, el contador muestra su cuota (R6).
  function croniumGoalLabel() {
    return classicFlightView?.waitingFor==="cronium"?`${collected}/${classicFlightView.stageGoal}`:`${collected}/${level().goal}`;
  }

  function hud() {
    hudScoreTarget = score;
    if (state !== "playing") displayedScore = score;
    ui.score.textContent = Math.round(displayedScore);
    ui.goal.textContent = croniumGoalLabel();
    ui.hull.textContent = `${Math.max(0, Math.ceil(hull))}%`;
    ui.hull.title=`Casco ${Math.ceil(hull)} de 100. Refuerzo ${Math.ceil(classicHullReserve)} de ${classicHullReserveCapacity}, sin temporizador.`;
    let reserve=$("hullReserve");
    if(!reserve){reserve=document.createElement("span");reserve.id="hullReserve";ui.hull.after(reserve);}
    reserve.textContent=classicHullReserve>0?`+${Math.ceil(classicHullReserve)}`:"";
    // Los 10 viajes corren en currentLevel 0: la casilla muestra el viaje
    // (ficha del mapa o la de S1-V1), no un «NIVEL 1» que nunca cambia.
    ui.hudLevel.textContent = classicSideVoyage ? classicSideVoyage.ficha.id
      : NeonCampaign.PLAYABLE_VOYAGES.find(ficha => ficha.id === "S1-V1").id;
    ui.hudLevel.previousElementSibling.textContent = "VIAJE";
    // En espera de CRONIUM la cifra es la cuota del tramo, también en pausa (A2).
    ui.goal.previousElementSibling.textContent=classicFlightView?.waitingFor==="cronium"?"TRAMO":"CRONIUM";
    ui.hullBar.style.width = `${clamp(hull, 0, 100)}%`;
    ui.hullBar.style.background = hull > 66
      ? "linear-gradient(90deg,#63ffc4,#64e9ff)"
      : hull > 33
        ? "linear-gradient(90deg,#ffe166,#ff9f55)"
        : "linear-gradient(90deg,#ff5b7c,#ff2e55)";

    if (collected > lastHudCollected) animateHud(ui.goal, "hud-pop");
    if (hull < lastHudHull) {
      animateHud(ui.hull, "hud-damage");
      animateHud(ui.hullBar?.parentElement, "hud-damage");
    }
    lastHudCollected = collected;
    lastHudHull = hull;
    updateAmmoHud();
    syncClassicFlightHud();
  }

  function updateAmmoHud() {
    if (!ui.fire || !ui.ammo) return;
    if(classicWeapons) {
      ammo=classicWeapons.charges;
      ui.ammo.textContent="";
      ui.fire.disabled=state!=="playing" || warpTimer>0;
      ui.fire.setAttribute("aria-disabled", String(ui.fire.disabled || (!classicWeapons.unlimitedFire&&ammo<=0) || manualShotCooldown>0));
      ui.fire.classList.toggle("empty",!classicWeapons.unlimitedFire&&ammo<=0);
      syncClassicMissileHud();
      const weapon=NeonCampaign.CLASSIC_WEAPON_RULES.types[classicEquipment.selected];
      const tuned=(classicEquipment.selected==='scatter'&&classicSalvageState?.upgrades.includes('scatter-focus'))||
        (classicEquipment.selected==='needle'&&classicSalvageState?.upgrades.includes('needle-resonance'));
      if(ui.fireWeapon)ui.fireWeapon.textContent=weapon.label.toUpperCase()+(tuned?' II':'');
      ui.fire.setAttribute("aria-label",ammo>0?`Mantener para disparar ${weapon.label}. La energía se recupera durante el vuelo.`:"El arma está recuperando energía. Mantén para disparar cuando esté disponible.");
      return;
    }
    if (atlasBoss) {
      ui.fire.classList.remove("empty");
      ui.ammo.textContent = manualShotCooldown > 0 ? "RECARGA" : "PULSO BÁSICO · ∞";
      ui.fire.disabled = state !== "playing" || warpTimer > 0;
      ui.fire.setAttribute("aria-disabled", String(ui.fire.disabled || manualShotCooldown > 0));
      ui.fire.setAttribute("aria-label", "Mantener para disparar pulso básico sin munición limitada");
      return;
    }
    ui.ammo.textContent = `${ammo}/${MAX_AMMO}`;
    const unavailable = state !== "playing" || ammo <= 0 || manualShotCooldown > 0 || warpTimer > 0;
    ui.fire.disabled = state !== "playing" || warpTimer > 0;
    ui.fire.setAttribute("aria-disabled", String(unavailable));
    ui.fire.classList.toggle("empty", ammo <= 0);
    ui.fire.setAttribute("aria-label", ammo > 0
      ? `Mantener para disparar. Munición ${ammo} de ${MAX_AMMO}`
      : "Mantener para disparar cuando recuperes munición");
  }

  function animateHud(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function updateHudVisual(dt) {
    const difference = hudScoreTarget - displayedScore;
    if (Math.abs(difference) < 0.5) displayedScore = hudScoreTarget;
    else displayedScore += difference * Math.min(1, dt * 11);
    ui.score.textContent = Math.round(displayedScore);
  }

  function updatePowerHud() {
    let layoutChanged = false;
    const map = [
      ["shield", ui.powerShield],
      ["tractor", ui.powerTractor],
      ["slow", ui.powerSlow],
      ["double", ui.powerDouble],
      ["phaser", ui.powerPhaser]
    ];
    for (const [name, element] of map) {
      const active = powers[name] > 0;
      if (element.classList.contains("active") !== active) layoutChanged = true;
      element.dataset.power = name;
      element.classList.toggle("active", active);
      element.querySelector("em").textContent = active ? Math.ceil(powers[name]) : "0";
    }
    // Only additions/removals can resize the row. Countdown frames must not
    // measure layout; a newly collected power must not cover the ship's tail.
    if (layoutChanged && state === "playing") refreshClassicFlightBounds();
  }

  function updateEncounterHud() {
    ui.encounterProgress.classList.toggle("active", false);
  }

  // Mapa de sector (docs/design/MAPA_SECTOR.md): rutas del sector 1 y bases
  // con conversación. Sin guardado propio: S1-V1 está hecho si Gaia se abrió.
  let sectorMapShown = 1;
  // Progreso de la campaña de viajes: qué viajes están hechos y estado de
  // cada sector. Lo usan el mapa, «Jugar» y la pantalla de completado.
  // Estrellas de una ronda (misma regla para S1-V1 y los viajes del mapa):
  // 3 con casco ≥90 % y casi todo el CRONIUM, 2 con casco ≥55 %, si no 1.
  function runStars() {
    const missed = energySpawned - collected;
    return hull >= 90 && missed <= Math.ceil(energyBudget * 0.1) ? 3 : hull >= 55 ? 2 : 1;
  }
  /** Mejores estrellas guardadas de un viaje (0 si no se ha completado). */
  // Un viaje hecho vale al menos 1: los guardados anteriores a las estrellas
  // por viaje (o con un valor dañado) no salen como «HECHO ☆☆☆».
  function voyageStars(voyageId) {
    if (voyageId === "S1-V1") return getUnlocked() >= 2 ? Math.max(1, getStars()[1] || 0) : 0;
    const ficha = NeonCampaign.PLAYABLE_VOYAGES.find(item => item.id === voyageId);
    const record = ficha ? loadSideVoyageRecord(ficha) : null;
    return record?.completed ? Math.max(1, record.stars) : 0;
  }
  function campaignSectors() {
    if (typeof NeonCampaign.sectorMapState !== "function") return [];
    const firstDone = getUnlocked() >= 2;
    const sideDone = NeonCampaign.PLAYABLE_VOYAGES.filter(ficha => ficha.id !== "S1-V1" && loadSideVoyageRecord(ficha)?.completed)
      .map(ficha => ficha.id);
    const progress = {playable: NeonCampaign.PLAYABLE_VOYAGES.map(ficha => ficha.id),
      completed: [...(firstDone ? ["S1-V1"] : []), ...sideDone]};
    return Object.keys(NeonCampaign.SECTOR_MAPS).map(Number).map(id => NeonCampaign.sectorMapState(id, progress));
  }
  /** Siguiente viaje de la campaña (la primera ruta abierta), o null. */
  function nextCampaignVoyage() {
    for (const sector of campaignSectors()) {
      const route = sector.routes.find(item => item.status === "open");
      if (route) return route;
    }
    return null;
  }
  function buildSectorMap() {
    if (!ui.sectorMap || typeof NeonCampaign.sectorMapState !== "function") return;
    const sectors = campaignSectors();
    const sideDone = sectors.flatMap(sector => sector.routes).filter(route => route.status === "done").map(route => route.voyage);
    if (!sectors.find(item => item.id === sectorMapShown)?.open) sectorMapShown = 1;
    const map = sectors.find(item => item.id === sectorMapShown);
    const place = id => map.places.find(item => item.id === id);
    const pct = value => `${(value * 100).toFixed(1)}%`;
    ui.sectorMap.replaceChildren();
    ui.sectorMap.setAttribute("aria-label", map.title);
    // Pestañas de sector: un sector se abre al terminar el anterior.
    const tabs = document.createElement("div"); tabs.className = "sector-tabs"; tabs.setAttribute("role", "tablist");
    for (const sector of sectors) {
      const tab = document.createElement("button");
      tab.type = "button"; tab.className = "sector-tab"; tab.setAttribute("role", "tab");
      tab.dataset.sector = String(sector.id); tab.textContent = sector.open ? `SECTOR ${sector.id}` : `SECTOR ${sector.id} 🔒`;
      tab.disabled = !sector.open; tab.setAttribute("aria-selected", String(sector.id === map.id));
      tab.onclick = () => { sectorMapShown = sector.id; closeBaseTalk(); buildSectorMap();
        ui.sectorMap.querySelector(`[data-sector="${sector.id}"]`)?.focus(); };
      tabs.append(tab);
    }
    ui.sectorMap.append(tabs);
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lines.setAttribute("viewBox", "0 0 100 100"); lines.setAttribute("preserveAspectRatio", "none");
    lines.setAttribute("aria-hidden", "true"); lines.classList.add("sector-map-lines");
    for (const route of map.routes) {
      const from = place(route.from), to = place(route.to);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
      path.setAttribute("x1", from.x * 100); path.setAttribute("y1", from.y * 100);
      path.setAttribute("x2", to.x * 100); path.setAttribute("y2", to.y * 100);
      path.dataset.status = route.status; lines.append(path);
    }
    ui.sectorMap.append(lines);
    for (const item of map.places) {
      const node = document.createElement(item.kind === "base" ? "button" : "div");
      node.className = "sector-place"; node.dataset.kind = item.kind; node.dataset.place = item.id;
      node.style.left = pct(item.x); node.style.top = pct(item.y);
      node.innerHTML = `<i aria-hidden="true"></i><b>${item.label}</b>${item.note ? `<small>${item.note}</small>` : ""}`;
      if (item.kind === "base") { node.type = "button"; node.onclick = () => openBaseTalk(item.id === "gaia" ? "gaia" : "c9", sideDone.includes("S1-V5"), node); }
      ui.sectorMap.append(node);
    }
    for (const route of map.routes) {
      const from = place(route.from), to = place(route.to);
      const node = document.createElement("button");
      node.type = "button"; node.className = "sector-route"; node.dataset.status = route.status;
      node.dataset.voyage = route.voyage;
      node.style.left = pct((from.x + to.x) / 2); node.style.top = pct((from.y + to.y) / 2);
      const stars = route.status === "done" ? ` ${"★".repeat(voyageStars(route.voyage))}${"☆".repeat(3 - voyageStars(route.voyage))}` : "";
      node.innerHTML = `<small>${route.voyage}${route.status === "done" ? " · HECHO" + stars : route.status === "locked" ? " · EN PREPARACIÓN" : ""}</small><b>${route.title}</b>`;
      node.disabled = route.status === "locked";
      if (route.status !== "locked") node.onclick = () => route.voyage === "S1-V1" ? prepareLevel(0, "levels") : startSideVoyage(route.voyage);
      ui.sectorMap.append(node);
    }
  }

  let baseTalkState = null;
  function openBaseTalk(baseId, atlasConvinced, opener = null) {
    const talk = NeonCampaign.baseConversation(baseId, {atlasConvinced});
    if (!talk || !ui.baseTalk) return;
    baseTalkState = {talk, index: 0, opener: opener?.dataset.place || null};
    $("baseTalkFace").dataset.actor = talk.actor.id;
    $("baseTalkName").textContent = `${talk.actor.name.toUpperCase()} · ${talk.actor.role}`;
    showBaseTalkLine();
    ui.baseTalk.hidden = false;
    $("baseTalkNext").focus();
  }
  function showBaseTalkLine() {
    const {talk, index} = baseTalkState;
    $("baseTalkLine").textContent = talk.lines[index].text;
    const last = index >= talk.lines.length - 1;
    if (last && document.activeElement === $("baseTalkNext")) $("baseTalkClose").focus();
    $("baseTalkNext").hidden = last;
  }
  function closeBaseTalk() {
    const opener = baseTalkState?.opener;
    baseTalkState = null;
    if (ui.baseTalk) ui.baseTalk.hidden = true;
    // El foco vuelve a la base que abrió la conversación.
    if (opener) ui.sectorMap?.querySelector(`[data-place="${opener}"]`)?.focus();
  }

  // RUTA muestra solo el mapa de la campaña de viajes: los niveles clásicos
  // ya no forman parte del juego (orden del propietario, 21/10/2026).
  function buildLevelGrid() {
    buildSectorMap(); closeBaseTalk();
  }

  function prepareLevel(index, returnTo = "menu") {
    classicVoyageRequestedStage=null;
    pendingLevel = clamp(index, 0, getUnlocked() - 1);
    briefingReturn = returnTo;
    const lv = LEVELS[pendingLevel];
    ui.briefingSector.textContent = "VIAJE S1-V1";
    ui.briefingName.textContent = lv.name;
    ui.briefingZone.textContent = `${lv.world} · ${lv.zone}`;
    ui.briefingGoal.textContent = `${lv.goal} CRONIUM`;
    ui.briefingThreat.textContent = lv.threatLabel;
    ui.briefingSupply.textContent = `${lv.goal + Math.ceil(lv.goal * 0.25)} disponibles`;
    ui.briefingMission.textContent = lv.mission;
    ui.briefingVisual.dataset.scene = lv.scene;
    ui.briefingPanel.style.setProperty("--brief-accent", lv.accent);
    buildChronosStageGrid();
    // El inicio de Chronos empieza a cargar al abrir la ficha, no al despegar.
    if(pendingLevel===0)[SPRITES.chronosIntroStation,SPRITES.chronosIntroFragments,SPRITES.cronosPrimeVideo,
      SPRITES.chronosStationBurst,SPRITES.cronosPrimeFx,SPRITES.cronosPrimeBeam].forEach(ensureSprite);
    overlay(ui.briefing);
  }

  function closeBriefing() {
    classicVoyageRequestedStage=null;
    if (briefingReturn === "levels") overlay(ui.levelSelect);
    else if (briefingReturn === "complete") overlay(ui.complete);
    else overlay(ui.menu);
  }

  function showBanner() {
    ui.bannerSector.textContent = `SECTOR ${currentLevel + 1}`;
    ui.bannerName.textContent = level().name.toUpperCase();
    ui.bannerGoal.textContent = `Recupera ${level().goal} núcleos · ${level().desc}`;
    ui.banner.classList.add("show");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => ui.banner.classList.remove("show"), 2500);
  }

  function resetPowers() {
    for (const key in powers) powers[key] = 0;
    classicShieldAge=0;classicShieldImpact=0;
    tractorTarget = null;
    updatePowerHud();
  }

  function hideWarning() {
    ui.hazardWarning.classList.remove("show");
  }

  const LEVEL_ONE_STORY = [
    { at: 2.8, speaker: "IA N-7", text: "Centro Cronos, responda. Repito: Centro Cronos, responda." },
    { at: 18, speaker: "IA N-7", text: "Sin respuesta. Detecto fragmentos temporales dentro del corredor." },
    { at: 42, speaker: "IA N-7", text: "La radiación no coincide con ningún accidente registrado." }
  ];

  function hideStoryTransmission() {
    ui.storyTransmission?.classList.remove("show");
    flightTransmission=null;
  }

  function showStoryTransmission(speaker, text, duration = 4.6) {
    if(ui.flightRoute) {
      flightTransmission={speaker,speakerId:/MIRA/.test(speaker)?"mira":/IRIA/.test(speaker)?"iria":/LIRA/.test(speaker)?"lira":null,text,remaining:duration};syncClassicFlightHud();return;
    }
    if (!ui.storyTransmission) return;
    ui.storySpeaker.textContent = speaker;
    ui.storyText.textContent = text;
    ui.storyTransmission.classList.add("show");
    storyTimer = duration;
    tone(315, 0.06, "sine", 0.035);
  }

  function updateLevelStory(dt) {
    if(flightTransmission) {
      flightTransmission.remaining=Math.max(0,flightTransmission.remaining-dt);
      if(flightTransmission.remaining===0){flightTransmission=null;syncClassicFlightHud();}
    }
    if (storyTimer > 0) {
      storyTimer = Math.max(0, storyTimer - dt);
      if (storyTimer === 0) hideStoryTransmission();
    }
    if(classicChapterStory&&classicFlightView) {
      classicChapterStory.advance({elapsed:classicFlightView.elapsed,playing:state==="playing"},classicChapterEvent);
      classicChapterView=classicChapterStory.snapshot();syncClassicChapterPresentation();
      advanceClassicTutorial();
    }
    if (classicFlight || currentLevel !== 0 || state !== "playing" || warpTimer > 0) return;
    const next = LEVEL_ONE_STORY[storyStep];
    if (next && elapsed >= next.at) {
      showStoryTransmission(next.speaker, next.text);
      storyStep++;
    }
    if (elapsed >= 31 && !levelOneShockwaveTriggered) {
      levelOneShockwaveTriggered = true;
      levelOneShockwave = 0.62;
      stormPulse = Math.max(stormPulse, 0.42);
      shake = Math.max(shake, 12);
      cameraKickY = 8;
      pulseRing(player.x, player.y + SHIP_VISUAL.centerYOffset, "#a5faff", 245, 0.56, "pulse");
      burst(player.x, player.y + SHIP_VISUAL.centerYOffset, 38, "cyan");
      tone(78, 0.8, "sawtooth", 0.055);
      showStoryTransmission("IA N-7", "Onda expansiva. Mantén el rumbo.", 3.2);
    }
  }

  function startLevel(index = currentLevel) {
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    hullGrace = 0;
    playerMarkedUntil = -Infinity;
    classicGuideSeen = null;classicCroniumWaitNotice = null;classicCroniumWaitAt = -Infinity;classicCroniumWaitShown = null;lastResumeGraceAt = -Infinity;
    cancelSupplyFailureTimer();
    startMusic();
    currentLevel = clamp(index, 0, getUnlocked() - 1);
    let voyageEntry=null,voyageCheckpoint=null;
    // Reintentar o reiniciar (desde pausa o derrota) conserva el viaje secundario.
    const sideFicha=classicSideVoyagePending||(["paused","gameover","complete"].includes(state)?classicSideVoyage?.ficha:null);
    // Reintentar o reiniciar (no abrir desde el mapa) reanuda una rejugada a medias (B02).
    // «Repetir» tras completar empieza siempre en el 1 (revisión P02).
    const sideRetry=!classicSideVoyagePending&&state!=="complete";
    // Solo «Repetir» el mismo viaje; «Siguiente viaje» sí reanuda el suyo (A1).
    const sideReplay=!classicSideVoyagePending&&state==="complete";
    classicSideVoyage=currentLevel===0&&sideFicha?{ficha:sideFicha,route:NeonCampaign.createVoyageRoute(sideFicha)}:null;
    classicSideVoyagePending=null;
    if(isSectorRun()){
      // «Continuar» vuelve al inicio del tramo guardado con su casco; sin
      // partida en curso (o tras completar el sector) se empieza en el tramo 1.
      const {ficha,route}=classicSideVoyage,requested=classicVoyageRequestedStage;
      let save=loadSectorSave();
      const point=NeonCampaign.continuePoint(save);
      if(requested>=1&&requested<=route.stageCount){
        voyageCheckpoint=route.createCheckpoint(requested,{goal:LEVELS[0].goal});
        saveSector(NeonCampaign.enterStage(NeonCampaign.startSectorRun(save,ficha.sector),requested,100));
      } else if(point&&point.sector===ficha.sector){
        voyageCheckpoint=route.createCheckpoint(point.stageNumber,{goal:LEVELS[0].goal});
        voyageEntry={hull:point.hull,score:0,maxCombo:1};
      } else saveSector(NeonCampaign.startSectorRun(save,ficha.sector));
    } else if(classicSideVoyage){
      const record=loadSideVoyageRecord(classicSideVoyage.ficha);
      // Un tramo pedido (panel de desarrollo) manda sobre el punto guardado.
      const requested=classicVoyageRequestedStage;
      if(requested>=1&&requested<=classicSideVoyage.route.stageCount)voyageCheckpoint=classicSideVoyage.route.createCheckpoint(requested,{goal:LEVELS[0].goal});
      // «Repetir» tras completar nunca reanuda un punto viejo, ni en la primera pasada (A5).
      else if(record&&!sideReplay&&(!record.completed||(record.inProgress&&sideRetry))){voyageCheckpoint=record.checkpoint;voyageEntry=record.entry;}
    } else if(currentLevel===0){
      const requested=classicVoyageRequestedStage;
      const resume=classicVoyageRecord&&!classicVoyageRecord.completed&&(!requested||requested===classicVoyageRecord.checkpoint.stageNumber);
      if(resume){voyageCheckpoint=classicVoyageRecord.checkpoint;voyageEntry=classicVoyageRecord.entry;}
      else if(requested){voyageCheckpoint=NeonCampaign.createChronosVoyageCheckpoint(requested,{goal:LEVELS[0].goal});}
    }
    classicVoyageRequestedStage=null;
    classicFlight=classicSideVoyage ? classicSideVoyage.route.create({goal:LEVELS[0].goal,checkpoint:voyageCheckpoint})
      : currentLevel===0 ? NeonCampaign.createChronosVoyage({goal:LEVELS[0].goal,checkpoint:voyageCheckpoint}) : null;
    classicFlightView=classicFlight?.snapshot() || null;
    resetSectorAttackTokens();
    // Un intento que empieza pasado el tramo 5 ya dejó atrás al CH-03.
    ch03Boss=null;ch03Beaten=Boolean(classicFlightView)&&classicFlightView.stageNumber>5;sectorBeaconOffered=false;
    // La historia del capítulo dura 360 s: en los tramos posteriores del sector no hay.
    classicChapterStory=classicFlight&&fichaHasIntro()&&classicFlightView.elapsed<NeonCampaign.CHRONOS_CHAPTER_ROUTE_SECONDS?NeonCampaign.createChronosChapterStory({checkpoint:voyageEntry&&!classicSideVoyage?classicVoyageRecord?.chapter:null,routeElapsed:classicFlightView.elapsed,presentation:"in-world"}):null;
    classicChapterView=classicChapterStory?.snapshot()||null;
    classicTutorial=classicFlight&&fichaHasIntro()?NeonCampaign.createFlightTutorial({routeElapsed:classicFlightView.elapsed,checkpoint:settings.flightTutorial}):null;classicWorkshopOpened=false;
    classicTutorialAnchor=null;classicTutorialSignature='';
    classicWeapons=NeonCampaign.createClassicWeapons({type:classicEquipment.selected,unlocked:classicEquipment.unlocked,width:W,height:H});
    // En el sector, empezar en el tramo 1 es un intento nuevo: sus enemigos
    // vuelven a soltar chatarra (lo ya cobrado se conserva en la bodega).
    beginClassicSalvageRun(isSectorRun()?classicFlightView.stageNumber>1:Boolean(voyageEntry||(classicSideVoyage&&voyageCheckpoint)));
    sectorDeathRecorded=false;
    resetClassicCometShower();
    // A restored entry has already emitted its checkpoint event. Initialize
    // the same encounter grace here instead of waiting for that event to replay.
    classicPatrolTimer=classicFlightView?(classicFlightView.stageNumber===1?4:7):0;
    classicPatrolSequence=0;classicPursuitAnnounced=new Set();classicThreatSequence=0;classicHordeTimer=null;classicHordeSequence=0;classicCometSequence=0;classicCometWarning=-1;flightHudSignature="";
    // Un reintento empieza con un campo nuevo (y su respiro), no con el gastado.
    classicVoyageHazards=null;
    classicVoyageSpawnTimer=1;classicVoyageHazardTimer=10;classicVoyageStageId=classicFlightView?.stageId||"";
    NeonCampaign.endFlightInput(classicFlightInput);
    ensureSprite(SPRITES.chapterMissile);ensureSprite(SPRITES.chapterPortraits);ensureSprite(SPRITES.croniumEnergy);
    ensureSprite(SPRITES.atlasVfx);ensureSprite(SPRITES.gaiaPulse);ensureSprite(SPRITES.hostileOrdnance);ensureSprite(SPRITES.flightWeapons);ensureSprite(SPRITES.forceShieldAtlas);
    if(classicEquipment.selected==="lance")SPRITE_GROUPS.phaser.forEach(ensureSprite);
    if(classicFlight){
      ensureSprite(SPRITES.flightKit);ensureSprite(SPRITES.flightSpace);
      ensureSprite(SPRITES.ch01);
      ensureSprite(SPRITES.chronosDestruction);ensureSprite(SPRITES.chronosShockwave);
      ensureSprite(SPRITES.chronosIntroStation);ensureSprite(SPRITES.chronosIntroFragments);ensureSprite(SPRITES.cronosPrimeVideo);ensureSprite(SPRITES.chronosStationBurst);ensureSprite(SPRITES.cronosPrimeFx);ensureSprite(SPRITES.cronosPrimeBeam);ensureSprite(SPRITES.chronosShockwave);
      ensureSprite(SPRITES.guardianAtlas);
    }

    atlasBoss = null;resetAtlasFury();
    atlasFireTimer = atlasReentryGrace = 0;
    atlasLastStatus = "";
    ui.goal.previousElementSibling.textContent = "NÚCLEOS";
    document.body.classList.remove("atlas-combat");
    ui.atlasEncounter?.classList.add("hidden");
    if (isAtlasMission()) {
      ensureSprite(SPRITES.guardianAtlas);ensureSprite(SPRITES.atlasVfx);
      ensureSprite(SPRITES.ch01);ensureSprite(SPRITES.ch02);
      ensureSprite(SPRITES.flightKit);ensureSprite(SPRITES.flightSpace);ensureSprite(SPRITES.satellite);
    }
    setState("playing");
    score = 0;
    displayedScore = 0;
    hudScoreTarget = 0;
    hull = 100;
    classicHullReserve=classicHullReserveCapacity;
    combo = 1;
    maxCombo = 1;
    comboTimer = 0;
    collected = 0;
    if(classicFlight){
      collected=classicFlightView.collected;
      if(voyageEntry){hull=isSectorRun()?voyageEntry.hull:Math.max(voyageEntry.hull,CLASSIC_RESUME_HULL_FLOOR);classicHullReserve=Math.min(classicHullReserveCapacity,voyageEntry.reserve??classicHullReserveCapacity);score=voyageEntry.score;maxCombo=voyageEntry.maxCombo;}
    }
    ammo = classicWeapons?classicWeapons.charges:INITIAL_AMMO;
    manualShotCooldown = 0;
    elapsed = 0;
    continued = false;
    spawnTimer = 0.35;
    classicScoutTimer = currentLevel === 1 ? 3.8 : 0;
    classicScoutAnnounced = false;
    warpTimer = classicFlight ? 0 : 1.25;
    supplyFailed = false;
    shake = 0;
    flash = 0;
    stormPulse = 0;
    destructionTimer = 0;
    destructionStage = 0;
    playerVisible = true;
    damageSmokeSide = 1;
    damageSmokeLocked = false;
    impactReactionTimer = 0;
    impactReactionSide = 1;
    storyStep = 0;
    storyTimer = 0;
    levelOneShockwave = 0;
    levelOneShockwaveTriggered = false;
    cameraKickX = 0;
    cameraKickY = 0;
    lastHudCollected = 0;
    lastHudHull = 100;
    hideStoryTransmission();
    items = [];
    gates = [];
    clearTransientEffects();
    player.x = player.target = W / 2;
    player.drift = 0;
    resetPowers();
    applyClassicSalvageShield();

    energySpawned = 0;
    // Los fragmentos perdidos antes del punto de control siguen contando.
    if(classicFlight)energySpawned=collected+(voyageEntry?.missed||0);
    energyBudget = level().goal + Math.ceil(level().goal * 0.25);
    powerSpawned = 0;
    powerBudget = 2 + Math.floor(currentLevel / 3);
    repairAllowance = currentLevel >= 3 && Math.random() < 0.45 ? 1 : 0;
    repairSpawned = 0;
    phaserCooldown = 0;
    gateCountdown = level().gate ? 8.5 + Math.random() * 3 : Infinity;

    ui.reward.classList.remove("hidden");
    ui.reward.disabled = false;
    ui.newBest.classList.add("hidden");
    ui.supplyStatus.textContent = "";
    hideWarning();
    overlay();
    ui.hud.classList.remove("hidden");
    ui.powerHud.classList.remove("hidden");
    ui.fire.classList.remove("hidden");
    setClassicFlightHudVisible(true);refreshClassicFlightBounds(true);
    hud();
    updateEncounterHud();
    tone(540 + currentLevel * 22, 0.11, "triangle", 0.07);
    if(classicFlightView?.waitingFor==="service")beginClassicVoyageService();
    window.AnalyticsManager?.track("game_start", { level: currentLevel + 1 });
    window.AnalyticsManager?.track("level_start", { level: currentLevel + 1, continued: false });
  }

  function pauseGame() {
    if (state !== "playing") return;
    if (typeof resetGameInput === "function") resetGameInput();
    NeonCampaign.endFlightInput(classicFlightInput);
    setState("paused");
    pauseStartedAt = performance.now();
    hideWarning();
    overlay(ui.paused);
  }

  function resumeGame() {
    if (state !== "paused") return;
    if(ui.flightDock?.classList.contains("show")&&flightDockReturn==="hud"){closeClassicDock();return;}
    setState("playing");
    overlay();
    last = performance.now();
    grantResumeGrace();
    resumeAudio();
  }

  // Gracia de 0,8 s al volver a jugar tras una pausa real (≥ 0,5 s) y como
  // mucho una vez cada 3 s de juego: pausar sin parar no encadena
  // invulnerabilidad (revisiones L2 y R1).
  function grantResumeGrace() {
    if (performance.now() - pauseStartedAt < 500 || elapsed - lastResumeGraceAt < 3) return;
    lastResumeGraceAt = elapsed;
    hullGrace = Math.max(hullGrace, 0.8);
  }

  function goHome() {
    if (typeof resetGameInput === "function") resetGameInput();
    classicSideVoyage=null;ch03Boss=null;
    classicTutorial=null;classicFlight=null;classicFlightView=null;classicChapterStory=null;classicChapterView=null;
    syncClassicChapterPresentation();
    if(classicWeapons)classicWeapons.projectiles.length=0;
    NeonCampaign.endFlightInput(classicFlightInput);
    setClassicFlightHudVisible(false);
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("menu");
    atlasBoss = null;resetAtlasFury();
    ui.atlasEncounter?.classList.add("hidden");
    document.body.classList.remove("atlas-combat");
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");
    syncClassicChapterPresentation();
    hideWarning();
    hideStoryTransmission();
    overlay(ui.menu);
    updateMenu();
  }

  function registerRun() {
    const games = Math.trunc(Math.max(0, storage.getNumber(KEYS.games, 0))) + 1;
    storage.set(KEYS.games, games);
    const interval = Math.trunc(Math.max(0, Number(window.MONETIZATION_CONFIG?.native?.interstitialEveryRuns) || 0));
    if (interval > 0 && games % interval === 0) window.AdBridge?.showInterstitial?.().catch(() => {});
  }

  function saveScore() {
    // Game-over saves run outside the completion journal. Read both records
    // explicitly before writing: a denied read must never become a zero/default.
    const bestRead=storage.readRaw(KEYS.best),levelsRead=storage.readRaw(KEYS.levelBest);
    if(!bestRead.ok||!levelsRead.ok||!Number.isFinite(score)||score<0)return false;
    const previousBest=bestRead.value===null||bestRead.value===""?0:Number(bestRead.value);
    if(!Number.isFinite(previousBest)||previousBest<0)return false;
    let bests;
    try {bests=levelsRead.value===null?{}:JSON.parse(levelsRead.value);} catch {return false;}
    if(!bests||typeof bests!=="object"||Array.isArray(bests)||
      Object.values(bests).some(value=>!Number.isFinite(Number(value))||Number(value)<0))return false;
    const previousLevel=Object.hasOwn(bests,currentLevel+1)?Number(bests[currentLevel+1]):0;
    if(score>previousBest&&!storage.set(KEYS.best,score))return false;
    if(score>previousLevel)return storage.setJSON(KEYS.levelBest,{...bests,[currentLevel+1]:score});
    return true;
  }

  function completeLevel() {
    if (state !== "playing") return;
    if(classicFlight && !classicFlight.snapshot().canFinish)return;
    if (isAtlasMission()) {
      if (!atlasBoss) { beginAtlasEncounter(); return; }
      if (!atlasBoss.resolved) return;
    }
    if(classicSideVoyage){completeSideVoyage();return;}
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("complete");
    setClassicFlightHudVisible(false);
    if(classicWeapons)classicWeapons.projectiles.length=0;
    ui.atlasEncounter?.classList.add("hidden");
    document.body.classList.remove("atlas-combat");
    hideWarning();
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");

    const earned = runStars();
    // Anuncios (decisiones del tablero rev37-ads-s1v1 y rev37-ads-doble): S1-V1
    // cuenta como partida solo la primera vez, y no si se continuó con anuncio.
    // (Rejugar S1-V1 reescribe su registro como no completado: la señal
    // duradera es el desbloqueo, la misma que usan el mapa y las estrellas.)
    const firstTime=getUnlocked()<2;
    const completedVoyage=classicFlightView?.canFinish
      ? classicVoyageCheckpointRecord(classicFlight.exportCheckpoint(),true) : null;
    // The bounded intent is written before any progress key. S1-V1 no longer
    // carries a boss reward: Atlas and its Gemelo authorization live in S1-V5.
    // (Old pending journals with equipment are still replayed on boot.)
    const completion = !classicVoyageWritable ? {ok:false,status:"blocked"}
      : completionJournal.complete({completionId:`${KEYS.unlocked}:${currentLevel+1}:${runToken}:${Date.now()}`,
        level:currentLevel+1,stars:earned,score:Math.max(0,Math.floor(score)),checkpoint:completedVoyage});
    const progressSaved=completion.ok,newlyUnlocked=Boolean(completion.newlyUnlocked);
    completionPersistenceBlocked=!completion.ok;
    if(completedVoyage&&completion.ok)classicVoyageRecord=completedVoyage;
    if(firstTime&&progressSaved&&!continued)registerRun();
    ui.completeLabel.textContent = currentLevel === LEVELS.length - 1 ? "CAMPAÑA ACTUAL COMPLETADA" : "NIVEL SUPERADO";
    if(ui.completeVisual)ui.completeVisual.dataset.scene=level().scene;
    ui.completeTitle.textContent = currentLevel === LEVELS.length - 1
      ? "Has estabilizado el Colapso Neon"
      : `${level().name} completado`;
    ui.starsAwarded.innerHTML = [1, 2, 3]
      .map((value) => `<span class="${value <= earned ? "" : "off"}">★</span>`)
      .join("");
    ui.levelScore.textContent = score;
    ui.levelHull.textContent = `${Math.ceil(hull)}%`;
    ui.maxCombo.textContent = `x${maxCombo}`;
    ui.unlockMessage.textContent = currentLevel === LEVELS.length - 1
      ? "Puedes volver a cada nivel para mejorar tu resultado"
      : newlyUnlocked
        ? `Nivel ${currentLevel + 2} desbloqueado`
        : "Puedes repetirlo para mejorar el resultado";
    ui.nextLevel.classList.toggle("hidden", currentLevel === LEVELS.length - 1);
    ui.nextLevel.textContent=currentLevel===0
      ?"CRUZAR HACIA GAIA NOVA →":"SIGUIENTE NIVEL →";
    if(currentLevel===0) {
      if(ui.completeVisual)ui.completeVisual.dataset.scene="rift";
      ui.completeLabel.textContent="VIAJE COMPLETADO · S1-V1";
      ui.completeTitle.textContent="Has escapado de Chronos";
      ui.unlockMessage.textContent="N-7 · NAVEGACIÓN: Baliza exterior de Gaia alcanzada con el registro. Gaia aún cree que atacamos Chronos: tendremos que llevar la prueba hasta Atlas.";
      const nextVoyage=nextCampaignVoyage();
      ui.nextLevel.textContent=nextVoyage&&nextVoyage.voyage!=="S1-V1"?`SIGUIENTE VIAJE: ${nextVoyage.voyage} →`:"VER EL MAPA →";
    }
    overlay(ui.complete);
    tone(760, 0.12, "triangle", 0.08);
    setTimeout(() => tone(980, 0.18, "sine", 0.07), 120);
    vibrate([30, 40, 70]);
    updateMenu();
    if (!progressSaved) toast("No se pudo guardar el progreso en este dispositivo");
    window.AnalyticsManager?.track("level_complete", {
      level: currentLevel + 1, score, hull: Math.ceil(hull), stars: earned, maxCombo
    });
    window.AnalyticsManager?.track("progression", { unlocked: getUnlocked(), totalStars: totalStars() });
  }

  function finishGame(reason = "hull") {
    if (state === "gameover" || state === "complete") return;
    if (typeof resetGameInput === "function") resetGameInput();
    runToken += 1;
    cancelSupplyFailureTimer();
    setState("gameover");
    ui.atlasEncounter?.classList.add("hidden");
    setClassicFlightHudVisible(false);
    supplyFailed = reason === "supply";
    hideWarning();
    ui.hud.classList.add("hidden");
    ui.powerHud.classList.add("hidden");
    ui.fire.classList.add("hidden");
    ui.banner.classList.remove("show");
    const oldBest = bestScore();
    const scoreSaved = saveScore();
    ui.result.textContent = supplyFailed ? "No quedan núcleos suficientes" : "El casco ha cedido";
    ui.supplyStatus.textContent = supplyFailed
      ? `Recuperaste ${collected} de ${level().goal}. El suministro del sector era limitado.`
      : "";
    if (score > oldBest) ui.newBest.classList.remove("hidden");
    ui.final.textContent = score;
    ui.reward.classList.toggle("hidden", continued || supplyFailed);
    // En el viaje se reintenta desde la entrada del tramo guardado, no el sector entero.
    $("retry").textContent = classicFlightView?.stageId ? `REINTENTAR TRAMO ${classicFlightView.stageId}` : "REINTENTAR SECTOR";
    // Sector: el anuncio, si queda en este intento, vuelve a escribir el punto
    // donde estabas.
    if(isSectorRun()) {
      recordSectorDeath();
      if(!sectorRevive)ui.reward.classList.add("hidden");
      const after=loadSectorSave();
      $("retry").textContent=`REINTENTAR SECTOR · TRAMO ${NeonCampaign.continuePoint(after)?.stageNumber||1}`;
      if(after.sectors[classicSideVoyage.ficha.sector]?.beacon)ui.supplyStatus.textContent="Con baliza: vuelves al tramo 6.";
    }
    overlay(ui.over);
    // Tras continuar con un anuncio con recompensa, otra muerte no cuenta de nuevo.
    if(!continued)registerRun();
    tone(110, 0.30, "sawtooth", 0.06);
    updateMenu();
    if (!scoreSaved) toast("No se pudo guardar el récord en este dispositivo");
    window.AnalyticsManager?.track("death", { level: currentLevel + 1, score, elapsed: Math.round(elapsed) });
    window.AnalyticsManager?.track("death_reason", { level: currentLevel + 1, reason });
  }

  function resumeReward() {
    if (continued || state !== "gameover" || supplyFailed || (isSectorRun() && !sectorRevive)) return false;
    runToken += 1;
    cancelSupplyFailureTimer();
    // Restaura por completo el estado visual y lógico tras la destrucción.
    // La pantalla de derrota se abre después de la animación final, por lo que
    // hay que cancelar cualquier resto de ese estado antes de volver a jugar.
    // En el sector se vuelve con el 25 % (diseño 6.2), una vez por intento.
    if (isSectorRun()) { hull = sectorRevive.hull; saveSector(sectorRevive.save); sectorRevive = null; sectorDeathRecorded = false; }
    else hull = Math.max(hull, 35);
    hullGrace = 0; // la continuación no da invulnerabilidad temporizada
    continued = true;
    setState("playing");
    if (atlasBoss) {
      atlasReentryGrace = 1.25;
      ui.atlasEncounter?.classList.remove("hidden");
    }
    last = performance.now();
    playerVisible = true;
    destructionTimer = 0;
    destructionStage = 0;
    shake = 0;
    flash = 0;
    stormPulse = 0;

    // La nave reaparece centrada y estable; conserva daño medio al 35 %,
    // pero no reutiliza inclinaciones ni efectos de la explosión anterior.
    player.x = clamp(player.x, 78, W - 78);
    player.target = player.x;
    player.drift = 0;
    damageSmokeSide = 1;
    damageSmokeLocked = true;
    impactReactionTimer = 0;
    impactReactionSide = 1;
    storyTimer = 0;
    levelOneShockwave = 0;
    hideStoryTransmission();

    // Avisos de meteoritos pendientes: se cancelan al volver (plan F3b).
    classicMeteorWarnings=[];if(classicAimedRain)classicAimedRain.pending.length=0;
    // Elimina amenazas próximas y todos los residuos visuales de destrucción.
    items = items.filter((item) => !isThreat(item) || item.y < H * 0.38);
    gates = [];
    clearTransientEffects();
    tractorTarget = null;
    gateCountdown = level().gate ? 7 : Infinity;

    // Breve protección para evitar morir de nuevo en el mismo instante.
    powers.shield=0;classicHullReserve=Math.max(classicHullReserve,15);
    if(classicWeapons) {classicWeapons.charges=Math.max(classicWeapons.charges,1);classicWeapons.cooldown=0;classicWeapons.projectiles.length=0;}
    ammo = Math.max(ammo, 1);
    manualShotCooldown = 0;

    overlay();
    ui.hud.classList.remove("hidden");
    ui.powerHud.classList.remove("hidden");
    ui.fire.classList.remove("hidden");
    setClassicFlightHudVisible(true);
    hud();
    updatePowerHud();
    refreshClassicFlightBounds();
    showBanner();
    window.AnalyticsManager?.track("continue_used", { level: currentLevel + 1, elapsed: Math.round(elapsed) });
    return true;
  }
  function availablePowers() {
    const available = ["repair"];
    if (currentLevel >= 1) available.push("tractor");
    if (currentLevel >= 2) available.push("slow");
    if (currentLevel >= 3) available.push("double");
    if (currentLevel >= 4) available.push("phaser");
    return available;
  }

  function choosePower() {
    if (repairAllowance > repairSpawned && hull <= 66 && Math.random() < 0.18) {
      repairSpawned++;
      return "repair";
    }
    const available = availablePowers();
    return available[(Math.random() * available.length) | 0];
  }

  function meteorShape() {
    const count = 8 + ((Math.random() * 3) | 0);
    return Array.from({ length: count }, () => 0.72 + Math.random() * 0.34);
  }

  function makeCraters(radius) {
    return Array.from({ length: 2 + ((Math.random() * 3) | 0) }, () => ({
      x: (Math.random() - 0.5) * radius * 0.85,
      y: (Math.random() - 0.5) * radius * 0.7,
      r: radius * (0.10 + Math.random() * 0.14)
    }));
  }

  function chooseThreatType(lv) {
    return lv.threatPool[(Math.random() * lv.threatPool.length) | 0];
  }

  function chooseThreatSprite(type, radius, special) {
    if (type === "scout") return "ch01";
    if (special === "comet") return "comet";
    if (type === "meteor") {
      if (radius < 36) return Math.random() < 0.55 ? "meteorSmall" : "meteorSmallAlt";
      if (radius < 40) return Math.random() < 0.58 ? "meteorMedium" : "meteorMediumAlt";
      return "meteorLarge";
    }
    if (type === "satellite") return "satellite";
    const basic = ["debrisMetal", "debrisPanel"];
    const hot = ["debrisHot0", "debrisHot1"];
    const pool = currentLevel >= 4 ? basic.concat(hot) : basic;
    return pool[(Math.random() * pool.length) | 0];
  }

  function threatHitPoints(type, spriteKey, special) {
    if (type === "scout") return 2;
    if (special === "comet") return 2;
    if (type === "satellite") return 3;
    if (type === "scout") {
      radius = 32;
      speed = 172 * lv.speed;
      damage = 26;
    } else if (type === "debris") {
      if (spriteKey === "debrisPanel") return 1;
      if (spriteKey && spriteKey.includes("Hot")) return 3;
      return 2;
    }
    if (spriteKey === "meteorLarge") return 3;
    if (spriteKey && spriteKey.includes("Medium")) return 2;
    return 1;
  }

  // Wreckage is salvageable machinery, unlike CRONIUM, rock or an incoming
  // projectile. Stamp its receipt when it enters the world, not when a shot
  // happens to hit it: damage order and repeated death animation callbacks
  // must never turn one physical fragment into several paid rewards.
  function stampClassicWreckageSalvage(item) {
    if (!["debris", "satellite"].includes(item.type) ||
        !classicSalvageRunId || !classicSalvageState || item.salvageDropId) return item;
    const stage = classicFlightView?.stageId || `${currentLevel + 1}.0`;
    const ordinal = classicSalvageEnemySequence++;
    item.salvageRole = item.type;
    item.salvageRunId = classicSalvageRunId;
    item.salvageDropId = `${stage}:wreck:${item.type}:${ordinal}`;
    item.id = `wreck:${classicSalvageRunId}:${item.salvageDropId}`;
    return item;
  }

  function createThreat(type, lv) {
    const x = 55 + Math.random() * (W - 110);
    let radius = 36;
    let speed = (245 + Math.random() * 110) * lv.speed;
    let damage = 34;
    let special = "";

    if (type === "debris") {
      radius = 27 + Math.random() * 8;
      speed *= 1.08;
      damage = 24;
    } else if (type === "satellite") {
      radius = 39 + Math.random() * 7;
      speed *= 0.92;
      damage = 31;
    } else {
      radius = 33 + Math.random() * 9;
    }

    if (lv.hazard === "dart" && type === "meteor" && Math.random() < 0.34) {
      speed *= 1.72;
      special = "comet";
      damage = 42;
    }
    if (lv.hazard === "overdrive") speed *= 1.10;
    if (lv.hazard === "final" && type === "meteor" && Math.random() < 0.35) {
      speed *= 1.45;
      special = "comet";
      damage = 42;
    }

    const spriteKey = chooseThreatSprite(type, radius, special);
    const hitPoints = threatHitPoints(type, spriteKey, special);

    return stampClassicWreckageSalvage({
      type,
      x,
      baseX: x,
      y: -85,
      r: radius,
      s: speed,
      damage,
      rot: special === "comet" ? 0 : Math.random() * Math.PI * 2,
      rs: special === "comet" ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * (type === "debris" ? 6 : 3.6),
      p: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      amp: 35 + Math.random() * 55,
      special,
      alpha: 1,
      spriteKey,
      hp: hitPoints,
      maxHp: hitPoints,
      shape: type === "meteor" ? meteorShape() : null,
      craters: type === "meteor" ? makeCraters(radius) : null,
      variant: type === "debris" ? (Math.random() < 0.5 ? "panel" : "strut") : "",
      classicScout: type === "scout" ? NeonCampaign.createClassicScout({x, phase: Math.random() * Math.PI * 2, width: W}) : null
    });
  }

  // Peligros de Vulkar (sector 2, encargo enc-nucleo). Para el resto del juego
  // son meteoritos (choque, disparos, daño); solo cambian aspecto y aguante.
  // Núcleo de lava: avanza despacio y aguanta 4 impactos. Mina de plasma:
  // cae como un meteorito, se rompe de 1 impacto y estalla al romperse; el
  // estallido es solo visual (sin daño en área), así no necesita aviso previo.
  // Radios del dibujo: el círculo de choque (r·1,04) cubre la roca o el cuerpo
  // de la mina; las puntas de la mina quedan fuera, a favor del jugador.
  function createVulkarHazard(kind, lv) {
    const threat = createThreat("meteor", lv), core = kind === "lavaCore", hp = core ? 4 : 1;
    return Object.assign(threat, { vulkarHazard: kind, spriteKey: kind, special: "", damage: 34,
      r: core ? 40 : 30, hp, maxHp: hp, rs: core ? (Math.random() - 0.5) * 0.8 : 0,
      speedScale: core ? 0.65 : 1, shape: null, craters: null });
  }

  function addItem() {
    const lv = level();
    const roll = Math.random();
    const canEnergy = energySpawned < energyBudget;
    const canPower = powerSpawned < powerBudget;
    let type;

    if (roll < lv.meteor) {
      type = chooseThreatType(lv);
    } else if (canPower && roll < lv.meteor + lv.power) {
      type = choosePower();
      powerSpawned++;
    } else if (canEnergy) {
      type = "energy";
      energySpawned++;
    } else {
      type = chooseThreatType(lv);
    }

    if (["meteor", "debris", "satellite", "scout"].includes(type)) {
      const threat = createThreat(type, lv);
      // Una formación activa reserva su abertura desde la parte superior de la
      // pantalla hasta la nave. Las amenazas que nacen dentro no llegan a
      // insertarse y, por tanto, nunca pueden taponar la única ruta válida.
      if (!threatOverlapsProtectedCorridor(threat)) items.push(threat);
      return;
    }

    const isPower = type !== "energy";
    // Los núcleos se reducen un 15 % para que la nave conserve protagonismo visual.
    const radius = isPower ? 30 : 22;
    const x = 55 + Math.random() * (W - 110);
    items.push({
      type,
      x,
      baseX: x,
      y: -70,
      r: radius,
      s: (245 + Math.random() * 110) * lv.speed,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 3.6,
      p: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      amp: 35 + Math.random() * 55,
      special: "",
      alpha: 1
    });
  }

  function pointInsidePolygon(x, y, polygon) {
    let inside = false;
    for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
      const [xCurrent, yCurrent] = polygon[current];
      const [xPrevious, yPrevious] = polygon[previous];
      const crosses = (yCurrent > y) !== (yPrevious > y) &&
        x < (xPrevious - xCurrent) * (y - yCurrent) / ((yPrevious - yCurrent) || 0.000001) + xCurrent;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  function squaredDistanceToSegment(px, py, ax, ay, bx, by) {
    const segmentX = bx - ax;
    const segmentY = by - ay;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) {
      const dx = px - ax;
      const dy = py - ay;
      return dx * dx + dy * dy;
    }
    const projection = clamp(((px - ax) * segmentX + (py - ay) * segmentY) / lengthSquared, 0, 1);
    const closestX = ax + projection * segmentX;
    const closestY = ay + projection * segmentY;
    const dx = px - closestX;
    const dy = py - closestY;
    return dx * dx + dy * dy;
  }

  // Círculos de colisión reutilizables por forma. collisionCircles se llama
  // por objeto y fotograma; rellenar estos arrays en sitio evita crear
  // basura. Quien llama debe usar el resultado al momento y no guardarlo
  // (copiarlo si necesita conservarlo).
  const SINGLE_COLLISION_CIRCLE = [{ x: 0, y: 0, r: 0 }];
  const SATELLITE_COLLISION_CIRCLES = [{ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }];
  const PANEL_COLLISION_CIRCLES = [{ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }];

  function singleCollisionCircle(radius) {
    const circle = SINGLE_COLLISION_CIRCLE[0];
    circle.x = 0;
    circle.y = 0;
    circle.r = radius;
    return SINGLE_COLLISION_CIRCLE;
  }

  function tripleCollisionCircles(circles, item, offset, sideRadius, centerRadius) {
    circles[0].x = -item.r * offset; circles[0].y = 0; circles[0].r = item.r * sideRadius;
    circles[1].x = 0; circles[1].y = 0; circles[1].r = item.r * centerRadius;
    circles[2].x = item.r * offset; circles[2].y = 0; circles[2].r = item.r * sideRadius;
    return circles;
  }

  function collisionCircles(item) {
    if (item.type === "energy") return singleCollisionCircle(item.r * 1.10);
    if (!isThreat(item)) {
      const factor = item.type === "repair" ? 1.05 : (item.type === "tractor" || item.type === "phaser") ? 0.92 : 1.0;
      return singleCollisionCircle(item.r * factor);
    }
    if (item.classicScout || item.classicScoutProjectile) return singleCollisionCircle(item.r * 0.94);
    if (item.special === "comet") return singleCollisionCircle(item.r * 0.94);
    if (item.type === "satellite") return tripleCollisionCircles(SATELLITE_COLLISION_CIRCLES, item, 0.92, 0.58, 0.70);
    if (item.type === "debris" && item.spriteKey === "debrisPanel") {
      return tripleCollisionCircles(PANEL_COLLISION_CIRCLES, item, 0.68, 0.62, 0.66);
    }
    if (item.type === "debris") return singleCollisionCircle(item.r * 1.08);
    if (item.spriteKey === "meteorLarge") return singleCollisionCircle(item.r * 1.22);
    if (item.spriteKey && item.spriteKey.includes("Medium")) return singleCollisionCircle(item.r * 1.12);
    return singleCollisionCircle(item.r * 1.04);
  }

  // Rectángulo envolvente de la silueta de colisión para descartar rápido los
  // objetos lejanos. Se calcula una sola vez, en el primer uso, cuando la
  // silueta ya está escalada. Solo es un filtro previo: la prueba exacta
  // sigue siendo el polígono.
  let shipCollisionBounds = null;
  function getShipCollisionBounds() {
    if (!shipCollisionBounds) {
      shipCollisionBounds = SHIP_COLLISION_OUTLINE.reduce((bounds, [x, y]) => {
        bounds.left = Math.min(bounds.left, x);
        bounds.right = Math.max(bounds.right, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.bottom = Math.max(bounds.bottom, y);
        return bounds;
      }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
    }
    return shipCollisionBounds;
  }

  function circleHitsShip(localX, localY, radius) {
    const bounds = getShipCollisionBounds();
    if (localX + radius < bounds.left || localX - radius > bounds.right ||
        localY + radius < bounds.top || localY - radius > bounds.bottom) return false;
    if (pointInsidePolygon(localX, localY, SHIP_COLLISION_OUTLINE)) return true;
    const radiusSquared = radius * radius;
    for (let index = 0; index < SHIP_COLLISION_OUTLINE.length; index++) {
      const [ax, ay] = SHIP_COLLISION_OUTLINE[index];
      const [bx, by] = SHIP_COLLISION_OUTLINE[(index + 1) % SHIP_COLLISION_OUTLINE.length];
      if (squaredDistanceToSegment(localX, localY, ax, ay, bx, by) <= radiusSquared) return true;
    }
    return false;
  }

  function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
    const cross = (px, py, qx, qy, rx, ry) => (qx-px)*(ry-py)-(qy-py)*(rx-px);
    const a=cross(ax,ay,bx,by,cx,cy),b=cross(ax,ay,bx,by,dx,dy);
    const c=cross(cx,cy,dx,dy,ax,ay),d=cross(cx,cy,dx,dy,bx,by);
    if(a*b>0 || c*d>0)return false;
    return Math.max(Math.min(ax,bx),Math.min(cx,dx))<=Math.min(Math.max(ax,bx),Math.max(cx,dx))+1e-8 &&
      Math.max(Math.min(ay,by),Math.min(cy,dy))<=Math.min(Math.max(ay,by),Math.max(cy,dy))+1e-8;
  }

  function sweptCircleHitsShip(startX, startY, endX, endY, radius) {
    // Sweep the authored collision polygon itself. Fast nuclei and enemy
    // projectiles must not jump across it, and cosmetic tails never damage it.
    const bounds=getShipCollisionBounds();
    if(Math.max(startX,endX)+radius<bounds.left || Math.min(startX,endX)-radius>bounds.right ||
      Math.max(startY,endY)+radius<bounds.top || Math.min(startY,endY)-radius>bounds.bottom)return false;
    if(circleHitsShip(startX,startY,radius)||circleHitsShip(endX,endY,radius))return true;
    const radiusSquared=radius*radius;
    for(let index=0;index<SHIP_COLLISION_OUTLINE.length;index++) {
      const [ax,ay]=SHIP_COLLISION_OUTLINE[index];
      const [bx,by]=SHIP_COLLISION_OUTLINE[(index+1)%SHIP_COLLISION_OUTLINE.length];
      if(segmentsCross(startX,startY,endX,endY,ax,ay,bx,by) ||
        squaredDistanceToSegment(ax,ay,startX,startY,endX,endY)<=radiusSquared ||
        squaredDistanceToSegment(bx,by,startX,startY,endX,endY)<=radiusSquared)return true;
    }
    return false;
  }

  function releaseClassicShowerComet(item) {
    if(item?.showerComet && typeof classicCometShower!=="undefined" && classicCometShower)
      NeonCampaign.releaseCometShowerItem(classicCometShower,item);
  }

  function hit(item) {
    const cos = Math.cos(item.rot || 0);
    const sin = Math.sin(item.rot || 0);
    for (const circle of collisionCircles(item)) {
      const offsetX = circle.x * cos - circle.y * sin;
      const offsetY = circle.x * sin + circle.y * cos;
      const localX = item.x + offsetX - player.x;
      const localY = item.y + offsetY - player.y;
      if((item.showerComet || item.guardianProjectile || item.classicScoutProjectile || item.salvagePickup) &&
        Number.isFinite(item.previousX) && Number.isFinite(item.previousY)) {
        const previousPlayerX=Number.isFinite(player.previousCollisionX)?player.previousCollisionX:player.x;
        const previousPlayerY=Number.isFinite(player.previousCollisionY)?player.previousCollisionY:player.y;
        if(sweptCircleHitsShip(item.previousX+offsetX-previousPlayerX,
          item.previousY+offsetY-previousPlayerY,localX,localY,circle.r))return true;
      }
      if (circleHitsShip(localX, localY, circle.r)) return true;
    }
    return false;
  }

  function addParticle(seed) {
    if (parts.length >= EFFECT_LIMITS.particles) return false;
    parts.push(particlePool.acquire(seed));
    return true;
  }

  function clearTransientEffects() {
    for (const part of parts) particlePool.release(part);
    parts.length = 0;
    shots.length = 0;
    rings.length = 0;
    explosions.length = 0;
    impactEffects.length = 0;
  }

  function cancelSupplyFailureTimer() {
    if (supplyFailureTimer) clearTimeout(supplyFailureTimer);
    supplyFailureTimer = 0;
    supplyFailureScheduled = false;
  }

  function burst(x, y, count, kind) {
    const factor = settings.effectsQuality === "high" ? 1 : settings.effectsQuality === "normal" ? 0.72 : 0.42;
    const amount = Math.ceil(count * factor);
    for (let index = 0; index < amount; index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 65 + Math.random() * 245;
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.45 + Math.random() * 0.55,
        size: 3 + Math.random() * 8,
        kind
      });
    }
  }

  function directionalBurst(x, y, targetX, targetY, count, kind = "cyan") {
    const factor = settings.effectsQuality === "high" ? 1 : settings.effectsQuality === "normal" ? 0.76 : 0.46;
    const amount = Math.ceil(count * factor);
    const baseAngle = Math.atan2(targetY - y, targetX - x);
    for (let index = 0; index < amount; index++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.62;
      const speed = 150 + Math.random() * 280;
      addParticle({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.34 + Math.random() * 0.34,
        size: 2 + Math.random() * 5,
        kind
      });
    }
  }

  function engineTrail() {
    if (!settings.effects || state !== "playing" || Math.random() > 0.48) return;
    const hardTurn = Math.abs(player.target + player.drift - player.x) > 65;
    const trailScale=SHIP_VISUAL.scale;
    const x = player.x + (hardTurn ? (player.target > player.x ? -1 : 1) * 28 : (Math.random() - 0.5) * 30) * trailScale;
    const y = player.y + 61 * trailScale;
    addParticle({
      x, y, vx: (Math.random() - 0.5) * 28, vy: 125 + Math.random() * 120,
      life: 0.22 + Math.random() * 0.24, size: 2 + Math.random() * 4, kind: "cyan"
    });
  }

  function pulseRing(x, y, color, max = 85, duration = 0.48, style = "single") {
    if (rings.length >= EFFECT_LIMITS.rings) rings.shift();
    rings.push({ x, y, color, max, duration, life: duration, style });
  }

  function addExplosion(x, y, scale = 1, duration = 0.52) {
    if (explosions.length >= EFFECT_LIMITS.explosions) explosions.shift();
    explosions.push({ x, y, scale, life: duration, duration, rotation: Math.random() * Math.PI * 2 });
  }

  function addImpactEffect(x, y, scale = 1, angle = 0) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale, angle, life: 0.24, duration: 0.24, variant: (Math.random() * SPRITE_GROUPS.impact.length) | 0 });
  }

  function addHullSparks(x, y, angle) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale: 1, angle, life: 0.5, duration: 0.5, hullSparks: true });
  }

  // Estallido de la mina de plasma (último fotograma de su hoja): crece y se
  // apaga en 0,45 s. Solo presentación.
  function addPlasmaBlast(x, y) {
    if (!spriteReady(SPRITES.lavaCoreMine)) return;
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x, y, scale: 1, angle: Math.random() * Math.PI * 2, life: 0.45, duration: 0.45, plasmaBlast: true });
  }

  // Explosión de Atlas vencido (baúl, encargo a04): 8 fotogramas en 0,8 s
  // centrados en su núcleo, con una sacudida corta. Solo presentación.
  function addAtlasExplosion(boss) {
    if (impactEffects.length >= EFFECT_LIMITS.impacts) impactEffects.shift();
    impactEffects.push({ x: boss.x, y: boss.y, scale: 1, angle: 0, life: 0.8, duration: 0.8,
      atlasExplosion: true, size: (boss.visualSize || 350) * 1.5 });
    shake = Math.max(shake, 14);
  }

  function addMissileImpact(x,y) {
    if(!settings.effects)return;
    if(impactEffects.length>=EFFECT_LIMITS.impacts)impactEffects.shift();
    impactEffects.push({x,y,scale:1,angle:0,life:.65,duration:.65,missileImpact:true});
  }

  function activatePower(type, item) {
    const durations = { shield: 7, tractor: 8, slow: 6, double: 7, phaser: 7 };
    if (type === "repair") {
      const restored = Math.min(34, 100 - hull);
      hull += restored;
      burst(item.x, item.y, 24, "green");
      pulseRing(item.x, item.y, "#78ff9c", 105, 0.62);
      toast(`Drone de reparación: +${Math.round(restored)}%`);
      tone(690, 0.18, "sine", 0.08);
      vibrate(30);
      hud();
      window.AnalyticsManager?.track("ability_used", { level: currentLevel + 1, ability: "repair" });
      return;
    }

    if(type==="shield") {
      powers.shield=0;classicHullReserve=classicHullReserveCapacity;
      classicShieldAge=0;classicShieldImpact=0;ensureSprite(SPRITES.forceShieldAtlas);
      hud();
    } else powers[type] = Math.max(powers[type], durations[type]);
    const effectKind = type === "double" ? "gold" : type === "phaser" ? "green" : type === "shield" ? "cyan" : "violet";
    const effectColor = type === "double" ? "#ffe66c" : type === "phaser" ? "#78ff9c" : type === "shield" ? "#62efff" : "#c58aff";
    burst(item.x, item.y, 20, effectKind);
    pulseRing(item.x, item.y, effectColor, 105, 0.58);
    const names = {
      shield: "Reserva de casco restaurada",
      tractor: "Rayo tractor conectado",
      slow: "Estabilizador activo",
      double: "Sobrecarga de núcleos",
      phaser: "Phaser automático activo"
    };
    toast(names[type]);
    tone(type === "phaser" ? 920 : 780, 0.15, "triangle", 0.075);
    vibrate(22);
    updatePowerHud();
    window.AnalyticsManager?.track("ability_used", { level: currentLevel + 1, ability: type });
  }

  function damageShip(amount, x = player.x, y = player.y, context = {}) {
    if (state === "destroying" || state === "gameover") return;
    // Auditoría J06/J07: sin daño durante la gracia (tras un golpe o al reanudar).
    if (typeof hullGrace !== "undefined" && hullGrace > 0) return;
    // Daño recibido según el modo de dificultad (Normal = 1).
    const difficultyDamage = typeof NeonCampaign !== "undefined" && typeof settings !== "undefined"
      ? NeonCampaign.DIFFICULTY_MODES?.[settings.difficulty]?.damage ?? 1 : 1;
    amount *= difficultyDamage;
    const impactAngle = Math.atan2(y - player.y, x - player.x);
    const damageResult = NeonCampaign.resolveHullReinforcement({hull,amount,
      reserve:classicHullReserve,capacity:classicHullReserveCapacity,
      kind:context.kind||"collision",largeAsteroid:context.largeAsteroid===true,
      largeAsteroidScale:context.largeAsteroidScale||1});
    classicHullReserve=damageResult.reserve;
    if (typeof hullGrace !== "undefined") hullGrace = 0.3;
    if (damageResult.absorbed) {
      classicShieldImpact=.18;
      // Revisión G2: el golpe absorbido no se parece a recoger CRONIUM (cian):
      // chispas y aro ámbar, sacudida corta y, la primera vez, N-7 lo explica.
      burst(x, y, 18, "gold");
      pulseRing(x, y, "#edc68a", 90, 0.42);
      if (!settings.reduceEffects) shake = Math.max(shake, 6);
      addImpactEffect(x, y, 0.85, impactAngle);
      combatSound("hull-hit",x);
      // Sin pisar una línea que ya esté en pantalla; si el canal está ocupado, se dice más tarde (R7).
      if (typeof showStoryTransmission === "function" && typeof reserveHitExplained !== "undefined" && !reserveHitExplained &&
          (typeof flightTransmission === "undefined" || !flightTransmission)) {
        reserveHitExplained = true;
        showStoryTransmission("N-7", "Tu refuerzo de casco absorbió el impacto.", 3);
      }
      hud();
      return;
    }

    hull = damageResult.hull;
    if (typeof DEV !== "undefined" && DEV?.invulnerable) hull = 100;
    impactReactionTimer = 0.32;
    impactReactionSide = x >= player.x ? 1 : -1;
    if (!damageSmokeLocked && hull < 67) {
      damageSmokeSide = x >= player.x ? 1 : -1;
      damageSmokeLocked = true;
    }
    combo = 1;
    comboTimer = 0;
    shake = 16;
    flash = 0.26;
    // Golpe al casco: chispas pintadas (baúl, encargo a05) hacia el lado del
    // impacto. El aro rosa con puntos antiguo queda solo si la hoja no cargó.
    // Sin efectos (ajustes) se queda el golpe antiguo, que ya respeta la calidad.
    if (typeof spriteReady === "function" && settings.effects !== false && spriteReady(SPRITES.hullSparks)) addHullSparks(x, y, impactAngle);
    else { burst(x, y, 28, "red"); pulseRing(x, y, "#ff496f", 110, 0.48); }
    addImpactEffect(x, y, 1.05, impactAngle);
    combatSound("hull-hit",x);
    vibrate([45, 35, 60]);
    hud();

    if (damageResult.destroyed) {
      // Estado intermedio: detiene la partida, centra visualmente la nave y deja
      // terminar la destrucción antes de abrir la pantalla de derrota.
      setState("destroying");
      recordSectorDeath();
      destructionTimer = 1.18;
      destructionStage = 0;
      playerVisible = true;
      player.target = player.x;
      player.drift = 0;
      tractorTarget = null;
      for (const key in powers) powers[key] = 0;
      ui.powerHud.classList.add("hidden");
      hideWarning();
      for(const item of items)releaseClassicShowerComet(item);
      items = [];
      gates = [];
      shots.length = 0;
      addExplosion(player.x, player.y + SHIP_VISUAL.centerYOffset, 1.65, 0.92);
      addImpactEffect(player.x - 34 * SHIP_VISUAL.scale, player.y - 8 * SHIP_VISUAL.scale, 1.15, -0.5);
      addImpactEffect(player.x + 36 * SHIP_VISUAL.scale, player.y + 4 * SHIP_VISUAL.scale, 1.15, 0.5);
      burst(player.x, player.y - 20 * SHIP_VISUAL.scale, 42, "red");
      tone(70, 0.48, "sawtooth", 0.095);
      vibrate([70, 35, 90, 40, 120]);
    }
  }

  function collectItem(item) {
    if(item.type==="salvage")return collectClassicScrap(item);
    if(item.type==="flightModule") {
      if(!classicEquipment.recoveredTwin) {
        if(!persistClassicEquipment({...classicEquipment,recoveredTwin:true}))return false;
        toast("Emisor gemelo recuperado · C9 disponible en el panel");tone(900,.18,"triangle",.06);
        pulseRing(item.x,item.y,"#ffc874",90,.45);
        if(classicChapterStory)signalClassicChapter("module-recovered");
        else showStoryTransmission("MIRA · C9","Pieza asegurada. La montamos antes de entrar en la red Atlas.",4.5);
      }
    } else if (item.type === "energy") {
      const multiplier = powers.double > 0 ? 2 : 1;
      score += 10 * combo * multiplier;
      collected++;
      combo = Math.min(12, combo + 1);
      maxCombo = Math.max(maxCombo, combo);
      comboTimer = 2.35;
      directionalBurst(item.x, item.y, player.x, player.y - 18, 20, "cyan");
      burst(item.x, item.y, 9, "cyan");
      pulseRing(item.x, item.y, "#55f6ff", 76, 0.38, "capture");
      stormPulse = Math.max(stormPulse, 0.08);
      tone(500 + combo * 28, 0.06, "triangle", 0.055);
      if (collected >= level().goal) completeLevel();
    } else if (isThreat(item)) {
      // Guardian weapons have authored tier damage (13/15/22). Only patrol
      // Phasers use the normal/heavy10/15 table; never flatten a boss superattack.
      const enemyPhaser=item.classicScoutProjectile&&!item.guardianProjectile;
      if(item.vulkarHazard==="plasmaMine")addPlasmaBlast(item.x,item.y);
      damageShip(item.damage,item.x,item.y,{kind:enemyPhaser?(item.damage>=15?"heavyPhaser":"phaser"):"collision",
        largeAsteroid:item.type==="meteor"&&item.special!=="comet"&&item.spriteKey==="meteorLarge",
        largeAsteroidScale:item.hazardDamageScale||1});
    } else {
      activatePower(item.type, item);
    }
    hud();
  }

  function updateEffects(dt) {
    for (let index = parts.length - 1; index >= 0; index--) {
      const part = parts[index];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vx *= Math.pow(0.04, dt);
      part.vy = part.vy * Math.pow(0.12, dt) + 160 * dt;
      if (part.life <= 0) {
        parts.splice(index, 1);
        particlePool.release(part);
      }
    }
    for (let index = shots.length - 1; index >= 0; index--) {
      const shot = shots[index];
      // Illustrated Atlas pulses arrive before applying damage. Pause freezes
      // both their flight and the boss, rather than damaging an inert target.
      if (shot.atlasPulse) {
        if (state !== "playing") continue;
        shot.life -= dt;
        if (shot.life <= 0) { resolveAtlasPulse(shot); shots.splice(index, 1); }
        continue;
      }
      shot.life -= dt;
      if (shot.life <= 0) {
        if (shot.hit) {
          burst(shot.impactX, shot.impactY, shot.destroyed ? 18 : 8, "green");
          pulseRing(shot.impactX, shot.impactY, "#78ff9c", shot.destroyed ? 70 : 42, 0.28);
          if (shot.destroyed) addExplosion(shot.impactX, shot.impactY, shot.impactScale || 1);
          addImpactEffect(shot.impactX, shot.impactY, shot.destroyed ? 0.8 : 0.55);
        }
        shots.splice(index, 1);
      }
    }
    for (let index = rings.length - 1; index >= 0; index--) {
      rings[index].life -= dt;
      if (rings[index].life <= 0) rings.splice(index, 1);
    }
    for (let index = explosions.length - 1; index >= 0; index--) {
      explosions[index].ch01Animator?.update(dt);
      explosions[index].life -= dt;
      if (explosions[index].life <= 0) explosions.splice(index, 1);
    }
    for (let index = impactEffects.length - 1; index >= 0; index--) {
      // La explosión de Atlas va al mismo reloj que Atlas (mitad con Estabilizador),
      // para que el completado siga llegando justo después de ella.
      impactEffects[index].life -= impactEffects[index].atlasExplosion && powers.slow > 0 ? dt * .5 : dt;
      if (impactEffects[index].life <= 0) impactEffects.splice(index, 1);
    }
  }

  function selectTractorTarget() {
    const candidates = items
      .filter((item) => !isThreat(item) && item.y < player.y && Math.hypot(item.x - player.x, item.y - player.y) < 360)
      .sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
    tractorTarget = candidates[0] || null;
  }

  function animateScoutHit(target, destroyed) {
    if(destroyed&&target.vulkarHazard==="plasmaMine")addPlasmaBlast(target.x,target.y);
    if(destroyed) {
      spawnClassicScrap(target);
      releaseClassicShowerComet(target);
    }
    const animator = target.classicScout?.animator;
    if (!animator) return;
    animator.request(destroyed ? "destroy" : "hurt");
    if (destroyed) {
      if (explosions.length >= EFFECT_LIMITS.explosions) explosions.shift();
      const duration=animator.getFrame().image==="assets/ch02_interceptor_atlas_v1.webp"?.56:.49;
      explosions.push({x: target.x, y: target.y, ch01Animator: animator,
        life: duration, duration, scale: 1, rotation: 0});
    }
  }

  function firePhaser() {
    phaserCooldown = 0.34;
    cameraKickY = Math.max(cameraKickY, 3.5);
    shake = Math.max(shake, 2.2);
    if (fireAtlasPulse("phaser")) return;
    const candidates = items
      .filter(isThreat)
      .filter((item) => item.y < player.y && Math.abs(item.x - player.x) < 95)
      .sort((a, b) => b.y - a.y);
    const target = candidates[0];

    if (target) {
      target.hp = Math.max(0, (target.hp || 1) - 1);
      const destroyed = target.hp <= 0;
      animateScoutHit(target, destroyed);
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({
        x1: player.x, y1: player.y - SHIP_VISUAL.phaserMuzzleOffset, x2: target.x, y2: target.y,
        life: 0.20, duration: 0.20, hit: true, destroyed, impactX: target.x, impactY: target.y,
        impactScale: target.type === "satellite" ? 1.25 : target.r > 39 ? 1.15 : 0.85,
        kind: "phaser"
      });
      score += destroyed ? (target.type === "satellite" ? 12 : 8) : 2;
      if (destroyed) {
        const targetIndex = items.indexOf(target);
        if (targetIndex >= 0) items.splice(targetIndex, 1);
      }
      tone(destroyed ? 980 : 760, 0.07, "sawtooth", 0.045);
    } else {
      if (shots.length >= EFFECT_LIMITS.shots) shots.shift();
      shots.push({ x1: player.x, y1: player.y - SHIP_VISUAL.phaserMuzzleOffset, x2: player.x, y2: 90, life: 0.18, duration: 0.18, hit: false, kind: "phaser" });
    }
  }

  function fireManualShot() {
    if(state!=="playing" || manualShotCooldown>0 || warpTimer>0)return false;
    if(atlasBoss){const fired=fireAtlasPulse("pulse");updateAmmoHud();return fired;}
    return fireClassicWeapon();
  }

  function checkSupplyFailure() {
    // The staged voyage reissues missed signals locally; the old finite supply
    // failure remains unchanged in the other nine territories and N-7.
    if(classicFlightView?.stageNumber)return;
    if (supplyFailureScheduled || energySpawned < energyBudget || collected >= level().goal) return;
    const energyRemaining = items.some((item) => item.type === "energy");
    if (!energyRemaining) {
      supplyFailureScheduled = true;
      const scheduledRun = runToken;
      supplyFailureTimer = setTimeout(() => {
        supplyFailureTimer = 0;
        supplyFailureScheduled = false;
        if (scheduledRun === runToken && state === "playing" && collected < level().goal && !items.some((item) => item.type === "energy")) {
          finishGame("supply");
        }
      }, 420);
    }
  }
  function createFormationSide(start, end, side) {
    const pieces = [];
    let edge = side < 0 ? end : start;
    let guard = 0;

    while ((side < 0 ? edge > start : edge < end) && guard < 24) {
      const size = 46 + Math.random() * 18;
      const step = size * (0.68 + Math.random() * 0.10);
      // Usa el radio de la caja rotada, no solo media anchura: incluso una
      // pieza a 45° queda fuera del pasillo visual.
      const halfExtent = size * Math.SQRT1_2;
      const x = side < 0 ? edge - halfExtent : edge + halfExtent;
      pieces.push({
        x,
        y: (Math.random() - 0.5) * 18,
        size,
        halfExtent,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.42,
        spriteKey: FORMATION_SPRITE_KEYS[(Math.random() * FORMATION_SPRITE_KEYS.length) | 0],
        side
      });
      edge += side * step;
      guard++;
    }
    return pieces;
  }

  function createDebrisFormation(gapXOverride) {
    const gapW = clamp(282 - currentLevel * 4, 246, 282);
    const margin = gapW / 2 + 32;
    const randomGapX = margin + Math.random() * (W - margin * 2);
    const gapX = Number.isFinite(gapXOverride) ? clamp(gapXOverride, margin, W - margin) : randomGapX;
    const gapLeft = gapX - gapW / 2;
    const gapRight = gapX + gapW / 2;
    return {
      kind: "debris-formation",
      y: -62,
      h: 50,
      s: (210 + currentLevel * 10) * level().speed,
      gapX,
      gapW,
      checked: false,
      phase: Math.random() * Math.PI * 2,
      pieces: [
        ...createFormationSide(-12, gapLeft, -1),
        ...createFormationSide(gapRight, W + 12, 1)
      ]
    };
  }

  function gateProtectsPassage(gate) {
    return Boolean(gate && gate.y + gate.h / 2 >= CORRIDOR_TOP &&
      gate.y - gate.h / 2 <= player.y + player.h * 0.80);
  }

  function gateCorridorBounds(gate) {
    return {
      left: gate.gapX - gate.gapW / 2,
      right: gate.gapX + gate.gapW / 2,
      top: CORRIDOR_TOP,
      bottom: player.y + CORRIDOR_BOTTOM_PADDING
    };
  }

  function threatBounds(item) {
    const cos = Math.cos(item.rot || 0);
    const sin = Math.sin(item.rot || 0);
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const circle of collisionCircles(item)) {
      const x = item.x + circle.x * cos - circle.y * sin;
      const y = item.y + circle.x * sin + circle.y * cos;
      left = Math.min(left, x - circle.r);
      right = Math.max(right, x + circle.r);
      top = Math.min(top, y - circle.r);
      bottom = Math.max(bottom, y + circle.r);
    }
    return { left, right, top, bottom };
  }

  function threatOverlapsGateCorridor(item, gate) {
    if (!isThreat(item) || !gateProtectsPassage(gate)) return false;
    const threat = threatBounds(item);
    const corridor = gateCorridorBounds(gate);
    return threat.right > corridor.left && threat.left < corridor.right &&
      threat.bottom > corridor.top && threat.top < corridor.bottom;
  }

  function threatOverlapsProtectedCorridor(item) {
    return gates.some((gate) => threatOverlapsGateCorridor(item, gate));
  }

  function clearProtectedCorridors(onlyGate = null) {
    const protectedGates = onlyGate ? [onlyGate] : gates;
    let removed = 0;
    items = items.filter((item) => {
      if (!isThreat(item) || !protectedGates.some((gate) => threatOverlapsGateCorridor(item, gate))) return true;
      removed++;
      releaseClassicShowerComet(item);
      if (item === tractorTarget) tractorTarget = null;
      return false;
    });
    return removed;
  }

  function spawnGate() {
    const formation = createDebrisFormation();
    gates.push(formation);
    clearProtectedCorridors(formation);
    tone(180, 0.12, "square", 0.045);
  }

  function updateGateSystem(dt, scale) {
    const interval = level().gate;
    if (!interval) {
      hideWarning();
      return;
    }

    gateCountdown -= dt;
    if (gateCountdown <= 2.4 && gateCountdown > 0) {
      ui.warningText.textContent = `Pasillo seguro en ${gateCountdown.toFixed(1)} s`;
      ui.hazardWarning.classList.add("show");
    } else if (gateCountdown > 2.4) {
      hideWarning();
    }

    if (gateCountdown <= 0) {
      spawnGate();
      hideWarning();
      gateCountdown = interval * (0.88 + Math.random() * 0.24);
    }

    for (let index = gates.length - 1; index >= 0; index--) {
      const gate = gates[index];
      gate.y += gate.s * dt * scale;
      const crossing = gate.y + gate.h / 2 >= player.y - player.h * 0.34 &&
        gate.y - gate.h / 2 <= player.y + player.h * 0.34;

      if (crossing && !gate.checked) {
        gate.checked = true;
        const gapLeft = gate.gapX - gate.gapW / 2;
        const gapRight = gate.gapX + gate.gapW / 2;
        const safe = player.x - SHIP_COLLISION_HALF_WIDTH > gapLeft && player.x + SHIP_COLLISION_HALF_WIDTH < gapRight;
        if (safe) {
          score += 25;
          pulseRing(player.x, player.y, level().accent, 120, 0.48);
          tone(760, 0.08, "triangle", 0.055);
          toast("Paso orbital limpio: +25");
        } else {
          damageShip(38, player.x, player.y - 15);
        }
        hud();
      }

      if (gate.y - gate.h / 2 > H + 30) gates.splice(index, 1);
    }
  }

  function advanceClassicSalvagePickup(item, dt) {
    // A destroyed machine leaves a physical pickup. Only collectItem/ledger can
    // credit it after contact; a magnetic approach is presentation, not credit.
    item.previousX=item.x;item.previousY=item.y;
    item.life=(Number.isFinite(item.life)?item.life:14)-dt;
    item.rot=Number.isFinite(item.rot)?item.rot:0;
    item.rs=Number.isFinite(item.rs)?item.rs:0;
    item.p=Number.isFinite(item.p)?item.p:0;
    const dx=player.x-item.x,dy=player.y-item.y,distance=Math.hypot(dx,dy);
    if(item.bossSalvage || distance<=150) {
      const speed=item.bossSalvage?1100:360+240*(1-Math.min(1,distance/150));
      const travel=Math.min(distance,speed*dt);
      if(distance>0){item.x+=dx/distance*travel;item.y+=dy/distance*travel;}
    } else {
      item.vx=(Number.isFinite(item.vx)?item.vx:0)*Math.pow(.15,dt);
      item.vy=Math.min(120,(Number.isFinite(item.vy)?item.vy:(Number.isFinite(item.s)?item.s:65))+18*dt);
      item.x+=item.vx*dt;item.y+=item.vy*dt;
    }
    return item.life>0 && item.x> -80 && item.x<W+80 && item.y<H+120;
  }

  function update(dt) {
    const lv = level();
    if (state === "playing" && typeof hullGrace !== "undefined") hullGrace = Math.max(0, hullGrace - dt);
    const starBoost = state === "playing" ? lv.speed * (warpTimer > 0 ? 5.5 : 1) : 1;
    visualSpeed += (starBoost - visualSpeed) * Math.min(1, dt * 4.5);
    for (const star of stars) {
      star.y += star.s * star.layer * dt * starBoost;
      if (star.y > H + 8) {
        star.y = -8;
        star.x = Math.random() * W;
      }
    }
    for (const dust of spaceDust) {
      dust.y += dust.s * dt * starBoost;
      dust.x += dust.drift * dt;
      if (dust.y > H + 12) { dust.y = -12; dust.x = Math.random() * W; }
      if (dust.x < -20) dust.x = W + 20;
      if (dust.x > W + 20) dust.x = -20;
    }
    for (const mote of foregroundParticles) {
      mote.y += mote.s * dt * Math.max(0.8, starBoost);
      mote.x += mote.drift * dt;
      if (mote.y > H + 28) { mote.y = -28; mote.x = Math.random() * W; }
    }
    updateHudVisual(dt);
    cameraKickX *= Math.pow(0.001, dt);
    cameraKickY *= Math.pow(0.001, dt);

    if (state === "destroying") {
      elapsed += dt;
      destructionTimer = Math.max(0, destructionTimer - dt);

      if (destructionTimer < 0.88 && destructionStage === 0) {
        destructionStage = 1;
        playerVisible = false;
        addExplosion(player.x - 42 * SHIP_VISUAL.scale, player.y - 18 * SHIP_VISUAL.scale, 1.05, 0.62);
        addExplosion(player.x + 46 * SHIP_VISUAL.scale, player.y + 8 * SHIP_VISUAL.scale, 1.12, 0.66);
        burst(player.x, player.y, 34, "gold");
      }
      if (destructionTimer < 0.48 && destructionStage === 1) {
        destructionStage = 2;
        addExplosion(player.x, player.y - 10 * SHIP_VISUAL.scale, 1.35, 0.58);
        pulseRing(player.x, player.y, "#ff9b42", 170, 0.55);
      }

      updateEffects(dt);
      if (destructionTimer <= 0) finishGame("hull");
      return;
    }

    if (state !== "playing") {
      updateEffects(dt);
      return;
    }

    // Do not run invisible encounters while the authored departure layers load.
    if(classicFlight && (!spriteReady(SPRITES.flightKit) || !spriteReady(SPRITES.flightSpace) ||
      (!spriteReady(SPRITES.chronosDestruction) && !SPRITES.chronosDestruction._loadError))) {
      if(ui.flightStage)ui.flightStage.textContent="CARGANDO CHRONOS";
      // Loading writes a transient label outside the regular HUD signature.
      // Invalidate it so the first playable update restores the real stage.
      flightHudSignature="";
      return;
    }
    elapsed += dt;
    if (manualShotCooldown > 0) {
      const previousCooldown = manualShotCooldown;
      manualShotCooldown = Math.max(0, manualShotCooldown - dt);
      if (previousCooldown > 0 && manualShotCooldown === 0) updateAmmoHud();
    }
    updateLevelStory(dt);
    if (levelOneShockwave > 0) levelOneShockwave = Math.max(0, levelOneShockwave - dt);
    impactReactionTimer = Math.max(0, impactReactionTimer - dt);
    if (lv.hazard === "gravity") player.drift = Math.sin(elapsed * 0.8) * 22;
    else player.drift = 0;

    player.previousCollisionX=player.x;player.previousCollisionY=player.y;
    const follow = 9 + (settings.sensitivity / 100) * 8;
    player.x += (player.target + player.drift - player.x) * Math.min(1, dt * follow);
    player.visualBank=NeonCampaign.advanceShipBank(player.visualBank||0,
      clamp((player.target+player.drift-player.x)/95,-1,1),dt);
    player.x = clamp(player.x, player.w / 2 + 18, W - player.w / 2 - 18);
    if(classicFlightBounds) {
      player.x=clamp(player.x,classicFlightBounds.minX,classicFlightBounds.maxX);
      player.y+=(player.targetY-player.y)*Math.min(1,dt*follow);
      player.y=clamp(player.y,classicFlightBounds.minY,classicFlightBounds.maxY);
    }
    engineTrail();
    if(typeof classicTutorial!=='undefined'&&classicTutorial&&state==='playing') {
      if(classicTutorialAnchor)classicTutorial.observe({type:'pilot',distance:Math.hypot(player.x-classicTutorialAnchor.x,player.y-classicTutorialAnchor.y)});
      classicTutorialAnchor={x:player.x,y:player.y};
    }

    if (warpTimer > 0) {
      warpTimer = Math.max(0, warpTimer - dt);
      if (warpTimer === 0) updateAmmoHud();
      updateEffects(dt);
      return;
    }

    advanceClassicFlight(dt);
    if(state!=="playing"){updateEffects(dt);return;}
    if (typeof updateCh03Encounter === "function") updateCh03Encounter(dt);
    if (!atlasBoss && !classicFlightView) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        addItem();
        let interval = lv.spawn * (0.86 + Math.random() * 0.30);
        if (lv.hazard === "storm" && Math.sin(elapsed * 0.75) > 0.68) interval *= 0.58;
        if (lv.hazard === "final" && Math.sin(elapsed * 0.95) > 0.60) interval *= 0.62;
        spawnTimer = Math.max(0.23, interval);
      }
      if (currentLevel === 1) {
        classicScoutTimer -= dt;
        if (classicScoutTimer <= 0) {
          if (items.filter(item => item.classicScout).length < 2) {
            spawnClassicFlightPatrol(classicPatrolSequence%3===1?"interceptor":"scout");
            if (!classicScoutAnnounced) {
              classicScoutAnnounced = true;
              showStoryTransmission("RED ATLAS", "Identificación denegada. Dron CH-01 armado.", 3.2);
            }
          }
          classicScoutTimer = 6.2 + Math.random() * 1.5;
        }
      }
    }

    if (atlasBoss) {
      updateAtlasEncounter(dt);
      if (state !== "playing") { updateEffects(dt); return; }
    }

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 1;
    }

    for (const key in powers) {
      if (powers[key] > 0) powers[key] = Math.max(0, powers[key] - dt);
    }
    if(classicHullReserve>0)classicShieldAge+=dt;
    classicShieldImpact=Math.max(0,classicShieldImpact-dt);
    if (powers.tractor <= 0) tractorTarget = null;
    updatePowerHud();

    if (powers.phaser > 0) {
      phaserCooldown -= dt;
      if (phaserCooldown <= 0) firePhaser();
    }

    if (shake > 0) shake = Math.max(0, shake - dt * 48);
    if (flash > 0) flash -= dt;
    if ((lv.hazard === "storm" || lv.hazard === "final") && Math.random() < dt * 0.22) stormPulse = 0.18;
    if (stormPulse > 0) stormPulse -= dt;

    if (powers.tractor > 0 && (!tractorTarget || !items.includes(tractorTarget))) selectTractorTarget();

    advanceClassicWeaponField(dt);
    if (settings.autoFire && !atlasBoss && classicFlightView?.waitingFor!=="service") fireManualShot();
    const scale = powers.slow > 0 ? 0.50 : 1;
    if (!atlasBoss) updateGateSystem(dt, scale);

    // Un turno de ataque de quien ya no está (derribado o fuera) se libera ya.
    const attackTokens = typeof sectorAttackTokens === "undefined" ? null : sectorAttackTokens;
    if (attackTokens) {
      const alive = new Set(items.map(item => item.id));
      for (const id of [...attackTokens.holders.keys(), ...attackTokens.waiting.keys()])
        if (!alive.has(id)) NeonCampaign.forgetEnemy(attackTokens, id);
      // Un escudo de Égida sin su Égida desaparece.
      for (const item of items) if (item.shieldHits > 0 && !alive.has(item.shieldBy)) item.shieldHits = 0;
    }
    // Marca del Rastreador: los perseguidores apuntan mejor mientras dura.
    if (typeof playerMarkedUntil !== "undefined") player.marked = elapsed < playerMarkedUntil;
    for (let index = items.length - 1; index >= 0; index--) {
      const item = items[index];
      // Recovering the final fragment can replace the field with the Atlas
      // arena synchronously. The old loop indexes must not read that old field.
      if (!item) continue;
      if(item.salvagePickup) {
        if(!advanceClassicSalvagePickup(item,dt*scale)){items.splice(index,1);continue;}
      } else if(item.showerComet) {
        if(!NeonCampaign.advanceShowerComet(item,dt*scale)) {
          releaseClassicShowerComet(item);items.splice(index,1);continue;
        }
      } else if(item.classicScoutProjectile && item.tacticsVersion===NeonCampaign.CLASSIC_PURSUIT_VERSION) {
        item.previousX=item.x;item.previousY=item.y;
        item.x+=item.vx*dt*scale;item.y+=item.vy*dt*scale;item.life-=dt*scale;
        if(item.life<=0||item.x< -60||item.x>W+60){items.splice(index,1);continue;}
      } else if(item.flightComet) {
        item.x+=item.vx*dt*scale;item.y+=item.vy*dt*scale;item.life-=dt*scale;
        if(item.life<=0 || item.x>W+100){items.splice(index,1);continue;}
      } else if (item.hordeUnit) {
        // Cruzan en diagonal sin detenerse; salen por un lado o por abajo.
        item.x += item.vx * dt * scale; item.y += item.vy * dt * scale;
        item.hordeAnimator.update(dt * scale, {hp: item.hp, maxHp: item.maxHp, vx: item.vx, vy: item.vy});
        if (item.x < -120 || item.x > W + 120) { items.splice(index, 1); continue; }
      } else if (item.gaiaEnemy || item.gaiaMine || item.gaiaBomb) {
        // También desaparece el enemigo que se retira al salir por arriba.
        if (!advanceGaiaItem(item, dt * scale) || (item.gaia?.leaving && item.y < -80)) { items.splice(index, 1); continue; }
      } else if (item.guardianProjectile) {
        item.previousX=item.x;item.previousY=item.y;
        item.x += item.vx * dt * scale;
        item.y += item.vy * dt * scale;
        item.life -= dt * scale;
        if (item.life <= 0 || item.x < -60 || item.x > W + 60) { items.splice(index, 1); continue; }
      } else item.y += item.s * dt * scale;
      item.rot += item.rs * dt;
      item.p += dt * 4;
      if(item.type==="flightModule")item.y=Math.min(item.y,(classicFlightAnchorY||player.y)-65);

      if (item.classicScout) {
        item.classicScout.holdFire=cometShowerActive();
        const advance=item.classicScout.tacticsVersion?NeonCampaign.advanceClassicPursuer:NeonCampaign.advanceClassicScout;
        advance(item,dt*scale,player,shot=>{items.push(shot);combatSound("enemy-phaser",shot.x);},
          attackTokens?{tokens:attackTokens,now:elapsed}:null);
      }

      const wave = lv.hazard === "wave" || lv.hazard === "chaos" || lv.hazard === "final";
      if (wave && isThreat(item) && !item.showerComet && !item.classicScout?.tacticsVersion && !item.classicScoutProjectile &&
          !item.gaiaEnemy && !item.gaiaMine && !item.gaiaBomb && !item.hordeUnit && !item.aimedMeteor) {
        item.x = item.baseX + Math.sin(elapsed * (lv.hazard === "chaos" ? 3.2 : 2.15) + item.phase) * item.amp;
      }
      if (lv.hazard === "phantom" && isThreat(item) && !item.showerComet) {
        item.alpha = 0.20 + 0.80 * Math.abs(Math.sin(elapsed * 1.8 + item.phase));
      } else {
        item.alpha = 1;
      }

      // La comprobación se repite después de aplicar ondas y órbitas: una
      // amenaza nacida fuera tampoco puede serpentear dentro del pasillo.
      if (isThreat(item) && threatOverlapsProtectedCorridor(item)) {
        releaseClassicShowerComet(item);
        items.splice(index, 1);
        if (item === tractorTarget) tractorTarget = null;
        continue;
      }

      if (powers.tractor > 0 && item === tractorTarget) {
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        item.x += dx * dt * 5.8;
        item.y += dy * dt * 5.8;
      }

      if(interceptClassicProjectile(item)){releaseClassicShowerComet(item);items.splice(index,1);continue;}
      if (hit(item)) {
        if(collectItem(item)===false){if(item.salvagePickup)item.life=Math.max(item.life,2);continue;}
        releaseClassicShowerComet(item);
        const actualIndex = items.indexOf(item);
        if (actualIndex >= 0) items.splice(actualIndex, 1);
        if (item === tractorTarget) tractorTarget = null;
        if (state !== "playing") break;
        continue;
      }

      if (!item.showerComet && !item.gaiaEnemy && item.y - item.r > H) {
        if (item.type === "energy") {
          combo = 1;
          comboTimer = 0;
        }
        items.splice(index, 1);
        if (item === tractorTarget) tractorTarget = null;
        hud();
      }
    }

    if(classicFlightView)clearCometCorridor();
    // En los viajes con ficha (el sector) la ruta ya exige la cuota de su último tramo.
    if(classicFlightView?.canFinish && (classicSideVoyage||collected>=level().goal))completeLevel();
    checkSupplyFailure();
    if (hull < 67 && settings.effects && Math.random() < dt * (hull < 34 ? 7 : 2.4)) {
      burst(
        player.x + (Math.random() - 0.5) * 70 * SHIP_VISUAL.scale,
        player.y + (Math.random() - 0.5) * 35 * SHIP_VISUAL.scale,
        1,
        hull < 34 ? "red" : "gold"
      );
    }
    updateEffects(dt);
  }
  // Inicio como animación: franjas de cine y el diálogo como subtítulo (el HUD
  // está oculto hasta que acaba).
  function drawClassicChapterFilm(opening) {
    const time=classicChapterView.routeElapsed,bar=H*.075*Math.min(1,time/.6);
    ctx.save();ctx.fillStyle="#000";ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    const cue=opening.dialogue;
    if(cue&&time<cue.at+cue.duration) {
      const alpha=Math.min(1,(time-cue.at)/.25,(cue.at+cue.duration-time)/.25);
      ctx.globalAlpha=Math.max(0,alpha);ctx.textAlign="center";ctx.textBaseline="alphabetic";
      ctx.font="700 24px 'Exo 2', sans-serif";
      const words=cue.text.split(" "),lines=[""];
      for(const word of words) {
        const next=lines[lines.length-1]?`${lines[lines.length-1]} ${word}`:word;
        if(ctx.measureText(next).width>W*.80&&lines[lines.length-1])lines.push(word);else lines[lines.length-1]=next;
      }
      // Placa oscura detrás del subtítulo: sin ella el texto se perdía sobre
      // el cristal cian de la estación (revisión B2, DESIGN §9.5 y §12.7).
      const top=H*.70-30,bottom=H*.70+34+(lines.length-1)*30+14;
      ctx.fillStyle="#061521e8";ctx.fillRect(W*.05,top,W*.90,bottom-top);
      ctx.shadowColor="rgba(0,0,0,.9)";ctx.shadowBlur=6;
      ctx.font="800 20px 'Exo 2', sans-serif";ctx.fillStyle="#a1eee8";
      ctx.fillText(cue.speaker,W/2,H*.70);
      ctx.font="700 24px 'Exo 2', sans-serif";ctx.fillStyle="#f2f0e6";
      lines.forEach((line,index)=>ctx.fillText(line,W/2,H*.70+34+index*30));
    }
    ctx.restore();
  }

  function drawClassicChapterOpening() {
    const opening=classicChapterView?.opening;
    if(state==="playing"&&opening?.film)drawClassicChapterFilm(opening);
    if(state!=="playing"||!opening?.active||opening.backgroundAlpha<=0||
      !spriteReady(SPRITES.chapterIntro))return;
    // Four authored shots precede the same live station, reactor and wave.
    // The route snapshot owns all cuts and camera motion; pause freezes them.
    const time=classicFlightView.elapsed;
    const frame=time<2.25?0:time<6.3?1:time<9?2:3;
    const image=SPRITES.chapterIntro,cw=image.naturalWidth/2,ch=image.naturalHeight/2;
    const zoom=settings.reduceEffects?1:1.035+opening.shotProgress*.035;
    const scale=Math.max(W/cw,H/ch)*zoom,width=cw*scale,height=ch*scale;
    ctx.save();ctx.globalAlpha=opening.backgroundAlpha;
    ctx.drawImage(image,frame%2*cw,Math.floor(frame/2)*ch,cw,ch,
      (W-width)/2,(H-height)/2,width,height);
    ctx.restore();
  }

  function rounded(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function drawPlanet(x, y, radius, colors, ring = false) {
    ctx.save();
    if (ring) {
      ctx.strokeStyle = colors[1] + "88";
      ctx.lineWidth = Math.max(5, radius * 0.10);
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.55, radius * 0.34, -0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
    const gradient = ctx.createRadialGradient(x - radius * 0.34, y - radius * 0.32, radius * 0.05, x, y, radius);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.38, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = radius * 0.30;
    ctx.shadowColor = colors[1] + "66";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSectorEnvironment(t, lv) {
    // Con un planeta pintado en el cielo no se dibujan las figuras vectoriales
    // antiguas (líneas, anillos, rayas): mezclaban dos estilos (DESIGN §9.4).
    if (currentLevel === 2 || sectorPlanet()) return;
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    if (lv.scene === "cronos") {
      // The authored Chronos painting is the scene. Avoid artificial bars
      // and geometry that obscure the station, especially on small screens.
      const sx = W * 0.50;
      const sy = H * 0.40;
      const pulse = 1 + Math.sin(t * 0.0025) * 0.025;
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 178 * pulse);
      glow.addColorStop(0, "rgba(214,250,255,.48)");
      glow.addColorStop(0.18, "rgba(78,199,255,.22)");
      glow.addColorStop(0.55, "rgba(50,105,210,.065)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H * 0.55);
    } else if (lv.scene === "orbit") {
      drawPlanet(W * 0.78, H * 0.19, 105, ["#e9ffff", "#4eb9ff", "#15245f"], true);
    } else if (lv.scene === "rift") {
      const band = ctx.createLinearGradient(W * 0.28, 0, W * 0.72, H);
      band.addColorStop(0, "rgba(65,190,255,0)");
      band.addColorStop(0.46, "rgba(58,166,255,.18)");
      band.addColorStop(0.52, "rgba(158,249,255,.28)");
      band.addColorStop(0.58, "rgba(70,81,255,.13)");
      band.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = band;
      ctx.fillRect(0, 0, W, H);
    } else if (lv.scene === "belt") {
      ctx.globalAlpha = 0.22;
      for (let index = 0; index < 9; index++) {
        const x = (index * 103 + 42) % W;
        const y = H * 0.15 + ((index * 157 + t * 0.018) % (H * 0.55));
        ctx.fillStyle = index % 2 ? "#b77355" : "#84605e";
        ctx.beginPath();
        ctx.arc(x, y, 7 + (index % 4) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (lv.scene === "ion") {
      ctx.strokeStyle = "rgba(191,126,255,.34)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#a96cff";
      for (let index = 0; index < 3; index++) {
        const y = H * (0.18 + index * 0.17) + Math.sin(t * 0.003 + index) * 28;
        ctx.beginPath();
        ctx.moveTo(-20, y);
        ctx.bezierCurveTo(W * 0.25, y - 70, W * 0.62, y + 75, W + 30, y - 25);
        ctx.stroke();
      }
    } else if (lv.scene === "crimson") {
      if (!sectorPlanet()) drawPlanet(W * 0.19, H * 0.16, 92, ["#fff5c7", "#ff744f", "#761737"], false);
      ctx.globalAlpha = 0.14 + Math.sin(t * 0.004) * 0.03;
      ctx.fillStyle = "#ff4965";
      ctx.beginPath();
      ctx.arc(W * 0.19, H * 0.16, 145, 0, Math.PI * 2);
      ctx.fill();
    } else if (lv.scene === "gravity") {
      const x = W * 0.74;
      const y = H * 0.20;
      ctx.strokeStyle = "rgba(80,255,208,.48)";
      ctx.lineWidth = 12;
      ctx.shadowBlur = 24;
      ctx.shadowColor = "#47ffd1";
      ctx.beginPath();
      ctx.ellipse(x, y, 135, 38, -0.25 + Math.sin(t * 0.0005) * 0.04, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#010207";
      ctx.beginPath();
      ctx.arc(x, y, 61, 0, Math.PI * 2);
      ctx.fill();
    } else if (lv.scene === "ghost") {
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = "#b99bea";
      ctx.fillRect(W * 0.10, H * 0.17, W * 0.80, 12);
      ctx.fillRect(W * 0.27, H * 0.12, 18, 115);
      ctx.fillRect(W * 0.68, H * 0.10, 16, 132);
      const fog = ctx.createLinearGradient(0, H * 0.18, W, H * 0.65);
      fog.addColorStop(0, "rgba(174,132,232,0)");
      fog.addColorStop(0.5, "rgba(174,132,232,.11)");
      fog.addColorStop(1, "rgba(174,132,232,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, H * 0.12, W, H * 0.62);
    } else if (lv.scene === "overdrive") {
      ctx.globalAlpha = 0.20;
      ctx.strokeStyle = "#fff27b";
      ctx.lineWidth = 2;
      for (let index = 0; index < 12; index++) {
        const x = (index * 67 + t * 0.08) % (W + 180) - 90;
        ctx.beginPath();
        ctx.moveTo(x, H * 0.08);
        ctx.lineTo(x - 130, H * 0.70);
        ctx.stroke();
      }
    } else if (lv.scene === "dark") {
      if (!sectorPlanet()) drawPlanet(W * 0.73, H * 0.18, 112, ["#6d2d73", "#27102f", "#05030a"], false);
      ctx.fillStyle = "rgba(255,92,233,.12)";
      ctx.beginPath();
      ctx.arc(W * 0.73, H * 0.18, 130, 0, Math.PI * 2);
      ctx.fill();
    } else if (lv.scene === "collapse") {
      const x = W * 0.50;
      const y = H * 0.20;
      ctx.strokeStyle = "rgba(93,255,236,.58)";
      ctx.lineWidth = 9;
      ctx.shadowBlur = 28;
      ctx.shadowColor = "#66fff1";
      ctx.beginPath();
      ctx.ellipse(x, y, 128 + Math.sin(t * 0.003) * 7, 54, t * 0.0005, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(220,87,255,.45)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y, 92, 92, -t * 0.0007, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // The first classic route composes independent illustrated objects.  A single
  // simulation snapshot drives geography, scenery and the mission HUD; render
  // timestamps never advance this journey while the game is paused.
  function drawChronosFlightSprite(frame, node, sizeMultiplier = 1) {
    if (!node?.visible || !spriteReady(SPRITES.flightKit)) return false;
    const image = SPRITES.flightKit;
    const cellWidth = image.naturalWidth / 3;
    const cellHeight = image.naturalHeight / 2;
    const size = W * node.scale * sizeMultiplier;
    ctx.save();
    ctx.translate(node.x * W, node.y * H);
    ctx.rotate(node.rotation || 0);
    // Both station poses share their reactor pivot and remain fully opaque.
    ctx.drawImage(image, (frame % 3) * cellWidth, Math.floor(frame / 3) * cellHeight,
      cellWidth, cellHeight, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }

  function drawChronosDestructionStation(view, pose) {
    const node = view.station;
    if (!node.visible || !spriteReady(SPRITES.chronosDestruction)) return false;
    const image = SPRITES.chronosDestruction;
    const cellWidth = image.naturalWidth / 3, cellHeight = image.naturalHeight / 2;
    const size = W * node.scale;
    ctx.save(); ctx.translate(node.x * W, node.y * H); ctx.rotate(node.rotation || 0);
    ctx.drawImage(image, (pose.frame % 3) * cellWidth, Math.floor(pose.frame / 3) * cellHeight,
      cellWidth, cellHeight, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  }

  // Inicio de Chronos con las piezas del propietario. Todo se deriva de la
  // pose pura de NeonCampaign.getChronosIntroPose; sin piezas cargadas se
  // sigue usando el inicio anterior.
  function chronosIntroPose(view) {
    const introRoute = view.routeId === "chronos-to-gaia" ||
      (typeof classicSideVoyage !== "undefined" && classicSideVoyage?.ficha.intro === true);
    if (typeof NeonCampaign.getChronosIntroPose !== "function" || !introRoute) return null;
    // Tras la secuencia, la estación rota sigue girando y alejándose con la
    // ruta (sin volver al dibujo antiguo mientras siga a la vista).
    const pose = NeonCampaign.getChronosIntroPose(view.elapsed,
      {reducedEffects: Boolean(settings.reduceEffects), holdWreck: Boolean(view.station.visible)});
    // Mientras las piezas cargan no se dibuja la estación antigua (se veía un
    // instante en iPhone); solo si fallan se vuelve al dibujo anterior.
    return pose.active && !SPRITES.chronosIntroStation._loadError ? pose : null;
  }

  function drawAtlasCell(image, columns, cell, x, y, width, height) {
    const size = image.naturalWidth / columns;
    ctx.drawImage(image, (cell % columns) * size, Math.floor(cell / columns) * size, size, size, x, y, width, height);
  }

  function drawTalasa(pose) {
    if (!spriteReady(SPRITES.chronosIntroStation)) return;
    // El planeta que orbita Chronos se queda atrás al huir.
    const fade = 1 - clamp((pose.clock - 20) / 6, 0, 1);
    if (fade <= 0) return;
    const size = W * (1.05 - .25 * clamp(pose.clock / 26, 0, 1));
    ctx.save(); ctx.globalAlpha = fade;
    drawAtlasCell(SPRITES.chronosIntroStation, 3, 5, W * .92 - size / 2, H * .06 - size / 2 - pose.clock * 2, size, size);
    ctx.restore();
  }

  // Escena del inicio bajo su propia cámara (no afecta al juego ni al HUD).
  function withChronosIntroCamera(pose, draw) {
    const camera = pose.camera;
    ctx.save();
    ctx.translate(W * (.5 + camera.shakeX), H * (.5 + camera.shakeY));
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-W * camera.cx, -H * camera.cy);
    draw();
    ctx.restore();
  }

  function drawChronosIntroDarkness(pose) {
    // El espacio (no el villano) se oscurece desde arriba cuando se acerca.
    if (pose.darkness <= 0) return;
    const dark = ctx.createLinearGradient(0, 0, 0, H * .75);
    dark.addColorStop(0, `rgba(4,0,14,${pose.darkness.toFixed(3)})`); dark.addColorStop(1, "rgba(4,0,14,0)");
    ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = dark; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  function drawCronosPortals(pose) {
    // Portal dimensional por el que llega y se va Cronos Prime (propietario,
    // 24/10/2026). Mientras llega su arte propio: la esfera de energía pintada
    // (celda 0 de la hoja de efectos), achatada, girando y con un vacío oscuro.
    const fx = SPRITES.cronosPrimeFx;
    if (!pose.portals.length || !spriteReady(fx)) return;
    for (const portal of pose.portals) {
      const x = portal.x * W, y = portal.y * H, radius = W * .15 * portal.open;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, .62);
      const void_ = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * .78);
      void_.addColorStop(0, `rgba(6,2,18,${(.92 * portal.open).toFixed(3)})`); void_.addColorStop(1, "rgba(6,2,18,0)");
      ctx.fillStyle = void_; ctx.beginPath(); ctx.arc(0, 0, radius * .78, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = Math.min(1, portal.open * 1.3);
      ctx.rotate(portal.spin * Math.PI * 2);
      drawAtlasCell(fx, 4, 0, -radius, -radius, radius * 2, radius * 2);
      ctx.rotate(-portal.spin * Math.PI * 3.1); ctx.globalAlpha *= .55;
      drawAtlasCell(fx, 4, 0, -radius * .8, -radius * .8, radius * 1.6, radius * 1.6);
      ctx.restore();
    }
  }

  function drawCronosPrime(pose) {
    const prime = pose.prime, atlas = SPRITES.cronosPrimeVideo;
    if (!prime.visible || !spriteReady(atlas)) return;
    // El cuerpo llena ~94 % de la celda (fotogramas sacados del vídeo).
    const x = prime.x * W, y = prime.y * H, size = W * .52 * prime.scale;
    // Halo de carga detrás del cuerpo.
    if (prime.charge > 0) {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, size * (.4 + .5 * prime.charge));
      halo.addColorStop(0, `rgba(210,190,255,${(.55 * prime.charge).toFixed(3)})`); halo.addColorStop(1, "rgba(110,70,255,0)");
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = halo;
      ctx.fillRect(x - size, y - size, size * 2, size * 2); ctx.restore();
    }
    // Fotograma actual y fundido hacia el siguiente, con suavizado alto (en
    // iPhone el sprite se amplía).
    ctx.save(); ctx.globalAlpha = prime.alpha; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    drawAtlasCell(atlas, 8, prime.frame, x - size / 2, y - size / 2, size, size);
    if (prime.blend > 0 && prime.next !== prime.frame) {
      ctx.globalAlpha = prime.alpha * prime.blend;
      drawAtlasCell(atlas, 8, prime.next, x - size / 2, y - size / 2, size, size);
    }
    ctx.restore();
    // Frenazo: onda de energía que se expande y se apaga.
    if (prime.brake > 0) {
      const grow = 1 + (1 - prime.brake) * 1.3;
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = prime.brake;
      ctx.strokeStyle = "#d9ccff"; ctx.lineWidth = 3 + 10 * prime.brake; ctx.shadowColor = "#8f6bff"; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.ellipse(x, y, size * .48 * grow, size * .22 * grow, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawCronosPrimeBeam(pose, targetX, targetY) {
    // Disparo vertical del núcleo a la torre con el haz pintado (dos capas que
    // se cruzan para que la espiral se mueva) y la esfera de energía al impactar.
    const prime = pose.prime, beam = pose.beam, art = SPRITES.cronosPrimeBeam, fx = SPRITES.cronosPrimeFx;
    if (!prime.visible || beam.alpha <= 0 || !spriteReady(art)) return;
    const fromX = prime.x * W, fromY = prime.y * H;
    const length = Math.hypot(targetX - fromX, targetY - fromY), width = W * .22 * beam.width;
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = beam.alpha;
    ctx.translate(fromX, fromY); ctx.rotate(Math.atan2(targetY - fromY, targetX - fromX) - Math.PI / 2);
    ctx.drawImage(art, -width / 2, 0, width, length);
    ctx.scale(-1, 1); ctx.globalAlpha = beam.alpha * (.45 + .25 * Math.sin(pose.clock * 30));
    ctx.drawImage(art, -width * .6, 0, width * 1.2, length);
    ctx.restore();
    if (!spriteReady(fx)) return;
    const spot = W * .3 * beam.width;
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = beam.alpha;
    ctx.translate(targetX, targetY); ctx.rotate(pose.clock * 4);
    drawAtlasCell(fx, 4, 0, -spot / 2, -spot / 2, spot, spot);
    ctx.restore();
  }

  function drawChronosIntroStation(view, pose) {
    const node = view.station, atlas = SPRITES.chronosIntroStation;
    const station = pose.station;
    const unit = W * node.scale * station.zoom;
    const x = node.x * W, y = (node.y + station.drop) * H;
    const ringPoint = (angle, radius) => [x + Math.cos(angle) * radius * unit, y + Math.sin(angle) * radius * unit * station.tiltY];
    if (node.visible && spriteReady(atlas)) {
      ctx.save(); ctx.globalAlpha = station.alpha;
      const wheel = unit * .7;
      const wheelSpace = () => { ctx.translate(x, y); ctx.rotate(station.sway); ctx.scale(1, station.tiltY); ctx.rotate(station.wheelAngle); };
      if (station.whole) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(station.sway); ctx.scale(1, station.tiltY); ctx.rotate(station.ringAngle);
        drawAtlasCell(atlas, 3, 0, -unit / 2, -unit / 2, unit, unit);
        ctx.restore();
        ctx.save(); wheelSpace();
        drawAtlasCell(atlas, 3, 1, -wheel / 2, -wheel / 2, wheel, wheel);
        ctx.restore();
        // Luz por sectores: brillan mientras viven y se apagan uno a uno.
        const sectors = station.sectorLights;
        for (let index = 0; index < sectors.length; index++) {
          const from = -Math.PI / 2 + index * Math.PI * 2 / sectors.length, to = from + Math.PI * 2 / sectors.length;
          ctx.save(); wheelSpace(); ctx.rotate(-station.wheelAngle);
          // Solo la rueda: con radio mayor, el sector apagado pintaba cuñas negras sobre el anillo y el espacio.
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, wheel / 2, from, to); ctx.closePath(); ctx.clip();
          ctx.rotate(station.wheelAngle);
          if (sectors[index] > 0) {
            ctx.globalCompositeOperation = "screen"; ctx.globalAlpha *= .4 * sectors[index];
            drawAtlasCell(atlas, 3, 1, -wheel / 2, -wheel / 2, wheel, wheel);
          } else {
            ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha *= .7;
            ctx.fillStyle = "#1e1a32"; ctx.fillRect(-unit, -unit, unit * 2, unit * 2);
          }
          ctx.restore();
        }
      }
      // Torre de cristal mientras vive (al estallar, la estación desaparece).
      if (station.whole) {
        const tower = unit * .62;
        ctx.save(); ctx.translate(x, y + unit * .1); ctx.rotate(station.sway * .6);
        drawAtlasCell(atlas, 3, station.towerCell, -tower / 2, -tower, tower, tower);
        ctx.restore();
      }
      ctx.restore();
    }
    // La propia estación estalla (hojas del propietario, fundidas).
    const blast = SPRITES.chronosStationBurst;
    if (pose.explosion && spriteReady(blast)) {
      const size = unit * pose.explosion.scale;
      ctx.save(); ctx.globalAlpha = pose.explosion.alpha;
      drawAtlasCell(blast, 5, pose.explosion.frame, x - size / 2, y - size / 2, size, size);
      if (pose.explosion.blend > 0 && pose.explosion.next !== pose.explosion.frame) {
        ctx.globalAlpha = pose.explosion.alpha * pose.explosion.blend;
        drawAtlasCell(blast, 5, pose.explosion.next, x - size / 2, y - size / 2, size, size);
      }
      ctx.restore();
    }
    // Restos que salen despedidos; los que van hacia la nave crecen.
    const fragments = SPRITES.chronosIntroFragments;
    if (pose.fragments.length && spriteReady(fragments)) {
      for (const piece of pose.fragments) {
        if (piece.alpha <= 0) continue;
        const size = unit * .16 * piece.scale;
        ctx.save(); ctx.globalAlpha = piece.alpha;
        ctx.translate(x + piece.dx * unit * .9, y + piece.dy * unit * .9); ctx.rotate(piece.angle);
        drawAtlasCell(fragments, 4, piece.cell, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
    // Descargas que llevan la energía de cada sector a Cronos Prime.
    const prime = pose.prime, fx = SPRITES.cronosPrimeFx;
    if (spriteReady(fx)) for (const stream of pose.drainStreams) {
      if (stream.alpha <= 0) continue;
      const [sx, sy] = ringPoint(stream.angle, .3);
      const tx = prime.x * W, ty = prime.y * H, mx = (sx + tx) / 2 + (sx - x) * .4, my = (sy + ty) / 2;
      const at = t => [(1 - t) ** 2 * sx + 2 * (1 - t) * t * mx + t * t * tx, (1 - t) ** 2 * sy + 2 * (1 - t) * t * my + t * t * ty];
      ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = stream.alpha;
      for (let segment = 0; segment < 3; segment++) {
        const [ax, ay] = at(segment / 3), [bx, by] = at((segment + 1) / 3);
        const length = Math.hypot(bx - ax, by - ay);
        ctx.save(); ctx.translate((ax + bx) / 2, (ay + by) / 2); ctx.rotate(Math.atan2(by - ay, bx - ax) - Math.PI / 2);
        drawAtlasCell(fx, 4, 1 + (stream.cell + segment) % 6, -length * .35, -length * .6, length * .7, length * 1.2);
        ctx.restore();
      }
      ctx.restore();
    }
    drawCronosPortals(pose);
    drawCronosPrime(pose);
    // El haz sale del núcleo por encima del cuerpo, como en los fotogramas de disparo del vídeo.
    drawCronosPrimeBeam(pose, x, y - unit * .3);
  }

  function drawChronosIntroOverlay(pose) {
    const card = pose.prime.nameCard;
    if (card > 0) {
      // Rótulo del villano: entra de golpe, con aberración cromática violeta.
      const punch = 1 + .35 * pose.prime.nameCardPunch;
      ctx.save(); ctx.globalAlpha = card; ctx.textAlign = "center";
      // Por encima de la franja de subtítulos (H*.70) para no pisarla.
      ctx.translate(W / 2, H * .52); ctx.scale(punch, punch);
      // Banda oscura detrás: sin ella el rótulo se perdía sobre los anillos
      // iluminados de la estación (revisión B2, DESIGN §9.5).
      ctx.fillStyle = "rgba(6,21,33,.82)"; ctx.fillRect(-W * .6, -70, W * 1.2, 126);
      // Orbitron es más ancha: a 64 px ocupa lo mismo que la letra anterior a 76.
      ctx.font = "900 64px Orbitron, sans-serif";
      ctx.fillStyle = "rgba(255,40,110,.7)"; ctx.fillText("CRONOS PRIME", -4, 0);
      ctx.fillStyle = "rgba(70,200,255,.7)"; ctx.fillText("CRONOS PRIME", 4, 0);
      ctx.fillStyle = "#f6f2ff"; ctx.shadowColor = "#8f6bff"; ctx.shadowBlur = 22; ctx.fillText("CRONOS PRIME", 0, 0);
      ctx.shadowBlur = 0; ctx.fillStyle = "#c7b8ff"; ctx.font = "800 22px Orbitron, sans-serif";
      ctx.fillText("LA IA DEL REACTOR, DESPIERTA", 0, 40);
      ctx.restore();
    }
    if (pose.flash > 0) {
      ctx.save(); ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(215,230,255,${pose.flash.toFixed(3)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }

  function chronosSceneryFrame() {
    // Reuse geometry sampled by the UI's layout owner. Reading the DOM here
    // would force a layout on every rendered frame, including paused frames.
    const measured = typeof classicFlightBounds === "object" ? classicFlightBounds : null;
    const top = clamp(Number.isFinite(measured?.presentationTop) ? measured.presentationTop : H * .14, 0, H * .70);
    const bottom = clamp(Number.isFinite(measured?.presentationBottom) ? measured.presentationBottom : H * .88, top, H);
    return { top, bottom, height: Math.max(1, bottom - top), gap: Math.max(10, H * .012) };
  }

  function chronosDestinationPresentation(node) {
    const frame = chronosSceneryFrame();
    const maximumSize = Math.max(1, frame.height - frame.gap * 2);
    const scale = Math.min(node.scale, maximumSize / W);
    const radius = W * scale * .5;
    // Keep the growing illustrated globe below the measured tactical strip.
    // This is a camera projection only: route coordinates, scale, collisions
    // and the sparse middle stages remain untouched.
    const y = clamp(Math.max(frame.top + frame.gap + node.y * frame.height,
      frame.top + frame.gap + radius), frame.top + frame.gap + radius,
      frame.bottom - frame.gap - radius);
    return { ...node, scale, y: y / H };
  }

  function drawChronosRouteCrossing(transition) {
    const cue = transition?.cue;
    if (!cue) return;
    const image = cue.kind === "chronos-remnant"
      ? (cue.side > 0 ? SPRITES.debrisPanel : SPRITES.debrisMetal) : SPRITES.satellite;
    if (!spriteReady(image)) return;
    const frame = chronosSceneryFrame();
    const size = Math.min(W * cue.scale, frame.height * .28);
    ctx.save();
    // A navigation marker passes at the side of the corridor, behind combat.
    // Its growing scale and exit, rather than opacity, communicate the crossing.
    // Clip its projection to the measured HUD/control corridor, not a hitbox.
    ctx.beginPath(); ctx.rect(0, frame.top, W, frame.height); ctx.clip();
    ctx.translate(W * cue.x, frame.top + cue.y * frame.height);
    ctx.rotate(cue.rotation);
    ctx.globalAlpha = cue.kind === "chronos-remnant" ? .58 : .74;
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawChronosFlightBackground() {
    const view = classicFlightView;
    if (!view) return;
    const clock = view.elapsed;
    const destruction = NeonCampaign.getChronosDestructionPose(view);
    const transition = typeof NeonCampaign.getVoyageTransitionPresentation === "function"
      ? NeonCampaign.getVoyageTransitionPresentation(view, {reducedEffects: Boolean(settings.reduceEffects)}) : null;
    const space = SPRITES.flightSpace;
    ctx.fillStyle = "#020817"; ctx.fillRect(0, 0, W, H);
    if (spriteReady(space)) {
      // Overscan bounds the drift so no transparent edge or repeated painting
      // appears.  The station and Gaia move separately over this distant plate.
      const scale = Math.max(W / space.naturalWidth, H / space.naturalHeight) * 1.20;
      const width = space.naturalWidth * scale, height = space.naturalHeight * scale;
      const offsetX = clamp(view.deepSpace.offsetX * W, -(width - W) / 2, (width - W) / 2);
      const offsetY = clamp((view.deepSpace.offsetY - .27) * H * .25, -(height - H) / 2, (height - H) / 2);
      // Nebular dust is distant illumination, not another destination image.
      // The authored route becomes genuinely sparse between Chronos and Gaia;
      // the opaque origin and destination still travel independently below.
      ctx.save();
      ctx.globalAlpha = transition?.environment.nebulaOpacity ?? (Number.isFinite(view.deepSpace.nebulaOpacity)
        ? clamp(view.deepSpace.nebulaOpacity, 0, 1) : 1);
      ctx.drawImage(space, (W - width) / 2 + offsetX, (H - height) / 2 + offsetY, width, height);
      ctx.restore();
    }

    // Tiny secondary stars may use simple marks; all important scene objects
    // below are original illustrated sprites, not substitute geometry.
    ctx.save(); ctx.globalCompositeOperation = "screen";
    const starBudget = settings.effectsQuality === "low" ? 16 : 30;
    const starDensity = transition?.environment.starDensity ?? (Number.isFinite(view.deepSpace.starDensity)
      ? clamp(view.deepSpace.starDensity, 0, 1) : 1);
    const starCount = Math.round(starBudget * starDensity);
    // Travel gives every depth layer the same continuous direction even when a
    // new stage changes cruise speed. No wall clock or additional update loop.
    const starTravel = clock * .5 + view.deepSpace.travel * 140;
    for (let index = 0; index < starCount; index++) {
      const depth = .24 + (index % 5) * .18;
      const x = ((index * 149.13 - starTravel * depth * 1.6) % W + W) % W;
      const y = (index * 271.73 + starTravel * depth * 8) % H;
      const radius = .55 + depth * .65;
      ctx.globalAlpha = .12 + depth * .18;
      ctx.fillStyle = index % 4 ? "#cce8ff" : "#cbbdff";
      ctx.fillRect(x, y, radius, radius * (1 + view.deepSpace.speed * .6 + (transition?.starStretch || 0) * 2));
    }
    ctx.restore();

    const intro = chronosIntroPose(view);
    if (intro) drawTalasa(intro);
    if (intro) drawChronosIntroDarkness(intro);
    const destination = chronosDestinationPresentation(view.planet);
    if (!drawVoyagePlanet(destination)) drawChronosFlightSprite(2, destination);
    if (intro) withChronosIntroCamera(intro, () => drawChronosIntroStation(view, intro));
    else if (!drawChronosDestructionStation(view, destruction)) {
      // A failed new download keeps the two preserved station poses playable.
      drawChronosFlightSprite(view.station.state === "ruptured" ? 1 : 0, view.station);
    }

    if (view.debris.visible) {
      // These small fragments belong to the Chronos breach.  Their low contrast
      // and scale distinguish ambient parallax from collidable foreground scrap.
      const dustBudget = settings.effectsQuality === "low" ? 3 : 6;
      const sparseTransit = view.stageNumber >= 5 && view.stageNumber <= 7;
      const dustDensity = Number.isFinite(view.deepSpace.dustDensity)
        ? clamp(view.deepSpace.dustDensity, 0, 1) : sparseTransit ? .18 : 1;
      const count = Math.round(dustBudget * dustDensity);
      for (let index = 0; index < count; index++) {
        const depth = .25 + index * .12;
        const image = index % 2 ? SPRITES.debrisPanel : SPRITES.debrisMetal;
        if (!spriteReady(image)) continue;
        const x = ((W * (.22 + index * .23) + clock * view.debris.directionX * 18 * depth) % (W + 80) + W + 80) % (W + 80) - 40;
        const y = (H * .13 + index * 189 + clock * view.debris.directionY * (21 + depth * 33)) % (H + 100) - 50;
        const size = 12 + depth * 24;
        ctx.save(); ctx.translate(x, y); ctx.rotate(index * .9 + clock * (.035 + index * .009));
        ctx.globalAlpha = .20 + depth * .15;
        ctx.drawImage(image, -size / 2, -size / 2, size, size); ctx.restore();
      }
    }

    drawChronosRouteCrossing(transition);

    // Atlas ya no se combate en S1-V1: solo se ve de lejos sobre Gaia, como
    // aviso, sin la etiqueta «GUARDIAN ATLAS» de jefe.
    if (view.beacon.visible && !atlasBoss && spriteReady(SPRITES.guardianAtlas)) {
      const size = Math.max(42, W * view.beacon.scale*1.5);
      ctx.save(); ctx.translate(W * view.beacon.x, H * view.beacon.y);
      const atlas=SPRITES.guardianAtlas;
      ctx.drawImage(atlas,0,0,atlas.naturalWidth/4,atlas.naturalHeight/2,-size/2,-size/2,size,size);
      ctx.restore();
    }

    // Con el inicio nuevo el atacante es Cronos Prime, no la nave antigua.
    if (view.attacker.visible && !intro) {
      const attacker = view.attacker;
      const size = W * attacker.scale * 1.4;
      // The artwork's cannon points down-left.  Rotate its measured muzzle
      // offset with the hull rather than emitting the attack from its centre.
      const localX = -129 / 512 * size, localY = 134 / 512 * size;
      const angle = attacker.rotation || 0;
      const muzzleX = W * attacker.x + localX * Math.cos(angle) - localY * Math.sin(angle);
      const muzzleY = H * attacker.y + localX * Math.sin(angle) + localY * Math.cos(angle);
      if (attacker.state === "fire") {
        const targetX = W * view.station.x, targetY = H * view.station.y;
        const dx = targetX - muzzleX, dy = targetY - muzzleY;
        ctx.save();
        ctx.translate((muzzleX + targetX) / 2, (muzzleY + targetY) / 2);
        ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
        ctx.globalCompositeOperation = "screen";
        drawAtlasVfx(0, 17, Math.max(30, Math.hypot(dx, dy)), .88 + Math.sin(clock * 43) * .10);
        ctx.restore();
      }
      const frame = attacker.state === "charge" ? 4 : attacker.state === "fire" ? 5 : 3;
      drawChronosFlightSprite(frame, attacker, 1.4);
    }

    ensureSprite(SPRITES.chronosShockwave);
    if (!intro && destruction.waveVisible && spriteReady(SPRITES.chronosShockwave)) {
      const atlas = SPRITES.chronosShockwave;
      const cellWidth = atlas.naturalWidth / 2, cellHeight = atlas.naturalHeight / 2;
      const frame = destruction.waveFrame;
      const size = W * destruction.waveScale;
      ctx.save(); ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = destruction.waveAlpha;
      ctx.drawImage(atlas, frame % 2 * cellWidth, Math.floor(frame / 2) * cellHeight,
        cellWidth, cellHeight, view.station.x * W - size / 2, view.station.y * H - size / 2, size, size);
      ctx.restore();
    }

    if (intro) drawChronosIntroOverlay(intro);

    // Keep the flight lane readable without fading the origin into a second
    // background.  Its disappearance is solely movement and scale from the route.
    const veil = ctx.createLinearGradient(0, H * .40, 0, H);
    veil.addColorStop(0, "rgba(2,6,15,0)");
    veil.addColorStop(1, "rgba(2,6,15,.35)");
    ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
  }

  function drawGaiaOrbitBackground() {
    const space = SPRITES.flightSpace;
    // These independent illustrated layers are shared with the journey that
    // just arrived here. Without them the drawn sector sky is the fallback.
    if (!spriteReady(space) || !spriteReady(SPRITES.flightKit)) return false;
    const frame = chronosSceneryFrame();
    const progress = clamp(collected / level().goal, 0, 1);
    const travel = elapsed;
    ctx.fillStyle = "#020817"; ctx.fillRect(0, 0, W, H);
    const scale = Math.max(W / space.naturalWidth, H / space.naturalHeight) * 1.16;
    const width = space.naturalWidth * scale, height = space.naturalHeight * scale;
    const driftX = Math.sin(travel * .018) * Math.min(12, (width - W) * .35);
    const driftY = Math.sin(travel * .012) * Math.min(20, (height - H) * .35);
    ctx.save(); ctx.globalAlpha = .46;
    ctx.drawImage(space, (W - width) / 2 + driftX, (H - height) / 2 + driftY, width, height);
    ctx.restore();

    ctx.save(); ctx.globalCompositeOperation = "screen";
    const count = settings.effectsQuality === "low" ? 12 : 24;
    for (let index = 0; index < count; index++) {
      const depth = .25 + index % 4 * .18;
      const x = ((index * 149.13 - travel * depth * 1.2) % W + W) % W;
      const y = (index * 271.73 + travel * depth * 13) % H;
      ctx.globalAlpha = .12 + depth * .18; ctx.fillStyle = "#d3edff";
      ctx.fillRect(x, y, .6 + depth * .6, 1 + depth);
    }
    ctx.restore();

    const planet = chronosDestinationPresentation({visible: true, x: .78 - progress * .04,
      y: .065, scale: .90 + progress * .22, rotation: .06 + travel * .0003});
    drawChronosFlightSprite(2, planet);

    // Small, unarmed navigation relays orbit at a nearer depth. They are scenery,
    // never registered as enemies or colliders, and remain behind all combat.
    if (spriteReady(SPRITES.satellite)) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, frame.top, W, frame.height); ctx.clip();
      for (let index = 0; index < 2; index++) {
        const depth = (travel * .0045 + index * .53) % 1;
        const size = W * (.055 + depth * .055);
        const side = index ? 1 : -1;
        const x = W * (.5 + side * (.39 + .035 * depth));
        const y = frame.top + frame.height * (-.10 + 1.25 * depth);
        ctx.save(); ctx.translate(x, y); ctx.rotate(side * (.18 + travel * .035));
        ctx.globalAlpha = .64;
        ctx.drawImage(SPRITES.satellite, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.restore();
    }
    const readability = ctx.createLinearGradient(0, H * .40, 0, H);
    readability.addColorStop(0, "rgba(2,6,15,0)");
    readability.addColorStop(1, "rgba(2,6,15,.38)");
    ctx.fillStyle = readability; ctx.fillRect(0, 0, W, H);
    return true;
  }

  // Planeta animado del sector (pose pura de NeonCampaign.sectorPlanetPose):
  // 7 fotogramas de giro con fundido; sustituye a los fondos fijos.
  const SECTOR_PLANET_SPRITES = {volcanico: "planetVolcanico", glacial: "planetGlacial",
    violeta: "planetVioleta", tormentoso: "planetTormentoso"};
  function sectorPlanet() {
    if (typeof NeonCampaign.sectorPlanetPose !== "function") return null;
    const pose = NeonCampaign.sectorPlanetPose(currentLevel, elapsed, collected / Math.max(1, level().goal));
    const image = pose && SPRITES[SECTOR_PLANET_SPRITES[pose.key]];
    if (!image) return null;
    ensureSprite(image);
    return spriteReady(image) ? {pose, image} : null;
  }

  function drawSectorPlanet() {
    const planet = sectorPlanet();
    if (!planet) return;
    const {pose, image} = planet, cell = image.naturalWidth / 4, size = W * pose.size;
    const x = W * pose.x - size / 2, y = H * pose.y - size / 2;
    const draw = (frame, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, frame % 4 * cell, Math.floor(frame / 4) * cell, cell, cell, x, y, size, size);
    };
    const dim = pose.key === "volcanico" ? .62 : 1;
    ctx.save(); draw(pose.frame, dim); if (pose.blend > 0) draw(pose.next, pose.blend * dim); ctx.restore();
  }

  // Planeta propio de una ficha (p. ej. Vulkar en el sector 2): atlas de 7
  // fotogramas de giro con fundido, en la posición y escala de la ruta.
  function drawVoyagePlanet(node) {
    const key = typeof classicSideVoyage === "undefined" ? null : classicSideVoyage?.ficha.planet;
    if (!key || !node?.visible) return false;
    const image = SPRITES[SECTOR_PLANET_SPRITES[key]];
    if (!image) return false;
    ensureSprite(image);
    if (!spriteReady(image)) return true;
    const position = elapsed / .9, frame = Math.floor(position) % 7, blend = position % 1;
    const cell = image.naturalWidth / 4, size = W * node.scale;
    // El planeta rojo de Vulkar va atenuado: disparos y lava se leen encima.
    const dim = key === "volcanico" ? .62 : 1;
    ctx.save(); ctx.translate(node.x * W, node.y * H); ctx.rotate(node.rotation || 0);
    for (const [index, alpha] of [[frame, (node.alpha ?? 1) * dim], [(frame + 1) % 7, (node.alpha ?? 1) * dim * blend]]) {
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, index % 4 * cell, Math.floor(index / 4) * cell, cell, cell, -size / 2, -size / 2, size, size);
    }
    ctx.restore();
    return true;
  }

  function drawVulkarOrbitBackground() {
    const planet=SPRITES.vulkarOrbitPlanet;
    ensureSprite(planet);
    const progress=clamp(collected/level().goal,0,1);
    // The planet uses played time: pause and backgrounding freeze this view.
    if(spriteReady(planet)) {
      const size=W*(.88+progress*.22);
      const x=W*(.89-progress*.06)+Math.sin(elapsed*.035)*6;
      const y=H*(.17+progress*.04)+Math.sin(elapsed*.021)*10;
      ctx.save();ctx.translate(x,y);ctx.rotate(-.14+elapsed*.0015);
      ctx.drawImage(planet,-size/2,-size/2,size,size);ctx.restore();
    }
    // Illustrated orbital fragments cross at a nearer depth. They are scenery,
    // do not share the threat list and cannot inflict invisible collision damage.
    const fragment=SPRITES.meteorSmall || frameFrom("meteor",0);
    if(fragment && spriteReady(fragment))for(let i=0;i<4;i++) {
      const cycle=(elapsed*(9+i*2)+i*371)%(H+160);
      const size=18+i*10,x=(i%2?W*.91:W*.07)+Math.sin(i*2.3+elapsed*.04)*18;
      ctx.save();ctx.globalAlpha=.5;ctx.translate(x,cycle-80);ctx.rotate(i+elapsed*(.03+i*.008));
      ctx.drawImage(fragment,-size/2,-size/2,size,size);ctx.restore();
    }
  }

  function background(t) {
    if (classicFlightView) { drawChronosFlightBackground(); return; }
    if(currentLevel===1 && drawGaiaOrbitBackground()) {return;}
    const lv = level();
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, lv.top);
    gradient.addColorStop(0.42, lv.mid);
    gradient.addColorStop(0.78, "#050712");
    gradient.addColorStop(1, "#02030a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // NEON VISUAL PASS: broad animated nebula ribbons replace the flat empty void.
    // Deterministic phase by sector, bounded gradients, no additional image downloads.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const sectorHue = [195, 220, 28, 265, 355, 280, 175, 30, 250, 325][currentLevel] ?? 195;
    const visualTier = settings.effectsQuality === "low" ? 1 : 3;
    for (let ribbon = 0; ribbon < visualTier; ribbon++) {
      const phase = t * (0.00006 + ribbon * 0.000018) + currentLevel * 1.41 + ribbon * 2.3;
      const cx = W * (0.52 + Math.sin(phase) * 0.31);
      const cy = H * (0.22 + ribbon * 0.19 + Math.cos(phase * 0.8) * 0.075);
      const radius = W * (0.49 + ribbon * 0.11);
      const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const hue = (sectorHue + ribbon * 34) % 360;
      cloud.addColorStop(0, `hsla(${hue},95%,57%,0.18)`);
      cloud.addColorStop(0.35, `hsla(${hue},90%,43%,0.075)`);
      cloud.addColorStop(1, `hsla(${hue},80%,30%,0)`);
      ctx.fillStyle = cloud;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();


    // Start the authored VFX download while the level is still in its menu;
    // the scripted reactor accident happens thirty-one seconds into play.
    if (currentLevel === 0) ensureSprite(SPRITES.chronosShockwave);

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const nebula = ctx.createRadialGradient(W * 0.5, H * 0.27, 0, W * 0.5, H * 0.27, W * 0.78);
    nebula.addColorStop(0, lv.accent + "42");
    nebula.addColorStop(0.28, lv.accent + "15");
    nebula.addColorStop(1, "#0000");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, W, H);

    // Capa lejana: puntos diminutos, lentos y con un parpadeo apenas visible.
    for (const star of stars) {
      const streak = visualSpeed > 2.4 ? Math.min(18, (visualSpeed - 2.2) * star.layer * 3.8) : 0;
      ctx.globalAlpha = star.a * (0.70 + 0.30 * Math.sin(t * 0.001 + star.x));
      ctx.fillStyle = star.tint;
      ctx.beginPath();
      if (streak > 1) ctx.roundRect(star.x - star.r * 0.5, star.y - streak, Math.max(0.7, star.r), streak + star.r, star.r);
      else ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Vulkar: el planeta va sobre el cielo dibujado (ya no hay imagen de fondo).
    if (currentLevel === 2) drawVulkarOrbitBackground();
    drawSectorPlanet();
    drawSectorEnvironment(t, lv);

    // Capa media: polvo y restos minúsculos con una deriva independiente.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const dust of spaceDust) {
      ctx.globalAlpha = dust.a;
      ctx.fillStyle = Math.floor(dust.x + dust.y) % 3 ? lv.accent : "#b5c8dd";
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Primer plano: partículas escasas, rápidas y suavizadas por glow.
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.shadowBlur = 12;
    ctx.shadowColor = lv.accent;
    for (const mote of foregroundParticles) {
      ctx.globalAlpha = mote.a * (state === "playing" ? 1 : 0.45);
      ctx.fillStyle = "#dffcff";
      ctx.beginPath();
      ctx.ellipse(mote.x, mote.y, mote.r * 0.55, mote.r * (1.2 + Math.min(2.2, visualSpeed * 0.3)), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.46, W * 0.2, W * 0.5, H * 0.46, W * 0.95);
    vignette.addColorStop(0.6, "#0000");
    vignette.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    if (currentLevel === 0 && levelOneShockwave > 0) {
      const progress = clamp(1 - levelOneShockwave / 0.62, 0, 1);
      const sx = W * 0.50;
      const sy = H * 0.40;
      const strength = Math.sin(progress * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const size = Math.min(W, H) * (0.36 + progress * 1.45);
      ctx.globalAlpha = strength * 0.62;
      if (spriteReady(SPRITES.chronosShockwave)) {
        const atlas = SPRITES.chronosShockwave;
        const cellWidth = atlas.naturalWidth / 2;
        const cellHeight = atlas.naturalHeight / 2;
        const frame = Math.min(3, Math.floor(progress * 4));
        ctx.drawImage(atlas, (frame % 2) * cellWidth, Math.floor(frame / 2) * cellHeight,
          cellWidth, cellHeight, sx - size / 2, sy - size / 2, size, size);
      } else if (spriteReady(SPRITES.shieldEffect)) {
        // A short-lived fallback if the atlas is still downloading.
        ctx.drawImage(SPRITES.shieldEffect, sx - size / 2, sy - size / 2, size, size);
      }
      ctx.restore();
    }

    if (stormPulse > 0 && !settings.reduceEffects) {
      ctx.fillStyle = `rgba(255,255,255,${stormPulse * 0.28})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawWarp() {
    if (warpTimer <= 0) return;
    const progress = clamp(1 - warpTimer / 1.25, 0, 1);
    const intensity = Math.sin(progress * Math.PI);
    const centerX = W * 0.5;
    const centerY = H * 0.42;
    const count = settings.effectsQuality === "high" ? 30 : settings.effectsQuality === "normal" ? 23 : 14;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = level().accent;
    ctx.shadowColor = level().accent;
    ctx.shadowBlur = 8;
    ctx.lineCap = "round";
    for (let index = 0; index < count; index++) {
      const angle = index * 2.3999632297 + (index % 3) * 0.19;
      const seed = ((index * 37) % count) / count;
      const travel = (seed + progress * (0.72 + (index % 5) * 0.035)) % 1;
      const radius = 42 + Math.pow(travel, 1.65) * Math.max(W, H) * 0.72;
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);
      const x = centerX + directionX * radius;
      const y = centerY + directionY * radius;
      const length = 5 + travel * travel * 38;
      ctx.globalAlpha = intensity * (0.12 + travel * 0.42);
      ctx.lineWidth = 0.8 + travel * 1.4;
      ctx.beginPath();
      ctx.moveTo(x - directionX * length, y - directionY * length);
      ctx.lineTo(x + directionX * length * 0.18, y + directionY * length * 0.18);
      ctx.stroke();
    }
    ctx.globalAlpha = intensity * 0.34;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24 + progress * 74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Pasillo seguro de la lluvia de cometas (auditoría J04): franja cian muy
  // tenue y dos guías discontinuas desde la mitad de la pantalla. Sin brillo,
  // para que no compita con las amenazas; con efectos reducidos, quieta.
  function drawCometCorridor(t) {
    if (state !== "playing" && state !== "paused" || !cometShowerActive()) return;
    const c = classicCometCorridor.corridor;
    ctx.save();
    ctx.fillStyle = "rgba(161,238,232,.05)";
    ctx.fillRect(c.left, c.top, c.width, H - c.top);
    ctx.strokeStyle = "rgba(161,238,232,.38)";
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.lineDashOffset = settings.reduceEffects ? 0 : -(t / 40) % 32;
    ctx.beginPath();
    ctx.moveTo(c.left, c.top); ctx.lineTo(c.left, H);
    ctx.moveTo(c.right, c.top); ctx.lineTo(c.right, H);
    ctx.stroke();
    ctx.restore();
  }

  function drawTractorCable() {
    if (powers.tractor <= 0 || !tractorTarget) return;
    const startX = player.x;
    const startY = player.y - SHIP_VISUAL.tractorMuzzleOffset;
    const dx = tractorTarget.x - startX;
    const dy = tractorTarget.y - startY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const frame = frameFrom("tractor", Math.floor(elapsed * 13));
    const intensity = clamp(1 - distance / 430, 0.25, 1);
    const targetWidth = Math.max(20, tractorTarget.r * 1.25);

    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "screen";
    ctx.shadowBlur = 18 + intensity * 18;
    ctx.shadowColor = "#45eaff";

    const volume = ctx.createLinearGradient(0, 0, distance, 0);
    volume.addColorStop(0, `rgba(210,255,255,${0.18 + intensity * 0.18})`);
    volume.addColorStop(0.48, `rgba(57,225,255,${0.08 + intensity * 0.12})`);
    volume.addColorStop(1, `rgba(102,137,255,${0.22 + intensity * 0.16})`);
    ctx.fillStyle = volume;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(distance, -targetWidth);
    ctx.lineTo(distance, targetWidth);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(distance, -targetWidth); ctx.lineTo(distance, targetWidth); ctx.lineTo(0, 9); ctx.closePath();
    ctx.clip();
    for (let index = 0; index < 13; index++) {
      const travel = (elapsed * (0.82 + intensity * 0.55) + index / 13) % 1;
      const x = distance * (1 - travel);
      const spread = 6 + (x / Math.max(1, distance)) * targetWidth * 0.72;
      const y = Math.sin(index * 2.43 + elapsed * 7.5) * spread;
      ctx.globalAlpha = 0.22 + intensity * 0.55;
      ctx.fillStyle = index % 3 ? "#7df5ff" : "#ffffff";
      ctx.beginPath(); ctx.arc(x, y, 1.4 + intensity * 1.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = `rgba(210,255,255,${0.22 + intensity * 0.42})`;
    ctx.lineWidth = 1.2 + intensity;
    for (let arc = 0; arc < 2; arc++) {
      ctx.beginPath();
      for (let segment = 0; segment <= 8; segment++) {
        const x = distance * segment / 8;
        const y = Math.sin(elapsed * 18 + segment * 2.2 + arc * 3.1) * (4 + x / Math.max(1, distance) * targetWidth * 0.34);
        if (segment) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    if (frame) {
      ctx.globalAlpha = 0.18 + intensity * 0.16;
      ctx.drawImage(frame, 0, -targetWidth, distance, targetWidth * 2);
    } else {
      ctx.strokeStyle = "#55eaff";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -elapsed * 60;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(distance, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.58 + intensity * 0.35;
    ctx.fillStyle = "#eaffff";
    ctx.beginPath(); ctx.arc(0, 0, 5 + intensity * 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // Image-backed artwork. The simulation, not the render clock, selects poses.
  const ATLAS_FRAME_PIVOTS = Array.from({length:8},()=>[256,256]);
  const ATLAS_VFX_CROPS = [[120,0,280,680],[546,0,298,725],[837,65,700,600],[1540,0,630,635]];

  function drawAtlasVfx(index, width, height, alpha = 1, head = .5) {
    if (!spriteReady(SPRITES.atlasVfx)) return false;
    const source = ATLAS_VFX_CROPS[index];
    const sx = SPRITES.atlasVfx.naturalWidth / 2170;
    const sy = SPRITES.atlasVfx.naturalHeight / 725;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.drawImage(SPRITES.atlasVfx, source[0] * sx, source[1] * sy, source[2] * sx, source[3] * sy, -width / 2, -height * head, width, height);
    ctx.restore(); return true;
  }

  function drawAtlasProjectile(item) {
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.rotate(Math.atan2(item.vy || 1, item.vx || 0) + Math.PI / 2);
    // Los orbes de la Ruptura Crono se dibujan mayores; su colisión no cambia.
    const size = item.fulminant ? 80 : 64;
    if (!drawHostileOrdnance(item, 2, size)) drawAtlasVfx(0, 27, size + 4, 1, .90);
    ctx.restore();
  }

  // The illustrated core and its short wake share the physics pivot. No aim
  // line, predicted landing point or additional update clock is drawn.
  // El disparo básico enemigo (fila 0) era azul-cian, igual que los del
  // jugador. Se recolorea una sola vez a rojo hostil en un lienzo aparte con
  // la misma disposición; si no se puede (sin DOM), se usa el original.
  let hostileScoutTint = null;
  function hostileOrdnanceSource(atlas, row) {
    if (row !== 0) return atlas;
    if (hostileScoutTint?.source === atlas) return hostileScoutTint.canvas || atlas;
    hostileScoutTint = { source: atlas, canvas: null };
    try {
      const width = atlas.naturalWidth, cell = width / 4;
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = cell;
      const tint = canvas.getContext("2d");
      tint.drawImage(atlas, 0, 0, width, cell, 0, 0, width, cell);
      const pixels = tint.getImageData(0, 0, width, cell), data = pixels.data;
      for (let index = 0; index < data.length; index += 4) {
        const red = data[index], green = data[index + 1], blue = data[index + 2];
        data[index] = blue;
        data[index + 1] = green * .32;
        data[index + 2] = Math.min(255, red * .55 + green * .25);
      }
      tint.putImageData(pixels, 0, 0);
      hostileScoutTint.canvas = canvas;
    } catch {
      // Sin lienzo disponible: se mantiene el arte original.
    }
    return hostileScoutTint.canvas || atlas;
  }

  function drawHostileOrdnance(item, row = 0, size = 52) {
    const atlas = SPRITES.hostileOrdnance;
    if (!spriteReady(atlas)) return false;
    const age = Number.isFinite(item.life) ? Math.max(0, 6 - item.life) : 0;
    const cell = atlas.naturalWidth / 4;
    const frame = Math.floor(age * (row === 2 ? 10 : 12)) % 4;
    // La copia recoloreada solo contiene la fila 0, así que su recorte empieza en y=0.
    const source = hostileOrdnanceSource(atlas, row);
    ctx.drawImage(source, frame * cell, source === atlas ? row * cell : 0, cell, cell,
      -size / 2, -size / 2, size, size);
    return true;
  }

  function drawSalvagePickup(item) {
    if (!spriteReady(SPRITES.hostileOrdnance)) return;
    const atlas = SPRITES.hostileOrdnance, cell = atlas.naturalWidth / 4;
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.globalAlpha *= Math.min(1, Math.max(0, item.life ?? 1));
    ctx.rotate(Math.sin((item.p || 0) * .5) * .18);
    // Early drops are raw scrap. Silver, gold and stellar coins are reserved
    // for their actual denominations, never used to mislabel a nine-scrap drop.
    const size = item.bossSalvage ? 56 : 38;
    ctx.drawImage(atlas, 0, cell * 3, cell, cell, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawArcadePulse(kind, age = 0, size = 72, alpha = 1) {
    const gaiaReady = spriteReady(SPRITES.gaiaPulse);
    const atlas = gaiaReady ? SPRITES.gaiaPulse : SPRITES.arcadePulse;
    if (!spriteReady(atlas)) return false;
    const row = kind === "impact" ? 3 : kind === "lance" ? 2 : kind === "twin" ? 1 : 0;
    const frame = gaiaReady ? (kind === "impact" ? Math.min(3, Math.floor(age * 16)) : Math.floor(age * 12) % 4)
      : kind === "impact" ? (age < .035 ? 0 : age < .09 ? 1 : age < .165 ? 2 : 3)
      : Math.floor(age / (row === 0 ? .06 : row === 1 ? .05 : .055)) % 4;
    const cell=atlas.naturalWidth/4;
    ctx.save();ctx.globalAlpha*=alpha;
    ctx.drawImage(atlas,frame*cell,row*cell,cell,cell,-size/2,-size/2,size,size);
    ctx.restore();return true;
  }

  function drawClassicProjectiles() {
    if (!classicWeapons) return;
    for (const shot of classicWeapons.projectiles) {
      ctx.save(); ctx.translate(shot.x, shot.y);
      ctx.rotate(Math.atan2(shot.vy, shot.vx) + Math.PI / 2);
      const age = shot.duration - shot.life;
      if(shot.weapon==="missile" && spriteReady(SPRITES.chapterMissile)) {
        const atlas=SPRITES.chapterMissile,cell=atlas.naturalWidth/4;
        // Launch hardware stays on the ship. Only the authored flying missile
        // row travels with this physical projectile, including its first frame.
        const frame=Math.floor(age*14)%4,size=54;
        ctx.drawImage(atlas,frame*cell,0,cell,cell,-size/2,-size/2,size,size);
      } else if(shot.weapon==='needle') {
        // The authored high-energy lance is compressed into a slender rail
        // pulse; the physics, penetration and cooldown belong to Aguja.
        ctx.scale(.48,1.28);drawArcadePulse('lance',age,80);
      } else if(shot.weapon==='scatter') {
        ctx.scale(.82,.72);drawArcadePulse('twin',age,66);
      } else if(!drawArcadePulse(shot.weapon,age,shot.weapon === "lance" ? 88 : 72))
        drawAtlasVfx(1,shot.weapon === "twin" ? 16 : 23,68,1,.5);
      ctx.restore();
    }
  }

  function drawFlightModule(item) {
    if (!spriteReady(SPRITES.flightWeapons)) return;
    const atlas = SPRITES.flightWeapons;
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.globalAlpha *= itemVisualAlpha(item);
    ctx.rotate(Math.sin(elapsed * .8 + (item.p || 0)) * .08);
    // A small navigation halo identifies a recoverable object. The object
    // itself is the authored hardware, not an icon substituted for the part.
    ctx.strokeStyle = "rgba(255,208,123,.75)"; ctx.lineWidth = 2;
    ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.arc(0, 0, 47, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.drawImage(atlas, 0, 0, atlas.naturalWidth / 3, atlas.naturalHeight,
      -64, -78, 128, 128);
    ctx.restore();
  }

  function hasClassicTwinMounts() {
    // Some isolated render fixtures deliberately do not install campaign UI.
    return typeof classicEquipment !== "undefined" &&
      (["twin","lance"].includes(classicEquipment.selected) || classicEquipment.twinPrepared === true);
  }

  function classicTwinFrame() {
    const cooldown = atlasBoss ? manualShotCooldown : classicWeapons?.cooldown || 0;
    if (cooldown > .10) return 2;
    if (classicWeapons && classicWeapons.charges < 20 && classicWeapons.recharge > .10) return 1;
    return 0;
  }

  function drawClassicTwinMounts(target, frame = 0) {
    const atlas = SPRITES.flightWeapons;
    if (!spriteReady(atlas)) return false;
    const frameWidth = atlas.naturalWidth / 3;
    // All three poses share the same manufactured mount: roots +/-102,116;
    // muzzles +/-102,-134. The hull and wing layers cover the attachment roots.
    target.drawImage(atlas, frame * frameWidth, 0, frameWidth, atlas.naturalHeight,
      -256, -324, 512, 512);
    return true;
  }

  // Satélite CH-03 (plan F3c). Celdas de la hoja: 0 reposo, 1-2 carga y rayo,
  // 3 cañones, 4 láseres cruzados, 5 rejilla, 6 dañado, 7 destruido.
  function drawCh03Satellite() {
    if (typeof ch03Boss === "undefined" || !ch03Boss) return;
    const boss = ch03Boss, size = 300;
    if (boss.attack === "grid" && boss.grid && boss.state === "attack") {
      // Columnas de la rejilla: aviso tenue, láser encendido brillante; la segura, libre.
      const column = W / boss.grid.columns;
      ctx.save();
      for (let c = 0; c < boss.grid.columns; c++) {
        if (c === boss.grid.safe) continue;
        ctx.fillStyle = boss.grid.active ? "rgba(255,70,90,.42)" : "rgba(255,120,120,.12)";
        ctx.fillRect(c * column + 6, boss.y, column - 12, H - boss.y);
      }
      ctx.restore();
    }
    if (boss.attack === "sweep" && boss.beam?.active && boss.state === "attack") {
      ctx.save(); ctx.translate(boss.x, boss.y); ctx.rotate(-boss.beam.angle);
      ctx.fillStyle = "rgba(255,60,80,.85)"; ctx.shadowBlur = 22; ctx.shadowColor = "#ff2d45";
      ctx.fillRect(-NeonCampaign.CH03_RULES.sweep.width / 2, 0, NeonCampaign.CH03_RULES.sweep.width, H * 1.5);
      ctx.fillStyle = "rgba(255,240,240,.9)"; ctx.fillRect(-4, 0, 8, H * 1.5);
      ctx.restore();
    }
    if (!spriteReady(SPRITES.ch03)) return;
    const cell = boss.state === "defeated" ? (boss.stateTime < .5 ? 6 : 7)
      : boss.state === "warning" ? (boss.attack === "ring" ? 3 : boss.attack === "grid" ? 4 : 1)
      : boss.state === "attack" ? (boss.attack === "sweep" ? 2 : boss.attack === "ring" ? 3 : 5)
      : boss.hp <= boss.maxHp * .35 ? 6 : 0;
    ctx.save(); ctx.translate(boss.x, boss.y);
    drawGaiaCell(SPRITES.ch03, 4, cell, size);
    ctx.restore();
  }

  function drawGuardianAtlas() {
    if (!atlasBoss || !spriteReady(SPRITES.guardianAtlas)) return;
    const boss = atlasBoss;
    // Gaia's illuminated cloud deck can erase the white outer armour. A soft,
    // bounded shadow separates that silhouette while retaining the moving
    // landscape; the reactor remains exactly on the simulation's x/y pivot.
    const separationRadius = (boss.visualSize || 350) * .65;
    ctx.save();
    const separation = ctx.createRadialGradient(boss.x, boss.y, 0,
      boss.x, boss.y, separationRadius);
    separation.addColorStop(0, "rgba(2,8,22,.66)");
    separation.addColorStop(.62, "rgba(2,8,22,.50)");
    separation.addColorStop(1, "rgba(2,8,22,0)");
    ctx.fillStyle = separation;
    ctx.fillRect(boss.x - separationRadius, boss.y - separationRadius,
      separationRadius * 2, separationRadius * 2);
    ctx.restore();
    if (boss.state === "charge" && boss.telegraph) {
      // Charge belongs to the barrels. Do not reveal a solved escape lane or
      // paint the player's future safe position onto the arena.
      for(const side of [-1,1]) {
        const artSize=(boss.visualSize||350)*1.25;
        ctx.save();ctx.translate(boss.x+side*artSize*.25,boss.y+artSize*(327/512-.5));
        drawAtlasVfx(3,48,48,.45+boss.telegraph.progress*.5);ctx.restore();
      }
    }
    // Furia (plan F3c): hoja propia de 4 poses (anillo roto, carga,
    // Fulminante, derrota), centrada en el mismo núcleo. La pose 2 no se usa:
    // su haz cae recto y el rayo del juego barre media pantalla. Con el núcleo
    // abriéndose, expuesto o cerrándose se usa la animación normal, que lo muestra.
    if (boss.phase === 2 && spriteReady(SPRITES.atlasFury) && !["opening", "exposed", "closing"].includes(boss.state)) {
      const pose = boss.disabled ? 3 : atlasBeam || boss.state === "charge" ? 1 : 0;
      const sheet = SPRITES.atlasFury, cell = sheet.naturalWidth / 4, size = (boss.visualSize || 350) * 1.25;
      ctx.drawImage(sheet, pose * cell, 0, cell, sheet.naturalHeight, boss.x - size / 2, boss.y - size / 2, size, size);
      return;
    }
    const animation = NeonCampaign.guardianAtlasAnimation(boss);
    const frameWidth = SPRITES.guardianAtlas.naturalWidth / 4;
    const frameHeight = SPRITES.guardianAtlas.naturalHeight / 2;
    // V2 adds actual transparent gutters: compensate only the artboard size,
    // keeping the model's reactor position, radius and combat geometry intact.
    const size = (boss.visualSize || 350)*1.25;
    const paint = (frame, alpha) => {
      if (alpha <= 0) return;
      const pivot = ATLAS_FRAME_PIVOTS[frame];
      ctx.save(); ctx.globalAlpha *= alpha;
      ctx.drawImage(SPRITES.guardianAtlas, (frame % 4) * frameWidth, Math.floor(frame / 4) * frameHeight,
        frameWidth, frameHeight,
        boss.x - size * pivot[0] / 512, boss.y - size * pivot[1] / 512, size, size);
      ctx.restore();
    };
    if (animation.previousFrame !== null) paint(animation.previousFrame, 1 - animation.blend);
    paint(animation.frame, animation.blend);
  }

  // Fondo oscurecido mientras Atlas está en furia.
  function drawAtlasFuryScene() {
    if (!atlasFuryScene) return;
    ctx.save(); ctx.fillStyle = "rgba(12,0,6,.42)"; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // Fulminante: una cuña que sale del núcleo y, a la altura de la nave, cubre
  // la mitad que daña. Al cargar parpadea su contorno; al disparar arde
  // (amenaza = cálido, DESIGN §9.1).
  function drawAtlasBeam() {
    const band = atlasBeam || atlasBeamWarning;
    if (!band || !atlasBoss) return;
    const top = atlasBoss.y, mouth = 26;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(atlasBoss.x - mouth, top); ctx.lineTo(atlasBoss.x + mouth, top);
    ctx.lineTo(band.x1, H); ctx.lineTo(band.x0, H); ctx.closePath();
    if (atlasBeam) {
      const glow = ctx.createLinearGradient(band.x0, 0, band.x1, 0);
      glow.addColorStop(0, "rgba(255,50,40,.35)"); glow.addColorStop(.5, "rgba(255,226,200,.9)"); glow.addColorStop(1, "rgba(255,50,40,.35)");
      ctx.globalAlpha = .78 + .22 * Math.sin(elapsed * 40);
      ctx.shadowBlur = 30; ctx.shadowColor = "#ff3b2f"; ctx.fillStyle = glow; ctx.fill();
    } else {
      ctx.globalAlpha = .16 + .16 * Math.abs(Math.sin(elapsed * 10)); ctx.fillStyle = "#ff3b3b"; ctx.fill();
      ctx.globalAlpha = .9; ctx.strokeStyle = "#ff6b5c"; ctx.lineWidth = 4; ctx.setLineDash([18, 12]); ctx.stroke();
    }
    ctx.restore();
  }

  // Authored component crops share explicit mounting coordinates, not icon offsets.
  function drawShipComponent(target, loadout, part) {
    const atlas = SPRITES.modularShip;
    if (!spriteReady(atlas)) return false;
    const frame = NeonCampaign.shipPartFrame(loadout, part);
    const source = frame.source, destination = frame.destination;
    const sx = atlas.naturalWidth / frame.sourceWidth;
    const sy = atlas.naturalHeight / frame.sourceHeight;
    if (part === "flames") {
      for (const plume of frame.plumes) {
        const crop=plume.source,mount=plume.destination;
        target.drawImage(atlas,crop.x*sx,crop.y*sy,crop.width*sx,crop.height*sy,
          mount.x,mount.y,mount.width,mount.height);
      }
      return true;
    }
    target.drawImage(atlas, source.x * sx, source.y * sy, source.width * sx, source.height * sy,
      destination.x, destination.y, destination.width, destination.height);
    return true;
  }

  function drawModularShip(target, loadout, size, time, steering = 0, health = 100, impact = 0, weaponFrame = null, bankStrength=1,reinforcement=0) {
    if (!spriteReady(SPRITES.modularShip)) return false;
    const pose = NeonCampaign.shipAssemblyPose({elapsedSeconds: time, steering, hull: health, impactSeconds: impact,bankStrength});
    target.save();
    target.scale(size / 512, size / 512);
    target.rotate(pose.bankRotation);
    target.scale(pose.bankScaleX, 1);
    // Exhaust stretches from the nozzle, never from the centre of the ship.
    const nozzles=typeof NeonCampaign.shipNozzleAnchors==="function"?NeonCampaign.shipNozzleAnchors(loadout):[{y:173}];
    const nozzleY=nozzles.reduce((sum,point)=>sum+point.y,0)/nozzles.length;
    target.save(); target.translate(0, nozzleY);
    target.scale(1, pose.enginePulse); target.translate(0, -nozzleY);
    drawShipComponent(target, loadout, "flames"); target.restore();
    if (weaponFrame !== null) drawClassicTwinMounts(target, weaponFrame);
    // A small articulated sweep pivots at each root, underneath the fuselage.
    for (const side of [-1, 1]) {
      target.save();
      target.beginPath(); target.rect(side < 0 ? -512 : 0, -512, 512, 1024); target.clip();
      target.translate(side * 52, -35); target.rotate(side * pose.wingSweep);
      target.translate(-side * 52, 35);
      drawShipComponent(target, loadout, "wings"); target.restore();
    }
    drawShipComponent(target, loadout, "engines");
    drawShipComponent(target, loadout, "hull");
    if(reinforcement>0) {
      // The reinforcement is part of the existing wing plating, not a floating
      // shield bubble. A material flash marks absorbed damage on those panels.
      target.save();target.globalCompositeOperation="screen";
      target.globalAlpha*=Math.min(.5,reinforcement);
      drawShipComponent(target,loadout,"wings");target.restore();
    }
    target.restore();
    return true;
  }

  function syncShipPresentation() {
    const twin = hasClassicTwinMounts();
    if (shipPresentationSignature?.mode === shipRenderMode && shipPresentationSignature?.loadout === shipLoadout &&
      shipPresentationSignature?.twin === twin) return;
    if (twin && !spriteReady(SPRITES.flightWeapons)) return;
    let source = "assets/player_ship_identity_v1.webp";
    if (spriteReady(SPRITES.modularShip)) {
      const preview = document.createElement("canvas"); preview.width = preview.height = 384;
      const previewContext = preview.getContext("2d");
      previewContext.translate(192, 170);
      drawModularShip(previewContext, shipLoadout, 330, 0, 0, 100, 0, twin ? 0 : null);
      source = preview.toDataURL("image/png");
    }
    document.querySelectorAll(".menu-ship-image, .briefing-ship").forEach(image => { image.src = source; });
    // A missing atlas must remain retryable; the portrait is only degradation.
    if (spriteReady(SPRITES.modularShip)) shipPresentationSignature = {mode: shipRenderMode, loadout: shipLoadout, twin};
  }

  function drawShipIdentityFallback(target, size) {
    if (!spriteReady(SPRITES.shipIdentity)) return false;
    // Exported from the same assembly: 512x640, hull pivot at (256,256).
    target.drawImage(SPRITES.shipIdentity, -size / 2, -size / 2, size, size * 1.25);
    return true;
  }

  function drawClassicDock(t) {
    if (!ui.flightDockCanvas || !ui.flightDock?.classList.contains("show")) return;
    const preview = ui.flightDockCanvas;
    const target = preview.getContext("2d");
    target.clearRect(0, 0, preview.width, preview.height);
    const servicing=flightDockReturn==="voyage"&&spriteReady(SPRITES.c9Station);
    if(servicing) {
      const image=SPRITES.c9Station,cellWidth=image.naturalWidth/2,cellHeight=image.naturalHeight/2;
      // Service pose, with the bay facing the real modular hull. No second
      // station clock: the stopped route owns the docking state.
      target.drawImage(image,0,cellHeight,cellWidth,cellHeight,71,-8,242,242);
    }
    const size=servicing?165:270;
    target.save(); target.translate(preview.width / 2, servicing?218:preview.height * .49);
    const twin = hasClassicTwinMounts();
    const assembled = drawModularShip(target, shipLoadout, size, t / 1000, 0, 100, 0, twin ? 0 : null);
    if (!assembled) {
      target.save(); target.scale(size / 512, size / 512);
      if (twin) drawClassicTwinMounts(target, 0);
      target.restore();
      drawShipIdentityFallback(target, size);
    }
    target.restore();
  }

  function drawShipHangar(t) {
    const preview = $("shipHangarCanvas");
    if (preview && $("shipHangar")?.classList.contains("show") && shipHangarDraft) {
      const target = preview.getContext("2d"); target.clearRect(0, 0, 512, 512);
      target.save(); target.translate(256, 224);
      const atlasUnavailable = !spriteReady(SPRITES.modularShip);
      $("shipAtlasNotice")?.classList.toggle("hidden", !atlasUnavailable);
      $("shipApply").disabled = atlasUnavailable;
      if (atlasUnavailable) {
        drawShipIdentityFallback(target, 350);
      } else {
        drawModularShip(target, shipHangarDraft.loadout, 380, t / 1000, Math.sin(t / 2000) * .32);
      }
      target.restore();
    }
  }

  function playerFrameState(t) {
    const desiredDelta = hull < 34 || state === "destroying" ? 0 : player.target + player.drift - player.x;
    const movingHard = Math.abs(desiredDelta) > 72;
    const moving = Math.abs(desiredDelta) > 16;
    let frameIndex;
    let flipX = false;

    if (hull < 34 || state === "destroying") {
      // El estado crítico y la destrucción usan una nave neutra para impedir que
      // una reacción de impacto quede congelada.
      frameIndex = 2;
    } else if (impactReactionTimer > 0) {
      // El frame 5 se usa solo durante la reacción breve de daño. Su orientación
      // sigue el lado golpeado y se cancela al reiniciar, continuar o agotarse.
      frameIndex = 5;
      flipX = impactReactionSide < 0;
    } else if (movingHard) {
      frameIndex = 4;
      flipX = desiredDelta > 0;
    } else if (moving) {
      frameIndex = 3;
      flipX = desiredDelta > 0;
    } else {
      const idleSequence = [0, 1, 2, 1];
      frameIndex = idleSequence[Math.floor(t / 115) % idleSequence.length];
    }

    return { frameIndex, flipX };
  }

  function drawPlayer(t) {
    if (state === "destroying" && !playerVisible) return;
    // El inicio de Chronos es una animación: la nave no se ve hasta que acaba.
    if (typeof classicChapterControlsLocked === "function" && classicChapterControlsLocked()) return;
    const entry = typeof classicShipEntry === "number" && classicShipEntry > 0 ? classicShipEntry / .9 : 0;

    ctx.save();
    // Gracia sin daño (al reanudar y tras un golpe): la nave parpadea para que
    // se note; con efectos reducidos queda fija y algo transparente.
    if (state === "playing" && typeof hullGrace === "number" && hullGrace > 0)
      ctx.globalAlpha = settings.reduceEffects ? .6 : Math.sin(t * .05) > 0 ? .4 : 1;
    ctx.translate(player.x, player.y + (entry ? entry * entry * H * .35 : 0));

    const shipScale=SHIP_VISUAL.classicScale??1,assemblySize=SHIP_VISUAL.assemblySize??208;
    const bob = state === "destroying" ? 0 : Math.sin(t * 0.004) * 1.8*shipScale;

    ctx.save(); ctx.translate(0, bob + SHIP_VISUAL.centerYOffset);
    const steering=Number.isFinite(player.visualBank)?player.visualBank:clamp((player.target+player.drift-player.x)/95,-1,1);
    const reserve=typeof classicHullReserve==="number"&&classicHullReserve>0
      ?.08+(typeof classicShieldImpact==="number"?classicShieldImpact:0):0;
    const assembled = drawModularShip(ctx, shipLoadout, assemblySize, elapsed,
      steering, hull, impactReactionTimer,hasClassicTwinMounts()?classicTwinFrame():null,
      SHIP_VISUAL.bankStrength??1,reserve);
    ctx.restore();
    if (!assembled) {
    ctx.save();
    const criticalJitter = hull < 18 && state !== "destroying" ? Math.sin(elapsed * 19) * 1.6*shipScale : 0;
    ctx.translate(criticalJitter, bob + SHIP_VISUAL.centerYOffset);
    if (hasClassicTwinMounts()) {
      ctx.save(); ctx.scale(assemblySize / 512, assemblySize / 512);
      drawClassicTwinMounts(ctx, classicTwinFrame()); ctx.restore();
    }
    if (!drawShipIdentityFallback(ctx, assemblySize)) {
        ctx.save();
        ctx.scale(SHIP_VISUAL.scale, SHIP_VISUAL.scale);
        const body = ctx.createLinearGradient(-75, -55, 75, 55);
        body.addColorStop(0, "#325ee0");
        body.addColorStop(0.48, "#79e7ff");
        body.addColorStop(1, "#7040e8");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(0, -72); ctx.lineTo(34, -24); ctx.lineTo(88, 18); ctx.lineTo(48, 38);
        ctx.lineTo(0, 52); ctx.lineTo(-48, 38); ctx.lineTo(-88, 18); ctx.lineTo(-34, -24);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }
    ctx.restore();

    }

    if(classicWeapons && classicWeapons.cooldown > (classicEquipment.selected==="lance"?.38:.20)) {
      // Tiny flashes at the physical emitters; no diagonal fake convergence rays.
      for(const offset of classicEquipment.selected==="twin" ? [-10,10] : [0]) {
        ctx.save();ctx.translate(offset*shipScale,-(SHIP_VISUAL.muzzleOffset??125));
        drawArcadePulse("impact",.035,24*shipScale,.8);ctx.restore();
      }
    }

    if (!assembled && hull < 67 && state !== "destroying") {
      // Los tres fotogramas comparten anclaje y estilo. El daño progresa mediante
      // tamaño/opacidad y una animación lenta que no cambia de motor.
      const smokeSequence = [0, 1, 2, 1];
      const smoke = frameFrom("smoke", smokeSequence[Math.floor(elapsed * 4.5) % smokeSequence.length]);
      if (smoke) {
        const severity = clamp((67 - hull) / 66, 0.12, 1);
        const sideX = damageSmokeSide * 40 * SHIP_VISUAL.scale;
        const driftY = (elapsed * (7 + severity * 5)) % 14;
        const pulse = 0.78 + severity * 0.38 + Math.sin(elapsed * 2.1) * 0.035;

        ctx.save();
        ctx.translate(sideX + Math.sin(elapsed * 1.25) * 2.5, 38 * SHIP_VISUAL.scale - driftY);
        ctx.globalAlpha = 0.24 + severity * 0.48;
        ctx.rotate(damageSmokeSide * 0.035 + Math.sin(elapsed * 0.9) * 0.035);
        ctx.scale(pulse * SHIP_VISUAL.scale, pulse * SHIP_VISUAL.scale);
        ctx.drawImage(smoke, -56, -50, 112, 100);
        ctx.restore();

        if (hull < 20) {
          ctx.save();
          ctx.translate(sideX * 0.78 - damageSmokeSide * 16 * SHIP_VISUAL.scale, 22 * SHIP_VISUAL.scale - ((elapsed * 8) % 10));
          ctx.globalAlpha = 0.30 + severity * 0.22;
          ctx.scale((0.70 + severity * 0.20) * SHIP_VISUAL.scale, (0.70 + severity * 0.20) * SHIP_VISUAL.scale);
          ctx.drawImage(smoke, -48, -43, 96, 86);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  function itemVisualAlpha(item) {
    return item.alpha * clamp((item.y - 95) / 85, 0, 1);
  }

  let classicCroniumHalo=null;
  function preparedCroniumHalo() {
    if(classicCroniumHalo)return classicCroniumHalo;
    if(typeof document==="undefined")return null;
    const image=document.createElement("canvas");image.width=image.height=96;
    const target=image.getContext("2d"),halo=target.createRadialGradient(48,48,2,48,48,48);
    halo.addColorStop(0,"rgba(220,255,255,.9)");halo.addColorStop(.24,"rgba(76,241,255,.55)");
    halo.addColorStop(.60,"rgba(28,139,255,.15)");halo.addColorStop(1,"rgba(12,64,255,0)");
    target.fillStyle=halo;target.fillRect(0,0,96,96);classicCroniumHalo=image;return image;
  }

  function drawEnergy(item) {
    // V2 is actual animated energy, padded on every cell. Preserve the whole
    // illustration: no rectangular crop, metal bezel or opaque fragment.
    const phase = Number.isFinite(item.phase) ? item.phase : 0;
    const atlas=SPRITES.croniumEnergy,frame=Math.floor(elapsed*8+phase)%4;
    const pulse = 1 + Math.sin(elapsed * 3.4 + phase) * .04;
    ctx.save(); ctx.translate(item.x, item.y);
    ctx.globalAlpha = itemVisualAlpha(item); ctx.scale(.5 * pulse, .5 * pulse);
    ctx.shadowBlur = 0;ctx.globalCompositeOperation="screen";
    const halo=preparedCroniumHalo(),glow=item.r*4.1,size=item.r*4;
    if(halo)ctx.drawImage(halo,-glow/2,-glow/2,glow,glow);
    if(spriteReady(atlas)) {
      const cell=atlas.naturalWidth/2;
      ctx.drawImage(atlas,(frame%2)*cell,Math.floor(frame/2)*cell,cell,cell,-size/2,-size/2,size,size);
    }
    ctx.restore();
  }

  function drawCh01Frame(animator) {
    if (!animator) return false;
    const frame = animator.getFrame();
    const sprite=frame.image==="assets/ch02_interceptor_atlas_v1.webp"?SPRITES.ch02:SPRITES.ch01;
    if(!spriteReady(sprite))return false;
    const {x, y, width, height} = frame.rect;
    ctx.shadowBlur = 0;
    ctx.shadowColor = frame.damaged ? "#ff6079" : "#50e8ff";
    ctx.drawImage(sprite, x, y, width, height,
      -frame.drawSize * frame.pivot.x, -frame.drawSize * frame.pivot.y,
      frame.drawSize, frame.drawSize);
    return true;
  }

  // Guardia de Gaia (plan F3b): hojas del baúl. Enemigos en celdas de 192 (4 por
  // fila; el Alfa, 4 de 256); minas, bombas y disparos en la hoja 6×4 de 128.
  const GAIA_SHEETS = {tracker: "gaiaTracker", sower: "gaiaSower", aegis: "gaiaAegis", alpha: "gaiaAlpha", atlasEscort: "atlasEscorts"};
  const GAIA_SHOT_CELLS = {orb: 21, missile: 18};
  function drawGaiaCell(sprite, columns, cell, size) {
    const side = sprite.naturalWidth / columns;
    ctx.drawImage(sprite, (cell % columns) * side, Math.floor(cell / columns) * side, side, side, -size / 2, -size / 2, size, size);
  }
  function drawGaiaItem(item) {
    const tick = Math.floor(elapsed * 7 + (item.phase || 0));
    if (item.gaiaMine || item.gaiaBomb || item.gaiaSprite) {
      const sheet = SPRITES.hostileProjectiles2;
      if (!spriteReady(sheet)) return false;
      const cell = item.gaiaMine ? 12 + (item.mine.armed ? 1 + tick % 2 : 0)
        : item.gaiaBomb ? 15 + tick % 2 : GAIA_SHOT_CELLS[item.gaiaSprite] + tick % 3;
      // Amenaza = cálido (DESIGN §9.1).
      ctx.shadowBlur = 12; ctx.shadowColor = "#ff5b3d";
      if (item.gaiaSprite) ctx.rotate(Math.atan2(item.vy, item.vx) - Math.PI / 2);
      drawGaiaCell(sheet, 6, cell, item.r * (item.gaiaSprite ? 4.6 : 4));
      return true;
    }
    if (!item.gaiaEnemy) return false;
    const {kind, pending, telegraph} = item.gaia, sprite = SPRITES[GAIA_SHEETS[kind]];
    if (!spriteReady(sprite)) return false;
    // Fila 1: vuelo; fila 2: aviso de ataque (brillo rojo). Alfa: abierto,
    // compacto al cargar, dañado por debajo de la mitad.
    const cell = kind === "alpha" ? (item.hp <= item.maxHp * .5 ? 2 : pending ? 1 : 0)
      : pending ? 4 + Math.min(3, Math.floor(telegraph * 4)) : tick % 4;
    ctx.shadowBlur = pending ? 18 : 0; ctx.shadowColor = "#ff3b5c";
    drawGaiaCell(sprite, 4, cell, item.r * (kind === "alpha" ? 2.6 : 3.2));
    return true;
  }
  // Aviso de meteorito dirigido: cuña roja que parpadea en el borde superior.
  function drawMeteorWarnings() {
    if (typeof classicMeteorWarnings === "undefined" || !classicMeteorWarnings.length) return;
    const top = (classicFlightBounds?.presentationTop || 95) + 18, blink = .55 + .45 * Math.abs(Math.sin(elapsed * 14));
    ctx.save(); ctx.fillStyle = "#ff4d5e"; ctx.shadowBlur = 16; ctx.shadowColor = "#ff2d45"; ctx.globalAlpha = blink;
    for (const warning of classicMeteorWarnings) {
      ctx.beginPath(); ctx.moveTo(warning.x - 18, top); ctx.lineTo(warning.x + 18, top); ctx.lineTo(warning.x, top + 26); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // Escudo hexagonal de la Égida sobre el aliado que protege (fila 2 de su hoja).
  function drawGaiaShield(item) {
    const sprite = SPRITES.gaiaAegis;
    if (!(item.shieldHits > 0) || !spriteReady(sprite)) return;
    ctx.save(); ctx.translate(item.x, item.y); ctx.globalAlpha = .85;
    drawGaiaCell(sprite, 4, item.shieldHits >= 3 ? 5 : item.shieldHits === 2 ? 6 : 7, item.r * 3.4);
    ctx.restore();
  }

  function drawMeteor(item) {
    ctx.save();
    ctx.globalAlpha = itemVisualAlpha(item);
    ctx.translate(item.x, item.y);

    if (drawGaiaItem(item)) {
      ctx.restore();
      return;
    }
    if (item.classicScoutProjectile) {
      ctx.rotate(Math.atan2(item.vy, item.vx) + Math.PI / 2);
      if (!drawHostileOrdnance(item, item.role === "interceptor" ? 1 : 0,
        item.role === "interceptor" ? 60 : 52)) drawAtlasVfx(0, 28, 48, 1, .5);
      ctx.restore(); return;
    }
    if (drawCh01Frame(item.classicScout?.animator || item.hordeAnimator)) {
      ctx.restore();
      return;
    }

    if (item.special === "comet" && spriteReady(SPRITES.comet)) {
      // Atlas v3: la roca ocupa ~105 px de 384 (la v2, ~62); ×7 la deja del
      // tamaño de su círculo de choque (r·0,94), igual que antes.
      const size = item.r * 7;
      const frame = Math.floor(elapsed * 8 + (item.phase || 0)) % 4;
      const sourceWidth = SPRITES.comet.naturalWidth / 4;
      const sourceHeight = SPRITES.comet.naturalHeight;
      const sourceX = frame * sourceWidth;
      const direction = item.flightComet ? Math.atan2(item.vy,item.vx) : Math.PI / 2;
      ctx.rotate(direction);
      // Amenaza = cálido (DESIGN §9.1): el halo naranja la separa del CRONIUM cian.
      ctx.fillStyle = "rgba(255,140,70,.3)"; ctx.beginPath(); ctx.arc(0, 0, item.r * 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#ff8a4f";
      // Authored +X comet: keep the nucleus at the physical item centre. The
      // long decorative tail has no collision and trails opposite velocity.
      ctx.drawImage(
        SPRITES.comet,
        sourceX, 0, sourceWidth, sourceHeight,
        -size * 0.75, -size * 0.50, size, size
      );
      ctx.restore();
      return;
    }

    ctx.rotate(item.rot);
    if (item.vulkarHazard && spriteReady(SPRITES.lavaCoreMine)) {
      // Hoja 4×2 (encargo enc-nucleo). Fila 1: latido del núcleo (0-1-2-3-2-1);
      // la roca ocupa ~2/3 de la celda, así ×2,98 la deja del tamaño de r.
      // Fila 2: parpadeo de la mina (0-1-2-1); su cuerpo mide ~r con ×4.
      const atlas = SPRITES.lavaCoreMine, cell = atlas.naturalWidth / 4;
      const core = item.vulkarHazard === "lavaCore", tick = Math.floor(elapsed * (core ? 6 : 5) + (item.phase || 0));
      const frame = core ? [0, 1, 2, 3, 2, 1][tick % 6] : [0, 1, 2, 1][tick % 4];
      const size = item.r * (core ? 2.98 : 4);
      ctx.shadowBlur = 14; ctx.shadowColor = "#ff6a3d";
      ctx.drawImage(atlas, frame * cell, (core ? 0 : 1) * cell, cell, cell, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }
    const sprite = SPRITES[item.spriteKey] || SPRITES.meteorMedium;
    const sizeFactor = item.spriteKey === "meteorLarge" ? 2.95 : item.spriteKey && item.spriteKey.includes("Small") ? 2.45 : 2.70;
    const size = item.r * sizeFactor;
    ctx.shadowBlur = 17;
    ctx.shadowColor = "#ff754f";
    if (!drawImageCentered(sprite, size, size)) {
      ctx.fillStyle = "#43363a";
      ctx.beginPath(); ctx.arc(0, 0, item.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawDebris(item) {
    ctx.save();
    ctx.globalAlpha = itemVisualAlpha(item);
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    ctx.shadowBlur = 16;
    // Brillo cálido: el azul se confundía con la estación y el fondo (iPhone, 20/10).
    ctx.shadowColor = item.spriteKey && item.spriteKey.includes("Hot") ? "#ff5b3d" : "#ffb25c";
    const sprite = SPRITES[item.spriteKey] || SPRITES.debrisMetal;
    const size = item.r * (item.spriteKey === "debrisPanel" ? 3.15 : 2.90);
    if (!drawImageCentered(sprite, size, size)) {
      ctx.strokeStyle = "#91a0b4"; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-item.r, -item.r * 0.7); ctx.lineTo(item.r, item.r * 0.7); ctx.stroke();
    }
    ctx.restore();
  }

  function drawSatellite(item) {
    ctx.save();
    ctx.globalAlpha = itemVisualAlpha(item);
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffc777";
    const size = item.r * 3.55;
    if (!drawImageCentered(SPRITES.satellite, size, size)) {
      ctx.fillStyle = "#718096";
      rounded(-item.r * 0.34, -item.r * 0.68, item.r * 0.68, item.r * 1.36, 10); ctx.fill();
    }
    ctx.restore();
  }

  const POWER_STYLE = {
    shield: { color: "#5fffe8", dark: "#0d554d", glyph: "S" },
    tractor: { color: "#ff71f6", dark: "#5b1455", glyph: "T" },
    slow: { color: "#7ea9ff", dark: "#183d73", glyph: "E" },
    double: { color: "#ffe66c", dark: "#665714", glyph: "2X" },
    repair: { color: "#ff718f", dark: "#66172d", glyph: "+" },
    phaser: { color: "#8aff98", dark: "#185b24", glyph: "ϟ" }
  };

  function drawPower(item) {
    const style = POWER_STYLE[item.type];
    ctx.save();
    ctx.globalAlpha = itemVisualAlpha(item);
    ctx.translate(item.x, item.y);
    const bob = Math.sin(item.p * 1.35) * 3;
    ctx.translate(0, bob);
    ctx.shadowBlur = 28;
    ctx.shadowColor = style.color;

    let usedSprite = false;
    if (item.type === "repair") {
      usedSprite = drawImageCentered(SPRITES.repairDrone, 78, 78, Math.sin(item.p) * 0.06);
    } else if (item.type === "shield") {
      usedSprite = drawImageCentered(SPRITES.shieldIdle, 72, 72, item.rot * 0.15, 0.88);
    } else if (item.type === "phaser") {
      const frame = frameFrom("phaser", Math.floor(elapsed * 12));
      usedSprite = drawImageCentered(frame, 62, 34, -Math.PI / 2);
    } else if (item.type === "tractor") {
      const frame = frameFrom("tractor", Math.floor(elapsed * 12));
      usedSprite = drawImageCentered(frame, 70, 28, Math.PI / 2);
    }

    if (!usedSprite) {
      ctx.rotate(item.rot * 0.28);
      ctx.beginPath();
      for (let index = 0; index < 6; index++) {
        const angle = index * Math.PI / 3 - Math.PI / 6;
        const x = Math.cos(angle) * 30; const y = Math.sin(angle) * 30;
        if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.closePath();
      const gradient = ctx.createLinearGradient(-30, -30, 30, 30);
      gradient.addColorStop(0, style.color); gradient.addColorStop(1, style.dark);
      ctx.fillStyle = gradient; ctx.fill();
      ctx.strokeStyle = "#ffffffc9"; ctx.lineWidth = 2; ctx.stroke();
      ctx.rotate(-item.rot * 0.28);
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${style.glyph.length > 1 ? 18 : 27}px 'Exo 2',sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(style.glyph, 0, 1);
    }
    ctx.restore();
  }

  function drawGate(gate) {
    const gapLeft = gate.gapX - gate.gapW / 2;
    const gapRight = gate.gapX + gate.gapW / 2;
    ctx.save();
    ctx.translate(0, gate.y);

    // La antigua viga sólida se representa ahora como basura espacial
    // compactada. Las piezas se crean una sola vez y nunca invaden el hueco.
    for (const piece of gate.pieces || []) {
      ctx.save();
      ctx.translate(piece.x, piece.y + Math.sin(elapsed * 1.7 + piece.rotation) * 2.2);
      ctx.rotate(piece.rotation + elapsed * piece.spin);
      ctx.globalAlpha = clamp((gate.y + 150) / 90, 0.18, 1);
      ctx.shadowBlur = 14;
      ctx.shadowColor = piece.spriteKey.includes("Hot") ? "#ff5b3d" : "#729dff";
      if (!drawImageCentered(SPRITES[piece.spriteKey], piece.size, piece.size)) {
        ctx.fillStyle = piece.spriteKey.includes("meteor") ? "#493b42" : "#667489";
        ctx.beginPath();
        ctx.moveTo(-piece.size * 0.46, -piece.size * 0.18);
        ctx.lineTo(-piece.size * 0.10, -piece.size * 0.45);
        ctx.lineTo(piece.size * 0.47, -piece.size * 0.12);
        ctx.lineTo(piece.size * 0.26, piece.size * 0.42);
        ctx.lineTo(-piece.size * 0.38, piece.size * 0.31);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    const guide = ctx.createLinearGradient(gapLeft, 0, gapRight, 0);
    guide.addColorStop(0, "rgba(69,255,238,.20)");
    guide.addColorStop(0.22, "rgba(69,255,238,.04)");
    guide.addColorStop(0.5, "rgba(255,255,255,.08)");
    guide.addColorStop(0.78, "rgba(69,255,238,.04)");
    guide.addColorStop(1, "rgba(69,255,238,.20)");
    ctx.fillStyle = guide;
    ctx.fillRect(gapLeft, -gate.h * 0.74, gate.gapW, gate.h * 1.48);

    ctx.strokeStyle = level().accent;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 16;
    ctx.shadowColor = level().accent;
    ctx.beginPath();
    ctx.moveTo(gapLeft, -gate.h * 0.72);
    ctx.lineTo(gapLeft, gate.h * 0.72);
    ctx.moveTo(gapRight, -gate.h * 0.72);
    ctx.lineTo(gapRight, gate.h * 0.72);
    ctx.stroke();
    ctx.restore();
  }

  function drawParts() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const colors = { cyan: "#47f5ff", gold: "#ffe159", red: "#ff355f", violet: "#a858ff", green: "#78ff9c" };
    for (const part of parts) {
      ctx.globalAlpha = Math.max(0, part.life);
      ctx.fillStyle = colors[part.kind] || "#fff";
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size * Math.max(0.2, part.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRings() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const ring of rings) {
      const progress = 1 - ring.life / ring.duration;
      const fade = Math.pow(1 - progress, 1.35);
      ctx.globalAlpha = fade;
      ctx.strokeStyle = ring.color;
      ctx.shadowBlur = ring.style === "pulse" ? 30 : 16;
      ctx.shadowColor = ring.color;
      ctx.lineWidth = (ring.style === "pulse" ? 16 : 6) * (1 - progress) + 1;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 12 + ring.max * progress, 0, Math.PI * 2);
      ctx.stroke();
      if (ring.style === "pulse" || ring.style === "capture") {
        const delay = ring.style === "pulse" ? 0.14 : 0.08;
        const secondProgress = clamp((progress - delay) / (1 - delay), 0, 1);
        ctx.globalAlpha = fade * (ring.style === "pulse" ? 0.66 : 0.42);
        ctx.lineWidth = (ring.style === "pulse" ? 8 : 3) * (1 - secondProgress) + 1;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 8 + ring.max * secondProgress * 0.84, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawShots() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const shot of shots) {
      const progress = 1 - shot.life / shot.duration;
      if (shot.atlasPulse) {
        ctx.save();
        ctx.translate(shot.x1 + (shot.x2 - shot.x1) * progress, shot.y1 + (shot.y2 - shot.y1) * progress);
        ctx.rotate(Math.atan2(shot.y2 - shot.y1, shot.x2 - shot.x1) + Math.PI / 2);
        if(shot.kind==="lance" || shot.kind==="phaser")drawImageCentered(frameFrom("phaser",Math.floor(elapsed*18)),30,105,0,1);
        else drawAtlasVfx(1, shot.kind==="twin"?16:22, shot.kind==="twin"?58:68, 1, .10);
        ctx.restore();
        continue;
      }
      const dx = shot.x2 - shot.x1;
      const dy = shot.y2 - shot.y1;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const flashPhase = clamp(progress / 0.18, 0, 1);
      const fade = progress < 0.78 ? 1 : 1 - (progress - 0.78) / 0.22;
      const pulse = shot.kind === "pulse";
      const glowColor = pulse ? "#95f7ff" : "#78ff9c";
      const beamColor = pulse ? "#63eaff" : "#6dff9a";
      ctx.save();
      ctx.translate(shot.x1, shot.y1);
      ctx.rotate(angle);
      ctx.globalAlpha = clamp(flashPhase * fade, 0, 1);
      ctx.shadowBlur = 28;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = pulse ? "rgba(61,204,255,.40)" : "rgba(84,255,145,.34)";
      ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(distance, 0); ctx.stroke();
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(distance, 0); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.98)";
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(distance, 0); ctx.stroke();

      const muzzle = ctx.createRadialGradient(0, 0, 0, 0, 0, 24 * (1 - progress * 0.45));
      muzzle.addColorStop(0, "rgba(255,255,255,.98)");
      muzzle.addColorStop(0.3, pulse ? "rgba(84,235,255,.88)" : "rgba(105,255,153,.82)");
      muzzle.addColorStop(1, "rgba(40,120,255,0)");
      ctx.fillStyle = muzzle;
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();

      if (shot.hit && progress > 0.45) {
        ctx.globalAlpha *= clamp((progress - 0.45) * 3.5, 0, 1);
        const impact = ctx.createRadialGradient(distance, 0, 0, distance, 0, shot.destroyed ? 34 : 22);
        impact.addColorStop(0, "rgba(255,255,255,1)");
        impact.addColorStop(0.28, "rgba(102,255,220,.86)");
        impact.addColorStop(1, "rgba(50,160,255,0)");
        ctx.fillStyle = impact;
        ctx.beginPath(); ctx.arc(distance, 0, shot.destroyed ? 34 : 22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawExplosions() {
    for (const explosion of explosions) {
      if (explosion.ch01Animator) {
        ctx.save();
        ctx.translate(explosion.x, explosion.y);
        ctx.globalCompositeOperation = "screen";
        if (drawCh01Frame(explosion.ch01Animator)) { ctx.restore(); continue; }
        ctx.restore();
      }
      const progress = 1 - explosion.life / explosion.duration;
      const frameIndex = Math.min(SPRITE_GROUPS.explosion.length - 1, Math.floor(progress * SPRITE_GROUPS.explosion.length));
      const frame = frameFrom("explosion", frameIndex);
      const size = (70 + progress * 86) * explosion.scale;
      ctx.save();
      ctx.translate(explosion.x, explosion.y);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.min(1, explosion.life * 5);
      ctx.shadowBlur = 24; ctx.shadowColor = "#ff8d36";
      if (!drawImageCentered(frame || SPRITES.explosionSmall, size, size, explosion.rotation)) {
        ctx.fillStyle = "#ff9b42"; ctx.beginPath(); ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawImpactEffects() {
    for (const effect of impactEffects) {
      const progress = 1 - effect.life / effect.duration;
      if(effect.missileImpact&&spriteReady(SPRITES.chapterMissile)) {
        const age=effect.duration-effect.life,atlas=SPRITES.chapterMissile,cell=atlas.naturalWidth/4;
        const row=age<.25?2:3,frame=Math.min(3,Math.floor((age-(row===3?.25:0))*(row===2?16:10)));
        // The payload has a materially larger blast than a Phaser spark. Four
        // authored detonation poses expand from the actual collision point;
        // the following four poses carry hot fragments outwards and fade.
        // Only presentation changes here: damage and the one-shot receipt are
        // owned by collision dispatch, never by repeated animation frames.
        const expansion = 1-Math.pow(1-Math.min(1,Math.max(0,age)/.19),2);
        const debrisProgress = Math.max(0,Math.min(1,(age-.25)/.4));
        const size = row===2 ? 128+80*expansion : 208+44*debrisProgress;
        ctx.save();ctx.translate(effect.x,effect.y);ctx.globalAlpha*=row===3?Math.max(0,1-(age-.25)/.4):1;
        ctx.drawImage(atlas,frame*cell,row*cell,cell,cell,-size/2,-size/2,size,size);
        ctx.restore();continue;
      }
      if (effect.plasmaBlast && spriteReady(SPRITES.lavaCoreMine)) {
        // Estallido de la mina: último fotograma de la fila 2, crece y se apaga.
        const atlas = SPRITES.lavaCoreMine, cell = atlas.naturalWidth / 4, size = 110 + 70 * progress;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle);
        ctx.globalAlpha *= 1 - progress * progress;
        ctx.drawImage(atlas, 3 * cell, cell, cell, cell, -size / 2, -size / 2, size, size);
        ctx.restore(); continue;
      }
      if (effect.hullSparks && spriteReady(SPRITES.hullSparks)) {
        // 8 fotogramas en 0,5 s (rejilla 4×2); el origen de las chispas es el
        // centro de cada celda y el abanico sale hacia +X, girado al impacto.
        const atlas = SPRITES.hullSparks, cell = atlas.naturalWidth / 4;
        const frame = Math.min(7, Math.floor(progress * 8)), size = 176;
        ctx.save(); ctx.translate(effect.x, effect.y); ctx.rotate(effect.angle);
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(atlas, (frame % 4) * cell, Math.floor(frame / 4) * cell, cell, cell, -size / 2, -size / 2, size, size);
        ctx.restore(); continue;
      }
      if (effect.atlasExplosion && spriteReady(SPRITES.atlasExplosion)) {
        // Rejilla 4×2: destello, bola de fuego, anillo cian con escombros y
        // humo que se apaga, a 10 fps. Destello blanco breve solo sin
        // «Reducir efectos».
        const atlas = SPRITES.atlasExplosion, cell = atlas.naturalWidth / 4;
        const frame = Math.min(7, Math.floor(progress * 8)), age = effect.duration - effect.life;
        if (!settings.reduceEffects && age < .18) {
          ctx.save(); ctx.fillStyle = `rgba(255,236,210,${(.38 * (1 - age / .18)).toFixed(3)})`;
          ctx.fillRect(0, 0, W, H); ctx.restore();
        }
        ctx.save(); ctx.translate(effect.x, effect.y);
        ctx.drawImage(atlas, (frame % 4) * cell, Math.floor(frame / 4) * cell, cell, cell,
          -effect.size / 2, -effect.size / 2, effect.size, effect.size);
        ctx.restore(); continue;
      }
      if (effect.atlasImpact) {
        ctx.save(); ctx.translate(effect.x, effect.y);
        if(!drawArcadePulse("impact",effect.duration-effect.life,60,1-progress*.4))drawAtlasVfx(2,58,52,1-progress);
        ctx.restore(); continue;
      }
      const frame = frameFrom("impact", effect.variant);
      const size = (36 + progress * 28) * effect.scale;
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.max(0, effect.life / effect.duration);
      ctx.shadowBlur = 16; ctx.shadowColor = "#ff9b36";
      drawImageCentered(frame, size, size, effect.angle);
      ctx.restore();
    }
  }

  function drawCombo() {
    if (state !== "playing" || combo < 3) return;
    ctx.save();
    const label = `CADENA x${combo}`;
    const y = H - 245;
    ctx.font = "900 28px Orbitron,sans-serif";
    const width = ctx.measureText(label).width + 38;
    rounded(W / 2 - width / 2, y - 32, width, 42, 21);
    ctx.fillStyle = "rgba(7,10,22,.58)";
    ctx.fill();
    ctx.strokeStyle = powers.double > 0 ? "rgba(255,230,108,.55)" : "rgba(76,244,255,.35)";
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = powers.double > 0 ? "#ffe66c" : "#fff";
    ctx.fillText(label, W / 2, y - 3);
    ctx.restore();
  }
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
