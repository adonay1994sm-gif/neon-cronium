import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCombatSfx} from '../src/game/audio/combat-sfx.js';
import * as weapons from '../src/game/combat/classic-weapons.js';
import * as guardian from '../src/game/combat/guardian-atlas.js';
import {createScrapLedger} from '../src/game/progression/scrap-economy.js';
import {resolveHullReinforcement} from '../src/game/combat/hull-reinforcement.js';

// Actual legacy sources + actual new sound policy, with Web Audio nodes tagged
// at their native boundary. No source rewriting, clocks or saved-game injection.
// This is a controlled contract fixture, not a natural playthrough or audition.
// TODO: human listening, music/foley mix approval and physical iPhone speakers
// remain separate evidence. A passing mock cannot certify their sound quality.
const sources = ['02-storage-audio.js', '03-ui-game-flow.js', '04-entities-collision-damage.js']
  .map(file => readFileSync(new URL(`../src/game/${file}`, import.meta.url), 'utf8')).join('\n');
const flush = async () => {for (let turn = 0; turn < 12; turn++) await Promise.resolve();};

function harness({ready = true, fx = 70, music = 50} = {}) {
  const calls = {contexts: [], sfxFactories: [], sounds: [], fetches: 0, decode: 0,
    oscillators: [], sources: [], gains: [], voyage: [], writes: [], timeline: [], scrap: []};
  const records = new Map(); let blocked = false, bank;
  const parameter = () => ({value: 0, values: [], setValueAtTime(v,t) {this.value = v; this.values.push([v,t]);},
    setTargetAtTime(v,t,d) {this.value = v; this.values.push([v,t,d]);}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}});
  const node = extra => ({connections: [], disconnected: 0,
    connect(target) {this.connections.push(target); return target;}, disconnect() {this.disconnected++;}, ...extra});
  class SharedAudioContext {
    constructor() {this.state = 'running'; this.currentTime = 0; this.destination = {id: 'shared-native-output'}; calls.contexts.push(this);}
    createGain() {const gain = node({gain: parameter()}); calls.gains.push(gain); return gain;}
    createBufferSource() {
      const source = node({starts: [], stops: [], onended: null,
        start(...args) {this.starts.push(args); calls.timeline.push('sample-start');}, stop(...args) {this.stops.push(args);}});
      calls.sources.push(source); return source;
    }
    createOscillator() {
      const oscillator = node({frequency: parameter(), starts: [], stops: [],
        start(...args) {this.starts.push(args);}, stop(...args) {this.stops.push(args);}});
      calls.oscillators.push(oscillator); return oscillator;
    }
    async decodeAudioData() {calls.decode++; if (!ready) throw new Error('fixture: codec unavailable');
      return {duration: 15.96, length: 766080, numberOfChannels: 1};}
    async suspend() {this.state = 'suspended';}
    async resume() {this.state = 'running';}
  }
  const storage = {
    readRaw(key) {return {ok: true, value: records.get(key) ?? null};},
    setJSON(key, value) {
      calls.writes.push(key); calls.timeline.push('durable-missile-write');
      if (blocked) return false;
      records.set(key, JSON.stringify(value)); return true;
    }
  };
  const campaign = {...weapons, ...guardian, resolveHullReinforcement,
    createVoyageScore() {return {setContext(name) {calls.voyage.push(['context',name]);},
      setEnabled(value) {calls.voyage.push(['enabled',value]);}, setPaused(value) {calls.voyage.push(['paused',value]);},
      advance(dt) {calls.voyage.push(['advance',dt]);}};},
    createCombatSfx(options) {
      calls.sfxFactories.push(options);
      bank = createCombatSfx({...options, fetchAsset: async () => {calls.fetches++;
        return {ok: true, arrayBuffer: async () => new ArrayBuffer(100)};}});
      return Object.freeze({...bank, play(name, options) {
        const played = bank.play(name, options); calls.sounds.push({name, options, played}); return played;
      }});
    }
  };
  const sandbox = vm.createContext({settings: {music, fx, autoFire: false, effects: false, vibration: false},
    audioCtx: null, musicGain: null,
    window: {AudioContext: SharedAudioContext}, navigator: {}, NeonCampaign: campaign,
    NeonCore: {resolveDamage({hull, amount, shieldActive}) {return {hull: shieldActive ? hull : Math.max(0,hull-amount),
      absorbed: shieldActive, destroyed: !shieldActive && hull <= amount};}},
    addEventListener() {}, state: 'menu', player: {x: 360, y: 900}, W: 720, H: 1280,
    classicChapterStory: null, classicChapterView: null, classicFlightView: null,
    classicWeapons: weapons.createClassicWeapons(), classicSalvageLedger: createScrapLedger({storage}),
    classicSalvageState: null, warpTimer: 0, atlasBoss: null, atlasReentryGrace: 0, atlasFireTimer: 0,
    SPRITES: {atlasVfx: {}, guardianAtlas: {}}, spriteReady: () => true, SHIP_VISUAL: {classicScale: .52},
    SHIP_COLLISION_HALF_WIDTH: 40,
    cameraKickY: 0, ammo: 20, manualShotCooldown: 0, ui: {}, powers: {slow: 0, shield: 0}, items: [],
    impactEffects: [], EFFECT_LIMITS: {impacts: 32}, elapsed: 0, classicChapterOutroStartedAt: null,
    score: 0, hudScoreTarget: 0, hull: 100, classicHullReserve: 30, classicHullReserveCapacity: 30,
    classicShieldImpact: 0, damageSmokeLocked: false, damageSmokeSide: 1,
    impactReactionTimer: 0, impactReactionSide: 1, combo: 1, comboTimer: 0, shake: 0, flash: 0,
    burst() {}, pulseRing() {}, addImpactEffect() {}, addMissileImpact() {}, hud() {},
    animateScoutHit() {}, addExplosion() {}, collisionCircles: item => [{x: 0, y: 0, r: item.r}],
    squaredDistanceToSegment(x,y,ax,ay,bx,by) {
      const dx = bx-ax, dy = by-ay, length = dx*dx+dy*dy;
      const t = length ? Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)) : 0;
      return (x-ax-t*dx)**2+(y-ay-t*dy)**2;
    }});
  vm.runInContext(sources, sandbox);
  // These presentation boundaries are unrelated to sound policy and deliberately
  // tagged; combat dispatch, damage, ledger and guardian rules remain real.
  sandbox.updateAmmoHud = () => {};
  sandbox.syncAtlasHud = () => {};
  sandbox.signalClassicChapter = () => {};
  sandbox.spawnClassicScrap = item => calls.scrap.push(item);
  // Atlas v9 (plan F3c): los drones son patrullas CH-01, fuera de este contrato de sonido.
  sandbox.spawnAtlasDrones = () => {};
  for (const name of ['burst','pulseRing','addImpactEffect','addMissileImpact','hud','animateScoutHit','addExplosion']) {
    sandbox[name] = () => {};
  }
  return {sandbox, calls, records, bank: () => bank,
    async start() {
      sandbox.startMusic(); await flush();
      if (bank.snapshot().loading) await vm.runInContext('combatSfx.load()', sandbox);
      sandbox.state = 'playing'; sandbox.updateScore(0); return this;
    },
    blockStorage(value = true) {blocked = value;},
    advance(seconds) {sandbox.audioCtx.currentTime += seconds;}
  };
}

