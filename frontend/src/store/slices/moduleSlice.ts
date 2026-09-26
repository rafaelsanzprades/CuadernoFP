import { StateCreator } from 'zustand';
import { AppState, ModuleData, CursoData } from '@/types';
import { writeFile } from '@/services/fileBackend';
import { prepareProgramacionForExport, prepareCursoForExport, serializeData } from '@/services/fileExport';

type ModuleSlice = Pick<AppState,
  | 'activeModuleId' | 'setActiveModuleId'
  | 'activeCursoId' | 'setActiveCursoId'
  | 'moduleData' | 'setModuleData'
  | 'updateInfoModulo' | 'updateDataFrame' | 'updateModuleData'
  | 'cursoData' | 'setCursoData' | 'updateCursoData'
  | 'saveModuleData' | 'saveCursoData'
>;

// saveToApi has been removed as per the Local-First Architecture.
// The Web DB acts as a read-only template provider for the user.
// User data persistence is handled via local file downloads or Google Drive sync.

export const createModuleSlice: StateCreator<AppState, [], [], ModuleSlice> = (set, get) => ({
  // No demo/module id hardcoded here: a fresh session should start with nothing
  // loaded (falsy id + null data) so the WelcomeWizard's "no modules yet" check
  // actually triggers, and fileManager.loadDemoData() is the only source of demo
  // content (real .fpg/.fpp/.fpc files under public/demo/).
  activeModuleId: '',
  setActiveModuleId: (id: string) => set({ activeModuleId: id }),

  activeCursoId: '',
  setActiveCursoId: (id: string) => set({ activeCursoId: id }),

  moduleData: null,
  setModuleData: (data: ModuleData | null) => set({ moduleData: data }),

  updateInfoModulo: (key: string, value: unknown) => set((state) => {
    const currentModule = state.moduleData || {} as ModuleData;
    return {
      moduleData: {
        ...currentModule,
        info_modulo: {
          ...(currentModule.info_modulo || {}),
          [key]: value
        }
      }
    };
  }),

  updateDataFrame: (key: keyof ModuleData, data: unknown[]) => set((state) => {
    const currentModule = state.moduleData || {} as ModuleData;
    return {
      moduleData: {
        ...currentModule,
        [key]: data
      }
    };
  }),

  updateModuleData: (key: keyof ModuleData, data: unknown) => set((state) => {
    const currentModule = state.moduleData || {} as ModuleData;
    return {
      moduleData: {
        ...currentModule,
        [key]: data
      }
    };
  }),

  cursoData: null,
  setCursoData: (data: CursoData | null) => set({ cursoData: data }),

  updateCursoData: (key: keyof CursoData, data: unknown) => set((state) => {
    const currentCurso = state.cursoData || {} as CursoData;
    return {
      cursoData: {
        ...currentCurso,
        [key]: data
      }
    };
  }),

  saveModuleData: async () => {
    const { activeModuleId, moduleData, isDriveConnected, autoSyncDrive, pdFileSource, encryptionKey, setSyncStatus } = get();
    if (!activeModuleId || !moduleData) return false;

    setSyncStatus('saving');

    // Misma preparación que fileManager.ts::saveProgramacion() (lista blanca
    // de claves + borrado de desc_ra/desc_ce/info_modulo catalog-duplicado +
    // cifrado si hay clave) -- antes este guardado (el que dispara el
    // autoguardado de 3s de Header.tsx) escribía moduleData tal cual, sin
    // pasar por ninguna de las dos, así que el .fpp real en disco casi
    // siempre acababa sin depurar y sin cifrar pese a tener clave puesta.
    const exportData = prepareProgramacionForExport(moduleData);
    const jsonStr = serializeData(exportData, encryptionKey);

    let localSaved = false;

    // Save to Local File System if connected
    if (pdFileSource.type === 'local' && pdFileSource.fileRef) {
      try {
        await writeFile(pdFileSource.fileRef, jsonStr);
        localSaved = true;
      } catch (e) {
        console.error("Failed to write PD to local file system:", e);
        setSyncStatus('error');
        return false;
      }
    }

    // Save to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      import('@/services/driveService').then(({ driveService }) => {
        driveService.saveFile(`${activeModuleId}.fpp`, exportData);
      });
    }

    setSyncStatus('saved');
    setTimeout(() => {
      if (get().syncStatus === 'saved') setSyncStatus('idle');
    }, 2000);

    return true;
  },

  saveCursoData: async () => {
    const { activeCursoId, cursoData, isDriveConnected, autoSyncDrive, cursoFileSource, encryptionKey, setSyncStatus } = get();
    if (!activeCursoId || !cursoData) return false;

    setSyncStatus('saving');

    // Ver nota en saveModuleData() -- misma preparación que
    // fileManager.ts::saveCurso().
    const exportData = prepareCursoForExport(cursoData);
    const jsonStr = serializeData(exportData, encryptionKey);

    let localSaved = false;

    // Save to Local File System if connected
    if (cursoFileSource.type === 'local' && cursoFileSource.fileRef) {
      try {
        await writeFile(cursoFileSource.fileRef, jsonStr);
        localSaved = true;
      } catch (e) {
        console.error("Failed to write Curso to local file system:", e);
        setSyncStatus('error');
        return false;
      }
    }

    // Save to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      import('@/services/driveService').then(({ driveService }) => {
        driveService.saveFile(`${activeCursoId}.fpc`, exportData);
      });
    }

    setSyncStatus('saved');
    setTimeout(() => {
      if (get().syncStatus === 'saved') setSyncStatus('idle');
    }, 2000);

    return true;
  },
});

