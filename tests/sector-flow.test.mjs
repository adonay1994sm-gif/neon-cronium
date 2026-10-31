import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

// Plan F3a: el sector 1 continuo con el game.js construido. Mismo arnés que
// tests/side-voyage-flow.test.mjs, más startSector y el tramo actual.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(join(root, file), 'utf8');
const [html, game, core, content] = await Promise.all(['index.html', 'game.js', 'core-runtime.js', 'content-runtime.js'].map(read));
const MARKER = '  legacyFrameId = requestAnimationFrame(frame);\n})();';

const drawnTexts = []; // textos e imágenes («image:…») que pinta el lienzo
function context() {
  const gradient = {addColorStop() {}};
  return new Proxy({}, {get(target, key) {
    if (key in target) return target[key];
    if (key === 'fillText') return text => drawnTexts.push(String(text));
    if (key === 'drawImage') return image => drawnTexts.push(`image:${image?.src || ''}`);
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
    if (key === 'measureText') return value => ({width: String(value).length * 14});
    return () => {};
  }, set(target, key, value) { target[key] = value; return true; }});
}

function harness({unlocked = '2', query = '', storage = {}} = {}) {
  const dom = new JSDOM(html, {url: `https://neon.test/${query}`, runScripts: 'outside-only', pretendToBeVisual: true});
  const w = dom.window;
  for (const [key, value] of Object.entries(storage)) w.localStorage.setItem(key, value);
  w.HTMLCanvasElement.prototype.getContext = () => context();
  w.HTMLCanvasElement.prototype.getBoundingClientRect = () => ({x: 0, y: 0, left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844});
  w.requestAnimationFrame = () => 1; w.cancelAnimationFrame = () => {}; w.navigator.vibrate = () => true;
  w.AdBridge = {showRewarded: async () => true, showInterstitial: async () => false};
  w.Image = class { constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
    set src(v) { this._src = v; this.complete = true; this.naturalWidth = 1536; this.naturalHeight = 768; } get src() { return this._src || ''; } };
  w.localStorage.setItem('neon-unlocked-v2', unlocked);
  // Azar con semilla fija: las pruebas que cuentan patrullas o peligros no
  // pueden depender de la suerte (revisión 3, prueba intermitente).
  let seed = 0x9e3779b9;
  w.eval('Math').random = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  w.eval(core); w.eval(content);
  const hook = `window.T={ev:s=>eval(s),startSector,stage:()=>classicFlightView?.stageNumber||null,resumeReward,effects:()=>impactEffects,setEffects:on=>{settings.effects=on;},forceComplete:()=>{state='complete';},level:()=>currentLevel,requestStage:n=>{classicVoyageRequestedStage=n;},startSideVoyage,startLevel,finishGame,goHome,buildLevelGrid,hit:n=>{classicHullReserve=0;hullGrace=0;damageShip(n);return hull;},hitNow:n=>{classicHullReserve=0;damageShip(n);return hull;},
    st:()=>({state,side:classicSideVoyage?.ficha.id||null,route:classicFlightView?.routeId||null,
      hud:!ui.hud.classList.contains('hidden'),fire:!ui.fire.classList.contains('hidden'),scope:classicSalvageState?.activeRun?.scope||null}),
    adv:s=>{for(let r=s;r>1e-9;r-=1/60)update(1/60);},
    toGaiaBeacon:()=>{collected=36;for(let i=0;i<30000&&!classicFlightView?.beacon.active;i++)classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);return classicFlightView.beacon.active;},
    draw:()=>render(performance.now()),hull:()=>hull,stars:()=>runStars(),croniumOnScreen:()=>items.filter(item=>item.type==='energy'&&item.y>0&&item.y<H).length,miss:n=>{energySpawned+=n;},
    toStage:n=>{for(let i=0;i<30000&&classicFlightView.stageNumber<n;i++){const add=Math.max(0,classicFlightView.stageGoal-collected);collected+=add;energySpawned+=add;classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);}return classicFlightView.stageNumber;},
    finish:()=>{collected=36;for(let i=0;i<30000&&!classicFlight.snapshot().canFinish;i++)classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);
      completeLevel();if(atlasBoss){atlasBoss.resolved=true;completeLevel();}}};\n`;
  assert.equal(game.split(MARKER).length, 2);
  w.eval(game.replace(MARKER, hook + MARKER));
  const saved = id => JSON.parse(w.localStorage.getItem(`neonCronium.voyage.${id}.v1`) || 'null');
  const route = id => w.document.querySelector(`.sector-route[data-voyage="${id}"]`)?.dataset.status;
  return {w, T: w.T, saved, route};
}

const KEY = 'neonCronium.sectors.v1';
const sectorSave = w => JSON.parse(w.localStorage.getItem(KEY) || 'null');
const putRun = (w, run) => w.localStorage.setItem(KEY, JSON.stringify({version: 1, unlocked: 1, sectors: {}, run}));
const click = (w, id) => w.document.getElementById(id).click();
// Como el panel de desarrollo: tramo pedido + ficha pendiente + startLevel.
const startAt = (T, stageNumber) => {
  T.ev("classicSideVoyagePending=NeonCampaign.getSectorFicha('S1')"); T.requestStage(stageNumber); T.startLevel(0);
};

test('play starts sector 1 at stage 1 on a fresh device', () => {
  const {w, T} = harness({unlocked: '1'});
  click(w, 'play');
  assert.deepEqual([T.st().side, T.st().route, T.stage()], ['S1', 'sector-1-gaia', 1]);
});

test('entering a stage saves the sector run', () => {
  const {w, T} = harness();
  T.startSector('S1');
  T.toStage(3);
  assert.deepEqual(sectorSave(w).run, {sector: 1, stageNumber: 3, stageHull: T.hull(), reviveUsed: false});
  assert.equal(w.localStorage.getItem('neonCronium.sector.S1.v1'), null);
});

test('continue returns to the start of the saved stage with its hull', () => {
  const {w, T} = harness();
  putRun(w, {sector: 1, stageNumber: 4, stageHull: 60, reviveUsed: false});
  click(w, 'play');
  assert.deepEqual([T.st().side, T.stage(), T.hull()], ['S1', 4, 60]);
  T.adv(1);
  assert.equal(T.stage(), 4);
});

