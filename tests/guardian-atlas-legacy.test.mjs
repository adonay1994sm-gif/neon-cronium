import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {createChronosVoyageCheckpoint} from '../src/game/progression/chronos-flight.js';
import {createChronosChapterStory} from '../src/game/narrative/chronos-chapter.js';

const root = new URL('..', import.meta.url);
const [html, core, content, game] = await Promise.all(
  ['index.html', 'core-runtime.js', 'content-runtime.js', 'game.js']
    .map(file => readFile(new URL(file, root), 'utf8'))
);
const plain = value => JSON.parse(JSON.stringify(value));

/**
 * Controlled integration fixture, NOT a natural playthrough. It simulates real
 * collection callbacks and the existing update function. It suppresses unrelated
 * obstacles and pilots the ship in memory to isolate boss lifecycle/save rules.
 * The separate Chromium test never uses these mutations.
 */
function harness(t, campaign = '', {saved, savedSettings, storageEntries = [], failEquipmentWrite = false, failBackupWrite = false, brokenImages = []} = {}) {
  const dom = new JSDOM(html, {url: `https://neon.test/${campaign ? '?campaign=' + campaign : ''}`,
    runScripts: 'outside-only', pretendToBeVisual: true});
  t.after(() => dom.window.close());
  const {window} = dom;
  const gradient = {addColorStop() {}};
  const ctx = new Proxy({}, {get: (target, key) => key in target ? target[key]
    : key === 'createLinearGradient' || key === 'createRadialGradient' ? () => gradient
      : key === 'measureText' ? () => ({width: 20}) : () => {},
    set(target, key, value) { target[key] = value; return true; }});
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  window.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
    x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844
  });
  window.Image = class {
    constructor() { this.complete = true; this.naturalHeight = 1024; }
    // An image listed in brokenImages never decodes (naturalWidth 0).
    get naturalWidth() { return brokenImages.some(path => String(this.path || this._assetPath || '').endsWith(path)) ? 0 : 1024; }
    set src(value) { this.path = value; }
    get src() { return this.path || ''; }
  };
  const pending = new Map(); let id = 0;
  window.requestAnimationFrame = callback => (pending.set(++id, callback), id);
  window.cancelAnimationFrame = frame => pending.delete(frame);
  window.navigator.vibrate = () => true;
  window.localStorage.setItem('neon-unlocked-v2', '1');
  window.localStorage.setItem('neon-stars-v2', '{}');
  // Instrumented fixture starts at the already-reached final route checkpoint.
  // It still advances its remaining 36 seconds and collects the missing quota.
  window.localStorage.setItem('neonCronium.chronosVoyage.v2', JSON.stringify({version: 2,
    checkpoint: createChronosVoyageCheckpoint(10), unlockedStage: 10, completed: false,
    entry: {hull: 100, score: 0, maxCombo: 1, collected: 32}}));
  window.localStorage.setItem('neon-n7-unlocked-v1', '37');
  window.localStorage.setItem('neon-n7-best-v1', '2037');
  for(const [key,value] of storageEntries)window.localStorage.setItem(key,value);
  if (saved !== undefined) window.localStorage.setItem('neonCronium.flightEquipment.v1', saved);
  if (savedSettings !== undefined) window.localStorage.setItem('neon-settings-v5', savedSettings);
  const storageWrite = window.Storage.prototype.setItem;
  let equipmentWriteBlocked = failEquipmentWrite, salvageWriteBlocked = false;
  window.Storage.prototype.setItem = function(key, value) {
    if (equipmentWriteBlocked && key === 'neonCronium.flightEquipment.v1') throw new Error('Fixture: equipment save interrupted');
    if (salvageWriteBlocked && key === 'neonCronium.classicSalvage.v1') throw new Error('Fixture: missile save interrupted');
    if (failBackupWrite && key === 'neonCronium.flightEquipment.v1:invalid-backups') throw new Error('Fixture: backup refused');
    return storageWrite.call(this, key, value);
  };
  window.eval(core); window.eval(content);
  const marker = '  legacyFrameId = requestAnimationFrame(frame);\n})();';
  assert.equal(game.split(marker).length, 2, 'Legacy bootstrap marker changed');
  const hook = `let atlasContactFixturePosition=null;
  function holdAtlasContactFixturePosition(){
    if(!atlasContactFixturePosition||!atlasBoss)return;
    // This one controlled contact fixture pins only the physical boss pose.
    // It isolates weapon/armor collision math, not moving-target accuracy or
    // difficulty; v6 movement is checked by the unpinned model tests.
    atlasBoss.x=atlasContactFixturePosition.x;atlasBoss.y=atlasContactFixturePosition.y;
    atlasBoss.targetY=atlasContactFixturePosition.y;
    atlasBoss.motionX=atlasBoss.x;atlasBoss.motionY=atlasBoss.y;
    atlasBoss.motionVx=0;atlasBoss.motionVy=0;atlasBoss.nextMotionAt=Infinity;
  }
  window.__ATLAS_LEGACY_TEST__ = {
    update, startLevel, pauseGame, resumeGame, goHome, completeLevel, damageShip, resumeReward,
    fireManualShot, firePhaser, fireAtlasPulse, fireClassicMissile,
    prepare(index=0) {
      startLevel(index); warpTimer=0; spawnTimer=999; classicScoutTimer=999;
      items=[]; gates=[];
    },
    // S1-V5 (viaje del mapa con Atlas), desde la entrada del tramo pedido.
    prepareAtlasVoyage(stage=8) {
      classicSideVoyagePending=NeonCampaign.getVoyageFicha(NeonCampaign.VOYAGES.find(item=>item.id==='S1-V5').routeId);
      classicVoyageRequestedStage=stage;
      startLevel(0);warpTimer=0;spawnTimer=999;classicScoutTimer=999;
      items=[];gates=[];
    },
    // Reproduces the intent written by builds where Atlas closed S1-V1: the
    // same completionJournal.complete call, with the Gemelo equipment inside.
    writeLegacyAtlasJournal() {
      const checkpoint=NeonCampaign.createChronosVoyageCheckpoint(10,{goal:LEVELS[0].goal,collected:36});
      return completionJournal.complete({completionId:KEYS.unlocked+':1:legacy-atlas',level:1,stars:3,score:500,
        checkpoint:{version:2,checkpoint,entry:{hull:100,score:0,maxCombo:1,collected:36},chapter:null,unlockedStage:10,completed:true},
        equipment:NeonCampaign.awardClassicBossWeapon(classicEquipment,'guardian-atlas').equipment});
    },
    // S1-V1 from the entry of a chosen stage, as the stage picker does.
    prepareChronosStage(stage) {
      classicVoyageRequestedStage=stage;startLevel(0);warpTimer=0;spawnTimer=999;classicScoutTimer=999;
      items=[];gates=[];
    },
    prepareFresh(index=0) {
      if(index===0){classicVoyageRecord=null;classicVoyageRequestedStage=1;}
      startLevel(index);warpTimer=0;spawnTimer=999;classicScoutTimer=999;
      classicChapterStory?.skipIntro();classicChapterView=classicChapterStory?.snapshot()||null;
      items=[];gates=[];
    },
    collectEnergy() {
      energySpawned++;
      collectItem({type:'energy',x:player.x,y:player.y-30,r:22});
    },
    queueThresholdCollection() {
      const energy={type:'energy',x:player.x,y:player.y-30,r:22,s:0,rot:0,rs:0,p:0,phase:0,amp:0};
      items=[{...energy,x:60,y:-60},{...energy}];
      energySpawned+=2;
    },
    isolatedFrame(dt=1/60) {
      // This fixture isolates progression, not projectile avoidance or balance.
      items=[];gates=[];spawnTimer=999;classicScoutTimer=999;
      holdAtlasContactFixturePosition();
      if(atlasBoss){player.x=player.target=atlasBoss.x;}
      update(dt);
    },
    pinAtlasContactFixture(){
      if(!atlasBoss)throw new Error('Atlas must exist before isolating its physical pose');
      atlasContactFixturePosition={x:atlasBoss.x,y:atlasBoss.y};holdAtlasContactFixturePosition();
    },
    manualAtlasFrame(dt=1/60) {
      // Deliberately instrumented lifecycle fixture: suppress unrelated
      // obstacles and issue explicit manual triggers at the real core.
      // This is not a balance or natural-input certification.
      items=[];gates=[];spawnTimer=999;classicScoutTimer=999;
      if(atlasBoss){player.x=player.target=atlasBoss.x;
        if(atlasBoss.vulnerability)fireManualShot();}
      update(dt);
    },
    placeShip(x){player.x=player.target=x;},
    setSlow(seconds) { powers.slow=seconds; },
    pilotedAtlasFrame(dt=1/60) {
      // Keep the actual emitted curtains in the real collision/update loop.
      // This instrumented pilot reads visible projectile trajectories, never
      // a hidden/announced safe corridor. It isolates timing, not natural skill.
      const incoming=items.filter(item=>item.guardianProjectile && item.vy>0).map(item=>{
        const tail=Math.max(...SHIP_COLLISION_OUTLINE.map(point=>point[1]));
        const time=(player.y-item.y)/item.vy;
        return item.y-item.r<=player.y+tail && time<2 ?
          {x:item.x+item.vx*Math.max(0,time),r:item.r} : null;
      }).filter(Boolean);
      const lanes=[132,210,285,360,435,510,588];
      let best=360,clearance=-Infinity;
      for(const lane of lanes){
        const distance=incoming.length ? Math.min(...incoming.map(item=>Math.abs(item.x-lane)-item.r)) : 999-Math.abs(lane-360);
        if(distance>clearance){clearance=distance;best=lane;}
      }
      player.x=player.target=best;
      update(dt);
    },
    snapshot:()=>({state,hull,score,collected,side:classicSideVoyage?.ficha.id||null,ammo,manualShotCooldown,currentLevel,runToken,
      elapsed,unlocked:getUnlocked(),stars:getStars(),continued,autoFire:settings.autoFire,slow:powers.slow,
      flight:classicFlightView?{elapsed:classicFlightView.elapsed,stageElapsed:classicFlightView.stageElapsed,canFinish:classicFlightView.canFinish}:null,
      chapter:classicChapterView?JSON.parse(JSON.stringify(classicChapterView)):null,
      salvage:classicSalvageState?JSON.parse(JSON.stringify(classicSalvageState)):null,
      hullReserve:classicHullReserve,
      equipment:{...classicEquipment,unlocked:[...classicEquipment.unlocked]},
      player:{x:player.x,y:player.y,tail:Math.max(...SHIP_COLLISION_OUTLINE.map(point=>point[1]))},
      weapons:classicWeapons?NeonCampaign.classicWeaponSnapshot(classicWeapons):null,
      shots:shots.map(shot=>({kind:shot.kind,damage:shot.damage,atlasPulse:shot.atlasPulse,
        x1:shot.x1,x2:shot.x2,life:shot.life})),
      projectiles:items.filter(item=>item.guardianProjectile).map(item=>({
        id:item.projectileId,attackId:item.attackId,volley:item.volley,
        x:item.x,y:item.y,vx:item.vx,vy:item.vy,r:item.r,life:item.life})),
      atlasExplosions:impactEffects.filter(effect=>effect.atlasExplosion).map(effect=>({x:effect.x,y:effect.y,life:effect.life,duration:effect.duration})),
      shake,
      boss:atlasBoss?JSON.parse(JSON.stringify(atlasBoss)):null})
  };\n`;
  window.eval(game.replace(marker, hook + marker));
  const api = window.__ATLAS_LEGACY_TEST__;
  const snapshot = () => plain(api.snapshot());
  function collectGoal() {
    while (snapshot().collected < 36) api.collectEnergy();
    for(let frame=0;frame<60*40&&!snapshot().boss;frame++)api.isolatedFrame(1/60);
    assert.ok(snapshot().boss, 'The fixture must reach route end plus quota before Atlas starts');
    assert.equal(snapshot().flight.canFinish,true);
    if(!snapshot().side)assert.equal(snapshot().flight.elapsed,360);
    return snapshot();
  }
  // The twenty-round magazine remains finite outside Atlas. During Atlas,
  // basic fire is unlimited but still respects cadence; missiles stay finite.
  // This bounded lifecycle fixture does not certify natural balance.
  function until(predicate, maximum = 60 * 240, shoot = false) {
    for (let frame = 0; frame < maximum; frame++) {
      const q = snapshot(); if (predicate(q)) return q;
      assert.ok(q.state === 'playing' || q.state === 'destroying', `Unexpected fixture state ${q.state}`);
      if(shoot)api.manualAtlasFrame(1 / 60);else api.isolatedFrame(1 / 60);
    }
    assert.fail(`Fixture condition not reached: ${JSON.stringify(snapshot())}`);
  }
  return {window, api, pending, snapshot, collectGoal, until,
    setEquipmentWriteBlocked: value => { equipmentWriteBlocked = value; },
    setSalvageWriteBlocked: value => { salvageWriteBlocked = value; },
    stars: () => JSON.parse(window.localStorage.getItem('neon-stars-v2') || '{}')};
}

