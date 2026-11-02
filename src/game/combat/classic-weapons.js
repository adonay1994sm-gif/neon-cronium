const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
};

const weapon = definition => Object.freeze({...definition,
  barrels: Object.freeze(definition.barrels.map(barrel => Object.freeze({...barrel})))});

// Rules and ammunition are match-local. Saved equipment keeps the stable
// pulse/twin/lance identifiers; a new run always adopts the current magazine.
export const CLASSIC_WEAPON_RULES = Object.freeze({
  version: 'classic-weapons-v4', maxCharges: 20, rechargeSeconds: 2,
  maxDelta: .05, maxProjectiles: 32, boundsMargin: 80,
  missile: Object.freeze({damage:18,speed:760,radius:10,duration:3.2,cooldown:.7}),
  types: Object.freeze({
    pulse: weapon({id: 'pulse', label: 'Phaser', damageMultiplier: 1,
      description: 'Daño ×1: un pulso de 1 de daño por carga.', cooldown: .24, speed: 920,
      damage: 1, radius: 9, duration: 2.4, barrels: [{offset: 0, spread: 0}]}),
    twin: weapon({id: 'twin', label: 'Gemelo', damageMultiplier: 2,
      description: 'Daño ×2: dos pulsos centrados de 1 de daño por carga.', cooldown: .30, speed: 900,
      damage: 1, radius: 7, duration: 2.4,
      barrels: [{offset: -10, spread: 0}, {offset: 10, spread: 0}]}),
    lance: weapon({id: 'lance', label: 'Lanza', damageMultiplier: 3,
      description: 'Daño ×3: una lanza de 3 de daño que atraviesa hasta dos objetivos distintos.',
      cooldown: .48, speed: 1280, damage: 3, radius: 6, duration: 1.8, pierce: 2,
      barrels: [{offset: 0, spread: 0}]}),
    scatter: weapon({id: 'scatter', label: 'Abanico', damageMultiplier: 3,
      description: 'Daño ×3 si impactan los tres pulsos: abanico de corto alcance.',
      cooldown: .4, speed: 660, damage: 1, radius: 7, duration: .34,
      barrels: [{offset: -5, spread: -.16}, {offset: 0, spread: 0}, {offset: 5, spread: .16}]}),
    needle: weapon({id: 'needle', label: 'Aguja', damageMultiplier: 2,
      description: 'Daño ×2 por objetivo: proyectil estrecho que perfora hasta tres objetivos.',
      cooldown: .56, speed: 1400, damage: 2, radius: 4, duration: 1.6, pierce: 3,
      barrels: [{offset: 0, spread: 0}]})
  })
});

// Niveles de Pulso y Gemelo (dec-armas-plan, 01/11/2026): se compran con
// chatarra en el hangar y valen para siempre. Daño por ráfaga ×1, ×1,3, ×1,6
// y ×2 (si impactan todos los proyectiles); el nivel 1 es el arma de siempre.
const FAN = Object.freeze([{offset: -6, spread: -.1}, {offset: 0, spread: 0}, {offset: 6, spread: .1}]);
const QUAD = Object.freeze([{offset: -18, spread: 0}, {offset: -6, spread: 0}, {offset: 6, spread: 0}, {offset: 18, spread: 0}]);
// El nivel 1 conserva la descripción de siempre del arma.
const level = (damageMultiplier, damage, radius, barrels, description) =>
  Object.freeze({damageMultiplier, damage, radius, ...(description ? {description} : {}),
    barrels: Object.freeze(barrels.map(barrel => Object.freeze({...barrel})))});
