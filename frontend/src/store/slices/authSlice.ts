import { StateCreator } from 'zustand';
import { AppState } from '@/types';

type AuthSlice = Pick<AppState, 'isLoggedIn' | 'login' | 'logout' | 'encryptionKey' | 'setEncryptionKey'>;

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  encryptionKey: null,
  setEncryptionKey: (key: string | null) => set({ encryptionKey: key }),
});
