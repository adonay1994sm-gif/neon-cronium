import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as weapons from '../src/game/combat/classic-weapons.js';
import * as economy from '../src/game/progression/scrap-economy.js';

// This runs the real classic spawn, collision/destruction and pickup dispatch
// with the actual durable ledger. Rendering/audio are the only tagged edges.
// No bundle and no fixture currency are needed to prove that shooting a wreck
// creates a physical pickup and that only collecting it credits its receipt.
const source=(await Promise.all(['03-ui-game-flow.js','04-entities-collision-damage.js']
  .map(name=>readFile(new URL(`../src/game/${name}`,import.meta.url),'utf8')))).join('\n');

function harness() {
  let blocked=false;
  const records=new Map(),storage={
    readRaw:key=>({ok:true,value:records.get(key)??null}),
    setJSON(key,value){if(blocked)return false;records.set(key,JSON.stringify(value));return true;}
  };
  const ledger=economy.createScrapLedger({storage});ledger.load();
  const run=ledger.beginRun({scope:'classic:1'});
  const calls={damage:[],missileImpacts:[]};
  const game=vm.createContext({Math,W:720,H:1280,currentLevel:0,
    NeonCampaign:{...weapons,...economy},
    classicSalvageLedger:ledger,classicSalvageState:run.state,classicSalvageRunId:run.runId,
    classicSalvageEnemySequence:0,classicThreatSequence:0,classicFlightView:{stageId:'1.2'},
    classicWeapons:weapons.createClassicWeapons(),classicCometShower:null,
    items:[],shots:[],explosions:[],parts:[],rings:[],impactEffects:[],settings:{effects:false},
    EFFECT_LIMITS:{shots:32,explosions:24,impacts:32},SPRITES:{},player:{x:360,y:1000},
    state:'playing',hull:100,score:0,hudScoreTarget:0,phaserCooldown:0,atlasBoss:null,
    cameraKickY:0,shake:0,SHIP_VISUAL:{phaserMuzzleOffset:65},
    clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),
    isThreat:item=>['meteor','debris','satellite','scout'].includes(item.type),
    fireAtlasPulse:()=>false,hud(){},tone(){},uiSound(){},toast(){},vibrate(){},combatSound(){},
    window:{AnalyticsManager:{track(){}}}
  });
  vm.runInContext(source,game);
  game.hud=()=>{};
  game.damageShip=(amount,x,y)=>calls.damage.push({amount,x,y});
  game.addMissileImpact=(x,y)=>calls.missileImpacts.push({x,y});
  return {game,ledger,storage,records,calls,blockStorage(value){blocked=value;},
    target(type,patch={}){
      const item=game.createThreat(type,{speed:1,hazard:'wave'});
      Object.assign(item,{x:360,baseX:360,y:600,rot:0,damage:24},patch);
      game.items.push(item);return item;
    }};
}

const loot=game=>game.items.filter(item=>item.salvagePickup);

test('wreckage receives a run and spawn identity before combat, independently of hit order',()=>{
  const h=harness(),first=h.target('debris'),second=h.target('satellite');
  assert.equal(first.salvageRole,'debris');assert.equal(second.salvageRole,'satellite');
  assert.equal(first.salvageDropId,'1.2:wreck:debris:0');
  assert.equal(second.salvageDropId,'1.2:wreck:satellite:1');
  assert.equal(first.id,`wreck:${h.game.classicSalvageRunId}:${first.salvageDropId}`);
  assert.notEqual(first.id,second.id);
  const before=JSON.stringify(first);h.game.stampClassicWreckageSalvage(first);
  assert.equal(JSON.stringify(first),before,'stamping one spawn twice preserves its receipt');
  assert.equal(h.game.classicSalvageEnemySequence,2);
  h.game.classicFlightView={stageId:'1.3'};h.game.classicSalvageEnemySequence=0;
  assert.notEqual(h.target('debris').salvageDropId,first.salvageDropId);
  const next=h.ledger.beginRun({scope:'classic:1',fresh:true});
  h.game.classicSalvageRunId=next.runId;h.game.classicSalvageState=next.state;
  h.game.classicFlightView={stageId:'1.2'};h.game.classicSalvageEnemySequence=0;
  const replay=h.target('debris');
  assert.equal(replay.salvageDropId,first.salvageDropId);
  assert.notEqual(replay.id,first.id,'the same spawn ordinal in a fresh run owns a different world identity');
  assert.equal(h.ledger.getBalance(),0);
});