export const CLASSIC_WEAPON_LEVELS = Object.freeze({
  pulse: Object.freeze([null,
    level(1, 1, 9, [{offset: 0, spread: 0}]),
    level(1.3, 1.3, 11, [{offset: 0, spread: 0}], 'Nivel 2 · daño ×1,3: un pulso más grande.'),
    level(1.6, 1.6 / 3, 9, FAN, 'Nivel 3 · daño ×1,6: tres pulsos en abanico.'),
    level(2, 2 / 3, 10, FAN, 'Nivel 4 · daño ×2: tres pulsos con anillo.')]),
  twin: Object.freeze([null,
    level(2, 1, 7, [{offset: -10, spread: 0}, {offset: 10, spread: 0}]),
    level(2.6, 1.3, 8, [{offset: -10, spread: 0}, {offset: 10, spread: 0}], 'Nivel 2 · daño ×2,6: dos balas más largas.'),
    level(3.2, .8, 7, QUAD, 'Nivel 3 · daño ×3,2: cuatro balas.'),
    level(4, 1, 8, QUAD, 'Nivel 4 · daño ×4: cuatro balas con estela.')])
});

function knownType(type) {
  if (!Object.hasOwn(CLASSIC_WEAPON_RULES.types, type)) {
    throw new RangeError(`Unknown classic weapon: ${String(type)}`);
  }
  return type;
}

function rechargeInterval(seconds) {
  finite(seconds, 'recharge interval');
  if (seconds < 1 || seconds > CLASSIC_WEAPON_RULES.rechargeSeconds) {
    throw new RangeError('Recharge interval must be between 1 and 2 seconds');
  }
  return seconds;
}

/**
 * One match, driven by the existing legacy loop. Units are logical Canvas
 * pixels and seconds. No rendering, scheduling, save or reward lives here.
 * Callers pause by passing zero delta (or by not calling advance).
 */
export function createClassicWeapons({type = 'pulse', unlocked = ['pulse'],
  width = 720, height = 1280, rechargeSeconds = CLASSIC_WEAPON_RULES.rechargeSeconds} = {}) {
  rechargeInterval(rechargeSeconds);
  finite(width, 'width'); finite(height, 'height'); knownType(type);
  if (width < 240 || height < 240) throw new RangeError('Invalid weapon arena');
  if (!Array.isArray(unlocked) || unlocked.length === 0) {
    throw new TypeError('At least one unlocked weapon is required');
  }
  const available = [...new Set(unlocked.map(knownType))];
  if (!available.includes(type)) throw new RangeError('Selected weapon must be unlocked');
  return {
    version: CLASSIC_WEAPON_RULES.version, width, height,
    selected: type, unlocked: available, weaponRanks: {scatter: 1, needle: 1}, weaponLevels: {pulse: 1, twin: 1},
    charges: CLASSIC_WEAPON_RULES.maxCharges, maxCharges: CLASSIC_WEAPON_RULES.maxCharges,
    rechargeSeconds, recharge: 0, cooldown: 0, elapsed: 0,
    unlimitedFire: false, missileCooldown: 0, missileSequence: 0,
    projectileSequence: 0, eventSequence: 0, shotSequence: 0, projectiles: []
  };
}

function event(state, type, details = {}) {
  return {id: `${state.version}:event:${++state.eventSequence}`, type, ...details};
}

/**
 * A purchased cooling module changes this match's interval without granting
 * ammunition. Keep elapsed recovery seconds, bounded just before the new
 * boundary; only a subsequent played-time update can emit a recovered round.
 */
export function setClassicRechargeInterval(state, seconds) {
  rechargeInterval(seconds);
  if (state.rechargeSeconds === seconds) return seconds;
  state.rechargeSeconds = seconds;
  state.recharge = state.charges === top(state) ? 0 :
    Math.min(state.recharge, seconds - 1e-9);
  return seconds;
}

// Tamaño del cargador: 20 de serie; la línea de munición de la Forja lo sube
// hasta 100 (dec-arbol-ampliado, 02/11/2026). Partidas antiguas sin el campo: 20.
const top = state => state.maxCharges ?? CLASSIC_WEAPON_RULES.maxCharges;

/** A bigger magazine bought in the Forja arrives loaded with its new rounds,
 * once; recovery then fills up to the new top. */
export function setClassicMaxCharges(state, size) {
  if (!Number.isInteger(size) || size < CLASSIC_WEAPON_RULES.maxCharges || size > 100) throw new RangeError('Invalid magazine size');
  const before = top(state);
  if (size === before) return size;
  state.maxCharges = size;
  state.charges = Math.min(size, state.charges + Math.max(0, size - before));
  if (state.charges === size) state.recharge = 0;
  return size;
}

