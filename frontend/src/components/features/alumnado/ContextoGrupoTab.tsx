import React from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { Users, Activity } from "lucide-react";

export function ContextoGrupoTab() {
  return (
    <MotionWrapper>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Contexto del grupo</h2>
            <p className="text-sm text-muted-foreground">Define las características psico-pedagógicas y sociológicas del alumnado (necesarias para la PD).</p>
          </div>
        </div>

        <NarrativeField 
          id="textos_pd_caracteristicas_alumnado"
          title="Características del Alumnado"
          description="Procedencia geográfica principal, franja de edad, nivel competencial inicial, expectativas e implicación, etc."
        />
        
        {/* We can add more fields here if needed later, but the model groups them into one big block */}
      </div>
    </MotionWrapper>
  );
}
