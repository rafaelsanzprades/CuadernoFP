import { Gift, Hand, Rocket } from "lucide-react";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { fileManager } from "@/services/fileManager";
import toast from "react-hot-toast";

interface WelcomeWizardProps {
  onComplete: () => void;
  fetchModules: () => void;
  setActiveModuleId: (id: string) => void;
  setActiveCursoId: (id: string) => void;
}

export function WelcomeWizard({ onComplete, fetchModules, setActiveModuleId, setActiveCursoId }: WelcomeWizardProps) {
  const [step, setStep] = useState<"CHOICE" | "CREATE_FORM" | "LOADING">("CHOICE");
  const [newPdName, setNewPdName] = useState("");
  const [newCursoName, setNewCursoName] = useState("");

  const handleLoadDemo = async () => {
    setStep("LOADING");
    const toastId = toast.loading("Inyectando Archivos de demostración...");
    try {
      fileManager.loadDemoData();
      await fetchModules();
      toast.success("Archivos de demostración cargado!", { id: toastId });
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al cargar demo: ${message}`, { id: toastId });
      setStep("CHOICE");
    }
  };

  const handleCreateNew = async () => {
    if (!newPdName || !newCursoName) {
      toast.error("Por favor, rellena ambos campos.");
      return;
    }

    setStep("LOADING");
    const toastId = toast.loading("Creando tu nuevo Archivos...");
    
    const pdId = `${newPdName}-pd`;
    const cursoId = `${newPdName}-curso-${newCursoName}`;

    try {
      // 1. Crear PD
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${pdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      // 2. Crear curso
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${cursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      await fetchModules();
      setActiveModuleId(pdId);
      setActiveCursoId(cursoId);
      toast.success("¡Archivos creado con éxito!", { id: toastId });
      onComplete();

    } catch (error: any) {
      toast.error("Error al crear el Archivos.", { id: toastId });
      setStep("CREATE_FORM");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
      <MotionWrapper className="w-full max-w-2xl">
        <Card className="p-10 shadow-2xl border-t-4 border-t-accent bg-card/95 backdrop-blur-lg">
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-foreground mb-4 flex items-center justify-center gap-3">
              <span className="text-5xl"><span className="inline-flex"><Hand className="w-[1.2em] h-[1.2em] mr-1" /></span></span> ¡Bienvenido a Cuaderno FP!
            </h2>
            <p className="text-lg text-muted">
              Parece que es tu primera vez aquí. Vamos a preparar tu Archivos para que puedas empezar a volar.
            </p>
          </div>

          {step === "LOADING" && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
              <p className="text-muted">Preparando tu espacio...</p>
            </div>
          )}

          {step === "CHOICE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={handleLoadDemo}
                className="group p-6 rounded-2xl border-2 border-[var(--glass-border)] hover:border-accent/50 bg-foreground/5 hover:bg-accent/5 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-foreground">Probar con DEMO</h3>
                </div>
                <p className="text-sm text-muted">
                  Carga un Archivos de demostración con datos ficticios para explorar todas las funciones de la aplicación.
                </p>
              </button>

              <button
                onClick={() => setStep("CREATE_FORM")}
                className="group p-6 rounded-2xl border-2 border-[var(--glass-border)] hover:border-info/50 bg-foreground/5 hover:bg-info/5 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-8 h-8 text-info group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-foreground">Crear mi Archivos</h3>
                </div>
                <p className="text-sm text-muted">
                  Empieza desde cero creando tu propia programación y curso vacíos para trabajar con tus datos reales.
                </p>
              </button>
            </div>
          )}

          {step === "CREATE_FORM" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Nombre de la Programación</label>
                <Input
                  value={newPdName}
                  onChange={(e) => setNewPdName(e.target.value)}
                  placeholder="Ej: ELE203, 0237-ictve"
                />
                <p className="text-xs text-muted mt-1">Se creará un archivo vacío con este identificador.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Año del Curso</label>
                <Input
                  value={newCursoName}
                  onChange={(e) => setNewCursoName(e.target.value)}
                  placeholder="Ej: 2025-26"
                />
                <p className="text-xs text-muted mt-1">El curso se asociará a este año académico.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep("CHOICE")} className="flex-1 bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]">
                  Volver
                </Button>
                <Button onClick={handleCreateNew} className="flex-1 bg-info/20 hover:bg-info/30 text-info border border-info/30">
                  <Rocket className="w-4 h-4 mr-2" /> Crear archivos
                </Button>
              </div>
            </div>
          )}

        </Card>
      </MotionWrapper>
    </div>
  );
}