test('a damaged sector save starts a new sector', () => {
  for (const raw of ['{rota', JSON.stringify({version: 1, unlocked: 1, sectors: {}, run: {sector: 1, stageNumber: 99}})]) {
    const {w, T} = harness();
    w.localStorage.setItem(KEY, raw);
    click(w, 'play');
    assert.deepEqual([T.st().side, T.stage()], ['S1', 1], raw);
  }
});

test('C9 repairs the hull when docking at stage 6', () => {
  const {T} = harness();
  T.startSector('S1');
  T.hit(50);
  assert.ok(T.hull() < 100);
  T.toStage(6);
  for (let i = 0; i < 80 && T.hull() < 100; i++) T.adv(.1);
  assert.equal(T.hull(), 100);
});

test('the menu shows the sector and hides the old voyage map', () => {
  const {w, T} = harness();
  assert.ok(w.document.getElementById('levels').classList.contains('hidden'));
  assert.match(w.document.getElementById('playSector').textContent, /SECTOR 1/);
  putRun(w, {sector: 1, stageNumber: 4, stageHull: 80, reviveUsed: false});
  T.ev('updateMenu()');
  assert.match(w.document.getElementById('playSector').textContent, /TRAMO 4\/10/);
});

// Tarea 3: el sector empieza con el inicio de Chronos y el tutorial.
const story = T => T.ev('Boolean(classicChapterStory)');
const tutorial = T => T.ev('Boolean(classicTutorial)');

test('a fresh sector plays the Chronos opening and the tutorial', () => {
  const {T} = harness();
  T.startSector('S1');
  T.adv(3);
  assert.equal(story(T), true);
  assert.equal(tutorial(T), true);
  drawnTexts.length = 0; T.draw();
  assert.ok(drawnTexts.some(text => /^image:.*chronos_intro_station_atlas/.test(text)), 'the Chronos station is drawn');
});

// A1 (auditoría 25/10): la intro de Chronos no se repite en cada intento.
const opening = T => T.ev('classicChapterView?.opening.film===true');
const menuMemory = w => JSON.parse(w.localStorage.getItem('neonCronium.menu.v1') || 'null');

test('once skipped, a retry of the sector starts after the Chronos opening', () => {
  const {w, T} = harness();
  T.startSector('S1');
  T.adv(1);
  assert.equal(opening(T), true, 'the first attempt plays the opening');
  click(w, 'chapterSkip');
  assert.equal(menuMemory(w).seen.intro, true);
  T.finishGame('hull');
  click(w, 'retry');
  T.adv(.1);
  assert.equal(T.stage(), 1);
  assert.equal(story(T), true, 'the chapter keeps its later lines');
  assert.equal(opening(T), false, 'the retry skips the opening');
  assert.ok(T.ev('classicFlightView.elapsed') >= T.ev('NeonCampaign.CHRONOS_INTRO_TIMELINE.gone'));
  assert.equal(w.document.getElementById('chapterSkip').classList.contains('hidden'), true);
});

test('watching the whole opening also counts as seen', () => {
  const {w, T} = harness();
  T.startSector('S1');
  T.adv(1);
  assert.equal(menuMemory(w)?.seen?.intro ?? false, false, 'not seen while it plays');
  T.adv(15);
  assert.equal(opening(T), false);
  assert.equal(menuMemory(w).seen.intro, true);
  const next = harness();
  next.w.localStorage.setItem('neonCronium.menu.v1', w.localStorage.getItem('neonCronium.menu.v1'));
  next.T.startSector('S1');
  next.T.adv(.1);
  assert.equal(opening(next.T), false, 'a new session remembers it too');
});

test('no patrol spawns before recoveryAt', () => {
  const {T} = harness();
  T.startSector('S1');
  for (let second = 0; second < 8; second++) {
    T.adv(1);
    assert.equal(T.ev('items.filter(item=>item.classicScout).length'), 0, `second ${second + 1}`);
  }
});

test('continuing late in the sector does not throw and has no chapter story', () => {
  for (const stageNumber of [8, 9]) {
    const {w, T} = harness();
    putRun(w, {sector: 1, stageNumber, stageHull: 90, reviveUsed: false});
    click(w, 'play');
    assert.equal(T.stage(), stageNumber);
    assert.equal(story(T), false, `stage ${stageNumber}`);
  }
});

test('old side voyages still skip the intro', () => {
  const {T} = harness();
  T.startSideVoyage('S1-V2');
  assert.equal(story(T), false);
  assert.equal(tutorial(T), false);
});

test('a sector stage spawns CRONIUM and patrols', () => {
  const {T} = harness();
  startAt(T, 2);
  assert.equal(T.stage(), 2);
  T.adv(12);
  assert.ok(T.ev('energySpawned') > 0, 'CRONIUM appears');
  assert.ok(T.ev('items.filter(item=>item.classicScout).length') > 0, 'a patrol appears');
});

test('stages that open with new Gaia enemies play without errors', () => {
  // Tramos 3, 4 y 7 abren con raider (el Sembrador está fuera de momento), aegis y alpha.
  for (const stageNumber of [3, 4, 7]) {
    const {T} = harness({query: '?dev=1'});
    startAt(T, stageNumber);
    T.ev('DEV.invulnerable=true'); // comprueba errores, no supervivencia
    assert.equal(T.stage(), stageNumber);
    T.adv(20);
    assert.equal(T.st().state, 'playing', `stage ${stageNumber}`);
    assert.ok(T.ev('items.filter(item=>item.flightPatrol).length') > 0, `stage ${stageNumber} has a patrol`);
  }
});

// Tarea 4: revivir al 25 % una vez por intento; al volver a caer, tramo 1.
const rewardShown = w => !w.document.getElementById('reward').classList.contains('hidden');

test('a new player only has JUGAR: the hangar button stays hidden', () => {
  const {w} = harness({unlocked: '1'});
  assert.equal(w.document.getElementById('openHangar').classList.contains('hidden'), true);
  assert.equal(w.document.getElementById('playLabel').textContent, 'JUGAR');
});

