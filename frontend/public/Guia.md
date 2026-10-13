# 🚀 Guía de inicio rápido: ¿Por dónde empiezo?

¡Bienvenido a Cuaderno FP! Esta guía te va a llevar de la mano, paso a paso, para que configures tu curso desde cero sin perderte.
Además, debajo de cada explicación encontrarás un árbol súper detallado indicándote exactamente dónde tienes que hacer clic en la interfaz.

---

## 🤖 Paso 0: Instrucciones para el asistente IA (system prompt)

Eres el asistente virtual integrado en **Cuaderno FP**. Tu objetivo es guiar al profesorado paso a paso en la configuración inicial de su curso escolar, solicitándole la información necesaria de forma conversacional y estructurada.

- **Contexto y Acceso:**
- **Plataforma:** Actúas sobre la web `cuadernofp.web.app` (no requiere usuario ni contraseña, los datos residen localmente).
- **Propósito:** Debes utilizar el resto de esta guía (Pasos 1 al 5) como tu mapa exacto de la interfaz para saber qué campos rellenar, qué botones pulsar y en qué pantallas navegar.

- **Interacción con el usuario (Lo que debes pedir):**
Antes de ejecutar acciones en la plataforma, preséntate brevemente y solicita al usuario la información base. Pídele (de forma progresiva para no abrumarle):

1. **Documentación del módulo:** Solicita su temario, programación oficial o currículo (en PDF o texto) para poder extraer unidades didácticas (UD), resultados de aprendizaje (RA) y criterios de evaluación (CE).
2. **Fechas clave:** Pregúntale por el calendario escolar (inicio/fin de curso, trimestres y festivos locales).
3. **Horario semanal:** Qué días imparte clase y cuántas horas cada día.
4. **Listado de alumnado:** Un Excel, CSV o lista de texto con el alumnado para importar la clase.

- **Convenciones de Nomenclatura:**
Cuando generes identificadores o guardes datos, usa estos estándares (salvo que el usuario especifique otros):
- **Curso académico:** Formato `2025-26`.
- **Módulo:** Acrónimo en mayúsculas (ej. `SMR`, `DAW`, `FOL`).
- **Grupos:** Número, letra y nivel (ej. `1A-GM`, `2B-GS`).
- **Archivos exportados:** `[Curso]_[Acrónimo-Módulo]_[Documento].pdf` (ej. `2025-26_DAW_Programacion.pdf`).

- **Glosario clave que debes comprender:**
  - **Programación didáctica:** Es el "molde" teórico (.fpp). Contiene la normativa (resultados de aprendizaje y criterios de evaluación) y las unidades didácticas. Se diseña una vez y se puede reutilizar en cursos posteriores.
  - **Curso:** Es la "instancia" real (.fpc). Representa al alumnado físico, sus calificaciones, faltas de asistencia y calendario en un año académico específico (ej. 2025-26).
  - **Bloques:** 3 grupos en el sidebar — General (Inicio, Ayuda, MagIA, Normativa, Legal), Programación (Catálogo, Contexto, Currículo, Metodologías, Instrumentos — el diseño teórico del módulo) y Curso (Calendario, Alumnado, Calificaciones, Sesiones, Cierre — el aula real). Esta misma guía vive dentro de Ayuda, pestaña Guía (no en Inicio ni en MagIA); esa misma página Ayuda tiene también FAQ, Acrónimos y Contribuciones para consultas rápidas.

Una vez tengas el contexto necesario, comienza a guiar al usuario o ejecuta las acciones detalladas desde el **Paso 1** en adelante.

---

## 🛠️ Paso 1: Creación y configuración (el qué)

El primer paso es crear el "molde" o plantilla curricular de tu módulo a partir de la normativa, y personalizarlo con tu forma de evaluar.

### 1.1. Iniciar desde el catálogo oficial
Vamos a pedirle al sistema que nos cree el archivo base de la programación cargando automáticamente la ley.
- **Bloque:** General
  - **Página:** Normativa
    - **Pestaña:** Autonomías
      - **Acción:** Selecciona tu Comunidad autónoma en el mapa interactivo para cargar la normativa autonómica específica.
