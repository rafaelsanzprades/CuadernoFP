"use client";
import { BookOpen, ChevronDown, ChevronUp, Clock, FolderTree, GraduationCap, Layers, ListChecks, AlertTriangle , Info } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import {
  type CurriculumTitulo,
  type CurriculumModulo,
  type CurriculumRA,
  type CurriculumCE,
} from "@/types/curriculum";
import { fileManager } from "@/services/fileManager";
import toast from "react-hot-toast";
import { TabAutores } from "@/components/features/catalogo/TabAutores";

type Tab = "familias" | "titulo" | "cursos" | "modulos" | "autores";



export default function CiclosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CiclosContent />
    </React.Suspense>
  );
}

function CiclosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ["familias", "titulo", "cursos", "modulos", "autores"].includes(tabParam) ? tabParam : "familias"
  );

  const [globalSelection, setGlobalSelection] = useState({
    familia: "Electricidad y Electrónica",
    tituloCodigo: "ELE203",
    moduloCodigo: "0237"
  });

  const updateGlobalSelection = (updates: Partial<typeof globalSelection>) => {
    setGlobalSelection((prev) => ({ ...prev, ...updates }));
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/catalogo?tab=${tab}`, { scroll: false });
  };

  const handleSelectTitulo = (familiaName: string, tituloCodigo: string) => {
    updateGlobalSelection({ familia: familiaName, tituloCodigo });
    setActiveTab("cursos");
    router.replace(`/catalogo?tab=cursos`, { scroll: false });
  };

  const handleSelectFamiliaToTitulo = (familiaName: string, tituloCodigo: string) => {
    updateGlobalSelection({ familia: familiaName, tituloCodigo });
    setActiveTab("titulo");
    router.replace(`/catalogo?tab=titulo`, { scroll: false });
  };

  const handleSelectModulo = (familia: string, tituloCodigo: string, moduloCodigo: string) => {
    updateGlobalSelection({ familia, tituloCodigo, moduloCodigo });
    setActiveTab("modulos");
    router.replace(`/catalogo?tab=modulos`, { scroll: false });
  };

  const TAB_LABELS: Record<Tab, string> = {
    familias: 'Familias profesionales',
    titulo: 'Título',
    cursos: 'Cursos → Módulos',
    modulos: 'Módulo → RA → CE',
    autores: 'Autores/Editoriales'
  };

  const activeTabCleanLabel = TAB_LABELS[activeTab];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-6 pb-12">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo</h1>
              <p className="text-muted mt-2 text-lg">Catálogo oficial de familias profesionales, títulos, cursos → módulos. Módulo → RA → CE.</p>
            </div>

            <Tabs value={activeTab} onValueChange={(val: any) => handleTabChange(val as Tab)}>
              <TabsList className="mb-2 max-w-full">
                {(
                  [
                    { id: "familias" as Tab, label: <span className="flex items-center gap-2"><FolderTree className="w-4 h-4" /> Familias profesionales</span> },
                    { id: "titulo" as Tab, label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Título</span> },
                    { id: "cursos" as Tab, label: <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Cursos → Módulos</span> },
                    { id: "modulos" as Tab, label: <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Módulo → RA → CE</span> },
                    { id: "autores" as Tab, label: <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-info" /> Autores/Editoriales</span> },
                  ]
                ).map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Catálogo Nacional — Ley 3/2022</p>
          <p className="text-sm text-muted mt-1">Catálogo Nacional de Estándares de Competencias Profesionales.</p>
        </div>
      </div>

            {activeTab === "familias" && <TabFamilias onSelectTitulo={handleSelectFamiliaToTitulo} />}
            {activeTab === "titulo" && <TabTitulo onSelectTitulo={handleSelectTitulo} globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} />}
            {activeTab === "cursos" && <TabCursos globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} onSelectModulo={handleSelectModulo} />}
            {activeTab === "modulos" && <TabModulos globalSelection={globalSelection} updateGlobalSelection={updateGlobalSelection} />}
            {activeTab === "autores" && <TabAutores globalSelection={globalSelection} />}
          </MotionWrapper>
        </div>
      </main>
    </div>
  );
}

// ─── TAB 1: Familias profesionales ─────────────────────────────────────────────

type Degree = { id: number; name: string; code: string | null; level: string; boa_articles?: Record<string, string> | null };
type Family = { id: number; code: string; name: string; icon_url: string; color_hex: string; degrees: Degree[] };

const formatDegreeName = (code: string | null, name: string) => {
  if (!code) return name;
  return name.startsWith(code) ? name : `${code} - ${name}`;
};

function TabFamilias({ onSelectTitulo }: { onSelectTitulo: (familiaName: string, tituloCodigo: string) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          const order: Record<string, number> = { BASICA: 1, MEDIO: 2, SUPERIOR: 3, ESPECIALIZACION: 4 };
          const sorted = json.data.map((f: Family) => ({
            ...f,
            degrees: [...f.degrees].sort((a, b) => {
              const levelDiff = (order[a.level] || 99) - (order[b.level] || 99);
              if (levelDiff !== 0) return levelDiff;
              const aIsFPB = a.code?.startsWith("FPB") || false;
              const bIsFPB = b.code?.startsWith("FPB") || false;
              if (aIsFPB && !bIsFPB) return -1;
              if (!aIsFPB && bIsFPB) return 1;
              return (a.code || "").localeCompare(b.code || "");
            }),
          }));
          setFamilies(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {families.map((family) => (
          <div
            key={family.id}
            className="glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300"
          >
            <div
              className="p-6 flex flex-col items-center text-center relative border-b border-white/5"
              style={{ background: `linear-gradient(to bottom, ${family.color_hex}15, transparent)` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: family.color_hex }} />

              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3"
                style={{ backgroundColor: `${family.color_hex}20`, border: `1px solid ${family.color_hex}40` }}
              >
                {family.icon_url.startsWith("fas fa-") ? (
                  <i className={`${family.icon_url} text-4xl`} style={{ color: family.color_hex }} />
                ) : (
                  <img src={family.icon_url} alt={family.code} className="w-full h-full object-contain filter drop-shadow-md" />
                )}
              </div>

              <div
                className="text-xs font-medium px-2 py-1 rounded-md mb-2"
                style={{ backgroundColor: `${family.color_hex}30`, color: family.color_hex }}
              >
                {family.code}
              </div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{family.name}</h2>
            </div>

            <div className="p-5 bg-foreground/10">
              <h3 className="text-xs font-semibold text-muted tracking-wider mb-3">
                Ciclos Formativos ({family.degrees.length})
              </h3>
              {family.degrees.length > 0 ? (
                <div className="space-y-2">
                  {family.degrees.map((degree) => {
                    const badgeMap: Record<string, string> = { BASICA: "GB", MEDIO: "GM", SUPERIOR: "GS", ESPECIALIZACION: "CE" };
                    const badge = badgeMap[degree.level] || degree.level;

                    let styleClass = "border-[var(--glass-border)] hover:bg-foreground/10";
                    let badgeClass = "bg-foreground/20 border-[var(--glass-border)] text-foreground";
                    
                    const lvl = (degree.level || "").toUpperCase();
                    
                    if (lvl.includes("BÁSIC") || lvl.includes("BASIC")) {
                      styleClass = "border-[var(--glass-border)] bg-[#f43f5e]/5 hover:bg-[#f43f5e]/10";
                      badgeClass = "bg-[#f43f5e]/20 border-[#f43f5e]/30 text-[#f43f5e]";
                    } else if (lvl.includes("MEDIO")) {
                      styleClass = "border-[var(--glass-border)] bg-[#10b981]/5 hover:bg-[#10b981]/10";
                      badgeClass = "bg-[#10b981]/20 border-[#10b981]/30 text-[#10b981]";
                    } else if (lvl.includes("SUPERIOR")) {
                      styleClass = "border-[var(--glass-border)] bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10";
                      badgeClass = "bg-[#3b82f6]/20 border-[#3b82f6]/30 text-[#3b82f6]";
                    } else if (lvl.includes("ESPECIALIZACI")) {
                      styleClass = "border-[var(--glass-border)] bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10";
                      badgeClass = "bg-[#f59e0b]/20 border-[#f59e0b]/30 text-[#f59e0b]";
                    }

                    return (
                      <button
                        key={degree.id}
                        onClick={() => onSelectTitulo(family.name, degree.code ?? degree.name)}
                        className={`w-full text-left text-sm bg-foreground/5 rounded-lg p-2.5 border transition-all flex items-center justify-between gap-3 group cursor-pointer ${styleClass}`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="text-foreground/80 font-medium leading-tight flex-1 group-hover:text-foreground transition-colors">
                            {formatDegreeName(degree.code, degree.name)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold border px-2 py-1 rounded shadow-inner tracking-wider ${badgeClass}`}>
                            {badge}
                          </span>
                          <ChevronDown className="w-3 h-3 -rotate-90 text-muted group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted italic text-center py-4">No hay ciclos formativos registrados.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB 2: Título ─────────────────────────────────────────────────────────────

