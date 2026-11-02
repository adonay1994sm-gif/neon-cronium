# Encargos de arte para GPT · NEON CRONIUM

Actualizado: 2026-11-02. Lista pública que se mantiene al día desde el tablero del proyecto.
Versión para máquinas: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/encargos-gpt.json

**Antes de nada lee la guía:** https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (qué es el juego, modelos de referencia y reglas).

## Cómo trabajar

1. Haz los encargos por orden: prioridad 1 primero.
2. Sube cada resultado al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site) en la carpeta `encargos/` con el nombre indicado en «Archivo».
3. Añádelo a `catalog.json` con el campo `"encargo"` igual al id del encargo.
4. Si pide varias imágenes, numéralas: `encargo-<id>-v1-1.png`, `-2.png`…
5. Respeta medidas, rejilla y fondo (transparente salvo que el prompt pida opaco): el juego recorta las celdas por tamaño exacto.
6. Revisa esta lista cada 10 minutos. Antes de empezar un encargo, mira `catalog.json` del baúl: si ya hay un archivo con su id en `"encargo"`, no lo repitas.

## Arte · C9 elegido (nave con brazos): hoja de estados para el juego

- **Id:** `camp-art-c9-hoja` · **Prioridad:** 1 · **Archivo:** `encargo-camp-art-c9-hoja-v1.png`
- **Para qué:** Decisión del propietario (02/11, dec-c9-concepto): C9 es el concepto 1, nave con brazos. La escena de llegada ya funciona; esta hoja sustituye a la estación antigua (mismo orden de celdas, el juego solo cambia el dibujo).

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md. MODELO EXACTO (cópialo, no inventes otro diseño): https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/c9-nave/c9_concepto_elegido_v1.webp — es C9, la nave taller de Mira, el diseño que eligió el propietario: proa con cabina cian, dos motores grandes a los lados, dos brazos grúa y una compuerta de atraque en la parte de ABAJO. Misma forma, mismos colores (casco marfil y grafito, luces cian y blancas), mismos brazos. Escala de referencia: la nave del jugador https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ship-identity/player_ship_identity_v1.png (C9 mide unas 3 veces su anchura). QUÉ HACE EN EL JUEGO: en el tramo 6 C9 baja desde arriba de la pantalla, se para, abre la compuerta de abajo, la nave del jugador entra por ella, se cierra, y al terminar la suelta y se va hacia arriba. HOJA: 2 columnas × 2 filas, celdas de 1024×1024 px (imagen de 2048×2048). Las cuatro celdas son LA MISMA NAVE, mismo tamaño, misma luz y su centro en el mismo píxel de cada celda (el juego cambia de celda sin mover la nave); solo cambia lo que se indica. Celda 1 (arriba izquierda): CERRADA Y VOLANDO — compuerta cerrada, motores encendidos a tope, luces de guía apagadas. Celda 2 (arriba derecha): ABRIÉNDOSE — las hojas de la compuerta a medio abrir, primeras luces de guía cian encendiéndose, motores suaves. Celda 3 (abajo izquierda): ATRACANDO — compuerta abierta con un haz tractor cian suave que sale hacia abajo, brazos grúa bajados hacia la compuerta, motores suaves. NO dibujes la nave del jugador. Celda 4 (abajo derecha): ABIERTA Y ESPERANDO — compuerta abierta del todo con el marco y las luces de guía cian brillando (como en el modelo), sin haz tractor, motores suaves. Vista cenital estricta, morro hacia ARRIBA. Es aliada: nada de rojo ni naranja en las luces (son de las amenazas) ni violeta (es del tiempo). Estilo: arte de juego sci-fi pintado y semirrealista como el modelo, blindaje con paneles y juntas visibles, luz fría de estudio desde arriba a la izquierda, sombras grafito. Fondo transparente real con canal alfa (sin damero pintado ni negro), bordes limpios sin halo blanco, sin texto ni números ni líneas entre celdas; que nada se salga de su celda. Comprueba sobre negro, blanco y damero. CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). Más de 5.000 colores.
```
