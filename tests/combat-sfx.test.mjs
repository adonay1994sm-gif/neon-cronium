import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createCombatSfx, COMBAT_SFX_CUES, COMBAT_SFX_SRC, COMBAT_SFX_VOICE_LIMIT,
  COMBAT_SFX_GAIN_BUDGET, COMBAT_SFX_DURATION} from '../src/game/audio/combat-sfx.js';

const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => {resolve = yes; reject = no;}); return {promise, resolve, reject}; };
const base = new URL('../', import.meta.url);

function harness({fetchAsset, decode, panner = true, sourceStartError = false} = {}) {
  const output = {id: 'existing-fx-output'};
  const calls = {fetch: [], decode: 0, gains: [], sources: [], panners: []};
  function node(extra = {}) {
    return {connections: [], disconnects: 0,
      connect(target) {this.connections.push(target); return target;},
      disconnect() {this.disconnects++;}, ...extra};
  }
  function parameter() {
    return {value: 0, values: [], targets: [],
      setValueAtTime(value, time) {this.value = value; this.values.push([value, time]);},
      setTargetAtTime(value, time, duration) {this.value = value; this.targets.push([value, time, duration]);}};
  }
  const context = {state: 'running', currentTime: 0,
    createGain() { const result = node({gain: parameter()}); calls.gains.push(result); return result; },
    createBufferSource() {
      const result = node({starts: [], stops: [], onended: null,
        start(...args) {if (sourceStartError) throw new Error('source failed'); this.starts.push(args);},
        stop(...args) {this.stops.push(args);}});
      calls.sources.push(result); return result;
    },
    async decodeAudioData(bytes) {
      calls.decode++; assert.ok(bytes instanceof ArrayBuffer);
      return decode ? decode(bytes) : {duration: COMBAT_SFX_DURATION, length: 766080, numberOfChannels: 1};
    }
  };
  if (panner) context.createStereoPanner = () => {
    const result = node({pan: parameter()}); calls.panners.push(result); return result;
  };
  const fetchBoundary = url => {
    calls.fetch.push(url);
    return fetchAsset ? fetchAsset(url) : Promise.resolve({ok: true, arrayBuffer: async () => new ArrayBuffer(128)});
  };
  const sfx = createCombatSfx({context, output, fetchAsset: fetchBoundary});
  return {context, output, calls, sfx};
}

async function ready(options) {
  const h = harness(options); assert.equal(await h.sfx.load(), true); h.sfx.setPaused(false); return h;
}

// Banco v3 (02/11/2026): efectos CC0 elegidos por el propietario.
test('the v3 manifest matches the runtime offsets and every source sound is a recorded CC0 file', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('assets/combat_sfx_atlas_v3.json', base)));
  assert.equal(manifest.src, COMBAT_SFX_SRC);
  assert.equal(manifest.duration, COMBAT_SFX_DURATION);
  assert.deepEqual(manifest.cues, COMBAT_SFX_CUES);
  assert.ok(COMBAT_SFX_CUES['boss-laser'], 'the subguardian laser has its own sound');
  const provenance = fs.readFileSync(new URL('art-source/audio/combat-sfx-v3/PROVENANCE.md', base), 'utf8');
  const builder = fs.readFileSync(new URL('scripts/build-combat-sfx-v3.py', base), 'utf8');
  const sources = [...new Set([...builder.matchAll(/\('([a-z0-9_]+\.(?:ogg|wav|mp3))'/gi)].map(match => match[1]))];
  assert.ok(sources.length >= 10);
  for (const name of sources) {
    assert.ok(fs.existsSync(new URL(`art-source/audio/combat-sfx-v3/${name}`, base)), name);
    assert.match(provenance, new RegExp(name.replace('.', '\\.')), `${name} has its provenance`);
  }
  assert.ok(fs.statSync(new URL(COMBAT_SFX_SRC, base)).size < 350000);
});