test('chapter one completes with the recovered CRONIUM and the real route arrival, without Atlas', t => {
  const h = harness(t); h.api.prepare();
  assert.equal(h.snapshot().currentLevel,0);assert.equal(h.snapshot().side,null);
  assert.equal(h.snapshot().flight.elapsed,324);
  assert.equal(h.snapshot().collected,32);
  for (let index = 0; index < 4; index++) h.api.collectEnergy();
  let q = h.snapshot();
  assert.equal(q.collected,36);assert.equal(q.boss,null);assert.equal(q.state,'playing','Quota alone cannot skip the journey');
  h.api.completeLevel();assert.equal(h.snapshot().state,'playing','A direct call cannot finish before the real arrival');
  assert.equal(q.unlocked,1);assert.deepEqual(h.stars(),{});
  let sawAtlas=false;
  for(let frame=0;frame<60*40&&h.snapshot().state==='playing';frame++){h.api.isolatedFrame(1/60);sawAtlas=sawAtlas||Boolean(h.snapshot().boss);}
  q=h.snapshot();
  assert.equal(q.state,'complete');assert.equal(sawAtlas,false,'Atlas only warns from afar in S1-V1');
  assert.equal(q.flight.canFinish,true);assert.equal(q.flight.elapsed,360);
  assert.equal(q.unlocked,2);assert.ok(h.stars()['1']>=1);
  assert.equal(JSON.parse(h.window.localStorage.getItem('neonCronium.chronosVoyage.v2')).completed,true);
  assert.deepEqual(q.equipment.unlocked,['pulse'],'Gemelo is authorized in S1-V5, not here');
  assert.equal(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'),null);
  assert.equal(h.window.document.getElementById('completeTitle').textContent,'Has escapado de Chronos');
  const message=h.window.document.getElementById('unlockMessage').textContent;
  assert.doesNotMatch(message,/Gemelo|paso libre|Vulkar/,'The Iria epilogue and the cannon belong to S1-V5');
  assert.match(message,/Atlas/,'The arrival message points toward the S1-V5 encounter');
  const chapter=q.chapter;
  for(const id of ['atlas-entry','atlas-phase-two','atlas-log-verified','iria-identification','vulkar-lead'])
    assert.equal(chapter.eventIds.includes(`chapter1:${id}`),false,`${id} never fires in S1-V1`);
  for(const id of ['atlas-border','forged-identity'])
    assert.equal(chapter.eventIds.includes(`chapter1:${id}`),true,`${id} still warns from afar`);
  assert.deepEqual(chapter.signalIds.filter(name=>name.startsWith('atlas')),[]);
  const receipt=JSON.parse(h.window.localStorage.getItem('neon-unlocked-v2:completion-journal:v1'));
  assert.equal(receipt.phase,'committed');assert.equal(receipt.equipment,undefined,'The S1-V1 journal carries no equipment');
  h.api.completeLevel();assert.equal(h.snapshot().unlocked,2);
  assert.equal(h.pending.size,1,'The existing legacy RAF remains the only owner');
});

test('S1-V5 gates Atlas behind both recovered CRONIUM and the real route arrival', t => {
  const h = harness(t); h.api.prepareAtlasVoyage();
  assert.equal(h.snapshot().side,'S1-V5');assert.equal(h.snapshot().collected,32);
  for (let index = 0; index < 3; index++) h.api.collectEnergy();
  let q = h.snapshot();
  assert.equal(q.collected,35); assert.equal(q.boss,null); assert.equal(q.state,'playing');
  h.api.collectEnergy();q=h.snapshot();
  assert.equal(q.collected,36);assert.equal(q.boss,null,'Quota alone cannot skip the journey');
  h.api.completeLevel();assert.equal(h.snapshot().state,'playing');
  h.collectGoal();q=h.snapshot();
  assert.ok(q.boss);assert.equal(q.flight.canFinish,true);
  assert.equal(q.boss.state,'entry');assert.equal(q.boss.hp,96);assert.equal(q.boss.hp,q.boss.maxHp);
  assert.equal(q.unlocked,1);assert.equal(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')===null||
    JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')).completed===false,true);
  const age=q.boss.age;
  h.api.completeLevel();h.api.completeLevel();q=h.snapshot();
  assert.equal(q.state,'playing');assert.equal(q.boss.age,age);
  // Calling completion twice mid-fight saves no progress and grants no weapon.
  assert.equal(JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')||'null')?.completed===true,false);
  assert.deepEqual(q.equipment.unlocked,['pulse']);
  assert.equal(h.pending.size,1,'The existing legacy RAF remains the only owner');
});

test('the actual legacy pause freezes Atlas and resume continues without a duplicate loop', t => {
  const h = harness(t); h.api.prepareAtlasVoyage(); h.collectGoal();
  h.until(q => q.boss.state === 'charge');
  h.api.pauseGame(); const before = h.snapshot();
  for (let frame = 0; frame < 120; frame++) h.api.update(1 / 60);
  const after = h.snapshot();
  assert.equal(after.state, 'paused'); assert.equal(after.elapsed, before.elapsed);
  assert.deepEqual(after.boss, before.boss); assert.equal(after.unlocked, 1);
  assert.deepEqual(after.weapons, before.weapons);
  assert.deepEqual(after.shots, before.shots);
  h.api.resumeGame(); h.api.isolatedFrame(1 / 60);
  assert.ok(h.snapshot().boss.age > before.boss.age);
  assert.equal(h.pending.size, 1);
});

test('the final quota capture and route arrival keep the actual collision loop safe', t => {
  // S1-V5: the threshold capture at the arrival starts Atlas inside the loop.
  const h=harness(t);h.api.prepareAtlasVoyage();
  for(let index=0;index<3;index++)h.api.collectEnergy();
  h.until(q=>q.flight.stageElapsed===32);
  assert.equal(h.snapshot().flight.canFinish,false);
  assert.equal(h.snapshot().collected,35);
  h.api.queueThresholdCollection();
  assert.doesNotThrow(()=>h.api.update(1/60));
  assert.doesNotThrow(()=>h.api.update(1/60));
  let q=h.snapshot();
  assert.equal(q.collected,36);assert.equal(q.state,'playing');assert.ok(q.boss);
  assert.equal(q.unlocked,1);assert.equal(h.pending.size,1);
  // S1-V1: the same capture at the arrival completes the voyage, without Atlas.
  const v1=harness(t);v1.api.prepare();
  for(let index=0;index<3;index++)v1.api.collectEnergy();
  v1.until(q=>q.flight.stageElapsed===36);
  assert.equal(v1.snapshot().flight.canFinish,false);assert.equal(v1.snapshot().collected,35);
  v1.api.queueThresholdCollection();
  assert.doesNotThrow(()=>v1.api.update(1/60));
  assert.doesNotThrow(()=>v1.api.update(1/60));
  q=v1.snapshot();
  assert.equal(q.collected,36);assert.equal(q.state,'complete');assert.equal(q.boss,null);
  assert.equal(q.unlocked,2);assert.equal(v1.pending.size,1);
});

test('Atlas deactivation completes before a single persisted victory and preserves N-7 saves', t => {
  const h = harness(t); h.api.prepareAtlasVoyage(); h.collectGoal();
  const voyageDone=()=>JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')||'null')?.completed===true;
  const terminal = h.until(q => q.boss?.disabled, 60 * 240, true);
  assert.equal(terminal.state, 'playing', 'Shutdown animation must finish before victory');
  assert.equal(terminal.boss.resolved,false);assert.equal(voyageDone(),false);
  assert.deepEqual(terminal.equipment.unlocked, ['pulse'], 'The reward must wait for the authored terminal event');
  h.api.completeLevel();h.api.completeLevel();
  assert.equal(h.snapshot().state,'playing','A direct call cannot bypass the real shutdown');
  const finished = h.until(q => q.state === 'complete');
  assert.equal(voyageDone(),true);
  assert.ok(JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')).stars>=1);
  assert.ok(finished.equipment.unlocked.includes('twin'), 'Atlas grants the actual Gemelo reward');
  assert.equal(finished.equipment.unlocked.includes('lance'), false, 'Atlas does not grant every future weapon');
  assert.equal(finished.unlocked,1,'S1-V5 does not touch the S1-V1 campaign keys');
  const equipmentSave = h.window.localStorage.getItem('neonCronium.flightEquipment.v1');
  const voyageSave = h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1');
  const score = finished.score;
  const games = h.window.localStorage.getItem('neon-games-v2');
  h.api.completeLevel(); h.api.completeLevel();
  for (let frame = 0; frame < 120; frame++) h.api.update(1 / 60);
  assert.equal(h.snapshot().score, score);
  assert.equal(h.window.localStorage.getItem('neon-games-v2'), games);
  assert.equal(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1'), voyageSave);
  assert.equal(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'), equipmentSave,
    'Repeated completion cannot duplicate or reselect the weapon reward');
  assert.equal(h.window.localStorage.getItem('neon-n7-unlocked-v1'), '37');
  assert.equal(h.window.localStorage.getItem('neon-n7-best-v1'), '2037');
  assert.equal(h.pending.size, 1);
});

test('death, a rewarded continuation and retry cannot bypass or prematurely save Atlas', t => {
  const h = harness(t); h.api.prepareAtlasVoyage(); h.collectGoal();
  const voyageDone=()=>JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')||'null')?.completed===true;
  h.until(q => q.boss.state === 'exposed');
  const before = h.snapshot();
  h.api.damageShip(1000); h.until(q => q.state === 'gameover', 180);
  assert.equal(voyageDone(),false);assert.deepEqual(h.snapshot().equipment.unlocked,['pulse']);
  assert.equal(h.api.resumeReward(), true);
  const continued = h.snapshot();
  assert.equal(continued.state, 'playing'); assert.equal(continued.continued, true);
  assert.ok(continued.boss, 'Rewarded continuation must not lose the blocking encounter');
  assert.equal(continued.boss.hp, before.boss.hp);
  assert.equal(continued.collected, 36); assert.equal(voyageDone(),false);
  h.api.completeLevel(); assert.equal(h.snapshot().state, 'playing');
  h.api.prepareAtlasVoyage(1); const restarted = h.snapshot();
  assert.equal(restarted.side,'S1-V5');
  assert.equal(restarted.boss, null); assert.equal(restarted.collected, 0);
  assert.equal(restarted.hull, 100); assert.equal(restarted.continued, false);
  assert.equal(voyageDone(),false);assert.deepEqual(restarted.equipment.unlocked,['pulse']);
  assert.equal(h.pending.size, 1);
});

test('twenty rounds refill in played time outside Atlas while only the boss permits unlimited basic fire', t => {
  const h=harness(t);h.api.prepareAtlasVoyage();
  assert.equal(h.window.document.getElementById('atlasAutoFire'),null);
  assert.equal(h.snapshot().autoFire,false);
  assert.equal(h.snapshot().boss,null);assert.equal(h.snapshot().weapons.unlimitedFire,false);
  let emitted=0;
  while(h.snapshot().ammo>0&&emitted<40){
    assert.equal(h.api.fireManualShot(),true,`Manual pulse ${emitted+1} was unavailable`);emitted++;
    if(h.snapshot().ammo>0)for(let frame=0;frame<20;frame++)h.api.isolatedFrame(1/60);
  }
  assert.ok(emitted>=20&&emitted<40,'Gradual recharge may contribute rounds during a finite burst');
  assert.equal(h.snapshot().state,'playing');assert.equal(h.snapshot().ammo,0);
  assert.equal(h.api.fireManualShot(),false);assert.equal(h.snapshot().weapons.shotSequence,emitted);
  assert.equal(h.window.document.getElementById('ammo').textContent,'');
  assert.doesNotMatch(h.window.document.getElementById('fire').getAttribute('aria-label'),/\d|segundos|cargas/i);
  const depleted=h.snapshot();h.api.pauseGame();
  for(let frame=0;frame<600;frame++)h.api.update(1/60);
  assert.deepEqual(h.snapshot().weapons,depleted.weapons,'Pause cannot refill the finite magazine');
  h.api.resumeGame();
  while(h.snapshot().weapons.recharge+1/60<h.snapshot().weapons.rechargeSeconds-1e-8)h.api.isolatedFrame(1/60);
  assert.equal(h.snapshot().ammo,0);assert.equal(h.api.fireManualShot(),false);
  h.api.isolatedFrame(1/60);assert.equal(h.snapshot().ammo,1);
  assert.equal(h.snapshot().weapons.shotSequence,emitted,'Recovery cannot silently fire');
  assert.equal(h.api.fireManualShot(),true);assert.equal(h.snapshot().ammo,0);
  assert.equal(h.snapshot().weapons.shotSequence,emitted+1);
  h.collectGoal();
  const bossMagazine=h.snapshot().weapons.charges,bossRecharge=h.snapshot().weapons.recharge;
  assert.equal(h.snapshot().weapons.unlimitedFire,true);
  for(let shot=0;shot<24;shot++){
    while(h.snapshot().weapons.cooldown>1e-9)h.api.isolatedFrame(1/60);
    assert.equal(h.api.fireManualShot(),true,`Unlimited basic pulse ${shot+1}`);
    for(let frame=0;frame<20;frame++)h.api.isolatedFrame(1/60);
  }
  assert.equal(h.snapshot().weapons.charges,bossMagazine,'Boss basic fire cannot consume or refill the stored magazine');
  assert.equal(h.snapshot().weapons.recharge,bossRecharge,'Unlimited boss fire preserves the exact finite-magazine recovery boundary');
  assert.equal(h.snapshot().salvage.missileAmmo,3,'Basic fire does not create or spend special missiles');
  h.api.prepareFresh();
  assert.equal(h.snapshot().weapons.unlimitedFire,false);
  assert.equal(h.snapshot().weapons.charges,20);
});

// Lanza salió con dec-armas-plan (01/11/2026): quedan Pulso y Gemelo.
test('Atlas receives the advertised ×1 and ×2 damage only when physical projectiles reach its core', t => {
  for (const [selected, multiplier, bolts] of [['pulse', 1, 1], ['twin', 2, 2]]) {
    const saved = JSON.stringify({version: 1, recoveredTwin: selected !== 'pulse',
      unlocked: selected === 'pulse' ? ['pulse'] : selected === 'twin' ? ['pulse', 'twin'] : ['pulse', 'twin', 'lance'],
      selected, ...(selected === 'lance' ? {lanceCalibrated: true} : {})});
    const h = harness(t, '', {saved}); h.api.prepareAtlasVoyage(); h.collectGoal();
    assert.equal(h.snapshot().autoFire, false);
    h.until(q => q.boss.state === 'exposed' && q.boss.vulnerability);
    h.api.pinAtlasContactFixture();
    const before = h.snapshot();
    assert.equal(before.weapons.damageMultiplier, multiplier);
    assert.equal(h.window.document.getElementById('flightWeaponDamage').textContent, `DAÑO ×${multiplier}`);
    assert.equal(h.window.document.getElementById('flightHud').classList.contains('hidden'), false);
    assert.equal(h.window.document.getElementById('flightRoute').classList.contains('hidden'), true);
    assert.equal(h.api.fireManualShot(), true);
    const fired = h.snapshot();
    assert.equal(fired.boss.hp, before.boss.hp, 'Damage must wait for the actual projectile impact');
    assert.equal(fired.shots.filter(shot => shot.atlasPulse).length, 0,
      'A physical trigger must not also create a homing ray');
    assert.equal(fired.weapons.projectiles.length, bolts);
    assert.equal(fired.weapons.projectiles.reduce((total, shot) => total + shot.damage, 0), multiplier);
    assert.equal(fired.weapons.charges, before.weapons.charges, 'Only basic boss fire is unlimited');
    assert.equal(fired.weapons.shotSequence, before.weapons.shotSequence + 1);
    for(const shot of fired.weapons.projectiles) {
      assert.ok(shot.vy<0);assert.ok(Math.abs(shot.vx)<1e-6);
    }
    assert.equal(h.api.fireManualShot(), false, 'A second same-frame trigger cannot duplicate the volley');
    const impact = h.until(q => q.boss.hp < before.boss.hp, 120);
    assert.equal(impact.boss.hp, before.boss.hp - multiplier);
    assert.equal(impact.shots.length, 0);
    assert.equal(impact.weapons.projectiles.length, selected==='lance'?1:0);
    if(selected==='lance') {
      assert.equal(impact.weapons.projectiles[0].pierce,1);
      assert.equal(impact.weapons.projectiles[0].hitTargets.length,1,
        'A piercing lance remembers Atlas so crossing its circle cannot apply damage twice');
    }
    for (let frame = 0; frame < 30; frame++) h.api.isolatedFrame(1 / 60);
    assert.equal(h.snapshot().boss.hp, impact.boss.hp, 'A completed projectile cannot apply its damage again');
    assert.equal(h.snapshot().weapons.shotSequence, fired.weapons.shotSequence);
    assert.equal(h.pending.size, 1);
  }
});

test('closed armor rejects physical fire and an exposed small core does not accept a wing hit', t => {
  const h=harness(t);h.api.prepareAtlasVoyage();h.collectGoal();
  h.until(q=>q.boss.state==='closed');
  h.api.pinAtlasContactFixture();
  const armored=h.snapshot();
  assert.equal(armored.boss.vulnerability,false);assert.equal(armored.boss.armorClosed,true);
  assert.ok(armored.boss.coreRadius<=42&&armored.boss.coreRadius<armored.boss.r);
  assert.equal(h.api.fireManualShot(),true);
  h.until(q=>q.weapons.projectiles.length===0,180);
  assert.equal(h.snapshot().boss.hp,armored.boss.hp,'Armored body contact cannot damage the hidden core');
  h.until(q=>q.boss.state==='exposed');
  const exposed=h.snapshot();
  assert.equal(exposed.boss.armorClosed,false);assert.equal(exposed.boss.coreExposure,1);
  h.api.placeShip(exposed.boss.x+exposed.boss.coreRadius+24);
  const offset=h.snapshot().player.x-exposed.boss.x;
  assert.ok(offset>exposed.boss.coreRadius+9&&offset<exposed.boss.r,
    'The test must target the illustrated outer body outside the actual core');
  assert.equal(h.api.fireManualShot(),true);
  h.until(q=>q.weapons.projectiles.length===0,180);
  assert.equal(h.snapshot().boss.hp,exposed.boss.hp,'A body-width shot cannot count as a core hit');
  assert.equal(h.pending.size,1);
});

test('three persistent special missiles deal eighteen damage and a failed debit cannot emit one', t => {
  const h=harness(t);h.api.prepare();
  assert.equal(h.snapshot().salvage.missileAmmo,3);
  const magazine=h.snapshot().weapons.charges;
  h.setSalvageWriteBlocked(true);
  assert.equal(h.api.fireClassicMissile(),false);
  assert.equal(h.snapshot().salvage.missileAmmo,3);
  assert.equal(h.snapshot().weapons.projectiles.filter(shot=>shot.missile).length,0);
  h.setSalvageWriteBlocked(false);
  for(let shot=0;shot<3;shot++){
    assert.equal(h.api.fireClassicMissile(),true);
    const q=h.snapshot(),latest=q.weapons.projectiles.filter(value=>value.missile).at(-1);
    assert.ok(latest);assert.equal(latest.damage,18);assert.ok(latest.vy<0);assert.ok(Math.abs(latest.vx)<1e-6);
    assert.equal(q.salvage.missileAmmo,2-shot);assert.equal(q.weapons.charges,magazine);
    assert.equal(h.api.fireClassicMissile(),false,'A same-frame trigger cannot debit or emit twice');
    for(let frame=0;frame<45;frame++)h.api.isolatedFrame(1/60);
  }
  assert.equal(h.api.fireClassicMissile(),false);
  const record=JSON.parse(h.window.localStorage.getItem('neonCronium.classicSalvage.v1'));
  assert.equal(record.missileAmmo,0);assert.equal(record.missileShotsSpent,3);
  const restored=harness(t,'',{storageEntries:Object.entries(h.window.localStorage)});
  restored.api.prepare();
  assert.equal(restored.snapshot().salvage.missileAmmo,0,'Reloading or restarting cannot replenish spent specials');
  assert.equal(restored.api.fireClassicMissile(),false);
  assert.equal(restored.pending.size,1);
});

test('manual is the default and automatic fire is an explicit persistent setting outside the encounter', t => {
  const h=harness(t);h.api.prepareAtlasVoyage();h.collectGoal();
  assert.equal(h.snapshot().autoFire,false);
  assert.equal(h.window.document.getElementById('atlasAutoFire'),null);
  const setting=h.window.document.getElementById('autoFire');
  assert.ok(setting,'Settings retains the opt-in accessible automatic-fire choice');
  assert.equal(setting.checked,false);
  h.until(q=>q.boss.age>6);
  assert.equal(h.snapshot().weapons.shotSequence,0,'Waiting in front of the guardian must not fire automatically');
  assert.equal(h.snapshot().boss.hp,h.snapshot().boss.maxHp);
  setting.click();assert.equal(h.snapshot().autoFire,true);
  const savedSettings=h.window.localStorage.getItem('neon-settings-v5');
  assert.equal(JSON.parse(savedSettings).autoFire,true);
  const reloaded=harness(t,'',{savedSettings});
  assert.equal(reloaded.snapshot().autoFire,true);
  assert.equal(reloaded.window.document.getElementById('autoFire').checked,true);
  reloaded.window.document.getElementById('autoFire').click();
  assert.equal(reloaded.snapshot().autoFire,false);
  assert.equal(JSON.parse(reloaded.window.localStorage.getItem('neon-settings-v5')).autoFire,false);
});

test('a manual off-axis shot keeps its own trajectory and misses Atlas instead of homing or applying instant damage', t => {
  const h=harness(t);h.api.prepareAtlasVoyage();h.collectGoal();h.until(q=>q.boss.vulnerability);
  h.api.placeShip(h.snapshot().boss.x<360?601:119);const before=h.snapshot();
  assert.ok(Math.abs(before.player.x-before.boss.x)>115);
  assert.equal(h.api.fireManualShot(),true,'Firing is not disabled by an artificial boss-alignment gate');
  const fired=h.snapshot();assert.equal(fired.weapons.charges,before.weapons.charges);
  assert.equal(fired.boss.hp,before.boss.hp);assert.equal(fired.shots.length,0);
  assert.equal(fired.weapons.projectiles.length,1);
  const origin=fired.weapons.projectiles[0];
  for(let frame=0;frame<12;frame++)h.api.isolatedFrame(1/60);
  const travelling=h.snapshot();
  assert.ok(travelling.weapons.projectiles[0].y<origin.y-100);
  assert.ok(Math.abs(travelling.weapons.projectiles[0].x-origin.x)<1e-6,
    'Moving the ship back toward Atlas cannot steer an already fired projectile');
  for(let frame=0;frame<100;frame++)h.api.isolatedFrame(1/60);
  assert.equal(h.snapshot().boss.hp,before.boss.hp);
  assert.equal(h.snapshot().weapons.shotSequence,1);
});

test('an old pending S1-V1 journal that carries the Atlas reward recovers on boot without losing or duplicating Gemelo', t => {
  // C · A victory saved by an earlier build was interrupted before its
  // equipment write. The journal on disk still carries completion + Gemelo.
  const h=harness(t,'',{failEquipmentWrite:true});
  const result=h.window.eval('window.__ATLAS_LEGACY_TEST__').writeLegacyAtlasJournal();
  assert.equal(result.ok,false,'The fixture interrupts the old reward write');
  const journalKey='neon-unlocked-v2:completion-journal:v1';
  const pending=JSON.parse(h.window.localStorage.getItem(journalKey));
  assert.equal(pending.phase,'pending');assert.ok(pending.equipment.after.unlocked.includes('twin'));
  assert.equal(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'),null);
  const restored=harness(t,'',{storageEntries:Object.entries(h.window.localStorage)});
  assert.equal(restored.snapshot().unlocked,2,'The old S1-V1 completion is kept');
  assert.deepEqual(restored.snapshot().equipment.unlocked,['pulse','twin'],'The old Gemelo reward is kept');
  assert.equal(JSON.parse(restored.window.localStorage.getItem('neonCronium.chronosVoyage.v2')).completed,true);
  const receipt=JSON.parse(restored.window.localStorage.getItem(journalKey));
  assert.equal(receipt.phase,'committed');assert.equal(receipt.id,pending.id);
  const saved=Object.fromEntries(Object.entries(restored.window.localStorage));
  const again=harness(t,'',{storageEntries:Object.entries(saved)});
  assert.equal(again.snapshot().unlocked,2);
  assert.equal(again.window.localStorage.getItem('neonCronium.flightEquipment.v1'),saved['neonCronium.flightEquipment.v1']);
  assert.equal(again.window.localStorage.getItem(journalKey),saved[journalKey]);
  // Winning S1-V5 later cannot add a second copy nor announce it again.
  winAtlasVoyage(again);
  assert.deepEqual(JSON.parse(again.window.localStorage.getItem('neonCronium.flightEquipment.v1')).unlocked,['pulse','twin']);
  assert.deepEqual(JSON.parse(again.window.localStorage.getItem('neonCronium.flightEquipment.v1')).bossRewards,['guardian-atlas']);
  assert.doesNotMatch(again.window.document.getElementById('unlockMessage').textContent,/Gemelo/);
  assert.equal(again.window.localStorage.getItem('neon-n7-unlocked-v1'),'37');
  assert.equal(again.window.localStorage.getItem('neon-n7-best-v1'),'2037');
  assert.equal(again.pending.size,1);
});

test('a corrupt equipment record no longer blocks S1-V1, which completes without touching it', t => {
  const corrupt='{interrupted equipment record';
  const h=harness(t,'',{saved:corrupt});
  const equipmentKey='neonCronium.flightEquipment.v1',backupKey=equipmentKey+':invalid-backups';
  assert.equal(h.window.localStorage.getItem(equipmentKey),corrupt,
    'Boot must preserve the damaged record until its recovery is needed');
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(backupKey)),[corrupt]);
  h.api.prepare();
  while(h.snapshot().collected<36)h.api.collectEnergy();
  const finished=h.until(q=>q.state==='complete');
  assert.equal(finished.boss,null);assert.equal(finished.unlocked,2);
  assert.equal(h.window.localStorage.getItem(equipmentKey),corrupt,'S1-V1 has no reward to write, so the damaged record stays as it was');
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(backupKey)),[corrupt],'The exact original damaged record is backed up once');
  const receipt=JSON.parse(h.window.localStorage.getItem('neon-unlocked-v2:completion-journal:v1'));
  assert.equal(receipt.phase,'committed');assert.equal(receipt.equipment,undefined);
  assert.equal(h.window.localStorage.getItem('neon-n7-unlocked-v1'),'37');
  assert.equal(h.window.localStorage.getItem('neon-n7-best-v1'),'2037');
  assert.equal(h.pending.size,1);
});

test('leaving the encounter does not mutate saves', t => {
  const h = harness(t); h.api.prepareAtlasVoyage(); h.collectGoal();
  const before=Object.fromEntries(Object.entries(h.window.localStorage));
  h.api.goHome();
  assert.equal(h.snapshot().state, 'menu'); assert.equal(h.snapshot().unlocked, 1);
  assert.equal(h.snapshot().side,null);
  assert.deepEqual(h.stars(), {});
  assert.deepEqual(Object.fromEntries(Object.entries(h.window.localStorage)),before);
  assert.equal(h.pending.size, 1);
});

test('Gaia remains playable without spawning a second copy of the chapter-one guardian', t => {
  const h=harness(t,'',{storageEntries:[['neon-unlocked-v2','2']]});h.api.prepare(1);
  assert.equal(h.snapshot().currentLevel,1);assert.equal(h.snapshot().boss,null);
  assert.equal(h.snapshot().weapons.unlimitedFire,false);
  for(let index=0;index<45;index++)h.api.collectEnergy();
  assert.equal(h.snapshot().boss,null,'Gaia completion must not duplicate Atlas after its frontier resolution');
  assert.equal(h.snapshot().state,'complete');assert.equal(h.snapshot().unlocked,3);
  assert.equal(h.window.localStorage.getItem('neon-n7-unlocked-v1'),'37');
  assert.equal(h.pending.size,1);
});

test('slow time shares the real Atlas and projectile clock before firing another aimed pattern', t => {
  const h = harness(t); h.api.prepareAtlasVoyage(); h.collectGoal();
  h.until(q => q.boss.phase === 2, 60 * 240, true);
  h.api.setSlow(120);
  const initial = h.snapshot();
  for (let frame = 0; frame < 60; frame++) h.api.pilotedAtlasFrame(1 / 60);
  const oneSecond = h.snapshot();
  assert.ok(Math.abs(oneSecond.elapsed - initial.elapsed - 1) < 1e-8);
  assert.ok(Math.abs(oneSecond.boss.age - initial.boss.age - .5) < 1e-8,
    'The existing slow ability must slow the encounter clock as well as its bullets');

  let firstAttack = null, nextWarning = null, measuredBulletStep = false;
  const volleys = new Set(), emittedIds = new Set(), clearedIds = new Set(), vanished = [];
  for (let frame = 0; frame < 60 * 35 && !nextWarning; frame++) {
    const before = h.snapshot();
    h.api.pilotedAtlasFrame(1 / 60);
    const after = h.snapshot();
    assert.equal(after.state, 'playing', 'The instrumented visible-projectile pilot must retain a usable response');
    for (const bullet of after.projectiles) {
      if (firstAttack === null) firstAttack = bullet.attackId;
      if (bullet.attackId === firstAttack) {
        volleys.add(bullet.volley);emittedIds.add(bullet.id);
        if(bullet.y-bullet.r>after.player.y+after.player.tail)clearedIds.add(bullet.id);
      }
      const earlier = before.projectiles.find(item => item.id === bullet.id);
      if (earlier) {
        assert.ok(Math.abs(bullet.y - earlier.y - bullet.vy / 120) < 1e-8,
          'The real emitted salvo uses the same half-speed clock');
        measuredBulletStep = true;
      }
    }
    for(const bullet of before.projectiles.filter(item=>item.attackId===firstAttack)) {
      if(!after.projectiles.some(item=>item.id===bullet.id))vanished.push({bullet,hullBefore:before.hull,hullAfter:after.hull,player:after.player,bossAge:after.boss.age});
    }
    if (firstAttack !== null && after.boss.state === 'charge' && after.boss.attackId > firstAttack) {
      nextWarning = after;
    }
  }
  assert.ok(measuredBulletStep, 'The test must observe actual projectile movement');
  // v8 picks the first phase-two routine with more randomness (two or three salvos):
  // every scheduled salvo of that routine must still be emitted in order.
  const salvos = [...volleys].sort();
  assert.ok(salvos.length >= 2 && salvos.every((volley, index) => volley === index),
    `All adaptive phase-two salvos must be emitted: ${salvos}`);
  assert.ok(nextWarning, 'The encounter must progress to its next attack preparation under slow time');
  assert.ok(emittedIds.size>0);
  assert.deepEqual([...clearedIds].sort(),[...emittedIds].sort(),
    `Every actual previous projectile must be observed passing the full tail before another pattern is prepared; vanished=${JSON.stringify(vanished)}`);
  assert.equal(h.pending.size, 1);
});

test('winning Atlas in S1-V5 completes the map voyage without an exception in the same frame', t => {
  const h=harness(t);
  h.api.prepareAtlasVoyage();assert.equal(h.snapshot().side,'S1-V5');
  h.collectGoal();
  h.until(q=>q.boss?.disabled,60*240,true);
  const finished=h.until(q=>q.state==='complete');
  assert.equal(finished.boss,null,'The victory retires Atlas inside its own event');
  assert.equal(JSON.parse(h.window.localStorage.getItem('neonCronium.voyage.S1-V5.v1')).completed,true);
  for(let frame=0;frame<30;frame++)h.api.update(1/60);
  assert.equal(h.snapshot().state,'complete');assert.equal(h.pending.size,1);
});

// B · S1-V5: Atlas se combate en el viaje del mapa y su victoria autoriza el Gemelo.
const S1V5_KEY='neonCronium.voyage.S1-V5.v1',EQUIPMENT_KEY='neonCronium.flightEquipment.v1';
const completeText=h=>({title:h.window.document.getElementById('completeTitle').textContent,
  message:h.window.document.getElementById('unlockMessage').textContent});
const s1v5Done=h=>JSON.parse(h.window.localStorage.getItem(S1V5_KEY)||'null')?.completed===true;
function winAtlasVoyage(h) {
  h.api.prepareAtlasVoyage();assert.equal(h.snapshot().side,'S1-V5');
  const before=h.snapshot().equipment.unlocked;
  h.collectGoal();
  h.until(q=>q.boss?.disabled,60*240,true);
  assert.deepEqual(h.snapshot().equipment.unlocked,before,'The reward waits for the authored terminal event');
  return h.until(q=>q.state==='complete');
}

test('S1-V5 Atlas victory grants Gemelo once, shows Iria\'s epilogue and replaying it duplicates nothing', t => {
  const h=harness(t);
  const finished=winAtlasVoyage(h);
  assert.ok(finished.equipment.unlocked.includes('twin'),'Atlas in S1-V5 grants the actual Gemelo reward');
  assert.equal(finished.equipment.unlocked.includes('lance'),false,'Atlas does not grant every future weapon');
  assert.equal(finished.equipment.selected,'pulse','Winning never switches the equipped weapon');
  const saved=JSON.parse(h.window.localStorage.getItem(EQUIPMENT_KEY));
  assert.deepEqual(saved.unlocked,['pulse','twin']);assert.deepEqual(saved.bossRewards,['guardian-atlas']);
  assert.equal(s1v5Done(h),true);
  const first=completeText(h);
  assert.equal(first.title,'Atlas ha abierto el paso');
  assert.match(first.message,/Usaron tu señal para atacar Chronos/);
  assert.match(first.message,/El convoy vino de Vulkar\. Tienes paso libre\./);
  assert.match(first.message,/Gemelo ×2/,'The first victory announces the second cannon');
  assert.match(first.message,/ Siguiente: S1-V1 · /,'The usual next-voyage hint follows the epilogue (S1-V1 is still pending in this fixture)');
  assert.equal(h.window.localStorage.getItem('neon-unlocked-v2'),'1','S1-V5 never touches the S1-V1 progress');
  const equipmentSave=h.window.localStorage.getItem(EQUIPMENT_KEY);
  winAtlasVoyage(h);
  // A replay may rewrite the same record (key order can change); its content must not.
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(EQUIPMENT_KEY)),JSON.parse(equipmentSave),'Replaying S1-V5 cannot duplicate the reward');
  const again=completeText(h);
  assert.equal(again.title,'Atlas ha abierto el paso');
  assert.doesNotMatch(again.message,/Gemelo/,'Only the first victory announces the cannon');
  assert.match(again.message,/Tienes paso libre/);
  assert.equal(h.window.localStorage.getItem('neon-n7-unlocked-v1'),'37');
  assert.equal(h.pending.size,1);
});

