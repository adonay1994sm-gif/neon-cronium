/**
 * Subguardián, subjefe del tramo 5 del sector 1 (decisiones del propietario
 * del 24/10 y 31/10/2026: dec-subguardian, dec-subjefe-mejoras,
 * dec-subguardian-plan). Hermano menor de Atlas que sustituye al CH-03: se
 * mueve por la parte de arriba y cambia de altura entre ataques, sale con 4
 * escoltas (las pone el juego) y turna tres ataques siempre avisados:
 * cañones gemelos hacia la nave, abanico y el láser grande que barre.
 * El láser hace el daño del barrido del CH-03 (14); los disparos, el de los
 * cañones y el abanico de Atlas (13 y 15). Sin furia.
 * Puro: reloj de juego que pasa el llamador y azar con semilla.
 */
export const SUBGUARDIAN_RULES = Object.freeze({
  hp: 60, entrySeconds: 2, holdY: .29, rest: 1.1, defeatSeconds: 1.6, damagedAt: .35,
  // Patrulla: va hacia un punto nuevo de la franja de arriba entre ataques y
  // sigue derivando despacio durante los cañones y el abanico.
  // holdY .29: por debajo del panel del jefe, que tapa la franja de arriba.
  motion: Object.freeze({speed: 150, attackSpeed: 55, minX: .24, maxX: .76, heightJitter: .04}),
  // El emisor del láser está bajo el cuerpo: el rayo nace ahí.
  emitterY: 64,
  twin: Object.freeze({warning: .55, bursts: 3, gap: .32, offset: 46, speed: 430, damage: 13}),
  fan: Object.freeze({warning: .6, projectiles: 7, spread: .7, speed: 360, waves: 2, gap: .5, damage: 15}),
  // ±0,5 rad: a la altura de la nave el rayo recorre la pantalla de borde a borde.
  laser: Object.freeze({warning: 1.1, range: .5, speed: .3, width: 28, damage: 14, recoil: 26})
});
const ORDER = Object.freeze(['twin', 'fan', 'laser']);

function nextRandom(boss) {
  boss.rng = (boss.rng + 0x6D2B79F5) >>> 0;
  let value = Math.imul(boss.rng ^ boss.rng >>> 15, 1 | boss.rng);
  value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
}

export function createSubguardian({width, height, seed = 0}) {
  if (![width, height, seed].every(Number.isFinite) || width < 280 || height < 540) throw new RangeError('Invalid subguardian arena');
  const holdY = height * SUBGUARDIAN_RULES.holdY;
  return {width, height, x: width / 2, y: -140, vx: 0, holdY, targetX: width / 2, targetY: holdY,
    hp: SUBGUARDIAN_RULES.hp, maxHp: SUBGUARDIAN_RULES.hp, state: 'entry', stateTime: 0, attack: null, attacks: 0,
    beam: null, volleys: 0, recoil: 0, resolved: false, defeatAnnounced: false,
    rng: (Math.imul(Math.trunc(seed) >>> 0, 0x9E3779B9) ^ 0x53554247) >>> 0};
}

function chooseAttack(boss) {
  if (boss.attacks < ORDER.length) return ORDER[boss.attacks];
  const options = ORDER.filter(attack => attack !== boss.attack);
  return options[Math.floor(nextRandom(boss) * options.length)];
}

function enter(boss, state) { boss.state = state; boss.stateTime = 0; }

function pickTarget(boss) {
  const {minX, maxX, heightJitter} = SUBGUARDIAN_RULES.motion;
  // Siempre a otra mitad de la franja: un cambio de sitio que se nota.
  const left = boss.x > boss.width / 2;
  const span = (maxX - minX) / 2;
  boss.targetX = boss.width * (left ? minX + nextRandom(boss) * span * .8 : maxX - nextRandom(boss) * span * .8);
  boss.targetY = boss.holdY + boss.height * heightJitter * (nextRandom(boss) * 2 - 1);
}

