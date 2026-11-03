# Auditoría completa · 03/11/2026

Rango `f377990..821c3dc` (280 commits desde la auditoría del 22/10). Revisores:
`auditor-codigo`, `critico-juego`, `director-arte` (en paralelo, sin ver el
razonamiento) y la skill `code-review` (nivel xhigh). Todo en Chromium headless o
JSDOM, escenas forzadas con `?dev=1`; sin iPhone ni partida natural; el audio no se
pudo oír.

## Veredictos
- auditor-codigo: **APTO CON ARREGLOS**.
- critico-juego: **NO ESTÁ A LA ALTURA** (subguardián = muro).
- director-arte: **ACEPTABLE CON CAMBIOS** (visual 6,5/10, antes 5,5).
- code-review xhigh: 15 hallazgos; build reproducible; 1001 pruebas de contenido en verde.

## Hallazgos (prioridad de mayor a menor)

### Bloquean o rompen
- **A01 · Escape con la Forja de la parada abierta** deja C9 en `docked`, la ruta
  esperando `service` y la nave invencible para siempre (teclado). `08:334-337`,
  `03:2433-2441`. Arreglo: `resumeGame` cierra siempre la Forja. (auditor, reproducido en JSDOM)
- **A02 · HARDCORE lee `window.localStorage` fuera de try/catch** al arrancar: con el
  almacenamiento bloqueado el juego no carga. `00-bootstrap-config.js:230`. (code-review)
- **A03 · HARDCORE: el guardado se borra 1,18 s después de morir**; si cierras la app
  durante la explosión conservas chatarra, mejoras y naves. `03:2624`. (code-review)
- **A04 · Ajustes antiguos con `difficulty:"hardcore"`** pasan en silencio al guardado
  HARDCORE vacío. `00:232`. (code-review)
- **A05 · Subguardián = muro**: 60 de vida contra Pulso de 1, 20 cargas, recarga 2 s, y
  sus orbes se comen tus disparos; >3 min con puntería perfecta; morir devuelve al
  tramo 1. `subguardian.js:13`, `classic-weapons.js:12`, `03:1239-1268`. (crítico, medido) — balance: decide el propietario.

### Importantes
- **A06 · Pulso niveles 3 y 4 hacen menos daño que el nivel 1** a distancia normal (el
  abanico reparte 0,53/0,67 y los laterales fallan pasados ~330 px). `classic-weapons.js:51-52`;
  la prueba `classic-weapons.test.mjs:661-672` suma todos los proyectiles. (auditor + code-review)
- **A07 · Naves de chatarra se cobran por habilidades que no existen** (solo cambia el
  dibujo). `ship-roster.js:24-26`, `03:1828-1855`. (auditor) — decide el propietario.
- **A08 · Compra en el hangar sin confirmar** (2.500 de un toque); ARMA escondida bajo
  los botones; botón «SUBIR · 30…» de Gemelo se sale de la pantalla (`styles.css:1488`, falta `minmax(0,1fr)`). (crítico + arte)
- **A09 · Cartel del jefe/subjefe tapa ruta y transmisiones**; el subjefe no activa
  `body.atlas-combat` (franja de 31 px, DESIGN §7). `03:997-1005`, `styles.css:227/704`. (crítico + arte)
- **A10 · El arma tiene dos nombres**: PULSO (hangar) / Phaser (HUD y Forja). `classic-weapons.js:16`, `03:633/1701/1769`. (crítico + arte)
- **A11 · Forja: no se distingue comprable/bloqueado/instalado; nodos «1 de 2» no
  parecen elección; pestaña activa no sigue a la sección; línea del árbol cruza tarjetas (V18).** (arte)
- **A12 · Orbes del abanico del subguardián no se leen como balas** (rojo oscuro, 14 por ataque). (crítico)
- **A13 · J05 (reloj ×3) se aplica también al sector** y adelanta el guion del capítulo. `03:840`. (code-review)
- **A14 · Reintento con baliza** reutiliza la partida de chatarra: los enemigos ya
  derrotados no vuelven a soltar chatarra. `03:2309`. (code-review)
- **A15 · Cono de persecución 0,65 → 1,2** afecta a todos los disparos apuntados (hasta ~50°). `classic-pursuit.js:70`. (code-review)
- **A16 · DIFÍCIL/HARDCORE tienen menos patrullas que Normal en el tramo 9** (`patrolCapMax:4`). `difficulty.js:62`. (code-review)
- **A17 · Turnos de ataque no liberados fuera del sector** (`gaiaFallbackTokens`): las escoltas derribadas bloquean ataques. `03:1146`. (code-review)

### Audio (no se pudo oír)
- **A18 · Música del menú**: `pointerdown` puede no contar como gesto para audio en
  iPhone y el listener `once` se pierde; además `play()` se reintenta cada fotograma. `08:530`, `mood-music.js:29`. (code-review)
- **A19 · `audio.src` absoluto vs ruta relativa**: recarga la pista en cada cambio de momento. `mood-music.js:40`. (auditor + code-review)
- **A20 · Caché del service worker**: mismo nombre de caché; `cacheFirst` con `<audio>` y
  peticiones de rango puede fallar en Safari (sin comprobar). `sw.js:1`. (auditor)

### Visual y menores
- **A21 · Tramo 10: V01/V02/V12 siguen** (Gaia en el centro y brillante, satélites azules, tinte magenta a pantalla completa). (arte)
- **A22 · Disparo propio sin peso** (gotas de 8 px, sin chispazo ni destello en el jefe); celdas del atlas de impacto del subguardián tocan el borde. (arte)
- **A23 · Tramo 6: ~26 s vacíos tras C9**; durante el atraque se puede disparar hacia C9; sin marca de compuerta. (crítico)
- **A24 · HUD de CRONIUM «33/36»** al llegar a Atlas (la ruta acaba en 33). `03:1906`. (code-review)
- **A25 · `nextKeySwapId()` null** → `TypeError` sin mensaje si falla el guardado. `03:106`. (auditor)
- **A26 · Rendimiento**: `cometShowerActive()` y la lista de aliados se recalculan por enemigo y fotograma. `05:404`, `03:1145`. (code-review)
- **A27 · Exportador de encargos** escribe la dirección antigua del baúl. `scripts/export-encargos-gpt.mjs:14`. (code-review)
- **A28 · Código muerto (avisar, no borrar)**: `#beaconOffer`, voyageScore/chapterScore, CH-03, botón Lanza. (auditor + code-review)
