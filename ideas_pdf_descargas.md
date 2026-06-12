# 📄 Ideas de PDF para la sección Descargas

## Estado actual (ya implementados)

| Pestaña | PDF disponible |
|---|---|
| PDF Inicio | Calendario académico |
| PDF Inicio | Planificación mensual |
| PDF Inicio | Matrices RA→UD |
| PDF Seguimiento | Seguimiento diario |
| PDF Seguimiento | Clases por UD |
| PDF Boletines grupales | Boletín 1T, 2T, 3T (+ CSV Excel) |
| PDF Boletines grupales | Evaluación Final Ordinaria / Extraordinaria |
| PDF Boletines individuales | Boletin por alumno |

---

## 🚀 Ideas pendientes de implementar

### 📋 Pestaña "PDF Inicio" (documentos de programación)

- **PDF Programación Didáctica completa** ⭐⭐⭐
  - El documento oficial que entrega el departamento al inicio de curso.
  - Contiene: portada, info del módulo, RA/CE/UD, ponderaciones e instrumentos en un solo PDF.
  - Requiere: nueva plantilla en `backend/`.

- **PDF Instrumentos de Evaluación** ⭐⭐
  - La tabla de actividades con pesos y CEs del trimestre.
  - Útil para entregar a los alumnos al principio del trimestre, como "contrato" de evaluación.
  - Requiere: plantilla sencilla, datos ya disponibles.

---

### 📝 Pestaña "PDF Seguimiento"

- **PDF Asistencia mensual** ⭐⭐
  - Lista de asistencia del grupo por semanas/mes.
  - Para registro de tutorías o inspección de Jefatura.
  - Requiere: plantilla con grid de alumnos × días lectivos.

---

### 👤 Pestaña "PDF Boletines individuales" (ampliar)

- **PDF Informe de tutoría individual** ⭐⭐⭐
  - Ficha por alumno con: nota media actual, RA en riesgo, asistencia y observaciones.
  - Ideal para la sesión de tutoría o para enviar a familias.
  - Requiere: nueva plantilla tipo "card" por alumno.

- **PDF Acta de recuperación** ⭐⭐
  - Documento que acredita que un alumno realizó una recuperación y la nota obtenida.
  - Útil para el expediente de la recuperación.
  - Requiere: plantilla sencilla, firmable.

- **Envío automatizado de PDFs por Email al Alumnado** ⭐⭐⭐
  - Funcionalidad para enviar de forma masiva o individual los boletines e informes directamente a los alumnos (o familias).
  - Se utilizará la dirección de correo registrada en el listado de clase de cada alumno.
  - Requiere: Integrar envío de emails en el backend (por ejemplo con `smtplib` o un servicio de terceros) y añadir un botón de "Enviar por Email" junto a la generación del documento.

---

### 📊 Nueva pestaña "PDF Estadísticas" (nueva tab)

- **PDF Estadísticas del grupo** ⭐⭐⭐
  - Distribución de notas (histograma), media grupal, % aprobados, comparativa por RA.
  - El típico informe de resultados que piden en los departamentos al final de cada evaluación.
  - Requiere: nueva plantilla con gráficos generados en Python (matplotlib o similar).

---

## Notas técnicas

> [!NOTE]
> Los PDFs que requieren **nueva plantilla en backend** implican crear un nuevo fichero `pdf_*.py` en `c:\GD-rsp\APP\backend\` y un nuevo endpoint en `routers/pdf.py`. Los datos ya están disponibles en Firestore/SQLite.

> [!TIP]
> El **PDF Programación Didáctica completa** y el **PDF Estadísticas del grupo** son los de mayor impacto percibido por el usuario docente: son los que más veces tienen que generar de forma manual hoy en día.