test('v2 preserves all existing original PCM performances and adds weapon launches distinct from impacts', () => {
  const oldMeasurements = JSON.parse(fs.readFileSync(new URL('art-source/audio/combat-sfx-v1/measurements.json', base)));
  const newMeasurements = JSON.parse(fs.readFileSync(new URL('art-source/audio/combat-sfx-v2/measurements.json', base)));
  for (const original of oldMeasurements.stems) {
    const retained = newMeasurements.stems.find(item => item.cue === original.cue && item.variant === original.variant);
    assert.equal(retained.sha256, original.sha256);
  }
  const weapons = newMeasurements.stems.filter(item => ['enemy-phaser', 'enemy-heavy'].includes(item.cue));
  assert.equal(weapons.length, 4);
  assert.equal(new Set(weapons.map(item => item.sha256)).size, 4);
  for (const weapon of weapons) assert.ok(!oldMeasurements.stems.some(item => item.sha256 === weapon.sha256));
});

test('cue boundaries have silence guards and cannot leak into a neighboring event', () => {
  const segments = Object.values(COMBAT_SFX_CUES).flatMap(item => item.variants).sort((a,b) => a.offset - b.offset);
  for (let i = 1; i < segments.length; i++) assert.ok(segments[i].offset - (segments[i-1].offset + segments[i-1].duration) >= .1199);
  assert.ok(segments.at(-1).offset + segments.at(-1).duration <= COMBAT_SFX_DURATION);
});

test('unsupported boundaries use legacy fallback without constructing another AudioContext', () => {
  for (const options of [{}, {context: {}, output: {}}, {context: {createGain() {throw new Error('unsupported');}}, output: {}}]) {
    assert.equal(createCombatSfx(options), null);
  }
});

test('construction connects only to its supplied bus, starts paused, and never fetches or plays automatically', () => {
  const h = harness();
  assert.deepEqual(h.calls.gains[0].connections, [h.output]);
  assert.equal(h.sfx.snapshot().paused, true);
  assert.equal(h.sfx.play('phaser'), false);
  assert.equal(h.calls.fetch.length, 0); assert.equal(h.calls.sources.length, 0);
});

test('concurrent loads share one network request and decoder allocation, including calls after readiness', async () => {
  const network = deferred();
  const h = harness({fetchAsset: () => network.promise});
  const first = h.sfx.load(), second = h.sfx.load();
  assert.equal(first, second); await tick();
  assert.equal(h.calls.fetch.length, 1); assert.equal(h.sfx.snapshot().loading, true);
  network.resolve({ok: true, arrayBuffer: async () => new ArrayBuffer(200)});
  assert.equal(await first, true); assert.equal(await second, true);
  assert.equal(await h.sfx.load(), true);
  assert.equal(h.calls.fetch.length, 1); assert.equal(h.calls.decode, 1);
  assert.equal(h.sfx.snapshot().decodedBytes, 3064320);
});

test('a real playback uses exactly one bounded segment of its cue', async () => {
  const h = await ready(); h.context.currentTime = 5;
  const [{offset, duration}] = COMBAT_SFX_CUES.phaser.variants;
  assert.equal(h.sfx.play('phaser', {eventId: 'shot-a', pan: -.4}), true);
  assert.deepEqual(h.calls.sources[0].starts, [[5, offset, duration]]);
  assert.equal(h.calls.panners[0].pan.value, -.4);
  h.context.currentTime += duration + .01;
  assert.equal(h.sfx.play('phaser', {eventId: 'shot-b', pan: 99}), true);
  assert.deepEqual(h.calls.sources[1].starts, [[5 + duration + .01, offset, duration]]);
  assert.equal(h.calls.panners[1].pan.value, .75);
});

