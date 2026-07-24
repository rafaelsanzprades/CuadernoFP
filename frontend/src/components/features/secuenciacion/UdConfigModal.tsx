import React, { useState } from "react";
import { X, Save, Settings2, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

interface UdConfigModalProps {
  ud: any;
  onClose: () => void;
  onSave: (ud_id: string, updates: any) => void;
}

export function UdConfigModal({ ud, onClose, onSave }: UdConfigModalProps) {
  const [formData, setFormData] = React.useState({
    Intencion_Educativa: ud.Intencion_Educativa || "",
    Agrupamientos: ud.Agrupamientos || "Gran grupo, Pequeño grupo, Individual",
    Temporizacion: ud.Temporizacion || "",
    Transversalidad: ud.Transversalidad || ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { cursoData, moduleData } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=ud&item_id=${ud.id_ud}`;
      
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
      a.download = `UD_${ud.id_ud}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar la Unidad didáctica.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(ud.id_ud, formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <Card className="w-full max-w-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center bg-foreground/5 shrink-0 rounded-t-xl">
          <div>
            <h2 id="modal-title" className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Settings2 className="w-5 h-5 text-accent" />
              Configuración Detallada de la Unidad
            </h2>
            <p className="text-sm text-muted mt-1">
              <span className="font-mono text-accent mr-2">{ud.id_ud}</span>
              {ud.desc_ud}
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
          {/* Intención Educativa */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              Intención educativa / contextualización
            </label>
            <p className="text-xs text-muted">Justificación pedagógica de esta unidad, vinculación al perfil profesional y conocimientos previos necesarios.</p>
            <textarea 
              value={formData.Intencion_Educativa}
              onChange={(e) => handleChange("Intencion_Educativa", e.target.value)}
              className="w-full min-h-[120px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
              placeholder="Ej: En esta unidad el alumnado comprenderá los fundamentos de..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temporización */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">
                Temporización detallada
              </label>
              <p className="text-xs text-muted">Periodo del curso, fechas estimadas y relación con otras UDs.</p>
              <textarea 
                value={formData.Temporizacion}
                onChange={(e) => handleChange("Temporizacion", e.target.value)}
                className="w-full min-h-[100px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                placeholder="Ej: 1er Trimestre (Semanas 4 a 6)..."
              />
            </div>

            {/* Agrupamientos */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">
                Agrupamientos y metodología
              </label>
              <p className="text-xs text-muted">Organización del aula (Gran grupo, pequeño grupo, trabajo individual).</p>
              <textarea 
                value={formData.Agrupamientos}
                onChange={(e) => handleChange("Agrupamientos", e.target.value)}
                className="w-full min-h-[100px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
                placeholder="Gran grupo para teoría, parejas para prácticas..."
              />
            </div>
          </div>
          
          {/* Transversalidad */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">
              Transversalidad e innovación
            </label>
            <p className="text-xs text-muted">Cómo se trabajan la digitalización, sostenibilidad, equidad o DUA en esta unidad.</p>
            <textarea 
              value={formData.Transversalidad}
              onChange={(e) => handleChange("Transversalidad", e.target.value)}
              className="w-full min-h-[80px] bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-4 py-3 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40 resize-y"
              placeholder="Ej: Se utilizarán herramientas digitales para..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/5 shrink-0 flex justify-between items-center rounded-b-xl">
          <Button variant="ghost" onClick={handleExport} disabled={isExporting} className="gap-2 text-info hover:text-info hover:bg-info/10">
            <Download className="w-4 h-4" /> {isExporting ? "Exportando..." : "Exportar Ficha (PDF/DOCX)"}
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
