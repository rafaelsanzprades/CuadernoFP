"use client";
import { AlertTriangle, BarChart, BookOpen, Calculator, Calendar, CalendarDays, ChevronRight, Construction, CornerLeftUp, Download, DownloadCloud, File, FileEdit, FileSpreadsheet, FileText, Folder, FolderOpen, GraduationCap, MapPin, Play, Scale, Search, Settings, UploadCloud, User, Users, X, Info, TrendingUp, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const dimensiones = {
  "dim1": {
    title: "Dimensión 1: Cumplimiento de Funciones",
    isSiNo: true,
    subapartados: [
      {
        title: "Cumplimiento y Funciones",
        items: [
          "Cumple la normativa vigente en su desempeño profesional.",
          "Trata con atención y respeto a sus superiores y superioras, compañeros y compañeras, alumnado y familias y a la Comunidad Educativa en General.",
          "De su conducta se desprende que respeta los derechos fundamentales y libertades públicas, evitando toda actuación que pueda producir discriminación alguna.",
          "Administra correctamente los recursos disponibles, vela por su conservación y no los utiliza en provecho propio."
        ]
      }
    ]
  },
  "dim2": {
    title: "Dimensión 2: Proceso de Enseñanza-Aprendizaje",
    isSiNo: false,
    subapartados: [
      {
        title: "2.1 Planificación del Proceso de Enseñanza-Aprendizaje",
        items: [
          "Dispone de Programación de Aula (PA) en la que se concretan las Programaciones Didácticas (PD) a cada grupo.",
          "Realiza la programación y la enseñanza de los módulos profesionales que tiene encomendados utilizando como referencia el Proyecto Educativo del Centro (PEC) y Proyecto Curricular del Centro (PCC).",
          "Las programaciones incluyen medidas para la respuesta a la diversidad utilizando como referente el Plan de Atención a la Diversidad del Centro (PADC).",
          "Las programaciones incluyen el desarrollo de las Competencias Clave."
        ]
      },
      {
        title: "2.2.1 Práctica Docente",
        items: [
          "Realiza la evaluación inicial del grupo o grupos y módulos profesionales que se le han encomendado.",
          "Adapta las programaciones según los resultados de la evaluación inicial y características del grupo de alumnado.",
          "Muestra dominio de los módulos profesionales que imparte.",
          "Sus explicaciones y la presentación de las actividades son claras y comprensibles.",
          "Realiza actividades variadas, individuales y en grupo, coherentes con los objetivos planteados.",
          "La secuenciación y temporalización de las actividades observadas es correcta.",
          "Elabora y aplica, cuando procede, las correspondientes actuaciones de intervención para el alumnado con Necesidades Específicas de Apoyo Educativo (ACNEAE).",
          "Utiliza en sus clases recursos didácticos adecuados.",
          "Introduce las Unidades Didácticas (UD) o de Trabajo (UT) que va a trabajar con el alumnado conectando con sus aprendizajes o experiencias previas para conseguir un aprendizaje significativo del alumnado.",
          "Los contenidos están bien estructurados y secuenciados para facilitar el progreso del aprendizaje del alumnado."
        ]
      },
      {
        title: "2.2.2 Ambiente de Trabajo en el Aula",
        items: [
          "Contribuye a que las actividades del centro se desarrollen en un clima de respeto, de tolerancia, de participación y de libertad para fomentar en el alumnado los valores de la ciudadanía democrática.",
          "Favorece la autoestima y autorregulación del alumnado y gestiona las conductas disruptivas.",
          "Establece normas claras para el trabajo en el aula contando con la participación del alumnado, consecuentemente con el Reglamento de Régimen Interior (RRI) y el Plan de Convivencia del Centro."
        ]
      },
      {
        title: "2.2.3 Aspectos Metodológicos",
        items: [
          "La atención a la diversidad del alumnado.",
          "El desarrollo de las inteligencias múltiples.",
          "El aprendizaje significativo.",
          "El aprendizaje por descubrimiento.",
          "Aplicación de métodos y tareas globalizadas, centros de interés, método de proyectos, talleres y tareas competenciales.",
          "La resolución de problemas de la vida cotidiana.",
          "El fomento de la creatividad.",
          "La contribución a la autonomía en los aprendizajes.",
          "La inclusión de las TIC.",
          "Trabajo por proyectos.",
          "La metodología utilizada es adecuada y ajustada a los criterios establecidos en la Programación Didáctica (PD), módulo profesional impartido y alumnado del grupo.",
          "Considera los diferentes intereses y ritmos de aprendizaje del alumnado."
        ]
      },
      {
        title: "2.3 Evaluación del Proceso de Enseñanza-Aprendizaje",
        items: [
          "Informa al alumnado de los criterios de evaluación y calificación de forma clara y comprensible.",
          "Los criterios de evaluación, Resultados de Aprendizaje (RA) y criterios de calificación son objetivos y claros.",
          "Los procedimientos e instrumentos utilizados son variados y coherentes con los criterios de evaluación de la programación.",
          "Corrige con diligencia los ejercicios, trabajos, cuadernos, etc., facilitando su revisión al alumnado.",
          "Registra las observaciones realizadas en el proceso de evaluación (trabajos, pruebas, dificultades, logros actitudes...).",
          "Toma decisiones derivadas de la evaluación del alumnado para orientar el proceso de aprendizaje.",
          "Pone en marcha los planes específicos de apoyo y refuerzo determinados para el alumnado que no supera los objetivos de aprendizaje.",
          "Cumplimenta los documentos administrativos y académicos de la evaluación en el plazo establecido.",
          "Realiza la evaluación de los procesos de enseñanza."
        ]
      }
    ]
  },
  "dim3": {
    title: "Dimensión 3: Dedicación al Centro",
    isSiNo: false,
    subapartados: [
      {
        title: "3.1 Participación en los Órganos Colegiados y de Coordinación Docente",
        items: [
          "Asiste con puntualidad y participa activamente realizando propuestas en las reuniones de los órganos de gobierno y de coordinación docente, en las sesiones de evaluación asumiendo las decisiones adoptadas.",
          "Participa activamente en las reuniones del equipo/departamento, comenta la marcha del curso y propone cambios en la programación para adaptarla a las necesidades observadas.",
          "Asume las tareas fijadas por el equipo docente para la atención al alumnado con Necesidades Específicas de Apoyo Educativo (ACNEAE)."
        ]
      },
      {
        title: "3.2 Participación en las Actividades del Centro",
        items: [
          "Propone, organiza y participa en las actividades complementarias (y en su caso, extraescolares), dentro o fuera del recinto educativo, programadas por el centro e incluidas en la Programación General Anual (PGA).",
          "Planifica y prepara las visitas con el alumnado y les informa sobre los objetivos, tareas de la actividad y recursos didácticos a emplear."
        ]
      },
      {
        title: "3.3 Orientación y Tutoría",
        items: [
          "Desarrolla la tutoría del alumnado, la dirección y la orientación de su aprendizaje y el apoyo en su proceso educativo, en colaboración con las familias.",
          "Dispone del Plan de Acción Tutorial (PAT) adaptado a su grupo de alumnado (en caso de ejercer la tutoría).",
          "Atiende de forma individualizada al alumnado no solo respecto del desarrollo intelectual sino también del afectivo, psicomotriz, social y moral.",
          "Realiza un seguimiento del absentismo de su alumnado.",
          "Reacciona de forma adecuada ante situaciones inesperadas o conflictivas.",
          "Realiza con prontitud las gestiones para resolver las incidencias que se producen en relación con el alumnado.",
          "Informa periódicamente a las familias sobre el proceso de aprendizaje de sus hijos e hijas, así como la orientación para su cooperación en el mismo, a través de reuniones grupales y entrevistas individuales.",
          "Muestra una actitud dialogante, facilitando las relaciones entre las familias, el profesorado y el centro escolar.",
          "Facilita información a las familias sobre los procedimientos e instrumentos de evaluación, los criterios de evaluación, Resultados de Aprendizaje (RA), criterios de calificación para superar los módulos profesionales y criterios de promoción previstos y, en su caso, sobre las medidas de intervención educativa que se precisen."
        ]
      },
      {
        title: "3.4 Formación e Innovación",
        items: [
          "Mantiene actualizada su formación y cualificación.",
          "Participa en el Plan de Formación de Centro (PFC)."
        ]
      }
    ]
  }
};

export default function MejoraDocentePage() {
  const [activeTab, setActiveTab] = useState<string>("dim1");

  const currentDimension = dimensiones[activeTab as keyof typeof dimensiones];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span className="text-3xl text-info"><TrendingUp className="w-8 h-8" strokeWidth={2.5} /></span> Mejora Docente
                </h1>
                <p className="text-muted mt-2 text-lg">Panel de autoevaluación y rúbricas de mejora del desempeño docente.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6 mt-6">
              <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sistema de Autoevaluación Docente</p>
                <p className="text-sm text-muted mt-1">Valora tu progreso en base a los indicadores oficiales del proceso de enseñanza, dedicación al centro y metodologías aplicadas. Utiliza el selector lateral para puntuar tu desempeño en cada apartado.</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="bg-foreground/5 border border-[var(--glass-border)] w-full justify-start h-auto p-1 rounded-xl flex-wrap">
                <TabsTrigger value="dim1" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                  Dimensión 1: Funciones
                </TabsTrigger>
                <TabsTrigger value="dim2" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                  Dimensión 2: Enseñanza
                </TabsTrigger>
                <TabsTrigger value="dim3" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-info data-[state=active]:text-foreground text-muted font-medium transition-all">
                  Dimensión 3: Centro
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-6 animate-in fade-in duration-500">
              {currentDimension.subapartados.map((sub, idx) => (
                <Card key={idx} className="overflow-hidden border border-[var(--glass-border)] rounded-xl shadow-sm bg-[var(--glass-bg)]">
                  <div className="px-6 py-4 border-b border-[var(--glass-border)] bg-foreground/[0.02]">
                    <h2 className="text-lg font-bold text-foreground">{sub.title}</h2>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--glass-border)] bg-foreground/[0.01]">
                          <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider w-48 text-center">Valoración</th>
                          <th className="py-3 px-6 text-xs font-semibold text-muted uppercase tracking-wider">Indicador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sub.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="border-b border-[var(--glass-border)] hover:bg-foreground/[0.02] transition-colors">
                            <td className="py-3 px-6 text-center w-48">
                              <select 
                                className="bg-background border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-info focus:outline-none w-full max-w-[120px] text-[var(--text-primary)]"
                                defaultValue=""
                              >
                                <option value="" disabled>-</option>
                                {currentDimension.isSiNo ? (
                                  <>
                                    <option value="1">1 (NO)</option>
                                    <option value="2">2 (SÍ)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="1">1 (No cumple)</option>
                                    <option value="2">2 (Básico)</option>
                                    <option value="3">3 (Bueno)</option>
                                    <option value="4">4 (Excelente)</option>
                                  </>
                                )}
                              </select>
                            </td>
                            <td className="py-3 px-6 text-sm text-[var(--text-primary)] leading-relaxed">
                              {item}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))}
            </div>
            
          </MotionWrapper>
        </div>
      </main>
    </div>
  );
}
