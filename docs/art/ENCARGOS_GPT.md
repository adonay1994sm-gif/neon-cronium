# Encargos de arte para GPT · NEON CRONIUM

Actualizado: 2026-10-30. Lista pública que se mantiene al día desde el tablero del proyecto.
Versión para máquinas: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/encargos-gpt.json

**Antes de nada lee la guía:** https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (qué es el juego, modelos de referencia y reglas).

## Cómo trabajar

1. Haz los encargos por orden: prioridad 1 primero.
2. Sube cada resultado al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site) en la carpeta `encargos/` con el nombre indicado en «Archivo».
3. Añádelo a `catalog.json` con el campo `"encargo"` igual al id del encargo.
4. Si pide varias imágenes, numéralas: `encargo-<id>-v1-1.png`, `-2.png`…
5. Respeta medidas, rejilla y fondo (transparente salvo que el prompt pida opaco): el juego recorta las celdas por tamaño exacto.
6. Revisa esta lista cada 10 minutos. Antes de empezar un encargo, mira `catalog.json` del baúl: si ya hay un archivo con su id en `"encargo"`, no lo repitas.

## Arte · Efectos en vuelo de las habilidades (5 naves jugables)

- **Id:** `camp-art-habilidades-efectos` · **Prioridad:** 2 · **Archivo:** `encargo-camp-art-habilidades-efectos-v1.png`
- **Para qué:** Pedido del propietario (30/10). Astér, Bastión, Vértice, Mantarraya y Arpón, por piezas. Las 5 de pago van en un encargo posterior. Va con la tarea antes-sector-naves-enemigos. 30/10: GPT preguntó por la numeración de las piezas 12 y 13 (llevaban dos piezas cada una). Aclarado: ahora son 15 piezas numeradas por separado.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTILO: el de los efectos del juego y de las naves aprobadas: luz de energía pintada, núcleo blanco y halo de color, sin contornos de dibujo animado. Cada efecto en el color de su nave. Naves: Astér https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-aster-v1.webp, Bastión https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-bastion-v2-v1.webp, Vértice https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-vertice-v1.webp, Mantarraya https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-mantarraya-v1.webp, Arpón https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-arpon-v1.webp

QUÉ ES: los efectos en vuelo de las habilidades de las 5 naves que se consiguen jugando (las 5 de pago irán en otro encargo). El juego es vertical (720×1280), la nave mide unos 150 px y vuela abajo. Cada efecto se pide POR PIEZAS: el juego las mueve, gira y escala, así que cada pieza va sola, centrada y quieta.

REGLAS DE LAS HOJAS: rejilla exacta de celdas iguales, un fotograma por celda, el centro del efecto en el mismo píxel de cada celda, misma escala y luz, sin bordes ni texto. Fondo transparente real (el juego las suma con brillo).

PIEZAS (en este orden):
1. Astér · Salto de fase: hoja 4×2 celdas de 384×384 px, la estela fantasma de la nave al esquivar de lado (8 fotogramas, aparece y se desvanece).
2. Astér · Lluvia de estrellas: un dardo de luz cayendo, 128×384 px (punta abajo, cola arriba).
3. Astér · impacto del dardo: hoja 4×2 de 192×192 px.
4. Bastión · Muralla: escudo frontal curvo, 512×256 px (arco que protege por delante, más brillante en el borde).
5. Bastión · Fortaleza: cúpula hexagonal que envuelve la nave, 640×640 px.
6. Bastión · proyectil devuelto: destello de rebote, hoja 4×2 de 192×192 px.
7. Vértice · Lanza: carga en la punta de la nave, hoja 4×2 de 256×256 px.
8. Vértice · Lanza y Prisma: tramo de rayo que se repite en vertical, 128×512 px (se apila hacia arriba sin costuras).
9. Vértice · Prisma: origen del abanico de 5 haces, 512×512 px.
10. Mantarraya · Estela: tramo de estela que daña, 256×512 px (se repite hacia abajo sin costuras).
11. Mantarraya · Marea: onda en anillo, hoja 4×2 de 512×512 px (de pequeña a toda la pantalla).
12. Arpón · Arpón: punta del arpón, 96×192 px.
13. Arpón · Arpón: tramo de cable, 48×256 px (se repite en vertical sin costuras).
14. Arpón · Riel: tramo del disparo de riel, 160×512 px (se repite en vertical sin costuras).
15. Arpón · Riel: fogonazo de salida, hoja 4×2 de 384×384 px.
En total son 15 archivos, numerados del -1 al -15 en este orden.

CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). COMPROBACIÓN ANTES DE SUBIR: más de 5.000 colores en las piezas grandes; míralas sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo blanco). Sin texto, letras ni números en ninguna imagen.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (WebP con transparencia). En catalog.json pon "encargo": "camp-art-habilidades-efectos".
```

## Arte · Skins de las 5 naves de pago (10)

- **Id:** `camp-art-naves-skins` · **Prioridad:** 3 · **Archivo:** `encargo-camp-art-naves-skins-v1.png`
- **Para qué:** Pedido del propietario (30/10). Decisión del 24/10: las de pago enganchan por lo vistosas, no por el poder. Nombres de skin propuestos; el propietario puede cambiarlos. 30/10: GPT no publicó porque el generador cambiaba la silueta. Corregido el encargo: el juego choca con un contorno propio, no con la imagen; basta con que la nave se reconozca (mismo ángulo, tamaño y piezas) y se pide editar la imagen original en vez de crearla de cero.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

QUÉ ES: skins de las 5 naves de pago. Decisión del propietario: se compran por lo vistosas, nunca por ser más fuertes. Cada skin es la MISMA nave con otro acabado: materiales, colores, luces y detalles más llamativos. Tiene que reconocerse a primera vista como esa nave: mismo ángulo, mismo tamaño en el lienzo, mismas proporciones y mismas piezas principales (alas, motores, cabina). No hace falta que la silueta coincida píxel a píxel: el juego calcula los choques con un contorno propio, no con la imagen, así que se aceptan pequeños cambios de detalle en el borde. CÓMO CONSEGUIRLO: usa la imagen original como base y pide al generador que la EDITE (cambiar materiales y colores conservando la nave), en vez de crear una nave nueva desde cero. Si una edición cambia la nave tanto que ya no se reconoce, repítela.

NAVES ORIGINALES (copia su vista y su medida exacta): Orión https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-orion-v1.webp, Quimera https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-quimera-v1.webp, Nómada https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-nomada-v1.webp, Eclipse https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-eclipse-v1.webp, Titán https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-titan-v1.webp

LISTA (10 imágenes, dos skins por nave, en este orden):
1. Orión · «Estandarte»: blanco nacarado y oro, luces doradas.
2. Orión · «Nebulosa»: casco azul profundo con brillos de galaxia, luces violetas.
3. Quimera · «Espejismo»: casco iridiscente que cambia de color, luces magenta.
4. Quimera · «Arlequín»: placas en rombos negros y turquesa.
5. Nómada · «Chatarrera»: metal oxidado y remendado con placas de colores, luces ámbar.
6. Nómada · «Caravana»: arena y cobre con bandas rojas.
7. Eclipse · «Vacío»: negro mate casi total con un filo de luz blanca.
8. Eclipse · «Corona solar»: negro con borde de fuego naranja.
9. Titán · «Acorazado real»: grafito y oro con luces rojas.
10. Titán · «Ártico»: blanco hielo y cian con escarcha en los bordes.

CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). COMPROBACIÓN ANTES DE SUBIR: más de 5.000 colores en las piezas grandes y más de 1.500 en las de 256 px o menos; míralas sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo blanco). Sin texto, letras ni números en ninguna imagen.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (WebP con transparencia). En catalog.json pon "encargo": "camp-art-naves-skins".
```
