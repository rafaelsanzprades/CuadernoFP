import { isTauri } from "@tauri-apps/api/core";
import { estaCifrado } from "@/services/cifrado";

let tokenClient: any;
let accessToken: string | null = null;
let scriptLoaded = false;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const driveService = {
  loadGsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (scriptLoaded || window.google) {
        scriptLoaded = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error("No se pudo cargar Google Identity Services"));
      document.body.appendChild(script);
    });
  },

  login(clientId: string): Promise<{ success: boolean; email?: string }> {
    return new Promise(async (resolve) => {
      try {
        await this.loadGsiScript();
      } catch (e) {
        resolve({ success: false });
        return;
      }

      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            accessToken = tokenResponse.access_token;
            // Get user info (email)
            try {
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const userInfo = await userInfoRes.json();
              resolve({ success: true, email: userInfo.email });
            } catch {
              resolve({ success: true, email: "Profesorado conectado" });
            }
          } else {
            resolve({ success: false });
          }
        },
        error_callback: () => {
          resolve({ success: false });
        }
      });

      // Request token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  logout() {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    }
    accessToken = null;
  },

  /** `content` es el texto tal como se guarda en disco: cifrado si el usuario tiene una clave, JSON en claro si no. */
  /** Token de acceso: el del flujo web (Google Identity Services) o, en la app de escritorio, el del inicio de sesión nativo. */
  async tokenDeAcceso(): Promise<string | null> {
    if (accessToken) return accessToken;
    if (!isTauri()) return null;
    const { useAppStore } = await import("@/store/useAppStore");
    const clientId = useAppStore.getState().googleClientId;
    if (!clientId) return null;
    const { getValidGoogleAccessToken } = await import("@/services/nativeOAuth");
    return getValidGoogleAccessToken(clientId);
  },

  async saveFile(filename: string, content: string): Promise<boolean> {
    const token = await this.tokenDeAcceso();
    if (!token) return false;

    try {
      // 1. Search if file exists
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${filename}' and trashed=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();
      const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

      const mimeType = estaCifrado(content) ? 'text/plain' : 'application/json';
      const metadata = {
        name: filename,
        mimeType
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: mimeType }));

      if (existingFile) {
        // Update existing file
        const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
        return updateRes.ok;
      } else {
        // Create new file
        const createRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
        return createRes.ok;
      }
    } catch (e) {
      console.error("Error saving to Drive", e);
      return false;
    }
  }
};

// Types for window.google
declare global {
  interface Window {
    google?: any;
  }
}
