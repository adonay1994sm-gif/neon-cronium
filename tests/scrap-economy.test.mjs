import test from 'node:test';
import assert from 'node:assert/strict';
import {SCRAP_ECONOMY_KEY, SCRAP_ECONOMY_RULES, SCRAP_UPGRADES, SCRAP_REWARDS,
  createScrapRecord, normalizeScrapRecord, formatDenominations, rewardForEnemy,
  createScrapLedger, hullReserveCapacity, classicWorkshopState, SCRAP_CONSUMABLES, SCRAP_SHIPS, SCRAP_WEAPON_LEVELS, RETIRED_UPGRADES} from '../src/game/progression/scrap-economy.js';

function memory(map = new Map(), {failWrite = 0, afterWrite = false, denyReads = new Set(),
  throwRead = false, throwWrite = false, interceptRead = null} = {}) {
  const writes = [];
  let attempts = 0;
  return {map, writes, storage: {
    readRaw(key) {
      if (throwRead) throw new Error('read denied');
      if (denyReads.has(key)) return {ok: false, value: null};
      if (interceptRead) interceptRead(key, map);
      return {ok: true, value: map.get(key) ?? null};
    },
    setJSON(key, value) {
      attempts++;
      if (throwWrite) throw new Error('write denied');
      if (attempts === failWrite && !afterWrite) return false;
      const raw = JSON.stringify(value);
      map.set(key, raw); writes.push({key, raw});
      return attempts !== failWrite;
    }
  }};
}
const ledger = device => createScrapLedger({storage: device.storage});
const start = (log, scope = 'classic:chronos') => log.beginRun({scope});
function fund(log, runId, count = 6) {
  for (let index = 0; index < count; index++) assert.equal(log.claimDrop({runId,
    dropId: `stage:1:enemy:${index}`, enemyType: 'scout'}).ok, true);
}

test('denominations exactly preserve the requested 100000 / 100 / 10 conversion and remainder', () => {
  assert.equal(SCRAP_ECONOMY_RULES.silver, 100000);
  assert.equal(SCRAP_ECONOMY_RULES.gold, 100 * SCRAP_ECONOMY_RULES.silver);
  assert.equal(SCRAP_ECONOMY_RULES.stellar, 10 * SCRAP_ECONOMY_RULES.gold);
  assert.deepEqual(formatDenominations(0), {scrap: 0, silver: 0, gold: 0, stellar: 0, label: '0 chatarra'});
  assert.deepEqual(formatDenominations(123456789), {scrap: 56789, silver: 34, gold: 2,
    stellar: 1, label: '1 estelar · 2 oro · 34 plata · 56789 chatarra'});
  assert.deepEqual(formatDenominations(99999999), {scrap: 99999, silver: 99, gold: 9,
    stellar: 0, label: '9 oro · 99 plata · 99999 chatarra'});
  for (const amount of [0, 99999, 100000, 10000000, 100000000, Number.MAX_SAFE_INTEGER]) {
    const coins = formatDenominations(amount);
    assert.equal(coins.scrap + coins.silver * 100000 + coins.gold * 10000000 + coins.stellar * 100000000, amount);
  }
  for (const amount of [-1, .5, Infinity, Number.MAX_SAFE_INTEGER + 1, '100']) {
    assert.throws(() => formatDenominations(amount), TypeError);
  }
});

test('enemy families drop different small scrap values, never minted silver or arbitrary terrain rewards', () => {
  // ch03: subjefe del sector 1 (plan F3c).
  assert.deepEqual(SCRAP_REWARDS, {raider: 6, scout: 9, interceptor: 15, atlas: 600, debris: 6, satellite: 18, ch03: 120});
  assert.equal(rewardForEnemy('ch03'), 120);
  assert.equal(rewardForEnemy('ch-01'), 9);
  assert.equal(rewardForEnemy('ch-02'), 15);
  assert.equal(rewardForEnemy('guardian-atlas'), 600);
  for (const type of ['meteor', 'comet', 'orb', 'unknown', '__proto__', 'constructor', null, {}]) {
    assert.equal(rewardForEnemy(type), 0);
  }
  for (const amount of Object.values(SCRAP_REWARDS)) assert.ok(amount < 100000);
});

test('empty profile is isolated from all legacy campaign and equipment keys', () => {
  const map = new Map([['neonCronium.flightEquipment.v1', '{legacy equipment bytes'],
    ['neonCronium.journey.v1', '{legacy journey credits'], ['unlocked', '10']]);
  const original = new Map(map), device = memory(map), log = ledger(device);
  assert.equal(log.getBalance(), null);
  assert.deepEqual(log.load(), {ok: true, status: 'new', state: createScrapRecord()});
  assert.equal(device.writes.length, 0, 'reading an absent profile does not fabricate a save');
  const run = start(log); fund(log, run.runId);
  assert.equal(log.getBalance(), 54);
  for (const [key, raw] of original) assert.equal(map.get(key), raw);
  assert.deepEqual([...map.keys()].filter(key => !original.has(key)), [SCRAP_ECONOMY_KEY]);
});

test('reload resumes persisted run and stable enemy receipt prevents repeated pickup or checkpoint farming', () => {
  const device = memory(), log = ledger(device), run = start(log);
  assert.equal(run.runId, 'salvage-run:1');
  const claim = {runId: run.runId, dropId: 'stage:3:enemy:7', enemyType: 'interceptor'};
  assert.equal(log.claimDrop(claim).amount, 15);
  const bytes = new Map(device.map), fresh = memory(device.map), resumed = ledger(fresh);
  assert.equal(resumed.load().ok, true);
  assert.equal(start(resumed).runId, run.runId);
  assert.equal(resumed.claimDrop(claim).duplicate, true);
  assert.equal(resumed.claimDrop(claim).amount, 0);
  assert.equal(resumed.getBalance(), 15);
  assert.equal(fresh.writes.length, 0);
  assert.deepEqual(device.map, bytes);
  assert.equal(resumed.claimDrop({...claim, enemyType: 'scout'}).reason, 'drop-id-conflict');
  assert.equal(resumed.getBalance(), 15);
});