function TabTitulo({ onSelectTitulo, globalSelection, updateGlobalSelection }: { onSelectTitulo: (familiaName: string, tituloCodigo: string) => void; globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [famLoading, setFamLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  const selectedFamilia = globalSelection.familia;
  const selectedTituloCodigo = globalSelection.tituloCodigo;

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];
  const selectedTituloObj = degreesFromApi.find((d) => (d.code ?? d.name) === selectedTituloCodigo);

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const articleTitles: Record<string, string> = {
    article_2: "Artículo 2. Identificación del título.",
    article_3: "Artículo 3. Perfil profesional del título.",
    article_4: "Artículo 4. Competencia general.",
    article_5: "Artículo 5. Competencias profesionales, personales y sociales.",
    article_6: "Artículo 6. Relación de cualificaciones y unidades de competencia del Catálogo Nacional de Cualificaciones Profesionales incluidas en el título.",
    article_7: "Artículo 7. Entorno profesional en el que el profesional va a ejercer su actividad.",
    article_8: "Artículo 8. Prospectiva del título en el sector o sectores.",
    article_9: "Artículo 9. Objeto de las enseñanzas del título."
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => {
              updateGlobalSelection({ familia: e.target.value, tituloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTituloCodigo}
            disabled={!selectedFamilia}
            onChange={(e) => updateGlobalSelection({ tituloCodigo: e.target.value })}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d: any) => (
              <option key={d.id} value={d.code ?? d.name}>{formatDegreeName(d.code, d.name)}</option>
            ))}
          </select>
        </div>
      </Card>


      {selectedTituloObj && (
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-xl border border-[var(--glass-border)]">
             <div>
               <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                 {formatDegreeName(selectedTituloObj.code, selectedTituloObj.name)}
                 {selectedTituloObj.code && !selectedTituloObj.name.startsWith(selectedTituloObj.code) && <Badge variant="default" className="font-mono">{selectedTituloObj.code}</Badge>}
               </h2>
               <p className="text-sm text-muted mt-1">Detalles del currículo del BOA</p>
             </div>
             <Button variant="primary" onClick={() => onSelectTitulo(selectedFamilia, selectedTituloObj.code ?? selectedTituloObj.name)}>
               <BookOpen className="w-4 h-4 mr-2" />
               Ver Módulos
             </Button>
          </div>

          {selectedTituloObj.boa_articles && Object.keys(selectedTituloObj.boa_articles).length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {['article_2', 'article_3', 'article_4', 'article_5', 'article_6', 'article_7', 'article_8', 'article_9'].map((artKey) => {
                const content = selectedTituloObj.boa_articles?.[artKey];
                if (!content) return null;
                return (
                  <Card key={artKey} className="overflow-hidden">
                    <div className="bg-foreground/5 px-6 py-4 border-b border-[var(--glass-border)]">
                      <h3 className="text-base font-bold text-foreground">{articleTitles[artKey] || artKey}</h3>
                    </div>
                    <div className="p-6 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {/* Hide raw text when structured data exists */}
                      {artKey !== 'article_5' && artKey !== 'article_6' && artKey !== 'article_9' && content}
                                            {/* CPPS rows (Article 5) */}
                      {artKey === 'article_5' && Array.isArray(selectedTituloObj.boa_articles?.article_5_cpps) && (
                        <div className="mt-6 space-y-2">
                          {(selectedTituloObj.boa_articles as any).article_5_cpps.map((cpp: any) => (
                            <div key={cpp.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                              <span className="font-mono font-bold text-[#14a085] shrink-0 mt-0.5">CPPS{cpp.id}.</span>
                              <span className="text-sm text-foreground">{cpp.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* CP rows (Article 6) */}
                      {artKey === 'article_6' && Array.isArray((selectedTituloObj.boa_articles as any)?.article_6_cps) && (
                        <div className="mt-6 space-y-4">
                          {(selectedTituloObj.boa_articles as any).article_6_cps.map((cp: any) => (
                            <div key={cp.id} className="rounded-lg border border-[var(--glass-border)] bg-foreground/5 overflow-hidden">
                              <div className="flex items-start gap-3 p-3">
                                <span className="font-mono font-bold text-[#e67e22] shrink-0 mt-0.5">CP{cp.id}.</span>
                                <div className="flex-1">
                                  <span className="font-mono font-semibold text-sm text-foreground">{cp.code}</span>
                                  <span className="text-xs text-muted ml-2">({cp.ref})</span>
                                  <p className="text-sm text-foreground mt-1">{cp.desc}</p>
                                </div>
                              </div>
                              {Array.isArray((selectedTituloObj.boa_articles as any)?.article_6_ucs) && (
                                <div className="border-t border-[var(--glass-border)] bg-foreground/3 px-4 py-2 space-y-1">
                                  {(selectedTituloObj.boa_articles as any).article_6_ucs
                                    .filter((uc: any) => uc.cp_id === cp.id)
                                    .map((uc: any) => (
                                      <div key={uc.id} className="flex items-start gap-2 py-1">
                                        <span className="font-mono font-bold text-xs text-[#2980b9] shrink-0 mt-0.5">{uc.id}:</span>
                                        <span className="text-xs text-foreground/80">{uc.desc}</span>
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* OG rows (Article 9) */}
                      {artKey === 'article_9' && Array.isArray(selectedTituloObj.boa_articles?.article_9_og) && (
                        <div className="mt-6 space-y-2">
                          {(selectedTituloObj.boa_articles as any).article_9_og.map((og: any) => (
                            <div key={og.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                              <span className="font-mono font-bold text-info shrink-0 mt-0.5">OG{og.id}.</span>
                              <span className="text-sm text-foreground">{og.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
              <Layers className="w-12 h-12" />
              <p className="text-lg">Este título aún no tiene los artículos del currículo cargados en la base de datos.</p>
            </Card>
          )}
        </div>
      )}

      {selectedFamilia && selectedFamilyObj?.degrees.length === 0 && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4 mt-6">
          <Layers className="w-12 h-12" />
          <p className="text-lg">No hay títulos registrados para esta familia.</p>
        </Card>
      )}

      {!selectedFamilia && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4 mt-6">
          <GraduationCap className="w-12 h-12" />
          <p className="text-lg">Selecciona una familia profesional para ver sus títulos.</p>
        </Card>
      )}
    </div>
  );
}

// ─── TAB 3: Cursos ────────────────────────────────────────────────────────────

function TabCursos({ globalSelection, updateGlobalSelection, onSelectModulo }: { globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void; onSelectModulo: (familia: string, tituloCodigo: string, moduloCodigo: string) => void }) {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [famLoading, setFamLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  
  const selectedFamilia = globalSelection.familia;
  const selectedTitulo = globalSelection.tituloCodigo;
  const curriculoCodigo = selectedTitulo;

  const [titulo, setTitulo] = useState<any>(null);
  const [tituloLoading, setTituloLoading] = useState(false);

  useEffect(() => {
    if (selectedTitulo) {
      setTituloLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/curriculum/${selectedTitulo}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === 'success') setTitulo(json.data);
          else setTitulo(null);
          setTituloLoading(false);
        })
        .catch(() => { setTitulo(null); setTituloLoading(false); });
    } else {
      setTitulo(null);
    }
  }, [selectedTitulo]);

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];

  const modulosPrimero = titulo ? titulo.modulos.filter((m: any) => m.curso === "1º" || m.curso === "Ambos") : [];
  const modulosSegundo = titulo ? titulo.modulos.filter((m: any) => m.curso === "2º" || m.curso === "Ambos") : [];


  const [cursosAbiertos, setCursosAbiertos] = useState<Set<string>>(new Set(["1º", "2º"]));

  const toggleCurso = (curso: string) => {
    setCursosAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(curso)) next.delete(curso);
      else next.add(curso);
      return next;
    });
  };

  const handleCreateNewProgramacion = async (code: string, name: string, extras: Record<string, any>) => {
    try {
      const ok = await fileManager.createNewProgramacion(code, name, extras);
      if (ok) {
        toast.success(`Programación de ${name} creada correctamente.`);
        router.push("/archivos");
      } else {
        toast.error("Error al crear la programación.");
      }
    } catch (err) {
      toast.error("Error al crear la programación.");
    }
  };

  const renderCursoBlock = (mods: CurriculumModulo[], cursoLabel: string) => {
    if (mods.length === 0) return null;
    const abierto = cursosAbiertos.has(cursoLabel);
    const totalHoras = mods.reduce((s, m) => s + m.horas, 0);

    return (
      <Card key={cursoLabel} className="overflow-hidden">
        <button
          onClick={() => toggleCurso(cursoLabel)}
          className="w-full p-5 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">{cursoLabel} Curso</h2>
            <Badge variant="info">{mods.length} módulos</Badge>
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />{totalHoras}h
            </span>
          </div>
          {abierto ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
        </button>

        {abierto && (
          <div className="border-t border-[var(--glass-border)] animate-in slide-in-from-top-1 duration-200">
            {mods.map((mod) => (
              <button
                key={mod.codigo}
                onClick={() => onSelectModulo(titulo!.familia, curriculoCodigo, mod.codigo)}
                className="w-full p-5 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-foreground/5 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded shrink-0">
                      {mod.codigo}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{mod.nombre}</h3>
                      <span className="flex items-center gap-1 text-xs text-muted mt-1">
                        <Clock className="w-3 h-3" />
                        {mod.horas}h
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        const is2nd = mod.curso === "2º";
                        const h_feoe = is2nd ? 360 : 140;
                        const h_sem = mod.horas ? Math.round(mod.horas / 30) : 0;
                        const tituloNombre = selectedFamilyObj?.degrees.find(d => (d.code ?? d.name) === curriculoCodigo)?.name || curriculoCodigo;
                        
                        const extras = {
                          familia: selectedFamilia,
                          ciclo: tituloNombre,
                          titulo_codigo: curriculoCodigo,
                          curso: mod.curso,
                          h_boa: mod.horas,
                          h_sem: h_sem,
                          p_ev: 15,
                          h_feoe: h_feoe
                        };
                        handleCreateNewProgramacion(mod.codigo, mod.nombre, extras);
                      }}
                      className="shrink-0"
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Nueva Programación
                    </Button>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-muted shrink-0" />
                  </div>
                </div>

                {mod.unidades_formativas && mod.unidades_formativas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <p className="text-xs font-semibold text-muted tracking-wider mb-3 flex items-center gap-1">
                      <FolderTree className="w-3 h-3" />
                      Unidades Formativas ({mod.unidades_formativas.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mod.unidades_formativas.map((uf, i) => (
                        <div key={i} className="bg-foreground/5 rounded-lg p-3 border border-[var(--glass-border)]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-accent">{uf.codigo}</span>
                            <span className="text-xs font-semibold text-foreground/70">{uf.horas}h</span>
                          </div>
                          <p className="text-xs text-foreground/70 mt-1">{uf.nombre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => { updateGlobalSelection({ familia: e.target.value, tituloCodigo: "", moduloCodigo: "" }); }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTitulo}
            disabled={!selectedFamilia}
            onChange={(e) => {
              const val = e.target.value;
              updateGlobalSelection({ tituloCodigo: val, moduloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d: any) => (
              <option key={d.id} value={d.code ?? d.name}>
                {formatDegreeName(d.code, d.name)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {!selectedTitulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-12 h-12" />
          <p className="text-lg">Selecciona una Familia y un Título para ver los módulos organizados por curso.</p>
        </Card>
      )}

      
      {tituloLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
{selectedTitulo && !titulo && !tituloLoading && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <Layers className="w-12 h-12" />
          <p className="text-lg">Este título aún no tiene datos curriculares cargados.</p>
          <p className="text-sm">Los módulos se mostrarán cuando esté disponible el currículo oficial.</p>
        </Card>
      )}

      {selectedTitulo && titulo && !tituloLoading && (
        <div className="space-y-10">
          {renderCursoBlock(modulosPrimero, "1º")}
          {renderCursoBlock(modulosSegundo, "2º")}
          {modulosPrimero.length === 0 && modulosSegundo.length === 0 && (
            <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
              <Layers className="w-12 h-12" />
              <p className="text-lg">No hay módulos para este título.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: Módulos Módulo → RA → CE ────────────────────────────────────────────────────

function TabModulos({ globalSelection, updateGlobalSelection }: { globalSelection: { familia: string; tituloCodigo: string; moduloCodigo: string }; updateGlobalSelection: (updates: Partial<{ familia: string; tituloCodigo: string; moduloCodigo: string }>) => void }) {
  const router = useRouter();
  const [families, setFamilies] = useState<any[]>([]);
  const [famLoading, setFamLoading] = useState(true);
  const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setFamilies(json.data);
        setFamLoading(false);
      })
      .catch(() => setFamLoading(false));
  }, []);

  
  const selectedFamilia = globalSelection.familia;
  const selectedTitulo = globalSelection.tituloCodigo;
  const curriculoCodigo = selectedTitulo;
  const selectedModuloCodigo = globalSelection.moduloCodigo;

  const handleCreateNewProgramacion = async (code: string, name: string, extras: Record<string, any>) => {
    try {
      const ok = await fileManager.createNewProgramacion(code, name, extras);
      if (ok) {
        toast.success(`Programación de ${name} creada correctamente.`);
        router.push("/archivos");
      } else {
        toast.error("Error al crear la programación.");
      }
    } catch (err) {
      toast.error("Error al crear la programación.");
    }
  };

  const [titulo, setTitulo] = useState<any>(null);
  const [tituloLoading, setTituloLoading] = useState(false);

  useEffect(() => {
    if (selectedTitulo) {
      setTituloLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/curriculum/${selectedTitulo}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === 'success') setTitulo(json.data);
          else setTitulo(null);
          setTituloLoading(false);
        })
        .catch(() => { setTitulo(null); setTituloLoading(false); });
    } else {
      setTitulo(null);
    }
  }, [selectedTitulo]);

  const familyNames = families.map((f) => f.name).sort();
  const selectedFamilyObj = families.find((f) => f.name === selectedFamilia);
  const degreesFromApi = selectedFamilyObj?.degrees ?? [];

  const modulo = titulo
    ? titulo.modulos.find((m: any) => m.codigo === selectedModuloCodigo)
    : undefined;


  const toggleRA = (id: string) => {
    setExpandedRAs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (famLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Familia Profesional</label>
          <select
            value={selectedFamilia}
            onChange={(e) => { updateGlobalSelection({ familia: e.target.value, tituloCodigo: "", moduloCodigo: "" }); }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          >
            <option value="">-- Selecciona Familia --</option>
            {familyNames.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Título</label>
          <select
            value={selectedTitulo}
            disabled={!selectedFamilia}
            onChange={(e) => {
              const val = e.target.value;
              updateGlobalSelection({ tituloCodigo: val, moduloCodigo: "" });
            }}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Título --</option>
            {degreesFromApi.map((d: any) => (
              <option key={d.id} value={d.code ?? d.name}>
                {formatDegreeName(d.code, d.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold text-muted tracking-wider">Módulo</label>
          <select
            value={selectedModuloCodigo}
            disabled={!selectedTitulo || !titulo}
            onChange={(e) => updateGlobalSelection({ moduloCodigo: e.target.value })}
            className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Selecciona Módulo --</option>
            {titulo?.modulos.map((m: any) => (
              <option key={m.codigo} value={m.codigo}>
                {m.codigo} — {m.nombre} ({m.curso})
              </option>
            ))}
          </select>
        </div>
      </Card>

      
      {tituloLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
{selectedTitulo && !titulo && !tituloLoading && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <Layers className="w-12 h-12" />
          <p className="text-lg">Este título aún no tiene datos curriculares cargados.</p>
          <p className="text-sm">Los módulos se mostrarán cuando esté disponible el currículo oficial.</p>
        </Card>
      )}

      {!selectedModuloCodigo && titulo && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <ListChecks className="w-12 h-12" />
          <p className="text-lg">Selecciona un módulo para ver los resultados de aprendizaje.</p>
        </Card>
      )}

      {modulo && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded">
                {modulo.codigo}
              </span>
              <h2 className="text-lg font-bold text-foreground">{modulo.nombre}</h2>
              <Badge variant="info">{modulo.horas}h</Badge>
              <Badge>{modulo.curso} Curso</Badge>
            </div>
          </div>

          <Tabs defaultValue="curriculo" className="w-full mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="curriculo">Resultados de Aprendizaje</TabsTrigger>
              <TabsTrigger value="competencias">Competencias Acreditables</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculo">
              <div className="space-y-3">
                {modulo.ra?.map((raItem: any) => {
                  const isExpanded = expandedRAs.has(raItem.id);
                  return (
                    <Card key={raItem.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleRA(raItem.id)}
                        className="w-full p-4 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded shrink-0">
                            {raItem.id}
                          </span>
                          <p className="text-sm text-foreground leading-snug">{raItem.descripcion}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted">{raItem.ce?.length || 0} CE</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[var(--glass-border)] p-4 space-y-2 animate-in slide-in-from-top-1 duration-200">
                          <p className="text-xs font-semibold text-muted tracking-wider">Criterios de Evaluación</p>
                          {raItem.ce?.map((ceItem: any) => (
                            <div key={ceItem.id} className="flex items-start gap-2 text-sm bg-foreground/5 rounded-lg p-3 border border-[var(--glass-border)]">
                              <span className="text-xs font-medium text-accent shrink-0 mt-0.5">{ceItem.id}</span>
                              <span className="text-foreground/80">{ceItem.descripcion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="competencias">
              {(!modulo.competencias || modulo.competencias.length === 0) ? (
                <Card className="p-8 text-center text-muted border-dashed border-[var(--glass-border)]">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Este módulo no tiene competencias directas asociadas para convalidación en el registro oficial.</p>
                  <p className="text-xs mt-2 opacity-70">Es común en módulos transversales, proyecto, FCT o idiomas.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg p-3 text-sm flex items-start gap-2">
                    <ListChecks className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Opciones de Convalidación</p>
                      <p>Para convalidar este módulo, debes cumplir con <strong>alguna</strong> de las siguientes opciones (no todas).</p>
                    </div>
                  </div>
                  
                  {modulo.competencias.map((grupo: any, i: number) => (
                    <Card key={i} className="border border-[var(--glass-border)] overflow-hidden">
                      <div className="bg-foreground/5 border-b border-[var(--glass-border)] p-3 px-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">Opción {i + 1}</h4>
                          <span className="text-xs text-muted">
                            {grupo.es_conjunto ? "Debes acreditar TODAS estas competencias:" : "Debes acreditar esta competencia:"}
                          </span>
                        </div>
                        {grupo.es_conjunto && <Badge variant="default" className="text-[10px]">Conjunto requerido</Badge>}
                      </div>
                      <div className="p-0">
                        {grupo.competencias?.map((comp: any, j: number) => (
                          <div key={j} className="p-3 px-4 border-b border-[var(--glass-border)] last:border-0 flex items-start gap-3 hover:bg-foreground/5 transition-colors">
                            <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded mt-0.5 whitespace-nowrap">
                              {comp.codigo}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{comp.nombre}</p>
                              {comp.info_suprimida && (
                                <p className="text-xs text-muted mt-1 italic border-l-2 border-warning/50 pl-2 py-0.5">
                                  {comp.info_suprimida}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {(grupo.otros_modulos_convalidables_codigos && grupo.otros_modulos_convalidables_codigos.length > 0) && (
                        <div className="bg-success/10 p-3 px-4 text-xs text-success-foreground border-t border-[var(--glass-border)] flex items-start gap-2">
                          <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <p>
                            Con esta opción también convalidarías: <strong>{grupo.otros_modulos_convalidables_codigos.join(", ")}</strong>
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const is2nd = modulo.curso === "2º";
                const h_feoe = is2nd ? 360 : 140;
                const h_sem = modulo.horas ? Math.round(modulo.horas / 30) : 0;
                const tituloNombre = selectedFamilyObj?.degrees.find(d => (d.code ?? d.name) === curriculoCodigo)?.name || curriculoCodigo;
                
                const extras = {
                  familia: selectedFamilia,
                  ciclo: tituloNombre,
                  titulo_codigo: curriculoCodigo,
                  curso: modulo.curso || "1º",
                  h_boa: modulo.horas || 0,
                  h_sem: h_sem,
                  p_ev: 15,
                  h_feoe: h_feoe
                };
                handleCreateNewProgramacion(modulo.codigo, modulo.nombre, extras);
              }}
              className="flex items-center"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Nueva Programación
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
