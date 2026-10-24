/**
 * Las 10 naves del hangar. Nombres, papeles y habilidades salen de la maqueta
 * del hangar de GPT (Hangar.dc.html). Cómo se consiguen (decisión del
 * propietario, 24/10/2026): Astér de serie y Bastión al vencer a Atlas; tres
 * con chatarra, cada una más cara y con mejor habilidad; el resto, de pago con
 * skins, con habilidades más vistosas pero no más fuertes. Los precios son
 * provisionales hasta la revisión de la economía; el pago aún no existe.
 * Clave propia: no toca el guardado del sector. Funciones puras.
 */
export const SHIP_ROSTER_KEY = 'neonCronium.ships.v1';
const DEFAULT_SHIP = 'aster';
const FREE = sector => ({type: 'free', sector}), SCRAP = price => ({type: 'scrap', price}), PAID = {type: 'paid'};

const ship = (number, id, name, role, access, exclusive, cooldown, exclusiveText, ultimate, ultimateText) => Object.freeze({
  number, id, name, role, access: Object.freeze({...access}),
  exclusive: Object.freeze({name: exclusive, cooldown, text: exclusiveText}),
  ultimate: Object.freeze({name: ultimate, text: ultimateText})
});

export const SHIP_ROSTER = Object.freeze([
  ship('01', 'aster', 'Astér', 'Exploradora', FREE(0), 'Salto de fase', 8, 'Esquiva lateral instantánea: durante 0,4 s no recibe daño.', 'Lluvia de estrellas', 'Caen del cielo 24 dardos de luz que buscan a cada enemigo en pantalla.'),
  ship('02', 'bastion', 'Bastión', 'Acorazada', FREE(1), 'Muralla', 14, 'Escudo frontal que detiene los disparos de delante durante 3 s.', 'Fortaleza', 'Una cúpula de 6 s que devuelve cada proyectil enemigo a quien lo disparó.'),
  ship('03', 'vertice', 'Vértice', 'Perforadora', SCRAP(10000), 'Lanza', 10, 'Disparo cargado que atraviesa toda la columna.', 'Prisma', 'Un rayo que se abre en 5 haces y barre la pantalla durante 4 s.'),
  ship('04', 'mantarraya', 'Mantarraya', 'Guardiana de cola', SCRAP(50000), 'Estela', 12, 'Deja detrás una estela que daña a lo que llega por la retaguardia.', 'Marea', 'Una onda saca de la pantalla proyectiles y meteoritos y aturde 2 s.'),
  ship('05', 'arpon', 'Arpón', 'Cazadora', SCRAP(150000), 'Arpón', 12, 'Engancha a un enemigo y lo arrastra; suelta el doble de chatarra.', 'Riel', 'Un cañón de riel atraviesa la pantalla con un daño enorme a los jefes.'),
  ship('06', 'orion', 'Orión', 'Comandante', PAID, 'Alas', 16, 'Dos drones disparan contigo durante 8 s.', 'Constelación', 'Seis drones forman una estrella y disparan en todas las direcciones 6 s.'),
  ship('07', 'quimera', 'Quimera', 'Engaño', PAID, 'Señuelo', 14, 'Un holograma de tu nave atrae los disparos durante 4 s.', 'Enjambre', 'Doce mininaves buscan a los enemigos y estallan al alcanzarlos.'),
  ship('08', 'nomada', 'Nómada', 'Recolectora', PAID, 'Imán', 15, 'Atrae CRONIUM y chatarra de toda la pantalla y repara 5 de casco.', 'Forja móvil', 'Repara el 40 % del casco y llena munición y misiles.'),
  ship('09', 'eclipse', 'Eclipse', 'Sombra', PAID, 'Sombra', 15, 'Durante 2 s es invisible: los enemigos pierden el blanco.', 'Eclipse total', 'La pantalla se oscurece y todo se detiene 3 s, salvo tu nave.'),
  ship('10', 'titan', 'Titán', 'Artillera', PAID, 'Andanada', 16, 'Una salva de 8 misiles pequeños que buscan a los enemigos cercanos.', 'Supernova', 'Carga 1,5 s y estalla en una onda que borra lo pequeño.')
]);

const byId = id => SHIP_ROSTER.find(entry => entry.id === id);
const isScrapShip = id => byId(id)?.access.type === 'scrap';

export function ownedShips(sectorSave, shipSave) {
  return SHIP_ROSTER.filter(({id, access}) => access.type === 'free'
    ? access.sector === 0 || sectorSave.sectors[access.sector]?.completed === true
    : access.type === 'scrap' && shipSave.bought.includes(id)).map(entry => entry.id);
}

export function normalizeShipSave(raw, sectorSave) {
  const valid = Boolean(raw) && typeof raw === 'object' && raw.version === 1 && Array.isArray(raw.bought);
  const bought = valid ? [...new Set(raw.bought.filter(isScrapShip))] : [];
  const selected = valid && ownedShips(sectorSave, {bought}).includes(raw.selected) ? raw.selected : DEFAULT_SHIP;
  return {version: 1, selected, bought};
}

export function chooseShip(shipSave, id, sectorSave) {
  return ownedShips(sectorSave, shipSave).includes(id) ? {version: 1, selected: id, bought: [...shipSave.bought]} : null;
}

// Solo comprueba y anota la compra: restar la chatarra es cosa del libro de chatarra.
export function buyShipWithScrap(shipSave, id, scrap) {
  const price = isScrapShip(id) ? byId(id).access.price : null;
  if (price === null || shipSave.bought.includes(id) || scrap < price) return null;
  return {save: {version: 1, selected: shipSave.selected, bought: [...shipSave.bought, id]}, price};
}
