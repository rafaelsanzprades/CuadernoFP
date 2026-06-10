import { demoSeed, CRM_SEED_VERSION } from "./demo-ele203-0237ictve-curso202526";
import { useAppStore } from "@/store/useAppStore";

export type DataSourceType = 'demo' | 'local';

export const fileManager = {
  // Load demo data directly into Zustand store
  loadDemoData() {
    const pdData = demoSeed["0237-ictve-pd" as keyof typeof demoSeed];
    const cursoData = demoSeed["0237-ictve-curso-2025-26" as keyof typeof demoSeed];
    
    useAppStore.getState().setDataSource("demo");
    useAppStore.getState().setActiveModuleId("0237-ictve-pd");
    useAppStore.getState().setModuleData(pdData as any);
    useAppStore.getState().setActiveCursoId("0237-ictve-curso-2025-26");
    useAppStore.getState().setCursoData(cursoData as any);
  },

  exportProgramacion() {
    const { activeModuleId, moduleData } = useAppStore.getState();
    if (!moduleData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moduleData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeModuleId || 'programacion'}.cddp`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  },

  exportCurso() {
    const { activeCursoId, cursoData } = useAppStore.getState();
    if (!cursoData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cursoData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeCursoId || 'curso'}.cddc`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  },

  importProgramacion(jsonStr: string, filename: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.df_ud) return false; 
      
      const id = filename.replace('.cddp', '').replace('.json', '') || "imported-pd";
      useAppStore.getState().setActiveModuleId(id);
      useAppStore.getState().setModuleData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  },

  importCurso(jsonStr: string, filename: string): boolean {
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

  // ---- Legacy shims to prevent breaking other components ----
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
  getOneDriveUser() { return ""; },

  saveDb(db: Record<string, any>) {
    // If someone calls saveDb with a huge object, extract pd and curso
    const pds = Object.keys(db).filter(k => k.endsWith('-pd') || k.includes('imported-pd'));
    const cursos = Object.keys(db).filter(k => k.includes('-curso-'));
    
    if (pds.length > 0) {
      useAppStore.getState().setActiveModuleId(pds[0]);
      useAppStore.getState().setModuleData(db[pds[0]]);
    }
    if (cursos.length > 0) {
      useAppStore.getState().setActiveCursoId(cursos[0]);
      useAppStore.getState().setCursoData(db[cursos[0]]);
    }
  },

  getModuleData(id: string): any | null {
    const state = useAppStore.getState();
    if (id === state.activeModuleId) return state.moduleData;
    if (id === state.activeCursoId) return state.cursoData;
    return null;
  },

  saveModuleData(id: string, data: any) {
    const state = useAppStore.getState();
    if (id === state.activeModuleId || id.endsWith('-pd')) {
      useAppStore.getState().setModuleData(data);
    } else {
      useAppStore.getState().setCursoData(data);
    }
  },

  exportToJsonFile() {
    // Legacy export (all in one)
    this.exportProgramacion();
    setTimeout(() => this.exportCurso(), 500);
  },

  importFromJson(jsonStr: string): boolean {
    return this.importProgramacion(jsonStr, "imported-pd") || this.importCurso(jsonStr, "imported-curso");
  },

  resetActiveDb() {
    this.loadDemoData();
  }
};
