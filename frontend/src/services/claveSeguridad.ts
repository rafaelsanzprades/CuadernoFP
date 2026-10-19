/**
 * Petición de la clave de seguridad al usuario cuando hace falta: abrir un fichero cifrado, o
 * guardar con el cifrado activo cuando la clave no está en memoria (se acaba de abrir la
 * aplicación: la clave nunca se persiste). El modal que la pide es PedirClaveModal.tsx.
 *
 * `pedirClave` devuelve una promesa que se resuelve cuando el usuario responde, de modo que quien
 * la espera (guardar, abrir) sigue su camino sin repetir el flujo. Si varias acciones piden la
 * clave a la vez (el autoguardado puede disparar varias), comparten la misma petición.
 *
 * Sin dependencias de la store para poder usarlo desde fileManager y moduleSlice sin ciclos.
 */
export type MotivoClave = "abrir" | "guardar";

export type RespuestaClave =
  | { tipo: "clave"; clave: string }
  | { tipo: "sin-cifrar" } // solo al guardar: el usuario renuncia al cifrado
  | { tipo: "cancelar" };

export interface PeticionClave {
  motivo: MotivoClave;
  /** Mensaje de un intento anterior fallido (clave incorrecta) */
  error?: string;
}

interface Pendiente extends PeticionClave {
  promesa: Promise<RespuestaClave>;
  resolver: (r: RespuestaClave) => void;
}

let pendiente: Pendiente | null = null;
let oyente: ((p: PeticionClave | null) => void) | null = null;

export function pedirClave(motivo: MotivoClave, error?: string): Promise<RespuestaClave> {
  if (pendiente) return pendiente.promesa;
  let resolver!: (r: RespuestaClave) => void;
  const promesa = new Promise<RespuestaClave>((res) => { resolver = res; });
  pendiente = { motivo, error, promesa, resolver };
  oyente?.({ motivo, error });
  return promesa;
}

/** Lo llama el modal con la respuesta del usuario */
export function responderClave(r: RespuestaClave): void {
  const p = pendiente;
  pendiente = null;
  oyente?.(null);
  p?.resolver(r);
}

export function suscribirPeticionClave(fn: (p: PeticionClave | null) => void): () => void {
  oyente = fn;
  if (pendiente) fn({ motivo: pendiente.motivo, error: pendiente.error });
  return () => {
    if (oyente === fn) oyente = null;
  };
}
