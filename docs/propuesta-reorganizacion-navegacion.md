# Propuesta de reorganización de navegación — 2026-08-02

Plan de reestructuración solicitado por Rafael: 4 bloques × 3-5 páginas × 3-5 pestañas, orden de
entrada de datos alineado con el documento PD+ (JEG), sin ningún "asunto" repartido entre dos
pestañas o páginas distintas, campos de texto largo dimensionados según el volumen real del
documento de referencia, y nombres de pestaña de 2-3 palabras tomados del vocabulario del PD+.

**Esto es solo el plan — no se ha tocado código.** Cada sección indica el nivel de confianza de la
evidencia (comprobado leyendo el componente real vs. inferido por el nombre).

---

## 1. Diagnóstico: inventario real (no supuesto)

Extraído de `config/navigation.ts` + el `PAGE_TABS` que ya construimos en `/inicio?tab=mapa`, más
lectura directa de cada componente para los casos dudosos.

| Bloque | Páginas actuales | Pestañas por página | ¿Cumple 3-5 / 3-5? |
|---|---|---|---|
| **Grupo** | Archivos, Catálogo, Normativa, Magia | 5 / 5 / 4 / 5 | ✅ páginas (4) — ⚠️ 3 páginas rozan el máximo de pestañas |
| **Programación** | Contexto, Currículo, Metodología, Instrumentos | 4 / 5 / 5 / 4 | ✅ |
| **Curso** | Calendario, Alumnado, Seguimiento, Calificaciones | 4 / 3 / 4 / **6** | ⚠️ Calificaciones se pasa de pestañas |
| **Anexos** | Mejora | **2** | ❌ 1 sola página (necesita 3-5); Mejora por debajo de 3 pestañas |
| *(fuera de bloque)* | Inicio, Agenda, Informes, Legal | 7 / 2 / 1 / 4 | Inicio se pasa; Informes/Legal sin bloque |

**Conclusión:** el único bloque que incumple de verdad el "3-5 páginas" es **Anexos** (1 sola
página). El resto de bloques ya está en rango de páginas; el ajuste fino es de pestañas sueltas.

---

## 2. Hallazgo no buscado: dos duplicaciones reales de "asunto"

Antes de proponer dónde debe vivir cada cosa, hace falta resolver que algunas cosas **ya viven en
dos sitios a la vez** — exactamente lo que pediste evitar. Verificado leyendo el código, no por
nombre:

### 2.1 `/informes` es una copia byte a byte de `/magia?tab=curso` — confirmado
Ambos ficheros (`app/informes/page.tsx` y la pestaña "Curso" de `app/magia/page.tsx`) contienen el
mismo JSX literal: las mismas 3 tarjetas (PDF Calendario/Alumnado, PDF Seguimiento/Clases por UD,
Boletines grupales trimestrales con los mismos inputs de fecha de corte). No son "parecidas": es el
mismo bloque de código pegado dos veces. **Recomendación: eliminar la página `/informes` entera** y
dejar `Magia → Curso` como el único sitio para generar documentos del curso — ya vive en el
bloque Grupo junto a la generación de la Programación (Magia), que es justo la relación natural
(Magia = "generación de documentos", tanto de Programación como de Curso).

### 2.2 Contenido narrativo repetido en 3-4 sitios distintos
Detectado ayer noche mientras arreglaba el generador PD+, pero con más alcance del que documenté
entonces. Cada fila es el mismo "asunto" real, escrito por duplicado en componentes distintos:

| Asunto | Aparece en | Campo |
|---|---|---|
| Entorno geográfico | `ContextoTab` (Contexto→Entorno) | `config_contexto.entorno_geografico` |
| Entorno socioeconómico | `ContextoTab` (Contexto→Entorno) | `config_contexto.entorno_socioeconomico` |
| Contexto escolar | `ContextoTab` (Contexto→Entorno) | `config_contexto.contexto_escolar` |
| **Infraestructura** | `ContextoTab` (Contexto→Entorno) | `config_contexto.infraestructura` |
| **Infraestructura** *(2ª vez)* | `EvaluacionRecursosTab` (Metodología→Evaluación) | `config_contexto.G1_infraestructuras` |
| **Bibliografía** | `ContextoTab` (Contexto→Entorno, campo del PD+ real) | `textos_pd_bibliografia` |
| **Bibliografía** *(2ª vez)* | `EvaluacionRecursosTab` (Metodología→Evaluación) | `config_contexto.G3_bibliografia` |
| **Recuperación** | `ProcedimientosTab` (Contexto→Procedimientos, campo del PD+ real) | `textos_pd_eval_recuperacion` |
| **Recuperación** *(2ª vez)* | `EvaluacionRecursosTab` (Metodología→Evaluación) | `config_contexto.E5_recuperacion` |
| Contingencia profesorado/alumnado | `ContingenciaTab` (Metodología→Contingencia) | `config_contexto.contingencia_profesor/alumnado` |
| Contingencia *(2ª vez, ya no se usa)* | *(componente huérfano, eliminado anoche)* | `textos_pd_contingencia_*` |

