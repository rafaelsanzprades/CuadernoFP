import { Activity, BookOpen, Building2, Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, MapPin, Settings, TrendingUp, Users, Wrench, Sparkles, BarChart3, Shield, Award, Globe, Lightbulb } from "lucide-react";

export const navGroups = [
  {
    title: "General",
    sectionDescription: "Opciones generales de la aplicación y recursos oficiales.",
    items: [
      { href: "/archivos", label: "Archivos", icon: FolderOpen, description: "Gestión de archivos de Programación y Curso." },
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, Títulos, Módulos y currículos (RA y CE)." },
      { href: "/normativa", label: "Normativa", icon: FileText, description: "Legislación, plantillas y normativas." }
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/contexto", label: "Contexto", icon: Compass, description: "Información general y características del entorno." },
      { href: "/curriculo?tab=ponderacion-ra-ce", label: "Currículo", icon: Grid, description: "Cruce de Resultados de aprendizaje y Criterios." },
      { href: "/metodologia", label: "Metodología", icon: Lightbulb, description: "Estrategias metodológicas y recursos." },
      { href: "/evaluacion", label: "Evaluación", icon: Wrench, description: "Definición de herramientas y rúbricas." },
      { href: "/secuenciacion", label: "Secuenciación", icon: BookOpen, description: "Unidades didácticas y temporalización." },
      { href: "/magia", label: "Magia", icon: Sparkles, description: "Generación del PDF y comparativas." }
    ]
  },
  {
    title: "Curso [Año]",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario", label: "Calendario", icon: Calendar, description: "Horario, trimestres, festivos y eventos." },
      { href: "/alumnado", label: "Alumnado", icon: Users, description: "Fichas personales y perfiles." },
      { href: "/diario", label: "Diario", icon: MapPin, description: "Programación de aula del día a día." },
      { href: "/seguimiento", label: "Seguimiento", icon: TrendingUp, description: "Control de faltas e incidencias." },
      { href: "/calificaciones", label: "Calificaciones", icon: Award, description: "Cuaderno de notas y rúbricas aplicadas." },
      { href: "/informes", label: "Informes", icon: BarChart3, description: "Boletines trimestrales y actas de evaluación." },
      { href: "/memoria", label: "Memoria", icon: FileText, description: "Memoria final del curso." },
      { href: "/calidad?tab=eqavet", label: "Calidad", icon: Shield, description: "Gestión de la calidad y marco EQAVET." }
    ]
  }
];
