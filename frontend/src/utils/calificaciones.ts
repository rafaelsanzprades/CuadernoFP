// Motor de calificación (Motor A: instrumento -> CE -> RA -> módulo).
// Consolidado desde DetalleAlumnadoTab.tsx y AnalisisIndividualTab.tsx (código
// duplicado literal en ambos) al resolver la Fase 2 / decisión A del plan
// (RF Ideas/propuesta-motor-calificacion-2026-08-16.md).
//
// Decisión A: un CE sin ninguna actividad calificada se EXCLUYE del
// denominador ponderado de su RA, en vez de contar como 0 — antes, un CE sin
// trabajar bajaba la nota del RA artificialmente porque sumaba con su peso
// completo pero valor 0. Un RA sin ningún CE calificado se marca `null`
// ("sin evaluar"), igual que un módulo sin ningún RA calificado. La misma
// exclusión se aplica al pasar de RA a nota final del módulo.

export interface ConfigRedondeo {
  nota_aprobado: number;
  umbral_redondeo: number;
  max_compensables: number;
}

export const DEFAULT_CONFIG_REDONDEO: ConfigRedondeo = {
  nota_aprobado: 5.0,
  umbral_redondeo: 5.0,
  max_compensables: 0,
};

export interface NotasCalculadas {
  notas_ce: Record<string, number | null>;
  notas_ra: Record<string, number | null>;
  nota_final: number | null;
  // RA en los que el tope de max_compensables está activo (para el badge de la decisión B)
  ra_tope_activo: Record<string, boolean>;
}

/**
 * Calcula las notas de un alumno a partir de su fila de df_eval, el catálogo
 * de RA/CE del módulo y las actividades (df_act, cada una marca con
 * act[ce_id] === true qué CE evalúa). `overrides` permite simular valores de
 * actividad sin tocar df_eval (usado por el simulador de AnalisisIndividualTab).
 */
export function calcularNotas(
  evRow: any,
  df_ra: any[],
  df_ce: any[],
  df_act: any[],
  config: ConfigRedondeo = DEFAULT_CONFIG_REDONDEO,
  overrides: Record<string, number> = {}
): NotasCalculadas {
  const peso_ra: Record<string, number> = {};
  df_ra.forEach((ra: any) => {
    if (ra.id_ra) peso_ra[ra.id_ra] = Number(ra.peso_ra) || 0;
  });

  const peso_ce: Record<string, number> = {};
  const ra_of_ce: Record<string, string> = {};
  df_ce.forEach((ce: any) => {
    if (ce.id_ce && ce.id_ra) {
      peso_ce[ce.id_ce] = Number(ce.peso_ce) || 0;
      ra_of_ce[ce.id_ce] = ce.id_ra;
    }
  });

  // notas_ce: null = ningún instrumento vinculado a este CE tiene nota todavía.
  const notas_ce: Record<string, number | null> = {};
  Object.keys(peso_ce).forEach((ce_id) => {
    const act_vals: number[] = [];
    df_act.forEach((act: any) => {
      if (act[ce_id] === true || act[ce_id] === "true") {
        const act_id = act.id_act;
        const val = overrides[act_id] !== undefined ? overrides[act_id] : Number(evRow[act_id]);
        if (!isNaN(val)) act_vals.push(val);
      }
    });
    notas_ce[ce_id] = act_vals.length > 0 ? act_vals.reduce((a, b) => a + b, 0) / act_vals.length : null;
  });

  // Cada RA acumula solo los CE con nota real, ponderando por el peso
  // realmente usado (no se asume que los pesos de los CE evaluados sumen 100).
  const sumaPonderadaPorRa: Record<string, number> = {};
  const pesoUsadoPorRa: Record<string, number> = {};
  const failed_ces_by_ra: Record<string, number> = {};
  Object.entries(notas_ce).forEach(([ce_id, n_ce]) => {
    const r_id = ra_of_ce[ce_id];
    if (!r_id || n_ce === null) return;
    sumaPonderadaPorRa[r_id] = (sumaPonderadaPorRa[r_id] || 0) + n_ce * peso_ce[ce_id];
    pesoUsadoPorRa[r_id] = (pesoUsadoPorRa[r_id] || 0) + peso_ce[ce_id];
    if (n_ce < config.nota_aprobado) {
      failed_ces_by_ra[r_id] = (failed_ces_by_ra[r_id] || 0) + 1;
    }
  });

  const all_ra_ids = new Set<string>([...Object.keys(peso_ra), ...Object.values(ra_of_ce)]);
  const notas_ra: Record<string, number | null> = {};
  const ra_tope_activo: Record<string, boolean> = {};
  all_ra_ids.forEach((r_id) => {
    const pesoUsado = pesoUsadoPorRa[r_id] || 0;
    if (pesoUsado <= 0) {
      notas_ra[r_id] = null;
      ra_tope_activo[r_id] = false;
      return;
    }
    let n_ra = sumaPonderadaPorRa[r_id] / pesoUsado;
    if (n_ra >= config.umbral_redondeo && n_ra < config.nota_aprobado) {
      n_ra = config.nota_aprobado;
    }
    const topeActivo = (failed_ces_by_ra[r_id] || 0) > config.max_compensables && n_ra >= config.nota_aprobado;
    if (topeActivo) {
      n_ra = config.nota_aprobado - 0.1;
    }
    notas_ra[r_id] = n_ra;
    ra_tope_activo[r_id] = topeActivo;
  });

  let sumaFinal = 0;
  let pesoFinalUsado = 0;
  Object.entries(notas_ra).forEach(([r_id, n_ra]) => {
    if (n_ra === null) return;
    sumaFinal += n_ra * (peso_ra[r_id] || 0);
    pesoFinalUsado += peso_ra[r_id] || 0;
  });

  let nota_final: number | null = pesoFinalUsado > 0 ? sumaFinal / pesoFinalUsado : null;
  if (nota_final !== null && nota_final >= config.umbral_redondeo && nota_final < config.nota_aprobado) {
    nota_final = config.nota_aprobado;
  }

  return { notas_ce, notas_ra, nota_final, ra_tope_activo };
}

