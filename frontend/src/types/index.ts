import { z } from "zod";

export const SesionSchema = z.object({
  ID: z.string(),
  id_ud: z.string(),
  Num_Orden: z.number().or(z.string().transform(Number)),
  Horas: z.number().or(z.string().transform(Number)),
  Tipo_Actividad: z.string(),
  RA_CE: z.string().optional().nullable(),
  Contenidos: z.string().optional().nullable(),
  Aspectos_Clave: z.string().optional().nullable(),
  Recursos: z.string().optional().nullable(),
});
export type Sesion = z.infer<typeof SesionSchema>;

export const UnidadDidacticaSchema = z.object({
  id_ud: z.string(),
  desc_ud: z.string(),
  horas_ud: z.number(),
  ra_mappings: z.record(z.string(), z.any()).optional().nullable(),
});
export type UnidadDidactica = z.infer<typeof UnidadDidacticaSchema>;

export const TareaSchema = z.object({
  ID: z.string(),
  id_act: z.string().optional(),
  Nombre_Tarea: z.string().optional().nullable(),
  Reto: z.string().optional().nullable(),
  RA_Asociados: z.string().optional().nullable(),
  Instrumento: z.string().optional().nullable(),
  desc_act: z.string().optional().nullable(),
});
export type Tarea = z.infer<typeof TareaSchema>;

export const AlumnadoSchema = z.object({
  ID: z.string().optional(),
  student_id: z.string().optional(),
  Nombre: z.string().optional(),
  Apellidos: z.string().optional(),
  Estado: z.string().optional(),
  Edad: z.string().optional(),
  Nacimiento: z.string().optional(),
  Repite: z.string().optional(),
  Matricula: z.string().optional(),
  Comentarios: z.string().optional().nullable(),
  Email: z.string().optional().nullable(),
  Movil: z.string().optional().nullable(),
});
export type Alumnado = z.infer<typeof AlumnadoSchema>;

export const TutoriaActuacionSchema = z.object({
  id: z.string(),
  fecha: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  alumnadoIds: z.array(z.string()),
  ambito: z.string(),
  canal: z.string(),
  tipo: z.string(),
  tema: z.string(),
  participantes: z.string(),
  desarrollo: z.string(),
  acuerdos: z.string(),
});
export type TutoriaActuacion = z.infer<typeof TutoriaActuacionSchema>;

export const ResultadoAprendizajeSchema = z.object({
  id_ra: z.string(),
  desc_ra: z.string().optional().nullable(),
  peso_ra: z.number().optional(),
  is_dual: z.string().optional().nullable(),
  comp_clave: z.string().optional().nullable(),
  cpe: z.string().optional().nullable(),
});
export type ResultadoAprendizaje = z.infer<typeof ResultadoAprendizajeSchema>;

export const CriterioEvaluacionSchema = z.object({
  id_ce: z.string(),
  id_ra: z.string(),
  id_ud: z.string().optional(),
  desc_ce: z.string().optional().nullable(),
  peso_ce: z.number().optional(),
});
export type CriterioEvaluacion = z.infer<typeof CriterioEvaluacionSchema>;

export const IndicadorSchema = z.object({
  id_indicador: z.string(),
  id_ce: z.string(),
  descripcion: z.string(),
  peso: z.number().optional().default(1),
  is_basico: z.boolean().optional().default(false),
});
export type Indicador = z.infer<typeof IndicadorSchema>;

export const InstrumentoSchema = z.object({
  id_instrumento: z.string(),
  titulo: z.string(),
  tipo: z.enum(["rubrica", "lista_control", "escala_valoracion", "prueba_objetiva", "registro_observacion", "diario", "otro"]),
  escala: z.enum(["discreta_4", "discreta_letras", "continua_10"]),
  evaluacion: z.enum(["Ev1", "Ev2", "Ev3", "EvFO", "EvFE"]),
  agente: z.enum(["heteroevaluacion", "coevaluacion", "autoevaluacion"]).optional().default("heteroevaluacion"),
  peso_global: z.number().optional().default(1),
  indicadores_vinculados: z.array(z.string()).optional().default([]),
});
export type Instrumento = z.infer<typeof InstrumentoSchema>;

