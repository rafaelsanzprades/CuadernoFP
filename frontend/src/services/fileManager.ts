import { useAppStore } from "@/store/useAppStore";
import { ModuleData, CursoData, FileSource } from "@/types";
import CryptoJS from "crypto-js";
export type DataSourceType = 'demo' | 'local';

// ─── Helpers ────────────────────────────────────────────────

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
  // Indicadores del sistema de calificación por indicador
  'df_indicadores',
  // Fechas, horario y calendario
  'info_fechas', 'horario', 'calendar_notes', 'config_pesos_trim',
  // Planificación y empresas
  'planning_ledger', 'df_empresas',
  // Medidas e inclusión
  'medidas_inclusion', 'texto_inclusion_libre',
  'instrumentos_seleccionados', 'recursos_espacios', 'metodologias_seleccionadas',
  'texto_metodologia_libre', 'elementos_transversales', 'actividades_complementarias',
  'actividades_extraescolares',
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
  // Seguimiento diario y tutoría
  'daily_ledger', 'tutoria_ledger', 'profesional_ledger',
  // Horario y fechas (van en .fpc como datos del curso)
  'horario', 'info_fechas', 'calendar_notes',
  // Configuración
  'config_pesos_trim', 'config_asistencia',
  // Empresas y planificación
  'df_empresas', 'planning_ledger', 'plano_clase',
  // Tutoría
  'actuaciones_tutoria',
  // Contexto del grupo
  'rasgos_grupo',
  // Metadatos
  '__version__', 'tipo', 'id', 'grupo'
];

/** Prepare Programación data for export: strict key filtering and stripping redundant texts */
function prepareProgramacionForExport(data: any): any {
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
  return exportData;
}

/** Prepare Curso data for export: strict key filtering */
function prepareCursoForExport(data: any): any {
  const exportData: any = {};
  for (const key of ALLOWED_CURSO_KEYS) {
    if (data[key] !== undefined) {
      exportData[key] = JSON.parse(JSON.stringify(data[key]));
    }
  }
  return exportData;
}

