/**
 * Preparación de datos para guardar a fichero/nube -- lista blanca de claves
 * + borrado de texto catalog-duplicado, y cifrado opcional. Vive en su
 * propio módulo (no en fileManager.ts, de donde salió) para que
 * moduleSlice.ts pueda usarlo también sin crear un ciclo de imports
 * (fileManager.ts importa useAppStore.ts, que a su vez importa
 * moduleSlice.ts -- si moduleSlice.ts importara de fileManager.ts, el
 * ciclo se cerraría). Por eso serializeData() recibe la clave de cifrado
 * como parámetro en vez de leerla de useAppStore directamente.
 *
 * Usado por fileManager.ts::saveProgramacion()/saveCurso()/saveAs*() (guardado
 * explícito, "Guardar como", exportar) Y por moduleSlice.ts::saveModuleData()/
 * saveCursoData() (el guardado real detrás del autoguardado de 3s de
 * Header.tsx y de casi todos los botones "Guardar cambios" de las páginas) --
 * antes de unificar aquí, esta segunda ruta escribía moduleData/cursoData tal
 * cual, sin pasar por la lista blanca ni por el cifrado, así que el fichero
 * real en disco casi siempre acababa con la versión sin depurar y sin cifrar
 * pese a que el profesor hubiera puesto una clave de seguridad.
 */
import CryptoJS from "crypto-js";

const ALLOWED_PROGRAMACION_KEYS = [
  // Core curriculares
  'df_ud', 'df_sesiones', 'df_ra', 'df_ce',
  // Metodología y rúbricas (solo 0237, opcionales)
  'df_tareas', 'df_act', 'df_instr', 'df_pr', 'df_dua', 'df_contingencia', 'df_ace',
  // Configuración
  'info_modulo', 'config_contexto', 'config_aula', 'config_redondeo', 'ra_og_mapping',
  // FP Dual y EQAVET
  'dual_regimen', 'eqavet_evaluacion',
  // Escalas de evaluación cualitativas
  'escalas_evaluacion',
  // % instrumentos de evaluación por trimestre (tabla de criterios de calificación de PD-)
  'instrumentos_pct_trimestre',
  // Grupos de evaluación (GEv) -- subgrupos de alumnado a efectos de evaluación
  'grupos_evaluacion',
  // Indicadores del sistema de calificación por indicador
  'df_indicadores',
  // Rúbricas reutilizables (criterios + niveles de desempeño)
  'df_rubricas',
  // Fechas, horario y calendario
  'info_fechas', 'horario', 'calendar_notes', 'config_pesos_trim',
  // Planificación y empresas
  'planning_ledger', 'df_empresas',
  // Medidas e inclusión
  'medidas_inclusion', 'texto_inclusion_libre',
  'instrumentos_seleccionados', 'recursos_espacios', 'metodologias_seleccionadas',
  'texto_metodologia_libre', 'elementos_transversales',
  'medidas_contingencia', 'texto_contingencia_libre',
  'texto_contextualizacion_libre',
  // Textos narrativos PD (16 campos — ESENCIALES)
  'textos_pd_contexto_geografico', 'textos_pd_contexto_socioeconomico',
  'textos_pd_contexto_escolar', 'textos_pd_caracteristicas_alumnado',
  'textos_pd_feoe_organizacion', 'textos_pd_feoe_seguimiento',
  'textos_pd_eval_informacion', 'textos_pd_eval_perdida_continua',
  'textos_pd_eval_recuperacion', 'textos_pd_eval_pendientes',
  'textos_pd_metodologia_labor_coordinada', 'textos_pd_inclusion',
  'textos_pd_contingencia_profesor', 'textos_pd_contingencia_alumnado',
  'textos_pd_bibliografia', 'textos_pd_publicidad',
  // Metadatos
  '__version__', 'tipo', 'id'
];

const ALLOWED_CURSO_KEYS = [
  // Alumnado y evaluación
  'df_al', 'df_sgmt', 'df_feoe', 'df_eval', 'df_calificaciones',
  // Histórico de cambios de calificación (ítem 33) y reclamaciones (ítem 34)
  'historial_calificaciones', 'df_reclamaciones',
  // Seguimiento diario y asistencia
  'daily_ledger', 'attendance_ledger', 'profesional_ledger',
  // Horario y fechas (van en .fpc como datos del curso)
  'horario', 'info_fechas', 'calendar_notes',
  // Configuración
  'config_pesos_trim', 'config_asistencia',
  // Empresas y planificación
  'df_empresas', 'planning_ledger', 'plano_clase',
  // Contexto del grupo
  'rasgos_grupo',
  // Metadatos
  '__version__', 'tipo', 'id', 'grupo'
];

/** Prepare Programación data for export: strict key filtering and stripping redundant texts */
export function prepareProgramacionForExport(data: any): any {
  const exportData: any = {};
  for (const key of ALLOWED_PROGRAMACION_KEYS) {
    if (data[key] !== undefined) {
      // Create a deep copy to avoid mutating the original state
      exportData[key] = JSON.parse(JSON.stringify(data[key]));
    }
  }

  if (exportData.df_ra) {
    exportData.df_ra.forEach((ra: any) => {
      delete ra.desc_ra;
      delete ra.Descripción;
      delete ra.Horas;
    });
  }
  if (exportData.df_ce) {
    exportData.df_ce.forEach((ce: any) => {
      delete ce.desc_ce;
      delete ce.Descripción;
    });
  }
  if (exportData.info_modulo) {
    // Solo lo que es texto/dato oficial puro, sin uso editable en ningún
    // sitio (ver catalogCache.ts::resolveModulo*, que los resuelve en vivo
    // al mostrarlos) -- NO se tocan h_boa/h_sem/p_ev/h_feoe/curso/
    // carga_lectiva_anual: esos sí son editables por el profesor y se usan
    // en cálculos reales (Calendario, Verificación, DatosTab, asistencia).
    delete exportData.info_modulo.nombre;
    delete exportData.info_modulo.horas;
    delete exportData.info_modulo.horas_totales;
    delete exportData.info_modulo.familia;
    delete exportData.info_modulo.titulo_fp;
    delete exportData.info_modulo.nivel;
  }
  return exportData;
}

/** Prepare Curso data for export: strict key filtering */
export function prepareCursoForExport(data: any): any {
  const exportData: any = {};
  for (const key of ALLOWED_CURSO_KEYS) {
    if (data[key] !== undefined) {
      exportData[key] = JSON.parse(JSON.stringify(data[key]));
    }
  }
  return exportData;
}

/** Serialize data to JSON string for export, encrypt if a key is provided */
export function serializeData(data: any, encryptionKey?: string | null): string {
  const jsonStr = JSON.stringify(data, null, 2);
  if (encryptionKey) {
    return CryptoJS.AES.encrypt(jsonStr, encryptionKey).toString();
  }
  return jsonStr;
}
