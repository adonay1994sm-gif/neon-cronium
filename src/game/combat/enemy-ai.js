/**
 * IA de enemigos por perfiles (diseño de campaña 6.9, biblia §3). Cada
 * enemigo decide adónde ir y si ataca según su vida, la distancia al
 * jugador, sus recargas y los aliados cercanos. Atacar exige un turno de
 * ataque (attack-tokens.js). Sin estado oculto ni reloj real: todo sale de
 * `enemy` y del `now` de juego que pasa el llamador.
 */
import {requestAttack, releaseAttack} from './attack-tokens.js';

export const ENEMY_AI_PROFILES = Object.freeze({
  // packGap: separación en fila entre cazadores que persiguen a la vez
  // (propietario, 15/11/2026: dos Alfas iban al mismo punto y se pisaban).
  hunter: Object.freeze({attackRange: 700, chaseOffset: 170, packGap: 140}),
  artillery: Object.freeze({preferred: 420, minRange: 250}),
  // En diagonal por delante de su protegida, sin taparla (antes 55/40: encima).
  // switchMargin: cuánto más despejado debe estar el otro lado para cambiarse.
  escort: Object.freeze({sideOffset: 80, depthOffset: 70, switchMargin: 40}),
  opportunist: Object.freeze({hullThreshold: 35, hover: 320}),
  ambusher: Object.freeze({belowOffset: 140, entryLine: 1100}),
  // Sembrador (propietario, 15/11/2026): trabaja la franja alta, lejos de la nave.
  miner: Object.freeze({laneShare: .22, edge: 60, arrive: 30})
});

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function movement(enemy, ctx, rules) {
  const {player, bounds} = ctx, d = distance(enemy, player);
  switch (enemy.profile) {
    case 'hunter': {
      // Varios cazadores van en fila sobre el jugador: el que ya está delante
      // sigue delante y los demás se quedan detrás. No se reparten a los lados
      // porque el Alfa dispara recto hacia abajo y eso cambiaría la dificultad.
      const pack = ctx.allies.filter(ally => ally.profile === 'hunter' || ally.id === enemy.id)
        .sort((a, b) => b.y - a.y || (a.id < b.id ? -1 : 1));
      const rank = Math.max(0, pack.findIndex(ally => ally.id === enemy.id));
      const ahead = pack[rank - 1], behind = pack[rank + 1], back = rank * rules.packGap;
      // La separación se guarda con el vecino real, no solo con el jugador: el
      // de detrás no baja hasta tener hueco (y entretanto espera en su carril)
      // y el de delante no sube contra el que tiene detrás, salvo que ese ya
      // esté arriba del todo: la fila nunca retiene a un Alfa cerca de la nave.
      const room = !ahead || ahead.y - enemy.y >= rules.packGap;
      return {x: room ? player.x : enemy.x, y: player.y - rules.chaseOffset - back, ...(back ? {back} : {}),
        ...(ahead ? {maxY: ahead.y - rules.packGap} : {}), ...(behind && behind.y > 41 ? {minY: behind.y + rules.packGap} : {})};
    }
    case 'artillery': {
      if (d >= rules.preferred || d === 0) return {x: enemy.x, y: enemy.y};
      const k = rules.preferred / d;
      return {x: player.x + (enemy.x - player.x) * k, y: player.y + (enemy.y - player.y) * k};
    }
    case 'escort': {
      const allies = ctx.allies.filter(ally => ally.id !== enemy.id);
      if (!allies.length) return {x: enemy.x, y: enemy.y, guardId: null};
      const weakest = allies.reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a));
      // Se queda en el lado en que está, salvo que el otro esté claramente más
      // despejado. Entre dos escoltas cede la de id mayor: así no bailan.
      const others = allies.filter(ally => ally.id !== weakest.id && !(ally.profile === 'escort' && ally.id > enemy.id));
      const spot = side => ({x: weakest.x + side * rules.sideOffset, y: weakest.y + rules.depthOffset});
      const room = side => Math.min(...others.map(ally => distance(spot(side), ally)));
      // En el borde se descarta el lado que no cabe en pantalla: recortado
      // quedaría pegado a la protegida.
      const fits = side => spot(side).x >= 40 && spot(side).x <= bounds.w - 40;
      const here = enemy.x <= weakest.x ? -1 : 1;
      const swap = fits(-here) && (!fits(here) || room(-here) > room(here) + rules.switchMargin);
      return {...spot(swap ? -here : here), guardId: weakest.id};
    }
    case 'opportunist': return {x: enemy.x <= bounds.w / 2 ? bounds.w * .2 : bounds.w * .8, y: Math.max(120, player.y - rules.hover)};
    case 'ambusher': return enemy.y > rules.entryLine ? {x: player.x, y: player.y + rules.belowOffset} : {x: enemy.x, y: bounds.h - 100};
    case 'miner': {
      // Cruza de borde a borde: sigue su rumbo (`heading`) hasta llegar y
      // entonces lo invierte; quien lo mueve guarda el rumbo que devuelve.
      let heading = enemy.heading ?? (enemy.x < bounds.w / 2 ? 1 : -1);
      const goal = heading > 0 ? bounds.w - rules.edge : rules.edge;
      if (Math.abs(enemy.x - goal) < rules.arrive) heading = -heading;
      return {x: heading > 0 ? bounds.w - rules.edge : rules.edge, y: bounds.h * rules.laneShare, heading};
    }
    default: throw new RangeError(`Unknown enemy profile: ${enemy.profile}`);
  }
}

