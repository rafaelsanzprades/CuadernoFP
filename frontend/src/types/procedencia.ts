// Procedencia de los datos del catálogo oficial (la devuelve /api/catalog/curriculum/{título}).
export type CotejoModulo = "igual" | "corregido_boe" | "rd659_2023" | "autonomico" | "sin_cotejo" | "difiere" | "sin_ra";
export type EstadoComunidad = "verificado" | "enlaces_oficiales" | "heredado" | "a_completar" | "sin_cargar" | "no_disponible" | "no_ofertado";

export interface ProcedenciaComunidad {
  comunidad: string;
  boletin: string | null;
  estado: EstadoComunidad;
  norma: string | null;
  url_curriculo: string | null;
  url_horario: string | null;
  url_horario_ley_fp: string | null;
  url_modificaciones: [string, string][] | null;
  url_portal: string | null;
  nota: string | null;
  verificado_el: string | null;
}

export interface ProcedenciaTitulo {
  norma_estatal: string | null;
  url_norma_estatal: string | null;
  verificado_el: string | null;
  verificacion: string | null;
  comunidades: ProcedenciaComunidad[];
}

export interface HorasComunidad {
  comunidad: string;
  horas: number | null;
  curso: string | null;
  estado: string;
  fuente: string | null;
  nota: string | null;
}
