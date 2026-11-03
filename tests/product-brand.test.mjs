import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {previewManifest, previewPage, previewConfig, STORAGE_PREFIX} from '../scripts/build-preview.mjs';
import {CHRONOS_VOYAGE_KEY, createChronosVoyageCheckpoint, createChronosVoyage} from '../src/game/progression/chronos-flight.js';
import {SHIP_FLEET_SAVE_KEY} from '../src/game/ship/modular-ship.js';

const text = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const oldVisibleBrand = /neon\s*catcher/i;

test('NEON CRONIUM appears in live pages and accessible names without the retired wordmark', async () => {
  for (const path of ['index.html', 'preview/launcher.html', 'privacy.html', 'terms.html']) {
    const dom = new JSDOM(await text(path));
    const document = dom.window.document;
    assert.match(document.title, /neon cronium/i, path);
    assert.doesNotMatch(document.body.textContent, oldVisibleBrand, path);
    for (const element of document.querySelectorAll('[aria-label],[alt],meta[name="description"]')) {
      assert.doesNotMatch([element.getAttribute('aria-label'), element.getAttribute('alt'), element.getAttribute('content')].join(' '), oldVisibleBrand, path);
    }
    if (path === 'index.html') assert.equal(document.querySelector('.menu-topline strong').textContent, 'NEON CRONIUM');
    if (path === 'preview/launcher.html') assert.equal(document.querySelector('h1').textContent, 'NEONCRONIUM');
    dom.window.close();
  }
});

test('package, install names and generated preview agree while application identity stays compatible', async () => {
  const [pkg, lock, manifest] = await Promise.all(['package.json', 'package-lock.json', 'manifest.webmanifest'].map(async path => JSON.parse(await text(path))));
  assert.equal(pkg.name, 'neon-cronium');
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.packages[''].name, pkg.name);
  assert.equal(manifest.name, 'NEON CRONIUM');
  assert.equal(manifest.short_name, 'NEON CRONIUM');
  assert.equal(manifest.id, './');
  const html = await text('index.html');
  assert.match(previewPage(html), /<title>NEON CRONIUM<\/title>/);
  for (const nested of [false, true]) {
    const preview = JSON.parse(previewManifest(JSON.stringify(manifest), nested));
    assert.equal(preview.name, 'NEON CRONIUM');
    assert.equal(preview.short_name, 'NEON CRONIUM');
    assert.equal(preview.id, (nested ? '../' : './') + '?edition=neon-preview-v1');
  }
  assert.match(await text('capacitor.config.ts'), /appName: "NEON CRONIUM"/);
  assert.match(await text('capacitor.config.ts'), /appId: "com\.neoncronium"/);
  assert.match(await text('ios/App/App/Info.plist'), /<key>CFBundleDisplayName<\/key>\s*<string>NEON CRONIUM<\/string>/);
  assert.equal(JSON.parse(await text('ios/App/App/capacitor.config.json')).appName, 'NEON CRONIUM');
});

test('renaming preserves existing preview saves and resumes a pre-rename voyage checkpoint', () => {
  assert.equal(STORAGE_PREFIX, 'neon-preview-v1:');
  assert.equal(CHRONOS_VOYAGE_KEY, 'neonCronium.chronosVoyage.v2');
  assert.equal(SHIP_FLEET_SAVE_KEY, 'neonCronium.shipFleet.v1');
  const checkpoint = createChronosVoyageCheckpoint(5, {goal: 36, collected: 16});
  const saved = new Map([
    [STORAGE_PREFIX + CHRONOS_VOYAGE_KEY, JSON.stringify(checkpoint)],
    [STORAGE_PREFIX + 'neonCronium.flightEquipment.v1', '{"version":1,"weapon":"twin"}'],
    ['neon-best-v2', '12345']
  ]);
  const before = [...saved];
  const context = {window: {}, localStorage: {
    getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, String(value)),
    removeItem: key => saved.delete(key)
  }};
  vm.runInNewContext(previewConfig('1'.repeat(40), false), context);
  const restored = JSON.parse(context.window.NeonPreview.storage.getItem(CHRONOS_VOYAGE_KEY));
  const voyage = createChronosVoyage({goal: 36, checkpoint: restored});
  assert.equal(voyage.snapshot().stageNumber, 5);
  assert.equal(voyage.snapshot().collected, 16);
  assert.deepEqual([...saved], before, 'Opening the new name must neither migrate nor delete old data');
  assert.equal(context.window.NeonPreview.storage.getItem('neonCronium.flightEquipment.v1'), before[1][1]);
});

