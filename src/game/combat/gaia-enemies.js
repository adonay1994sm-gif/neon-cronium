/**
 * Enemigos nuevos de la Guardia de Gaia (biblia §3.1, plan F3b): Rastreador
 * (Emboscador), Sembrador (Minador), Égida (Escolta) y Alfa (élite Cazador).
 * Adónde ir y cuándo atacar lo decide enemy-ai.js con turnos de ataque; aquí
 * se mueve el cuerpo y se emite cada habilidad tras su aviso. Puro: el reloj
 * es el `now` de juego que pasa el llamador y no hay azar.
 */
import {decideEnemyIntent} from './enemy-ai.js';
import {requestAttack, releaseAttack} from './attack-tokens.js';

// Cifras de partida; las ajusta el bot (spec §8). salvageRole: chatarra del
// enemigo actual equivalente, para no cambiar la economía.
export const GAIA_ENEMY_RULES = Object.freeze({
  tracker: Object.freeze({profile: 'ambusher', hp: 2, speed: 230, warning: .4, firstAttack: 1.2, salvageRole: 'interceptor',
    basic: Object.freeze({cooldown: 2.4, speed: 380, damage: 12}),
    unique: Object.freeze({cooldown: 9, markSeconds: 4}),
    // Las armas solo disparan hacia arriba: tras 3 ataques o 12 s adelanta a la
    // nave por un lado y sale por arriba, donde se le puede derribar.
    leave: Object.freeze({attacks: 3, seconds: 12, speed: 260, sideOffset: 120, exitY: -100})}),
  // Sembrador (propietario, 30/10 y 15/11/2026): «que tire unas cuantas minas
  // repartidas por donde vas a pasar y que se vaya». Una pasada: 4 minas en
  // zigzag delante de la nave (con hueco entre ellas) y se marcha por arriba.
  sower: Object.freeze({profile: 'miner', hp: 3, speed: 150, warning: .3, firstAttack: 1.2, salvageRole: 'raider',
    basic: Object.freeze({cooldown: .6}),
    unique: Object.freeze({cooldown: 10, speed: 300}),
    mine: Object.freeze({arm: .8, radius: 70, life: 7, damage: 16, flight: .5, drift: 90}),
    lay: Object.freeze({spacing: 170, ahead: 420, stagger: 140}),
    leave: Object.freeze({attacks: 4, seconds: 14, speed: 220, sideOffset: 200, exitY: -100}),
    bomb: Object.freeze({raySpeed: 320, damage: 12})}),
  aegis: Object.freeze({profile: 'escort', hp: 3, speed: 200, warning: 0, firstAttack: 1.5, salvageRole: 'scout',
    unique: Object.freeze({cooldown: 8, hits: 3})}),
  alpha: Object.freeze({profile: 'hunter', hp: 12, speed: 170, warning: .5, firstAttack: 1.5, clearance: 320, salvageRole: 'interceptor',
    basic: Object.freeze({cooldown: 1.6, speed: 360, spacing: 28, damage: 12}),
    unique: Object.freeze({cooldown: 7, speed: 240, damage: 12})}),
  // Escolta de la furia de Atlas (plan F3c): gira a su alrededor a 1,6·r y
  // dispara hacia abajo cuando tiene turno de ataque.
  atlasEscort: Object.freeze({profile: 'escort', hp: 3, speed: 260, warning: .35, firstAttack: 1.4, salvageRole: 'scout',
    orbit: Object.freeze({radius: 1.6, speed: .9}),
    basic: Object.freeze({cooldown: 2.6, speed: 360, damage: 10})})
});

export function createGaiaEnemy({kind, x, y, now = 0, angle = 0}) {
  const rules = GAIA_ENEMY_RULES[kind];
  if (!rules || ![x, y, now].every(Number.isFinite)) throw new RangeError('Invalid Gaia enemy spawn');
  // La primera habilidad única llega a media recarga: aparece pronto, pero no al nacer.
  return {kind, profile: rules.profile, hp: rules.hp, maxHp: rules.hp, bornAt: now,
    cooldowns: {basic: now + rules.firstAttack, unique: rules.unique ? now + rules.unique.cooldown * .5 : Infinity},
    telegraph: 0, pending: null, aim: null, heading: undefined, guardId: null, attacks: 0, leaving: false, angle};
}

