import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const [config,render]=await Promise.all([
  readFile(new URL('../src/game/00-bootstrap-config.js',import.meta.url),'utf8'),
  readFile(new URL('../src/game/07-player-item-rendering.js',import.meta.url),'utf8')
]);
function visualContract() {
  const context=vm.createContext({});
  vm.runInContext(config.slice(config.indexOf('  const INITIAL_AMMO'),config.indexOf('  const ui ='))+
    '\nglobalThis.contract=SHIP_VISUAL;',context);
  return JSON.parse(JSON.stringify(context.contract));
}
function harness({reserve=0,atlasGradient=false}={}) {
  const calls=[],draws=[],properties={globalAlpha:1},stats={halos:0,gradients:0,blurWrites:[]};
  const image=(name,width=192,height=192)=>({name,naturalWidth:width,naturalHeight:height,complete:true});
  const ctx=new Proxy({}, {get(_target,key){
    if(key==='drawImage')return (image,...args)=>draws.push({name:image.name,args,alpha:properties.globalAlpha});
    if(key==='createRadialGradient')return()=>{if(!atlasGradient)throw new Error('No per-pickup gradients');return{addColorStop(){}};};
    return key in properties?properties[key]:(...args)=>calls.push({method:key,args});
  },set(_target,key,value){properties[key]=value;if(key==='shadowBlur')stats.blurWrites.push(value);return true;}});
  const sandbox=vm.createContext({Math,ctx,SHIP_VISUAL:visualContract(),
    state:'playing',playerVisible:true,
    player:{x:360,y:1000,target:360,targetY:1000,drift:0,visualBank:.6},
    powers:{shield:4},classicHullReserve:reserve,classicShieldImpact:.2,
    hull:100,elapsed:2.5,impactReactionTimer:0,
    shipLoadout:{hull:'aster',wings:'aster',engines:'aster'},classicWeapons:{cooldown:0},
    classicEquipment:{selected:'pulse'},hasClassicTwinMounts:()=>false,
    spriteReady:sprite=>!!sprite?.naturalWidth,SPRITES:{croniumEnergy:image('cronium-energy',512,512),croniumFragment:image('crystal'),shieldEffect:image('legacy-shield'),shieldIdle:image('legacy-shield'),forceShieldAtlas:image('force-field',1536,384)},
    drawModularShip:(...args)=>{calls.push({method:'assembly',args});return true;},
    drawPosedShip:()=>false,
    frameFrom:(_name,frame)=>image(`core-${frame}`),
    drawImageCentered:(...args)=>calls.push({method:'centered',args}),
    clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),
    document:{createElement(){stats.halos++;return {name:'cached-energy-halo',
      getContext(){return {createRadialGradient(){stats.gradients++;return {addColorStop(){}};},fillRect(){}};}};}}
  });
  const playerStart=render.indexOf('  function drawPlayer(t) {'),energyEnd=render.indexOf('  function drawCh01Frame(');
  vm.runInContext(render.slice(playerStart,energyEnd),sandbox);
  return {sandbox,calls,draws,stats,properties};
}

test('both classic hull families share the52% render contract',()=>{
  const classic=visualContract();assert.equal(classic.classicScale,.52);
  assert.equal(classic.assemblySize,108.16);assert.equal(classic.muzzleOffset,65);
  assert.ok(Math.abs(classic.centerYOffset+19.2*.52)<1e-9);assert.equal(classic.bankStrength,1.8);
});

test('actual player rendering uses the smoothed visual bank and integrated armor plating without a classic shield bubble',()=>{
  const h=harness({reserve:30});h.sandbox.drawPlayer(2500);
  const assembly=h.calls.find(call=>call.method==='assembly');
  assert.equal(assembly.args[2],108.16);assert.equal(assembly.args[4],.6);
  assert.equal(assembly.args[8],1.8);assert.ok(assembly.args[9]>0);
  assert.equal(h.draws.some(draw=>draw.name==='force-field'),false);
  assert.equal(h.calls.some(call=>call.method==='centered'&&call.args[0].name==='legacy-shield'),false);
});

