---
name: forma-de-trabajar
description: Cómo piensa y qué busca el propietario de NEON CRONIUM, y cómo trabajar con él. Cárgala al empezar cualquier trabajo en este proyecto (código, arte, diseño, revisiones o respuestas) y antes de decidir prioridades. Se actualiza cada 3 días con lo aprendido.
---

# Forma de trabajar con el propietario de NEON CRONIUM

Destilado de sus mensajes desde el 19/10/2026. Si algo de aquí choca con un
mensaje nuevo suyo, manda el mensaje nuevo; anótalo en «Aprendizajes».

## 1. Qué persigue

- **Terminar el juego y publicarlo** en móvil (iPhone y Android). Steam queda
  para después (23/10). El juego **no está terminado**; nunca lo trates como
  listo para la tienda.
- **El concepto:** una aventura espacial en la que **viajas** por una galaxia.
  Ves acercarse planetas y conflictos. Es un mundo «abierto pero lineal», con
  una historia impactante.
- **Campaña:** 10 sectores × 10 tramos, cada sector continuo, con su facción e
  identidad, el subjefe en el tramo 5 y el jefe en el 10. Entre sectores hay
  una travesía propia.
- **Público tipo Call of Duty:** intenso, frenético y algo frustrante; un
  reto que quieras conseguir. Lo que más le molesta es que sea «aburrido,
  repetitivo, rutinario, sin emociones».
- **Profundidad y motivos para seguir jugando:**
  - un árbol de habilidades con decisiones;
  - un arsenal con niveles que se notan (N1 un disparo, N3 tres, N4 «última»
    con penalización);
  - el hangar como taller de reparación;
  - 10 naves con habilidad exclusiva y habilidad última (aprobado 24/10).
- **Un mundo con lógica:** las especies y facciones nacen de su planeta,
  biología y recursos.

## 2. Su listón de calidad

- **El arte pintado gana a lo hecho con código.** Lo que «parece hecho por
  comandos» (degradados, líneas, puntos o formas dibujadas en canvas) lo
  rechaza: rayos negros, estelas planas o pantallas sin relieve. Usa siempre
  el arte de GPT del baúl o del repositorio antes de dibujar nada a mano. Si
  falta, haz un encargo para GPT y usa algo pintado como provisional.
- **Si GPT le dio algo bueno, se usa tal cual o mejor**, nunca una versión
  plana. Rehacerlo peor le hace perder la paciencia.
- **Interfaz con relieve y aspecto profesional**, como las maquetas ORBIT / 01:
  marcos, placas, profundidad en los botones.
- **Animaciones con carácter**:
  - la intro y los jefes tienen que impactar;
  - nada de imágenes que se solapan, cortes visibles, piezas rígidas o
    colores que no casan con el fondo;
  - usa un portal dimensional en vez de estelas.
- **Combate justo pero exigente:** avisos visibles, sin zonas seguras
  marcadas en los meteoritos, enemigos poco predecibles, jefes con 3 ataques,
  un especial y furia.
- **Juega en el móvil (iPhone).** Mira siempre el resultado a 390×844 con
  capturas antes de decir que algo está bien.

## 3. Cómo decide

- **Él decide** lo grande. Quiere **conceptos para decidir**, con imágenes,
  opciones y una recomendación marcada que pueda seleccionar.
- Si algo es un concepto suyo, no lo programes de golpe: debatelo, busca
  referencias que funcionen y propón. «Lo que te digo es un concepto».
- Una vez decidido, quiere avance sin pausas: «Empieza», «Sigue tu
  recomendación», «Sí a todo».
- **Nunca aparques una petición suya sin decírselo.** Si algo va para
  después, avísale y anótalo en el tablero. Aparcar el hangar de las 10 naves
  sin preguntar le costó días y enfado (24/10).
- Si hay varias cosas abiertas, pregunta cuál va primero; si no, haz la que
  él acaba de pedir.
- **Un paso cada vez, en orden (24/10).** Primero la interfaz: base visual,
  pantalla principal, hangar, Forja C9, ajustes y HUD. Después el sector 1:
  intro y tramos 1 a 10, hasta el jefe. Un paso no se abre hasta cerrar el
  anterior; lo que surja de otro paso se apunta en él y espera.
