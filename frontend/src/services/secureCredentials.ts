/**
 * Almacén seguro de credenciales bajo Tauri (Fase 7 del plan Tauri, RF Ideas/
 * 00 IDEAS.md) -- envoltorio fino sobre los comandos de src-tauri/src/
 * credentials.rs (Windows Credential Manager / macOS Keychain / Linux Secret
 * Service, vía el crate `keyring`). Solo para tokens de sesión de OAuth
 * (Drive/OneDrive), NUNCA para datos de programación/curso -- esos siguen
 * siendo siempre y solo los .fpg/.fpp/.fpc reales (Fase 5). No tiene sentido
 * en el navegador (no hay keyring de SO al que llamar desde una pestaña) --
 * los llamadores deben comprobar `isTauri()` antes de usar esto.
 */
import { invoke } from "@tauri-apps/api/core";

export async function storeCredential(account: string, secret: string): Promise<void> {
  await invoke("store_credential", { account, secret });
}

export async function getCredential(account: string): Promise<string | null> {
  return invoke<string | null>("get_credential", { account });
}

export async function deleteCredential(account: string): Promise<void> {
  await invoke("delete_credential", { account });
}
