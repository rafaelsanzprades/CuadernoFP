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
  /** Calificación mínima que debe alcanzar cada RA para poder compensarse con los demás (en Aragón, entre 3 y 5, la fija el
   *  proyecto curricular: art. 99.4.g y 100.2.h del Decreto 91/2024). Vacío = sin mínimo. Si algún RA queda por debajo, el módulo
   *  no puede superarse. Mismo cálculo en backend/helpers_catalogo.py::calcular_notas_jeg. */
  nota_minima_ra?: number | null;
  /** Decimales de la nota que se guarda en el acta (Nota_Final_FO): 0 = entera, de 1 a 10 (lo que fija la norma en casi todas las
   *  comunidades; RD 659/2023, art. 18.8); 1 = un decimal (el centro lo admite). El cálculo interno conserva toda su precisión.
   *  Vacío = 0. Mismo criterio en backend/helpers_catalogo.py::nota_acta. */
  decimales_acta?: 0 | 1;
  /** Cómo se pasa a entera la nota del acta (solo con decimales_acta = 0): «conservador» trunca por debajo de nota_aprobado y,
   *  desde ahí, redondea al entero más próximo (nunca aprueba por redondeo); «cercano» al entero más próximo, la mitad sube;
   *  «abajo» y «arriba» son el suelo y el techo. Vacío = «conservador». */
  redondeo_acta?: "conservador" | "cercano" | "abajo" | "arriba";
  /** Perfil de comunidad elegido (ver PERFILES_COMUNIDAD); vacío = ninguno, configuración manual. Es solo una ayuda: rellena los valores
   *  de esta configuración, que luego se pueden cambiar. */
  perfil_comunidad?: string;
  /** Cómo registra el profesor la valoración del tutor de empresa (utils/tutorEmpresa.ts): «escala_1_4» = el tutor valora de 1 a 4 cada
   *  criterio designado y el resultado de cada RA («superado» con una media mayor que 2) se deduce; «superado» = se registra para cada RA
   *  «Superado» o «No superado», con su motivación. Las normas estudiadas (RD 659/2023, art. 18.7.a) piden lo segundo. Vacío = «escala_1_4». */
  tutor_empresa_modo?: "escala_1_4" | "superado";
  /** Regla para superar el módulo además de la media: «media» (por defecto) = basta la nota ponderada; «todos_ra» = hay que superar cada
   *  RA evaluado; «imprescindibles» = hay que superar los RA marcados como imprescindibles (`imprescindible` en df_ra, Currículo). Un RA
   *  sin evaluar no bloquea (igual que nota_minima_ra). Mismo cálculo en backend/helpers_catalogo.py::calcular_notas_jeg. */
  regla_superacion?: "media" | "todos_ra" | "imprescindibles";
  /** Convocatorias máximas por módulo antes de avisar al docente (utils/estadosActa.ts::convocatoriasUsadas). Vacío = 4. */
  max_convocatorias?: number | null;
  /** Grado de la oferta: «D» (4 convocatorias como máximo) o «E» (2). Solo se usa si `max_convocatorias` está vacío. Vacío = «D». */
  grado_oferta?: "D" | "E";
  /** Porcentaje de faltas de asistencia a partir del cual el alumnado pierde la evaluación continua en un módulo (lo fija la norma de
   *  la comunidad; ver PerfilComunidad.asistencia). Vacío = sin umbral normativo (la alerta de abandono usa sus umbrales generales). */
  asistencia_perdida_pct?: number | null;
  /** Porcentaje de faltas en el que el profesorado debe avisar al tutor (solo algunas comunidades). Vacío = sin aviso previo. */
  asistencia_aviso_pct?: number | null;
}

export const DEFAULT_CONFIG_REDONDEO: ConfigRedondeo = {
  nota_aprobado: 5.0,
  umbral_redondeo: 5.0,
  max_compensables: 0,
  decimales_acta: 0,
  redondeo_acta: "conservador",
  tutor_empresa_modo: "escala_1_4",
  regla_superacion: "media",
};

/**
 * Nota que se traslada al acta a partir de la nota calculada (que conserva toda su precisión). null = sin evaluar.
 * Con `decimales_acta` = 1, un decimal (como hasta ahora); si no, entera de 1 a 10 con la regla de `redondeo_acta`.
 * Mismo cálculo en backend/helpers_catalogo.py::nota_acta.
 */
