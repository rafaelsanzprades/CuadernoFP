import { Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, TrendingUp, Users, Wrench, Sparkles, Award, Lightbulb, Info, Scale, GitCompare } from "lucide-react";

// Correlación, Ayuda y Legal viven ahora como botones grandes en la Sidebar
// (junto a Agenda) y como tarjetas en Inicio > Bienvenida, no en navGroups —
// ver Sidebar.tsx y app/inicio/page.tsx.
export const topLevelPages = [
  { href: "/correlacion?tab=pd-", label: "Correlación", icon: GitCompare, description: "Qué campo de la app corresponde a cada apartado de las PD- / PD= / PD+." },
  { href: "/ayuda?tab=faq", label: "Ayuda", icon: Info, description: "FAQ, acrónimos y mapa de la aplicación." },
  { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." }
];

export const navGroups = [
  {
    title: "Grupo",
    sectionDescription: "Opciones generales de la aplicación y recursos oficiales.",
    items: [
      { href: "/archivos?tab=datos", label: "Archivos", icon: FolderOpen, description: "Gestión de archivos de Programación y Curso." },
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." },
      { href: "/normativa?tab=ccaa", label: "Normativa", icon: FileText, description: "Legislación, plantillas y normativas." },
      { href: "/magia?tab=comunidades", label: "MagIA", icon: Sparkles, description: "Generación del PDF y comparativas." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/contexto?tab=identificacion", label: "Contexto", icon: Compass, description: "Información general y características del entorno." },
      { href: "/curriculo?tab=ponderacion-ra-ce", label: "Currículo", icon: Grid, description: "Cruce de resultados de aprendizaje y criterios." },
      { href: "/metodologia?tab=metodologia", label: "Metodología", icon: Lightbulb, description: "Estrategias metodológicas y recursos." },
      { href: "/instrumentos?tab=resumen", label: "Instrumentos", icon: Wrench, description: "Definición y pesos de las herramientas de evaluación." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario?tab=fechas", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos y eventos." },
      { href: "/alumnado?tab=listado", label: "Alumnado", icon: Users, description: "Fichas personales y perfiles." },
      { href: "/seguimiento?tab=clases", label: "Seguimiento", icon: TrendingUp, description: "Diario de clases, faltas e incidencias." },
      { href: "/calificaciones?tab=resumen", label: "Calificaciones", icon: Award, description: "Cuaderno de notas y rúbricas aplicadas." },
    ]
  }
];
