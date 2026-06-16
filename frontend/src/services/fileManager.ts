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
    
    // Strip redundant texts from RAs and CEs to reduce .cddp file size
    const exportData = JSON.parse(JSON.stringify(moduleData));
    if (exportData.df_ra) {
      exportData.df_ra.forEach((ra: any) => {
        delete ra.desc_ra;
        delete ra.Descripción;
        delete ra.Horas; // Horas is always 0 and can be omitted
      });
    }
    if (exportData.df_ce) {
      exportData.df_ce.forEach((ce: any) => {
        delete ce.desc_ce;
        delete ce.Descripción;
      });
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
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
                id_ra: r.id, RA: r.id,
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

  async importFromJson(jsonStr: string): Promise<boolean> {
    const successPd = await this.importProgramacion(jsonStr, "imported-pd");
    if (successPd) return true;
    return await this.importCurso(jsonStr, "imported-curso");
  },

  resetActiveDb() {
    this.loadDemoData();
  }
};
