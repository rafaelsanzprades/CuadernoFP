// Catalogación nacional (ítem 5 del backlog): los títulos de FP no comparten
// una única estructura legal de currículo -- coexisten varias generaciones de
// normativa, cada una con su propio artículo 6 (Cualificaciones/UC vs.
// Estándares ECP) y con o sin un artículo de Objetivos Generales explícito.
// Rafael, 2026-09-12: mostrar esto en todos los títulos por igual (no solo en
// los que se salen de "lo normal"), con año, enlace a la fuente y una leyenda
// -- para no dar la impresión de que unos son el modelo y otros la excepción.

export type GeneracionCurriculo = "rd659_2023" | "reforma_2024" | "loe_clasica" | "desconocida";

export interface InfoGeneracion {
  label: string;
  leyenda: string;
  tieneObjetivosGenerales: boolean;
}

export const GENERACIONES_CURRICULO: Record<GeneracionCurriculo, InfoGeneracion> = {
  rd659_2023: {
    label: "RD 659/2023 (LO 3/2022)",
    leyenda: "Currículo redactado bajo el Real Decreto 659/2023, desarrollo de la LO 3/2022. El Artículo 6 recoge las Cualificaciones profesionales y Unidades de Competencia del Catálogo Nacional de Cualificaciones Profesionales, y el Artículo 9 fija los Objetivos Generales del título.",
    tieneObjetivosGenerales: true,
  },
  reforma_2024: {
    label: "Reforma 2024+ (Orden EFD/659/2024)",
    leyenda: "Currículo de la generación de títulos publicada a partir de 2024. El Artículo 6 usa Estándares de Competencias Profesionales (ECP) en vez de Cualificaciones/UC, y no incluye un artículo de Objetivos Generales independiente -- este currículo no define esa lista.",
    tieneObjetivosGenerales: false,
  },
  loe_clasica: {
    label: "LOE, anterior a 2023",
    leyenda: "Currículo previo a la LO 3/2022: Real Decreto de enseñanzas mínimas estatal y Orden de currículo completo (autonómica o del Ministerio) publicados como documentos separados.",
    tieneObjetivosGenerales: true,
  },
  desconocida: {
    label: "Generación sin clasificar",
    leyenda: "Todavía no se ha localizado ni clasificado el Real Decreto de origen de este currículo.",
    tieneObjetivosGenerales: true,
  },
};

export interface FuenteNormativa {
  generacion: GeneracionCurriculo;
  rd_numero?: string;
  rd_fecha?: string;
  boe_url?: string;
  nota?: string;
}

export function getFuenteNormativa(boaArticles: any): FuenteNormativa {
  return boaArticles?.fuente || { generacion: "desconocida" };
}
