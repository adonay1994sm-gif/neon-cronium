import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

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
const indexHtml = await text("index.html");
const gameSource = await text("game.js");
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
  assert.equal(result.preservedCount, 1); // solo assets/.gitkeep: el arte retirado se borra (25/10)
  assert.equal(result.actualBytes, assetManifest.runtimeBytes);
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
  for (const path of ["index.html", "game.js", "content-runtime.js", "native-admob.js", "assets/player_ship_identity_v1.webp", "assets/smoke_frame_02.webp"]) {
    const [web, ios] = await Promise.all([
      readFile(join(root, "www", path)),
      readFile(join(root, "ios/App/App/public", path))
    ]);
    assert.equal(sha256(web), sha256(ios), path);
  }
});

await test("puente nativo conserva callbacks y listeners únicos", async () => {
  assert.match(nativeSource, /RewardAdPluginEvents\.Rewarded/);
  assert.match(nativeSource, /rewardRequest\.earned = Boolean/);
  assert.match(nativeSource, /RewardAdPluginEvents\.Dismissed, \(\) => settleReward\(rewardRequest\?\.earned === true\)/);
  assert.match(nativeSource, /InterstitialAdPluginEvents\.Dismissed, \(\) => settleInterstitial\(true\)/);
  assert.match(nativeSource, /if \(listenerHandles\.length\) return/);
  assert.match(nativeSource, /if \(!\(await initialize\(config\)\) \|\| rewardRequest\) return false/);
});

console.log(`\nRESULTADO ESTÁTICO: ${passed} pruebas aprobadas.`);
