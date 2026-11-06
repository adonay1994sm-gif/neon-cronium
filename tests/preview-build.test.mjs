import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {PREVIEW_BRANCH, STORAGE_PREFIX, previewGame, previewWorker, previewLauncherWorker,
  previewManifest, previewConfig, previewPage} from '../scripts/build-preview.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'preview-dist');
const text = file => readFile(join(root, file), 'utf8');
const sha256 = value => createHash('sha256').update(value).digest('hex');

function assertOneMainJourney(document) {
  const mainLink = document.getElementById('classiclink');
  assert.ok(mainLink, 'The canonical journey remains the primary entry');
  assert.equal(mainLink.getAttribute('href'), 'juego/index.html');
  assert.match(mainLink.textContent, /CONTINUAR VIAJE/);
  assert.equal(mainLink.closest('details'), null, 'The principal journey must be visible');
  for (const id of ['qaArchive','journeylink','n7link','unlockClassic','unlock','storageStatus']) {
    assert.equal(document.getElementById(id), null, `${id} cannot expose an archived variant or QA unlock`);
  }
  const principalEntries = [...document.querySelectorAll('a[href^="juego/index.html"]')];
  assert.deepEqual(principalEntries, [mainLink]);
  assert.equal(document.querySelector('a[href*="campaign="]'), null);
  assert.doesNotMatch(document.body.textContent, /ARCHIVO DE PRUEBAS|VERSIÓN EXPERIMENTAL|PRUEBA EXPERIMENTAL|V7\.2\.0/i);
  assert.equal(document.title, 'NEON CRONIUM');
}

// Tests named "unit:" do not require or create build output.
test('unit: preview offers the canonical journey without archived variants or QA controls', async () => {
  const dom = new JSDOM(await text('preview/launcher.html'));
  try { assertOneMainJourney(dom.window.document); }
  finally { dom.window.close(); }
  const game = new JSDOM(await text('index.html'));
  try {
    assert.equal(game.window.document.getElementById('playLabel').textContent, 'CONTINUAR VIAJE');
    assert.match(game.window.document.querySelector('.menu-panel > p').textContent, /Chronos ha sido atacado/);
    assert.match(game.window.document.querySelector('.menu-panel > p').textContent, /CRONIUM/);
  } finally { game.window.close(); }
});

test('unit: isolated storage never reads, overwrites or removes normal campaign keys', () => {
  const data = new Map([['neon-unlocked-v2', '8'], ['neon-n7-unlocked-v1', '42'], ['neon-settings-v5', '{"music":12}']]);
  const storage = {getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key)};
  const context = {window: {}, localStorage: storage};
  vm.runInNewContext(previewConfig('a'.repeat(40), true), context);
  const isolated = context.window.NeonPreview.storage;
  assert.equal(isolated.getItem('neon-unlocked-v2'), null);
  assert.equal(isolated.getItem('neon-n7-unlocked-v1'), null);
  isolated.setItem('neon-n7-unlocked-v1', '100');
  isolated.setItem('neon-unlocked-v2', '2');
  isolated.setItem('neon-settings-v5', '{}');
  isolated.removeItem('neon-unlocked-v2');
  assert.equal(data.get('neon-n7-unlocked-v1'), '42');
  assert.equal(data.get('neon-unlocked-v2'), '8');
  assert.equal(data.get('neon-settings-v5'), '{"music":12}');
  assert.equal(data.get(`${STORAGE_PREFIX}neon-n7-unlocked-v1`), '100');
  assert.equal(context.window.NeonPreview.dirty, true);
});

test('unit: preview transforms require the actual game markers and preserve ordinary input', async () => {
  const source = await text('game.js');
  const html = await text('index.html');
  const transformed = previewGame(source);
  // En la preview, el modo desarrollo (?dev=1) guarda aparte; si no, el guardado de la preview.
  assert.match(transformed, /createStorageService\(HARDCORE\?\.storage \?\? \(window\.NeonDev\?\.storage \|\| window\.NeonPreview\.storage\)\)/);
  assert.doesNotMatch(transformed, /VER ANUNCIO Y REPARAR/);
  assert.equal(source, await text('game.js'));
  assert.match(previewPage(html), /preview-config\.js/);
  assert.doesNotMatch(previewPage(html), /PRUEBA EXPERIMENTAL|CAMBIAR MODO|Prueba experimental/);
  const transformedPage = new JSDOM(previewPage(html));
  try {
    assert.equal(transformedPage.window.document.title, 'NEON CRONIUM');
    assert.equal(transformedPage.window.document.getElementById('playLabel').textContent, 'CONTINUAR VIAJE');
  } finally { transformedPage.window.close(); }
  assert.equal(html, await text('index.html'));
  assert.throws(() => previewGame('unexpected source'), /exactly one marker/);
  assert.throws(() => previewPage('unexpected source'), /exactly one marker/);
});

