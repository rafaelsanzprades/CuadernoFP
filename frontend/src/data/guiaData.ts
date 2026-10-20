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
          { label: "Bloques", text: "3 grupos en el sidebar — General (Inicio, Archivos, Ayuda, MagIA, Legal), Programación (Catálogo, Contexto, Currículo, Metodologías, Instrumentos — el diseño teórico del módulo) y Curso (Calendario, Alumnado, Calificaciones, Sesiones, Cierre — el aula real). Esta misma guía vive dentro de Ayuda, pestaña Guía (no en Inicio ni en MagIA); esa misma página Ayuda tiene también FAQ y Acrónimos para consultas rápidas." },
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
            label: "Bloque", text: "Programación",
            children: [
              {
                label: "Página", text: "Catálogo",
                children: [
                  { label: "Pestaña", text: "Familias", children: [{ label: "Acción", text: "Haz clic en la tarjeta de tu familia profesional." }] },
                  { label: "Pestaña", text: "Títulos", children: [{ label: "Selector", text: "Familia profesional y título. Selecciona tu ciclo formativo." }] },
                  { label: "Pestaña", text: "Módulos", children: [{ label: "Botón", text: '"Nueva programación", en el módulo deseado dentro de su curso (1º/2º).' }] },
                  { label: "Pestaña", text: "RA → CE", children: [{ label: "Acción", text: "Consulta de solo lectura del currículo oficial ya cargado: resultados de aprendizaje y criterios de evaluación de tu módulo, tal como los fija la normativa." }] },
                  { label: "Pestaña", text: "Autonomías", children: [{ label: "Acción", text: "Selecciona tu comunidad autónoma en el mapa para ver su boletín oficial y su portal de FP." }] },
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
                  { label: "Pestaña", text: "Alumnado", children: [{ label: "Bloque", text: "Alumnado con necesidades específicas (ACNEAE) y datos del grupo, y rasgos característicos del grupo." }] },
                  { label: "Pestaña", text: "Evaluación", children: [{ label: "Bloque", text: "Reglas de redondeo y compensación, ponderación por trimestres e instrumentos de evaluación, y escalas cualitativas." }] },
                  { label: "Pestaña", text: "Procedimientos", children: [{ label: "Bloque", text: "Evaluación inicial, modelo de recuperación, información al alumnado y procedimientos (pérdida de evaluación continua), criterios de calificación y textos del modelo simplificado." }] },
                ],
              },
            ],
          },
        ],
        nota: "La atención a la diversidad ya no vive en Contexto: está en Programación › Metodologías › pestaña Atención a la diversidad (ver 1.4).",
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
                    { label: "Bloque", text: "Matriz de contribución de cada RA a los objetivos generales del título." },
                  ] },
                  { label: "Pestaña", text: "Unidades didácticas", children: [
                    { label: "Botón", text: '"Añadir nueva UD". Crea los temas.' },
                    { label: "Tabla", text: "Haz clic en la intersección de la UD con el RA al que contribuye." },
                    { label: "Columnas", text: "A la derecha de los RA: \"Bloque de contenidos\" (texto libre para agrupar UD), y, de solo lectura, los objetivos generales (OG) y los instrumentos de evaluación de cada UD. Con ellas la tabla cubre la relación UD ↔ contenidos ↔ RA ↔ OG del Art. 100 del Decreto 91/2024; el PDF/DOCX de MagIA se descarga desde esta misma pestaña." },
                  ] },
                  { label: "Pestaña", text: "Secuenciación de UD", children: [
                    { label: "Bloque", text: "Secuenciación de las sesiones de cada UD (arrastra para reordenar sesiones)." },
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
                  { label: "Pestaña", text: "Recursos y espacios", children: [{ label: "Bloque", text: "Catálogo de instrumentos de evaluación y recursos y espacios necesarios (aula, taller, software...)." }] },
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
                    label: 'Bloque "Documentos programáticos por Comunidades autónomas"', text: 'Acordeón por Comunidad autónoma (Aragón viene abierta por defecto; el resto muestra "próximamente"). Dentro de cada comunidad con contenido, tres niveles de programación, siempre en .docx editable:',
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
                label: "Página", text: "Archivos",
                children: [
                  { label: "Pestaña", text: "Datos", children: [
                    { label: "Botón", text: '"Iniciar curso (+ grupo)".' },
                    { label: "Número", text: "Año académico (ej. 2025-26)." },
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
                    { label: "Bloque", text: '"Periodo FEOE" (al final de la pestaña): inicio y fin de la Formación en empresa u organismo equiparado, tipo de dual y horas/día.' },
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
                    { label: "Botón", text: "Importar CSV o añadir alumnado a mano." },
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
              { label: "Página", text: "Archivos", children: [
                { label: "Pestaña", text: "Datos", children: [
                  { label: "Acción", text: "Haz doble clic sobre tu grupo, tu programación o tu curso guardados." },
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

export interface GuiaFaq {
  q: string;
  /** Respuesta en texto con marcado ligero (negrita con **, listas con «- »). */
  a: string;
}

// Preguntas frecuentes de la guía. Solo las usa `public/Guia.md` (copia para el asistente IA,
// generada por `scripts/generar-guia-md.mjs`); la FAQ visible en la app vive en `app/ayuda/page.tsx`.
export const GUIA_FAQ: GuiaFaq[] = [
  {
    q: "¿Qué diferencia hay entre los 3 niveles de programación didáctica (PD-, PD=, PD+)?",
    a: "Cuaderno FP genera el mismo contenido base en 3 niveles de detalle:\n- **PD- (resumen):** resumen de 1-2 hojas para entregar al alumnado.\n- **PD= (simplificada):** sigue la estructura normativa oficial (14 apartados A-N, formato BOA/Aragón vigente desde sept. 2025), unas 15-20 páginas, ideal para jefatura de estudios o inspección.\n- **PD+ (detallada JEG):** programación completa (TFM/oposiciones) de más de 60 páginas con metodologías expandidas.\n\nConsulta MagIA → pestaña Análisis APP->PDx para ver el mapa completo campo a campo entre la app y cada uno de los tres niveles.",
  },
  {
    q: "¿Qué son los campos «codificados»?",
    a: "En lugar de escribir texto genérico, seleccionas opciones de una lista (los códigos del anexo). El sistema redactará automáticamente párrafos enteros, coherentes y normativos en tu PD final.",
  },
  {
    q: "¿Cómo sabe el sistema el nombre de mi centro educativo?",
    a: "Lo tecleas en **Programación › Contexto › Identificación**, junto con el tipo de centro, la localidad y la provincia. El sistema los usa en todo el documento.",
  },
  {
    q: "¿Cómo indico si mi módulo es dual?",
    a: "En **Programación › Contexto › Identificación** eliges el régimen dual (ninguno, dual general o dual intensivo) y las horas FEOE; las fechas, el tipo de docencia y las horas por día del periodo FEOE están en **Curso › Calendario › Fechas y horario** (bloque «Periodo FEOE»), y los RA que se desarrollan en la empresa se marcan en **Programación › Currículo › Relación RA <- CE** (columna FEOE).",
  },
];

// <GUIA_CATALOGO> bloque GENERADO por scripts/generar-guia-md.mjs desde los catálogos reales de la app: no editar a mano.
export const GUIA_CATALOGO: GuiaCatalogoGrupo[] = [
  {
    numero: "A.1",
    titulo: "Metodologías activas",
    items: [
      { code: "ABP", label: "Aprendizaje basado en proyectos" },
      { code: "ABR", label: "Aprendizaje basado en retos" },
      { code: "FLIP", label: "Flipped classroom (aula invertida)" },
      { code: "COLAB", label: "Aprendizaje cooperativo / colaborativo" },
      { code: "SIM", label: "Simulación de entornos profesionales" },
      { code: "CASOS", label: "Método del caso" },
      { code: "GAMIF", label: "Gamificación / Aprendizaje basado en juegos" },
      { code: "ApS", label: "Aprendizaje-Servicio" },
      { code: "DEMO", label: "Demostración práctica" },
      { code: "MAGIS", label: "Exposición didáctica interactiva apoyada en TIC" },
      { code: "ETHAZI", label: "Ethazi / Aprendizaje colaborativo basado en retos (ACbR)" },
      { code: "AGIL", label: "Metodologías ágiles (Design thinking, Lean startup, Scrum)" },
      { code: "CONTR", label: "Contrato de aprendizaje (Learning contract)" },
      { code: "DEBATE", label: "Debates y diálogo educativo" },
      { code: "PARES", label: "Aprendizaje entre pares (Peer teaching)" },
      { code: "ESTAC", label: "Estaciones de aprendizaje" },
    ],
  },
  {
    numero: "A.2",
    titulo: "Instrumentos de evaluación y de calificación",
    items: [
      { code: "PRU-OBJ", label: "Prueba objetiva escrita" },
      { code: "PRU-EJEC", label: "Prueba de ejecución práctica" },
      { code: "PORTF", label: "Portfolio / Cuaderno" },
      { code: "DIARIO", label: "Diario de aprendizaje" },
      { code: "DEF-ORAL", label: "Exposición oral" },
      { code: "AUTOEVAL", label: "Autoevaluación" },
      { code: "COEVAL", label: "Coevaluación" },
      { code: "RUBR", label: "Rúbrica de evaluación" },
      { code: "COTEJO", label: "Lista de control / Cotejo" },
      { code: "ESCALA", label: "Escala de valoración (Likert)" },
    ],
  },
  {
    numero: "A.3",
    titulo: "Medidas de respuesta educativa para la inclusión",
    items: [
      { code: "NIVEL", label: "Actividades multinivel" },
      { code: "AGRUP", label: "Agrupamientos flexibles y tutoría" },
      { code: "TIEMPO", label: "Flexibilización en tiempos" },
      { code: "MATERIAL", label: "Adaptación de materiales" },
      { code: "ACNS", label: "ACNS (no significativas)" },
      { code: "AMPLIA", label: "Ampliación (altas capacidades)" },
    ],
  },
  {
    numero: "A.4",
    titulo: "Plan de contingencia",
    items: [
      { code: "CONT-ASINC", label: "Docencia telemática asíncrona" },
      { code: "CONT-SINC", label: "Docencia telemática síncrona" },
      { code: "CONT-AUT", label: "Dosier de tareas autoguiadas" },
    ],
  },
  {
    numero: "A.5.1",
    titulo: "Recursos: espacios",
    items: [
      { code: "REC-AULA", label: "Aula técnica / polivalente" },
      { code: "REC-TALLER", label: "Taller específico" },
      { code: "REC-LAB", label: "Laboratorio" },
      { code: "REC-INFO", label: "Aula de informática" },
      { code: "REC-ALMACEN", label: "Almacén / pañol de herramientas" },
      { code: "REC-EXTERIOR", label: "Espacio exterior / patio de prácticas" },
    ],
  },
  {
    numero: "A.5.2",
    titulo: "Recursos: equipamiento de aula",
    items: [
      { code: "REC-PIZARRA", label: "Pizarra y proyector / pantalla" },
      { code: "REC-PDI", label: "Pizarra digital interactiva (PDI)" },
      { code: "REC-ORDENADORES", label: "Ordenadores e impresora" },
      { code: "REC-TABLETS", label: "Tablets / dispositivos móviles" },
      { code: "REC-MOBILIARIO", label: "Mobiliario adaptable (mesas de trabajo en grupo)" },
    ],
  },
  {
    numero: "A.5.3",
    titulo: "Recursos: software y TIC",
    items: [
      { code: "REC-SOFT-OFIMATICA", label: "Software ofimático (procesador, hoja de cálculo, presentaciones)" },
      { code: "REC-SOFT-ESPECIFICO", label: "Software específico del módulo / sector" },
      { code: "REC-EVA", label: "Entorno virtual de aprendizaje (Aules / Moodle / Classroom)" },
      { code: "REC-CLASSROOM", label: "Google Classroom / Google Workspace for Education" },
      { code: "REC-TEAMS", label: "Microsoft Teams para educación / Microsoft 365 Educación" },
      { code: "REC-FORMS", label: "Formularios y cuestionarios online (Forms, Kahoot, Quizizz)" },
      { code: "REC-CAD", label: "Software de diseño asistido por ordenador (CAD/CAM)" },
      { code: "REC-SIMULADOR", label: "Software de simulación / entorno virtual de prácticas" },
      { code: "REC-GESTION-TALLER", label: "Software de gestión y control de taller" },
      { code: "REC-REPOSITORIO", label: "Repositorio documental compartido (Drive / OneDrive)" },
    ],
  },
  {
    numero: "A.5.4",
    titulo: "Recursos: documentación",
    items: [
      { code: "REC-MANUALES", label: "Manuales técnicos y libros de texto" },
      { code: "REC-NORMATIVA", label: "Normativa técnica y reglamentos del sector" },
      { code: "REC-FICHAS-TECNICAS", label: "Fichas técnicas y catálogos de fabricantes" },
      { code: "REC-APUNTES", label: "Apuntes y material elaborado por el profesorado" },
      { code: "REC-VIDEOTECA", label: "Videoteca / recursos audiovisuales técnicos" },
    ],
  },
  {
    numero: "A.5.5",
    titulo: "Recursos: herramientas de taller",
    items: [
      { code: "REC-HERR-MANUALES", label: "Herramientas manuales" },
      { code: "REC-HERR-ELECTRICAS", label: "Herramientas eléctricas / motorizadas" },
      { code: "REC-INSTR-MEDIDA", label: "Instrumentos y equipos de medida" },
      { code: "REC-MAQUINARIA", label: "Maquinaria y equipos específicos del sector" },
      { code: "REC-CONSUMIBLES", label: "Materiales consumibles y fungibles de prácticas" },
      { code: "REC-MAQUETAS", label: "Maquetas y bancos de prácticas / simulación de instalaciones" },
    ],
  },
  {
    numero: "A.5.6",
    titulo: "Recursos: seguridad y PRL",
    items: [
      { code: "REC-EPI", label: "Equipos de protección individual (EPI)" },
      { code: "REC-EPC", label: "Equipos de protección colectiva" },
      { code: "REC-SENALIZACION", label: "Señalización de seguridad del taller" },
      { code: "REC-BOTIQUIN", label: "Botiquín y material de primeros auxilios" },
    ],
  },
  {
    numero: "A.5.7",
    titulo: "Recursos: comunicación",
    items: [
      { code: "REC-EMAIL", label: "Correo electrónico institucional" },
      { code: "REC-APP-COMUNICACION", label: "App de comunicación con familias/alumnado (Séneca, Educamos, etc.)" },
    ],
  },
  {
    numero: "A.6",
    titulo: "Elementos transversales",
    items: [
      { code: "TRANS-DIG", label: "Competencia digital / tecnologías" },
      { code: "TRANS-SOST", label: "Sostenibilidad y transición ecológica" },
      { code: "TRANS-IGUAL", label: "Igualdad de género" },
      { code: "TRANS-PRL", label: "Prevención de riesgos laborales" },
      { code: "TRANS-EMPRE", label: "Cultura emprendedora" },
    ],
  },
];
// </GUIA_CATALOGO>