export function notaActa(nota: number | null, config: ConfigRedondeo = DEFAULT_CONFIG_REDONDEO): number | null {
  if (nota === null || nota === undefined || Number.isNaN(nota)) return null;
  if (config.decimales_acta === 1) return Number(nota.toFixed(1));
  const aprobado = config.nota_aprobado ?? DEFAULT_CONFIG_REDONDEO.nota_aprobado;
  let n: number;
  switch (config.redondeo_acta) {
    case "cercano": n = Math.floor(nota + 0.5); break;
    case "abajo": n = Math.floor(nota); break;
    case "arriba": n = Math.ceil(nota); break;
    default: n = nota < aprobado ? Math.floor(nota) : Math.floor(nota + 0.5); // conservador
  }
  return Math.max(1, Math.min(10, n));
}

/** Perfiles de comunidad: ayudas opcionales que rellenan la configuración con lo que fija la norma. De momento recogen la nota del módulo
 *  (numérica, de 1 a 10, sin decimales, positiva desde 5) y cómo se registra la valoración del tutor de empresa, en las tres comunidades con
 *  la norma leída entera (estudio de la ley, contenidos/estudio-ley-fp/ccaa/). Ninguna fija el método de redondeo, así que todos usan
 *  «conservador», que nunca aprueba por redondeo; el docente puede cambiarlo. Las tres piden que el tutor de empresa dé cada RA por
 *  «Superado» o «No superado»; Aragón conserva además la escala de 1 a 4 por criterio que ya usaba la app. Los demás datos de cada comunidad
 *  (horas de formación en empresa, asistencia…) se irán sumando aquí. */
export interface PerfilComunidad {
  id: string;
  nombre: string;
  fuente: string;
  config: Partial<ConfigRedondeo>;
  /** Horas de formación en empresa (FEOE) del régimen general que la norma reparte por curso en grados medio y superior. Solo se
   *  rellena cuando la norma fija las cifras (no rangos). Sirve de valor por defecto en Módulo › Datos. */
  feoe?: { horas_1?: number; horas_2?: number; fuente: string; texto: string;
    /** Grado básico (ciclos de 2.000 h): horas por curso y texto propio. Sin él se usa el valor general (400 h, el 20 %, todas en 2.º). */
    basico?: { horas_1?: number; horas_2?: number; texto: string };
    /** Grado superior, solo si la comunidad fija cifras distintas de las de grado medio (Castilla y León: 90 h en 1.º en medio y 180 h en superior). */
    superior?: { horas_1?: number; horas_2?: number; texto: string } };
  /** Pérdida de la evaluación continua por asistencia, en grados medio y superior presencial: porcentajes de faltas y fuente. */
  asistencia?: { perdida_pct: number; aviso_pct?: number; fuente: string; nota?: string };
}

/** Grado básico sin cifras propias del perfil: el 20 % de 2.000 h (400 h), todas en 2.º (lo habitual; Asturias las reparte 200 + 200). */
export const FEOE_BASICO_GENERAL = { horas_1: 0, horas_2: 400, texto: "Valor orientativo: el 20 % de la duración del ciclo (400 h), todas en 2.º. Algunas comunidades las reparten entre los dos cursos." };

/** Horas FEOE por defecto de 1.º y 2.º: las del perfil si la norma las fija; si no, las de Aragón que usaba la app (140 y 360). */
export function horasFeoePorDefecto(perfilId: string | undefined, curso: string | undefined, nivel?: string): number {
  const f = PERFILES_COMUNIDAD.find((p) => p.id === perfilId)?.feoe;
  if (nivel === "Grado Básico") {
    const b = f?.basico ?? FEOE_BASICO_GENERAL;
    return curso === "2º" ? (b.horas_2 ?? FEOE_BASICO_GENERAL.horas_2) : (b.horas_1 ?? FEOE_BASICO_GENERAL.horas_1);
  }
  const base = PERFILES_COMUNIDAD[0].feoe!;
  const sup = nivel === "Grado Superior" ? f?.superior : undefined;
  const h1 = sup?.horas_1 ?? f?.horas_1 ?? base.horas_1!;
  const h2 = sup?.horas_2 ?? f?.horas_2 ?? base.horas_2!;
  return curso === "2º" ? h2 : h1;
}

/** Aviso por faltas según la norma elegida: «perdida» al superar el umbral, «aviso» al alcanzar el de aviso; null si no hay umbral o no se llega. */
export function nivelAsistenciaNormativo(pctFaltas: number, config: Pick<ConfigRedondeo, "asistencia_perdida_pct" | "asistencia_aviso_pct">): "perdida" | "aviso" | null {
  const { asistencia_perdida_pct: perdida, asistencia_aviso_pct: aviso } = config;
  if (perdida != null && pctFaltas > perdida) return "perdida";
  if (aviso != null && pctFaltas >= aviso) return "aviso";
  return null;
}

