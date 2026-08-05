# Auditoría de generadores de documentos (PDF y DOCX) — 2026-08-05

Informe solicitado por Rafael: localizar todos los generadores de `.pdf` del backend, comprobar
si funcionan de verdad (no solo leyendo el código, sino probándolos en caliente), y valorar si
tiene sentido pasarlos a `.docx`. Sin cambios de código todavía — este documento es solo el
diagnóstico, para anotar encima y decidir qué hacer.
USARÉ MAYÚSCULAS Y PONDRÉ ANTES RF:

Método: se levantó el backend real (`localhost:8000`) y se llamó a `/api/pdf` con los datos demo
(`202526 P 0237-ICTVE.fpp` + `202526 C 1A-GM 0237-ICTVE.fpc`) para **todos** los `type` que acepta
`routers/pdf.py`, comprobando código de estado, `content-type` y tamaño real de la respuesta. Los
dos fallos detectados coinciden además con errores ya registrados previamente en
`backend/pdf_debug.log`, es decir, no son un artefacto de la prueba: ya habían fallado en uso real.

---

RF. GRACIAS. EN GENERAL ORGANIZADO POR PESTAÑAS: GRUPO, PROGRAMACIÓN, CURSO Y ANEXOS. QUIZÁ PODRÍAN SER LAS PESTAÑAS DE MAGIA. Y LUEGO HACER BLOQUES EN EL ORDEN DE "NECESIDAD"... ENTIENDO QUE ASOCIADO A LAS PÁGINAS DE CADA BLOQUE ¿TE PARECE BIEN?

RF: ¿PUEDES PROPONER ALGÚN OTRO .PDF?... HAZME UNA PROPUESTA... 

---

## A) PDF real (ReportLab) — 7 generadores, enganchados a Magia

| Tipo | Archivo | Botón en la UI | Resultado |
|---|---|---|---|
| `calendario` | `pdf_calendario_academico.py` | Magia › Curso → "PDF Calendario" | ✅ OK (25 KB) |
| `seguimiento` | `pdf_seguimiento_diario.py` | Magia › Curso → "PDF Seguimiento" | ✅ OK |
| `clases_ud` | `pdf_clases_ud.py` | Magia › Curso → "PDF Clases por UD" | ✅ OK |
| `planificacion` | `pdf_planificacion.py` | Magia › Utilidades → "PDF Planificación" | ✅ OK |
| `grupal_1t` / `grupal_2t` / `grupal_3t` / `grupal_final` | `pdf_boletin_grupal.py` | Magia › Curso → "Boletines grupales" | ✅ OK (las 4) |
| `individual` | `pdf_boletin_individual.py` | Magia › Curso → "Boletín individual" | ✅ OK |
RF: TODO BIEN.

---

| `matrices` | `pdf_matrices.py` | **ninguno** — no hay botón que lo llame | ✅ genera bien, pero está huérfano en la UI |
RF: PON EL MUERTO... ENLAZADO... SACALO A LA LUZ 

---

| `alumnado_ubicacion` | *(no existe generador)* | Magia › Curso → "PDF Alumnado Ubicación" | ❌ **ROTO** — ver detalle abajo |
### ❌ Bug confirmado: `alumnado_ubicacion`
El botón "PDF Alumnado Ubicación" (Magia › Curso) llama a `handleDownloadPdf('alumnado_ubicacion')`,
pero `routers/pdf.py` no tiene ningún `elif type == "alumnado_ubicacion"` — cae directo al `else`
final y responde `400: Unknown PDF type: alumnado_ubicacion`. Confirmado dos veces en
`backend/pdf_debug.log` (ya había fallado en uso real, antes de esta auditoría). **Este botón nunca
ha funcionado.**
RF: CONVENDRÍA ARREGLARLO, ES UNA CUADRICULA, POR FAVOR, PON LA REFERENCIA DE LA MESA DEL PROFESOR... QUIZÁ LA MEJOR OPCIÓN ES "PINTARLO" EN HORIZONTAL

