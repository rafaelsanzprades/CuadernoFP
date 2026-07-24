# 🚀 Guía de inicio rápido: ¿Por dónde empiezo?

¡Bienvenido a CuadernoFP! Esta guía te va a llevar de la mano, paso a paso, para que configures tu curso desde cero sin perderte.
Además, debajo de cada explicación encontrarás un árbol súper detallado indicándote exactamente dónde tienes que hacer clic en la interfaz.

---

## 🤖 Paso 0: Instrucciones para el asistente IA (system prompt)

Eres el asistente virtual integrado en **CuadernoFP**. Tu objetivo es guiar al profesorado paso a paso en la configuración inicial de su curso escolar, solicitándole la información necesaria de forma conversacional y estructurada.

- **Contexto y Acceso:**
- **Plataforma:** Actúas sobre la web `cuadernofp.web.app` (no requiere usuario ni contraseña, los datos residen localmente).
- **Propósito:** Debes utilizar el resto de esta guía (Pasos 1 al 6) como tu mapa exacto de la interfaz para saber qué campos rellenar, qué botones pulsar y en qué pantallas navegar.

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
  - **Bloques:** 3 Bloques principales (General, Programación, Curso) con 6 páginas cada uno.

Una vez tengas el contexto necesario, comienza a guiar al usuario o ejecuta las acciones detalladas desde el **Paso 1** en adelante.

---

## 🛠️ Paso 1: Creación y configuración (el qué)

El primer paso es crear el "molde" o plantilla curricular de tu módulo a partir de la normativa, y personalizarlo con tu forma de evaluar.

### 1.1. Iniciar desde el catálogo oficial
Vamos a pedirle al sistema que nos cree el archivo base de la programación cargando automáticamente la ley.

- **Apartado:** General
  - **Página:** Catálogo
    - **Pestaña:** Comunidades
      - **Acción:** Selecciona tu Comunidad Autónoma en el mapa interactivo (o en la tabla) para cargar la normativa autonómica específica.
    - **Pestaña:** Grados
      - **Bloque:** Grados del A al E
        - **Botón:** Grado D.
    - **Pestaña:** Familias
      - **Bloque:** Navegación oficial
        - **Texto:** Familia profesional. Haz clic en la tarjeta de tu familia.
    - **Pestaña:** Títulos
      - **Bloque:** Selección de título
        - **Selector:** Título. Selecciona tu ciclo formativo.
    - **Pestaña:** Módulos
      - **Bloque:** Lista de Módulos
        - **Botón:** "Nueva Programación". Haz clic en el botón azul para crearlo.

### 1.2. Configurar el contexto y los datos generales
- **Apartado:** Programación
  - **Página:** Contexto
    - **Pestaña:** Datos
      - **Bloque:** Centro y docente
        - **Texto:** Centro educativo y Profesorado.
    - **Pestaña:** Entorno
      - **Bloque:** Contexto escolar y social.
    - **Pestaña:** Inclusión
      - **Selector:** Medidas de Inclusión.
    - **Pestaña:** FEOE y Dual
      - **Selector:** Régimen General o Intensivo y Entorno Profesional.

### 1.3. Definir el currículo y las unidades didácticas
- **Apartado:** Programación
  - **Página:** Currículo
    - **Pestaña:** RA y CE
      - **Número:** Asignar la ponderación % de cada RA y CE.
    - **Pestaña:** Unidades
      - **Botón:** "Añadir nueva UD". Crea los temas.
      - **Tabla:** Haz clic en la intersección de la UD con el RA al que contribuye.
    - **Pestaña:** Relación
      - **Tabla:** Verifica que la distribución de temas cuadra.

### 1.4. Metodología
- **Apartado:** Programación
  - **Página:** Metodología
    - **Pestaña:** Estrategias
      - **Selector:** Metodologías Activas (ABP, Retos, etc.).
    - **Pestaña:** Recursos
      - **Texto:** Descripción de espacios y materiales.
    - **Pestaña:** Planes
      - **Texto:** Planes de centro y Plan de contingencia.

### 1.5. Instrumentos de Evaluación
- **Apartado:** Programación
  - **Página:** Evaluación
    - **Pestaña:** Criterios y Ponderación
      - **Número:** Configura redondeo y compensaciones.
    - **Pestaña:** Instrumentos
      - **Botón:** "Añadir Instrumento". Exámenes, prácticas, etc.

### 1.6. Secuenciación (Programación de aula)
- **Apartado:** Programación
  - **Página:** Secuenciación
    - **Pestaña:** Sesiones
      - **Botón:** "+". Añade sesiones por UD.
    - **Pestaña:** Tareas
      - **Botón:** "Añadir Tarea Competencial".

---

## 💾 Paso 2: Descargar la programación oficial

Una vez configurada la programación base, genera los PDFs oficiales.

