# Encargos de arte para GPT · NEON CRONIUM

Actualizado: 2026-11-16. Lista pública que se mantiene al día desde el tablero del proyecto.
Versión para máquinas: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/encargos-gpt.json

**Antes de nada lee la guía:** https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (qué es el juego, modelos de referencia y reglas).

## Cómo trabajar

1. Haz los encargos por orden: prioridad 1 primero.
2. Sube cada resultado al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site) en la carpeta `encargos/` con el nombre indicado en «Archivo».
3. Añádelo a `catalog.json` con el campo `"encargo"` igual al id del encargo.
4. Si pide varias imágenes, numéralas: `encargo-<id>-v1-1.png`, `-2.png`…
5. Respeta medidas, rejilla y fondo (transparente salvo que el prompt pida opaco): el juego recorta las celdas por tamaño exacto.
6. Revisa esta lista cada 10 minutos. Antes de empezar un encargo, mira `catalog.json` del baúl: si ya hay un archivo con su id en `"encargo"`, no lo repitas.

## Arte · Iconos de las casillas nuevas del árbol de la Forja

- **Id:** `art-ui-arbol-iconos` · **Prioridad:** 2 · **Archivo:** `encargo-art-ui-arbol-iconos-v1.png`
- **Para qué:** El árbol nuevo (PR #79) usa de momento el icono más parecido de assets/skill_tree_icons_v1.webp (6×2 celdas de 128 px). Faltan 12 iconos: 6 para las casillas que ya se juegan y 6 para las filas IV y V. Al llegar: guardarlos en art-source/ui/arbol-forja-v1/, montar la hoja y cambiar las posiciones en styles.css (#c9-systems .c9-upgrade-art).

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (sección 7, «Interfaz: pintada, nunca con código»).

ESTILO OBLIGATORIO: el de los iconos de habilidad que ya entregaste (medallón redondo de metal oscuro con remaches naranjas y símbolo cian en el centro): https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/habilidades-v1/habilidad_01_v1.webp . Así se ven hoy dentro de la Forja: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/capturas-interfaz/forja_arbol_v1.jpg . Metal oscuro pintado, cian #a1eee8, luces naranjas pequeñas. Mismo medallón, misma luz y mismo tamaño en los 12.

QUÉ ES: 12 iconos para las casillas nuevas del árbol de mejoras de la nave. Cada icono debe leerse a 64 px en un móvil: un solo símbolo claro, sin letras ni números.

ENTREGA: UNA hoja PNG con fondo transparente real (canal alfa), de 768 × 256 px, rejilla exacta de 6 columnas × 2 filas, celdas de 128 × 128 px, un icono centrado por celda con 8 px de margen, sin bordes entre celdas y sin texto.

FILA 1 (de izquierda a derecha):
1. POTENCIA: un rayo dentro de un núcleo de energía, con flecha hacia arriba.
2. CUARTO MISIL: cuatro misiles en fila dentro del medallón.
3. CASCO DURO: placa de blindaje gruesa con tres remaches, más maciza que un escudo.
4. MISIL BUSCADOR: un misil con una retícula de puntería delante.
5. MISIL DE RACIMO: un misil que se abre en tres fragmentos en abanico.
6. IMÁN: imán en herradura atrayendo dos trozos pequeños de chatarra.

FILA 2:
7. ESCUDO DE ARRANQUE: una nave pequeña dentro de una burbuja hexagonal.
8. SEGUNDA OPORTUNIDAD: un núcleo partido que vuelve a encenderse (chispa de reinicio).
9. REPARACIÓN LENTA: una llave inglesa con una gota de luz.
10. RÁFAGA: tres pulsos seguidos, el último doble.
11. DRON DE APOYO: un dron pequeño con un cañón.
12. CHATARRA +: un montón de piezas de chatarra con un destello.

NO: no pintes texto, números, marcos cuadrados ni fondo. No cambies el estilo del medallón entre iconos.
```