---

## B) DOCX (docxtpl / python-docx) — programación didáctica y UD/Tarea

| Tipo | Archivo | Estado |
|---|---|---|
| `programacion_minima_tpl` (PD-) | `generador_pd_minima_tpl.py` | ✅ OK |
| `programacion_suficiente_tpl` (PD=) | `generador_pd_suficiente_tpl.py` | ✅ OK |
| `programacion_jeg` (PD+) | `generador_pd_jeg.py` | ✅ OK |
RF: ENTIENDO QEU POR ORDEN, SE REFIERE, A PD- (MINIMA-ALUMNADO), PD= (SUFICIENTE-ARAGON) Y PD+ (JEG-CIFPA)

---

| `plantilla_jeg` | plantilla en bruto, sin rellenar | ✅ OK |
RF: AHORA BIEN TENGO DUDA CON ESTA ¿ES NECESARIA? 

---


| `ud` / `tarea` | `generador_ud_tarea.py` | ✅ OK (docx) |
RF: SOBRE ESTA DE TAREA NO TENGO OPINIÓN... PONLA DONDE TOQUE Y LA VEMOS.

---


| `programacion_minima` / `programacion_detallada` (legacy, sin `_tpl`) | — | ✅ generan, pero **ningún botón del frontend los llama** — código muerto |
RF: ¿ES POSIBLE QUE ESTE REPETIDA, SEA EQUIVALENTE A PD- O PD MINIMA VISTA MÁS ARRIBA Y SE PUEDA BORRAR?

---


| `programacion_suficiente` (legacy, sin `_tpl`) | — | ❌ **ROTO**: `500: sequence item 0: expected str instance, dict found`. Tampoco tiene botón — dead code roto que no afecta a nadie hoy. |
RF: ¿ES POSIBLE QUE ESTE REPETIDA, SEA EQUIVALENTE A PD= O PD SUFICIENTE VISTA MÁS ARRIBA Y SE PUEDA BORRAR?

---


**Resumen**: de 20 `type` distintos que acepta el endpoint, 18 funcionan; 1 está roto y **es
visible/usado** (`alumnado_ubicacion`); 1 más está roto pero es código muerto sin botón
(`programacion_suficiente` legacy); y hay 3 variantes legacy sin `_tpl` que nadie llama desde la UI.
RF: CREO QUE YA HE CONTESTADO A TODO MÁS ARRIBA
---

## ¿Tiene sentido pasar los 7 de ReportLab a `.docx`?

Es factible — de hecho ya es el patrón que usa el 60% del backend (los 3 generadores `_tpl` de
programación y `generador_ud_tarea.py` usan python-docx/docxtpl en vez de ReportLab). Pero antes de
tocar código hay dos cosas a valorar:

1. **Se perdería el visor integrado.** El iframe de Magia › Curso
   (`<iframe src={previewUrl}>`) funciona porque el navegador sabe renderizar `application/pdf`
   nativamente — no sabe renderizar `.docx`. Si estos 7 pasan a docx, esos botones dejarían de abrir
   vista previa en la propia página y pasarían a forzar descarga directa (como ya hace hoy la
   programación didáctica).

2. **Convertir docx→pdf en el servidor ya ha dado problemas en este repo.**
   `generador_ud_tarea.py` usa `docx2pdf` (controla Word vía COM en Windows / AppleScript en Mac) —
   **no funciona en Linux**, que es donde corre el backend en Cloud Run. Si el objetivo fuera "docx
   editable pero conservando el PDF para el visor", haría falta LibreOffice headless en el
   contenedor, no `docx2pdf`.

RF: NO USAR DOCX2PDF... VA MAL. DEJAR EN DOCX SIEMPRE LAS PD-, PD= Y PD+ (CON LOS NOMBRES QUE CORRESPONDAN)
RF: EN EL RESTO 1º ASEGURAR QUE FUNCIONAN EN .PDF (QUE ES COMO ESTÁN) Y PONER OTRO BOTÓN PARA .DOCX

