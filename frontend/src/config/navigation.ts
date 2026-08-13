import { Calendar, CalendarDays, Compass, FileText, FolderOpen, GraduationCap, Grid, TrendingUp, Users, Wrench, Sparkles, Award, Lightbulb, Info, Scale, GitCompare, Activity } from "lucide-react";

// Inicio va solo, arriba del todo en Sidebar (aspecto pequeño); Ayuda,
// Equivalencia y MagIA le siguen igual, aspecto pequeño; Legal va solo, en
// el footer de la Sidebar. Los cuatro se repiten como tarjetas en Inicio >
// Bienvenida — ver Sidebar.tsx y app/inicio/page.tsx.
export const inicioPage = { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Panel principal, verificación de datos, contribuciones de la comunidad y calidad EQAVET." };

export const topLevelPages = [
  { href: "/ayuda?tab=faq", label: "Ayuda", icon: Info, description: "FAQ, acrónimos, mapa de la aplicación y documentos normativos." },
  { href: "/equivalencias?tab=pd-", label: "Equivalencia", icon: GitCompare, description: "Correspondencia entre APP y los apartados de PD-, PD= y PD+." },
  { href: "/magia?tab=comunidades", label: "MagIA", icon: Sparkles, description: "Generación de la programación en PDF por comunidad, guía con IA y documentos del curso." },
];

export const legalPage = { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." };

export const navGroups = [
  {
    title: "Grupo",
    sectionDescription: "Opciones generales de la aplicación y recursos oficiales.",
    items: [
      { href: "/agenda", label: "Agenda", icon: CalendarDays, description: "Resumen diario, planificación mensual y previsión de RA y UD pendientes." },
      { href: "/archivos?tab=datos", label: "Archivo", icon: FolderOpen, description: "Gestión de archivos, sincronización en la nube, seguridad y configuración de la IA." },
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Normativa autonómica, legislación, bibliografía y estándares INCUAL." },
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
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
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos, periodo FEOE y actividades extraescolares." },
      { href: "/alumnado?tab=matricula", label: "Alumnado", icon: Users, description: "Fichas personales, plano de aula y tutoría con alertas de abandono." },
      { href: "/seguimiento?tab=clases", label: "Seguimiento", icon: TrendingUp, description: "Diario de clases, asistencia, progreso de RA y UD y entrada de notas." },
      { href: "/calificaciones?tab=resumen", label: "Calificación", icon: Award, description: "Cuaderno de notas, estadísticas y comparativa grupal e individual." },
    ]
  }
];
