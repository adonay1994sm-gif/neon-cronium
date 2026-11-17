# Encargos de arte para GPT · NEON CRONIUM

Actualizado: 2026-11-17. Lista pública que se mantiene al día desde el tablero del proyecto.
Versión para máquinas: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/encargos-gpt.json

**Antes de nada lee la guía:** https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md (qué es el juego, modelos de referencia y reglas).

## Cómo trabajar

1. Haz los encargos por orden: prioridad 1 primero.
2. Sube cada resultado al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site) en la carpeta `encargos/` con el nombre indicado en «Archivo».
3. Añádelo a `catalog.json` con el campo `"encargo"` igual al id del encargo.
4. Si pide varias imágenes, numéralas: `encargo-<id>-v1-1.png`, `-2.png`…
5. Respeta medidas, rejilla y fondo (transparente salvo que el prompt pida opaco): el juego recorta las celdas por tamaño exacto.
6. Revisa esta lista cada 10 minutos. Antes de empezar un encargo, mira `catalog.json` del baúl: si ya hay un archivo con su id en `"encargo"`, no lo repitas.

## Estación Chronos nueva: hoja de 4 conceptos para elegir

- **Id:** `s1-intro-estacion-nueva` · **Prioridad:** 1 · **Archivo:** `encargo-s1-intro-estacion-nueva-v1.png`
- **Para qué:** Propietario, 24/10: no le gusta nada de la estación actual. Es el control de la ruta del CRONIUM, con el reactor en la torre que ataca Cronos Prime. Estilo pintado del juego, no fotográfico como el vídeo de Gemini (que solo es una idea de ritmo y efectos). El encargo a GPT se escribe y se manda cuando lleguemos al paso de la intro: hoja de 4 estaciones distintas, misma escala y luz, y él elige una.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md .

ESTILO OBLIGATORIO: pintado digital de videojuego, el mismo del resto de piezas del juego (no fotográfico). Metal oscuro, cian #a1eee8 para las luces de la ruta y luces naranjas pequeñas. Referencia de lo que NO quiere el propietario (la estación de hoy): https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/chronos_intro_station_atlas_v1.webp . Referencia de estilo de otra pieza grande del juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/c9_station_v1.webp .

QUÉ ES: la estación Chronos, el centro científico que controla la ruta del CRONIUM (la energía que alimenta la galaxia). Tiene un reactor dentro de una torre central; es lo que ataca Cronos Prime en la intro del juego. Debe verse importante, ordenada y bella antes de que la rompan.

ENTREGA: UNA imagen PNG con fondo transparente real (canal alfa) de 2048 × 2048 px, rejilla exacta de 2 columnas × 2 filas, cada celda de 1024 × 1024 px, con UNA estación distinta por celda, centrada, con 48 px de margen y sin bordes entre celdas ni texto. Las cuatro con la misma escala, la misma luz (desde arriba a la izquierda) y la misma perspectiva (vista casi frontal, ligeramente desde arriba).

LAS CUATRO ESTACIONES (distintas entre sí):
1. ANILLO Y TORRE: un gran anillo giratorio con una torre de cristal azul que lo atraviesa por el centro; el reactor es una esfera luminosa en lo alto de la torre.
2. CIUDADELA: un bloque vertical de varios pisos con alas laterales y la torre del reactor en el centro, como un faro.
3. ARCHIPIÉLAGO: cuatro módulos redondos unidos por pasarelas alrededor de una torre central con el reactor al aire.
4. CORONA: un anillo abierto como una corona con antenas hacia fuera y el reactor flotando en el hueco, sujeto por rayos de luz.

TODAS: el reactor es lo más brillante y se ve de lejos; luces de ruta cian en el borde; sin personas ni naves; sin texto ni logos.

NO: no pintes fondo, estrellas ni planetas (transparente). No hagas la estación dañada o rota: eso se hace en el juego. No cambies de escala o luz entre las cuatro.
```

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

## Un hito pintado por tramo en el fondo del sector 1

- **Id:** `s1-hitos-por-tramo` · **Prioridad:** 2 · **Archivo:** `encargo-s1-hitos-por-tramo-v1.png`
- **Para qué:** Segunda parte de «el viaje» (opción B de la página del 09/11): cascos rotos gigantes en el campo de restos, la malla de satélites en la red exterior, la barrera de la cuarentena. Hace falta arte de GPT: preparar los encargos con su prompt cuando el propietario lo pida.

```text
Antes de empezar lee https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/GUIA_GPT.md .

ESTILO OBLIGATORIO: pintado digital de videojuego, igual que los restos y meteoritos que ya hay en el juego: https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/debris_panel.webp y https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/assets/meteor_large.webp . Metal oscuro, cian #a1eee8 y luces naranjas pequeñas; muy poco contraste y colores apagados, porque van DETRÁS del juego y no deben competir con las naves ni los disparos.

QUÉ ES: un hito pintado por cada tramo del sector 1 para que se note que viajas: algo enorme y lejano que pasa despacio por el fondo. Se dibujan gigantes, desenfocados al borde y semitransparentes en el juego.

ENTREGA: SEIS imágenes PNG separadas, cada una 1024 × 1024 px con fondo transparente real (canal alfa), el hito centrado con 64 px de margen, sin texto ni marcos. Nombres: hito_tramo2_cascos.png, hito_tramo3_malla.png, hito_tramo4_cuarentena.png, hito_tramo7_noche.png, hito_tramo8_lluvia.png, hito_tramo9_orbital.png.

LOS SEIS:
1. TRAMO 2 · CAMPO DE RESTOS: dos cascos de nave rotos, gigantes, flotando a la deriva, con cables sueltos y planchas abiertas. Una nave de carga y un crucero civil de Chronos.
2. TRAMO 3 · LA RED EXTERIOR: un fragmento de malla de satélites de Gaia: varios satélites unidos por haces finos de luz cian formando un triángulo grande.
3. TRAMO 4 · CUARENTENA: una barrera de contención: una línea larga de balizas con un campo de energía tenue entre ellas, con luces de aviso naranjas.
4. TRAMO 7 · EL LADO NOCTURNO: la silueta de una estación de vigilancia a oscuras, con solo algunas ventanas encendidas.
5. TRAMO 8 · LLUVIA EN EL ACCESO: un meteorito enorme partido en dos con un núcleo brillante y fragmentos que se desprenden.
6. TRAMO 9 · DEFENSA ORBITAL: una plataforma de defensa orbital con grandes cañones apagados y paneles solares abiertos.

NO: no pintes fondo, estrellas ni planetas (transparente). No pongas naves enemigas ni personas. No hagas ninguna con tanto brillo que tape el juego: lo más brillante, una luz pequeña.
```
