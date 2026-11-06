import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

// Auditoría 03/11 (A20) y revisión del PR #57 (P57-03): <audio> pide la música
// por partes (Range). Si la pista está en la caché, el worker responde ese trozo
// con un 206 sin usar la red (modo sin conexión); si no está, va a la red.
const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const TRACK = 'https://neon.test/assets/music_vuelo_v1.m4a';
const BYTES = new Uint8Array(Array.from({length: 100}, (_, index) => index));
function worker({cached = true} = {}) {
  const listeners = {}, network = [];
  const self = {location: {origin: 'https://neon.test'}, addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting() {}, clients: {claim() {}}};
  const stored = new Map(cached ? [[TRACK, new Response(BYTES, {headers: {'Content-Type': 'audio/mp4'}})]] : []);
  const caches = {open: async () => ({
    match: async key => stored.get(typeof key === 'string' ? key : key.url)?.clone() ?? undefined, put: async () => {}})};
  const fetch = async request => { network.push(request); return new Response('red', {status: 200}); };
  vm.runInNewContext(source, {self, caches, fetch, URL, Response, Blob, addEventListener: self.addEventListener});
  return {onFetch: listeners.fetch, network};
}
const request = (url, range) => ({method: 'GET', url, mode: 'no-cors',
  headers: {get: name => name === 'range' ? range : null}});
const answer = (onFetch, req) => { let pending = null; onFetch({request: req, respondWith(value) { pending = value; }}); return pending; };

test('a ranged request for a cached track is answered from the cache with 206 and the exact bytes', async () => {
  const {onFetch, network} = worker();
  const response = await answer(onFetch, request(TRACK, 'bytes=10-19'));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 10-19/100');
  assert.equal(response.headers.get('Content-Length'), '10');
  assert.equal(response.headers.get('Content-Type'), 'audio/mp4');
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [...BYTES.slice(10, 20)]);
  const open = await answer(onFetch, request(TRACK, 'bytes=0-'));
  assert.equal(open.headers.get('Content-Range'), 'bytes 0-99/100', 'an open range goes to the end');
  assert.equal(network.length, 0, 'no network needed: it plays offline');
});

test('a ranged request for a track that is not cached goes to the network', async () => {
  const {onFetch, network} = worker({cached: false});
  const response = await answer(onFetch, request(TRACK, 'bytes=0-'));
  assert.equal(await response.text(), 'red');
  assert.equal(network.length, 1);
});

test('a range outside the cached file gets 416', async () => {
  const {onFetch} = worker();
  const response = await answer(onFetch, request(TRACK, 'bytes=500-'));
  assert.equal(response.status, 416);
  assert.equal(response.headers.get('Content-Range'), 'bytes */100');
});