// Revisión tras el PR #56: recorre el juego real, no solo menuView.
test('the hangar opens at stage 6 and stays in the menu after dying', () => {
  const {w, T} = harness();
  T.startSector('S1');
  T.toStage(6);
  T.finishGame('hull');
  T.goHome();
  const button = w.document.getElementById('openHangar');
  assert.equal(w.document.getElementById('playLabel').textContent, 'JUGAR');
  assert.equal(button.classList.contains('hidden'), false);
  assert.equal(button.classList.contains('is-new'), true);
  button.click();
  assert.equal(JSON.parse(w.localStorage.getItem('neonCronium.menu.v1')).seen.hangar, true);
  assert.equal(button.classList.contains('is-new'), false);
});

test('dying in the sector saves a restart at stage 1', () => {
  const {w, T} = harness();
  startAt(T, 3);
  T.finishGame('hull');
  assert.deepEqual(sectorSave(w).run, {sector: 1, stageNumber: 1, stageHull: 100, reviveUsed: false});
  assert.equal(w.document.getElementById('retry').textContent, 'REINTENTAR SECTOR · TRAMO 1');
  assert.equal(rewardShown(w), true);
});

test('the rewarded revive returns at 25 % to the same stage, once', () => {
  const {w, T} = harness();
  startAt(T, 3);
  T.finishGame('hull');
  assert.equal(T.resumeReward(), true);
  assert.deepEqual([T.st().state, T.stage(), T.hull()], ['playing', 3, 25]);
  assert.deepEqual(sectorSave(w).run, {sector: 1, stageNumber: 3, stageHull: 100, reviveUsed: true});
  T.finishGame('hull');
  assert.equal(rewardShown(w), false);
  assert.equal(sectorSave(w).run.stageNumber, 1);
});

test('a revive used before closing the app is still spent', () => {
  const {w, T} = harness();
  putRun(w, {sector: 1, stageNumber: 3, stageHull: 80, reviveUsed: true});
  click(w, 'play');
  T.finishGame('hull');
  assert.equal(rewardShown(w), false);
});

test('restarting the sector makes the revive available again', () => {
  const {w, T} = harness();
  startAt(T, 3);
  T.finishGame('hull'); T.resumeReward(); T.finishGame('hull');
  T.startLevel(0);
  assert.equal(T.stage(), 1);
  T.finishGame('hull');
  assert.equal(rewardShown(w), true);
});

test('old side voyages keep their 35 % revive', () => {
  const {T} = harness();
  T.startSideVoyage('S1-V2'); T.adv(1);
  T.ev('hull=0');
  T.finishGame('hull');
  T.resumeReward();
  assert.equal(T.hull(), 35);
});

// Tarea 5: Atlas cierra el sector.
const EQUIPMENT = 'neonCronium.flightEquipment.v1';
const toFinish = T => T.ev('collected=99;for(let i=0;i<40000&&!classicFlight.snapshot().canFinish;i++)classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);');

test('Atlas guards the end of stage 10', () => {
  const {T} = harness();
  startAt(T, 10);
  toFinish(T);
  T.adv(.5);
  assert.equal(T.ev('Boolean(atlasBoss)'), true);
});

test('beating Atlas completes the sector with its stars and the Gemelo', () => {
  const {w, T} = harness();
  startAt(T, 10);
  T.finish();
  const save = sectorSave(w);
  assert.equal(save.sectors[1].completed, true);
  assert.equal(save.run, null);
  assert.ok(save.sectors[1].stars >= 1 && save.sectors[1].stars <= 3);
  assert.ok(JSON.parse(w.localStorage.getItem(EQUIPMENT)).unlocked.includes('twin'));
  assert.equal(w.document.getElementById('completeLabel').textContent, 'SECTOR 1 COMPLETADO');
  assert.equal(w.document.getElementById('nextLevel').textContent, 'VOLVER AL MENÚ');
  click(w, 'nextLevel');
  assert.equal(T.st().state, 'menu');
});

test('the sector is not marked complete if the Gemelo cannot be saved', () => {
  const {w, T} = harness();
  w.localStorage.setItem(EQUIPMENT, '{rota');
  startAt(T, 10);
  T.finish();
  assert.notEqual(sectorSave(w).sectors[1]?.completed, true);
});

test('replaying a completed sector starts at stage 1 and keeps its stars', () => {
  const {w, T} = harness();
  startAt(T, 10);
  T.finish();
  const stars = sectorSave(w).sectors[1].stars;
  T.goHome();
  assert.match(w.document.getElementById('playSector').textContent, /SECTOR 1 COMPLETADO/);
  click(w, 'play');
  assert.deepEqual([T.st().side, T.stage()], ['S1', 1]);
  assert.equal(sectorSave(w).sectors[1].stars, stars);
});

// Revisión final del plan F3a (auditor-codigo).
test('the death rule is saved as soon as the ship explodes', () => {
  const {w, T} = harness();
  startAt(T, 5);
  T.ev('hull=1');
  T.hitNow(60);
  assert.equal(T.st().state, 'destroying');
  assert.equal(sectorSave(w).run.stageNumber, 1, 'closing the app during the explosion still restarts the sector');
  T.adv(2);
  assert.equal(T.st().state, 'gameover');
  assert.equal(rewardShown(w), true);
  assert.equal(T.resumeReward(), true);
  assert.equal(T.stage(), 5);
  assert.equal(sectorSave(w).run.stageNumber, 5);
});

test('a new attempt opens a new salvage run; continuing keeps it', () => {
  const salvageRun = T => T.ev('classicSalvageState?.activeRun?.id||null');
  {
    const {T} = harness();
    T.startSector('S1');
    const first = salvageRun(T);
    T.finishGame('hull'); T.startLevel(0);
    assert.notEqual(salvageRun(T), first, 'enemies of the new attempt drop scrap again');
  }
  {
    const {w, T} = harness();
    putRun(w, {sector: 1, stageNumber: 4, stageHull: 70, reviveUsed: false});
    click(w, 'play');
    const first = salvageRun(T);
    T.goHome(); click(w, 'play');
    assert.equal(salvageRun(T), first, 'replaying the same stage gives no scrap twice');
  }
});