/** Installing a paid rank affects future shots, never live bolts or a cooldown. */
export function setClassicWeaponTuning(state, ranks = {}) {
  if (!ranks || typeof ranks !== 'object' || Array.isArray(ranks) ||
      Object.keys(ranks).some(id => id !== 'scatter' && id !== 'needle')) {
    throw new TypeError('Known weapon ranks required');
  }
  const next = {};
  for (const id of ['scatter', 'needle']) {
    const rank = ranks[id] ?? 1;
    if (!Number.isInteger(rank) || rank < 0 || rank > 2) throw new RangeError('Weapon rank must be 0, 1 or 2');
    next[id] = Math.max(1, rank);
  }
  state.weaponRanks = next;
  return {...next};
}

/** Los niveles comprados cambian los disparos siguientes, nunca los que ya vuelan. */
export function setClassicWeaponLevels(state, levels = {}) {
  if (!levels || typeof levels !== 'object' || Array.isArray(levels) ||
      Object.keys(levels).some(id => !Object.hasOwn(CLASSIC_WEAPON_LEVELS, id))) throw new TypeError('Known weapon levels required');
  const next = {};
  for (const id of Object.keys(CLASSIC_WEAPON_LEVELS)) {
    const value = levels[id] ?? 1;
    if (!Number.isInteger(value) || value < 1 || value > 4) throw new RangeError('Weapon level must be 1 to 4');
    next[id] = value;
  }
  state.weaponLevels = next;
  return {...next};
}

function tunedWeaponDefinition(state) {
  const base = CLASSIC_WEAPON_RULES.types[state.selected];
  const levels = CLASSIC_WEAPON_LEVELS[state.selected];
  if (levels) {
    const value = state.weaponLevels?.[state.selected] ?? 1;
    return {...base, ...levels[value], level: value};
  }
  if (state.selected === 'scatter' && state.weaponRanks?.scatter === 2) {
    return {...base, duration: .48,
      description: 'Daño ×3 si impactan los tres pulsos; apertura concentrada y alcance ampliado de 224 a 317.',
      barrels: base.barrels.map(barrel => ({...barrel, spread: barrel.spread * (.11 / .16)}))};
  }
  if (state.selected === 'needle' && state.weaponRanks?.needle === 2) {
    return {...base, cooldown: .46, pierce: 4,
      description: 'Daño ×2 por objetivo: perfora hasta cuatro objetivos y dispara cada 0,46 s.'};
  }
  return base;
}

/** Atlas changes firing policy, never the stored magazine or its progress. */
export function setClassicUnlimitedFire(state, active) {
  if (typeof active !== 'boolean') throw new TypeError('Unlimited fire flag must be boolean');
  state.unlimitedFire = active;
  return active;
}

/** Check before the caller durably spends one of its three special missiles. */
export function canTriggerClassicMissile(state) {
  return state.missileCooldown <= 1e-9 &&
    state.projectiles.length < CLASSIC_WEAPON_RULES.maxProjectiles;
}

/**
 * The caller owns persistent ammunition and must commit its unique missile:N
 * receipt before emission. Rendering and replaying an already emitted receipt
 * cannot create another projectile. This local sequence resets with a match;
 * the receipt sequence itself belongs to the persistent salvage ledger.
 */