function move(boss, dt, speed) {
  const dx = boss.targetX - boss.x, dy = boss.targetY - boss.y, distance = Math.hypot(dx, dy);
  if (distance < 1) { boss.vx = 0; return true; }
  const step = Math.min(distance, speed * dt);
  boss.x += dx / distance * step; boss.y += dy / distance * step;
  boss.vx = dx / distance * speed;
  return false;
}

/** Punto de salida del rayo (bajo el cuerpo). */
export function subguardianEmitter(boss) {
  return {x: boss.x, y: boss.y + SUBGUARDIAN_RULES.emitterY};
}

function fireTwin(boss, emit, target) {
  const {offset, speed, damage} = SUBGUARDIAN_RULES.twin;
  for (const side of [-1, 1]) {
    const x = boss.x + side * offset, y = boss.y + 40;
    const dx = target.x - x, dy = Math.max(40, target.y - y), length = Math.hypot(dx, dy);
    emit({type: 'projectile', x, y, vx: dx / length * speed, vy: dy / length * speed, damage});
  }
  boss.volleys++;
}

function fireFan(boss, emit) {
  const {projectiles, spread, speed, damage} = SUBGUARDIAN_RULES.fan;
  // La segunda onda va desplazada medio hueco: no se repite el mismo pasillo.
  const shift = boss.volleys % 2 ? spread / (projectiles - 1) / 2 : 0;
  for (let k = 0; k < projectiles; k++) {
    const angle = -spread / 2 + k * spread / (projectiles - 1) + shift;
    emit({type: 'projectile', x: boss.x, y: boss.y + 40, vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed, damage});
  }
  boss.volleys++;
}

function warningSeconds(attack) { return SUBGUARDIAN_RULES[attack].warning; }

function startWarning(boss, emit) {
  boss.attack = chooseAttack(boss);
  if (boss.attack === 'laser') {
    // El aviso marca por dónde empieza el barrido.
    const direction = nextRandom(boss) < .5 ? -1 : 1;
    boss.beam = {angle: -direction * SUBGUARDIAN_RULES.laser.range, direction, active: false};
  }
  enter(boss, 'warning');
  emit({type: 'warning', attack: boss.attack});
}

function endAttack(boss) {
  boss.beam = null; boss.volleys = 0; boss.attacks++;
  pickTarget(boss);
  enter(boss, 'idle');
}

function advanceAttack(boss, dt, emit, target) {
  if (boss.attack === 'laser') {
    const {range, speed} = SUBGUARDIAN_RULES.laser;
    boss.beam.angle += boss.beam.direction * speed * dt;
    if (Math.abs(boss.beam.angle) >= range && Math.sign(boss.beam.angle) === boss.beam.direction) endAttack(boss);
  } else if (boss.attack === 'twin') {
    const {bursts, gap} = SUBGUARDIAN_RULES.twin;
    while (boss.volleys < bursts && boss.stateTime >= boss.volleys * gap) fireTwin(boss, emit, target);
    if (boss.stateTime >= bursts * gap) endAttack(boss);
  } else {
    const {waves, gap} = SUBGUARDIAN_RULES.fan;
    while (boss.volleys < waves && boss.stateTime >= boss.volleys * gap) fireFan(boss, emit);
    if (boss.stateTime >= waves * gap) endAttack(boss);
  }
}

/** Avanza el combate. target: posición de la nave (los cañones apuntan ahí).
 * Eventos: warning {attack}, fire {attack} al empezar cada ataque,
 * projectile {x, y, vx, vy, damage} y defeated (una vez). dt = 0 no cambia
 * nada (pausa). */
