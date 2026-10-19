import { StateCreator } from 'zustand';
import { AppState } from '@/types';

type AuthSlice = Pick<AppState, 'isLoggedIn' | 'login' | 'logout' | 'encryptionKey' | 'setEncryptionKey' | 'cifradoActivo' | 'verificadorClave'>;

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  // La clave solo vive en memoria (useAppStore.partialize no la persiste). `cifradoActivo` y
  // `verificadorClave` sí: recuerdan que este espacio se guarda cifrado, para pedir la clave al
  // reabrir la aplicación en vez de guardar en claro por descuido (ver services/cifradoEspacio.ts).
  encryptionKey: null,
  cifradoActivo: false,
  verificadorClave: null,
  setEncryptionKey: (key: string | null) => set({ encryptionKey: key }),
});
