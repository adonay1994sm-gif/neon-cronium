import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {createScrapRecord, normalizeScrapRecord} from '../src/game/progression/scrap-economy.js';
import {createChronosVoyageCheckpoint} from '../src/game/progression/chronos-flight.js';

const root = new URL('..', import.meta.url);
// Read a single immutable text snapshot. These tests never rebuild or edit the
// application, and all cases below execute the same compiled legacy handlers.
const [html, core, content, game] = await Promise.all(
  ['index.html', 'core-runtime.js', 'content-runtime.js', 'game.js']
    .map(path => readFile(new URL(path, root), 'utf8'))
);
const SALVAGE_KEY = 'neonCronium.classicSalvage.v1';
const VOYAGE_KEY = 'neonCronium.chronosVoyage.v2';
const INTRO_PATH = 'assets/chapter1_intro_atlas_v1.webp';
const plain = value => JSON.parse(JSON.stringify(value));
const fundedRecord = balance => {
  const record = {...createScrapRecord(), balance, earned: balance};
  assert.ok(normalizeScrapRecord(record));
  return record;
};

/**
 * Controlled JSDOM integration fixture, not a natural playthrough, visual
 * acceptance test or physical device certification. Canvas/image layout and
 * pointer capture are mocked. Pause and workshop tests retain real items and
 * projectiles. The long service-route case explicitly supplies its collection
 * quota and clears unrelated hazards to isolate continuity/repair/idempotency.
 */