test('only explicit fresh expedition clears per-run receipts; other scopes and stale run IDs cannot mint rewards', () => {
  const device = memory(), log = ledger(device), first = start(log);
  fund(log, first.runId, 1);
  const before = new Map(device.map);
  assert.equal(start(log, 'classic:gaia').reason, 'run-scope-conflict');
  assert.deepEqual(device.map, before);
  const next = log.beginRun({scope: 'classic:gaia', fresh: true});
  assert.equal(next.runId, 'salvage-run:2');
  assert.equal(next.state.balance, 9);
  assert.equal(next.state.activeRun.claimed.length, 0);
  assert.equal(log.claimDrop({runId: first.runId, dropId: 'new', enemyType: 'raider'}).reason, 'inactive-run');
  assert.equal(log.claimDrop({runId: next.runId, dropId: 'stage:1:enemy:0', enemyType: 'raider'}).amount, 6);
  assert.equal(log.getBalance(), 15);
});

test('a collected drop writes exactly one atomic receipt and a world drop is not itself a grant', () => {
  const device = memory(), log = ledger(device), run = start(log);
  const count = device.writes.length;
  assert.equal(log.getBalance(), 0, 'world spawning/defeating a ship does not call a pickup grant');
  const result = log.claimDrop({runId: run.runId, dropId: 'stage:2:enemy:4', enemyType: 'raider'});
  assert.equal(result.amount, 6);
  assert.equal(device.writes.length, count + 1);
  assert.deepEqual(JSON.parse(device.writes.at(-1).raw).activeRun.claimed,
    [{id: 'stage:2:enemy:4', enemyType: 'raider', amount: 6}]);
});

test('C9 purchase commits balance, entitlement and receipt in one write without granting weapon ownership', () => {
  const device = memory(), log = ledger(device), run = start(log);
  fund(log, run.runId);
  const count = device.writes.length;
  const result = log.purchase({transactionId: 'c9:prep:1', sku: 'twin-preparation'});
  assert.equal(result.ok, true); assert.equal(result.price, 24);
  assert.equal(device.writes.length, count + 1);
  assert.equal(log.getBalance(), 30);
  assert.deepEqual(result.state.upgrades, ['twin-preparation']);
  assert.deepEqual(result.state.purchases, [{id: 'c9:prep:1', sku: 'twin-preparation', price: 24}]);
  assert.equal(result.state.spent, 24);
  assert.equal(Object.hasOwn(result.state, 'unlocked'), false);
  assert.equal(Object.hasOwn(result.state, 'equipment'), false);
  assert.equal(device.map.has('neonCronium.flightEquipment.v1'), false);
  assert.equal(SCRAP_UPGRADES['twin-preparation'].price, 24);
  assert.equal(SCRAP_UPGRADES['hull-reinforcement'].price, 30);
  assert.equal(SCRAP_UPGRADES['coolant-feed'].price, 45);
});

// Hangar (01/11/2026): las naves de chatarra se compran en la misma bodega.
test('a scrap ship is bought in one write, survives a reload, is never charged twice and stays out of the C9 workshop', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(SCRAP_SHIPS).map(([sku, ship]) => [sku, ship.price])),
    {'ship-vertice': 2500, 'ship-mantarraya': 8000, 'ship-arpon': 20000});
  const device = memory(), log = ledger(device), run = start(log);
  for (let index = 0; index < 5; index++) log.claimDrop({runId: run.runId, dropId: `boss:${index}`, enemyType: 'atlas'});
  assert.equal(log.purchase({transactionId: 'ship:mantarraya', sku: 'ship-mantarraya'}).reason, 'insufficient-funds');
  const result = log.purchase({transactionId: 'ship:vertice', sku: 'ship-vertice'});
  assert.equal(result.ok, true); assert.equal(result.price, 2500);
  assert.equal(log.getBalance(), 500);
  assert.deepEqual(result.state.upgrades, ['ship-vertice']);
  const restored = ledger(memory(device.map));
  assert.equal(restored.load().ok, true, 'a save with a ship receipt is still valid');
  assert.equal(restored.purchase({transactionId: 'ship:vertice', sku: 'ship-vertice'}).duplicate, true);
  assert.equal(restored.getBalance(), 500);
  assert.deepEqual(classicWorkshopState(restored.getState()).weaponIds, []);
  assert.equal(Object.hasOwn(SCRAP_UPGRADES, 'ship-vertice'), false, 'the C9 workshop lists SCRAP_UPGRADES only');
});

test('repeated purchase and reload never charge twice even when UI retries with a new transaction ID', () => {
  const device = memory(), log = ledger(device), run = start(log);
  fund(log, run.runId); log.purchase({transactionId: 'c9:shield:1', sku: 'hull-reinforcement'});
  const before = new Map(device.map), fresh = memory(device.map), restored = ledger(fresh);
  assert.equal(restored.purchase({transactionId: 'c9:shield:1', sku: 'hull-reinforcement'}).duplicate, true);
  assert.equal(restored.purchase({transactionId: 'c9:shield:2', sku: 'hull-reinforcement'}).reason, 'already-owned');
  assert.equal(restored.purchase({transactionId: 'c9:shield:1', sku: 'coolant-feed'}).reason, 'transaction-id-conflict');
  assert.equal(restored.getBalance(), 24);
  assert.deepEqual(device.map, before);
  assert.equal(fresh.writes.length, 0);
});

test('insufficient funds leave no receipt, negative balance or partly owned module', () => {
  const device = memory(), log = ledger(device), run = start(log);
  fund(log, run.runId, 2);
  const before = new Map(device.map), count = device.writes.length;
  const result = log.purchase({transactionId: 'shield:pending', sku: 'hull-reinforcement'});
  assert.equal(result.reason, 'insufficient-funds');
  assert.equal(result.missing, 12);
  assert.deepEqual(device.map, before); assert.equal(device.writes.length, count);
  fund(log, run.runId, 5);
  assert.equal(log.purchase({transactionId: 'shield:pending', sku: 'hull-reinforcement'}).ok, true);
  assert.equal(log.getBalance(), 15);
});

