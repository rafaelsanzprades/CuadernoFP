export const TAXONOMY_ASPECTOS_CLAVE = {
  // Procedimentales y Analíticos
  'AC-PRO-01': 'Identificación y reconocimiento de componentes/sistemas',
  'AC-PRO-02': 'Realización de cálculos y dimensionado',
  'AC-PRO-03': 'Interpretación de esquemas, planos o documentación técnica',
  'AC-PRO-04': 'Diagnóstico y localización sistemática de averías',
  // Técnicos y de Ejecución
  'AC-TEC-01': 'Manejo correcto de herramientas e instrumental',
  'AC-TEC-02': 'Técnicas correctas de montaje, ensamblado o fijación',
  'AC-TEC-03': 'Conexionado y configuración técnica',
  'AC-TEC-04': 'Proceso de reparación y sustitución',
  // Normativa y Seguridad
  'AC-NOR-01': 'Cumplimiento estricto de Prevención de Riesgos Laborales (PRL)',
  'AC-NOR-02': 'Aplicación de Normativa y Reglamentación específica',
  'AC-NOR-03': 'Gestión de residuos y normativas medioambientales',
  'AC-NOR-04': 'Uso correcto de Equipos de Protección Individual (EPI)',
  // Actitudinales y Soft-Skills
  'AC-ACT-01': 'Trabajo en equipo y coordinación',
  'AC-ACT-02': 'Autonomía y resolución de problemas',
  'AC-ACT-03': 'Limpieza y orden en el puesto de trabajo'
} as const;

export const TAXONOMY_RECURSOS = {
  // Recursos Didácticos e Informáticos
  'REC-DID-01': 'Presentación/Diapositivas de la UD',
  'REC-DID-02': 'Vídeos demostrativos / Multimedia',
  'REC-DID-03': 'Software de simulación / CAD',
  'REC-DID-04': 'Dispositivos informáticos (PCs, Tablets, Proyector)',
  // Documentación
  'REC-DOC-01': 'Manuales de fabricante y Catálogos comerciales',
  'REC-DOC-02': 'Boletines, reglamentación y normativa legal',
  'REC-DOC-03': 'Planos, esquemas o croquis',
  'REC-DOC-04': 'Checklists, rúbricas o modelos de informes',
  // Material de Taller / Laboratorio
  'REC-TAL-01': 'Maquetas didácticas / Entrenadores',
  'REC-TAL-02': 'Herramientas manuales (cajas de herramientas generales)',
  'REC-TAL-03': 'Instrumentos de medida y comprobación general',
  'REC-TAL-04': 'Material fungible y pequeño repuesto',
  'REC-TAL-05': 'EPIs y protecciones colectivas'
} as const;

export type AspectoClaveCode = keyof typeof TAXONOMY_ASPECTOS_CLAVE;
export type RecursoCode = keyof typeof TAXONOMY_RECURSOS;

export const getAllAspectosClave = () => Object.entries(TAXONOMY_ASPECTOS_CLAVE).map(([id, label]) => ({ id, label }));
export const getAllRecursos = () => Object.entries(TAXONOMY_RECURSOS).map(([id, label]) => ({ id, label }));