test('unit: the canonical launcher does not access storage and still exposes its entry when storage is blocked', async () => {
  const html = await text('preview/launcher.html');
  assert.doesNotMatch(html, /localStorage|sessionStorage|unlockClassic|n7link|journeylink/);
  let storageReads = 0;
  const dom = new JSDOM(html, {url: 'https://preview.test/', runScripts: 'dangerously', beforeParse(window) {
    Object.defineProperty(window, 'localStorage', {get() {storageReads++;throw new Error('blocked');}});
  }});
  try {
    const {window} = dom;
    assertOneMainJourney(window.document);
    const link = window.document.getElementById('classiclink');
    let clicks = 0;
    link.addEventListener('click', event => {clicks++;event.preventDefault();}); // Suppress JSDOM navigation only.
    link.dispatchEvent(new window.Event('click', {cancelable: true}));
    assert.equal(clicks, 1);
    assert.equal(link.getAttribute('href'), 'juego/index.html');
    assert.equal(storageReads, 0, 'The presentation layer cannot require or alter a save before entry');
  } finally {dom.window.close();}
});

test('unit: entering the canonical journey preserves ordinary, historical, achievement and salvage saves byte for byte', async () => {
  const dom = new JSDOM(await text('preview/launcher.html'), {url: 'https://preview.test/', runScripts: 'dangerously'});
  try {
    const {window} = dom;
    const saved = {'neon-unlocked-v2':'7', [`${STORAGE_PREFIX}neon-stars-v2`]:'{"1":2}',
      [`${STORAGE_PREFIX}neon-unlocked-v2`]:'2', [`${STORAGE_PREFIX}neon-n7-unlocked-v1`]:'37',
      [`${STORAGE_PREFIX}neonCronium.classicSalvage.v1`]:'{"fixture":"opaque archived bytes"}'};
    for (const [key,value] of Object.entries(saved)) window.localStorage.setItem(key,value);
    const link = window.document.getElementById('classiclink');
    link.addEventListener('click', event => event.preventDefault());
    for (let index=0;index<2;index++) link.dispatchEvent(new window.Event('click', {cancelable:true}));
    for (const [key,value] of Object.entries(saved)) assert.equal(window.localStorage.getItem(key), value);
    assert.deepEqual(Object.keys(window.localStorage).sort(),Object.keys(saved).sort(),
      'A normal entry cannot add automatic unlocks or replace existing save namespaces');
    assert.equal(window.document.querySelector('input[type="checkbox"]'),null);
  } finally {dom.window.close();}
});

test('unit: isolated installation opens the canonical entry with one identity from either entry point', async () => {
  const source = await text('manifest.webmanifest');
  const base = 'https://preview.test/prueba/';
  const identity = base + '?edition=neon-preview-v1';
  for (const nested of [false, true]) {
    const manifestURL = base + (nested ? 'juego/' : '') + 'manifest.webmanifest';
    const manifest = JSON.parse(previewManifest(source, nested));
    assert.equal(new URL(manifest.id, manifestURL).href, identity);
    assert.equal(new URL(manifest.start_url, manifestURL).href, base + 'index.html');
    assert.equal(new URL(manifest.scope, manifestURL).href, base);
    assert.equal(manifest.name, 'NEON CRONIUM');
    assert.doesNotMatch(manifest.description, /experimental|selector|N-7/i);
    for (const icon of manifest.icons) {
      assert.ok(new URL(icon.src, manifestURL).href.startsWith(base + 'juego/assets/'));
    }
  }
  assert.equal(source, await text('manifest.webmanifest'), 'Ordinary installation identity must remain untouched');
});

