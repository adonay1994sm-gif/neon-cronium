import {createCh01Animator} from '../animation/ch01-animator.js';
import {requestAttack, releaseAttack} from './attack-tokens.js';

export const CLASSIC_PURSUIT_VERSION = 'classic-pursuit-v5';
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const approach = (value, target, amount) => value + clamp(target - value, -amount, amount);
// Acelerón ocasional al reposicionarse, nunca por encima de este límite.
const MAX_LATERAL_SPEED = 176;
const profiles = Object.freeze({
  raider: Object.freeze({warning: .32, recovery: 1.25, maxAttacks: 8, holdSeconds: 9,
    depth: .30, lateralSpeed: 140, acceleration: 265, sampleInterval: .24,
    orbitRate: .96, lateralSweep: .68, depthSweep: 25,
    projectileSpeed: 360, leadSeconds: .32, damage: 14,
    volleys: Object.freeze({single: .45, double: .35, spread: .20}), flipChance: .7, dashChance: .15}),
  scout: Object.freeze({warning: .38, recovery: 1.6, maxAttacks: 7, holdSeconds: 10,
    depth: .29, lateralSpeed: 104, acceleration: 190, sampleInterval: .32,
    orbitRate: .76, lateralSweep: .72, depthSweep: 32,
    projectileSpeed: 335, leadSeconds: .22, damage: 12,
    volleys: Object.freeze({single: .50, double: .15, spread: .35}), flipChance: .6, dashChance: .1}),
  interceptor: Object.freeze({warning: .30, recovery: 1.15, maxAttacks: 10, holdSeconds: 11,
    depth: .27, lateralSpeed: 176, acceleration: 315, sampleInterval: .2,
    orbitRate: 1.23, lateralSweep: .9, depthSweep: 40,
    projectileSpeed: 390, leadSeconds: .38, damage: 15,
    volleys: Object.freeze({single: .25, double: .45, spread: .30}), flipChance: .75, dashChance: .35})
});

// Only already observed positions can influence a lead. Sampling limits both
// reaction speed and velocity; neither current input nor a launched shot is read.
function observePlayer(enemy, player, interval) {
  if (enemy.age + 1e-9 < enemy.nextObservationAt) return;
  const prior = enemy.observation, elapsed = prior ? enemy.age - prior.at : 0;
  const vx = elapsed > 0 ? clamp((player.x - prior.x) / elapsed, -720, 720) : 0;
  const vy = elapsed > 0 ? clamp((player.y - prior.y) / elapsed, -560, 560) : 0;
  enemy.observation = {x: player.x, y: player.y, at: enemy.age,
    vx: prior ? prior.vx * .35 + vx * .65 : 0,
    vy: prior ? prior.vy * .35 + vy * .65 : 0};
  enemy.nextObservationAt = enemy.age + interval;
}

function variationFor(seed) {
  let value = Math.imul((Math.trunc(seed) >>> 0) ^ 0x9E3779B9, 0x85EBCA6B);
  value = Math.imul(value ^ value >>> 16, 0xC2B2AE35);
  return ((value ^ value >>> 13) >>> 0) / 4294967296;
}

// v5: secuencia aleatoria propia de cada enemigo (reproducible por semilla)
// para variar ráfagas, esperas y cambios de lado sin que dos partidas iguales
// se memoricen. Nunca afecta a un proyectil ya lanzado.
function nextRandom(enemy) {
  enemy.rng = (enemy.rng + 0x6D2B79F5) >>> 0;
  let value = Math.imul(enemy.rng ^ enemy.rng >>> 15, 1 | enemy.rng);
  value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
}