test('ordinary PWA gets a fresh branded cache and active art documentation resolves after the filename change', async () => {
  assert.match(await text('sw.js'), /^const CACHE = "neon-cronium-pre-release-7-2-0-orbital-hud-3";/);
  assert.match(await text('docs/PRODUCT_VISION.md'), /ART_DIRECTION_NEON_CRONIUM\.md/);
  assert.match(await text('ART_DIRECTION_NEON_CRONIUM.md'), /# NEON CRONIUM/);
  for (const path of ['ASSET_MANIFEST.json', 'ASSET_PRODUCTION_150.json']) assert.equal(JSON.parse(await text(path)).project, 'NEON CRONIUM');
});


test('principal entry exposes the continuing journey without prototypes or save manipulation', async () => {
  const html = await text('preview/launcher.html');
  const dom = new JSDOM(html, {url: 'https://entry.test/', runScripts: 'dangerously'});
  try {
    const document = dom.window.document;
    assert.equal(document.title, 'NEON CRONIUM');
    const routes = [...document.querySelectorAll('a[href^="juego/index.html"]')];
    assert.equal(routes.length, 1);
    assert.equal(routes[0].id, 'classiclink');
    assert.equal(routes[0].getAttribute('href'), 'juego/index.html');
    assert.match(routes[0].textContent, /CONTINUAR VIAJE/);
    assert.equal(document.querySelector('details, input, [href*="campaign="]'), null);
    assert.doesNotMatch(document.body.textContent, /experimental|archivo de pruebas|desbloque.*QA|compilaci[oó]n|reparaci[oó]n gratuita/i);
    assert.equal(dom.window.localStorage.length, 0, 'Opening the launcher cannot alter or unlock saved progress');
    assert.ok(document.querySelector('a[href="juego/privacy.html"]'));
    assert.ok(document.querySelector('a[href="juego/terms.html"]'));
    assert.ok(document.querySelector('a[href="juego/privacy.html#contacto"]'));
    assert.doesNotMatch(html, /localStorage|location\.(?:replace|assign)/);
  } finally { dom.window.close(); }
});

test('game main menu keeps existing journey controls with no visible charge counter or build badge', async () => {
  const dom = new JSDOM(await text('index.html'));
  try {
    const document = dom.window.document;
    assert.equal(document.getElementById('playLabel').textContent, 'CONTINUAR VIAJE');
    for (const id of ['play','levels','settings','how','best','unlockedText','totalStars','campaignPercent','campaignFill','campaignNodes']) assert.ok(document.getElementById(id), id);
    assert.equal(document.querySelector('#menu .build-version'), null);
    assert.doesNotMatch(document.getElementById('menu').textContent, /experimental|archivo de pruebas|pre-release|V7\./i);
    const isolated = new JSDOM(previewPage(await text('index.html')));
    try {
      assert.equal(isolated.window.document.title, 'NEON CRONIUM');
      assert.doesNotMatch(isolated.window.document.getElementById('menu').textContent, /experimental|cambiar modo|archivo de pruebas|pre-release/i);
      assert.equal(isolated.window.document.querySelector('#menu a[href="../index.html"]'), null);
    } finally { isolated.window.close(); }
    const ammo = document.getElementById('ammo');
    assert.ok(ammo.hidden);
    assert.equal(ammo.getAttribute('aria-hidden'), 'true');
    assert.equal(ammo.textContent, '');
    assert.equal(document.getElementById('fire').getAttribute('aria-label'), 'Disparar');
    assert.ok(document.querySelector('#menu .menu-ship-image[src="assets/player_ship_identity_v1.webp"]'));
    assert.match(document.getElementById('instructions').textContent, /veinte disparos/);
    assert.doesNotMatch(document.getElementById('instructions').textContent, /tres cargas|3,6 segundos|inst[aá]lalo en C9/);
  } finally { dom.window.close(); }
});


test('support entry resolves to a readable contact section without inventing a public address', async () => {
  const dom = new JSDOM(await text('privacy.html'));
  try {
    assert.equal(dom.window.document.getElementById('contacto').textContent, 'Contacto');
    assert.match(dom.window.document.getElementById('contacto').nextElementSibling.textContent, /canal p[uú]blico de soporte todav[ií]a no est[aá] definido/);
    assert.match(dom.window.document.querySelector('style').textContent, /html,body\{[^}]*overflow:auto/);
  } finally { dom.window.close(); }
});
