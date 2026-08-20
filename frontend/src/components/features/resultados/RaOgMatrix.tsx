"use client";
import React, { useEffect } from 'react';
import { Check, Link as LinkIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa, resolveOg, getOgList, loadCatalogForModule } from "@/services/catalogCache";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

export function RaOgMatrix() {
  const { t } = useTranslation();
  const { moduleData, updateInfoModulo, activeModuleId } = useAppStore();

  useEffect(() => { if (activeModuleId) loadCatalogForModule(activeModuleId); }, [activeModuleId]);

  const ogList = getOgList(activeModuleId || '');
  const ogs = ogList.length > 0 ? ogList : (moduleData?.info_modulo?.objetivos_generales || []).map((desc: string, i: number) => ({ id: String.fromCharCode(97 + i), desc }));
  const ras = moduleData?.df_ra || [];
  const mapping = moduleData?.info_modulo?.ra_og_mapping || {};

  const toggleMapping = (ogIndex: number, raId: string) => {
    const current = mapping[ogIndex] || [];
    let updated;
    if (current.includes(raId)) {
      updated = current.filter((id: string) => id !== raId);
    } else {
      updated = [...current, raId];
    }
    
    updateInfoModulo("ra_og_mapping", {
      ...mapping,
      [ogIndex]: updated
    });
  };

  if (!ogs.length || !ras.length) {
    return (
      <Card className="p-8 text-center border-t-4 border-t-yellow-500">
        <p className="text-muted">
          No hay Objetivos Generales o Resultados de aprendizaje configurados para este módulo.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-l-4 border-l-blue-500 overflow-hidden animate-in fade-in duration-500">
      <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-6">
        <LinkIcon className="w-5 h-5 text-info" /> Contribución de los RA a los OG del Título
      </h2>
      
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <table className="w-full text-left border-collapse text-body">
          <thead>
            <tr>
              <th className="p-3 border-b border-[var(--glass-border)] text-muted font-bold min-w-[300px]">
                {t('tablas.curriculo.objetivosGenerales', {defaultValue: 'Objetivos generales'})}
              </th>
              {ras.map((ra: any) => (
                <th 
                  key={ra.id_ra} 
                  className="p-3 border-b border-[var(--glass-border)] text-center text-foreground font-bold whitespace-nowrap cursor-help"
                  title={resolveDescRa(activeModuleId, ra)}
                >
                  <div className="bg-foreground/5 px-2 py-1 rounded border border-[var(--glass-border)]">
                    {ra.id_ra}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ogs.map((og: { id: string; desc: string }, idx: number) => (
              <tr key={idx} className="hover:bg-foreground/5 transition-colors border-b border-[var(--glass-border)]/50 group">
                <td className="p-3 align-top">
                  <div className="flex gap-2">
                    <span className="font-mono text-caption font-medium text-info mt-0.5">OG{og.id}.</span>
                    <span className="text-foreground/90 leading-relaxed">{og.desc}</span>
                  </div>
                </td>
                {ras.map((ra: any) => {
                  const isChecked = (mapping[idx] || []).includes(ra.id_ra);
                  return (
                    <td key={ra.id_ra} className="p-3 text-center align-middle">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleMapping(idx, ra.id_ra)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-info/10 text-info border border-info/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                              : 'bg-background border border-[var(--glass-border)] text-transparent hover:border-info/30 hover:bg-info/10'
                          }`}
                        >
                          {isChecked && <Check className="w-5 h-5" strokeWidth={3} />}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
