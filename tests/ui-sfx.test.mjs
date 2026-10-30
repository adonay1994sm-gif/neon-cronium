import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createUiSfx, UI_SFX_CUES, UI_SFX_SRC, UI_SFX_DURATION} from '../src/game/audio/ui-sfx.js';

const base = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, base));

test('the UI bank matches its atlas, its manifest entry and the Kenney CC0 sources', () => {
  const meta = JSON.parse(read('assets/ui_sfx_atlas_v1.json'));
  assert.equal(meta.src, UI_SFX_SRC);
  assert.equal(meta.duration, UI_SFX_DURATION);
  assert.deepEqual(meta.cues, JSON.parse(JSON.stringify(UI_SFX_CUES)));
  const entry = JSON.parse(read('ASSET_MANIFEST.json')).standalone.find(item => item.path === UI_SFX_SRC);
  assert.equal(entry.sha256, crypto.createHash('sha256').update(read(UI_SFX_SRC)).digest('hex'));
  assert.ok(entry.size < 200000, 'small enough to precache');
  for (const license of ['License-interface-sounds.txt', 'License-sci-fi-sounds.txt'])
    assert.match(read(`art-source/audio/kenney-cc0/${license}`).toString(), /Creative Commons Zero, CC0/);
  const script = read('scripts/build-ui-sfx.py').toString();
  for (const name of script.match(/\[('[A-Za-z_0-9]+'(?:, )?)+\]/g).join(',').match(/[A-Za-z_]+_\d+/g))
    assert.ok(fs.existsSync(new URL(`art-source/audio/kenney-cc0/${name}.ogg`, base)), name);
  let last = -1;
  for (const [name, cue] of Object.entries(UI_SFX_CUES)) for (const {offset, duration} of cue.variants) {
    assert.ok(offset > last && offset + duration <= UI_SFX_DURATION + 1e-9, name);
    last = offset;
  }
});

test('the UI bank plays its own atlas through the shared player', async () => {
  const node = () => ({connect(target) { return target; }, disconnect() {}});
  const param = () => ({value: 0, setValueAtTime(value) { this.value = value; }, setTargetAtTime(value) { this.value = value; }});
  const starts = [], fetched = [];
  const context = {state: 'running', currentTime: 0,
    createGain: () => ({...node(), gain: param()}),
    createBufferSource: () => ({...node(), start(...args) { starts.push(args); }, stop() {}}),
    decodeAudioData: async () => ({duration: UI_SFX_DURATION, length: 1, numberOfChannels: 1})};
  const sfx = createUiSfx({context, output: node(),
    fetchAsset: async url => { fetched.push(url); return {ok: true, arrayBuffer: async () => new ArrayBuffer(8)}; }});
  assert.equal(await sfx.load(), true);
  assert.deepEqual(fetched, [UI_SFX_SRC]);
  sfx.setPaused(false);
  assert.equal(sfx.play('confirm'), true);
  assert.deepEqual(starts[0], [0, UI_SFX_CUES.confirm.variants[0].offset, UI_SFX_CUES.confirm.variants[0].duration]);
  assert.equal(sfx.play('phaser'), false, 'combat cues are not in this bank');
});

test('the game no longer beeps with tone() outside the audio fallback', () => {
  for (const file of fs.readdirSync(new URL('src/game/', base)).filter(name => /^0[3-8]-.*\.js$/.test(name)))
    assert.doesNotMatch(read(`src/game/${file}`).toString(), /\btone\(/, file);
});
