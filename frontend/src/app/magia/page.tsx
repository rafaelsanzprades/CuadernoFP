"use client";
import { BarChart, Calculator, Calendar, CalendarDays, ChevronDown, Download, FileEdit, FileSpreadsheet, FileText, FolderOpen, GraduationCap, MapPin, Scale, Sparkles, User, Users, X, Grid, BookOpen, Target, Award, ShieldCheck, Contact, TrendingUp, Compass, Lightbulb, Wrench } from "lucide-react";
import * as XLSX from "xlsx";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { Alumnado } from "@/types";
import { isAlumnoActivo } from "@/utils/alumnado";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabSync } from "@/components/ui/TabSync";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { getAutoMilestones } from "@/utils/calendarMilestones";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type DownloadOpts = {
  al_id?: string;
  item_id?: string;
  fechaCorte?: string;
  extra?: Record<string, any>;
};

/** Par de botones "Vista .pdf" / "Editable .docx" para los generadores que
 * soportan ambos formatos. */
function DualDownloadButtons({
  type, opts, downloadingStr, onDownload, pdfLabel, docxLabel,
}: {
  type: string;
  opts?: DownloadOpts;
  downloadingStr: string | null;
  onDownload: (type: string, fileFormat: string, opts?: DownloadOpts) => void;
  pdfLabel?: string;
  docxLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 mt-auto">
      <Button onClick={() => onDownload(type, "pdf", opts)} disabled={downloadingStr === `${type}_pdf`} className="flex-1">
        {downloadingStr === `${type}_pdf` ? "⏳..." : (pdfLabel ?? t('botones.magia.vistaPdf', {defaultValue: 'Vista .pdf'}))}
      </Button>
      <Button variant="secondary" onClick={() => onDownload(type, "docx", opts)} disabled={downloadingStr === `${type}_docx`} className="flex-1">
        {downloadingStr === `${type}_docx` ? "⏳..." : (docxLabel ?? t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'}))}
      </Button>
    </div>
  );
}

const guiaMarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className="text-heading font-extrabold text-foreground mb-6 pb-2 border-b border-white/10" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-subheading font-bold text-accent mt-8 mb-4 flex items-center gap-2" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-subheading font-bold text-foreground mt-6 mb-3" {...props} />,
  p: ({ node, ...props }: any) => <p className="text-muted leading-relaxed mb-4" {...props} />,
  ul: ({ node, className, ...props }: any) => <ul className={`list-none space-y-3 mb-6 ml-4 ${className || ''}`} {...props} />,
  ol: ({ node, className, ...props }: any) => <ol className={`list-decimal space-y-3 mb-6 ml-6 ${className || ''}`} {...props} />,
  li: ({ node, ...props }: any) => <li className="text-body text-muted leading-relaxed" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-bold text-foreground" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-accent hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({ node, ...props }: any) => <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-body font-mono" {...props} />,
  pre: ({ node, ...props }: any) => <pre className="block bg-foreground/5 p-4 rounded-xl text-body font-mono overflow-x-auto mb-4 border border-white/5 text-muted" {...props} />,
  hr: ({ node, ...props }: any) => <hr className="border-white/10 my-8" {...props} />,
  table: ({ node, ...props }: any) => <div className="overflow-x-auto mb-6"><table className="w-full text-left border-collapse" {...props} /></div>,
  th: ({ node, ...props }: any) => <th className="p-2 border border-[var(--glass-border)] bg-foreground/5 text-body font-bold text-foreground" {...props} />,
  td: ({ node, ...props }: any) => <td className="p-2 border border-[var(--glass-border)] text-body text-muted" {...props} />,
};

export default function MagiaPage() {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [downloadingStr, setDownloadingStr] = useState<string | null>(null);
  const [guiaContent, setGuiaContent] = useState<string | null>(null);

  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData } = useAppStore();
  // df_sgmt / planning_ledger guardados en cursoData no se sincronizan con el
  // cálculo dinámico de Planificación (useDynamicPlanning se recalcula en
  // memoria y nunca se escribe de vuelta al store) — para que los
  // generadores de PD lean datos al día se recalculan aquí y se inyectan en
  // el payload al pedir el PDF.
  // El backend (generadores de PDF) espera planning_ledger con claves
  // dd/mm/yyyy, igual que calendar_notes — no el yyyy-mm-dd ISO que usa
  // internamente el cálculo dinámico.
  const { df_sgmt: liveDfSgmt, planningLedgerDmy: livePlanningLedger } = useDynamicPlanning();
  // Hitos derivados de Fechas generales (Inicio clases, Fin de trimestre...)
  // que se muestran solos como "relevante" sin que el profesor los escriba
  // a mano en Eventos y festivos — se fusionan aquí con las notas manuales
  // antes de mandarlas al backend.
  const liveCalendarNotes = useMemo(() => {
    const auto = getAutoMilestones(cursoData?.info_fechas);
    const merged: Record<string, string> = { ...(cursoData?.calendar_notes || {}) };
    for (const [dmy, label] of Object.entries(auto)) {
      const key = `r_${dmy}`;
      merged[key] = merged[key] ? `${merged[key]} / ${label}` : label;
    }
    return merged;
  }, [cursoData?.info_fechas, cursoData?.calendar_notes]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("programacion");

  const [fechaFinal, setFechaFinal] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [activeModuleId, activeCursoId, moduleData, cursoData, setModuleData, setCursoData]);

  useEffect(() => {
    if (cursoData?.info_fechas) {
      setFechaFinal(cursoData.info_fechas.fin_curso || "");
    }
  }, [cursoData?.info_fechas]);

  useEffect(() => {
    if (activeTab !== "guia" || guiaContent !== null) return;
    fetch("/Guia.md")
      .then(res => res.text())
      .then(text => setGuiaContent(text))
      .catch(err => {
        console.error(err);
        setGuiaContent("Error cargando el contenido.");
      });
  }, [activeTab, guiaContent]);

  const formatD = (dStr: string | undefined) => {
    if (!dStr) return "---";
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  // Descarga genérica: PDF (visor integrado) o DOCX (descarga directa)
  const handleDownloadPdf = async (type: string, fileFormat: string = "pdf", opts?: DownloadOpts) => {
    const { al_id, item_id, fechaCorte, extra } = opts || {};
    try {
      setDownloadingStr(`${type}_${fileFormat}`);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=${type}&file_format=${fileFormat}`;
      if (al_id) url += `&al_id=${al_id}`;
      if (item_id) url += `&item_id=${item_id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso_data: { ...(cursoData || {}), df_sgmt: liveDfSgmt, planning_ledger: livePlanningLedger, calendar_notes: liveCalendarNotes },
          module_data: moduleData || {},
          fecha_corte: fechaCorte,
          extra: extra || null,
        })
      });

      if (!response.ok) throw new Error("Error generando documento");

      const contentType = response.headers.get("Content-Type");
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      let finalExt = fileFormat;
      if (contentType && contentType.includes("wordprocessingml.document")) {
        finalExt = "docx";
      }

      const now = new Date();
      const yyyy = String(now.getFullYear());
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const mmin = String(now.getMinutes()).padStart(2, '0');
      const timestampStr = `${yyyy}${mm}${dd}-${hh}${mmin}`;

      let downloadName = `${type}_${Date.now()}.${finalExt}`;
      if (type === 'programacion_minima_tpl') {
        downloadName = `${timestampStr} PD ARAGÓN Resumen.${finalExt}`;
      } else if (type === 'programacion_suficiente_tpl') {
        downloadName = `${timestampStr} PD ARAGÓN Simplificada.${finalExt}`;
      } else if (type === 'programacion_jeg') {
        downloadName = `${timestampStr} PD ARAGÓN JEG.${finalExt}`;
      }

      if (finalExt === "pdf") {
        setPreviewUrl(urlBlob);
        setPreviewFilename(downloadName);
      } else {
        if (fileFormat === "pdf") {
          toast(t('toasts.magia.pdfFallback', {defaultValue: "No se pudo generar el PDF. Descargando DOCX como alternativa."}), { icon: '⚠️', duration: 5000 });
        }
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlBlob);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.magia.errorGenerarDocumento', {defaultValue: "Error al generar el documento. Comprueba la conexión con el backend."}));
    } finally {
      setDownloadingStr(null);
    }
  };

  const handleExportXlsx = (triKey: string, fechaCorte?: string) => {
    const df_al = cursoData?.df_al || [];
    const df_eval = cursoData?.df_eval || [];
    const activeAl = df_al.filter(isAlumnoActivo);
    activeAl.sort((a: Alumnado, b: Alumnado) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

    const rows = activeAl.map((al: any) => {
      const evRow = df_eval.find((e: any) => e.ID === al.ID);
      const notaMedia = evRow
        ? (triKey === 'Final' ? evRow.Nota_Final_FO : triKey === 'Extraordinaria' ? evRow.Nota_Final_FE : evRow[`${triKey}_Nota`])
        : "";
      return {
        ID: al.ID,
        Apellidos: al.Apellidos || "",
        Nombre: al.Nombre || "",
        [`Nota media ${triKey}`]: notaMedia ?? "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 10 }, { wch: 24 }, { wch: 18 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, triKey.slice(0, 31));
    XLSX.writeFile(wb, `Notas_${triKey}_${moduleData?.info_modulo?.modulo || "modulo"}.xlsx`);
  };

  const df_al = cursoData?.df_al || [];
  const activeAlumnado = df_al.filter(isAlumnoActivo);
  activeAlumnado.sort((a: Alumnado, b: Alumnado) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const df_ud = moduleData?.df_ud || [];
  const df_act = moduleData?.df_act || [];

  const TABS = [
    { id: "comunidades", label: <span className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {t('tabs.magia.comunidades.label', {defaultValue: 'Comunidades'})}</span>, cleanLabel: t('tabs.magia.comunidades.label', {defaultValue: 'Comunidades'}) },
    { id: "guia", label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 shrink-0" /> {t('tabs.magia.guia.label', {defaultValue: 'Guía'})}</span>, cleanLabel: t('tabs.magia.guia.label', {defaultValue: 'Guía'}) },
    { id: "programacion", label: <span className="flex items-center gap-2"><FileText className="w-4 h-4 shrink-0" /> {t('tabs.magia.programacion.label', {defaultValue: 'Programación'})}</span>, cleanLabel: t('tabs.magia.programacion.label', {defaultValue: 'Programación'}) },
    { id: "curso", label: <span className="flex items-center gap-2"><Calendar className="w-4 h-4 shrink-0" /> {t('tabs.magia.curso.label', {defaultValue: 'Curso'})}</span>, cleanLabel: t('tabs.magia.curso.label', {defaultValue: 'Curso'}) },
  ];

  const TAB_DESCRIPTIONS: Record<string, string> = {
    comunidades: t('tabs.magia.comunidades.desc', {defaultValue: 'Generación de la programación didáctica oficial, por comunidad autónoma.'}),
    guia: t('tabs.magia.guia.desc', {defaultValue: 'Guía de inicio y prompt para IA: qué datos pedir al docente y dónde colocarlos en la app.'}),
    programacion: t('tabs.magia.programacion.desc', {defaultValue: 'Documentos de apoyo: matriz de currículo y documentos individuales de UD/Tareas.'}),
    curso: t('tabs.magia.curso.desc', {defaultValue: 'Calendario, seguimiento, plano de aula, boletines y actas de evaluación del curso.'}),
  };

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel || activeTab;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {previewUrl ? (
            <div className="absolute inset-0 z-50 bg-background flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <h3 className="font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-danger" /> {previewFilename}
                </h3>
                <div className="flex items-center gap-3">
                  <Button variant="primary" onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewUrl;
                    a.download = previewFilename || "documento.pdf";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }} className="gap-2">
                    <Download className="w-4 h-4" /> {t('common.descargar_pdf', {defaultValue: 'Descargar PDF'})}
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    setPreviewUrl(null);
                    setPreviewFilename(null);
                  }} className="text-muted hover:text-foreground">
                    <X className="w-5 h-5" /> {t('botones.magia.cerrarVisor', {defaultValue: 'Cerrar visor'})}
                  </Button>
                </div>
              </div>
              <div className="flex-1 w-full p-4">
                <iframe src={previewUrl} className="w-full h-full rounded-xl border border-[var(--glass-border)] shadow-xl bg-white" title="Vista previa PDF" />
              </div>
            </div>
          ) : (
            <div className="p-8">
              <MotionWrapper className="w-full space-y-3 pb-12">

                <PageHeader
                  icon={Sparkles}
                  title={t('nav.magia', { defaultValue: 'MagIA' })}
                  description={t('pages.magia_desc', { defaultValue: 'Generación de la programación didáctica y reportes.' })}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="max-w-full">
                      {TABS.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

                {/* ══════════════════════════ COMUNIDADES ══════════════════════════ */}
                {activeTab === "comunidades" && (
                  <div className="pt-2 space-y-6">
                    {(!activeCursoId || !activeModuleId) ? (
                      <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                        <FileText className="w-16 h-16 text-muted-foreground opacity-50" />
                        <h2 className="text-heading font-bold">No hay curso ni programación cargada</h2>
                        <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                        <Link href="/archivos">
                          <Button variant="primary" className="gap-2">
                            <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                          </Button>
                        </Link>
                      </Card>
                    ) : (loadingData || !cursoData || !moduleData) ? (
                      <Card className="p-12">
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-1/4" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        {["Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana", "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Ceuta", "Melilla"].map((comunidad) => {
                          const isAragon = comunidad === "Aragón";
                          return (
                            <details key={comunidad} open={isAragon} className="group border border-[var(--glass-border)] rounded-xl bg-background/50 mb-4 shadow-sm overflow-hidden">
                              <summary className="p-4 font-bold cursor-pointer text-subheading flex items-center justify-between hover:bg-foreground/5 transition-colors list-none border-b border-transparent group-open:border-[var(--glass-border)] group-open:bg-foreground/5">
                                <span className="flex items-center gap-2"><MapPin className={`w-5 h-5 ${isAragon ? 'text-purple-500' : 'text-muted-foreground'}`} /> {comunidad}</span>
                                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-muted" />
                              </summary>
                              {isAragon ? (
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD-. Resumen para el alumnado</h3>
                                        <p className="text-body text-muted mb-6">Documento de un folio para entregar al alumnado. Contiene información básica y criterios de calificación.</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button onClick={() => handleDownloadPdf('programacion_minima_tpl', 'docx')} disabled={downloadingStr === 'programacion_minima_tpl_docx'} className="w-full">
                                          {downloadingStr === 'programacion_minima_tpl_docx' ? '⏳...' : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD=. Programación didáctica Simplificada</h3>
                                        <p className="text-body text-muted mb-6">Versión simplificada con los puntos de la Ley muy específica y concreta (no detalla secuenciación de aula ni extensa teoría).</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button onClick={() => handleDownloadPdf('programacion_suficiente_tpl', 'docx')} disabled={downloadingStr === 'programacion_suficiente_tpl_docx'} className="w-full">
                                          {downloadingStr === 'programacion_suficiente_tpl_docx' ? '⏳...' : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD+. Programación didáctica CIFPA</h3>
                                        <p className="text-body text-muted mb-6">Se cumplimenta el modelo oficial de programación completo.</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button onClick={() => handleDownloadPdf('programacion_jeg', 'docx')} disabled={downloadingStr === 'programacion_jeg_docx'} className="w-full">
                                          {downloadingStr === 'programacion_jeg_docx' ? '⏳...' : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD-. Resumen para el alumnado</h3>
                                        <p className="text-body text-muted mb-6">Documento de un folio para entregar al alumnado. Contiene información básica y criterios de calificación.</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button disabled className="w-full">{t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}</Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD=. Programación didáctica ({comunidad})</h3>
                                        <p className="text-body text-muted mb-6">Versión ajustada a la normativa oficial de {comunidad}.</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button disabled className="w-full">{t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}</Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                                      <div>
                                        <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD+. Programación didáctica detallada ({comunidad})</h3>
                                        <p className="text-body text-muted mb-6">Se cumplimenta el modelo oficial de programación completo.</p>
                                      </div>
                                      <div className="mt-auto">
                                        <Button disabled className="w-full">{t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}</Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </details>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════ GUÍA (guía de inicio) ══════════════════════════ */}
                {activeTab === "guia" && (
                  <Card glow className="p-8">
                    {guiaContent === null ? (
                      <div className="flex justify-center p-8 text-muted">Cargando...</div>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={guiaMarkdownComponents}>
                          {guiaContent}
                        </ReactMarkdown>
                      </div>
                    )}
                  </Card>
                )}

                {/* ══════════════════════════ PROGRAMACIÓN (documentos de apoyo) ══════════════════════════ */}
                {/* 4 bloques, mismo orden y nombres que el grupo "Programación" del sidebar:
                    Contexto / Currículo / Metodología / Instrumentos. */}
                {activeTab === "programacion" && (
                  <div className="pt-2 space-y-4">
                    {(!activeCursoId || !activeModuleId) ? (
                      <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                        <FileText className="w-16 h-16 text-muted-foreground opacity-50" />
                        <h2 className="text-heading font-bold">No hay curso ni programación cargada</h2>
                        <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                        <Link href="/archivos">
                          <Button variant="primary" className="gap-2">
                            <FolderOpen className="w-4 h-4" /> {t('common.ir_a_mis_archivos', {defaultValue: 'Ir a mis archivos'})}
                          </Button>
                        </Link>
                      </Card>
                    ) : (loadingData || !cursoData || !moduleData) ? (
                      <Card className="p-12">
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-1/4" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        {/* ── Contexto ── */}
                        <Card className="p-6 border-t-4 border-t-teal-500">
                          <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Compass className="w-4 h-4" /></span> Contexto</h2>
                          <p className="text-body text-muted mb-2">Información general y características del entorno.</p>
                          <p className="text-caption text-muted italic">Sin documentos de apoyo todavía en esta sección.</p>
                        </Card>

                        {/* ── Currículo ── */}
                        <Card className="p-6 border-t-4 border-t-teal-500">
                          <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Grid className="w-4 h-4" /></span> Currículo</h2>
                          <p className="text-body text-muted mb-6">Cruce de resultados de aprendizaje y criterios; documentos de UD y tareas.</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><Grid className="w-[1.2em] h-[1.2em] mr-1" /></span> Matriz RA ↔ UD</h3>
                                <p className="text-body text-muted mb-6">Tabla cruzada de RA y su relación con las Unidades Didácticas.</p>
                              </div>
                              <DualDownloadButtons type="matrices" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                            </div>

                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Unidad didáctica</h3>
                                {df_ud.length > 0 ? (
                                  <select id="ud_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold mb-4">
                                    {df_ud.map((u: any) => (
                                      <option key={u.id_ud} value={u.id_ud}>{u.id_ud} - {u.desc_ud}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <p className="text-muted italic mb-4">No hay Unidades Didácticas definidas.</p>
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  const sel = document.getElementById('ud_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf('ud', 'docx', { item_id: sel.value });
                                }}
                                disabled={df_ud.length === 0 || downloadingStr === 'ud_docx'} className="w-full"
                              >
                                {downloadingStr === 'ud_docx' ? t('botones.magia.generandoDocx', {defaultValue: '⏳ Generando DOCX...'}) : t('botones.magia.descargarUdDocx', {defaultValue: 'Descargar UD.docx'})}
                              </Button>
                            </div>

                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> Tarea competencial</h3>
                                {df_act.length > 0 ? (
                                  <select id="tarea_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold mb-4">
                                    {df_act.map((t: any) => (
                                      <option key={t.ID || t.id_act} value={t.ID || t.id_act}>{t.ID || t.id_act} - {t.Nombre_Tarea || ''}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <p className="text-muted italic mb-4">No hay Tareas competenciales definidas.</p>
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  const sel = document.getElementById('tarea_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf('tarea', 'docx', { item_id: sel.value });
                                }}
                                disabled={df_act.length === 0 || downloadingStr === 'tarea_docx'} className="w-full"
                              >
                                {downloadingStr === 'tarea_docx' ? t('botones.magia.generandoDocx', {defaultValue: '⏳ Generando DOCX...'}) : t('botones.magia.descargarTareaDocx', {defaultValue: 'Descargar tarea.docx'})}
                              </Button>
                            </div>
                          </div>
                        </Card>

                        {/* ── Metodología ── */}
                        <Card className="p-6 border-t-4 border-t-teal-500">
                          <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Lightbulb className="w-4 h-4" /></span> Metodología</h2>
                          <p className="text-body text-muted mb-2">Estrategias metodológicas y recursos.</p>
                          <p className="text-caption text-muted italic">Sin documentos de apoyo todavía en esta sección.</p>
                        </Card>

                        {/* ── Instrumentos ── */}
                        <Card className="p-6 border-t-4 border-t-teal-500">
                          <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Wrench className="w-4 h-4" /></span> Instrumentos</h2>
                          <p className="text-body text-muted mb-2">Definición y pesos de las herramientas de evaluación.</p>
                          <p className="text-caption text-muted italic">Sin documentos de apoyo todavía en esta sección.</p>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════ CURSO ══════════════════════════ */}
                {/* 4 bloques, mismo orden y nombres que el grupo "Curso" del sidebar:
                    Calendario / Alumnado / Seguimiento / Calificaciones. */}
                {activeTab === 'curso' && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {/* ── Calendario ── */}
                    <Card className="p-6 border-t-4 border-t-emerald-500">
                      <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Calendar className="w-4 h-4" /></span> Calendario</h2>
                      <p className="text-body text-muted mb-6">Horario, trimestres, festivos y eventos.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><CalendarDays className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario académico</h3>
                            <p className="text-body text-muted mb-6">Vista global del curso con fechas, sesiones y eventos.</p>
                          </div>
                          <DualDownloadButtons type="calendario" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                        </div>
                      </div>
                    </Card>

                    {/* ── Alumnado ── */}
                    <Card className="p-6 border-t-4 border-t-emerald-500">
                      <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Users className="w-4 h-4" /></span> Alumnado</h2>
                      <p className="text-body text-muted mb-6">Fichas personales y ubicación en el aula.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado. Ubicación en el aula</h3>
                            <p className="text-body text-muted mb-6">Distribución y ubicación del alumnado en el aula.</p>
                          </div>
                          <DualDownloadButtons type="alumnado_ubicacion" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                        </div>

                        {activeAlumnado.length > 0 && (
                          <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                            <div>
                              <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Progreso del alumnado</h3>
                              <p className="text-body text-muted mb-4">Genera un informe del avance del alumnado.</p>
                              <select id="alumnado_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold">
                                {activeAlumnado.map((al: Alumnado) => (
                                  <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre} ({al.ID})</option>
                                ))}
                              </select>
                            </div>
                            <div className="mt-6">
                              <DualDownloadButtons
                                type="individual"
                                downloadingStr={downloadingStr}
                                onDownload={(type, fmt) => {
                                  const sel = document.getElementById('alumnado_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf(type, fmt, { al_id: sel.value });
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {activeAlumnado.length > 0 && (
                          <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                            <div>
                              <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><Contact className="w-[1.2em] h-[1.2em] mr-1" /></span> Ficha individual</h3>
                              <p className="text-body text-muted mb-4">Ficha de matrícula + tutoría de un alumno/a, para llevar a una reunión de orientación.</p>
                              <select id="ficha_al_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold">
                                {activeAlumnado.map((al: Alumnado) => (
                                  <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre} ({al.ID})</option>
                                ))}
                              </select>
                            </div>
                            <div className="mt-6">
                              <DualDownloadButtons
                                type="ficha_alumnado"
                                downloadingStr={downloadingStr}
                                onDownload={(type, fmt) => {
                                  const sel = document.getElementById('ficha_al_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf(type, fmt, { al_id: sel.value, extra: { module_document_id: activeCursoId } });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* ── Seguimiento ── */}
                    <Card className="p-6 border-t-4 border-t-emerald-500">
                      <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><TrendingUp className="w-4 h-4" /></span> Seguimiento</h2>
                      <p className="text-body text-muted mb-6">Diario de clases, secuenciación por UD y planificación mensual.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Seguimiento diario</h3>
                            <p className="text-body text-muted mb-6">Registro detallado de la planificación del día a día.</p>
                          </div>
                          <DualDownloadButtons type="seguimiento" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                        </div>
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Clases por UD</h3>
                            <p className="text-body text-muted mb-6">Secuenciación de sesiones de cada Unidad didáctica.</p>
                          </div>
                          <DualDownloadButtons type="clases_ud" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                        </div>
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-subheading font-bold mb-2"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Planificación</h3>
                            <p className="text-body text-muted mb-6">Distribución temporal mensual (previsto/impartido) por UD.</p>
                          </div>
                          <DualDownloadButtons type="planificacion" downloadingStr={downloadingStr} onDownload={handleDownloadPdf} />
                        </div>
                      </div>
                    </Card>

                    {/* ── Calificaciones ── */}
                    <Card className="p-6 border-t-4 border-t-blue-500">
                      <h2 className="text-heading font-bold mb-1"><span className="inline-flex"><Award className="w-4 h-4" /></span> Calificaciones</h2>
                      <p className="text-body text-muted mb-6">Boletines, actas de evaluación e informes por alumno/a.</p>

                      {/* Primera fila: 3 Trimestres */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { key: "1T", tipo: "grupal_1t", label: "1er trimestre", ini: cursoData?.info_fechas?.ini_1t, fin: cursoData?.info_fechas?.fin_1t },
                          { key: "2T", tipo: "grupal_2t", label: "2º trimestre", ini: cursoData?.info_fechas?.ini_2t, fin: cursoData?.info_fechas?.fin_2t },
                          { key: "3T", tipo: "grupal_3t", label: "3er trimestre", ini: cursoData?.info_fechas?.ini_3t, fin: cursoData?.info_fechas?.fin_3t },
                        ].map(tri => (
                          <div key={tri.key} className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                            <div>
                              <h3 className="text-subheading font-bold mb-3"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletín del {tri.label}</h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-lg py-2">
                                  <div className="text-caption text-muted">Inicio</div>
                                  <div className="text-subheading font-mono font-bold text-foreground">{formatD(tri.ini)}</div>
                                </div>
                                <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-lg py-2">
                                  <div className="text-caption text-muted">Fin</div>
                                  <div className="text-subheading font-mono font-bold text-foreground">{formatD(tri.fin)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button onClick={() => handleDownloadPdf(tri.tipo, "pdf", { fechaCorte: tri.fin })} disabled={downloadingStr === `${tri.tipo}_pdf`} className="flex-1">
                                {downloadingStr === `${tri.tipo}_pdf` ? "⏳..." : t('botones.magia.vistaPdf', {defaultValue: 'Vista .pdf'})}
                              </Button>
                              <Button variant="secondary" onClick={() => handleDownloadPdf(tri.tipo, "docx", { fechaCorte: tri.fin })} disabled={downloadingStr === `${tri.tipo}_docx`} className="flex-1">
                                {downloadingStr === `${tri.tipo}_docx` ? "⏳..." : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                              </Button>
                              <Button variant="success" onClick={() => handleExportXlsx(tri.key, tri.fin)} className="flex-1 flex items-center justify-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4" /> {t('botones.magia.editableXlsx', {defaultValue: 'Editable .xlsx'})}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Segunda fila: Final y Extraordinaria */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                          <h3 className="text-subheading font-bold mb-1"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span> Evaluación final ordinaria</h3>
                          <div className="flex gap-2 mt-auto">
                            <Button onClick={() => handleDownloadPdf('grupal_final', 'pdf', { fechaCorte: fechaFinal })} disabled={downloadingStr === 'grupal_final_pdf'} className="flex-1">
                              {downloadingStr === 'grupal_final_pdf' ? '⏳...' : t('botones.magia.vistaPdf', {defaultValue: 'Vista .pdf'})}
                            </Button>
                            <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_final', 'docx', { fechaCorte: fechaFinal })} disabled={downloadingStr === 'grupal_final_docx'} className="flex-1">
                              {downloadingStr === 'grupal_final_docx' ? '⏳...' : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                            </Button>
                            <Button variant="success" onClick={() => handleExportXlsx('Final', fechaFinal)} className="flex-1 flex items-center justify-center gap-1.5">
                              <FileSpreadsheet className="w-4 h-4" /> {t('botones.magia.editableXlsx', {defaultValue: 'Editable .xlsx'})}
                            </Button>
                          </div>
                        </div>

                        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                          <h3 className="text-subheading font-bold mb-1"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span> Evaluación final extraordinaria</h3>
                          <div className="flex gap-2 mt-auto">
                            <Button onClick={() => handleDownloadPdf('grupal_final', 'pdf', { fechaCorte: fechaFinal })} disabled={downloadingStr === 'grupal_final_pdf'} className="flex-1">
                              {downloadingStr === 'grupal_final_pdf' ? '⏳...' : t('botones.magia.vistaPdf', {defaultValue: 'Vista .pdf'})}
                            </Button>
                            <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_final', 'docx', { fechaCorte: fechaFinal })} disabled={downloadingStr === 'grupal_final_docx'} className="flex-1">
                              {downloadingStr === 'grupal_final_docx' ? '⏳...' : t('botones.magia.editableDocx', {defaultValue: 'Editable .docx'})}
                            </Button>
                            <Button variant="success" onClick={() => handleExportXlsx('Extraordinaria', fechaFinal)} className="flex-1 flex items-center justify-center gap-1.5">
                              <FileSpreadsheet className="w-4 h-4" /> {t('botones.magia.editableXlsx', {defaultValue: 'Editable .xlsx'})}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

              </MotionWrapper>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