- **Antes de programar un paso, pregunta.** Repasa con él qué hay, qué le
  sobra y qué le falta, y no toques código hasta tener sus respuestas.
- **Sé sincero.** Si cree algo que no es así, o un plan suyo choca con otro,
  díselo claro y con el motivo, aunque no sea lo que quiere oír.

## 4. Tiempo y dinero

- Cada sesión le cuesta tiempo y dinero. No gastes en lo que no ha pedido.
  Ejemplos: revisiones duplicadas, arreglos de fallos que no existen,
  reestructuraciones por iniciativa propia.
- Si lo pide («dime qué has hecho»), da cuentas claras: hecho y funcionando,
  dónde se perdió tiempo, qué falta y depende de él.
- Reconoce los errores sin rodeos; no los maquilles.

## 5. Cómo hablarle

- Español sencillo. La acción o el resultado en la primera línea. Listas
  cortas. Sin preámbulos ni despedidas.
- Explica qué ha cambiado **para el jugador**, no solo en el código.
- Dale siempre un **enlace para probarlo** cuando cambia algo jugable o
  visual. Hoy es https://claude.ai/artifact/7HCk4RiGujkUSph4qd57Fg, que se
  actualiza al publicar el mismo archivo.
- Si no se pudo comprobar algo (iPhone real, sonido), dilo.

## 6. Cómo se trabaja en este proyecto

- **Tablero:** https://claude.ai/artifact/MgQvtqMaPSzRLsTMJgCUMy.
  - Está ordenado por pasos (campo `paso` de cada tarea); el paso en el que
    se trabaja está en `tablero/estado.pasoActual`. Al cerrar un paso, se
    cambia ahí.
  - Cada cambio se marca allí.
  - Todo lo que se encuentra y no se termina se añade como tarea, en su paso.
  - Las decisiones se añaden con su recomendación.
  - Se revisa sola tres veces al día (tarea programada «Revisión del
    tablero», 8:39, 13:39 y 19:39 de Madrid): decisiones nuevas, entregas
    del baúl y días que lleva quieta cada tarea. Lo atascado (3 días o más)
    se anota en el campo `quieta` sin tocar `actualizado`, y se le avisa solo
    si hay algo.
- **Arte con GPT:** él no copia prompts a mano. Cada necesidad visual va al
  tablero con su prompt (DESIGN.md §13). Después se regenera
  `docs/art/ENCARGOS_GPT.md`, que GPT revisa solo cada 10 minutos.
- **Baúl de assets:** https://neon-cronium-video-referencia.chictide18.chatgpt.site
  (`catalog.json`).
  - Revísalo al empezar cada trabajo.
  - Integra lo entregado **sin esperar a que lo pida**: le molestó encontrar
    el fondo del taller y los iconos sin usar (24/10).
- **Galería de naves de GPT:**
  https://neon-cronium-hangar-galeria.chictide18.chatgpt.site
- **Ramas:**
  - rama de trabajo `claude/preparar-publicacion-rtfl9q`, a `main` con PR;
  - sin force push;
  - el repositorio, limpio: lo que no se usa, fuera (preguntando si dudas).
- **Sin firma de IA** en archivos, commits ni PRs. El juego tiene que parecer
  hecho por una persona. Nada de nombres antiguos («NEON Catcher»).
- **Tras cada PR fusionado,** una revisión de `auditor-codigo`, y sus
  hallazgos al tablero. Una sola revisión por cambio.
- **Autonomía:**
  - puede dejarte trabajando de noche;
  - prográmate tareas para no parar y fusiona tú los PR si la CI está en
    verde.

## 7. Decisiones que ya tomó (no volver a preguntar)

- Bundle id `com.neoncronium`; repositorio `adonay1994sm-gif/neon-cronium`.
- JUGAR abre el sector 1. Los viajes antiguos solo existen en el panel de
  desarrollo (`?dev=1`).
