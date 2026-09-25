// Arranque y ciclo de vida del backend empaquetado (Fase 2 del plan Tauri,
// ver RF Ideas/00 IDEAS.md, Ítem 50). El sidecar imprime `PORT=<n>` como
// primera línea de stdout (ver backend/run_sidecar.py) -- se lee aquí y se
// guarda en estado gestionado por Tauri para que el frontend pueda pedirlo
// vía el comando `get_backend_port`.

use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::{process::CommandChild, process::CommandEvent, ShellExt};

pub struct BackendPort(pub Mutex<Option<u16>>);
pub struct BackendProcess(pub Mutex<Option<CommandChild>>);

#[tauri::command]
pub fn get_backend_port(state: State<BackendPort>) -> Option<u16> {
    *state.0.lock().unwrap()
}

/// Puerto del backend de desarrollo gestionado por PM2/iniciar.bat
/// (ecosystem.config.js: `uvicorn main:app --reload --port 8000`). El
/// frontend en dev ya sabe hablar con él solo -- `NEXT_PUBLIC_API_URL` en
/// frontend/.env.development apunta aquí -- así que en `tauri dev` no
/// arrancamos el sidecar empaquetado en absoluto: la ventana carga la misma
/// página de :3000 que ya usas en el navegador, con el mismo backend detrás.
const DEV_BACKEND_PORT: u16 = 8000;

pub fn spawn_backend(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        log::info!(
            "[backend] modo dev: usando el backend de PM2 en 127.0.0.1:{DEV_BACKEND_PORT} \
             (con --reload) en vez de arrancar el .exe empaquetado. Asegúrate de tener \
             iniciar.bat / PM2 corriendo."
        );
        if let Some(state) = app.try_state::<BackendPort>() {
            *state.0.lock().unwrap() = Some(DEV_BACKEND_PORT);
        }
        return Ok(());
    }

    // A partir de aquí solo se ejecuta en release (arriba se vuelve en dev
    // con un `return` anticipado) -- recurso empaquetado de verdad.
    let db_path = app
        .path()
        .resolve("cdd_pro.db", tauri::path::BaseDirectory::Resource)?;
    // OJO: nada de std::fs::canonicalize aquí -- en Windows antepone el
    // prefijo de ruta verbatim `\\?\`, que tras el reemplazo de '\' por '/'
    // de abajo deja la URL de sqlite con cuatro barras iniciales y rota
    // (`sqlite:////?/C:/...`). db_path ya es absoluta tal cual se construyó.
    log::info!("[backend] DATABASE_URL apunta a: {}", db_path.display());
    // sqlite necesita '/' incluso en Windows dentro de la URL de conexión.
    let db_url = format!(
        "sqlite:///{}",
        db_path.to_string_lossy().replace('\\', "/")
    );
    log::info!("[backend] DATABASE_URL = {db_url}");

    let sidecar = app
        .shell()
        .sidecar("cuadernofp-backend")?
        .env("DATABASE_URL", db_url)
        .env(
            "CORS_ORIGINS",
            "tauri://localhost,http://localhost:3000,http://localhost:1420,http://127.0.0.1:1420",
        );

    let (mut rx, child) = sidecar.spawn()?;

    if let Some(state) = app.try_state::<BackendProcess>() {
        *state.0.lock().unwrap() = Some(child);
    }

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let line = String::from_utf8_lossy(&line);
                    let line = line.trim();
                    log::info!("[backend] {line}");
                    if let Some(port_str) = line.strip_prefix("PORT=") {
                        if let Ok(port) = port_str.trim().parse::<u16>() {
                            if let Some(state) = app_handle.try_state::<BackendPort>() {
                                *state.0.lock().unwrap() = Some(port);
                            }
                        }
                    }
                }
                CommandEvent::Stderr(line) => {
                    log::warn!("[backend:stderr] {}", String::from_utf8_lossy(&line).trim());
                }
                CommandEvent::Terminated(payload) => {
                    log::error!("[backend] proceso terminado: {payload:?}");
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(())
}

/// Mata el proceso del backend si sigue vivo -- se llama al cerrar la app
/// para no dejar `cuadernofp-backend.exe` huérfano.
pub fn kill_backend(app: &AppHandle) {
    if let Some(state) = app.try_state::<BackendProcess>() {
        if let Some(child) = state.0.lock().unwrap().take() {
            let _ = child.kill();
        }
    }
}
