import React, { useState, useEffect } from "react";
import { AlertTriangle, Download, DownloadCloud, File, FileSpreadsheet, FileText, Folder, FolderOpen, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

export function TabDocumentos() {
  const { t } = useTranslation();
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<string>("Currículos");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [downloadingStr, setDownloadingStr] = useState<string | null>(null);

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
        setError(err.message);
      })
      .finally(() => setLoadingDocs(false));
  };

  useEffect(() => {
    fetchDocuments("Currículos");
  }, []);

  const handleNavigate = (newPath: string) => {
    fetchDocuments(newPath);
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
      toast.error(t('toasts.documentos.errorPrevisualizacion', {defaultValue: "Error al cargar la previsualización del documento."}));
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

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Buscar documento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[46px] bg-foreground/5 border border-[var(--glass-border)] rounded-xl pl-10 pr-4 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted/60"
        />
      </div>

      {loadingDocs ? (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-12 text-center text-muted flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Cargando documentos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-12 text-center">
            <div className="text-danger mb-2"><span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> Error</div>
            <p className="text-foreground/80">{error}</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-foreground/10 border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-16 text-center text-muted">
            <div className="text-heading mb-4"><span className="inline-flex"><FolderOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></div>
            <p className="text-subheading">El directorio está vacío.</p>
          </div>
        </div>
      ) : (
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
                <h3 className="text-body font-semibold text-foreground/90 group-hover:text-foreground text-center line-clamp-2 w-full break-words">
                  {item.name}
                </h3>
                {!item.is_dir && (
                  <p className="text-caption text-muted mt-2 font-mono">
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
      )}

      {/* Modal de Previsualización */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
            <h2 id="preview-modal-title" className="text-heading font-bold flex items-center gap-3 text-foreground">
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
    </div>
  );
}
