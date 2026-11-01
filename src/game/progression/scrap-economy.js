/**
 * Classic-only salvage ledger. One localStorage value commits money, the
 * purchased entitlement and its receipt together. It deliberately knows
 * nothing about campaign saves, weapon ownership, rendering or browser time.
 */
export const SCRAP_ECONOMY_KEY = 'neonCronium.classicSalvage.v1';
export const SCRAP_ECONOMY_RULES = Object.freeze({
  version: 1, revision: 2, silver: 100000, gold: 10000000, stellar: 100000000,
  baseHullReserve: 30, reinforcedHullReserve: 45, maxMissiles: 3, missileUnitPrice: 6,
  maxDropReceipts: 512, maxPurchaseReceipts: 128, maxInvalidBackups: 8
});

import {SHIP_ROSTER} from '../ship/ship-roster.js';

export const SCRAP_REWARDS = Object.freeze({raider: 6, scout: 9, interceptor: 15, atlas: 600, debris: 6, satellite: 18, ch03: 120});
const upgrade = definition => Object.freeze({...definition,
  requires: Object.freeze([...(definition.requires || [])]),
  receiptPrices: Object.freeze([...(definition.receiptPrices || [definition.price])])});
export const SCRAP_UPGRADES = Object.freeze({
  'twin-preparation': upgrade({id: 'twin-preparation', price: 24,
    label: 'Preparar emisor', description: 'Prepara la pieza recuperada; Gemelo sigue requiriendo vencer a Atlas.'}),
  'hull-reinforcement': upgrade({id: 'hull-reinforcement', price: 30,
    label: 'Blindaje I', branch: 'defense', rank: 1, description: 'Amplía la reserva de integridad de 30 a 45; absorbe daño sin temporizador.'}),
  'coolant-feed': upgrade({id: 'coolant-feed', price: 45,
    label: 'Refrigeración I', branch: 'cooling', rank: 1, description: 'Recupera un proyectil cada 1,5 segundos en lugar de cada dos.'}),
  'hull-plating-ii': upgrade({id: 'hull-plating-ii', price: 90, branch: 'defense', rank: 2,
    requires: ['hull-reinforcement'], label: 'Blindaje II',
    description: 'Amplía la reserva de casco de 45 a 65. No repara la reserva ya consumida.'}),
  'coolant-feed-ii': upgrade({id: 'coolant-feed-ii', price: 110, branch: 'cooling', rank: 2,
    requires: ['coolant-feed'], label: 'Refrigeración II',
    description: 'Recupera un proyectil cada segundo de vuelo; conserva la carga y recuperación en curso.'}),
  'weapon-scatter': upgrade({id: 'weapon-scatter', retired: true, price: 70, weaponId: 'scatter', branch: 'scatter', rank: 1,
    requires: ['twin-preparation'], label: 'Abanico I',
    description: 'Tres pulsos divergentes de 1 de daño; alcance corto para interceptar grupos cercanos.',
    tradeoff: 'Exige acercarse: sus pulsos se disipan antes que un Phaser.'}),
  'scatter-focus': upgrade({id: 'scatter-focus', retired: true, price: 120, weaponId: 'scatter', branch: 'scatter', rank: 2,
    requires: ['weapon-scatter'], label: 'Abanico II · convergencia',
    description: 'Concentra la apertura de 18° a 13° y amplía el alcance de 224 a 317; mantiene tres pulsos.',
    tradeoff: 'Gana alcance pero cubre menos anchura.'}),
  'weapon-needle': upgrade({id: 'weapon-needle', retired: true, price: 95, weaponId: 'needle', branch: 'needle', rank: 1,
    requires: ['twin-preparation'], label: 'Aguja I',
    description: 'Proyectil estrecho de 2 de daño que perfora hasta tres objetivos alineados.',
    tradeoff: 'Menor anchura de impacto y cadencia más lenta que el Phaser.'}),
  'needle-resonance': upgrade({id: 'needle-resonance', retired: true, price: 140, weaponId: 'needle', branch: 'needle', rank: 2,
    requires: ['weapon-needle'], label: 'Aguja II · resonancia',
    description: 'Perfora cuatro objetivos y dispara cada 0,46 s en lugar de cada 0,56 s.',
    tradeoff: 'Mantiene el daño directo de 2: destaca frente a objetivos alineados.'})
});
// Abanico y Aguja salieron de la Forja (dec-armas-plan, 01/11/2026): siguen
// aquí solo para leer guardados antiguos; al cargar se devuelve su chatarra.
export const RETIRED_UPGRADES = Object.freeze(Object.keys(SCRAP_UPGRADES).filter(sku => SCRAP_UPGRADES[sku].retired));
// Niveles 2 a 4 de Pulso y Gemelo, comprados en el hangar (dec-armas-plan).
export const SCRAP_WEAPON_LEVELS = Object.freeze(Object.fromEntries(['pulse', 'twin'].flatMap(weaponId =>
  [[2, 300], [3, 800], [4, 1800]].map(([level, price]) => [`level-${weaponId}-${level}`, upgrade({id: `level-${weaponId}-${level}`,
    weaponId, level, price, requires: level > 2 ? [`level-${weaponId}-${level - 1}`] : [], label: `Nivel ${level}`})]))));