function chooseVolley(enemy, weights) {
  // El primer ataque es siempre un tiro simple: enseña el aviso antes de
  // combinar ráfagas dobles y abanicos de tres.
  if (enemy.fired === 0) return 'single';
  let roll = nextRandom(enemy);
  for (const [kind, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return kind;
  }
  return 'single';
}

// Proyectiles por ataque, separación de la ráfaga doble y apertura del abanico.
// Abanico abierto (spec 6.10, plan F3b): 5 disparos muy separados en un cono mayor.
// Solo el abanico usa ese cono; los tiros simples y dobles se quedan en ~33°
// (auditoría A15, propietario 06/11).
export const CLASSIC_PURSUIT_VOLLEY = Object.freeze({maxProjectiles: 5, doubleGap: .2, spreadAngle: .30, spreadCount: 5, cone: .65, spreadCone: 1.2});

/** An encounter policy inside the existing item/update loop; owns no clock or RAF.
 * Aim uses bounded lead from past position samples, locked at weapon deployment.
 * The caller integrates Y once using item.s. This policy brakes that speed to
 * hold a visible combat band, then resumes forward flight on a bounded retreat.
 */
export function createClassicPursuer({x, width = 720, height = 1280,
  role = 'scout', seed = 0, minAttackY = Math.max(96, height * .105),
  baseSpeed = null} = {}) {
  if (![x, width, height, seed, minAttackY].every(Number.isFinite) || width < 250 || height < 300 ||
    !Object.hasOwn(profiles, role) || (baseSpeed !== null && (!Number.isFinite(baseSpeed) || baseSpeed <= 0))) {
    throw new RangeError('Invalid classic pursuer spawn');
  }
  const side = (Math.abs(Math.trunc(seed)) % 2) ? -1 : 1;
  const combatMargin = Math.min(width * .32, Math.max(80, width * .18));
  const entryInset = Math.min(16, (width - combatMargin * 2) * .15);
  return {
    tacticsVersion: CLASSIC_PURSUIT_VERSION, role, width, height, minAttackY,
    seed, side, phase: (Math.abs(seed) * .61803398875 % 1) * Math.PI * 2,
    // Stable individual flight signatures, rather than changing random numbers
    // every frame. They change intent targets, never teleport the physical body.
    manoeuvreRate: .84 + variationFor(seed) * .32,
    sweepScale: .82 + variationFor(seed + 107) * .36,
    manoeuvre: role === 'scout' ? 'survey-orbit' : role === 'interceptor' ? 'flank-arc' : 'attack-strafe',
    age: 0, state: 'entry', stage: 'entry', stateAge: 0,
    baseX: clamp(x, combatMargin, width - combatMargin),
    targetX: clamp(x, combatMargin + entryInset, width - combatMargin - entryInset), vx: 0,
    combatMinX: combatMargin, combatMaxX: width - combatMargin,
    holdY: null, combatStartedAt: null, retreatReason: null, repositionCount: 0, intensity: 0,
    observation: null, nextObservationAt: 0, observedTarget: null, leadOffset: 0,
    baseSpeed, nextTargetAt: 0, nextFire: 1.25,
    fired: 0, telegraph: 0, lockedTarget: null, attackScheduled: false,
    chargeSerial: 0, firedSerial: -1, previousHp: null, chargeStartedAt: null,
    rng: (Math.imul(Math.trunc(seed) >>> 0, 0x9E3779B9) ^ 0x51ED270B) >>> 0,
    volley: 'single', followUp: null, dashing: false, bornAt: null,
    animator: createCh01Animator({hp: 2, maxHp: 2})
  };
}

/** `gate = {tokens, now}` (sector, plan F3b): solo carga quien tiene turno de
 * ataque y lo devuelve al recolocarse, retirarse o morir; sin escalada. */
export function advanceClassicPursuer(item, dt, player, spawnProjectile, gate = null) {
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Invalid pursuer delta');
  if (typeof spawnProjectile !== 'function') throw new TypeError('Spawn callback required');
  const enemy = item.classicScout;
  if (!enemy || dt === 0) return;
  if (![item.x, item.y, item.s, player?.x, player?.y].every(Number.isFinite)) {
    throw new TypeError('Finite pursuer and player positions required');
  }
  // Match the animator/legacy frame cap: a background resume cannot skip the
  // warning. The caller keeps responsibility for clamping its own Y delta.
  const step = Math.min(dt, .05), profile = profiles[enemy.role];
  const hp = item.hp ?? 2, maxHp = item.maxHp ?? 2;
  enemy.baseSpeed ??= Math.max(1, item.s);
  enemy.age += step;
  enemy.stateAge += step;
  if (gate) enemy.bornAt ??= gate.now;
  const releaseTurn = () => { if (gate) releaseAttack(gate.tokens, item.id); };
  observePlayer(enemy, player, profile.sampleInterval);
  const lostHealth = enemy.previousHp !== null && hp < enemy.previousHp;
  enemy.previousHp = hp;
  const enter = state => {
    enemy.state = enemy.stage = state;
    enemy.stateAge = 0;
  };
  const combatX = value => clamp(value, enemy.combatMinX, enemy.combatMaxX);
  const minimumHoldY = enemy.minAttackY + 52;
  const maximumHoldY = Math.max(minimumHoldY, Math.min(enemy.height * .52, player.y - 350));
  const flightPhase = enemy.phase + enemy.age * profile.orbitRate * enemy.manoeuvreRate;
  // Correlated lateral/depth targets create a physical arc. A firing opponent
  // briefly steadies its weapon, while recovery is its largest manoeuvre.
  const depthArc = Math.cos(flightPhase) * profile.depthSweep *
    (['charge', 'fire'].includes(enemy.state) ? .35 : 1);
  // Formación (propietario, 12/11/2026): con puesto asignado (`enemy.slot`, lo
  // pone formation.js) lo mantiene con un vaivén corto, en vez de su carril propio.
  const slot = enemy.slot || null;
  enemy.holdY = clamp(slot ? slot.y + depthArc * .2 :
    enemy.height * profile.depth + depthArc + Math.sin(enemy.phase) * 12, minimumHoldY, maximumHoldY);
  // holdFire: alto el fuego que pone el juego durante una lluvia de cometas
  // (propietario 22/10, auditoría J04). Cancela la carga y no dispara.
  const canAttack = () => hp > 0 && enemy.state !== 'retreat' && !enemy.holdFire &&
    item.y >= enemy.minAttackY && item.y + 38 <= player.y - 230;
  const clearCharge = () => {
    enemy.telegraph = 0;
    enemy.attackScheduled = false;
    enemy.lockedTarget = null;
  };
  const laneTarget = () => {
    if (slot) return combatX(slot.x);
    const sample = enemy.observation;
    const observedX = combatX(sample.x + clamp(sample.vx * .18, -64, 64));
    const span = Math.min(enemy.width * .24, 140);
    const sweep = Math.sin(flightPhase) * span * profile.lateralSweep * enemy.sweepScale;
    return combatX(enemy.role === 'interceptor' ? observedX + enemy.side * span * .68 + sweep :
      enemy.role === 'scout' ? enemy.baseX * .45 + observedX * .55 + enemy.side * span * .2 + sweep :
        observedX + enemy.side * span * .42 + sweep);
  };
  const reposition = () => {
    releaseTurn();
    clearCharge();
    enemy.followUp = null;
    // No siempre cambia de flanco, a veces acelera, y la espera varía.
    if (nextRandom(enemy) < profile.flipChance) enemy.side *= -1;
    enemy.dashing = nextRandom(enemy) < profile.dashChance;
    enemy.repositionCount++;
    enemy.targetX = laneTarget();
    enemy.nextTargetAt = enemy.age + profile.sampleInterval;
    enemy.nextFire = enemy.age + profile.recovery * (1 - .18 * enemy.intensity) * (.65 + nextRandom(enemy) * .7);
    enter('reposition');
  };
  const retreat = reason => {
    releaseTurn();
    clearCharge();
    enemy.followUp = null;
    enemy.retreatReason = reason;
    // Only the final departure uses the outer lane. Combat targets stay in
    // the player's reachable interior, and retreat still has real collision.
    enemy.targetX = player.x < enemy.width / 2 ? enemy.width - 56 : 56;
    enter('retreat');
  };

  if (hp <= 0) {
    releaseTurn();
    clearCharge();
    enemy.followUp = null;
    if (enemy.state !== 'destroyed') enter('destroyed');
  } else if (enemy.state !== 'retreat' && enemy.state !== 'destroyed') {
    const heldFor = enemy.combatStartedAt === null ? 0 : enemy.age - enemy.combatStartedAt;
    // Propietario (21/10): el enemigo que no eliminas no se va; sigue atacando
    // y cada holdSeconds sube un nivel de intensidad (hasta 2 desde el 22/10,
    // auditoría J01: recarga ×0,64),
    // para que con muchas patrullas haya que decidir a quién derribar primero.
    // Solo se retira si nunca puede atacar (p. ej. nave pegada al marcador).
    // Con turnos de ataque (sector) no hay escalada: los turnos la sustituyen (spec 6.9).
    enemy.intensity = gate ? 0 : Math.min(2, Math.floor(heldFor / profile.holdSeconds));
    if ((enemy.fired === 0 && heldFor >= profile.holdSeconds) ||
        (enemy.combatStartedAt === null && enemy.age >= profile.holdSeconds + 8)) {
      retreat('time-limit');
    } else if (lostHealth && !['entry', 'brake'].includes(enemy.state)) {
      // Same HP sample reaches the animator below: hurt cancels its fire event.
      reposition();
    } else if (enemy.state === 'charge' && !canAttack()) {
      reposition();
    }
  }

  // Entra ya hacia su puesto y lo sigue de continuo si el dibujo se desplaza.
  if (slot && ['entry', 'brake', 'track', 'reposition'].includes(enemy.state)) enemy.targetX = laneTarget();
  if (enemy.state === 'entry' && item.y >= enemy.holdY - 110) enter('brake');
  if (enemy.state === 'brake' && Math.abs(item.y - enemy.holdY) <= 32 && Math.abs(item.s) <= 62 &&
      item.x >= enemy.combatMinX && item.x <= enemy.combatMaxX) {
    enemy.combatStartedAt ??= enemy.age;
    enemy.targetX = laneTarget();
    enemy.nextTargetAt = enemy.age + profile.sampleInterval;
    enter('track');
  }
  if (enemy.state === 'fire' && enemy.stateAge >= .34) {
    reposition();
  }
  if (enemy.state === 'reposition' && enemy.age >= enemy.nextFire) enter('track');

  // Continue the curved manoeuvre between shots instead of travelling to one
  // fixed X and waiting there. Observations remain rate-limited by role.
  if (enemy.state === 'reposition' && enemy.age >= enemy.nextTargetAt) {
    enemy.targetX = laneTarget();
    enemy.nextTargetAt = enemy.age + profile.sampleInterval;
  }

  if (enemy.state === 'track') {
    if (enemy.age >= enemy.nextTargetAt) {
      enemy.targetX = laneTarget();
      enemy.nextTargetAt = enemy.age + profile.sampleInterval;
    }
    if (canAttack() && enemy.age >= enemy.nextFire && !lostHealth &&
        Math.abs(item.y - enemy.holdY) <= 45 && Math.abs(item.s) <= 62 &&
        (!gate || requestAttack(gate.tokens, {id: item.id, bornAt: enemy.bornAt}, gate.now))) {
      const sample = enemy.observation;
      // La marca del Rastreador de Gaia (plan F3b) afina el adelanto ×1,5.
      enemy.leadOffset = clamp(sample.vx * profile.leadSeconds * (player.marked ? 1.5 : 1), -110, 110);
      enemy.observedTarget = Object.freeze({...sample});
      enemy.lockedTarget = Object.freeze({
        x: clamp(sample.x + enemy.leadOffset, 24, enemy.width - 24),
        y: clamp(sample.y + clamp(sample.vy * .12, -48, 48), item.y + 268, enemy.height - 24)
      });
      enemy.targetX = item.x;
      enemy.chargeStartedAt = enemy.age;
      enemy.chargeSerial++;
      enemy.volley = chooseVolley(enemy, profile.volleys);
      enter('charge');
    }
  }

  if (enemy.state === 'charge') {
    const warningElapsed = enemy.age - enemy.chargeStartedAt;
    enemy.telegraph = clamp(warningElapsed / profile.warning, 0, 1);
    // A brief physical weapon-deployment pose precedes the produced attack.
    // Only its returned fire event can emit one projectile for this charge.
    if (warningElapsed >= profile.warning && !enemy.attackScheduled) {
      enemy.attackScheduled = enemy.animator.request('attack');
    }
  }

  const previousX = item.x;
  const lateralLimit = enemy.dashing && enemy.state === 'reposition'
    ? Math.min(MAX_LATERAL_SPEED, profile.lateralSpeed * 1.3) : profile.lateralSpeed;
  const desiredVelocity = ['charge', 'fire', 'destroyed'].includes(enemy.state) ? 0 :
    clamp((enemy.targetX - item.x) * 2.8, -lateralLimit, lateralLimit);
  enemy.vx = approach(enemy.vx, desiredVelocity, profile.acceleration * step);
  const minimumX = enemy.state === 'retreat' ? 52 : Math.min(item.x, enemy.combatMinX);
  const maximumX = enemy.state === 'retreat' ? enemy.width - 52 : Math.max(item.x, enemy.combatMaxX);
  item.x = clamp(item.x + enemy.vx * step, minimumX, maximumX);
  enemy.vx = (item.x - previousX) / step;
  const desiredVertical = enemy.state === 'destroyed' ? 0 : enemy.state === 'retreat'
    ? enemy.baseSpeed * 1.35
    : clamp((enemy.holdY - item.y) * 1.8, -82, enemy.baseSpeed);
  item.s = approach(item.s, desiredVertical, enemy.baseSpeed * 1.8 * step);
  const events = enemy.animator.update(step, {hp, maxHp, vx: enemy.vx, vy: item.s});
  const launch = angleOffset => {
    const aim = enemy.lockedTarget;
    const dy = Math.max(1, aim.y - (item.y + 38));
    const cone = enemy.volley === 'spread' ? CLASSIC_PURSUIT_VOLLEY.spreadCone : CLASSIC_PURSUIT_VOLLEY.cone;
    const dx = clamp(aim.x - item.x, -dy * cone, dy * cone);
    // Los laterales del abanico se abren desde el tiro apuntado y se quedan
    // dentro del mismo cono hacia abajo; ninguno persigue tras salir.
    // El centro del abanico se desplaza lo justo para que quepa entero en el cono.
    const limit = Math.atan(cone);
    const half = enemy.volley === 'spread' ? CLASSIC_PURSUIT_VOLLEY.spreadAngle * (CLASSIC_PURSUIT_VOLLEY.spreadCount - 1) / 2 : 0;
    const angle = clamp(Math.atan2(dx, dy), -limit + half, limit - half) + angleOffset;
    const speed = profile.projectileSpeed;
    spawnProjectile({
      type: 'meteor', x: item.x, baseX: item.x, y: item.y + 38,
      r: 9, s: speed, vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed, life: 5,
      damage: profile.damage, rot: 0, rs: 0, p: 0, phase: 0,
      amp: 0, special: '', alpha: 1, hp: 1, maxHp: 1,
      classicScoutProjectile: true, tacticsVersion: CLASSIC_PURSUIT_VERSION,
      attackSerial: enemy.chargeSerial, role: enemy.role, volley: enemy.volley,
      observedTarget: {...enemy.observedTarget}, leadOffset: enemy.leadOffset
    });
  };
  // Segundo disparo de la ráfaga doble: mismo blanco fijado, poco después,
  // solo si el enemigo sigue vivo y en posición de disparo.
  if (enemy.followUp !== null && enemy.state === 'fire' && enemy.age >= enemy.followUp) {
    enemy.followUp = null;
    if (canAttack() && enemy.lockedTarget) launch(0);
  }
  for (const event of events) {
    if (event.name === 'attackCanceled' && enemy.state === 'charge') reposition();
    if (event.name !== 'fire' || enemy.state !== 'charge' || !enemy.attackScheduled ||
        enemy.firedSerial === enemy.chargeSerial || !canAttack()) continue;
    enemy.firedSerial = enemy.chargeSerial;
    enemy.fired++;
    enemy.telegraph = 0;
    enemy.attackScheduled = false;
    enter('fire');
    if (enemy.volley === 'spread') {
      const {spreadAngle, spreadCount} = CLASSIC_PURSUIT_VOLLEY;
      for (let k = 0; k < spreadCount; k++) launch((k - (spreadCount - 1) / 2) * spreadAngle);
    } else {
      launch(0);
      if (enemy.volley === 'double') enemy.followUp = enemy.age + CLASSIC_PURSUIT_VOLLEY.doubleGap;
    }
  }
}