- **Bloque:** Programación
  - **Página:** Catálogo
    - **Pestaña:** Familias
      - **Acción:** Haz clic en la tarjeta de tu familia profesional.
    - **Pestaña:** Títulos
      - **Selector:** Familia profesional y título. Selecciona tu ciclo formativo.
    - **Pestaña:** Módulos
      - **Botón:** "Nueva programación", en el módulo deseado dentro de su curso (1º/2º).
    - **Pestaña:** RA → CE
      - **Acción:** Consulta de solo lectura del currículo oficial ya cargado: resultados de aprendizaje y criterios de evaluación de tu módulo, tal como los fija la normativa.

### 1.2. Configurar el contexto y los datos generales
- **Bloque:** Programación
  - **Página:** Contexto
    - **Pestaña:** Identificación
      - **Bloque:** Centro y docente, módulo didáctico y datos de autoría y publicidad de la programación.
    - **Pestaña:** Entorno
      - **Bloque:** Contexto escolar (entorno geográfico y socioeconómico), actividades complementarias y extraescolares, y plan FEOE (modalidad, seguimiento y régimen dual).
    - **Pestaña:** Alumnado
      - **Bloque:** Alumnado con necesidades específicas (ACNEAE) y datos del grupo, y rasgos característicos del grupo.
    - **Pestaña:** Evaluación
      - **Bloque:** Reglas de redondeo y compensación, ponderación por trimestres e instrumentos de evaluación, y escalas cualitativas.
    - **Pestaña:** Procedimientos
      - **Bloque:** Evaluación inicial, modelo de recuperación, información al alumnado y procedimientos (pérdida de evaluación continua), criterios de calificación y textos del modelo simplificado.

> La atención a la diversidad ya no vive en Contexto: está en Programación › Metodologías › pestaña Atención a la diversidad (ver 1.4).

### 1.3. Definir el currículo, las unidades didácticas y los proyectos y retos
- **Bloque:** Programación
  - **Página:** Currículo
    - **Pestaña:** Relación RA <- CE
      - **Número:** Asignar el % de cada RA y de cada CE.
    - **Pestaña:** Contribución OG <- RA
      - **Bloque:** Matriz de contribución de cada RA a los objetivos generales del título.
    - **Pestaña:** Unidades didácticas
      - **Botón:** "Añadir nueva UD". Crea los temas.
      - **Tabla:** Haz clic en la intersección de la UD con el RA al que contribuye.
      - **Columnas:** A la derecha de los RA: "Bloque de contenidos" (texto libre para agrupar UD), y, de solo lectura, los objetivos generales (OG) y los instrumentos de evaluación de cada UD. Con ellas la tabla cubre la relación UD ↔ contenidos ↔ RA ↔ OG del Art. 100 del Decreto 91/2024; el PDF/DOCX de MagIA se descarga desde esta misma pestaña.
    - **Pestaña:** Secuenciación de UD
      - **Bloque:** Secuenciación de las sesiones de cada UD (arrastra para reordenar sesiones).
    - **Pestaña:** Proyectos y retos
      - **Bloque:** "Proyectos y retos" (opcional; art. 109 del Decreto 91/2024 si el módulo participa en un proyecto o reto): botón "Añadir proyecto o reto" y selector del instrumento (codificado) con el que se evalúa.

### 1.4. Metodología
- **Bloque:** Programación
  - **Página:** Metodologías
    - **Pestaña:** Estrategias e innovación
      - **Bloque:** Metodologías activas (ABP, retos, etc.) y coordinación docente, e innovación e intermodularidad.
    - **Pestaña:** Recursos y espacios
      - **Bloque:** Catálogo de instrumentos de evaluación y recursos y espacios necesarios (aula, taller, software...).
    - **Pestaña:** Atención a la diversidad
      - **Bloque:** Marco de inclusión, atención a la diversidad, plan DUA y panel de alumnado ACNEAE (nombre, tipo de necesidad y adaptaciones de evaluación y acceso).
    - **Pestaña:** Plan de contingencia
      - **Texto:** Docencia telemática, tareas autoguiadas.
    - **Pestaña:** Transversales
      - **Texto:** Elementos transversales, competencias clave y digitales, y estándares y objetivos del currículo.

### 1.5. Instrumento de Evaluación
- **Bloque:** Programación
  - **Página:** Instrumentos
    - **Pestaña:** Resumen
      - **Tabla:** Visión global de los instrumentos por trimestre (nº y % de peso).
    - **Pestaña:** Trimestres
      - **Sub-pestañas:** 1º/2º/3º Trimestre.
      - **Botón:** "Añadir Instrumento". Exámenes, prácticas, rúbricas...
    - **Pestaña:** Rúbricas
      - **Botón:** "Nueva rúbrica" (o importar/exportar desde Classroom).
    - **Pestaña:** Modelo JEG
      - **Acción:** Reparto avanzado Instrumento→Indicador→CE (normalmente no hace falta tocarlo).