// Naves de chatarra del hangar (01/11/2026): la compra se apunta aquí, en el
// mismo guardado que resta la chatarra. No salen en la Forja C9.
export const SCRAP_SHIPS = Object.freeze(Object.fromEntries(SHIP_ROSTER.filter(ship => ship.access.type === 'scrap')
  .map(ship => [`ship-${ship.id}`, upgrade({id: `ship-${ship.id}`, shipId: ship.id, price: ship.access.price, label: ship.name})])));
const catalogue = sku => SCRAP_UPGRADES[sku] || SCRAP_SHIPS[sku] || SCRAP_WEAPON_LEVELS[sku];
const inCatalogue = sku => has(SCRAP_UPGRADES, sku) || has(SCRAP_SHIPS, sku) || has(SCRAP_WEAPON_LEVELS, sku);

// Consumibles: se gastan y se pueden volver a comprar. No ocupan recibos de
// mejoras: el registro guarda lo gastado en ellos y el último recibo (como los
// misiles), y acepta el precio que se pagó aunque luego cambie.
export const SCRAP_CONSUMABLES = Object.freeze({'sector-beacon': Object.freeze({price: 40})});

const integer = value => Number.isSafeInteger(value) && value >= 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && value.length > 0 && value.length <= 160 &&
  !/[\u0000-\u001f\u007f]/.test(value);
const copy = value => JSON.parse(JSON.stringify(value));
const has = (value, key) => Object.hasOwn(value, key);
const enemyAliases = Object.freeze({'ch-01': 'scout', 'ch01': 'scout', 'ch-02': 'interceptor',
  'ch02': 'interceptor', 'guardian-atlas': 'atlas',
  'ship-fragment': 'debris', 'satellite-fragment': 'satellite'});
const enemyName = type => typeof type !== 'string' ? null : has(SCRAP_REWARDS, type) ? type :
  has(enemyAliases, type) ? enemyAliases[type] : null;

export function rewardForEnemy(type) {
  const name = enemyName(type);
  return name === null ? 0 : SCRAP_REWARDS[name];
}

export function hullReserveCapacity(record) {
  const upgrades = Array.isArray(record?.upgrades) ? record.upgrades : [];
  return upgrades.includes('hull-plating-ii') ? 65 :
    upgrades.some(sku => sku === 'hull-reinforcement' || sku === 'shield-cell')
      ? SCRAP_ECONOMY_RULES.reinforcedHullReserve : SCRAP_ECONOMY_RULES.baseHullReserve;
}

