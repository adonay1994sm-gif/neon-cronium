# NEON CRONIUM — guía rápida para Claude

Juego arcade espacial en **Canvas 2D**, lienzo lógico **720×1280** (vertical).
Se distribuye como PWA (Netlify publica `www/`) y como app iOS con Capacitor.
Las instrucciones detalladas del propietario están en `AGENTS.md`; esta guía
solo resume lo imprescindible.

## Estado del juego

El juego **no está terminado**: solo el capítulo 1 de la campaña objetivo
(10 capítulos × 10 etapas) está jugable y en pulido. Preparar la publicación
no significa que esté listo para la tienda.

## Idioma

- Explica todo en **español** y con lenguaje sencillo.
- Mensajes de commit en español, cortos y claros: un cambio por commit.
- **Sin firma de IA** (propietario, 23/10/2026): ni en archivos ni en commits
  (sin `Co-Authored-By` ni enlaces de sesión) ni en PRs. No escribir «por
  Claude», «decisión de Claude» y similares: usar «decisión técnica».
- No entierres la respuesta: la acción o el resultado en la primera línea,
  pasos numerados y listas cortas (máx. 5). Sin preámbulos ni despedidas.
  Para aplicarlo a toda la sesión: `/i-have-adhd` (skill MIT de
  [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)).

## Dónde se edita el código

- El juego vive en `src/game/` (módulos `00-…` a `08-…` y subcarpetas).
- `game.js`, `core-runtime.js`, `content-runtime.js`, `www/` e
  `ios/App/App/public/` son **salidas generadas**. No se editan a mano.
- `game.js` está versionado: si el build lo regenera, va en el mismo commit
  que el cambio en `src/game/`.
- Mapa de módulos: `src/game/README.md`.

## Comandos

```bash
npm ci                 # instalar dependencias exactas
npm run build          # regenera game.js, runtimes, www/ e iOS public
npm test               # pruebas de juego (JSDOM)
npm run test:static    # coherencia de paquete, manifiesto, SW, iOS
npm run test:content   # suites node:test de contenido
npm run test:architecture
npm run test:preview   # paquete de preview y service worker
npm run test:sistema   # pantallas rehechas: solo colores y tamaños del sistema (Chromium)
```

Después de cada commit: `npm run build && npm test && npm run test:static`.
Si el cambio toca menú, ventanas, ajustes o Forja, también `npm run test:sistema`;
al rehacer otra pantalla, se añade a esa prueba.
Si algo falla por el cambio, se deshace ese commit y se anota.

## Ramas

- Rama principal: **`main`**. Desde el 23/10/2026 contiene todo el trabajo
  (la V6 antigua queda en su historia). La web de prueba `neon-preview-deploy`
  publica `main`.
- Rama de trabajo: `claude/preparar-publicacion-rtfl9q`; se integra en `main`
  con PR. Sin force push.
- Las ramas antiguas (`continuity-assets-audit-20261013`, `v7-visual-upgrade`,
  `pre-release-development`, `production-100-development`,
  `visual-artpass-a-2026-10-13`) están retiradas; su historia sigue en los PRs
  cerrados #1–#4 y #44–#45.

## Publicidad

- Solo **IDs de prueba** de Google AdMob (`ca-app-pub-3940256099942544…`).
- No poner IDs reales ni cambiar `ads-config.js`, `native-admob.js` o
  `ad-bridge.js` sin orden expresa del propietario.

## Reglas de trabajo

- Cambios pequeños y reversibles. No borrar archivos; mover con `git mv`.
- No cambiar balance, dificultad, economía ni guardados sin orden expresa.
- No tocar iOS/Capacitor (`ios/`, `capacitor.config.ts`) salvo indicación.
- Un único bucle `requestAnimationFrame`. El motor experimental V1 se
  retiró el 23/10/2026 (orden del propietario); sigue en el historial de git.
- No inventar datos legales, contactos ni IDs: escribir `[COMPLETAR]`
  o "sin comprobar".
- Progreso de la preparación de publicación: `docs/publicacion/PROGRESO.md`.

## Tablero, baúl y revisiones (orden del propietario, 21/10/2026)

- **Tablero del proyecto:** https://claude.ai/artifact/MgQvtqMaPSzRLsTMJgCUMy
  (organigrama con lo hecho, en curso, pendiente y decisiones del
  propietario; colección `tareas`). Cada cambio que se implementa se marca
  allí, y **todo lo que se encuentra y no se termina se añade** como tarea
  hasta que esté hecho.
