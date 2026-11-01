import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {createScrapRecord, normalizeScrapRecord} from '../src/game/progression/scrap-economy.js';

const repository = new URL('..', import.meta.url);
const [html, core, content, game] = await Promise.all(
  ['index.html', 'core-runtime.js', 'content-runtime.js', 'game.js']
    .map(file => readFile(new URL(file, repository), 'utf8'))
);
const EQUIPMENT_KEY = 'neonCronium.flightEquipment.v1';
const SALVAGE_KEY = 'neonCronium.classicSalvage.v1';
const fundedSalvage = balance => {
  const value = {...createScrapRecord(), balance, earned: balance};
  assert.ok(normalizeScrapRecord(value), 'The explicit C9 monetary fixture must be a valid ledger record');
  return value;
};
const VOYAGE_KEY = 'neonCronium.chronosVoyage.v2';
const DESTRUCTION_PATH = 'assets/chronos_destruction_atlas_v1.webp';
const FLIGHT_KIT_PATH = 'assets/chronos_flight_atlas_v1.webp';
const INTRO_STATION_PATH = 'assets/chronos_intro_station_atlas_v1.webp';
const plain = value => JSON.parse(JSON.stringify(value));
const closeTo = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-7,
  `${message || 'Values differ'}: ${actual} !== ${expected}`);

/**
 * Controlled JSDOM integration fixture. It runs the actual bundled legacy
 * handlers/models, with a mocked Canvas and loaded images. Explicit collection,
 * target insertion and quiet frames isolate contracts; this is not natural
 * gameplay, a visual acceptance test or a physical iPhone certification.
 * prepare() may mark the retained historic opening as skipped without advancing
 * the route clock. The current in-world presentation starts unlocked either
 * way. Boss fixtures use the actual route/model APIs to isolate
 * chapter flow; injected model damage is never presented as a playable victory.
 */
