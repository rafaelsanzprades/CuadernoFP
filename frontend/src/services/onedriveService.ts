import { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";
import { Client, ResponseType } from "@microsoft/microsoft-graph-client";
import { fileManager } from "./fileManager"; // to use existing save functions

// El Client ID lo trae cada profesor (modelo "trae tu propio Client ID", ver
// GoogleDriveSyncPanel.tsx/driveService.ts -- mismo criterio), tecleado en
// OneDriveSyncPanel.tsx y guardado en oneDriveClientId del store. Antes se
// construía msalConfig UNA VEZ a nivel de módulo con
// NEXT_PUBLIC_ONEDRIVE_CLIENT_ID/un placeholder fijo, así que ese valor
// nunca llegaba a usarse de verdad (bug real, encontrado durante la Fase 7
// del plan Tauri) -- ahora se construye por petición con el Client ID que
// venga.
function buildMsalConfig(clientId: string): Configuration {
  return {
    auth: {
      clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: typeof window !== "undefined" ? window.location.origin : "",
    },
    cache: {
      cacheLocation: "sessionStorage"
    },
  };
}

const graphScopes = ["user.read", "files.readwrite.all"];

let msalInstance: PublicClientApplication | null = null;
let msalInstanceClientId: string | null = null;

/**
 * Devuelve la instancia de MSAL para este clientId, reutilizando la ya
 * creada si el clientId no ha cambiado desde la última vez -- si el
 * profesor edita el Client ID y reconecta, la instancia vieja (con el
 * clientId antiguo) NO se reutiliza sin más.
 */
export const initializeMsal = async (clientId: string) => {
  if (!clientId) throw new Error("Falta el Client ID de OneDrive.");
  if (!msalInstance || msalInstanceClientId !== clientId) {
    msalInstance = new PublicClientApplication(buildMsalConfig(clientId));
    await msalInstance.initialize();
    msalInstanceClientId = clientId;
  }
  return msalInstance;
};

export const signInOneDrive = async (clientId: string): Promise<string | null> => {
  try {
    const instance = await initializeMsal(clientId);
    const response = await instance.loginPopup({ scopes: graphScopes });
    return response.accessToken;
  } catch (error) {
    console.error("Error signing into OneDrive:", error);
    return null;
  }
};

export const signOutOneDrive = async () => {
  try {
    if (!msalInstance) return; // nunca se llegó a iniciar sesión, nada que cerrar
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      await msalInstance.logoutPopup({ account });
    }
  } catch (error) {
    console.error("Error signing out of OneDrive:", error);
  }
};

export const getGraphClient = (accessToken: string) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};

export interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
}

export const listCuadernoFiles = async (accessToken: string): Promise<OneDriveFile[]> => {
  const client = getGraphClient(accessToken);
  try {
    // We assume CuadernoFP creates a folder named "CuadernoFP" in the user's root directory
    const folderRes = await client.api('/me/drive/root:/CuadernoFP').get().catch(() => null);

    if (!folderRes) {
      // Create folder if it doesn't exist
      await client.api('/me/drive/root/children').post({
        name: 'CuadernoFP',
        folder: { },
        '@microsoft.graph.conflictBehavior': 'fail'
      });
      return [];
    }

    const res = await client.api('/me/drive/root:/CuadernoFP:/children')
      .select('id,name,size,lastModifiedDateTime')
      .filter("endswith(name,'.fpp') or endswith(name,'.fpc')")
      .get();

    return res.value as OneDriveFile[];
  } catch (error) {
    console.error("Error listing OneDrive files:", error);
    return [];
  }
};

export const uploadFileToOneDrive = async (accessToken: string, fileBlob: Blob, fileName: string): Promise<boolean> => {
  const client = getGraphClient(accessToken);
  try {
    // For small files (<4MB), we can use a simple PUT request
    const path = `/me/drive/root:/CuadernoFP/${fileName}:/content`;
    await client.api(path).put(fileBlob);
    return true;
  } catch (error) {
    console.error("Error uploading to OneDrive:", error);
    return false;
  }
};

export const downloadFileFromOneDrive = async (accessToken: string, fileId: string): Promise<string | null> => {
  const client = getGraphClient(accessToken);
  try {
    const response = await client.api(`/me/drive/items/${fileId}/content`).responseType(ResponseType.TEXT).get();
    return response as string;
  } catch (error) {
    console.error("Error downloading from OneDrive:", error);
    return null;
  }
};
