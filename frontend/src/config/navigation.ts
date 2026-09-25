import { Activity, Award, Calendar, CalendarDays, Compass, FileText, FolderOpen, GraduationCap, Grid, Lightbulb, Scale, Sparkles, TrendingUp, Users, Wrench } from "lucide-react";

// PRUEBA 2026-09-23 (a petición de Rafael, ver 00 IDEAS.md): reequilibrado
// de 3+6+6 a 3 bloques de 5 páginas cada uno (15 en total) -- Normativa sale
// de Programación y MagIA sale de Curso, ambas entran en General. Ayuda se
// eliminó como página propia el 2026-09-25 (sus pestañas pasaron a Inicio) y
// Legal, que antes vivía aparte en footerPages, ocupa ahora su hueco en
// General -- el bloque se mantiene en 5 páginas. Pendiente de revisar:
// sectionDescription de General todavía dice "todo independiente de tener
// un grupo abierto", pero Normativa (contenido por módulo) y sobre todo
// MagIA (necesita programación + curso activos) no cumplen eso.
export const navGroups = [
  {
    title: "General",
    sectionDescription: "Por dónde empezar: tu panel, tus ficheros y la ayuda de la aplicación — todo independiente de tener un grupo abierto.",
    items: [
      { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Panel principal, contribuciones de la comunidad y documentos de referencia." },
      { href: "/archivos?tab=datos", label: "Archivo", icon: FolderOpen, description: "Gestión de archivos, sincronización en la nube, seguridad y verificación de datos." },
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Normativa autonómica, legislación, bibliografía y estándares INCUAL." },
      { href: "/magia?tab=programacion", label: "MagIA", icon: Sparkles, description: "Generación de programaciones PD-/PD=/PD+, correspondencia APP-PD y documentos de apoyo de la programación y del curso." },
      { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." },
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." },
      { href: "/contexto?tab=identificacion", label: "Contexto", icon: Compass, description: "Identificación, contexto del entorno, FP dual y criterios de evaluación y calificación." },
      { href: "/curriculo?tab=contribucion-ra-og", label: "Currículo", icon: Grid, description: "Contribución de los RA a los objetivos, ponderación RA-CE, unidades didácticas y tareas competenciales." },
      { href: "/metodologia?tab=metodologia", label: "Metodología", icon: Lightbulb, description: "Metodología, recursos, plan de contingencia y elementos transversales." },
      { href: "/instrumentos?tab=resumen", label: "Instrumento", icon: Wrench, description: "Definición y pesos de las herramientas de evaluación." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/agenda", label: "Agenda", icon: CalendarDays, description: "Resumen diario, avance mensual y previsión de RA y UD pendientes." },
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos, periodo FEOE y actividades extraescolares." },
      { href: "/alumnado?tab=matricula", label: "Alumnado", icon: Users, description: "Fichas personales, plano de aula y tutoría con alertas de abandono." },
      { href: "/seguimiento?tab=clases", label: "Seguimiento", icon: TrendingUp, description: "Diario de clases, asistencia, progreso de RA y UD y entrada de notas." },
      { href: "/calificaciones?tab=resumen", label: "Calificación", icon: Award, description: "Cuaderno de notas, estadísticas y comparativa grupal e individual." },
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
    { id: "guia", label: "Guía" },
    { id: "faq", label: "FAQ" },
    { id: "acronimos", label: "Acrónimos" },
  ],
  "/contexto": [
    { id: "identificacion", label: "Identificación" },
    { id: "contextualizacion", label: "Contextualización" },
    { id: "plan-feoe", label: "Plan FEOE" },
    { id: "criterios", label: "Evaluación y calificación" },
  ],
  "/curriculo": [
    { id: "ponderacion-ra-ce", label: "OG<-RA<-CE" },
    { id: "unidades", label: "Unidades didácticas" },
    { id: "competenciales", label: "Tareas competenciales" },
    { id: "contenidos-ud", label: "Contenidos → UD" },
  ],
  "/metodologia": [
    { id: "metodologia", label: "Metodología e inclusión" },
    { id: "recursos", label: "Recursos" },
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
    { id: "periodo-feoe", label: "Periodo FEOE" },
    { id: "eventos", label: "Eventos y festivos" },
    { id: "actividades", label: "Complementarias y extraescolares" },
  ],
  "/agenda": [
    { id: "actual", label: "Actual" },
    { id: "planificacion", label: "Avance" },
    { id: "progreso-ra-ud", label: "Previsión RA y UD" },
    { id: "mensual", label: "Mensual" },
  ],
  "/alumnado": [
    { id: "matricula", label: "Matrícula" },
    { id: "plano", label: "Plano de clase" },
    { id: "perfilIndividual", label: "Individual" },
    { id: "perfilTendencias", label: "Tendencias" },
  ],
  "/seguimiento": [
    { id: "clases", label: "Clases" },
    { id: "asistencia", label: "Asistencia" },
    { id: "detalle", label: "Notas" },
    { id: "empresa-feoe", label: "Empresa FEOE" },
  ],
  "/calificaciones": [
    { id: "resumen", label: "Resumen" },
    { id: "historico", label: "Histórico" },
    { id: "individual", label: "Individual" },
    { id: "mejora", label: "Mejora" },
  ],
  "/normativa": [
    { id: "autonomias", label: "Autonomías" },
    { id: "bibliografia", label: "Bibliografía" },
    { id: "legislacion", label: "Legislación" },
    { id: "ecp-incual", label: "ECP INCUAL" },
  ],
  "/archivos": [
    { id: "datos", label: "Datos" },
    { id: "asistente-ia", label: "Asistente" },
    { id: "verificacion", label: "Verificación" },
  ],
  "/catalogo": [
    { id: "familias", label: "Familias" },
    { id: "titulos", label: "Títulos" },
    { id: "modulos", label: "Módulos" },
    { id: "ra-ce", label: "RA → CE" },
  ],
  "/magia": [
    { id: "programacion", label: "Programación" },
    { id: "comparativa-pdx", label: "Comparativa PDx" },
    { id: "curso", label: "Curso" },
    { id: "analisis-pdx", label: "Análisis APP->PDx" },
  ],
  "/legal": [
    { id: "aviso", label: "Aviso legal" },
    { id: "privacidad", label: "Privacidad" },
    { id: "cookies", label: "Cookies" },
    { id: "accesibilidad", label: "Accesibilidad" },
  ],
};

