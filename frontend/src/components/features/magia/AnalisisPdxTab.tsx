"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChevronDown, FileText, FileCheck2, FileStack } from "lucide-react";
import { useTranslation } from "react-i18next";

const markdownComponents = {
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

function AcordeonNivel({ id, file, icon: Icon, defaultOpen, title, desc }: { id: string; file: string; icon: typeof FileText; defaultOpen: boolean; title: string; desc: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open || content !== null) return;
    fetch(file)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => {
        console.error(err);
        setContent("Error cargando el contenido.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <details open={defaultOpen} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className="group border border-[var(--glass-border)] rounded-xl bg-background/50 shadow-sm overflow-hidden">
      <summary className="p-4 font-bold cursor-pointer text-subheading flex items-center justify-between hover:bg-foreground/5 transition-colors list-none border-b border-transparent group-open:border-[var(--glass-border)] group-open:bg-foreground/5">
        <span className="flex items-center gap-2"><Icon className="w-5 h-5 text-accent" /> {title}</span>
        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-muted" />
      </summary>
      <div className="p-6">
        <p className="text-caption text-muted mb-4">{desc}</p>
        {content === null ? (
          <div className="flex justify-center p-8 text-muted">Cargando...</div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </details>
  );
}

export function AnalisisPdxTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <AcordeonNivel
        id="pd-" file="/Guia_pd-.md" icon={FileText} defaultOpen
        title={t('tabs.equivalencias.pdminus.label', {defaultValue: 'APP → PD- (Resumen)'})}
        desc={t('tabs.equivalencias.pdminus.desc', {defaultValue: 'De la app a dónde aparece cada bloque en el resumen de 1-2 folios para el alumnado (PD-).'})}
      />
      <AcordeonNivel
        id="pd=" file="/Guia_pd%3D.md" icon={FileCheck2} defaultOpen={false}
        title={t('tabs.equivalencias.pdigual.label', {defaultValue: 'APP → PD= (Simplificada)'})}
        desc={t('tabs.equivalencias.pdigual.desc', {defaultValue: 'De la app a dónde aparece cada campo en el modelo oficial simplificado, 17 apartados A-Q (PD=).'})}
      />
      <AcordeonNivel
        id="pd+" file="/Guia_pd%2B.md" icon={FileStack} defaultOpen={false}
        title={t('tabs.equivalencias.pdplus.label', {defaultValue: 'APP → PD+ (Detallada JEG)'})}
        desc={t('tabs.equivalencias.pdplus.desc', {defaultValue: 'De la app a dónde aparece cada campo en la programación detallada tipo JEG (PD+), capítulo a capítulo.'})}
      />
    </div>
  );
}
