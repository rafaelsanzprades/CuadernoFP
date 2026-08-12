import { Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, TrendingUp, Users, Wrench, Sparkles, Award, Lightbulb, Info, Scale, GitCompare, Activity } from "lucide-react";

// Inicio vive junto a Agenda (aspecto pequeño, arriba del todo en Sidebar);
// Equivalencias y Ayuda igual, aspecto pequeño; Legal va solo, en el footer de
// la Sidebar. Los cuatro se repiten como tarjetas en Inicio > Bienvenida —
// ver Sidebar.tsx y app/inicio/page.tsx.
export const inicioPage = { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Panel principal, guía de inicio, FAQ y validación de datos." };

export const topLevelPages = [
  { href: "/equivalencias?tab=pd-", label: "Equivalencia", icon: GitCompare, description: "Correspondencia entre APP y los apartados de PD-, PD= y PD+." },
  { href: "/ayuda?tab=faq", label: "Ayuda", icon: Info, description: "FAQ, acrónimos y mapa de la aplicación." },
];

export const legalPage = { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." };

export const navGroups = [
  {
    title: "Grupo",
    sectionDescription: "Opciones generales de la aplicación y recursos oficiales.",
    items: [
      { href: "/archivos?tab=datos", label: "Archivo", icon: FolderOpen, description: "Gestión de archivos de Programación y Curso." },
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." },
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Legislación, plantillas y normativas." },
      { href: "/magia?tab=comunidades", label: "MagIA", icon: Sparkles, description: "Generación del PDF y comparativas." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/contexto?tab=identificacion", label: "Contexto", icon: Compass, description: "Información general y características del entorno." },
      { href: "/curriculo?tab=contribucion-ra-og", label: "Currículo", icon: Grid, description: "Cruce de resultados de aprendizaje y criterios." },
      { href: "/metodologia?tab=metodologia", label: "Metodología", icon: Lightbulb, description: "Estrategias metodológicas y recursos." },
      { href: "/instrumentos?tab=resumen", label: "Instrumento", icon: Wrench, description: "Definición y pesos de las herramientas de evaluación." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos y eventos." },
      { href: "/alumnado?tab=matricula", label: "Alumnado", icon: Users, description: "Fichas personales y perfiles." },
      { href: "/seguimiento?tab=clases", label: "Seguimiento", icon: TrendingUp, description: "Diario de clases, faltas e incidencias." },
      { href: "/calificaciones?tab=resumen", label: "Calificación", icon: Award, description: "Cuaderno de notas y rúbricas aplicadas." },
    ]
  }
];
