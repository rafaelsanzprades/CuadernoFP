export interface InstrumentoEvaluacion {
  id: string;
  label: string;
}

/** Instrumento de evaluación: la actividad que genera la evidencia (qué hace
 * el alumnado). Distinto del instrumento de calificación (INSTRUMENTOS_CALIFICACION),
 * que es lo que puntúa esa evidencia — ver FAQ "instrumento de evaluación vs. calificación". */
export const INSTRUMENTOS_EVALUACION: InstrumentoEvaluacion[] = [
  { id: "PRU-OBJ", label: "Prueba objetiva escrita" },
  { id: "PRU-EJEC", label: "Prueba de ejecución práctica" },
  { id: "PORTF", label: "Portfolio / Cuaderno" },
  { id: "DIARIO", label: "Diario de aprendizaje" },
  { id: "DEF-ORAL", label: "Exposición oral" },
  { id: "AUTOEVAL", label: "Autoevaluación" },
  { id: "COEVAL", label: "Coevaluación" },
];

/** Instrumento de calificación: la rúbrica/escala que puntúa la evidencia
 * generada por un INSTRUMENTOS_EVALUACION. */
export const INSTRUMENTOS_CALIFICACION: InstrumentoEvaluacion[] = [
  { id: "RUBR", label: "Rúbrica de evaluación" },
  { id: "COTEJO", label: "Lista de control / Cotejo" },
  { id: "ESCALA", label: "Escala de valoración (Likert)" },
];