test('a corrupt equipment record with a durable backup receives the S1-V5 Atlas reward without losing its original data', t => {
  const corrupt='{interrupted equipment record';
  const h=harness(t,'',{saved:corrupt});
  const backupKey=EQUIPMENT_KEY+':invalid-backups';
  assert.equal(h.window.localStorage.getItem(EQUIPMENT_KEY),corrupt,'Boot must preserve the damaged record until its recovery is needed');
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(backupKey)),[corrupt]);
  h.api.prepareAtlasVoyage();h.collectGoal();
  h.until(q=>q.boss?.disabled,60*240,true);
  assert.equal(h.window.localStorage.getItem(EQUIPMENT_KEY),corrupt,'The terminal animation must not replace equipment early');
  const victory=h.until(q=>q.state==='complete');
  assert.ok(victory.equipment.unlocked.includes('twin'));
  const saved=JSON.parse(h.window.localStorage.getItem(EQUIPMENT_KEY));
  assert.equal(saved.version,1);assert.deepEqual(saved.unlocked,['pulse','twin']);
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(backupKey)),[corrupt],'Recovery retains the exact original damaged record, once');
  assert.equal(s1v5Done(h),true);
  assert.equal(h.pending.size,1);
});

test('without a durable backup of a corrupt equipment record S1-V5 writes nothing, warns and stays pending', t => {
  const corrupt='{interrupted equipment record';
  // The backup write itself is refused, so the damaged bytes have no copy.
  const h=harness(t,'',{saved:corrupt,failBackupWrite:true});
  assert.equal(h.window.localStorage.getItem(EQUIPMENT_KEY+':invalid-backups'),null);
  winAtlasVoyage(h);
  assert.equal(h.window.localStorage.getItem(EQUIPMENT_KEY),corrupt,'Without a backup the damaged record is never overwritten');
  assert.equal(s1v5Done(h),false,'S1-V5 is not marked done without its saved weapon');
  assert.equal(completeText(h).title,'Atlas ha abierto el paso');
  assert.match(completeText(h).message,/No se pudo guardar el segundo cañón/);
  assert.equal(h.pending.size,1);
});