test('animated CRONIUM draws four complete padded energy poses at8fps and reuses one small cached halo',()=>{
  const h=harness(),item={type:'energy',x:200,y:500,r:22,alpha:1,phase:0,rot:0};
  const before=JSON.stringify(item);
  for(let frame=0;frame<4;frame++){h.sandbox.elapsed=frame/8;h.sandbox.drawEnergy(item);}
  assert.equal(h.stats.halos,1);assert.equal(h.stats.gradients,1);
  assert.ok(h.stats.blurWrites.every(blur=>blur===0));
  const energy=h.draws.filter(draw=>draw.name==='cronium-energy');
  assert.equal(energy.length,4);
  assert.deepEqual(energy.map(draw=>draw.args.slice(0,4)),[
    [0,0,256,256],[256,0,256,256],[0,256,256,256],[256,256,256,256]
  ],'all gutters and the full illustration remain inside every source cell');
  assert.ok(energy.every(draw=>draw.args.slice(4).join(',')==='-44,-44,88,88'));
  assert.equal(h.draws.some(draw=>draw.name==='crystal'||draw.name.startsWith('core-')),false,
    'the opaque historical fragment and its metal bezel never return to classic');
  assert.equal(h.draws.filter(draw=>draw.name==='cached-energy-halo').length,4);
  h.sandbox.elapsed=.124;h.sandbox.drawEnergy(item);
  assert.deepEqual(h.draws.at(-1).args.slice(0,4),[0,0,256,256],'frames advance only on the route-driven8fps boundary');
  assert.ok(h.calls.some(call=>call.method==='translate'&&call.args[0]===item.x&&call.args[1]===item.y));
  assert.equal(JSON.stringify(item),before,'Rendering cannot mutate pickup hitboxes or position');
});

test('unavailable classic energy leaves its cached halo without restoring opaque fragments or allocating repeated gradients',()=>{
  const h=harness();h.sandbox.SPRITES.croniumEnergy=null;
  const item={type:'energy',x:200,y:500,r:22,alpha:1,phase:NaN,rot:0};
  for(let frame=0;frame<8;frame++){h.sandbox.elapsed=frame/8;h.sandbox.drawEnergy(item);}
  assert.equal(h.stats.halos,1);assert.equal(h.stats.gradients,1);
  assert.equal(h.draws.length,8);assert.ok(h.draws.every(draw=>draw.name==='cached-energy-halo'));
});

test('the real missile renderer keeps only the flying payload at its physical pivot from the first frame',()=>{
  const h=harness();h.sandbox.SPRITES.chapterMissile={name:'chapter-missile',naturalWidth:1024,naturalHeight:1024};
  vm.runInContext(render.slice(0,render.indexOf('  function drawFlightModule(')),h.sandbox);
  for(const age of [0,.02,.10,.25,.50]){
    const shot={weapon:'missile',x:320,y:400,vx:0,vy:-760,duration:3.2,life:3.2-age};
    h.sandbox.classicWeapons.projectiles=[shot];const before=JSON.stringify(shot);h.sandbox.drawClassicProjectiles();
    const draw=h.draws.at(-1);
    assert.equal(draw.name,'chapter-missile');assert.equal(draw.args[1],0,'launch hardware never travels with the shot');
    assert.deepEqual(draw.args.slice(2),[256,256,-27,-27,54,54]);
    assert.equal(draw.args[0],Math.floor((shot.duration-shot.life)*14)%4*256);
    assert.equal(JSON.stringify(shot),before);
  }
  assert.ok(h.calls.some(call=>call.method==='translate'&&call.args[0]===320&&call.args[1]===400));
  assert.ok(h.calls.some(call=>call.method==='rotate'&&call.args[0]===0));
});

test('missile impacts play their own blast row for.25s followed by.4s of fading debris',()=>{
  const h=harness();h.sandbox.SPRITES.chapterMissile={name:'chapter-missile',naturalWidth:1024,naturalHeight:1024};
  vm.runInContext(render.slice(render.indexOf('  function drawImpactEffects()'),render.indexOf('  function drawCombo()')),h.sandbox);
  const remainingAlpha=[];
  for(const age of [0,.10,.249,.25,.40,.649]){
    const effect={missileImpact:true,x:320,y:400,duration:.65,life:.65-age};
    h.sandbox.impactEffects=[effect];h.properties.globalAlpha=1;
    const before=JSON.stringify(effect);h.sandbox.drawImpactEffects();const draw=h.draws.at(-1);
    const actualAge=effect.duration-effect.life,row=actualAge<.25?2:3;
    assert.equal(draw.name,'chapter-missile');assert.equal(draw.args[1],row*256);
    assert.equal(draw.args[0],Math.min(3,Math.floor((actualAge-(row===3?.25:0))*(row===2?16:10)))*256);
    assert.deepEqual(draw.args.slice(2,4),[256,256]);
    assert.deepEqual(draw.args.slice(4),(()=>{const size=row===2?128+80*(1-Math.pow(1-Math.min(1,Math.max(0,actualAge)/.19),2)):208+44*Math.min(1,(actualAge-.25)/.4);return[-size/2,-size/2,size,size];})());
    if(row===3)remainingAlpha.push(draw.alpha);else assert.equal(draw.alpha,1);
    assert.equal(JSON.stringify(effect),before,'presentation never reapplies damage or changes effect lifetime');
  }
  assert.ok(remainingAlpha[0]>remainingAlpha[1]&&remainingAlpha[1]>remainingAlpha[2]&&remainingAlpha[2]>0);
  assert.ok(h.calls.some(call=>call.method==='translate'&&call.args[0]===320&&call.args[1]===400));
});