- **Cada necesidad visual lleva su prompt para GPT** en la tarea (campo
  `prompt`, reglas de `DESIGN.md` §13). GPT no puede entrar al tablero, así
  que al cambiar prompts se regenera la lista pública
  (`node scripts/export-encargos-gpt.mjs <tareas descargadas>` →
  `docs/art/ENCARGOS_GPT.md` y `docs/art/encargos-gpt.json`), que GPT lee en
  https://raw.githubusercontent.com/adonay1994sm-gif/neon-cronium/claude/preparar-publicacion-rtfl9q/docs/art/ENCARGOS_GPT.md
  (rama de trabajo, orden del propietario 22/10/2026; guía en `docs/art/GUIA_GPT.md`)
- **Baúl de assets:** https://neon-cronium-video-referencia.chictide18.chatgpt.site
  (`catalog.json`). El propietario sube ahí lo que hace GPT; revisarlo al
  empezar cada trabajo y usar lo nuevo.
- **Tras cada actualización de la rama** (PR fusionado), pasar una revisión
  de `auditor-codigo` sobre ese cambio y llevar sus hallazgos al tablero.

## Última auditoría (22/10/2026)

Visual 5,5/10 · lógica 7/10 · juego 5/10. Hallazgos V01–V18, L01–L05 y
J01–J07 en `docs/auditorias/AUDITORIA_2026-10-22.md`; léela antes de tocar
HUD, efectos, fondos, guardados de viajes o enemigos. J01/J02 (escalada y
munición) esperan decisión del propietario.

## Cuatro reglas antes de programar

Adaptadas de [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
(MIT, commit `2c60614`). En tareas triviales, usa el sentido común.

1. **Piensa antes de programar.** Di qué estás suponiendo. Si hay varias
   lecturas posibles o algo no está claro, pregunta en vez de elegir a
   escondidas. Si hay una forma más sencilla, dilo.
2. **Mantenlo simple.** El mínimo código que resuelve lo pedido: nada de
   funciones extra, abstracciones de un solo uso ni opciones que nadie pidió.
   Si 200 líneas pueden ser 50, reescríbelo.
3. **Toca solo lo que te han pedido.** No "mejores" código, comentarios ni
   formato vecinos; respeta el estilo existente. Si ves código muerto ajeno,
   avísalo, no lo borres. Cada línea cambiada debe venir de la petición.
4. **Demuestra que funciona.** Convierte la tarea en un criterio comprobable
   (una prueba que falla y luego pasa, una captura, la salida de un comando)
   y no la des por terminada sin esa prueba.

## Skills y agentes del proyecto

- **Antes de cualquier trabajo, carga la skill `forma-de-trabajar`**: cómo
  piensa y qué busca el propietario, su listón de calidad y las decisiones
  que ya tomó. Se amplía cada 3 días con lo aprendido (tarea programada) y
  cada vez que él corrige algo.
- Flujo para trabajo nuevo: `brainstorming` → especificación aprobada →
  `writing-plans` → `subagent-driven-development` o `executing-plans`, con
  `test-driven-development`. Detalle y fuentes en
  `docs/agents/SKILLS_GITHUB_2026-10-20.md`.
- Al cerrar un trabajo, sigue las reglas de **Ramas** de esta guía (no se
  usa `finishing-a-development-branch`). El compañero visual de
  `brainstorming` no está instalado: usa texto o capturas.
- `/competencia`: lanza `auditor-codigo`, `critico-juego` y `director-arte`
  en paralelo y compara sus veredictos. El propietario decide.
- Diseño: lee `DESIGN.md` (tokens, legibilidad, cinemáticas, encargos de
  arte) antes de tocar HUD, menús, sprites o efectos. `director-arte` debe
  leerlo siempre.
- `capturas-juego`: para ver el juego real (`node scripts/capture-intro.cjs`
  tras `npm run build`). Úsala antes de opinar sobre algo visual.
- `playwright-cli` (Microsoft): para explorar el juego paso a paso. La orden
  no está instalada; instalarla (`npm install -g @playwright/cli`) o ejecutar
  `npx playwright install` necesita permiso del propietario.
- `industrial-brutalist-ui` (Taste Skill): solo si se llama por su nombre,
  para explorar variantes de menús/HUD tipo telemetría; `DESIGN.md` manda.
