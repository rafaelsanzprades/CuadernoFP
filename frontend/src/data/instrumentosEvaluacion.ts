export interface InstrumentoEvaluacion {
  id: string;
  label: string;
}

export const INSTRUMENTOS_EVALUACION: InstrumentoEvaluacion[] = [
  { id: "PRU-OBJ", label: "Prueba objetiva escrita" },
  { id: "PRU-EJEC", label: "Prueba de ejecución práctica" },
  { id: "RUBR", label: "Rúbrica de evaluación" },
  { id: "COTEJO", label: "Lista de control / Cotejo" },
  { id: "ESCALA", label: "Escala de valoración" },
  { id: "PORTF", label: "Portfolio / Cuaderno" },
  { id: "DIARIO", label: "Diario de aprendizaje" },
  { id: "DEF-ORAL", label: "Exposición oral" },
  { id: "AUTOEVAL", label: "Autoevaluación" },
  { id: "COEVAL", label: "Coevaluación" },
];