function wantsToAttack(enemy, ctx, rules) {
  const {player} = ctx, d = distance(enemy, player);
  switch (enemy.profile) {
    case 'hunter': return d <= rules.attackRange;
    case 'artillery': return d >= rules.minRange;
    case 'opportunist': return player.reloading || player.hull < rules.hullThreshold;
    case 'ambusher': return enemy.y > player.y;
    // Solo siembra cuando ya está en su franja, a la vista (no bajo el marcador).
    case 'miner': return enemy.y >= ctx.bounds.h * rules.laneShare - 40;
    default: return false;
  }
}

export function decideEnemyIntent(enemy, ctx) {
  const rules = ENEMY_AI_PROFILES[enemy.profile];
  if (!rules) throw new RangeError(`Unknown enemy profile: ${enemy.profile}`);
  const {w, h} = ctx.bounds, move = movement(enemy, ctx, rules);
  const intent = {targetX: clamp(move.x, 40, w - 40), targetY: clamp(move.y, 40, h - 40), attack: false, ability: null,
    ...(move.heading !== undefined ? {heading: move.heading} : {}), ...(move.back ? {back: move.back} : {}),
    ...(move.maxY !== undefined ? {maxY: move.maxY} : {}), ...(move.minY !== undefined ? {minY: move.minY} : {})};
  const ready = enemy.cooldowns.unique <= ctx.now ? 'unique' : enemy.cooldowns.basic <= ctx.now ? 'basic' : null;
  // La Escolta no dispara: su habilidad única (escudo) no gasta turno.
  if (enemy.profile === 'escort') return {...intent, ability: ready === 'unique' ? 'unique' : null, guardId: move.guardId};
  if (!ready || !wantsToAttack(enemy, ctx, rules) || !requestAttack(ctx.tokens, enemy, ctx.now)) {
    // Quien ya no ataca devuelve su turno para que otro pueda usarlo.
    releaseAttack(ctx.tokens, enemy.id);
    return intent;
  }
  return {...intent, attack: true, ability: ready};
}

/** Decide un fotograma entero: pide turno por antigüedad (menor `bornAt`
 * primero) y devuelve las intenciones en el orden recibido. */
export function decideEnemyIntents(enemies, ctx) {
  const intents = new Map();
  for (const enemy of [...enemies].sort((a, b) => a.bornAt - b.bornAt)) intents.set(enemy, decideEnemyIntent(enemy, ctx));
  return enemies.map(enemy => intents.get(enemy));
}