for (const afterWrite of [false, true]) {
  test(`drop retry is coherent after interruption ${afterWrite ? 'after' : 'before'} its atomic write`, () => {
    const device = memory(), first = ledger(device), run = start(first);
    const failing = memory(device.map, {failWrite: 1, afterWrite}), log = ledger(failing);
    const input = {runId: run.runId, dropId: 'stage:2:enemy:9', enemyType: 'scout'};
    const result = log.claimDrop(input);
    assert.equal(result.ok, afterWrite);
    const restored = ledger(memory(device.map));
    assert.equal(restored.claimDrop(input).duplicate, afterWrite);
    assert.equal(restored.getBalance(), 9);
    assert.equal(restored.getState().activeRun.claimed.length, 1);
  });
  test(`C9 interruption ${afterWrite ? 'after' : 'before'} commit cannot separate price and module`, () => {
    const device = memory(), first = ledger(device), run = start(first);
    fund(first, run.runId);
    const failing = memory(device.map, {failWrite: 1, afterWrite}), log = ledger(failing);
    const input = {transactionId: 'c9:coolant:1', sku: 'coolant-feed'};
    assert.equal(log.purchase(input).ok, afterWrite);
    const saved = JSON.parse(device.map.get(SCRAP_ECONOMY_KEY));
    assert.equal(saved.balance, afterWrite ? 9 : 54);
    assert.equal(saved.upgrades.includes('coolant-feed'), afterWrite);
    assert.equal(saved.purchases.length, afterWrite ? 1 : 0);
    const restored = ledger(memory(device.map)), retried = restored.purchase(input);
    assert.equal(retried.ok, true); assert.equal(retried.duplicate, afterWrite);
    assert.equal(restored.getBalance(), 9);
    assert.equal(restored.getState().purchases.length, 1);
  });
}

test('unreadable storage is never interpreted as new or overwritten with defaults', () => {
  const good = createScrapRecord(), map = new Map([[SCRAP_ECONOMY_KEY, JSON.stringify(good)]]);
  for (const options of [{denyReads: new Set([SCRAP_ECONOMY_KEY])}, {throwRead: true}]) {
    const device = memory(map, options), log = ledger(device), before = new Map(map);
    assert.equal(log.load().reason, 'storage-read-denied');
    assert.equal(start(log).reason, 'storage-read-denied');
    assert.equal(log.purchase({transactionId: 'x', sku: 'hull-reinforcement'}).reason, 'storage-read-denied');
    assert.deepEqual(map, before); assert.equal(device.writes.length, 0); assert.equal(log.getState(), null);
  }
});

test('readable storage with write denial or exception cannot fabricate a run, reward or purchase success', () => {
  for (const options of [{failWrite: 1}, {throwWrite: true}]) {
    const device = memory(new Map(), options), log = ledger(device);
    assert.equal(start(log).reason, 'storage-write-denied');
    assert.equal(device.map.has(SCRAP_ECONOMY_KEY), false);
    assert.equal(log.getState(), null);
  }
});

test('corrupt bytes are backed up before further operations and never silently reset or replaced', () => {
  for (const raw of ['{broken', 'null', '[]', JSON.stringify({...createScrapRecord(), balance: -1})]) {
    const device = memory(new Map([[SCRAP_ECONOMY_KEY, raw]])), log = ledger(device);
    const loaded = log.load();
    assert.equal(loaded.ok, false); assert.equal(loaded.reason, 'invalid-save-backed-up');
    assert.equal(device.map.get(SCRAP_ECONOMY_KEY), raw);
    assert.deepEqual(JSON.parse(device.map.get(log.backupKey)), {version: 1, records: [raw]});
    const count = device.writes.length;
    assert.equal(start(log).reason, 'invalid-save-backed-up');
    assert.equal(log.purchase({transactionId: 'buy', sku: 'hull-reinforcement'}).reason, 'invalid-save-backed-up');
    assert.equal(device.writes.length, count, 'same invalid bytes are retained once, not rewritten repeatedly');
  }
});

test('denied or malformed backup preserves corrupt wallet bytes and existing historical backups', () => {
  const backupKey = `${SCRAP_ECONOMY_KEY}:invalid-backups`;
  for (const [backup, options, reason] of [[null, {failWrite: 1}, 'backup-write-denied'],
    [null, {denyReads: new Set([backupKey])}, 'backup-read-denied'],
    ['{prior malformed', {}, 'invalid-backup'],
    [JSON.stringify({version: 1, records: Array.from({length: 8}, (_, i) => `historic:${i}`)}), {}, 'backup-capacity']]) {
    const map = new Map([[SCRAP_ECONOMY_KEY, '{bad']]);
    if (backup !== null) map.set(backupKey, backup);
    const before = new Map(map), device = memory(map, options), log = ledger(device);
    assert.equal(log.load().reason, reason);
    assert.deepEqual(map, before); assert.equal(device.writes.length, 0);
  }
});

test('future-format save is preserved without guessing a migration or overwriting the backup', () => {
  const raw = JSON.stringify({...createScrapRecord(), version: 2, future: 'keep me'});
  const device = memory(new Map([[SCRAP_ECONOMY_KEY, raw]])), log = ledger(device);
  assert.equal(log.load().reason, 'unsupported-save-version');
  assert.equal(start(log).reason, 'unsupported-save-version');
  assert.equal(device.map.get(SCRAP_ECONOMY_KEY), raw);
  assert.equal(device.writes.length, 0);
});

test('bounded drop receipts refuse overflow instead of evicting IDs that could be replayed for currency', () => {
  const device = memory(), log = ledger(device), run = start(log);
  for (let index = 0; index < SCRAP_ECONOMY_RULES.maxDropReceipts; index++) {
    assert.equal(log.claimDrop({runId: run.runId, dropId: `stage:1:enemy:${index}`, enemyType: 'raider'}).ok, true);
  }
  const bytes = new Map(device.map), count = device.writes.length;
  assert.equal(log.claimDrop({runId: run.runId, dropId: 'overflow', enemyType: 'raider'}).reason, 'drop-receipt-capacity');
  assert.equal(log.claimDrop({runId: run.runId, dropId: 'stage:1:enemy:0', enemyType: 'raider'}).duplicate, true);
  assert.equal(log.getBalance(), SCRAP_ECONOMY_RULES.maxDropReceipts * 6);
  assert.deepEqual(device.map, bytes); assert.equal(device.writes.length, count);
});

test('reload and a second ledger instance observe each other instead of spending stale balances', () => {
  const device = memory(), one = ledger(device), run = start(one);
  fund(one, run.runId);
  const two = ledger(memory(device.map)); two.load();
  one.purchase({transactionId: 'first', sku: 'hull-reinforcement'});
  assert.equal(two.purchase({transactionId: 'second', sku: 'coolant-feed'}).reason, 'insufficient-funds');
  assert.equal(two.getBalance(), 24);
  assert.deepEqual(two.getState().upgrades, ['hull-reinforcement']);
});

