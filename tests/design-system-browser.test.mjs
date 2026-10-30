// Sistema de diseño (tarea ds-tokens): en las pantallas ya rehechas, cada
// texto visible usa solo los colores --ui-* y los seis tamaños del sistema.
// Mide en Chromium real (el CSS final, con media queries) a 390 y 320 px.
// Necesita `npm run build` antes. Al rehacer otra pantalla, se añade aquí.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const {startStaticServer} = require('../scripts/browser-qa-helpers.cjs');
let chromium = null;
try { ({chromium} = require('playwright')); } catch { /* sin Playwright: la prueba avisa y no se da por pasada */ }

const TOKENS = ['ui-ink', 'ui-deep', 'ui-surface', 'ui-raised', 'ui-paper', 'ui-muted', 'ui-line', 'ui-cyan', 'ui-amber', 'ui-red', 'ui-on-cyan'];
const SIZES = [10, 12, 14, 16, 20, 28];
// [nombre, overlay, ¿en vuelo?]
const SCREENS = [['menú', 'menu', false], ['pausa', 'paused', true], ['ajustes', 'settingsPanel', false], ['derrota', 'over', true],
  ['fin de sector', 'complete', true], ['baliza', 'beaconOffer', true], ['cómo jugar', 'instructions', false], ['Forja C9', 'flightDock', true],
  ['hangar', 'shipHangar', false]];

test('las pantallas rehechas solo usan colores y tamaños del sistema', {timeout: 180000}, async t => {
  if (!chromium) return t.skip('Playwright no está disponible: esta prueba no se ha ejecutado');
  assert.ok(existsSync(join(root, 'www/index.html')), 'falta www/: ejecuta antes npm run build');
  const server = await startStaticServer(join(root, 'www'));
  const browser = await chromium.launch();
  const found = [];
  try {
    for (const width of [390, 320]) for (const [name, id, flight] of SCREENS) {
      const page = await browser.newPage({viewport: {width, height: 844}});
      await page.goto(server.url + 'index.html', {waitUntil: 'load'});
      // Con el emisor recuperado sale el botón FORJA C9 del menú; con el hangar
      // abierto en el menú, el de ENTRAR AL HANGAR.
      await page.evaluate(() => {
        localStorage.setItem('neonCronium.flightEquipment.v1', JSON.stringify({version: 1, recoveredTwin: true, unlocked: ['pulse'], selected: 'pulse'}));
        localStorage.setItem('neonCronium.menu.v1', JSON.stringify({version: 1, hangar: true, seen: {hangar: true, intro: true}}));
      });
      await page.reload({waitUntil: 'load'});
      await page.evaluate(() => document.fonts.ready);
      const bad = await page.evaluate(([id, flight, tokens, sizes]) => {
        if (id === 'flightDock') document.getElementById('openFlightDock').click();
        else if (id === 'shipHangar') document.getElementById('openHangar').click();
        else if (id !== 'menu') {
          document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
          document.getElementById(id).classList.add('show');
        }
        if (flight) document.body.classList.add('flight-mode');
        const css = getComputedStyle(document.documentElement);
        const allowed = new Set(tokens.map(token => css.getPropertyValue('--' + token).trim().toLowerCase()));
        const hex = color => '#' + color.match(/\d+/g).slice(0, 3).map(v => Number(v).toString(16).padStart(2, '0')).join('');
        const out = [];
        for (const el of document.getElementById(id).querySelectorAll('*')) {
          if (!el.getClientRects().length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const style = getComputedStyle(el), size = parseFloat(style.fontSize);
          // Los iconos pintados esconden su glifo con letra de 0 px.
          if (style.visibility === 'hidden' || Number(style.opacity) === 0 || size === 0) continue;
          const problems = [];
          if (!allowed.has(hex(style.color))) problems.push(`color ${hex(style.color)}`);
          if (!sizes.includes(Math.round(size))) problems.push(`${size} px`);
          if (problems.length) out.push(`«${el.textContent.trim().slice(0, 30)}» ${problems.join(', ')}`);
        }
        return out;
      }, [id, flight, TOKENS, SIZES]);
      for (const line of bad) found.push(`${name} a ${width} px: ${line}`);
      await page.close();
    }
  } finally {
    await browser.close(); await server.close();
  }
  assert.deepEqual(found, [], `textos fuera del sistema:\n${found.join('\n')}`);
});
