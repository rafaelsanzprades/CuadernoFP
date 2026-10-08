"use client";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bus } from "lucide-react";
import { useTranslation } from "react-i18next";

// Actividades complementarias y extraescolares del módulo (df_ace). Antes
// pestaña propia en Calendario; movida a Contexto -> Contextualización,
// justo detrás de "Contexto escolar" (2026-10-03, petición de Rafael).
export function ActividadesComplementariasTab() {
  const { t } = useTranslation();
  const { moduleData, updateDataFrame } = useAppStore();
  const df_ace = moduleData?.df_ace || [];
  const df_ra = moduleData?.df_ra || [];

  const addRowAce = () => {
    const newDf = [...df_ace];
    const newId = `ACE${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, Tipo: "Complementaria", RA_Vinculados: "", Actividad: "", Trimestre: "1T", Entidad: "", Evaluacion: "" });
    updateDataFrame("df_ace", newDf);
  };

  const updateRowAce = (idx: number, field: string, value: any) => {
    const newDf = [...df_ace];
    newDf[idx][field] = value;
    updateDataFrame("df_ace", newDf);
  };

  const removeRowAce = (idx: number) => {
    const newDf = [...df_ace];
    newDf.splice(idx, 1);
    updateDataFrame("df_ace", newDf);
  };

  return (
    <div className="space-y-3">
      <SectionHeading id="contexto-actividades" icon={Bus} scrollMt="260px">
        {t('campos.contexto.tituloActividades', {defaultValue: 'Actividades complementarias y extraescolares'})}
      </SectionHeading>
      <Card className="p-6 border-t-4 border-t-[#14a085]">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-body border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted">
                <th className="p-2 w-16">{t('tablas.calendario.id', {defaultValue: 'Id'})}</th>
                <th className="p-2 w-32">{t('common.tipo', {defaultValue: 'Tipo'})}</th>
                <th className="p-2 w-32">{t('tablas.calendario.raVinculados', {defaultValue: 'RA vinculados'})}</th>
                <th className="p-2 min-w-[200px]">{t('common.descripcion', {defaultValue: 'Descripción'})}</th>
                <th className="p-2 w-24">{t('tablas.calendario.trimestre', {defaultValue: 'Trimestre'})}</th>
                <th className="p-2 w-48">{t('tablas.calendario.entidad', {defaultValue: 'Entidad'})}</th>
                <th className="p-2 w-48">{t('tablas.calendario.evaluacion', {defaultValue: 'Evaluación'})}</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {df_ace.map((row: any, idx: number) => (
                <tr key={row.ID || idx} className="border-b border-white/5 hover:bg-foreground/5">
                  <td className="p-2 font-mono text-caption">{row.ID}</td>
                  <td className="p-2 pr-2">
                    <select value={row.Tipo || "Complementaria"} onChange={e => updateRowAce(idx, "Tipo", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="Complementaria">{t('checks.calendario.tipoComplementaria', {defaultValue: 'Complementaria'})}</option>
                      <option value="Extraescolar">{t('checks.calendario.tipoExtraescolar', {defaultValue: 'Extraescolar'})}</option>
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <select value={row.RA_Vinculados || ""} onChange={e => updateRowAce(idx, "RA_Vinculados", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="">-</option>
                      {df_ra.map((ra: any) => ra.id_ra && <option key={ra.id_ra} value={ra.id_ra}>{ra.id_ra}</option>)}
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Actividad || ""} onChange={e => updateRowAce(idx, "Actividad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <select value={row.Trimestre || "1T"} onChange={e => updateRowAce(idx, "Trimestre", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="1T">1t</option>
                      <option value="2T">2t</option>
                      <option value="3T">3t</option>
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Entidad || ""} onChange={e => updateRowAce(idx, "Entidad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Evaluacion || ""} onChange={e => updateRowAce(idx, "Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRowAce(idx)} className="text-danger hover:text-danger font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addRowAce} className="text-body text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1">
          <span>+</span> {t('botones.calendario.anadirActividadComplementaria', {defaultValue: 'Añadir actividad complementaria'})}
        </button>
      </Card>
    </div>
  );
}