test('a last-moment external save conflict is preserved before the ledger write', () => {
  const initial = memory(), one = ledger(initial); start(one);
  const external = createScrapRecord();
  const externalRaw = JSON.stringify(external);
  let reads = 0;
  const changing = memory(initial.map, {interceptRead(key, map) {
    if (key === SCRAP_ECONOMY_KEY && ++reads === 2) map.set(key, externalRaw);
  }});
  const two = ledger(changing);
  const result = two.claimDrop({runId: 'salvage-run:1', dropId: 'x', enemyType: 'scout'});
  assert.equal(result.reason, 'save-conflict');
  assert.equal(changing.map.get(SCRAP_ECONOMY_KEY), externalRaw);
  assert.equal(changing.writes.length, 0);
});

test('unsafe monetary overflow and exhausted run sequence block without changing bytes', () => {
  const record = {...createScrapRecord(), balance: Number.MAX_SAFE_INTEGER, earned: Number.MAX_SAFE_INTEGER,
    runSequence: 1, activeRun: {id: 'salvage-run:1', scope: 'classic:chronos', sequence: 1, claimed: []}};
  const device = memory(new Map([[SCRAP_ECONOMY_KEY, JSON.stringify(record)]])), log = ledger(device);
  const before = new Map(device.map);
  assert.equal(log.claimDrop({runId: 'salvage-run:1', dropId: 'x', enemyType: 'scout'}).reason, 'balance-capacity');
  assert.deepEqual(device.map, before);
  record.runSequence = Number.MAX_SAFE_INTEGER;
  record.activeRun.sequence = record.runSequence; record.activeRun.id = `salvage-run:${record.runSequence}`;
  device.map.set(SCRAP_ECONOMY_KEY, JSON.stringify(record));
  assert.equal(log.beginRun({scope: 'classic:chronos', fresh: true}).reason, 'run-capacity');
  assert.equal(device.writes.length, 0);
});

test('validators reject forged receipts, duplicate modules and malformed monetary relationships', () => {
  const record = createScrapRecord();
  const invalid = [{...record, balance: 1}, {...record, earned: -1}, {...record, spent: 24},
    {...record, upgrades: ['hull-reinforcement']}, {...record, runSequence: 1},
    {...record, purchases: [{id: 'a', sku: 'hull-reinforcement', price: 0}]},
    {...record, purchases: [{id: 'a', sku: '__proto__', price: 0}]},
    {...record, upgrades: ['hull-reinforcement', 'hull-reinforcement']},
    {...record, activeRun: {id: 'salvage-run:1', sequence: 1, scope: 'classic', claimed: []}}];
  for (const value of invalid) assert.equal(normalizeScrapRecord(value), null);
  const normalized = normalizeScrapRecord(record);
  normalized.upgrades.push('hull-reinforcement');
  assert.deepEqual(record.upgrades, [], 'normalization never returns caller-owned mutable arrays');
});

test('invalid requests fail before any write, and returned snapshots cannot mutate durable balances or receipts', () => {
  const device = memory(), log = ledger(device);
  for (const input of [{}, {scope: ''}, {scope: 'classic', fresh: 'true'}]) assert.throws(() => log.beginRun(input), TypeError);
  for (const input of [{}, {runId: 'x', dropId: '', enemyType: 'scout'},
    {runId: 'x', dropId: 'y', enemyType: '__proto__'}]) assert.throws(() => log.claimDrop(input), TypeError);
  for (const input of [{}, {transactionId: '', sku: 'hull-reinforcement'},
    {transactionId: 'x', sku: '__proto__'}]) assert.throws(() => log.purchase(input), TypeError);
  assert.equal(device.writes.length, 0);
  const run = start(log); fund(log, run.runId, 1);
  const copy = log.getState(); copy.balance = 999; copy.activeRun.claimed.length = 0;
  assert.equal(log.getBalance(), 9);
  assert.equal(log.claimDrop({runId: run.runId, dropId: 'stage:1:enemy:0', enemyType: 'scout'}).duplicate, true);
  assert.equal(log.getBalance(), 9);
});

function historicalRecord(extra={}) {
  const record={...createScrapRecord(),...extra};
  for(const field of ['revision','missileAmmo','missileShotsSpent','missileRoundsPurchased',
    'missileRefillSequence','lastMissileRefill'])delete record[field];
  return record;
}

test('hull reserve is numeric 30 by default and a 30-scrap permanent reinforcement raises it to 45', () => {
  assert.equal(SCRAP_ECONOMY_RULES.baseHullReserve,30);
  assert.equal(SCRAP_ECONOMY_RULES.reinforcedHullReserve,45);
  assert.equal(hullReserveCapacity(null),30);
  assert.equal(hullReserveCapacity(createScrapRecord()),30);
  const device=memory(),log=ledger(device),run=start(log);
  fund(log,run.runId,4);
  assert.equal(log.purchase({transactionId:'c9:hull',sku:'hull-reinforcement'}).ok,true);
  assert.equal(log.getBalance(),6);
  assert.equal(hullReserveCapacity(log.getState()),45);
  assert.equal(Object.hasOwn(log.getState(),'shieldSeconds'),false);
  assert.equal(Object.hasOwn(log.getState(),'reserveRemaining'),false,
    'damage/checkpoint owner persists remaining reserve; the wallet stores only capacity entitlement');
});

test('historical shield purchase migrates once with raw backup, preserving money and permanent entitlement', () => {
  const old=historicalRecord({balance:24,earned:54,spent:30,upgrades:['shield-cell'],
    purchases:[{id:'c9:shield-cell',sku:'shield-cell',price:30}]});
  const raw=JSON.stringify(old),device=memory(new Map([[SCRAP_ECONOMY_KEY,raw]])),log=ledger(device);
  const migrated=log.load();
  assert.equal(migrated.ok,true);assert.equal(migrated.status,'migrated');
  assert.deepEqual(device.writes.map(entry=>entry.key),[log.migrationBackupKey,SCRAP_ECONOMY_KEY]);
  assert.deepEqual(JSON.parse(device.map.get(log.migrationBackupKey)),{version:1,records:[raw]});
  assert.equal(migrated.state.balance,24);assert.equal(migrated.state.spent,30);
  assert.equal(migrated.state.missileAmmo,3);assert.equal(migrated.state.revision,2);
  assert.deepEqual(migrated.state.upgrades,['hull-reinforcement']);
  assert.deepEqual(migrated.state.purchases,[{id:'c9:shield-cell',sku:'hull-reinforcement',price:30}]);
  assert.equal(hullReserveCapacity(migrated.state),45);
  assert.equal(log.purchase({transactionId:'c9:shield-cell',sku:'shield-cell'}).duplicate,true,
    'an old pending UI request recognizes its migrated receipt without charging again');
  assert.equal(log.purchase({transactionId:'c9:hull-new',sku:'hull-reinforcement'}).reason,'already-owned');
  const count=device.writes.length,bytes=new Map(device.map),restored=ledger(memory(device.map));
  assert.equal(restored.load().status,'loaded');
  assert.equal(restored.getState().missileAmmo,3);
  assert.equal(device.writes.length,count);assert.deepEqual(device.map,bytes);
});