test('continuing keeps the hull you had at the start of the stage, even below 50 %', () => {
  const {w, T} = harness();
  putRun(w, {sector: 1, stageNumber: 4, stageHull: 20, reviveUsed: false});
  click(w, 'play');
  assert.equal(T.hull(), 20);
});

// Plan F3b, tarea 1: turnos de ataque por tramo.
test('sector stages hand out attack tokens from the ficha', () => {
  for (const [stage, max] of [[1, 1], [4, 2], [7, 3], [10, 2]]) {
    const {T} = harness();
    startAt(T, stage);
    assert.equal(T.ev('sectorAttackTokens?.max'), max, `stage ${stage}`);
  }
  const {T} = harness();
  T.startSideVoyage('S1-V2');
  assert.equal(T.ev('sectorAttackTokens'), null, 'old voyages keep their own rules');
});

test('a removed enemy frees its token in the same frame', () => {
  const {T} = harness();
  startAt(T, 3);
  T.ev("sectorAttackTokens.holders.set('ghost',{bornAt:0,grantedAt:0})");
  T.adv(1 / 60);
  assert.equal(T.ev("sectorAttackTokens.holders.has('ghost')"), false);
});

// Plan F3b, tarea 7: los enemigos de Gaia en el juego.
test('each Gaia roster entry spawns its own enemy', () => {
  for (const [stage, kind] of [[2, 'tracker'], [4, 'aegis'], [7, 'alpha']]) {
    const {T} = harness({query: '?dev=1'});
    startAt(T, stage);
    T.ev('DEV.invulnerable=true');
    let seen = false;
    for (let second = 0; second < 30 && !seen; second++) {
      T.adv(1);
      seen = T.ev(`items.some(item=>item.gaiaEnemy&&item.gaia.kind==='${kind}')`);
    }
    assert.ok(seen, `stage ${stage} brings a ${kind}`);
  }
});

test('a shielded enemy takes shots on its shield first', () => {
  const {T} = harness();
  startAt(T, 3);
  T.ev("classicVoyageHazardTimer=999;classicPatrolTimer=999;items.length=0");
  T.ev("window.__t=createThreat('scout',level());Object.assign(window.__t,{id:'shielded',classicScout:null,x:player.x,baseX:player.x,y:player.y-260,s:0,rot:0,rs:0,amp:0,hp:2,maxHp:2,r:34,shieldHits:3,shieldBy:'keeper'});items.push(window.__t,{id:'keeper',type:'energy',x:-500,y:-500,s:0,r:1,rot:0,rs:0,p:0,phase:0,amp:0,alpha:1})");
  const shoot = () => { T.ev('classicWeapons.charges=Math.max(classicWeapons.charges,1);classicWeapons.cooldown=0;manualShotCooldown=0;fireManualShot()'); T.adv(.35); };
  for (let index = 0; index < 3; index++) shoot();
  assert.deepEqual([T.ev('window.__t.shieldHits'), T.ev('window.__t.hp')], [0, 2]);
  shoot();
  assert.ok(T.ev('window.__t.hp') < 2, 'the fourth shot hurts it');
});

test('the shield disappears when its aegis is gone', () => {
  const {T} = harness();
  startAt(T, 3);
  T.ev("items.push({id:'lonely',type:'scout',x:200,y:300,s:0,r:30,rot:0,rs:0,p:0,phase:0,amp:0,alpha:1,hp:2,maxHp:2,shieldHits:3,shieldBy:'gone'})");
  T.adv(1 / 60);
  assert.equal(T.ev("items.find(item=>item.id==='lonely').shieldHits"), 0);
});

test('mines near the ship are cleared when reviving', () => {
  const {T} = harness();
  startAt(T, 3);
  T.ev("spawnGaiaMine(player.x, player.y-100)");
  assert.equal(T.ev('items.filter(item=>item.gaiaMine).length'), 1);
  T.ev('hull=0'); T.finishGame('hull'); T.resumeReward();
  assert.equal(T.ev('items.filter(item=>item.gaiaMine&&item.y>H*.38).length'), 0);
});

test('new enemies drop the scrap of their stand-in', () => {
  const {T} = harness();
  startAt(T, 3);
  for (const [kind, role] of [['tracker', 'interceptor'], ['sower', 'raider'], ['aegis', 'scout'], ['alpha', 'interceptor']]) {
    assert.equal(T.ev(`spawnGaiaEnemy('${kind}').salvageRole`), role, kind);
  }
});

test('the tracker mark sharpens the pursuers\' aim for 4 seconds', () => {
  const {T} = harness();
  startAt(T, 3);
  T.ev("handleGaiaEvent(spawnGaiaEnemy('tracker'),{type:'mark',seconds:4})");
  T.adv(.1);
  assert.equal(T.ev('player.marked'), true);
  T.adv(4.1);
  assert.equal(T.ev('player.marked'), false);
});

test('Gaia enemies are moved only by their own AI', () => {
  const {T} = harness();
  startAt(T, 3);
  assert.equal(T.ev("spawnGaiaEnemy('alpha').classicScout"), null);
});

// Plan F3b, tarea 8: hordas.
test('horde stages launch a wave every 14 seconds', () => {
  const {T} = harness({query: '?dev=1'});
  startAt(T, 3);
  T.ev('DEV.invulnerable=true');
  T.adv(30);
  assert.equal(T.ev('classicHordeSequence'), 2);
  const {T: other} = harness({query: '?dev=1'});
  startAt(other, 1);
  other.ev('DEV.invulnerable=true');
  other.adv(30);
  assert.equal(other.ev('classicHordeSequence'), 0, 'stages without a horde have none');
});

// Plan F3b, tarea 9: meteoritos dirigidos.
test('aimed stages have no protected corridor and lower attack tokens during the rain', () => {
  const {T} = harness({query: '?dev=1'});
  startAt(T, 4);
  T.ev('DEV.invulnerable=true');
  assert.equal(T.ev('classicCometShower'), null);
  assert.ok(T.ev('Boolean(classicAimedRain)'));
  let lowered = false, meteors = 0;
  for (let second = 0; second < 20; second++) {
    T.adv(1);
    if (T.ev('classicAimedRain&&!classicAimedRain.done')) lowered ||= T.ev('sectorAttackTokens.max') === 1;
    meteors = Math.max(meteors, T.ev('items.filter(item=>item.aimedMeteor).length'));
    assert.equal(T.ev('classicCometCorridor'), null, 'no corridor is drawn');
  }
  assert.ok(meteors > 0, 'meteors fly');
  assert.ok(lowered, 'tokens drop to one while the rain lasts');
});