test('enemy firing uses its own emission slices and never borrows an impact', async () => {
  const h = await ready();
  const shot = COMBAT_SFX_CUES['enemy-phaser'].variants[0], heavy = COMBAT_SFX_CUES['enemy-heavy'].variants[0];
  assert.equal(h.sfx.play('enemy-phaser', {eventId: 'patrol-1:shot-1', pan: -.35}), true);
  assert.deepEqual(h.calls.sources.at(-1).starts, [[0, shot.offset, shot.duration]]);
  h.context.currentTime = .3;
  assert.equal(h.sfx.play('enemy-phaser', {eventId: 'patrol-1:shot-2'}), true);
  assert.deepEqual(h.calls.sources.at(-1).starts, [[.3, shot.offset, shot.duration]]);
  h.context.currentTime = .6;
  assert.equal(h.sfx.play('enemy-heavy', {eventId: 'atlas-1:attack-1:volley-1', pan: .4}), true);
  assert.deepEqual(h.calls.sources.at(-1).starts, [[.6, heavy.offset, heavy.duration]]);
  h.context.currentTime = 1.25;
  assert.equal(h.sfx.play('enemy-heavy', {eventId: 'atlas-1:attack-1:volley-2'}), true);
  assert.deepEqual(h.sfx.snapshot().playedByCue, {'enemy-phaser': 2, 'enemy-heavy': 2});
  assert.equal(h.sfx.snapshot().playedByCue['impact-plasma'], undefined);
  for (const impact of ['impact-metal', 'impact-plasma', 'hull-hit'])
    assert.notEqual(COMBAT_SFX_CUES[impact].variants[0].offset, shot.offset);
  assert.throws(() => {h.sfx.snapshot().playedByCue['enemy-heavy'] = 99;}, TypeError);
});

test('a repeated enemy emission event remains silent but a new physical volley can play', async () => {
  const h = await ready();
  assert.equal(h.sfx.play('enemy-heavy', {eventId: 'atlas-session-9:2:0'}), true);
  h.context.currentTime = .7;
  assert.equal(h.sfx.play('enemy-heavy', {eventId: 'atlas-session-9:2:0'}), false);
  assert.equal(h.sfx.play('enemy-heavy', {eventId: 'atlas-session-9:2:1'}), true);
  assert.equal(h.calls.sources.length, 2);
});

test('loading or retrying does not queue obsolete enemy shots or bypass mute once decoding finishes', async () => {
  const decoder = deferred();
  const h = harness({decode: () => decoder.promise});
  const pending = h.sfx.load();
  h.sfx.setPaused(false);
  await tick(); await tick();
  assert.equal(h.sfx.play('enemy-phaser', {eventId: 'old-enemy-shot'}), false);
  h.sfx.setVolume(0);
  decoder.resolve({duration: COMBAT_SFX_DURATION, length: 766080, numberOfChannels: 1});
  assert.equal(await pending, true);
  assert.equal(h.sfx.play('enemy-heavy'), false);
  assert.equal(h.calls.sources.length, 0);
  h.sfx.setVolume(.6);
  assert.equal(h.calls.sources.length, 0, 'no replay of the missed shot after load or unmute');
  assert.equal(h.sfx.play('enemy-phaser', {eventId: 'new-enemy-shot'}), true);
  assert.equal(h.calls.sources.length, 1);
});

test('missing stereo panner still plays through the shared gain graph without creating spatial polyfills', async () => {
  const h = await ready({panner: false});
  assert.equal(h.sfx.play('impact-metal', {pan: .5}), true);
  assert.equal(h.calls.panners.length, 0);
  assert.equal(h.calls.gains.at(-1).connections[0], h.calls.gains[0]);
});

test('repeating an animation event ID cannot fire the sound twice, even after its original voice has ended', async () => {
  const h = await ready();
  assert.equal(h.sfx.play('missile-launch', {eventId: 'missile-78'}), true);
  h.context.currentTime = 2;
  assert.equal(h.sfx.play('missile-launch', {eventId: 'missile-78'}), false);
  assert.equal(h.calls.sources.length, 1);
  assert.equal(h.sfx.play('missile-launch', {eventId: 'missile-79'}), true);
});

