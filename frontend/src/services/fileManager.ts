import { demoSeed, CRM_SEED_VERSION } from "./demo-ele203-0237ictve-curso202526";
import { useAppStore } from "@/store/useAppStore";
import { ModuleData, CursoData, FileSource } from "@/types";

export type DataSourceType = 'demo' | 'local';

// ─── Helpers ────────────────────────────────────────────────

/** Strip redundant texts from RAs and CEs to reduce .cddp file size */
function stripCatalogDescriptions(data: ModuleData): ModuleData {
  const exportData = JSON.parse(JSON.stringify(data));
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

/** Serialize data to JSON string for export */
function serializeData(data: any): string {
  return JSON.stringify(data, null, 2);
}

// ─── File Manager ───────────────────────────────────────────

export const fileManager = {

  // ── DEMO ────────────────────────────────────────────────

  loadDemoData() {
    const pdData = demoSeed["0237-ictve-pd" as keyof typeof demoSeed];
    const cursoData = demoSeed["0237-ictve-curso-2025-26" as keyof typeof demoSeed];

    useAppStore.getState().setDataSource("demo");
    useAppStore.getState().setActiveModuleId("0237-ictve-pd");
    useAppStore.getState().setModuleData(pdData as any);
    useAppStore.getState().setActiveCursoId("0237-ictve-curso-2025-26");
    useAppStore.getState().setCursoData(cursoData as any);
    useAppStore.getState().setPdFileSource({ type: 'none' });
    useAppStore.getState().setCursoFileSource({ type: 'none' });
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
                    FEOE: false,
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
        __version__: 1,
      };

      const id = `${moduleCode}-pd`;
      store.setActiveModuleId(id);
      store.setModuleData(newModuleData);
      store.setPdFileSource({ type: 'new', fileName: `${moduleCode}.cddp` });
      return true;
    } catch (e) {
      console.error("Error creating new programación", e);
      return false;
    }
  },

  /** Create a new empty curso */
  createNewCurso(cursoName: string, year: string): boolean {
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

    const id = `${cursoName.toLowerCase().replace(/\s+/g, '-')}-${year}`;
    store.setActiveCursoId(id);
    store.setCursoData(newCursoData);
    store.setCursoFileSource({ type: 'new', fileName: `${id}.cddc` });
    return true;
  },

  /** Create a new curso with demo data (appends " Demo" to student last names) */
  createNewCursoFromDemo(cursoName: string, year: string): boolean {
    const store = useAppStore.getState();
    store.setDataSource("local");

    const demoCursoData = demoSeed["0237-ictve-curso-2025-26" as keyof typeof demoSeed];
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

    const id = `${cursoName.toLowerCase().replace(/\s+/g, '-')}-${year}`;
    store.setActiveCursoId(id);
    store.setCursoData(newCursoData);
    store.setCursoFileSource({ type: 'new', fileName: `${id}.cddc` });
    return true;
  },

  // ── OPEN (File picker + drag & drop) ────────────────────

  /** Open file via File System Access API (preserves handle for save) */
  async openProgramacionWithHandle(): Promise<boolean> {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Programación CuadernoFP',
          accept: { 'application/json': ['.cddp', '.json'] },
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
          description: 'Curso CuadernoFP',
          accept: { 'application/json': ['.cddc', '.json'] },
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

  // ── SAVE (overwrite original) ───────────────────────────

  /** Save programación: overwrite original file if available, always sync Drive */
  async saveProgramacion(): Promise<boolean> {
    const store = useAppStore.getState();
    const { activeModuleId, moduleData, pdFileSource, isDriveConnected, autoSyncDrive } = store;
    if (!activeModuleId || !moduleData) return false;

    const exportData = stripCatalogDescriptions(moduleData);
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
        await driveService.saveFile(`${activeModuleId}.cddp`, moduleData);
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

    const jsonStr = serializeData(cursoData);

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
        await driveService.saveFile(`${activeCursoId}.cddc`, cursoData);
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
        suggestedName: `${activeModuleId}.cddp`,
        types: [{
          description: 'Programación CuadernoFP',
          accept: { 'application/json': ['.cddp'] },
        }],
      });
      const exportData = stripCatalogDescriptions(moduleData);
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
        suggestedName: `${activeCursoId}.cddc`,
        types: [{
          description: 'Curso CuadernoFP',
          accept: { 'application/json': ['.cddc'] },
        }],
      });
      const jsonStr = serializeData(cursoData);
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
    const exportData = stripCatalogDescriptions(moduleData);
    downloadJson(serializeData(exportData), `${activeModuleId || 'programacion'}.cddp`);
  },

  /** Download a copy of curso (legacy export) */
  downloadCurso() {
    const { activeCursoId, cursoData } = useAppStore.getState();
    if (!cursoData) return;
    downloadJson(serializeData(cursoData), `${activeCursoId || 'curso'}.cddc`);
  },

  // ── IMPORT (from text, used by open + drag & drop) ──────

  async importProgramacion(jsonStr: string, filename: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.df_ud) return false;

      const id = filename.replace('.cddp', '').replace('.json', '') || "imported-pd";

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
                      FEOE: false, UD: ""
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
      const parsed = JSON.parse(jsonStr);
      if (!parsed.df_al) return false;
      const id = filename.replace('.cddc', '').replace('.json', '') || "imported-curso";
      useAppStore.getState().setActiveCursoId(id);
      useAppStore.getState().setCursoData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  },

  // ── Legacy shims ────────────────────────────────────────

  /** @deprecated Use downloadProgramacion() */
  exportProgramacion() { this.downloadProgramacion(); },

  /** @deprecated Use downloadCurso() */
  exportCurso() { this.downloadCurso(); },

  getDb(): Record<string, any> {
    const state = useAppStore.getState();
    const db: Record<string, any> = {};
    if (state.activeModuleId && state.moduleData) {
      db[state.activeModuleId] = state.moduleData;
    }
    if (state.activeCursoId && state.cursoData) {
      db[state.activeCursoId] = state.cursoData;
    }
    return db;
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
  getOneDriveUser() { return ""; }
};
