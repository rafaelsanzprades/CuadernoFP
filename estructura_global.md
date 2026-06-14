# Estructura Global de CuadernoFP

Este documento recopila todas las páginas, sus descripciones, pestañas (TABS) y bloques principales, ordenados según el menú de la aplicación.

### /inicio
**Título:** Bienvenido al Cuaderno FP

**Descripción:** Accede rápidamente a todas las herramientas para la gestión de tus módulos, alumnado y evaluación.

**Bloques (Secciones/Cards principales):**
- {item.label}


## 📅 Agenda
---

### /agenda
**Título:** Agenda de clase

**Descripción:** Revisa lo que toca impartir hoy y el estado general de tu clase.


## 📘 Programación
---

### /modulo
**Título:** Módulo didáctico

**Descripción:** Configuración básica del módulo didáctico.


### /matrices
**Título:** Matrices OG→ RA→ CE→ UD

**Descripción:** Por favor, ve a la sección de Datos y selecciona un módulo PD.

**Pestañas (TABS):**
- `ra`: RA y sus CE
- `ud`: UD Unidades didácticas
- `relacion`: Relación entre RA y UD
- `contribucion`: Contribución de RA en OG
- `cpps`: Competencias (CPPS)


### /instrumentos
**Título:** Instrumentos de evaluación

**Descripción:** Por favor, ve a la sección de Datos y selecciona un módulo PD.

**Pestañas (TABS):**
- `resumen`: , cleanLabel: "Resumen"
- `tri1`: , cleanLabel: "IE. 1er Tri."
- `tri2`: , cleanLabel: "IE. 2º Tri."
- `tri3`: , cleanLabel: "IE. 3er Tri."

**Bloques (Secciones/Cards principales):**
- Faltan Criterios de evaluación
- ⛑️ Crear Recuperación ({recoveryTri})


### /programacion
**Título:** Programación de aula

**Descripción:** Por favor, ve a la sección de Datos y selecciona un módulo PD.

**Pestañas (TABS):**
- `secuenciacion`: , cleanLabel: "Secuenciación de UD"
- `tareas`: , cleanLabel: "Tareas competenciales"

**Bloques (Secciones/Cards principales):**
- No hay Unidades Didácticas


## 👥 Curso
---

### /calendario
**Título:** Calendario académico

**Descripción:** Sin festivos ni eventos aún. Añade uno arriba o haz clic en el calendario.

**Pestañas (TABS):**
- `eventos`: , cleanLabel: "Eventos y festivos"

**Bloques (Secciones/Cards principales):**
- {MONTH_NAMES[m]} {y}
- Notas registradas ({noteEntries.length})
- {t.title}
- Calendario visual


### /alumnado
**Título:** Alumnado y tutoría

**Descripción:** Por favor, ve a la sección de Datos y selecciona un Curso Activo.

**Pestañas (TABS):**
- `alumnado`: , cleanLabel: "Alumnado"
- `plano`: , cleanLabel: "Plano de clase"
- `tutoria`: , cleanLabel: "Ficha de Tutoría"
- `matriz`: , cleanLabel: "Matriz de Tutoría"
- `feoe`: , cleanLabel: "Prácticas FEOE"
- `perfil`: , cleanLabel: "Perfil individual"
- `resumen`: , cleanLabel: "Resumen"
- `tendencias`: , cleanLabel: "Tendencias"


### /seguimiento
**Título:** Seguimiento diario

**Descripción:** Por favor, ve a la sección de Entorno y carga tanto una Programación como un Curso activo.

**Pestañas (TABS):**
- `diario`: , cleanLabel: "Diario de aula"
- `asistencia`: , cleanLabel: "Control de asistencia"


### /progreso
**Título:** Progreso académico

**Descripción:** Por favor, ve a la sección de Datos y asegúrate de cargar ambos.

**Bloques (Secciones/Cards principales):**
- Detalle de Calificaciones por Instrumento
- Consecución de Resultados de Aprendizaje (RA)