test('evaluating the existing game sources creates no AudioContext, decoder, autoplay or audio loop', () => {
  const h = harness();
  assert.equal(h.calls.contexts.length, 0); assert.equal(h.calls.fetches, 0);
  assert.equal(h.calls.sources.length, 0); assert.equal(h.calls.oscillators.length, 0);
});

test('classic starts one shared context and one bank connected to that context, without sounding in menus', async () => {
  const h = harness(); h.sandbox.startMusic(); await flush();
  for (let visit = 0; visit < 10; visit++) h.sandbox.startMusic();
  assert.equal(h.calls.contexts.length, 1); assert.equal(h.calls.sfxFactories.length, 1);
  assert.equal(h.calls.sfxFactories[0].context, h.sandbox.audioCtx);
  // Revisión de audio 22/10: los efectos salen por el bus maestro (con limitador), no directo.
  assert.ok(h.calls.gains.includes(h.calls.sfxFactories[0].output));
  assert.notEqual(h.calls.sfxFactories[0].output, h.sandbox.audioCtx.destination);
  assert.equal(h.calls.fetches, 1); assert.equal(h.calls.decode, 1);
  assert.equal(h.bank().snapshot().paused, true);
  assert.equal(h.calls.sources.length, 0); assert.equal(h.calls.oscillators.length, 0);
});

