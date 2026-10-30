import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// Execute the actual source module with a minimal Web Audio boundary. This is a
// logic regression; browser autoplay and physical Safari remain separate checks.
const source = await readFile(new URL('../src/game/02-storage-audio.js', import.meta.url), 'utf8');
function audioHarness(music, fx) {
  const context = vm.createContext({
    settings: {music, fx}, musicGain: null, addEventListener() {},
    audioCtx: {
      state: 'running', resumeCount: 0,
      async suspend() { this.state = 'suspended'; },
      async resume() { this.resumeCount++; this.state = 'running'; }
    }
  });
  vm.runInContext(source, context);
  return context;
}

test('effects-only audio resumes after the shared context is suspended', async () => {
  const h = audioHarness(0, 70);
  await h.suspendAudio();
  assert.equal(h.audioCtx.state, 'suspended');
  await h.resumeAudio();
  assert.equal(h.audioCtx.state, 'running');
  assert.equal(h.audioCtx.resumeCount, 1);
  await h.resumeAudio();
  assert.equal(h.audioCtx.resumeCount, 1, 'already running context is not restarted');
});

test('music-only audio resumes, while fully muted audio stays suspended', async () => {
  for (const [music, fx, expected] of [[60, 0, 'running'], [0, 0, 'suspended']]) {
    const h = audioHarness(music, fx);
    await h.suspendAudio();
    await h.resumeAudio();
    assert.equal(h.audioCtx.state, expected);
  }
});

test('missing audio support and rejected autoplay do not break game resumption', async () => {
  const h = audioHarness(0, 70);
  h.audioCtx = null;
  await h.resumeAudio();
  h.audioCtx = {state: 'suspended', resume: () => Promise.reject(new Error('user gesture required'))};
  await h.resumeAudio();
  assert.equal(h.audioCtx.state, 'suspended');
});

// Revisión de audio 22/10 (pasos 1 y 4): bus maestro con limitador y tonos sin clic.
function graphHarness({failLimiter = false} = {}) {
  const edges = [];
  const param = () => ({value: 0, ramps: [], setValueAtTime(v, t) { this.ramps.push(['set', v, t]); },
    linearRampToValueAtTime(v, t) { this.ramps.push(['lin', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.ramps.push(['exp', v, t]); }, setTargetAtTime() {}});
  class FakeContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {kind: 'destination'}; }
    node(kind, extra = {}) {
      return Object.assign({kind, connect(target) { edges.push([kind, target.kind]); return target; }, disconnect() {}}, extra);
    }
    createGain() { return this.node('gain', {gain: param()}); }
    createOscillator() { return this.node('oscillator', {frequency: param(), start() {}, stop() {}}); }
    createDynamicsCompressor() {
      if (failLimiter) throw new Error('sin compresor');
      return this.node('limiter', {threshold: param(), knee: param(), ratio: param(), attack: param(), release: param()});
    }
    resume() { return Promise.resolve(); }
  }
  const gains = [];
  const createGain = FakeContext.prototype.createGain;
  FakeContext.prototype.createGain = function() { const node = createGain.call(this); gains.push(node); return node; };
  const context = vm.createContext({settings: {music: 50, fx: 70}, musicGain: null, audioCtx: null,
    addEventListener() {}, window: {AudioContext: FakeContext}});
  vm.runInContext(source, context);
  return {context, edges, gains};
}

test('every sound reaches the speakers only through the master limiter', () => {
  const {context, edges} = graphHarness();
  context.ensureAudio();
  context.tone(440, .1);
  const toDestination = edges.filter(([, target]) => target === 'destination').map(([from]) => from);
  assert.deepEqual(toDestination, ['limiter']);
  assert.ok(edges.some(([from, to]) => from === 'gain' && to === 'gain'), 'music and tones go through the master gain');
});

test('a tone starts silent and rises in 5 ms instead of jumping to full gain (no click)', () => {
  const {context} = graphHarness();
  const ac = context.ensureAudio();
  const gains = [];
  const original = ac.createGain.bind(ac);
  ac.createGain = () => { const node = original(); gains.push(node); return node; };
  context.tone(440, .1);
  const ramps = gains.at(-1).gain.ramps;
  // Revisión 4 (A4): el punto de partida va como evento, que WebKit respeta.
  assert.deepEqual(ramps[0].slice(0, 2), ['set', 0.0001]);
  assert.equal(ramps[1][0], 'lin');
  assert.ok(Math.abs(ramps[1][2] - .005) < 1e-9);
});

test('the master bus is turned down 3.3 dB to cancel the compressor make-up gain', () => {
  // Revisión 4 (A1): DynamicsCompressor añade ~+3,3 dB de compensación automática.
  const {context, gains} = graphHarness();
  context.ensureAudio();
  assert.equal(gains[0].gain.value, 0.68);
});

test('if the limiter cannot be built, audio still reaches the speakers through the master bus', () => {
  // Revisión 4 (A6): un fallo al montar el limitador no deja el juego mudo.
  const {context, edges} = graphHarness({failLimiter: true});
  assert.ok(context.ensureAudio());
  context.tone(440, .1);
  assert.deepEqual(edges.filter(([, target]) => target === 'destination').map(([from]) => from), ['gain']);
  assert.ok(edges.filter(([from, to]) => from === 'gain' && to === 'gain').length >= 2, 'music and tone reach the master bus');
});

// Audio paso 3 (tarea audio-canales): la música baja −6 dB en golpes, jefe,
// ruptura y transmisiones de LIRA o N-7; los efectos no pasan por ahí.
test('ducking lowers only the music by 6 dB, fast in and slow out', () => {
  const {context, edges, gains} = graphHarness();
  context.ensureAudio();
  const [master, music, duck] = gains;
  assert.ok(duck, 'the music has its own ducking stage');
  assert.ok(edges.some(([from, to]) => from === 'gain' && to === 'gain'));
  const calls = [];
  duck.gain.cancelScheduledValues = time => calls.push(['cancel', time]);
  duck.gain.setTargetAtTime = (value, time, constant) => calls.push(['target', value, time, constant]);
  context.duckMusic(.5);
  const [, down, up] = calls;
  assert.equal(calls[0][0], 'cancel');
  assert.ok(Math.abs(down[1] - .501) < .01 && down[2] === 0 && Math.abs(down[3] * 3 - .05) < .01, 'in: 0.05 s');
  assert.ok(up[1] === 1 && Math.abs(up[2] - .5) < 1e-9 && Math.abs(up[3] * 3 - .4) < .01, 'out: 0.4 s after the hold');
  assert.notEqual(duck, master);
  assert.notEqual(duck, music);
});
