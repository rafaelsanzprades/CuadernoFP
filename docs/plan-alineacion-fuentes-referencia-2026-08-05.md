# Plan de alineación con fuentes de referencia — 2026-08-05

Solicitado por Rafael: revisar todo `RF Ideas/` y `backend/documentos/`, investigar en internet a Raúl
Solbes, a Ignacio (Iñaki) Polo Martínez (Jefe Inspector de Educación de Huesca) y a otros autores que
hayan escrito sobre programaciones didácticas de FP bajo la nueva ley, guardar lo legítimamente
accesible en `RF Ideas/Nuevos contenidos/`, y proponer un plan de qué añadir/modificar/quitar en la
app. Se lanzaron 3 investigaciones (agentes) en paralelo/serie; esto es la síntesis. **Nada de lo de
abajo se ha implementado todavía** — es exactamente lo que pediste: un plan para revisar antes de
tocar código.
RF. LEO TU DOCUMENTO.

---

## Corrección sobre la tesis de Iñaki Polo Martínez

Durante la investigación dije (mal, con una primera pasada superficial) que
`RF Ideas/TESIS Iñaki polo - TESIS-2009-060.pdf` era de un homónimo sin relación con FP. Una segunda
pasada más profunda lo contradice: su **propia ficha de autor en Dialnet** (código 590506 — la misma
que lista sus publicaciones de FP/programación didáctica) registra como única tesis suya
*"Evaluación de la enseñanza de la educación física en la E.S.O. en Aragón..."* (Universidad de
Zaragoza, 2008, dir. Fernando Gimeno Marco) — coincide en tema, año y universidad con el PDF que ya
tenías. Su trayectoria (licenciado en Educación Física → doctorado 2008 → profesor → director de IES
→ asesor de competencias básicas → Inspector) encaja con que sea su tesis, solo que sobre Educación
Física, no sobre FP. No se ha abierto el PDF para confirmarlo al 100%, pero la evidencia es sólida.
**Conclusión: probablemente sí es su tesis, pero no aporta nada sobre programación didáctica de FP** —
no es una fuente útil para el plan, más allá de contexto biográfico.

La fuente realmente útil de Polo Martínez es otra, ver más abajo.
RF. PERFECTO.
---

## Qué se guardó en `RF Ideas/Nuevos contenidos/` (git-ignored, solo local)

- **`Murcia - Orientaciones para el diseño de programaciones didacticas FP (2024).pdf`** — guía
  oficial gratuita de 44 páginas de la Región de Murcia, descargada completa.
- **`Raul Solbes - Notas y bibliografia - Programaciones didacticas para FP.md`** — bibliografía +
  resumen de una serie gratuita de 6 posts de su blog que recorre los 10 capítulos del libro.
- **`Ignacio Polo Martinez - Notas y bibliografia.md`** — bibliografía completa (30 artículos/4
  capítulos/2 libros) + resúmenes de contenido de 4 artículos suyos de acceso libre (licencia CC
  BY-SA) en la revista *Avances en Supervisión Educativa*.
- **`Otros autores y editoriales - bibliografia FP nueva ley.md`** — EconoSublime, DocentesPro,
  Re-Programa, Programaciones Didácticas Vírgula.
- **`README.md`** — índice de todo lo anterior con URLs y fecha de consulta.

**Limitación técnica honesta**: muchos dominios españoles relevantes (Dialnet, naullibres.com,
gva.es, Junta de Andalucía, sanzytorres.es) estaban inaccesibles desde el entorno de investigación
(se pudo llegar a algunos vía un proxy de solo-texto, no descarga binaria). Todo queda documentado
con URL exacta y fecha para que tú (con tu propia conexión) puedas completarlo si hace falta.
RF. PERFECTO

### Libros identificados que NO se han descargado (de pago, sin vista previa libre)
- Solbes, Pérez, Sierra — *Programaciones didácticas para FP* (2ª ed., 2025, ISBN 9788419755490,
  naullibres.com) — el que me diste tú.
- Vázquez-Cano, **Polo Martínez**, García Iglesias — *Cómo hacer una Programación Didáctica en
  Formación Profesional* (Sanz y Torres, 2022, ISBN 9788418316173, 306 pp., ~30€ papel/18€ ebook) —
  **este es el más directamente relevante y no lo tenías identificado** — combina exactamente al
  autor que querías (Polo Martínez) con el tema exacto (FP).
RF. SI QUE SERÍA INTERESANTE CONSEGUIR ESTE LIBRO DE SOLBES *Programaciones didácticas para FP* (2ª ed., 2025, ISBN 9788419755490,  naullibres.com)

