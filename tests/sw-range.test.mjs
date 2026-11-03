import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

// Auditoría 03/11 (A20): las peticiones por partes (Range) de la música en
// <audio> van a la red; desde la caché llegaría el archivo entero.
const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
function worker() {
  const listeners = {};
  const self = {location: {origin: 'https://neon.test'}, addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting() {}, clients: {claim() {}}};
  const caches = {open: async () => ({match: async () => null, put: async () => {}})};
  vm.runInNewContext(source, {self, caches, fetch: async () => new Response('ok'), URL, Response, addEventListener: self.addEventListener});
  return listeners;
}
const request = (path, range) => ({method: 'GET', url: `https://neon.test/${path}`, mode: 'no-cors',
  headers: {get: name => name === 'range' ? range : null}});

test('a ranged music request is left to the network; a normal asset request is still answered by the worker', () => {
  const {fetch: onFetch} = worker();
  let answered = 0;
  onFetch({request: request('assets/music_vuelo_v1.m4a', 'bytes=0-'), respondWith() { answered++; }});
  assert.equal(answered, 0);
  let pending;
  onFetch({request: request('assets/music_vuelo_v1.m4a', null), respondWith(answer) { answered++; pending = answer; }});
  assert.equal(answered, 1);
  return pending;
});
