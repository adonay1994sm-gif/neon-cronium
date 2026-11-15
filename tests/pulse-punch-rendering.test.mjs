import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

// Disparo con golpe (propietario, 15/11/2026): el pulso se pinta más grande y
// brillante, y el objetivo alcanzado destella. Ejecuta el pintado real.
const source = readFileSync(new URL('../src/game/07-player-item-rendering.js', import.meta.url), 'utf8');
const slice = (from, to) => source.slice(source.indexOf(from), source.indexOf(to));

function harness(extra = {}) {
  const calls = [], stack = [];
  let state = {globalAlpha: 1, globalCompositeOperation: 'source-over'};
  const ctx = new Proxy({}, {
    get(_target, key) {
      if (key in state) return state[key];
      if (key === 'save') return () => stack.push({...state});
      if (key === 'restore') return () => { state = stack.pop(); };
      if (key === 'drawImage') return (image, ...args) => calls.push({kind: 'image', image, ...state, args});
      return (...args) => calls.push({kind: key, args, ...state});
    },
    set(_target, key, value) { state[key] = value; return true; }
  });
  const sandbox = vm.createContext({ctx, calls, elapsed: 10, spriteReady: image => Boolean(image?.naturalWidth), ...extra});
  return {sandbox, calls};
}

test('the pulse bolt is painted 60 % bigger with a second pass of light', () => {
  for (const [weapon, tall] of [['pulse', 62], ['twin', 60]]) {
    const bolts = {naturalWidth: 384, naturalHeight: 384};
    const {sandbox, calls} = harness({SPRITES: {weaponBolts: bolts},
      classicWeapons: {projectiles: [{weapon, level: 1, x: 100, y: 200, vx: 0, vy: -900, life: .5, duration: 1}]}});
    vm.runInContext(slice('  function drawClassicProjectiles()', '  function drawFlightModule(item)'), sandbox);
    sandbox.drawClassicProjectiles();
    const images = calls.filter(call => call.kind === 'image');
    assert.equal(images.length, 2, `${weapon}: bolt plus glow`);
    const [, , , , , , width, height] = images[0].args;
    assert.ok(Math.abs(height - tall * 1.6) < .01 && Math.abs(width - tall * .8) < .01, `${weapon}: ${width}×${height}`);
    assert.deepEqual(images.map(call => call.globalCompositeOperation), ['source-over', 'lighter']);
  }
});

test('a target that was just hit is painted again as light, and stops when the flash ends', () => {
  let painted = 0;
  const {sandbox} = harness({drawMeteor: () => { painted++; }});
  vm.runInContext(slice('  function drawHitFlash(item)', '  function drawMeteor(item)'), sandbox);
  sandbox.drawHitFlash({hitFlashUntil: 10.05});
  assert.equal(painted, 2);
  assert.equal(sandbox.ctx.globalCompositeOperation, 'source-over', 'the light pass does not leak');
  sandbox.drawHitFlash({hitFlashUntil: 9.9});
  sandbox.drawHitFlash({});
  assert.equal(painted, 2);
});