test('an interrupted S1-V5 equipment write keeps the voyage pending and a later victory grants Gemelo exactly once', t => {
  const h=harness(t,'',{failEquipmentWrite:true});
  winAtlasVoyage(h);
  assert.equal(h.window.localStorage.getItem(EQUIPMENT_KEY),null);
  assert.deepEqual(h.snapshot().equipment.unlocked,['pulse']);
  assert.equal(s1v5Done(h),false);
  assert.match(completeText(h).message,/No se pudo guardar el segundo cañón/);
  h.setEquipmentWriteBlocked(false);
  winAtlasVoyage(h);
  assert.deepEqual(JSON.parse(h.window.localStorage.getItem(EQUIPMENT_KEY)).unlocked,['pulse','twin']);
  assert.equal(s1v5Done(h),true);
  assert.match(completeText(h).message,/Gemelo ×2/);
  const restored=harness(t,'',{storageEntries:Object.entries(h.window.localStorage)});
  assert.deepEqual(restored.snapshot().equipment.unlocked,['pulse','twin'],'The reward survives a reload');
  assert.equal(restored.pending.size,1);
});

test('S1-V5 Atlas health still scales with the difficulty mode', t => {
  const expected={facil:Math.round(96*.67),normal:96,hardcore:Math.round(96*1.3)};
  for(const [difficulty,maxHp] of Object.entries(expected)) {
    const h=harness(t,'',{savedSettings:JSON.stringify({difficulty})});
    h.api.prepareAtlasVoyage();const boss=h.collectGoal().boss;
    assert.equal(boss.maxHp,maxHp,`${difficulty} scales Atlas`);assert.equal(boss.hp,maxHp);
  }
});

