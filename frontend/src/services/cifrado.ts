/**
 * Cifrado opcional de los ficheros .fpg/.fpp/.fpc (y de lo que se sube a la nube).
 *
 * Formato: "CFP2." + base64( sal[16] | iv[12] | texto cifrado + etiqueta GCM ).
 *  - Clave: PBKDF2-HMAC-SHA256, 600 000 iteraciones, con una sal aleatoria por fichero.
 *  - Cifrado: AES-256-GCM. Es autenticado: una clave incorrecta o un fichero alterado se
 *    detectan siempre, no se obtiene basura.
 *
 * La clave del usuario solo vive en memoria (no se persiste, ver useAppStore.partialize).
 * Derivar la clave es lento a propósito, así que se guarda la derivada durante la sesión:
 * el autoguardado reutiliza la misma sal y genera un IV nuevo en cada guardado.
 *
 * No hay compatibilidad con el formato anterior (CryptoJS, "U2FsdGVkX1..."): la aplicación
 * no tiene usuarios con ficheros cifrados en ese formato.
 */

const PREFIJO = "CFP2.";
const PREFIJO_ANTIGUO = "U2FsdGVkX1";
const ITERACIONES = 600_000;
const LONGITUD_SAL = 16;
const LONGITUD_IV = 12;

export const LONGITUD_MINIMA_CLAVE = 8;

export class ClaveIncorrectaError extends Error {
  constructor() {
    super("Clave incorrecta o fichero dañado.");
    this.name = "ClaveIncorrectaError";
  }
}

export class CifradoAntiguoError extends Error {
  constructor() {
    super("Este fichero usa el cifrado de una versión anterior y no se puede abrir.");
    this.name = "CifradoAntiguoError";
  }
}

export const estaCifrado = (texto: string): boolean => texto.startsWith(PREFIJO);
export const esCifradoAntiguo = (texto: string): boolean => texto.startsWith(PREFIJO_ANTIGUO);

function aBase64(bytes: Uint8Array): string {
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

function desdeBase64(texto: string): Uint8Array {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

async function derivar(clave: string, sal: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(clave.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: sal as BufferSource, iterations: ITERACIONES, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Claves derivadas durante la sesión (la derivación tarda unos cientos de ms)
const derivadas = new Map<string, CryptoKey>();
let salDeEscritura: { clave: string; sal: Uint8Array } | null = null;

async function claveDerivada(clave: string, sal: Uint8Array): Promise<CryptoKey> {
  const id = `${clave}\u0000${aBase64(sal)}`;
  let k = derivadas.get(id);
  if (!k) {
    k = await derivar(clave, sal);
    if (derivadas.size >= 6) derivadas.clear();
    derivadas.set(id, k);
  }
  return k;
}

export async function cifrar(texto: string, clave: string): Promise<string> {
  if (!salDeEscritura || salDeEscritura.clave !== clave) {
    salDeEscritura = { clave, sal: crypto.getRandomValues(new Uint8Array(LONGITUD_SAL)) };
  }
  const { sal } = salDeEscritura;
  const iv = crypto.getRandomValues(new Uint8Array(LONGITUD_IV));
  const k = await claveDerivada(clave, sal);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(texto)));
  const salida = new Uint8Array(LONGITUD_SAL + LONGITUD_IV + cifrado.length);
  salida.set(sal, 0);
  salida.set(iv, LONGITUD_SAL);
  salida.set(cifrado, LONGITUD_SAL + LONGITUD_IV);
  return PREFIJO + aBase64(salida);
}

export async function descifrar(texto: string, clave: string): Promise<string> {
  if (esCifradoAntiguo(texto)) throw new CifradoAntiguoError();
  try {
    const bytes = desdeBase64(texto.slice(PREFIJO.length).trim());
    const sal = bytes.slice(0, LONGITUD_SAL);
    const iv = bytes.slice(LONGITUD_SAL, LONGITUD_SAL + LONGITUD_IV);
    const datos = bytes.slice(LONGITUD_SAL + LONGITUD_IV);
    const k = await claveDerivada(clave, sal);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, datos));
  } catch {
    throw new ClaveIncorrectaError();
  }
}
