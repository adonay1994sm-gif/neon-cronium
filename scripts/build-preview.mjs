/** Build an isolated browser test package; never rewrite www or the native copy. */
import {cp, mkdir, readFile, readdir, rm, stat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PREVIEW_BRANCH = 'main';
export const STORAGE_PREFIX = 'neon-preview-v1:';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();

function replaceOnce(source, before, after) {
  if (source.split(before).length !== 2) throw new Error(`Preview transform requires exactly one marker: ${before}`);
  return source.replace(before, after);
}

export function previewGame(source) {
  let game = replaceOnce(source, 'const storage = NeonCore.createStorageService(HARDCORE?.storage ?? window.NeonDev?.storage);',
    'const storage = NeonCore.createStorageService(HARDCORE?.storage ?? (window.NeonDev?.storage || window.NeonPreview.storage));');
  // La partida HARDCORE también vive dentro del guardado aislado del preview.
  game = replaceOnce(game, 'const base = window.NeonDev?.storage ?? window.localStorage, prefix = "neon-hardcore-v1:";',
    'const base = window.NeonDev?.storage ?? window.NeonPreview.storage, prefix = "neon-hardcore-v1:";');
  game = replaceOnce(game, 'return Object.freeze({prefix: (window.NeonDev?.prefix || "") + prefix, storage: Object.freeze({',
    'return Object.freeze({prefix: (window.NeonDev?.prefix || window.NeonPreview.storagePrefix) + prefix, storage: Object.freeze({');
  return game.replaceAll('▶ VER ANUNCIO Y REPARAR', 'REPARAR NAVE');
}

export function previewWorker(source, revision) {
  if (!/^[a-f0-9]{64}$/.test(revision)) throw new TypeError('A SHA-256 preview revision is required');
  let worker = source.replace(/^const CACHE = .*;$/m,
    `const CACHE_PREFIX = "neon-preview-v1:" + self.registration.scope + "::";\nconst CACHE = CACHE_PREFIX + "${revision}";`);
  if (worker === source) throw new Error('Missing service worker cache declaration');
  worker = replaceOnce(worker, 'keys.filter((key) => key !== CACHE)',
    'keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)');
  worker = replaceOnce(worker, 'url.origin !== self.location.origin',
    'url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)');
  // The source worker already retains its generation's Cache handle. Keep that
  // handle for offline fallback rather than reopening a deleted generation.
  return replaceOnce(worker, 'cache.match("index.html")',
    'cache.match(new URL("index.html", self.registration.scope).href)');
}

/** The launcher owns only its own shell; the game keeps its more specific worker. */
export function previewLauncherWorker(revision) {
  if (!/^[a-f0-9]{64}$/.test(revision)) throw new TypeError('A SHA-256 preview revision is required');
  return `const CACHE_PREFIX = "neon-preview-launcher-v1:" + self.registration.scope + "::";
const CACHE = CACHE_PREFIX + ${JSON.stringify(revision)};
const CORE = ["./", "index.html", "manifest.webmanifest", "build-info.json",
  "juego/assets/player_ship_identity_v1.webp", "juego/assets/chronos_flight_space_v1.webp",
  "juego/assets/icon-192.png", "juego/assets/icon-512.png",
  "juego/privacy.html", "juego/terms.html", "juego/styles.css"]
  .map(path => new URL(path, self.registration.scope).href);
const ALLOWED = new Set(CORE);
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  url.search = "";
  url.hash = "";
  if (!ALLOWED.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request, {cache: "no-store"});
      if (response.status === 200) await cache.put(url.href, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(url.href);
      if (cached) return cached;
      throw error;
    }
  })());
});
`;
}

export function previewManifest(source, nested = false) {
  const original = JSON.parse(source);
  const base = nested ? '../' : './';
  return JSON.stringify({...original,
    id: base + '?edition=neon-preview-v1',
    name: 'NEON CRONIUM', short_name: 'NEON CRONIUM',
    description: 'Pilota entre las estrellas, recupera el CRONIUM y sigue el rastro del ataque a Chronos.',
    start_url: base + 'index.html', scope: base,
    icons: original.icons.map(icon => ({...icon, src: nested ? icon.src : 'juego/' + icon.src}))
  }, null, 2) + '\n';
}

export function previewConfig(commit, dirty) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new TypeError('Exact commit SHA required');
  return `/* Preview-only storage; the ordinary game and settings are untouched. */
window.NeonPreview = Object.freeze({
  commit: ${JSON.stringify(commit)}, dirty: ${Boolean(dirty)}, storagePrefix: ${JSON.stringify(STORAGE_PREFIX)},
  storage: Object.freeze({
    getItem(key) { return localStorage.getItem(${JSON.stringify(STORAGE_PREFIX)} + key); },
    setItem(key, value) { localStorage.setItem(${JSON.stringify(STORAGE_PREFIX)} + key, value); },
    removeItem(key) { localStorage.removeItem(${JSON.stringify(STORAGE_PREFIX)} + key); }
  })
});
// Direct links into the game also prepare the offline journey entry.
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  const workerURL = new URL("../launcher-sw.js", document.currentScript.src);
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(workerURL.href, {scope: new URL("./", workerURL).href}).catch(() => {});
  });
}
`;
}

export function previewPage(source) {
  let html = replaceOnce(source, '<script src="native-admob.js?v=7.2.0"></script>',
    '<script src="preview-config.js"></script>\n<script src="native-admob.js?v=7.2.0"></script>');
  html = replaceOnce(html, 'rel="manifest" href="manifest.webmanifest"',
    'rel="manifest" href="../manifest.webmanifest"');
  return html.replace(/<title>[^<]*<\/title>/, '<title>NEON CRONIUM</title>')
    .replaceAll('▶ VER ANUNCIO Y REPARAR', 'REPARAR NAVE');
}

