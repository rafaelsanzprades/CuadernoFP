import React, { useState } from "react";
import { X, Save, FileText, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface TaskConfigModalProps {
  task: any;
  onClose: () => void;
  onSave: (task_id: string, updates: any) => void;
}

export function TaskConfigModal({ task, onClose, onSave }: TaskConfigModalProps) {
  const [formData, setFormData] = React.useState({
    Briefing: task.Briefing || "",
    Pasos: task.Pasos || "",
    Evidencias: task.Evidencias || "",
    Entrega: task.Entrega || ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { cursoData, moduleData } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const taskId = task.ID || task.id_act;
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=tarea&item_id=${taskId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso_data: cursoData || {},
          module_data: moduleData || {},
        })
      });

      if (!response.ok) throw new Error("Error generando documento");

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `Tarea_${taskId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar la Tarea Competencial.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task.ID, formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <Card className="w-full max-w-4xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center bg-foreground/5 shrink-0 rounded-t-xl">
          <div>
            <h2 id="modal-title" className="text-xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-accent" />
              Diseño de la Tarea Competencial
            </h2>
            <p className="text-sm text-muted mt-1">
              <span className="font-mono text-accent mr-2">{task.ID || task.id_act}</span>
              {task.Nombre_Tarea}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-foreground/10 rounded-full transition-colors text-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground">
                  Scenario / Briefing (Contexto Profesional)
                </label>
                <p className="text-xs text-muted">Situación laboral creíble, encargo específico (ej. un correo de un cliente, una incidencia técnica).</p>
                <textarea 
                  value={formData.Briefing}
                  onChange={(e) => handleChange("Briefing", e.target.value)}
                  className="w-full min-h-[160px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                  placeholder="Ej: Eres el técnico de sistemas de la empresa X y recibes el siguiente ticket de soporte..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground">
                  Formato de Entrega y Plazos
                </label>
                <p className="text-xs text-muted">Cómo, cuándo y dónde debe entregarse la tarea.</p>
                <textarea 
                  value={formData.Entrega}
                  onChange={(e) => handleChange("Entrega", e.target.value)}
                  className="w-full min-h-[80px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                  placeholder="Ej: Documento PDF subido a Moodle antes del viernes a las 23:59..."
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground">
                  Desarrollo de la Tarea (Pasos)
                </label>
                <p className="text-xs text-muted">Instrucciones secuenciadas que el alumnado debe seguir.</p>
                <textarea 
                  value={formData.Pasos}
                  onChange={(e) => handleChange("Pasos", e.target.value)}
                  className="w-full min-h-[160px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                  placeholder="1. Analizar el ticket... 2. Revisar los logs... 3. Proponer solución..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground">
                  Evidencias a Generar
                </label>
                <p className="text-xs text-muted">Qué productos tangibles o demostraciones se van a evaluar.</p>
                <textarea 
                  value={formData.Evidencias}
                  onChange={(e) => handleChange("Evidencias", e.target.value)}
                  className="w-full min-h-[80px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                  placeholder="Ej: 1 Informe técnico. 1 Captura de pantalla de la configuración. 1 Presentación oral de 5 min."
                />
              </div>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/5 shrink-0 flex justify-between items-center rounded-b-xl">
          <Button variant="ghost" onClick={handleExport} disabled={isExporting} className="gap-2 text-info hover:text-info hover:bg-info/10">
            <Download className="w-4 h-4" /> {isExporting ? "Exportando..." : "Exportar Briefing (PDF/DOCX)"}
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} className="gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
