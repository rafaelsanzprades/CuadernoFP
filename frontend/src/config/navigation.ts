import { Activity, BookOpen, Building2, Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, MapPin, Settings, TrendingUp, Users, Wrench, Sparkles, BarChart3, Shield, Award, Globe, Lightbulb } from "lucide-react";

export const navGroups = [
  {
    title: "General",
    sectionDescription: "Opciones generales de la aplicación y recursos oficiales.",
    items: [
      { href: "/catalogo", label: "Catálogo", icon: GraduationCap, description: "Familias, Títulos, Módulos y currículos (RA y CE)." },
      { href: "/archivos", label: "Archivos", icon: FolderOpen, description: "Gestión de archivos de Programación y Curso." },
      { href: "/documentos", label: "Documentos", icon: FileText, description: "Legislación, plantillas y normativas." },
      { href: "/descargas", label: "Descargas", icon: FileText, description: "Generación de actas, informes y boletines." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/modulo", label: "Módulo", icon: Settings, description: "Contexto, metodología y recursos básicos." },
      { href: "/matrices", label: "Matrices", icon: Grid, description: "Ponderación y cruce de RA, CE y Unidades Didácticas." },
      { href: "/instrumentos", label: "Instrumentos", icon: Wrench, description: "Definición y pesos de las herramientas de evaluación." },
      { href: "/programacion", label: "Secuenciación", icon: BookOpen, description: "Programación de aula: Diseño y temporalización de Unidades y Tareas." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario", label: "Calendario", icon: Calendar, description: "Horario semanal, trimestres, festivos y eventos." },
      { href: "/alumnado", label: "Alumnado", icon: Users, description: "Fichas, tutorías, prevención de abandono y plano de clase." },
      { href: "/seguimiento", label: "Diario", icon: MapPin, description: "Diario de aula, control de asistencia e incidencias." },
      { href: "/progreso", label: "Evaluación", icon: TrendingUp, description: "Progreso académico: Cuaderno de notas, rúbricas y analíticas por RA." }
    ]
  }
];
