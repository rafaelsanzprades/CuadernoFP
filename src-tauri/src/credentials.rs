// Almacén seguro de credenciales de sesión (Fase 7 del plan Tauri, RF Ideas/
// 00 IDEAS.md) -- tokens de OAuth de Google Drive / OneDrive, NUNCA datos de
// programación/curso (esos siguen siendo siempre y solo los .fpg/.fpp/.fpc
// reales, ver Fase 5). Usa el almacén nativo del SO vía el crate `keyring`
// (Windows Credential Manager / macOS Keychain / Linux Secret Service) --
// no un fichero JSON de plugin-store ni IndexedDB, porque esto sí son
// credenciales reales, no datos de curso.
use keyring::Entry;

const KEYRING_SERVICE: &str = "com.cuadernofp.desktop";

fn entry(account: &str) -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, account).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn store_credential(account: String, secret: String) -> Result<(), String> {
    entry(&account)?.set_password(&secret).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_credential(account: String) -> Result<Option<String>, String> {
    match entry(&account)?.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn delete_credential(account: String) -> Result<(), String> {
    match entry(&account)?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Round-trip real contra el almacén de credenciales del SO de esta
    // máquina (Windows Credential Manager aquí) -- no un mock, para
    // verificar de verdad que guardar/leer/borrar funciona antes de que
    // dependa de ello un flujo de login real. Limpia después de sí misma.
    #[test]
    fn round_trip_store_get_delete() {
        let account = "cuadernofp-test-account-credentials-rs";
        let _ = delete_credential(account.to_string());

        store_credential(account.to_string(), "s3cr3t-valor-de-prueba".to_string())
            .expect("store debería funcionar");

        let read = get_credential(account.to_string()).expect("get no debería fallar");
        assert_eq!(read, Some("s3cr3t-valor-de-prueba".to_string()));

        delete_credential(account.to_string()).expect("delete debería funcionar");

        let after_delete = get_credential(account.to_string()).expect("get tras delete no debería fallar");
        assert_eq!(after_delete, None);
    }
}
