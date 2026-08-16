// Semilla por defecto de "% Instrumentos de evaluación" por trimestre.
// Única fuente — antes vivía duplicada (y desincronizada) en DatosTab.tsx,
// app/instrumentos/page.tsx y app/calificaciones/page.tsx: las dos últimas
// copias no tenían `categoria`, así que el Tipo de todas las filas caía
// siempre en el valor por defecto "Teoría" en la tabla resumen de
// /instrumentos (bug real, detectado por Rafael el 2026-08-16).
export const DEFAULT_INSTRUMENTOS_PCT = [
  { id: "instr_teoricos", categoria: "Teoría", nombre: "Exámenes teóricos", pct_1t: 30, pct_2t: 20, pct_3t: 10 },
  { id: "instr_practicos", categoria: "Práctica", nombre: "Exámenes prácticos", pct_1t: 20, pct_2t: 20, pct_3t: 10 },
  { id: "instr_exposicion", categoria: "Proyecto", nombre: "Exposición y defensa proyecto", pct_1t: 10, pct_2t: 20, pct_3t: 30 },
  { id: "instr_informes", categoria: "Ejercicios", nombre: "Informes de ejercicios", pct_1t: 20, pct_2t: 30, pct_3t: 40 },
  { id: "instr_cuaderno", categoria: "Tareas", nombre: "Cuaderno de tareas", pct_1t: 20, pct_2t: 10, pct_3t: 10 },
  { id: "instr_recup", categoria: "Recuperaciones", nombre: "Recuperaciones", pct_1t: 0, pct_2t: 0, pct_3t: 0 },
];