for(const afterWrite of [false,true])for(const failWrite of [1,2]) {
  test(`migration survives ${afterWrite?'after':'before'} write ${failWrite}/2 without repeating missiles or losing old bytes`,()=>{
    const old=historicalRecord(),raw=JSON.stringify(old);
    const device=memory(new Map([[SCRAP_ECONOMY_KEY,raw]]),{failWrite,afterWrite}),log=ledger(device);
    const initial=log.load();
    assert.equal(initial.ok,afterWrite);
    if(!initial.ok)assert.equal(device.map.get(SCRAP_ECONOMY_KEY),raw);
    const restored=ledger(memory(device.map));
    assert.equal(restored.load().ok,true);
    assert.equal(restored.getState().missileAmmo,3);
    assert.deepEqual(JSON.parse(device.map.get(restored.migrationBackupKey)),{version:1,records:[raw]});
    assert.equal(restored.spendMissile({shotId:restored.nextMissileShotId()}).remaining,2);
    const again=ledger(memory(device.map));assert.equal(again.load().ok,true);
    assert.equal(again.getState().missileAmmo,2,'reloading migration never replaces spent missiles');
  });
}

test('migration backup denial preserves the whole old profile and blocks missile usage or purchases',()=>{
  const old=historicalRecord(),raw=JSON.stringify(old),backupKey=`${SCRAP_ECONOMY_KEY}:migration-backups`;
  const device=memory(new Map([[SCRAP_ECONOMY_KEY,raw]]),{denyReads:new Set([backupKey])}),log=ledger(device);
  assert.equal(log.load().reason,'backup-read-denied');
  assert.equal(log.spendMissile({shotId:'missile:1'}).reason,'backup-read-denied');
  assert.equal(log.getState(),null);assert.equal(device.map.get(SCRAP_ECONOMY_KEY),raw);
  assert.equal(device.writes.length,0);
});

test('old Atlas 180 receipt survives the new 600 reward without retroactive minting or duplicate pickup',()=>{
  const old=historicalRecord({balance:180,earned:180,runSequence:1,activeRun:{
    id:'salvage-run:1',scope:'classic:2',sequence:1,
    claimed:[{id:'guardian-atlas',enemyType:'atlas',amount:180}]}});
  const device=memory(new Map([[SCRAP_ECONOMY_KEY,JSON.stringify(old)]])),log=ledger(device);
  assert.equal(log.load().ok,true);
  const result=log.claimDrop({runId:'salvage-run:1',dropId:'guardian-atlas',enemyType:'guardian-atlas'});
  assert.equal(result.duplicate,true);assert.equal(result.amount,0);assert.equal(result.originalAmount,180);
  assert.equal(log.getBalance(),180);
  assert.equal(log.getState().activeRun.claimed[0].amount,180);
  const fresh=log.beginRun({scope:'classic:2',fresh:true});
  assert.equal(log.claimDrop({runId:fresh.runId,dropId:'guardian-atlas',enemyType:'guardian-atlas'}).amount,600);
  assert.equal(log.getBalance(),780);
  assert.equal(log.claimDrop({runId:fresh.runId,dropId:'guardian-atlas',enemyType:'guardian-atlas'}).duplicate,true);
  assert.equal(log.getBalance(),780);
});

test('three persistent special missiles are spent atomically with durable non-repeating shot IDs',()=>{
  const device=memory(),log=ledger(device);
  assert.equal(log.load().state.missileAmmo,3);
  assert.equal(log.nextMissileShotId(),'missile:1');
  assert.equal(log.spendMissile({shotId:'missile:1'}).remaining,2);
  const reload=ledger(memory(device.map));reload.load();
  assert.equal(reload.nextMissileShotId(),'missile:2');
  const count=device.writes.length,bytes=new Map(device.map);
  assert.equal(reload.spendMissile({shotId:'missile:1'}).duplicate,true);
  assert.deepEqual(device.map,bytes);assert.equal(device.writes.length,count);
  assert.equal(reload.spendMissile({shotId:'missile:3'}).reason,'missile-sequence-conflict');
  assert.equal(reload.spendMissile({shotId:'missile:2'}).remaining,1);
  assert.equal(reload.spendMissile({shotId:'missile:3'}).remaining,0);
  assert.equal(reload.spendMissile({shotId:'missile:4'}).reason,'missiles-empty');
  assert.equal(reload.getState().missileShotsSpent,3);
  assert.equal(reload.getBalance(),0);
});

test('C9 missile refill charges six for each missing round, caps at three, and a full magazine costs nothing',()=>{
  const device=memory(),log=ledger(device),run=start(log);fund(log,run.runId);
  const count=device.writes.length;
  assert.equal(log.purchase({transactionId:log.nextMissileRefillId(),sku:'missile-refill'}).reason,'missiles-full');
  assert.equal(device.writes.length,count);assert.equal(log.getBalance(),54);
  log.spendMissile({shotId:log.nextMissileShotId()});
  const one=log.purchase({transactionId:log.nextMissileRefillId(),sku:'missile-refill'});
  assert.equal(one.amount,1);assert.equal(one.price,6);assert.equal(one.remaining,3);
  assert.equal(log.getBalance(),48);
  for(let i=0;i<3;i++)log.spendMissile({shotId:log.nextMissileShotId()});
  const three=log.purchase({transactionId:log.nextMissileRefillId(),sku:'missile-refill'});
  assert.equal(three.amount,3);assert.equal(three.price,18);assert.equal(three.remaining,3);
  assert.equal(log.getBalance(),30);assert.equal(log.getState().spent,24);
  assert.equal(log.getState().purchases.length,0,'repeat consumable receipts do not fill the permanent-upgrade array');
  assert.deepEqual(log.getState().lastMissileRefill,{id:'c9:missiles:2',sequence:2,amount:3,price:18});
});