function guardianHarness(){
  const h=harness({atlasGradient:true}),animation={frame:3,previousFrame:null,blend:1};
  h.sandbox.SPRITES.guardianAtlas={name:'guardian-atlas',naturalWidth:2048,naturalHeight:1024};
  h.sandbox.atlasBoss={state:'fire',x:360,y:400,visualSize:350,phase:1,vulnerability:false,collisionRadius:42};
  h.sandbox.NeonCampaign={guardianAtlasAnimation:()=>animation};
  const constants=render.slice(render.indexOf('  const ATLAS_FRAME_PIVOTS'),render.indexOf('  function drawAtlasVfx'));
  const boss=render.slice(render.indexOf('  function drawGuardianAtlas()'),render.indexOf('  function drawShipComponent('));
  vm.runInContext(constants+boss,h.sandbox);return {...h,animation};
}

test('all Guardian poses use complete512px cells and one fixed reactor pivot without a clipped plating patch',()=>{
  const h=guardianHarness(),before=JSON.stringify(h.sandbox.atlasBoss);
  for(let frame=0;frame<8;frame++){
    h.animation.frame=frame;h.draws.length=0;h.sandbox.drawGuardianAtlas();
    assert.equal(h.draws.length,1,'closed and exposed cores are authored poses instead of an overlaid rectangle');
    const draw=h.draws[0],size=350*1.25;
    assert.deepEqual(draw.args.slice(0,4),[(frame%4)*512,Math.floor(frame/4)*512,512,512]);
    assert.deepEqual(draw.args.slice(4),[360-size/2,400-size/2,size,size]);
    assert.ok(Number.isInteger(draw.args[0])&&Number.isInteger(draw.args[1]),'source gutters never sample fractional neighbouring cells');
    assert.equal(h.calls.some(call=>call.method==='ellipse'),false,'no cropped core-cover patch remains');
  }
  assert.equal(JSON.stringify(h.sandbox.atlasBoss),before,'artboard gutter compensation cannot change combat geometry');
  h.animation.previousFrame=1;h.animation.frame=3;h.animation.blend=.4;h.draws.length=0;h.properties.globalAlpha=1;
  h.sandbox.drawGuardianAtlas();assert.equal(h.draws.length,2);
  assert.deepEqual(h.draws[0].args.slice(4),h.draws[1].args.slice(4),'pose transitions retain the same reactor pivot');
});

test('Guardian charge effects stay on the two barrels without announcing the future escape lane',()=>{
  const h=guardianHarness(),vfx=[];
  h.sandbox.drawAtlasVfx=(...args)=>vfx.push(args);
  h.sandbox.atlasBoss.state='charge';h.sandbox.atlasBoss.telegraph={progress:.6,safeX:200};
  const before=JSON.stringify(h.sandbox.atlasBoss);h.sandbox.drawGuardianAtlas();
  assert.equal(vfx.length,2);assert.ok(vfx.every(args=>args[0]===3&&args[1]===48&&args[2]===48));
  const positions=h.calls.filter(call=>call.method==='translate').map(call=>call.args);
  const artSize=350*1.25,barrelY=400+artSize*(327/512-.5);
  assert.deepEqual(positions,[[360-artSize*.25,barrelY],[360+artSize*.25,barrelY]]);
  assert.equal(h.calls.some(call=>['lineTo','strokeRect','fillText'].includes(call.method)),false);
  assert.equal(JSON.stringify(h.sandbox.atlasBoss),before);
});