function moveToward(item, target, maxStep) {
  const dx = target.x - item.x, dy = target.y - item.y, distance = Math.hypot(dx, dy);
  if (distance <= maxStep || distance === 0) { item.x = target.x; item.y = target.y; return; }
  item.x += dx / distance * maxStep;
  item.y += dy / distance * maxStep;
}

function aimed(from, to, speed) {
  const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
  return {vx: dx / length * speed, vy: dy / length * speed};
}

function unleash(item, ability, ctx, emit) {
  const {gaia} = item, rules = GAIA_ENEMY_RULES[gaia.kind];
  if (gaia.kind === 'tracker') {
    if (ability === 'unique') emit({type: 'mark', seconds: rules.unique.markSeconds});
    else {
      const from = {x: item.x, y: item.y - 30};
      emit({type: 'shot', ...from, ...aimed(from, gaia.aim, rules.basic.speed), damage: rules.basic.damage, sprite: 'orb'});
    }
  } else if (gaia.kind === 'sower') {
    if (ability === 'basic') {
      // Zigzag alrededor de donde estaba la nave al empezar la pasada.
      const {spacing, ahead, stagger} = rules.lay, k = gaia.attacks, half = spacing * (rules.leave.attacks - 1) / 2;
      gaia.mineCenter ??= Math.max(60 + half, Math.min(ctx.bounds.w - 60 - half, gaia.aim.x));
      emit({type: 'mine', x: item.x, y: item.y + 20, tx: gaia.mineCenter - half + k * spacing,
        ty: gaia.aim.y - ahead + (k % 2) * stagger});
    }
    else emit({type: 'cross-bomb', x: item.x, y: item.y, vx: (item.x < ctx.bounds.w / 2 ? -1 : 1) * rules.unique.speed});
  } else if (gaia.kind === 'atlasEscort') {
    const {speed, damage} = rules.basic;
    emit({type: 'shot', x: item.x, y: item.y + 24, vx: 0, vy: speed, damage, sprite: 'orb'});
  } else if (gaia.kind === 'alpha') {
    if (ability === 'basic') {
      // Cuatro cañones paralelos hacia abajo.
      const {spacing, speed, damage} = rules.basic;
      for (let k = 0; k < 4; k++) emit({type: 'shot', x: item.x + (k - 1.5) * spacing, y: item.y + 40, vx: 0, vy: speed, damage, sprite: 'missile'});
    } else {
      // Andanada en cruz: ocho direcciones.
      const {speed, damage} = rules.unique;
      for (let k = 0; k < 8; k++) {
        const angle = k * Math.PI / 4;
        emit({type: 'shot', x: item.x, y: item.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, damage, sprite: 'orb'});
      }
    }
  }
}

/** Mina del Sembrador: vuela hasta su sitio (tx, ty) si se lanzó, baja despacio
 * hacia la nave, se arma, estalla si la nave se acerca o se apaga sola.
 * mine = {x, y, age, armed, tx?, ty?}. Devuelve null, 'explode' o 'expire'. */
export function advanceMine(mine, dt, player) {
  const rules = GAIA_ENEMY_RULES.sower.mine;
  const thrown = mine.tx !== undefined;
  if (thrown) mine.from ??= {x: mine.x, y: mine.y};
  mine.age += dt;
  if (thrown && mine.age < rules.flight) {
    const k = mine.age / rules.flight;
    mine.x = mine.from.x + (mine.tx - mine.from.x) * k;
    mine.y = mine.from.y + (mine.ty - mine.from.y) * k;
  } else if (thrown && !mine.landed) {
    mine.landed = true;
    mine.x = mine.tx;
    mine.y = mine.ty + (mine.age - rules.flight) * rules.drift;
  } else mine.y += rules.drift * dt;
  mine.armed = mine.age >= rules.arm;
  if (mine.armed && Math.hypot(player.x - mine.x, player.y - mine.y) < rules.radius) return 'explode';
  return mine.age >= rules.life ? 'expire' : null;
}

/** Bomba en cruz: viaja de lado hasta el borde y allí se abre en tres rayos
 * (hacia dentro, arriba y abajo). bomb = {x, y, vx}. Devuelve null o los rayos. */
export function advanceCrossBomb(bomb, dt, bounds) {
  bomb.x += bomb.vx * dt;
  if (bomb.x > 0 && bomb.x < bounds.w) return null;
  const {raySpeed: speed, damage} = GAIA_ENEMY_RULES.sower.bomb, x = bomb.x <= 0 ? 0 : bounds.w, inward = x === 0 ? 1 : -1;
  return [{x, y: bomb.y, vx: inward * speed, vy: 0, damage}, {x, y: bomb.y, vx: 0, vy: -speed, damage},
    {x, y: bomb.y, vx: 0, vy: speed, damage}];
}