test('refill retries after reload or a later refill cannot duplicate missiles or spend money twice',()=>{
  const device=memory(),log=ledger(device),run=start(log);fund(log,run.runId);
  log.spendMissile({shotId:log.nextMissileShotId()});
  log.purchase({transactionId:'c9:missiles:1',sku:'missile-refill'});
  log.spendMissile({shotId:log.nextMissileShotId()});
  log.purchase({transactionId:'c9:missiles:2',sku:'missile-refill'});
  log.spendMissile({shotId:log.nextMissileShotId()});
  const bytes=new Map(device.map),restored=ledger(memory(device.map));restored.load();
  assert.equal(restored.purchase({transactionId:'c9:missiles:1',sku:'missile-refill'}).duplicate,true);
  assert.equal(restored.purchase({transactionId:'c9:missiles:2',sku:'missile-refill'}).duplicate,true);
  assert.equal(restored.purchase({transactionId:'c9:missiles:4',sku:'missile-refill'}).reason,'refill-sequence-conflict');
  assert.equal(restored.getState().missileAmmo,2);assert.equal(restored.getBalance(),42);
  assert.deepEqual(device.map,bytes);
});

test('missile refill with insufficient funds leaves both inventory and next transaction sequence untouched',()=>{
  const device=memory(),log=ledger(device);log.load();
  for(let i=0;i<3;i++)log.spendMissile({shotId:log.nextMissileShotId()});
  const before=new Map(device.map);
  const result=log.purchase({transactionId:log.nextMissileRefillId(),sku:'missile-refill'});
  assert.equal(result.reason,'insufficient-funds');assert.equal(result.missing,18);
  assert.equal(log.getState().missileAmmo,0);assert.equal(log.nextMissileRefillId(),'c9:missiles:1');
  assert.deepEqual(device.map,before);
});

for(const afterWrite of [false,true]) {
  test(`missile spend/refill interruption ${afterWrite?'after':'before'} atomic write preserves item and currency coherence`,()=>{
    const device=memory(),initial=ledger(device),run=start(initial);fund(initial,run.runId);
    const failing=ledger(memory(device.map,{failWrite:1,afterWrite}));
    assert.equal(failing.spendMissile({shotId:'missile:1'}).ok,afterWrite);
    const restored=ledger(memory(device.map));restored.load();
    const retried=restored.spendMissile({shotId:'missile:1'});
    assert.equal(retried.ok,true);assert.equal(retried.duplicate,afterWrite);
    assert.equal(restored.getState().missileAmmo,2);
    const refill=ledger(memory(device.map,{failWrite:1,afterWrite}));
    assert.equal(refill.purchase({transactionId:'c9:missiles:1',sku:'missile-refill'}).ok,afterWrite);
    const next=ledger(memory(device.map));next.load();
    assert.equal(next.getState().missileAmmo,afterWrite?3:2);
    assert.equal(next.getBalance(),afterWrite?48:54);
    const retry=next.purchase({transactionId:'c9:missiles:1',sku:'missile-refill'});
    assert.equal(retry.ok,true);assert.equal(retry.duplicate,afterWrite);
    assert.equal(next.getState().missileAmmo,3);assert.equal(next.getBalance(),48);
  });
}

test('hundreds of consumable transactions stay bounded while old shot and refill IDs remain harmless',()=>{
  const device=memory(),log=ledger(device),run=start(log);
  fund(log,run.runId,140);
  for(let i=0;i<140;i++) {
    assert.equal(log.spendMissile({shotId:log.nextMissileShotId()}).ok,true);
    assert.equal(log.purchase({transactionId:log.nextMissileRefillId(),sku:'missile-refill'}).ok,true);
  }
  assert.equal(log.getState().missileAmmo,3);assert.equal(log.getState().missileShotsSpent,140);
  assert.equal(log.getState().missileRefillSequence,140);
  assert.equal(log.getState().purchases.length,0);
  const before=new Map(device.map),count=device.writes.length;
  assert.equal(log.spendMissile({shotId:'missile:1'}).duplicate,true);
  assert.equal(log.purchase({transactionId:'c9:missiles:1',sku:'missile-refill'}).duplicate,true);
  assert.deepEqual(device.map,before);assert.equal(device.writes.length,count);
  assert.equal(log.getBalance(),420);
});

test('malformed extended inventory cannot trigger a fresh three-missile grant or bypass monetary validation',()=>{
  const base=createScrapRecord();
  for(const altered of [{...base,missileAmmo:4},{...base,missileShotsSpent:1},
    {...base,missileRoundsPurchased:1}, {...base,missileRefillSequence:1},
    {...base,missileRefillSequence:0,lastMissileRefill:{sequence:1}},
    {...base,missileAmmo:undefined}, {...base,revision:undefined}]) {
    const raw=JSON.stringify(altered),device=memory(new Map([[SCRAP_ECONOMY_KEY,raw]])),log=ledger(device);
    assert.equal(log.load().ok,false);assert.equal(log.getState(),null);
    assert.equal(device.map.get(SCRAP_ECONOMY_KEY),raw);
    assert.equal(log.spendMissile({shotId:'missile:1'}).ok,false);
  }
});

test('missile APIs reject malformed, unsafe, noncanonical or reserved operation identifiers before writes',()=>{
  const device=memory(),log=ledger(device);log.load();
  for(const shotId of ['', 'missile:0','missile:01','missile:1.5','missile:9007199254740992','other:1']) {
    assert.throws(()=>log.spendMissile({shotId}),TypeError);
  }
  for(const transactionId of ['x','c9:missiles:0','c9:missiles:01','c9:missiles:9007199254740992']) {
    assert.throws(()=>log.purchase({transactionId,sku:'missile-refill'}),TypeError);
  }
  assert.throws(()=>log.purchase({transactionId:'c9:missiles:1',sku:'hull-reinforcement'}),TypeError);
  assert.equal(device.writes.length,0);
});

test('salvage from ship fragments and satellites is a physical pickup receipt, once across reloads', () => {
  assert.equal(rewardForEnemy('ship-fragment'), 6);
  assert.equal(rewardForEnemy('satellite-fragment'), 18);
  const device = memory(), log = ledger(device), run = start(log);
  assert.equal(log.getBalance(), 0);
  assert.equal(log.claimDrop({runId: run.runId, dropId: 'debris:4', enemyType: 'debris'}).amount, 6);
  assert.equal(log.claimDrop({runId: run.runId, dropId: 'satellite:7', enemyType: 'satellite'}).amount, 18);
  const restored = ledger(memory(device.map)); restored.load();
  assert.equal(restored.claimDrop({runId: run.runId, dropId: 'debris:4', enemyType: 'ship-fragment'}).duplicate, true);
  assert.equal(restored.claimDrop({runId: run.runId, dropId: 'satellite:7', enemyType: 'satellite-fragment'}).duplicate, true);
  assert.equal(restored.getBalance(), 24);
});

