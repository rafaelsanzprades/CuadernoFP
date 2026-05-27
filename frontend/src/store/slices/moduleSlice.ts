import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export const createModuleSlice: StateCreator<AppState> = (set) => ({
  activeModuleId: '0237-ictve-pd', // ID por defecto para pruebas
  setActiveModuleId: (id) => set({ activeModuleId: id }),
  
  activeCursoId: '0237-ictve-curso-2025-26',
  setActiveCursoId: (id) => set({ activeCursoId: id }),
  
  moduleData: null,
  setModuleData: (data) => set({ moduleData: data }),
  
  updateInfoModulo: (key, value) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      info_modulo: {
        ...state.moduleData.info_modulo,
        [key]: value
      }
    } : null
  })),
  
  updateDataFrame: (key, data) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),
  
  updateModuleData: (key, data) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),
  
  cursoData: null,
  setCursoData: (data) => set({ cursoData: data }),
  
  updateCursoData: (key, data) => set((state) => ({
    cursoData: state.cursoData ? {
      ...state.cursoData,
      [key]: data
    } : null
  })),
});