export interface SigadInfo {
  n: number;
  cod: string;
  txt: string;
  col: string;
}

// ---------------------------------------------------------------------------
// Motor JEG (Indicador -> CE -> RA -> Módulo), decisión D de la Fase 2.
// Aditivo: no sustituye a calcularNotas() (Motor A, arriba) en ninguno de sus
// consumidores actuales (DetalleAlumnadoTab, AnalisisIndividualTab,
// ProgresoRaTab, boletines backend) — vive en su propia pestaña "Modelo JEG"
// de /instrumentos hasta que se decida una migración completa. Usa el
// esquema ya existente (IndicadorSchema/InstrumentoSchema/CalificacionSchema
// en types/index.ts), sin tocar peso_ce/peso_ra del RA/CE (mismos campos que
// Motor A, para que ambos motores sigan siendo comparables entre sí).
// ---------------------------------------------------------------------------

export interface NotasJEG {
  notas_indicador: Record<string, number | null>;
  notas_ce: Record<string, number | null>;
  // Notas de RA de la vía ordinaria, ANTES de aplicar recuperaciones — se
  // conserva para mostrar "qué había antes de recuperar" si hace falta.
  notas_ra_ordinario: Record<string, number | null>;
  // Notas de RA que realmente cuentan: recuperación (R1-RF) sustituye a la
  // ordinaria en los RA donde el alumno tiene una calificación de
  // recuperación (ítem 30 de la Fase 2 — la recuperación salta el CE y
  // pondera directo en el RA, no se aplican los peso_ce).
  notas_ra: Record<string, number | null>;
  nota_final: number | null;
  // EvFE (segunda convocatoria): hoja de resultados aparte, nunca mezclada
  // con la ordinaria. Un RA sin intento en EvFE hereda notas_ra (ordinaria +
  // recuperación) — EvFE solo repite lo que hiciera falta, no todo el módulo.
  notas_ra_extraordinaria: Record<string, number | null>;
  nota_final_extraordinaria: number | null;
}

function redondear(n_ra: number, config: ConfigRedondeo): number {
  if (n_ra >= config.umbral_redondeo && n_ra < config.nota_aprobado) return config.nota_aprobado;
  return n_ra;
}

function notaFinalPonderada(notas_ra: Record<string, number | null>, peso_ra: Record<string, number>, config: ConfigRedondeo): number | null {
  let suma = 0, pesoUsado = 0;
  Object.entries(notas_ra).forEach(([r_id, n_ra]) => {
    if (n_ra === null) return;
    suma += n_ra * (peso_ra[r_id] || 0);
    pesoUsado += peso_ra[r_id] || 0;
  });
  if (pesoUsado <= 0) return null;
  return redondear(suma / pesoUsado, config);
}

