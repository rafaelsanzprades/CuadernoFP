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
  - **Bloques:** 3 bloques principales — `Grupo` (Agenda, Archivo, Normativa, Catálogo), `Programación` (el diseño teórico del módulo) y `Curso` (el aula real) — con 3 a 5 páginas cada uno, más un grupo de páginas de acceso directo fuera de los bloques (`Inicio`, `Ayuda`, `Equivalencia`, `MagIA`, `Legal`). Esta misma guía vive dentro de `MagIA`, pestaña `Guía`.

Una vez tengas el contexto necesario, comienza a guiar al usuario o ejecuta las acciones detalladas desde el **Paso 1** en adelante.

---

## 🛠️ Paso 1: Creación y configuración (el qué)

El primer paso es crear el "molde" o plantilla curricular de tu módulo a partir de la normativa, y personalizarlo con tu forma de evaluar.

### 1.1. Iniciar desde el catálogo oficial
Vamos a pedirle al sistema que nos cree el archivo base de la programación cargando automáticamente la ley.

- **Bloque:** Grupo
  - **Página:** Normativa
    - **Pestaña:** Autonomías
      - **Acción:** Selecciona tu Comunidad Autónoma en el mapa interactivo para cargar la normativa autonómica específica.
  - **Página:** Catálogo
    - **Pestaña:** Familias
      - **Acción:** Haz clic en la tarjeta de tu familia profesional.
    - **Pestaña:** Títulos
      - **Selector:** Familia profesional y Título. Selecciona tu ciclo formativo.
    - **Pestaña:** Módulos
      - **Botón:** "Nueva programación", en el módulo deseado dentro de su curso (1º/2º).

### 1.2. Configurar el contexto y los datos generales
- **Bloque:** Programación
  - **Página:** Contexto
    - **Pestaña:** Identificación
      - **Texto:** Centro educativo y Profesorado.
    - **Pestaña:** Contextualización
      - **Bloque:** Entorno geográfico, socioeconómico y contexto escolar.
    - **Pestaña:** Dual FEOE
      - **Bloque:** Modalidad, seguimiento y régimen dual de la Formación en Empresa u Organismo Equiparado (FEOE).
    - **Pestaña:** Evaluación y calificación
      - **Bloque:** Información al alumnado, pérdida de evaluación continua y recuperación.

> La atención a la diversidad ya no vive en Contexto: está en `Programación` › `Metodología` → Pestaña `Metodología e inclusión` (ver 1.4).

### 1.3. Definir el currículo, las unidades didácticas y las tareas competenciales
- **Bloque:** Programación
  - **Página:** Currículo
    - **Pestaña:** Contribución RA en OG
      - **Matriz:** Contribución de cada RA a los Objetivos Generales del título.
    - **Pestaña:** Ponderación RA y CE
      - **Número:** Asignar el % de cada RA y de cada CE.
    - **Pestaña:** Unidades didácticas
      - **Botón:** "Añadir nueva UD". Crea los temas.
      - **Tabla:** Haz clic en la intersección de la UD con el RA al que contribuye.
      - **Bloque:** Secuenciación de UD (arrastra para reordenar sesiones) y tabla resumen de relaciones RA-UD para verificar de un vistazo qué UD cubre cada RA — todo dentro de esta misma pestaña.
    - **Pestaña:** Tareas competenciales
      - **Botón:** "Añadir nueva tarea competencial".
      - **Selector:** Instrumento (codificado) con el que se evalúa cada tarea.

### 1.4. Metodología
- **Bloque:** Programación
  - **Página:** Metodología
    - **Pestaña:** Metodología e inclusión
      - **Selector:** Metodologías Activas (ABP, Retos, etc.) y medidas de atención a la diversidad, en la misma pestaña.
    - **Pestaña:** Recursos
      - **Selector:** Recursos y espacios necesarios (aula, taller, software...) y catálogo de instrumentos de evaluación.
    - **Pestaña:** Plan de contingencia
      - **Texto:** Docencia telemática, tareas autoguiadas.
    - **Pestaña:** Transversales, competencias y actividades
      - **Texto:** Proyectos de innovación e interdisciplinariedad.

### 1.5. Instrumento de Evaluación
- **Bloque:** Programación
  - **Página:** Instrumento
    - **Pestaña:** Resumen
      - **Número:** Configura redondeo y compensaciones.
    - **Pestañas:** 1º/2º/3º Trimestre
      - **Botón:** "Añadir Instrumento". Exámenes, prácticas, rúbricas...

---

## 💾 Paso 2: Descargar la programación oficial

Una vez configurada la programación base, genera los PDFs oficiales.

- **Página:** MagIA
    - **Pestaña:** Programación
      - **Acordeón por Comunidad Autónoma:** Aragón viene abierta por defecto; el resto muestra "próximamente".
      - **Botones PD ARAGÓN:** Dispones de tres niveles, siempre en `.docx` editable:
        1. **PD- (Resumen):** Resumen de 1-2 folios para el alumnado.
        2. **PD= (Simplificada):** Formato oficial intermedio (~10-15 páginas).
        3. **PD+ (Detallada JEG):** Formato extendido (>60 páginas) con toda la carga narrativa.

           PD- y PD= incluyen, al final, una página de previsión de planificación mensual (UD × mes,
           calculada igual que `Agenda` › `Planificación`); PD+ todavía no la lleva.
      - **Bloque "Documentos de apoyo al currículo":** Matriz RA ↔ UD, en PDF ("Vista previa") o DOCX ("Descarga editable").
      - **Bloque "Unidades didácticas y tareas competenciales":** selector para descargar el `.docx` de una UD o una tarea concreta.

