/**
 * PKCE (Proof Key for Code Exchange, RFC 7636) para el login nativo de
 * Google Drive/OneDrive bajo Tauri (Fase 7 del plan Tauri, RF Ideas/
 * 00 IDEAS.md) -- Web Crypto puro, sin dependencias, funciona igual en el
 * navegador que en un webview de Tauri. No hace falta client_secret: es
 * justo lo que PKCE evita para un cliente público (una app de escritorio
 * no puede guardar un secreto de verdad).
 */

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** code_verifier: cadena aleatoria de 43-128 caracteres (RFC 7636 §4.1). */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** code_challenge = BASE64URL(SHA256(code_verifier)), método "S256". */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

/** state anti-CSRF, para comprobar que la redirección de vuelta corresponde a esta petición. */
export function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