> Las reglas de redondeo y compensación (nota mínima, umbral de redondeo, criterios compensables por RA) no viven en Instrumento: están en Programación › Contexto → Pestaña Identificación.

---

## 💾 Paso 2: Descargar la programación oficial

Una vez configurada la programación base, genera los PDFs oficiales.

- **Página:** MagIA
  - **Pestaña:** Programación
    - **Bloque "Documentos de apoyo al currículo":** Matriz RA ↔ UD, selector de UD y de tarea competencial, y matriz de cobertura CE × Instrumento — todo en un único bloque, en PDF ("Vista previa") o DOCX ("Descarga editable").
    - **Bloque "Documentos programáticos por Comunidades autónomas":** Acordeón por Comunidad autónoma (Aragón viene abierta por defecto; el resto muestra "próximamente"). Dentro de cada comunidad con contenido, tres niveles de programación, siempre en .docx editable:
      - **PD- (Resumen):** Resumen de 1-2 folios para el alumnado.
      - **PD= (Simplificada):** Formato oficial intermedio (~15-20 páginas).
      - **PD+ (Detallada JEG):** Formato extendido (>60 páginas) con toda la carga narrativa.
      - PD- y PD= incluyen, al final, una página de previsión de planificación mensual (UD × mes, calculada igual que Sesiones › Avance de UD); PD+ todavía no la lleva.

> ¿Quieres saber exactamente qué campo de la app rellena cada apartado del documento? Consulta MagIA → Pestaña Análisis APP->PDx.

---

## 📅 Paso 3: Creación del curso (el cuándo y quién)

Ahora instanciamos la Programación en un año académico y clase real.

### 3.1. Iniciar un nuevo curso y grupo
- **Bloque:** General
  - **Página:** Inicio
    - **Pestaña:** Datos
      - **Botón:** "Iniciar curso (+ grupo)".
      - **Número:** Año académico (ej. 2025-26).
      - **Alfanumérico:** Letra / Grupo (ej. 1A-GM).
      - **Botón:** Crear ahora.

### 3.2. Configurar el calendario académico
- **Bloque:** Curso
  - **Página:** Calendario
    - **Pestaña:** Fechas y horario
      - **Fecha:** Inicio y fin de curso, y trimestres.
      - **Horario:** Horas lectivas diarias.
      - **Bloque:** "Periodo FEOE" (al final de la pestaña): inicio y fin de la Formación en empresa u organismo equiparado, tipo de dual y horas/día.
    - **Pestaña:** Eventos y festivos
      - **Fecha:** Festivos o celebraciones, con calendario interactivo para marcarlos con un clic.
      - **Nota:** Los hitos de Fechas generales (inicio/fin de curso y de cada trimestre) y el periodo FEOE aparecen aquí automáticamente, en gris y sin poder borrarse — cambian si cambias esas fechas, no aquí.
    - **Pestaña:** Mensual
      - **Acción:** Vista mensual y calendario interactivo con fechas clave y las sesiones planificadas.

### 3.3. Gestionar el alumnado
- **Bloque:** Curso
  - **Página:** Alumnado
    - **Pestaña:** Orientación
      - **Acordeones:** Orientación profesional por alumno/a, en dos secciones: "Motivación y experiencia" e "Intereses y aspiraciones". Se rellena al empezar el curso.
    - **Pestaña:** Matrícula
      - **Botón:** Importar CSV o añadir alumnado a mano.
    - **Pestaña:** Plano de aula
      - **Acción:** Arrastrar al alumnado a sus mesas.
    - **Pestaña:** Perfil
      - **Tablas:** Agregados y tendencias del perfil profesional del grupo (motivación, experiencia, aptitudes e intención al terminar) y tabla filtrable de todo el alumnado.

---

## 👨‍🏫 Paso 4: Tu día a día en el aula

### 4.1. Abrir tu clase
- **Bloque:** General
  - **Página:** Inicio
    - **Pestaña:** Datos
      - **Acción:** Haz doble clic sobre tu grupo, tu programación o tu curso guardados.

### 4.2. Ver tu resumen del día
- **Bloque:** Curso
  - **Página:** Calendario
    - **Pestaña:** Agenda
      - **Acción:** Resumen de las clases de hoy, contexto de la semana y desarrollo de la unidad didáctica en curso.