/** Independent effect snapshots projected only from a complete paid ledger. */
export function classicWorkshopState(record) {
  const saved = normalizeScrapRecord(record);
  const upgrades = saved?.upgrades || [];
  const owns = sku => upgrades.includes(sku);
  return {reserveCapacity: hullReserveCapacity(saved),
    rechargeSeconds: owns('coolant-feed-ii') ? 1 : owns('coolant-feed') ? 1.5 : 2,
    defenseRank: owns('hull-plating-ii') ? 2 : owns('hull-reinforcement') ? 1 : 0,
    coolingRank: owns('coolant-feed-ii') ? 2 : owns('coolant-feed') ? 1 : 0,
    weaponIds: [],
    weaponLevels: Object.fromEntries(['pulse', 'twin'].map(id => [id, owns(`level-${id}-4`) ? 4 : owns(`level-${id}-3`) ? 3 : owns(`level-${id}-2`) ? 2 : 1])),
    weaponRanks: {scatter: owns('scatter-focus') ? 2 : owns('weapon-scatter') ? 1 : 0,
      needle: owns('needle-resonance') ? 2 : owns('weapon-needle') ? 1 : 0}};
}

const upgradeName = sku => sku === 'shield-cell' ? 'hull-reinforcement' : sku;
// Recompensas que ya se pagaron con otro valor: al ajustar una cifra, añade
// aquí la anterior para que los recibos guardados sigan siendo válidos.
const REWARD_HISTORY = Object.freeze({atlas: Object.freeze([180]), ch03: Object.freeze([120])});
const historicalReward = (type, amount) => amount === SCRAP_REWARDS[type] || (REWARD_HISTORY[type] || []).includes(amount);
const operationSequence = (id, prefix) => {
  if(typeof id!=='string'||!id.startsWith(prefix))return null;
  const tail=id.slice(prefix.length);
  if(!/^[1-9]\d*$/.test(tail))return null;
  const sequence=Number(tail);
  return Number.isSafeInteger(sequence)?sequence:null;
};

/** No rounded shorthand: the visible exchange rates always retain the base remainder. */
export function formatDenominations(balance) {
  if (!integer(balance)) throw new TypeError('Salvage balance must be a nonnegative safe integer');
  let remaining = balance;
  const stellar = Math.floor(remaining / SCRAP_ECONOMY_RULES.stellar);
  remaining %= SCRAP_ECONOMY_RULES.stellar;
  const gold = Math.floor(remaining / SCRAP_ECONOMY_RULES.gold);
  remaining %= SCRAP_ECONOMY_RULES.gold;
  const silver = Math.floor(remaining / SCRAP_ECONOMY_RULES.silver);
  const scrap = remaining % SCRAP_ECONOMY_RULES.silver;
  const parts = [[stellar, 'estelar', 'estelares'], [gold, 'oro', 'oro'],
    [silver, 'plata', 'plata'], [scrap, 'chatarra', 'chatarra']]
    .filter(([amount]) => amount > 0).map(([amount, singular, plural]) =>
      `${amount} ${amount === 1 ? singular : plural}`);
  return {scrap, silver, gold, stellar, label: parts.join(' · ') || '0 chatarra'};
}

export function createScrapRecord() {
  return {version: 1, revision: 2, balance: 0, earned: 0, spent: 0, runSequence: 0,
    activeRun: null, upgrades: [], purchases: [], missileAmmo: 3, missileShotsSpent: 0,
    missileRoundsPurchased: 0, missileRefillSequence: 0, lastMissileRefill: null,
    consumableSpent: 0, lastConsumable: null};
}