const CONFIG_NOTA_ENTERA: Partial<ConfigRedondeo> = { nota_aprobado: 5.0, decimales_acta: 0, redondeo_acta: "conservador" };

export const PERFILES_COMUNIDAD: PerfilComunidad[] = [
  { id: "aragon", nombre: "Aragón", fuente: "Decreto 91/2024 (consolidado con el Decreto 107/2025)", config: { ...CONFIG_NOTA_ENTERA, tutor_empresa_modo: "escala_1_4" },
    feoe: { horas_1: 140, horas_2: 360, fuente: "Decreto 91/2024, art. 56",
      texto: "Dato exacto de la norma: 500 horas en régimen general, en dos periodos (140 h en 1.º y 360 h en 2.º). Si no hay plazas en empresas, previo informe de Inspección y con autorización, se pueden acumular en 2.º (500 h, desde marzo). Turno nocturno o ciclos de tres cursos: 100 h + 100 h + 300 h.",
      basico: { horas_1: 0, horas_2: 400, texto: "Dato exacto de la norma: 400 h, todas en 2.º (entre marzo y mayo), sin repartir con 1.º." } } },
  { id: "andalucia", nombre: "Andalucía", fuente: "Orden de evaluación de 18 de septiembre de 2025", config: { ...CONFIG_NOTA_ENTERA, tutor_empresa_modo: "superado", asistencia_perdida_pct: 20 },
    feoe: { fuente: "Decreto 147/2025, art. 12",
      texto: "Es un intervalo, no una cifra: la norma fija entre el 25 y el 35 % de la duración de la oferta en régimen general (entre el 35 y el 50 % en intensivo), con el 10-20 % de los RA, y no reparte las horas por curso. Escribe en la casilla las horas que decida tu centro." },
    asistencia: { perdida_pct: 20, fuente: "Decreto 147/2025, art. 27.5, y Orden de evaluación de 18-09-2025", nota: "La evaluación continua exige asistir al menos al 80 % de la duración total del módulo, ámbito o proyecto, contando el centro y la formación en empresa; la app cuenta las sesiones registradas." } },
  { id: "asturias", nombre: "Asturias", fuente: "Decreto 103/2025, de 25 de agosto", config: { ...CONFIG_NOTA_ENTERA, tutor_empresa_modo: "superado" },
    feoe: { horas_1: 120, horas_2: 380, fuente: "Decreto 103/2025, art. 12",
      texto: "Dato exacto de la norma: 500 horas en régimen general, en dos periodos (120 h en 1.º y 380 h en 2.º). En régimen intensivo son 700 (250 h + 450 h).",
      basico: { horas_1: 200, horas_2: 200, texto: "Dato exacto de la norma: 400 h (el 20 %), en dos periodos de 200 h, uno en 1.º y otro en 2.º (no todo en 2.º)." } } },
  { id: "canarias", nombre: "Canarias", fuente: "Resolución de 5 de noviembre de 2024 (BOC n.º 230, 18-11-2024), apartado 4", config: {},
    feoe: { fuente: "Resolución de 5-11-2024 (BOC 230), apartado 4.3",
      texto: "Es un intervalo, no una cifra: en grados medio y superior entre el 25 y el 35 % de la duración (500 a 700 h), con el 10-20 % de los RA, repartidas en dos cursos; en 1.º entre 100 y 200 h (mínimo 20 jornadas) y el resto en 2.º. Escribe en la casilla las horas que decida tu centro.",
      basico: { horas_1: 0, horas_2: 400, texto: "Dato exacto de la norma: el 20 % de la duración (400 h), acumuladas en 2.º." } } },
  { id: "galicia", nombre: "Galicia", fuente: "Decreto 20/2026, de 9 de marzo (art. 7)", config: {},
    feoe: { fuente: "Decreto 20/2026, art. 7.4",
      texto: "Es un intervalo, no una cifra: en grados medio y superior entre el 25 y el 35 % de la duración (en intensivo, del 35 al 50 %), con el 10-20 % de los RA, y sin reparto por curso. Escribe en la casilla las horas que decida tu centro.",
      basico: { texto: "Es un intervalo: entre el 20 y el 35 % de la duración del ciclo, sin reparto por curso en el decreto. Valor orientativo: 400 h (el 20 %), en 2.º." } } },
  { id: "ceuta-melilla", nombre: "Ceuta y Melilla (gestión del Ministerio)", fuente: "Órdenes EFD/657/2024 y EFD/659/2024 (art. 13)", config: {},
    feoe: { horas_1: 120, horas_2: 380, fuente: "Órdenes EFD/657/2024 (grado medio) y EFD/659/2024 (superior), art. 13.5 y 13.6",
      texto: "El total es exacto (500 h en régimen general; 700 h en intensivo, con 335 h en 1.º y 365 h en 2.º), pero el reparto es un intervalo: en general, de 120 a 240 h en 1.º y de 260 a 380 h en 2.º. La casilla propone el mínimo de 1.º y el máximo de 2.º (120 + 380); escribe las horas de tu centro." } },
  { id: "la-rioja", nombre: "La Rioja", fuente: "Resolución 25/2026, de 16 de julio (BOR 137, 21-07-2026)", config: {},
    feoe: { horas_1: 100, horas_2: 400, fuente: "Resolución 25/2026, instrucción tercera.1.a (BOR 137, 21-07-2026)",
      texto: "El total es un mínimo exacto (500 h, el 25 % de 2.000 h, en régimen general), pero el reparto es un intervalo: en 1.º entre el 20 y el 35 % del total de la formación en empresa (de 100 a 175 h) y en 2.º el resto. La casilla propone el mínimo de 1.º y el resto hasta 500 h en 2.º (100 + 400); si tu centro prevé más del 25 %, hay que comunicarlo a la Dirección General. Escribe las horas de tu centro.",
      basico: { horas_1: 0, horas_2: 400, texto: "Dato exacto de la norma: el 20 % de la duración (400 h), íntegramente en 2.º (en el Centro de Educación para Personas Adultas se hace en dos periodos)." } } },
  { id: "castilla-y-leon", nombre: "Castilla y León", fuente: "Decretos 24/2024 y 25/2024 (art. 7) y Orden EDU/173/2025", config: {},
    feoe: { horas_1: 90, horas_2: 415, fuente: "Decreto 25/2024, art. 7.2 (grado medio) y Decreto 24/2024, art. 7.2 (grado superior)",
      texto: "Grado medio: el total es un intervalo (de 505 a 645 h en régimen general), pero 1.º está fijado en 90 h y 2.º va de 415 a 555 h; la casilla propone el mínimo (90 + 415). Si el ciclo se organiza en dos cursos y no hay empresas suficientes en la zona, la norma exceptúa este reparto. Escribe las horas de tu centro.",
      superior: { horas_1: 180, horas_2: 385,
        texto: "Grado superior: el total es un intervalo (de 565 a 695 h en régimen general), pero 1.º está fijado en 180 h y 2.º va de 385 a 515 h; la casilla propone el mínimo (180 + 385). En ciclos de tres cursos se añaden 150 h en 3.º (de 715 a 845 h en total). Escribe las horas de tu centro." } } },
  { id: "madrid", nombre: "Comunidad de Madrid", fuente: "Decreto 21/2025, de 21 de mayo (BOCM 121, 22-05-2025) e instrucciones de ordenación 2025-26", config: {},
    feoe: { horas_1: 60, horas_2: 440, fuente: "Decreto 21/2025 (régimen general) e instrucciones de ordenación del curso 2025-26",
      texto: "El total es exacto en proporción: el 25 % de la duración del plan de estudios en régimen general (500 h en un ciclo de 2.000 h; entre el 35 y el 50 % en intensivo). El decreto no reparte las horas por curso; las instrucciones del curso 2025-26 piden al menos 60 h en 1.º, a partir del segundo trimestre. La casilla propone 60 + 440; escribe las horas de tu centro.",
      basico: { horas_1: 0, horas_2: 400, texto: "Dato exacto de la norma: el 20 % de la duración (400 h) en régimen general. El decreto no las reparte por curso: valor orientativo, todas en 2.º." } } },
  { id: "extremadura", nombre: "Extremadura", fuente: "Instrucciones 12/2024 (grado medio) y 13/2024 (grado superior) de la Dirección General de FP", config: {},
    feoe: { fuente: "Instrucciones 12/2024 y 13/2024 (cita el RD 659/2023)",
      texto: "Es un intervalo, no una cifra: entre el 25 y el 35 % de la duración total del currículo en régimen general, con el 10-20 % de los RA; dentro de ese rango cada centro fija el porcentaje, y no hay reparto por curso. Escribe en la casilla las horas que decida tu centro." } },
  // Perfiles solo de asistencia (sin nota ni tutor: su norma de evaluación no se ha leído entera para la app). Faltas contadas sobre las sesiones registradas.
  { id: "valencia", nombre: "Comunitat Valenciana", fuente: "Orden 8/2025, de 22 de abril (art. 7)", config: { asistencia_perdida_pct: 15, asistencia_aviso_pct: 10 },
    asistencia: { perdida_pct: 15, aviso_pct: 10, fuente: "Orden 8/2025, art. 7.3 y 7.4", nota: "Se pierde la evaluación continua al superar el 15 % de inasistencia; al 10 % el profesorado avisa al tutor." } },
  { id: "castilla-la-mancha", nombre: "Castilla-La Mancha", fuente: "Orden 201/2024, de 28 de noviembre (art. 3)", config: { asistencia_perdida_pct: 25 },
    asistencia: { perdida_pct: 25, fuente: "Orden 201/2024, art. 3.3 y 3.5", nota: "Exige asistir al menos al 75 % de las horas del módulo (presencial); las faltas justificadas no cuentan y la app no las distingue." } },
  { id: "baleares", nombre: "Illes Balears", fuente: "Orden 19/2026, de 3 de julio (art. 25)", config: { asistencia_perdida_pct: 25 },
    feoe: { fuente: "Decreto 39/2025, arts. 12 y 13",
      texto: "Es un intervalo, no una cifra: entre el 25 y el 35 % de la duración total en régimen general (entre el 35 y el 50 % en intensivo), con el 10-20 % de los RA, y sin reparto por curso. Escribe en la casilla las horas que decida tu centro." },
    asistencia: { perdida_pct: 25, fuente: "Orden 19/2026, art. 25.2 y 25.3", nota: "Asistencia mínima del 75 % de las horas de cada módulo (grados C, D y E presencial), condición de la evaluación continua." } },
  { id: "murcia", nombre: "Región de Murcia", fuente: "Orden de 28 de julio de 2026 (art. 4.3)", config: { asistencia_perdida_pct: 30 },
    asistencia: { perdida_pct: 30, fuente: "Orden de 28-07-2026, art. 4.3", nota: "Se pierde con más del 30 % de faltas, justificadas o no, sobre las horas de la fase de centro del módulo." } },
];

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