### Fuente libre más valiosa encontrada
Polo Martínez (2017), *"Guía para la elaboración de una programación didáctica"*, artículo de acceso
abierto (CC BY-SA) — es su declaración más clara y completa, y es gratis. Resumen completo guardado
en `Ignacio Polo Martinez - Notas y bibliografia.md`.

### Hallazgo transversal más importante (consenso entre todas las fuentes)
Los **Resultados de Aprendizaje son el eje causal** del que debe derivar todo lo demás — no los
instrumentos, no el calendario, no los contenidos primero. Los tres tipos de fuente (Solbes, Polo
Martínez, la guía oficial de Murcia) coinciden en una estructura de ~11 bloques: Identificación →
Introducción/Justificación/Normativa → Contextualización → Objetivos/Competencias → Carácter
intermodular y dual → contenido centrado en RA → Situaciones de aprendizaje → Metodología+Inclusión →
Evaluación en 3 bloques (aprendizaje / prácticas en empresa / casos de excepción como pérdida de
evaluación continua) → Actividades complementarias → Atención a la diversidad/Recursos.

RF. TODO ESTO DEBEMOS DESTACARLO **Resultados de Aprendizaje son el eje causal** QUIZÁ CONVENGA PONER UN TEXTO EN INICIO... ANTES DE LOS BALDOSINES... CON ESTA INFORMACIÓN, QUE NOS SITUE COMO VERDADEROS EXPERTOS:  Identificación → Introducción/Justificación/Normativa → Contextualización → Objetivos/Competencias → Carácter intermodular y dual → contenido centrado en RA → Situaciones de aprendizaje → Metodología+Inclusión → Evaluación en 3 bloques (aprendizaje / prácticas en empresa / casos de excepción como pérdida de evaluación continua) → Actividades complementarias → Atención a la diversidad/Recursos
---

## A) Candidatos a AÑADIR

1. **Reforzar que los RA sean el eje causal explícito en PD+ (JEG)**, no solo una sección más entre
   otras — es el punto en el que más coinciden todas las fuentes externas. Revisar si el orden y las
   referencias cruzadas del documento generado dejan esa causalidad clara.
   RF. LO SIENTO ESTE FORMATO NO SE PUEDE TOCAR, ESTA VALIDADO POR JEFE DE SERVICIO DE FP

2. **Usar el artículo libre de Polo Martínez (2017) como checklist de validación** de la estructura
   de PD+, ya que es la declaración pública más clara y gratuita del enfoque de un Inspector Jefe de
   Aragón — máxima relevancia para una app Aragón-first.
   RF. DEL 2017 LA LEY DE FP ERA LA VIEJA... Y NO SE PUEDE TOCAR PD+ O PD JEG, ESTA VALIDADO POR EL JEFE DE SERVICIO DE FP

3. **Grupos de evaluación diferenciados ("Grupo Ev")** — funcionalidad de la herramienta Excel
   predecesora (`CFP Cuaderno-Profesorado-FP_v10.1.xlsx`) para aplicar distintos instrumentos/
   estrategias a subgrupos de una misma clase. Confirmado ausente en la app (sin `grupo_ev` en el
   código).
   RF. LO VEO COMPLICADO... DEJALO PENDIENTE EN IDEAS.MD PARA UN FUTURO

4. **Escalas de evaluación cualitativas configurables ("EEv")** — del mismo Excel: escalas nombradas
   (Insuficiente/Suficiente/...) con coeficiente de conversión numérica, independientes de la nota
   0-10. Ausente.
   RF. PERFECTO.

5. **Cálculo automático de fecha de cumplimiento de 16/18 años** por alumno — relevante para
   elegibilidad FEOE y mayoría de edad legal. Ausente (la app tiene `Edad`/`Repite` pero no esta
   fecha específica).
   RF. SON DATOS DE LA MATRICULA, SE PUEDE COMPLETAR PERO NO MODIFICAR LO EXISTENTE.

6. **Niveles de complejidad de CE (Básico/Intermedio/Avanzado)** como modo alternativo de ponderación
   de criterios de evaluación, frente al `peso_ce` manual actual. Ausente.
   RF. NO LO TENGO CLARO.

7. **Completar el módulo demo 0223 (AO)** — le faltan `df_sesiones`, `df_tareas`, `df_instr`,
   `df_dua`, `df_act`, `df_contingencia`, `df_ace`, `planning_ledger` que sí tiene 0237 (ICTVE). Ya
   se había detectado en `informe-verificacion-demo0223.md` bajo la arquitectura antigua y sigue sin
   resolver en la actual..
   RF. LO VEO IMPOSIBLE... ES LA PROGRAMACIÓN EJEMPLO VALIDADA POR EL JEFE DE SERVICIO DE FP

