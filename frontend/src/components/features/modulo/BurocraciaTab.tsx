import React from "react";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { FileText } from "lucide-react";

export function BurocraciaTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-foreground">Datos de Autoría y Publicidad</h2>
      </div>
      <div className="flex flex-col gap-6">
        <NarrativeField 
          id="textos_pd_bibliografia"
          title="Bibliografía y Recursos"
          description="Bibliografía principal para el profesorado y alumnado."
        />
        <NarrativeField 
          id="textos_pd_publicidad"
          title="Publicidad de la Programación"
          description="Cómo y dónde se publicará o podrá consultar la programación."
        />
      </div>
    </div>
  );
}