export function triggerClassicMissile(state, {x, y, angle = -Math.PI / 2, shotId} = {}) {
  finite(x,'origin x');finite(y,'origin y');finite(angle,'angle');
  if(typeof shotId!=='string' || !/^missile:[1-9]\d*$/.test(shotId) ||
    !Number.isSafeInteger(Number(shotId.slice(8))))throw new TypeError('Durable missile:N receipt required');
  const receipt = Number(shotId.slice(8));
  if(receipt<=state.missileSequence)return {accepted:false,reason:'duplicate',events:[],projectiles:[]};
  if(state.missileCooldown>1e-9)return {accepted:false,reason:'cooldown',events:[],projectiles:[]};
  if(state.projectiles.length>=CLASSIC_WEAPON_RULES.maxProjectiles)
    return {accepted:false,reason:'capacity',events:[],projectiles:[]};
  const definition=CLASSIC_WEAPON_RULES.missile;
  const projectile={id:`${state.version}:projectile:${++state.projectileSequence}`,shotId,
    weapon:'missile',special:true,missile:true,barrel:0,x,y,
    vx:Math.cos(angle)*definition.speed,vy:Math.sin(angle)*definition.speed,
    damage:definition.damage,radius:definition.radius,pierce:1,
    duration:definition.duration,life:definition.duration,hitTargets:[]};
  state.missileSequence=receipt;state.missileCooldown=definition.cooldown;
  state.projectiles.push(projectile);
  return {accepted:true,shotId,projectiles:[projectile],events:[
    event(state,'missileFired',{shotId,weapon:'missile',special:true}),
    event(state,'projectile',{projectile:{...projectile,hitTargets:[]}})
  ]};
}

/** Reward/save code owns when this is called; repeated delivery is harmless. */
export function unlockClassicWeapon(state, type) {
  knownType(type);
  if (state.unlocked.includes(type)) return {accepted: false, reason: 'unlocked', events: []};
  state.unlocked.push(type);
  return {accepted: true, events: [event(state, 'unlocked', {weapon: type})]};
}

/** Switching an unlocked weapon preserves ammunition, recharge and cooldown. */
export function selectClassicWeapon(state, type) {
  knownType(type);
  if (!state.unlocked.includes(type)) return {accepted: false, reason: 'locked', events: []};
  if (state.selected === type) return {accepted: false, reason: 'selected', events: []};
  state.selected = type;
  return {accepted: true, events: [event(state, 'selected', {weapon: type})]};
}

/**
 * One trigger spends one charge, including a two-barrel weapon. The returned
 * projectiles belong to state.projectiles; render them without applying a
 * second movement update. Their emitted event copies are immutable snapshots
 * for sound/VFX dispatch and must not be re-emitted by an animation frame.
 */
export function triggerClassicWeapon(state, {x, y, angle = -Math.PI / 2} = {}) {
  finite(x, 'origin x'); finite(y, 'origin y'); finite(angle, 'angle');
  if (!state.unlimitedFire && state.charges === 0) return {accepted: false, reason: 'empty', events: [], projectiles: []};
  if (state.cooldown > 1e-9) return {accepted: false, reason: 'cooldown', events: [], projectiles: []};
  const definition = tunedWeaponDefinition(state);
  if (state.projectiles.length + definition.barrels.length > CLASSIC_WEAPON_RULES.maxProjectiles) {
    return {accepted: false, reason: 'capacity', events: [], projectiles: []};
  }
  const wasFull = state.charges === top(state);
  if (!state.unlimitedFire) {
    state.charges--;
    if (wasFull) state.recharge = 0;
  }
  state.cooldown = definition.cooldown;
  const shotId = `${state.version}:shot:${++state.shotSequence}`;
  const events = [event(state, 'fired', {shotId, weapon: state.selected,
    charges: state.charges, barrels: definition.barrels.length})];
  const projectiles = definition.barrels.map((barrel, barrelIndex) => {
    const direction = angle + barrel.spread;
    // The local right vector is perpendicular to the firing direction. This
    // keeps two muzzle positions attached to the hull even when it banks.
    const projectile = {
      id: `${state.version}:projectile:${++state.projectileSequence}`, shotId,
      weapon: state.selected, barrel: barrelIndex, level: definition.level || 1,
      x: x - Math.sin(angle) * barrel.offset,
      y: y + Math.cos(angle) * barrel.offset,
      vx: Math.cos(direction) * definition.speed,
      vy: Math.sin(direction) * definition.speed,
      damage: definition.damage, radius: definition.radius, pierce: definition.pierce || 1,
      duration: definition.duration, life: definition.duration,
      hitTargets: []
    };
    events.push(event(state, 'projectile', {projectile: {...projectile, hitTargets: []}}));
    return projectile;
  });
  state.projectiles.push(...projectiles);
  return {accepted: true, shotId, events, projectiles};
}