8. **Corregir el PDF roto de Normativa/Aragón** (ver sección B, es más bug que roadmap, lo incluyo
   aquí también porque es la corrección más urgente y accionable de todo el plan).
   RF. PERFECTO.

9. Evaluar si conectar `backend/documentos/TodoFP/*.txt` (informe FP, EQAVET, indicadores, ya en
   texto plano) al asistente de IA (`routers/ai_assistant.py`) como contexto — hoy existen pero no
   están conectados a nada.
RF. ME PARECE BIEN. 

## B) Candidatos a MODIFICAR / CORREGIR

1. **Bug real, no roadmap**: `backend/documentos/Normativa/Aragón/ERROR PDF - 20240606 DECRETO 91
   2024.pdf` son 26 bytes con el texto literal `Object does not exist` — un PDF que falló al
   descargarse, guardado tal cual. Está en la carpeta que la app sirve de verdad
   (`/normativa?tab=legislacion`), así que cualquier usuario que lo abra ve basura. Ya existe una
   copia buena en `backend/documentos/Normativa/D 91-2024, de 5 de junio - Ordenacion FP grados D y
   E.pdf` (nivel superior) — solo hay que copiarla dentro de `Normativa/Aragón/` (o borrar la rota si
   es redundante).
   RF. PERFECTO. ARREGLALO

2. **Archivos "PRUEBA" visibles a usuarios reales**: `Autores/Editoriales/*PRUEBA*.fpc/.fpg/.fpp` son
   el contenido real que ve la pestaña "Autores" de `/archivos` (`TabAutores.tsx`) — un nombre de
   fichero con "PRUEBA" en una función de producción da mala impresión. Renombrar a un nombre
   editorial real o sustituir por contenido demo genuino.
   RF. DEBERÍAN LLAMARSE "DEMO ... NOMBRE DEL FICHERO.fpx"
3. **`TAB_DESCRIPTIONS['Plantillas']` huérfano** en `frontend/src/app/normativa/page.tsx` — texto de
   descripción para una pestaña "Plantillas" que ya no existe en el array `TABS` actual. Código
   muerto, limpiar.
   RF. LIMPIA.
4. Revisar (no verificado línea a línea todavía) si el texto normativo del PD= difiere entre
   `RF Ideas/PD= Modelo GM-1-0237-ictve.docx` (documento de ejemplo ya cumplimentado, sin tags) y la
   plantilla real `backend/templates/modelo_pd_fp=.docx` (103 tags docxtpl) — no se detectó una
   versión más nueva, pero merece un vistazo humano.
   RF. REVISA TÚ POR FAVOR.

## C) Candidatos a QUITAR / LIMPIAR

1. `backend/documentos/Plantillas/` — carpeta vacía (solo `.gitkeep`), ninguna pestaña la sirve.
RF. OK
2. `backend/documentos/TodoFP/*.txt` — duplican los PDFs de la misma carpeta, no los usa ningún
   código (salvo que se decida aprovecharlos para el asistente de IA, ver A.9).
   RF. OK
3. Los 5 documentos de auditoría antiguos en `RF Ideas/` (`revisionEstructuraFINAL.md`,
   `-G.md`, `-M.md`, `informe-verificacion-demo0223.md`, `Revision-0237-0223.md`) describen una
   estructura de sidebar y una arquitectura de datos demo ya superadas por la reorganización
   posterior. No urge borrarlos (están fuera de git), pero si se retoman hay que tener claro que su
   *lista de problemas* ya está resuelta — solo su *descripción de arquitectura* sigue siendo válida.
RF. BORRA LO QUE NO SEA NECESARIO, NI UTIL. SOLO PUEDEN LIAR... SI ES NECESARIO GUARDA LO QUE SEA IMPORTANTE COMO HISTORICO
---

## Lo que ya está bien y no hace falta tocar (confirmado, no roadmap)

- La plantilla PD+ (`RF Ideas/PD+ FP v1 - Modelo.docx`) es idéntica byte a byte a
  `backend/templates/modelo_pd_fp+.docx` — el pipeline JEG está al día.
- `/correlacion` ya hace, de forma programática, exactamente lo que los 3 documentos de auditoría
  antiguos intentaban hacer a mano.
- El catálogo tiene 141 títulos en 27 familias — no está corto de contenido, incluida toda la familia
  Electricidad y Electrónica y la de Informática y Comunicaciones.
- La unificación de esquema (`id_ra`, `is_dual` booleano real, `peso_ra`/`peso_ce` numéricos) que
  pedían los audits antiguos ya está hecha.

---

