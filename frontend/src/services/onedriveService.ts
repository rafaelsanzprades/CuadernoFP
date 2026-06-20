import { PublicClientApplication, Configuration, AuthenticationResult } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { fileManager } from "./fileManager"; // to use existing save functions

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID || "PROVIDE_YOUR_CLIENT_ID_HERE",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const graphScopes = ["user.read", "files.readwrite.all"];

let msalInstance: PublicClientApplication | null = null;

export const initializeMsal = async () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
};

export const signInOneDrive = async (): Promise<string | null> => {
  try {
    const instance = await initializeMsal();
    const response = await instance.loginPopup({ scopes: graphScopes });
    return response.accessToken;
  } catch (error) {
    console.error("Error signing into OneDrive:", error);
    return null;
  }
};

export const signOutOneDrive = async () => {
  try {
    const instance = await initializeMsal();
    const account = instance.getAllAccounts()[0];
    if (account) {
      await instance.logoutPopup({ account });
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
      .filter("endswith(name,'.cddp') or endswith(name,'.cddc')")
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
    const response = await client.api(`/me/drive/items/${fileId}/content`).responseType('text').get();
    return response as string;
  } catch (error) {
    console.error("Error downloading from OneDrive:", error);
    return null;
  }
};
