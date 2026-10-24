# Encargos de arte para GPT · NEON CRONIUM

Actualizado: 2026-10-24. Lista pública que se mantiene al día desde el tablero del proyecto.
Versión para máquinas: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/encargos-gpt.json

**Antes de nada lee la guía:** https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (qué es el juego, modelos de referencia y reglas).

## Cómo trabajar

1. Haz los encargos por orden: prioridad 1 primero.
2. Sube cada resultado al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site) en la carpeta `encargos/` con el nombre indicado en «Archivo».
3. Añádelo a `catalog.json` con el campo `"encargo"` igual al id del encargo.
4. Si pide varias imágenes, numéralas: `encargo-<id>-v1-1.png`, `-2.png`…
5. Respeta medidas, rejilla y fondo (transparente salvo que el prompt pida opaco): el juego recorta las celdas por tamaño exacto.
6. Revisa esta lista cada 10 minutos. Antes de empezar un encargo, mira `catalog.json` del baúl: si ya hay un archivo con su id en `"encargo"`, no lo repitas.

## Arte: hangar para elegir nave v2 (maqueta pintada y piezas)

- **Id:** `art-ui-hangar-v2` · **Prioridad:** 2 · **Archivo:** `encargo-art-ui-hangar-v2-v1.png`
- **Para qué:** ENTREGA PARCIAL (24/10, por chat; guardada en art-source/ui/piezas-v2): maqueta pintada del hangar y casillas normal, elegida, bloqueada y de pago. FALTA solo la placa de la ficha de habilidades (1000×360). Se monta en el paso del hangar.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

YA ENTREGASTE la maqueta y las cuatro casillas (el propietario las pasó por el chat y están aprobadas). SOLO FALTA UNA PIEZA: la placa de la ficha de habilidades, 1000×360 px, con dos zonas (EXCLUSIVA arriba y ÚLTIMA abajo), cada una con hueco cuadrado a la izquierda para su icono; sin texto. Entrégala como imagen 6. No repitas lo demás.

ESTILO OBLIGATORIO: el de los marcos que ya entregaste y el propietario aprobó, montados en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/ventanas_marcos_v2.jpg . Piezas de referencia: ventana https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/ui_window_v1.webp , botón principal https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/ui_button_main_v1.webp y ficha https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/ui_stat_card_v1.webp . Metal oscuro pintado con biseles y remaches, borde cian #a1eee8 luminoso, luces naranjas pequeñas, interior azul noche #040c15. Letra del juego: Orbitron (no la pintes: el juego escribe los textos).

El hangar es la pantalla donde el jugador ELIGE NAVE entre partidas. Captura de hoy: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/hangar.jpg . Fondo: el hangar de la pantalla principal (https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_hangar_fondo_v1.webp) con la nave elegida grande sobre la plataforma.
Hay 10 naves: Astér y Bastión (gratis), Vértice, Mantarraya y Arpón (se compran con chatarra: llevan su precio) y Orión, Quimera, Nómada, Eclipse y Titán (de pago, con skins). Cada una tiene una habilidad EXCLUSIVA (con recarga) y una ÚLTIMA.
Imagen 1: MAQUETA de la pantalla completa, 1170×2532 px, PINTADA ENTERA con el generador (no montada sobre la captura): antetítulo ELIGE TU NAVE y título HANGAR; nombre y papel de la nave elegida (ASTÉR · EXPLORADORA); rejilla de 10 casillas en 5×2 con número y miniatura (las no conseguidas en silueta con candado o con su precio); ficha con la EXCLUSIVA y la ÚLTIMA; botones VOLVER y PILOTAR ASTÉR. Solo es referencia: el juego escribe los textos.
PIEZAS (imágenes 2 a 6): casilla de nave normal, elegida (borde cian encendido) y bloqueada (apagada, con candado), 240×240 px cada una; casilla de nave de pago (borde dorado discreto), 240×240 px; placa de la ficha de habilidades, 1000×360 px.

CÓMO HACERLO: cada pieza con el GENERADOR DE IMÁGENES, como los marcos aprobados. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso): tu entrega anterior de estas piezas salió así (entre 3 y 70 colores por pieza) y no vale. No hace falta maqueta de pantalla: solo las piezas. COMPROBACIÓN ANTES DE SUBIR: las piezas grandes con más de 5.000 colores y las pequeñas (128 px o menos) con más de 1.500; ponlas al lado de los marcos aprobados y tienen que parecer de la misma familia; mira cada una sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo). Sin texto en ninguna pieza.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (formato WebP con transparencia). En catalog.json pon "encargo": "art-ui-hangar-v2".
```
