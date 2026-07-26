"use client";
import { Info, BookOpen, User, Mail, Sparkles, Activity, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TabSync } from "@/components/ui/TabSync";
import { Card } from "@/components/ui/Card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { useTranslation } from "react-i18next";

export default function AyudaPage() {
  const [activeTab, setActiveTab] = useState<string>("asistente-ia");
  const { t } = useTranslation();
  
  const [ideasContent, setIdeasContent] = useState<string>("");
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  useEffect(() => {
    if (activeTab === "ideas" && !ideasContent && !isLoadingIdeas) {
      setIsLoadingIdeas(true);
      fetch('/Ideas.md')
        .then(res => res.text())
        .then(text => {
          setIdeasContent(text);
          setIsLoadingIdeas(false);
        })
        .catch(err => {
          console.error(err);
          setIdeasContent("Error cargando las ideas.");
          setIsLoadingIdeas(false);
        });
    }
  }, [activeTab, ideasContent, isLoadingIdeas]);

  const TABS = [
    { id: "asistente-ia", label: <><span className="inline-flex"><Sparkles className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.asistente_ia', 'Asistente IA')}</>, cleanLabel: t('tabs.asistente_ia', 'Asistente IA') },
    { id: "verificacion", label: <><span className="inline-flex"><Activity className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.verificacion', 'Verificación')}</>, cleanLabel: t('tabs.verificacion', 'Verificación') },
    { id: "ideas", label: <><span className="inline-flex"><FileText className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ideas', 'Ideas')}</>, cleanLabel: t('tabs.ideas', 'Ideas') },
    { id: "contacto", label: <><span className="inline-flex"><Mail className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.contacto', 'Contacto')}</>, cleanLabel: t('tabs.contacto', 'Contacto') },
    { id: "autores", label: <><span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.autores', 'Autores')}</>, cleanLabel: t('tabs.autores', 'Autores') },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Info className="w-6 h-6 text-accent" /> Ayuda y Herramientas Extras
              </h1>
              <p className="text-muted mt-2 text-sm">Configuración de inteligencia artificial, verificaciones de la programación y más.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full flex-wrap">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeTab === "asistente-ia" && (
              <div className="animate-in fade-in duration-500 w-full space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-4">Configuración del Asistente IA</h2>
                  <AISettingsPanel />
                </Card>
              </div>
            )}

            {activeTab === "verificacion" && (
              <div className="animate-in fade-in duration-500 w-full">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-4">Verificación de la Programación</h2>
                  <p className="text-muted">Panel de comprobación en construcción. Aquí se mostrarán alertas si faltan campos obligatorios en tu programación.</p>
                </Card>
              </div>
            )}

            {activeTab === "ideas" && (
              <div className="animate-in fade-in duration-500 w-full">
                <Card glow className="p-8">
                  {isLoadingIdeas && !ideasContent ? (
                    <div className="flex justify-center p-8 text-muted">Cargando ideas...</div>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {ideasContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "contacto" && (
              <div className="animate-in fade-in duration-500 w-full">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-4">Contacto y Soporte</h2>
                  <p className="text-muted mb-4">¿Tienes alguna duda, sugerencia o has encontrado un error?</p>
                  <a href="mailto:rafaelsanzprades@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5" /> Enviar correo electrónico
                  </a>
                </Card>
              </div>
            )}

            {activeTab === "autores" && (
              <div className="animate-in fade-in duration-500 w-full">
                <Card className="p-6">
                  <h2 className="text-lg font-bold mb-4">Autores</h2>
                  <div className="space-y-4 text-muted">
                    <p><strong>Desarrollo y diseño:</strong> Rafael Sanz Prades</p>
                    <p><strong>Documentación base:</strong> Modelo PD+ FP v1</p>
                    <p><strong>Agradecimientos:</strong> A todo el profesorado de Formación Profesional que ha colaborado con sus sugerencias.</p>
                  </div>
                </Card>
              </div>
            )}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
