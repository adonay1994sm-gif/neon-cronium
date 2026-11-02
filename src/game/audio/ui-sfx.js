/** Sonidos de interfaz y avisos (packs CC0 de Kenney, decisión del propietario
 * del 22/10/2026). Sustituyen los pitidos tone(): botones, compras, recogidas,
 * transmisiones, tramos, derrota y avisos de jefe. v2 (02/11/2026): botones,
 * chatarra y aviso de jefe con los sonidos que eligió el propietario. Usa el mismo reproductor que
 * el combate (combat-sfx.js) con su propio atlas; los offsets salen de
 * scripts/build-ui-sfx.py y assets/ui_sfx_atlas_v1.json los repite. */
import {createCombatSfx} from './combat-sfx.js';

export const UI_SFX_SRC = 'assets/ui_sfx_atlas_v2.m4a';
export const UI_SFX_DURATION = 12.7;

const variant = (offset, duration) => Object.freeze({offset, duration});
const cue = (variants, gain, priority, cooldown, polyphony) => Object.freeze({
  variants: Object.freeze(variants), gain, priority, cooldown, polyphony
});

export const UI_SFX_CUES = Object.freeze({
  'ui-press': cue([variant(0, 0.4)], 0.16, 1, 0.05, 2),
  'ui-toggle': cue([variant(0.52, 0.4)], 0.16, 1, 0.05, 2),
  'ui-tick': cue([variant(1.04, 0.4)], 0.12, 1, 0.06, 1),
  'confirm': cue([variant(1.56, 0.29)], 0.24, 4, 0.15, 1),
  'weapon-switch': cue([variant(1.97, 0.19)], 0.2, 3, 0.12, 1),
  'pickup-scrap': cue([variant(2.28, 0.42)], 0.18, 2, 0.05, 2),
  'pickup-cronium': cue([variant(2.82, 0.13), variant(3.07, 0.13)], 0.2, 2, 0.03, 3),
  'ammo-ready': cue([variant(3.32, 0.03)], 0.14, 1, 0.2, 1),
  'power-up': cue([variant(3.47, 0.42)], 0.26, 4, 0.15, 1),
  'repair': cue([variant(4.01, 0.54)], 0.26, 4, 0.2, 1),
  'transmission': cue([variant(4.67, 0.12)], 0.18, 3, 0.3, 1),
  'stage-start': cue([variant(4.91, 0.26)], 0.24, 4, 0.5, 1),
  'stage-complete': cue([variant(5.29, 0.5)], 0.3, 6, 0.5, 1),
  'unlock': cue([variant(5.91, 0.33)], 0.28, 5, 0.3, 1),
  'gate-warning': cue([variant(6.36, 0.11)], 0.2, 4, 0.3, 1),
  'gate-clear': cue([variant(6.59, 0.38)], 0.22, 3, 0.2, 1),
  'defeat': cue([variant(7.09, 0.53)], 0.3, 7, 0.5, 1),
  'ship-destroyed': cue([variant(7.74, 1.01)], 0.4, 8, 0.5, 1),
  'rupture': cue([variant(8.87, 2.01)], 0.4, 9, 1, 1),
  'boss-alert': cue([variant(11, 1.7)], 0.3, 7, 0.3, 1)
});

const UI_BANK = Object.freeze({version: 2, src: UI_SFX_SRC, duration: UI_SFX_DURATION, cues: UI_SFX_CUES,
  voiceLimit: 6, gainBudget: .9});

export function createUiSfx(options = {}) {
  return createCombatSfx({...options, bank: UI_BANK});
}