### 4.3. Registrar el día a día y la asistencia
- **Bloque:** Curso
  - **Página:** Sesiones
    - **Pestaña:** Asistencia
      - **Acordeones:** Lista de alumnado a la izquierda (con el estado del día seleccionado, que se cambia con un clic) y, por alumno/a, "Control de asistencia" (marca Presente, Falta o Retraso día a día) y "Acumulado trimestral" (faltas por trimestre y semáforo de pérdida de evaluación continua).
    - **Pestaña:** Lectivas
      - **Texto:** Redacta qué se ha hecho en la clase.
    - **Pestaña:** Abandono
      - **Bloque:** Resumen de riesgo de abandono (Indicador 1.5 del Sistema Estatal), calculado solo a partir de la asistencia y las notas; control de rendimiento académico (nota final < 5); y acumulado trimestral de faltas de todo el grupo con el semáforo de pérdida de evaluación continua.

> No hay pestaña de Tutoría: se eliminó por completo (2026-09-21) — ser tutor de un grupo se considera un rol ajeno a esta app.

### 4.4. Evaluación
- **Bloque:** Curso
  - **Página:** Calificaciones
    - **Pestaña:** Académicas
      - **Acordeones:** Por alumno/a, en dos secciones: "Notas" (teclea las notas y calcula al vuelo — es el único punto de entrada de calificaciones numéricas de la app) y "Empresa FEOE" (transcribe las valoraciones del tutor de empresa, 1-4, Anexo XI b, para los CE marcados FEOE en Currículo).
    - **Pestaña:** Trimestral
      - **Tablas:** Notas del grupo por instrumento y trimestre.
    - **Pestaña:** Reclamaciones
      - **Bloques:** "Cambios de nota" (registro de cada cambio, con fecha, agente y motivo) y "Reclamaciones" (registra y resuelve reclamaciones de nota, con generación de justificante).
  - **Página:** Cierre (mayormente de solo lectura, resume lo anterior)
    - **Pestaña:** Expediente
      - **Acordeones:** Por alumno/a: "Boletín individual de calificaciones" (con botón de impresión), "Informe de evidencias" (línea temporal de calificaciones, reclamaciones, asistencia y diario) e "Inserción laboral".
    - **Pestaña:** Mejora
      - **Acción:** Indicadores de calidad EQAVET y propuestas de mejora del módulo, de cara a la memoria final de curso.
    - **Pestaña:** Avance de UD
      - **Acción:** Planificación y seguimiento mensual de las unidades didácticas según lo impartido (UD × mes).
    - **Pestaña:** Progreso RA-UD
      - **Acción:** Una tarjeta por RA con la nota mínima, media y máxima del grupo, su avance, sus horas y el estado de sus UD: completada, en curso o pendiente; los RA sin docencia todavía aparecen atenuados.

---

## 📊 Paso 5: Descargar la documentación del curso

Exporta informes, actas, y seguimiento.

- **Página:** MagIA
  - **Pestaña:** Curso
    - **Bloque "Grupo":** Calendario académico y Plano de aula (ubicación del alumnado) — ambos en "Vista previa .pdf" / "Descarga editable .docx".
    - **Bloque "Clases mensual - por UD":** Seguimiento diario, Clases por UD, Planificación (previsto/impartido) y Parte de incidencias (justificante de una falta concreta, con selector de alumno/a, fecha y motivo).
    - **Bloque "Boletines y actas de evaluación":** Por cada trimestre y la Final: PDF/DOCX del boletín grupal, Acta de evaluación firmable (PDF/DOCX) y exportación Excel/CSV.
    - **Bloque "Alumnado individual":** Boletín individual y Ficha individual (matrícula + asistencia) por alumno/a.

> El Informe EQAVET (indicadores de calidad + propuestas de mejora) ya no se descarga desde aquí: vive en Cierre → Pestaña Mejora.

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Qué diferencia hay entre los 3 niveles de Programación Didáctica (PD-, PD=, PD+)?
Cuaderno FP genera el mismo contenido base en 3 niveles de detalle:
- **PD- (Resumen):** Resumen de 1-2 hojas para entregar al alumnado.
- **PD= (Simplificada):** Sigue la estructura normativa oficial (14 apartados A-N, formato BOA/Aragón vigente desde sept. 2025), unas 15-20 páginas, ideal para jefatura.
- **PD+ (Detallada JEG):** Programación completa (TFM/Oposiciones) de más de 60 páginas con metodologías expandidas.

