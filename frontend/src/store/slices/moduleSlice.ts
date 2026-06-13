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

  updateInfoModulo: (key: string, value: unknown) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      info_modulo: {
        ...state.moduleData.info_modulo,
        [key]: value
      }
    } : null
  })),

  updateDataFrame: (key: keyof ModuleData, data: unknown[]) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),

  updateModuleData: (key: keyof ModuleData, data: unknown) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),

  cursoData: null,
  setCursoData: (data: CursoData | null) => set({ cursoData: data }),

  updateCursoData: (key: keyof CursoData, data: unknown) => set((state) => ({
    cursoData: state.cursoData ? {
      ...state.cursoData,
      [key]: data
    } : null
  })),

  saveModuleData: async () => {
    const { activeModuleId, moduleData, isDriveConnected, autoSyncDrive } = get();
    if (!activeModuleId || !moduleData) return false;
    
    // Increment version in memory
    set({ moduleData: { ...moduleData, __version__: (moduleData.__version__ || 0) + 1 } });
    
    // Save to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      import('@/services/driveService').then(({ driveService }) => {
        driveService.saveFile(`${activeModuleId}.cddp`, moduleData);
      });
    }
    
    // Always return true since we no longer depend on the backend API for saving user data
    return true;
  },

  saveCursoData: async () => {
    const { activeCursoId, cursoData, isDriveConnected, autoSyncDrive } = get();
    if (!activeCursoId || !cursoData) return false;
    
    // Increment version in memory
    set({ cursoData: { ...cursoData, __version__: (cursoData.__version__ || 0) + 1 } });
    
    // Save to Google Drive if connected
    if (isDriveConnected && autoSyncDrive) {
      import('@/services/driveService').then(({ driveService }) => {
        driveService.saveFile(`${activeCursoId}.cddc`, cursoData);
      });
    }
    
    // Always return true since we no longer depend on the backend API for saving user data
    return true;
  },
});