test('an impact storm is rate-limited and low-priority bursts cannot exhaust the mix budget', async () => {
  const h = await ready();
  for (let i = 0; i < 100; i++) h.sfx.play('impact-metal', {eventId: `storm-${i}`});
  assert.equal(h.calls.sources.length, 1);
  assert.equal(h.sfx.snapshot().dropped, 99);
  h.context.currentTime += .05;
  h.sfx.play('impact-metal');
  h.context.currentTime += .05;
  h.sfx.play('impact-metal');
  h.context.currentTime += .05;
  assert.equal(h.sfx.play('impact-metal'), false, 'maximum three simultaneous metal collisions');
  assert.ok(h.sfx.snapshot().activeVoices <= COMBAT_SFX_VOICE_LIMIT);
  assert.ok(h.sfx.snapshot().activeGain <= COMBAT_SFX_GAIN_BUDGET);
});

test('player hull impact steals expendable phaser voices instead of getting lost in a busy mix', async () => {
  const h = await ready();
  for (let i = 0; i < 3; i++) {h.sfx.play('phaser'); h.context.currentTime += .05;}
  h.sfx.play('impact-metal'); h.context.currentTime += .05;
  h.sfx.play('impact-plasma');
  assert.equal(h.sfx.play('hull-hit'), true);
  assert.ok(h.sfx.snapshot().stolen >= 1);
  assert.ok(h.calls.sources.some(source => source.stops.length > 0));
  assert.ok(h.sfx.snapshot().activeGain <= COMBAT_SFX_GAIN_BUDGET + Number.EPSILON);
});

test('Atlas collapse is prioritised above combat, but repeated collapse frames remain one event', async () => {
  const h = await ready(); h.sfx.play('hull-hit'); h.sfx.play('atlas-charge');
  assert.equal(h.sfx.play('atlas-collapse', {eventId: 'atlas-end'}), true);
  h.context.currentTime += 1.1;
  assert.equal(h.sfx.play('atlas-collapse', {eventId: 'atlas-end'}), false);
  assert.equal(h.sfx.snapshot().played, 3);
});

for (const policy of ['pause', 'mute', 'zero-volume', 'suspended-context']) {
  test(`${policy} stops or suppresses playback and does not replay an old burst on recovery`, async () => {
    const h = await ready(); h.sfx.play('missile-launch');
    if (policy === 'pause') h.sfx.setPaused(true);
    if (policy === 'mute') h.sfx.setEnabled(false);
    if (policy === 'zero-volume') h.sfx.setVolume(0);
    if (policy === 'suspended-context') h.context.state = 'suspended';
    assert.equal(h.sfx.play('phaser'), false);
    assert.equal(h.sfx.play('enemy-phaser'), false);
    assert.equal(h.sfx.play('enemy-heavy'), false);
    if (policy !== 'suspended-context') {
      assert.equal(h.sfx.snapshot().activeVoices, 0);
      assert.equal(h.calls.sources[0].stops.length, 1);
    }
    h.sfx.setPaused(false); h.sfx.setEnabled(true); h.sfx.setVolume(1); h.context.state = 'running';
    assert.equal(h.calls.sources.length, 1);
    h.context.currentTime += 2;
    assert.equal(h.sfx.play('phaser'), true);
    assert.equal(h.sfx.play('enemy-phaser'), true);
  });
}

test('volume clamps to the supported range and uses smoothing on the existing local bus', async () => {
  const h = await ready(); h.sfx.setVolume(4);
  assert.equal(h.sfx.snapshot().volume, 1);
  h.sfx.setVolume(.3);
  assert.deepEqual(h.calls.gains[0].gain.targets.at(-1), [.3, 0, .02]);
});

test('a heavy enemy launch can displace player pulses while respecting the existing mix budget', async () => {
  const h = await ready();
  for (let index = 0; index < 3; index++) {h.sfx.play('phaser'); h.context.currentTime += .05;}
  h.sfx.play('enemy-phaser'); h.context.currentTime += .06;
  h.sfx.play('impact-metal');
  assert.equal(h.sfx.play('enemy-heavy'), true);
  assert.ok(h.sfx.snapshot().stolen >= 1);
  assert.ok(h.sfx.snapshot().activeGain <= COMBAT_SFX_GAIN_BUDGET + Number.EPSILON);
  assert.ok(h.sfx.snapshot().activeVoices <= COMBAT_SFX_VOICE_LIMIT);
});

