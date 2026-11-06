# Auditoría completa · 25/10/2026

Pedida por el propietario: «busca todos los errores, prueba cada funcionalidad,
revisa todo el HUD, dame un informe de rehacer y valora si hacemos un
repositorio nuevo».

## Resumen

- **El juego funciona.**
  - Recorrido completo en Chromium a 390×844 y a 320×844: menú, ajustes,
    intro, tramos 1, 6 y 10, pausa, Atlas con furia, derrota, reintento y
    vuelta al menú.
  - **Cero errores de código** en la consola.
  - Todas las suites pasan: `test`, `test:static`, `test:content`,
    `test:architecture` y `test:preview` (25/25).
- **Lo que falla es el acabado.** La mitad de la interfaz ya lleva el arte
  pintado de GPT; la otra mitad sigue con el estilo antiguo. Más visible: el
  HUD de vuelo, la Forja C9 y las naves.
- **Repositorio nuevo: no lo recomiendo** (ver al final). Sí una limpieza
  por dentro, paso a paso.

Capturas en `docs/auditorias/capturas-2026-10-25/`.

## 1. Errores encontrados (nuevos)

| # | Qué pasa | Dónde | Gravedad | Paso |
|---|---|---|---|---|
| A1 | Al reintentar, la intro de Chronos se repite entera cada vez | Derrota → Reintentar | Alta (cansa) | Intro |
| A2 | Ajustes se abre a mitad de la lista la segunda vez: el título queda oculto | Pausa → Configuración | Media | Ajustes |
| A3 | El botón FORJA C9 del menú sale plano, con el estilo antiguo | Menú, tras vencer a Atlas | Media | C9 |
| A4 | Forja C9 con el estilo antiguo: pestañas y botones planos; textos que se cortan («15 puntos de blindaje…») y títulos que parten en dos líneas | Forja C9 (captura del iPhone) | Alta (el jugador la ve tras Atlas) | C9 |
| A5 | Barra de vida de Atlas: sigue siendo una raya fina. Tu decisión «barra grande que estrese» no está hecha | Combate de Atlas | Alta | HUD |
| A6 | El HUD dice «VIAJE S1» en vez de «SECTOR 1», y CRONIUM 34/36 al llegar a Atlas | HUD | Media (ya apuntado) | HUD |
| A7 | «REINTENTAR SECTOR · TRAMO 1» parte en dos líneas | Derrota | Baja | HUD |
| A8 | A 320 px, el subtítulo de JUGAR («SECTOR 1 · CHRONOS → GAIA») parte en dos líneas | Menú | Baja | Menú |
| A9 | La nave en vuelo y en el menú es la antigua: las 10 naves nuevas de GPT no están montadas | Todo | Alta (identidad) | Hangar |
| A10 | `test:preview` reventaba la memoria con un paquete viejo: compara archivos enteros y, al fallar, intenta pintar la diferencia | Pruebas | Baja | Limpieza |

Sin errores de lógica nuevos: guardados, pausa, reintento, menú que recuerda
el tramo y hangar con NUEVO funcionan como deben.

## 2. El HUD, pieza a pieza

| Pieza | Hoy | Debe ser |
|---|---|---|
| Barra superior (VIAJE, PUNTOS, CRONIUM, CASCO, pausa) | Casillas planas | Barra pintada de GPT (ya entregada) |
| Rótulo del tramo y franja de mensajes | Placas planas | Placa de mensaje pintada con retrato (entregada) |
| DISPARAR y MISIL | Botones planos | Botones pintados, normal y pulsado (entregados) |
| Barra de jefe | Raya fina con «FASE 1» | Marco grande con muesca de furia, relleno rojo y trozo blanco (entregados) |
| Casco | Barrita fina | Barrita pintada (entregada) |
| Mano izquierda | Funciona | Repetirla con las piezas nuevas |
| Mover controles | No existe | Modo «editar controles» (tu pedido de hoy) |

Todo el arte del HUD ya está en el repositorio (`art-source/ui/piezas-v2`).
Falta montarlo: es el paso del HUD.

## 3. El código por dentro

- **Funciona, pero arrastra la historia del proyecto:**
  - el juego nació como «niveles clásicos» y el modo sector se construyó
    encima;
  - la palabra «classic» sale unas 700 veces y la lista de los 10 niveles
    antiguos sigue siendo la base;
  - `03-ui-game-flow.js` tiene 2.460 líneas y mezcla menú, sector, Forja y
    vuelo.
- **Dos mundos:**
  - lo nuevo, en módulos pequeños con pruebas (progresión, combate, naves,
    guardados), está bien hecho;
  - lo viejo es un solo bloque de 7.300 líneas.
- **Estilos:** `styles.css` acumula capas (base, vuelo, sistema A, piezas de
  GPT) que se pisan entre sí. Cada pantalla rehecha añade otra capa.
- **Peso:**
  - historial de git, 843 MB;
  - `art-source`, 245 MB;
  - la app, 19 MB de assets.

  Clonar es lento, pero el juego que descarga el jugador no.

## 4. Informe de rehacer (por orden)

1. **HUD completo** con las piezas de GPT, incluida la barra grande de Atlas,
   y la opción de mover los controles (A5, A6, A7).
2. **Hangar** con las 10 naves y la nave elegida en vuelo y en el menú (A9).
3. **Forja C9** con los marcos nuevos. Ya la ve el jugador, aunque el
   concepto de C9 esté aparcado (A3, A4).
4. **Intro:** no repetirla en cada intento (A1) y lo apuntado en su paso.
5. **Arreglos rápidos:** ajustes que se abren arriba (A2), textos que parten
   (A7, A8) y la prueba de preview (A10).
6. **Limpieza por dentro, a la vez que cada paso:**
   - quitar los niveles clásicos y sus restos (tarea u06);
   - partir `03-ui-game-flow.js` por pantallas;
   - dejar en `styles.css` una sola capa por pantalla.

## 5. ¿Repositorio nuevo?

**Recomendación: no.** Seguir en este y limpiarlo por dentro.

| | Repositorio nuevo | Limpiar este |
|---|---|---|
| Lo que se gana | Historial ligero, nombres limpios, código ordenado desde cero | Lo mismo, poco a poco, sin parar |
| Lo que se pierde | La web de prueba, la integración continua, la parte de iOS, los enlaces del tablero y de GPT (que leen este repositorio), el historial de decisiones y más de mil pruebas que habría que rehacer | Nada |
| Riesgo | Alto: volver a ajustar todo lo jugado (Atlas, hordas, meteoritos, dificultad) | Bajo: cada paso se prueba antes de seguir |
| Tiempo | Semanas antes de volver a donde estamos | Cada paso de la interfaz deja una parte limpia |

Un repositorio nuevo solo compensaría si el motor estuviera roto, y no lo
está: el recorrido no da ni un error. Lo que hay que rehacer es la cara (HUD,
Forja, naves) y ordenar el código viejo, y las dos cosas caben en los pasos
que ya tenemos.

Si algún día pesa demasiado el historial (843 MB), se puede crear una copia
limpia sin historial con el mismo nombre. Es una tarde de trabajo y no toca el
juego. No es urgente.