function notaFinalPonderada(notas_ra: Record<string, number | null>, peso_ra: Record<string, number>, config: ConfigRedondeo, imprescindibles: Set<string> = new Set()): number | null {
  let suma = 0, pesoUsado = 0;
  Object.entries(notas_ra).forEach(([r_id, n_ra]) => {
    if (n_ra === null) return;
    suma += n_ra * (peso_ra[r_id] || 0);
    pesoUsado += peso_ra[r_id] || 0;
  });
  if (pesoUsado <= 0) return null;
  const nota = redondear(suma / pesoUsado, config);
  // Mínimo por RA para compensar: un RA por debajo no se compensa con los demás y el módulo queda suspenso
  const min = config.nota_minima_ra;
  if (min != null && Object.values(notas_ra).some((n) => n !== null && n < min)) return Math.min(nota, config.nota_aprobado - 0.1);
  // Regla de superación: con «todos_ra» o «imprescindibles», un RA exigido por debajo del aprobado impide aprobar el módulo aunque la media llegue
  const regla = config.regla_superacion;
  if (regla === "todos_ra" || regla === "imprescindibles") {
    const exigido = (r_id: string) => regla === "todos_ra" || imprescindibles.has(r_id);
    if (Object.entries(notas_ra).some(([r_id, n]) => n !== null && exigido(r_id) && n < config.nota_aprobado)) return Math.min(nota, config.nota_aprobado - 0.1);
  }
  return nota;
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
  const imprescindibles = new Set<string>(df_ra.filter((ra: any) => ra.id_ra && ra.imprescindible === true).map((ra: any) => ra.id_ra));

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
  const nota_final = notaFinalPonderada(notas_ra, peso_ra, config, imprescindibles);

  const notas_ra_evfe = notasRaDirectas(porProcedimiento("extraordinaria"));
  const notas_ra_extraordinaria: Record<string, number | null> = {};
  all_ra_ids.forEach((r_id) => {
    notas_ra_extraordinaria[r_id] = notas_ra_evfe[r_id] !== null ? notas_ra_evfe[r_id] : notas_ra[r_id];
  });
  const nota_final_extraordinaria = notaFinalPonderada(notas_ra_extraordinaria, peso_ra, config, imprescindibles);

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