test('a pending warning is dropped when the ship revives or the stage changes', () => {
  const {T} = harness();
  startAt(T, 4);
  T.ev("classicMeteorWarnings.push({id:'x',x:200,until:elapsed+5});classicAimedRain.pending.push({id:'x',at:99,x:200,y:-40,aim:{x:0,y:0}})");
  T.ev('hull=0'); T.finishGame('hull'); T.resumeReward();
  assert.deepEqual([T.ev('classicMeteorWarnings.length'), T.ev('classicAimedRain.pending.length')], [0, 0]);
  T.ev("classicMeteorWarnings.push({id:'y',x:200,until:elapsed+5})");
  T.toStage(5);
  assert.equal(T.ev('classicMeteorWarnings.length'), 0);
});

// Revisión final F3b: chatarra de los enemigos nuevos y salida del Rastreador.
test('destroyed Gaia enemies and horde units drop scrap', () => {
  const {T} = harness();
  startAt(T, 3);
  for (const make of ["spawnGaiaEnemy('tracker')", "spawnGaiaEnemy('sower')", "spawnGaiaEnemy('aegis')", "spawnGaiaEnemy('alpha')",
    "(spawnHordeWave(1),items.at(-1))"]) {
    const before = T.ev('items.filter(item=>item.salvagePickup).length');
    T.ev(`window.__e=${make};window.__e.y=400;animateScoutHit(window.__e,true)`);
    assert.ok(T.ev('items.filter(item=>item.salvagePickup).length') > before, make);
  }
});

test('a tracker leaves the screen instead of staying behind the ship forever', () => {
  const {T} = harness({query: '?dev=1'});
  startAt(T, 3);
  T.ev('DEV.invulnerable=true;classicPatrolTimer=999;classicHordeTimer=999');
  T.ev("window.__r=spawnGaiaEnemy('tracker')");
  T.adv(25);
  assert.equal(T.ev('items.includes(window.__r)'), false);
});

// El subguardián defiende el tramo 5 (dec-subguardian-plan, 31/10/2026;
// antes el CH-03 del plan F3c).
const subFight = T => { startAt(T, 5); T.ev('DEV.invulnerable=true'); T.adv(9); }; // aparece a los 6 s y entra en 2 s
const aimLaser = "Object.assign(subBoss,{state:'attack',attack:'laser',stateTime:0,beam:{angle:Math.atan2(player.x-subBoss.x,player.y-subBoss.y-NeonCampaign.SUBGUARDIAN_RULES.emitterY),direction:1,active:true}})";

test('the subguardian appears 6 s into stage 5 and holds the route', () => {
  const {T} = harness({query: '?dev=1'});
  subFight(T);
  assert.equal(T.ev('Boolean(subBoss)'), true);
  const elapsed = T.ev('classicFlightView.stageElapsed');
  T.adv(20);
  assert.equal(T.stage(), 5);
  assert.ok(Math.abs(T.ev('classicFlightView.stageElapsed') - elapsed) < .1, 'the stage clock is held');
});

test('patrols stop while the subguardian fights', () => {
  const {T} = harness({query: '?dev=1'});
  subFight(T);
  const patrols = T.ev('classicPatrolSequence');
  T.adv(15);
  assert.equal(T.ev('classicPatrolSequence'), patrols);
});

test('it comes with Atlas\'s 4 escorts, which fall with it', () => {
  const {T} = harness({query: '?dev=1'});
  subFight(T);
  assert.equal(T.ev("items.filter(item=>item.gaia?.kind==='atlasEscort').length"), 4);
  T.ev('NeonCampaign.hitSubguardian(subBoss, 999)');
  T.adv(1 / 60);
  assert.equal(T.ev("items.filter(item=>item.gaia?.kind==='atlasEscort').length"), 0);
});

test('beating the subguardian resumes the route and drops the same scrap as CH-03', () => {
  const {T} = harness({query: '?dev=1'});
  subFight(T);
  T.ev('NeonCampaign.hitSubguardian(subBoss, 999)');
  T.adv(2);
  assert.equal(T.ev('subBoss'), null);
  assert.equal(T.ev('subBossBeaten'), true);
  // La chatarra del jefe vuela hacia la nave: o sigue en pantalla o ya se cobró.
  assert.ok(T.ev("items.some(item=>item.salvagePickup&&item.enemyType==='ch03')||classicSalvageState.activeRun.claimed.some(receipt=>receipt.id==='ch03')"));
  assert.equal(T.toStage(6), 6);
});

test('its laser hurts the ship and shows its splash on it', () => {
  const {T} = harness();
  startAt(T, 5); T.adv(8);
  T.ev(`hullGrace=0;classicHullReserve=0;${aimLaser}`);
  const before = T.hull();
  T.adv(1 / 60);
  assert.equal(before - T.hull(), 14, 'the laser hurts like the CH-03 sweep did');
  assert.equal(T.ev('Boolean(subBossBurn)'), true);
});

test('dying during the subguardian and reviving keeps its damage; retrying restarts at stage 1', () => {
  const {T} = harness();
  startAt(T, 5); T.adv(9);
  T.ev('NeonCampaign.hitSubguardian(subBoss, 15)');
  const hp = T.ev('subBoss.hp');
  assert.ok(hp < 60, 'the hit counted');
  T.ev('hull=0'); T.finishGame('hull'); T.resumeReward();
  assert.equal(T.ev('subBoss.hp'), hp);
  T.finishGame('hull'); T.startLevel(0);
  assert.deepEqual([T.stage(), T.ev('subBoss')], [1, null]);
});

test('the subguardian only fights in the sector', () => {
  const {T} = harness();
  T.startSideVoyage('S1-V2'); T.toStage(5); T.adv(10);
  assert.equal(T.ev('subBoss'), null);
});

