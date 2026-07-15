"use client";
import { TabSync } from "@/components/ui/TabSync";
import { AlertTriangle, BarChart, BookOpen, Calculator, Calendar, CalendarDays, ChevronRight, ChevronDown, Construction, CornerLeftUp, Download, DownloadCloud, File, FileEdit, FileSpreadsheet, FileText, Folder, FolderOpen, GraduationCap, MapPin, Play, Scale, Search, Settings, UploadCloud, User, Users, X , Info } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { Alumnado } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import Link from "next/link";

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

export default function DocumentosPage() {const [activeTab, setActiveTab] = useState("programacion");// State for Explorador
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [downloadingStr, setDownloadingStr] = useState<string | null>(null);

  // State for Descargas
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loadingData, setLoadingData] = useState(true);

  const [fecha1T, setFecha1T] = useState("");
  const [fecha2T, setFecha2T] = useState("");
  const [fecha3T, setFecha3T] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const [evaluacionTab, setEvaluacionTab] = useState('grupales'); // grupales, individuales
  const [guiaPdContent, setGuiaPdContent] = useState("");
  const [comparativaPdContent, setComparativaPdContent] = useState("");

  useEffect(() => {
    if (activeTab === "guia_pd" && !guiaPdContent) {
      fetch("/Guia_PD.md")
        .then(res => res.text())
        .then(text => setGuiaPdContent(text))
        .catch(err => console.error("Error cargando Guia_PD.md", err));
    }
    if (activeTab === "comparativa_pd" && !comparativaPdContent) {
      fetch("/Comparativa_PD.md")
        .then(res => res.text())
        .then(text => setComparativaPdContent(text))
        .catch(err => console.error("Error cargando Comparativa_PD.md", err));
    }
  }, [activeTab, guiaPdContent, comparativaPdContent]);

  const fetchDocuments = (path: string) => {
    setLoadingDocs(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?path=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al acceder a los documentos");
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setItems(json.data);
          setCurrentPath(path);
        } else {
          setError(json.detail || "Error desconocido");
        }
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setError(err.message);
      })
      .finally(() => setLoadingDocs(false));
  };

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
      setFecha1T(cursoData.info_fechas.fin_1t || "");
      setFecha2T(cursoData.info_fechas.fin_2t || "");
      setFecha3T(cursoData.info_fechas.fin_3t || "");
      setFechaFinal(cursoData.info_fechas.fin_curso || "");
    }
  }, [cursoData?.info_fechas]);

  const formatD = (dStr: string | undefined) => {
    if (!dStr) return "---";
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  // Explorador Handlers
  const handleNavigate = (newPath: string) => {
    fetchDocuments(newPath);
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const parentPath = parts.join("/");
    fetchDocuments(parentPath);
  };

  const handleDownloadDoc = async (filePath: string, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const previewable = ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'docx'].includes(ext);

    if (!previewable) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/download?file_path=${encodeURIComponent(filePath)}`, "_blank");
      return;
    }

    try {
      setDownloadingStr(filePath);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/documents/preview?file_path=${encodeURIComponent(filePath)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error fetching document");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      setPreviewUrl(objectUrl);
      const displayFilename = ext === 'docx' ? filename.replace(/\.docx$/i, '.pdf') : filename;
      setPreviewFilename(displayFilename);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar la previsualización del documento. Verifica la conexión con el backend.");
    } finally {
      setDownloadingStr(null);
    }
  };

  // Descargas Handlers
  const handleDownloadPdf = async (type: string, al_id?: string, fechaCorte?: string, fileFormat: string = "pdf") => {
    try {
      if (type.startsWith('programacion')) {
        setDownloadingStr(`${type}_${fileFormat}`);
      } else {
        setDownloadingStr(type);
      }
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=${type}&file_format=${fileFormat}`;
      if (al_id) url += `&al_id=${al_id}`;

      let activeCurriculoData: any = {};
      if (type === 'programacion') {
          // Curriculo data is now handled by the backend using the module ID
          activeCurriculoData = {};
      }

      const dynamicCursoData = {
        ...(cursoData || {}),
        curriculo_data: activeCurriculoData
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso_data: dynamicCursoData,
          module_data: moduleData,
          fecha_corte: fechaCorte
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
      if (type === 'programacion_minima' || type === 'programacion_minima_tpl') {
        downloadName = `${timestampStr} PD Resumen.${finalExt}`;
      } else if (type === 'programacion_suficiente' || type === 'programacion_suficiente_tpl') {
        downloadName = `${timestampStr} PD BOA Aragón.${finalExt}`;
      } else if (type === 'programacion_detallada') {
        downloadName = `${timestampStr} PD JEG cumplimentada.${finalExt}`;
      } else if (type === 'plantilla_jeg') {
        downloadName = `PD+ FP v1 - Modelo.${finalExt}`;
      }

      if (finalExt === "pdf") {
        setPreviewUrl(urlBlob);
        setPreviewFilename(downloadName);
      } else {
        if (fileFormat === "pdf") {
          toast("No se pudo generar el PDF. Descargando DOCX como alternativa.", { icon: '⚠️', duration: 5000 });
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
      toast.error("Error al generar el documento. Verifica la conexión con el backend.");
    } finally {
      setDownloadingStr(null);
    }
  };

  const handleExportCSV = (triKey: string, fechaCorte: string) => {
    const df_al = cursoData?.df_al || [];
    const df_eval = cursoData?.df_eval || [];
    const activeAl = df_al.filter((al: Alumnado) => al.Estado !== "Baja");

    let csvContent = `Boletin de Calificaciones - ${triKey}\n`;
    csvContent += `Modulo: ${moduleData?.info_modulo?.modulo || ""}\n`;
    csvContent += `Fecha de corte (Acta): ${fechaCorte}\n\n`;
    
    csvContent += `ID,Apellidos,Nombre,Nota Media ${triKey}\n`;
    
    activeAl.forEach((al: any) => {
      const evRow = df_eval.find((e: any) => e.ID === al.ID);
      let notaMedia = "";
      if (evRow) {
        if (triKey === 'Final') notaMedia = evRow.Nota_Final || "";
        else notaMedia = evRow[`${triKey}_Nota`] || "";
      }
      csvContent += `${al.ID},"${al.Apellidos || ""}","${al.Nombre || ""}",${notaMedia}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Notas_${triKey}_${moduleData?.info_modulo?.modulo || "modulo"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-8 h-8 text-danger" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileSpreadsheet className="w-8 h-8 text-success" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-8 h-8 text-info" />;
    return <File className="w-8 h-8 text-muted" />;
  };

  const pathParts = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [
    { label: "Raíz", path: "" },
    ...pathParts.map((part, idx) => ({
      label: part,
      path: pathParts.slice(0, idx + 1).join("/")
    }))
  ];

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const df_al = cursoData?.df_al || [];
  const activeAlumnado = df_al.filter((al: Alumnado) => al.Estado !== "Baja");
  activeAlumnado.sort((a: Alumnado, b: Alumnado) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const TABS = [
    { id: "programacion", label: "Programación", cleanLabel: "Programación" },
    { id: "curso", label: "Curso", cleanLabel: "Curso" },
    { id: "guia_pd", label: "Guía PD", cleanLabel: "Guía PD" },
    { id: "comparativa_pd", label: "Comparativa PD", cleanLabel: "Comparativa PD" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

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
                    <Download className="w-4 h-4" /> Descargar PDF
                  </Button>
                  <Button variant="ghost" onClick={() => {
                    setPreviewUrl(null);
                    setPreviewFilename(null);
                  }} className="text-muted hover:text-foreground">
                    <X className="w-5 h-5" /> Cerrar visor
                  </Button>
                </div>
              </div>
              <div className="flex-1 w-full p-4">
                <iframe src={previewUrl} className="w-full h-full rounded-xl border border-[var(--glass-border)] shadow-xl bg-white" title="PDF Preview" />
              </div>
            </div>
          ) : (
            <div className="p-8">
              <MotionWrapper className="w-full space-y-3 pb-12">


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                  <span className="text-3xl text-info"><FileText className="w-8 h-8" strokeWidth={2.5} /></span> Descargas
                </h1>
                <p className="text-muted mt-2 text-lg">Generación de reportes y boletines (PDF).</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="mb-3 max-w-full flex-wrap h-auto">
                <TabsTrigger value="programacion">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Programación</div>
                </TabsTrigger>
                <TabsTrigger value="curso">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Curso</div>
                </TabsTrigger>
                <TabsTrigger value="guia_pd">
                  <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Guía PD</div>
                </TabsTrigger>
                <TabsTrigger value="comparativa_pd">
                  <div className="flex items-center gap-2"><Scale className="w-4 h-4" /> Comparativa PD</div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
                    {(() => {
                const infoMap: Record<string, {title: string, desc: string}> = {
          'programacion': {
                    'title': 'Descargas - Programación',
                    'desc': 'Descarga de la programación didáctica completa en PDF.'
          },
          'curso': {
                    'title': 'Descargas - Curso',
                    'desc': 'Descarga de actas, seguimientos y memorias de curso.'
          },
          'guia_pd': {
                    'title': 'Guía PD (Referencia Cruzada)',
                    'desc': 'Mapa de correspondencias entre la plantilla oficial de TodoFP y los campos en CuadernoFP.'
          },
          'comparativa_pd': {
                    'title': 'Comparativa PD (3 Modelos)',
                    'desc': 'Comparación campo a campo de los 3 niveles de programación didáctica: PD-, PD= y PD+.'
          }
};
                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };
                return (
    <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}

            {['programacion', 'curso'].includes(activeTab) && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {(!activeCursoId || !activeModuleId) ? (
                  <Card className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl">
                    <FileText className="w-16 h-16 text-muted-foreground opacity-50" />
                    <h2 className="text-2xl font-bold">No hay curso ni programación cargada</h2>
                    <p className="text-muted mb-4">Debes abrir o crear un archivo de programación y curso en tu Archivos.</p>
                    <Link href="/archivos">
                      <Button variant="primary" className="gap-2">
                        <FolderOpen className="w-4 h-4" /> Ir a mis Archivos
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
                  <>
                    {activeTab === 'programacion' && (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        {["Andalucía","Aragón","Asturias","Baleares","Canarias","Cantabria","Castilla-La Mancha","Castilla y León","Cataluña","Comunidad Valenciana","Extremadura","Galicia","Madrid","Murcia","Navarra","País Vasco","La Rioja","Ceuta","Melilla"].map((comunidad) => {
                          const isAragon = comunidad === "Aragón";
                          return (
                            <details key={comunidad} open={isAragon} className="group border border-[var(--glass-border)] rounded-xl bg-background/50 mb-4 shadow-sm overflow-hidden">
                              <summary className="p-4 font-bold cursor-pointer text-xl flex items-center justify-between hover:bg-foreground/5 transition-colors list-none border-b border-transparent group-open:border-[var(--glass-border)] group-open:bg-foreground/5">
                                <span className="flex items-center gap-2"><MapPin className={`w-5 h-5 ${isAragon ? 'text-purple-500' : 'text-muted-foreground'}`} /> {comunidad}</span>
                                <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-muted" />
                              </summary>
                              {isAragon ? (
                                <div className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-slate-400">
                                      <div>
                                        <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Resumen de la Programación didáctica para el alumnado</h3>
                                        <p className="text-sm text-muted mb-6">Documento de un folio para entregar al alumnado. Contiene información básica y criterios de calificación.</p>
                                      </div>
                                      <div className="flex gap-2 mt-auto">
                                        <Button onClick={() => handleDownloadPdf('programacion_minima_tpl', undefined, undefined, 'docx')} disabled={downloadingStr === 'programacion_minima_tpl_docx'} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white">
                                          {downloadingStr === 'programacion_minima_tpl_docx' ? '⏳ Generando DOCX...' : 'Descargar PD Resumen.docx'}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-blue-400">
                                      <div>
                                        <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Programación didáctica Aragón (BOA nº: 181 de 18 de septiembre de 2025)</h3>
                                        <p className="text-sm text-muted mb-6">Versión BOA con los puntos de la Ley muy específica y concreta (no detalla secuenciación de aula ni extensa teoría).</p>
                                      </div>
                                      <div className="flex gap-2 mt-auto">
                                        <Button onClick={() => handleDownloadPdf('programacion_suficiente_tpl', undefined, undefined, 'docx')} disabled={downloadingStr === 'programacion_suficiente_tpl_docx'} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                          {downloadingStr === 'programacion_suficiente_tpl_docx' ? '⏳ Generando DOCX...' : 'Descargar PD BOA Aragón.docx'}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between border-l-4 border-l-info">
                                      <div>
                                        <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Programación didáctica ARAGÓN (Modelo JEG)</h3>
                                        <p className="text-sm text-muted mb-6">Se cumplimenta el modelo de <strong>Autor</strong>: Javier Edo Gual, <strong>Coordinación</strong>: Raúl Melero Rubio y Lucía Quílez Salvador; y <strong>Revisión técnica</strong>: Óscar Sánchez Estella.</p>
                                      </div>
                                      <div className="flex flex-col gap-2 mt-auto">
                                        <Button variant="secondary" onClick={() => handleDownloadPdf('plantilla_jeg', undefined, undefined, 'docx')} disabled={downloadingStr === 'plantilla_jeg_docx'} className="w-full">
                                          {downloadingStr === 'plantilla_jeg_docx' ? '⏳ Descargando...' : 'Modelo PD JEG original'}
                                        </Button>
                                        <Button onClick={() => handleDownloadPdf('programacion_detallada', undefined, undefined, 'docx')} disabled={downloadingStr === 'programacion_detallada_docx'} className="w-full bg-info hover:bg-info/90 text-white">
                                          {downloadingStr === 'programacion_detallada_docx' ? '⏳ Generando DOCX...' : 'Descargar PD JEG cumplimentada.docx'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-12 text-center text-muted-foreground">
                                  <Construction className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                  <p>Programaciones específicas para {comunidad} próximamente.</p>
                                </div>
                              )}
                            </details>
                          );
                        })}

                        <Card className="p-6 border-t-4 border-t-blue-500">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><CalendarDays className="w-4 h-4" /></span> Secuenciación</h2>
                          <p className="text-sm text-muted mb-6">Planificación temporal del módulo</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Planificación mensual</h3>
                                <p className="text-sm text-muted mb-6">Horas previstas frente a impartidas por UD y mes.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('planificacion')} disabled={downloadingStr === 'planificacion'} className="w-full">
                                {downloadingStr === 'planificacion' ? '⏳ Generando PDF...' : 'PDF Planificación'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {activeTab === 'curso' && (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        <Card className="p-6 border-t-4 border-t-emerald-500">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><Calendar className="w-4 h-4" /></span> Grupo</h2>
                          <p className="text-sm text-muted mb-6">Gestión del grupo</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><CalendarDays className="w-[1.2em] h-[1.2em] mr-1" /></span> Calendario académico</h3>
                                <p className="text-sm text-muted mb-6">Vista global del curso con fechas, sesiones y eventos.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('calendario')} disabled={downloadingStr === 'calendario'} className="w-full">
                                {downloadingStr === 'calendario' ? '⏳ Generando PDF...' : 'PDF Calendario'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado. Ubicación en el aula</h3>
                                <p className="text-sm text-muted mb-6">Distribución y ubicación del alumnado en el aula.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('alumnado_ubicacion')} disabled={downloadingStr === 'alumnado_ubicacion'} className="w-full">
                                {downloadingStr === 'alumnado_ubicacion' ? '⏳ Generando PDF...' : 'PDF Alumnado Ubicación'}
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6 border-t-4 border-t-emerald-500">
                          <h2 className="text-2xl font-bold mb-1"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Clases mensual - por UD</h2>
                          <p className="text-sm text-muted mb-6">Registro detallado de clases impartidas y secuenciación por unidad didáctica.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span> Seguimiento diario</h3>
                                <p className="text-sm text-muted mb-6">Registro detallado de la planificación del día a día.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('seguimiento')} disabled={downloadingStr === 'seguimiento'} className="w-full">
                                {downloadingStr === 'seguimiento' ? '⏳ Generando PDF...' : 'PDF Seguimiento'}
                              </Button>
                            </div>
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between">
                              <div>
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Clases por UD</h3>
                                <p className="text-sm text-muted mb-6">Secuenciación de sesiones de cada Unidad Didáctica.</p>
                              </div>
                              <Button onClick={() => handleDownloadPdf('clases_ud')} disabled={downloadingStr === 'clases_ud'} className="w-full">
                                {downloadingStr === 'clases_ud' ? '⏳ Generando PDF...' : 'PDF Clases por UD'}
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6 border-t-4 border-t-blue-500">
                          <h2 className="text-2xl font-bold mb-6"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletines grupales trimestrales</h2>
                          
                          {/* Primera fila: 3 Trimestres */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-1"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 1er trimestre</h3>
                                <div className="text-xs text-muted mb-2">
                                  Inicio: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.ini_1t)}</span><br/>
                                  Fin: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.fin_1t)}</span>
                                </div>
                              </div>
                              <div className="text-left mt-auto">
                                <label htmlFor="fecha-corte-1t" className="block text-xs text-muted mb-1 font-bold">Fecha de corte / acta:</label>
                                <input id="fecha-corte-1t" type="date" value={fecha1T} onChange={(e) => setFecha1T(e.target.value)} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-foreground text-sm focus:border-info focus:outline-none" />
                              </div>
                              <div className="flex flex-col gap-2 mt-2">
                                <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_1t', undefined, fecha1T)} disabled={downloadingStr === 'grupal_1t'} className="w-full text-xs">
                                  {downloadingStr === 'grupal_1t' ? '⏳' : 'PDF Boletín'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleExportCSV('1T', fecha1T)} className="w-full border border-success/30 text-success hover:bg-success/10 text-xs flex items-center justify-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-1"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 2º trimestre</h3>
                                <div className="text-xs text-muted mb-2">
                                  Inicio: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.ini_2t)}</span><br/>
                                  Fin: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.fin_2t)}</span>
                                </div>
                              </div>
                              <div className="text-left mt-auto">
                                <label htmlFor="fecha-corte-2t" className="block text-xs text-muted mb-1 font-bold">Fecha de corte / acta:</label>
                                <input id="fecha-corte-2t" type="date" value={fecha2T} onChange={(e) => setFecha2T(e.target.value)} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-foreground text-sm focus:border-info focus:outline-none" />
                              </div>
                              <div className="flex flex-col gap-2 mt-2">
                                <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_2t', undefined, fecha2T)} disabled={downloadingStr === 'grupal_2t'} className="w-full text-xs">
                                  {downloadingStr === 'grupal_2t' ? '⏳' : 'PDF Boletín'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleExportCSV('2T', fecha2T)} className="w-full border border-success/30 text-success hover:bg-success/10 text-xs flex items-center justify-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-1"><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> 3er trimestre</h3>
                                <div className="text-xs text-muted mb-2">
                                  Inicio: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.ini_3t)}</span><br/>
                                  Fin: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.fin_3t)}</span>
                                </div>
                              </div>
                              <div className="text-left mt-auto">
                                <label htmlFor="fecha-corte-3t" className="block text-xs text-muted mb-1 font-bold">Fecha de corte / acta:</label>
                                <input id="fecha-corte-3t" type="date" value={fecha3T} onChange={(e) => setFecha3T(e.target.value)} className="w-full bg-foreground/20 border border-[var(--glass-border)] rounded p-2 text-foreground text-sm focus:border-info focus:outline-none" />
                              </div>
                              <div className="flex flex-col gap-2 mt-2">
                                <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_3t', undefined, fecha3T)} disabled={downloadingStr === 'grupal_3t'} className="w-full text-xs">
                                  {downloadingStr === 'grupal_3t' ? '⏳' : 'PDF Boletín'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleExportCSV('3T', fecha3T)} className="w-full border border-success/30 text-success hover:bg-success/10 text-xs flex items-center justify-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Segunda fila: Final y Extraordinaria */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-1"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span> Evaluación final ordinaria</h3>
                                <div className="text-xs text-muted mb-2">
                                  Inicio: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.ini_final)}</span><br/>
                                  Fin: <span className="font-mono text-foreground">{formatD(cursoData?.info_fechas?.fin_final)}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 mt-auto">
                                <Button variant="secondary" onClick={() => handleDownloadPdf('grupal_final', undefined, fechaFinal)} disabled={downloadingStr === 'grupal_final'} className="w-full text-xs">
                                  {downloadingStr === 'grupal_final' ? '⏳' : 'PDF Boletín'}
                                </Button>
                                <Button variant="ghost" onClick={() => handleExportCSV('Final', fechaFinal)} className="w-full border border-success/30 text-success hover:bg-success/10 text-xs flex items-center justify-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6 flex flex-col justify-between text-center gap-4">
                              <div>
                                <h3 className="text-lg font-bold mb-1"><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span> Eval. Final Extraordinaria</h3>
                                <div className="text-xs text-muted mb-2">
                                  Inicio: <span className="font-mono text-foreground">---</span><br/>
                                  Fin: <span className="font-mono text-foreground">---</span>
                                </div>
                                <p className="text-xs text-muted italic mt-2">Próximamente disponible</p>
                              </div>
                              <div className="flex flex-col gap-2 mt-auto">
                                <Button variant="secondary" disabled className="w-full text-xs">
                                  PDF Boletín Extraordinaria
                                </Button>
                                <Button variant="ghost" disabled className="w-full border border-success/30 text-success hover:bg-success/10 text-xs flex items-center justify-center gap-2">
                                  <FileSpreadsheet className="w-4 h-4" /> Excel / CSV
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-6 border-t-4 border-t-blue-500">
                          <h2 className="text-2xl font-bold mb-6"><span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletines individuales</h2>
                          {activeAlumnado.length > 0 ? (
                            <div className="flex flex-col md:flex-row md:items-end gap-6 bg-foreground/10 border border-[var(--glass-border)] rounded-xl p-6">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold mb-2"><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> Boletín de alumnado</h3>
                                <p className="text-sm text-muted mb-4">Genera un boletín detallado de un alumnado específico.</p>
                                <select id="alumnado_select" className="w-full bg-foreground/25 border border-[var(--glass-border)] rounded-lg p-3 text-[var(--foreground)] focus:border-info focus:outline-none font-bold">
                                  {activeAlumnado.map((al: Alumnado) => (
                                    <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre} ({al.ID})</option>
                                  ))}
                                </select>
                              </div>
                              <Button variant="secondary" onClick={() => {
                                  const sel = document.getElementById('alumnado_select') as HTMLSelectElement;
                                  if (sel && sel.value) handleDownloadPdf('individual', sel.value);
                                }}
                                disabled={downloadingStr === 'individual'} className="px-8 py-3 h-[50px] w-full md:w-auto"
                              >
                                {downloadingStr === 'individual' ? '⏳ Generando boletín...' : 'PDF Boletín individual'}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-muted italic">No hay estudiantes activos en el curso.</p>
                          )}
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'guia_pd' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <Card className="p-8 border-t-4 border-t-indigo-500">
                  <div className="prose prose-invert max-w-none prose-h2:text-info prose-h3:text-success prose-td:border-foreground/10 prose-th:border-foreground/20 prose-th:bg-foreground/5 prose-table:border-collapse prose-table:w-full">
                    {guiaPdContent ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {guiaPdContent}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info"></div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'comparativa_pd' && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <Card className="p-8 border-t-4 border-t-amber-500">
                  <div className="prose prose-invert max-w-none prose-h2:text-info prose-h3:text-success prose-td:border-foreground/10 prose-th:border-foreground/20 prose-th:bg-foreground/5 prose-table:border-collapse prose-table:w-full">
                    {comparativaPdContent ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {comparativaPdContent}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info"></div>
                      </div>
                    )}
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

