# Guía para GPT · arte de NEON CRONIUM

Hola, GPT. Esta guía es tu punto de partida. Con ella entiendes el juego y
haces el arte sin tener que preguntar. Léela entera antes del primer
encargo.

## 1. Qué es el juego

NEON CRONIUM es un juego arcade de naves para el móvil, en vertical
(lienzo de 720×1280). El piloto huye de la estación Chronos y cruza
**10 sistemas** de la galaxia buscando cristales de CRONIUM. Cada sistema es
el territorio de una **facción** con naves, armas y forma de combatir
propias. Cada sector tiene 10 tramos de vuelo continuo, con un **subjefe**
en el tramo 5 y un **jefe** en el tramo 10.

## 2. Qué leer, en este orden

Todo está en la rama de trabajo **`claude/preparar-publicacion-rtfl9q`**.
Lee los archivos por su URL «raw»:

1. **La biblia de la galaxia** (facciones, enemigos y jefes):
   https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/design/BIBLIA_GALAXIA.md
2. **El diseño de la campaña** (cómo se juega):
   https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/superpowers/specs/2026-10-22-campana-galaxia-design.md
3. **Las reglas visuales** (colores con significado y encargos, §9 y §13):
   https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/DESIGN.md
4. **La lista de encargos**, por orden de prioridad:
   https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/ENCARGOS_GPT.md

## 3. Modelos de referencia

Mira estas imágenes antes de dibujar. Marcan el nivel y el estilo que hay
que igualar.

| Modelo | Para qué sirve | URL |
|---|---|---|
| Dosier de Gaia | Estilo de naves enemigas: blindaje marfil, chasis grafito, luces | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/gaia_enemy_dossier_v1.jpeg |
| Estados de Atlas | Cómo se pide un jefe: hoja de estados, mismo modelo, misma escala | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/enemies/guardian-atlas/guardian-atlas-states-master.png |
| Efectos de Atlas | Brillo rojo de ataque y fogonazos | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/enemies/guardian-atlas/atlas-combat-vfx-master.png |
| CH-01 | Enemigo pequeño ya en el juego | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/enemies/ch01/ch01-master-v2.png |
| CH-02 | Enemigo pequeño ya en el juego | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/enemies/ch02/ch02-master-v2.png |
| Nave del jugador | Lo «nuestro»: cian y marfil | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ship-identity/player_ship_identity_v1.png |
| Dosier de Vulkar | Facciones de lava | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/vulkar_enemy_dossier_v1.jpeg |
| Dosier de Cryon | Facciones de hielo | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/cryon_enemy_dossier_v1.jpeg |
| Dosier de Aether | Facciones temporales | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/aether_enemy_dossier_v1.jpeg |
| Dosier de Titan Omega | Facciones industriales | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/titan_omega_enemy_dossier_v1.jpeg |
| Dosier de criaturas raras | Ballena, medusa y gusano de las rutas de frontera | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/rare_creatures_dossier_v1.jpeg |
| Dosier de Cronos Prime | El jefe final y el violeta | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/references/cronos_prime_dossier_v1.jpeg |
| Retratos | Estilo de los personajes | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/character-portraits/NEON_CRONIUM_Retratos_2048x512.png |
| Núcleo de lava | Proyectil o mina cálida ya en el juego | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/lava-core-mine/lava_core_mine_1024x512.png |
| Cometa ámbar | Hoja de fotogramas bien hecha | https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/comet-ambar/cometa_ambar_spritesheet_1.0.0.png |

En el baúl ya hay sprites de Cryon (Frost Crystal, Ice Drone, Cryo Mine y
Leviathan), de Cronos Prime y de planetas. No los repitas: úsalos como
referencia.

## 4. Frase de estilo (la misma en todo)

> Arte de juego sci-fi pintado y semirrealista, vista cenital estricta,
> blindaje con paneles y juntas visibles, luz fría de estudio desde arriba a
> la izquierda, sombras grafito, como el dosier de Gaia y los estados de
> Atlas de NEON CRONIUM.

## 5. Colores con significado (obligatorio)

- **Lo que hace daño** brilla en **ámbar, naranja o rojo**: disparos
  enemigos, núcleos al atacar, minas y explosiones.
- **El cian es del jugador**: su nave, sus disparos y el CRONIUM. Nunca pongas
  cian en algo enemigo que hace daño.
- **El violeta es de lo temporal:** Cronos Prime, Aether y Kairos. No lo uses
  en otras facciones.
- El color propio de cada facción va en el **casco y su luz de reposo**:
  blanco en Gaia, basalto en Vorn, azul hielo en Cryon, violeta en Aether…
  **Lo que hace daño vira a cálido:** el núcleo pasa a ámbar al cargar y los
  proyectiles son rojos o naranjas.

## 6. Reglas técnicas (sprites)

1. **Fondo transparente real** (canal alfa). No pintes un damero ni negro.
   Bordes limpios, sin halo blanco.
2. **Rejilla exacta:** todas las celdas del mismo tamaño, un fotograma por
   celda, sin texto, sin números y sin líneas entre celdas.
3. **Ancla común:** el centro del personaje en el mismo píxel de cada celda,
   con la misma escala, la misma luz y la misma perspectiva.
4. **Orientación:** los enemigos miran **hacia abajo de la imagen** (hacia el
   jugador). Las naves del jugador miran hacia arriba.
5. **Tamaño:** usa la medida de celda que pide cada encargo. Es el doble de
   lo que se ve en pantalla.
6. Los **dosieres de concepto** y los **fondos** son las excepciones: pueden
   llevar rótulos y fondo opaco cuando el encargo lo diga.

## 7. Cómo entregar

1. Haz los encargos por orden: prioridad 1 primero.
2. Súbelos al baúl (https://neon-cronium-video-referencia.chictide18.chatgpt.site)
   en `encargos/`, con el nombre de «Archivo» de cada encargo.
3. Añádelos a `catalog.json` con `"encargo"` igual al id del encargo.
4. Si un encargo pide varias imágenes, numéralas: `-1.png`, `-2.png`…
5. Antes de empezar uno, mira si ya está en `catalog.json` y no lo repitas.
6. Comprueba cada sprite sobre negro, blanco y damero antes de subirlo.
7. Un id que termina en `-v2`, `-v3`… es un encargo **nuevo** que sustituye
   al anterior porque no valía: hazlo aunque el id antiguo ya esté en
   `catalog.json`.

### Interfaz: pintada, nunca con código

Marcos, botones, paneles y maquetas de interfaz se pintan con el generador
de imágenes, como el marco ya aprobado
(https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/art-source/ui/menu-principal/menu_marco_boton_v1.webp).
No se dibujan con código (Python, PIL, SVG, canvas, CSS ni formas de color
liso). Comprobación: una pieza pintada tiene miles de colores distintos; si
tiene menos de 5.000, es dibujo plano y no vale. Las maquetas no se montan
encima de las capturas del juego.

## 8. Si dudas

Elige la opción más legible en un móvil pequeño: silueta clara, pocos
detalles finos, contraste fuerte entre la nave y el brillo de su ataque. La
biblia manda sobre el resto. Si algo no encaja, escríbelo en el campo
`"nota"` de `catalog.json`.