`EvaluacionRecursosTab` (la pestaña "Evaluación" de Metodología) es la que más solapa: 3 de sus 4
campos de texto largo ya existen en otra pestaña con más sentido temático. Los campos con prefijo de
letra suelta (`E5_`, `G1_`, `G2_`, `G3_`) tienen pinta de venir de un borrador anterior con secciones
A-J que ya no existe en ningún otro sitio del código — probablemente el origen real de todos estos
duplicados: cada reconstrucción de una pantalla volvió a crear el campo en vez de reutilizar el que
ya existía.

**Recomendación:** vaciar `EvaluacionRecursosTab` de sus 4 textareas largas (recuperación,
infraestructura, TIC, bibliografía) y dejar solo lo que es genuinamente suyo — los checkboxes de
Instrumentos y Recursos/espacios seleccionables (`instrumentos_seleccionados`, `recursos_espacios`),
que no están duplicados en ningún otro sitio. El resto del contenido de esa pestaña se **fusiona**
en `ProcedimientosTab` (recuperación) y `ContextoTab` (infraestructura, TIC, bibliografía) — donde ya
vivían.

*(No he auditado el resto de la app en busca de más duplicados de este tipo — esta lista sale de
revisar los componentes que ya tenía abiertos esta sesión. Antes de implementar, convendría un barrido
específico: buscar todas las claves `config_contexto.*` usadas en más de un componente.)*

---

## 3. Propuesta de reagrupación de bloques

El orden macro Grupo → Programación → Curso → Anexos ya sigue una secuencia natural (preparar el
entorno → diseñar el plan teórico [PD+] → vivirlo con alumnado real → cerrar/consultar) y no lo
tocaría. El ajuste es dentro de cada bloque.

### Grupo (se queda en 4 páginas)
Archivos · Catálogo · Normativa · Magia — sin cambios. Es la única agrupación que no tiene relación
directa con el orden interno del PD+ (son herramientas transversales), así que no hay "orden PD+"
que aplicar aquí; el orden actual (gestión de ficheros → consulta de currículo oficial → consulta de
normativa → generación de documentos) ya es una secuencia lógica de "de menos a más elaborado".

### Programación (se queda en 4 páginas, orden ya casi calca el PD+)
| Orden | Página | Capítulo(s) del PD+ que cubre |
|---|---|---|
| 1 | Contexto | Cap. 1 (Introducción: identificación, marco normativo, contextualización) |
| 2 | Currículo | Cap. 2 (Desarrollo curricular: RA, CE, contenidos, UD) |
| 3 | Metodología | Cap. 3 + 5 + 7 (Metodología, inclusión, contingencia) |
| 4 | Instrumentos | Cap. 4, parte de evaluación/instrumentos |

Ya sigue el orden del PD+ de arriba abajo. Lo único que movería es **Procedimientos** dentro de
Contexto — hoy es la pestaña 4ª de Contexto pero temáticamente es el capítulo 4 completo del PD+
(evaluación y calificación), que en el documento va *después* de Metodología (cap. 3), no antes.
Ver §4 para el detalle.

### Curso (se queda en 4 páginas)
Calendario · Alumnado · Seguimiento · Calificaciones — orden operativo natural (cuándo → quién →
qué pasó cada día → qué nota sacó), no se corresponde con el PD+ (el PD+ no incluye alumnado real ni
notas, es el plan teórico) así que aquí el criterio de orden es el operativo, no el documental.

### Anexos: de 1 página a 4
Esta es la pieza que falta. Propuesta:

| Página | Contenido | Origen |
|---|---|---|
| **Mejora** | EQAVET, Propuestas de mejora | ya existe, sin cambios |
| **Ayuda** *(nueva)* | Guía, FAQ, Acrónimos, Mapa web | pestañas que hoy sobrecargan Inicio (ver §3.1) |
| **Legal** | Aviso legal, Privacidad, Cookies, Accesibilidad | se mueve aquí desde fuera de los bloques |
| **Informes** | *(se elimina, ver §2.1 — no hace falta 4ª página real)* | — |

