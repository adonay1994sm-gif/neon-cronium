import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const root = resolve(process.env.V7_ROOT || ".");
let passed = 0;
const text = (path) => readFile(join(root, path), "utf8");
const exists = (path) => stat(join(root, path)).then(() => true, () => false);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const withoutQuery = (path) => path.replace(/[?#].*$/, "").replace(/^\.\//, "");

async function test(name, operation) {
  await operation();
  passed += 1;
  console.log(`PASS ${String(passed).padStart(2, "0")} · ${name}`);
}

const [indexHtml, gameSource, serviceWorkerSource, styles, coreSource, contentSource] = await Promise.all([
  text("index.html"), text("game.js"), text("sw.js"), text("styles.css"), text("core-runtime.js"), text("content-runtime.js")
]);

await test("JavaScript principal, runtime y service worker tienen sintaxis válida", async () => {
  new vm.Script(gameSource, { filename: "game.js" });
  new vm.Script(coreSource, { filename: "core-runtime.js" });
  new vm.Script(serviceWorkerSource, { filename: "sw.js" });
});

await test("versión interna y caché conservan compatibilidad sin insignia técnica en portada", async () => {
  assert.doesNotMatch(indexHtml, />[^<]*V7\.2\.0[^<]*</);
  assert.match(indexHtml, /NEON CRONIUM/);
  assert.match(indexHtml, /CONTINUAR VIAJE/);
  assert.doesNotMatch(indexHtml, /Compilación V7|Pre-Release/);
  assert.match(gameSource, /BUILD_VERSION = "7\.2\.0"/);
  assert.match(serviceWorkerSource, /neon-cronium-pre-release-7-2-0/);
  assert.doesNotMatch(indexHtml, /[?&]v=6\.8\.0/);
});

await test("HTML conserva todas sus referencias locales", async () => {
  const references = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|data:|#)/.test(reference)) continue;
    assert.equal(await exists(withoutQuery(reference)), true, `referencia rota: ${reference}`);
  }
});

const swContext = {
  self: { addEventListener() {}, skipWaiting() {}, clients: { claim() {} }, location: { origin: "https://neon.test" } },
  caches: {}, fetch() {}, URL
};
vm.runInNewContext(`${serviceWorkerSource}\nglobalThis.__SW_TEST__ = { CACHE, CORE };`, swContext);

await test("PWA precarga código, legales y sprites", async () => {
  assert.equal(swContext.__SW_TEST__.CACHE,"neon-cronium-pre-release-7-2-0-orbital-hud-2");
  const paths = new Set(swContext.__SW_TEST__.CORE.map(withoutQuery));
  const manifest = JSON.parse(await text("ASSET_MANIFEST.json"));
  for (const path of [
    "index.html", "styles.css", "game.js", "core-runtime.js", "manifest.webmanifest",
    "privacy.html", "terms.html", "analytics-manager.js", "assets/player_ship_identity_v1.webp", "assets/ship_modular_atlas_v1.webp", "assets/comet_flight_atlas_v3.webp",
    "assets/chronos_shockwave_atlas_v1.webp",
    "assets/ch02_interceptor_atlas_v1.webp", "assets/guardian_atlas_states_v2.webp", "assets/cronium_energy_atlas_v2.webp",
    "assets/combat_sfx_atlas_v2.m4a", "assets/combat_sfx_atlas_v2.json", "assets/c9_upgrade_icons_v1.webp", "assets/forja_modules_atlas_v1.webp"
  ]) assert.ok(paths.has(path), path);
  // The live ship and its emergency portrait must agree with the inventory;
  // preserved artwork is not a reason to restore retired images to precache.
  for (const active of ["assets/player_ship_identity_v1.webp", "assets/ship_modular_atlas_v1.webp", "assets/comet_flight_atlas_v3.webp", "assets/ch02_interceptor_atlas_v1.webp"]) {
    const entry = manifest.standalone.find(asset => asset.path === active);
    assert.ok(entry, `recurso activo sin inventario: ${active}`);
    assert.notEqual(entry.activeRuntime, false, active);
    assert.notEqual(entry.precache, false, active);
    const bytes = await readFile(join(root, active));
    assert.ok(bytes.length > 0, `recurso activo vacío: ${active}`);
    assert.equal(bytes.length, entry.size, `tamaño de inventario: ${active}`);
    if (entry.sha256) assert.equal(sha256(bytes), entry.sha256, `huella de inventario: ${active}`);
  }
  // Propietario (25/10): el arte retirado se borra (sigue en el historial de git).
  const retiredShip = Array.from({length: 6}, (_, index) => `assets/ship_frame_${String(index).padStart(2, "0")}.webp`);
  assert.equal(manifest.groups.some(group => group.id === "ship"), false);
  for(const retired of [...retiredShip, 'assets/comet_animation_sheet_v1.webp', 'assets/cronos_prime_trail_v1.webp']) {
    assert.equal(paths.has(retired),false,`referencia retirada precargada: ${retired}`);
    assert.equal(await exists(retired),false,`arte retirado todavía en el juego: ${retired}`);
  }
});

await test("parallax V7 reemplaza la antigua rejilla", async () => {
  assert.match(gameSource, /const spaceDust = Array\.from/);
  assert.match(gameSource, /const foregroundParticles = Array\.from/);
  assert.match(gameSource, /Capa lejana/);
  assert.doesNotMatch(gameSource, /const horizon = H \* 0\.72/);
});

await test("núcleo, tractor, phaser, pulso, motores y HUD tienen respuesta multietapa", async () => {
  for (const marker of [
    "directionalBurst", "const targetWidth", "const volume = ctx.createLinearGradient",
    "flashPhase", "muzzle.addColorStop", 'style === "pulse"', "pose.enginePulse", "updateHudVisual"
  ]) assert.ok(gameSource.includes(marker), marker);
  assert.match(styles, /@keyframes hudPop/);
  assert.match(styles, /@keyframes hudDamage/);
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
    set(target, property, value) { target[property] = value; return true; }
  });
}

