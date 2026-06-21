"use client";
import React, { useState } from "react";
import { BookOpen, Target, FileText, CheckCircle2, ChevronRight, DownloadCloud, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PublisherProposal, publisherProposals } from "@/data/proposalsData";

interface ProposalLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModuleId: string;
  onApplyProposal: (proposal: PublisherProposal) => void;
}

export function ProposalLoaderModal({ isOpen, onClose, activeModuleId, onApplyProposal }: ProposalLoaderModalProps) {
  const [selectedProposal, setSelectedProposal] = useState<PublisherProposal | null>(null);

  if (!isOpen) return null;

  // Extract the actual module code, e.g. "0237" from "0237-pd"
  const moduleCode = activeModuleId ? activeModuleId.split('-')[0] : "";
  const availableProposals = publisherProposals.filter(p => p.moduleCode === moduleCode);

  const handleApply = () => {
    if (selectedProposal) {
      onApplyProposal(selectedProposal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-[var(--glass-border)] rounded-3xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
              <DownloadCloud className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Propuestas Editoriales / Autores</h2>
              <p className="text-sm text-muted">Selecciona una propuesta predefinida para este módulo ({moduleCode})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
          {availableProposals.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <FileText className="w-12 h-12 text-muted mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No hay propuestas disponibles</h3>
              <p className="text-muted mt-2 max-w-md mx-auto">
                Actualmente no existen secuenciaciones predefinidas de autores o editoriales para el módulo {moduleCode}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {!selectedProposal ? (
                // Lista de propuestas
                <div className="grid gap-4">
                  {availableProposals.map(prop => (
                    <div 
                      key={prop.id}
                      onClick={() => setSelectedProposal(prop)}
                      className="group p-5 border border-[var(--glass-border)] hover:border-info/50 bg-foreground/5 hover:bg-info/5 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-info uppercase tracking-wider">{prop.author}</span>
                          <span className="text-xs text-muted">• {prop.totalHours} Horas • {prop.df_ud.length} UDs</span>
                        </div>
                        <h4 className="text-lg font-bold text-foreground group-hover:text-info transition-colors">{prop.title}</h4>
                        <p className="text-sm text-muted mt-1">{prop.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-info transition-colors hidden sm:block" />
                    </div>
                  ))}
                </div>
              ) : (
                // Detalle de la propuesta seleccionada
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <button 
                    onClick={() => setSelectedProposal(null)}
                    className="text-sm text-info hover:underline mb-2 inline-block"
                  >
                    &larr; Volver a la lista
                  </button>

                  <div className="bg-info/10 border border-info/30 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">{selectedProposal.title}</h3>
                    <p className="text-sm text-muted">{selectedProposal.author} • {selectedProposal.totalHours} horas totales</p>
                    
                    <div className="mt-4 p-3 bg-background/50 rounded-xl max-h-40 overflow-y-auto text-sm space-y-2 border border-[var(--glass-border)]">
                      {selectedProposal.df_ud.map(ud => (
                        <div key={ud.id_ud} className="flex justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="font-medium">{ud.id_ud}: <span className="text-muted font-normal">{ud.desc_ud}</span></span>
                          <span className="text-info font-mono">{ud.horas_ud}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div className="text-sm text-warning/90">
                      <p className="font-bold mb-1">Atención: Esta acción sobrescribirá datos actuales</p>
                      <p>
                        Se reemplazarán tus Unidades Didácticas (UD/T), la relación entre RA y UD/T, y la matriz de contribución RA-OG. 
                        Asegúrate de que estás de acuerdo antes de aplicar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedProposal && (
          <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/5 rounded-b-3xl flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedProposal(null)}>Cancelar</Button>
            <Button variant="default" onClick={handleApply} className="bg-info hover:bg-info/90 text-white border-0">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Aplicar Propuesta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
