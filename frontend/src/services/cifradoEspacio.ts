/**
 * Cifrado del espacio de trabajo: qué texto se guarda (en claro o cifrado) y cómo se lee un
 * fichero que puede venir cifrado. Lo usan fileManager.ts (guardado explícito, abrir, exportar) y
 * moduleSlice.ts (el guardado real detrás del autoguardado).
 *
 * Reglas:
 *  - La clave solo vive en memoria. `cifradoActivo` (persistido) recuerda que este espacio se guarda
 *    cifrado, y `verificadorClave` (persistido, un texto fijo cifrado con la clave) permite comprobar
 *    que la clave que se escribe al reabrir la aplicación es la misma de antes.
 *  - Si el cifrado está activo y falta la clave, NUNCA se guarda en claro por descuido: se pide la
 *    clave y, solo si el usuario lo elige expresamente, se guarda sin cifrar y se desactiva el cifrado.
 *
 * Recibe el "almacén" por parámetro (getState/setState) para no importar la store y evitar ciclos.
 */
import toast from "react-hot-toast";
import { cifrar, descifrar, estaCifrado, esCifradoAntiguo, ClaveIncorrectaError } from "@/services/cifrado";
import { pedirClave } from "@/services/claveSeguridad";

export interface EstadoCifrado {
  encryptionKey: string | null;
  cifradoActivo: boolean;
  verificadorClave: string | null;
}

export interface AlmacenCifrado {
  getState(): EstadoCifrado;
  setState(parcial: Partial<EstadoCifrado>): void;
}

const TEXTO_VERIFICADOR = "cuaderno-fp";

const crearVerificador = (clave: string) => cifrar(TEXTO_VERIFICADOR, clave);

async function claveCoincide(verificador: string | null, clave: string): Promise<boolean> {
  if (!verificador) return true; // no hay con qué comparar: se acepta
  try {
    return (await descifrar(verificador, clave)) === TEXTO_VERIFICADOR;
  } catch {
    return false;
  }
}

/** Activa el cifrado con una clave nueva (desde Inicio > Cifrado). */
export async function activarCifrado(a: AlmacenCifrado, clave: string): Promise<void> {
  a.setState({ encryptionKey: clave, cifradoActivo: true, verificadorClave: await crearVerificador(clave) });
}

export function desactivarCifrado(a: AlmacenCifrado): void {
  a.setState({ encryptionKey: null, cifradoActivo: false, verificadorClave: null });
}

/**
 * Texto que se escribe en el fichero (y se sube a la nube): JSON en claro o cifrado.
 * Devuelve null si el usuario cancela al pedirle la clave: en ese caso no se guarda nada.
 */
export async function serializarParaGuardar(datos: unknown, a: AlmacenCifrado): Promise<string | null> {
  const json = JSON.stringify(datos, null, 2);
  let { encryptionKey } = a.getState();
  const { cifradoActivo, verificadorClave } = a.getState();

  if (!encryptionKey && !cifradoActivo) return json;

  let error: string | undefined;
  while (!encryptionKey) {
    const r = await pedirClave("guardar", error);
    if (r.tipo === "cancelar") return null;
    if (r.tipo === "sin-cifrar") {
      desactivarCifrado(a);
      return json;
    }
    if (await claveCoincide(verificadorClave, r.clave)) {
      encryptionKey = r.clave;
      a.setState({ encryptionKey: r.clave, cifradoActivo: true });
    } else {
      error = "Esa clave no coincide con la que usabas. Si la escribes distinta, tus ficheros quedarían cifrados con otra clave.";
    }
  }
  return cifrar(json, encryptionKey);
}

/**
 * Contenido de un .fpp/.fpc: JSON en claro o cifrado. Devuelve null si no se puede abrir
 * (el usuario cancela, o el fichero es de una versión anterior).
 */
export async function leerFichero(texto: string, a: AlmacenCifrado): Promise<any | null> {
  if (esCifradoAntiguo(texto)) {
    toast.error("Este fichero usa el cifrado de una versión anterior de la aplicación y no se puede abrir.");
    return null;
  }
  if (!estaCifrado(texto)) return JSON.parse(texto);

  let clave = a.getState().encryptionKey;
  let error: string | undefined;
  for (;;) {
    if (!clave) {
      const r = await pedirClave("abrir", error);
      if (r.tipo !== "clave") return null;
      clave = r.clave;
    }
    try {
      const parsed = JSON.parse(await descifrar(texto, clave));
      // El fichero estaba cifrado: se sigue guardando cifrado, con esta clave
      a.setState({ encryptionKey: clave, cifradoActivo: true, verificadorClave: await crearVerificador(clave) });
      return parsed;
    } catch (e) {
      if (!(e instanceof ClaveIncorrectaError)) throw e;
      error = "Clave incorrecta o fichero dañado.";
      clave = null;
    }
  }
}