async function filesBelow(directory, base = directory) {
  const result = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesBelow(path, base));
    else if (entry.isFile()) result.push(relative(base, path).split('\\').join('/'));
    else throw new Error(`Unsupported preview entry: ${path}`);
  }
  return result.sort();
}

export async function buildPreview() {
  const source = join(root, 'www');
  const output = join(root, 'preview-dist');
  const commit = git('rev-parse', 'HEAD');
  const sourceTree = git('rev-parse', 'HEAD^{tree}');
  const branch = process.env.BRANCH || git('branch', '--show-current');
  if (branch !== PREVIEW_BRANCH) throw new Error(`Preview branch not allowed: ${branch}`);
  if (process.env.COMMIT_REF && process.env.COMMIT_REF !== commit) throw new Error('Netlify COMMIT_REF does not match checkout HEAD');
  const dirty = Boolean(git('status', '--porcelain', '--untracked-files=normal'));
  const trackedDiffSha256 = sha256(execFileSync('git', ['diff', '--binary', 'HEAD'], {cwd: root, maxBuffer: 32 * 1024 * 1024}));
  for (const file of ['index.html', 'game.js', 'content-runtime.js', 'core-runtime.js', 'sw.js', 'assets/player_ship_identity_v1.webp']) {
    const info = await stat(join(source, file));
    if (!info.isFile() || info.size === 0) throw new Error(`Preview source is missing or empty: ${file}`);
  }
  const landing = await readFile(join(root, 'preview/launcher.html'), 'utf8');
  if (!landing.includes('id="classiclink"') || !landing.includes('href="juego/index.html"') ||
      /(?:\?campaign=|id="qaArchive"|id="unlockClassic")/.test(landing)) {
    throw new Error('Preview launcher must expose only the canonical journey');
  }
  const sourceFiles = {};
  for (const file of await filesBelow(source)) sourceFiles[`www/${file}`] = sha256(await readFile(join(source, file)));
  for (const file of ['scripts/build-preview.mjs', 'scripts/netlify-preview-gate.mjs', 'preview/launcher.html', 'netlify.toml', '_headers']) {
    sourceFiles[file] = sha256(await readFile(join(root, file)));
  }
  const revision = sha256(JSON.stringify({commit, sourceTree, dirty, trackedDiffSha256, sourceFiles}));
  await rm(output, {recursive: true, force: true});
  await mkdir(join(output, 'juego'), {recursive: true});
  await cp(source, join(output, 'juego'), {recursive: true});
  await writeFile(join(output, 'index.html'), landing
    .replaceAll('__NEON_PREVIEW_COMMIT__', commit)
    .replaceAll('__NEON_PREVIEW_DIRTY__', dirty ? ' · incluye cambios locales' : ''));
  await writeFile(join(output, 'juego/index.html'), previewPage(await readFile(join(source, 'index.html'), 'utf8')));
  await writeFile(join(output, 'juego/game.js'), previewGame(await readFile(join(source, 'game.js'), 'utf8')));
  const manifest = await readFile(join(source, 'manifest.webmanifest'), 'utf8');
  await writeFile(join(output, 'manifest.webmanifest'), previewManifest(manifest));
  await writeFile(join(output, 'juego/manifest.webmanifest'), previewManifest(manifest, true));
  await writeFile(join(output, 'launcher-sw.js'), previewLauncherWorker(revision));
  let worker = previewWorker(await readFile(join(source, 'sw.js'), 'utf8'), revision);
  worker = replaceOnce(worker, 'const CORE = [', 'const CORE = [\n  "preview-config.js",');
  await writeFile(join(output, 'juego/sw.js'), worker);
  await writeFile(join(output, 'juego/preview-config.js'), previewConfig(commit, dirty));
  await writeFile(join(output, 'juego/ads-config.js'), `window.MONETIZATION_CONFIG = Object.freeze({web: Object.freeze({enabled: false, testRewardedSimulator: true, simulatorDelayMs: 250}), native: Object.freeze({enabled: false, testing: true, interstitialEveryRuns: 0})});\n`);
  await writeFile(join(output, 'juego/native-admob.js'), 'window.NeonNativeAds = Object.freeze({isAvailable: () => false});\n');
  const adBridge = await readFile(join(source, 'ad-bridge.js'), 'utf8');
  await writeFile(join(output, 'juego/ad-bridge.js'), adBridge.replace('Anuncio de prueba: verificando recompensa…', 'Reparación de prueba: verificando recompensa…'));
  // Headers apply at the publish root and at /juego; block external SDKs/endpoints.
  await writeFile(join(output, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
  Cache-Control: no-cache, no-store, must-revalidate
`);
  const files = {};
  for (const file of await filesBelow(output)) {
    const bytes = await readFile(join(output, file));
    files[file] = {bytes: bytes.length, sha256: sha256(bytes)};
  }
  await writeFile(join(output, 'build-info.json'), JSON.stringify({
    schemaVersion: 1, kind: 'experimental-preview', commit, sourceTree, branch, dirty,
    revision, trackedDiffSha256, sourceFiles, storagePrefix: STORAGE_PREFIX,
    serviceWorkerScope: './juego/', launcherServiceWorkerScope: './',
    engineV1: false, realAds: false, realPayments: false,
    files
  }, null, 2) + '\n');
  console.log(`[NEON CRONIUM] preview-dist listo; SHA ${commit}${dirty ? ' + cambios locales' : ''}; ${Object.keys(files).length} archivos verificados; sin despliegue`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildPreview();