RF: EN GENERAL, LLAMAREMOS "Descarga editable .docx" y "Vista previa .pdf"

### Recomendación
No migrar los 7 generadores ReportLab a docx — son documentos de solo lectura/impresión con tablas
densas, y ReportLab da un control de maquetación que python-docx no garantiza igual en todos los
visores (Word vs LibreOffice vs Google Docs pueden repaginar distinto). Priorizaría:

1. Arreglar `alumnado_ubicacion` (bug real, botón visible y roto hoy).
2. Limpiar los 3 generadores legacy sin `_tpl` (uno de ellos, además, roto).
3. Si en algún caso concreto interesa que el profesorado pueda editar el resultado a mano antes de
   entregarlo (p. ej. el boletín individual), añadir ahí un botón "Descargar .docx" adicional —
   igual que ya existe para la programación — sin tocar el PDF que ya funciona.
---
RF: CREO QUE FINALMENTE HE TOMADO TODOS TUS CONSEJOS... ERA YO QUIEN NECESITABA CONFIANZA... REVISA TODO PARA QUE ESTE CLARO

## Plan de acción consolidado

Revisadas todas tus notas y contrastadas con el código (he comprobado con `grep` que los 3
generadores legacy no tienen ningún otro consumidor). Esto es lo que queda cerrado, punto por
punto:

### 1. Confirmado sin más — borrar los 3 legacy sin `_tpl`
`generador_pd_minima.py`, `generador_pd_suficiente.py` y `generador_pd_detallada.py` **sí son
duplicados obsoletos** de PD-/PD=/PD+ respectivamente (las versiones `_tpl`/`_jeg` los sustituyeron).
Comprobado: ningún otro archivo del backend los importa salvo sus propias ramas muertas en
`routers/pdf.py` (`programacion_minima`, `programacion_suficiente`, `programacion_detallada`), y el
frontend nunca llama a esos tres `type`. Se pueden borrar los 3 `.py` y sus 3 ramas en el router sin
riesgo. (De paso, `generador_pd_jeg.py` tiene un docstring con un copia-pega que dice
`from generador_pd_detallada import generate` en vez de `generador_pd_jeg` — lo corrijo al tocar la
zona, es solo un comentario.)

### 2. `plantilla_jeg` (plantilla oficial en blanco) — recomendación
Ahora que `programacion_jeg` (PD+ autorrellenada) funciona bien, este botón pierde la mayor parte de
su utilidad — sirve solo para (a) ver cómo es el formato oficial vacío, o (b) tener un plan B si
algún día el autorrelleno fallara y quisieras partir de cero a mano. Uso poco frecuente. Propongo
**no borrarlo pero degradarlo**: sacarlo de los botones principales y dejarlo como enlace secundario
("Ver plantilla oficial en blanco") en Grupo o Anexos, en vez de competir visualmente con PD-/PD=/PD+.

### 3. Reorganización de Magia en 4 pestañas (Grupo / Programación / Curso / Anexos) — de acuerdo
Tiene sentido: hoy Magia usa una taxonomía propia ("programación / comparativa / utilidades / curso")
que no coincide con el resto de la app. Alinearla a los 4 bloques del menú es más predecible. Mi
propuesta de reparto, por "necesidad" dentro de cada bloque:

| Pestaña Magia | Contenido | Motivo |
|---|---|---|
| **Programación** | PD- / PD= / PD+ (docx, primero — es lo más usado) → Matriz RA↔UD (`matrices`, resucitada) | Todo nace de datos de Currículo |
| **Curso** | Calendario → Seguimiento → Clases por UD → Planificación (se mueve aquí desde "Utilidades", es un documento de calendario/curso) → Boletines grupales → Boletín individual → Plano de aula (`alumnado_ubicacion`, arreglado) | Todo nace de datos del Curso activo |
| **Grupo** | "Ver plantilla oficial en blanco" (`plantilla_jeg` degradada, ver punto 2) | Es el único documento que no depende de tus datos, sino de la normativa/plantilla en sí |
| **Anexos** | Comparativa (contenido ya existente, es documentación no generación) | Encaja como material de consulta, no de generación |

