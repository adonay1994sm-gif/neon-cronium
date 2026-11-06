/**
 * Ficha del sector 1 · Gaia (Chronos → acceso orbital de Gaia Nova).
 * Un único viaje continuo de 10 tramos (diseño 2026-10-22, D1A): condensa
 * S1-V1 a S1-V5. Subjefe CH-03 en el tramo 5, C9 al empezar el 6 y Atlas en
 * el 10. Enemigos y jefes: docs/design/BIBLIA_GALAXIA.md §3.1.
 */
import {smooth} from '../voyage-engine.js';
import {VOYAGE_HAZARD_PROFILES} from '../voyage-hazards.js';

const immutable = object => Object.freeze(object);
// Perfiles nuevos de Gaia: tracker = CH-04 Rastreador (Emboscador),
// sower = CH-05 Sembrador (Minador), aegis = CH-06 Égida (Escolta),
// alpha = CH-02 Alfa (élite, solo tramos 6–9).
const ROSTERS = immutable({
  escape: immutable(['raider', 'scout']),
  flank: immutable(['raider', 'tracker', 'scout']),
  // Sin el Sembrador de momento (propietario, 31/10/2026): hay que rehacer
  // su lógica (tarea sembrador-minas). Vuelve aquí y en elite cuando esté.
  mines: immutable(['raider', 'interceptor']),
  shield: immutable(['aegis', 'interceptor', 'tracker', 'scout']),
  elite: immutable(['alpha', 'aegis', 'interceptor']),
  gate: immutable(['interceptor', 'tracker', 'aegis', 'raider'])
});
// attackers: cuántos enemigos pueden atacar a la vez (turnos de ataque) y
// horde: oleadas de CH-01 en V cada `every` segundos; comets: 'aimed' = meteoritos
// dirigidos sin pasillo marcado (plan F3b).
const HORDE = immutable({every: 14, size: 5});
const encounter = (profile, patrol, {comets = false, repairAt = null, boss = null, attackers = 2, horde = null} = {}) => immutable({
  patrol: patrol && immutable({cap: patrol[0], roster: patrol[1], gap: patrol[2]}),
  hazards: VOYAGE_HAZARD_PROFILES[profile], comets, repairAt, boss: boss && immutable(boss), attackers, horde
});

