// Motor de calificación de Cuaderno FP: Motor JEG (Instrumento -> Indicador
// -> CE -> RA -> módulo), el único motor de la app desde el 2026-09-10 (Ítem
// 42 punto 6) — el motor anterior más simple (Motor A: instrumento -> CE ->
// RA -> módulo, sin Indicador intermedio) se retiró del todo en esa misma
// fecha (Fase 5), sin consumidores activos desde antes.
//
// Decisión A (Fase 2, RF Ideas/propuesta-motor-calificacion-2026-08-16.md,
// heredada de Motor A y todavía vigente en JEG): un CE sin ninguna
// calificación se EXCLUYE del denominador ponderado de su RA, en vez de
// contar como 0 — antes, un CE sin trabajar bajaba la nota del RA
// artificialmente porque sumaba con su peso completo pero valor 0. Un RA sin
// ningún CE calificado se marca `null` ("sin evaluar"), igual que un módulo
// sin ningún RA calificado. La misma exclusión se aplica al pasar de RA a
// nota final del módulo.

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

export interface SigadInfo {
  n: number;
  cod: string;
  txt: string;
  col: string;
}

// ---------------------------------------------------------------------------
// Motor JEG (Instrumento -> Indicador -> CE -> RA -> Módulo), decisión D de la
// Fase 2. El "modo automático" (sincronizarIndicadorAuto()/setCalificacionAuto(),
// más abajo) crea y gestiona Instrumento/Indicador solo al marcar una casilla
// Actividad×CE, para que el gesto del profesor sea igual de simple que un
// checkbox. Usa el esquema ya existente (IndicadorSchema/InstrumentoSchema/
// CalificacionSchema en types/index.ts).
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
  // Tope de compensables (Decisión B de Motor A, trasladada — Ítem 42 punto 6):
  // true si el alumno tiene más CE suspensos que max_compensables en ese RA por
  // la vía ordinaria, aunque la media ponderada saliera aprobada. Solo aplica a
  // la vía ordinaria (con CE) -- recuperación/extraordinaria saltan el CE, no
  // hay nada que "compensar" ahí.
  ra_tope_activo: Record<string, boolean>;
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
  const failedCesByRa: Record<string, number> = {};
  Object.entries(notas_ce).forEach(([ce_id, n_ce]) => {
    if (n_ce === null) return;
    const r_id = ra_of_ce[ce_id];
    if (!r_id) return;
    sumaPonderadaRaOrd[r_id] = (sumaPonderadaRaOrd[r_id] || 0) + n_ce * peso_ce[ce_id];
    pesoUsadoRaOrd[r_id] = (pesoUsadoRaOrd[r_id] || 0) + peso_ce[ce_id];
    if (n_ce < config.nota_aprobado) {
      failedCesByRa[r_id] = (failedCesByRa[r_id] || 0) + 1;
    }
  });

  const notas_ra_ordinario: Record<string, number | null> = {};
  const ra_tope_activo: Record<string, boolean> = {};
  all_ra_ids.forEach((r_id) => {
    const pesoUsado = pesoUsadoRaOrd[r_id] || 0;
    if (pesoUsado <= 0) {
      notas_ra_ordinario[r_id] = null;
      ra_tope_activo[r_id] = false;
      return;
    }
    let n_ra = redondear(sumaPonderadaRaOrd[r_id] / pesoUsado, config);
    const topeActivo = (failedCesByRa[r_id] || 0) > config.max_compensables && n_ra >= config.nota_aprobado;
    if (topeActivo) n_ra = config.nota_aprobado - 0.1;
    notas_ra_ordinario[r_id] = n_ra;
    ra_tope_activo[r_id] = topeActivo;
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

  return { notas_indicador, notas_ce, notas_ra_ordinario, notas_ra, nota_final, notas_ra_extraordinaria, nota_final_extraordinaria, ra_tope_activo };
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

/**
 * Reparte `total` (100 por defecto) a partes iguales entre `count` elementos,
 * en números enteros, cargando el resto de redondeo en los primeros
 * elementos en vez de dejarlo caer en decimales (ej. 3 elementos de 100 ->
 * [34, 33, 33], no [33.33, 33.33, 33.33]). Extraído del reparto de peso_ce
 * ya usado en curriculo/page.tsx (alta/baja de CE) para poder reutilizarlo
 * también en el reparto de Indicador.peso del Motor JEG (Ítem 42, punto 3).
 */
export function repartoIgualitario(count: number, total: number = 100): number[] {
  if (count <= 0) return [];
  const baseShare = Math.floor(total / count);
  let rem = total - baseShare * count;
  return Array.from({ length: count }, () => {
    const share = baseShare + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
    return share;
  });
}

// Relevancia de CE (inspirado en el "Nivel" de CONF_CE/CONF_EV de Edo Gual,
// pero con una escala relativa a un punto neutro en vez de una escala
// absoluta 1/2/3): en vez de escribir un % a mano por CE, cada uno parte de
// "normal" (=, peso 1) salvo que se marque explícitamente "menos" (-, la
// mitad) o "mas" (+, el doble). Un CE sin relevancia asignada cuenta como
// "normal": así, cuando ningún CE de un RA tiene relevancia marcada, el
// reparto sale exactamente igual que repartoIgualitario() -- mismo
// comportamiento por defecto que hoy.
export const PESO_RELEVANCIA_CE: Record<string, number> = {
  menos: 0.5,
  normal: 1,
  mas: 2,
};

/**
 * Reparte `total` proporcionalmente a los `pesos` dados (en vez de a partes
 * iguales como repartoIgualitario), en números enteros que suman
 * exactamente `total` -- redondeo hacia abajo por defecto, repartiendo el
 * resto entre los que tenían la parte decimal más alta (método del resto
 * mayor), para no acumular todo el redondeo en los primeros elementos.
 */
export function repartoPonderado(pesos: number[], total: number = 100): number[] {
  if (pesos.length === 0) return [];
  const sumaPesos = pesos.reduce((a, b) => a + b, 0);
  if (sumaPesos <= 0) return repartoIgualitario(pesos.length, total);

  const raw = pesos.map((p) => (p / sumaPesos) * total);
  const floors = raw.map((r) => Math.floor(r));
  const resto = Math.round(total - floors.reduce((a, b) => a + b, 0));
  const ordenPorResto = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (let k = 0; k < resto && k < ordenPorResto.length; k++) {
    result[ordenPorResto[k].i]++;
  }
  return result;
}

// Grupos de evaluación (GEv, modelo de Edo Gual): subgrupos de alumnado a
// efectos de evaluación -- pedido explícito de Rafael, tipificados con estos
// 3 nombres literales (respeta las mayúsculas/minúsculas tal cual las dio).
// "general" es el grupo implícito de cualquier alumno/instrumento sin GEv
// asignado, así que un módulo sin usar esta función se comporta exactamente
// igual que antes.
export const GEV_DEFECTO = "general";
export const GRUPOS_EVALUACION_DEFECTO: { id: string; nombre: string }[] = [
  { id: "general", nombre: "General" },
  { id: "pdevcontinua", nombre: "PDEvContinua" },
  { id: "recuperacion", nombre: "Recuperación" },
];

/**
 * Filtra `df_calificaciones` a solo las de instrumentos cuyo GEv coincide
 * con el del alumno (ambos "general" si no tienen GEv asignado). Se envuelve
 * aquí, en vez de tocar calcularNotasJEG(), para no cambiar su firma en los
 * ~10 sitios que ya la llaman -- basta con pasarle el resultado de esta
 * función en el parámetro `df_calificaciones` de siempre.
 */
export function filtrarPorGev(df_calificaciones: any[], df_instr: any[], alumnoGev?: string | null): any[] {
  const gev = alumnoGev || GEV_DEFECTO;
  const gevPorInstr: Record<string, string> = {};
  df_instr.forEach((i: any) => { gevPorInstr[i.id_instrumento] = i.gev || GEV_DEFECTO; });
  return df_calificaciones.filter((c: any) => (gevPorInstr[c.id_instrumento] || GEV_DEFECTO) === gev);
}

const TRI_A_EVALUACION: Record<string, string> = { "1T": "Ev1", "2T": "Ev2", "3T": "Ev3" };

/**
 * "Modo automático" del Motor JEG (Ítem 42, punto 6): reproduce el gesto de
 * Motor A -- marcar la casilla "esta actividad evalúa este CE" en
 * `instrumentos/page.tsx` -- creando/gestionando por debajo el Instrumento y
 * el Indicador que hacen falta para que `calcularNotasJEG()` pueda calcular,
 * sin que el profesor tenga que crearlos a mano.
 *
 * Una Actividad ES un Instrumento (mismo `id_instrumento === act.id_act`, 1:1
 * por construcción). Cada (Actividad, CE) vinculado tiene un único Indicador
 * automático (`${id_act}-${ce_id}`), con el peso repartido igual entre todos
 * los indicadores de ese CE vía `repartoIgualitario()` -- la misma función
 * que ya reparte `peso_ce`/`peso_ra`. Con peso igual entre todos, la media
 * ponderada de `calcularNotasJEG()` es matemáticamente una media simple:
 * mismo resultado que Motor A hoy, sin que el profesor configure nada.
 *
 * Quien quiera el control fino (indicadores con peso distinto, varios por
 * CE) sigue pudiendo entrar en `JegModeloTab.tsx` y ajustarlo a mano -- este
 * modo automático es solo el punto de partida por defecto.
 */
export function sincronizarIndicadorAuto(
  act: any,
  ce_id: string,
  activo: boolean,
  df_instr: any[],
  df_indicadores: any[]
): { df_instr: any[]; df_indicadores: any[] } {
  const id_instrumento = act.id_act;
  let nextInstr = [...df_instr];
  let nextInd = [...df_indicadores];

  let instrIdx = nextInstr.findIndex((i) => i.id_instrumento === id_instrumento);
  if (instrIdx === -1) {
    nextInstr.push({
      id_instrumento,
      titulo: act.desc_act || id_instrumento,
      tipo: "rubrica",
      escala: "continua_10",
      evaluacion: TRI_A_EVALUACION[act.tri_act] || "Ev1",
      agente: "heteroevaluacion",
      peso_global: 1,
      indicadores_vinculados: [],
      origen: "centro",
      procedimiento: "ordinario",
    });
    instrIdx = nextInstr.length - 1;
  }

  const id_indicador = `${id_instrumento}-${ce_id}`;

  if (activo) {
    if (!nextInd.some((i) => i.id_indicador === id_indicador)) {
      nextInd.push({ id_indicador, id_ce: ce_id, descripcion: act.desc_act || "", peso: 0, is_basico: false });
    }
    const vinculados = new Set<string>(nextInstr[instrIdx].indicadores_vinculados || []);
    vinculados.add(id_indicador);
    nextInstr[instrIdx] = { ...nextInstr[instrIdx], indicadores_vinculados: Array.from(vinculados) };
  } else {
    nextInd = nextInd.filter((i) => i.id_indicador !== id_indicador);
    const vinculados = (nextInstr[instrIdx].indicadores_vinculados || []).filter((id: string) => id !== id_indicador);
    nextInstr[instrIdx] = { ...nextInstr[instrIdx], indicadores_vinculados: vinculados };
  }

  // Reparto igualitario entre todos los indicadores que queden en este CE
  // (los de esta actividad y los de cualquier otra que también lo evalúe).
  const indsDelCe = nextInd.filter((i) => i.id_ce === ce_id);
  const shares = repartoIgualitario(indsDelCe.length);
  const pesoPorId: Record<string, number> = {};
  indsDelCe.forEach((ind, idx) => { pesoPorId[ind.id_indicador] = shares[idx]; });
  nextInd = nextInd.map((i) => (i.id_ce === ce_id ? { ...i, peso: pesoPorId[i.id_indicador] } : i));

  return { df_instr: nextInstr, df_indicadores: nextInd };
}

/** Crea/actualiza/borra una fila de `df_calificaciones` para un (alumno,
 * instrumento, indicador) -- usado por el modo automático para replicar la
 * nota de una actividad en cada Indicador auto-generado que le corresponda. */
export function setCalificacionAuto(
  df_calificaciones: any[],
  id_alumno: string,
  id_instrumento: string,
  id_indicador: string,
  valor: number | null
): any[] {
  const idx = df_calificaciones.findIndex(
    (c) => c.id_alumno === id_alumno && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador
  );
  const next = [...df_calificaciones];
  if (valor === null || isNaN(valor)) {
    if (idx >= 0) next.splice(idx, 1);
    return next;
  }
  const row = {
    id_calificacion: idx >= 0 ? next[idx].id_calificacion : `${id_alumno}-${id_instrumento}-${id_indicador}`,
    id_alumno, id_instrumento, id_indicador, valor,
    // Cuándo se puso/tocó esta nota por última vez -- lo lee el Expediente
    // del alumnado (línea temporal de evidencias); antes no se rellenaba.
    timestamp: Date.now(),
  };
  if (idx >= 0) next[idx] = row; else next.push(row);
  return next;
}
