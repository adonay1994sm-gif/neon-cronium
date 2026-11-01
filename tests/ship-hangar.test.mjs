import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import * as roster from '../src/game/ship/ship-roster.js';
import {SCRAP_SHIPS, createScrapLedger} from '../src/game/progression/scrap-economy.js';
import {createSectorSave, startSectorRun, completeSector} from '../src/game/progression/sector-save.js';

// Hangar del paso del hangar (30/10/2026): elegir entre las 10 naves de
// SHIP_ROSTER con el arte de GPT. Se ejecuta el código real de la pantalla.
const root=new URL('..',import.meta.url);
const [html,uiSource]=await Promise.all([
  readFile(new URL('index.html',root),'utf8'),
  readFile(new URL('src/game/03-ui-game-flow.js',root),'utf8')
]);
const start=uiSource.indexOf('  function setupShipHangar() {');
const end=uiSource.indexOf('  function updateMenu() {',start);
assert.ok(start>=0&&end>start,'The real hangar setup must be present in the game source');
const hangarSetup=uiSource.slice(start,end);
const fresh=createSectorSave();
const afterAtlas=completeSector(startSectorRun(fresh,1),1,1);
const plain=value=>JSON.parse(JSON.stringify(value));

// Bodega de chatarra real en memoria, con el saldo pedido (en jefes Atlas de 600 y exploradores de 9).
function scrapStorage(balance){
  const map=new Map(),storage={readRaw:key=>({ok:true,value:map.get(key)??null}),setJSON:(key,value)=>{map.set(key,JSON.stringify(value));return true;}};
  const ledger=createScrapLedger({storage}),run=ledger.beginRun({scope:'prueba'});
  let left=balance,n=0;
  while(left>=600){ledger.claimDrop({runId:run.runId,dropId:`a:${n++}`,enemyType:'atlas'});left-=600;}
  while(left>=9){ledger.claimDrop({runId:run.runId,dropId:`s:${n++}`,enemyType:'scout'});left-=9;}
  return storage;
}

function harness(t,{sector=fresh,ships=null,scrap=0}={}){
  const dom=new JSDOM(html,{url:'https://neon.test/',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const {window}=dom;
  let rafRequests=0;
  window.requestAnimationFrame=()=>++rafRequests;
  window.NeonCampaign={...roster,SCRAP_SHIPS};
  window.__HANGAR_INITIAL__={sector,ships,scrapLedger:createScrapLedger({storage:scrapStorage(scrap)})};
  window.eval(`
    const $=id=>document.getElementById(id);
    const canvas=$('canvas'),ui={menu:$('menu'),briefing:$('briefing')};
    let state='menu',shipHangarDraft=null,allowSave=true,flownShip='aster',shipPresentationSignature='old';
    const SPRITES={flightPoses:{}},ensured=[],sounds=[];
    let classicSalvageLedger=window.__HANGAR_INITIAL__.scrapLedger,classicSalvageState=null;
    function loadClassicSalvage(){const r=classicSalvageLedger.load();classicSalvageState=r.ok?r.state:null;return r.ok;}
    function uiSound(cue){sounds.push(cue);}
    const ensureSprite=image=>ensured.push(image===SPRITES.flightPoses?'poses':'other');
    const stored={[NeonCampaign.SHIP_ROSTER_KEY]:window.__HANGAR_INITIAL__.ships};
    const writes=[],messages=[];
    const loadSectorSave=()=>window.__HANGAR_INITIAL__.sector;
    const storage={
      getJSON(key,fallback){return stored[key]??fallback;},
      setJSON(key,value){if(!allowSave)return false;stored[key]=JSON.parse(JSON.stringify(value));writes.push({key,value:stored[key]});return true;}
    };
    function overlay(element){
      for(const node of [ui.menu,ui.briefing,ui.shipHangar].filter(Boolean))node.classList.remove('show');
      if(element)element.classList.add('show');
    }
    function toast(message){messages.push(message);}
    ${hangarSetup}
    setupShipHangar();
    window.__HANGAR_TEST__={
      setup:setupShipHangar,
      setState(value){state=value;},
      allowSave(value){allowSave=value;},
      showBriefing(){overlay(ui.briefing);},
      hideOverlays(){overlay();},
      snapshot(){return {state,draft:shipHangarDraft,writes,messages,flownShip,signature:shipPresentationSignature,ensured,sounds,
        balance:classicSalvageLedger.getBalance(),scrapShips:classicSalvageState?.upgrades.filter(sku=>sku.startsWith('ship-'))||[]};}
    };
  `);
  const document=window.document;
  const node=id=>document.getElementById(id);
  return {
    window,document,node,api:window.__HANGAR_TEST__,
    snapshot:()=>plain(window.__HANGAR_TEST__.snapshot()),
    open:()=>node('openHangar').click(),
    back:()=>node('shipHangarBack').click(),
    apply:()=>node('shipApply').click(),
    pick:id=>document.querySelector(`[data-ship="${id}"]`).click(),
    slot:id=>document.querySelector(`[data-ship="${id}"]`),
    keyboard(target,key,extra={}){
      const event=new window.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extra});
      target.dispatchEvent(event);return event;
    },
    raf:()=>rafRequests
  };
}