function harness(t, {campaign = '', saved, backups, pointerEvents = true, failBackup = false,
  destructionAsset = 'loaded', introAsset = 'loaded', rects = {}, unlocked = 2, savedVoyage, randomSeed, savedSalvage, failSalvageWrite = false} = {}) {
  const dom = new JSDOM(html, {url: `https://neon.test/${campaign ? '?campaign=' + campaign : ''}`,
    runScripts: 'outside-only', pretendToBeVisual: true});
  const {window} = dom; t.after(() => window.close());
  if (randomSeed !== undefined) {
    // A fixture-owned generator makes the exact ambient-hazard failure
    // reproducible without changing global Node randomness or the game code.
    let randomState = randomSeed >>> 0;
    window.Math.random = () => {
      randomState = (randomState + 0x6d2b79f5) | 0;
      let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gradient = {addColorStop() {}};
  const drawCalls = [];
  const context = new Proxy({}, {get(target, key) {
    if (key in target) return target[key];
    if (key === 'drawImage') return (image, ...args) => drawCalls.push({path: image?._assetPath || image?.path || null, args});
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
    if (key === 'measureText') return () => ({width: 30});
    return () => {};
  }, set(target, key, value) { target[key] = value; return true; }});
  window.HTMLCanvasElement.prototype.getContext = () => context;
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  // JSDOM has no layout engine. These optional measured-rectangle fixtures
  // exercise the real UI-to-Canvas boundary adapter, not CSS appearance.
  const layoutRects = new Map(Object.entries(rects));
  const rectReadCounts = new Map();
  const rectangle = ({left = 0, top = 0, width = 0, height = 0} = {}) => ({
    x: left, y: top, left, top, width, height, right: left + width, bottom: top + height});
  const originalRect = window.Element.prototype.getBoundingClientRect;
  window.Element.prototype.getBoundingClientRect = function() {
    rectReadCounts.set(this.id, (rectReadCounts.get(this.id) || 0) + 1);
    if (this.closest('.hidden')) return rectangle();
    if (!layoutRects.has(this.id)) return originalRect.call(this);
    const fixture = layoutRects.get(this.id);
    return rectangle(typeof fixture === 'function' ? fixture(this) : fixture);
  };
  window.HTMLCanvasElement.prototype.getBoundingClientRect = function() {
    return rectangle(layoutRects.get(this.id) || {width: 390, height: 844});
  };
  window.HTMLCanvasElement.prototype.setPointerCapture = () => {};
  window.HTMLCanvasElement.prototype.releasePointerCapture = () => {};
  const images = new Map();
  function configureDestructionImage(image, status) {
    image.complete = status !== 'unresolved';
    image.naturalWidth = status === 'loaded' ? 1536 : 0;
    image.naturalHeight = status === 'loaded' ? 1024 : 0;
    if (status === 'error') image.onerror?.(new window.Event('error'));
  }
  window.Image = class {
    constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1536; }
    get src() { return this.path || ''; }
    set src(value) {
      this.path = value; images.set(value, this);
      if (value === DESTRUCTION_PATH) configureDestructionImage(this, destructionAsset);
      if (value === FLIGHT_KIT_PATH) { this.naturalWidth = 1536; this.naturalHeight = 1024; }
      if (value === INTRO_STATION_PATH) {
        // The owner's piece-by-piece intro replaces the six-pose station when it
        // loads; 'missing' exercises the preserved fallback scene.
        this.naturalWidth = introAsset === 'loaded' ? 1920 : 0; this.naturalHeight = introAsset === 'loaded' ? 1280 : 0;
        // 'missing' = la descarga falló: solo entonces vuelve la escena antigua.
        if (introAsset === 'missing') this._loadError = true;
      }
    }
  };
  const pending = new Map(); let id = 0;
  window.requestAnimationFrame = callback => (pending.set(++id, callback), id);
  window.cancelAnimationFrame = frame => pending.delete(frame);
  window.navigator.vibrate = () => true;
  if (pointerEvents) {
    window.PointerEvent = class extends window.MouseEvent {
      constructor(type, options = {}) {
        super(type, options);
        for (const [key, value] of Object.entries({pointerId: options.pointerId ?? 1,
          pointerType: options.pointerType || 'touch', isPrimary: options.isPrimary ?? true})) {
          Object.defineProperty(this, key, {value});
        }
      }
    };
  } else window.PointerEvent = undefined;
  window.localStorage.setItem('neon-unlocked-v2', String(unlocked));
  window.localStorage.setItem('neon-stars-v2', '{}');
  window.localStorage.setItem('neon-n7-unlocked-v1', '37');
  window.localStorage.setItem('neon-n7-best-v1', '2037');
  if (saved !== undefined) window.localStorage.setItem(EQUIPMENT_KEY, saved);
  if (savedSalvage !== undefined) window.localStorage.setItem(SALVAGE_KEY,
    typeof savedSalvage === 'string' ? savedSalvage : JSON.stringify(savedSalvage));
  if (savedVoyage !== undefined) window.localStorage.setItem(VOYAGE_KEY,
    typeof savedVoyage === 'string' ? savedVoyage : JSON.stringify(savedVoyage));
  if (backups !== undefined) window.localStorage.setItem(EQUIPMENT_KEY + ':invalid-backups', JSON.stringify(backups));
  if (failBackup || failSalvageWrite) {
    const set = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function(key, value) {
      if (failSalvageWrite && key === SALVAGE_KEY) throw new Error('Fixture: salvage persistence interrupted');
      if (failBackup && key === EQUIPMENT_KEY + ':invalid-backups') throw new Error('Fixture: backup quota exhausted');
      return set.call(this, key, value);
    };
  }
  window.eval(core); window.eval(content);
  const marker = '  legacyFrameId = requestAnimationFrame(frame);\n})();';
  assert.equal(game.split(marker).length, 2, 'Expected one legacy bootstrap marker');
  const hook = `
    const flightEventsForTest=[];
    const originalFlightEventForTest=classicFlightEvent;
    classicFlightEvent=function(event){flightEventsForTest.push({...event});return originalFlightEventForTest(event);};
    const explosionCallsForTest=[];
    const originalAddExplosionForTest=addExplosion;
    addExplosion=function(...args){explosionCallsForTest.push([...args]);return originalAddExplosionForTest(...args);};
    window.__UNIFIED_FLIGHT_TEST__={
      update,render,background,startLevel,prepareLevel,pauseGame,resumeGame,goHome,completeLevel,fireManualShot,
      finishGame,resumeReward,
      setSensitivity(value){settings.sensitivity=value;},
      refreshClassicFlightBounds,showStoryTransmission,hideStoryTransmission,syncClassicFlightHud,
      skipIntro(){classicChapterStory?.skipIntro();classicChapterView=classicChapterStory?.snapshot()||null;syncClassicChapterPresentation();},
      prepare(index=0,{skipOpening=true}={}){startLevel(index);warpTimer=0;spawnTimer=999;classicScoutTimer=999;classicPatrolTimer=999;items=[];gates=[];
        if(skipOpening){classicChapterStory?.skipIntro();classicChapterView=classicChapterStory?.snapshot()||null;syncClassicChapterPresentation();}},
      startBossFixture(){
        // Atlas only exists at the end of S1-V5: start that map voyage at its
        // last stage and let its real route reach the arrival.
        classicSideVoyagePending=NeonCampaign.getVoyageFicha(NeonCampaign.VOYAGES.find(item=>item.id==='S1-V5').routeId);
        startLevel(0);warpTimer=0;
        collected=level().goal;
        const route=classicSideVoyage.route;
        classicFlight=route.create({goal:level().goal,checkpoint:route.createCheckpoint(route.stageCount,{goal:level().goal,collected})});
        for(let frame=0;frame<60*40&&!classicFlight.snapshot().canFinish;frame++)classicFlight.advance(1/60,collected,classicFlightEvent);
        classicFlightView=classicFlight.snapshot();
        items=[];gates=[];beginAtlasEncounter();
      },
      damageForFixture(amount){damageShip(amount,player.x,player.y);},
      patrolFrame(dt=1/60){
        // Isolate actual patrol scheduling from unrelated random meteors and
        // debris formations. Enemy timers, HP, collision, shots and animation
        // remain real; this fixture is not a natural full-session playtest.
        spawnTimer=999;gateCountdown=999;gates=[];
        update(dt);
      },
      frame(dt=1/60,quiet=false){
        spawnTimer=999;classicScoutTimer=999;classicPatrolTimer=999;
        if(quiet){items=[];gates=[];}
        update(dt);
      },
      collectEnergy(){energySpawned++;collectItem({type:'energy',x:player.x,y:player.y-30,r:22});},
      collectModule(){collectItem({type:'flightModule',x:player.x,y:player.y-40,r:29});},
      collectPower(type){collectItem({type,x:player.x,y:player.y-40,r:22});},
      seedModule(){items=[{type:'flightModule',x:player.x,y:player.y-65,r:29,s:0,rot:0,rs:0,p:0,phase:0,amp:0,alpha:1}];},
      seedTarget(){
        items=[{id:'fixture-target',type:'meteor',x:player.x,baseX:player.x,y:player.y-350,
          r:28,s:0,rot:0,rs:0,p:0,phase:0,amp:0,alpha:1,special:'',spriteKey:'meteorMedium',hp:2,maxHp:2,damage:20}];
      },
      seedTransitFixture(){items=[{id:'boundary-live-debris',type:'debris',x:W*.2,baseX:W*.2,y:H*.35,
        r:26,s:0,rot:0,rs:0,p:0,phase:0,amp:0,alpha:1,special:'',spriteKey:'debrisMetal',hp:2,maxHp:2,damage:16}];},
      snapshot:()=>({state,elapsed,score,hudScoreTarget,displayedScore,hull,ammo,collected,currentLevel,W,H,unlocked:getUnlocked(),
        chapter:classicChapterView?JSON.parse(JSON.stringify(classicChapterView)):null,reserve:classicHullReserve,reserveCapacity:classicHullReserveCapacity,
        player:{...player},bounds:classicFlightBounds?{...classicFlightBounds}:null,input:{...classicFlightInput},
        weapons:classicWeapons?NeonCampaign.classicWeaponSnapshot(classicWeapons):null,
        route:classicFlight?.snapshot()||null,equipment:{...classicEquipment,unlocked:[...classicEquipment.unlocked]},
        destructionPose:classicFlightView?NeonCampaign.getChronosDestructionPose(classicFlightView):null,
        destructionAsset:{ready:spriteReady(SPRITES.chronosDestruction),failed:SPRITES.chronosDestruction._loadError},
        explosionCalls:explosionCallsForTest.map(args=>[...args]),
        equipmentWritable:classicEquipmentWritable,events:flightEventsForTest.map(event=>({...event})),
        targets:items.map(item=>({id:item.id,type:item.type,x:item.x,y:item.y,hp:item.hp,
          role:item.classicScout?.role,tactics:item.classicScout?.tacticsVersion,enemyState:item.classicScout?.state,
          telegraph:item.classicScout?.telegraph,fired:item.classicScout?.fired,projectile:Boolean(item.classicScoutProjectile),
          vx:item.vx,vy:item.vy,frame:item.classicScout?.animator.getFrame()})),
        projectiles:items.filter(item=>item.guardianProjectile).map(item=>({id:item.projectileId,
          x:item.x,y:item.y,vx:item.vx,vy:item.vy,targetX:item.targetX,targetY:item.targetY})),
        boss:atlasBoss?JSON.parse(JSON.stringify(atlasBoss)):null})
    };\n`;
  window.eval(game.replace(marker, hook + marker));
  const api = window.__UNIFIED_FLIGHT_TEST__, canvas = window.document.getElementById('canvas');
  const snapshot = () => plain(api.snapshot());
  function advance(seconds, quiet = true) {
    let remaining = seconds;
    while (remaining > 1e-9) {
      const dt = Math.min(1 / 60, remaining); api.frame(dt, quiet); remaining -= dt;
    }
    return snapshot();
  }
  function recoverStageQuota() {
    const quota = snapshot().route.stageGoal;
    while (snapshot().collected < quota) api.collectEnergy();
  }
  function advanceStage({recover = true, service = false} = {}) {
    const before = snapshot();
    if (recover) recoverStageQuota();
    const remaining = before.route.stageDuration - before.route.stageElapsed;
    advance(remaining + .04);
    if (snapshot().route.waitingFor === 'service' && service) {
      window.document.getElementById('flightDockContinue').click();
      const departing=snapshot();
      if(departing.route.stageNumber===6)advance(departing.route.stageDuration-departing.route.stageElapsed+.04);
    }
    return snapshot();
  }
  function reachStage(number) {
    for (let boundary = 0; snapshot().route.stageNumber < number && boundary < 10; boundary++) {
      const previous = snapshot().route.stageNumber;
      advanceStage({service: true});
      assert.ok(snapshot().route.stageNumber > previous, 'A satisfied stage boundary must advance');
    }
    assert.equal(snapshot().route.stageNumber, number);
    return snapshot();
  }
  function pointer(type, pointerId, clientX, clientY) {
    canvas.dispatchEvent(new window.PointerEvent(type, {pointerId, clientX, clientY,
      pointerType: 'touch', buttons: /up|cancel/.test(type) ? 0 : 1,
      bubbles: true, cancelable: true}));
  }
  function touches(type, all, changed = all) {
    const event = new window.Event(type, {bubbles: true, cancelable: true});
    Object.defineProperties(event, {touches: {value: all}, changedTouches: {value: changed}});
    canvas.dispatchEvent(event);
  }
  return {window, api, snapshot, advance, advanceStage, reachStage, recoverStageQuota, pointer, touches, pending, drawCalls,
    setRect: (id, rect) => layoutRects.set(id, rect),
    rectReads: id => rectReadCounts.get(id) || 0,
    clearDrawCalls: () => { drawCalls.length = 0; },
    setDestructionStatus: status => {
      const image = images.get(DESTRUCTION_PATH);
      assert.ok(image, 'The actual level loader must request the destruction atlas');
      configureDestructionImage(image, status);
    },
    node: id => window.document.getElementById(id),
    stored: key => window.localStorage.getItem(key),
    equipment: () => JSON.parse(window.localStorage.getItem(EQUIPMENT_KEY)),
    voyage: () => JSON.parse(window.localStorage.getItem(VOYAGE_KEY))};
}

test('the in-world Chronos opening plays as a film without HUD or ship, then hands control over while pause freezes story and route',t=>{
  const h=harness(t);h.api.prepare(0,{skipOpening:false});
  assert.equal(h.snapshot().chapter.opening.controlsLocked,true,'The opening is an animation: no pilot control yet');
  assert.equal(h.snapshot().chapter.opening.backgroundAlpha,0,'No painted plate over the live scene');
  assert.equal(h.api.fireManualShot(),false,'No shots during the film');
  h.advance(.1);
  assert.equal(h.node('canvas').ownerDocument.body.classList.contains('chapter-opening'),true,'The HUD hides while the film plays');
  h.advance(8.85);assert.equal(h.snapshot().chapter.opening.controlsLocked,true);
  h.api.pauseGame();const paused=h.snapshot();h.advance(5);
  assert.deepEqual(h.snapshot().chapter,paused.chapter);assert.deepEqual(h.snapshot().route,paused.route);
  assert.deepEqual(h.snapshot().weapons,paused.weapons);assert.equal(h.api.fireManualShot(),false);
  h.api.resumeGame();h.advance(.1);
  assert.equal(h.snapshot().destructionPose.state,'impact','The original one rupture still occurs at nine route seconds');
  h.advance(5);assert.equal(h.snapshot().chapter.opening.controlsLocked,false,'Control returns once Cronos Prime has left');
  assert.equal(h.node('canvas').ownerDocument.body.classList.contains('chapter-opening'),false);
  const before=h.snapshot().player;
  h.pointer('pointerdown',91,200,500);h.pointer('pointermove',91,240,460);
  assert.equal(h.snapshot().input.active,true);assert.ok(h.snapshot().player.target>before.target);
  h.pointer('pointerup',91,240,460);
  h.clearDrawCalls();h.api.render();
  assert.equal(h.drawCalls.some(call=>call.path==='assets/chapter1_intro_atlas_v1.webp'),false,
    'The live opening keeps the original Chronos layers instead of another cinematic plate');
  assert.equal(h.api.fireManualShot(),true);
  assert.equal(h.pending.size,1);
});

test('the classic thirty-point reinforcement absorbs damage, remains without a timer and refills only through its pickup',t=>{
  const h=harness(t);h.api.prepare(2);
  assert.equal(h.snapshot().reserve,30);assert.equal(h.snapshot().reserveCapacity,30);
  h.api.damageForFixture(20);assert.equal(h.snapshot().reserve,10);assert.equal(h.snapshot().hull,100);
  h.advance(12);assert.equal(h.snapshot().reserve,10);assert.equal(h.snapshot().hull,100);
  h.api.collectPower('shield');assert.equal(h.snapshot().reserve,30);
  assert.equal(h.node('powerShield').classList.contains('active'),false,'reinforcement is not a timed chip');
  h.advance(9);assert.equal(h.snapshot().reserve,30);
  h.api.damageForFixture(40);assert.equal(h.snapshot().reserve,0);assert.equal(h.snapshot().hull,90);
  assert.equal(h.pending.size,1);
});

test('twenty classic rounds recharge from played time and freeze completely while paused without a HUD counter', t => {
  const h = harness(t); h.api.prepare();
  assert.equal(h.snapshot().weapons.charges, 20);
  assert.equal(h.snapshot().weapons.rechargeSeconds, 2);
  let shots = 0;
  while (h.snapshot().weapons.charges > 0 && shots < 40) {
    assert.equal(h.api.fireManualShot(), true);
    shots++;
    if (h.snapshot().weapons.charges > 0) h.advance(.25);
  }
  assert.equal(shots, 22, 'Twenty stored rounds plus two recovered during the actual burst');
  assert.equal(h.snapshot().weapons.charges, 0); assert.equal(h.api.fireManualShot(), false);
  assert.equal(h.node('ammo').textContent, '');
  assert.equal(h.node('ammo').getAttribute('aria-hidden'), 'true');
  assert.doesNotMatch(h.node('fire').getAttribute('aria-label'), /\d|cuenta|segundos|cargas/i);
  h.api.pauseGame(); const before = h.snapshot();
  h.advance(10);
  const paused = h.snapshot();
  assert.equal(paused.state, 'paused'); assert.deepEqual(paused.weapons, before.weapons);
  assert.deepEqual(paused.route, before.route);
  h.api.resumeGame();
  const remaining = before.weapons.rechargeSeconds - before.weapons.recharge;
  h.advance(remaining - .03); assert.equal(h.snapshot().weapons.charges, 0);
  h.advance(.04); assert.equal(h.snapshot().weapons.charges, 1);
  assert.equal(h.api.fireManualShot(), true, 'One recovered round becomes usable without a purchase or restart');
  assert.equal(h.node('ammo').textContent, '');
  assert.equal(h.pending.size, 1);
});

test('the opt-in general auto-fire uses the twenty-round magazine, survives a CRONIUM wait and freezes during pause and C9', t => {
  const h=harness(t,{unlocked:1});h.api.prepare();
  const checkbox=h.node('autoFire');assert.ok(checkbox);assert.equal(checkbox.checked,false);
  h.advance(.5);
  assert.equal(h.snapshot().weapons.shotSequence,0,'A fresh route has no implicit automatic shots');
  assert.equal(h.snapshot().weapons.charges,20);
  checkbox.click();assert.equal(checkbox.checked,true);
  assert.equal(JSON.parse(h.stored('neon-settings-v5')).autoFire,true);
  for (let frame=0; frame<60*10 && h.snapshot().weapons.charges>0; frame++) h.advance(1/60);
  const depleted=h.snapshot();
  assert.ok(depleted.weapons.shotSequence>=20);assert.equal(depleted.weapons.charges,0);
  const emitted=depleted.weapons.shotSequence;
  h.api.pauseGame();h.advance(12);
  assert.deepEqual(h.snapshot().weapons,depleted.weapons);
  assert.deepEqual(h.snapshot().route,depleted.route);
  assert.equal(h.pending.size,1);
  h.api.resumeGame();
  h.advance(depleted.weapons.rechargeSeconds-depleted.weapons.recharge-.03);
  assert.equal(h.snapshot().weapons.shotSequence,emitted);
  assert.equal(h.snapshot().weapons.charges,0);
  h.advance(.04);
  assert.equal(h.snapshot().weapons.shotSequence,emitted+1,
    'One played-time recovery supplies exactly one further automatic round');
  assert.equal(h.snapshot().weapons.charges,0,'Auto-fire spends the recovered round without inventing ammunition');
  h.advance(h.snapshot().route.stageDuration-h.snapshot().route.stageElapsed+.05);
  const waiting=h.snapshot();
  assert.equal(waiting.route.waitingFor,'cronium');assert.equal(waiting.state,'playing');
  h.advance(2.05);const stillRecovering=h.snapshot();
  assert.equal(stillRecovering.route.waitingFor,'cronium');
  assert.ok(stillRecovering.weapons.shotSequence>waiting.weapons.shotSequence,
    'A missing recovery quota must not silently suspend the enabled weapon');
  h.reachStage(6);h.recoverStageQuota();h.advance(1.3);
  assert.equal(h.snapshot().state,'playing');assert.equal(h.snapshot().route.waitingFor,null);
  assert.equal(h.node('flightDock').classList.contains('show'),false,'A route milestone no longer forces the workshop');
  h.node('classicC9').click();
  const docked=h.snapshot();
  assert.equal(docked.state,'paused');assert.equal(docked.route.waitingFor,null);
  assert.equal(checkbox.checked,true,'Servicing does not overwrite the explicit accessibility preference');
  h.advance(8);
  assert.deepEqual(h.snapshot().weapons,docked.weapons);
  assert.deepEqual(h.snapshot().route,docked.route);
  assert.equal(h.node('ammo').textContent,'');
  h.node('flightDockContinue').click();assert.equal(h.snapshot().state,'playing');
  assert.equal(h.node('flightDock').classList.contains('show'),false);
  h.advance(2.05);assert.ok(h.snapshot().weapons.shotSequence>docked.weapons.shotSequence,
    'Closing the voluntary workshop resumes the already enabled automatic weapon');
  assert.equal(h.pending.size,1,'The accessibility preference never creates another update owner');
});

test('a classic projectile travels before impact and applies damage and destruction reward only once', t => {
  const h = harness(t); h.api.prepare();
  h.api.frame(1 / 60, true); // Enter the real first-stage lifecycle before inserting a combat fixture.
  h.api.seedTarget();
  assert.equal(h.api.fireManualShot(), true);
  const fired = h.snapshot();
  assert.equal(fired.targets[0].hp, 2, 'A trigger must not instantly damage a distant target');
  h.advance(.10, false); const travelling = h.snapshot();
  assert.equal(travelling.targets[0].hp, 2);
  assert.ok(travelling.weapons.projectiles[0].y < fired.weapons.projectiles[0].y - 80);
  h.advance(.30, false); const hit = h.snapshot();
  assert.equal(hit.targets[0].hp, 1); assert.equal(hit.score, 3);
  assert.equal(hit.hudScoreTarget, 3, 'A genuine nonlethal impact must update the animated HUD target');
  assert.ok(hit.displayedScore >= 0 && hit.displayedScore <= 3);
  assert.equal(hit.collected, 0, 'No collected orb may incidentally refresh the score HUD');
  assert.equal(hit.weapons.projectiles.length, 0);
  h.advance(.8, false);
  assert.equal(h.snapshot().targets[0].hp, 1); assert.equal(h.snapshot().score, 3);
  assert.equal(h.node('score').textContent, '3', 'The real HUD animation must settle after the first hit');
  assert.equal(h.api.fireManualShot(), true); h.advance(.5, false);
  assert.equal(h.snapshot().targets.length, 0); assert.equal(h.snapshot().score, 13);
  assert.equal(h.snapshot().hudScoreTarget, 13, 'The lethal hit must publish its reward to the HUD once');
  h.advance(1, false); assert.equal(h.snapshot().score, 13);
  assert.equal(h.node('score').textContent, '13');
  assert.equal(h.snapshot().collected, 0);
  assert.equal(h.pending.size, 1);
});

test('the actual PointerEvent handlers anchor without jumping and move both axes without a second finger stealing control', t => {
  const h = harness(t); h.api.prepare(); h.api.setSensitivity(100); const initial = h.snapshot(); // movimiento 1:1, sin depender del valor por defecto
  h.pointer('pointerdown', 11, 290, 550);
  assert.equal(h.snapshot().player.target, initial.player.target);
  assert.equal(h.snapshot().player.targetY, initial.player.targetY);
  h.pointer('pointerdown', 12, 80, 300); h.pointer('pointermove', 12, 120, 260);
  assert.equal(h.snapshot().input.id, 11);
  assert.equal(h.snapshot().player.target, initial.player.target);
  assert.equal(h.snapshot().player.targetY, initial.player.targetY);
  h.pointer('pointerup', 12, 120, 260); assert.equal(h.snapshot().input.active, true);
  h.pointer('pointermove', 11, 320, 510); const moved = h.snapshot();
  closeTo(moved.player.target, initial.player.target + 30 * initial.W / 390, 'Relative X');
  closeTo(moved.player.targetY, initial.player.targetY - 40 * initial.H / 844, 'Relative Y');
  h.advance(.2); const actual = h.snapshot();
  assert.ok(actual.player.x > initial.player.x); assert.ok(actual.player.y < initial.player.y);
  h.api.pauseGame(); assert.equal(h.snapshot().input.active, false);
  h.api.resumeGame(); const resumed = h.snapshot();
  h.pointer('pointermove', 11, 350, 480);
  assert.equal(h.snapshot().player.target, resumed.player.target);
  assert.equal(h.snapshot().player.targetY, resumed.player.targetY);
  h.pointer('pointerdown', 13, 100, 700);
  assert.equal(h.snapshot().player.target, resumed.player.target);
  assert.equal(h.snapshot().player.targetY, resumed.player.targetY);
  h.pointer('pointercancel', 13, 100, 700); assert.equal(h.snapshot().input.active, false);
  assert.equal(h.pending.size, 1);
});

test('the Safari touch fallback tracks the first finger and ignores a secondary finger ending', t => {
  const h = harness(t, {pointerEvents: false}); h.api.prepare(); h.api.setSensitivity(100); const initial = h.snapshot(); // movimiento 1:1, sin depender del valor por defecto
  const first = {identifier: 21, clientX: 250, clientY: 620};
  const second = {identifier: 22, clientX: 80, clientY: 300};
  h.touches('touchstart', [first], [first]);
  h.touches('touchstart', [first, second], [second]);
  h.touches('touchmove', [first, {...second, clientX: 160}], [{...second, clientX: 160}]);
  assert.equal(h.snapshot().player.target, initial.player.target);
  assert.equal(h.snapshot().player.targetY, initial.player.targetY);
  h.touches('touchend', [first], [second]); assert.equal(h.snapshot().input.id, 21);
  const moved = {...first, clientX: 270, clientY: 590};
  h.touches('touchmove', [moved], [moved]);
  closeTo(h.snapshot().player.target, initial.player.target + 20 * initial.W / 390);
  closeTo(h.snapshot().player.targetY, initial.player.targetY - 30 * initial.H / 844);
  h.touches('touchcancel', [], [moved]); assert.equal(h.snapshot().input.active, false);
});

test('the first mission crosses ten stages with optional onboard C9 and requires CRONIUM and the real arrival, without Atlas, before Gaia unlocks', t => {
  const h = harness(t, {unlocked: 1}); h.api.prepare();
  for (let fragment = 0; fragment < 36; fragment++) h.api.collectEnergy();
  let q = h.snapshot();
  assert.equal(q.collected, 36); assert.equal(q.state, 'playing');
  assert.equal(q.route.canFinish, false); assert.equal(q.route.routeProgress, 0);
  assert.equal(q.route.stageNumber, 1); assert.equal(q.route.minDuration, 360);
  assert.deepEqual(JSON.parse(h.stored('neon-stars-v2')), {});
  h.api.completeLevel(); assert.equal(h.snapshot().state, 'playing');
  for (let number = 1; number <= 10; number++) {
    q = h.snapshot(); assert.equal(q.route.stageNumber, number);
    if(number===6) {
      h.advance(1.25);const flying=h.snapshot();
      assert.equal(flying.state,'playing');assert.equal(flying.route.waitingFor,null);
      assert.equal(h.node('flightDock').classList.contains('show'),false);
      h.node('classicC9').click();const docked=h.snapshot();
      assert.equal(docked.state,'paused');assert.equal(docked.route.waitingFor,null);
      assert.ok(h.node('flightDock').classList.contains('show'),'The player can choose C9 from its persistent HUD control');
      assert.equal(docked.route.canFinish,false);assert.equal(docked.unlocked,1);
      h.advance(4);assert.deepEqual(h.snapshot().route,docked.route);
      h.node('flightDockContinue').click();q=h.snapshot();
      assert.equal(q.state,'playing');assert.equal(q.route.stageNumber,6,
        'Closing onboard C9 resumes the exact flight segment instead of skipping to 1.7');
      assert.deepEqual(q.route,flying.route);
      assert.equal(q.route.waitingFor,null);
    }
    h.advance(q.route.stageDuration - q.route.stageElapsed - .05);
    q = h.snapshot();
    assert.equal(q.state, 'playing'); assert.equal(q.route.canFinish, false);
    assert.equal(q.unlocked, 1, 'No intermediate stage may unlock the next classic territory');
    assert.deepEqual(JSON.parse(h.stored('neon-stars-v2')), {});
    h.api.completeLevel(); assert.equal(h.snapshot().state, 'playing');
    if (number === 10) assert.ok(q.route.routeProgress > .9 && q.route.routeProgress < 1);
    h.advance(.06); q = h.snapshot();
    if (number < 10) {
      assert.equal(q.state, 'playing'); assert.equal(q.route.stageNumber, number + 1);
      assert.equal(q.route.canFinish, false);
    }
  }
  q = h.snapshot();
  // Atlas only warns from afar: the real arrival itself completes S1-V1.
  assert.equal(q.boss,null,'S1-V1 no longer starts Atlas; it is fought in S1-V5');
  assert.equal(q.state, 'complete'); assert.equal(q.route.canFinish, true);
  assert.equal(q.chapter.aftermathReady,false,'No Atlas epilogue plays in S1-V1');
  assert.equal(h.node('completeTitle').textContent,'Has escapado de Chronos');
  assert.deepEqual(q.equipment.unlocked,['pulse'],'Gemelo is authorized in S1-V5');
  assert.equal(q.route.routeProgress, 1); assert.ok(JSON.parse(h.stored('neon-stars-v2'))['1'] >= 1);
  assert.equal(q.unlocked, 2); assert.equal(h.voyage().completed, true);
  assert.equal(q.events.filter(event => event.type === 'stage-start').length, 10);
  assert.equal(q.events.filter(event => event.type === 'stage-complete').length, 10);
  assert.equal(q.events.filter(event => event.type === 'arrival').length, 1);
  assert.equal(h.pending.size, 1);
});

test('the Chronos attack and reactor rupture occur once in route order and cannot advance during pause', t => {
  const h = harness(t); h.api.prepare();
  h.advance(3); const attacked = h.snapshot();
  assert.equal(attacked.events.filter(event => event.type === 'attack').length, 1);
  assert.equal(attacked.events.some(event => event.type === 'rupture'), false);
  h.api.pauseGame(); h.advance(12); const paused = h.snapshot();
  assert.deepEqual(paused.route, attacked.route); assert.deepEqual(paused.events, attacked.events);
  h.api.resumeGame(); h.advance(9); const resumed = h.snapshot();
  assert.equal(resumed.events.filter(event => event.type === 'attack').length, 1);
  assert.equal(resumed.events.filter(event => event.type === 'rupture').length, 1);
  const attack = resumed.events.findIndex(event => event.type === 'attack');
  const rupture = resumed.events.findIndex(event => event.type === 'rupture');
  assert.ok(attack < rupture);
  h.advance(3); assert.equal(h.snapshot().events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(h.pending.size, 1);
});

test('without the new intro art, the real Chronos renderer selects all six illustrated source cells and preserves the destroyed station', t => {
  const h = harness(t, {introAsset: 'missing'}); h.api.prepare();
  let previousTime = 0;
  for (const [time, frame] of [[0, 0], [9.1, 1], [9.6, 2], [10.5, 3], [11.6, 4], [13.6, 5], [23.6, 5]]) {
    h.advance(time - previousTime); previousTime = time;
    const snapshot = h.snapshot();
    assert.equal(snapshot.destructionPose.frame, frame, `Simulated time ${time}`);
    h.clearDrawCalls(); h.api.background(999_999);
    const stationCalls = h.drawCalls.filter(call => call.path === DESTRUCTION_PATH);
    assert.equal(stationCalls.length, 1, `One authored station layer at time ${time}`);
    assert.deepEqual(stationCalls[0].args.slice(0, 4),
      [(frame % 3) * 512, Math.floor(frame / 3) * 512, 512, 512]);
    assert.ok(stationCalls[0].args.slice(4).every(Number.isFinite));
    assert.equal(snapshot.explosionCalls.length, 0,
      'The temporal rupture must not create a generic combat explosion over the reactor');
  }
  assert.equal(h.snapshot().events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(h.snapshot().destructionPose.waveVisible, false);
  assert.equal(h.pending.size, 1);
});

test('while the new intro art is still downloading the old station never flashes on screen', t => {
  const h = harness(t, {introAsset: 'pending'}); h.api.prepare();
  for (const seconds of [0, 1, 3]) {
    if (seconds) h.advance(seconds);
    h.clearDrawCalls(); h.api.background(seconds * 1000 + 1);
    assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false, `no old station at ${seconds} s`);
  }
});

test('with the owner pieces loaded, the real renderer turns the station, breaks its tower at nine seconds and drops the six-pose layer', t => {
  const h = harness(t); h.api.prepare();
  const towerCells = () => h.drawCalls.filter(call => call.path === INTRO_STATION_PATH && call.args[1] === 640)
    .map(call => call.args[0] / 640);
  h.clearDrawCalls(); h.api.background(0);
  assert.ok(h.drawCalls.some(call => call.path === INTRO_STATION_PATH), 'the piece-by-piece station is drawn');
  assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false);
  assert.deepEqual(towerCells().filter(cell => cell === 0 || cell === 1), [0], 'intact tower before the rupture');
  h.advance(9.03);
  h.clearDrawCalls(); h.api.background(1e9);
  assert.ok(h.drawCalls.some(call => call.path === 'assets/chronos_station_burst_atlas_v1.webp'), 'the station itself bursts at the impact');
  assert.equal(towerCells().filter(cell => cell < 2).length, 0, 'no whole tower over the burst');
  assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false);
  // Tras la explosión azul la estación entera no vuelve a dibujarse.
  h.advance(.5);
  h.clearDrawCalls(); h.api.background(2e9);
  assert.ok(h.drawCalls.some(call => call.path === 'assets/chronos_station_burst_atlas_v1.webp'), 'the owner blue explosion');
  assert.ok(h.drawCalls.some(call => call.path === 'assets/cronos_prime_video_atlas_v1.webp'), 'animated Cronos Prime');
  assert.ok(h.drawCalls.some(call => call.path === 'assets/chronos_intro_fragments_atlas_v1.webp'), 'fragments fly');
  const wholeCells = h.drawCalls.filter(call => call.path === INTRO_STATION_PATH && call.args[1] === 0).length;
  assert.equal(wholeCells, 0, 'ring and wheel are gone');
  h.advance(20);
  h.clearDrawCalls(); h.api.background(3e9);
  assert.equal(h.drawCalls.filter(call => call.path === INTRO_STATION_PATH && call.args[1] === 0).length, 0, 'not even later');
  assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false);
  assert.equal(h.snapshot().events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(h.pending.size, 1);
});

