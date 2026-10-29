// Valoración del tutor de empresa (FEOE). Dos formas de registrarla, según `config_redondeo.tutor_empresa_modo`:
//  - «escala_1_4» (Aragón, como hasta ahora): el tutor valora de 1 a 4 cada criterio designado; esos valores entran en el Motor JEG
//    como un instrumento más (origen «empresa») y el resultado de cada RA se DEDUCE: «Superado» con una media mayor que 2.
//  - «superado»: se registra para cada RA «Superado» o «No superado», con su motivación (RD 659/2023, art. 18.7.a; también lo piden
//    Andalucía y Asturias). No entra en la media: actúa como condición (un RA no superado impide una nota de acta positiva).
// En los dos modos se guarda además una valoración cualitativa del tutor y, si un RA no se supera, su motivación.
//
// Dónde se guarda: la escala 1-4, en df_calificaciones (instrumento FEOE-EMPRESA, un indicador por criterio); el resultado por RA, la
// motivación y la valoración cualitativa, en df_feoe (una fila por alumno/a, clave `ID`, igual que df_eval: la renumeración del
// alumnado ya la contempla).

import type { ConfigRedondeo } from "./calificaciones";

export const ID_INSTRUMENTO_FEOE = "FEOE-EMPRESA";
export const idIndicadorFeoe = (ce_id: string) => `FEOE-${ce_id}`;

// El 1-4 se pasa a 0-10 de forma proporcional y estricta: (valor-1)/3*10 -> 1=0, 2=3.3, 3=6.7, 4=10. Con esto un «2» (por debajo del
// aprobado real) no empuja la nota del RA por encima de 5, coherente con la regla de que «Superado» exige una media estrictamente mayor que 2.
export const valorA10 = (valor1a4: number) => Math.round((((valor1a4 - 1) / 3) * 10) * 10) / 10;
export const valor10A1 = (valor0a10: number | null | undefined): number | null => {
  if (valor0a10 === null || valor0a10 === undefined) return null;
  return Math.round((valor0a10 / 10) * 3) + 1;
};

export type ModoTutor = "escala_1_4" | "superado";
export type ResultadoTutor = "superado" | "no_superado";

export interface ValoracionRaTutor {
  resultado?: ResultadoTutor;
  motivacion?: string;
}
/** Plan de formación individual en empresa de un alumno/a (se imprime con el documento «plan_formacion»; ver backend/pdf_plan_formacion.py). */
export interface PlanFormacion {
  empresa?: string;
  tutor_empresa?: string;
  tutor_docente?: string;
  inicio?: string;
  fin?: string;
  horas?: string;
  /** Actividades previstas en la empresa para cada RA, por id_ra. */
  actividades?: Record<string, string>;
}
export interface FilaFeoe {
  ID: string;
  informe?: string;
  plan?: PlanFormacion;
  ra?: Record<string, ValoracionRaTutor>;
  [clave: string]: any;
}

export const modoTutor = (config?: Partial<ConfigRedondeo> | null): ModoTutor =>
  config?.tutor_empresa_modo === "superado" ? "superado" : "escala_1_4";

export function filaFeoe(df_feoe: any[] | undefined, al_id: string): FilaFeoe {
  return (df_feoe || []).find((f: any) => f?.ID === al_id) || { ID: al_id };
}

function conFila(df_feoe: any[] | undefined, al_id: string, cambia: (f: FilaFeoe) => FilaFeoe): any[] {
  const base = df_feoe || [];
  const idx = base.findIndex((f: any) => f?.ID === al_id);
  const next = [...base];
  if (idx >= 0) next[idx] = cambia(next[idx]); else next.push(cambia({ ID: al_id }));
  return next;
}

/** Fila de df_feoe con el resultado y/o la motivación de un RA cambiados (los campos no indicados se conservan). */
export function conValoracionRa(df_feoe: any[] | undefined, al_id: string, id_ra: string, parcial: Partial<ValoracionRaTutor>): any[] {
  return conFila(df_feoe, al_id, (f) => ({ ...f, ra: { ...(f.ra || {}), [id_ra]: { ...(f.ra?.[id_ra] || {}), ...parcial } } }));
}

/** Fila de df_feoe con campos del plan de formación cambiados; `actividad` cambia solo el texto de un RA. */
export function conPlan(df_feoe: any[] | undefined, al_id: string, parcial: Partial<PlanFormacion>, actividad?: { id_ra: string; texto: string }): any[] {
  return conFila(df_feoe, al_id, (f) => {
    const plan = { ...(f.plan || {}), ...parcial };
    if (actividad) plan.actividades = { ...(f.plan?.actividades || {}), [actividad.id_ra]: actividad.texto };
    return { ...f, plan };
  });
}

export function conInforme(df_feoe: any[] | undefined, al_id: string, informe: string): any[] {
  return conFila(df_feoe, al_id, (f) => ({ ...f, informe }));
}

/** Media (escala 1-4) de los criterios del RA que el tutor ha valorado; null si no ha valorado ninguno. */
export function mediaEscalaRa(df_calificaciones: any[], ceDesignadosDelRa: any[], al_id: string): number | null {
  const valores = ceDesignadosDelRa
    .map((ce: any) => {
      const c = df_calificaciones.find(
        (x: any) => x.id_alumno === al_id && x.id_instrumento === ID_INSTRUMENTO_FEOE && x.id_indicador === idIndicadorFeoe(ce.id_ce)
      );
      return valor10A1(c?.valor);
    })
    .filter((v): v is number => v !== null);
  return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
}

/** Resultado del tutor para un RA: el registrado a mano («superado») o el deducido de la media de la escala (mayor que 2 = superado).
 *  null = sin valorar. */
export function resultadoRaTutor(modo: ModoTutor, fila: FilaFeoe, id_ra: string, mediaEscala: number | null): ResultadoTutor | null {
  if (modo === "superado") return fila.ra?.[id_ra]?.resultado ?? null;
  if (mediaEscala === null) return null;
  return mediaEscala > 2 ? "superado" : "no_superado";
}

/** RA (con criterios designados para la empresa) que el tutor no ha dado por superados. */
export function rasNoSuperadosTutor(
  config: Partial<ConfigRedondeo> | null | undefined,
  df_feoe: any[] | undefined,
  df_calificaciones: any[],
  df_ce: any[],
  al_id: string
): string[] {
  const modo = modoTutor(config);
  const fila = filaFeoe(df_feoe, al_id);
  const ces = df_ce.filter((ce: any) => ce.is_dual === true);
  const ras = Array.from(new Set(ces.map((ce: any) => ce.id_ra)));
  return ras.filter((id_ra) => {
    const media = mediaEscalaRa(df_calificaciones, ces.filter((ce: any) => ce.id_ra === id_ra), al_id);
    return resultadoRaTutor(modo, fila, id_ra, media) === "no_superado";
  });
}
