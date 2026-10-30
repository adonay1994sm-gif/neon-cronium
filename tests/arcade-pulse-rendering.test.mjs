import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import metadata from '../art-source/vfx/arcade-combat-v2/arcade-pulse-atlas-v2.json' with {type: 'json'};
import {createClassicWeapons, triggerClassicWeapon, advanceClassicWeapons}
  from '../src/game/combat/classic-weapons.js';
import gaiaMetadata from '../art-source/vfx/gaia-pulse-v3/gaia-pulse-atlas-v3.json' with {type: 'json'};

const source = readFileSync(new URL('../src/game/07-player-item-rendering.js', import.meta.url), 'utf8');
const projectileEnd = source.indexOf('  function drawFlightModule(item) {');
const playerStart = source.indexOf('  function drawPlayer(t) {');
const playerEnd = source.indexOf('  function itemVisualAlpha(item) {', playerStart);
assert.ok(projectileEnd > 0 && playerStart > projectileEnd && playerEnd > playerStart,
  'Tests must execute the actual projectile and player rendering functions');

const multiply = (a, b) => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]
];
const point = (matrix, x, y) => ({x: matrix[0] * x + matrix[2] * y + matrix[4],
  y: matrix[1] * x + matrix[3] * y + matrix[5]});
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `${label}: expected ${expected}, received ${actual}`);

// Recording Canvas checks the real render transforms/crops. It does not claim
// aesthetic approval or replace the separately recorded Chromium decode test.
function harness({assembled = true, health = 100, selected = 'pulse', ready = true, gaiaReady = false} = {}) {
  const calls = [], stack = [], frameRequests = [];
  let properties = {globalAlpha: 1, matrix: [1, 0, 0, 1, 0, 0]};
  const ctx = new Proxy({}, {
    get(_target, key) {
      if (key in properties) return properties[key];
      if (key === 'save') return () => stack.push({...properties, matrix: [...properties.matrix]});
      if (key === 'restore') return () => {
        assert.ok(stack.length, 'Canvas restore must have a matching save');
        properties = stack.pop();
      };
      if (key === 'translate') return (x, y) => {
        properties.matrix = multiply(properties.matrix, [1, 0, 0, 1, x, y]);
        calls.push({method: 'translate', args: [x, y]});
      };
      if (key === 'rotate') return angle => {
        properties.matrix = multiply(properties.matrix, [Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]);
        calls.push({method: 'rotate', args: [angle]});
      };
      if (key === 'scale') return (x, y) => {
        properties.matrix = multiply(properties.matrix, [x, 0, 0, y, 0, 0]);
        calls.push({method: 'scale', args: [x, y]});
      };
      if (key === 'drawImage') return (image, ...args) => {
        const [dx, dy, width, height] = args.length === 8 ? args.slice(4) : args;
        calls.push({method: 'drawImage', image: image.name, args: [...args],
          center: point(properties.matrix, dx + width / 2, dy + height / 2),
          matrix: [...properties.matrix], alpha: properties.globalAlpha});
      };
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({addColorStop() {}});
      return (...args) => calls.push({method: key, args});
    },
    set(_target, key, value) {properties[key] = value; return true;}
  });
  const image = (name, width, height) => ({name, complete: true, naturalWidth: width, naturalHeight: height});
  const sprites = {arcadePulse: image('arcade-pulse-v2', ready ? 1024 : 0, ready ? 1024 : 0),
    atlasVfx: image('historical-atlas-vfx', 2170, 725)};
  if (gaiaReady) sprites.gaiaPulse = image('gaia-pulse-v3',1024,1024);
  const sandbox = vm.createContext({ctx, SPRITES: sprites,
    spriteReady: image => Boolean(image?.complete && image.naturalWidth && image.naturalHeight),
    classicWeapons: {projectiles: [], cooldown: 0},
    classicEquipment: {selected},
    state: 'playing', playerVisible: true, player: {x: 360, y: 1000, target: 360, drift: 0},
    powers: {shield: 0}, hull: health, elapsed: 2.3,
    shipLoadout: {hull: 'aster', wings: 'aster', engines: 'aster'},
    SHIP_VISUAL: {scale: 1, centerYOffset: 14, shieldSize: 220},
    impactReactionTimer: 0, damageSmokeSide: -1,
    clamp: (number, low, high) => Math.max(low, Math.min(high, number)),
    hasClassicTwinMounts: () => selected === 'twin', classicTwinFrame: () => 0,
    drawModularShip: (...args) => {calls.push({method: 'drawModularShip', health: args[5]}); return assembled;},
    drawPosedShip: () => false,
    drawShipIdentityFallback: () => {calls.push({method: 'identityFallback'}); return true;},
    drawClassicTwinMounts: () => calls.push({method: 'historicalMounts'}),
    frameFrom: (name, frame) => {frameRequests.push({name, frame}); return image(name, 128, 128);},
    requestAnimationFrame: () => {throw new Error('Rendering must never schedule a second RAF');}
  });
  vm.runInContext(source.slice(0, projectileEnd) + source.slice(playerStart, playerEnd), sandbox);
  return {sandbox, sprites, calls, frameRequests,
    pulse: (kind, age, size, alpha) => sandbox.drawArcadePulse(kind, age, size, alpha),
    projectiles: () => sandbox.drawClassicProjectiles(),
    player: t => sandbox.drawPlayer(t),
    images: () => calls.filter(call => call.method === 'drawImage'),
    state: () => ({alpha: properties.globalAlpha, matrix: [...properties.matrix], stackDepth: stack.length}),
    clear: () => {calls.length = 0; frameRequests.length = 0;}};
}