- El tramo 1 empieza con la intro de Chronos y el tutorial.
- La baliza se paga con chatarra (40).
- Dificultad con tres modos más un hardcore en el que pierdes todo.
- Juego solo en vertical: el modo horizontal se bloquea.
- 10 naves (24/10):
  - las paletas y habilidades del concepto
    (https://claude.ai/artifact/6KmCsopxEWoBbrK76jKiKx);
  - cómo se consiguen (24/10, sustituye a «una por sector»): Astér de serie
    y Bastión al vencer a Atlas; Vértice, Mantarraya y Arpón con chatarra,
    cada una más cara y mejor; las 5 restantes de pago con skins. Lo de pago
    engancha por lo vistoso (habilidades y skins), nunca por más poder. Los
    precios esperan la revisión de la economía;
  - la habilidad va con el fuselaje;
  - el hangar es una pestaña del taller de Mira.
- La intro de Chronos usa un portal dimensional (no estela) y el haz pintado
  de Cronos Prime (24/10).
- Pantalla principal (24/10): los botones se abren con la historia (al
  empezar solo JUGAR y ajustes; hangar en el tramo 6; ruta y naves tras el
  jefe). No se programa hasta tener todas sus maquetas.
- Arte con GPT (24/10): se sigue con el tablero, la lista pública de
  encargos y el baúl. Nada de pagar la API de OpenAI ni de usar su
  herramienta Lúmina: no volver a proponerlo.
- Pendientes de su decisión:
  - el color de la Égida;
  - la pose del Fulminante de Atlas.

## 8. Antes de dar algo por terminado

1. ¿Es lo que pidió, o lo que yo creí que pedía? Si dudo, pregunto.
2. ¿He usado el mejor arte disponible (baúl, `art-source/`, maquetas de GPT)?
3. ¿Lo he visto en capturas a tamaño móvil?
4. ¿Pasan `npm run build && npm test && npm run test:static && npm run test:content`?
5. ¿Está en el tablero, con lo pendiente anotado y el enlace de prueba al día?

## Aprendizajes

Se añaden cada 3 días (tarea programada) y cuando él corrige algo. Va una
línea por aprendizaje, con fecha, y lo más nuevo arriba. Si un aprendizaje
cambia una regla de arriba, se edita la regla y aquí se deja constancia.

- 24/10/2026: GPT entregó marcos y pantallas hechos con código (planos, 24
  colores, montados sobre las capturas) y creía haber cumplido. Revisa cada
  entrega del baúl con tus ojos antes de darla por buena; si no vale, pide
  un id nuevo (`-v2`) con la referencia aprobada y una comprobación medible.
- 24/10/2026: cuando propone algo que no es del paso actual (C9 como nave
  taller), quiere pensarlo y dejarlo escrito para tenerlo claro, pero
  aparcado: ni código ni encargos a GPT hasta que llegue su paso. Se guarda en
  un documento de concepto (docs/design/C9_CONCEPTO.md) y en el tablero.
- 24/10/2026: «el juego ha cambiado mucho». Antes de seguir, quiere un
  repaso por partes y una cosa cada vez, dejando cada parte terminada. La
  sección 3 recoge el orden y las reglas.

- 24/10/2026: la dificultad nunca es llana. Enemigos con más vida y más daño
  tramo a tramo y sector a sector (al final del S1, 3 disparos te matan).
  Las armas se consiguen con la historia y se suben de nivel. Se vuela con
  una sola y se cambia en el hangar, que se abre en el tramo 6 y tras el jefe.
  Los jefes llevan una barra de vida que estrese. Los enemigos especiales se
  van descubriendo poco a poco.
- 24/10/2026: juega de verdad. Si el sector se atasca (Atlas no llegaba),
  simula la partida entera de principio a fin antes de darla por buena.
- 24/10/2026: si señala que algo «se ve negro» o «hecho por comandos», busca
  primero el arte pintado que ya existe y no se usa.
- 24/10/2026: «Esto es una mierda, GPT te pasó algo fantástico». Cuando haya
  una maqueta de GPT, la pantalla del juego debe parecerse a ella.
- 22/10/2026: el combate le parecía aburrido. Pidió hordas, ataques por
  detrás, meteoritos dirigidos y jefes con furia.