function launcherWorkerHarness(revision) {
  const scope = 'https://preview.test/prueba/';
  const prefix = `neon-preview-launcher-v1:${scope}::`;
  const deleted = [], matches = [], additions = [], handlers = {};
  const names = [`${prefix}old`, `${prefix}${revision}`, `neon-preview-launcher-v1:${scope}child/::old`,
    `neon-preview-v1:${scope}juego/::old`, 'neon-cronium-pre-release-7-2-0', 'unrelated-app'];
  const sandbox = {
    URL,
    self: {registration: {scope}, addEventListener: (name, callback) => {handlers[name] = callback;},
      skipWaiting() {}, clients: {claim() {}}},
    caches: {keys: async () => names, delete: async name => {deleted.push(name);},
      match() {throw new Error('Origin-wide cache lookup forbidden');},
      open: async name => ({
        match: async request => {matches.push({name, request}); return `cached:${request}`;},
        addAll: async paths => {additions.push(...paths);}
      })},
    fetch: async () => {throw new Error('offline');}
  };
  vm.runInNewContext(previewLauncherWorker(revision), sandbox);
  return {handlers, deleted, matches, additions, prefix, scope};
}

test('unit: launcher worker caches its shell and preserves game and unrelated caches', async () => {
  const worker = launcherWorkerHarness('c'.repeat(64));
  let installation, activation;
  worker.handlers.install({waitUntil: promise => {installation = promise;}});
  await installation;
  assert.ok(worker.additions.includes(worker.scope + 'index.html'));
  assert.ok(worker.additions.includes(worker.scope + 'manifest.webmanifest'));
  assert.ok(worker.additions.includes(worker.scope + 'build-info.json'));
  for (const resource of ['juego/assets/chronos_flight_space_v1.webp','juego/privacy.html','juego/terms.html']) {
    assert.ok(worker.additions.includes(worker.scope + resource), resource);
  }
  assert.ok(worker.additions.some(url => new URL(url).pathname.endsWith('/juego/styles.css')));
  assert.ok(!worker.additions.includes(worker.scope + 'juego/index.html'));
  worker.handlers.activate({waitUntil: promise => {activation = promise;}});
  await activation;
  assert.deepEqual(worker.deleted, [`${worker.prefix}old`]);
});