function harness(t, {campaign = '', salvage = fundedRecord(100), voyage = null, unlocked = 2, equipment = null} = {}) {
  const dom = new JSDOM(html, {url: `https://neon.test/${campaign ? '?campaign=' + campaign : ''}`,
    runScripts: 'outside-only', pretendToBeVisual: true});
  t.after(() => dom.window.close());
  const {window} = dom, {document} = window, loaded = new Set(), captures = [], writes = [];
  const gradient = {addColorStop() {}}, drawCalls = [];
  const context = new Proxy({}, {get(target, key) {
    if (key in target) return target[key];
    if (key === 'drawImage') return image => drawCalls.push(image?.path || null);
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
    if (key === 'measureText') return () => ({width: 20});
    return () => {};
  }, set(target, key, value) {target[key] = value; return true;}});
  const rect = {x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844};
  window.HTMLCanvasElement.prototype.getContext = () => context;
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  window.HTMLCanvasElement.prototype.getBoundingClientRect = () => rect;
  window.Element.prototype.getClientRects = function() {
    // JSDOM has no layout engine. This fixture supplies visibility only for the
    // real focus-loop handler, without claiming to test CSS or finger targets.
    const overlay = this.closest('.overlay');
    return this.closest('.hidden') || overlay && !overlay.classList.contains('show') ? [] : [rect];
  };
  window.Element.prototype.setPointerCapture = function(id) {captures.push({action: 'set', node: this.id, id});};
  window.Element.prototype.releasePointerCapture = function(id) {captures.push({action: 'release', node: this.id, id});};
  window.Image = class {
    constructor() {this.complete = true; this.naturalWidth = this.naturalHeight = 1024;}
    set src(path) {this.path = path; loaded.add(path);}
  };
  window.PointerEvent = class extends window.MouseEvent {
    constructor(type, options = {}) {
      super(type, options);
      for (const [key, value] of Object.entries({pointerId: options.pointerId ?? 1,
        pointerType: options.pointerType || 'touch', isPrimary: options.isPrimary ?? true})) {
        Object.defineProperty(this, key, {value});
      }
    }
  };
  const pending = new Map(); let frameId = 0;
  window.requestAnimationFrame = callback => (pending.set(++frameId, callback), frameId);
  window.cancelAnimationFrame = id => pending.delete(id);
  window.navigator.vibrate = () => true;
  window.localStorage.setItem('neon-unlocked-v2', String(unlocked));
  window.localStorage.setItem('neon-stars-v2', '{}');
  window.localStorage.setItem('neon-n7-unlocked-v1', '37');
  window.localStorage.setItem('neon-n7-best-v1', '2037');
  window.localStorage.setItem(SALVAGE_KEY, JSON.stringify(salvage));
  if(equipment)window.localStorage.setItem('neonCronium.flightEquipment.v1',JSON.stringify(equipment));
  if (voyage) window.localStorage.setItem(VOYAGE_KEY, JSON.stringify(voyage));
  const setItem = window.Storage.prototype.setItem;
  let blockSalvage = false;
  window.Storage.prototype.setItem = function(key, value) {
    if (blockSalvage && key === SALVAGE_KEY) throw new Error('Fixture: interrupted C9 monetary commit');
    const result = setItem.call(this, key, value);
    writes.push({key, value: String(value)});
    return result;
  };
  window.eval(core); window.eval(content);
  const marker = '  legacyFrameId = requestAnimationFrame(frame);\n})();';
  assert.equal(game.split(marker).length, 2, 'Actual legacy bootstrap marker must be unique');
  const hook = `
    const c9EventsForTest=[];
    const originalC9FlightEventForTest=classicFlightEvent;
    classicFlightEvent=function(event){c9EventsForTest.push({...event});return originalC9FlightEventForTest(event);};
    window.__ONBOARD_C9_TEST__={
      update,render,startLevel,openClassicDock,closeClassicDock,resumeGame,pauseGame,goHome,
      fireManualShot,beginClassicVoyageService,
      prepare(index=0,{skipOpening=true}={}){startLevel(index);spawnTimer=999;classicScoutTimer=999;classicPatrolTimer=999;
        if(skipOpening){classicChapterStory?.skipIntro();classicChapterView=classicChapterStory?.snapshot()||null;syncClassicChapterPresentation();}},
      seedCombatResources(){
        hull=61;classicHullReserve=12;
        items=[{id:'onboard-live-wreckage',type:'debris',x:W*.15,baseX:W*.15,y:H*.35,
          r:22,s:23,rot:0,rs:.1,p:0,phase:0,amp:0,alpha:1,special:'',hp:2,maxHp:2,damage:16}];
        fireManualShot();
      },
      serviceRouteFrame(dt){
        // Explicit route/collection fixture. No claim of natural survival or
        // earned quota: actual model events and service handlers stay intact.
        collected=36;energySpawned=36;items=[];gates=[];
        spawnTimer=classicScoutTimer=classicPatrolTimer=classicVoyageSpawnTimer=classicVoyageHazardTimer=999;
        update(dt);
      },
      damageHullForFixture(value){hull=value;},
      fixtureBoss(){atlasBoss={disabled:false};syncClassicFlightHud();},
      references:()=>({items,weapons:classicWeapons,projectiles:classicWeapons?.projectiles}),
      snapshot:()=>({state,elapsed,hull,reserve:classicHullReserve,reserveCapacity:classicHullReserveCapacity,
        collected,score,runToken,workshopOpened:classicWorkshopOpened,controlsLocked:classicChapterControlsLocked(),
        route:classicFlightView?JSON.parse(JSON.stringify(classicFlightView)):null,
        chapter:classicChapterView?JSON.parse(JSON.stringify(classicChapterView)):null,
        weapons:classicWeapons?NeonCampaign.classicWeaponSnapshot(classicWeapons):null,
        salvage:classicSalvageState?JSON.parse(JSON.stringify(classicSalvageState)):null,
        items:items.map(item=>({id:item.id,type:item.type,x:item.x,y:item.y,s:item.s,hp:item.hp})),
        shots:shots.map(shot=>({kind:shot.kind,life:shot.life,x1:shot.x1,x2:shot.x2})),
        input:{...classicFlightInput},fireInput:fireInput?{...fireInput}:null,
        events:c9EventsForTest.map(event=>({...event})),
        transmission:flightTransmission?{...flightTransmission}:null})
    };\n`;
  window.eval(game.replace(marker, hook + marker));
  const api = window.__ONBOARD_C9_TEST__, snapshot = () => plain(api.snapshot());
  const node = id => document.getElementById(id);
  const pointer = (target, type, id) => target.dispatchEvent(new window.PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId: id, clientX: 160, clientY: 590, buttons: 1
  }));
  const key = (target, value, options = {}) => {
    const event = new window.KeyboardEvent('keydown', {key: value, bubbles: true, cancelable: true, ...options});
    target.dispatchEvent(event); return event;
  };
  function runFrame(dt = 1 / 60) {
    assert.equal(pending.size, 1);
    const [id, callback] = pending.entries().next().value;
    pending.delete(id); callback(window.performance.now() + dt * 1000);
    assert.equal(pending.size, 1, 'real frame schedules exactly one successor');
  }
  return {window, document, api, node, pointer, key, runFrame, pending, snapshot, loaded, drawCalls, writes, captures,
    stored: key => window.localStorage.getItem(key), setSalvageBlocked: value => {blockSalvage = value;}};
}

