import React from "react";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { NarrativeField } from "@/components/ui/NarrativeField";
import { Map, BookOpen, Settings } from "lucide-react";

export function MetodologiaContextoTab() {
  return (
    <MotionWrapper>
      <div className="space-y-8">
        
        {/* Contexto */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-subheading font-bold text-[var(--text-primary)]">Contexto y entorno</h2>
              <p className="text-body text-muted-foreground">Define los entornos geográfico, socioeconómico y escolar del módulo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <NarrativeField 
              id="textos_pd_contexto_geografico"
              title="Contexto geográfico"
              description="Ubicación y características geográficas relevantes."
            />
            <NarrativeField 
              id="textos_pd_contexto_socioeconomico"
              title="Contexto socioeconómico"
              description="Entorno productivo, sectores profesionales y demanda."
            />
            <NarrativeField 
              id="textos_pd_contexto_escolar"
              title="Contexto escolar"
              description="Características del centro educativo y su oferta formativa."
            />
          </div>
        </section>

        {/* Metodología */}
        <section>
          <div className="mb-6 flex items-center gap-3 mt-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-subheading font-bold text-[var(--text-primary)]">Metodología y orientaciones</h2>
              <p className="text-body text-muted-foreground">Estrategias metodológicas y medidas de inclusión para el alumnado.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <NarrativeField 
              id="textos_pd_metodologia_labor_coordinada"
              title="Labor coordinada"
              description="Coordinación del equipo docente para el desarrollo del módulo."
            />
            <NarrativeField 
              id="textos_pd_inclusion"
              title="Medidas de inclusión"
              description="Adaptaciones no significativas y atención a ACNEAE/ACNEE."
            />
          </div>
        </section>

        {/* Contingencia */}
        <section>
          <div className="mb-6 flex items-center gap-3 mt-8">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-subheading font-bold text-[var(--text-primary)]">Medidas de contingencia</h2>
              <p className="text-body text-muted-foreground">Planes de actuación ante ausencias prolongadas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <NarrativeField 
              id="textos_pd_contingencia_profesor"
              title="Contingencia: Profesorado"
              description="Qué hacer en caso de ausencia prolongada del profesor/a titular."
            />
            <NarrativeField 
              id="textos_pd_contingencia_alumnado"
              title="Contingencia: Alumnado"
              description="Seguimiento para alumnos con ausencias prolongadas justificadas."
            />
          </div>
        </section>
        
      </div>
    </MotionWrapper>
  );
}