test('ready combat plays the bank with viewport-relative pan and cannot also emit a fallback tone', async () => {
  const h = await harness().start(); h.sandbox.combatSound('phaser',0,'shot-a');
  assert.equal(h.calls.sources.length, 1); assert.equal(h.calls.oscillators.length, 0);
  assert.equal(h.calls.sounds[0].options.pan, -.75);
  assert.equal(h.calls.sounds[0].options.eventId, 'shot-a');
});

test('a throttled or duplicated ready event remains silent instead of reverting to the old beep', async () => {
  const h = await harness().start();
  h.sandbox.combatSound('phaser',360,'same-shot');
  h.sandbox.combatSound('phaser',360,'same-shot');
  h.sandbox.combatSound('phaser',360,'too-soon');
  assert.deepEqual(h.calls.sounds.map(item => item.played), [true,false,false]);
  assert.equal(h.calls.sources.length, 1); assert.equal(h.calls.oscillators.length, 0);
});

test('a decoder failure retains a bounded tone fallback only during an active classic match', async () => {
  const h = await harness({ready: false}).start();
  assert.equal(h.bank().snapshot().failed, true);
  h.sandbox.combatSound('missile-launch');
  assert.equal(h.calls.sources.length, 0); assert.equal(h.calls.oscillators.length, 1);
  for (let frame = 0; frame < 120; frame++) h.sandbox.updateScore(1/60);
  assert.equal(h.calls.fetches, 1); assert.equal(h.calls.decode, 1);
});

for (const ready of [true, false]) {
  test(`muting FX suppresses both rendered and fallback effects (bank ready=${ready})`, async () => {
    const h = await harness({ready}).start();
    h.sandbox.settings.fx = 0; h.sandbox.updateAudioVolumes(); h.sandbox.combatSound('hull-hit');
    assert.equal(h.calls.sources.length, 0); assert.equal(h.calls.oscillators.length, 0);
    assert.equal(h.bank().snapshot().enabled, false); assert.equal(h.bank().snapshot().volume, 0);
    assert.equal(h.calls.writes.length, 0, 'sound policy never writes progress or money');
  });
  test(`pause and menu block new combat effects while preserving ordinary UI tones (bank ready=${ready})`, async () => {
    const h = await harness({ready}).start();
    for (const state of ['paused','menu','gameover']) {
      h.sandbox.state = state; h.sandbox.updateScore(0,true); h.sandbox.combatSound('hull-hit');
    }
    assert.equal(h.calls.sources.length, 0); assert.equal(h.calls.oscillators.length, 0);
    h.sandbox.tone(500,.04,'sine',.02);
    assert.equal(h.calls.oscillators.length, 1, 'general UI feedback remains usable outside a match');
  });
  test(`background suspension stops all voices and cannot replay them automatically on return (bank ready=${ready})`, async () => {
    const h = await harness({ready}).start(); h.sandbox.combatSound('missile-launch');
    const before = h.calls.sources.length + h.calls.oscillators.length;
    await h.sandbox.suspendAudio(); h.sandbox.combatSound('hull-hit');
    assert.equal(h.sandbox.audioCtx.state, 'suspended'); assert.equal(h.bank().snapshot().activeVoices, 0);
    assert.equal(h.calls.sources.length + h.calls.oscillators.length, before);
    await h.sandbox.resumeAudio(); h.sandbox.updateScore(0);
    assert.equal(h.sandbox.audioCtx.state, 'running');
    assert.equal(h.calls.sources.length + h.calls.oscillators.length, before);
  });
}

test('live volume settings affect the original bank and do not rebuild its graph or decoder', async () => {
  const h = await harness().start();
  h.sandbox.settings.fx = 23; h.sandbox.updateAudioVolumes();
  assert.equal(h.bank().snapshot().volume, .23);
  h.sandbox.settings.music = 0; h.sandbox.updateAudioVolumes();
  h.sandbox.combatSound('hull-hit'); assert.equal(h.calls.sources.length, 1);
  assert.equal(h.calls.contexts.length, 1); assert.equal(h.calls.decode, 1);
});

test('the real Phaser trigger makes one sound per accepted discharge, including a two-barrel weapon', async () => {
  const h = await harness().start();
  h.sandbox.classicWeapons = weapons.createClassicWeapons({type:'twin',unlocked:['pulse','twin']});
  assert.equal(h.sandbox.fireClassicWeapon(), true);
  assert.equal(h.sandbox.classicWeapons.projectiles.length, 2);
  assert.equal(h.calls.sounds.filter(item => item.name === 'phaser').length, 1);
  assert.equal(h.sandbox.fireClassicWeapon(), false, 'cadence rejects a repeated frame');
  assert.equal(h.calls.sounds.length, 1); assert.equal(h.calls.oscillators.length, 0);
});

