"use client";
import { TabSync } from "@/components/ui/TabSync";
import { NormativaAccordion } from "@/components/features/documentos/NormativaAccordion";
import { TabNormativa } from "@/components/features/catalogo/TabNormativa";
import { TabGrados } from "@/components/features/catalogo/TabGrados";
import { TabComunidades } from "@/components/features/catalogo/TabComunidades";
import { AlertTriangle, BookOpen, Download, DownloadCloud, File, FileSpreadsheet, FileText, Folder, FolderOpen, MapPin, Scale, Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { Alumnado } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

export default function DocumentosPage() {
  const { t } = useTranslation();
  const TABS = [
    { id: "ccaa", label: <span className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> CCAA</span>, cleanLabel: 'CCAA' },
    { id: "bibliografia", label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 shrink-0" /> Bibliografía</span>, cleanLabel: 'Bibliografía' },
    { id: "legislacion", label: <span className="flex items-center gap-2"><Scale className="w-4 h-4 shrink-0" /> {t('tabs.legislacion', {defaultValue: 'Legislación'})}</span>, cleanLabel: t('tabs.legislacion', {defaultValue: 'Legislación'}) },
    { id: "curriculos", label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 shrink-0" /> {t('tabs.curriculos', {defaultValue: 'Currículos'})}</span>, cleanLabel: t('tabs.curriculos', {defaultValue: 'Currículos'}) }
  ];
  const TAB_DESCRIPTIONS: Record<string, string> = {
    ccaa: 'Legislación autonómica y normativa específica.',
    bibliografia: 'Referencias normativas y bibliografía del catálogo.',
    Plantillas: 'Formatos base recomendados por la administración educativa para programaciones.',
    Currículos: 'Disposiciones normativas que fijan las enseñanzas mínimas de cada título.',
    legislacion: 'Leyes orgánicas, reales decretos y órdenes ministeriales vigentes.',
  };
  const [activeTab, setActiveTab] = useState("ccaa");
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [downloadingStr, setDownloadingStr] = useState<string | null>(null);

  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, dataSource } = useAppStore();
  const [loadingData, setLoadingData] = useState(true);

  const fetchDocuments = (path: string) => {
    setLoadingDocs(true);
    setError(null);
    const backendPath = path === 'legislacion' ? 'Normativa' : path === 'bibliografia' ? 'Bibliografia' : path === 'ccaa' ? 'CCAA' : path === 'curriculos' ? 'Currículos' : path;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?path=${encodeURIComponent(backendPath)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al acceder a los documentos");
        return res.json();
      })
      .then((json) => {
        if (json.status === "success") {
          setItems(json.data);
          setCurrentPath(backendPath);
        } else {
          setError(json.detail || "Error desconocido");
        }
      })
      .catch((err) => {
        // console.error("Error fetching documents:", err); // Suppressed to avoid red logs when backend is down
        setError(err.message);
      })
      .finally(() => setLoadingDocs(false));
  };

  useEffect(() => {
    const folderMap: Record<string, string> = {
      "plantillas": "Plantillas",
      "legislacion": "legislacion"
    };
    if (folderMap[activeTab] && folderMap[activeTab] !== activeTab) {
      setActiveTab(folderMap[activeTab]);
      return;
    }
    if (activeTab === "bibliografia") {
      setItems([]);
      setLoadingDocs(false);
      setError(null);
      return;
    }
    fetchDocuments(activeTab);
  }, [activeTab, dataSource]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      if (dataSource === 'demo' || dataSource === 'local') {
        setLoadingData(false);
        return;
      }
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
      }
      setLoadingData(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoadingData(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData, dataSource]);

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

  const handleDownloadPdf = async (type: string, al_id?: string) => {
    try {
      setDownloadingStr(type);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=${type}&pd_id=${activeModuleId}&curso_id=${activeCursoId}`;
      if (al_id) url += `&al_id=${al_id}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error generating PDF");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const modName = moduleData?.info_modulo?.modulo || "Modulo";

      let filename = `${type}_${modName}.pdf`;
      if (al_id) filename = `Boletin_${al_id}_${modName}.pdf`;

      setPreviewUrl(downloadUrl);
      setPreviewFilename(filename);
    } catch (err) {
      console.error(err);
      toast.error("Error al generar el PDF. Asegúrate de que el backend está configurado correctamente.");
    } finally {
      setDownloadingStr(null);
    }
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

  const basePath = activeTab;
  let relativePath = currentPath;
  if (basePath && currentPath.startsWith(basePath)) {
    relativePath = currentPath.slice(basePath.length);
    if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
  }

  const relParts = relativePath.split("/").filter(Boolean);

  const breadcrumbs = [
    { label: "Raíz", path: basePath },
    ...relParts.map((part, idx) => ({
      label: part,
      path: (basePath ? basePath + "/" : "") + relParts.slice(0, idx + 1).join("/")
    }))
  ];

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderContent = () => {
    if (activeTab === 'bibliografia') {
      return (
        <div className="w-full">
          <TabNormativa searchQuery={searchQuery} />
        </div>
      );
    }
    
    if (activeTab === 'ccaa') {
      return null;
    }
    
    if (loadingDocs) {
      return (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-12 text-center text-muted flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Cargando documentos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-12 text-center">
            <div className="text-danger mb-2"><span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> Error</div>
            <p className="text-foreground/80">{error}</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'legislacion' && currentPath === 'Normativa') {
      return (
        <div className="flex flex-col gap-6 w-full">
          <TabGrados />
          <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md p-6">
            <NormativaAccordion 
              communities={filteredItems} 
              onDownloadDoc={handleDownloadDoc} 
              formatSize={formatSize} 
              getFileIcon={getFileIcon} 
            />
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="p-16 text-center text-muted">
              <div className="text-2xl mb-4"><span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></div>
              <p className="text-lg">El directorio está vacío.</p>
            </div>
          </div>
      );
    }

    return (
      <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full p-12 text-center text-muted">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron resultados para "{searchQuery}"</p>
            </div>
          ) : filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center p-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[var(--glass-border)] rounded-xl transition-all cursor-pointer duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative"
              onClick={() => item.is_dir ? handleNavigate(item.path) : handleDownloadDoc(item.path, item.name)}
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300 relative">
                {downloadingStr === item.path ? (
                  <div className="w-12 h-12 flex items-center justify-center animate-spin border-4 border-accent border-t-transparent rounded-full" />
                ) : item.is_dir ? (
                  <Folder className="w-12 h-12 text-info drop-shadow-md" />
                ) : (
                  getFileIcon(item.name)
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground/90 group-hover:text-foreground text-center line-clamp-2 w-full break-words">
                {item.name}
              </h3>
              {!item.is_dir && (
                <p className="text-xs text-muted mt-2 font-mono">
                  {formatSize(item.size)}
                </p>
              )}
              {!item.is_dir && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 bg-accent/20 text-accent rounded-md hover:bg-accent hover:text-foreground transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDownloadDoc(item.path, item.name); }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-3 pb-12">


            <PageHeader
              icon={FileText}
              title={t('pages.documentos_title', {defaultValue: 'Normativa'})}
              description={t('pages.documentos_desc', {defaultValue: 'Explorador de legislación, normativas y docs oficiales.'})}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); fetchDocuments(val); }} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-80 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[46px] bg-foreground/5 border border-[var(--glass-border)] rounded-xl pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted/60"
                />
              </div>
            </div>

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión documental y normativa.'} />

            <div className="space-y-3 animate-in fade-in duration-500">
              {activeTab === 'ccaa' && <div className="mb-6"><TabComunidades searchQuery={searchQuery} /></div>}

              {renderContent()}
            </div>




          </MotionWrapper>
        </div>

        {/* Modal de Previsualización (Compartido para ambos) */}
        {previewUrl && (
          <div 
            className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
          >
            <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
              <h2 id="preview-modal-title" className="text-2xl font-bold flex items-center gap-3 text-foreground">
                <FileText className="w-6 h-6 text-info" /> {previewFilename}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = previewUrl;
                    a.download = previewFilename || "documento.pdf";
                    a.click();
                  }}
                  className="bg-info hover:bg-info text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  <DownloadCloud className="w-5 h-5" /> Descargar
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setPreviewFilename(null);
                  }}
                  className="bg-danger hover:bg-danger text-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" /> Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full p-4 bg-[#525659]">
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded-lg shadow-2xl" title="Vista previa PDF" />
            </div>
          </div>
        )}

      </main>
    </div>
      );
}