test('the hangar is set up once, as a dialog with the 10 ships in roster order',t=>{
  const h=harness(t);
  h.api.setup();
  assert.equal(h.document.querySelectorAll('#openHangar').length,1);
  assert.equal(h.document.querySelectorAll('#shipHangar').length,1);
  assert.equal(h.node('shipHangar').getAttribute('role'),'dialog');
  assert.equal(h.node('shipHangar').getAttribute('aria-modal'),'true');
  assert.deepEqual([...h.document.querySelectorAll('[data-ship]')].map(slot=>slot.dataset.ship),roster.SHIP_ROSTER.map(ship=>ship.id));
  assert.equal(h.node('shipHangar').classList.contains('hidden'),true);
  h.open();
  assert.equal(h.node('shipHangar').classList.contains('show'),true);
  assert.equal(h.node('menu').classList.contains('show'),false);
  assert.equal(h.snapshot().draft,'aster','it opens on the ship you fly');
  assert.equal(h.node('shipHangarName').textContent,'ASTÉR');
  assert.equal(h.document.activeElement,h.node('shipHangar').querySelector('.ship-hangar-panel'));
  assert.equal(h.raf(),0);
});

test('every ship can be looked at; one you do not have says how to get it and cannot be flown',t=>{
  const h=harness(t);
  h.open();
  assert.equal(h.slot('aster').classList.contains('is-chosen'),true);
  assert.equal(h.slot('bastion').classList.contains('is-locked'),true);
  assert.equal(h.slot('vertice').querySelector('em').textContent,'2,5K');
  assert.equal(h.slot('titan').classList.contains('is-paid'),true);
  h.pick('vertice');
  assert.equal(h.node('shipHangarName').textContent,'VÉRTICE');
  assert.equal(h.node('hangarExclusiveName').textContent,'Lanza');
  assert.equal(h.node('hangarUltimateName').textContent,'Prisma');
  assert.match(h.node('shipHangarStatus').textContent,/Cuesta 2\.500 de chatarra\. Tienes 0: te faltan 2\.500\./);
  assert.equal(h.node('shipApply').textContent,'COMPRAR · 2.500');
  assert.equal(h.node('shipApply').disabled,true,'not enough scrap');
  h.pick('bastion');
  assert.match(h.node('shipHangarStatus').textContent,/jefe del sector 1/);
  h.apply();
  assert.equal(h.snapshot().writes.length,0,'nothing is saved for a ship you do not have');
  h.back();
  assert.equal(h.snapshot().draft,null);
  assert.equal(h.node('menu').classList.contains('show'),true);
  assert.equal(h.document.activeElement,h.node('openHangar'));
});

test('after beating Atlas, Bastión can be chosen and the choice is saved',t=>{
  const h=harness(t,{sector:afterAtlas});
  h.open();
  assert.equal(h.slot('bastion').classList.contains('is-locked'),false);
  assert.equal(h.node('shipApply').disabled,true,'the ship you already fly needs no apply');
  h.pick('bastion');
  assert.equal(h.node('shipApply').disabled,false);
  assert.equal(h.node('shipApply').textContent,'PILOTAR BASTIÓN');
  h.apply();
  assert.deepEqual(h.snapshot().writes,[{key:roster.SHIP_ROSTER_KEY,value:{version:1,selected:'bastion',bought:[]}}]);
  assert.deepEqual(h.snapshot().messages,['Nave elegida: Bastión']);
  assert.equal(h.snapshot().flownShip,'bastion','the next flight uses the chosen ship');
  assert.deepEqual(h.snapshot().ensured,['poses']);
  assert.equal(h.snapshot().signature,'','the menu ship is redrawn');
  assert.equal(h.node('shipHangar').classList.contains('hidden'),true);
  h.open();
  assert.equal(h.snapshot().draft,'bastion');
  assert.equal(h.slot('bastion').classList.contains('is-chosen'),true);
});

test('a failed save keeps the ship you fly and the hangar open to try again',t=>{
  const h=harness(t,{sector:afterAtlas});
  h.open();h.pick('bastion');h.api.allowSave(false);h.apply();
  assert.equal(h.snapshot().writes.length,0);
  assert.equal(h.node('shipHangar').classList.contains('show'),true);
  assert.match(h.node('shipHangarStatus').textContent,/No se pudo guardar/);
  h.api.allowSave(true);h.apply();
  assert.equal(h.snapshot().writes.length,1);
});