test('arcade VFX atlas on disk matches the registered hash and sixteen padded distinct decoded poses', () => {
  const runtime = readFileSync(new URL('../assets/arcade_pulse_atlas_v2.webp', import.meta.url));
  assert.equal(createHash('sha256').update(runtime).digest('hex'), metadata.hashes.runtimeSha256);
  assert.equal(runtime.length, metadata.runtimeBytes);
  assert.deepEqual(runtime, readFileSync(new URL('../art-source/vfx/arcade-combat-v2/arcade-pulse-atlas-v2.webp', import.meta.url)));
  assert.equal(new Set(metadata.frames.map(frame => frame.rgbaSha256)).size, 16);
  assert.equal(metadata.transparent, true);
  assert.deepEqual(metadata.pivot, {x: .5, y: .5});
  assert.deepEqual(metadata.forward, {x: 0, y: -1});
  for (const frame of metadata.frames) {
    assert.equal(frame.maximumBorderAlpha, 0);
    assert.ok(frame.alphaBounds.minX >= 16 && frame.alphaBounds.minY >= 16);
    assert.ok(frame.alphaBounds.maxX <= 239 && frame.alphaBounds.maxY <= 239);
    assert.deepEqual(frame.rect, {x: frame.index % 4 * 256,
      y: Math.floor(frame.index / 4) * 256, width: 256, height: 256});
  }
  for (const frame of metadata.frames.slice(0, 12)) {
    assert.ok(Math.abs(frame.brightCoreCenter.x - 128) < 1, 'Painted projectile cores share the vertical axis');
  }
});

test('new Gaia art preserves provenance and sixteen distinct padded cells and overrides the recoverable v2 fallback', () => {
  const runtime=readFileSync(new URL('../assets/gaia_pulse_atlas_v3.webp',import.meta.url));
  assert.equal(createHash('sha256').update(runtime).digest('hex'),gaiaMetadata.runtimeSha256);
  assert.equal(runtime.length,gaiaMetadata.runtimeBytes);
  assert.equal(new Set(gaiaMetadata.frames.map(frame=>frame.rgbaSha256)).size,16);
  assert.equal(gaiaMetadata.transparent,true);
  assert.equal(gaiaMetadata.provenance.conceptTool,'Canva generate-image');
  assert.ok(readFileSync(new URL('../art-source/vfx/gaia-pulse-v3/'+gaiaMetadata.concept,import.meta.url)).length>0);
  for(const frame of gaiaMetadata.frames) {
    assert.equal(frame.maximumSixteenPixelGutterAlpha,0);
    assert.ok(frame.alphaBounds.minX>=16&&frame.alphaBounds.minY>=16);
    assert.ok(frame.alphaBounds.maxX<=239&&frame.alphaBounds.maxY<=239);
  }
  const h=harness({gaiaReady:true});
  for(const [kind,row] of [['pulse',0],['twin',1],['lance',2],['impact',3]]) {
    const interval=1/gaiaMetadata.animations[kind].fps;
    for(let frame=0;frame<4;frame++) {
      h.clear();assert.equal(h.pulse(kind,frame*interval+.001,72),true);
      assert.equal(h.images()[0].image,'gaia-pulse-v3');
      assert.deepEqual(h.images()[0].args.slice(0,4),[frame*256,row*256,256,256]);
      assert.deepEqual(h.images()[0].center,{x:0,y:0});
    }
    h.clear();h.pulse(kind,4*interval+.001,72);
    assert.deepEqual(h.images()[0].args.slice(0,4),[kind==='impact'?768:0,row*256,256,256]);
  }
});

