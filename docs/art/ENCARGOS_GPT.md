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

## Arte · Iconos de las habilidades de las 10 naves (20)

- **Id:** `camp-art-habilidades-iconos` · **Prioridad:** 1 · **Archivo:** `encargo-camp-art-habilidades-iconos-v1.png`
- **Para qué:** Pedido del propietario (30/10). Para los dos huecos redondos de la ficha del hangar (EXCLUSIVA y ÚLTIMA) y los botones de habilidad en vuelo.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTILO OBLIGATORIO: el de las piezas que ya entregaste y el propietario aprobó. Maqueta del hangar: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/piezas-v2/hangar_maqueta_v1.webp ; ficha de la nave con los dos huecos redondos: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/piezas-v2/hud_placa_mensajes_v1.webp ; marcos montados en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/ventanas_marcos_v2.jpg . Metal oscuro pintado con biseles y remaches, cian #a1eee8 luminoso, luces naranjas pequeñas, interior azul noche #040c15.

QUÉ ES: los iconos de las dos habilidades de cada una de las 10 naves del hangar. Van dentro de los dos huecos redondos de la ficha de la nave (el de arriba, EXCLUSIVA; el de abajo, ÚLTIMA) y en los botones de habilidad durante el vuelo. Mira cómo lucen los iconos de habilidad de la maqueta (abajo a la derecha): ese es el nivel.

MEDIDAS: cada icono 256×256 px, fondo transparente. Emblema circular que llena un círculo de 220 px centrado: disco de metal oscuro con bisel y, encima, el símbolo de la habilidad. EXCLUSIVA con el símbolo en cian #a1eee8; ÚLTIMA con el símbolo en dorado-ámbar #edc68a y un brillo más intenso, para que se note que es la habilidad grande. Los 20 iconos con la misma luz, el mismo disco y el mismo grosor de trazo: tienen que verse como una familia. El símbolo tiene que leerse a 48 px.

NAVES (mira cada una para que el icono encaje con su forma y colores): Astér https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-aster-v1.webp, Bastión https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-bastion-v2-v1.webp, Vértice https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-vertice-v1.webp, Mantarraya https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-mantarraya-v1.webp, Arpón https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-arpon-v1.webp, Orión https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-orion-v1.webp, Quimera https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-quimera-v1.webp, Nómada https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-nomada-v1.webp, Eclipse https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-eclipse-v1.webp, Titán https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-camp-art-nave-titan-v1.webp

LISTA (20 iconos, en este orden):
1. Astér · EXCLUSIVA «Salto de fase»: Esquiva lateral instantánea: durante 0,4 s no recibe daño.
2. Astér · ÚLTIMA «Lluvia de estrellas»: Caen del cielo 24 dardos de luz que buscan a cada enemigo en pantalla.
3. Bastión · EXCLUSIVA «Muralla»: Escudo frontal que detiene los disparos de delante durante 3 s.
4. Bastión · ÚLTIMA «Fortaleza»: Una cúpula de 6 s que devuelve cada proyectil enemigo a quien lo disparó.
5. Vértice · EXCLUSIVA «Lanza»: Disparo cargado que atraviesa toda la columna.
6. Vértice · ÚLTIMA «Prisma»: Un rayo que se abre en 5 haces y barre la pantalla durante 4 s.
7. Mantarraya · EXCLUSIVA «Estela»: Deja detrás una estela que daña a lo que llega por la retaguardia.
8. Mantarraya · ÚLTIMA «Marea»: Una onda saca de la pantalla proyectiles y meteoritos y aturde 2 s.
9. Arpón · EXCLUSIVA «Arpón»: Engancha a un enemigo y lo arrastra; suelta el doble de chatarra.
10. Arpón · ÚLTIMA «Riel»: Un cañón de riel atraviesa la pantalla con un daño enorme a los jefes.
11. Orión · EXCLUSIVA «Alas»: Dos drones disparan contigo durante 8 s.
12. Orión · ÚLTIMA «Constelación»: Seis drones forman una estrella y disparan en todas las direcciones 6 s.
13. Quimera · EXCLUSIVA «Señuelo»: Un holograma de tu nave atrae los disparos durante 4 s.
14. Quimera · ÚLTIMA «Enjambre»: Doce mininaves buscan a los enemigos y estallan al alcanzarlos.
15. Nómada · EXCLUSIVA «Imán»: Atrae CRONIUM y chatarra de toda la pantalla y repara 5 de casco.
16. Nómada · ÚLTIMA «Forja móvil»: Repara el 40 % del casco y llena munición y misiles.
17. Eclipse · EXCLUSIVA «Sombra»: Durante 2 s es invisible: los enemigos pierden el blanco.
18. Eclipse · ÚLTIMA «Eclipse total»: La pantalla se oscurece y todo se detiene 3 s, salvo tu nave.
19. Titán · EXCLUSIVA «Andanada»: Una salva de 8 misiles pequeños que buscan a los enemigos cercanos.
20. Titán · ÚLTIMA «Supernova»: Carga 1,5 s y estalla en una onda que borra lo pequeño.

CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). COMPROBACIÓN ANTES DE SUBIR: más de 5.000 colores en las piezas grandes y más de 1.500 en las de 256 px o menos; míralas sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo blanco). Sin texto, letras ni números en ninguna imagen.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (WebP con transparencia). En catalog.json pon "encargo": "camp-art-habilidades-iconos".
```

## Arte · Piezas del modo «editar controles» del HUD

- **Id:** `art-ui-hud-mover` · **Prioridad:** 2 · **Archivo:** `encargo-art-ui-hud-mover-v1.png`
- **Para qué:** Pedido del propietario (30/10). Va con la tarea hud-mover.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTILO OBLIGATORIO: el de las piezas del HUD que ya entregaste: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/piezas-v2/hud_boton_disparar_v1.webp y https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/piezas-v2/hud_barra_superior_v1.webp , y los marcos montados en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/ventanas_marcos_v2.jpg . Metal oscuro pintado, cian #a1eee8, luces naranjas pequeñas.

QUÉ ES: el modo «editar controles» que pidió el propietario: el jugador arrastra DISPARAR, MISIL y pausa a donde quiera y lo guarda. Captura del HUD de hoy: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/hud_vuelo.jpg

PIEZAS (6, en este orden):
1. Asa de arrastre, 128×128 px: cuatro flechas en cruz sobre un disco metálico.
2. Marco del control elegido, 360×200 px: borde cian brillante discontinuo con esquinas metálicas; interior transparente (se pone encima del botón).
3. El mismo marco sin elegir: tenue, en gris azulado, sin brillo.
4. Placa superior del modo edición, 1000×120 px: placa metálica con borde ámbar #edc68a y hueco vacío en el centro para el texto (el juego escribe «EDITAR CONTROLES»).
5. Icono restablecer, 128×128 px: flecha circular.
6. Icono hecho, 128×128 px: marca de verificación.

CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). COMPROBACIÓN ANTES DE SUBIR: más de 5.000 colores en las piezas grandes y más de 1.500 en las de 256 px o menos; míralas sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo blanco). Sin texto, letras ni números en ninguna imagen.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (WebP con transparencia). En catalog.json pon "encargo": "art-ui-hud-mover".
```

## Arte · Efectos en vuelo de las habilidades (5 naves jugables)

- **Id:** `camp-art-habilidades-efectos` · **Prioridad:** 2 · **Archivo:** `encargo-camp-art-habilidades-efectos-v1.png`
- **Para qué:** Pedido del propietario (30/10). Astér, Bastión, Vértice, Mantarraya y Arpón, por piezas. Las 5 de pago van en un encargo posterior. Va con la tarea antes-sector-naves-enemigos.

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
12. Arpón · Arpón: punta del arpón 96×192 px y tramo de cable 48×256 px (se repite sin costuras).
13. Arpón · Riel: tramo del disparo de riel 160×512 px (se repite en vertical) y fogonazo de salida, hoja 4×2 de 384×384 px.

CÓMO HACERLO: cada imagen con el GENERADOR DE IMÁGENES. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas de color liso). COMPROBACIÓN ANTES DE SUBIR: más de 5.000 colores en las piezas grandes; míralas sobre negro, blanco y damero (transparencia real, bordes limpios, sin halo blanco). Sin texto, letras ni números en ninguna imagen.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de la lista (WebP con transparencia). En catalog.json pon "encargo": "camp-art-habilidades-efectos".
```

## Arte · Skins de las 5 naves de pago (10)

- **Id:** `camp-art-naves-skins` · **Prioridad:** 3 · **Archivo:** `encargo-camp-art-naves-skins-v1.png`
- **Para qué:** Pedido del propietario (30/10). Decisión del 24/10: las de pago enganchan por lo vistosas, no por el poder. Nombres de skin propuestos; el propietario puede cambiarlos.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

QUÉ ES: skins de las 5 naves de pago. Decisión del propietario: se compran por lo vistosas, nunca por ser más fuertes. Cada skin es la MISMA nave (misma silueta, mismas piezas, mismo ángulo, misma medida y encuadre que tu entrega original), con otro acabado: materiales, colores, luces y detalles más llamativos. No cambies la forma: el juego usa la silueta para los choques.

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