/** Unknown versions and malformed monetary relationships are never migrated by guessing. */
export function normalizeScrapRecord(value) {
  const legacy=object(value)&&!has(value,'revision')&&['missileAmmo','missileShotsSpent',
    'missileRoundsPurchased','missileRefillSequence','lastMissileRefill'].every(key=>!has(value,key));
  const upgrades=Array.isArray(value?.upgrades)?value.upgrades.map(upgradeName):[];
  if (!object(value) || value.version !== 1 ||
      (!legacy&&value.revision!==SCRAP_ECONOMY_RULES.revision) ||
      !['balance', 'earned', 'spent', 'runSequence'].every(key => integer(value[key])) ||
      value.earned < value.spent || value.balance !== value.earned - value.spent ||
      !Array.isArray(value.upgrades) || value.upgrades.length > Object.keys(SCRAP_UPGRADES).length + Object.keys(SCRAP_SHIPS).length + Object.keys(SCRAP_WEAPON_LEVELS).length ||
      upgrades.some(sku => typeof sku !== 'string' || !inCatalogue(sku)) ||
      new Set(upgrades).size !== upgrades.length ||
      !Array.isArray(value.purchases) || value.purchases.length > SCRAP_ECONOMY_RULES.maxPurchaseReceipts) return null;
  const missileAmmo=legacy?3:value.missileAmmo;
  const missileShotsSpent=legacy?0:value.missileShotsSpent;
  const missileRoundsPurchased=legacy?0:value.missileRoundsPurchased;
  const missileRefillSequence=legacy?0:value.missileRefillSequence;
  const lastMissileRefill=legacy?null:value.lastMissileRefill;
  if(![missileAmmo,missileShotsSpent,missileRoundsPurchased,missileRefillSequence].every(integer)||
    missileAmmo>SCRAP_ECONOMY_RULES.maxMissiles||
    !Number.isSafeInteger(missileRoundsPurchased*SCRAP_ECONOMY_RULES.missileUnitPrice)||
    !Number.isSafeInteger(SCRAP_ECONOMY_RULES.maxMissiles+missileRoundsPurchased)||
    SCRAP_ECONOMY_RULES.maxMissiles+missileRoundsPurchased-missileShotsSpent!==missileAmmo||
    missileRoundsPurchased<missileRefillSequence||missileRoundsPurchased>missileRefillSequence*3)return null;
  if(missileRefillSequence===0) {
    if(lastMissileRefill!==null)return null;
  } else if(!object(lastMissileRefill)||lastMissileRefill.sequence!==missileRefillSequence||
    lastMissileRefill.id!==`c9:missiles:${missileRefillSequence}`||!integer(lastMissileRefill.amount)||
    lastMissileRefill.amount<1||lastMissileRefill.amount>3||
    lastMissileRefill.price!==lastMissileRefill.amount*SCRAP_ECONOMY_RULES.missileUnitPrice)return null;
  // Guardados anteriores a la baliza no tienen estos campos.
  const consumableSpent=has(value,'consumableSpent')?value.consumableSpent:0;
  const lastConsumable=has(value,'lastConsumable')?value.lastConsumable:null;
  if(!integer(consumableSpent))return null;
  if(lastConsumable===null) {
    if(consumableSpent!==0)return null;
  } else if(!object(lastConsumable)||!identifier(lastConsumable.id)||typeof lastConsumable.sku!=='string'||
    !has(SCRAP_CONSUMABLES,lastConsumable.sku)||!integer(lastConsumable.price)||lastConsumable.price<1||
    lastConsumable.price>consumableSpent)return null;
  const transactionIds = new Set(), purchased = new Set();
  let spent = 0;
  for (const receipt of value.purchases) {
    const sku=upgradeName(receipt?.sku);
    if (!object(receipt) || !identifier(receipt.id) || transactionIds.has(receipt.id) || typeof sku !== 'string' ||
        !inCatalogue(sku) || purchased.has(sku) ||
        !catalogue(sku).receiptPrices.includes(receipt.price)) return null;
    transactionIds.add(receipt.id); purchased.add(sku); spent += receipt.price;
  }
  if ([...purchased].some(sku => catalogue(sku).requires.some(required => !purchased.has(required)))) return null;
  if (spent+missileRoundsPurchased*SCRAP_ECONOMY_RULES.missileUnitPrice+consumableSpent !== value.spent || upgrades.length !== purchased.size ||
      upgrades.some(sku => !purchased.has(sku))) return null;
  if (value.activeRun !== null) {
    const run = value.activeRun;
    if (!object(run) || run.sequence !== value.runSequence || run.sequence < 1 ||
        run.id !== `salvage-run:${run.sequence}` || !identifier(run.scope) ||
        !Array.isArray(run.claimed) || run.claimed.length > SCRAP_ECONOMY_RULES.maxDropReceipts) return null;
    const dropIds = new Set();
    let earnedThisRun = 0;
    for (const receipt of run.claimed) {
      if (!object(receipt) || !identifier(receipt.id) || dropIds.has(receipt.id) ||
          typeof receipt.enemyType !== 'string' || !has(SCRAP_REWARDS, receipt.enemyType) ||
          !historicalReward(receipt.enemyType,receipt.amount)) return null;
      dropIds.add(receipt.id); earnedThisRun += receipt.amount;
    }
    if (earnedThisRun > value.earned) return null;
  } else if (value.runSequence !== 0) return null;
  // Preserve only the public v1 data, not caller prototypes or optional callbacks.
  return {version: 1, revision: 2, balance: value.balance, earned: value.earned, spent: value.spent,
    runSequence: value.runSequence, activeRun: value.activeRun === null ? null : {
      id: value.activeRun.id, scope: value.activeRun.scope, sequence: value.activeRun.sequence,
      claimed: value.activeRun.claimed.map(receipt => ({id: receipt.id,
        enemyType: receipt.enemyType, amount: receipt.amount}))},
    upgrades, purchases: value.purchases.map(receipt => ({
      id: receipt.id, sku: upgradeName(receipt.sku), price: receipt.price})),
    missileAmmo,missileShotsSpent,missileRoundsPurchased,missileRefillSequence,
    lastMissileRefill:lastMissileRefill===null?null:{id:lastMissileRefill.id,
      sequence:lastMissileRefill.sequence,amount:lastMissileRefill.amount,price:lastMissileRefill.price},
    consumableSpent,lastConsumable:lastConsumable===null?null:{id:lastConsumable.id,sku:lastConsumable.sku,price:lastConsumable.price}};
}

