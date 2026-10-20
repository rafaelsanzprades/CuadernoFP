import { Activity, Award, FolderOpen, Calendar, CalendarDays, Compass, GraduationCap, Grid, Info, Lightbulb, Scale, Sparkles, TrendingUp, Users, Wrench } from "lucide-react";

// PRUEBA 2026-09-23 (a petición de Rafael, ver 00 IDEAS.md): reequilibrado
// de 3+6+6 a 3 bloques de 5 páginas cada uno (15 en total) -- Normativa sale
// de Programación y MagIA sale de Curso, ambas entran en General. Archivo
// se eliminó como página propia el 2026-09-25 (sus pestañas Datos/Asistente/
// Verificación pasaron a Inicio) y Ayuda vuelve a existir en su hueco, con
// Guía/FAQ/Acrónimos/Contribuciones -- el bloque se mantiene en 5 páginas.
// Legal, que antes vivía aparte en footerPages, ocupa su propio hueco desde
// ese mismo cambio. La sectionDescription
// de General y la de Curso se actualizaron el 2026-10-11 (7 locales).
export const navGroups = [
  {
    title: "General",
    sectionDescription: "Por dónde empezar: tu panel y tus ficheros, la ayuda, los documentos de MagIA y la información legal. MagIA necesita una programación y un curso abiertos.",
    items: [
      { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Bienvenida, mapa de la aplicación y cómo se protege tu privacidad." },
      { href: "/archivos?tab=datos", label: "Archivos", icon: FolderOpen, description: "Tus archivos de grupo, programación y curso, la nube y la verificación de datos." },
      { href: "/ayuda?tab=guia", label: "Ayuda", icon: Info, description: "Guía de inicio, preguntas frecuentes y acrónimos." },
      { href: "/magia?tab=programacion", label: "MagIA", icon: Sparkles, description: "Generación de programaciones PD-/PD=/PD+ y documentos de apoyo de la programación y del curso." },
      { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." },
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." },
      { href: "/contexto?tab=identificacion", label: "Contexto", icon: Compass, description: "Identificación, entorno, alumnado, evaluación y procedimientos de la programación." },
      { href: "/curriculo?tab=relacion-ra-ce", label: "Currículo", icon: Grid, description: "Contribución de los RA a los objetivos, ponderación RA-CE, unidades didácticas y tareas competenciales." },
      { href: "/metodologias?tab=estrategias", label: "Metodologías", icon: Lightbulb, description: "Metodología, recursos, plan de contingencia y elementos transversales." },
      { href: "/instrumentos?tab=resumen", label: "Instrumentos", icon: Wrench, description: "Definición y pesos de las herramientas de evaluación." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota las sesiones, califica y cierra el curso con el expediente y la mejora.",
    items: [
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos, periodo FEOE, vista mensual y tus clases de hoy, la semana y la unidad en curso." },
      { href: "/alumnado?tab=matricula", label: "Alumnado", icon: Users, description: "Matrícula, orientación profesional, perfil del grupo y plano de aula." },
      { href: "/sesiones?tab=asistencia", label: "Sesiones", icon: CalendarDays, description: "Asistencia, abandono y diario de sesiones lectivas." },
      { href: "/calificaciones?tab=academicas", label: "Calificaciones", icon: TrendingUp, description: "Notas y valoración en la empresa (FEOE) por alumnado, trimestral y reclamaciones." },
      { href: "/cierre?tab=expediente", label: "Cierre", icon: Award, description: "Expediente por alumnado (boletín, informe de evidencias e inserción laboral), avance de UD y progreso de RA, y mejora del módulo (EQAVET y PDCA)." },
    ]
  }
];

// Mapa de pestañas por página real (usado por la sección "Mapa del web" de
// Inicio, tanto en los baldosines como en la pestaña "Mapa" que vino de la
// antigua /ayuda) -- mantenido a mano, se desactualiza si se añade o quita
// una pestaña de una página sin tocar también esto.
export const PAGE_TABS: Record<string, { id: string; label: string }[]> = {
  "/inicio": [
    { id: "bienvenida", label: "Bienvenida" },
    { id: "mapa", label: "Mapa" },
    { id: "privacidad", label: "Tu privacidad" },
  ],
  "/archivos": [
    { id: "datos", label: "Datos" },
    { id: "nube", label: "Nube" },
    { id: "verificacion", label: "Verificación" },
  ],
  "/ayuda": [
    { id: "guia", label: "Guía" },
    { id: "faq", label: "FAQ" },
    { id: "acronimos", label: "Acrónimos" },
  ],
  "/contexto": [
    { id: "identificacion", label: "Identificación" },
    { id: "entorno", label: "Entorno" },
    { id: "alumnado", label: "Alumnado" },
    { id: "evaluacion", label: "Evaluación" },
    { id: "procedimientos", label: "Procedimientos" },
  ],
  "/curriculo": [
    { id: "relacion-ra-ce", label: "Relación RA <- CE" },
    { id: "contribucion-og-ra", label: "Contribución OG <- RA" },
    { id: "unidades-didacticas", label: "Unidades didácticas" },
    { id: "secuenciacion-ud", label: "Secuenciación de UD" },
    { id: "proyectos-retos", label: "Proyectos y retos" },
  ],
  "/metodologias": [
    { id: "estrategias", label: "Estrategias e innovación" },
    { id: "recursos-espacios", label: "Recursos y espacios" },
    { id: "diversidad", label: "Atención a la diversidad" },
    { id: "contingencia", label: "Plan de contingencia" },
    { id: "transversales", label: "Transversales" },
  ],
  "/instrumentos": [
    { id: "resumen", label: "Resumen" },
    { id: "trimestres", label: "Trimestres" },
    { id: "rubricas", label: "Rúbricas" },
    { id: "jeg", label: "Modelo JEG" },
  ],
  "/calendario": [
    { id: "fechas", label: "Fechas y horario" },
    { id: "eventos", label: "Eventos y festivos" },
    { id: "mensual", label: "Mensual" },
    { id: "agenda", label: "Agenda" },
  ],
  "/alumnado": [
    { id: "matricula", label: "Matrícula" },
    { id: "orientacion", label: "Orientación" },
    { id: "plano", label: "Plano de aula" },
    { id: "perfil", label: "Perfil" },
  ],
  "/calificaciones": [
    { id: "academicas", label: "Académicas" },
    { id: "trimestral", label: "Trimestral" },
    { id: "reclamaciones", label: "Reclamaciones" },
  ],
  "/sesiones": [
    { id: "asistencia", label: "Asistencia" },
    { id: "lectivas", label: "Lectivas" },
    { id: "abandono", label: "Abandono" },
  ],
  "/cierre": [
    { id: "expediente", label: "Expediente" },
    { id: "avance-ud", label: "Avance de UD" },
    { id: "progreso-ra-ud", label: "Progreso RA-UD" },
    { id: "mejora", label: "Mejora" },
  ],
  "/catalogo": [
    { id: "familias", label: "Familias" },
    { id: "ecp-incual", label: "ECP INCUAL" },
    { id: "titulos", label: "Títulos" },
    { id: "modulos", label: "Módulos" },
    { id: "ra-ce", label: "RA → CE" },
    { id: "autonomias", label: "Autonomías" },
  ],
  "/magia": [
    { id: "programacion", label: "Programación" },
    { id: "curso", label: "Curso" },
  ],
  "/legal": [
    { id: "aviso", label: "Aviso legal" },
    { id: "privacidad", label: "Privacidad" },
    { id: "accesibilidad", label: "Accesibilidad" },
  ],
};

