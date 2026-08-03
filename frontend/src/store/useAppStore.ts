import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';
import { get, set, del } from 'idb-keyval';
import { AppState } from '@/types';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

import { createAuthSlice } from './slices/authSlice';
import { createUiSlice } from './slices/uiSlice';
import { createModuleSlice } from './slices/moduleSlice';
import { createGlobalSlice } from './slices/globalSlice';

// IndexedDB storage engine
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useAppStore = create<AppState>()(
  temporal(
    persist(
      (set, get, api) => ({
        ...createAuthSlice(set, get, api),
        ...createUiSlice(set, get, api),
        ...createModuleSlice(set, get, api),
        ...createGlobalSlice(set, get, api),
      }),
      {
        name: 'cdd-store-cache-v3',
        storage: createJSONStorage(() => idbStorage),
        version: 3, // Bump version to force cache clearing of old corrupted state
        migrate: (persistedState: any, version: number) => {
          return persistedState as AppState;
        },
        partialize: (state) => {
          const { workspaceHandle, ...rest } = state;
          return rest;
        },
      }
    ),
    {
      limit: 20,
      handleSet: (handleSet) => debounce(handleSet, 1000),
      partialize: (state) => ({
        moduleData: state.moduleData,
        cursoData: state.cursoData,
        globalData: state.globalData
      })
    }
  )
);

import { useStore } from 'zustand';

export const useTemporalStore = <T,>(
  selector: (state: import('zundo').TemporalState<Pick<AppState, 'moduleData' | 'cursoData'>>) => T,
) => useStore(useAppStore.temporal, selector);