export function advanceSubguardian(boss, dt, emit, target = {x: boss.width / 2, y: boss.height * .85}) {
  if (!(dt > 0) || boss.resolved) return;
  boss.stateTime += dt;
  boss.recoil = Math.max(0, boss.recoil - dt * 60);
  const {motion} = SUBGUARDIAN_RULES;
  if (boss.state === 'entry') {
    const progress = Math.min(1, boss.stateTime / SUBGUARDIAN_RULES.entrySeconds);
    boss.y = -140 + (boss.holdY + 140) * (1 - (1 - progress) ** 3);
    if (progress >= 1) { pickTarget(boss); enter(boss, 'idle'); }
  } else if (boss.state === 'idle') {
    const arrived = move(boss, dt, motion.speed);
    if (boss.stateTime >= SUBGUARDIAN_RULES.rest && (arrived || boss.stateTime >= SUBGUARDIAN_RULES.rest * 2)) startWarning(boss, emit);
  } else if (boss.state === 'warning') {
    // Quieto mientras avisa el láser (el aviso no se mueve); con los cañones
    // y el abanico sigue derivando.
    if (boss.attack === 'laser') boss.vx = 0;
    else if (move(boss, dt, motion.attackSpeed)) pickTarget(boss);
    if (boss.stateTime >= warningSeconds(boss.attack)) {
      enter(boss, 'attack'); boss.volleys = 0;
      if (boss.attack === 'laser') { boss.beam.active = true; boss.recoil = SUBGUARDIAN_RULES.laser.recoil; }
      emit({type: 'fire', attack: boss.attack});
      advanceAttack(boss, 0, emit, target);
    }
  } else if (boss.state === 'attack') {
    if (boss.attack !== 'laser' && move(boss, dt, motion.attackSpeed)) pickTarget(boss);
    if (boss.attack === 'laser') boss.vx = 0;
    advanceAttack(boss, dt, emit, target);
  } else if (boss.state === 'defeated') {
    boss.vx = 0;
    if (!boss.defeatAnnounced) { boss.defeatAnnounced = true; emit({type: 'defeated'}); }
    if (boss.stateTime >= SUBGUARDIAN_RULES.defeatSeconds) boss.resolved = true;
  }
}

/** Daño a la nave del láser encendido (0 si no la toca). */
export function subguardianHitsShip(boss, ship) {
  if (boss.state !== 'attack' || boss.attack !== 'laser' || !boss.beam?.active) return 0;
  const origin = subguardianEmitter(boss);
  const dx = Math.sin(boss.beam.angle), dy = Math.cos(boss.beam.angle);
  const along = (ship.x - origin.x) * dx + (ship.y - origin.y) * dy;
  if (along <= 0) return 0;
  const across = Math.abs((ship.x - origin.x) * dy - (ship.y - origin.y) * dx);
  return across <= SUBGUARDIAN_RULES.laser.width / 2 + ship.r ? SUBGUARDIAN_RULES.laser.damage : 0;
}

export function hitSubguardian(boss, damage = 1) {
  if (!(damage > 0) || boss.state === 'entry' || boss.state === 'defeated') return {accepted: false, hp: boss.hp};
  boss.hp = Math.max(0, boss.hp - damage);
  if (boss.hp === 0) { boss.beam = null; enter(boss, 'defeated'); }
  return {accepted: true, hp: boss.hp};
}

/** Dibujo de la hoja (4×2): 0 reposo, 1 inclinado a la izquierda, 2 a la
 * derecha, 3 dañado, 4 cañones, 5 carga del láser, 6 disparo del láser,
 * 7 derrota. */
export function subguardianFrame(boss) {
  if (boss.state === 'defeated') return 7;
  if (boss.attack === 'laser' && boss.state === 'warning') return 5;
  if (boss.attack === 'laser' && boss.state === 'attack') return 6;
  if (boss.state === 'attack' && boss.attack === 'twin') return 4;
  if (boss.vx < -40) return 1;
  if (boss.vx > 40) return 2;
  return boss.hp <= boss.maxHp * SUBGUARDIAN_RULES.damagedAt ? 3 : 0;
}