## ⚙️ General
---

### /entorno
**Título:** Entorno de trabajo

**Descripción:** CuadernoFP funciona directamente en tu navegador sin requerir base de datos externa. Abre tus ficheros de Programación y Curso para trabajar con ellos, y guárdalos cuando termines.

**Pestañas (TABS):**
- `datos`: 
- `ia`: 
- `nube`: 

**Bloques (Secciones/Cards principales):**
- Archivo de Programación (.cddp)
- Archivo de Curso (.cddc)
- ¿Cómo obtengo mi API Key?
- Seguridad y RGPD garantizados


### /documentacion
**Título:** Documentación

**Descripción:** Explorador de archivos oficiales, legislación y otros documentos.

**Bloques (Secciones/Cards principales):**
- {item.name}


### /descargas
**Título:** Descargas

**Descripción:** Generación de reportes y boletines en PDF.

**Pestañas (TABS):**
- `inicio`: PDF Inicio
- `seguimiento`: PDF Seguimiento
- `grupales`: PDF Boletines grupales
- `individuales`: PDF Boletines individuales

**Bloques (Secciones/Cards principales):**
- Calendario académico
- Planificación mensual
- Matrices RA → UD
- Programación Didáctica
- Seguimiento diario
- Clases por UD
- 1er trimestre
- 2º trimestre
- 3er trimestre
- Eval. Final Ordinaria
- Eval. Final Extraordinaria
- Boletín de alumnado


### /ciclos
**Título:** Ciclos formativos

**Descripción:** Catálogo oficial de Familias profesionales, Títulos y desglose de módulos del BOE/BOA.

**Bloques (Secciones/Cards principales):**
- Ciclos Formativos ({family.degrees.length})
- {articleTitles[artKey] || artKey}
- {mod.nombre}


### /feoe
**Título:** Prácticas FEOE

**Descripción:** Gestión de empresas colaboradoras, asignación de alumnado y seguimiento de prácticas duales y FCT.

**Bloques (Secciones/Cards principales):**
- {editId ? "Editar empresa" : "Nueva empresa"}
- {emp.nombre}


### /ayuda
**Título:** Centro de Ayuda

**Descripción:** Verifica la coherencia de tus datos, consulta la guía de inicio o encuentra respuestas a dudas comunes.

**Bloques (Secciones/Cards principales):**
- {item.title}
- {step.title}


## ⚖️ Legal y Otros
---

### /avisolegal
**Título:** Información Legal y Privacidad

**Descripción:** Cumplimiento del RGPD, condiciones de uso y protección de datos.

**Bloques (Secciones/Cards principales):**
- Responsable del Tratamiento de Datos (RGPD)
- ¿Dónde se guardan los datos?
- Seguridad


### /licencia
**Título:** Licencia y Términos de Uso

**Descripción:** Filosofía abierta, gratuita y accesible para el profesorado de Formación Profesional.

**Bloques (Secciones/Cards principales):**
- ¿Qué implica esto?
- Condición obligatoria (Copyleft):
- Resumen amigable de la licencia CC BY-NC-SA:


### /asignaciones
**Título:** Asignación de módulos

**Descripción:** Jefatura de Estudios: Asigna el profesorado a los módulos de cada ciclo formativo.


### /familias
**Título:** Familias profesionales

**Descripción:** Catálogo oficial de Ciclos Formativos. Grado Básico, Grado Medio y Grado Superior

**Bloques (Secciones/Cards principales):**
- Ciclos Formativos ({family.degrees.length})


### /profesorado
**Título:** Profesorado

**Descripción:** Administración del profesorado, perfiles y asignaciones docentes.

**Pestañas (TABS):**
- `acceso`: , cleanLabel: "Acceso usuarios"
- `gestion`: </span>, cleanLabel: "Gestión de usuarios"
- `asignacion_docentes`: </span>, cleanLabel:"Asignación de docentes"
- `asignacion_modulos`: , cleanLabel: "Asignación de módulos"


