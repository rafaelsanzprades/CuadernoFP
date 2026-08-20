import React, { useState, useEffect } from 'react';
import { Landmark, Map, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AccordionBlock } from '@/components/ui/AccordionBlock';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const estatalDir = communities.find(c => c.is_dir && c.name === "Estatal");
  const estatalPath = estatalDir ? estatalDir.path : `Normativa/Estatal`;

  return (
    <div className="space-y-4 animate-fade-in">
      <LazyAccordionFolder
        title={t('campos.normativa.legislacionEstatal', {defaultValue: 'Legislación estatal'})}
        icon={<Landmark className="w-5 h-5" />}
        defaultOpen={true}
        path={estatalPath}
        hasFiles={!!estatalDir}
        emptyMessage={t('campos.normativa.sinDocumentosEstatales', {defaultValue: 'No hay documentos normativos estatales por el momento.'})}
        onDownloadDoc={onDownloadDoc}
        formatSize={formatSize}
        getFileIcon={getFileIcon}
      />

      {TODAS_COMUNIDADES.map((comunidadName) => {
        const backendDir = communities.find(c => c.is_dir && c.name === comunidadName);
        const path = backendDir ? backendDir.path : `Normativa/${comunidadName}`;

        return (
          <LazyAccordionFolder
            key={path}
            title={t('campos.normativa.legislacionAutonomica', {comunidad: comunidadName, defaultValue: `Legislación autonómica (${comunidadName})`})}
            icon={<Map className="w-5 h-5" />}
            path={path}
            hasFiles={!!backendDir}
            emptyMessage={t('campos.normativa.sinDocumentosAutonomicos', {defaultValue: 'No hay documentos normativos en esta comunidad por el momento.'})}
            onDownloadDoc={onDownloadDoc}
            formatSize={formatSize}
            getFileIcon={getFileIcon}
          />
        );
      })}
    </div>
  );
}

function LazyAccordionFolder({
  title,
  icon,
  defaultOpen = false,
  path,
  hasFiles,
  emptyMessage,
  onDownloadDoc,
  formatSize,
  getFileIcon,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  path: string;
  hasFiles: boolean;
  emptyMessage: string;
  onDownloadDoc: (path: string, filename: string) => void;
  formatSize: (bytes: number | null) => string;
  getFileIcon: (filename: string) => React.ReactNode;
}) {
  const [hasOpened, setHasOpened] = useState(defaultOpen);

  return (
    <AccordionBlock
      title={title}
      icon={icon}
      defaultOpen={defaultOpen}
      onToggle={(open) => { if (open) setHasOpened(true); }}
    >
      {hasOpened ? (
        <NormativaFolder
          path={path}
          hasFiles={hasFiles}
          emptyMessage={emptyMessage}
          onDownloadDoc={onDownloadDoc}
          formatSize={formatSize}
          getFileIcon={getFileIcon}
        />
      ) : null}
    </AccordionBlock>
  );
}

function NormativaFolder({
  path,
  hasFiles,
  emptyMessage,
  onDownloadDoc,
  formatSize,
  getFileIcon,
}: {
  path: string;
  hasFiles: boolean;
  emptyMessage: string;
  onDownloadDoc: (path: string, filename: string) => void;
  formatSize: (bytes: number | null) => string;
  getFileIcon: (filename: string) => React.ReactNode;
}) {
  if (!hasFiles) {
    return (
      <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
        <span className="text-caption tracking-widest bg-success/10 text-success/70 px-3 py-1 rounded border border-success/20">
          En preparación
        </span>
      </div>
    );
  }

  return (
    <CommunityFiles path={path} emptyMessage={emptyMessage} onDownloadDoc={onDownloadDoc} formatSize={formatSize} getFileIcon={getFileIcon} />
  );
}

function CommunityFiles({ path, emptyMessage, onDownloadDoc, formatSize, getFileIcon }: { path: string; emptyMessage: string; onDownloadDoc: (path: string, filename: string) => void; formatSize: any; getFileIcon: any; }) {
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
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-body">Cargando normativa...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return <div className="p-4 text-center text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-body">
        <tbody className="divide-y divide-border/50">
          {files.map(file => (
            <tr key={file.path} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onDownloadDoc(file.path, file.name)}>
              <td className="py-4 pr-4 w-12">
                {getFileIcon(file.name)}
              </td>
              <td className="py-4 pr-4">
                <p className="font-medium text-foreground mb-1 leading-relaxed">{file.name}</p>
                <p className="text-muted-foreground text-caption italic">{formatSize(file.size)}</p>
              </td>
              <td className="py-4 text-right align-middle w-16">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onDownloadDoc(file.path, file.name); }}
                  className="h-10 w-10 text-accent hover:text-accent/80 hover:bg-accent/10"
                >
                  <FileText className="w-6 h-6" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