/**
 * Supply stable enemy IDs (stage + deterministic spawn serial) as dropId.
 * beginRun() resumes the durable run by default. Only a deliberate new
 * expedition uses fresh:true; restoring a checkpoint must not reset receipts.
 * Receipt capacity is bounded without evicting any ID during that run.
 */
export function createScrapLedger({storage, key = SCRAP_ECONOMY_KEY} = {}) {
  if (!storage || typeof storage.readRaw !== 'function' || typeof storage.setJSON !== 'function' ||
      !identifier(key)) throw new TypeError('Tagged readRaw/setJSON storage and a valid save key are required');
  const backupKey = `${key}:invalid-backups`;
  const migrationBackupKey = `${key}:migration-backups`;
  let current = null;
  const blocked = (reason, extra = {}) => ({ok: false, status: 'blocked', reason, ...extra});
  const success = (status, extra = {}) => ({ok: true, status, state: copy(current), ...extra});
  function read(target) {
    try {
      const result = storage.readRaw(target);
      return result?.ok === true && (result.value === null || typeof result.value === 'string')
        ? result : {ok: false};
    } catch { return {ok: false}; }
  }
  function writeJSON(target, value) {
    try { return storage.setJSON(target, value) === true; } catch { return false; }
  }
  function backupRaw(raw,target) {
    const loaded = read(target);
    if (!loaded.ok) return blocked('backup-read-denied', {key: target});
    let records = [];
    if (loaded.value !== null) {
      try {
        const backup = JSON.parse(loaded.value);
        if (!object(backup) || backup.version !== 1 || !Array.isArray(backup.records) ||
            backup.records.length > SCRAP_ECONOMY_RULES.maxInvalidBackups ||
            backup.records.some(record => typeof record !== 'string')) return blocked('invalid-backup', {key: target});
        records = backup.records;
      } catch { return blocked('invalid-backup', {key: target}); }
    }
    if (records.includes(raw)) return {ok:true};
    if (records.length >= SCRAP_ECONOMY_RULES.maxInvalidBackups) return blocked('backup-capacity', {key: target});
    const snapshot = {version: 1, records: [...records, raw]};
    writeJSON(target, snapshot);
    const after=read(target);
    return after.ok&&after.value===JSON.stringify(snapshot)?{ok:true}
      :blocked('backup-write-denied',{key:target});
  }
  function preserveInvalid(raw) {
    const saved=backupRaw(raw,backupKey);
    if(!saved.ok)return saved;
    return blocked('invalid-save-backed-up', {key, backupKey});
  }
  function readState() {
    current = null;
    const loaded = read(key);
    if (!loaded.ok) return {error: blocked('storage-read-denied', {key})};
    if (loaded.value === null) {
      current = createScrapRecord();
      return {raw: null};
    }
    let parsed;
    try { parsed = JSON.parse(loaded.value); } catch { return {error: preserveInvalid(loaded.value)}; }
    if (object(parsed) && integer(parsed.version) && parsed.version !== 1) {
      return {error: blocked('unsupported-save-version', {key})};
    }
    if(object(parsed)&&has(parsed,'revision')&&integer(parsed.revision)&&parsed.revision!==2) {
      return {error:blocked('unsupported-save-revision',{key})};
    }
    current = normalizeScrapRecord(parsed);
    if(current===null)return {error:preserveInvalid(loaded.value)};
    const retired=current.purchases.filter(receipt=>RETIRED_UPGRADES.includes(receipt.sku));
    const migrating=!has(parsed,'revision')||parsed.upgrades.includes('shield-cell')||
      parsed.purchases.some(receipt=>receipt.sku==='shield-cell')||retired.length>0;
    if(retired.length) {
      // Devolución de Abanico y Aguja: se quitan con sus recibos y se devuelve lo pagado.
      const refund=retired.reduce((total,receipt)=>total+receipt.price,0);
      current={...current,balance:current.balance+refund,spent:current.spent-refund,
        upgrades:current.upgrades.filter(sku=>!RETIRED_UPGRADES.includes(sku)),
        purchases:current.purchases.filter(receipt=>!RETIRED_UPGRADES.includes(receipt.sku))};
    }
    if(migrating) {
      const backup=backupRaw(loaded.value,migrationBackupKey);
      if(!backup.ok){current=null;return {error:backup};}
      const migrated=commit(current,loaded.value);
      return migrated.ok?{raw:JSON.stringify(current),migrated:true}:{error:migrated};
    }
    return {raw:loaded.value};
  }
  function commit(next, beforeRaw, extra = {}) {
    const normalized = normalizeScrapRecord(next);
    if (normalized === null) throw new TypeError('Invalid salvage transaction');
    const before = read(key);
    if (!before.ok) { current = null; return blocked('storage-read-denied', {key}); }
    if (before.value !== beforeRaw) { current = null; return blocked('save-conflict', {key}); }
    const snapshot = copy(normalized);
    const written = writeJSON(key, snapshot);
    // An interrupted facade can report false after the atomic set completed.
    // Verification recognizes that commit; an uncertain write never grants UI success.
    const after = read(key);
    if (!after.ok || after.value !== JSON.stringify(snapshot)) {
      current = null;
      return blocked(after.ok && written ? 'save-conflict' : 'storage-write-denied', {key});
    }
    current = normalized;
    return success('committed', extra);
  }
  function load() {
    const loaded = readState();
    return loaded.error || success(loaded.migrated?'migrated':loaded.raw === null ? 'new' : 'loaded');
  }
  function beginRun({scope, fresh = false} = {}) {
    if (!identifier(scope) || typeof fresh !== 'boolean') throw new TypeError('A stable run scope and boolean fresh flag are required');
    const loaded = readState();
    if (loaded.error) return loaded.error;
    if (current.activeRun && !fresh) {
      if (current.activeRun.scope !== scope) return blocked('run-scope-conflict', {runId: current.activeRun.id});
      return success('resumed', {runId: current.activeRun.id, duplicate: true});
    }
    if (current.runSequence === Number.MAX_SAFE_INTEGER) return blocked('run-capacity');
    const next = copy(current), sequence = next.runSequence + 1;
    next.runSequence = sequence;
    next.activeRun = {id: `salvage-run:${sequence}`, sequence, scope, claimed: []};
    return commit(next, loaded.raw, {runId: next.activeRun.id});
  }
  function claimDrop({runId, dropId, enemyType} = {}) {
    const type = enemyName(enemyType);
    if (!identifier(runId) || !identifier(dropId) || type === null) throw new TypeError('A known enemy and stable run/drop IDs are required');
    const loaded = readState();
    if (loaded.error) return loaded.error;
    if (!current.activeRun || current.activeRun.id !== runId) return blocked('inactive-run');
    const prior = current.activeRun.claimed.find(receipt => receipt.id === dropId);
    if (prior) return prior.enemyType === type
      ? success('duplicate', {duplicate: true, amount: 0, originalAmount: prior.amount})
      : blocked('drop-id-conflict');
    if (current.activeRun.claimed.length >= SCRAP_ECONOMY_RULES.maxDropReceipts) return blocked('drop-receipt-capacity');
    const amount = SCRAP_REWARDS[type];
    if (!Number.isSafeInteger(current.earned + amount)) return blocked('balance-capacity');
    const next = copy(current);
    next.balance += amount; next.earned += amount;
    next.activeRun.claimed.push({id: dropId, enemyType: type, amount});
    return commit(next, loaded.raw, {amount, duplicate: false, runId, dropId});
  }
  function refillMissiles(transactionId) {
    const sequence=operationSequence(transactionId,'c9:missiles:');
    if(sequence===null)throw new TypeError('Missile refills require c9:missiles:<next sequence>');
    const loaded = readState();
    if (loaded.error) return loaded.error;
    if(current.purchases.some(receipt=>receipt.id===transactionId))return blocked('transaction-id-conflict');
    if(sequence<=current.missileRefillSequence)return success('duplicate',{duplicate:true,
      sku:'missile-refill',price:0,amount:0,remaining:current.missileAmmo});
    if(sequence!==current.missileRefillSequence+1)return blocked('refill-sequence-conflict');
    const amount=SCRAP_ECONOMY_RULES.maxMissiles-current.missileAmmo;
    if(amount===0)return {ok:false,status:'unavailable',reason:'missiles-full',state:copy(current)};
    const price=amount*SCRAP_ECONOMY_RULES.missileUnitPrice;
    if(current.balance<price)return {ok:false,status:'unavailable',reason:'insufficient-funds',price,
      missing:price-current.balance,state:copy(current)};
    if(!Number.isSafeInteger(current.missileRoundsPurchased+amount)||
      !Number.isSafeInteger((current.missileRoundsPurchased+amount)*SCRAP_ECONOMY_RULES.missileUnitPrice))return blocked('missile-capacity');
    const next=copy(current);
    next.balance-=price;next.spent+=price;next.missileAmmo+=amount;
    next.missileRoundsPurchased+=amount;next.missileRefillSequence=sequence;
    next.lastMissileRefill={id:transactionId,sequence,amount,price};
    return commit(next,loaded.raw,{sku:'missile-refill',price,amount,
      remaining:next.missileAmmo,duplicate:false,transactionId});
  }
  function spendMissile({shotId}={}) {
    const sequence=operationSequence(shotId,'missile:');
    if(sequence===null)throw new TypeError('A durable missile:<next sequence> shot ID is required');
    const loaded=readState();
    if(loaded.error)return loaded.error;
    if(sequence<=current.missileShotsSpent)return success('duplicate',{
      duplicate:true,shotId,remaining:current.missileAmmo});
    if(sequence!==current.missileShotsSpent+1)return blocked('missile-sequence-conflict');
    if(current.missileAmmo===0)return {ok:false,status:'unavailable',reason:'missiles-empty',state:copy(current)};
    const next=copy(current);
    next.missileAmmo--;next.missileShotsSpent=sequence;
    return commit(next,loaded.raw,{duplicate:false,shotId,remaining:next.missileAmmo});
  }
  function purchase({transactionId, sku:requestedSku} = {}) {
    const sku=upgradeName(requestedSku);
    if (!identifier(transactionId) || typeof sku !== 'string' ||
      (!inCatalogue(sku)&&sku!=='missile-refill')) throw new TypeError('A stable transaction ID and catalogue SKU are required');
    if(sku==='missile-refill')return refillMissiles(transactionId);
    if(transactionId.startsWith('c9:missiles:'))throw new TypeError('Missile refill transaction IDs are reserved');
    const loaded = readState();
    if (loaded.error) return loaded.error;
    const prior = current.purchases.find(receipt => receipt.id === transactionId);
    if (prior) return prior.sku === sku ? success('duplicate', {duplicate: true, sku, price: 0})
      : blocked('transaction-id-conflict');
    if (current.lastConsumable?.id === transactionId) return blocked('transaction-id-conflict');
    if (current.upgrades.includes(sku)) return {ok: false, status: 'unavailable', reason: 'already-owned', state: copy(current)};
    if (catalogue(sku).retired) return {ok: false, status: 'unavailable', reason: 'retired', state: copy(current)};
    if (current.purchases.length >= SCRAP_ECONOMY_RULES.maxPurchaseReceipts) return blocked('purchase-receipt-capacity');
    const requires = catalogue(sku).requires.filter(required => !current.upgrades.includes(required));
    if (requires.length) return {ok: false, status: 'unavailable', reason: 'prerequisite-required',
      requires, state: copy(current)};
    const price = catalogue(sku).price;
    if (current.balance < price) return {ok: false, status: 'unavailable', reason: 'insufficient-funds', price,
      missing: price - current.balance, state: copy(current)};
    const next = copy(current);
    next.balance -= price; next.spent += price; next.upgrades.push(sku);
    next.purchases.push({id: transactionId, sku, price});
    return commit(next, loaded.raw, {sku, price, duplicate: false});
  }
  function buyConsumable({transactionId, sku} = {}) {
    if (!identifier(transactionId) || typeof sku !== 'string' || !has(SCRAP_CONSUMABLES, sku) ||
      transactionId.startsWith('c9:missiles:')) throw new TypeError('A stable transaction ID and consumable SKU are required');
    const loaded = readState();
    if (loaded.error) return loaded.error;
    if (current.lastConsumable?.id === transactionId) return current.lastConsumable.sku === sku
      ? success('duplicate', {duplicate: true, sku, price: 0}) : blocked('transaction-id-conflict');
    if (current.purchases.some(receipt => receipt.id === transactionId)) return blocked('transaction-id-conflict');
    const price = SCRAP_CONSUMABLES[sku].price;
    if (!Number.isSafeInteger(current.consumableSpent + price)) return blocked('consumable-capacity');
    if (current.balance < price) return {ok: false, status: 'unavailable', reason: 'insufficient-funds', price,
      missing: price - current.balance, state: copy(current)};
    const next = copy(current);
    next.balance -= price; next.spent += price; next.consumableSpent += price;
    next.lastConsumable = {id: transactionId, sku, price};
    return commit(next, loaded.raw, {sku, price, duplicate: false});
  }
  return Object.freeze({key, backupKey, migrationBackupKey, load, beginRun, claimDrop,
    grant: ({runId, rewardId, enemyType} = {}) => claimDrop({runId, dropId: rewardId, enemyType}),
    purchase,buyConsumable,spendMissile,
    nextMissileShotId:()=>current===null?null:`missile:${current.missileShotsSpent+1}`,
    nextMissileRefillId:()=>current===null?null:`c9:missiles:${current.missileRefillSequence+1}`,
    getState: () => current === null ? null : copy(current),
    getBalance: () => current?.balance ?? null});
}
