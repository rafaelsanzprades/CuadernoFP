"use client";
import { Handshake, Info, Building2, Calendar, Users, BookOpen, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/store/useAppStore";

/**
 * TAB "Dual" en /feoe
 * Gestión de Formación Dual (Régimen General e Intensivo)
 * según Ley 3/2022 y RD 659/2023.
 */

interface DualData {
  modalidad: "general" | "intensivo" | "";
  empresa_nombre: string;
  empresa_cif: string;
  empresa_tutor: string;
  centro_tutor: string;
  pct_empresa: string;
  ra_en_empresa: string;
  tiene_contrato: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones: string;
}

const emptyDual: DualData = {
  modalidad: "",
  empresa_nombre: "",
  empresa_cif: "",
  empresa_tutor: "",
  centro_tutor: "",
  pct_empresa: "",
  ra_en_empresa: "",
  tiene_contrato: false,
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
};

const MODALIDADES = [
  {
    id: "general",
    nombre: "Régimen General",
    pct: "25-35%",
    ra: "10-20%",
    contrato: false,
    descripcion: "Alternancia entre centro educativo y empresa. Sin contrato de formación.",
    color: "border-blue-500/30 bg-blue-500/5",
  },
  {
    id: "intensivo",
    nombre: "Régimen Intensivo",
    pct: "35-50%",
    ra: ">30%",
    contrato: true,
    descripcion: "Mayor presencia en empresa con contrato de formación en alternancia.",
    color: "border-violet-500/30 bg-violet-500/5",
  },
];

export function DualTab() {
  const { moduleData, setModuleData } = useAppStore();
  const [form, setForm] = useState<DualData>(
    (moduleData as any)?.dual_data || emptyDual
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setModuleData({ ...moduleData, dual_data: form } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: keyof DualData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Formación Dual - Ley 3/2022</p>
          <p className="text-sm text-muted mt-1">
            La dual es <strong>obligatoria</strong> en grados C y D. Se distinguen dos modalidades:
            Régimen General (sin contrato) y Régimen Intensivo (con contrato de formación).
          </p>
        </div>
      </div>

      {/* Selector de modalidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODALIDADES.map((m) => (
          <button
            key={m.id}
            onClick={() => update("modalidad", m.id)}
            className={`text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
              form.modalidad === m.id
                ? "border-accent shadow-lg ring-2 ring-accent/20"
                : "border-[var(--glass-border)] hover:border-accent/50"
            } ${m.color}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Handshake className="w-5 h-5 text-accent" />
              <div>
                <h3 className="text-sm font-bold text-foreground">{m.nombre}</h3>
                <p className="text-xs text-muted">{m.pct} en empresa · {m.ra} RA en empresa</p>
              </div>
            </div>
            <p className="text-xs text-muted leading-relaxed">{m.descripcion}</p>
            {m.contrato && (
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" /> Requiere contrato
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Formulario de empresa */}
      {form.modalidad && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" /> Datos de la empresa acogedora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">Nombre empresa</label>
              <Input value={form.empresa_nombre} onChange={(e) => update("empresa_nombre", e.target.value)} placeholder="Ej: Indra Sistemas S.A." />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">CIF</label>
              <Input value={form.empresa_cif} onChange={(e) => update("empresa_cif", e.target.value)} placeholder="Ej: A-28119143" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">Tutor empresa</label>
              <Input value={form.empresa_tutor} onChange={(e) => update("empresa_tutor", e.target.value)} placeholder="Nombre del tutor en la empresa" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">Tutor centro</label>
              <Input value={form.centro_tutor} onChange={(e) => update("centro_tutor", e.target.value)} placeholder="Nombre del tutor del centro" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 pt-2">
            <Calendar className="w-4 h-4 text-accent" /> Calendario y porcentajes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">% Tiempo en empresa</label>
              <Input type="number" value={form.pct_empresa} onChange={(e) => update("pct_empresa", e.target.value)} placeholder="Ej: 30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">% RA en empresa</label>
              <Input type="number" value={form.ra_en_empresa} onChange={(e) => update("ra_en_empresa", e.target.value)} placeholder="Ej: 15" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">Fecha inicio</label>
              <Input type="date" value={form.fecha_inicio} onChange={(e) => update("fecha_inicio", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted mb-1 block">Fecha fin</label>
              <Input type="date" value={form.fecha_fin} onChange={(e) => update("fecha_fin", e.target.value)} />
            </div>
          </div>

          {form.modalidad === "intensivo" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <input
                type="checkbox"
                checked={form.tiene_contrato}
                onChange={(e) => update("tiene_contrato", e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <label className="text-sm text-foreground">
                El alumno tiene <strong>contrato de formación en alternancia</strong> firmado
              </label>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => update("observaciones", e.target.value)}
              className="w-full p-3 rounded-lg border border-[var(--glass-border)] bg-background text-sm text-foreground resize-none"
              rows={3}
              placeholder="Notas adicionales sobre la formación dual..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Guardar configuración dual
            </Button>
            {saved && <span className="text-sm text-green-500 font-semibold">✓ Guardado</span>}
          </div>
        </Card>
      )}
    </div>
  );
}