for (const failure of ['http', 'empty', 'oversized', 'decoder', 'short', 'old-bank', 'long']) {
  test(`${failure} load failure is contained and exposes fallback without scheduling a retry loop`, async () => {
    const h = harness({fetchAsset: async () => ({ok: failure !== 'http', arrayBuffer: async () =>
      new ArrayBuffer(failure === 'empty' ? 0 : failure === 'oversized' ? 4 * 1024 * 1024 + 1 : 100)}),
      decode: async () => {
        if (failure === 'decoder') throw new Error('unsupported codec');
        return {duration: failure === 'short' ? 4 : failure === 'old-bank' ? 13.68 : failure === 'long' ? 200 : COMBAT_SFX_DURATION};
      }});
    assert.equal(await h.sfx.load(), false);
    assert.equal(h.sfx.snapshot().failed, true); assert.equal(h.sfx.snapshot().ready, false);
    for (let frame = 0; frame < 100; frame++) assert.equal(h.sfx.play('phaser'), false);
    assert.equal(h.calls.fetch.length, 1); assert.equal(h.calls.sources.length, 0);
  });
}

test('a synchronous fetch failure permits a later explicit load retry', async () => {
  let tries = 0;
  const h = harness({fetchAsset: () => {
    if (++tries === 1) throw new Error('network unavailable');
    return {ok: true, arrayBuffer: async () => new ArrayBuffer(128)};
  }});
  assert.equal(await h.sfx.load(), false); assert.equal(h.sfx.snapshot().loading, false);
  assert.equal(await h.sfx.load(), true); assert.equal(tries, 2);
});

test('ending a voice releases nodes once even when callbacks race with pause', async () => {
  const h = await ready(); h.sfx.play('missile-launch');
  const source = h.calls.sources[0], callback = source.onended;
  h.sfx.setPaused(true); callback();
  assert.equal(source.disconnects, 1); assert.equal(h.calls.gains[1].disconnects, 1);
  assert.equal(h.sfx.snapshot().activeVoices, 0);
});

test('elapsed voices are pruned even if the audio thread delays onended', async () => {
  const h = await ready(); h.sfx.play('phaser');
  h.context.currentTime = 10; h.sfx.play('missile-launch');
  assert.equal(h.sfx.snapshot().activeVoices, 1);
  assert.equal(h.calls.sources[0].disconnects, 1);
});

test('disposing during decoding cannot revive the graph or retain decoded memory', async () => {
  const decoded = deferred();
  const h = harness({decode: () => decoded.promise});
  const pending = h.sfx.load(); await tick(); await tick();
  h.sfx.dispose(); h.sfx.dispose();
  decoded.resolve({duration: COMBAT_SFX_DURATION, length: 766080, numberOfChannels: 1});
  assert.equal(await pending, false); assert.equal(await h.sfx.load(), false);
  assert.equal(h.sfx.snapshot().disposed, true); assert.equal(h.sfx.snapshot().decodedBytes, 0);
  assert.equal(h.calls.gains[0].disconnects, 1);
  h.sfx.setPaused(false); h.sfx.setEnabled(true); h.sfx.setVolume(1);
  assert.equal(h.sfx.play('phaser'), false); assert.equal(h.calls.sources.length, 0);
});

test('unknown names and prototype keys cannot schedule sources; snapshots cannot mutate policy', async () => {
  const h = await ready();
  for (const name of ['unknown', '__proto__', 'constructor', 'toString', null]) assert.equal(h.sfx.play(name), false);
  assert.equal(h.calls.sources.length, 0);
  assert.throws(() => {h.sfx.snapshot().enabled = false;}, TypeError);
  assert.equal(h.sfx.snapshot().enabled, true);
});

test('a failed source start releases the partially constructed graph and remains recoverable', async () => {
  const h = await ready({sourceStartError: true});
  assert.equal(h.sfx.play('hull-hit'), false);
  assert.equal(h.sfx.snapshot().activeVoices, 0); assert.equal(h.sfx.snapshot().ready, true);
  assert.equal(h.calls.sources[0].disconnects, 1);
});
