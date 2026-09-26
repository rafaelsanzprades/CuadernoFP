/**
 * Login nativo de Google Drive / OneDrive bajo Tauri, vía el navegador del
 * sistema + un servidor de loopback local (Fase 7 del plan Tauri, RF Ideas/
 * 00 IDEAS.md). Sustituye, SOLO bajo Tauri, al popup de Google Identity
 * Services / MSAL que usa la web app (`driveService.ts`/`onedriveService.ts`)
 * -- esos popups dependen de un origen http(s) real registrado de antemano
 * en Google/Azure, y el origen de un webview de Tauri no es uno.
 *
 * Requiere un Client ID de tipo "Desktop app" (Google Cloud Console) o
 * "Mobile and desktop applications" (Azure/Entra ID) -- DISTINTO del Client
 * ID "Web application" que ya usa hoy la web app, aunque puede vivir en el
 * mismo proyecto/registro de Google o Azure. Lo registra el propio
 * profesor que quiera usar la sincronización en la app de escritorio (igual
 * que hoy ya trae su propio Client ID web para la versión navegador), no
 * hace falta que lo centralice Rafael.
 *
 * PKCE (pkce.ts) evita necesitar un client_secret -- una app de escritorio
 * no puede guardar uno de verdad. El intercambio código→token va por
 * @tauri-apps/plugin-http (no window.fetch) para no depender de que el
 * endpoint de token permita CORS desde el origen del webview.
 */
import { start, cancel, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { open } from "@tauri-apps/plugin-shell";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce";
import { storeCredential, getCredential, deleteCredential } from "./secureCredentials";

interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
}

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  extraAuthParams?: Record<string, string>;
}

const GOOGLE: ProviderConfig = {
  authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scope: "https://www.googleapis.com/auth/drive.file",
  // access_type=offline + prompt=consent: sin esto Google solo da refresh_token
  // la primera vez que el usuario autoriza el scope, nunca en logins repetidos.
  extraAuthParams: { access_type: "offline", prompt: "consent" },
};

const MICROSOFT: ProviderConfig = {
  authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
  scope: "offline_access User.Read Files.ReadWrite.All",
};

const ACCOUNT_GOOGLE = "google-drive";
const ACCOUNT_MICROSOFT = "onedrive";
const FLOW_TIMEOUT_MS = 5 * 60 * 1000;

async function persistTokens(account: string, tokens: TokenSet): Promise<void> {
  await storeCredential(account, JSON.stringify(tokens));
}

async function loadTokens(account: string): Promise<TokenSet | null> {
  const raw = await getCredential(account);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenSet;
  } catch {
    return null;
  }
}

async function runAuthorizationFlow(
  config: ProviderConfig,
  clientId: string
): Promise<{ code: string; redirectUri: string; codeVerifier: string }> {
  const port = await start();
  const redirectUri = `http://127.0.0.1:${port}`;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    ...(config.extraAuthParams || {}),
  });

  // El listener se registra ANTES de abrir el navegador -- si se abriera
  // primero, una redirección muy rápida podría llegar antes de que
  // onUrl() esté escuchando.
  let unlisten: (() => void) | null = null;
  const code = await new Promise<string>((resolve, reject) => {
    const finish = (fn: () => void) => {
      unlisten?.();
      cancel(port).catch(() => {});
      fn();
    };

    const timeoutId = setTimeout(() => {
      finish(() => reject(new Error("Tiempo de espera agotado esperando el login (5 min).")));
    }, FLOW_TIMEOUT_MS);

    onUrl((url) => {
      clearTimeout(timeoutId);
      try {
        const parsed = new URL(url);
        const error = parsed.searchParams.get("error");
        const returnedState = parsed.searchParams.get("state");
        const authCode = parsed.searchParams.get("code");
        if (error) {
          finish(() => reject(new Error(`Login cancelado o rechazado: ${error}`)));
        } else if (returnedState !== state) {
          finish(() => reject(new Error("El parámetro state no coincide -- se rechaza el login por seguridad.")));
        } else if (!authCode) {
          finish(() => reject(new Error("No se recibió el código de autorización en la redirección.")));
        } else {
          finish(() => resolve(authCode));
        }
      } catch (e) {
        finish(() => reject(e as Error));
      }
    }).then((fn) => {
      unlisten = fn;
      // El listener ya está activo -- ahora sí, abrir el navegador del
      // sistema en la pantalla de consentimiento.
      open(`${config.authorizeUrl}?${params.toString()}`).catch((e) => {
        clearTimeout(timeoutId);
        finish(() => reject(e instanceof Error ? e : new Error(String(e))));
      });
    });
  });

  return { code, redirectUri, codeVerifier };
}

async function postForm(url: string, params: Record<string, string>): Promise<any> {
  const res = await tauriFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Error ${res.status} de ${url}: ${json?.error_description || json?.error || "sin detalle"}`);
  }
  return json;
}

async function exchangeCodeForTokens(
  config: ProviderConfig,
  clientId: string,
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TokenSet> {
  const json = await postForm(config.tokenUrl, {
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
}

async function refreshTokens(config: ProviderConfig, clientId: string, refreshToken: string): Promise<TokenSet> {
  const json = await postForm(config.tokenUrl, {
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return {
    accessToken: json.access_token,
    // Google no siempre devuelve un refresh_token nuevo -- conserva el que ya había.
    refreshToken: json.refresh_token ?? refreshToken,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
}

async function connect(config: ProviderConfig, account: string, clientId: string): Promise<{ accessToken: string }> {
  const { code, redirectUri, codeVerifier } = await runAuthorizationFlow(config, clientId);
  const tokens = await exchangeCodeForTokens(config, clientId, code, redirectUri, codeVerifier);
  await persistTokens(account, tokens);
  return { accessToken: tokens.accessToken };
}

async function getValidAccessToken(config: ProviderConfig, account: string, clientId: string): Promise<string | null> {
  const tokens = await loadTokens(account);
  if (!tokens) return null;
  if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;
  if (!tokens.refreshToken) return null;
  const refreshed = await refreshTokens(config, clientId, tokens.refreshToken);
  await persistTokens(account, refreshed);
  return refreshed.accessToken;
}

export async function connectGoogleDrive(clientId: string): Promise<{ accessToken: string; email?: string }> {
  const { accessToken } = await connect(GOOGLE, ACCOUNT_GOOGLE, clientId);
  try {
    const res = await tauriFetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const info = await res.json();
    return { accessToken, email: info?.email };
  } catch {
    return { accessToken };
  }
}

export async function connectOneDrive(clientId: string): Promise<{ accessToken: string; email?: string }> {
  const { accessToken } = await connect(MICROSOFT, ACCOUNT_MICROSOFT, clientId);
  try {
    const res = await tauriFetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const info = await res.json();
    return { accessToken, email: info?.userPrincipalName || info?.mail };
  } catch {
    return { accessToken };
  }
}

export async function getValidGoogleAccessToken(clientId: string): Promise<string | null> {
  return getValidAccessToken(GOOGLE, ACCOUNT_GOOGLE, clientId);
}

export async function getValidOneDriveAccessToken(clientId: string): Promise<string | null> {
  return getValidAccessToken(MICROSOFT, ACCOUNT_MICROSOFT, clientId);
}

export async function disconnectGoogleDrive(): Promise<void> {
  await deleteCredential(ACCOUNT_GOOGLE);
}

export async function disconnectOneDrive(): Promise<void> {
  await deleteCredential(ACCOUNT_MICROSOFT);
}