/**
 * Calcula la nota de un alumno siguiendo el modelo Indicador->CE->RA->Módulo,
 * con los 3 procedimientos de JEG (ítem 30): ordinario (vía CE normal),
 * recuperación (R1/R2/R3/RF — Indicador directo a RA, salta el CE) y
 * extraordinaria (EvFE — igual que recuperación, hoja aparte).
 */
export function calcularNotasJEG(
  al_id: string,
  df_calificaciones: any[],
  df_indicadores: any[],
  df_instr: any[],
  df_ce: any[],
  df_ra: any[],
  config: ConfigRedondeo = DEFAULT_CONFIG_REDONDEO
): NotasJEG {
  const instrById: Record<string, any> = {};
  df_instr.forEach((i: any) => { if (i.id_instrumento) instrById[i.id_instrumento] = i; });

  const calAlumno = df_calificaciones.filter((c: any) => c.id_alumno === al_id && c.valor !== null && c.valor !== undefined);
  const porProcedimiento = (proc: string) => calAlumno.filter((c: any) => (instrById[c.id_instrumento]?.procedimiento || "ordinario") === proc);

  const ceOfIndicador: Record<string, string> = {};
  const pesoIndicador: Record<string, number> = {};
  df_indicadores.forEach((ind: any) => {
    if (!ind.id_indicador) return;
    ceOfIndicador[ind.id_indicador] = ind.id_ce;
    pesoIndicador[ind.id_indicador] = ind.peso ?? 1;
  });

  const ra_of_ce: Record<string, string> = {};
  const peso_ce: Record<string, number> = {};
  df_ce.forEach((ce: any) => {
    if (!ce.id_ce) return;
    ra_of_ce[ce.id_ce] = ce.id_ra;
    peso_ce[ce.id_ce] = Number(ce.peso_ce) || 0;
  });

  const peso_ra: Record<string, number> = {};
  df_ra.forEach((ra: any) => { if (ra.id_ra) peso_ra[ra.id_ra] = Number(ra.peso_ra) || 0; });
  const all_ra_ids = new Set<string>([...Object.keys(peso_ra), ...Object.values(ra_of_ce)]);

  // Indicador -> nota (media ponderada por peso_global del instrumento que originó cada Calificación)
  const notasIndicadorDe = (cals: any[]): Record<string, number | null> => {
    const porIndicador: Record<string, { valor: number; peso: number }[]> = {};
    cals.forEach((c: any) => {
      const instr = instrById[c.id_instrumento];
      const valor = typeof c.nota_calculada === "number" ? c.nota_calculada : Number(c.valor);
      if (isNaN(valor)) return;
      const peso = instr?.peso_global ?? 1;
      if (!porIndicador[c.id_indicador]) porIndicador[c.id_indicador] = [];
      porIndicador[c.id_indicador].push({ valor, peso });
    });
    const out: Record<string, number | null> = {};
    df_indicadores.forEach((ind: any) => {
      if (!ind.id_indicador) return;
      const entries = porIndicador[ind.id_indicador];
      if (!entries || entries.length === 0) { out[ind.id_indicador] = null; return; }
      const pesoTotal = entries.reduce((s, e) => s + e.peso, 0);
      out[ind.id_indicador] = pesoTotal > 0
        ? entries.reduce((s, e) => s + e.valor * e.peso, 0) / pesoTotal
        : entries.reduce((s, e) => s + e.valor, 0) / entries.length;
    });
    return out;
  };

  // Vía ordinaria: Indicador -> CE (con peso_ce) -> RA (con peso_ce también)
  const notas_indicador = notasIndicadorDe(porProcedimiento("ordinario"));

  const sumaPonderadaCe: Record<string, number> = {};
  const pesoUsadoCe: Record<string, number> = {};
  Object.entries(notas_indicador).forEach(([id_indicador, n_ind]) => {
    if (n_ind === null) return;
    const ce_id = ceOfIndicador[id_indicador];
    if (!ce_id) return;
    const peso = pesoIndicador[id_indicador] || 0;
    sumaPonderadaCe[ce_id] = (sumaPonderadaCe[ce_id] || 0) + n_ind * peso;
    pesoUsadoCe[ce_id] = (pesoUsadoCe[ce_id] || 0) + peso;
  });

  const notas_ce: Record<string, number | null> = {};
  df_ce.forEach((ce: any) => {
    if (!ce.id_ce) return;
    const pesoUsado = pesoUsadoCe[ce.id_ce] || 0;
    notas_ce[ce.id_ce] = pesoUsado > 0 ? sumaPonderadaCe[ce.id_ce] / pesoUsado : null;
  });

  const sumaPonderadaRaOrd: Record<string, number> = {};
  const pesoUsadoRaOrd: Record<string, number> = {};
  Object.entries(notas_ce).forEach(([ce_id, n_ce]) => {
    if (n_ce === null) return;
    const r_id = ra_of_ce[ce_id];
    if (!r_id) return;
    sumaPonderadaRaOrd[r_id] = (sumaPonderadaRaOrd[r_id] || 0) + n_ce * peso_ce[ce_id];
    pesoUsadoRaOrd[r_id] = (pesoUsadoRaOrd[r_id] || 0) + peso_ce[ce_id];
  });

  const notas_ra_ordinario: Record<string, number | null> = {};
  all_ra_ids.forEach((r_id) => {
    const pesoUsado = pesoUsadoRaOrd[r_id] || 0;
    notas_ra_ordinario[r_id] = pesoUsado > 0 ? redondear(sumaPonderadaRaOrd[r_id] / pesoUsado, config) : null;
  });

  // Recuperación / extraordinaria: Indicador -> RA DIRECTO, salta el CE del
  // todo (no se aplican los peso_ce) — pondera por peso del propio indicador.
  const notasRaDirectas = (cals: any[]): Record<string, number | null> => {
    const notasInd = notasIndicadorDe(cals);
    const suma: Record<string, number> = {}, pesoUsado: Record<string, number> = {};
    Object.entries(notasInd).forEach(([id_indicador, n_ind]) => {
      if (n_ind === null) return;
      const ce_id = ceOfIndicador[id_indicador];
      const r_id = ce_id ? ra_of_ce[ce_id] : undefined;
      if (!r_id) return;
      const peso = pesoIndicador[id_indicador] || 0;
      suma[r_id] = (suma[r_id] || 0) + n_ind * peso;
      pesoUsado[r_id] = (pesoUsado[r_id] || 0) + peso;
    });
    const out: Record<string, number | null> = {};
    all_ra_ids.forEach((r_id) => {
      out[r_id] = pesoUsado[r_id] > 0 ? redondear(suma[r_id] / pesoUsado[r_id], config) : null;
    });
    return out;
  };

  const notas_ra_recuperacion = notasRaDirectas(porProcedimiento("recuperacion"));
  const notas_ra: Record<string, number | null> = {};
  all_ra_ids.forEach((r_id) => {
    notas_ra[r_id] = notas_ra_recuperacion[r_id] !== null ? notas_ra_recuperacion[r_id] : notas_ra_ordinario[r_id];
  });
  const nota_final = notaFinalPonderada(notas_ra, peso_ra, config);

  const notas_ra_evfe = notasRaDirectas(porProcedimiento("extraordinaria"));
  const notas_ra_extraordinaria: Record<string, number | null> = {};
  all_ra_ids.forEach((r_id) => {
    notas_ra_extraordinaria[r_id] = notas_ra_evfe[r_id] !== null ? notas_ra_evfe[r_id] : notas_ra[r_id];
  });
  const nota_final_extraordinaria = notaFinalPonderada(notas_ra_extraordinaria, peso_ra, config);

  return { notas_indicador, notas_ce, notas_ra_ordinario, notas_ra, nota_final, notas_ra_extraordinaria, nota_final_extraordinaria };
}

/** Nota numérica -> nivel SIGAD (IN/SU/BI/NT/SB) con color. null = sin evaluar. */
export function getSigadInfo(nota: number | null): SigadInfo & { sinEvaluar: boolean } {
  if (nota === null) {
    return { n: 0, cod: "-", txt: "Sin evaluar", col: "#6b7280", sinEvaluar: true };
  }
  let n = nota < 5 ? Math.floor(nota) : Math.floor(nota + 0.5);
  n = Math.max(1, Math.min(10, n));
  if (nota < 5) return { n, cod: "IN", txt: "Insuficiente", col: "#e74c3c", sinEvaluar: false };
  if (nota < 6) return { n, cod: "SU", txt: "Suficiente", col: "#e67e22", sinEvaluar: false };
  if (nota < 7) return { n, cod: "BI", txt: "Bien", col: "#3498db", sinEvaluar: false };
  if (nota < 9) return { n, cod: "NT", txt: "Notable", col: "#2ecc71", sinEvaluar: false };
  return { n, cod: "SB", txt: "Sobresaliente", col: "#1abc9c", sinEvaluar: false };
}
