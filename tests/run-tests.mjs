import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { createStorageService } from "../src/core/storage-service.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;

async function test(name, operation) {
  await operation();
  passed += 1;
  console.log(`PASS ${String(passed).padStart(2, "0")} · ${name}`);
}

const text = async (path) => readFile(join(root, path), "utf8");
const exists = async (path) => stat(join(root, path)).then(() => true, () => false);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const withoutQuery = (path) => path.replace(/[?#].*$/, "").replace(/^\.\//, "");

const packageJson = JSON.parse(await text("package.json"));
const lockJson = JSON.parse(await text("package-lock.json"));
const manifest = JSON.parse(await text("manifest.webmanifest"));
const assetManifest = JSON.parse(await text("ASSET_MANIFEST.json"));
const assetProduction = JSON.parse(await text("ASSET_PRODUCTION_150.json"));
const indexHtml = await text("index.html");
const gameSource = await text("game.js");
const coreSource = await text("core-runtime.js");
const contentSource = await text("content-runtime.js");
const serviceWorkerSource = await text("sw.js");
const nativeSource = await text("src/native-admob-entry.js");

await test("versión interna 7.2.0 compatible y portada canónica sin distintivos técnicos", async () => {
  assert.equal(packageJson.version, "7.2.0");
  assert.equal(lockJson.version, "7.2.0");
  assert.doesNotMatch(indexHtml, />[^<]*V7\.2\.0[^<]*</);
  assert.match(indexHtml, /NEON CRONIUM/);
  assert.match(indexHtml, /CONTINUAR VIAJE/);
  assert.match(indexHtml, /FORMACIÓN DE RESTOS/);
  assert.match(indexHtml, /Formación de basura espacial/);
  assert.doesNotMatch(indexHtml, /Barrera orbital:/);
  assert.match(gameSource, /BUILD_VERSION = "7\.2\.0"/);
  assert.match(serviceWorkerSource, /neon-cronium-pre-release-7-2-0/);
  assert.match(await text("netlify.toml"), /publish = "www"/);
});

await test("dependencias exactas y reproducibles", async () => {
  const versions = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const [name, version] of Object.entries(versions)) {
    assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, `${name} no está fijada`);
  }
  assert.equal(lockJson.lockfileVersion, 3);
  assert.equal(packageJson.overrides.uuid, "11.1.1");
  assert.ok(lockJson.packages["node_modules/@capacitor/core"]);
  assert.ok(lockJson.packages["node_modules/@capacitor-community/admob"]);
});

await test("JavaScript y JSON con sintaxis válida", async () => {
  new vm.Script(gameSource, { filename: "game.js" });
  new vm.Script(serviceWorkerSource, { filename: "sw.js" });
  new vm.Script(await text("ad-bridge.js"), { filename: "ad-bridge.js" });
  new vm.Script(await text("analytics-manager.js"), { filename: "analytics-manager.js" });
  new vm.Script(await text("ads-config.js"), { filename: "ads-config.js" });
  assert.equal(manifest.orientation, "portrait");
  assert.equal(assetManifest.buildVersion, "7.2.0");
});

await test("game.js coincide con los 9 módulos ordenados", async () => {
  const moduleNames = (await readdir(join(root, "src", "game")))
    .filter((name) => /^\d{2}-[a-z0-9-]+\.js$/i.test(name))
    .sort();
  assert.deepEqual(moduleNames, [
    "00-bootstrap-config.js",
    "01-runtime-assets.js",
    "02-storage-audio.js",
    "03-ui-game-flow.js",
    "04-entities-collision-damage.js",
    "05-corridor-update.js",
    "06-world-rendering.js",
    "07-player-item-rendering.js",
    "08-loop-input-bootstrap.js"
  ]);
  const modularSource = (await Promise.all(
    moduleNames.map((name) => readFile(join(root, "src", "game", name), "utf8"))
  )).join("");
  assert.equal(sha256(modularSource), sha256(gameSource));
  assert.ok(modularSource.startsWith("(() => {\n  \"use strict\";"));
  assert.ok(modularSource.endsWith("})();\n"));
});

