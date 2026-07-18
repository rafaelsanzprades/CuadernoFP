import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, Download } from 'lucide-react';
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

export function NormativaAccordion({ communities, onDownloadDoc, formatSize, getFileIcon }: NormativaAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const dirCommunities = communities.filter(c => c.is_dir);

  if (dirCommunities.length === 0) {
    return (
      <div className="p-12 text-center text-muted">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No se encontraron comunidades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-6">
      {dirCommunities.map((comunidad) => {
        const isExpanded = expandedId === comunidad.path;

        return (
          <div 
            key={comunidad.path}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'border-success/50 shadow-md bg-foreground/5' : 'border-border/50 bg-background/30 hover:bg-foreground/5'}`}
          >
            <button
              onClick={() => toggleExpand(comunidad.path)}
              className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${isExpanded ? 'text-success' : 'text-muted'}`} />
                <span className={`font-semibold text-base transition-colors ${isExpanded ? 'text-success' : 'text-foreground'}`}>
                  {comunidad.name}
                </span>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-success" /> : <ChevronDown className="w-5 h-5 text-muted" />}
            </button>
            
            {isExpanded && (
              <div className="border-t border-border/50 p-5 bg-background">
                <CommunityFiles path={comunidad.path} onDownloadDoc={onDownloadDoc} formatSize={formatSize} getFileIcon={getFileIcon} />
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
        <p className="text-sm">Cargando normativa...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return <div className="p-4 text-center text-muted">No hay documentos normativos en esta comunidad.</div>;
  }

  return (
    <div className="overflow-x-auto border border-border/50 rounded-lg">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-border/50">
          {files.map(file => (
            <tr key={file.path} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onDownloadDoc(file.path, file.name)}>
              <td className="px-4 py-4 w-12">
                {getFileIcon(file.name)}
              </td>
              <td className="px-4 py-4">
                <p className="font-medium text-foreground leading-relaxed">{file.name}</p>
                <p className="text-muted-foreground text-xs mt-1 font-mono">{formatSize(file.size)}</p>
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