test('a broken ship save opens on Astér without writing anything',t=>{
  const h=harness(t,{ships:{version:1,selected:'titan',bought:['titan']}});
  h.open();
  assert.equal(h.snapshot().draft,'aster');
  h.back();
  assert.equal(h.snapshot().writes.length,0);
});

test('the hangar cannot open during a run or behind an unrelated overlay',t=>{
  const h=harness(t);
  for(const state of ['playing','paused','gameover','complete','destroying']){
    h.api.setState(state);h.open();
    assert.equal(h.node('shipHangar').classList.contains('show'),false,state);
    assert.equal(h.snapshot().draft,null,state);
  }
  h.api.setState('menu');h.api.hideOverlays();h.open();
  assert.equal(h.node('shipHangar').classList.contains('show'),false);
  h.api.showBriefing();h.open();
  assert.equal(h.node('shipHangar').classList.contains('show'),true,'a non-running briefing permits preparation');
});

test('keyboard focus stays in the dialog; Escape closes without saving or reaching the game',t=>{
  const h=harness(t,{sector:afterAtlas});
  let gameplayKeys=0;h.window.addEventListener('keydown',()=>gameplayKeys++);
  h.open();h.pick('bastion');
  const panel=h.node('shipHangar').querySelector('.ship-hangar-panel');
  const first=h.slot('aster'),last=h.node('shipApply');
  panel.focus();
  assert.equal(h.keyboard(panel,'Tab',{shiftKey:true}).defaultPrevented,true);
  assert.equal(h.document.activeElement,last);
  assert.equal(h.keyboard(last,'Tab').defaultPrevented,true);
  assert.equal(h.document.activeElement,first);
  assert.equal(h.keyboard(first,'Escape').defaultPrevented,true);
  assert.equal(h.document.activeElement,h.node('openHangar'));
  assert.equal(h.node('menu').classList.contains('show'),true);
  assert.equal(h.snapshot().draft,null);
  assert.equal(h.snapshot().writes.length,0);
  assert.equal(gameplayKeys,0,'hangar keys cannot steer or pause the game');
  assert.equal(h.raf(),0);
});

test('the saved ship is the one that flies from the start, and Astér needs no pose atlas',t=>{
  const h=harness(t,{sector:afterAtlas,ships:{version:1,selected:'bastion',bought:[]}});
  assert.equal(h.snapshot().flownShip,'bastion');
  assert.deepEqual(h.snapshot().ensured,['poses']);
  const plainStart=harness(t);
  assert.equal(plainStart.snapshot().flownShip,'aster');
  assert.deepEqual(plainStart.snapshot().ensured,[]);
});

// Compra con chatarra (01/11/2026, dec-hangar-cierre y dec-precios-naves).
test('with enough scrap a scrap ship is bought once, charged in the scrap ledger and flown', t=>{
  const h=harness(t,{scrap:3000});
  h.open();h.pick('vertice');
  assert.match(h.node('shipHangarStatus').textContent,/Tienes 3\.000\./);
  assert.equal(h.node('shipApply').disabled,false);
  h.apply();
  const snap=h.snapshot();
  assert.equal(snap.balance,500);
  assert.deepEqual(snap.scrapShips,['ship-vertice']);
  assert.deepEqual(snap.writes,[{key:roster.SHIP_ROSTER_KEY,value:{version:1,selected:'vertice',bought:['vertice']}}]);
  assert.deepEqual(snap.messages,['Nave comprada: Vértice']);
  assert.equal(snap.flownShip,'vertice');
  assert.deepEqual(snap.sounds,['confirm']);
  h.open();h.pick('vertice');
  assert.equal(h.node('shipApply').textContent,'PILOTAR VÉRTICE');
  assert.equal(h.snapshot().balance,500,'never charged twice');
});

test('a bought ship stays yours even if the ship save was lost (the scrap ledger rules)', t=>{
  const h=harness(t,{scrap:3000});
  h.open();h.pick('vertice');h.api.allowSave(false);h.apply();
  assert.equal(h.snapshot().balance,500,'charged');
  assert.match(h.node('shipHangarStatus').textContent,/Comprada, pero no se pudo elegir/);
  assert.equal(h.node('shipApply').textContent,'PILOTAR VÉRTICE');
  h.api.allowSave(true);h.apply();
  assert.equal(h.snapshot().balance,500,'the retry does not charge again');
  assert.equal(h.snapshot().flownShip,'vertice');
});

test('without enough scrap nothing is charged and the hangar says how much is missing', t=>{
  const h=harness(t,{scrap:7200});
  h.open();h.pick('mantarraya');
  assert.equal(h.node('shipApply').disabled,true);
  assert.match(h.node('shipHangarStatus').textContent,/te faltan 800\./);
  h.apply();
  assert.equal(h.snapshot().balance,7200);
  assert.equal(h.snapshot().writes.length,0);
  h.pick('titan');
  assert.equal(h.node('shipApply').textContent,'NO LA TIENES','paid ships wait for the store');
});
