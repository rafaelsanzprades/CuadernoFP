import data from "./glosario.json";

// Glosario de la FP y la docencia. Es el MISMO glosario que el de rafaelsanzprades.es/glosario-fp/:
// la fuente es contenidos/glosario/glosario.json de la web y este fichero se genera con
// `python -X utf8 herramientas/exportar-glosario-app.py` (en el repositorio de la web). No editar glosario.json a mano.
export interface GlosarioEnlace {
  texto: string;
  url: string;
}

export interface GlosarioItem {
  /** Sigla; vacía si el término no tiene (se deja el hueco y se ordena por el término). */
  sigla: string;
  termino: string;
  descripcion: string;
  categoria: string;
  enlaces?: GlosarioEnlace[];
}

export interface GlosarioCategoria {
  id: string;
  nombre: string;
}

export const GLOSARIO_CATEGORIAS: GlosarioCategoria[] = data.categorias;
export const glosarioData: GlosarioItem[] = data.terminos as GlosarioItem[];