const gameplay = snapshot => {
  const {elapsed, hull, reserve, reserveCapacity, collected, score, runToken, route, chapter,
    weapons, salvage, items, shots, events, transmission} = snapshot;
  return {elapsed, hull, reserve, reserveCapacity, collected, score, runToken, route, chapter,
    weapons, salvage, items, shots, events, transmission};
};

test('fresh classic launch plays the Chronos opening as a skippable film, then gives immediate controls without a cinematic image request', t => {
  const h = harness(t, {unlocked: 1}); h.api.prepare(0, {skipOpening: false});
  let q = h.snapshot();
  assert.equal(q.state, 'playing'); assert.equal(q.route.elapsed, 0);
  assert.equal(q.chapter.opening.film, true); assert.equal(q.controlsLocked, true);
  assert.equal(h.api.fireManualShot(), false, 'no combat while the film plays');
  h.api.update(1 / 60);
  assert.equal(h.document.body.classList.contains('chapter-opening'), true, 'the HUD hides during the film');
  assert.equal(h.node('chapterSkip').classList.contains('hidden'), false, 'the film can be skipped');
  h.node('chapterSkip').click(); q = h.snapshot();
  assert.equal(q.chapter.opening.active, false); assert.equal(q.controlsLocked, false);
  assert.equal(h.document.body.classList.contains('chapter-opening'), false);
  assert.equal(h.node('chapterSkip').classList.contains('hidden'), true);
  assert.equal(h.loaded.has(INTRO_PATH), false, 'retained historical opening art is not requested');
  assert.equal(h.node('classicC9').classList.contains('hidden'), true, 'C9 waits for its recovered module');
  assert.equal(h.node('flightWeapon').classList.contains('hidden'), true, 'one owned weapon needs no selector');
  assert.equal(h.node('fireWeapon').textContent, 'PHASER');
  assert.equal(h.node('flightPilotHint').textContent.includes('DESLIZA'), true);
  assert.equal(h.api.fireManualShot(), true, 'manual combat works as soon as the film is skipped');
  h.api.render(0);
  assert.equal(h.drawCalls.includes(INTRO_PATH), false, 'rendering does not sneak the cinematic back in');
  assert.equal(h.pending.size, 1);
});

test('opening HUD C9 freezes current gameplay resources without repairing, charging or replacing live objects', t => {
  const h = harness(t); h.api.prepare(); h.api.seedCombatResources();
  const before = h.snapshot(), references = h.api.references(), saved = h.stored(SALVAGE_KEY);
  assert.equal(before.hull, 61); assert.equal(before.reserve, 12); assert.equal(before.weapons.charges, 19);
  assert.equal(before.weapons.projectiles.length, 1); assert.equal(before.items.length, 1);
  h.node('classicC9').click(); const opened = h.snapshot();
  assert.equal(opened.state, 'paused'); assert.equal(opened.workshopOpened, true);
  assert.equal(h.node('flightDock').classList.contains('show'), true);
  assert.deepEqual(gameplay(opened), gameplay(before), 'opening has no free repair, refill, reward or route movement');
  assert.equal(h.stored(SALVAGE_KEY), saved, 'opening a valid current ledger is not a money transaction');
  assert.equal(h.api.references().items, references.items);
  assert.equal(h.api.references().weapons, references.weapons);
  assert.equal(h.api.references().projectiles, references.projectiles);
  for (let frame = 0; frame < 120; frame++) h.api.update(1 / 60);
  assert.deepEqual(gameplay(h.snapshot()), gameplay(before));
  assert.equal(h.api.fireManualShot(), false, 'a paused workshop cannot emit a combat shot');
  h.node('flightDockContinue').click(); const resumed = h.snapshot();
  assert.equal(resumed.state, 'playing'); assert.deepEqual(gameplay(resumed), gameplay(before));
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  assert.equal(h.document.activeElement, h.node('classicC9'));
  h.api.update(1 / 60);
  assert.ok(h.snapshot().route.elapsed > before.route.elapsed);
  assert.ok(h.snapshot().items[0].y > before.items[0].y, 'the same debris resumes physical motion');
  assert.ok(h.snapshot().weapons.projectiles[0].y < before.weapons.projectiles[0].y,
    'the same airborne projectile resumes flight');
  assert.equal(h.snapshot().hull, 61); assert.equal(h.pending.size, 1);
});