await test("sin latest, TODO ni identificadores publicitarios ficticios", async () => {
  const inspected = [
    await text("package.json"),
    await text("ads-config.js"),
    await text("ad-bridge.js"),
    nativeSource,
    await text("capacitor.config.ts")
  ].join("\n");
  assert.doesNotMatch(inspected, /["']latest["']/i);
  assert.doesNotMatch(inspected, /\bTODO\b|YOUR_[A-Z_]+|X{4,}/);
  assert.match(inspected, /ca-app-pub-3940256099942544\/1712485313/);
});

await test("manifiesto y archivos conservados coinciden exactamente con el disco", async () => {
  const { audit } = await import("../scripts/audit-asset-inventory.mjs");
  const result = await audit(root);
  assert.equal(result.ok, true, JSON.stringify(result, null, 2));
  assert.equal(result.runtimeCount, assetManifest.assetCount);
  assert.equal(result.preservedCount, 2);
  assert.equal(result.actualBytes, assetManifest.runtimeBytes);
});

await test("plan de producción conserva los 150 IDs históricos y registra ampliaciones únicas y trazables", async () => {
  assert.ok(assetProduction.totalAssets >= 150);
  assert.equal(assetProduction.assets.length, assetProduction.totalAssets);
  assert.equal(new Set(assetProduction.assets.map((item) => item.id)).size, assetProduction.totalAssets);
  assert.equal(Object.values(assetProduction.distribution).reduce((total, count) => total + count, 0), assetProduction.totalAssets);
  assert.equal(await exists("ASSET_PRODUCTION_MAP.md"), true);
  assert.equal(await exists("art-source/comet_animation_master_v1.png"), true);
  assert.equal(await exists("assets/comet_animation_sheet_v1.webp"), true);
});

await test("todos los assets de juego están documentados y precargados", async () => {
  const referenced = new Set(
    [...gameSource.matchAll(/["'`](assets\/[^"'`]+)["'`]/g)]
      .map((match) => match[1])
      .filter((path) => !path.includes("${"))
  );
  const declared = new Set([
    ...assetManifest.groups.flatMap((group) => group.paths),
    ...assetManifest.standalone.map((item) => item.path)
  ]);
  for (const path of referenced) assert.ok(declared.has(path), path);
  assert.equal(gameSource.includes("function loadSprite(path, eager = true)"), true);
});

const swContext = {
  self: {
    addEventListener() {},
    skipWaiting() {},
    clients: { claim() {} },
    location: { origin: "https://neon.test" }
  },
  caches: {},
  fetch() {},
  URL
};
vm.runInNewContext(`${serviceWorkerSource}\nglobalThis.__SW_TEST__ = { CACHE, CORE };`, swContext);
const swCore = swContext.__SW_TEST__.CORE;

await test("service worker incluye recursos activos y excluye referencias visuales retiradas", async () => {
  const corePaths = new Set(swCore.map(withoutQuery));
  const required = [
    "index.html", "styles.css", "native-admob.js", "ads-config.js", "ad-bridge.js", "analytics-manager.js", "game.js",
    "manifest.webmanifest", "privacy.html", "terms.html",
    ...assetManifest.groups.filter(group => group.precache !== false).flatMap((group) => group.paths),
    ...assetManifest.standalone.filter(item => item.precache !== false).map((item) => item.path)
  ];
  for (const path of required) assert.ok(corePaths.has(path), `no precargado: ${path}`);
  for (const path of [...assetManifest.groups.filter(group=>group.precache===false).flatMap(group=>group.paths),...assetManifest.standalone.filter(item=>item.precache===false).map(item=>item.path)]) assert.equal(corePaths.has(path),false,`referencia retirada precargada: ${path}`);
  assert.equal(swContext.__SW_TEST__.CACHE, "neon-cronium-pre-release-7-2-0-orbital-hud-2");
});

await test("todas las referencias locales de HTML existen", async () => {
  const references = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|data:|#)/.test(reference)) continue;
    const path = withoutQuery(reference);
    assert.equal(await exists(path), true, `referencia rota: ${reference}`);
  }
});

await test("www es un paquete limpio y coincide con los archivos públicos", async () => {
  const publicFiles = [
    "index.html", "styles.css", "core-runtime.js", "content-runtime.js", "game.js", "ads-config.js",
    "ad-bridge.js", "analytics-manager.js", "native-admob.js", "manifest.webmanifest", "privacy.html", "terms.html", "sw.js"
  ];
  for (const path of publicFiles) {
    const [source, built] = await Promise.all([readFile(join(root, path)), readFile(join(root, "www", path))]);
    assert.equal(sha256(source), sha256(built), path);
  }
  const builtAssets = (await readdir(join(root, "www", "assets"))).sort();
  assert.deepEqual(builtAssets, (await readdir(join(root, "assets"))).sort());
  assert.equal(await exists("www/package.json"), false);
  assert.equal(await exists("www/src"), false);
  assert.equal(await exists("www/_headers"), true);
  // Ni mapas de código ni la demo del motor experimental en el paquete público.
  for (const path of ["www/content-runtime.js.map", "www/core-runtime.js.map", "www/engine-preview.html", "www/engine", "www/js/engine", "www/render"]) assert.equal(await exists(path), false, path);
});

await test("proyecto iOS real conserva bundle, versión y orientación vertical", async () => {
  const capacitorConfig = await text("capacitor.config.ts");
  const project = await text("ios/App/App.xcodeproj/project.pbxproj");
  const info = await text("ios/App/App/Info.plist");
  const swiftPackage = await text("ios/App/CapApp-SPM/Package.swift");
  assert.match(capacitorConfig, /appId: "com\.neoncronium"/);
  assert.match(capacitorConfig, /webDir: "www"/);
  assert.match(project, /PRODUCT_BUNDLE_IDENTIFIER = com\.neoncronium;/);
  assert.equal((project.match(/MARKETING_VERSION = 7\.2\.0;/g) || []).length, 2);
  assert.equal((project.match(/CURRENT_PROJECT_VERSION = 4;/g) || []).length, 2);
  assert.match(capacitorConfig, /loggingBehavior: "none"/);
  assert.match(project, /IPHONEOS_DEPLOYMENT_TARGET = 15\.0;/);
  assert.match(info, /ca-app-pub-3940256099942544~1458002511/);
  assert.match(info, /<string>UIInterfaceOrientationPortrait<\/string>/);
  assert.doesNotMatch(info, /UIInterfaceOrientationLandscape/);
  assert.match(info, /<key>UIStatusBarHidden<\/key>\s*<true\/>/);
  assert.match(swiftPackage, /CapacitorCommunityAdmob/);
  assert.match(swiftPackage, /capacitor-swift-pm\.git", exact: "8\.5\.0"/);
});

await test("recursos iOS y web sincronizado son coherentes", async () => {
  const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
  const icon = await readFile(join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"));
  const splash = await readFile(join(root, "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"));
  assert.deepEqual(pngSize(icon), { width: 1024, height: 1024 });
  assert.deepEqual(pngSize(splash), { width: 2732, height: 2732 });
  for (const path of ["index.html", "game.js", "content-runtime.js", "native-admob.js", "assets/ship_frame_05.webp", "assets/smoke_frame_02.webp"]) {
    const [web, ios] = await Promise.all([
      readFile(join(root, "www", path)),
      readFile(join(root, "ios/App/App/public", path))
    ]);
    assert.equal(sha256(web), sha256(ios), path);
  }
});

function createCanvasContext() {
  const gradient = { addColorStop() {} };
  return new Proxy({}, {
    get(target, property) {
      if (property in target) return target[property];
      if (property === "createLinearGradient" || property === "createRadialGradient") return () => gradient;
      if (property === "measureText") return (value) => ({ width: String(value).length * 14 });
      return () => {};
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
}

async function loadGameHarness() {
  const dom = new JSDOM(indexHtml, {
    url: "https://neon.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.HTMLCanvasElement.prototype.getContext = () => createCanvasContext();
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
  window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
    x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844
  });
  window.requestAnimationFrame = () => 1;
  window.cancelAnimationFrame = () => {};
  window.navigator.vibrate = () => true;
  window.AdBridge = { showRewarded: async () => true, showInterstitial: async () => false };
  window.Image = class FakeImage {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      this.decoding = "async";
    }
    set src(value) {
      this._src = value;
      this.complete = true;
      this.naturalWidth = 320;
      this.naturalHeight = 320;
    }
    get src() { return this._src || ""; }
  };
  window.localStorage.setItem("neon-best-v1", "1200");
  window.localStorage.setItem("neon-unlocked-v2", "10");
  window.eval(coreSource);
  window.eval(contentSource);

  const marker = "  legacyFrameId = requestAnimationFrame(frame);\n})();";
  assert.ok(gameSource.includes(marker), "no se encontró el punto de instrumentación");
  const hooks = `
  window.__NEON_TEST__ = {
    snapshot: () => ({
      state, hull, hullReserve:classicHullReserve, currentLevel, score, collected, continued, supplyFailed, ammo, manualShotCooldown, warpTimer,
      destructionTimer, destructionStage, playerVisible, damageSmokeSide, damageSmokeLocked,
      impactReactionTimer, impactReactionSide, energyBudget, energySpawned, powerBudget, gateCountdown,
      elapsed, storyStep, storyTimer, levelOneShockwaveTriggered,
      supplyFailureScheduled, runToken, settings: { ...settings },
      powers: { ...powers }, player: { ...player },
      weapons: classicWeapons ? NeonCampaign.classicWeaponSnapshot(classicWeapons) : null,
      counts: { items: items.length, gates: gates.length, shots: shots.length, projectiles: classicWeapons?.projectiles.length || 0, parts: parts.length, rings: rings.length, explosions: explosions.length, impacts: impactEffects.length },
      items: items.map((item) => ({ type: item.type, x: item.x, y: item.y, r: item.r, spriteKey: item.spriteKey, special: item.special })),
      gates: gates.map((gate) => ({ ...gate, pieces: (gate.pieces || []).map((piece) => ({ ...piece })) }))
    }),
    levels: LEVELS.map((level) => ({ ...level, threatPool: [...level.threatPool] })),
    collisionOutline: SHIP_COLLISION_OUTLINE.map((point) => [...point]),
    corridorConfig: { shipHalfWidth: SHIP_COLLISION_HALF_WIDTH, requiredClearance: CORRIDOR_REQUIRED_CLEARANCE },
    keys: { ...KEYS },
    startLevel, pauseGame, resumeGame, finishGame, resumeReward, damageShip, update, fireManualShot,
    checkSupplyFailure, burst, clearTransientEffects,
    createDebrisFormation, gateCorridorBounds, threatOverlapsGateCorridor, clearProtectedCorridors,
    playerFrameState, migrateLegacyStorage, bestScore, getUnlocked, getStars, getLevelBest, loadSettings,
    setSupplyExhausted: () => {
      energySpawned = energyBudget;
      collected = 0;
      items = [];
    },
    prepareWeaponFixture: () => {
      // Explicit presentation-only skip in this controlled weapon fixture;
      // route time, quotas, ammunition, damage and encounter clocks stay real.
      classicChapterStory?.skipIntro();classicChapterView=classicChapterStory?.snapshot()||null;
      warpTimer = 0; spawnTimer = 999; classicScoutTimer = 999; items = []; gates = [];
    },
    advancePlayed: (seconds) => {
      for (let remaining = seconds; remaining > 1e-9; remaining -= Math.min(1/60, remaining)) {
        update(Math.min(1/60, remaining));
      }
    },
    setStoryState: ({ elapsedValue, step, shockwaveTriggered }) => {
      elapsed = elapsedValue;
      storyStep = step;
      levelOneShockwaveTriggered = shockwaveTriggered;
    },
    setCorridorScenario: (formationList, fieldItems) => {
      gates = formationList;
      items = fieldItems;
      tractorTarget = null;
    },
    corridorViolationCount: () => items.filter((item) => gates.some((gate) => threatOverlapsGateCorridor(item, gate))).length,
    seedResidue: () => {
      items.push({ type: "meteor", y: H * 0.82 }, { type: "meteor", y: H * 0.2 }, { type: "energy", y: H * 0.8 });
      gates.push({}); shots.push({}); parts.push({}); rings.push({}); explosions.push({}); impactEffects.push({});
    }
  };
  legacyFrameId = requestAnimationFrame(frame);
})();`;
  window.eval(gameSource.replace(marker, hooks));
  return { dom, window, api: window.__NEON_TEST__ };
}

const harness = await loadGameHarness();
const { window: gameWindow, api } = harness;

await test("almacenamiento aislado sobrevive a bloqueos y valores ausentes", async () => {
  const blocked = createStorageService({
    getItem() { throw new Error("storage blocked"); },
    setItem() { throw new Error("storage blocked"); },
    removeItem() { throw new Error("storage blocked"); }
  });
  assert.equal(blocked.getNumber("missing", 7), 7);
  assert.deepEqual(blocked.getJSON("missing", { safe: true }), { safe: true });
  assert.equal(blocked.set("key", 1), false);
  assert.equal(blocked.setJSON("key", {}), false);
  assert.equal(blocked.remove("key"), false);
});

await test("migración V1→V2 idempotente y sin pérdida de récord", async () => {
  assert.equal(api.bestScore(), 1200);
  gameWindow.localStorage.setItem("neon-best-v2", "1500");
  gameWindow.localStorage.setItem("neon-best-v1", "1400");
  assert.equal(api.migrateLegacyStorage(), false);
  assert.equal(api.bestScore(), 1500);
  gameWindow.localStorage.setItem("neon-best-v1", "1800");
  assert.equal(api.migrateLegacyStorage(), true);
  assert.equal(api.bestScore(), 1800);
  assert.equal(api.migrateLegacyStorage(), false);
});

await test("claves, campaña y balance crítico permanecen iguales", async () => {
  assert.deepEqual({ ...api.keys }, {
    best: "neon-best-v2",
    unlocked: "neon-unlocked-v2",
    stars: "neon-stars-v2",
    levelBest: "neon-level-best-v2",
    games: "neon-games-v2",
    settings: "neon-settings-v5"
  });
  assert.equal(api.levels.length, 10);
  assert.deepEqual(Array.from(api.levels, (level) => level.goal), [36, 45, 60, 75, 90, 105, 120, 135, 150, 165]);
  assert.deepEqual(Array.from(api.levels, (level) => level.speed), [0.92, 0.94, 1.02, 1.09, 1.16, 1.22, 1.28, 1.35, 1.42, 1.5]);
  assert.deepEqual(Array.from(api.levels, (level) => level.spawn), [0.69, 0.72, 0.67, 0.62, 0.58, 0.54, 0.51, 0.47, 0.44, 0.4]);
});

await test("el cargador canónico ofrece veinte proyectiles, se agota y recupera uno sin contador ni disparos fantasma", async () => {
  api.startLevel(0);
  api.prepareWeaponFixture();
  assert.equal(api.snapshot().ammo, 20);
  assert.equal(api.snapshot().weapons.rechargeSeconds, 2);
  assert.equal(api.fireManualShot(), true);
  assert.equal(api.snapshot().weapons.projectiles.length, 1, "un pulso recorre el espacio como proyectil físico");
  assert.equal(api.snapshot().counts.shots, 0, "no duplica el proyectil con un haz instantáneo heredado");
  let emitted = 1;
  while (api.snapshot().ammo > 0 && emitted < 40) {
    api.advancePlayed(.25);
    assert.equal(api.fireManualShot(), true);
    emitted++;
  }
  assert.equal(emitted, 22, "veinte almacenados más dos recuperados durante la ráfaga");
  assert.equal(api.snapshot().ammo, 0);
  assert.equal(api.fireManualShot(), false);
  assert.equal(api.snapshot().weapons.shotSequence, emitted);
  assert.equal(gameWindow.document.getElementById('ammo').textContent, '');
  assert.doesNotMatch(gameWindow.document.getElementById('fire').getAttribute('aria-label'), /\d|segundos|cargas/i);
  const remaining = api.snapshot().weapons.rechargeSeconds - api.snapshot().weapons.recharge;
  api.advancePlayed(remaining - .01);
  assert.equal(api.snapshot().ammo, 0, "el tiempo jugado anterior al intervalo no concede munición");
  assert.equal(api.fireManualShot(), false);
  api.advancePlayed(.02);
  assert.equal(api.snapshot().ammo, 1);
  assert.equal(api.snapshot().weapons.shotSequence, emitted, "la recarga no dispara por sí sola");
  assert.equal(api.fireManualShot(), true);
  assert.equal(api.snapshot().ammo, 0);
  assert.equal(api.snapshot().weapons.shotSequence, emitted + 1);
});

await test("guardados corruptos se normalizan sin romper el menú ni el control", async () => {
  gameWindow.localStorage.setItem(api.keys.unlocked, "not-a-number");
  gameWindow.localStorage.setItem(api.keys.stars, JSON.stringify({ 1: 99, 2: -3, 3: "2", bad: 5 }));
  gameWindow.localStorage.setItem(api.keys.levelBest, JSON.stringify({ 1: -50, 2: "900", 3: null }));
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({
    music: 900, fx: -40, sensitivity: "broken", vibration: "yes", effects: null
  }));
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({ music: 900, fx: -40, sensitivity: "broken", vibration: "yes", effects: null, difficulty: "imposible" }));
  assert.equal(api.getUnlocked(), 1);
  assert.deepEqual({ ...api.getStars() }, { 1: 3, 3: 2 });
  assert.deepEqual({ ...api.getLevelBest() }, { 2: 900 });
  assert.deepEqual({ ...api.loadSettings() }, {
    music: 100, fx: 0, sensitivity: 135, sensitivityMigrated: true, autoFire: false, vibration: true, reduceEffects: false, leftHanded: false, effectsQuality: "normal", difficulty: "normal", flightTutorial: null, effects: true
  });
  // Clave heredada a propósito: comprueba que un dato antiguo no activa el ajuste.
  gameWindow.localStorage.setItem("neonCatcher.atlasAutoFire.v1", "true");
  assert.equal(api.loadSettings().autoFire, false, "El antiguo AUTO predeterminado no autoriza el nuevo ajuste");
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({autoFire: true}));
  assert.equal(api.loadSettings().autoFire, true, "Sólo un opt-in explícito activa el ajuste");
  gameWindow.localStorage.setItem(api.keys.unlocked, "10");
});

await test("la sensibilidad 135 llega una vez a quien tenía guardado el 100 antiguo", async () => {
  // Propietario (25/10): también para quien ya guardó ajustes.
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({sensitivity: 100}));
  assert.equal(api.loadSettings().sensitivity, 135);
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({sensitivity: 100, sensitivityMigrated: true}));
  assert.equal(api.loadSettings().sensitivity, 100, "Un 100 elegido después del cambio se respeta");
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({sensitivity: 120}));
  assert.equal(api.loadSettings().sensitivity, 120, "Otro valor elegido se conserva");
  gameWindow.localStorage.removeItem(api.keys.settings);
});

await test("mano izquierda: se guarda y pasa los controles de vuelo a la izquierda", async () => {
  // Propietario (25/10): ajuste para zurdos.
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({leftHanded: "yes"}));
  assert.equal(api.loadSettings().leftHanded, false, "Solo un true explícito lo activa");
  gameWindow.localStorage.setItem(api.keys.settings, JSON.stringify({leftHanded: true}));
  assert.equal(api.loadSettings().leftHanded, true);
  gameWindow.localStorage.removeItem(api.keys.settings);
  const toggle = gameWindow.document.getElementById("leftHanded");
  assert.ok(toggle, "El ajuste está en la pantalla de ajustes");
  toggle.checked = true; toggle.dispatchEvent(new gameWindow.Event("change"));
  assert.ok(gameWindow.document.body.classList.contains("left-handed"));
  toggle.checked = false; toggle.dispatchEvent(new gameWindow.Event("change"));
  assert.equal(gameWindow.document.body.classList.contains("left-handed"), false);
});

await test("silueta clásica al 52 % ajustada al material visible conserva treinta puntos y extremos probados", async () => {
  const outline = Array.from(api.collisionOutline, (point) => Array.from(point));
  assert.equal(outline.length, 30);
  assert.equal(sha256(JSON.stringify(outline)), "a40789b028be6be21f4e38897310e205ff2008bc05c4c6cdef03712215077622");
  assert.ok(Math.abs(Math.min(...outline.map(point=>point[1]))+61.568)<1e-9);
  assert.ok(Math.abs(Math.max(...outline.map(point=>Math.abs(point[0])))-51.012)<1e-9);
  assert.ok(Math.abs(Math.max(...outline.map(point=>point[1]))-39.104)<1e-9);
});

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

await test("10.000 formaciones S6–S10 conservan un pasillo atravesable", async () => {
  const originalRandom = gameWindow.Math.random;
  gameWindow.Math.random = seededRandom(0x4e454f4e);
  try {
    let checked = 0;
    const minimumWidth = 2 * (api.corridorConfig.shipHalfWidth + api.corridorConfig.requiredClearance);
    for (let levelIndex = 5; levelIndex <= 9; levelIndex++) {
      api.startLevel(levelIndex);
      for (let iteration = 0; iteration < 2000; iteration++) {
        const formation = api.createDebrisFormation();
        const corridor = api.gateCorridorBounds(formation);
        assert.equal(formation.kind, "debris-formation");
        assert.equal(formation.gapW, [262, 258, 254, 250, 246][levelIndex - 5]);
        assert.ok(formation.gapW >= minimumWidth, `S${levelIndex + 1}: abertura ${formation.gapW}`);
        assert.ok(corridor.left >= 32 && corridor.right <= 688, `S${levelIndex + 1}: pasillo fuera del lienzo`);
        assert.ok(formation.pieces.length >= 8, `S${levelIndex + 1}: formación visual incompleta`);
        for (const piece of formation.pieces) {
          if (piece.side < 0) assert.ok(piece.x + piece.halfExtent <= corridor.left + 1e-9, "resto izquierdo rotado invade el pasillo");
          else assert.ok(piece.x - piece.halfExtent >= corridor.right - 1e-9, "resto derecho rotado invade el pasillo");
        }
        checked++;
      }
    }
    assert.equal(checked, 10000);
  } finally {
    gameWindow.Math.random = originalRandom;
  }
});

await test("50.000 amenazas aleatorias quedan fuera del corredor protegido", async () => {
  api.startLevel(9);
  const formation = api.createDebrisFormation(360);
  formation.y = 320;
  formation.s = 0;
  const random = seededRandom(0x434f5252);
  const types = ["meteor", "debris", "satellite"];
  const threats = Array.from({ length: 50000 }, (_, index) => {
    const type = types[index % types.length];
    const r = type === "satellite" ? 42 : type === "debris" ? 32 : 36 + random() * 6;
    return {
      type,
      x: random() * 720,
      y: -145 + random() * 1420,
      r,
      rot: random() * Math.PI * 2,
      special: "",
      spriteKey: type === "satellite" ? "satellite" : type === "debris" ? (index % 2 ? "debrisPanel" : "debrisMetal") : (index % 3 ? "meteorMedium" : "meteorLarge")
    };
  });
  const protectedPickups = [
    { type: "energy", x: formation.gapX, y: 360, r: 22, rot: 0 },
    { type: "shield", x: formation.gapX, y: 460, r: 30, rot: 0 }
  ];
  api.setCorridorScenario([formation], [...threats, ...protectedPickups]);
  const initialViolations = api.corridorViolationCount();
  assert.ok(initialViolations > 10000, `solo se detectaron ${initialViolations} invasiones`);
  assert.equal(api.clearProtectedCorridors(), initialViolations);
  assert.equal(api.corridorViolationCount(), 0);
  assert.ok(api.snapshot().counts.items > 0, "el sistema no debe borrar amenazas fuera del corredor");
  assert.deepEqual(Array.from(api.snapshot().items, (item) => item.type).filter((type) => type === "energy" || type === "shield"), ["energy", "shield"]);
});

await test("una amenaza que entra en el pasillo se retira antes de golpear", async () => {
  api.startLevel(9);
  api.update(1.3);
  const player = api.snapshot().player;
  const formation = api.createDebrisFormation(player.x);
  formation.y = player.y;
  formation.s = 0;
  const blockingMeteor = {
    type: "meteor", x: player.x, baseX: player.x, y: player.y, r: 42, s: 0, damage: 99,
    rot: 0, rs: 0, p: 0, phase: 0, amp: 0, special: "", alpha: 1,
    spriteKey: "meteorLarge", hp: 3, maxHp: 3, shape: [], craters: []
  };
  assert.equal(api.threatOverlapsGateCorridor(blockingMeteor, formation), true);
  api.setCorridorScenario([formation], [blockingMeteor]);
  api.update(1 / 60);
  assert.equal(api.snapshot().hull, 100);
  assert.equal(api.snapshot().counts.items, 0);
});

await test("sector 10 conserva suministro y presupuesto alcanzables", async () => {
  api.startLevel(9);
  const snapshot = api.snapshot();
  assert.equal(snapshot.state, "playing");
  assert.equal(snapshot.currentLevel, 9);
  assert.equal(snapshot.energyBudget, 207);
  assert.equal(snapshot.powerBudget, 5);
});

await test("frame 05 reacciona al impacto que supera la reserva y vuelve a neutro", async () => {
  let snapshot = api.snapshot();
  api.damageShip(70, snapshot.player.x + 30, snapshot.player.y);
  snapshot = api.snapshot();
  assert.equal(snapshot.hullReserve, 0);
  assert.equal(snapshot.hull, 60);
  assert.equal(snapshot.damageSmokeSide, 1);
  assert.equal(snapshot.damageSmokeLocked, true);
  assert.equal(api.playerFrameState(0).frameIndex, 5);
  assert.equal(api.playerFrameState(0).flipX, false);
  api.update(0.4);
  assert.notEqual(api.playerFrameState(0).frameIndex, 5);
});

await test("destrucción oculta la nave antes del game over", async () => {
  let snapshot = api.snapshot();
  api.damageShip(60, snapshot.player.x - 30, snapshot.player.y);
  assert.equal(api.snapshot().state, "destroying");
  api.update(0.31);
  snapshot = api.snapshot();
  assert.equal(snapshot.destructionStage, 1);
  assert.equal(snapshot.playerVisible, false);
  api.update(0.41);
  assert.equal(api.snapshot().destructionStage, 2);
  api.update(0.5);
  assert.equal(api.snapshot().state, "gameover");
});

await test("continuación única limpia residuos y reaparece al 35 %", async () => {
  api.seedResidue();
  assert.equal(api.resumeReward(), true);
  const snapshot = api.snapshot();
  assert.equal(snapshot.state, "playing");
  assert.equal(snapshot.hull, 35);
  assert.equal(snapshot.continued, true);
  assert.equal(snapshot.playerVisible, true);
  assert.equal(snapshot.player.drift, 0);
  assert.equal(snapshot.impactReactionTimer, 0);
  assert.equal(snapshot.damageSmokeLocked, true);
  assert.equal(snapshot.powers.shield, 0);
  assert.equal(snapshot.hullReserve, 15);
  assert.equal(snapshot.counts.gates, 0);
  assert.equal(snapshot.counts.shots, 0);
  assert.equal(snapshot.counts.parts, 0);
  assert.equal(snapshot.counts.rings, 0);
  assert.equal(snapshot.counts.explosions, 0);
  assert.equal(snapshot.counts.impacts, 0);
  assert.equal(snapshot.items.some((item) => item.type === "meteor" && item.y > 1280 * 0.38), false);
  assert.notEqual(api.playerFrameState(0).frameIndex, 5);
  assert.equal(api.playerFrameState(0).flipX, false);
  assert.equal(api.resumeReward(), false);
});

await test("la reserva de reaparición absorbe daño real; solo la gracia de 0,3 s tras cada golpe", async () => {
  const before = api.snapshot().hull;
  const player = api.snapshot().player;
  assert.equal(api.snapshot().hullReserve,15);
  api.damageShip(10, player.x, player.y);
  assert.equal(api.snapshot().hull,before);assert.equal(api.snapshot().hullReserve,5);
  // Propietario (22/10, J07): 0,3 s sin daño tras cada golpe; el siguiente llega después.
  api.update(0.31);
  api.damageShip(10, player.x, player.y);
  assert.equal(api.snapshot().hull,before-5);assert.equal(api.snapshot().hullReserve,0);
  assert.equal(api.snapshot().powers.shield,0);
});

await test("reiniciar Vulkar invalida la derrota de suministro pendiente de los territorios con presupuesto finito", async () => {
  // The new ten-stage Chronos route reissues missed signals. The unchanged
  // finite-supply contract remains covered in its original territorial flow.
  api.startLevel(2);
  api.setSupplyExhausted();
  api.checkSupplyFailure();
  assert.equal(api.snapshot().supplyFailureScheduled, true);
  const oldRun = api.snapshot().runToken;
  api.startLevel(2);
  assert.ok(api.snapshot().runToken > oldRun);
  await new Promise((resolve) => setTimeout(resolve, 480));
  assert.equal(api.snapshot().state, "playing");
  assert.equal(api.snapshot().supplyFailureScheduled, false);
});

await test("el viaje de diez etapas reexpide CRONIUM sin heredar la derrota por el antiguo suministro finito", async () => {
  api.startLevel(0);
  api.prepareWeaponFixture();
  api.setSupplyExhausted();
  api.checkSupplyFailure();
  assert.equal(api.snapshot().supplyFailureScheduled, false);
  assert.equal(api.snapshot().energySpawned, api.snapshot().energyBudget);
  api.advancePlayed(10.2);
  const snapshot = api.snapshot();
  assert.equal(snapshot.state, "playing");
  assert.equal(snapshot.supplyFailureScheduled, false);
  assert.equal(snapshot.collected, 0, "el fixture no recoge fragmentos automáticamente");
  assert.ok(snapshot.energySpawned > snapshot.energyBudget, "el presupuesto anterior no impide reexpedir la señal perdida");
  assert.ok(snapshot.items.some((item) => item.type === "energy"), "el nuevo fragmento recuperable debe existir en el campo real");
});

await test("continuar no repite diálogos ni la onda temporal ya vividos", async () => {
  api.startLevel(0);
  api.setStoryState({ elapsedValue: 45, step: 3, shockwaveTriggered: true });
  api.finishGame("hull");
  assert.equal(api.resumeReward(), true);
  const snapshot = api.snapshot();
  assert.equal(snapshot.elapsed, 45);
  assert.equal(snapshot.storyStep, 3);
  assert.equal(snapshot.levelOneShockwaveTriggered, true);
});

await test("límites de efectos impiden crecimiento sin control", async () => {
  api.startLevel(0);
  api.burst(360, 640, 5000, "cyan");
  assert.equal(api.snapshot().counts.parts, 320);
  api.clearTransientEffects();
  assert.equal(api.snapshot().counts.parts, 0);
});

await test("puente web concede solo la recompensa simulada confirmada", async () => {
  const dom = new JSDOM('<!doctype html><div id="adWrap"></div>', {
    url: "https://neon.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.eval(await text("native-admob.js"));
  window.eval(await text("ads-config.js"));
  window.eval(await text("ad-bridge.js"));
  const events = [];
  window.addEventListener("neon-ad-opening", () => events.push("opening"));
  window.addEventListener("neon-test-ad-rewarded", () => events.push("rewarded"));
  window.addEventListener("neon-ad-closed", () => events.push("closed"));
  assert.equal(window.AdBridge.isNative, false);
  assert.equal(await window.AdBridge.showRewarded(), true);
  assert.deepEqual(events, ["opening", "rewarded", "closed"]);
  dom.window.close();
});

await test("analytics permanece desacoplado y rechaza eventos no definidos", async () => {
  const dom = new JSDOM("<!doctype html>", {
    url: "https://neon.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.eval(await text("analytics-manager.js"));
  const delivered = [];
  assert.equal(window.AnalyticsManager.setProvider({ track: (name, data) => delivered.push({ name, data }) }), true);
  assert.equal(window.AnalyticsManager.track("unknown_event", { unsafe: true }), false);
  assert.equal(window.AnalyticsManager.track("level_start", { level: 1, nested: { ignored: true } }), true);
  assert.equal(delivered.length, 1);
  assert.equal(delivered[0].name, "level_start");
  assert.equal(JSON.stringify(delivered[0].data), JSON.stringify({ level: 1 }));
  assert.equal(window.AnalyticsManager.snapshot().length, 1);
  dom.window.close();
});

await test("puente nativo espera callbacks reales y evita listeners por llamada", async () => {
  assert.match(nativeSource, /RewardAdPluginEvents\.Rewarded/);
  assert.match(nativeSource, /rewardRequest\.earned = Boolean/);
  assert.match(nativeSource, /RewardAdPluginEvents\.Dismissed, \(\) => settleReward\(rewardRequest\?\.earned === true\)/);
  assert.match(nativeSource, /InterstitialAdPluginEvents\.Dismissed, \(\) => settleInterstitial\(true\)/);
  assert.match(nativeSource, /if \(listenerHandles\.length\) return/);
  assert.match(nativeSource, /if \(!\(await initialize\(config\)\) \|\| rewardRequest\) return false/);
});

harness.dom.window.close();

console.log(`\nRESULTADO: ${passed} pruebas automatizadas aprobadas.`);
