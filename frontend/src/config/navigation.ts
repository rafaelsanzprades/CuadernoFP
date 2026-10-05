import { Activity, Award, Calendar, CalendarDays, Compass, FileText, GraduationCap, Grid, Info, Lightbulb, Scale, Sparkles, TrendingUp, Users, Wrench } from "lucide-react";

// PRUEBA 2026-09-23 (a petición de Rafael, ver 00 IDEAS.md): reequilibrado
// de 3+6+6 a 3 bloques de 5 páginas cada uno (15 en total) -- Normativa sale
// de Programación y MagIA sale de Curso, ambas entran en General. Archivo
// se eliminó como página propia el 2026-09-25 (sus pestañas Datos/Asistente/
// Verificación pasaron a Inicio) y Ayuda vuelve a existir en su hueco, con
// Guía/FAQ/Acrónimos/Contribuciones -- el bloque se mantiene en 5 páginas.
// Legal, que antes vivía aparte en footerPages, ocupa su propio hueco desde
// ese mismo cambio. Pendiente de revisar: sectionDescription de General
// todavía dice "todo independiente de tener un grupo abierto", pero
// Normativa (contenido por módulo) y sobre todo MagIA (necesita programación
// + curso activos) no cumplen eso.
export const navGroups = [
  {
    title: "General",
    sectionDescription: "Por dónde empezar: tu panel, tus ficheros y la ayuda de la aplicación — todo independiente de tener un grupo abierto.",
    items: [
      { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Panel principal, gestión de archivos, IA y verificación de datos." },
      { href: "/ayuda?tab=guia", label: "Ayuda", icon: Info, description: "Guía de inicio, FAQ, acrónimos y contribuciones de la comunidad." },
      { href: "/magia?tab=programacion", label: "MagIA", icon: Sparkles, description: "Generación de programaciones PD-/PD=/PD+, correspondencia APP-PD y documentos de apoyo de la programación y del curso." },
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Normativa autonómica, legislación, bibliografía y estándares INCUAL." },
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
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos, periodo FEOE, vista mensual y tus clases de hoy, la semana y la unidad en curso." },
      { href: "/alumnado?tab=orientacion", label: "Alumnado", icon: Users, description: "Fichas personales, orientación profesional, tendencias del grupo." },
      { href: "/calificaciones?tab=academicas", label: "Calificaciones", icon: CalendarDays, description: "Notas, boletín y valoración en la empresa (FEOE) por alumnado, y reclamaciones." },
      { href: "/seguimiento?tab=asistencia", label: "Seguimiento", icon: TrendingUp, description: "Asistencia, riesgo de abandono, diario de clases, avance mensual de UD y progreso de RA." },
      { href: "/cierre?tab=expediente", label: "Cierre", icon: Award, description: "Resultados y notas del curso, mejora del módulo (EQAVET y PDCA), tendencias del grupo e inserción laboral y expediente por alumnado." },
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
    { id: "datos", label: "Datos" },
    { id: "verificacion", label: "Verificación" },
  ],
  "/ayuda": [
    { id: "guia", label: "Guía" },
    { id: "faq", label: "FAQ" },
    { id: "acronimos", label: "Acrónimos" },
  ],
  "/contexto": [
    { id: "identificacion", label: "Identificación" },
    { id: "contextualizacion", label: "Contextualización" },
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
    { id: "eventos", label: "Eventos y festivos" },
    { id: "mensual", label: "Mensual" },
    { id: "agenda", label: "Agenda" },
  ],
  "/alumnado": [
    { id: "orientacion", label: "Orientación" },
    { id: "matricula", label: "Matrícula" },
    { id: "rasgos", label: "Rasgos" },
    { id: "plano", label: "Plano de aula" },
  ],
  "/calificaciones": [
    { id: "academicas", label: "Académicas" },
    { id: "trimestral", label: "Trimestral" },
    { id: "reclamaciones", label: "Reclamaciones" },
    { id: "empresa-feoe", label: "Empresa FEOE" },
  ],
  "/seguimiento": [
    { id: "asistencia", label: "Asistencia" },
    { id: "abandono", label: "Riesgo de abandono" },
    { id: "clases", label: "Clases" },
    { id: "avance-ud", label: "Avance de UD" },
    { id: "progreso-ra-ud", label: "Progreso RA-UD" },
  ],
  "/cierre": [
    { id: "expediente", label: "Expediente" },
    { id: "resumen", label: "Resumen" },
    { id: "perfilTendencias", label: "Tendencias" },
    { id: "mejora", label: "Mejora" },
  ],
  "/normativa": [
    { id: "autonomias", label: "Autonomías" },
    { id: "bibliografia", label: "Bibliografía" },
    { id: "legislacion", label: "Legislación" },
  ],
  "/catalogo": [
    { id: "familias", label: "Familias" },
    { id: "ecp-incual", label: "ECP INCUAL" },
    { id: "titulos", label: "Títulos" },
    { id: "modulos", label: "Módulos" },
    { id: "ra-ce", label: "RA → CE" },
  ],
  "/magia": [
    { id: "programacion", label: "Programación" },
    { id: "curso", label: "Curso" },
    { id: "analisis-pdx", label: "Análisis APP->PDx" },
  ],
  "/legal": [
    { id: "aviso", label: "Aviso legal" },
    { id: "privacidad", label: "Privacidad" },
    { id: "accesibilidad", label: "Accesibilidad" },
  ],
};