// Baliza de reaparición (plan F3c, tarea 4): 40 chatarra en la parada de C9.
const giveScrap = (T, scouts) => T.ev(`for(let i=0;i<${scouts};i++)classicSalvageState=classicSalvageLedger.claimDrop({runId:classicSalvageRunId,dropId:'prueba:'+i,enemyType:'scout'}).state`);
const offerShown = w => w.document.getElementById('beaconOffer').classList.contains('show');
// ?dev=1 guarda aparte, con el prefijo neon-dev-v1:.
const devSave = w => JSON.parse(w.localStorage.getItem(`neon-dev-v1:${KEY}`) || 'null');
const toService = T => { T.ev('DEV.invulnerable=true'); T.adv(4); };

test('after beating the subguardian, C9 offers the beacon', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 5); toService(T);
  assert.equal(offerShown(w), true);
  assert.equal(T.st().state, 'paused');
  assert.equal(w.document.getElementById('beaconBuy').textContent, 'COMPRAR · 40 CHATARRA');
  click(w, 'beaconSkip');
  assert.deepEqual([offerShown(w), T.st().state], [false, 'playing']);
});

test('buying it saves the beacon and charges 40 scrap', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 5); toService(T);
  click(w, 'beaconBuy');
  assert.equal(devSave(w).sectors[1].beacon, true);
  assert.equal(T.ev('classicSalvageState.balance'), 5);
  assert.deepEqual([offerShown(w), T.st().state], [false, 'playing']);
});

test('without enough scrap the button explains it and nothing is charged', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 2); toService(T);
  const buy = w.document.getElementById('beaconBuy');
  assert.equal(buy.disabled, true);
  assert.match(buy.textContent, /FALTAN 22/);
  T.ev('buySectorBeacon()');
  assert.equal(T.ev('classicSalvageState.balance'), 18);
  assert.notEqual(devSave(w).sectors[1]?.beacon, true);
});

test('with the beacon, dying after stage 6 restarts at stage 6; completing the sector clears it', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 5); toService(T);
  click(w, 'beaconBuy');
  T.ev('DEV.invulnerable=false');
  T.toStage(8);
  T.ev('hull=0'); T.finishGame('hull');
  assert.match(w.document.getElementById('retry').textContent, /TRAMO 6/);
  assert.match(w.document.getElementById('supplyStatus').textContent, /baliza/i);
  T.goHome();
  assert.match(w.document.getElementById('playSector').textContent, /CON BALIZA/);
  click(w, 'play');
  assert.equal(T.stage(), 6);
  T.toStage(10); T.finish();
  assert.deepEqual([devSave(w).sectors[1].completed, devSave(w).sectors[1].beacon], [true, false]);
});

test('the panel is not offered twice or when the beacon is already owned', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 5); toService(T);
  click(w, 'beaconSkip');
  T.ev('offerSectorBeacon()'); T.adv(2);
  assert.equal(offerShown(w), false);
  const owned = harness({query: '?dev=1'});
  owned.w.localStorage.setItem(`neon-dev-v1:${KEY}`, JSON.stringify({version: 1, unlocked: 1, sectors: {1: {completed: false, stars: 0, beacon: true}}, run: null}));
  startAt(owned.T, 6); giveScrap(owned.T, 5); toService(owned.T);
  assert.equal(offerShown(owned.w), false);
  const early = harness({query: '?dev=1'});
  startAt(early.T, 4); giveScrap(early.T, 5); early.T.ev('DEV.invulnerable=true'); early.T.toStage(6); early.T.adv(4);
  assert.equal(offerShown(early.w), false, 'sin vencer al subguardián en este intento no se ofrece');
});

// Furia de Atlas (plan F3c, tarea 6): escoltas, drones, rayo y escenario roto.
const atlasFight = T => { startAt(T, 10); T.ev('DEV.invulnerable=true'); toFinish(T); T.adv(3); };

const enrage = T => T.ev("Object.assign(atlasBoss,{state:'exposed',vulnerability:true});for(const e of NeonCampaign.hitGuardianAtlas(atlasBoss,atlasBoss.maxHp-Math.floor(atlasBoss.maxHp*.3)).events)consumeAtlasEvent(e)");
const escorts = T => T.ev("items.filter(item=>item.gaia?.kind==='atlasEscort').length");

test('fury spawns four escorts and never more', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T);
  assert.equal(T.ev('Boolean(atlasBoss)'), true);
  enrage(T);
  assert.equal(T.ev('atlasBoss.phase'), 2);
  assert.equal(escorts(T), 4);
  T.ev("consumeAtlasEvent({type:'fury',escorts:4})");
  assert.equal(escorts(T), 4, 'a second fury event does not add more');
  T.adv(1);
  assert.ok(escorts(T) <= 4);
  T.ev('DEV.invulnerable=false;hull=0'); T.finishGame('hull'); T.resumeReward();
  T.ev("consumeAtlasEvent({type:'fury',escorts:4})");
  assert.equal(escorts(T), 4, 'reviving never leaves more than four');
});

test('drones spawn two CH-01', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T);
  const before = T.ev("items.filter(item=>item.classicScout).length");
  T.ev("consumeAtlasEvent({type:'drones',count:2,x:atlasBoss.x,y:atlasBoss.y})");
  const drones = T.ev("JSON.stringify(items.filter(item=>item.classicScout&&item.atlasDrone).map(item=>({x:item.x,y:item.y,role:item.salvageRole})))");
  assert.equal(T.ev("items.filter(item=>item.classicScout).length"), before + 2);
  for (const drone of JSON.parse(drones)) {
    assert.equal(drone.role, 'scout');
    assert.ok(Math.abs(drone.x - T.ev('atlasBoss.x')) < 140 && Math.abs(drone.y - T.ev('atlasBoss.y')) < 140, 'they leave from Atlas');
  }
});