- **Apartado:** Programación
  - **Página:** Magia
    - **Pestaña:** Programación
      - **Bloque:** Documentos Oficiales
        - **Botones PD:** Dispones de tres niveles:
          1. **PD Mínima (Alumnado):** Resumen de 1-2 folios.
          2. **PD Suficiente (Oficial):** Formato intermedio (~10-15 páginas).
          3. **PD Detallada:** Formato extendido (>60 páginas) con toda la carga narrativa.
        - **Botón:** Descargar DOCX / PDF en la tarjeta del modelo deseado.

---

## 📅 Paso 3: Creación del curso (el cuándo y quién)

Ahora instanciamos la Programación en un año académico y clase real.

### 3.1. Iniciar un nuevo curso y grupo
- **Apartado:** General
  - **Página:** Archivos
    - **Tarjeta:** Cursos
      - **Botón:** Iniciar Curso (+ Grupo).
      - **Número:** Año Académico (ej. 2025-26).
      - **Alfanumérico:** Letra / Grupo (ej. 1A-GM).
      - **Botón:** Crear ahora.

### 3.2. Configurar el calendario académico
- **Apartado:** Curso
  - **Página:** Calendario
    - **Pestaña:** Fechas
      - **Fecha:** Inicio y fin de curso, y trimestres.
      - **Horario:** Horas lectivas diarias.
    - **Pestaña:** Eventos
      - **Fecha:** Festivos o celebraciones.
    - **Pestaña:** Visual
      - **Acción:** Marca en el calendario rápido los festivos.

### 3.3. Gestionar el alumnado
- **Apartado:** Curso
  - **Página:** Alumnado
    - **Pestaña:** Listado
      - **Botón:** Importar CSV o Añadir Alumnado a mano.
    - **Pestaña:** Plano
      - **Acción:** Arrastrar a el alumnado a sus mesas.
    - **Pestaña:** Contexto
      - **Texto:** Describe el ambiente de la clase.

---

## 👨‍🏫 Paso 4: Tu día a día en el aula

### 4.1. Abrir tu clase
- **Apartado:** General
  - **Página:** Archivos
    - **Acción:** Haz DOBLE CLIC sobre tu grupo.

### 4.2. Anotar el Diario
- **Apartado:** Curso
  - **Página:** Diario
    - **Pestaña:** Diario de Aula
      - **Casilla:** Sin Docencia o Público.
      - **Texto:** Redacta qué se ha hecho en la clase.

### 4.3. Seguimiento y Asistencia
- **Apartado:** Curso
  - **Página:** Seguimiento
    - **Pestaña:** Tutoría
      - **Acción:** Registra tutorías con alumnos.
    - **Pestaña:** Asistencia
      - **Botón:** Marca Falta, Retraso o Justificado.
    - **Pestaña:** Alerta Abandono
      - **Acción:** Activa protocolos de abandono.

### 4.4. Evaluación
- **Apartado:** Curso
  - **Página:** Calificaciones
    - **Pestaña:** Matriz
      - **Tabla:** Teclea las notas y calcula al vuelo.
    - **Pestaña:** Detalle
      - **Acción:** Expande cada alumnado para ver la consecución de sus RAs.

---

## 📊 Paso 5: Descargar la documentación del curso

Exporta informes, actas, y seguimiento.

- **Apartado:** Curso
  - **Página:** Informes
    - **Pestaña:** Curso
      - **Bloque:** Grupo
        - **Botones:** PDF Calendario y Alumnado Ubicación.
      - **Bloque:** Clases mensual - por UD
        - **Botones:** PDF Seguimiento y Clases por UD.
      - **Bloque:** Boletines grupales trimestrales
        - **Botones:** PDF Boletín y Excel/CSV (1T, 2T, 3T, Final).
      - **Bloque:** Boletines individuales
        - **Botón:** PDF Boletín individual.

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Qué diferencia hay entre los 3 niveles de Programación Didáctica (PD-, PD=, PD+)?
CuadernoFP genera el mismo contenido base en 3 niveles de detalle:
- **PD Mínima (PD-):** Resumen de 1-2 hojas para entregar al alumnado.
- **PD Suficiente (PD=):** Sigue la estructura normativa con unos 15 folios, ideal para jefatura.
- **PD Detallada (PD+):** Programación completa (TFM/Oposiciones) de más de 60 páginas con metodologías expandidas.

### ¿Qué son los campos "codificados"?
En lugar de escribir texto genérico, seleccionas opciones de una lista. El sistema redactará automáticamente párrafos enteros, coherentes y normativos en tu PD final.

### ¿Cómo sabe el sistema el nombre de mi Centro Educativo?
Lo tecleas en **Programación > Contexto > Datos**. El sistema lo usará en todo el documento.

### ¿Cómo indico si mi módulo es Dual?
En **Programación > Contexto > FEOE y Dual**. Podrás ajustar los porcentajes que asume la empresa y el régimen.

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
