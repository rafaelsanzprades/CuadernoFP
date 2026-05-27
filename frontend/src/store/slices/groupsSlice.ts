import { StateCreator } from 'zustand';
import { AppState } from '@/types';
import { initialGroups } from '../initialData';

export const createGroupsSlice: StateCreator<AppState> = (set) => ({
  groups: initialGroups,
  setGroups: (newGroups) => set((state) => ({
    groups: typeof newGroups === 'function' ? newGroups(state.groups) : newGroups
  })),
});