for(const [type,hp,reward] of [['debris',2,6],['satellite',3,18]]) {
  test(`Phaser destroys ${type} into ${reward} physical scrap, credited once only on pickup`,()=>{
    const h=harness(),target=h.target(type,{hp,maxHp:hp});
    for(let shot=1;shot<hp;shot++) {
      h.game.firePhaser();
      assert.equal(target.hp,hp-shot);assert.equal(loot(h.game).length,0);
      assert.equal(h.ledger.getBalance(),0);
    }
    h.game.firePhaser();
    const [pickup]=loot(h.game);
    assert.ok(pickup,'a real physical pickup is emitted at the destroyed machine');
    assert.equal(pickup.enemyType,type);assert.equal(pickup.amount,reward);
    assert.equal(pickup.dropId,target.salvageDropId);
    assert.equal(pickup.x,target.x);assert.equal(pickup.y,target.y);
    assert.equal(h.ledger.getBalance(),0,'destruction itself never pays currency');
    h.game.animateScoutHit(target,true);h.game.animateScoutHit(target,true);
    assert.equal(loot(h.game).length,1,'repeated destruction callbacks cannot create extra pickups');
    assert.equal(h.game.collectItem(pickup),true);
    assert.equal(h.ledger.getBalance(),reward);
    assert.equal(h.game.collectItem(pickup),true);
    assert.equal(h.ledger.getBalance(),reward,'the durable receipt makes repeated collection harmless');
    const restored=economy.createScrapLedger({storage:h.storage});
    assert.equal(restored.load().ok,true);assert.equal(restored.getBalance(),reward);
    assert.equal(restored.getState().activeRun.claimed.length,1);
    assert.equal(restored.getState().activeRun.claimed[0].enemyType,type);
  });

  test(`a physical missile destroys ${type} through the same single-reward path`,()=>{
    const h=harness(),target=h.target(type,{hp,maxHp:hp});
    const fired=weapons.triggerClassicMissile(h.game.classicWeapons,{x:360,y:650,shotId:'missile:1'});
    assert.equal(fired.accepted,true);
    const projectile=fired.projectiles[0];
    projectile.previousX=360;projectile.previousY=650;projectile.x=360;projectile.y=600;
    assert.equal(h.game.interceptClassicProjectile(target),true);
    assert.equal(loot(h.game).length,1);assert.equal(h.ledger.getBalance(),0);
    assert.deepEqual(h.calls.missileImpacts,[{x:360,y:600}]);
    assert.equal(h.game.interceptClassicProjectile(target),false,'the consumed missile cannot destroy the same target again');
    h.game.animateScoutHit(target,true);assert.equal(loot(h.game).length,1);
    h.game.collectItem(loot(h.game)[0]);assert.equal(h.ledger.getBalance(),reward);
  });
}

test('collision damage, missed wreckage, stone and incoming projectiles never grant machinery salvage',()=>{
  const h=harness();
  for(const type of ['debris','satellite'])h.game.collectItem(h.target(type));
  assert.equal(h.calls.damage.length,2);assert.equal(loot(h.game).length,0);
  const meteor=h.target('meteor');assert.equal(meteor.salvageDropId,undefined);
  h.game.animateScoutHit(meteor,true);
  for(const flag of ['classicScoutProjectile','guardianProjectile']) {
    h.game.animateScoutHit({type:'debris',x:360,y:600,[flag]:true},true);
  }
  assert.equal(loot(h.game).length,0);assert.equal(h.ledger.getBalance(),0);
});

test('a previously claimed fragment cannot emit another pickup after reload or in a stale run',()=>{
  const h=harness(),target=h.target('debris');
  h.game.animateScoutHit(target,true);h.game.collectItem(loot(h.game)[0]);
  h.game.items.length=0;
  h.game.animateScoutHit({...target,salvageDropped:false},true);
  assert.equal(loot(h.game).length,0);assert.equal(h.ledger.getBalance(),6);
  const next=h.ledger.beginRun({scope:'classic:1',fresh:true});
  h.game.classicSalvageRunId=next.runId;h.game.classicSalvageState=next.state;
  h.game.animateScoutHit({...target,salvageDropped:false},true);
  assert.equal(loot(h.game).length,0,'a stale physical entity is never moved to a fresh reward run');
  assert.equal(h.ledger.getBalance(),6);
});

test('physical salvage is bounded, duplicate world receipts are suppressed, and Atlas keeps its larger reward',()=>{
  const h=harness(),first=h.target('debris');
  h.game.animateScoutHit(first,true);
  h.game.animateScoutHit({...first,salvageDropped:false},true);
  assert.equal(loot(h.game).length,1,'cloned death callbacks still share one world receipt');
  for(let index=1;index<40;index++)h.game.animateScoutHit(h.target('debris'),true);
  assert.equal(loot(h.game).length,32,'machinery cannot fill an unbounded pickup field');
  const boss={x:360,y:280,bossSalvage:true,salvageDropId:'guardian-atlas'};
  h.game.spawnClassicScrap(boss);
  const bossLoot=loot(h.game).find(item=>item.bossSalvage);
  assert.equal(loot(h.game).length,33);assert.equal(bossLoot.amount,600);
  assert.equal(bossLoot.enemyType,'guardian-atlas');
  assert.equal(h.ledger.getBalance(),0,'even Atlas must physically reach the collector');
});

test('failed pickup persistence leaves machinery salvage retryable without losing or duplicating money',()=>{
  const h=harness(),target=h.target('satellite');h.game.animateScoutHit(target,true);
  const [pickup]=loot(h.game);h.blockStorage(true);
  assert.equal(h.game.collectItem(pickup),false);
  assert.equal(h.ledger.getBalance(),null,'an unconfirmed write blocks the in-memory ledger');
  assert.equal(JSON.parse(h.records.get(economy.SCRAP_ECONOMY_KEY)).balance,0);
  assert.equal(loot(h.game)[0],pickup);
  h.blockStorage(false);
  assert.equal(h.game.collectItem(pickup),true);assert.equal(h.ledger.getBalance(),18);
  assert.equal(h.game.collectItem(pickup),true);assert.equal(h.ledger.getBalance(),18);
});