test('workshop branches and weapon levels require their paid prerequisite and each rank changes an actual effect', () => {
  const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId, 400);
  for (const sku of ['hull-plating-ii', 'coolant-feed-ii', 'level-pulse-3', 'level-twin-4']) {
    const before = new Map(device.map);
    assert.equal(log.purchase({transactionId: `try:${sku}`, sku}).reason, 'prerequisite-required');
    assert.deepEqual(device.map, before);
  }
  // Abanico y Aguja salieron de la Forja (dec-armas-plan): ya no se venden.
  for (const sku of RETIRED_UPGRADES) assert.equal(log.purchase({transactionId: `try:${sku}`, sku}).reason, 'retired');
  assert.deepEqual(classicWorkshopState(log.getState()), {reserveCapacity: 30, rechargeSeconds: 2, maxCharges: 20,
    defenseRank: 0, coolingRank: 0, ammoRank: 0, weaponIds: [], weaponLevels: {pulse: 1, twin: 1}, weaponRanks: {scatter: 0, needle: 0}});
  for (const sku of ['twin-preparation', 'hull-reinforcement', 'coolant-feed', 'level-pulse-2', 'level-twin-2']) {
    assert.equal(log.purchase({transactionId: `buy:${sku}`, sku}).ok, true);
  }
  const first = classicWorkshopState(log.getState());
  assert.equal(first.reserveCapacity, 45); assert.equal(first.rechargeSeconds, 1.5);
  assert.deepEqual(first.weaponLevels, {pulse: 2, twin: 2});
  for (const sku of ['hull-plating-ii', 'coolant-feed-ii', 'level-pulse-3', 'level-pulse-4']) {
    assert.equal(log.purchase({transactionId: `buy:${sku}`, sku}).ok, true);
  }
  const second = classicWorkshopState(log.getState());
  assert.equal(second.reserveCapacity, 65); assert.equal(second.rechargeSeconds, 1);
  assert.equal(second.defenseRank, 2); assert.equal(second.coolingRank, 2);
  assert.deepEqual(second.weaponLevels, {pulse: 4, twin: 2});
  const reload = ledger(memory(device.map)); assert.equal(reload.load().ok, true);
  assert.deepEqual(classicWorkshopState(reload.getState()), second);
  assert.equal(reload.getBalance(), 3600 - 24 - 30 - 45 - 300 - 300 - 90 - 110 - 800 - 1800);
  assert.deepEqual(Object.fromEntries(Object.entries(SCRAP_WEAPON_LEVELS).map(([sku, item]) => [sku, item.price])),
    {'level-pulse-2': 300, 'level-pulse-3': 800, 'level-pulse-4': 1800, 'level-twin-2': 300, 'level-twin-3': 800, 'level-twin-4': 1800});
});

for (const afterWrite of [false, true]) {
  test(`weapon level purchase interruption ${afterWrite ? 'after' : 'before'} write keeps paid ownership and retry coherent`, () => {
    const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId, 40);
    const interrupted = ledger(memory(device.map, {failWrite: 1, afterWrite}));
    assert.equal(interrupted.purchase({transactionId: 'level:pulse:2', sku: 'level-pulse-2'}).ok, afterWrite);
    const restored = ledger(memory(device.map)); restored.load();
    assert.equal(restored.getBalance(), afterWrite ? 60 : 360);
    assert.equal(classicWorkshopState(restored.getState()).weaponLevels.pulse, afterWrite ? 2 : 1);
    const retried = restored.purchase({transactionId: 'level:pulse:2', sku: 'level-pulse-2'});
    assert.equal(retried.ok, true); assert.equal(retried.duplicate, afterWrite);
    assert.equal(restored.getBalance(), 60);
    assert.equal(classicWorkshopState(restored.getState()).weaponLevels.pulse, 2);
  });
}

test('an old save that bought Abanico and Aguja gets that scrap back on load, once', () => {
  const record = createScrapRecord();
  Object.assign(record, {balance: 10, earned: 10 + 24 + 70 + 120 + 95, spent: 24 + 70 + 120 + 95,
    upgrades: ['twin-preparation', 'weapon-scatter', 'scatter-focus', 'weapon-needle'],
    purchases: [{id: 'c9:twin-preparation', sku: 'twin-preparation', price: 24}, {id: 'c9:weapon-scatter', sku: 'weapon-scatter', price: 70},
      {id: 'c9:scatter-focus', sku: 'scatter-focus', price: 120}, {id: 'c9:weapon-needle', sku: 'weapon-needle', price: 95}]});
  const map = new Map([[SCRAP_ECONOMY_KEY, JSON.stringify(record)]]);
  const log = ledger(memory(map));
  assert.equal(log.load().status, 'migrated');
  assert.equal(log.getBalance(), 10 + 70 + 120 + 95);
  assert.deepEqual(log.getState().upgrades, ['twin-preparation']);
  const again = ledger(memory(map));
  assert.equal(again.load().status, 'loaded', 'the refund is paid only once');
  assert.equal(again.getBalance(), 295);
});

test('unpaid or prerequisite-free skill data cannot become durable effects or pass normalization', () => {
  const empty = createScrapRecord();
  for (const record of [{...empty, upgrades: ['weapon-scatter']},
    {...empty, balance: 0, earned: 120, spent: 120, upgrades: ['scatter-focus'],
      purchases: [{id: 'forged', sku: 'scatter-focus', price: 120}]},
    {...empty, balance: 0, earned: 90, spent: 90, upgrades: ['hull-plating-ii'],
      purchases: [{id: 'forged', sku: 'hull-plating-ii', price: 90}]}]) {
    assert.equal(normalizeScrapRecord(record), null);
    assert.deepEqual(classicWorkshopState(record), classicWorkshopState(null));
  }
});

test('the expanded catalogue loads old v2 profiles without rewriting or changing historical prices', () => {
  const record = {...createScrapRecord(), balance: 1, earned: 100, spent: 99,
    upgrades: ['twin-preparation', 'hull-reinforcement', 'coolant-feed'],
    purchases: [{id: 'one', sku: 'twin-preparation', price: 24},
      {id: 'two', sku: 'hull-reinforcement', price: 30}, {id: 'three', sku: 'coolant-feed', price: 45}]};
  const raw = JSON.stringify(record), device = memory(new Map([[SCRAP_ECONOMY_KEY, raw]])), log = ledger(device);
  assert.equal(log.load().status, 'loaded'); assert.equal(device.writes.length, 0);
  assert.equal(device.map.get(SCRAP_ECONOMY_KEY), raw);
  assert.equal(log.getBalance(), 1); assert.equal(log.getState().missileAmmo, 3);
  assert.equal(log.purchase({transactionId: 'two', sku: 'hull-reinforcement'}).duplicate, true);
  assert.equal(device.writes.length, 0);
});