/**
 * Recharge uses played time only. Full batteries store no hidden recharge,
 * later triggers do not restart a running recharge, and long foreground gaps
 * advance at most one normal 50 ms update rather than granting free ammo.
 */
export function advanceClassicWeapons(state, delta) {
  finite(delta, 'delta');
  if (delta < 0) throw new RangeError('Finite nonnegative delta required');
  if (delta === 0) return [];
  const dt = Math.min(delta, CLASSIC_WEAPON_RULES.maxDelta);
  const events = [];
  state.elapsed += dt;
  state.cooldown = Math.max(0, state.cooldown - dt);
  state.missileCooldown = Math.max(0, state.missileCooldown - dt);
  if (!state.unlimitedFire && state.charges < top(state)) {
    state.recharge += dt;
    while (state.recharge + 1e-9 >= state.rechargeSeconds &&
      state.charges < top(state)) {
      state.charges++;
      state.recharge = Math.max(0, state.recharge - state.rechargeSeconds);
      events.push(event(state, 'recharged', {charges: state.charges}));
    }
  }
  if (state.charges === top(state)) state.recharge = 0;
  const margin = CLASSIC_WEAPON_RULES.boundsMargin;
  for (let index = state.projectiles.length - 1; index >= 0; index--) {
    const projectile = state.projectiles[index];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.life = Math.max(0, projectile.life - dt);
    const outside = projectile.x < -margin || projectile.x > state.width + margin ||
      projectile.y < -margin || projectile.y > state.height + margin;
    if (projectile.life <= 1e-9 || outside) {
      state.projectiles.splice(index, 1);
      events.push(event(state, 'expired', {projectileId: projectile.id,
        reason: outside ? 'bounds' : 'lifetime'}));
    }
  }
  return events;
}

/**
 * Report a collision once after the caller's established hitbox test. A target
 * is identified by a stable entity ID, not a changing array index. Only the
 * accepted result applies damage/reward; repeating a rendered impact is inert.
 */
export function hitClassicProjectile(state, projectileId, targetId) {
  if (typeof projectileId !== 'string' || !projectileId) throw new TypeError('Projectile ID required');
  if (!((typeof targetId === 'string' && targetId.length > 0) || Number.isSafeInteger(targetId))) {
    throw new TypeError('Stable target ID required');
  }
  const index = state.projectiles.findIndex(projectile => projectile.id === projectileId);
  if (index < 0) return {accepted: false, reason: 'inactive', damage: 0, events: []};
  const projectile = state.projectiles[index];
  const key = `${typeof targetId}:${targetId}`;
  if (projectile.hitTargets.includes(key)) {
    return {accepted: false, reason: 'duplicate', damage: 0, events: []};
  }
  projectile.hitTargets.push(key);
  projectile.pierce--;
  if (projectile.pierce <= 0) state.projectiles.splice(index, 1);
  return {accepted: true, damage: projectile.damage,
    events: [event(state, 'hit', {projectileId, shotId: projectile.shotId,
      targetId, damage: projectile.damage, x: projectile.x, y: projectile.y,
      weapon: projectile.weapon})]};
}

/** Deep copies of mutable arrays prevent HUD/diagnostics from changing combat. */
export function classicWeaponSnapshot(state) {
  const definition = tunedWeaponDefinition(state);
  return {...state, unlocked: [...state.unlocked], weaponRanks: {...state.weaponRanks}, weaponLevels: {...state.weaponLevels},
    label: definition.label, description: definition.description,
    damageMultiplier: definition.damageMultiplier,
    rechargeProgress: state.charges === top(state) ? 0 :
      Math.min(1, state.recharge / state.rechargeSeconds),
    projectiles: state.projectiles.map(projectile => ({...projectile,
      hitTargets: [...projectile.hitTargets]}))};
}