test('unit: launcher worker serves the selector offline without intercepting game or foreign pages', async () => {
  const worker = launcherWorkerHarness('d'.repeat(64));
  for (const path of ['', 'index.html?source=installed', 'manifest.webmanifest', 'juego/privacy.html#contacto', 'juego/terms.html', 'juego/assets/chronos_flight_space_v1.webp', 'juego/styles.css?v=7.2.0']) {
    let response;
    worker.handlers.fetch({request: {method: 'GET', mode: 'navigate', url: worker.scope + path},
      respondWith: value => {response = value;}});
    assert.equal(await response, 'cached:' + worker.scope + path.split(/[?#]/)[0]);
  }
  for (const url of [worker.scope + 'juego/index.html?campaign=n7', worker.scope + 'juego/game.js',
    worker.scope + 'other.html', 'https://preview.test/index.html', 'https://elsewhere.test/']) {
    worker.handlers.fetch({request: {method: 'GET', mode: 'navigate', url},
      respondWith() {assert.fail(`Launcher intercepted a foreign resource: ${url}`);}});
  }
  assert.ok(worker.matches.every(match => match.name.startsWith(worker.prefix)));
});

function workerHarness(source, revision) {
  const scope = 'https://preview.test/juego/';
  const prefix = `neon-preview-v1:${scope}::`;
  const deleted = [], matches = [], handlers = {};
  const names = ['neon-cronium-pre-release-7-2-0', 'unrelated-app', `${prefix}old`, `${prefix}${revision}`, `neon-preview-v1:${scope}child/::old`];
  const sandbox = {
    URL,
    self: {registration: {scope}, location: {origin: 'https://preview.test'},
      addEventListener: (name, callback) => {handlers[name] = callback;}, skipWaiting() {}, clients: {claim() {}}},
    caches: {keys: async () => names, delete: async name => {deleted.push(name);},
      match() {throw new Error('Origin-wide cache lookup forbidden');},
      open: async name => ({match: async request => {matches.push({name, request}); return typeof request === 'string' ? 'scoped-index' : undefined;}, addAll: async () => {}})},
    fetch: async () => {throw new Error('offline');}
  };
  vm.runInNewContext(previewWorker(source, revision), sandbox);
  return {handlers, deleted, matches, prefix, scope};
}

test('unit: preview worker preserves foreign caches and nested-scope caches', async () => {
  const revision = 'a'.repeat(64);
  const worker = workerHarness(await text('sw.js'), revision);
  let activation;
  worker.handlers.activate({waitUntil: promise => {activation = promise;}});
  await activation;
  assert.deepEqual(worker.deleted, [`${worker.prefix}old`]);
});

test('unit: offline navigation uses only the scoped cache and ignores foreign paths', async () => {
  const worker = workerHarness(await text('sw.js'), 'b'.repeat(64));
  let response;
  worker.handlers.fetch({request: {method: 'GET', mode: 'navigate', url: `${worker.scope}index.html?campaign=n7`}, respondWith: value => {response = value;}});
  assert.equal(await response, 'scoped-index');
  assert.equal(worker.matches.at(-1).request, `${worker.scope}index.html`);
  assert.ok(worker.matches.every(item => item.name.startsWith(worker.prefix)));
  worker.handlers.fetch({request: {method: 'GET', url: 'https://preview.test/index.html'}, respondWith() {assert.fail('Foreign path must not be intercepted');}});
});

function runNetlifyPreviewGate({mode, flag = '1', branch = PREVIEW_BRANCH,
  context = 'branch-deploy', netlify = '', siteName = '', siteId = '', url = ''} = {}) {
  const script = join(root, 'scripts/netlify-preview-gate.mjs');
  return spawnSync(process.execPath, [script, mode], {
    // Never inherit the build machine's Netlify identity: on the isolated test
    // project those values are legitimate, but cannot contaminate deny cases.
    encoding: 'utf8', env: {...process.env, NETLIFY: netlify, SITE_NAME: siteName,
      SITE_ID: siteId, URL: url, NEON_PREVIEW_DEPLOY: flag, BRANCH: branch, CONTEXT: context}
  });
}

test('unit: Netlify opt-in cannot authorize other branches or PR deploy contexts', () => {
  const run = (mode, flag, branch = PREVIEW_BRANCH, context = 'branch-deploy') =>
    runNetlifyPreviewGate({mode, flag, branch, context});
  assert.equal(run('--ignore', '').status, 0);
  assert.equal(run('--require-enabled', '').status, 1);
  assert.equal(run('--ignore', '1').status, 1);
  assert.equal(run('--require-enabled', '1').status, 0);
  for (const [branch, context] of [['continuity-assets-audit-20261013', 'branch-deploy'], ['another-branch', 'branch-deploy'], [PREVIEW_BRANCH, 'production'], [PREVIEW_BRANCH, 'deploy-preview']]) {
    assert.equal(run('--require-enabled', '1', branch, context).status, 1, `${branch}/${context}`);
    assert.equal(run('--ignore', '1', branch, context).status, 0, `${branch}/${context}`);
  }
  assert.equal(run('--require-enabled', '1', PREVIEW_BRANCH, 'local').status, 0);
  assert.equal(run('--ignore', '1', PREVIEW_BRANCH, 'local').status, 1);
  assert.equal(run('--unknown', '1').status, 2);
});

test('unit: Netlify production permits only the explicitly opted-in isolated test site and exact HTTPS origin', () => {
  const isolated = {context: 'production', netlify: 'true', siteName: 'neon-preview-deploy',
    siteId: '', url: 'https://neon-preview-deploy.netlify.app', flag: '1', branch: PREVIEW_BRANCH};
  for (const mode of ['--require-enabled', '--ignore']) {
    const result = runNetlifyPreviewGate({...isolated, mode});
    assert.equal(result.status, mode === '--ignore' ? 1 : 0,
      `the owner-designated test site must build in its production context: ${mode}\n${result.stderr}`);
  }
  const rejected = [
    ['missing opt-in', {flag: ''}],
    ['wrong opt-in', {flag: 'true'}],
    ['retired continuity branch', {branch: 'continuity-assets-audit-20261013'}],
    ['another branch', {branch: 'another-preview'}],
    ['PR deployment context', {context: 'deploy-preview'}],
    ['unknown context', {context: 'preview'}],
    ['missing Netlify marker', {netlify: ''}],
    ['wrong Netlify marker', {netlify: '1'}],
    ['missing site name', {siteName: ''}],
    ['original site', {siteName: 'neoncatcheroriginal', url: 'https://neoncatcheroriginal.netlify.app'}],
    ['original site with copied preview URL', {siteName: 'neoncatcheroriginal'}],
    ['previous mistaken site identity', {siteName: 'neonpreviewdeploy', url: 'https://neonpreviewdeploy.netlify.app'}],
    ['correct site name with previous mistaken host', {url: 'https://neonpreviewdeploy.netlify.app'}],
    ['previous mistaken site name with correct host', {siteName: 'neonpreviewdeploy'}],
    ['unknown site', {siteName: 'some-other-test-site'}],
    ['site name suffix', {siteName: 'neon-preview-deploy-copy'}],
    ['missing URL', {url: ''}],
    ['malformed URL', {url: 'not-a-url'}],
    ['original host', {url: 'https://neoncatcheroriginal.netlify.app'}],
    ['unknown host', {url: 'https://some-other-test-site.netlify.app'}],
    ['host suffix spoof', {url: 'https://neon-preview-deploy.netlify.app.example.invalid'}],
    ['host prefix spoof', {url: 'https://copy-neon-preview-deploy.netlify.app'}],
    ['HTTP transport', {url: 'http://neon-preview-deploy.netlify.app'}],
    ['userinfo', {url: 'https://user@neon-preview-deploy.netlify.app'}],
    ['username and password', {url: 'https://user:password@neon-preview-deploy.netlify.app'}],
    ['userinfo host confusion', {url: 'https://neon-preview-deploy.netlify.app@example.invalid'}],
    ['non-default port', {url: 'https://neon-preview-deploy.netlify.app:8443'}]
  ];
  for (const [label, overrides] of rejected) {
    for (const mode of ['--require-enabled', '--ignore']) {
      const result = runNetlifyPreviewGate({...isolated, ...overrides, mode});
      assert.equal(result.status, mode === '--ignore' ? 0 : 1,
        `${label} cannot authorize production: ${mode}\n${result.stdout}\n${result.stderr}`);
    }
  }
});

test('unit: Netlify preview opt-in is scoped only to the authorized branch configuration', async () => {
  const config = await text('netlify.toml');
  assert.equal(PREVIEW_BRANCH, 'main');
  const branchEnvironment = config.match(
    /\[context\.main\.environment\]([\s\S]*?)(?=\n\[|$)/
  );
  assert.ok(branchEnvironment, 'authorized branch environment block');
  assert.match(branchEnvironment[1], /\bNEON_PREVIEW_DEPLOY\s*=\s*"1"/);

  const globalEnvironment = config.match(/\[build\.environment\]([\s\S]*?)(?=\n\[|$)/);
  assert.ok(globalEnvironment, 'global build environment block');
  assert.doesNotMatch(globalEnvironment[1], /\bNEON_PREVIEW_DEPLOY\b/,
    'the preview opt-in must never be global');
});

test('built launcher has one canonical journey and resolving package paths without historical variant controls', async () => {
  const html = await readFile(join(dist, 'index.html'), 'utf8');
  const dom = new JSDOM(html);
  try { assertOneMainJourney(dom.window.document); }
  finally { dom.window.close(); }
  assert.match(html, /juego\/assets\/player_ship_identity_v1\.webp/);
  assert.doesNotMatch(html, /neon-preview-v1:neon-n7-unlocked-v1|localStorage|unlockClassic/);
  assert.doesNotMatch(html, /__NEON_PREVIEW_/);
  assert.match(html, /rel="manifest" href="manifest.webmanifest"/);
  assert.match(html, /register\('launcher-sw\.js'/);
  for (const name of ['manifest.webmanifest', 'launcher-sw.js', 'build-info.json']) {
    assert.ok((await stat(join(dist, name))).size > 0, name);
  }
  for (const name of ['index.html', 'game.js', 'core-runtime.js', 'content-runtime.js', 'preview-config.js', 'sw.js', 'assets/player_ship_identity_v1.webp']) {
    assert.ok((await stat(join(dist, 'juego', name))).size > 0, name);
  }
  const page = await readFile(join(dist, 'juego/index.html'), 'utf8');
  for (const [, path] of page.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^" ]*)?"/g)) {
    if (/^https?:/.test(path)) assert.fail(`External preview dependency: ${path}`);
    else assert.ok((await stat(join(dist, 'juego', path))).isFile(), path);
  }
});

test('built preview manifest consistently launches the offline selector', async () => {
  const source = await text('manifest.webmanifest');
  assert.equal(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'), previewManifest(source));
  assert.equal(await readFile(join(dist, 'juego/manifest.webmanifest'), 'utf8'), previewManifest(source, true));
  assert.match(await readFile(join(dist, 'juego/index.html'), 'utf8'), /rel="manifest" href="\.\.\/manifest\.webmanifest"/);
  const info = JSON.parse(await readFile(join(dist, 'build-info.json'), 'utf8'));
  assert.equal(info.launcherServiceWorkerScope, './');
  assert.equal(info.serviceWorkerScope, './juego/');
  assert.equal(await readFile(join(dist, 'launcher-sw.js'), 'utf8'), previewLauncherWorker(info.revision));
});

test('preview preserves core, content and every original asset byte for byte', async () => {
  for (const file of ['core-runtime.js', 'content-runtime.js', 'styles.css', ...(await readdir(join(root, 'www/assets'))).map(name => `assets/${name}`)]) {
    // Huellas, no los archivos: si el paquete está viejo, comparar megas enteros agotaba la memoria (auditoría 25/10, A10).
    assert.equal(sha256(await readFile(join(dist, 'juego', file))), sha256(await readFile(join(root, 'www', file))),
      `${file} (si falla, regenera el paquete: BRANCH=main npm run build:preview)`);
  }
});

test('preview-only transforms do not change the default web root or native game', async () => {
  const source = await readFile(join(root, 'www/game.js'), 'utf8');
  const ordinaryPage = await readFile(join(root, 'www/index.html'), 'utf8');
  assert.doesNotMatch(ordinaryPage, /preview-config|PRUEBA EXPERIMENTAL/);
  assert.doesNotMatch(source, /window\.NeonPreview/);
  assert.equal(source, await readFile(join(root, 'ios/App/App/public/game.js'), 'utf8'));
  assert.equal(await readFile(join(dist, 'juego/game.js'), 'utf8'), previewGame(source));
  assert.equal(await readFile(join(dist, 'juego/index.html'), 'utf8'), previewPage(ordinaryPage));
});

test('preview cannot initialize native ads or make real payments', async () => {
  const context = {window: {}};
  vm.runInNewContext(await readFile(join(dist, 'juego/ads-config.js'), 'utf8'), context);
  vm.runInNewContext(await readFile(join(dist, 'juego/native-admob.js'), 'utf8'), context);
  assert.equal(context.window.MONETIZATION_CONFIG.web.enabled, false);
  assert.equal(context.window.MONETIZATION_CONFIG.native.enabled, false);
  assert.equal(context.window.NeonNativeAds.isAvailable(), false);
  const headers = await readFile(join(dist, '_headers'), 'utf8');
  assert.match(headers, /payment=\(\)/);
  assert.match(headers, /connect-src 'self'/);
  assert.match(headers, /Cache-Control: no-cache, no-store/);
  assert.doesNotMatch(await text('netlify.toml'), /\[\[headers\]\]/,
    'TOML headers would override the isolated preview policy');
  const ordinaryHeaders = await text('_headers');
  assert.match(ordinaryHeaders, /Referrer-Policy: strict-origin-when-cross-origin/);
  assert.equal(await text('www/_headers'), ordinaryHeaders, 'Ordinary policy must still be copied unchanged');
});

test('build provenance records exact commit, source tree and every emitted byte', async () => {
  const info = JSON.parse(await readFile(join(dist, 'build-info.json'), 'utf8'));
  assert.match(info.commit, /^[a-f0-9]{40}$/);
  assert.match(info.sourceTree, /^[a-f0-9]{40}$/);
  const checkout = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
  assert.equal(info.commit, checkout('rev-parse', 'HEAD'), 'Stale preview: rebuild after changing HEAD');
  assert.equal(info.sourceTree, checkout('rev-parse', 'HEAD^{tree}'), 'Preview source tree differs from checkout');
  assert.match(info.trackedDiffSha256, /^[a-f0-9]{64}$/);
  assert.equal(typeof info.dirty, 'boolean');
  assert.equal(info.branch, PREVIEW_BRANCH);
  assert.equal(info.storagePrefix, STORAGE_PREFIX);
  assert.equal(info.engineV1, false);
  assert.equal(info.realAds, false);
  assert.equal(info.realPayments, false);
  assert.equal(info.revision, sha256(JSON.stringify({commit: info.commit, sourceTree: info.sourceTree,
    dirty: info.dirty, trackedDiffSha256: info.trackedDiffSha256, sourceFiles: info.sourceFiles})));
  for (const [path, expected] of Object.entries(info.files)) {
    const actual = await readFile(join(dist, path));
    assert.equal(actual.length, expected.bytes, path);
    assert.equal(sha256(actual), expected.sha256, path);
  }
  for (const [path, expected] of Object.entries(info.sourceFiles)) {
    assert.equal(sha256(await readFile(join(root, path))), expected, path);
  }
  const context = {window: {}};
  vm.runInNewContext(await readFile(join(dist, 'juego/preview-config.js'), 'utf8'), context);
  assert.equal(context.window.NeonPreview.commit, info.commit);
  assert.equal(context.window.NeonPreview.dirty, info.dirty);
  assert.ok((await readFile(join(dist, 'index.html'), 'utf8')).includes(info.commit));
});
