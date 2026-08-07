# Backlog unificado (ideas + pendientes)

Fichero único que fusiona lo que antes estaba repartido en `docs/IDEAS.md` (backlog general) y
`docs/pd-plus-pendientes.md` (pendientes de alineación PD+), más los hallazgos accionables de
`RF Ideas/Nuevos contenidos/Alcantara-Alabort - Notas y bibliografia.md` con las respuestas de
Rafael anotadas directamente en ese fichero ("RAFA. ..."). Cada ítem indica su origen. Actualizado
2026-08-07.

Orden: de más fácil a más complejo, para ir acometiéndolos en ese orden. "Fácil/Medio/Complejo" es
una estimación de esfuerzo de implementación, no de importancia.

---

## 0. Ya confirmado, sin trabajo pendiente

- **Ponderación RA/CE que suma 100%** — Alcántara/Alabort describen `peso_ra` sumando 100% entre
  RA del módulo y `peso_ce` sumando el % del RA dentro de cada RA. Rafael preguntó "¿esto lo
  tenemos, verdad?" → **Sí**, son los campos `peso_ra`/`peso_ce` ya existentes (confirmado en
  CLAUDE.md y en el propio código). No hay nada que hacer aquí, queda documentado para no
  reabrirlo.
- **4 niveles de objetivos / cruce UD↔objetivos generales del título** — ya cubierto por
  `RaOgMatrix.tsx` / `objetivosGenerales` en `curriculum.ts`. Confirmado por Rafael ("Sí, es un
  aporte interesante" — como convergencia, no como hueco).
- **Grados A–E (LO 3/2022)** — Rafael: "esto lo tenemos, los % no proceden aquí". Cerrado.

---

## 1. ✅ [Fácil] Revisar referencias bibliográficas del checklist de marco normativo

*Origen: Alcántara-Alabort, bloque 3. Rafael: "revisa las referencias bibliográficas, entiendo que
estará todo bien".*

Hecho 2026-08-07. Contrastado el checklist normativo del libro contra `backend/documentos/Normativa/`
(que es lo que sirve `/normativa`). Están: LOE/LOMLOE, LO 3/2022, RD 659/2023, RD 69/2025, decreto de
ordenación FP de Aragón (D 91-2024), currículos CFGB/CFGM/CFGS (O ECD-841/842/843-2024), orden de
intervención educativa inclusiva. **Faltan** 4 categorías autonómicas que el libro pide y no hay
fichero para ellas: ley de educación de Aragón, instrucciones de inicio de curso, decreto/orden de
organización de centros, orden de evaluación de Aragón. No se han buscado/añadido los PDF reales —
hace falta que Rafael aporte los enlaces oficiales (no se generan URLs de normativa sin confirmar).

## 2. ✅ [Fácil] Bugs de campo en PD+ (JEG) — resultó ser código muerto, no un bug real

*Origen: `docs/pd-plus-pendientes.md` §1 (ahora corregido tras inspeccionar la plantilla).*

Comprobado 2026-08-07 inspeccionando `modelo_pd_jeg_tpl_final.docx` directamente: la plantilla JEG
**solo usa** `ud1_titulo`..`ud10_titulo` (por eso `range(1, 11)` SÍ es correcto ahí, cubre justo las
10 UD que la plantilla soporta — no es el mismo caso que PD=, donde la plantilla sí tenía slots hasta
ud11). Los campos `ud{{i}}_ra{{j}}`, `ud{{i}}_ev`, `ud{{i}}_horas`, `ud{{i}}_num`, `ud{{i}}_nombre`,
`ra{{i}}_titulo`, `ra{{i}}_texto` que `_build_context` calcula con `pct_ra{{j}}`/`ev_ud` **no aparecen
en ningún sitio de la plantilla** — es código que se ejecuta pero cuyo resultado nunca se usa. No
hay nada que corregir porque no hay ningún efecto visible que arreglar; se deja documentado para no
reabrirlo, y como aviso de que las notas sobre PD+ escritas sin haber abierto antes su plantilla real
pueden estar equivocadas (como pasó aquí).

## 3. ✅ [Fácil] Cablear en PD+ los campos de texto que ya existen

*Origen: `docs/pd-plus-pendientes.md` §2.*

Hecho 2026-08-07, solo contenido, plantilla JEG sin tocar:
- `otros_recursos` (sí existe en la plantilla) mostraba los ids codificados en crudo de
  `recursos_espacios` (p. ej. "REC-EPI") — ahora se resuelve a su etiqueta legible con
  `helpers_catalogo.resolve_recursos()` (el diccionario `RECURSOS_LABELS` se movió de
  `generador_pd_suficiente_tpl.py` a `helpers_catalogo.py` para compartirlo entre PD= y PD+ en vez
  de duplicarlo).
- `bibliografia` (sí existe en la plantilla) ahora prefiere `textos_pd_bibliografia` sobre el
  huérfano `G3_bibliografia` — y `textos_pd_bibliografia` por fin tiene input real
  (`PlanesTab.tsx` → nueva sección "Bibliografía", mismo patrón `NarrativeField` que "Coordinación
  docente"). Antes existía en el esquema/whitelist pero ninguna pestaña lo escribía nunca.
- **Corrección sobre la nota original**: `textos_pd_metodologia_labor_coordinada` no tiene ningún
  placeholder en la plantilla JEG (comprobado, no estaba en las notas anteriores porque no se había
  inspeccionado la plantilla) — no hay nada que cablear con ese campo en PD+, solo se usa en PD=.
- `recursos_multimedia`/`software_nombre` (fallback a `G2_herramientas`) y `ubicacion_recursos`/
  `tipo_equipos` (fallback a `G1_infraestructuras`) **quedan sin tocar** — sí existen en la
  plantilla, pero repartir `recursos_espacios` entre estos 4 campos distintos requeriría filtrar por
  categoría (Espacios/Equipamiento vs. Software y TIC) y el catálogo actual solo expone id→etiqueta,
  no categoría, desde Python. Tarea aparte si se quiere abordar (añadir categoría a
  `RECURSOS_LABELS` o construir un mapa `id → categoría`).

## 3. [Fácil] Cablear en PD+ los campos de texto que ya existen pero no se leían

*Origen: `docs/pd-plus-pendientes.md` §2.*

`generador_pd_jeg.py` hace fallback a claves huérfanas `G1_infraestructuras`/`G2_herramientas_tic`/
`G3_bibliografia` (nadie las escribe desde ninguna pestaña). Sustituir por los campos reales creados
esta sesión — solo contenido, no toca la plantilla:
- `recursos_espacios` (con el diccionario `RECURSOS_LABELS`, que habría que mover a un sitio
  compartido si se usa desde dos generadores en vez de duplicarlo).
- `textos_pd_metodologia_labor_coordinada` (ya tiene UI en `PlanesTab.tsx` → "Coordinación
  docente").
- `textos_pd_bibliografia` — de los 16 campos "textos narrativos PD" del `ALLOWED_PROGRAMACION_KEYS`,
  es el único candidato natural para sustituir `G3_bibliografia` que **todavía no tiene input en
  ninguna pestaña** — hay que dárselo primero (tarea pequeña, mismo patrón que "Coordinación
  docente").

## 4. [Fácil-Medio] Rúbrica de evaluación de la práctica docente, enriquecida, en EQAVET

*Origen: Alcántara-Alabort, bloque 12. Rafael: "absolutamente copiable... (por favor, con
elegancia... que no se note)".*

El libro trae una autoevaluación docente resuelta con 6 criterios ponderados (20% cumplimiento de
la programación, 15% atención al alumnado, 15% rendimiento estudiantil, 15% organización de
recursos en aulas/talleres, 15% metodologías, 20% satisfacción del alumnado), 5 bandas de
puntuación por criterio (Sobresaliente 100–90 → Insuficiente 49–0). La app ya tiene `EqavetTab.tsx`
cubriendo este territorio (indicadores por Planificación/Desarrollo/Resultados, modelo DOCENTIA-UO).
Tarea: adaptar/enriquecer los indicadores y bandas existentes con esta estructura de pesos y bandas,
redactado con vocabulario propio (no como cita literal del libro).

## 5. [Medio] Campos adicionales de contextualización/tutoría (ratio, ACNEAE, etc.)

*Origen: Alcántara-Alabort, bloque 4. Rafael: "podemos añadir unos campos adicionales en Tutoría...
en `C:\GD-rsp\APP-EntidadIES` tengo cosicas de orientación que van en esa línea... quizá podamos
traer 'parte'... no todo".*

El checklist de contextualización del libro pide documentar: ratio (con desglose hombres/mujeres),
nº de repetidores, nº de inmigrantes (origen + barrera lingüística), nº de pendientes del módulo,
alumnado ACNEAE — con un ejemplo de adaptación individual nombrada y ubicada. Alcance de esta
tarea: los campos de contextualización propios de FP (ratio, repetidores, pendientes, ACNEAE) se
pueden añadir ya, en la pestaña que corresponda (Tutoría o Contexto). La parte de "traer cosicas de
`APP-EntidadIES`" es un proyecto totalmente aparte (gestión de centro, no de aula) — **no explorar
ni tocar ese directorio todavía**; cuando Rafael concrete qué "parte" quiere traer de ahí, se hace
como tarea propia.

## 6. [Medio] Propuesta: umbral de recuperación en convocatoria extraordinaria (<5 vs ≥5 RA)

*Origen: Alcántara-Alabort, bloque 12. Rafael: "aquí también... propuesta". Ver también
`RF Ideas/referencia/11-13-curso-JJ-M04-evaluacion-calificacion-*.md` (evaluación y calificación,
3 partes) como contraste de qué dicen otras fuentes sobre este procedimiento.*

El libro bifurca la recuperación extraordinaria: **&lt;5 RA pendientes** → se amplían plazos y se
repiten solo pruebas objetivas/prácticas de los RA no superados; **≥5 RA pendientes** → una
actividad + una práctica + una prueba objetiva que cubre todos los criterios mínimos de todos los
RA no superados. Pendiente de propuesta concreta: ¿se modela como lógica automática en los
generadores de PD (texto que cambia según el nº de RA pendientes calculado de los datos), o como
texto libre editable con esta regla como valor por defecto? Antes de proponer, mirar si
`generador_pd_*` ya tiene algo de la sección de convocatoria extraordinaria que se pueda extender.

## 7. [Medio] Propuesta: instrumento de evaluación vs. instrumento de calificación

*Origen: Alcántara-Alabort, bloque 12. Rafael: "aquí necesitaré una propuesta". Ver
`RF Ideas/referencia/25-modelo-instrumento-evaluacion.md` y los instrumentos IED
(`39-instrumento-examen-IED.md`, `40-instrumento-tareas-likert-IED.md`,
`41-instrumento-autoevaluacion-rubrica-IED.md`, `42-instrumento-defensa-likert-IED.md`) como
ejemplos reales ya trabajados por Rafael, y `38-TFM-RSP.md` (su propio TFM sobre PD) como posible
fundamento de la propuesta.*

El libro modela, por cada CE, dos cosas distintas en columnas separadas: el "instrumento de
evaluación" (qué actividad/prueba genera la evidencia) y el "instrumento de calificación" (la
rúbrica que la puntúa). La app hoy tiene un único campo `Instrumento` por CE/Tarea. Antes de tocar
el esquema de datos, hace falta una propuesta concreta (¿separar en dos campos? ¿es una
simplificación intencionada que conviene mantener?) — se retomará con una propuesta escrita cuando
le toque el turno en este backlog.

## 8. [Medio] Desglose de horas teoría/tareas/taller por UD y por sesión

*Origen: Alcántara-Alabort, contraste final #1.*

`UnidadDidacticaSchema` solo tiene `horas_ud: number` y `SesionSchema` solo tiene un `Horas` + un
`Tipo_Actividad` de texto. El libro desglosa cada UD en **H. Total / H. Teoría / H. Tareas / H.
Taller** y cada sesión con un reparto en % (desarrollo/tarea/práctica). Muy relevante para módulos
de taller. Implica: cambio de esquema (`frontend/src/types/index.ts`), UI en la pestaña de
UD/Sesiones, añadir los campos a `ALLOWED_PROGRAMACION_KEYS` (si no, se pierden al exportar/guardar
por la regla de whitelist), y decidir si se refleja en algún generador de PD.

## 9. [Medio] Página de previsión de planificación en PD-, PD= y PD+

*Origen: `docs/IDEAS.md` (nota previa, 2026-08-06). "Estoy pensando añadirla" — no es una petición
cerrada.*

Añadir al final de los documentos (PD- como página nueva, PD=/PD+ donde encaje) una página con la
previsión tipo "Planificación mensual" (`PlanificacionMensualTab.tsx` / `useDynamicPlanning`): UD ×
mes con horas previstas/impartidas. Si se hace, debe llevar la misma aclaración de estimación
proporcional a festivos que ya está bajo la tabla en `/agenda?tab=planificacion` y en la FAQ.
Reutiliza lógica ya existente (`planningGenerator.ts`); el trabajo real es construir la sección en
cada uno de los 3 generadores.

## 10. [Medio-Complejo] Indicador de "presupuesto de páginas" en el flujo de generación de PD

*Origen: Alcántara-Alabort, contraste final #5.*

El consejo más repetido del libro, bloque tras bloque, es un límite explícito de nº de páginas por
sección (los tribunales de oposición penalizan la extensión). Hoy no hay ningún aviso tipo "vas por
N páginas, el máximo recomendado es M" en el flujo de redacción/generación (`/magia`). Es un hueco
de UX, no de modelo de datos — pero requiere decidir cómo estimar páginas (¿generar el docx real y
contar, o una heurística por caracteres/tabla?) antes de poder implementarlo.

## 11. [Complejo] Evaluación del RA desarrollado en la empresa (fase dual/FCT)

*Origen: Alcántara-Alabort, bloque 12. Rafael: "aquí también... propuesta".*

Flujo estructurado y distinto al resto: definir el RA a observar en empresa → traducir sus CE en
indicadores observables → construir una rúbrica/guía de evidencia para el tutor de empresa → recoger
evidencias del alumnado (memoria de prácticas, diario, autoevaluación) → el tutor del centro emite
una valoración conjunta combinando la rúbrica de empresa con la aportación cualitativa. No es solo
"coordinarse con la empresa" (que ya cubre FEOE) — es un instrumento de evaluación propio. Pendiente
de propuesta: cómo encaja con `FeoeItem`/pestaña FEOE existente, si necesita su propio dataframe.

## 12. [Complejo] Calendario escolar anual de una sola vista (con sesiones reales del Diario)

*Origen: Alcántara-Alabort, bloque 5 + contraste final #4. Rafael: "tenemos algo así en
Seguimiento, Diario... o similar... falta por incorporar las sesiones reales y hacer eso" / "genera
la app un calendario... pero sí, sería mejor una vista en la app".*

El libro incluye una parrilla completa septiembre→julio, día a día, codificada por UD/festivo/
periodo de evaluación/Semana Santa/Navidad — más densa y continua que la Planificación mensual
actual (que es por mes). Rafael confirma que la app ya genera "un calendario" en algún sitio, pero
falta: (a) una vista de este tipo dentro de la app (no solo exportado), y (b) que incorpore las
sesiones REALES ya registradas en Diario de aula/Seguimiento, no solo la previsión. Requiere
diseño de vista nueva + cruce de datos entre `planningGenerator.ts` y el registro real de sesiones.

## 13. [Complejo] Nueva pestaña "Contenidos → UD" + PDF independiente

*Origen: Alcántara-Alabort, bloque 5. Rafael: "hay que crear esta pestaña y crear también su .pdf
independiente. Luego veremos si lo ponemos en PD=... PD+ es un formato cerrado por el Jefe del
Servicio de FP en Aragón y no quiero tocarlo".*

El libro construye de forma incremental una tabla `Bloque de contenidos | Contenidos por UD | RA |
Obj | Nº horas | EVAL.` que en el bloque 9 se convierte en la tabla de relación completa usada para
derivar el registro de sesiones. Tarea en dos fases: (1) nueva pestaña en la app con esta tabla, (2)
generador de PDF independiente para esa tabla sola. Solo después de eso, decidir si se integra
también dentro de PD= (no tocar PD+ estructuralmente).

---

## Aparcado / sin decidir (no priorizar todavía)

- **Grupos de evaluación diferenciados ("Grupo Ev")** — de la herramienta Excel predecesora
  (`CONF_ALUM`/`CONF_EV`). Rafael: "lo veo complicado, para un futuro". Sin fecha.
- **Niveles de complejidad de CE (Básico/Intermedio/Avanzado)** — alternativa a `peso_ce` manual.
  Rafael: "no lo tengo claro". Ni aprobado ni descartado.
- **Traer "parte" de `APP-EntidadIES`** para campos de tutoría/orientación — ver punto 5. Explorar
  solo cuando Rafael concrete qué quiere traer.

## PD+ (JEG): recordatorio de alcance

Cualquier cambio de **contenido/datos** en `generador_pd_jeg.py` (puntos 2 y 3 de este backlog) es
seguro. Cualquier cambio de **formato/estructura de la plantilla** (`modelo_pd_jeg_tpl_final.docx`
— nuevas secciones, tablas dinámicas de RA/UD, sección de CE por RA como en PD=) requiere
confirmación explícita de Rafael antes de tocarlo, porque el formato está validado por el Jefe de
Servicio de FP de Aragón.
