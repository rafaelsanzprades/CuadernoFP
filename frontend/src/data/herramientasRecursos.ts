export interface RecursoDidactico {
  id: string;
  label: string;
  categoria: string;
}

/**
 * Catálogo de herramientas y recursos didácticos genérico para cualquier
 * familia profesional, agrupado por categoría. Sirve de base seleccionable
 * en "Instrumentos y recursos" (recursos_espacios) — el profesorado puede
 * además añadir recursos propios como texto libre no codificado.
 */
export const RECURSOS_DIDACTICOS: RecursoDidactico[] = [
  // Espacios
  { id: "REC-AULA", label: "Aula técnica / polivalente", categoria: "Espacios" },
  { id: "REC-TALLER", label: "Taller específico", categoria: "Espacios" },
  { id: "REC-LAB", label: "Laboratorio", categoria: "Espacios" },
  { id: "REC-INFO", label: "Aula de informática", categoria: "Espacios" },
  { id: "REC-ALMACEN", label: "Almacén / pañol de herramientas", categoria: "Espacios" },
  { id: "REC-EXTERIOR", label: "Espacio exterior / patio de prácticas", categoria: "Espacios" },

  // Equipamiento y mobiliario de aula-taller
  { id: "REC-PIZARRA", label: "Pizarra y proyector / pantalla", categoria: "Equipamiento de aula" },
  { id: "REC-PDI", label: "Pizarra digital interactiva (PDI)", categoria: "Equipamiento de aula" },
  { id: "REC-ORDENADORES", label: "Ordenadores e impresora", categoria: "Equipamiento de aula" },
  { id: "REC-TABLETS", label: "Tablets / dispositivos móviles", categoria: "Equipamiento de aula" },
  { id: "REC-MOBILIARIO", label: "Mobiliario adaptable (mesas de trabajo en grupo)", categoria: "Equipamiento de aula" },

  // Software y plataformas TIC
  { id: "REC-SOFT-OFIMATICA", label: "Software ofimático (procesador, hoja de cálculo, presentaciones)", categoria: "Software y TIC" },
  { id: "REC-SOFT-ESPECIFICO", label: "Software específico del módulo / sector", categoria: "Software y TIC" },
  { id: "REC-EVA", label: "Entorno Virtual de Aprendizaje (Aules / Moodle / Classroom)", categoria: "Software y TIC" },
  { id: "REC-CLASSROOM", label: "Google Classroom / Google Workspace for Education", categoria: "Software y TIC" },
  { id: "REC-TEAMS", label: "Microsoft Teams para Educación / Microsoft 365 Educación", categoria: "Software y TIC" },
  { id: "REC-FORMS", label: "Formularios y cuestionarios online (Forms, Kahoot, Quizizz)", categoria: "Software y TIC" },
  { id: "REC-CAD", label: "Software de diseño asistido por ordenador (CAD/CAM)", categoria: "Software y TIC" },
  { id: "REC-SIMULADOR", label: "Software de simulación / entorno virtual de prácticas", categoria: "Software y TIC" },
  { id: "REC-GESTION-TALLER", label: "Software de gestión y control de taller", categoria: "Software y TIC" },
  { id: "REC-REPOSITORIO", label: "Repositorio documental compartido (Drive / OneDrive)", categoria: "Software y TIC" },

  // Documentación y bibliografía
  { id: "REC-MANUALES", label: "Manuales técnicos y libros de texto", categoria: "Documentación" },
  { id: "REC-NORMATIVA", label: "Normativa técnica y reglamentos del sector", categoria: "Documentación" },
  { id: "REC-FICHAS-TECNICAS", label: "Fichas técnicas y catálogos de fabricantes", categoria: "Documentación" },
  { id: "REC-APUNTES", label: "Apuntes y material elaborado por el profesorado", categoria: "Documentación" },
  { id: "REC-VIDEOTECA", label: "Videoteca / recursos audiovisuales técnicos", categoria: "Documentación" },

  // Herramientas y equipos de taller/laboratorio (genéricos)
  { id: "REC-HERR-MANUALES", label: "Herramientas manuales", categoria: "Herramientas de taller" },
  { id: "REC-HERR-ELECTRICAS", label: "Herramientas eléctricas / motorizadas", categoria: "Herramientas de taller" },
  { id: "REC-INSTR-MEDIDA", label: "Instrumentos y equipos de medida", categoria: "Herramientas de taller" },
  { id: "REC-MAQUINARIA", label: "Maquinaria y equipos específicos del sector", categoria: "Herramientas de taller" },
  { id: "REC-CONSUMIBLES", label: "Materiales consumibles y fungibles de prácticas", categoria: "Herramientas de taller" },
  { id: "REC-MAQUETAS", label: "Maquetas y bancos de prácticas / simulación de instalaciones", categoria: "Herramientas de taller" },

  // Seguridad y prevención de riesgos laborales
  { id: "REC-EPI", label: "Equipos de protección individual (EPI)", categoria: "Seguridad y PRL" },
  { id: "REC-EPC", label: "Equipos de protección colectiva", categoria: "Seguridad y PRL" },
  { id: "REC-SENALIZACION", label: "Señalización de seguridad del taller", categoria: "Seguridad y PRL" },
  { id: "REC-BOTIQUIN", label: "Botiquín y material de primeros auxilios", categoria: "Seguridad y PRL" },

  // Comunicación con el alumnado y las familias
  { id: "REC-EMAIL", label: "Correo electrónico institucional", categoria: "Comunicación" },
  { id: "REC-APP-COMUNICACION", label: "App de comunicación con familias/alumnado (Séneca, Educamos, etc.)", categoria: "Comunicación" },
];