test('pause and repeated real background renders freeze the Chronos pose, clock and event stream', t => {
  const h = harness(t); h.api.prepare(); h.advance(11);
  h.api.pauseGame(); const before = h.snapshot();
  assert.equal(before.destructionPose.frame, 3);
  assert.equal(before.destructionPose.waveVisible, true);
  h.clearDrawCalls(); h.api.background(0);
  const pausedDrawing = plain(h.drawCalls);
  for (const timestamp of [1, 1000, 1e9, 0]) {
    h.advance(2);
    h.clearDrawCalls(); h.api.background(timestamp);
    assert.deepEqual(plain(h.drawCalls), pausedDrawing,
      'Rendering a different wall-clock timestamp must not advance the authored scene');
    const repeated = h.snapshot();
    assert.equal(repeated.elapsed, before.elapsed);
    assert.deepEqual(repeated.route, before.route);
    assert.deepEqual(repeated.destructionPose, before.destructionPose);
    assert.deepEqual(repeated.events, before.events);
    assert.equal(h.pending.size, 1);
  }
  h.api.resumeGame(); h.advance(1);
  assert.ok(h.snapshot().route.elapsed > before.route.elapsed);
  assert.equal(h.snapshot().destructionPose.frame, 4);
  assert.equal(h.snapshot().events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(h.pending.size, 1);
});

test('a pending destruction atlas holds the flight clock and an actual load error enables the preserved station fallback', t => {
  const h = harness(t, {destructionAsset: 'unresolved', introAsset: 'missing'}); h.api.prepare();
  const initial = h.snapshot();
  assert.deepEqual(initial.destructionAsset, {ready: false, failed: false});
  h.advance(3);
  assert.equal(h.snapshot().elapsed, initial.elapsed);
  assert.deepEqual(h.snapshot().route, initial.route);
  assert.equal(h.snapshot().events.length, 0);
  assert.equal(h.node('flightStage').textContent, 'CARGANDO CHRONOS');

  h.setDestructionStatus('error');
  assert.deepEqual(h.snapshot().destructionAsset, {ready: false, failed: true});
  h.advance(.2);
  assert.ok(h.snapshot().route.elapsed > 0, 'An explicit download failure must not block the playable fallback');
  assert.equal(h.node('flightStage').textContent, `${h.snapshot().route.stageId} · ${h.snapshot().route.stageName}`,
    'A settled download must clear the transient loading label immediately and restore the current stage');
  h.clearDrawCalls(); h.api.background(0);
  let fallbackCalls = h.drawCalls.filter(call => call.path === FLIGHT_KIT_PATH);
  assert.ok(fallbackCalls.some(call => call.args[0] === 0 && call.args[1] === 0),
    'The preserved intact station must render before impact');
  assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false);

  h.advance(9.2);
  assert.equal(h.snapshot().route.station.state, 'ruptured');
  h.clearDrawCalls(); h.api.background(1e9);
  fallbackCalls = h.drawCalls.filter(call => call.path === FLIGHT_KIT_PATH);
  assert.ok(fallbackCalls.some(call => call.args[0] === 512 && call.args[1] === 0),
    'The preserved ruined station must render after impact');
  assert.equal(h.drawCalls.some(call => call.path === DESTRUCTION_PATH), false);
  assert.equal(h.snapshot().events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(h.pending.size, 1);
});

test('recovering and preparing the C9 emitter preserves the battery while keeping fresh pilots on Pulso until Atlas', t => {
  const h = harness(t, {savedSalvage: fundedSalvage(24)}); h.api.prepare(); h.api.fireManualShot(); h.advance(.3);
  h.api.collectModule();
  assert.equal(h.snapshot().equipment.recoveredTwin, true);
  assert.deepEqual(h.equipment().unlocked, ['pulse']);
  const afterRecovery = h.stored(EQUIPMENT_KEY);
  h.api.collectModule(); assert.equal(h.stored(EQUIPMENT_KEY), afterRecovery);
  const ammunition = h.snapshot().weapons;
  h.api.goHome(); h.node('openFlightDock').click();
  assert.ok(h.node('flightDock').classList.contains('show'));
  h.node('flightInstallTwin').click(); const prepared = h.snapshot();
  assert.equal(h.equipment().twinPrepared, true);
  assert.equal(JSON.parse(h.stored(SALVAGE_KEY)).balance, 0);
  assert.ok(JSON.parse(h.stored(SALVAGE_KEY)).upgrades.includes('twin-preparation'));
  assert.equal(h.equipment().selected, 'pulse');
  assert.deepEqual(h.equipment().unlocked, ['pulse']);
  assert.equal(prepared.weapons.charges, ammunition.charges);
  assert.equal(prepared.weapons.recharge, ammunition.recharge);
  assert.equal(prepared.weapons.cooldown, ammunition.cooldown);
  assert.equal(h.node('flightInstallTwin').disabled, true);
  assert.equal(h.node('flightCalibrateLance').classList.contains('hidden'), true);
  const save = h.stored(EQUIPMENT_KEY);
  h.node('flightInstallTwin').click(); h.node('flightCalibrateLance').click();
  assert.equal(h.stored(EQUIPMENT_KEY), save, 'Preparing and hidden historical controls cannot duplicate a reward');
  h.api.prepare(1); assert.equal(h.snapshot().weapons.selected, 'pulse');
  assert.equal(h.api.fireManualShot(), true); const fired = h.snapshot().weapons;
  assert.equal(fired.charges, 19); assert.equal(fired.projectiles.length, 1);
  h.node('flightWeapon').click();
  assert.deepEqual(h.snapshot().weapons, fired, 'Cycling cannot unlock the unavailable second cannon');
  const restored = harness(t, {saved: save}); restored.api.prepare();
  assert.equal(restored.snapshot().equipment.twinPrepared, true);
  assert.equal(restored.snapshot().weapons.selected, 'pulse');
  assert.deepEqual(restored.snapshot().weapons.unlocked, ['pulse']);
  assert.equal(h.stored('neon-n7-unlocked-v1'), '37'); assert.equal(h.stored('neon-n7-best-v1'), '2037');
  assert.equal(h.pending.size, 1); assert.equal(restored.pending.size, 1);
});

test('C9 requires earned salvage and purchases cooling once without granting weapons or ammunition', t => {
  const empty=harness(t);empty.api.prepare();empty.api.collectModule();empty.api.goHome();
  empty.node('openFlightDock').click();
  assert.equal(empty.node('flightInstallTwin').disabled,true);
  empty.node('flightInstallTwin').click();
  assert.notEqual(empty.snapshot().equipment.twinPrepared,true);
  assert.equal(empty.snapshot().equipment.unlocked.includes('twin'),false);
  assert.equal(JSON.parse(empty.stored(SALVAGE_KEY)).balance,0);

  const h=harness(t,{savedSalvage:fundedSalvage(100)});h.api.prepare();h.api.fireManualShot();h.advance(.4);
  const before=h.snapshot().weapons;
  h.api.goHome();h.node('openFlightDock').click();
  assert.match(h.node('c9Balance').textContent,/100/);
  h.node('c9BuyCoolant').click();
  const wallet=JSON.parse(h.stored(SALVAGE_KEY)),cooled=h.snapshot().weapons;
  assert.equal(wallet.balance,55);assert.equal(wallet.spent,45);
  assert.ok(wallet.upgrades.includes('coolant-feed'));
  assert.equal(cooled.rechargeSeconds,1.5);
  assert.equal(cooled.charges,before.charges);assert.equal(cooled.recharge,before.recharge);
  assert.equal(cooled.cooldown,before.cooldown);assert.equal(cooled.shotSequence,before.shotSequence);
  assert.deepEqual(h.snapshot().equipment.unlocked,['pulse']);
  const committed=h.stored(SALVAGE_KEY);
  h.node('c9BuyCoolant').click();assert.equal(h.stored(SALVAGE_KEY),committed);
  h.node('c9BuyShield').click();
  const shield=JSON.parse(h.stored(SALVAGE_KEY));
  assert.equal(shield.balance,25);assert.equal(shield.spent,75);
  assert.ok(shield.upgrades.includes('hull-reinforcement'));
  assert.equal(h.snapshot().reserveCapacity,45);assert.equal(h.snapshot().reserve,45);
  assert.equal(h.snapshot().weapons.charges,before.charges);
  const restored=harness(t,{savedSalvage:h.stored(SALVAGE_KEY)});restored.api.prepare();
  assert.equal(restored.snapshot().weapons.rechargeSeconds,1.5);
  assert.equal(restored.snapshot().weapons.charges,20,'A new match starts full and keeps its purchased cooling');
});

test('a blocked C9 monetary write cannot grant its cooling entitlement or consume ammunition', t => {
  const save=JSON.stringify(fundedSalvage(100));
  const h=harness(t,{savedSalvage:save,failSalvageWrite:true});h.api.prepare();
  const before=h.snapshot().weapons;
  h.api.goHome();h.node('openFlightDock').click();h.node('c9BuyCoolant').click();
  assert.equal(h.stored(SALVAGE_KEY),save);
  assert.equal(h.snapshot().weapons.rechargeSeconds,2);
  assert.deepEqual(h.snapshot().weapons,before);
  assert.equal(h.snapshot().equipment.unlocked.includes('twin'),false);
  assert.match(h.node('c9PurchaseStatus').textContent,/guardar|guardado|persist|bloque|reintent/i);
});

// dec-armas-plan (01/11/2026): una arma por partida; en vuelo no se cambia.
test('historical twin owners keep their weapon and the in-flight weapon button cannot switch it', t => {
  const saved=JSON.stringify({version:1,recoveredTwin:true,unlocked:['pulse','twin'],selected:'twin'});
  const h=harness(t,{saved});h.api.prepare(1);
  assert.equal(h.snapshot().weapons.selected,'twin');
  assert.equal(h.api.fireManualShot(),true);const fired=h.snapshot().weapons;
  assert.equal(fired.charges,19);assert.equal(fired.projectiles.length,2);
  for(let click=0;click<2;click++) {
    h.node('flightWeapon').click();
    assert.deepEqual(h.snapshot().weapons,fired,'the weapon and its battery stay as they were');
  }
  const restored=harness(t,{saved:h.stored(EQUIPMENT_KEY)});restored.api.prepare();
  assert.equal(restored.snapshot().weapons.selected,'twin');assert.equal(restored.pending.size,1);assert.equal(h.pending.size,1);
});

test('invalid equipment is backed up once before replacement and a failed backup blocks destructive recovery', t => {
  const invalid = '{broken equipment';
  const h = harness(t, {saved: invalid});
  assert.equal(h.stored(EQUIPMENT_KEY), invalid);
  assert.deepEqual(JSON.parse(h.stored(EQUIPMENT_KEY + ':invalid-backups')), [invalid]);
  assert.deepEqual(h.snapshot().equipment, {version: 1, recoveredTwin: false, unlocked: ['pulse'], selected: 'pulse'});
  h.api.prepare(); h.api.collectModule();
  assert.equal(h.equipment().recoveredTwin, true);
  assert.deepEqual(JSON.parse(h.stored(EQUIPMENT_KEY + ':invalid-backups')), [invalid]);
  const again = harness(t, {saved: invalid, backups: [invalid]});
  assert.deepEqual(JSON.parse(again.stored(EQUIPMENT_KEY + ':invalid-backups')), [invalid]);
  const blocked = harness(t, {saved: invalid, failBackup: true}); blocked.api.prepare(); blocked.api.collectModule();
  assert.equal(blocked.snapshot().equipmentWritable, false);
  assert.equal(blocked.snapshot().equipment.recoveredTwin, false);
  assert.equal(blocked.stored(EQUIPMENT_KEY), invalid, 'Do not overwrite unpreserved data when storage fails');
  blocked.api.frame(1 / 60, true); // Finish stage-entry cleanup before inserting the persistence fixture.
  blocked.api.seedModule(); blocked.api.frame(1 / 60, false);
  assert.equal(blocked.snapshot().targets.filter(item => item.type === 'flightModule').length, 1,
    'The collision loop must retain a recoverable piece until its persistence succeeds');
  assert.equal(blocked.stored('neon-n7-unlocked-v1'), '37');
});

test('an old Lance save flies with Pulse and keeps Gemelo; C9 shows the weapon but cannot switch it', t => {
  const savedProfile=JSON.stringify({version:1,recoveredTwin:true,unlocked:['pulse','twin','lance'],
    selected:'lance',lanceCalibrated:true});
  const h=harness(t,{saved:savedProfile});h.api.prepare();
  assert.equal(h.snapshot().weapons.selected,'pulse');
  assert.deepEqual(h.snapshot().weapons.unlocked,['pulse','twin']);
  assert.equal(h.node('flightWeaponDamage').textContent,'DAÑO ×1');
  h.api.goHome();h.node('openFlightDock').click();
  assert.equal(h.node('flightCalibrateLance').classList.contains('hidden'),true);
  const choices=h.node('flightLoadoutChoices');
  assert.deepEqual([...choices.querySelectorAll('[data-flight-loadout]')].map(button=>button.dataset.flightLoadout),['pulse','twin']);
  const saved=h.stored(EQUIPMENT_KEY);
  choices.querySelector('[data-flight-loadout="twin"]').click();
  assert.equal(h.stored(EQUIPMENT_KEY),saved,'C9 no longer switches the weapon');
  assert.match(h.node('c9PurchaseStatus').textContent,/hangar/);
});

test('malformed lance unlocks are preserved as backups instead of granting uncalibrated weapons', t => {
  for (const profile of [
    {version: 1, recoveredTwin: true, unlocked: ['pulse', 'twin', 'lance'], selected: 'lance'},
    {version: 1, recoveredTwin: true, unlocked: ['pulse', 'twin', 'lance'], selected: 'lance', lanceCalibrated: false},
    {version: 1, recoveredTwin: true, unlocked: ['pulse', 'twin', 'lance'], selected: 'lance', lanceCalibrated: 'true'},
    {version: 1, recoveredTwin: true, unlocked: ['pulse', 'lance'], selected: 'lance', lanceCalibrated: true},
    {version: 1, recoveredTwin: false, unlocked: ['pulse', 'twin', 'lance'], selected: 'lance', lanceCalibrated: true}
  ]) {
    const raw = JSON.stringify(profile), h = harness(t, {saved: raw});
    assert.equal(h.stored(EQUIPMENT_KEY), raw, 'Invalid data must remain recoverable before a successful replacement');
    assert.deepEqual(JSON.parse(h.stored(EQUIPMENT_KEY + ':invalid-backups')), [raw]);
    assert.deepEqual(h.snapshot().equipment,
      {version: 1, recoveredTwin: false, unlocked: ['pulse'], selected: 'pulse'});
    h.api.prepare();
    assert.equal(h.snapshot().weapons.selected, 'pulse');
    assert.deepEqual(h.snapshot().weapons.unlocked, ['pulse']);
    assert.equal(h.stored('neon-unlocked-v2'), '2');
    assert.equal(h.stored('neon-n7-unlocked-v1'), '37');
    assert.equal(h.pending.size, 1);
  }
});

test('the S1-V5 Atlas samples the movable ship and locks a ballistic salvo without an advertised safe lane', t => {
  const h = harness(t);h.api.startBossFixture();
  assert.ok(h.snapshot().boss,'A route/model fixture must start the S1-V5 guardian');
  assert.equal(h.node('atlasAutoFire'), null); assert.equal(h.snapshot().boss.phase, 1);
  h.pointer('pointerdown', 31, 250, 650); h.pointer('pointermove', 31, 290, 590);
  h.advance(.6); h.pointer('pointerup', 31, 290, 590);
  for (let frame = 0; frame < 600 && h.snapshot().boss.state !== 'charge'; frame++) h.api.frame(1 / 60, true);
  const warning = h.snapshot();
  assert.equal(warning.boss.state, 'charge');
  assert.equal(warning.boss.telegraph.kind,'mechanicalDeployment');
  // Atlas v9 (spec §6.11): el primer ataque son los cañones gemelos.
  assert.equal(warning.boss.telegraph.pattern,'twinCannons');
  assert.equal(warning.boss.telegraph.safeGap,null);
  assert.ok(Math.abs(warning.boss.telegraph.targetX-warning.player.x)<2,'The first salvo samples actual X');
  assert.ok(Math.abs(warning.boss.telegraph.targetY-warning.player.y)<2,'The salvo samples actual Y');
  const locked = warning.boss.telegraph;
  h.pointer('pointerdown', 32, 200, 600); h.pointer('pointermove', 32, 150, 650);
  h.advance(.3); h.pointer('pointerup', 32, 150, 650);
  closeTo(h.snapshot().boss.telegraph.targetY, locked.targetY, 'A deployed weapon routine must not retarget an already locked shot');
  const origin = locked.originY;
  for (let frame = 0; frame < 180; frame++) {
    if (h.snapshot().projectiles.length) break;
    h.api.frame(1 / 60, true);
  }
  const fired = h.snapshot(); assert.equal(fired.boss.state, 'fire');
  closeTo(fired.boss.telegraph.targetY, locked.targetY);
  assert.equal(fired.projectiles.length, 2);
  for (const shot of fired.projectiles) closeTo(shot.targetY, locked.targetY, 'Projectile metadata preserves the sampled target location');
  const crossings = fired.projectiles.map(shot => shot.x + shot.vx * (locked.targetY - shot.y) / shot.vy);
  assert.ok(Math.abs((crossings[0] + crossings[1]) / 2 - locked.targetX) < 20, 'The twin pair straddles the sampled location');
  assert.ok(Math.abs(locked.targetY - fired.player.y) > 10, 'The fixture must actually move after the cannon locks');
  assert.ok(locked.targetY > origin); assert.equal(h.pending.size, 1);
});

test('the route bar advances between collections without a stage, ammunition or recharge change', t => {
  const h = harness(t); h.api.prepare(); h.advance(.1);
  const before = h.snapshot(), distance = h.node('flightDistance').value;
  const stage = h.node('flightStage').textContent;
  h.advance(.41); const after = h.snapshot(); // Cross the 0.001 route/HUD quantum on the new 360-second flight.
  assert.equal(after.collected, before.collected);
  assert.equal(after.weapons.charges, before.weapons.charges);
  assert.equal(after.weapons.recharge, before.weapons.recharge);
  assert.equal(h.node('flightStage').textContent, stage);
  assert.ok(after.route.routeProgress > before.route.routeProgress);
  assert.ok(h.node('flightDistance').value > distance,
    'A quiet route must visibly advance without requiring a pickup or weapon update');
  assert.ok(Math.abs(h.node('flightDistance').value - after.route.routeProgress) < .001);
  assert.equal(h.node('flightDistance').getAttribute('aria-label'), 'Recorrido hasta el destino');
  assert.equal(h.pending.size, 1);
});

test('compact comms do not repeat the quota and expire only with played time without moving the flight bounds', t => {
  const h = harness(t, {unlocked: 3, rects: {
    hud: {left: 10, top: 10, width: 370, height: 44},
    flightRoute: {left: 10, top: 58, width: 370, height: 24},
    flightObjective: {left: 10, top: 86, width: 370, height: 34}
  }});
  h.api.prepare(2); h.api.collectEnergy();
  assert.equal(h.node('goal').textContent, '1/60');
  assert.equal(h.node('flightObjective').textContent, '');
  assert.equal(h.node('flightObjective').dataset.active, 'false');
  assert.equal(h.node('flightDistance').getAttribute('aria-label'), 'CRONIUM recuperado');
  const bounds = h.snapshot().bounds;
  h.api.showStoryTransmission('CONTROL', 'Restos por babor. Mantén el corredor.', 1.1);
  h.api.refreshClassicFlightBounds();
  assert.equal(h.node('flightObjective').textContent, 'CONTROL: Restos por babor. Mantén el corredor.');
  assert.equal(h.node('flightObjective').dataset.active, 'true');
  assert.deepEqual(h.snapshot().bounds, bounds);
  h.api.pauseGame(); h.advance(3);
  assert.equal(h.node('flightObjective').dataset.active, 'true',
    'A paused transmission must remain readable until its played-time duration elapses');
  h.api.resumeGame(); h.advance(1.11); h.api.refreshClassicFlightBounds();
  assert.equal(h.node('flightObjective').textContent, '');
  assert.equal(h.node('flightObjective').dataset.active, 'false');
  assert.deepEqual(h.snapshot().bounds, bounds,
    'Showing or clearing comms must not displace the playable boundary');
  assert.equal(h.pending.size, 1);
});

test('measured compact bounds ignore the hidden one-weapon switch and side controls outside the Canvas', t => {
  const h = harness(t, {unlocked: 3, rects: {
    hud: {left: 10, top: 10, width: 370, height: 44},
    flightRoute: {left: 10, top: 58, width: 370, height: 24},
    flightObjective: {left: 10, top: 86, width: 370, height: 34},
    fire: {left: 258, top: 760, width: 116, height: 64},
    flightWeapon: {left: 10, top: 700, width: 104, height: 48}
  }});
  h.api.prepare(2); const first = h.snapshot(), scale = first.H / 844;
  assert.equal(first.bounds.fits, true);
  assert.equal(h.node('flightWeapon').classList.contains('hidden'), true,
    'A single owned weapon must not reserve an inactive touch target');
  closeTo((first.bounds.minY - 158*.52) / scale, 120,
    'The upper boundary follows the actual comms slot rather than a 182px minimum');
  closeTo((first.bounds.maxY + 104*.52) / scale, 740,
    'The complete ship tail clears the compact bottom-control reserve');
  h.setRect('flightObjective', {left: 500, top: 400, width: 200, height: 34});
  h.setRect('flightWeapon', {left: 500, top: 200, width: 104, height: 48});
  h.api.refreshClassicFlightBounds(); const lateral = h.snapshot();
  closeTo((lateral.bounds.minY - 158*.52) / scale, 82,
    'An off-Canvas transmission must not lower the playable ceiling');
  closeTo((lateral.bounds.maxY + 104*.52) / scale, 740,
    'A hidden weapon switch must not constrain the lower boundary');
  assert.ok(lateral.bounds.minY < first.bounds.minY);
  assert.equal(lateral.bounds.maxY, first.bounds.maxY);
  assert.equal(lateral.bounds.fits, true);
  assert.equal(h.pending.size, 1);
});

test('the compact HUD and weapon share menu, completion, death and Atlas visibility and the weapon cannot be switched in flight', t => {
  const saved = JSON.stringify({version: 1, recoveredTwin: true,
    unlocked: ['pulse', 'twin'], selected: 'twin'});
  const h = harness(t, {saved, unlocked: 3, rects: {
    hud: {left: 10, top: 10, width: 370, height: 44},
    flightRoute: {left: 10, top: 58, width: 370, height: 24},
    flightObjective: {left: 10, top: 86, width: 370, height: 34},
    fire: {left: 258, top: 760, width: 116, height: 64},
    flightWeapon: {left: 10, top: 700, width: 104, height: 48}
  }});
  const hidden = () => {
    assert.equal(h.node('flightHud').classList.contains('hidden'), true);
    assert.equal(h.node('flightRoute').classList.contains('hidden'), true);
    assert.ok(h.node('flightWeapon').closest('#flightHud.hidden'),
      'The detached lower weapon control must remain inside the hidden HUD lifecycle');
  };
  hidden(); h.api.prepare(2);
  assert.equal(h.node('flightHud').classList.contains('hidden'), false);
  assert.equal(h.node('flightRoute').classList.contains('hidden'), false);
  assert.equal(h.api.fireManualShot(), true); const fired = h.snapshot().weapons;
  // Una arma por partida (dec-armas-plan): el botón solo informa.
  h.node('flightWeapon').click();
  assert.deepEqual(h.snapshot().weapons, fired);
  assert.equal(h.node('flightWeaponName').textContent, 'GEMELO');
  assert.equal(h.node('flightWeaponDamage').textContent, 'DAÑO ×2');
  const normalBounds = h.snapshot().bounds;
  h.api.finishGame('hull');
  assert.equal(h.snapshot().state, 'gameover'); hidden();
  h.api.refreshClassicFlightBounds();
  assert.ok(h.snapshot().bounds.minY < normalBounds.minY,
    'A layout refresh while defeated must actually observe the hidden interface');
  assert.equal(h.api.resumeReward(), true);
  assert.equal(h.snapshot().state, 'playing');
  assert.equal(h.node('flightHud').classList.contains('hidden'), false,
    'Continuing an ordinary flight must restore its compact HUD and weapon');
  assert.equal(h.node('flightRoute').classList.contains('hidden'), false);
  assert.deepEqual(h.snapshot().bounds, normalBounds,
    'Continuing after a defeated-state layout refresh must restore measured HUD and weapon clearance');
  for (let fragment = 0; fragment < 60; fragment++) h.api.collectEnergy();
  assert.equal(h.snapshot().state, 'complete'); hidden();
  h.api.goHome(); assert.equal(h.snapshot().state, 'menu'); hidden();
  h.api.startBossFixture();
  assert.ok(h.snapshot().boss, 'The S1-V5 boundary must enter Atlas');
  assert.equal(h.node('flightHud').classList.contains('hidden'), false,
    'Atlas must retain the same weapon selector and damage explanation');
  assert.equal(h.node('flightRoute').classList.contains('hidden'), true,
    'The ordinary travel line must stay hidden behind the combat interface');
  assert.equal(h.node('flightWeapon').closest('#flightHud.hidden'), null);
  assert.equal(h.snapshot().state, 'playing');
  h.api.finishGame('hull');
  assert.equal(h.snapshot().state, 'gameover'); hidden();
  assert.equal(h.api.resumeReward(), true);
  assert.equal(h.snapshot().state, 'playing');
  assert.ok(h.snapshot().boss);
  assert.equal(h.node('flightHud').classList.contains('hidden'), false);
  assert.equal(h.node('flightRoute').classList.contains('hidden'), true);
  assert.equal(h.node('atlasEncounter').classList.contains('hidden'), false,
    'Continuing Atlas restores its combat interface without leaking the ordinary route controls');
  assert.equal(h.pending.size, 1);
});

test('power pickup and expiry update flight clearance only when chip visibility changes', t => {
  const rects = {
    hud: {left: 10, top: 10, width: 370, height: 44},
    flightRoute: {left: 10, top: 58, width: 370, height: 24},
    flightObjective: {left: 10, top: 86, width: 370, height: 34},
    fire: {left: 258, top: 760, width: 116, height: 64},
    flightWeapon: {left: 10, top: 776, width: 104, height: 48},
    powerHud: node => ({left: 10, top: 712, width: 370,
      height: node.querySelector('.power-chip.active') ? 24 : 0})
  };
  const h = harness(t, {unlocked: 3, rects}); h.api.prepare(2);
  const before = h.snapshot(), scale = before.H / 844;
  closeTo((before.bounds.maxY + 104*.52) / scale, 740);
  const initialReads = h.rectReads('powerHud');
  h.api.collectPower('tractor'); const active = h.snapshot();
  assert.equal(h.node('powerTractor').classList.contains('active'), true);
  assert.ok(h.rectReads('powerHud') > initialReads,
    'A real pickup must resample the newly visible chip row');
  closeTo((active.bounds.maxY + 104*.52) / scale, 712);
  assert.ok(active.bounds.maxY < before.bounds.maxY);
  assert.ok(active.player.y + 104*.52 <= 712 * scale,
    'The complete ship tail must remain above the newly visible power chip');
  const activeReads = h.rectReads('powerHud');
  h.advance(.5);
  assert.equal(h.rectReads('powerHud'), activeReads,
    'An unchanged countdown must not trigger layout sampling every frame');
  h.api.collectPower('tractor');
  assert.equal(h.rectReads('powerHud'), activeReads,
    'Extending an already visible power must not resample unchanged geometry');
  h.advance(7.9);
  assert.equal(h.node('powerTractor').classList.contains('active'), true);
  assert.equal(h.rectReads('powerHud'), activeReads);
  h.advance(.11);
  assert.equal(h.node('powerTractor').classList.contains('active'), false);
  assert.ok(h.rectReads('powerHud') > activeReads,
    'Expiry must release the measured chip clearance');
  assert.deepEqual(h.snapshot().bounds, before.bounds);
  const expiredReads = h.rectReads('powerHud'); h.advance(.2);
  assert.equal(h.rectReads('powerHud'), expiredReads);
  assert.equal(h.pending.size, 1);
});

test('each Chronos stage gates its actual route on time and its cumulative recovery quota without replaying events', t => {
  const h = harness(t, {unlocked: 1}); h.api.prepare();
  const first = h.snapshot().route;
  assert.equal(first.stageNumber, 1); assert.equal(first.stageGoal, 4);
  h.advance(first.stageDuration + 3);
  const waiting = h.snapshot();
  assert.equal(waiting.state, 'playing'); assert.equal(waiting.route.stageNumber, 1);
  assert.equal(waiting.route.stageProgress, 1); assert.equal(waiting.route.waitingFor, 'cronium');
  assert.equal(waiting.route.canFinish, false); assert.equal(waiting.unlocked, 1);
  assert.equal(waiting.events.filter(event => event.type === 'attack').length, 1);
  assert.equal(waiting.events.filter(event => event.type === 'rupture').length, 1);
  h.api.pauseGame(); const beforePause = h.snapshot(); h.advance(12);
  assert.deepEqual(h.snapshot().route, beforePause.route);
  assert.deepEqual(h.snapshot().events, beforePause.events);
  h.api.resumeGame();
  for (let fragment = 0; fragment < 3; fragment++) h.api.collectEnergy();
  h.advance(.1); assert.equal(h.snapshot().route.stageNumber, 1);
  assert.equal(h.snapshot().route.waitingFor, 'cronium');
  h.api.collectEnergy(); h.advance(.04);
  const next = h.snapshot();
  assert.equal(next.route.stageNumber, 2); assert.equal(next.route.stageId, '1.2');
  assert.equal(next.route.stageGoal, 8); assert.ok(next.route.stageElapsed < .1);
  assert.equal(next.route.station.alpha, 1, 'Departure is spatial recession, rather than fading the origin');
  assert.ok(next.route.station.scale < first.station.scale);
  assert.ok(next.route.routeProgress > first.routeProgress);
  assert.equal(next.events.filter(event => event.type === 'attack').length, 1);
  assert.equal(next.events.filter(event => event.type === 'rupture').length, 1);
  assert.equal(next.events.filter(event => event.type === 'stage-complete').length, 1);
  assert.equal(next.events.filter(event => event.type === 'checkpoint').length, 2);
  assert.equal(h.voyage().unlockedStage, 2);
  assert.equal(h.pending.size, 1);
});

test('Chronos stage-entry checkpoints restore coherently after reload and retry without rewriting archived campaign saves', t => {
  const h = harness(t, {unlocked: 1}); h.api.prepare(); h.reachStage(3);
  const entry = h.snapshot(), record = h.voyage();
  assert.equal(record.version, 2); assert.equal(record.checkpoint.stageNumber, 3);
  assert.equal(record.unlockedStage, 3); assert.equal(record.completed, false);
  assert.equal(record.entry.collected, entry.collected);
  assert.equal(record.entry.score, entry.score);
  assert.equal(record.entry.hull, entry.hull);
  assert.equal(record.entry.collected, 8);
  h.advance(4); h.api.collectEnergy(); h.api.collectEnergy();
  assert.equal(h.snapshot().collected, entry.collected + 2);
  assert.ok(h.snapshot().score > entry.score);
  assert.deepEqual(h.voyage(), record,
    'Mid-combat changes must not pretend to be a persisted exact-position checkpoint');
  const restored = harness(t, {unlocked: 1, savedVoyage: h.stored(VOYAGE_KEY)}); restored.api.prepare();
  const reloaded = restored.snapshot();
  assert.equal(reloaded.route.stageNumber, 3); assert.equal(reloaded.route.stageElapsed, 0);
  assert.equal(reloaded.collected, record.entry.collected);
  assert.equal(reloaded.score, record.entry.score); assert.equal(reloaded.hull, record.entry.hull);
  assert.equal(reloaded.unlocked, 1);
  assert.equal(reloaded.events.some(event => ['attack', 'rupture', 'twin-module-marker'].includes(event.type)), false,
    'Restoring stage 3 must not immediately replay the previous cinematic or spawn its recovered-module event early');
  h.api.finishGame('hull'); assert.equal(h.snapshot().state, 'gameover');
  h.api.prepare(); const retried = h.snapshot();
  assert.equal(retried.route.stageNumber, 3); assert.equal(retried.route.stageElapsed, 0);
  assert.equal(retried.collected, record.entry.collected);
  assert.equal(retried.score, record.entry.score); assert.equal(retried.hull, record.entry.hull);
  for (const fixture of [h, restored]) {
    assert.equal(fixture.stored('neon-n7-unlocked-v1'), '37');
    assert.equal(fixture.stored('neon-n7-best-v1'), '2037');
    assert.deepEqual(JSON.parse(fixture.stored('neon-stars-v2')), {});
    assert.equal(fixture.pending.size, 1);
  }
});

test('the voluntary onboard C9 workshop prepares its recovered emitter and resumes the exact route with Pulso and unchanged charges', t => {
  const h = harness(t, {unlocked: 1, savedSalvage: fundedSalvage(24)}); h.api.prepare(); h.api.collectModule(); h.reachStage(6);
  assert.equal(h.snapshot().route.stageNumber, 6);
  assert.equal(h.snapshot().equipment.recoveredTwin, true);
  h.recoverStageQuota();
  h.advance(.9); assert.equal(h.api.fireManualShot(), true);
  h.advance(.35); const flying = h.snapshot();
  assert.equal(flying.state,'playing');assert.equal(flying.route.waitingFor,null);
  assert.equal(h.node('flightDock').classList.contains('show'),false);
  assert.equal(flying.events.filter(event=>event.type==='service').length,1);
  assert.equal(flying.events.filter(event=>event.type==='service-complete').length,1);
  h.node('classicC9').click(); const docked = h.snapshot();
  assert.equal(docked.state, 'paused'); assert.equal(docked.route.waitingFor, null);
  assert.equal(docked.route.stageNumber, 6); assert.ok(h.node('flightDock').classList.contains('show'));
  assert.equal(h.api.fireManualShot(), false, 'An open onboard workshop cannot emit a combat projectile');
  const route = docked.route, ammunition = docked.weapons;
  h.advance(30); assert.deepEqual(h.snapshot().route, route);
  assert.deepEqual(h.snapshot().weapons, ammunition);
  h.api.resumeGame();
  assert.equal(h.snapshot().state, 'playing', 'Ordinary resume closes the voluntary workshop without a compulsory purchase');
  assert.equal(h.node('flightDock').classList.contains('show'),false);
  assert.deepEqual(h.snapshot().route, route);
  assert.deepEqual(h.snapshot().weapons,ammunition);
  h.node('classicC9').click();assert.equal(h.snapshot().state,'paused');
  h.node('flightInstallTwin').click();
  assert.equal(h.equipment().selected, 'pulse');
  assert.equal(h.equipment().twinPrepared, true);
  assert.equal(JSON.parse(h.stored(SALVAGE_KEY)).balance, 0);
  assert.ok(JSON.parse(h.stored(SALVAGE_KEY)).upgrades.includes('twin-preparation'));
  assert.deepEqual(h.equipment().unlocked, ['pulse']);
  const equipped = h.snapshot().weapons;
  assert.equal(equipped.charges, ammunition.charges);
  assert.equal(equipped.recharge, ammunition.recharge);
  assert.equal(equipped.cooldown, ammunition.cooldown);
  h.node('flightDockContinue').click(); const continued = h.snapshot();
  assert.equal(continued.state, 'playing'); assert.equal(continued.currentLevel, 0);
  assert.equal(continued.route.stageNumber, 6); closeTo(continued.route.stageElapsed,flying.route.stageElapsed);
  assert.deepEqual(continued.route,flying.route,'Purchasing a module cannot advance or rewind the actual journey');
  assert.equal(continued.route.waitingFor, null);
  assert.equal(h.node('flightDock').classList.contains('show'), false);
  assert.equal(continued.weapons.selected, 'pulse');
  assert.equal(continued.weapons.charges, ammunition.charges);
  assert.equal(continued.weapons.recharge, ammunition.recharge);
  assert.equal(continued.weapons.cooldown, ammunition.cooldown);
  assert.equal(continued.events.filter(event => event.type === 'service').length, 1);
  assert.equal(continued.events.filter(event => event.type === 'service-complete').length, 1);
  assert.equal(h.voyage().checkpoint.stageNumber, 6);
  assert.ok(h.voyage().checkpoint.eventIds.includes('chronos-voyage:1.6:service-complete'));
  assert.equal(h.voyage().entry.collected, 18);
  h.advance(31);
  assert.equal(h.snapshot().route.stageNumber,7);
  assert.ok(h.snapshot().route.stageElapsed<.3);
  assert.equal(h.voyage().checkpoint.stageNumber,7);
  assert.equal(continued.unlocked, 1);
  assert.equal(h.pending.size, 1);
});

test('a historical C9 end-of-stage waiting checkpoint resolves once into the next stage without losing recovered equipment', t => {
  const original=harness(t,{unlocked:1});original.api.prepare();original.api.collectModule();original.reachStage(6);
  original.recoverStageQuota();original.advance(1.25);
  assert.equal(original.snapshot().state,'playing');
  const record=original.voyage();
  // Explicit historical fixture: the old station saved a completed sixth leg
  // while still waiting for service. Current saves already auto-resolve that
  // pair, so reconstruct the real old marker rather than treating a new save
  // with service-complete as if it were waiting.
  record.checkpoint.serviceWaiting=true;
  record.checkpoint.eventIds=[...new Set([...record.checkpoint.eventIds.filter(id=>
    id!=='chronos-voyage:1.6:service-complete'),'chronos-voyage:1.6:service','chronos-voyage:1.6:complete'])];
  const h=harness(t,{unlocked:1,savedVoyage:record,saved:original.stored(EQUIPMENT_KEY)});h.api.prepare();
  const oldRoute=h.window.NeonCampaign.createChronosVoyage({checkpoint:record.checkpoint}).snapshot();
  assert.equal(oldRoute.stageElapsed,oldRoute.stageDuration,
    'The explicit historical completion milestone must not be moved backward to the new early dock');
  assert.equal(oldRoute.waitingFor,'service');
  const departed=h.snapshot();
  assert.equal(departed.state,'playing');assert.equal(departed.route.stageNumber,7);
  assert.equal(h.node('flightDock').classList.contains('show'),false,'Migration must not restore the removed compulsory orbital UI');
  assert.equal(departed.route.stageElapsed,0);assert.equal(departed.collected,18);
  assert.equal(departed.equipment.recoveredTwin,true);
  assert.deepEqual(departed.equipment.unlocked,['pulse']);
  assert.equal(departed.events.filter(event=>event.type==='service-complete').length,1);
  assert.equal(h.voyage().checkpoint.stageNumber,7);
  h.advance(.1);assert.equal(h.snapshot().events.filter(event=>event.type==='service-complete').length,1);
  const restored=harness(t,{unlocked:1,savedVoyage:h.stored(VOYAGE_KEY),saved:h.stored(EQUIPMENT_KEY)});restored.api.prepare();
  assert.equal(restored.snapshot().route.stageNumber,7);assert.equal(restored.snapshot().route.stageElapsed,0);
  assert.equal(restored.snapshot().events.filter(event=>event.type==='service-complete').length,0);
  assert.equal(restored.snapshot().equipment.recoveredTwin,true);
  assert.equal(h.stored('neon-n7-unlocked-v1'),'37');assert.equal(h.pending.size,1);
});

test('the ten-stage selector exposes only persisted unlocked entries and an actual launch replays the chosen checkpoint', t => {
  const h = harness(t, {unlocked: 1}); h.api.prepare(); h.reachStage(3);
  h.api.goHome(); h.api.prepareLevel(0);
  const buttons = [...h.node('chronosStageGrid').querySelectorAll('button[data-voyage-stage]')];
  assert.equal(buttons.length, 10);
  assert.deepEqual(buttons.map(button => button.dataset.voyageStage),
    Array.from({length: 10}, (_, index) => String(index + 1)));
  assert.deepEqual(buttons.map(button => button.disabled),
    [false, false, false, true, true, true, true, true, true, true]);
  assert.match(h.node('chronosStagesNote').textContent, /3\/10/);
  buttons[9].click();
  assert.equal(h.voyage().unlockedStage, 3, 'Clicking a locked stage cannot grant progression');
  buttons[1].click();
  assert.match(h.node('chronosStagesNote').textContent, /1\.2/);
  assert.equal(h.node('chronosStageGrid').querySelector('[data-voyage-stage="2"]').getAttribute('aria-pressed'), 'true');
  h.node('launch').click(); const replayed = h.snapshot();
  assert.equal(replayed.state, 'playing'); assert.equal(replayed.currentLevel, 0);
  assert.equal(replayed.route.stageNumber, 2); assert.equal(replayed.route.stageElapsed, 0);
  assert.equal(replayed.collected, 4);
  assert.equal(replayed.unlocked, 1); assert.equal(replayed.route.canFinish, false);
  assert.equal(h.pending.size, 1);
});

test('a malformed new voyage is backed up without inferring stages from old classic or N-7 progress', t => {
  const raw = '{incomplete chronos route';
  const h = harness(t, {unlocked: 7, savedVoyage: raw});
  assert.equal(h.stored(VOYAGE_KEY), raw);
  assert.deepEqual(JSON.parse(h.stored(VOYAGE_KEY + ':invalid-backups')), [raw]);
  h.api.prepare(); h.advance(.05);
  assert.equal(h.snapshot().route.stageNumber, 1);
  assert.equal(h.voyage().unlockedStage, 1);
  assert.deepEqual(JSON.parse(h.stored(VOYAGE_KEY + ':invalid-backups')), [raw]);
  assert.equal(h.stored('neon-unlocked-v2'), '7');
  assert.equal(h.stored('neon-n7-unlocked-v1'), '37');
  assert.equal(h.stored('neon-n7-best-v1'), '2037');
  assert.equal(h.pending.size, 1);
});

test('stage crossings retain live debris and genuine projectiles instead of resetting the scene', t => {
  const h=harness(t,{unlocked:1});h.api.prepare();h.recoverStageQuota();
  h.advance(35.98);h.api.seedTransitFixture();h.api.fireManualShot();
  const before=h.snapshot();assert.equal(before.route.stageNumber,1);
  assert.ok(before.weapons.projectiles.length>0);
  h.api.update(.034);const after=h.snapshot();
  assert.equal(after.route.stageNumber,2);
  assert.ok(after.targets.some(item=>item.id==='boundary-live-debris'));
  assert.ok(after.weapons.projectiles.length>0);
  assert.ok(after.weapons.projectiles[0].y<before.weapons.projectiles[0].y);
  assert.equal(h.voyage().checkpoint.stageNumber,2);assert.equal(h.pending.size,1);
});

test('actual Chronos runtime introduces a hostile pursuer after rupture without N-7 metadata', t => {
  const h=harness(t,{unlocked:1});h.api.startLevel(0);
  for(let n=0;n<Math.ceil(12/.034);n++)h.api.update(.034);
  assert.equal(h.snapshot().targets.some(item=>item.tactics),false);
  // La persecución empieza al acabar la animación del inicio (14 s), no a los 9 s.
  for(let n=0;n<Math.ceil(14/.034);n++)h.api.update(.034);
  const q=h.snapshot(),raiders=q.targets.filter(item=>item.tactics===h.window.NeonCampaign.CLASSIC_PURSUIT_VERSION);
  assert.ok(raiders.length>=1&&raiders.length<=1);
  assert.equal(raiders[0].role,'raider');
  assert.ok(q.events.some(event=>event.type==='rupture'));
  assert.ok(q.targets.some(item=>item.projectile)||raiders[0].fired>0,'Pursuit must emit an actual ballistic shot');
  h.api.pauseGame();const paused=h.snapshot();h.advance(2,false);
  assert.deepEqual(h.snapshot().targets,paused.targets);assert.deepEqual(h.snapshot().route,paused.route);
  assert.equal(h.pending.size,1);
});

test('Gaia schedules CH-01 then a genuine CH-02 through the actual patrol update', t => {
  // Seed 34 killed the stationary fixture pilot at 10.710 seconds before the
  // second patrol could spawn. Observe the scheduling contract with unrelated
  // ambient spawns disabled, rather than interpreting that death as no CH-02.
  for (const randomSeed of [34, 0, 1, 11, 99]) {
    const h = harness(t, {unlocked: 2, randomSeed}); h.api.startLevel(1);
    const observed = new Map();
    let q = h.snapshot(), interceptors = [];
    for (let frame = 0; frame < Math.ceil(17 / .034) && interceptors.length === 0; frame++) {
      h.api.patrolFrame(.034);
      q = h.snapshot();
      for (const item of q.targets.filter(item => item.tactics === h.window.NeonCampaign.CLASSIC_PURSUIT_VERSION)) {
        if (!observed.has(item.id)) observed.set(item.id, {...item, firstSeenAt: q.elapsed});
      }
      interceptors = q.targets.filter(item => item.role === 'interceptor');
    }
    assert.ok(interceptors.length >= 1, `No scheduled CH-02 for seed ${randomSeed}: ${JSON.stringify(q)}`);
    const sequence = [...observed.values()];
    assert.deepEqual(sequence.slice(0, 2).map(item => item.role), ['scout', 'interceptor']);
    assert.equal(sequence[0].frame.image, 'assets/ch01_atlas_v1.webp');
    assert.ok(sequence[1].firstSeenAt > sequence[0].firstSeenAt, 'CH-01 precedes CH-02 in played time');
    assert.equal(interceptors[0].hp, 3);
    assert.equal(interceptors[0].frame.image, 'assets/ch02_interceptor_atlas_v1.webp');
    assert.equal(q.state, 'playing'); assert.ok(q.hull > 0, 'The fixture must actually reach its scheduling assertion');
    assert.equal(q.currentLevel, 1); assert.equal(q.route, null); assert.equal(h.pending.size, 1);
  }
});

test('Chronos arrival continues the campaign with S1-V2 through the actual next control without a duplicate briefing',t=>{
  const h=harness(t,{unlocked:1});h.api.prepare();
  for(let n=1;n<=10;n++)h.advanceStage({service:true});
  // The real arrival completes S1-V1 at once: no Atlas and no epilogue wait.
  assert.equal(h.snapshot().boss,null);
  assert.equal(h.snapshot().state,'complete');assert.equal(h.snapshot().unlocked,2);
  // Los viajes enlazan: el siguiente es S1-V2 (no el nivel clásico 2).
  assert.match(h.node('nextLevel').textContent,/SIGUIENTE VIAJE: S1-V2/);
  h.node('nextLevel').click();
  const q=h.snapshot();assert.equal(q.state,'playing');assert.equal(q.currentLevel,0);assert.equal(q.route.routeId,'gaia-outer-net');
  assert.equal(h.node('briefing').classList.contains('show'),false);
  assert.equal(h.voyage().completed,true);assert.equal(h.pending.size,1);
});

test('restored stage-entry checkpoints retain the same seven-second patrol grace without replaying their entry event',t=>{
  const first=harness(t,{unlocked:1});first.api.prepare();first.advanceStage();
  const record=first.voyage();assert.equal(record.checkpoint.stageNumber,2);
  const restored=harness(t,{unlocked:1,savedVoyage:record});restored.api.startLevel(0);
  for(let n=0;n<Math.floor(6.7/.034);n++)restored.api.update(.034);
  assert.equal(restored.snapshot().targets.some(item=>item.tactics),false);
  for(let n=0;n<Math.ceil(.6/.034);n++)restored.api.update(.034);
  assert.equal(restored.snapshot().targets.filter(item=>item.tactics===restored.window.NeonCampaign.CLASSIC_PURSUIT_VERSION).length,1);
  assert.equal(restored.snapshot().route.stageNumber,2);
  assert.equal(restored.snapshot().events.filter(event=>event.type==='attack'||event.type==='rupture').length,0);
  assert.equal(restored.pending.size,1);
});