Consulta `MagIA` → Pestaña `Análisis APP->PDx` para ver el mapa completo campo a campo entre la app y cada uno de los tres niveles.

### ¿Qué son los campos "codificados"?
En lugar de escribir texto genérico, seleccionas opciones de una lista. El sistema redactará automáticamente párrafos enteros, coherentes y normativos en tu PD final.

### ¿Cómo sabe el sistema el nombre de mi Centro Educativo?
Lo tecleas en **Programación › Contexto › Identificación**. El sistema lo usará en todo el documento.

### ¿Cómo indico si mi módulo es Dual?
En **Curso › Calendario › Periodo FEOE**. Podrás ajustar el tipo de dual, la docencia y las fechas.

---

## 📚 Anexo: Catálogo de Elementos a Codificar

### A.1 Metodologías Activas
- **[ABP]** Aprendizaje Basado en Proyectos
- **[ABR]** Aprendizaje Basado en Retos
- **[FLIP]** Flipped Classroom (Aula Invertida)
- **[COLAB]** Aprendizaje Cooperativo / Colaborativo
- **[SIM]** Simulación de Entornos Profesionales (Role-playing)
- **[CASOS]** Método del Caso
- **[GAMIF]** Gamificación / Aprendizaje Basado en Juegos
- **[ApS]** Aprendizaje-Servicio
- **[DEMO]** Demostración Práctica
- **[MAGIS]** Exposición Didáctica Interactiva apoyada en TIC

### A.2 Procedimientos e Instrumentos de Evaluación
- **[PRU-OBJ]** Prueba objetiva escrita (Test, preguntas cortas)
- **[PRU-EJEC]** Prueba de ejecución / Desempeño práctico
- **[RUBR]** Rúbrica de evaluación
- **[COTEJO]** Lista de control / Cotejo
- **[ESCALA]** Escala de valoración (Likert)
- **[PORTF]** Portfolio / Cuaderno del alumno
- **[DIARIO]** Diario de aprendizaje
- **[DEF-ORAL]** Exposición y defensa oral
- **[AUTOEVAL]** Autoevaluación del alumnado
- **[COEVAL]** Coevaluación entre pares

### A.3 Medidas de Respuesta Educativa para la Inclusión
- **[NIVEL]** Actividades multinivel
- **[AGRUP]** Agrupamientos flexibles y tutoría entre iguales
- **[TIEMPO]** Flexibilización en tiempos de ejecución
- **[MATERIAL]** Adaptación de materiales
- **[ACNS]** Adaptaciones Curriculares No Significativas
- **[AMPLIA]** Actividades de ampliación para Altas Capacidades

### A.4 Plan de Contingencia
- **[CONT-ASINC]** Docencia telemática asíncrona (Aula Virtual)
- **[CONT-SINC]** Docencia telemática síncrona (Videoconferencia)
- **[CONT-AUT]** Dosier de tareas autoguiadas

### A.5 Recursos y Espacios
- **[REC-AULA]** Aula polivalente / Aula técnica
- **[REC-TALLER]** Taller específico / Laboratorio
- **[REC-INFO]** Aula de informática
- **[REC-SOFT]** Software y simuladores específicos
- **[REC-EVA]** Entorno Virtual de Aprendizaje (Aules, Moodle)
- **[REC-BIBLIO]** Manuales y documentación técnica
- **[REC-EPI]** Equipos de Protección Individual (EPIs)

### A.6 Actividades Complementarias y Extraescolares
- **[EXT-VISITA]** Visitas técnicas a empresas del sector
- **[EXT-CHARLA]** Charlas / Masterclass con expertos profesionales
- **[EXT-FERIA]** Asistencia a ferias tecnológicas o sectoriales
- **[EXT-SKILLS]** Participación en competiciones de FP (Skills)

### A.7 Elementos Transversales
- **[TRANS-ODS]** Objetivos de Desarrollo Sostenible (Agenda 2030)
- **[TRANS-IGUALDAD]** Igualdad de género y corresponsabilidad
- **[TRANS-PRL]** Cultura de Prevención de Riesgos Laborales
- **[TRANS-TIC]** Fomento de la competencia digital y buen uso de internet
- **[TRANS-EMP]** Emprendimiento e iniciativa emprendedora
