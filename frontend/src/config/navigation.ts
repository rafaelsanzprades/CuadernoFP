import { Activity, Award, Calendar, CalendarDays, Compass, FileText, FolderOpen, GraduationCap, Grid, Info, Lightbulb, Scale, Sparkles, TrendingUp, Users, Wrench } from "lucide-react";

// 3 bloques en el sidebar (16 páginas en total: 3+6+6), más "Legal" aparte,
// como enlace suelto al pie (ver footerPages) — no es un bloque de trabajo,
// es contenido de cumplimiento que casi nunca se visita, así que no compite
// por espacio con el resto. Bloque "Inicio" muestra debajo la fecha
// DEMO/REAL y el fichero .fpg activo (Archivo ya vive dentro de este
// bloque); "Programación" y "Curso" muestran el nombre del fichero
// .fpp/.fpc activo respectivamente. Reorganizado 2026-09-15 a petición de
// Rafael: Normativa/Catálogo pasan a Programación (son lo que consultas
// *mientras* programas, no antes) y Agenda/MagIA pasan a Curso (viven del
// día a día de un curso real) — ver 01 Histórico.md.
export const navGroups = [
  {
    title: "General",
    sectionDescription: "Por dónde empezar: tu panel, tus ficheros y la ayuda de la aplicación — todo independiente de tener un grupo abierto.",
    items: [
      { href: "/inicio?tab=bienvenida", label: "Inicio", icon: Activity, description: "Panel principal, verificación de datos, contribuciones de la comunidad y calidad EQAVET." },
      { href: "/archivos?tab=datos", label: "Archivo", icon: FolderOpen, description: "Gestión de archivos, sincronización en la nube, seguridad, verificación de datos y comparativa APP-PD." },
      { href: "/ayuda?tab=guia", label: "Ayuda", icon: Info, description: "Guía de inicio, FAQ, acrónimos y mapa de la aplicación." },
    ]
  },
  {
    title: "Programación [Código del módulo]",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/normativa?tab=autonomias", label: "Normativa", icon: FileText, description: "Normativa autonómica, legislación, bibliografía y estándares INCUAL." },
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
      { href: "/magia?tab=documentos-pdx", label: "MagIA", icon: Sparkles, description: "Generación de programaciones PD-/PD=/PD+, correspondencia APP-PD y documentos de apoyo de la programación y del curso." },
    ]
  }
];

// Enlace suelto al pie del sidebar (ver Sidebar.tsx) — mismo formato que un
// item de navGroups para poder reutilizar el resto de piezas (buscador
// global, tarjeta del mapa en /ayuda) sin duplicar su definición.
export const footerPages = [
  { href: "/legal?tab=aviso", label: "Legal", icon: Scale, description: "Aviso legal, privacidad, cookies y accesibilidad." },
];

