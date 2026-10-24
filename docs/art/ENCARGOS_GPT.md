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

## Arte: marco del botón principal más brillante (v2)

- **Id:** `art-ui-marco-principal-v2` · **Prioridad:** 1 · **Archivo:** `encargo-art-ui-marco-principal-v2-v1.png`
- **Para qué:** Sustituye a art-ui-marco-principal (24/10): la v1 añadió una banda plana de cian pálido por fuera del marco. Encargo nuevo con id propio y referencia exacta al marco aprobado.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTE ENCARGO SUSTITUYE A art-ui-marco-principal. Ya lo entregaste, pero NO vale: le añadiste por fuera una banda plana de cian pálido que parece pegada y tapa el metal. Lo que NO quiero (tu entrega anterior): https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-art-ui-marco-principal-v1-1.webp .
Lo que SÍ quiero: EXACTAMENTE este marco ya aprobado, https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_v1.webp (y su versión pulsada https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_pulsado_v1.webp), con más energía para el botón principal (JUGAR / CONTINUAR VIAJE), pintada DENTRO del propio marco. Así se ve montado en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/pantalla_principal.jpg .

PIEZAS (2 imágenes, 1328×200 px cada una, sin texto, sin flecha, WebP con transparencia real):
1. PRINCIPAL NORMAL: el borde cian del propio marco el doble de grueso y más luminoso; un resplandor cian suave que sale del borde y se desvanece hacia fuera en 10–12 px (transparencia que baja poco a poco, nunca una banda sólida); la barra cian vertical de la izquierda encendida; las luces naranjas de las esquinas más vivas; el interior azul noche con un leve degradado cian de abajo arriba, como luz que sube.
2. PRINCIPAL PULSADO: la misma pieza con el interior más iluminado y el borde casi blanco #e8fffd.
Misma forma, misma medida y los remaches, juntas y luces en la misma posición que el aprobado, píxel a píxel: en el juego se cambian uno por otro. Detalles solo en los 170 px de cada extremo; la franja central, lisa y repetible. Fuera del contorno del marco solo puede haber el resplandor que se desvanece.

CÓMO HACERLO: genera cada pieza con el GENERADOR DE IMÁGENES, como hiciste con el marco aprobado. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas vectoriales de color liso). Parte del marco aprobado: misma textura de metal pintado, mismos biseles, remaches, juntas, desgaste y luz real; cambia solo lo que se pide. Después recorta y deja el fondo transparente.
COMPROBACIÓN ANTES DE SUBIR: (1) cada pieza tiene más de 5.000 colores distintos (tu entrega anterior tenía 24: eso es dibujo plano y no vale); (2) ponla al lado de https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_v1.webp y tiene que parecer de la misma familia; (3) mírala sobre negro, blanco y damero: transparencia real, bordes limpios, sin halo.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de arriba (formato WebP). En catalog.json pon "encargo": "art-ui-marco-principal-v2".
```

## Arte: marcos comunes de ventanas y botones (v2, pintados)

- **Id:** `art-ui-paneles-v2` · **Prioridad:** 1 · **Archivo:** `encargo-art-ui-paneles-v2-v1.png`
- **Para qué:** Sustituye a art-ui-paneles (24/10): la entrega v1 llegó hecha con código, plana (24 colores por pieza), y GPT creía que ya estaba entregado. Encargo nuevo con id propio, referencia al marco aprobado y comprobación de colores.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTE ENCARGO SUSTITUYE A art-ui-paneles. Ya lo entregaste, pero NO vale: lo hiciste con código, con formas planas de color liso, y el propietario quiere arte PINTADO con relieve. Lo que NO quiero (tu entrega anterior): https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-art-ui-paneles-v1-1.webp y https://neon-cronium-video-referencia.chictide18.chatgpt.site/encargos/encargo-art-ui-paneles-v1-2.webp .
Lo que SÍ quiero: el mismo acabado que este marco ya aprobado por el propietario: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_v1.webp (metal oscuro pintado, borde cian #a1eee8, luces naranjas en las esquinas, interior azul noche #040c15). Así se ve montado en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/pantalla_principal.jpg .

PIEZAS (6 imágenes, sin texto, WebP con transparencia real):
1. MARCO DE VENTANA, 1080×1500 px: panel de metal pintado como el marco aprobado, borde cian #a1eee8, esquinas cortadas con remaches y luces naranjas pequeñas. Interior azul noche #040c15 casi opaco (92 %), con una rejilla técnica muy suave. Todos los detalles en los 200 px de cada esquina; los lados, lisos y repetibles (el juego lo estira).
2. BOTÓN SECUNDARIO, 1328×160 px: el marco aprobado en versión discreta: metal grafito, borde cian apagado #4f8f8c, SIN la barra cian vertical de la izquierda, luces naranjas tenues. Detalles solo en los 150 px de cada extremo; centro liso y repetible.
3. BOTÓN SECUNDARIO PULSADO, 1328×160 px: el mismo, con el interior más iluminado y el borde cian más vivo.
4. BOTÓN DE PELIGRO (SALIR AL MENÚ), 1328×160 px: como el secundario, con el borde rojo #ff6b8d apagado y las luces de las esquinas rojas.
5. BOTÓN DE ANUNCIO (VER ANUNCIO Y REPARAR), 1328×160 px: como el secundario, con el borde ámbar #ffb84d. Sin icono: lo pone el juego.
6. FICHA DE DATO, 400×220 px: casilla pequeña de metal pintado para PUNTOS / CASCO / COMBO, borde cian fino apagado, remaches en las esquinas.

CÓMO HACERLO: genera cada pieza con el GENERADOR DE IMÁGENES, como hiciste con el marco aprobado. PROHIBIDO dibujarla con código (Python, PIL, SVG, canvas, CSS o formas vectoriales de color liso). Parte del marco aprobado: misma textura de metal pintado, mismos biseles, remaches, juntas, desgaste y luz real; cambia solo lo que se pide. Después recorta y deja el fondo transparente.
COMPROBACIÓN ANTES DE SUBIR: (1) cada pieza tiene más de 5.000 colores distintos (tu entrega anterior tenía 24: eso es dibujo plano y no vale); (2) ponla al lado de https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_v1.webp y tiene que parecer de la misma familia; (3) mírala sobre negro, blanco y damero: transparencia real, bordes limpios, sin halo.

ENTREGA: usa el nombre de «Archivo» de este encargo, numerado -1, -2… en el orden de arriba (formato WebP). En catalog.json pon "encargo": "art-ui-paneles-v2".
```