test('the beam hurts only inside its half', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T);
  T.ev("DEV.invulnerable=false;player.x=player.target=100;hullGrace=0;classicHullReserve=0;items=items.filter(item=>!item.guardianProjectile)");
  const start = T.hull();
  T.ev("consumeAtlasEvent({type:'beam',side:1,x0:W*.55,x1:W,seconds:1.2,damage:26})");
  T.adv(.1);
  assert.equal(T.hull(), start, 'the other half is safe');
  T.ev("atlasBeam=null;hullGrace=0;items=items.filter(item=>!item.guardianProjectile)");
  T.ev("consumeAtlasEvent({type:'beam',side:-1,x0:0,x1:W*.45,seconds:1.2,damage:26})");
  T.adv(.1);
  assert.equal(T.hull(), start - 26);
  T.ev("hullGrace=0;items=items.filter(item=>!item.guardianProjectile)");
  T.adv(.3);
  assert.equal(T.hull(), start - 26, 'one beam hurts once');
  T.adv(1.2);
  assert.equal(T.ev('atlasBeam'), null, 'the beam goes out');
});

test('fury darkens the scene', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T);
  assert.equal(T.ev('atlasFuryScene'), false);
  enrage(T);
  assert.equal(T.ev('atlasFuryScene'), true);
  drawnTexts.length = 0; T.draw();
  assert.ok(drawnTexts.includes('image:assets/atlas_fury_atlas_v1.webp'), 'the broken-ring sheet');
  assert.ok(drawnTexts.includes('image:assets/atlas_escorts_atlas_v1.webp'), 'its escorts');
  T.goHome();
  assert.equal(T.ev('atlasFuryScene'), false);
});

// Revisión final F3c (auditor-codigo): un golpe por barrido del láser.
test('the subguardian laser hurts once per sweep', () => {
  const {T} = harness();
  startAt(T, 5); T.adv(8);
  T.ev(`hullGrace=0;classicHullReserve=0;items=[];${aimLaser};subBoss.attacks++`);
  const before = T.hull();
  T.adv(.4);
  // El mismo barrido vuelve sobre la nave pasada la gracia (como con la nave lejos).
  T.ev("items=[];subBoss.beam.angle=Math.atan2(player.x-subBoss.x,player.y-subBoss.y-NeonCampaign.SUBGUARDIAN_RULES.emitterY)");
  T.adv(.1);
  assert.equal(before - T.hull(), 14, 'one sweep hits once');
});

test('beating the subguardian in stage 5 makes C9 offer the beacon in stage 6', () => {
  const {w, T} = harness({query: '?dev=1'});
  subFight(T); giveScrap(T, 5);
  T.ev('NeonCampaign.hitSubguardian(subBoss, 999)');
  T.adv(2);
  T.toStage(6); T.adv(4);
  assert.equal(offerShown(w), true);
});

test('a beam that starts during the hit grace still burns the ship once the grace ends', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T);
  T.ev("DEV.invulnerable=false;player.x=player.target=100;hullGrace=.3;classicHullReserve=0;items=items.filter(item=>!item.guardianProjectile)");
  const start = T.hull();
  T.ev("consumeAtlasEvent({type:'beam',side:-1,x0:0,x1:W*.45,seconds:1.2,damage:26})");
  T.adv(.1);
  assert.equal(T.hull(), start, 'no damage during the grace');
  T.ev("items=items.filter(item=>!item.guardianProjectile)");
  T.adv(.4);
  assert.equal(T.hull(), start - 26);
});

test('leaving to the menu during the subguardian removes it', () => {
  const {T} = harness();
  startAt(T, 5); T.adv(9);
  assert.equal(T.ev('Boolean(subBoss)'), true);
  T.goHome();
  assert.equal(T.ev('subBoss'), null);
});

test('in fury the open core is drawn with the core animation, not the closed fury pose', () => {
  const {T} = harness({query: '?dev=1'});
  atlasFight(T); enrage(T);
  T.ev("Object.assign(atlasBoss,{state:'exposed',stateTime:0,vulnerability:true,coreExposure:1})");
  drawnTexts.length = 0; T.draw();
  assert.ok(!drawnTexts.includes('image:assets/atlas_fury_atlas_v1.webp'));
  assert.ok(drawnTexts.some(text => text.startsWith('image:') && text.includes('atlas') && !text.includes('fury') && !text.includes('escort')));
  T.ev("Object.assign(atlasBoss,{state:'closed',stateTime:0,vulnerability:false,coreExposure:0})");
  drawnTexts.length = 0; T.draw();
  assert.ok(drawnTexts.includes('image:assets/atlas_fury_atlas_v1.webp'));
});

test('a paid beacon that could not be saved is kept when the panel closes', () => {
  const {w, T} = harness({query: '?dev=1'});
  startAt(T, 6); giveScrap(T, 5); toService(T);
  T.ev("window.__realSave=saveSector;saveSector=()=>false");
  click(w, 'beaconBuy');
  assert.equal(offerShown(w), true, 'the panel stays open and asks to retry');
  T.ev("saveSector=window.__realSave");
  click(w, 'beaconSkip');
  assert.equal(devSave(w)?.sectors?.[1]?.beacon, true);
  assert.equal(T.ev('classicSalvageState.balance'), 5, 'charged once');
});

// Propietario, 24/10: «el nivel se para antes de Atlas». La cuota del tramo 10
// (33) es menor que la del nivel antiguo (36): Atlas debe llegar igual.
test('the sector reaches Atlas with exactly the CRONIUM of the last stage', () => {
  const {T} = harness({query: '?dev=1'});
  startAt(T, 10); T.ev('DEV.invulnerable=true');
  T.ev("for(let i=0;i<40000&&!classicFlight.snapshot().canFinish;i++){collected=Math.max(collected,classicFlightView.stageGoal);classicFlightView=classicFlight.advance(.034,collected,classicFlightEvent);}");
  assert.ok(T.ev('collected<level().goal'), 'the stage quota is below the old level quota');
  T.adv(.5);
  assert.equal(T.ev('Boolean(atlasBoss)'), true);
});

test('sector 1 never drops the floating Gemelo emitter: the weapon is earned by beating Atlas', () => {
  // Normas del propietario (24/10): una arma por jefe; C9 no se abre por recoger una pieza.
  const {w, T} = harness();
  T.startSector('S1');
  let seen = false;
  for (const stage of [2, 3, 4]) {
    T.toStage(stage);
    for (let i = 0; i < 40 && !seen; i++) { T.adv(1); seen = T.ev("items.some(item=>item.type==='flightModule')"); }
  }
  assert.equal(seen, false);
  assert.equal(T.ev('classicEquipment.recoveredTwin'), false);
  assert.equal(w.document.getElementById('openFlightDock').classList.contains('hidden'), true);
});

