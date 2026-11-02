import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createMoodMusic, MOOD_MUSIC_TRACKS, MOOD_MUSIC_FADE} from '../src/game/audio/mood-music.js';

// Música nueva (propietario, 02/11/2026): una pista por momento con fundido.
function harness() {
  const audios = [], gains = [];
  const param = () => ({value: 0, events: [], setTargetAtTime(v, t, c) { this.events.push(['target', v, t, c]); this.value = v; },
    cancelScheduledValues() { this.events.push(['cancel']); }, setValueAtTime(v) { this.value = v; }});
  const context = {currentTime: 10,
    createMediaElementSource(audio) { return {audio, connect(node) { audio.out = node; return node; }, disconnect() {}}; },
    createGain() { const node = {gain: param(), connect(target) { node.to = target; return target; }, disconnect() {}}; gains.push(node); return node; }};
  const createAudio = () => {
    const audio = {paused: true, src: '', loop: false, plays: 0, currentTime: 0,
      play() { this.paused = false; this.plays++; return Promise.resolve(); }, pause() { this.paused = true; },
      removeAttribute(name) { if (name === 'src') this.src = ''; }, load() {}};
    audios.push(audio); return audio;
  };
  const output = {name: 'musicGain'};
  return {music: createMoodMusic({context, output, createAudio}), audios, gains, context, output};
}

test('there is one looping track per moment and the files exist', () => {
  assert.deepEqual(Object.keys(MOOD_MUSIC_TRACKS), ['menu', 'vuelo', 'subjefe', 'jefe']);
  for (const src of Object.values(MOOD_MUSIC_TRACKS)) assert.ok(fs.existsSync(new URL(`../${src}`, import.meta.url)), src);
});

test('a mood starts its track looping and fades it in; nothing plays without a mood', () => {
  const h = harness();
  h.music.update({mood: null});
  assert.equal(h.audios.every(audio => audio.paused), true);
  h.music.update({mood: 'menu'});
  const playing = h.audios.find(audio => !audio.paused);
  assert.equal(playing.src, MOOD_MUSIC_TRACKS.menu);
  assert.equal(playing.loop, true);
  assert.equal(playing.out.gain.events.at(-1)[1], 1, 'fades in to full');
  h.music.update({mood: 'menu'}); h.music.update({mood: 'menu'});
  assert.equal(playing.plays, 1, 'the same mood does not restart the track');
  assert.equal(h.music.snapshot().mood, 'menu');
});

test('changing mood crossfades: the new track rises while the old one fades and then stops', () => {
  const h = harness();
  h.music.update({mood: 'vuelo'});
  const flight = h.audios.find(audio => !audio.paused);
  h.music.update({mood: 'jefe'});
  const boss = h.audios.find(audio => !audio.paused && audio !== flight);
  assert.equal(boss.src, MOOD_MUSIC_TRACKS.jefe);
  assert.equal(flight.out.gain.events.at(-1)[1], 0, 'the flight music fades out');
  assert.equal(boss.out.gain.events.at(-1)[1], 1);
  h.context.currentTime += MOOD_MUSIC_FADE * 3;
  h.music.update({mood: 'jefe'});
  assert.equal(flight.paused, true, 'the old track stops after the fade');
  h.music.update({mood: 'vuelo'});
  assert.equal(h.music.snapshot().mood, 'vuelo');
  const back = h.audios.find(audio => audio.src === MOOD_MUSIC_TRACKS.vuelo);
  assert.equal(back.paused, false); assert.equal(back.out.gain.events.at(-1)[1], 1, 'back to the flight music');
  assert.equal(boss.out.gain.events.at(-1)[1], 0, 'the boss music fades out');
});

test('pause, mute and suspend stop the music; it comes back on the same mood', () => {
  const h = harness();
  h.music.update({mood: 'subjefe'});
  const track = h.audios.find(audio => !audio.paused);
  h.music.update({mood: 'subjefe', paused: true});
  assert.equal(track.paused, true);
  h.music.update({mood: 'subjefe'});
  assert.equal(track.paused, false);
  h.music.update({mood: 'subjefe', enabled: false});
  assert.equal(track.paused, true);
  h.music.update({mood: 'subjefe'});
  h.music.suspend();
  assert.equal(h.audios.every(audio => audio.paused), true);
  assert.throws(() => h.music.update({mood: 'karaoke'}), RangeError);
});

test('unlock (inside a tap) starts and stops the idle player in silence so later fades can play on iPhone', async () => {
  const h = harness();
  h.music.update({mood: 'menu'});
  h.music.unlock();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(h.audios.every(audio => audio.plays === 1), true, 'both players have played once');
  const idle = h.audios.find(audio => audio.out.gain.events.length === 0);
  assert.equal(idle.paused, true); assert.equal(idle.out.gain.value, 0, 'it stays silent');
  assert.equal(h.audios.find(audio => audio !== idle).paused, false, 'the menu music keeps playing');
});

test('it only connects to the music bus it is given', () => {
  const h = harness();
  h.music.update({mood: 'menu'});
  assert.ok(h.gains.length >= 1 && h.gains.every(node => node.to === h.output));
});