test('HUD C9 releases both held pointer contacts and does not resume a stale trigger or pilot anchor', t => {
  const h = harness(t); h.api.prepare();
  h.pointer(h.node('canvas'), 'pointerdown', 7);
  h.pointer(h.node('fire'), 'pointerdown', 9);
  const held = h.snapshot();
  assert.equal(held.input.active, true); assert.equal(held.input.id, 7);
  assert.deepEqual(held.fireInput, {kind: 'pointer', id: 9});
  assert.equal(held.weapons.shotSequence, 1);
  h.node('classicC9').click(); const opened = h.snapshot();
  assert.equal(opened.input.active, false); assert.equal(opened.fireInput, null);
  for (const [node, id] of [['canvas', 7], ['fire', 9]]) {
    assert.ok(h.captures.some(entry => entry.action === 'release' && entry.node === node && entry.id === id));
  }
  h.node('flightDockContinue').click(); h.runFrame();
  assert.equal(h.snapshot().input.active, false); assert.equal(h.snapshot().fireInput, null);
  assert.equal(h.snapshot().weapons.shotSequence, held.weapons.shotSequence,
    'returning from a workshop does not turn the old second thumb into automatic fire');
});

test('the C9 dialog establishes focus, wraps enabled controls and Escape returns focus without reopening pause', t => {
  const h = harness(t); h.api.prepare(); h.node('classicC9').click();
  assert.equal(h.node('flightDock').getAttribute('role'), 'dialog');
  assert.equal(h.node('flightDock').getAttribute('aria-modal'), 'true');
  assert.equal(h.document.activeElement, h.node('flightDockContinue'));
  const controls = [...h.node('flightDock').querySelectorAll('button:not(:disabled)')]
    .filter(button => !button.classList.contains('hidden') && button.getClientRects().length);
  assert.ok(controls.length >= 3);
  const first = controls[0], last = controls.at(-1);
  last.focus(); const forward = h.key(last, 'Tab');
  assert.equal(forward.defaultPrevented, true); assert.equal(h.document.activeElement, first);
  first.focus(); const backward = h.key(first, 'Tab', {shiftKey: true});
  assert.equal(backward.defaultPrevented, true); assert.equal(h.document.activeElement, last);
  const before = gameplay(h.snapshot()), escape = h.key(last, 'Escape');
  assert.equal(escape.defaultPrevented, true);
  assert.equal(h.snapshot().state, 'playing', 'Escape must not bubble and immediately pause again');
  assert.equal(h.node('paused').classList.contains('show'), false);
  assert.equal(h.document.activeElement, h.node('classicC9'));
  assert.deepEqual(gameplay(h.snapshot()), before);
  assert.equal(h.pending.size, 1);
});

// Detalle pendiente de C9 (rv7 C8, R1): alternar la pausa y la Forja no deja
// estados cruzados ni toca el combate.
test('switching between pause and C9 never stacks screens or changes the flight', t => {
  const h = harness(t); h.api.prepare();
  const before = gameplay(h.snapshot());
  h.node('classicC9').click();
  assert.equal(h.snapshot().state, 'paused'); assert.equal(h.node('flightDock').classList.contains('show'), true);
  h.api.resumeGame();
  assert.equal(h.snapshot().state, 'playing', 'resuming from C9 closes the Forja');
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  assert.equal(h.node('paused').classList.contains('show'), false);
  h.api.pauseGame();
  assert.equal(h.node('paused').classList.contains('show'), true);
  h.node('classicC9').click();
  assert.equal(h.node('flightDock').classList.contains('show'), false, 'C9 cannot open on top of the pause');
  h.api.resumeGame();
  assert.equal(h.snapshot().state, 'playing');
  assert.equal(h.node('paused').classList.contains('show'), false);
  h.node('classicC9').click(); h.api.pauseGame();
  assert.equal(h.node('paused').classList.contains('show'), false, 'pausing is ignored while C9 is open');
  assert.equal(h.node('flightDock').classList.contains('show'), true);
  h.node('flightDockContinue').click();
  assert.equal(h.snapshot().state, 'playing');
  assert.deepEqual(gameplay(h.snapshot()), before);
});

