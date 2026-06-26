import { StateCreator } from 'zustand';
import { AppState, ModuleData, CursoData } from '@/types';

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
  activeModuleId: '0237-ictve-pd',
  setActiveModuleId: (id: string) => set({ activeModuleId: id }),

  activeCursoId: '0237-ictve-curso-2025-26',
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
    const { activeModuleId, moduleData, isDriveConnected, autoSyncDrive, pdFileSource, setSyncStatus } = get();
    if (!activeModuleId || !moduleData) return false;
    
    setSyncStatus('saving');

    // Increment version in memory
    const updatedData = { ...moduleData, __version__: (moduleData.__version__ || 0) + 1 };
    set({ moduleData: updatedData });
    
    let localSaved = false;

    // Save to Local File System if connected
    if (pdFileSource.type === 'local' && pdFileSource.fileHandle) {
      try {
        const writable = await (pdFileSource.fileHandle as any).createWritable();
        await writable.write(JSON.stringify(updatedData, null, 2));
        await writable.close();
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
        driveService.saveFile(`${activeModuleId}.fpp`, updatedData);
      });
    }
    
    setSyncStatus('saved');
    setTimeout(() => {
      if (get().syncStatus === 'saved') setSyncStatus('idle');
    }, 2000);

    return true;
  },

  saveCursoData: async () => {
    const { activeCursoId, cursoData, isDriveConnected, autoSyncDrive, cursoFileSource, setSyncStatus } = get();
    if (!activeCursoId || !cursoData) return false;
    
    setSyncStatus('saving');

    // Increment version in memory
    const updatedData = { ...cursoData, __version__: (cursoData.__version__ || 0) + 1 };
    set({ cursoData: updatedData });
    
    let localSaved = false;

    // Save to Local File System if connected
    if (cursoFileSource.type === 'local' && cursoFileSource.fileHandle) {
      try {
        const writable = await (cursoFileSource.fileHandle as any).createWritable();
        await writable.write(JSON.stringify(updatedData, null, 2));
        await writable.close();
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
        driveService.saveFile(`${activeCursoId}.fpc`, updatedData);
      });
    }
    
    setSyncStatus('saved');
    setTimeout(() => {
      if (get().syncStatus === 'saved') setSyncStatus('idle');
    }, 2000);

    return true;
  },
});

