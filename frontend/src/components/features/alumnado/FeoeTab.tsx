import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Building2, Save, Printer, FileCheck2, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NarrativeField } from "@/components/ui/NarrativeField";

export function FeoeTab() {
  const { cursoData, updateCursoData } = useAppStore();
  const [printHover, setPrintHover] = useState<string | null>(null);

  const df_al = cursoData?.df_al || [];
  const df_feoe = cursoData?.df_feoe || [];
  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");

  const handleUpdateFeoe = (al_id: string, field: string, value: any) => {
    const newFeoe = [...df_feoe];
    let rowIdx = newFeoe.findIndex((r: any) => r.ID === al_id);
    if (rowIdx === -1) {
      newFeoe.push({ ID: al_id });
      rowIdx = newFeoe.length - 1;
    }
    newFeoe[rowIdx][field] = value;
    updateCursoData("df_feoe", newFeoe);
  };

  const handlePrint = (docName: string, alName: string) => {
    // Generación de documento visual en una pestaña nueva
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${docName} - ${alName}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            h1 { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
            .content { margin-top: 30px; }
            .signature { margin-top: 80px; display: flex; justify-content: space-between; }
            .signature div { border-top: 1px solid #333; width: 45%; text-align: center; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${docName}</h1>
          <p><strong>Alumno/a:</strong> ${alName}</p>
          <p><strong>Centro Educativo:</strong> CIFPA Cuaderno FP</p>
          <div class="content">
            <p>Este documento se autogenera a partir de los datos registrados en el módulo de Formación en Empresa u Organismo Equiparado (FEOE) / FP Dual.</p>
            <p>De acuerdo con la normativa vigente (RD 659/2023), este documento constituye el registro fehaciente del acuerdo o evaluación.</p>
          </div>
          <div class="signature">
            <div>El/La Tutor/a del Centro</div>
            <div>El/La Tutor/a de Empresa</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NarrativeField 
          id="textos_pd_feoe_organizacion"
          title="Organización y Modalidad de FEOE"
          description="Detalla cómo se organiza el alumnado (FEOE general, intensivo) y qué alternativas hay para el alumnado sin FEOE."
        />
        <NarrativeField 
          id="textos_pd_feoe_seguimiento"
          title="Seguimiento de FEOE"
          description="Procedimiento para el seguimiento en la empresa y comunicación con tutores duales."
        />
      </div>

      <Card className="p-6 border-t-4 border-t-indigo-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <span className="inline-flex"><Building2 className="w-[1.2em] h-[1.2em] mr-1 text-indigo-400" /></span> 
              Formación en Empresa (FEOE) / FP Dual
            </h2>
            <p className="text-sm text-muted mt-1">Gestión de convenios, seguimiento dual y firmas digitales.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold bg-foreground/10 px-3 py-1 rounded-full text-foreground">
              Alumnado: {df_evaluable.length}
            </span>
            <Button variant="secondary" className="gap-2" onClick={() => window.print()}>
              <Download className="w-4 h-4" /> Exportar Informe FEOE
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto bg-foreground/5 rounded-lg border border-[var(--glass-border)] pb-20">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-background text-muted border-b border-[var(--glass-border)]">
                <th className="p-3 font-semibold border-r border-[var(--glass-border)]">Alumnado</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)] text-center">Régimen</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)]">Empresa y Tutor</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)] text-center">Horas</th>
                <th className="p-3 font-semibold border-r border-[var(--glass-border)] text-center">Eval (1-4)</th>
                <th className="p-3 font-semibold text-center">Firma y Documentos</th>
              </tr>
            </thead>
            <tbody>
              {df_evaluable.map((al: any) => {
                const row = df_feoe.find((r: any) => r.ID === al.ID) || { ID: al.ID };
                const isHovered = printHover === al.ID;
                return (
                  <tr key={al.ID} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                    <td className="p-3 font-medium sticky left-0 z-10 bg-background border-r border-[var(--glass-border)]">
                      {al.Apellidos}, {al.Nombre}
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <select 
                        value={row.Regimen || "General"}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Regimen", e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center"
                      >
                        <option value="General">General</option>
                        <option value="Intensivo">Intensivo</option>
                        <option value="Exento">Exento (Art. 49)</option>
                      </select>
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)] flex gap-2">
                      <input 
                        type="text"
                        placeholder="Empresa..."
                        value={row.Empresa || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Empresa", e.target.value)}
                        className="w-1/2 min-w-[120px] bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted/40"
                      />
                      <input 
                        type="text"
                        placeholder="Tutor..."
                        value={row.TutorEmpresa || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "TutorEmpresa", e.target.value)}
                        className="w-1/2 min-w-[120px] bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted/40"
                      />
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <input 
                        type="number"
                        placeholder="H"
                        value={row.Horas || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Horas", e.target.value)}
                        className="w-16 text-center mx-auto block bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </td>
                    <td className="p-2 border-r border-[var(--glass-border)]">
                      <select
                        value={row.Evaluacion || ""}
                        onChange={(e) => handleUpdateFeoe(al.ID, "Evaluacion", e.target.value)}
                        className={`w-16 text-center mx-auto block font-bold bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                          !row.Evaluacion ? 'text-muted/50' : 
                          Number(row.Evaluacion) < 2 ? 'text-danger' : 'text-success'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="1" className="text-danger">1</option>
                        <option value="2" className="text-success">2</option>
                        <option value="3" className="text-success">3</option>
                        <option value="4" className="text-success">4</option>
                      </select>
                    </td>
                    <td className="p-2 text-center" onMouseEnter={() => setPrintHover(al.ID)} onMouseLeave={() => setPrintHover(null)}>
                      <div className="flex items-center justify-center gap-2 relative">
                        <select
                          value={row.EstadoFirma || "Pendiente"}
                          onChange={(e) => {
                            handleUpdateFeoe(al.ID, "EstadoFirma", e.target.value);
                            if (e.target.value === "Firmado") {
                              handleUpdateFeoe(al.ID, "FechaFirma", new Date().toISOString().split('T')[0]);
                            } else {
                              handleUpdateFeoe(al.ID, "FechaFirma", "");
                            }
                          }}
                          className={`w-28 text-center text-xs font-semibold bg-transparent border rounded-full px-2 py-1 focus:outline-none transition-all ${
                            row.EstadoFirma === 'Enviado' ? 'border-warning/50 text-warning bg-warning/10' :
                            row.EstadoFirma === 'Firmado' ? 'border-success/50 text-success bg-success/10' :
                            'border-foreground/20 text-muted hover:border-foreground/40'
                          }`}
                        >
                          <option value="Pendiente" className="text-foreground">Pendiente</option>
                          <option value="Enviado" className="text-foreground">📨 Enviado</option>
                          <option value="Firmado" className="text-foreground">✅ Firmado</option>
                        </select>
                        
                        {/* Overlay contextual para imprimir */}
                        {isHovered && (
                          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex gap-1 bg-background border border-[var(--glass-border)] shadow-xl p-1 rounded-lg z-50 animate-in slide-in-from-right-2">
                            <button onClick={() => handlePrint("Anexo de Convenio", `${al.Nombre} ${al.Apellidos}`)} className="p-1.5 hover:bg-foreground/10 rounded group relative" title="Anexo Convenio">
                              <FileCheck2 className="w-4 h-4 text-info" />
                            </button>
                            <button onClick={() => handlePrint("Plan de Formación Individualizado", `${al.Nombre} ${al.Apellidos}`)} className="p-1.5 hover:bg-foreground/10 rounded" title="Plan de Formación">
                              <Printer className="w-4 h-4 text-accent" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