Con Mejora + Ayuda + Legal ya son **3 páginas**, dentro del rango 3-5 sin necesidad de inventar una
página artificial. Si aun así se prefiere llegar a 4, el candidato más natural sería separar
**Contribuciones** (hoy una pestaña de Inicio, la comunidad de Telegram) como página propia de
Anexos en vez de sub-pestaña de Ayuda — pero no lo forzaría solo por llegar al número si con 3 ya
queda coherente.

### 3.1 Inicio deja de tener 7 pestañas
Al sacar Guía/FAQ/Acrónimos/Mapa a la nueva página "Ayuda" (Anexos), Inicio se queda con
**Bienvenida** y **Verificación** — 2 pestañas. Es la página especial de entrada (dashboard), no un
bloque de trabajo, así que no le exigiría el mínimo de 3 — pero si se quiere, "Contribuciones" podría
quedarse aquí en vez de ir a Ayuda/Anexos, dejando Inicio con 3 pestañas limpias (Bienvenida,
Verificación, Contribuciones) y Ayuda con las 4 puramente de consulta/documentación.

### 3.2 Agenda se queda fuera de los bloques
Es un acceso directo persistente (la cajita destacada arriba del todo del sidebar), no un ítem de
navegación normal — mantenerlo fuera del recuento de "4 bloques" tiene sentido, es del mismo tipo que
Inicio (siempre a un clic, no forma parte del flujo de datos).

---

## 4. Orden interno de pestañas (izquierda→derecha = orden del PD+)

Aplicando "las pestañas de izquierda a derecha de forma natural" al orden real del documento:

**Contexto** — hoy: Presentación · Entorno · Planes · Procedimientos
→ Procedimientos (cap. 4 del PD+) queda temáticamente después de Metodología (cap. 3), que vive en
otra página. Como no se puede intercalar páginas de otro nivel de navegación dentro de esta pestaña,
la solución es de **contenido**, no de orden: mover la pestaña Procedimientos entera a Metodología
(como su 6ª... no, se pasaría de 5). Alternativa más limpia: dejarla en Contexto pero **la última**,
justo como está, aceptando que Contexto agrupa "todo lo que no es Currículo ni Metodología en sí" más
que un capítulo estricto — es una concesión razonable de la UI a la estructura de navegación de 4
páginas por bloque, y ya está en la posición correcta (última) dentro de su página.

**Currículo** — hoy: Ponderación RA-CE · Tareas · Unidades · Relación RA-UD · Contribución OG
→ Orden PD+: RA/CE (2.5) → Contenidos → Relación elementos curriculares (2.7) → UD (2.8). Reordenar a:
**RA y CE → Relación RA-UD → Unidades → Contribución OG → Tareas** (Tareas es una herramienta
pedagógica propia de la app, no un capítulo del PD+, así que va al final).

**Metodología** — hoy: Metodología · Evaluación · Diversidad · Contingencia · Transversales
→ Tras vaciar "Evaluación" de sus duplicados (§2.2) y dejar solo Instrumentos/Recursos
seleccionables, el orden PD+ (cap. 3 → 5 → 7) sería: **Metodología → Diversidad (inclusión, cap. 5)
→ Instrumentos/Recursos (parte del cap. 4) → Contingencia (cap. 7) → Transversales**. Dejaría
"Transversales" al final en cualquier caso porque no corresponde a ningún capítulo del PD+
específico.

**Calificaciones** — hoy: Resumen · Estadísticas · Matriz · Detalle · Informe grupal · Informe
individual (6, se pasa del máximo)
→ Aquí no he verificado a fondo si Resumen y Estadísticas son fusionables (no he leído ambos
componentes completos). Propuesta condicionada: si su contenido se solapa, fusionar en una sola
pestaña "Resumen" con las dos vistas una debajo de otra; si no se solapa, dejarlas separadas y
aceptar que esta página se queda en 6 como única excepción justificada (es la página con más
información transversal de toda la app: notas + analítica + informes). Recomendaría verificarlo
antes de decidir.

---

## 5. Nombres de pestaña (2-3 palabras, vocabulario del PD+)

