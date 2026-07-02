import { Activity, BookOpen, Building2, Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, MapPin, Settings, TrendingUp, Users, Wrench, Sparkles, BarChart3, Shield, Award, Globe, Lightbulb } from "lucide-react";

export const navGroups = [
  {
    title: "",
    sectionDescription: "",
    items: [
      { href: "/catalogo", label: "Catálogo", icon: GraduationCap, description: "Catálogo oficial de familias profesionales, títulos, cursos → módulos. RA → CE." },
      { href: "/documentos", label: "Documentos", icon: FolderOpen, description: "Explorador de archivos oficiales, legislación y otros documentos." },
      { href: "/descargas", label: "Descargas", icon: FileText, description: "Generación de reportes y boletines en PDF." },
      { href: "/ayuda", label: "Ayuda", icon: Activity, description: "Panel de salud: verifica la coherencia y completitud de todos los datos del cuaderno." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: Settings, description: "Configuración básica del módulo didáctico, contexto, metodología y recursos." },
      { href: "/matrices", label: "Matrices OG→RA→CE→UD/T", icon: Grid, description: "Relación y ponderación entre los RA, CE y las diferentes UD/T del módulo." },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: Wrench, description: "Definición y ponderación de las herramientas y métodos de evaluación." },
      { href: "/programacion", label: "Programación de aula", icon: BookOpen, description: "Secuenciación temporal de las unidades didácticas o de trabajo y diseño de tareas competenciales." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario", label: "Calendario académico", icon: Calendar, description: "Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso." },
      { href: "/alumnado", label: "Alumnado y tutoría", icon: Users, description: "Gestión oficial del alumnado, ficha individual de orientación, asignación FEOE y matriz de tutoría." },
      { href: "/seguimiento", label: "Seguimiento diario", icon: MapPin, description: "Registro detallado del desarrollo diario de las clases y contingencias." },
      { href: "/progreso", label: "Progreso académico", icon: TrendingUp, description: "Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas." },
      { href: "/mejora", label: "Mejora Docente", icon: TrendingUp, description: "Panel de autoevaluación y rúbricas de mejora del desempeño docente." }
    ]
  }
];