test('the actual onboard purchase commits price, entitlement and receipt once while the route stays paused', t => {
  const h = harness(t); h.api.prepare(); h.api.seedCombatResources(); h.node('classicC9').click();
  const before = h.snapshot();
  const previousLedgerWrites = h.writes.filter(write => write.key === SALVAGE_KEY).length;
  h.node('c9BuyCoolant').click(); const bought = h.snapshot(), raw = h.stored(SALVAGE_KEY);
  const ledger = JSON.parse(raw); assert.ok(normalizeScrapRecord(ledger));
  assert.equal(ledger.balance, 55); assert.equal(ledger.spent, 45);
  assert.deepEqual(ledger.upgrades, ['coolant-feed']);
  assert.deepEqual(ledger.purchases, [{id: 'c9:coolant-feed', sku: 'coolant-feed', price: 45}]);
  assert.equal(h.writes.filter(write => write.key === SALVAGE_KEY).length, previousLedgerWrites + 1,
    'the money/entitlement/receipt share one actual localStorage commit');
  assert.equal(bought.state, 'paused'); assert.deepEqual(bought.route, before.route);
  assert.equal(bought.hull, 61); assert.equal(bought.reserve, 12);
  assert.equal(bought.weapons.charges, before.weapons.charges);
  assert.equal(bought.weapons.recharge, before.weapons.recharge);
  assert.equal(bought.weapons.cooldown, before.weapons.cooldown);
  assert.equal(bought.weapons.rechargeSeconds, 1.5);
  assert.deepEqual(bought.items, before.items);
  h.node('c9BuyCoolant').click(); assert.equal(h.stored(SALVAGE_KEY), raw, 'a repeated disabled purchase cannot charge twice');
  h.node('flightDockContinue').click();
  assert.equal(h.document.activeElement,h.node('classicC9'),'purchase must restore focus to the enabled HUD opener');
  assert.equal(h.node('classicC9').disabled,false);h.node('classicC9').click();
  assert.equal(h.snapshot().state,'paused','the workshop really reopens after a purchase without waiting for a frame');
  assert.equal(h.stored(SALVAGE_KEY), raw); assert.equal(h.snapshot().hull, 61);
  assert.equal(h.snapshot().weapons.charges, before.weapons.charges);
});

test('an interrupted onboard monetary write grants no upgrade and a retry charges one coherent transaction', t => {
  const h = harness(t); h.api.prepare(); h.node('classicC9').click();
  const before = h.snapshot(), raw = h.stored(SALVAGE_KEY);
  h.setSalvageBlocked(true); h.node('c9BuyCoolant').click();
  assert.equal(h.stored(SALVAGE_KEY), raw);
  assert.deepEqual(h.snapshot().salvage, before.salvage);
  assert.equal(h.snapshot().weapons.rechargeSeconds, 2);
  assert.match(h.node('c9PurchaseStatus').textContent, /confirmado|reintent|guardad|pago/i);
  assert.equal(h.snapshot().state, 'paused'); assert.deepEqual(h.snapshot().route, before.route);
  h.setSalvageBlocked(false); h.node('c9BuyCoolant').click();
  const ledger = JSON.parse(h.stored(SALVAGE_KEY));
  assert.equal(ledger.balance, 55); assert.equal(ledger.purchases.length, 1);
  assert.deepEqual(ledger.upgrades, ['coolant-feed']); assert.equal(h.snapshot().weapons.rechargeSeconds, 1.5);
});