| Página | Actual | Propuesta | Motivo |
|---|---|---|---|
| Contexto | Presentación | **Identificación** | así se llama el 1.1 del PD+ literalmente |
| Contexto | Entorno | **Contextualización** | así se llama el 1.3 del PD+ literalmente |
| Contexto | Planes | **FEOE y diversidad** | mezcla FEOE (2.9) + DUA (cap. 5); el nombre actual no dice qué contiene |
| Contexto | Procedimientos | **Evaluación y calificación** | así se llama el cap. 4 del PD+ |
| Currículo | Ponderación RA-CE | **RA y criterios** | más corto, término literal del PD+ ("RA y CE") |
| Currículo | Relación RA-UD | **Relación curricular** | así se llama el 2.7 del PD+ |
| Currículo | Contribución OG | **Objetivos generales** | así se llama el 2.4 del PD+ |
| Currículo | Unidades (UD) | **Unidades didácticas** | término literal del PD+ (2.8) |
| Metodología | Diversidad | **Medidas de inclusión** | así se llama el cap. 5 del PD+ |
| Metodología | Contingencia | **Plan de contingencia** | así se llama el cap. 7 del PD+ |
| Metodología | Evaluación *(tras vaciarla)* | **Instrumentos y recursos** | lo único que le queda tras quitar los duplicados |
| Calendario | Actividades comp. | **Actividades extraescolares** | así se llama el cap. 6 del PD+ ("Actividades complementarias y extraescolares") |

El resto de nombres actuales (Alumnado, Seguimiento, Calificaciones, Archivos, Catálogo, Normativa,
Magia, Mejora...) ya son cortos y no corresponden a un capítulo específico del PD+ (son conceptos de
la app, no del documento), así que no propondría cambiarlos.

---

## 6. Tamaño de los campos de texto largo

Medido directamente sobre `RF Ideas/referencia/08-ejemplo-PD-v1.md` (el texto real del módulo 0223
OA), caracteres por sección tal cual redactada por un profesor real — no la versión resumida que yo
mismo escribí anoche para rellenar el demo, que es mucho más corta de lo que un profesor
escribiría de verdad:

| Sección real del PD+ | Caracteres reales (0223 OA) | Filas visuales aprox. (~80 car/línea) |
|---|---:|---:|
| 1.3.1 Entorno geográfico | 2.186 | ~27 |
| 1.3.2 Entorno socioeconómico | 2.361 | ~30 |
| 1.3.3 Contexto escolar | 2.122 | ~27 |
| 1.3.4 Características del alumnado | 4.112 | ~51 |
| 1.3.5 Infraestructura y recursos | 1.379 | ~17 |
| 2.9.5 Seguimiento FEOE | 813 | ~10 |

Las `textarea` actuales de la app usan casi todas `h-24` (4-5 filas) o `h-32` (6-7 filas) — muy por
debajo de lo que ocupa de verdad un párrafo de este documento. Propuesta de 3 tamaños en vez del
actual tamaño único casi universal:

- **Corto** (campos tipo FEOE seguimiento, bibliografía, publicidad, contingencia — bajo 1.000
  caracteres en el ejemplo real): mantener alrededor de `h-32`/`h-40` (6-10 filas).
- **Medio** (contexto geográfico/socioeconómico/escolar, infraestructura — 1.500-2.500 caracteres):
  subir a `h-64`/`h-72` (16-18 filas) como mínimo.
- **Largo** (características del alumnado, y cualquier campo que en el ejemplo real supere los 3.500
  caracteres): `h-96` (24 filas) o, mejor, una textarea que crece con el contenido
  (`field-sizing: content` en CSS, o un `rows` calculado a partir de `value.length`) en vez de una
  altura fija — así no hay que adivinar un tamaño único que sirva para todos los módulos, que tendrán
  contenido de longitud distinta al de 0223 OA.

---

## 7. Resumen de cambios propuestos, por prioridad

1. **Eliminar `/informes`** (duplicado exacto de Magia→Curso) — riesgo bajo, beneficio alto, ninguna
   pérdida de funcionalidad.
2. **Vaciar los 4 campos largos duplicados de `EvaluacionRecursosTab`** y fusionarlos donde ya vivían
   (Contexto→Entorno, Contexto→Procedimientos) — riesgo medio (hay que decidir con cuál de las dos
   copias de cada campo se queda el contenido si ambas tienen datos), beneficio alto.
3. **Crear la página "Ayuda" en Anexos** (Guía/FAQ/Acrónimos/Mapa) y mover Legal a Anexos — resuelve
   el bloque incompleto y el "¿dónde va Legal?" a la vez.
4. **Renombrar pestañas** según §5 — riesgo muy bajo, cosmético.
5. **Reordenar pestañas** dentro de Currículo y Metodología según §4 — riesgo bajo.
6. **Ampliar tamaños de textarea** según §6 — riesgo muy bajo, mejora pura.
7. **Decidir Calificaciones (6 pestañas)** — pendiente de verificar solapamiento Resumen/Estadísticas
   antes de tocarlo.

¿Con cuáles quieres que empiece? Yo priorizaría 1 y 2 primero porque son datos duplicados de verdad
(riesgo de que alguien edite una copia y la otra quede desactualizada), y dejaría 4-6 para una pasada
posterior de pulido ya sin sorpresas de por medio.