test('a missile sound follows its durable ammo debit and a rejected write cannot emit a missile or its sound', async () => {
  const h = await harness().start();
  assert.equal(h.sandbox.fireClassicMissile(), true);
  assert.equal(h.sandbox.classicSalvageState.missileAmmo, 2);
  assert.equal(h.sandbox.classicWeapons.projectiles.filter(item => item.weapon === 'missile').length, 1);
  assert.equal(h.calls.sounds[0].name, 'missile-launch'); assert.equal(h.calls.sounds[0].options.eventId, 'missile:1');
  assert.ok(h.calls.timeline.indexOf('durable-missile-write') < h.calls.timeline.indexOf('sample-start'));
  assert.equal(h.sandbox.fireClassicMissile(), false); assert.equal(h.calls.sounds.length, 1);
  h.sandbox.classicWeapons.missileCooldown = 0; h.advance(1); h.blockStorage();
  assert.equal(h.sandbox.fireClassicMissile(), false);
  assert.equal(h.calls.sounds.length, 1); assert.equal(h.calls.sources.length, 1);
});

test('real physical target contact plays one destruction event, and a consumed projectile cannot repeat it', async () => {
  const h = await harness().start(); h.sandbox.fireClassicWeapon();
  weapons.advanceClassicWeapons(h.sandbox.classicWeapons,.05); h.advance(.3);
  const target = {id:'target-1',type:'scout',x:360,y:800,r:30,hp:1,rot:0,classicScout:{tacticsVersion:1}};
  assert.equal(h.sandbox.interceptClassicProjectile(target), true);
  assert.equal(h.sandbox.interceptClassicProjectile(target), false);
  assert.equal(h.calls.sounds.filter(item => item.name === 'enemy-break').length, 1);
  assert.equal(h.calls.oscillators.length, 0);
});

test('real reserve and hull damage each dispatch exactly one hull-hit rather than stacking old tones', async () => {
  const h = await harness().start(); h.sandbox.damageShip(10,200,900);
  assert.equal(h.sandbox.classicHullReserve,20); assert.equal(h.sandbox.hull,100);
  assert.equal(h.calls.sounds.filter(item => item.name === 'hull-hit').length,1);
  h.sandbox.classicHullReserve = 0; h.advance(1); h.sandbox.damageShip(15,520,900);
  assert.equal(h.sandbox.hull,85);
  assert.equal(h.calls.sounds.filter(item => item.name === 'hull-hit').length,2);
  assert.equal(h.calls.oscillators.length,0); assert.equal(h.calls.writes.length,0);
});

test('real Atlas simulation dispatches charge only at state entry, independent of repeated animation frames', async () => {
  const h = await harness().start(); h.sandbox.atlasBoss = guardian.createGuardianAtlas({playerY:900});
  let transitions = 0;
  for (let frame = 0; frame < 2400; frame++) {
    const previous = h.sandbox.atlasBoss.state;
    h.sandbox.updateAtlasEncounter(1/60); h.advance(1/60);
    if (previous !== 'charge' && h.sandbox.atlasBoss.state === 'charge') transitions++;
  }
  assert.ok(transitions >= 3);
  assert.equal(h.calls.sounds.filter(item => item.name === 'atlas-charge').length, transitions);
  assert.equal(h.calls.oscillators.length,0);
});

test('real Atlas core hits produce a single terminal collapse/reward and ignore repeated contacts after disable', async () => {
  const h = await harness().start();
  const boss = h.sandbox.atlasBoss = guardian.createGuardianAtlas({playerY:900});
  boss.state = 'exposed'; boss.vulnerability = true; boss.y = boss.targetY;
  h.sandbox.resolveAtlasPulse({atlasTarget:boss,x2:boss.x,damage:96,weapon:'pulse'});
  h.sandbox.resolveAtlasPulse({atlasTarget:boss,x2:boss.x,damage:96,weapon:'pulse'});
  assert.equal(boss.disabled,true); assert.equal(boss.hp,0);
  assert.equal(h.calls.sounds.filter(item => item.name === 'atlas-collapse').length,1);
  assert.equal(h.calls.scrap.length,1);
  assert.equal(h.calls.oscillators.length,0);
});
