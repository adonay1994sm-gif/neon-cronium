/**
 * Las 10 naves del hangar (decisión del propietario, 24/10/2026): Astér de
 * serie y una nave nueva por sector. Nombres, papeles y habilidades salen de
 * la maqueta del hangar de GPT (Hangar.dc.html). Orden de desbloqueo
 * provisional, sin confirmar: completar el sector N da la nave N+1.
 * Clave propia: no toca el guardado del sector. Funciones puras.
 */
export const SHIP_ROSTER_KEY = 'neonCronium.ships.v1';
const DEFAULT_SHIP = 'aster';

const ship = (number, id, name, role, exclusive, cooldown, exclusiveText, ultimate, ultimateText) => Object.freeze({
  number, id, name, role, unlockedBySector: Number(number) - 1,
  exclusive: Object.freeze({name: exclusive, cooldown, text: exclusiveText}),
  ultimate: Object.freeze({name: ultimate, text: ultimateText})
});

export const SHIP_ROSTER = Object.freeze([
  ship('01', 'aster', 'Astér', 'Exploradora', 'Salto de fase', 8, 'Esquiva lateral instantánea: durante 0,4 s no recibe daño.', 'Lluvia de estrellas', 'Caen del cielo 24 dardos de luz que buscan a cada enemigo en pantalla.'),
  ship('02', 'bastion', 'Bastión', 'Acorazada', 'Muralla', 14, 'Escudo frontal que detiene los disparos de delante durante 3 s.', 'Fortaleza', 'Una cúpula de 6 s que devuelve cada proyectil enemigo a quien lo disparó.'),
  ship('03', 'vertice', 'Vértice', 'Perforadora', 'Lanza', 10, 'Disparo cargado que atraviesa toda la columna.', 'Prisma', 'Un rayo que se abre en 5 haces y barre la pantalla durante 4 s.'),
  ship('04', 'mantarraya', 'Mantarraya', 'Guardiana de cola', 'Estela', 12, 'Deja detrás una estela que daña a lo que llega por la retaguardia.', 'Marea', 'Una onda saca de la pantalla proyectiles y meteoritos y aturde 2 s.'),
  ship('05', 'arpon', 'Arpón', 'Cazadora', 'Arpón', 12, 'Engancha a un enemigo y lo arrastra; suelta el doble de chatarra.', 'Riel', 'Un cañón de riel atraviesa la pantalla con un daño enorme a los jefes.'),
  ship('06', 'orion', 'Orión', 'Comandante', 'Alas', 16, 'Dos drones disparan contigo durante 8 s.', 'Constelación', 'Seis drones forman una estrella y disparan en todas las direcciones 6 s.'),
  ship('07', 'quimera', 'Quimera', 'Engaño', 'Señuelo', 14, 'Un holograma de tu nave atrae los disparos durante 4 s.', 'Enjambre', 'Doce mininaves buscan a los enemigos y estallan al alcanzarlos.'),
  ship('08', 'nomada', 'Nómada', 'Recolectora', 'Imán', 15, 'Atrae CRONIUM y chatarra de toda la pantalla y repara 5 de casco.', 'Forja móvil', 'Repara el 40 % del casco y llena munición y misiles.'),
  ship('09', 'eclipse', 'Eclipse', 'Sombra', 'Sombra', 15, 'Durante 2 s es invisible: los enemigos pierden el blanco.', 'Eclipse total', 'La pantalla se oscurece y todo se detiene 3 s, salvo tu nave.'),
  ship('10', 'titan', 'Titán', 'Artillera', 'Andanada', 16, 'Una salva de 8 misiles pequeños que buscan a los enemigos cercanos.', 'Supernova', 'Carga 1,5 s y estalla en una onda que borra lo pequeño.')
]);

export function ownedShips(sectorSave) {
  return SHIP_ROSTER.filter(entry => entry.unlockedBySector === 0 || sectorSave.sectors[entry.unlockedBySector]?.completed === true)
    .map(entry => entry.id);
}

export function normalizeShipChoice(raw, sectorSave) {
  const valid = Boolean(raw) && typeof raw === 'object' && raw.version === 1 && ownedShips(sectorSave).includes(raw.selected);
  return {version: 1, selected: valid ? raw.selected : DEFAULT_SHIP};
}

export function chooseShip(choice, id, sectorSave) {
  return ownedShips(sectorSave).includes(id) ? {version: 1, selected: id} : null;
}
