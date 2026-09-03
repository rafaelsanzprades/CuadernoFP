import { Activity, Award, Calendar, CalendarDays, Compass, FileText, FolderOpen, GraduationCap, Grid, Info, Lightbulb, Scale, Sparkles, TrendingUp, Users, Wrench } from "lucide-react";

// Los 4 bloques del sidebar son siempre 4 páginas cada uno (16 en total),
// cada página con siempre 4 pestañas propias — ver Sidebar.tsx y
// app/inicio/page.tsx (pestaña Bienvenida, que repite este mismo array como
// tarjetas). Bloque "Inicio" muestra debajo la fecha DEMO/REAL; "Grupo",
// "Programación" y "Curso" muestran el nombre del fichero .fpg/.fpp/.fpc
// activo respectivamente.
export const navGroups = [
  {
    title: "Inicio",
    sectionDescription: "Por dónde empezar: tus ficheros, ayuda, y los catálogos y normativa de consulta — todo independiente de tener un grupo abierto.",
    items: [
      { href: "/inicio?tab=bienvenida", label: "Panel", icon: Activity, description: "Panel principal, verificación de datos, contribuciones de la comunidad y calidad EQAVET." },
      { href: "/ayuda?tab=guia", label: "Ayuda", icon: Info, description: "Guía de inicio, FAQ, acrónimos y mapa de la aplicación." },
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Normativa autonómica, legislación, bibliografía y estándares INCUAL." },
      { href: "/catalogo?tab=familias", label: "Catálogo", icon: GraduationCap, description: "Familias, títulos, módulos y currículos (RA y CE)." },
    ]
  },
  {
    title: "Grupo",
    sectionDescription: "Tu espacio de trabajo activo: gestión de ficheros, agenda del día a día, aviso legal y las herramientas de MagIA.",
    items: [
      { href: "/archivos?tab=datos", label: "Archivo", icon: FolderOpen, description: "Gestión de archivos, sincronización en la nube, seguridad y verificación de datos." },
      { href: "/agenda", label: "Agenda", icon: CalendarDays, description: "Resumen diario, avance mensual y previsión de RA y UD pendientes." },
      { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." },
      { href: "/magia?tab=comparativa", label: "MagIA", icon: Sparkles, description: "Comparativa y correspondencia APP-PD, documentos de apoyo de la programación y del curso." },
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