test('stage 1.6 resolves emergency service in flight once without a forced orbital station or modal', t => {
  const h = harness(t); h.api.prepare();
  // Deliberately supplied quota and quiet frames test continuity, not earning
  // or survival. No route clock is fast-forwarded or replaced in this fixture.
  h.api.damageHullForFixture(61);
  const maximum = Math.ceil(184 / .034);
  for (let frame = 0; frame < maximum && h.snapshot().route.elapsed < 183.3; frame++) h.api.serviceRouteFrame(.034);
  const serviced = h.snapshot();
  assert.ok(serviced.route.elapsed >= 183.3 && serviced.route.elapsed < 183.4);
  assert.equal(serviced.state, 'playing'); assert.equal(serviced.route.stageNumber, 6);
  assert.equal(serviced.route.waitingFor, null); assert.equal(serviced.route.relay.active, false);
  assert.equal(serviced.hull, 100, 'the existing single emergency repair remains available without an orbital interruption');
  assert.equal(serviced.events.filter(event => event.type === 'service').length, 1);
  assert.equal(serviced.events.filter(event => event.type === 'service-complete').length, 1);
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  h.api.render(183300);
  assert.equal(h.loaded.has('assets/c9_station_v1.webp'), false,
    'retained historic relay art is not loaded into the new onboard route');
  assert.equal(h.drawCalls.includes('assets/c9_station_v1.webp'), false);
  assert.equal(serviced.workshopOpened, false, 'crossing the checkpoint must not imply opening C9');
  assert.deepEqual(serviced.salvage.upgrades, []); assert.equal(serviced.salvage.balance, 100);
  h.api.damageHullForFixture(62); h.api.beginClassicVoyageService();
  for (let frame = 0; frame < 60; frame++) h.api.serviceRouteFrame(1 / 60);
  assert.equal(h.snapshot().hull, 62, 'the resolved checkpoint cannot heal again every frame');
  assert.equal(h.snapshot().events.filter(event => event.type === 'service-complete').length, 1);
  assert.ok(h.snapshot().route.elapsed > serviced.route.elapsed);
  const saved = JSON.parse(h.stored(VOYAGE_KEY));
  assert.ok(saved.checkpoint.eventIds.includes('chronos-voyage:1.6:service-complete'));
  h.node('classicC9').click(); assert.equal(h.snapshot().hull, 62);
  h.node('flightDockContinue').click(); assert.equal(h.snapshot().hull, 62);
  assert.equal(h.pending.size, 1);
});

test('a preserved legacy service-waiting checkpoint resumes in flight and records the same once-only completion', t => {
  const checkpoint = {...createChronosVoyageCheckpoint(6, {collected: 18}), serviceWaiting: true};
  const voyage = {version: 2, checkpoint, unlockedStage: 6, completed: false,
    entry: {hull: 56, reserve: 11, score: 200, maxCombo: 3, collected: 18}};
  const h = harness(t, {voyage}); h.api.prepare(); const q = h.snapshot();
  assert.equal(q.state, 'playing'); assert.equal(q.route.stageNumber, 6);
  assert.equal(q.route.waitingFor, null); assert.equal(q.hull, 100);
  assert.equal(q.reserve, 11); assert.equal(q.collected, 18);
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  assert.equal(q.events.filter(event => event.type === 'service-complete').length, 1);
  const saved = JSON.parse(h.stored(VOYAGE_KEY));
  assert.equal(saved.checkpoint.serviceWaiting, undefined);
  assert.ok(saved.checkpoint.eventIds.includes('chronos-voyage:1.6:service-complete'));
  h.api.damageHullForFixture(70); h.api.beginClassicVoyageService();
  assert.equal(h.snapshot().hull, 70); assert.equal(h.pending.size, 1);
});

test('resuming or retrying a stage restores the saved entry hull but never below the retry floor', t => {
  for (const [entryHull, expected] of [[18, 50], [72, 72]]) {
    const voyage = {version: 2, checkpoint: createChronosVoyageCheckpoint(10, {collected: 32}), unlockedStage: 10,
      completed: false, entry: {hull: entryHull, reserve: 0, score: 300, maxCombo: 2, collected: 32}};
    const h = harness(t, {voyage}); h.api.prepare();
    assert.equal(h.snapshot().route.stageNumber, 10); assert.equal(h.snapshot().hull, expected);
    h.api.damageHullForFixture(5); h.api.prepare();
    assert.equal(h.snapshot().hull, expected, 'a retry after damage starts from the same floor-protected entry');
    assert.equal(JSON.parse(h.stored(VOYAGE_KEY)).entry.hull, entryHull, 'the saved entry hull itself is not rewritten');
    assert.equal(h.pending.size, 1);
  }
});

