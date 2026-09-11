"use client";
import React, { useMemo } from "react";
import { Layers, ExternalLink, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { getOgList } from "@/services/catalogCache";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

// Pestaña "Contenidos -> UD" (ítem 5 del backlog, bloque 5 de Alcántara-Alabort):
// tabla Bloque de contenidos | Contenidos por UD | RA | Obj | Nº horas | EVAL.
// Pura proyección de datos ya existentes -- solo `bloque_contenido` (en la UD)
// se edita aquí; el resto se edita en su pestaña de origen (Unidades
// didácticas, Contribución RA->OG, Instrumento).

const SIN_BLOQUE = "__sin_bloque__";

export function ContenidosUdTab() {
  const { t } = useTranslation();
  const { moduleData, activeModuleId, updateDataFrame } = useAppStore();

  const df_ud = moduleData?.df_ud || [];
  const df_ra = moduleData?.df_ra || [];
  const df_act = moduleData?.df_act || [];
  const ogMapping = moduleData?.info_modulo?.ra_og_mapping || {};

  const ogList = getOgList(activeModuleId || "");
  const ogs = ogList.length > 0 ? ogList : (moduleData?.info_modulo?.objetivos_generales || []).map((desc: string, i: number) => ({ id: String.fromCharCode(97 + i), desc }));

  // RA -> lista de ids de OG a los que contribuye (invierte ra_og_mapping,
  // que está indexado por posición de OG, no por su id).
  const raToOg = useMemo(() => {
    const map: Record<string, string[]> = {};
    ogs.forEach((og: { id: string; desc: string }, idx: number) => {
      (ogMapping[idx] || []).forEach((raId: string) => {
        if (!map[raId]) map[raId] = [];
        map[raId].push(og.id);
      });
    });
    return map;
  }, [ogs, ogMapping]);

  const bloques = useMemo(() => {
    const map = new Map<string, any[]>();
    df_ud.forEach((ud: any) => {
      const key = (ud.bloque_contenido || "").trim() || SIN_BLOQUE;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ud);
    });
    // "Sin bloque" siempre al final, el resto en orden de aparición.
    const entries = Array.from(map.entries());
    entries.sort((a, b) => (a[0] === SIN_BLOQUE ? 1 : 0) - (b[0] === SIN_BLOQUE ? 1 : 0));
    return entries;
  }, [df_ud]);

  const handleBloqueChange = (idUd: string, value: string) => {
    const newUd = df_ud.map((ud: any) => (ud.id_ud === idUd ? { ...ud, bloque_contenido: value } : ud));
    updateDataFrame("df_ud", newUd);
  };

  if (df_ud.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <p className="text-foreground/80">{t('campos.curriculo.sinUnidadesDidacticas', { defaultValue: 'Todavía no hay unidades didácticas definidas -- créalas en la pestaña "Unidades didácticas".' })}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="p-6 border-l-4 border-l-indigo-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-1">
              <Layers className="w-5 h-5 text-indigo-400" />
              {t('tabs.curriculo.contenidosUd.label', { defaultValue: 'Contenidos → UD' })}
            </h2>
            <p className="text-body text-muted">
              {t('campos.curriculo.contenidosUdDescripcion', { defaultValue: 'Agrupa las unidades didácticas por bloque de contenidos y muestra de un vistazo su relación con RA, objetivos generales, horas e instrumentos de evaluación.' })}
            </p>
          </div>
          <Link
            href="/magia?tab=programacion"
            className="shrink-0 inline-flex items-center gap-1.5 text-body font-semibold text-info hover:text-info/80 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4" />
            {t('botones.curriculo.descargarPdfMagia', { defaultValue: 'Descargar PDF/DOCX en MagIA' })}
          </Link>
        </div>
      </Card>

      {bloques.map(([bloque, uds]) => (
        <Card key={bloque} className="p-6 overflow-hidden">
          <h3 className="text-body font-bold text-foreground/90 mb-3 flex items-center gap-2">
            {bloque === SIN_BLOQUE
              ? <span className="text-muted italic">{t('campos.curriculo.sinBloqueAsignado', { defaultValue: 'Sin bloque asignado' })}</span>
              : bloque}
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse text-body">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="p-2 text-muted font-semibold min-w-[160px]">{t('campos.curriculo.bloqueContenido', { defaultValue: 'Bloque de contenidos' })}</th>
                  <th className="p-2 text-muted font-semibold min-w-[280px]">{t('campos.curriculo.contenidosPorUd', { defaultValue: 'Contenidos por UD' })}</th>
                  <th className="p-2 text-muted font-semibold text-center">RA</th>
                  <th className="p-2 text-muted font-semibold text-center">Obj</th>
                  <th className="p-2 text-muted font-semibold text-center">{t('campos.curriculo.numHoras', { defaultValue: 'Nº horas' })}</th>
                  <th className="p-2 text-muted font-semibold min-w-[160px]">EVAL.</th>
                </tr>
              </thead>
              <tbody>
                {uds.map((ud: any) => {
                  const rasVinculados = df_ra.filter((ra: any) => Number(ud[ra.id_ra]) > 0);
                  const ogIds = Array.from(new Set(rasVinculados.flatMap((ra: any) => raToOg[ra.id_ra] || [])));
                  const evalActs = df_act.filter((act: any) => act.id_ud === ud.id_ud);
                  return (
                    <tr key={ud.id_ud} className="border-b border-white/5 hover:bg-foreground/5 transition-colors align-top">
                      <td className="p-2">
                        <input
                          type="text"
                          value={ud.bloque_contenido || ""}
                          onChange={(e) => handleBloqueChange(ud.id_ud, e.target.value)}
                          placeholder={t('placeholders.curriculo.bloqueContenido', { defaultValue: 'Sin asignar...' })}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-info focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <div className="font-semibold text-foreground">{ud.id_ud}</div>
                        <div className="text-foreground/80">{ud.desc_ud}</div>
                      </td>
                      <td className="p-2 text-center">
                        {rasVinculados.length > 0
                          ? rasVinculados.map((ra: any) => (
                              <span key={ra.id_ra} className="inline-block bg-info/10 text-info border border-info/30 rounded px-1.5 py-0.5 text-caption font-semibold mr-1 mb-1">{ra.id_ra}</span>
                            ))
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="p-2 text-center">
                        {ogIds.length > 0
                          ? ogIds.map((id) => (
                              <span key={id} className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded px-1.5 py-0.5 text-caption font-semibold mr-1 mb-1">OG{id}</span>
                            ))
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="p-2 text-center font-semibold">{ud.horas_ud || 0}</td>
                      <td className="p-2">
                        {evalActs.length > 0
                          ? evalActs.map((act: any) => (
                              <span key={act.id_act} className="inline-block bg-success/10 text-success border border-success/30 rounded px-1.5 py-0.5 text-caption font-semibold mr-1 mb-1">{act.id_act}</span>
                            ))
                          : <span className="text-muted flex items-center gap-1 text-caption"><HelpCircle className="w-3.5 h-3.5" />{t('campos.curriculo.sinInstrumento', { defaultValue: 'sin asignar' })}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
