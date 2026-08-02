import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, Download, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type DocumentItem = {
  name: string;
  is_dir: boolean;
  size: number | null;
  path: string;
};

interface NormativaAccordionProps {
  communities: DocumentItem[];
  onDownloadDoc: (path: string, filename: string) => void;
  formatSize: (bytes: number | null) => string;
  getFileIcon: (filename: string) => React.ReactNode;
}

const TODAS_COMUNIDADES = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", 
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Comunidad Valenciana", "Extremadura", 
  "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Ceuta", "Melilla"
].sort();

export function NormativaAccordion({ communities, onDownloadDoc, formatSize, getFileIcon }: NormativaAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-3 p-6">
      {/* Estatal */}
      {(() => {
        const backendDir = communities.find(c => c.is_dir && c.name === "Estatal");
        const path = backendDir ? backendDir.path : `Normativa/Estatal`;
        const hasFiles = !!backendDir;
        const isExpanded = expandedId === path;

        return (
          <div 
            key={path}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary/50 shadow-md bg-foreground/5' : 'border-border/50 bg-background/30 hover:bg-foreground/5'}`}
          >
            <button
              onClick={() => toggleExpand(path)}
              className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <Landmark className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-muted'}`} />
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-body transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>
                    Normativa Estatal
                  </span>
                  {!hasFiles && (
                    <span className="text-caption tracking-widest bg-primary/10 text-primary/70 px-2 py-0.5 rounded border border-primary/20 ml-2 hidden sm:inline-block">
                      En preparación
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>
            
            {isExpanded && (
              <div className="border-t border-border/50 p-5 bg-background">
                {!hasFiles ? (
                  <div className="p-4 text-center text-muted">No hay documentos normativos estatales por el momento.</div>
                ) : (
                  <CommunityFiles path={path} onDownloadDoc={onDownloadDoc} formatSize={formatSize} getFileIcon={getFileIcon} />
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Autonómicas */}
      {TODAS_COMUNIDADES.map((comunidadName) => {
        const backendDir = communities.find(c => c.is_dir && c.name === comunidadName);
        const path = backendDir ? backendDir.path : `Normativa/${comunidadName}`;
        const hasFiles = !!backendDir;
        const isExpanded = expandedId === path;

        return (
          <div 
            key={path}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-success/50 shadow-md bg-foreground/5' : 'border-border/50 bg-background/30 hover:bg-foreground/5'}`}
          >
            <button
              onClick={() => toggleExpand(path)}
              className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${isExpanded ? 'text-success' : 'text-muted'}`} />
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-body transition-colors ${isExpanded ? 'text-success' : 'text-foreground'}`}>
                    {comunidadName}
                  </span>
                  {!hasFiles && (
                    <span className="text-caption tracking-widest bg-success/10 text-success/70 px-2 py-0.5 rounded border border-success/20 ml-2 hidden sm:inline-block">
                      En preparación
                    </span>
                  )}
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-success" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>
            
            {isExpanded && (
              <div className="border-t border-border/50 p-5 bg-background">
                {!hasFiles ? (
                  <div className="p-4 text-center text-muted">No hay documentos normativos en esta comunidad por el momento.</div>
                ) : (
                  <CommunityFiles path={path} onDownloadDoc={onDownloadDoc} formatSize={formatSize} getFileIcon={getFileIcon} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CommunityFiles({ path, onDownloadDoc, formatSize, getFileIcon }: { path: string; onDownloadDoc: (path: string, filename: string) => void; formatSize: any; getFileIcon: any; }) {
  const [files, setFiles] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/list?path=${encodeURIComponent(path)}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          // Filtrar para mostrar solo archivos, no subdirectorios
          setFiles(json.data.filter((f: DocumentItem) => !f.is_dir));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [path]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted flex flex-col items-center">
        <div className="w-6 h-6 border-2 border-success border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-body">Cargando normativa...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return <div className="p-4 text-center text-muted">No hay documentos normativos en esta comunidad.</div>;
  }

  return (
    <div className="overflow-x-auto border border-border/50 rounded-lg">
      <table className="w-full text-left text-body">
        <tbody className="divide-y divide-border/50">
          {files.map(file => (
            <tr key={file.path} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onDownloadDoc(file.path, file.name)}>
              <td className="px-4 py-4 w-12">
                {getFileIcon(file.name)}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-foreground leading-relaxed">{file.name}</p>
                <p className="text-muted-foreground text-caption mt-1 font-mono">{formatSize(file.size)}</p>
              </td>
              <td className="px-4 py-4 text-center align-middle w-24">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); onDownloadDoc(file.path, file.name); }}
                  className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