// C · Guardados de builds anteriores, donde Atlas cerraba S1-V1.
function oldVictoryChapter() {
  // The chapter record such a victory saved: Atlas beats and Iria's epilogue.
  const story=createChronosChapterStory({routeElapsed:0,introEnabled:false});
  story.advance({elapsed:360});
  for(const name of ['atlas-entry','atlas-phase-two','atlas-disabled'])assert.equal(story.signal(name),true);
  story.advance({elapsed:360,aftermathElapsed:8});
  assert.equal(story.snapshot().aftermathReady,true);
  return plain(story.checkpoint());
}

test('a player who beat Atlas in the old S1-V1 keeps the weapon and the completed voyage, and S1-V5 adds nothing twice', t => {
  const chapter=oldVictoryChapter();
  const voyage=JSON.stringify({version:2,checkpoint:createChronosVoyageCheckpoint(10,{collected:36}),
    entry:{hull:100,score:0,maxCombo:1,collected:36},chapter,unlockedStage:10,completed:true});
  const equipment=JSON.stringify({version:1,recoveredTwin:true,unlocked:['pulse','twin'],selected:'twin',
    bossRewards:['guardian-atlas'],twinPrepared:true});
  const h=harness(t,'',{storageEntries:[['neon-unlocked-v2','2'],['neon-stars-v2','{"1":3}'],
    ['neonCronium.chronosVoyage.v2',voyage],['neonCronium.flightEquipment.v1',equipment]]});
  assert.equal(h.window.localStorage.getItem('neonCronium.chronosVoyage.v2:invalid-backups'),null,
    'The old chapter record with Atlas signals is still a valid save');
  assert.equal(h.snapshot().unlocked,2);
  assert.deepEqual(h.snapshot().equipment.unlocked,['pulse','twin']);assert.equal(h.snapshot().equipment.selected,'twin');
  // Replaying S1-V1 now ends at the arrival, without Atlas, and keeps everything.
  h.api.prepareChronosStage(10);assert.equal(h.snapshot().side,null);assert.equal(h.snapshot().flight.elapsed,324);
  while(h.snapshot().collected<36)h.api.collectEnergy();
  let sawAtlas=false;
  for(let frame=0;frame<60*400&&h.snapshot().state==='playing';frame++){h.api.isolatedFrame(1/60);sawAtlas=sawAtlas||Boolean(h.snapshot().boss);}
  assert.equal(h.snapshot().state,'complete');assert.equal(sawAtlas,false);
  assert.equal(h.snapshot().unlocked,2);
  assert.equal(JSON.parse(h.window.localStorage.getItem('neonCronium.chronosVoyage.v2')).completed,true);
  assert.equal(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'),equipment,'Replaying S1-V1 never rewrites the weapon');
  // Winning S1-V5 confirms the existing authorization without a new notice.
  winAtlasVoyage(h);
  const after=JSON.parse(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'));
  assert.deepEqual(after.unlocked,['pulse','twin']);assert.deepEqual(after.bossRewards,['guardian-atlas']);
  assert.equal(after.selected,'twin','The equipped weapon is preserved');
  assert.equal(h.window.document.getElementById('completeTitle').textContent,'Atlas ha abierto el paso');
  assert.doesNotMatch(h.window.document.getElementById('unlockMessage').textContent,/Gemelo/);
  assert.equal(h.pending.size,1);
});

test('a save left in the middle of the old S1-V1 Atlas fight resumes at its stage and completes without Atlas or reward', t => {
  // Builds with Atlas in S1-V1 never saved the fight itself: the record on
  // disk is the stage-10 entry (route 324 s, 32 CRONIUM), as in this fixture.
  const h=harness(t);
  const before=JSON.parse(h.window.localStorage.getItem('neonCronium.chronosVoyage.v2'));
  assert.equal(before.checkpoint.stageNumber,10);assert.equal(before.completed,false);
  h.api.prepare();
  assert.equal(h.snapshot().flight.elapsed,324);assert.equal(h.snapshot().collected,32);
  while(h.snapshot().collected<36)h.api.collectEnergy();
  const finished=h.until(q=>q.state==='complete');
  assert.equal(finished.boss,null);assert.equal(finished.unlocked,2);
  assert.deepEqual(finished.equipment.unlocked,['pulse'],'Gemelo now waits for S1-V5');
  assert.equal(h.window.localStorage.getItem('neonCronium.flightEquipment.v1'),null);
  const restored=harness(t,'',{storageEntries:Object.entries(h.window.localStorage)});
  assert.equal(restored.snapshot().unlocked,2);assert.deepEqual(restored.snapshot().equipment.unlocked,['pulse']);
  winAtlasVoyage(restored);
  assert.deepEqual(JSON.parse(restored.window.localStorage.getItem('neonCronium.flightEquipment.v1')).unlocked,['pulse','twin']);
  assert.match(restored.window.document.getElementById('unlockMessage').textContent,/Gemelo ×2/);
  assert.equal(restored.pending.size,1);
});

// Explosión del baúl (encargo a04): al vencer a Atlas en S1-V5 se ve la
// explosión centrada en él y la pantalla de completado llega después.
test('beating Atlas in S1-V5 plays the vault explosion on Atlas and the completion screen follows it', t => {
  const h=harness(t);
  h.api.prepareAtlasVoyage();h.collectGoal();
  const down=h.until(q=>q.boss?.disabled,60*240,true);
  assert.equal(down.state,'playing');
  assert.equal(down.atlasExplosions.length,1,'The defeat starts exactly one explosion');
  const [blast]=down.atlasExplosions;
  assert.equal(blast.x,down.boss.x);assert.equal(blast.y,down.boss.y);
  assert.ok(blast.duration>=.7&&blast.duration<=.9,'About 0.8 s (8 frames at 10 fps)');
  assert.ok(down.shake>0,'A short screen shake accompanies the explosion');
  let frames=0;
  while(h.snapshot().atlasExplosions.length){
    assert.equal(h.snapshot().state,'playing','The completion screen never covers the explosion');
    h.api.isolatedFrame(1/60);frames++;
    assert.ok(frames<120,'The explosion ends');
  }
  let after=0;
  while(h.snapshot().state!=='complete'){h.api.isolatedFrame(1/60);after++;assert.ok(after<=66,'Completion arrives at most ~1 s after the explosion');}
  assert.equal(s1v5Done(h),true);
  assert.ok(h.snapshot().equipment.unlocked.includes('twin'));
  assert.equal(h.pending.size,1,'No second animation loop');
});

test('without the explosion image Atlas ends exactly as before', t => {
  const h=harness(t,'',{brokenImages:['assets/atlas_explosion_v1.webp']});
  h.api.prepareAtlasVoyage();h.collectGoal();
  const down=h.until(q=>q.boss?.disabled,60*240,true);
  assert.equal(down.atlasExplosions.length,0);
  const finished=h.until(q=>q.state==='complete');
  assert.equal(s1v5Done(h),true);assert.ok(finished.equipment.unlocked.includes('twin'));
});
