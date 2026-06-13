"use client";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";

export default function AsistentePage() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <AIWizardModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSuccess={(data) => {
          console.log("Datos recibidos de la IA:", data);
          toast.success("Estructura guardada.");
        }}
      />
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix="Inteligencia artificial" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-8 pb-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-accent" /> Asistente Mágico (IA)
              </h1>
              <p className="text-muted text-lg">
                Importa programaciones desde PDF automáticamente utilizando el motor de Inteligencia Artificial.
              </p>
            </div>

            <div className="space-y-8 w-full max-w-6xl mx-auto">
              {/* Botón de Creación Asistida */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setAiModalOpen(true)}
                  className="text-base font-semibold flex items-center justify-center gap-3 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-8 py-6 h-auto rounded-xl transition-all relative overflow-hidden w-full max-w-lg"
                >
                  <Sparkles className="w-6 h-6 text-accent shrink-0" /> 
                  <span className="flex-1 text-left">Crear Nueva Programación con IA (PDF)</span>
                  <span className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded text-[10px] font-bold uppercase border border-warning/30 shrink-0"><AlertTriangle className="w-3 h-3" /> Beta</span>
                </Button>
              </div>

              {/* Sección de Ajustes de IA (Dos Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Configuración */}
                <div>
                  <AISettingsPanel />
                </div>

                {/* Columna Derecha: Instrucciones */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-info/5 border border-info/20 text-foreground">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-info" /> ¿Cómo obtengo mi API Key?
                  </h3>
                  <p className="text-muted text-sm">
                    CuadernoFP utiliza un modelo "Bring Your Own Key" (Trae tu propia clave) para garantizar que tus datos no pasan por servidores intermedios y mantener la herramienta 100% gratuita.
                  </p>
                  
                  <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/90 font-medium">
                    <li>
                      Entra en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>.
                    </li>
                    <li>
                      Inicia sesión con tu cuenta de Google habitual.
                    </li>
                    <li>
                      Pulsa el botón azul <strong>"Create API key"</strong>.
                    </li>
                    <li>
                      Copia la larga cadena de texto (tu clave secreta) y pégala en la caja de la izquierda.
                    </li>
                  </ol>

                  <div className="mt-auto pt-4 flex items-start gap-3 text-sm text-warning/80 bg-warning/5 p-4 rounded-xl border border-warning/10">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>
                      <strong>Importante:</strong> Esta clave es personal e intransferible. Da acceso al motor de IA usando tu cupo gratuito de desarrollador de Google.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
