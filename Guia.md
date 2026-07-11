# 🚀 Guía de inicio rápido: ¿Por dónde empiezo?

¡Bienvenido a CuadernoFP! Esta guía te va a llevar de la mano, paso a paso, para que configures tu curso desde cero sin perderte.
Además, debajo de cada explicación encontrarás un árbol súper detallado (indentado línea a línea) indicándote exactamente dónde tienes que hacer clic en la interfaz.

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
  - **Curso:** Es la "instancia" real (.fpc). Representa a el alumnado físico, sus calificaciones, faltas de asistencia y calendario en un año académico específico (ej. 2025-26).
  - **Grupo:** Es la agrupación virtual en el Área de Trabajo que abre la Programación y el Curso a la vez.

Una vez tengas el contexto necesario, comienza a guiar al usuario o ejecuta las acciones detalladas desde el **Paso 1** en adelante.

---

## 🛠️ Paso 1: Creación y configuración (el qué)

El primer paso es crear el "molde" o plantilla curricular de tu módulo a partir de la normativa, y personalizarlo con tu forma de evaluar.

### 1.1. Iniciar desde el catálogo oficial
Vamos a pedirle al sistema que nos cree el archivo base de la programación cargando automáticamente la ley (resultados de aprendizaje y Criterios). No tienes que teclear nada de BOEs, ¡el sistema lo hace por ti!