export const S1_GAIA = immutable({
  id: 'S1', sector: 1, number: 1, title: 'Escapa de Chronos', boss: 'atlas',
  // El tramo 1 abre con el inicio de Chronos y el tutorial (propietario, 23/10/2026).
  intro: true,
  chapter: 1, version: 's1-sector-v1', saveKey: 'neonCronium.sector.S1.v1',
  routeId: 'sector-1-gaia', eventPrefix: 'sector-1', baseGoal: 60,
  origin: 'Centro Chronos', destination: 'Acceso orbital de Gaia Nova',
  arrivalDestinationId: 'gaia-atlas-approach', cinematicDuration: 90, recoveryAt: 9,
  invalidCheckpointMessage: 'Invalid sector 1 checkpoint',
  stages: immutable([
    ['Emergencia en Chronos',48,5,'Recupera los primeros fragmentos del reactor','Chronos · reactor','Campo de restos','reactor-strike',.18,.70,.40],
    ['Campo de restos',50,11,'Cruza los restos; algo te sigue por detrás','Campo de restos','Salida orbital','wreckage-crossing',.15,.80,.52],
    ['La red exterior',52,17,'La red de Gaia siembra minas en tu ruta','Salida orbital','Red exterior de Gaia','net-edge',.12,.60,.58],
    ['Cuarentena',52,23,'Rompe los escudos de la Égida y sigue adelante','Red exterior de Gaia','Anillo de satélites','quarantine',.16,.62,.64],
    ['El subguardián',56,27,'Derriba al subguardián que cierra el anillo','Anillo de satélites','Corredor de enlace','sub-boss',.18,.66,.70],
    ['Enlace C9',48,27,'Repara en C9 y prueba tu nave en el corredor','Corredor de enlace','Lado nocturno','service-stop',.06,.34,.30],
    ['El Alfa',54,38,'El Alfa del C-17 lidera la caza en la oscuridad','Lado nocturno','Escolta del C-17','alpha-hunt',.08,.28,.72],
    ['Lluvia en el acceso',52,44,'Cruza la lluvia de meteoritos sin dejar de combatir','Escolta del C-17','Piquetes de Gaia','meteor-rain',.14,.58,.76],
    ['Defensa orbital',54,50,'Resiste la defensa orbital mientras Atlas se activa','Piquetes de Gaia','Acceso orbital','orbital-defence',.16,.62,.82],
    ['Atlas',60,54,'Vence a Atlas para que verifique el registro','Acceso orbital','Acceso orbital de Gaia Nova','boss',.18,.62,.90]
  ].map(stage => immutable(stage))),
  events: immutable([
    {id:'sector-1-intruder',type:'attack',at:2.25,attackerId:'cronium-raider',targetId:'chronos-reactor'},
    {id:'sector-1-breach',type:'rupture',at:9,resourceId:'cronium',cause:'hostile-reactor-strike'},
    {id:'sector-1-perimeter-exit',type:'departure',at:108,originId:'chronos-scientific-centre'},
    {id:'sector-1-gaia-beacon',type:'gaia-beacon',at:470,destinationId:'gaia-atlas-approach'}
  ].map(event => immutable(event))),
  service: immutable({stage: 6, approach: 1.2, visibleApproach: 2.4, departure: 2.4,
    renamedStage: 'Corredor de Gaia', renamedObjective: 'Prueba tu nave en el corredor; C9 vuelve tras vencer a Atlas'}),
  encounters: immutable([
    encounter(1, [2, ROSTERS.escape, 8], {attackers: 1}),
    encounter(2, [3, ROSTERS.flank, 7], {attackers: 1}),
    encounter(3, [3, ROSTERS.mines, 7], {repairAt: 30, horde: HORDE}),
    encounter(7, [4, ROSTERS.shield, 6], {comets: 'aimed'}),
    encounter(4, [2, ROSTERS.flank, 9], {boss: {id: 'subguardian', role: 'subjefe'}}),
    encounter(5, [2, ROSTERS.escape, 8], {attackers: 3}),
    encounter(8, [4, ROSTERS.elite, 6], {repairAt: 32, attackers: 3, horde: HORDE}),
    encounter(9, [4, ROSTERS.elite, 6], {comets: 'aimed', attackers: 3}),
    encounter(10, [5, ROSTERS.gate, 5], {repairAt: 30, attackers: 3, horde: HORDE}),
    encounter(10, [2, ROSTERS.gate, 8], {boss: {id: 'guardian-atlas', role: 'jefe'}})
  ]),
  phase(stageIndex) {
    return stageIndex < 2 ? 'recovery' : stageIndex < 5 ? 'gaia-net' : stageIndex < 8 ? 'deep-space' : 'atlas-approach';
  },
  scenery({p, stageIndex, stage, arrived}) {
    const departure = smooth(p, 0, .25), gate = smooth(p, .75, 1);
    return {
      station: immutable({x: .48 - .72 * departure, y: .43 + .94 * departure, scale: 1.12 * Math.pow(.032, departure),
        rotation: -.10 * departure, visible: p < .25, alpha: 1, state: 'ruptured'}),
      planet: immutable({x: .79 - .40 * smooth(p, .2, 1), y: .08 + .08 * gate, scale: .02 + .9 * smooth(p, .2, 1) ** 2,
        rotation: .06 * p, visible: true, alpha: .5 + .5 * smooth(p, .1, .4)}),
      beacon: immutable({x: .54, y: .14 + .10 * gate, scale: .03 + .20 * gate, visible: p >= .75, alpha: 1, active: stageIndex >= 9}),
      relay: immutable({visible: false, x: 0, y: 0, scale: 0, alpha: 0, active: false, state: 'approach'}),
      attacker: immutable({x: 1.2, y: 0, scale: 0, rotation: 0, visible: false, state: 'retreat'}),
      deepSpace: immutable({travel: p, offsetX: -.12 * p, offsetY: 2.2 * p, speed: .45 + .45 * smooth(p, .05, .3),
        alpha: 1, nebulaOpacity: stage.nebulaOpacity, starDensity: stage.starDensity, dustDensity: stageIndex === 5 ? .10 : .26}),
      debris: immutable({visible: !arrived && stageIndex <= 1, travel: p, directionX: -.26, directionY: .96,
        depth: .35, density: stageIndex === 1 ? .70 : .40})
    };
  }
});