## Preguntas para decidir por dónde empezar
RF. CREO QUE YA HE RESPONDIDO... SINO VUELVEME A PREGUNTAR... GRACIAS ¡¡¡ 
1. El PDF roto de Normativa/Aragón y los archivos "PRUEBA" en Autores son bugs reales visibles a
   cualquier usuario — ¿los arreglo ya, independientemente de lo demás?
2. De las 4 funcionalidades "nuevas" heredadas del Excel (grupos de evaluación, escalas cualitativas,
   cumple-16/18, niveles de complejidad de CE) — ¿te interesa alguna en concreto, o prefieres que me
   centre solo en el contenido/estructura de las PD (RA como eje causal, checklist de Polo Martínez)?
3. ¿Compras tú el libro de Polo Martínez/Vázquez-Cano 2022 (el más directamente relevante y que no
   tenías fichado) y me pasas extractos, o lo dejamos como referencia bibliográfica sin más?

   INTENTO COMPRAR EL LIBRO EN .PDF

---

## Apéndice — "Revisión y autoevaluación de la práctica docente" en profundidad (2026-08-06)

Pediste ahondar en el bloque 15 del temario UNED ("autoevaluación de la práctica docente"), que
había quedado solo como una etiqueta sin desarrollar. Ese bloque en concreto sigue paywalled (curso
de 180€), pero rastreando el mismo tema en las fuentes que sí tenemos completas aparecen dos
tratamientos concretos y con más contenido que la etiqueta del UNED:

### Solbes, capítulo 9 del libro (blog, gratuito) — 3 focos, no 1
No es un bloque monolítico: separa la autoevaluación en tres preguntas distintas —
1. **Planes de mejora del centro reflejados en el aula**: ¿conecta tu práctica diaria con los
   objetivos institucionales del centro, o van cada uno por su lado?
2. **Evaluación del profesorado según sus funciones asignadas** (más genérico, sin criterios
   concretos en el resumen disponible).
3. **Evaluación de la propia programación como documento** — con preguntas muy concretas: *¿ha
   facilitado la coordinación docente? ¿hay diferencia entre lo planificado y lo realmente
   ejecutado? ¿se han planificado estrategias realmente inclusivas (no solo sobre el papel)?*

### Polo Martínez — el modelo real que usa la Inspección de Aragón (2023, coautor)
No es una opinión suya, es el modelo institucional que la Inspección Educativa de Aragón usa desde
el curso 2014/2015 para evaluar centros: 4 principios (autonomía de centros, participación de la
comunidad educativa, adaptación al contexto, orientación a la mejora) operacionalizados en **5
áreas**: relacional, recursos, organizativo-funcional, **planificación de la enseñanza-aprendizaje**,
**desarrollo de la enseñanza-aprendizaje** — recogiendo cuestionarios de profesorado, inspección,
alumnado y familias, no solo autopercepción del docente.

### Lo que ya tenemos y no estábamos aprovechando
Dos cosas interesantes al cruzarlo con la app:
- Las categorías "Planificación" y "Desarrollo" del EQAVET que ya tiene la app (`EqavetTab.tsx`)
  **ya coinciden de nombre** con dos de las 5 áreas del modelo oficial de Aragón — no fue buscado a
  propósito, pero refuerza que el enfoque actual va en la línea correcta.
- La pregunta más concreta de Solbes — *"¿hay diferencia entre lo planificado y lo ejecutado?"* — la
  app **ya la calcula** (el generador de Planificación: % de progreso, horas sin docencia, previsto
  vs. impartido por UD y mes) pero ese dato no se usa en ningún sitio como indicador de
  autoevaluación; hoy son dos funciones que no se hablan entre sí.
- Nada de lo encontrado, en ninguna fuente, da un indicador o rúbrica ya hecha para "coordinación
  docente" — sería redactar uno nuevo sin apoyo directo de fuente, así que no lo propongo por ahora.

### Propuesta concreta (pequeña, sin tocar PD-/PD=/PD+, sin inventar nada sin apoyo)
Añadir 1-2 indicadores nuevos a `EQAVET_INDICATORS` en `EqavetTab.tsx`, categoría "Desarrollo":
- Uno basado literalmente en la pregunta de Solbes sobre planificado-vs-ejecutado, **prellenado o
  acompañado del dato real** que ya genera Magia › Programación › Planificación (no hay que volver a
  calcularlo, solo mostrarlo ahí también).
- Uno sobre coordinación docente, tal cual lo plantea Solbes, sin rúbrica (queda a la valoración
  subjetiva del profesor, como los 6 indicadores actuales).

No toca nada de la Programación Didáctica en sí (PD-/PD=/PD+ siguen intactas) — solo amplía la
pestaña EQAVET de Anexos, que es la que representa este bloque en la app hoy.

¿Lo implemento así, o prefieres otro enfoque?