test('Atlas blocks the onboard workshop instead of permitting combat avoidance by repeatedly opening C9', t => {
  const h = harness(t); h.api.prepare(); h.api.fixtureBoss();
  assert.equal(h.node('classicC9').disabled, true);
  assert.equal(h.api.openClassicDock('hud'), false);
  assert.equal(h.snapshot().state, 'playing'); assert.equal(h.snapshot().workshopOpened, false);
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  assert.equal(h.pending.size, 1);
});

// dec-armas-plan (01/11/2026): la Forja ya no vende armas (Abanico y Aguja
// salieron) ni cambia el arma; sus ramas de casco y refrigeración siguen.
test('Forja keeps hull and cooling ranks, no longer sells weapons and preserves them after interruption', t => {
  const equipment={version:1,recoveredTwin:true,unlocked:['pulse'],selected:'pulse'};
  const h=harness(t,{salvage:fundedRecord(1000),equipment});h.api.prepare();h.node('classicC9').click();
  const sku=id=>h.document.querySelector(`[data-c9-sku="${id}"]`);
  assert.equal(h.node('c9Title').textContent,'FORJA C9');
  for(const retired of ['weapon-scatter','scatter-focus','weapon-needle','needle-resonance'])assert.equal(sku(retired),null,retired);
  assert.deepEqual([...h.document.querySelectorAll('[data-flight-loadout]')].map(button=>button.dataset.flightLoadout),['pulse','twin']);
  assert.equal(h.document.querySelector('[data-flight-loadout="twin"]').disabled,true,'Gemelo still belongs to Atlas');
  h.node('flightInstallTwin').click();
  h.node('c9BuyShield').click();sku('hull-plating-ii').click();
  h.node('c9BuyCoolant').click();sku('coolant-feed-ii').click();
  const q=h.snapshot();assert.equal(q.reserveCapacity,65);assert.equal(q.weapons.rechargeSeconds,1);
  const raw=h.stored(SALVAGE_KEY);sku('coolant-feed-ii').click();assert.equal(h.stored(SALVAGE_KEY),raw);
  const resumed=harness(t,{salvage:JSON.parse(raw),equipment:JSON.parse(h.stored('neonCronium.flightEquipment.v1'))});
  resumed.api.prepare();assert.equal(resumed.snapshot().weapons.selected,'pulse');
  assert.equal(resumed.snapshot().reserveCapacity,65);assert.equal(resumed.snapshot().weapons.rechargeSeconds,1);
  assert.equal(resumed.snapshot().salvage.balance,q.salvage.balance);
});

// dec-arbol-ampliado (02/11/2026): rama MUNICIÓN de cuatro rangos en la Forja.
test('Forja ammo branch: Munición I gives a 40-round magazine now and after a reload; later ranks wait for the one before', t => {
  const equipment={version:1,recoveredTwin:false,unlocked:['pulse'],selected:'pulse'};
  const h=harness(t,{salvage:fundedRecord(250),equipment});h.api.prepare();h.node('classicC9').click();
  const sku=id=>h.document.querySelector(`[data-c9-sku="${id}"]`);
  assert.deepEqual([...sku('ammo-1').closest('.c9-branch').querySelectorAll('[data-c9-sku]')].map(node=>node.dataset.c9Sku),
    ['ammo-1','ammo-2','ammo-3','ammo-4']);
  assert.equal(sku('ammo-2').disabled,true,'Munición II needs Munición I');
  assert.equal(h.snapshot().weapons.maxCharges,20);
  sku('ammo-1').click();
  const bought=h.snapshot();
  assert.equal(bought.weapons.maxCharges,40);assert.equal(bought.weapons.charges,40,'the new rounds arrive loaded');
  assert.equal(bought.salvage.balance,190);assert.equal(sku('ammo-1').dataset.nodeState,'installed');
  assert.equal(sku('ammo-2').disabled,false);
  const resumed=harness(t,{salvage:JSON.parse(h.stored(SALVAGE_KEY)),equipment});
  resumed.api.prepare();assert.equal(resumed.snapshot().weapons.maxCharges,40);
});