/** Avanza un enemigo de Gaia. item = {id, x, y, hp, maxHp, gaia}; ctx = {now,
 * player: {x, y, hull, reloading}, bounds: {w, h}, allies, tokens, anchor}.
 * anchor = {x, y, r}: el Atlas que rodean sus escoltas. */
export function advanceGaiaEnemy(item, dt, ctx, emit) {
  if (!(dt > 0)) return;
  const {gaia} = item, rules = GAIA_ENEMY_RULES[gaia.kind];
  if (gaia.pending) {
    // Aviso visible antes de cada ataque; el turno se devuelve al emitirlo.
    gaia.telegraph = Math.min(1, gaia.telegraph + dt / Math.max(rules.warning, 1e-6));
    if (gaia.telegraph >= 1) {
      const ability = gaia.pending;
      unleash(item, ability, ctx, emit);
      if (ability === 'basic') gaia.attacks++;
      gaia.cooldowns[ability] = ctx.now + rules[ability].cooldown;
      gaia.pending = null; gaia.telegraph = 0; gaia.aim = null;
      releaseAttack(ctx.tokens, item.id);
    }
    return;
  }
  if (rules.orbit) {
    if (ctx.anchor) {
      gaia.angle += rules.orbit.speed * dt;
      const radius = ctx.anchor.r * rules.orbit.radius;
      moveToward(item, {x: ctx.anchor.x + Math.cos(gaia.angle) * radius, y: ctx.anchor.y + Math.sin(gaia.angle) * radius}, rules.speed * dt);
    }
    if (gaia.cooldowns.basic <= ctx.now && requestAttack(ctx.tokens, {id: item.id, bornAt: gaia.bornAt}, ctx.now)) {
      gaia.pending = 'basic'; gaia.aim = {x: item.x, y: ctx.bounds.h}; gaia.telegraph = 0;
    }
    return;
  }
  const {leave} = rules;
  if (leave && !gaia.leaving && (gaia.attacks >= leave.attacks || ctx.now - gaia.bornAt >= leave.seconds)) {
    gaia.leaving = true;
    releaseAttack(ctx.tokens, item.id);
  }
  if (gaia.leaving) {
    const side = item.x < ctx.player.x ? -1 : 1, {w} = ctx.bounds;
    moveToward(item, {x: Math.max(40, Math.min(w - 40, ctx.player.x + side * leave.sideOffset)), y: leave.exitY}, leave.speed * dt);
    return;
  }
  const view = {id: item.id, x: item.x, y: item.y, hp: item.hp, maxHp: item.maxHp, profile: gaia.profile,
    cooldowns: gaia.cooldowns, bornAt: gaia.bornAt, ...(gaia.heading !== undefined ? {heading: gaia.heading} : {})};
  const intent = decideEnemyIntent(view, ctx);
  if (intent.heading !== undefined) gaia.heading = intent.heading;
  // El Alfa caza desde arriba: nunca baja a menos de `clearance` de la nave;
  // el que va detrás en la fila (`back`) guarda además esa distancia.
  let targetY = rules.clearance ? Math.min(intent.targetY, ctx.player.y - rules.clearance - (intent.back || 0)) : intent.targetY;
  // En fila: ni baja contra el de delante ni sube contra el de detrás, y el
  // que espera turno no se sale por arriba de la pantalla.
  if (intent.maxY !== undefined) targetY = Math.max(40, Math.min(targetY, intent.maxY));
  if (intent.minY !== undefined) targetY = Math.max(targetY, intent.minY);
  moveToward(item, {x: intent.targetX, y: targetY}, rules.speed * dt);
  // La Égida no dispara ni pide turno: su escudo cubre al aliado que protege.
  if (gaia.profile === 'escort') {
    gaia.guardId = intent.guardId;
    if (intent.ability === 'unique' && intent.guardId) {
      emit({type: 'shield', targetId: intent.guardId, hits: rules.unique.hits});
      gaia.cooldowns.unique = ctx.now + rules.unique.cooldown;
    }
    return;
  }
  if (intent.attack) {
    gaia.pending = intent.ability;
    gaia.aim = {x: ctx.player.x, y: ctx.player.y};
    gaia.telegraph = 0;
  }
}