async function loadHarness(campaign = "") {
  const dom = new JSDOM(indexHtml, { url: `https://neon.test/${campaign ? "?campaign="+campaign : ""}`, runScripts: "outside-only", pretendToBeVisual: true });
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
    constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
    set src(value) { this._src = value; this.complete = true; this.naturalWidth = 720; this.naturalHeight = 1280; }
    get src() { return this._src || ""; }
  };
  window.localStorage.setItem("neon-unlocked-v2", "10");
  window.eval(coreSource);
  window.eval(contentSource);
  const marker = "  legacyFrameId = requestAnimationFrame(frame);\n})();";
  assert.ok(gameSource.includes(marker), "punto de instrumentación ausente");
  const hooks = `
  window.__NEON_V7_TEST__ = {
    snapshot: () => ({
      state, hull, hullReserve:classicHullReserve, score, collected, currentLevel, energyBudget, powerBudget, ammo, manualShotCooldown, warpTimer,
      displayedScore, hudScoreTarget, visualSpeed, shake, levelOneShockwave,
      weapons: classicWeapons ? NeonCampaign.classicWeaponSnapshot(classicWeapons) : null,
      player: { ...player }, powers: { ...powers },
      counts: { items: items.length, shots: shots.length, rings: rings.length, parts: parts.length }
    }),
    levels: LEVELS.map((entry) => ({ ...entry })),
    keys: { ...KEYS },
    collisionOutline: SHIP_COLLISION_OUTLINE.map((point) => [...point]),
    startLevel, damageShip, update, render, firePhaser, fireManualShot, pulseRing,
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
    setPower: (name, value) => { powers[name] = value; },
    seedThreat: () => items.push({ type: "meteor", x: player.x, baseX: player.x, y: player.y - 260, r: 32, s: 0, rot: 0, rs: 0, p: 0, phase: 0, amp: 0, alpha: 1, hp: 1, damage: 25, spriteKey: "meteorMedium" })
  };
  legacyFrameId = requestAnimationFrame(frame);
})();`;
  window.eval(gameSource.replace(marker, hooks));
  return { dom, window, api: window.__NEON_V7_TEST__ };
}