test('actual projectile renderer selects four distinct authored cells without moving the center in any weapon', () => {
  const h = harness();
  for (const [kind, animation] of Object.entries(metadata.animations).filter(([kind]) => kind !== 'impact')) {
    let age = 0;
    for (let index = 0; index < 4; index++) {
      h.clear();
      assert.equal(h.pulse(kind, age + .001, animation.recommendedDrawSizeLogical, .6), true);
      const [draw] = h.images(), rect = metadata.frames[animation.frames[index]].rect;
      assert.equal(h.images().length, 1);
      assert.equal(draw.image, 'arcade-pulse-v2');
      assert.deepEqual(draw.args.slice(0, 4), [rect.x, rect.y, rect.width, rect.height]);
      assert.deepEqual(draw.center, {x: 0, y: 0});
      assert.equal(draw.alpha, .6);
      assert.deepEqual(draw.args.slice(4), [-animation.recommendedDrawSizeLogical / 2,
        -animation.recommendedDrawSizeLogical / 2, animation.recommendedDrawSizeLogical, animation.recommendedDrawSizeLogical]);
      assert.deepEqual(h.state(), {alpha: 1, matrix: [1, 0, 0, 1, 0, 0], stackDepth: 0});
      age += animation.durationMs[index] / 1000;
    }
    h.clear(); h.pulse(kind, animation.totalMs / 1000 + .001, 72, 1);
    assert.equal(h.images()[0].args[0], 0, 'A projectile loops to its first pose using played age');
  }
});

test('contact impact advances at registered boundaries and remains centered after its last pose', () => {
  const h = harness();
  for (const [age, frame] of [[0, 0], [.034, 0], [.035, 1], [.089, 1], [.09, 2], [.164, 2], [.165, 3], [.8, 3]]) {
    h.clear(); h.pulse('impact', age, 42, .75);
    assert.deepEqual(h.images()[0].args.slice(0, 4), [frame * 256, 768, 256, 256]);
    assert.deepEqual(h.images()[0].center, {x: 0, y: 0});
    assert.equal(h.images()[0].alpha, .75);
  }
});

test('Pulse, Twin and Lance ascend with rotation zero and render at their physics positions without mutation', () => {
  for (const selected of ['pulse', 'twin', 'lance']) {
    const h = harness({selected});
    const weapons = createClassicWeapons({type: selected, unlocked: [selected]});
    assert.equal(triggerClassicWeapon(weapons, {x: 360, y: 1100}).accepted, true);
    h.sandbox.classicWeapons = weapons;
    const initialX = weapons.projectiles.map(projectile => projectile.x);
    for (let tick = 0; tick < 15; tick++) {
      h.clear();
      const before = structuredClone(weapons);
      h.projectiles();
      assert.deepEqual(weapons, before, 'Drawing cannot advance physics, ammunition or damage');
      assert.equal(h.images().length, selected === 'twin' ? 2 : 1);
      const rotations = h.calls.filter(call => call.method === 'rotate');
      assert.equal(rotations.length, weapons.projectiles.length);
      for (const rotation of rotations) close(rotation.args[0], 0, 'Ascending projectile artwork rotation');
      h.images().forEach((draw, index) => {
        const shot = weapons.projectiles[index];
        close(draw.center.x, shot.x, 'Illustrated center x');
        close(draw.center.y, shot.y, 'Illustrated center y');
        close(shot.x, initialX[index], 'Vertical flight cannot drift laterally');
        assert.equal(draw.args.at(-1), selected === 'lance' ? 88 : 72);
      });
      if (selected === 'twin') close(h.images()[1].center.x - h.images()[0].center.x, 20,
        'Twin projectiles preserve their compact parallel spacing');
      advanceClassicWeapons(weapons, .05);
    }
  }
});