export const CalificacionSchema = z.object({
  id_calificacion: z.string(),
  id_alumno: z.string(),
  id_instrumento: z.string(),
  id_indicador: z.string(),
  valor: z.number().nullable(), // Null means not evaluated yet
  nota_calculada: z.number().optional().nullable(), // The continuous equivalent 0-10 based on scale
  justificacion: z.string().optional(),
  timestamp: z.number().optional(),
});
export type Calificacion = z.infer<typeof CalificacionSchema>;


export const SeguimientoUDSchema = z.record(z.string(), z.any()).and(
  z.object({
    id_ud: z.string(),
    horas_ud: z.number().optional(),
    Total_Imp: z.number().optional(),
  })
);
export type SeguimientoUD = z.infer<typeof SeguimientoUDSchema>;

export const ModuleDataSchema = z.object({
  df_ud: z.array(UnidadDidacticaSchema).optional(),
  df_sesiones: z.array(SesionSchema).optional(),
  df_ra: z.array(ResultadoAprendizajeSchema).optional(),
  df_ce: z.array(CriterioEvaluacionSchema).optional(),
  df_tareas: z.array(TareaSchema).optional(),
  df_act: z.array(z.any()).optional(),
  df_instr: z.array(InstrumentoSchema).optional(),
  df_indicadores: z.array(IndicadorSchema).optional(),
  df_pr: z.array(z.any()).optional(),
  df_dua: z.array(z.any()).optional(),
  df_contingencia: z.array(z.any()).optional(),
  df_ace: z.array(z.any()).optional(),
  info_modulo: z.record(z.string(), z.any()).optional(),
  config_contexto: z.record(z.string(), z.any()).optional(),
  config_aula: z.record(z.string(), z.any()).optional(),
  config_redondeo: z.record(z.string(), z.any()).optional(),
  medidas_inclusion: z.array(z.string()).optional(),
  texto_inclusion_libre: z.string().optional(),
  instrumentos_seleccionados: z.array(z.string()).optional(),
  recursos_espacios: z.array(z.string()).optional(),
  metodologias_seleccionadas: z.array(z.string()).optional(),
  texto_metodologia_libre: z.string().optional(),
  elementos_transversales: z.array(z.string()).optional(),
  actividades_complementarias: z.array(z.string()).optional(),
  medidas_contingencia: z.array(z.string()).optional(),
  texto_contingencia_libre: z.string().optional(),
  
  // Fase 5: Textos Narrativos para Generación de PD (Modelo JEG)
  textos_pd_contexto_geografico: z.string().optional(),
  textos_pd_contexto_socioeconomico: z.string().optional(),
  textos_pd_contexto_escolar: z.string().optional(),
  textos_pd_caracteristicas_alumnado: z.string().optional(),
  
  textos_pd_feoe_organizacion: z.string().optional(),
  textos_pd_feoe_seguimiento: z.string().optional(),
  
  textos_pd_eval_informacion: z.string().optional(),
  textos_pd_eval_perdida_continua: z.string().optional(),
  textos_pd_eval_recuperacion: z.string().optional(),
  textos_pd_eval_pendientes: z.string().optional(),
  
  textos_pd_metodologia_labor_coordinada: z.string().optional(),
  textos_pd_inclusion: z.string().optional(),
  textos_pd_contingencia_profesor: z.string().optional(),
  textos_pd_contingencia_alumnado: z.string().optional(),
  
  textos_pd_bibliografia: z.string().optional(),
  textos_pd_publicidad: z.string().optional(),

  __version__: z.number().optional(),
});
export type ModuleData = z.infer<typeof ModuleDataSchema>;



export const CursoDataSchema = z.object({
  df_al: z.array(AlumnadoSchema).optional(),
  df_sgmt: z.array(SeguimientoUDSchema).optional(),
  df_eval: z.array(z.any()).optional(),
  df_calificaciones: z.array(CalificacionSchema).optional(),
  df_feoe: z.array(z.any()).optional(),
  daily_ledger: z.record(z.string(), z.any()).optional(),
  tutoria_ledger: z.record(z.string(), z.any()).optional(),
  horario: z.record(z.string(), z.any()).optional(),
  info_fechas: z.record(z.string(), z.any()).optional(),
  calendar_notes: z.record(z.string(), z.any()).optional(),
  planning_ledger: z.record(z.string(), z.any()).optional(),
  plano_clase: z.record(z.string(), z.any()).optional(),
  actuaciones_tutoria: z.array(z.any()).optional(),
  __version__: z.number().optional(),
}).passthrough();
export type CursoData = z.infer<typeof CursoDataSchema>;