> ¿Quieres saber exactamente qué campo de la app rellena cada apartado del documento? Consulta `Equivalencia` (acceso directo, junto a Inicio y Ayuda).

---

## 📅 Paso 3: Creación del curso (el cuándo y quién)

Ahora instanciamos la Programación en un año académico y clase real.

### 3.1. Iniciar un nuevo curso y grupo
- **Bloque:** Grupo
  - **Página:** Archivo
    - **Pestaña:** Datos
      - **Botón:** Iniciar Curso (+ Grupo).
      - **Número:** Año Académico (ej. 2025-26).
      - **Alfanumérico:** Letra / Grupo (ej. 1A-GM).
      - **Botón:** Crear ahora.

### 3.2. Configurar el calendario académico
- **Bloque:** Curso
  - **Página:** Calendario
    - **Pestaña:** Fechas y horario
      - **Fecha:** Inicio y fin de curso, y trimestres.
      - **Horario:** Horas lectivas diarias.
    - **Pestaña:** Periodo FEOE
      - **Fecha:** Inicio y fin de la Formación en Empresa u Organismo Equiparado, tipo de dual y horas/día.
    - **Pestaña:** Eventos y festivos
      - **Fecha:** Festivos o celebraciones, con calendario interactivo para marcarlos con un clic.
      - **Nota:** Los hitos de Fechas generales (inicio/fin de curso y de cada trimestre) y el periodo
        FEOE aparecen aquí automáticamente, en gris y sin poder borrarse — cambian si cambias esas
        fechas, no aquí.
    - **Pestaña:** Actividades extraescolares
      - **Acción:** Registra actividades complementarias y extraescolares.

### 3.3. Gestionar el alumnado
- **Bloque:** Curso
  - **Página:** Alumnado
    - **Pestaña:** Matrícula
      - **Botón:** Importar CSV o Añadir Alumnado a mano.
    - **Pestaña:** Plano de clase
      - **Acción:** Arrastrar al alumnado a sus mesas.
    - **Pestaña:** Perfil del grupo
      - **Texto:** Describe el ambiente de la clase.

---

## 👨‍🏫 Paso 4: Tu día a día en el aula

### 4.1. Abrir tu clase
- **Bloque:** Grupo
  - **Página:** Archivo
    - **Acción:** Haz DOBLE CLIC sobre tu grupo.

### 4.2. Registrar el día a día y la asistencia
- **Bloque:** Curso
  - **Página:** Seguimiento
    - **Pestaña:** Clases
      - **Texto:** Redacta qué se ha hecho en la clase.
    - **Pestaña:** Asistencia
      - **Botón:** Marca Falta, Retraso o Justificado.

### 4.3. Tutoría y prevención de abandono
- **Bloque:** Curso
  - **Página:** Alumnado
    - **Pestaña:** Tutoría y alertas
      - **Acción:** Registra tutorías con el alumnado y activa protocolos de prevención de abandono.

### 4.4. Evaluación
- **Bloque:** Curso
  - **Página:** Seguimiento
    - **Pestaña:** Progreso de RA y UD
      - **Tablas:** Rendimiento medio por trimestre y por RA.
    - **Pestaña:** Detalle por alumnado
      - **Tabla:** Teclea las notas y calcula al vuelo — es el único punto de entrada de calificaciones numéricas de la app.
  - **Página:** Calificación *(solo lectura, resume lo anterior)*
    - **Pestaña:** Resumen
      - **Tablas:** Panel global de rendimiento y calificaciones medias.
    - **Pestaña:** Estadísticas
      - **Gráficos:** Estadísticas globales del aula.
    - **Pestañas:** Grupal e Individual
      - **Acción:** Generación de informes (boletines y actas).

---

## 📊 Paso 5: Descargar la documentación del curso

Exporta informes, actas, y seguimiento.

- **Página:** MagIA
    - **Pestaña:** Curso
      - **Bloque "Grupo":** Calendario académico y Plano de aula (ubicación del alumnado) — ambos en "Vista previa .pdf" / "Descarga editable .docx".
      - **Bloque "Clases mensual - por UD":** Seguimiento diario, Clases por UD, Planificación (previsto/impartido) y Parte de incidencias (justificante de una falta concreta, con selector de alumno/a, fecha y motivo).
      - **Bloque "Boletines y actas de evaluación":** por cada trimestre y la Final: PDF/DOCX del boletín grupal, Acta de evaluación firmable (PDF/DOCX) y exportación Excel/CSV.
      - **Bloque "Alumnado individual":** Boletín individual y Ficha individual (matrícula + tutoría) por alumno/a.

> El Informe EQAVET (indicadores de calidad + propuestas de mejora) ya no se descarga desde aquí: vive en `Inicio` → Pestaña `Mejora`.

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Qué diferencia hay entre los 3 niveles de Programación Didáctica (PD-, PD=, PD+)?
Cuaderno FP genera el mismo contenido base en 3 niveles de detalle:
- **PD- (Resumen):** Resumen de 1-2 hojas para entregar al alumnado.
- **PD= (Simplificada):** Sigue la estructura normativa oficial (17 apartados A-Q), con unos 15 folios, ideal para jefatura.
- **PD+ (Detallada JEG):** Programación completa (TFM/Oposiciones) de más de 60 páginas con metodologías expandidas.

Consulta `Equivalencia` (acceso directo, junto a Inicio y Ayuda) para ver el mapa completo campo a campo entre la app y cada uno de los tres niveles.

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
