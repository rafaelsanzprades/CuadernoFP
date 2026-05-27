import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export const createUiSlice: StateCreator<AppState> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
});