- **Apartado:** General (barra lateral superior)
  - **Página:** Catálogo [🔗](https://cuadernofp.web.app/catalogo)
    - **Pestaña:** Grados
      - **Bloque:** Grados del A al E
        - **Botón:** Grado D. Haz clic sobre el Grado correspondiente, D corresponde a Ciclos formativos.
    - **Pestaña:** Familias
      - **Bloque:** Navegación oficial
        - **Texto:** Familia profesional. Haz clic en la tarjeta de tu familia, ej. Informática.
    - **Pestaña:** Títulos
      - **Bloque:** Selección de título
        - **Selector:** Título. Selecciona tu ciclo formativo en el desplegable.
    - **Pestaña:** Módulos
      - **Bloque:** Lista de Módulos
        - **Botón:** "Nueva Programación". Haz clic en el botón azul junto a tu módulo para crearlo.
    - **Pestaña:** RA → CE
      - **Bloque:** Estructura del módulo
        - **Texto:** Visualización. Comprueba el árbol de resultados de aprendizaje y criterios de evaluación.
    - **Pestaña:** Autores
      - **Bloque:** Propuestas didácticas
        - **Botón:** Importar. Permite cargar una propuesta de editorial pre-empaquetada en formato .fpp.

### 1.2. Configurar el módulo didáctico
Una vez creada la programación base (que verás activa en la pantalla de [Archivos](/archivos)), vamos a darle tu toque personal: tu instituto, tu metodología y cómo ponderas los exámenes frente a las prácticas.

- **Apartado:** Programación [Código del módulo]
  - **Página:** Módulo didáctico [🔗](https://cuadernofp.web.app/modulo)
    - **Pestaña:** Datos
      - **Bloque:** Centro y docente
        - **Texto:** Centro educativo. Teclea el nombre de tu instituto.
        - **Texto:** Profesorado. Teclea tu nombre completo.
      - **Bloque:** % Ponderación por trimestres
        - **Número:**  y 3er trimestre (%). Teclea los porcentajes hasta que sumen 100.
      - **Bloque:** % Instrumentos de evaluación
        - **Número:** , Prácticas, Informes y Tareas. Asigna el peso global de cada uno hasta sumar 100.
      - **Bloque:** Reglas de redondeo y compensación
        - **Número:**  para aprobar. Teclea la nota de corte, ej. 5.0.
        - **Número:**  al alza. Teclea desde qué nota redondeas al aprobado, ej. 4.8.
    - **Pestaña:** Contexto
      - **Bloque:** Contexto escolar
        - **Texto:** Instalaciones, Horario lectivo, Equipo docente y Contexto socioeconómico. Describe los detalles de tu centro.
      - **Bloque:** Alumnado (ACNEAE)
        - **Texto:** Inclusión, Elenco y Circunstancias. Redacta las necesidades de diversidad.
      - **Bloque:** Configuración del aula
        - **Texto:** Metodología y Atención a la diversidad. Redacta tus estrategias generales.
    - **Pestaña:** Planes
      - **Bloque:** Planes y Programas
        - **Texto:** Descripción. Describe cómo se integra tu módulo en los planes del centro, ej. Plan de Lectura o Bilingüismo.
    - **Pestaña:** FEOE
      - **Bloque:** Entorno Profesional y Dual
        - **Texto:** Descripción. Describe la conexión con las empresas locales y la organización de la fase en empresa.
    - **Pestaña:** Metodología
      - **Bloque:** Estrategias metodológicas
        - **Texto:** Descripción. Redacta las metodologías activas y métodos pedagógicos aplicados en el aula.
    - **Pestaña:** Recursos
      - **Bloque:** Criterios de calificación y Materiales
        - **Texto:** Descripción. Especifica los procedimientos de evaluación y los recursos didácticos necesarios.
    - **Pestaña:** Transversales
      - **Bloque:** Elementos transversales y complementarios
        - **Texto:** Descripción. Añade actividades extraescolares o temas transversales como la educación ambiental.

### 1.3. Definir las matrices y unidades didácticas
Aquí vamos a definir qué temas o Unidades de Trabajo (UD) vas a dar a lo largo del año, y cruzarlos con los resultados de aprendizaje de la ley para decirle al sistema qué peso tiene cada tema.

- **Apartado:** Programación [Código del módulo]
  - **Página:** Matrices OG→RA→CE→UD/T [🔗](https://cuadernofp.web.app/matrices)
    - **Pestaña:** RA y CE
      - **Bloque:** RA. Resultados de aprendizaje
        - **Número:**. Asignar la ponderación % de cada RA, la suma es 100% e indicar cuales se desarrollan, aunque sea parcialmente en la FEOE.
      - **Bloque:** CE. Criterios de evaluación
        - **Número:**. Verificar la ponderación % media para cada CE dentro de cada RA, la suma para cada RA es 100%.
    - **Pestaña:** Unidades
      - **Bloque:** Lista de Unidades
        - **Botón:** "Añadir nueva UD". Haz clic para crear un nuevo tema.
        - **Número:**. Teclea la duración estimada del tema.
        - **Texto:** Unidad Didáctica o de Trabajo. Teclea el nombre del tema.
        - **Tabla:**  de RA. Haz clic en la intersección de la UD con el RA al que contribuye y teclea su porcentaje.
    - **Pestaña:** Relación RA-UD
      - **Bloque:** Resumen de relaciones
        - **Tabla:**. Verifica que la distribución de temas y pesos asignados a cada RA cuadra correctamente.
    - **Pestaña:** Contribución OG
      - **Bloque:** Matriz de Objetivos Generales
        - **Tabla:**  de OG. Haz clic en la intersección para asignar en qué contribuye cada Resultado de Aprendizaje (RA) del módulo a los Objetivos Generales (OG) del Título.

### 1.4. Instrumentos de evaluación
En este paso configuramos las "herramientas" que vas a usar para poner notas reales en cada trimestre (exámenes, libretas, proyectos...) y a qué Criterio de Evaluación ataca cada una.

- **Apartado:** Programación [Código del módulo]
  - **Página:** Instrumentos de evaluación [🔗](https://cuadernofp.web.app/instrumentos)
    - **Pestaña:** 1º Trimestre. Deberás repetir el proceso en el 2º y 3º Trimestre, y consultar el Resumen.
      - **Bloque:** Lista de Instrumentos
        - **Botón:** "Añadir Instrumento/Actividad". Haz clic para crear un examen o tarea.
        - **Selector:** Tipo. Selecciona entre Teoria, Practica, Informes, Tareas o Recuperacion.
        - **Texto:** Instrumento / Actividad. Ponle nombre, ej. "Examen parcial de redes".
        - **Número:** % Pond. Teclea cuánto pesa esta actividad.
        - **Casilla:** Casillas de CE. Marca con un tick los criterios de evaluación que se evalúan en esta prueba específica.

### 1.5. Secuenciación (Programación de aula)
Por último, vamos a planificar el día a día bajando a la tierra. ¿Qué vas a dar en la sesión 1? ¿Y en la sesión 2?

- **Apartado:** Programación [Código del módulo]
  - **Página:** Secuenciación [🔗](https://cuadernofp.web.app/programacion)
    - **Pestaña:** Secuenciación
      - **Bloque:** Tabla de Sesiones
        - **Botón:** "+". Haz clic para añadir clases/sesiones dentro de una UD específica.
        - **Texto:** Contenidos y Recursos. Describe brevemente qué vas a explicar o usar ese día específico.
    - **Pestaña:** Tareas (TC) [🔗](https://cuadernofp.web.app/programacion?tab=tareas)
      - **Bloque:** Diseño de tareas
        - **Botón:** "Añadir Tarea Competencial". Opcional: Crea un reto o proyecto integrador de evaluación para tu alumnado.

---

## 💾 Paso 2: Descargar la programación oficial

Una vez configurada la programación base, puedes exportar los documentos oficiales correspondientes al módulo.

### 2.1. Programación completa o esquema (matrices)
Aquí puedes obtener tanto el documento extenso y detallado como un cuadro resumen para tener una visión rápida de tus unidades didácticas y resultados de aprendizaje.

- **Apartado:** General (barra lateral superior)
  - **Página:** Descargas [🔗](https://cuadernofp.web.app/descargas)
    - **Pestaña:** Programación [🔗](https://cuadernofp.web.app/descargas?tab=programacion)
      - **Bloque:** Documentos Oficiales
        - **Botón:** Descargar DOCX / PDF. Obtén tu programación didáctica oficial completísima.
        - **Botón:** PDF Matrices. Descarga el cuadro resumen de RA y UD.

### 2.2. Documentos de gestión del profesoradoado
En esta sección puedes descargar herramientas adicionales de uso diario, como calendarios y previsiones temporales.

- **Apartado:** General (barra lateral superior)
  - **Página:** Descargas [🔗](https://cuadernofp.web.app/descargas)
    - **Pestaña:** Programación
      - **Bloque:** Secuenciación
        - **Botón:** PDF Planificación. Descarga el cronograma de horas por mes.

---

## 📅 Paso 3: Creación del curso (el cuándo y quién)

Ahora vamos a instanciar la Programación que acabas de crear en un año académico y clase de alumnado real.

### 3.1. Iniciar un nuevo curso y grupo
Vamos a decirle a CuadernoFP en qué año estamos y cómo se llama la clase.

- **Apartado:** Barra lateral (arriba)
  - **Modo:** REALES. Verifica que el botón REALES esté seleccionado.
  - **Botón:** Archivos
    - **Tarjeta:** Cursos (Verde)
      - **Botón:** Iniciar Curso (+ Grupo). Haz clic para abrir el asistente.
      - **Número:** Año Académico. Teclea el curso actual, ej. 2025-26.
      - **Alfanumérico:** Letra / Grupo. Teclea el identificador, ej. 1A-GM.
      - **Botón:** Crear ahora. Haz clic para generar el curso y enlazarlo a tu programación creando un "Grupo".

### 3.2. Configurar el calendario académico
Marca los trimestres, las evaluaciones y los días que no hay clase para que la agenda funcione perfectamente.

- **Apartado:** Curso [Año]
  - **Página:** Calendario académico [🔗](https://cuadernofp.web.app/calendario)
    - **Pestaña:** Fechas [🔗](https://cuadernofp.web.app/calendario?tab=fechas)
      - **Bloque:** Fechas generales
        - **Botón:** Autodetectar. Haz clic para intentar autocompletar.
        - **Fecha:** Inicio de curso, Inicio clases (1T), Fin clases (3T), Fin de curso. Despliega los calendarios y marca las fechas correspondientes.
      - **Bloque:** Horario semanal
        - **Número:** Lun, Mar, Mié, Jue, Vie. Teclea cuántas horas de clase tienes cada día.
      - **Bloque:** Trimestres
        - **Fecha:** Inicio y Fin. Marca las fechas exactas para el 1er, 2º y 3er trimestre.
      - **Bloque:** FP Dual (FEOE)
        - **Selector:** Tipo de Dual y Docencia. Selecciona en los desplegables el régimen aplicable.
        - **Fecha:** Inicio FEOE, Fin FEOE, Horas/día FEOE. Completa las fechas y carga horaria si aplica.
    - **Pestaña:** Eventos [🔗](https://cuadernofp.web.app/calendario?tab=eventos)
      - **Bloque:** Notas registradas y nuevo evento
        - **Fecha:** Selector de fechas. Marca el Inicio y Hasta.
        - **Selector:** Selector de Tipo. Elige entre Festivo o Evento.
        - **Texto:** Descripción. Escribe qué se celebra y dale al botón "+".
    - **Pestaña:** Visual [🔗](https://cuadernofp.web.app/calendario?tab=visual)
      - **Bloque:** Meses
        - **Fecha:** Día del mes. Haz clic directamente sobre cualquier número del calendario interactivo para marcarlo rápido como festivo.

### 3.3. Gestionar el alumnado y tutoría
¡Necesitamos alumnado a los que poner nota!

- **Apartado:** Curso [Año]
  - **Página:** Alumnado y tutoría [🔗](https://cuadernofp.web.app/alumnado)
    - **Pestaña:** Listado [🔗](https://cuadernofp.web.app/alumnado?tab=alumnado)
      - **Bloque:** Lista oficial
        - **Botón:** Importar CSV. Haz clic para subir un Excel con la lista de clase.
        - **Botón:** Añadir Alumnado. Haz clic para meter alumnado a mano.
        - **Tabla:** Celdas de tabla. Teclea directamente Estado, Apellidos, Nombre, Edad, Nacimiento, Repite, Email y Móvil sobre la tabla.
    - **Pestaña:** Plano [🔗](https://cuadernofp.web.app/alumnado?tab=plano)
      - **Bloque:** Pizarra y pupitres
        - **Acción:** Arrastrar. Haz clic y arrastra a el alumnado a sus mesas para diseñar tu aula visualmente.
    - **Pestaña:** Boletines [🔗](https://cuadernofp.web.app/alumnado?tab=boletines)
      - **Bloque:** Generación de boletines
        - **Botón:** Botones de PDF. Haz clic para sacar el reporte de notas de la clase.

---

## 💾 Paso 4: Descargar la documentación del curso

Exporta todos los documentos oficiales y listados vinculados a tu grupo de alumnado y al desarrollo del curso.

- **Apartado:** General (barra lateral superior)
  - **Página:** Descargas [🔗](https://cuadernofp.web.app/descargas)
    - **Pestaña:** Curso [🔗](https://cuadernofp.web.app/descargas?tab=curso)
      - **Bloque:** Grupo
        - **Botones:** PDF Calendario y Alumnado Ubicación. Descarga tu agenda y el plano de clase.
      - **Bloque:** Clases mensual - por UD
        - **Botones:** PDF Seguimiento y Clases por UD. Descarga tu diario de lo que has dado cada día.

---

## 👨‍🏫 Paso 5: Tu día a día en el aula (operación diaria)

Este es el proceso rutinario que harás cada día cuando llegues a tu aula, enciendas el ordenador y abras CuadernoFP.

### 5.1. Abrir tu clase al llegar al centro
Cargar todo de golpe es tan fácil como hacer un doble clic.

- **Apartado:** Barra lateral (arriba)
  - **Modo:** REALES. Asegúrate de estar trabajando en tu entorno real.
  - **Botón:** Archivos
    - **Tarjeta:** Grupos
      - **Acción:** Nombre de tu clase. Haz DOBLE CLIC sobre tu grupo en la lista para cargar alumnado, calendario y temario a la vez.

### 5.2. Pasar lista y anotar el Diario de aula
Anota quién falta y qué has dado en clase hoy.

- **Apartado:** Curso [Año]
  - **Página:** Diario [🔗](https://cuadernofp.web.app/seguimiento)
    - **Pestaña:** Diario [🔗](https://cuadernofp.web.app/seguimiento?tab=diario)
      - **Bloque:** Diario de clases y contingencias (por meses)
        - **Casilla:** Checkbox Sin Docencia o Público. Marca si hoy no ha habido clase o es público.
        - **Texto:** Área de texto de seguimiento. Teclea aquí el resumen de lo que has explicado hoy.
    - **Pestaña:** Asistencia [🔗](https://cuadernofp.web.app/seguimiento?tab=asistencia)
      - **Bloque:** Tabla de asistencia
        - **Botón:** de estado. Haz clic en el cuadro del alumnado y fecha para alternar entre Falta, Retraso o Justificado.
    - **Pestaña:** Abandono [🔗](https://cuadernofp.web.app/seguimiento?tab=alerta_abandono)
      - **Bloque:** Panel de prevención
        - **Tabla:** Celdas de acciones. Registra si has llamado a las familias o derivado a orientación.

### 5.3. Evaluación y Progreso académico
Pon las notas y deja que el sistema haga la matemática pesada de calcular la superación de los RA.

- **Apartado:** Curso [Año]
  - **Página:** Evaluación [🔗](https://cuadernofp.web.app/progreso)
    - **Pestaña:** Resumen [🔗](https://cuadernofp.web.app/progreso?tab=resumen) (y puedes revisar Por alumnado, Grupal o Individual)
      - **Bloque:** Tabla de calificaciones
        - **Tabla:** Celda de nota. Haz clic en la intersección de alumnado y una tarea, teclea su calificación y haz clic Intro para actualizar su porcentaje de RA al vuelo.

---

## 📊 Paso 6: Descargar la documentación del grupo (evaluaciones)

Tras finalizar el trabajo de evaluación en el aula, exporta las notas para jefatura de estudios y para las familias.

- **Apartado:** General (barra lateral superior)
  - **Página:** Descargas [🔗](https://cuadernofp.web.app/descargas)
    - **Pestaña:** Curso
      - **Bloque:** Boletines grupales trimestrales
        - **Fecha:** Fecha de corte / acta. Teclea la fecha límite de evaluación.
        - **Botones:** PDF Boletín y Excel/CSV. Para el 1T, 2T, 3T y Evaluación final.
      - **Bloque:** Boletines individuales
        - **Selector:** Selector de alumnado y Botón PDF. Elige a alumnado y saca su informe detallado.