test('the C9 workshop stays closed in mid-flight during the sector, even after Atlas', () => {
  // Decisión «regla-y-menu» (24/10): C9 se abre entre partidas, no en pleno vuelo.
  const {w, T} = harness();
  startAt(T, 3);
  T.ev("classicEquipment={...classicEquipment,recoveredTwin:true,twinPrepared:true,unlocked:['pulse','twin']};syncClassicFlightHud()");
  T.adv(2);
  assert.equal(T.st().state, 'playing');
  assert.equal(w.document.getElementById('classicC9').classList.contains('hidden'), true);
});

test('the HUD names the sector, not a voyage', () => {
  // Auditoría 25/10 (A6): decía «VIAJE S1».
  const {w, T} = harness();
  T.startSector('S1'); T.adv(.5);
  const level = w.document.getElementById('hudLevel');
  assert.deepEqual([level.previousElementSibling.textContent, level.textContent], ['SECTOR', '1']);
});

test('settings always open at the top of the list', () => {
  // Auditoría 25/10 (A2): la segunda vez se abría a mitad y ocultaba el título.
  const {w, T} = harness();
  const panel = w.document.querySelector('#settingsPanel .settings-panel');
  panel.scrollTop = 400;
  T.ev('openSettings("menu")');
  assert.equal(panel.scrollTop, 0);
});

// Auditoría 25/10 (A4): desde el menú, la Forja tiene un solo botón de salida.
test('the Forja opened from the menu offers one clear way back to the menu', () => {
  const {w, T} = harness();
  T.ev('classicEquipment={...classicEquipment,recoveredTwin:true};syncClassicFlightHud()');
  click(w, 'openFlightDock');
  assert.equal(w.document.getElementById('flightDockContinue').textContent, 'VOLVER AL MENÚ');
  assert.equal(w.document.getElementById('flightDockHome').classList.contains('hidden'), true);
  click(w, 'flightDockContinue');
  assert.equal(T.st().state, 'menu');
});

// HARDCORE (propietario 24/10 y 30/10): partida aparte que se borra entera al
// morir, sin revivir ni baliza; se elige en Ajustes con aviso.
const HC = 'neon-hardcore-v1:';
const hardcoreSettings = JSON.stringify({difficulty: 'hardcore'});
const runAt = stageNumber => JSON.stringify({version: 1, unlocked: 1, sectors: {}, run: {sector: 1, stageNumber, stageHull: 90, reviveUsed: false}});

test('HARDCORE plays its own save and leaves the normal one alone', () => {
  const {w, T} = harness({storage: {'neon-settings-v5': hardcoreSettings, [KEY]: runAt(7), [HC + KEY]: runAt(3)}});
  assert.equal(w.document.body.classList.contains('hardcore-mode'), true);
  click(w, 'play');
  assert.equal(T.stage(), 3, 'the HARDCORE run, not the normal one');
  assert.equal(JSON.parse(w.localStorage.getItem(KEY)).run.stageNumber, 7);
});

test('dying in HARDCORE erases the whole HARDCORE save, with no revive and no beacon', () => {
  const {w, T} = harness({storage: {'neon-settings-v5': hardcoreSettings, [KEY]: runAt(7), [HC + KEY]: runAt(3),
    [HC + 'neonCronium.menu.v1']: JSON.stringify({version: 1, hangar: true, seen: {hangar: true}})}});
  click(w, 'play');
  T.ev('subBossBeaten=true');
  assert.equal(T.ev('offerSectorBeacon()'), false, 'no beacon in HARDCORE');
  T.finishGame('hull');
  assert.equal(rewardShown(w), false, 'no rewarded revive');
  assert.equal(T.ev('resumeReward()'), false);
  assert.deepEqual(Object.keys(w.localStorage).filter(key => key.startsWith(HC)), [], 'nothing of HARDCORE is left');
  assert.equal(JSON.parse(w.localStorage.getItem(KEY)).run.stageNumber, 7, 'the normal save is intact');
  assert.equal(JSON.parse(w.localStorage.getItem('neon-settings-v5')).difficulty, 'hardcore', 'settings are shared and kept');
  assert.match(w.document.getElementById('retry').textContent, /EMPEZAR DE CERO/);
});

test('choosing HARDCORE in Ajustes asks first and only switches after confirming', () => {
  const {w, T} = harness();
  T.ev('reloadGame=()=>{window.__reloaded=(window.__reloaded||0)+1}');
  const select = w.document.getElementById('difficulty'), confirm = w.document.getElementById('hardcoreConfirm');
  select.value = 'hardcore'; select.dispatchEvent(new w.Event('change'));
  assert.equal(confirm.classList.contains('hidden'), false, 'the warning shows');
  assert.equal(T.ev('settings.difficulty'), 'normal', 'nothing changes yet');
  click(w, 'hardcoreNo');
  assert.equal(confirm.classList.contains('hidden'), true);
  assert.equal(select.value, 'normal');
  select.value = 'hardcore'; select.dispatchEvent(new w.Event('change'));
  click(w, 'hardcoreYes');
  assert.equal(JSON.parse(w.localStorage.getItem('neon-settings-v5')).difficulty, 'hardcore');
  assert.equal(w.__reloaded, 1, 'the game restarts on the HARDCORE save');
});

test('leaving HARDCORE in Ajustes goes back to the normal save', () => {
  const {w, T} = harness({storage: {'neon-settings-v5': hardcoreSettings}});
  T.ev('reloadGame=()=>{window.__reloaded=(window.__reloaded||0)+1}');
  const select = w.document.getElementById('difficulty');
  select.value = 'normal'; select.dispatchEvent(new w.Event('change'));
  assert.equal(JSON.parse(w.localStorage.getItem('neon-settings-v5')).difficulty, 'normal');
  assert.equal(w.__reloaded, 1);
});