export const GlobalDataSchema = z.object({
  titulos: z.array(z.any()).optional(),
  modulos: z.array(z.any()).optional(),
  profesores: z.array(z.any()).optional(),
  grupos: z.array(z.any()).optional(),
  instrumentos: z.array(z.any()).optional(),
  recursos: z.array(z.any()).optional(),
  crm_empresas: z.array(z.any()).optional(),
}).passthrough();
export type GlobalData = z.infer<typeof GlobalDataSchema>;

export interface Degree {
  id: number;
  name: string;
  code: string;
  family: string;
  modules: Module[];
}

export interface Module {
  id: number;
  name: string;
  code: string;
  acronym?: string;
  hours: number;
  assignedTeacherId?: number | null;
  ras?: any[];
  isDual?: boolean;
  [key: string]: any;
}

// Alias para compatibilidad con código existente
export type ModuleAssignment = Module;

export interface CourseGroup {
  id: number;
  name: string;
  degreeName: string;
  level: string;
  modules: ModuleAssignment[];
  [key: string]: any;
}

export interface FileSource {
  type: 'none' | 'new' | 'local' | 'drive';
  fileHandle?: FileSystemFileHandle;
  driveFileId?: string;
  fileName?: string;
}

export interface Degree {
  id: number;
  name: string;
  level: string;
}

export interface Family {
  id: number;
  name: string;
  degrees: Degree[];
}

export interface Teacher {
  id: number;
  name: string;
  degrees: Degree[];
}

export interface AppState {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  activeCursoId: string;
  setActiveCursoId: (id: string) => void;
  
  moduleData: ModuleData | null;
  setModuleData: (data: ModuleData | null) => void;
  updateDataFrame: (key: keyof ModuleData, data: any[]) => void;
  updateModuleData: (key: keyof ModuleData, data: any) => void;
  updateInfoModulo: (key: string, value: any) => void;
  
  cursoData: CursoData | null;
  setCursoData: (data: CursoData | null) => void;
  updateCursoData: (key: keyof CursoData, data: any) => void;
  
  globalData: GlobalData | null;
  setGlobalData: (data: GlobalData | null) => void;
  updateGlobalData: (key: keyof GlobalData, data: any) => void;
  
  saveModuleData: () => Promise<boolean | 'conflict'>;
  saveCursoData: () => Promise<boolean | 'conflict'>;
  
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isWizardOpen: boolean;
  setWizardOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  
  groups: CourseGroup[];
  setGroups: (groups: CourseGroup[] | ((prev: CourseGroup[]) => CourseGroup[])) => void;
  
  dataSource: 'demo' | 'local';
  setDataSource: (source: 'demo' | 'local') => void;
  
  isDriveConnected: boolean;
  setDriveConnected: (connected: boolean) => void;
  driveUserEmail: string | null;
  setDriveUserEmail: (email: string | null) => void;
  autoSyncDrive: boolean;
  setAutoSyncDrive: (sync: boolean) => void;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  
  isOneDriveConnected: boolean;
  setOneDriveConnected: (connected: boolean) => void;
  oneDriveUserEmail: string | null;
  setOneDriveUserEmail: (email: string | null) => void;
  oneDriveClientId: string;
  setOneDriveClientId: (id: string) => void;

  isLoadingData: boolean;
  setLoadingData: (loading: boolean) => void;

  pdFileSource: FileSource;
  setPdFileSource: (source: FileSource) => void;
  cursoFileSource: FileSource;
  setCursoFileSource: (source: FileSource) => void;
  workspaceHandle: FileSystemDirectoryHandle | null;
  setWorkspaceHandle: (handle: FileSystemDirectoryHandle | null) => void;

  syncStatus: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
  setSyncStatus: (status: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error') => void;

  encryptionKey: string | null;
  setEncryptionKey: (key: string | null) => void;
}
