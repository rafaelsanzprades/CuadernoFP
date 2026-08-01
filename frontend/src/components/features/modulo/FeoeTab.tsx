"use client";
import { NarrativeField } from "@/components/ui/NarrativeField";

export function FeoeTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <NarrativeField
        id="textos_pd_feoe_organizacion"
        title="Organización y modalidad de FEOE"
        description="Detalla cómo se organiza el alumnado (FEOE general, intensivo) y qué alternativas hay para el alumnado sin FEOE."
      />
      <NarrativeField
        id="textos_pd_feoe_seguimiento"
        title="Seguimiento de FEOE"
        description="Procedimiento para el seguimiento en la empresa y comunicación con tutores duales."
      />
    </div>
  );
}
