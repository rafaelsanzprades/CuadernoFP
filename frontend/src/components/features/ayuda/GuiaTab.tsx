"use client";
import { Bot, Wrench, Download, CalendarDays, ClipboardList, FileSpreadsheet, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GUIA_PASOS, type GuiaNode } from "@/data/guiaData";

const PASO_ICONS: Record<string, LucideIcon> = {
  "0": Bot,
  "1": Wrench,
  "2": Download,
  "3": CalendarDays,
  "4": ClipboardList,
  "5": FileSpreadsheet,
};

// Árbol de navegación (Bloque > Página > Pestaña > Acción...) -- una guía de
// "dónde hacer clic exactamente", así que se renderiza como lista anidada
// con una guía vertical por nivel, en vez de intentar reproducir cada tipo
// de campo (Botón/Selector/Tabla/...) con un estilo distinto.
export function GuiaTree({ nodes, depth = 0 }: { nodes: GuiaNode[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? "mt-2 ml-4 pl-4 space-y-2 border-l border-[var(--glass-border)]" : "space-y-2"}>
      {nodes.map((node, i) => (
        <li key={i}>
          <p className="text-body text-muted leading-relaxed">
            {node.label && <span className="font-semibold text-foreground">{node.label}: </span>}
            {node.text}
          </p>
          {node.children && <GuiaTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export function GuiaTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {GUIA_PASOS.map(paso => (
        <div key={paso.id} className="space-y-3">
          <SectionHeading id={paso.id} number={Number(paso.numero)} icon={PASO_ICONS[paso.numero]} scrollMt="260px">
            {paso.titulo}
          </SectionHeading>
          <Card className="p-6 space-y-6">
            {paso.intro?.map((p, i) => (
              <p key={i} className="text-body text-muted leading-relaxed">{p}</p>
            ))}
            {paso.subsecciones.map((sub, idx) => (
              <div key={sub.numero} className={idx > 0 ? "space-y-2 pt-6 border-t border-[var(--glass-border)]" : "space-y-2"}>
                <h4 className="text-body font-bold text-foreground">{sub.numero}. {sub.titulo}</h4>
                <div className="pl-4 border-l border-[var(--glass-border)] space-y-2">
                  {sub.intro && <p className="text-body text-muted leading-relaxed">{sub.intro}</p>}
                  <GuiaTree nodes={sub.nodes} />
                  {sub.nota && (
                    <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/20 text-body text-muted">
                      {sub.nota}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {paso.notaFinal && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-body text-muted">
                {paso.notaFinal}
              </div>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}
