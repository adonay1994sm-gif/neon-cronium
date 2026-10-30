/** Sonidos de interfaz y avisos (packs CC0 de Kenney, decisión del propietario
 * del 22/10/2026). Sustituyen los pitidos tone(): botones, compras, recogidas,
 * transmisiones, tramos, derrota y avisos de jefe. Usa el mismo reproductor que
 * el combate (combat-sfx.js) con su propio atlas; los offsets salen de
 * scripts/build-ui-sfx.py y assets/ui_sfx_atlas_v1.json los repite. */
import {createCombatSfx} from './combat-sfx.js';

export const UI_SFX_SRC = 'assets/ui_sfx_atlas_v1.m4a';
export const UI_SFX_DURATION = 10.83;

const variant = (offset, duration) => Object.freeze({offset, duration});
const cue = (variants, gain, priority, cooldown, polyphony) => Object.freeze({
  variants: Object.freeze(variants), gain, priority, cooldown, polyphony
});

export const UI_SFX_CUES = Object.freeze({
  'ui-press': cue([variant(0, .1)], .16, 1, .05, 2),
  'ui-toggle': cue([variant(.22, .14)], .16, 1, .05, 2),
  'ui-tick': cue([variant(.48, .06)], .14, 1, .06, 1),
  'confirm': cue([variant(.66, .29)], .24, 4, .15, 1),
  'weapon-switch': cue([variant(1.07, .19)], .2, 3, .12, 1),
  'pickup-scrap': cue([variant(1.38, .19)], .18, 2, .05, 2),
  'pickup-cronium': cue([variant(1.69, .13), variant(1.94, .13)], .2, 2, .03, 3),
  'ammo-ready': cue([variant(2.19, .03)], .14, 1, .2, 1),
  'power-up': cue([variant(2.34, .42)], .26, 4, .15, 1),
  'repair': cue([variant(2.88, .54)], .26, 4, .2, 1),
  'transmission': cue([variant(3.54, .12)], .18, 3, .3, 1),
  'stage-start': cue([variant(3.78, .26)], .24, 4, .5, 1),
  'stage-complete': cue([variant(4.16, .5)], .3, 6, .5, 1),
  'unlock': cue([variant(4.78, .33)], .28, 5, .3, 1),
  'gate-warning': cue([variant(5.23, .11)], .2, 4, .3, 1),
  'gate-clear': cue([variant(5.46, .38)], .22, 3, .2, 1),
  'defeat': cue([variant(5.96, .53)], .3, 7, .5, 1),
  'ship-destroyed': cue([variant(6.61, 1.01)], .4, 8, .5, 1),
  'rupture': cue([variant(7.74, 2.01)], .4, 9, 1, 1),
  'boss-alert': cue([variant(9.87, .96)], .3, 7, .3, 1)
});

const UI_BANK = Object.freeze({version: 1, src: UI_SFX_SRC, duration: UI_SFX_DURATION, cues: UI_SFX_CUES,
  voiceLimit: 6, gainBudget: .9});

export function createUiSfx(options = {}) {
  return createCombatSfx({...options, bank: UI_BANK});
}
