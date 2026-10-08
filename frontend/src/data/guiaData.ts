// Contenido de la Guía de inicio rápido (antes servido como Markdown desde
// public/Guia.md y renderizado con ReactMarkdown) -- pasado a código
// estructurado, petición de Rafael, para poder dividirlo en bloques
// navegables (SectionHeading + índice) igual que el resto de la app.
// El fichero public/Guia.md se mantiene (fuente original / prompt de
// referencia para el asistente IA), pero GuiaTab.tsx ya no lo lee.

export interface GuiaNode {
  label?: string;
  text: string;
  children?: GuiaNode[];
}

export interface GuiaSubseccion {
  numero: string;
  titulo: string;
  intro?: string;
  nodes: GuiaNode[];
  nota?: string;
}

export interface GuiaCatalogoGrupo {
  numero: string;
  titulo: string;
  items: { code: string; label: string }[];
}

export const GUIA_PASOS: {
  id: string;
  numero: string;
  titulo: string;
  intro?: string[];
  subsecciones: GuiaSubseccion[];
  notaFinal?: string;
}[] = [
  {
    id: "guia-paso-0",
    numero: "0",
    titulo: "Instrucciones asistente IA",
    intro: [
      "Eres el asistente virtual integrado en Cuaderno FP. Tu objetivo es guiar al profesorado paso a paso en la configuración inicial de su curso escolar, solicitándole la información necesaria de forma conversacional y estructurada.",
    ],
    subsecciones: [
      {
        numero: "0.1",
        titulo: "Contexto y acceso",
        nodes: [
          { label: "Plataforma", text: "Actúas sobre la web cuadernofp.web.app (no requiere usuario ni contraseña, los datos residen localmente)." },
          { label: "Propósito", text: "Debes utilizar el resto de esta guía (Pasos 1 al 5) como tu mapa exacto de la interfaz para saber qué campos rellenar, qué botones pulsar y en qué pantallas navegar." },
        ],
      },
      {
        numero: "0.2",
        titulo: "Interacción con el usuario (lo que debes pedir)",
        intro: "Antes de ejecutar acciones en la plataforma, preséntate brevemente y solicita al usuario la información base. Pídele (de forma progresiva para no abrumarle):",
        nodes: [
          { label: "1. Documentación del módulo", text: "Solicita su temario, programación oficial o currículo (en PDF o texto) para poder extraer unidades didácticas (UD), resultados de aprendizaje (RA) y criterios de evaluación (CE)." },
          { label: "2. Fechas clave", text: "Pregúntale por el calendario escolar (inicio/fin de curso, trimestres y festivos locales)." },
          { label: "3. Horario semanal", text: "Qué días imparte clase y cuántas horas cada día." },
          { label: "4. Listado de alumnado", text: "Un Excel, CSV o lista de texto con el alumnado para importar la clase." },
        ],
      },
      {
        numero: "0.3",
        titulo: "Convenciones de nomenclatura",
        intro: "Cuando generes identificadores o guardes datos, usa estos estándares (salvo que el usuario especifique otros):",
        nodes: [
          { label: "Curso académico", text: "Formato 2025-26." },
          { label: "Módulo", text: "Acrónimo en mayúsculas (ej. SMR, DAW, FOL)." },
          { label: "Grupos", text: "Número, letra y nivel (ej. 1A-GM, 2B-GS)." },
          { label: "Archivos exportados", text: "[Curso]_[Acrónimo-Módulo]_[Documento].pdf (ej. 2025-26_DAW_Programacion.pdf)." },
        ],
      },
      {
        numero: "0.4",
        titulo: "Glosario clave que debes comprender",
        nodes: [
          { label: "Programación didáctica", text: 'Es el "molde" teórico (.fpp). Contiene la normativa (resultados de aprendizaje y criterios de evaluación) y las unidades didácticas. Se diseña una vez y se puede reutilizar en cursos posteriores.' },
          { label: "Curso", text: 'Es la "instancia" real (.fpc). Representa al alumnado físico, sus calificaciones, faltas de asistencia y calendario en un año académico específico (ej. 2025-26).' },
          { label: "Bloques", text: "3 grupos en el sidebar — General (Inicio, Ayuda, MagIA, Normativa, Legal), Programación (Catálogo, Contexto, Currículo, Metodologías, Instrumentos — el diseño teórico del módulo) y Curso (Calendario, Alumnado, Calificaciones, Sesiones, Cierre — el aula real). Esta misma guía vive dentro de Ayuda, pestaña Guía (no en Inicio ni en MagIA); esa misma página Ayuda tiene también FAQ, Acrónimos y Contribuciones para consultas rápidas." },
        ],
      },
    ],
    notaFinal: "Una vez tengas el contexto necesario, comienza a guiar al usuario o ejecuta las acciones detalladas desde el Paso 1 en adelante.",
  },
  {
    id: "guia-paso-1",
    numero: "1",
    titulo: "Creación y configuración",
    intro: [
      'El primer paso es crear el "molde" o plantilla curricular de tu módulo a partir de la normativa, y personalizarlo con tu forma de evaluar.',
    ],
    subsecciones: [
      {
        numero: "1.1",
        titulo: "Iniciar desde el catálogo oficial",
        intro: "Vamos a pedirle al sistema que nos cree el archivo base de la programación cargando automáticamente la ley.",
        nodes: [
          {
            label: "Bloque", text: "General",
            children: [
              {
                label: "Página", text: "Normativa",
                children: [
                  { label: "Pestaña", text: "Autonomías", children: [
                    { label: "Acción", text: "Selecciona tu Comunidad Autónoma en el mapa interactivo para cargar la normativa autonómica específica." },
                  ] },
                ],
              },
            ],
          },
          {
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Catálogo",
                children: [
                  { label: "Pestaña", text: "Familias", children: [{ label: "Acción", text: "Haz clic en la tarjeta de tu familia profesional." }] },
                  { label: "Pestaña", text: "Títulos", children: [{ label: "Selector", text: "Familia profesional y Título. Selecciona tu ciclo formativo." }] },
                  { label: "Pestaña", text: "Módulos", children: [{ label: "Botón", text: '"Nueva programación", en el módulo deseado dentro de su curso (1º/2º).' }] },
                  { label: "Pestaña", text: "RA → CE", children: [{ label: "Acción", text: "Consulta de solo lectura del currículo oficial ya cargado: resultados de aprendizaje y criterios de evaluación de tu módulo, tal como los fija la normativa." }] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "1.2",
        titulo: "Configurar el contexto y los datos generales",
        nodes: [
          {
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Contexto",
                children: [
                  { label: "Pestaña", text: "Identificación", children: [{ label: "Bloque", text: "Centro y docente, módulo didáctico y datos de autoría y publicidad de la programación." }] },
                  { label: "Pestaña", text: "Entorno", children: [{ label: "Bloque", text: "Contexto escolar (entorno geográfico y socioeconómico), actividades complementarias y extraescolares, y plan FEOE (modalidad, seguimiento y régimen dual)." }] },
                  { label: "Pestaña", text: "Alumnado", children: [{ label: "Bloque", text: "Alumnado con necesidades específicas (ACNEAE) y datos del grupo, rasgos característicos del grupo y evaluación inicial." }] },
                  { label: "Pestaña", text: "Evaluación", children: [{ label: "Bloque", text: "Reglas de redondeo y compensación, ponderación por trimestres e instrumentos de evaluación, y escalas cualitativas." }] },
                  { label: "Pestaña", text: "Procedimientos", children: [{ label: "Bloque", text: "Modelo de recuperación, información al alumnado y procedimientos (pérdida de evaluación continua), criterios de calificación y textos del modelo Simplificado." }] },
                ],
              },
            ],
          },
        ],
        nota: "La atención a la diversidad ya no vive en Contexto: está en Programación › Metodología → Pestaña Metodología e inclusión (ver 1.4).",
      },
      {
        numero: "1.3",
        titulo: "Definir el currículo, las unidades didácticas y los proyectos y retos",
        nodes: [
          {
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Currículo",
                children: [
                  { label: "Pestaña", text: "Relación RA <- CE", children: [
                    { label: "Número", text: "Asignar el % de cada RA y de cada CE." },
                  ] },
                  { label: "Pestaña", text: "Contribución OG <- RA", children: [
                    { label: "Bloque", text: "Matriz de contribución de cada RA a los Objetivos Generales del título." },
                  ] },
                  { label: "Pestaña", text: "Unidades didácticas", children: [
                    { label: "Botón", text: '"Añadir nueva UD". Crea los temas.' },
                    { label: "Tabla", text: "Haz clic en la intersección de la UD con el RA al que contribuye." },
                    { label: "Columnas", text: "A la derecha de los RA: \"Bloque de contenidos\" (texto libre para agrupar UD), y, de solo lectura, los objetivos generales (OG) y los instrumentos de evaluación de cada UD. Con ellas la tabla cubre la relación UD ↔ contenidos ↔ RA ↔ OG del Art. 100 del Decreto 91/2024; el PDF/DOCX de MagIA se descarga desde esta misma pestaña." },
                  ] },
                  { label: "Pestaña", text: "Secuenciación de UD", children: [
                    { label: "Bloque", text: "Secuenciación de las sesiones de cada UD (arrastra para reordenar sesiones) y tabla resumen de relaciones RA-UD para verificar de un vistazo qué UD cubre cada RA." },
                  ] },
                  { label: "Pestaña", text: "Proyectos y retos", children: [
                    { label: "Bloque", text: '"Proyectos y retos" (opcional; art. 109 del Decreto 91/2024 si el módulo participa en un proyecto o reto): botón "Añadir proyecto o reto" y selector del instrumento (codificado) con el que se evalúa.' },
                  ] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "1.4",
        titulo: "Metodología",
        nodes: [
          {
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Metodologías",
                children: [
                  { label: "Pestaña", text: "Estrategias e innovación", children: [{ label: "Bloque", text: "Metodologías activas (ABP, retos, etc.) y coordinación docente, e innovación e intermodularidad." }] },
                  { label: "Pestaña", text: "Instrumentos y recursos", children: [{ label: "Bloque", text: "Catálogo de instrumentos de evaluación y recursos y espacios necesarios (aula, taller, software...)." }] },
                  { label: "Pestaña", text: "Atención a la diversidad", children: [{ label: "Bloque", text: "Marco de inclusión, atención a la diversidad, plan DUA y panel de alumnado ACNEAE (nombre, tipo de necesidad y adaptaciones de evaluación y acceso)." }] },
                  { label: "Pestaña", text: "Plan de contingencia", children: [{ label: "Texto", text: "Docencia telemática, tareas autoguiadas." }] },
                  { label: "Pestaña", text: "Transversales", children: [{ label: "Texto", text: "Elementos transversales, competencias clave y digitales, y estándares y objetivos del currículo." }] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "1.5",
        titulo: "Instrumento de Evaluación",
        nodes: [
          {
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Instrumentos",
                children: [
                  { label: "Pestaña", text: "Resumen", children: [{ label: "Tabla", text: "Visión global de los instrumentos por trimestre (nº y % de peso)." }] },
                  { label: "Pestaña", text: "Trimestres", children: [
                    { label: "Sub-pestañas", text: "1º/2º/3º Trimestre." },
                    { label: "Botón", text: '"Añadir Instrumento". Exámenes, prácticas, rúbricas...' },
                  ] },
                  { label: "Pestaña", text: "Rúbricas", children: [{ label: "Botón", text: '"Nueva rúbrica" (o importar/exportar desde Classroom).' }] },
                  { label: "Pestaña", text: "Modelo JEG", children: [{ label: "Acción", text: "Reparto avanzado Instrumento→Indicador→CE (normalmente no hace falta tocarlo)." }] },
                ],
              },
            ],
          },
        ],
        nota: "Las reglas de redondeo y compensación (nota mínima, umbral de redondeo, criterios compensables por RA) no viven en Instrumento: están en Programación › Contexto → Pestaña Identificación.",
      },
    ],
  },
  {
    id: "guia-paso-2",
    numero: "2",
    titulo: "Descargar la programación",
    intro: ["Una vez configurada la programación base, genera los PDFs oficiales."],
    subsecciones: [
      {
        numero: "2.1",
        titulo: "Generar los documentos PD",
        nodes: [
          {
            label: "Página", text: "MagIA",
            children: [
              {
                label: "Pestaña", text: "Programación",
                children: [
                  {
                    label: 'Bloque "Documentos de apoyo al currículo"', text: "Matriz RA ↔ UD, selector de UD y de tarea competencial, y matriz de cobertura CE × Instrumento — todo en un único bloque, en PDF (\"Vista previa\") o DOCX (\"Descarga editable\").",
                  },
                  {
                    label: 'Bloque "Documentos programáticos por Comunidades autónomas"', text: 'Acordeón por Comunidad Autónoma (Aragón viene abierta por defecto; el resto muestra "próximamente"). Dentro de cada comunidad con contenido, tres niveles de programación, siempre en .docx editable:',
                    children: [
                      { label: "PD- (Resumen)", text: "Resumen de 1-2 folios para el alumnado." },
                      { label: "PD= (Simplificada)", text: "Formato oficial intermedio (~15-20 páginas)." },
                      { label: "PD+ (Detallada JEG)", text: "Formato extendido (>60 páginas) con toda la carga narrativa." },
                      { text: "PD- y PD= incluyen, al final, una página de previsión de planificación mensual (UD × mes, calculada igual que Sesiones › Avance de UD); PD+ todavía no la lleva." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        nota: "¿Quieres saber exactamente qué campo de la app rellena cada apartado del documento? Consulta MagIA → Pestaña Análisis APP->PDx.",
      },
    ],
  },
  {
    id: "guia-paso-3",
    numero: "3",
    titulo: "Creación del curso",
    intro: ["Ahora instanciamos la Programación en un año académico y clase real."],
    subsecciones: [
      {
        numero: "3.1",
        titulo: "Iniciar un nuevo curso y grupo",
        nodes: [
          {
            label: "Bloque", text: "General",
            children: [
              {
                label: "Página", text: "Inicio",
                children: [
                  { label: "Pestaña", text: "Datos", children: [
                    { label: "Botón", text: '"Iniciar curso (+ grupo)".' },
                    { label: "Número", text: "Año Académico (ej. 2025-26)." },
                    { label: "Alfanumérico", text: "Letra / Grupo (ej. 1A-GM)." },
                    { label: "Botón", text: "Crear ahora." },
                  ] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "3.2",
        titulo: "Configurar el calendario académico",
        nodes: [
          {
            label: "Bloque", text: "Curso",
            children: [
              {
                label: "Página", text: "Calendario",
                children: [
                  { label: "Pestaña", text: "Fechas y horario", children: [
                    { label: "Fecha", text: "Inicio y fin de curso, y trimestres." },
                    { label: "Horario", text: "Horas lectivas diarias." },
                    { label: "Bloque", text: '"Periodo FEOE" (al final de la pestaña): inicio y fin de la Formación en Empresa u Organismo Equiparado, tipo de dual y horas/día.' },
                  ] },
                  { label: "Pestaña", text: "Eventos y festivos", children: [
                    { label: "Fecha", text: "Festivos o celebraciones, con calendario interactivo para marcarlos con un clic." },
                    { label: "Nota", text: "Los hitos de Fechas generales (inicio/fin de curso y de cada trimestre) y el periodo FEOE aparecen aquí automáticamente, en gris y sin poder borrarse — cambian si cambias esas fechas, no aquí." },
                  ] },
                  { label: "Pestaña", text: "Mensual", children: [{ label: "Acción", text: "Vista mensual y calendario interactivo con fechas clave y las sesiones planificadas." }] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "3.3",
        titulo: "Gestionar el alumnado",
        nodes: [
          {
            label: "Bloque", text: "Curso",
            children: [
              {
                label: "Página", text: "Alumnado",
                children: [
                  { label: "Pestaña", text: "Orientación", children: [
                    { label: "Acordeones", text: "Orientación profesional por alumno/a, en dos secciones: \"Motivación y experiencia\" e \"Intereses y aspiraciones\". Se rellena al empezar el curso." },
                  ] },
                  { label: "Pestaña", text: "Matrícula", children: [
                    { label: "Botón", text: "Importar CSV o Añadir Alumnado a mano." },
                  ] },
                  { label: "Pestaña", text: "Plano de aula", children: [
                    { label: "Acción", text: "Arrastrar al alumnado a sus mesas." },
                  ] },
                  { label: "Pestaña", text: "Perfil", children: [{ label: "Tablas", text: "Agregados y tendencias del perfil profesional del grupo (motivación, experiencia, aptitudes e intención al terminar) y tabla filtrable de todo el alumnado." }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "guia-paso-4",
    numero: "4",
    titulo: "Tu día a día en el aula",
    subsecciones: [
      {
        numero: "4.1",
        titulo: "Abrir tu clase",
        nodes: [
          {
            label: "Bloque", text: "General",
            children: [
              { label: "Página", text: "Inicio", children: [
                { label: "Pestaña", text: "Datos", children: [
                  { label: "Acción", text: "Haz DOBLE CLIC sobre tu grupo, tu programación o tu curso guardados." },
                ] },
              ] },
            ],
          },
        ],
      },
      {
        numero: "4.2",
        titulo: "Ver tu resumen del día",
        nodes: [
          {
            label: "Bloque", text: "Curso",
            children: [
              {
                label: "Página", text: "Calendario",
                children: [
                  { label: "Pestaña", text: "Agenda", children: [{ label: "Acción", text: "Resumen de las clases de hoy, contexto de la semana y desarrollo de la unidad didáctica en curso." }] },
                ],
              },
            ],
          },
        ],
      },
      {
        numero: "4.3",
        titulo: "Registrar el día a día y la asistencia",
        nodes: [
          {
            label: "Bloque", text: "Curso",
            children: [
              {
                label: "Página", text: "Sesiones",
                children: [
                  { label: "Pestaña", text: "Asistencia", children: [
                    { label: "Acordeones", text: "Lista de alumnado a la izquierda (con el estado del día seleccionado, que se cambia con un clic) y, por alumno/a, \"Control de asistencia\" (marca Presente, Falta o Retraso día a día) y \"Acumulado trimestral\" (faltas por trimestre y semáforo de pérdida de evaluación continua)." },
                  ] },
                  { label: "Pestaña", text: "Lectivas", children: [{ label: "Texto", text: "Redacta qué se ha hecho en la clase." }] },
                  { label: "Pestaña", text: "Abandono", children: [{ label: "Bloque", text: "Resumen de riesgo de abandono (Indicador 1.5 del Sistema Estatal), calculado solo a partir de la asistencia y las notas; control de rendimiento académico (nota final < 5); y acumulado trimestral de faltas de todo el grupo con el semáforo de pérdida de evaluación continua." }] },
                ],
              },
            ],
          },
        ],
        nota: "No hay pestaña de Tutoría: se eliminó por completo (2026-09-21) — ser tutor de un grupo se considera un rol ajeno a esta app.",
      },
      {
        numero: "4.4",
        titulo: "Evaluación",
        nodes: [
          {
            label: "Bloque", text: "Curso",
            children: [
              {
                label: "Página", text: "Calificaciones",
                children: [
                  { label: "Pestaña", text: "Académicas", children: [
                    { label: "Acordeones", text: "Por alumno/a, en dos secciones: \"Notas\" (teclea las notas y calcula al vuelo — es el único punto de entrada de calificaciones numéricas de la app) y \"Empresa FEOE\" (transcribe las valoraciones del tutor de empresa, 1-4, Anexo XI b, para los CE marcados FEOE en Currículo)." },
                  ] },
                  { label: "Pestaña", text: "Trimestral", children: [{ label: "Tablas", text: "Notas del grupo por instrumento y trimestre." }] },
                  { label: "Pestaña", text: "Reclamaciones", children: [{ label: "Bloques", text: '"Cambios de nota" (registro de cada cambio, con fecha, agente y motivo) y "Reclamaciones" (registra y resuelve reclamaciones de nota, con generación de justificante).' }] },
                ],
              },
              {
                label: "Página", text: "Cierre (mayormente de solo lectura, resume lo anterior)",
                children: [
                  { label: "Pestaña", text: "Expediente", children: [{ label: "Acordeones", text: "Por alumno/a: \"Boletín individual de calificaciones\" (con botón de impresión), \"Informe de evidencias\" (línea temporal de calificaciones, reclamaciones, asistencia y diario) e \"Inserción laboral\"." }] },
                  { label: "Pestaña", text: "Mejora", children: [{ label: "Acción", text: "Indicadores de calidad EQAVET y propuestas de mejora del módulo, de cara a la memoria final de curso." }] },
                  { label: "Pestaña", text: "Avance de UD", children: [{ label: "Acción", text: "Planificación y seguimiento mensual de las unidades didácticas según lo impartido (UD × mes)." }] },
                  { label: "Pestaña", text: "Progreso RA-UD", children: [{ label: "Acción", text: "Una tarjeta por RA con la nota mínima, media y máxima del grupo, su avance, sus horas y el estado de sus UD: completada, en curso o pendiente; los RA sin docencia todavía aparecen atenuados." }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "guia-paso-5",
    numero: "5",
    titulo: "Descargar la documentación",
    intro: ["Exporta informes, actas, y seguimiento."],
    subsecciones: [
      {
        numero: "5.1",
        titulo: "Descargas disponibles",
        nodes: [
          {
            label: "Página", text: "MagIA",
            children: [
              {
                label: "Pestaña", text: "Curso",
                children: [
                  { label: 'Bloque "Grupo"', text: 'Calendario académico y Plano de aula (ubicación del alumnado) — ambos en "Vista previa .pdf" / "Descarga editable .docx".' },
                  { label: 'Bloque "Clases mensual - por UD"', text: "Seguimiento diario, Clases por UD, Planificación (previsto/impartido) y Parte de incidencias (justificante de una falta concreta, con selector de alumno/a, fecha y motivo)." },
                  { label: 'Bloque "Boletines y actas de evaluación"', text: "Por cada trimestre y la Final: PDF/DOCX del boletín grupal, Acta de evaluación firmable (PDF/DOCX) y exportación Excel/CSV." },
                  { label: 'Bloque "Alumnado individual"', text: "Boletín individual y Ficha individual (matrícula + asistencia) por alumno/a." },
                ],
              },
            ],
          },
        ],
        nota: "El Informe EQAVET (indicadores de calidad + propuestas de mejora) ya no se descarga desde aquí: vive en Cierre → Pestaña Mejora.",
      },
    ],
  },
];

export const GUIA_CATALOGO: GuiaCatalogoGrupo[] = [
  {
    numero: "A.1",
    titulo: "Metodologías Activas",
    items: [
      { code: "ABP", label: "Aprendizaje Basado en Proyectos" },
      { code: "ABR", label: "Aprendizaje Basado en Retos" },
      { code: "FLIP", label: "Flipped Classroom (Aula Invertida)" },
      { code: "COLAB", label: "Aprendizaje Cooperativo / Colaborativo" },
      { code: "SIM", label: "Simulación de Entornos Profesionales (Role-playing)" },
      { code: "CASOS", label: "Método del Caso" },
      { code: "GAMIF", label: "Gamificación / Aprendizaje Basado en Juegos" },
      { code: "ApS", label: "Aprendizaje-Servicio" },
      { code: "DEMO", label: "Demostración Práctica" },
      { code: "MAGIS", label: "Exposición Didáctica Interactiva apoyada en TIC" },
    ],
  },
  {
    numero: "A.2",
    titulo: "Procedimientos e Instrumentos de Evaluación",
    items: [
      { code: "PRU-OBJ", label: "Prueba objetiva escrita (Test, preguntas cortas)" },
      { code: "PRU-EJEC", label: "Prueba de ejecución / Desempeño práctico" },
      { code: "RUBR", label: "Rúbrica de evaluación" },
      { code: "COTEJO", label: "Lista de control / Cotejo" },
      { code: "ESCALA", label: "Escala de valoración (Likert)" },
      { code: "PORTF", label: "Portfolio / Cuaderno del alumno" },
      { code: "DIARIO", label: "Diario de aprendizaje" },
      { code: "DEF-ORAL", label: "Exposición y defensa oral" },
      { code: "AUTOEVAL", label: "Autoevaluación del alumnado" },
      { code: "COEVAL", label: "Coevaluación entre pares" },
    ],
  },
  {
    numero: "A.3",
    titulo: "Medidas de Respuesta Educativa para la Inclusión",
    items: [
      { code: "NIVEL", label: "Actividades multinivel" },
      { code: "AGRUP", label: "Agrupamientos flexibles y tutoría entre iguales" },
      { code: "TIEMPO", label: "Flexibilización en tiempos de ejecución" },
      { code: "MATERIAL", label: "Adaptación de materiales" },
      { code: "ACNS", label: "Adaptaciones Curriculares No Significativas" },
      { code: "AMPLIA", label: "Actividades de ampliación para Altas Capacidades" },
    ],
  },
  {
    numero: "A.4",
    titulo: "Plan de Contingencia",
    items: [
      { code: "CONT-ASINC", label: "Docencia telemática asíncrona (Aula Virtual)" },
      { code: "CONT-SINC", label: "Docencia telemática síncrona (Videoconferencia)" },
      { code: "CONT-AUT", label: "Dosier de tareas autoguiadas" },
    ],
  },
  {
    numero: "A.5",
    titulo: "Recursos y Espacios",
    items: [
      { code: "REC-AULA", label: "Aula polivalente / Aula técnica" },
      { code: "REC-TALLER", label: "Taller específico / Laboratorio" },
      { code: "REC-INFO", label: "Aula de informática" },
      { code: "REC-SOFT", label: "Software y simuladores específicos" },
      { code: "REC-EVA", label: "Entorno Virtual de Aprendizaje (Aules, Moodle)" },
      { code: "REC-BIBLIO", label: "Manuales y documentación técnica" },
      { code: "REC-EPI", label: "Equipos de Protección Individual (EPIs)" },
    ],
  },
  {
    numero: "A.6",
    titulo: "Actividades Complementarias y Extraescolares",
    items: [
      { code: "EXT-VISITA", label: "Visitas técnicas a empresas del sector" },
      { code: "EXT-CHARLA", label: "Charlas / Masterclass con expertos profesionales" },
      { code: "EXT-FERIA", label: "Asistencia a ferias tecnológicas o sectoriales" },
      { code: "EXT-SKILLS", label: "Participación en competiciones de FP (Skills)" },
    ],
  },
  {
    numero: "A.7",
    titulo: "Elementos Transversales",
    items: [
      { code: "TRANS-ODS", label: "Objetivos de Desarrollo Sostenible (Agenda 2030)" },
      { code: "TRANS-IGUALDAD", label: "Igualdad de género y corresponsabilidad" },
      { code: "TRANS-PRL", label: "Cultura de Prevención de Riesgos Laborales" },
      { code: "TRANS-TIC", label: "Fomento de la competencia digital y buen uso de internet" },
      { code: "TRANS-EMP", label: "Emprendimiento e iniciativa emprendedora" },
    ],
  },
];
