"use client";
import { GitCompare, FileText, FileCheck2, FileStack, Bot } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { TabSync } from "@/components/ui/TabSync";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";

const TABS = [
  { id: "pd-", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> PD- ← APP</>, cleanLabel: "PD- ← APP", file: "/Guia_pd-.md" },
  { id: "pd=", label: <><span className="inline-flex"><FileCheck2 className="w-[1.2em] h-[1.2em] mr-1" /></span> PD= ← APP</>, cleanLabel: "PD= ← APP", file: "/Guia_pd%3D.md" },
  { id: "pd+", label: <><span className="inline-flex"><FileStack className="w-[1.2em] h-[1.2em] mr-1" /></span> PD+ ← APP</>, cleanLabel: "PD+ ← APP", file: "/Guia_pd%2B.md" },
  { id: "datos", label: <><span className="inline-flex"><Bot className="w-[1.2em] h-[1.2em] mr-1" /></span> APP ← Datos</>, cleanLabel: "APP ← Datos", file: "/Guia.md" },
];

const TAB_DESCRIPTIONS: Record<string, string> = {
  "pd-": "Del resumen de 1-2 folios para el alumnado (PD-) a dónde se rellena cada bloque en la app.",
  "pd=": "Del modelo oficial BOA Aragón, 17 apartados A-Q (PD=), a dónde se rellena cada uno en la app.",
  "pd+": "De la programación detallada tipo JEG (PD+), capítulo a capítulo, a dónde se rellena en la app.",
  "datos": "Guía de inicio y prompt para IA: qué datos pedir al docente y dónde colocarlos en la app.",
};

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

export default function CorrelacionPage() {
  const [activeTab, setActiveTab] = useState<string>("pd-");
  const [content, setContent] = useState<Record<string, string>>({});
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  useEffect(() => {
    const tab = TABS.find(t => t.id === activeTab);
    if (!tab || content[activeTab] || loadingTab === activeTab) return;
    setLoadingTab(activeTab);
    fetch(tab.file)
      .then(res => res.text())
      .then(text => {
        setContent(prev => ({ ...prev, [activeTab]: text }));
        setLoadingTab(null);
      })
      .catch(err => {
        console.error(err);
        setContent(prev => ({ ...prev, [activeTab]: "Error cargando el contenido." }));
        setLoadingTab(null);
      });
  }, [activeTab, content, loadingTab]);

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">

            <PageHeader
              icon={GitCompare}
              title="Correlación"
              description="Qué campo de la app corresponde a qué apartado de cada modelo de Programación Didáctica (PD-, PD=, PD+), y qué datos pedir al empezar."
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || ''} />

            <Card glow className="p-8">
              {loadingTab === activeTab && !content[activeTab] ? (
                <div className="flex justify-center p-8 text-muted">Cargando...</div>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                    {content[activeTab] || ''}
                  </ReactMarkdown>
                </div>
              )}
            </Card>

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