/** Trigger browser download of a JSON string as a file */
function downloadJson(dataStr: string, filename: string) {
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Serialize data to JSON string for export, encrypt if key is present */
function serializeData(data: any): string {
  const jsonStr = JSON.stringify(data, null, 2);
  const key = useAppStore.getState().encryptionKey;
  if (key) {
    return CryptoJS.AES.encrypt(jsonStr, key).toString();
  }
  return jsonStr;
}

// ─── File Manager ───────────────────────────────────────────

export const fileManager = {

  // ── DEMO ────────────────────────────────────────────────

  async loadDemoData(groupId?: string): Promise<void> {
    // If no group is passed, default to a sensible demo group
    if (!groupId || groupId === '0237' || groupId === '0237-1a') groupId = '202526 G 1A-GM 0237-ICTVE.fpg';

    const fpgName = groupId;
    const moduleCode = groupId.includes('0223') ? '0223' : '0237';
    const store = useAppStore.getState();

    try {
      // 1. Fetch .fpg (Group project file)
      const fpgRes = await fetch(`/demo/${encodeURIComponent(fpgName)}`);
      if (!fpgRes.ok) throw new Error(`Failed to fetch /demo/${fpgName}`);
      const fpgText = await fpgRes.text();
      const groupData = JSON.parse(fpgText);

      if (groupData.tipo !== "GRUPO" || !groupData.archivos) {
        throw new Error("Invalid .fpg format");
      }

      // 2. Fetch linked .fpp (programación)
      const fppRes = await fetch(`/demo/${encodeURIComponent(groupData.archivos.programacion)}`);
      if (!fppRes.ok) throw new Error(`Failed to fetch /demo/${groupData.archivos.programacion}`);
      const pdText = await fppRes.text();
      const pdData = JSON.parse(pdText);

      // 3. Fetch linked .fpc (curso)
      const fpcRes = await fetch(`/demo/${encodeURIComponent(groupData.archivos.curso)}`);
      if (!fpcRes.ok) throw new Error(`Failed to fetch /demo/${groupData.archivos.curso}`);
      const fpcText = await fpcRes.text();
      let cursoDataArray = JSON.parse(fpcText);
      
      // If legacy array format, pick the first
      let cursoData = Array.isArray(cursoDataArray) ? cursoDataArray[0] : cursoDataArray;

      // Extract IDs
      const pdId = pdData.id || `${moduleCode}-pd`;
      const cursoId = cursoData.id || `${moduleCode}-curso`;

      // Set state
      store.setDataSource("demo");
      store.setActiveModuleId(pdId);
      store.setModuleData(pdData as any);
      store.setActiveCursoId(cursoId);
      store.setCursoData(cursoData as any);
      
      // Demo files have no local file handle, but we store the filename for UI
      store.setPdFileSource({ type: 'none', fileName: groupData.archivos.programacion });
      store.setCursoFileSource({ type: 'none', fileName: groupData.archivos.curso });
      store.setGroupFileSource({ type: 'none', fileName: fpgName });

    } catch (e) {
      console.error("Error loading demo data from fpg:", e);
    }
  },

  /** Create a blank Programación + Curso (local-first, no backend write) so REALES
   * pages render normally with no data loaded yet. Defaults to "sin nombre"; pass
   * pdName/cursoName to seed a named Archivos instead (used by the welcome wizard's
   * "Crear mis archivos" flow). */
  createBlankLocalData(pdName?: string, cursoName?: string): void {
    const store = useAppStore.getState();

    const pdId = pdName ? `${pdName}-pd` : 'sin-nombre-pd';
    const pdLabel = pdName ? `Programación ${pdName}` : 'Programación sin nombre';
    const cursoId = pdName ? `${pdName}-curso-${cursoName || ''}` : 'sin-nombre-curso';
    const cursoLabel = cursoName ? `Curso ${cursoName}` : 'Curso sin nombre';

    store.setActiveModuleId(pdId);
    store.setModuleData({
      info_modulo: { nombre: pdLabel },
      df_ud: [], df_sesiones: [], df_ra: [], df_ce: [], df_tareas: [], df_act: [],
      df_instr: [], df_indicadores: [],
      dual_regimen: 'ninguno', eqavet_evaluacion: {}, config_contexto: {},
    } as any);
    store.setPdFileSource({ type: 'new', fileName: pdLabel });

    store.setActiveCursoId(cursoId);
    store.setCursoData({
      df_al: [], df_eval: [], daily_ledger: {}, tutoria_ledger: {},
      horario: {}, info_fechas: {}, plano_clase: {},
    } as any);
    store.setCursoFileSource({ type: 'new', fileName: cursoLabel });

    store.setGroupFileSource({ type: 'new', fileName: pdName ? `Grupo ${pdName}` : 'Grupo sin nombre' });
  },

  // ── NEW (Wizard) ────────────────────────────────────────

  /** Create a new empty programación from catalog data */
  async createNewProgramacion(moduleCode: string, moduleName: string, extras?: Record<string, any>): Promise<boolean> {
    try {
      const store = useAppStore.getState();
      store.setDataSource("local");

      // Fetch RA/CE from catalog
      let df_ra: any[] = [];
      let df_ce: any[] = [];
      try {
        const res = await fetch(`/api/catalog/module/${moduleCode}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data?.ra) {
            const apiRas = json.data.ra;
            df_ra = apiRas.map((r: any) => ({
              id_ra: r.id,
              desc_ra: r.descripcion,
              Descripción: r.descripcion,
              peso_ra: 0,
              "Peso (%)": 0,
              is_dual: false,
            }));
            df_ce = [];
            apiRas.forEach((r: any) => {
              if (r.ce && r.ce.length > 0) {
                const weight = Math.floor(100 / r.ce.length);
                r.ce.forEach((c: any) => {
                  df_ce.push({
                    id_ce: c.id,
                    CE: c.id,
                    id_ra: r.id,
                    RA: r.id,
                    desc_ce: c.descripcion,
                    Descripción: c.descripcion,
                    peso_ce: weight,
                    "Peso (%)": weight,
                    is_dual: false,
                    UD: "",
                  });
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch catalog for module", moduleCode, err);
      }

      const newModuleData: ModuleData = {
        df_ud: [],
        df_sesiones: [],
        df_ra,
        df_ce,
        df_tareas: [],
        df_act: [],
        df_instr: [],
        df_pr: [],
        df_dua: [],
        df_contingencia: [],
        df_ace: [],
        info_modulo: {
          codigo: moduleCode,
          nombre: moduleName,
          ...(extras || {})
        },
        config_contexto: {},
        config_aula: {},
        config_redondeo: {},
        dual_regimen: "ninguno",
        eqavet_evaluacion: {},
        __version__: 1,
      };

      const id = `${moduleCode}-pd`;
      const fileName = `P - ${moduleCode} - ${moduleName.replace(/[\\/:*?"<>|]/g, '')}.json`;
      store.setActiveModuleId(id);
      store.setModuleData(newModuleData);

      const handle = store.workspaceHandle;
      if (handle) {
        try {
          const fileHandle = await handle.getFileHandle(fileName, { create: true });
          const writable = await (fileHandle as any).createWritable();
          await writable.write(JSON.stringify(newModuleData, null, 2));
          await writable.close();
          store.setPdFileSource({ type: 'local', fileName, fileHandle });
        } catch (e) {
          console.error("Failed to write new PD to workspace", e);
          store.setPdFileSource({ type: 'new', fileName });
        }
      } else {
        store.setPdFileSource({ type: 'new', fileName });
      }

      return true;
    } catch (e) {
      console.error("Error creating new programación", e);
      return false;
    }
  },

  /** Create a new empty curso */
  async createNewCurso(cursoName: string, year: string): Promise<boolean> {
    const store = useAppStore.getState();
    store.setDataSource("local");

    const newCursoData: CursoData = {
      df_al: [],
      df_sgmt: [],
      df_feoe: [],
      df_eval: [],
      daily_ledger: {},
      tutoria_ledger: {},
      profesional_ledger: {},
      horario: {},
      info_fechas: {},
      calendar_notes: {},
      planning_ledger: {},
      plano_clase: {},
      actuaciones_tutoria: [],
      __version__: 1,
    };

    const fileName = `C - ${year} - ${cursoName.replace(/[\\/:*?"<>|]/g, '')}.fpc`;
    const id = fileName;
    store.setActiveCursoId(id);
    store.setCursoData(newCursoData);

    const handle = store.workspaceHandle;
    const pdFileSource = store.pdFileSource;
    if (handle) {
      try {
        const fileHandle = await handle.getFileHandle(fileName, { create: true });
        const writable = await (fileHandle as any).createWritable();
        await writable.write(JSON.stringify(newCursoData, null, 2));
        await writable.close();
        store.setCursoFileSource({ type: 'local', fileName, fileHandle });

        // Also create the Group file
        const groupFileName = `G - ${cursoName.replace(/[\\/:*?"<>|]/g, '')} - ${year}.fpg`;
        const groupHandle = await handle.getFileHandle(groupFileName, { create: true });
        const groupWritable = await (groupHandle as any).createWritable();
        
        let relatedPd = "";
        if (pdFileSource.type === 'local' && pdFileSource.fileName) {
          relatedPd = pdFileSource.fileName;
        }

        const groupData = {
          tipo: "GRUPO",
          id: groupFileName,
          nombre: cursoName,
          curso_academico: year,
          archivos: {
            programacion: relatedPd,
            curso: fileName
          }
        };

        await groupWritable.write(JSON.stringify(groupData, null, 2));
        await groupWritable.close();

      } catch (e) {
        console.error("Failed to write new Curso to workspace", e);
        store.setCursoFileSource({ type: 'new', fileName });
      }
    } else {
      store.setCursoFileSource({ type: 'new', fileName });
    }

    return true;
  },

  /** Create a new curso with demo data (appends " Demo" to student last names) */
  async createNewCursoFromDemo(cursoName: string, year: string): Promise<boolean> {
    const store = useAppStore.getState();
    const activeModuleId = store.activeModuleId;
    if (!activeModuleId) return false;

    // Fetch demo curso data from the real .fpc demo file matching the active module
    const demoFileName = activeModuleId.includes('0223')
      ? '202526 C 2-GM 0223-OA.fpc'
      : '202526 C 1A-GM 0237-ICTVE.fpc';
    let demoCursoData: any;
    try {
      const res = await fetch(`/demo/${encodeURIComponent(demoFileName)}`);
      if (!res.ok) throw new Error('Failed to fetch demo curso');
      const cursoArray = await res.json();
      demoCursoData = Array.isArray(cursoArray) ? cursoArray[0] : cursoArray;
    } catch (e) {
      console.error("Error fetching demo curso for new curso:", e);
      return false;
    }

    const newCursoData: CursoData = JSON.parse(JSON.stringify(demoCursoData));
    
    if (newCursoData.df_al) {
      newCursoData.df_al.forEach((al: any) => {
        if (al.Apellidos) {
          al.Apellidos = al.Apellidos + " Demo";
        } else {
          al.Apellidos = "Demo";
        }
      });
    }
    
    // Convert to version 1 to start fresh
    newCursoData.__version__ = 1;

    // We want the ID to start with 0237 so Header formats it correctly
    const id = `0237-demo-${year}`;

    // Update store with new curso
    store.setDataSource("local");
    store.setActiveCursoId(id);
    store.setCursoData(newCursoData);
    store.setCursoFileSource({ type: 'new', fileName: `${id}.fpc` });
    return true;
  },

  // ── OPEN (File picker + drag & drop) ────────────────────

  /** Open file via File System Access API (preserves handle for save) */
  async openProgramacionWithHandle(): Promise<boolean> {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Programación Cuaderno FP',
          accept: { 'application/json': ['.fpp', '.json'] },
        }],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();
      const success = await this.importProgramacion(text, file.name);
      if (success) {
        const store = useAppStore.getState();
        store.setPdFileSource({
          type: 'local',
          fileHandle: handle,
          fileName: file.name,
        });
      }
      return success;
    } catch (e: any) {
      if (e?.name === 'AbortError') return false; // User cancelled
      console.error("Error opening file", e);
      return false;
    }
  },

  /** Open curso via File System Access API */
  async openCursoWithHandle(): Promise<boolean> {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Curso Cuaderno FP',
          accept: { 'application/json': ['.fpc', '.json'] },
        }],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();
      const success = await this.importCurso(text, file.name);
      if (success) {
        const store = useAppStore.getState();
        store.setCursoFileSource({
          type: 'local',
          fileHandle: handle,
          fileName: file.name,
        });
      }
      return success;
    } catch (e: any) {
      if (e?.name === 'AbortError') return false;
      console.error("Error opening curso file", e);
      return false;
    }
  },

  // ── WORKSPACE (Directory picking for groups) ────────────────────

  async openWorkspaceDirectory(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      useAppStore.getState().setWorkspaceHandle(dirHandle);
      return dirHandle;
    } catch (e: any) {
      if (e?.name === 'AbortError') return null;
      console.error("Error opening workspace directory", e);
      return null;
    }
  },

  async scanGroupsInWorkspace(dirHandle: FileSystemDirectoryHandle): Promise<string[]> {
    const groups: string[] = [];
    try {
      for await (const entry of (dirHandle as any).values()) {
        if (entry.kind === 'file' && entry.name.startsWith('G - ') && (entry.name.endsWith('.fpg') || entry.name.endsWith('.json'))) {
          groups.push(entry.name);
        }
      }
    } catch (e) {
      console.error("Error scanning groups", e);
    }
    return groups.sort();
  },

  async scanWorkspaceFiles(dirHandle: FileSystemDirectoryHandle): Promise<{grupos: string[], programaciones: string[], cursos: string[]}> {
    const grupos: string[] = [];
    const programaciones: string[] = [];
    const cursos: string[] = [];
    try {
      for await (const entry of (dirHandle as any).values()) {
        if (entry.kind === 'file') {
          if (entry.name.startsWith('G - ') && (entry.name.endsWith('.fpg') || entry.name.endsWith('.json'))) grupos.push(entry.name);
          else if (entry.name.startsWith('P - ') && (entry.name.endsWith('.fpp') || entry.name.endsWith('.json'))) programaciones.push(entry.name);
          else if (entry.name.startsWith('C - ') && (entry.name.endsWith('.fpc') || entry.name.endsWith('.json'))) cursos.push(entry.name);
        }
      }
    } catch (e) {
      console.error("Error scanning workspace files", e);
    }
    return {
      grupos: grupos.sort(),
      programaciones: programaciones.sort(),
      cursos: cursos.sort()
    };
  },

  async loadGroupFromWorkspace(dirHandle: FileSystemDirectoryHandle, groupFileName: string): Promise<boolean> {
    try {
      const groupHandle = await dirHandle.getFileHandle(groupFileName);
      const groupFile = await groupHandle.getFile();
      const groupText = await groupFile.text();
      const groupData = JSON.parse(groupText);

      if (groupData.tipo !== 'grupo' || !groupData.programacion || !groupData.curso) {
        throw new Error("Invalid group file format");
      }

      // Read Programacion
      const pdFileName = groupData.programacion.endsWith('.fpp') || groupData.programacion.endsWith('.json') ? groupData.programacion : `${groupData.programacion}.fpp`;
      const pdHandle = await dirHandle.getFileHandle(pdFileName);
      const pdFile = await pdHandle.getFile();
      const pdText = await pdFile.text();
      
      // Read Curso
      const cursoFileName = groupData.curso.endsWith('.fpc') || groupData.curso.endsWith('.json') ? groupData.curso : `${groupData.curso}.fpc`;
      const cursoHandle = await dirHandle.getFileHandle(cursoFileName);
      const cursoFile = await cursoHandle.getFile();
      const cursoText = await cursoFile.text();

      // Set Source explicitly to local to break away from demo
      useAppStore.getState().setDataSource('local');

      // Import them into state
      const pdSuccess = await this.importProgramacion(pdText, pdFile.name);
      const cursoSuccess = await this.importCurso(cursoText, cursoFile.name);

      if (pdSuccess && cursoSuccess) {
        // Also update file sources to use these handles for saving
        const store = useAppStore.getState();
        store.setPdFileSource({
          type: 'local',
          fileHandle: pdHandle,
          fileName: pdFile.name,
        });
        store.setCursoFileSource({
          type: 'local',
          fileHandle: cursoHandle,
          fileName: cursoFile.name,
        });
        store.setGroupFileSource({
          type: 'local',
          fileHandle: groupHandle,
          fileName: groupFileName,
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error loading group", e);
      return false;
    }
  },

  async loadProgramacionFromWorkspace(dirHandle: FileSystemDirectoryHandle, pdFileName: string): Promise<boolean> {
    try {
      const pdHandle = await dirHandle.getFileHandle(pdFileName);
      const pdFile = await pdHandle.getFile();
      const pdText = await pdFile.text();
      
      useAppStore.getState().setDataSource('local');
      const pdSuccess = await this.importProgramacion(pdText, pdFile.name);
      
      if (pdSuccess) {
        const store = useAppStore.getState();
        store.setPdFileSource({
          type: 'local',
          fileHandle: pdHandle,
          fileName: pdFile.name,
        });
        // Unload curso
        store.setActiveCursoId("");
        store.setCursoData(null);
        store.setCursoFileSource({ type: 'none' });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error loading programacion", e);
      return false;
    }
  },

  // ── SAVE (overwrite original) ───────────────────────────

  /** Save programación: overwrite original file if available, always sync Drive */
  async saveProgramacion(): Promise<boolean> {
    const store = useAppStore.getState();
    const { activeModuleId, moduleData, pdFileSource, isDriveConnected, autoSyncDrive } = store;
    if (!activeModuleId || !moduleData) return false;

    const exportData = prepareProgramacionForExport(moduleData);
    const jsonStr = serializeData(exportData);

    // 1. Overwrite original file via File System Access API
    if (pdFileSource.type === 'local' && pdFileSource.fileHandle) {
      try {
        const writable = await (pdFileSource.fileHandle as FileSystemFileHandle).createWritable();
        await writable.write(jsonStr);
        await writable.close();
      } catch (e: any) {
        if (e?.name === 'AbortError') return false;
        console.error("Error saving to local file", e);
      }
    }

    // 2. Sync to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      try {
        const { driveService } = await import('@/services/driveService');
        await driveService.saveFile(`${activeModuleId}.fpp`, exportData);
      } catch (e) {
        console.error("Error syncing to Drive", e);
      }
    }

    // 3. Update version
    store.setModuleData({ ...moduleData, __version__: (moduleData.__version__ || 0) + 1 });
    return true;
  },

  /** Save curso: overwrite original file if available, always sync Drive */
  async saveCurso(): Promise<boolean> {
    const store = useAppStore.getState();
    const { activeCursoId, cursoData, cursoFileSource, isDriveConnected, autoSyncDrive } = store;
    if (!activeCursoId || !cursoData) return false;

    const exportData = prepareCursoForExport(cursoData);
    const jsonStr = serializeData(exportData);

    // 1. Overwrite original file via File System Access API
    if (cursoFileSource.type === 'local' && cursoFileSource.fileHandle) {
      try {
        const writable = await (cursoFileSource.fileHandle as FileSystemFileHandle).createWritable();
        await writable.write(jsonStr);
        await writable.close();
      } catch (e: any) {
        if (e?.name === 'AbortError') return false;
        console.error("Error saving to local curso file", e);
      }
    }

    // 2. Sync to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      try {
        const { driveService } = await import('@/services/driveService');
        await driveService.saveFile(`${activeCursoId}.fpc`, exportData);
      } catch (e) {
        console.error("Error syncing curso to Drive", e);
      }
    }

    // 3. Update version
    store.setCursoData({ ...cursoData, __version__: (cursoData.__version__ || 0) + 1 });
    return true;
  },

  // ── SAVE AS (new destination) ───────────────────────────

  /** Save programación as a new file (always downloads) */
  async saveAsProgramacion(): Promise<boolean> {
    const store = useAppStore.getState();
    const { activeModuleId, moduleData } = store;
    if (!activeModuleId || !moduleData) return false;

    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${activeModuleId}.fpp`,
        types: [{
          description: 'Programación Cuaderno FP',
          accept: { 'application/json': ['.fpp'] },
        }],
      });
      const exportData = prepareProgramacionForExport(moduleData);
      const jsonStr = serializeData(exportData);
      const writable = await handle.createWritable();
      await writable.write(jsonStr);
      await writable.close();

      store.setPdFileSource({
        type: 'local',
        fileHandle: handle,
        fileName: handle.name,
      });
      return true;
    } catch (e: any) {
      if (e?.name === 'AbortError') return false;
      console.error("Error in save as programación", e);
      return false;
    }
  },

  /** Save curso as a new file (always downloads) */
  async saveAsCurso(): Promise<boolean> {
    const store = useAppStore.getState();
    const { activeCursoId, cursoData } = store;
    if (!activeCursoId || !cursoData) return false;

    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${activeCursoId}.fpc`,
        types: [{
          description: 'Curso Cuaderno FP',
          accept: { 'application/json': ['.fpc'] },
        }],
      });
      const exportData = prepareCursoForExport(cursoData);
      const jsonStr = serializeData(exportData);
      const writable = await handle.createWritable();
      await writable.write(jsonStr);
      await writable.close();

      store.setCursoFileSource({
        type: 'local',
        fileHandle: handle,
        fileName: handle.name,
      });
      return true;
    } catch (e: any) {
      if (e?.name === 'AbortError') return false;
      console.error("Error in save as curso", e);
      return false;
    }
  },

  // ── DOWNLOAD COPY (always downloads, doesn't change source) ──

  /** Download a copy of programación (legacy export) */
  downloadProgramacion() {
    const { activeModuleId, moduleData } = useAppStore.getState();
    if (!moduleData) return;
    const exportData = prepareProgramacionForExport(moduleData);
    downloadJson(serializeData(exportData), `${activeModuleId || 'programacion'}.fpp`);
  },

  /** Download a copy of curso (legacy export) */
  downloadCurso() {
    const { activeCursoId, cursoData } = useAppStore.getState();
    if (!cursoData) return;
    const exportData = prepareCursoForExport(cursoData);
    downloadJson(serializeData(exportData), `${activeCursoId || 'curso'}.fpc`);
  },

  // ── IMPORT (from text, used by open + drag & drop) ──────

  async importProgramacion(jsonStr: string, filename: string): Promise<boolean> {
    try {
      let parsed;
      const key = useAppStore.getState().encryptionKey;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        // Might be encrypted
        if (key) {
          try {
            const bytes = CryptoJS.AES.decrypt(jsonStr, key);
            const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedStr) throw new Error("Clave incorrecta");
            parsed = JSON.parse(decryptedStr);
          } catch (decErr) {
            console.error("Decryption failed", decErr);
            throw new Error("Clave incorrecta o archivo dañado.");
          }
        } else {
          console.error("Looks encrypted but no key provided");
          throw new Error("Archivo cifrado. Debes introducir la clave de seguridad.");
        }
      }

      parsed = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!parsed || !parsed.df_ud) return false;

      const id = filename.replace('.fpp', '').replace('.json', '') || "imported-pd";

      // Fetch curriculum to reconstruct descriptions
      const moduleCode = parsed.info_modulo?.codigo || id.split('-')[0];
      try {
        const res = await fetch(`/api/catalog/module/${moduleCode}`);
        if (res.ok) {
          const catalogData = await res.json();
          if (catalogData.status === 'success' && catalogData.data) {
            const apiRas = catalogData.data.ra;

            // Reconstruct RAs
            if (parsed.df_ra && Array.isArray(parsed.df_ra)) {
              parsed.df_ra.forEach((ra: any) => {
                const apiRa = apiRas.find((r: any) => r.id === ra.id_ra || r.id === ra.RA);
                if (apiRa) {
                  ra.desc_ra = apiRa.descripcion;
                  ra.Descripción = apiRa.descripcion;
                }
              });
            } else if (apiRas && apiRas.length > 0) {
              parsed.df_ra = apiRas.map((r: any) => ({
                id_ra: r.id,
                desc_ra: r.descripcion, Descripción: r.descripcion,
                peso_ra: 0, "Peso (%)": 0,
                is_dual: false
              }));
            }

            // Reconstruct CEs and calculate weight without decimals
            if (parsed.df_ce && Array.isArray(parsed.df_ce)) {
              parsed.df_ce.forEach((ce: any) => {
                const apiRa = apiRas.find((r: any) => r.id === ce.id_ra || r.id === ce.RA);
                if (apiRa && apiRa.ce) {
                  const apiCe = apiRa.ce.find((c: any) => c.id === ce.id_ce || c.id === ce.CE);
                  if (apiCe) {
                    ce.desc_ce = apiCe.descripcion;
                    ce.Descripción = apiCe.descripcion;
                  }

                  // Automatically assign equal weight without decimals if weight is 0 or undefined
                  const peso = ce.peso_ce || ce["Peso (%)"];
                  if (!peso) {
                    const weight = Math.floor(100 / apiRa.ce.length);
                    ce.peso_ce = weight;
                    ce["Peso (%)"] = weight;
                  }
                }
              });
            } else if (apiRas && apiRas.length > 0) {
              parsed.df_ce = [];
              apiRas.forEach((r: any) => {
                if (r.ce && r.ce.length > 0) {
                  const weight = Math.floor(100 / r.ce.length);
                  r.ce.forEach((c: any) => {
                    parsed.df_ce.push({
                      id_ce: c.id, CE: c.id,
                      id_ra: r.id, RA: r.id,
                      desc_ce: c.descripcion, Descripción: c.descripcion,
                      peso_ce: weight, "Peso (%)": weight,
                      is_dual: false, UD: ""
                    });
                  });
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch curriculum for module", moduleCode);
      }

      useAppStore.getState().setActiveModuleId(id);
      useAppStore.getState().setModuleData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  },

  async importCurso(jsonStr: string, filename: string): Promise<boolean> {
    try {
      let parsed;
      const key = useAppStore.getState().encryptionKey;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        // Might be encrypted
        if (key) {
          try {
            const bytes = CryptoJS.AES.decrypt(jsonStr, key);
            const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedStr) throw new Error("Clave incorrecta");
            parsed = JSON.parse(decryptedStr);
          } catch (decErr) {
            console.error("Decryption failed", decErr);
            throw new Error("Clave incorrecta o archivo dañado.");
          }
        } else {
          console.error("Looks encrypted but no key provided");
          throw new Error("Archivo cifrado. Debes introducir la clave de seguridad.");
        }
      }

      parsed = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!parsed || !parsed.df_al) return false;
      const id = filename.replace('.fpc', '').replace('.json', '') || "imported-curso";
      useAppStore.getState().setActiveCursoId(id);
      useAppStore.getState().setCursoData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  },


  getDataSourceType(): DataSourceType {
    return useAppStore.getState().dataSource;
  },

  setDataSourceType(type: DataSourceType) {
    useAppStore.getState().setDataSource(type);
    if (type === 'demo') {
      this.loadDemoData();
    }
  },

  isGoogleConnected() { return false; },
  setGoogleConnected() {},
  getGoogleUser() { return ""; },

  isOneDriveConnected() { return false; },
  setOneDriveConnected() {},
  getOneDriveUser() { return "";  },

  async validateWorkspaceLinks(handle: FileSystemDirectoryHandle): Promise<{
    brokenGroups: { groupName: string; missingFile: string; type: 'programacion' | 'curso' }[];
  }> {
    const brokenGroups: { groupName: string; missingFile: string; type: 'programacion' | 'curso' }[] = [];
    const files = await this.scanWorkspaceFiles(handle);

    for (const g of files.grupos) {
      try {
        const fileHandle = await handle.getFileHandle(g);
        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.tipo === "GRUPO" && data.archivos) {
          if (data.archivos.programacion && !files.programaciones.includes(data.archivos.programacion)) {
            brokenGroups.push({ groupName: g, missingFile: data.archivos.programacion, type: 'programacion' });
          }
          if (data.archivos.curso && !files.cursos.includes(data.archivos.curso)) {
            brokenGroups.push({ groupName: g, missingFile: data.archivos.curso, type: 'curso' });
          }
        }
      } catch (e) {
        console.warn("Failed to validate group file", g, e);
      }
    }

    return { brokenGroups };
  },

  async fixWorkspaceLink(
    handle: FileSystemDirectoryHandle, 
    groupName: string, 
    type: 'programacion' | 'curso', 
    newFileName: string
  ): Promise<boolean> {
    try {
      const fileHandle = await handle.getFileHandle(groupName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.tipo === "GRUPO" && data.archivos) {
        data.archivos[type] = newFileName;
        const writable = await (fileHandle as any).createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to fix group link", e);
      return false;
    }
  }
};