// Baliza de reaparición (plan F3c, tarea 4): compra consumible, se puede repetir.
test('a consumable charges once per transaction and is not an upgrade', () => {
  assert.deepEqual(SCRAP_CONSUMABLES, {'sector-beacon': {price: 40}});
  const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId);
  const bought = log.buyConsumable({transactionId: 'beacon:S1_GAIA:1', sku: 'sector-beacon'});
  assert.equal(bought.ok, true);
  assert.equal(bought.price, 40);
  assert.equal(log.getBalance(), 14);
  assert.deepEqual(bought.state.upgrades, []);
  assert.deepEqual(bought.state.purchases, [], 'a consumable never takes an upgrade receipt slot');
  assert.equal(bought.state.consumableSpent, 40);
  assert.deepEqual(bought.state.lastConsumable, {id: 'beacon:S1_GAIA:1', sku: 'sector-beacon', price: 40});
  const again = log.buyConsumable({transactionId: 'beacon:S1_GAIA:1', sku: 'sector-beacon'});
  assert.equal(again.duplicate, true);
  assert.equal(again.price, 0);
  assert.equal(log.getBalance(), 14, 'la misma transacción no cobra dos veces');
  for (let index = 6; index < 12; index++) log.claimDrop({runId: run.runId, dropId: `stage:2:enemy:${index}`, enemyType: 'scout'});
  assert.equal(log.buyConsumable({transactionId: 'beacon:S1_GAIA:2', sku: 'sector-beacon'}).ok, true,
    'otra transacción puede volver a comprarla');
  assert.equal(log.getBalance(), 28);
  const reloaded = ledger(device).load();
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.state.spent, 80);
  assert.notEqual(normalizeScrapRecord(reloaded.state), null);
  assert.throws(() => log.buyConsumable({transactionId: 'x', sku: 'twin-preparation'}), TypeError);
  assert.throws(() => log.purchase({transactionId: 'x', sku: 'sector-beacon'}), TypeError);
});

test('a consumable without funds fails with the missing amount', () => {
  const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId, 2);
  const writes = device.writes.length;
  const result = log.buyConsumable({transactionId: 'beacon:S1_GAIA:1', sku: 'sector-beacon'});
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'insufficient-funds');
  assert.equal(result.missing, 22);
  assert.equal(log.getBalance(), 18);
  assert.equal(device.writes.length, writes);
});

// Revisión final F3c: las balizas no agotan el cupo de recibos de mejoras.
test('hundreds of beacons never block workshop upgrades', () => {
  const device = memory(), log = ledger(device), run = start(log);
  for (let index = 0; index < 30; index++) log.claimDrop({runId: run.runId, dropId: `atlas:${index}`, enemyType: 'atlas'});
  for (let index = 1; index <= 200; index++) {
    assert.equal(log.buyConsumable({transactionId: `beacon:${index}`, sku: 'sector-beacon'}).ok, true, `beacon ${index}`);
  }
  assert.equal(log.purchase({transactionId: 'c9:hull-reinforcement', sku: 'hull-reinforcement'}).ok, true);
  const reloaded = ledger(device).load();
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.state.consumableSpent, 8000);
  assert.equal(reloaded.state.balance, 18000 - 8000 - 30);
});

test('a beacon bought at an older price still loads after the price changes', () => {
  const record = {...createScrapRecord(), balance: 25, earned: 60, spent: 35,
    consumableSpent: 35, lastConsumable: {id: 'beacon:salvage-run:1', sku: 'sector-beacon', price: 35}};
  assert.notEqual(normalizeScrapRecord(record), null);
  assert.equal(normalizeScrapRecord({...record, consumableSpent: 30}), null, 'the last receipt cannot exceed the consumable spending');
  assert.equal(normalizeScrapRecord({...record, lastConsumable: null}), null, 'spending without a receipt is invalid');
  assert.equal(normalizeScrapRecord({...record, lastConsumable: {...record.lastConsumable, sku: 'twin-preparation'}}), null);
  const old = createScrapRecord(); delete old.consumableSpent; delete old.lastConsumable;
  assert.deepEqual(normalizeScrapRecord(old), createScrapRecord(), 'saves from before the beacon load unchanged');
});

test('an upgrade cannot reuse the id of the last consumable', () => {
  const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId, 12);
  assert.equal(log.buyConsumable({transactionId: 'beacon:salvage-run:1', sku: 'sector-beacon'}).ok, true);
  const result = log.purchase({transactionId: 'beacon:salvage-run:1', sku: 'hull-reinforcement'});
  assert.equal(result.reason, 'transaction-id-conflict');
  assert.equal(log.getBalance(), 108 - 40);
});

// Árbol ampliado de la Forja (dec-arbol-ampliado, 02/11/2026): munición 20 → 100.
test('the ammo line has four paid ranks, 20 → 40 → 60 → 80 → 100 rounds, each needing the one before', () => {
  const device = memory(), log = ledger(device), run = start(log); fund(log, run.runId, 120);
  assert.equal(classicWorkshopState(log.getState()).maxCharges, 20);
  assert.equal(log.purchase({transactionId: 'try:ammo-2', sku: 'ammo-2'}).reason, 'prerequisite-required');
  const skus = ['ammo-1', 'ammo-2', 'ammo-3', 'ammo-4'];
  assert.deepEqual(skus.map(sku => SCRAP_UPGRADES[sku].price), [60, 140, 260, 400]);
  for (const [index, sku] of skus.entries()) {
    assert.equal(log.purchase({transactionId: `buy:${sku}`, sku}).ok, true);
    const workshop = classicWorkshopState(log.getState());
    assert.equal(workshop.maxCharges, 20 * (index + 2));
    assert.equal(workshop.ammoRank, index + 1);
  }
  assert.equal(log.getBalance(), 120 * 9 - 860);
  const reload = ledger(memory(device.map)); assert.equal(reload.load().ok, true);
  assert.equal(classicWorkshopState(reload.getState()).maxCharges, 100);
});
