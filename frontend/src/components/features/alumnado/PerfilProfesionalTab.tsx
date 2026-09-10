"use client";
import React, { useState } from "react";
import { Compass, ClipboardList, BarChart } from "lucide-react";
import { OrientacionIndividualTab } from "./OrientacionIndividualTab";
import { ResumenProfesionalTab } from "./ResumenProfesionalTab";
import { TendenciasProfesionalTab } from "./TendenciasProfesionalTab";

export function PerfilProfesionalTab() {
  const [view, setView] = useState<"individual" | "resumen" | "tendencias">("individual");

  return (
    <div className="mt-4 space-y-4">
      <div className="inline-flex rounded-xl border border-[var(--glass-border)] bg-foreground/5 p-1">
        <button
          onClick={() => setView("individual")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-body font-semibold transition-colors ${view === "individual" ? "bg-accent text-background" : "text-muted hover:text-foreground"}`}
        >
          <Compass className="w-4 h-4" /> Individual
        </button>
        <button
          onClick={() => setView("resumen")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-body font-semibold transition-colors ${view === "resumen" ? "bg-accent text-background" : "text-muted hover:text-foreground"}`}
        >
          <ClipboardList className="w-4 h-4" /> Resumen
        </button>
        <button
          onClick={() => setView("tendencias")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-body font-semibold transition-colors ${view === "tendencias" ? "bg-accent text-background" : "text-muted hover:text-foreground"}`}
        >
          <BarChart className="w-4 h-4" /> Tendencias
        </button>
      </div>

      {view === "individual" && <OrientacionIndividualTab />}
      {view === "resumen" && <ResumenProfesionalTab />}
      {view === "tendencias" && <TendenciasProfesionalTab />}
    </div>
  );
}