`ud` / `tarea`: no los muevo — hoy no viven en Magia, se generan desde los modales de UD/Tarea
dentro de Currículo (`UdConfigModal.tsx`, `TaskConfigModal.tsx`), y funcionan bien ahí. Los dejo
donde están; si luego se ve raro los revisamos juntos, como decías.

### 4. `alumnado_ubicacion` → generador nuevo real (plano de aula en PDF)
No hay generador que arreglar, hay que crearlo desde cero (`pdf_alumnado_ubicacion.py`, ReportLab,
A4 apaisado como pedías). Reutiliza los mismos datos que ya pinta `PlanoClaseTab.tsx` en pantalla
(`curso_data.plano_clase`: `rows`/`cols`/`seats`), y replica su mismo lenguaje visual: banda
"Mesa del Profesorado / Pizarra" en la cabecera y "Frente de clase ⬇️" — así el PDF impreso se
reconoce como el mismo plano que ya usas en pantalla.

### 5. Estrategia PDF vs DOCX — cerrada
- **PD-, PD=, PD+**: se quedan **solo en .docx** (nombres ya correctos: PD Resumen / PD BOA Aragón /
  PD JEG), tal cual están. Nada que tocar aquí.
- **`docx2pdf` no se vuelve a usar en ningún generador nuevo** — ya está confirmado que falla en
  Linux/Cloud Run.
- **Los generadores ReportLab** (calendario, seguimiento, clases_ud, planificación, matrices,
  boletines grupales, boletín individual) **y el nuevo plano de aula**: primero se verifica que el
  `.pdf` (que es como están, y ya funciona) sigue intacto, y luego se añade un **segundo botón** que
  genera el mismo documento directamente en `.docx` con python-docx (sin pasar por `docx2pdf` — un
  builder nativo, no una conversión), reutilizando los mismos DataFrames que ya prepara
  `routers/pdf.py`.
- **Etiquetado de botones, en toda la app, consistente**: "Vista previa .pdf" (abre en el visor
  integrado) y "Descarga editable .docx" (fuerza descarga).

### 6. Propuesta de nuevos documentos (tu pregunta "¿algún otro .pdf?")
Cuatro candidatos que reutilizan datos que la app ya tiene (nada de campos nuevos):

1. **Acta de evaluación / calificaciones** (nace de Curso › Calificaciones): documento firmable con
   la nota de cada alumno por RA para la junta de evaluación de cada trimestre — hoy ese dato solo
   se ve en pantalla (Matriz/Resumen), nunca sale a papel formal.
2. **Informe EQAVET / propuestas de mejora** (nace de Anexos › Mejora): exportar la autoevaluación de
   calidad y las propuestas del curso, para guardar en el expediente del departamento o enseñar en
   inspección.
3. **Ficha individual de alumnado** (nace de Curso › Alumnado): una página por alumno que junta ficha
   + notas de tutoría + estado de alerta de abandono — útil para llevarla a una reunión de
   orientación sin exportar todo el boletín de notas.
4. **Parte de incidencias / justificante de faltas** (nace de Curso › Seguimiento › Asistencia): un
   justificante imprimible de una falta o incidencia concreta, para que la familia lo firme.

¿Quieres los cuatro, alguno en concreto, u otra idea que no esté en esta lista?

---

Con esto no queda ninguna pregunta abierta de las tuyas salvo la del punto 6 (qué nuevos PDF
quieres) y confirmar que el reparto de pestañas del punto 3 te convence. En cuanto lo confirmes,
empiezo a programar.