test('unavailable new artwork preserves a centered historical projectile fallback', () => {
  const h = harness({ready: false});
  assert.equal(h.pulse('pulse', .1, 72), false);
  assert.equal(h.images().length, 0);
  h.sandbox.classicWeapons.projectiles = [{x: 200, y: 500, vx: 0, vy: -900,
    weapon: 'twin', duration: 2.4, life: 2.3}];
  h.projectiles();
  assert.equal(h.images().length, 1);
  assert.equal(h.images()[0].image, 'historical-atlas-vfx');
  assert.deepEqual(h.images()[0].center, {x: 200, y: 500});
  assert.deepEqual(h.state(), {alpha: 1, matrix: [1, 0, 0, 1, 0, 0], stackDepth: 0});
});

test('assembled ship at 66 or 10 hull has no billboard damage smoke or fake converging wing rays', () => {
  for (const health of [66, 10]) for (const selected of ['pulse', 'twin', 'lance']) {
    const h = harness({assembled: true, health, selected});
    const weapons = createClassicWeapons({type: selected, unlocked: [selected]});
    const emitted = triggerClassicWeapon(weapons, {x: h.sandbox.player.x, y: h.sandbox.player.y - 125});
    assert.equal(emitted.accepted, true);
    h.sandbox.classicWeapons = weapons;
    const before = structuredClone(weapons);
    h.player(1000);
    assert.deepEqual(weapons, before, 'Muzzle animation cannot spend ammunition, change physics or emit another shot');
    assert.equal(h.calls.filter(call => call.method === 'drawModularShip').length, 1);
    assert.equal(h.frameRequests.some(frame => frame.name === 'smoke'), false,
      'A modular ship must not acquire the retired large smoke cloud');
    assert.equal(h.images().some(draw => draw.image === 'smoke'), false);
    assert.equal(h.calls.some(call => call.method === 'moveTo' || call.method === 'lineTo'), false,
      'The firing reaction cannot invent diagonal beams from wings to a central projectile');
    assert.equal(h.calls.some(call => call.method === 'identityFallback'), false);
    assert.equal(h.images().length, emitted.projectiles.length,
      'Each real barrel receives one compact illustrated flash');
    h.images().forEach((draw, index) => {
      assert.equal(draw.image, 'arcade-pulse-v2');
      assert.deepEqual(draw.args.slice(6), [24, 24]);
      close(draw.center.x, emitted.projectiles[index].x, 'Flash x matches actual emitted projectile origin');
      close(draw.center.y, emitted.projectiles[index].y, 'Flash y matches actual emitted projectile origin');
    });
    assert.deepEqual(h.state(), {alpha: 1, matrix: [1, 0, 0, 1, 0, 0], stackDepth: 0});
  }
});

test('muzzle flashes are a short played-time reaction and repeated drawing never extends or repeats a shot', () => {
  for (const selected of ['pulse', 'twin', 'lance']) {
    const h = harness({selected});
    const weapons = createClassicWeapons({type: selected, unlocked: [selected]});
    triggerClassicWeapon(weapons, {x: h.sandbox.player.x, y: h.sandbox.player.y - 125});
    h.sandbox.classicWeapons = weapons;
    const before = structuredClone(weapons);
    for (let frame = 0; frame < 10; frame++) {
      h.clear(); h.player(1000 + frame * 16);
      assert.equal(h.images().length, selected === 'twin' ? 2 : 1);
      assert.deepEqual(weapons, before, 'A frozen simulation keeps its flash without generating shots');
    }
    for (let tick = 0; tick < 4; tick++) advanceClassicWeapons(weapons, .05);
    h.clear(); h.player(1200);
    assert.equal(h.images().length, 0, 'A flash must finish before 200 ms, leaving the projectile to travel');
    assert.equal(weapons.shotSequence, 1);
    assert.equal(weapons.charges, 19);
  }
});

test('damage smoke is reserved for the historical fallback when modular assembly is unavailable', () => {
  for (const [health, count] of [[66, 1], [10, 2]]) {
    const h = harness({assembled: false, health});
    h.player(1000);
    assert.equal(h.calls.filter(call => call.method === 'identityFallback').length, 1);
    assert.equal(h.frameRequests.filter(frame => frame.name === 'smoke').length, 1);
    assert.equal(h.images().filter(draw => draw.image === 'smoke').length, count);
  }
});
