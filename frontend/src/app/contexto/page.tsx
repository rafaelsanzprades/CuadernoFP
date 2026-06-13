"use client";
import { BookOpen, Map, Target, Layers, FileText, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useModule } from "@/hooks/useApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";

export default function ContextoPage() {
  const { activeModuleId, moduleData, updateModuleData } = useAppStore();
  const { isLoading } = useModule(activeModuleId);
  const [activeTab, setActiveTab] = useState("contexto");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (moduleData && moduleData.config_contexto) {
      setFormData(moduleData.config_contexto);
    }
  }, [moduleData]);

  const TABS = [
    { id: "contexto", label: <span className="flex items-center gap-2"><Map className="w-4 h-4 shrink-0" /> Contexto y FEOE</span>, cleanLabel: "Contexto y FEOE" },
    { id: "metodologia", label: <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> Metodología</span>, cleanLabel: "Metodología" },
    { id: "evaluacion", label: <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /> Eval. y Recursos</span>, cleanLabel: "Eval. y Recursos" },
    { id: "otros", label: <span className="flex items-center gap-2"><Layers className="w-4 h-4 shrink-0" /> Otros Elementos</span>, cleanLabel: "Otros Elementos" }
  ];

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await updateModuleData("config_contexto", formData);
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <BookOpen className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-4">No hay módulo seleccionado</h2>
                <p className="text-muted">Por favor, ve a la sección de Datos y selecciona un módulo PD.</p>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12">
                <div className="space-y-6">
                  <Skeleton className="h-10 w-1/3 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <Skeleton className="h-64 w-full mt-4" />
                </div>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0 h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden flex flex-col content-area">
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-6 h-6 text-accent" />
                  Textos para la Programación Didáctica
                </h1>
                <p className="text-muted-foreground mt-1 max-w-3xl">
                  Rellena los siguientes bloques de texto. Estos apartados se inyectarán automáticamente al generar el documento DOCX oficial.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
                    {saveMessage}
                  </span>
                )}
                <Button onClick={handleSave} disabled={isSaving} variant="primary">
                  {isSaving ? "Guardando..." : "Guardar Textos"}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full h-full">
              <TabsList className="mb-2 max-w-full overflow-x-auto flex flex-nowrap scrollbar-hide border-b border-[var(--glass-border)] rounded-none bg-transparent">
                {TABS.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="whitespace-nowrap shrink-0"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <Card className="flex-1 flex flex-col min-h-0 bg-card/50 backdrop-blur-md border-[var(--glass-border)] shadow-sm overflow-hidden mt-4">
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  <MotionWrapper key={activeTab}>
                    <div className="max-w-4xl space-y-8 pb-12">
                      {activeTab === "contexto" && (
                        <>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">A1. Justificación de la programación</h3>
                            <Textarea 
                              value={formData["A1_justificacion"] || ""} 
                              onChange={(e) => handleInputChange("A1_justificacion", e.target.value)}
                              placeholder="Indicar base normativa, Leyes de Educación y Reales Decretos aplicables al título..."
                              helpText="Base legislativa que fundamenta esta programación."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">A2. Contextualización</h3>
                            <Textarea 
                              value={formData["A2_contextualizacion"] || ""} 
                              onChange={(e) => handleInputChange("A2_contextualizacion", e.target.value)}
                              placeholder="Perfil profesional del título, entorno socioeconómico y características generales del centro..."
                              helpText="Análisis del contexto donde se imparte la formación."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">B3. Vinculación con la Empresa Colaboradora</h3>
                            <Textarea 
                              value={formData["B3_vinculacion_empresa"] || ""} 
                              onChange={(e) => handleInputChange("B3_vinculacion_empresa", e.target.value)}
                              placeholder="Orientaciones sobre las actividades a realizar en la empresa (FEOE)..."
                              helpText="Relación entre el módulo y la formación en la empresa."
                              className="min-h-[150px]"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === "metodologia" && (
                        <>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">D2. Actividades de enseñanza-aprendizaje</h3>
                            <Textarea 
                              value={formData["D2_actividades_ea"] || ""} 
                              onChange={(e) => handleInputChange("D2_actividades_ea", e.target.value)}
                              placeholder="Relación de metodologías tipo como teoría, taller, prácticas simuladas, ABP..."
                              helpText="Estrategias metodológicas a emplear en el aula y taller."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">D3. Agrupamientos y Plan de Desdobles</h3>
                            <Textarea 
                              value={formData["D3_agrupamientos"] || ""} 
                              onChange={(e) => handleInputChange("D3_agrupamientos", e.target.value)}
                              placeholder="Organización del grupo, desdobles por prevención de riesgos o ratios..."
                              helpText="Criterios para la organización espacial y agrupamiento del alumnado."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">F1. Atención a la diversidad</h3>
                            <Textarea 
                              value={formData["F1_diversidad"] || ""} 
                              onChange={(e) => handleInputChange("F1_diversidad", e.target.value)}
                              placeholder="Medidas de inclusión y atención a las diferencias individuales..."
                              helpText="Estrategias para adaptar la enseñanza a las características del alumnado."
                              className="min-h-[150px]"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === "evaluacion" && (
                        <>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">E5. Actividades de Recuperación y Refuerzo</h3>
                            <Textarea 
                              value={formData["E5_recuperacion"] || ""} 
                              onChange={(e) => handleInputChange("E5_recuperacion", e.target.value)}
                              placeholder="Sistema de recuperación para evaluaciones y convocatorias extraordinarias..."
                              helpText="Criterios y procedimientos para el alumnado que no supera la evaluación."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">G1. Infraestructuras y Equipamientos</h3>
                            <Textarea 
                              value={formData["G1_infraestructuras"] || ""} 
                              onChange={(e) => handleInputChange("G1_infraestructuras", e.target.value)}
                              placeholder="Taller, aula, laboratorio, equipamiento específico del ciclo..."
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">G2. Herramientas TIC y plataformas</h3>
                            <Textarea 
                              value={formData["G2_herramientas_tic"] || ""} 
                              onChange={(e) => handleInputChange("G2_herramientas_tic", e.target.value)}
                              placeholder="Moodle, Classroom, software simulador, aplicaciones específicas..."
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">G3. Bibliografía y recursos para el alumnado</h3>
                            <Textarea 
                              value={formData["G3_bibliografia"] || ""} 
                              onChange={(e) => handleInputChange("G3_bibliografia", e.target.value)}
                              placeholder="Libros de texto, manuales de fabricantes, recursos online..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </>
                      )}

                      {activeTab === "otros" && (
                        <>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">H1. Propuestas del departamento</h3>
                            <Textarea 
                              value={formData["H1_complementarias"] || ""} 
                              onChange={(e) => handleInputChange("H1_complementarias", e.target.value)}
                              placeholder="Actividades extraescolares y complementarias propuestas..."
                              helpText="Visitas técnicas, charlas de empresas, ferias del sector."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">I1. Elementos transversales</h3>
                            <Textarea 
                              value={formData["I1_transversales"] || ""} 
                              onChange={(e) => handleInputChange("I1_transversales", e.target.value)}
                              placeholder="Prevención de riesgos laborales, igualdad, sostenibilidad medioambiental..."
                              className="min-h-[150px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">J3. Plan de Contingencia</h3>
                            <Textarea 
                              value={formData["J3_contingencia"] || ""} 
                              onChange={(e) => handleInputChange("J3_contingencia", e.target.value)}
                              placeholder="Procedimiento ante ausencias o clases a distancia..."
                              helpText="Medidas organizativas para garantizar la continuidad formativa."
                              className="min-h-[150px]"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </MotionWrapper>
                </div>
              </Card>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