const harness = await loadHarness();
const { api } = harness;

await test("campaña, guardados, balance y tamaño visual permanecen compatibles", async () => {
  assert.equal(api.levels.length, 10);
  assert.deepEqual(Array.from(api.levels, (entry) => entry.goal), [36,45,60,75,90,105,120,135,150,165]);
  assert.deepEqual({ ...api.keys }, {
    best: "neon-best-v2", unlocked: "neon-unlocked-v2", stars: "neon-stars-v2",
    levelBest: "neon-level-best-v2", games: "neon-games-v2", settings: "neon-settings-v5"
  });
  assert.match(gameSource, /SHIP_VISUAL_SCALE = 0\.8/);
});

await test("hitbox clásica al 52 % con ajuste interior conserva extremos visibles", async () => {
  const outline=Array.from(api.collisionOutline,point=>Array.from(point));
  assert.equal(outline.length,30);
  assert.equal(sha256(JSON.stringify(outline)), "a40789b028be6be21f4e38897310e205ff2008bc05c4c6cdef03712215077622");
  assert.ok(Math.abs(Math.min(...outline.map(point=>point[1]))+61.568)<1e-9);
  assert.ok(Math.abs(Math.max(...outline.map(point=>Math.abs(point[0])))-51.012)<1e-9);
  assert.ok(Math.abs(Math.max(...outline.map(point=>point[1]))-39.104)<1e-9);
});

await test("arranque de nivel conserva presupuestos y estados limpios", async () => {
  api.startLevel(0);
  const snapshot = api.snapshot();
  assert.equal(snapshot.state, "playing");
  assert.equal(snapshot.hull, 100);
  assert.equal(snapshot.energyBudget, 45);
  assert.equal(snapshot.powerBudget, 2);
  assert.equal(snapshot.displayedScore, 0);
  assert.equal(snapshot.ammo, 20);
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
  assert.equal(harness.window.document.getElementById('ammo').textContent, '');
  assert.doesNotMatch(harness.window.document.getElementById('fire').getAttribute('aria-label'), /\d|segundos|cargas/i);
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

await test("daño consume la reserva antes del casco y mantiene respuesta de cámara/HUD", async () => {
  let snapshot = api.snapshot();
  api.damageShip(35, snapshot.player.x + 20, snapshot.player.y);
  snapshot = api.snapshot();
  assert.equal(snapshot.hullReserve, 0);
  assert.equal(snapshot.hull, 95);
  assert.ok(snapshot.shake > 0);
});

await test("phaser y pulso V7 se ejecutan sin errores en el Canvas", async () => {
  api.startLevel(0);
  api.setPower("phaser", 2);
  api.seedThreat();
  api.firePhaser();
  api.pulseRing(360, 640, "#a5faff", 245, 0.56, "pulse");
  api.update(0.016);
  api.render(1000);
  const snapshot = api.snapshot();
  assert.ok(snapshot.counts.shots >= 1);
  assert.ok(snapshot.counts.rings >= 1);
});

await test("simulación prolongada mantiene efectos y entidades bajo control", async () => {
  api.startLevel(0);
  for (let frame = 0; frame < 900; frame++) {
    api.update(1 / 60);
    api.render(frame * (1000 / 60));
  }
  const snapshot = api.snapshot();
  assert.ok(["playing", "destroying", "gameover"].includes(snapshot.state));
  assert.ok(snapshot.counts.parts <= 320, `partículas fuera de pool: ${snapshot.counts.parts}`);
  assert.ok(snapshot.counts.items < 80, `entidades sin limpiar: ${snapshot.counts.items}`);
});

harness.dom.window.close();
console.log(`\nRESULTADO V7: ${passed} pruebas aprobadas.`);
