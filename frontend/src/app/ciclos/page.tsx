"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Plus, CheckCircle2, BookOpen, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useUsers, useFamilies, useLearningOutcomes } from "@/hooks/useApi";
import { CourseGroup, ModuleAssignment } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { GroupList } from "@/components/features/asignaciones/GroupList";
import { AddGroupModal } from "@/components/features/asignaciones/AddGroupModal";

type Tab = "familias" | "titulos" | "modulos";

// ─── Types ────────────────────────────────────────────────────────────────────
type Degree = { id: number; name: string; level: string };
type Family = { id: number; code: string; name: string; icon_url: string; color_hex: string; degrees: Degree[] };

// ─── Root export wraps in Suspense for useSearchParams ────────────────────────
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

// ─── Main content ─────────────────────────────────────────────────────────────
function CiclosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve initial tab from URL ?tab=
  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ["familias", "titulos", "modulos"].includes(tabParam) ? tabParam : "familias"
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/ciclos?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Ciclos formativos" />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">

            {/* Cabecera */}
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                🏫 Ciclos formativos
              </h1>
              <p className="text-muted mt-2 text-lg">
                Catálogo oficial de Familias profesionales, Títulos y desglose de módulos del BOE/BOA.
              </p>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
              {(
                [
                  { id: "familias", label: "🗂️ Familias", desc: "Familias profesionales" },
                  { id: "titulos", label: "📋 Títulos", desc: "Asignación de módulos" },
                  { id: "modulos", label: "📦 Módulos", desc: "Desglose BOA/BOE" },
                ] as { id: Tab; label: string; desc: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id)}
                  className={`px-6 py-4 font-bold text-base border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === t.id
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Familias ─────────────────────────────────────────────── */}
            {activeTab === "familias" && <TabFamilias onGoToTitulos={() => handleTabChange("titulos")} />}

            {/* ── Tab: Títulos ──────────────────────────────────────────────── */}
            {activeTab === "titulos" && (
              <TabTitulos
                initialFamilyId={searchParams.get("familyId")}
                initialDegreeId={searchParams.get("degreeId")}
              />
            )}

            {/* ── Tab: Módulos ──────────────────────────────────────────────── */}
            {activeTab === "modulos" && <TabModulos />}

          </div>
        </div>
      </main>
    </div>
  );
}

// ─── TAB: Familias ────────────────────────────────────────────────────────────
function TabFamilias({ onGoToTitulos }: { onGoToTitulos: () => void }) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          const sorted = json.data.map((f: Family) => {
            const order: Record<string, number> = { BASICA: 1, MEDIO: 2, SUPERIOR: 3, ESPECIALIZACION: 4 };
            return { ...f, degrees: f.degrees.sort((a, b) => (order[a.level] || 99) - (order[b.level] || 99)) };
          });
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
            {/* Card header */}
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
                className="text-xs font-bold px-2 py-1 rounded-md mb-2"
                style={{ backgroundColor: `${family.color_hex}30`, color: family.color_hex }}
              >
                {family.code}
              </div>
              <h2 className="text-lg font-bold text-foreground leading-tight">{family.name}</h2>
            </div>

            {/* Degrees list */}
            <div className="p-5 bg-foreground/10">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Ciclos Formativos ({family.degrees.length})
              </h3>
              {family.degrees.length > 0 ? (
                <div className="space-y-2">
                  {family.degrees.map((degree) => {
                    const badgeMap: Record<string, string> = { BASICA: "GB", MEDIO: "GM", SUPERIOR: "GS", ESPECIALIZACION: "CE" };
                    const badge = badgeMap[degree.level] || degree.level;
                    return (
                      <button
                        key={degree.id}
                        onClick={onGoToTitulos}
                        className="w-full text-left text-sm bg-foreground/5 rounded-lg p-2.5 border border-[var(--glass-border)] hover:bg-foreground/10 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                      >
                        <div className="text-foreground/80 font-medium leading-tight flex-1 group-hover:text-foreground transition-colors">
                          {degree.name}
                        </div>
                        <div className="text-[10px] font-bold text-foreground bg-foreground/20 border border-[var(--glass-border)] px-2 py-1 rounded shadow-inner tracking-wider">
                          {badge}
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

// ─── TAB: Títulos (Asignaciones) ──────────────────────────────────────────────
function TabTitulos({
  initialFamilyId,
  initialDegreeId,
}: {
  initialFamilyId: string | null;
  initialDegreeId: string | null;
}) {
  const { groups, setGroups } = useAppStore();
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const { data: usersData } = useUsers();
  const { data: familiesData } = useFamilies();
  const { data: rasData } = useLearningOutcomes();

  const teachers = usersData?.map((u: any) => ({ id: u.id, name: u.name })) || [];
  const families = familiesData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedDegreeId, setSelectedDegreeId] = useState("");

  const [viewFamilyId, setViewFamilyId] = useState(initialFamilyId || "");
  const [viewDegreeId, setViewDegreeId] = useState(initialDegreeId || "");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (groupId: number) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  useEffect(() => {
    if (rasData) {
      setGroups((prevGroups: CourseGroup[]) =>
        prevGroups.map((g: CourseGroup) => ({
          ...g,
          modules: g.modules.map((m: ModuleAssignment) => ({
            ...m,
            ras: rasData[m.code] || m.ras || [],
          })),
        }))
      );
    }
  }, [rasData, setGroups]);

  const handleAssignTeacher = (groupId: number, moduleId: number, teacherId: string) => {
    setGroups((prev: CourseGroup[]) =>
      prev.map((g: CourseGroup) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          modules: g.modules.map((m: ModuleAssignment) => {
            if (m.id !== moduleId) return m;
            return { ...m, assignedTeacherId: teacherId ? Number(teacherId) : null };
          }),
        };
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1000);
  };

  const handleAddGroup = () => {
    if (!newGroupName || !selectedDegreeId) return;
    const family = families.find((f: any) => f.id.toString() === selectedFamilyId);
    const degree = family?.degrees.find((d: any) => d.id.toString() === selectedDegreeId);
    const newGroup: CourseGroup = {
      id: Date.now(),
      name: newGroupName,
      degreeName: degree ? degree.name : "Desconocido",
      level: degree ? degree.level : "Grado",
      modules: [],
    };
    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
    setNewGroupName("");
    setSelectedFamilyId("");
    setSelectedDegreeId("");
    setHasChanges(true);
  };

  const viewFamily = families.find((f: any) => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find((d: any) => d.id.toString() === viewDegreeId);

  const displayedGroups = viewDegree
    ? groups.filter((g: CourseGroup) => {
        const clean = (str: string) =>
          str.toLowerCase().replace(/^[a-z0-9]+\s*-\s*/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return clean(g.degreeName) === clean(viewDegree.name);
      })
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-muted text-sm">Jefatura de Estudios: Asigna el profesorado a los módulos de cada ciclo formativo.</p>
        <div className="flex gap-3 shrink-0">
          <Button
            onClick={handleSave}
            disabled={!hasChanges && saveStatus !== "saved"}
            variant={saveStatus === "saved" ? "success" : hasChanges ? "primary" : "ghost"}
            className={saveStatus === "saved" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}
          >
            {saveStatus === "saving" ? (
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : saveStatus === "saved" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>
              {saveStatus === "saving" ? "Guardando..." : saveStatus === "saved" ? "¡Guardado!" : "Guardar cambios"}
            </span>
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            <Plus className="w-5 h-5" />
            <span>Añadir Grupo</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        <Select
          label="Familia Profesional"
          value={viewFamilyId}
          onChange={(e) => { setViewFamilyId(e.target.value); setViewDegreeId(""); }}
        >
          <option value="">-- Selecciona Familia --</option>
          {families.map((f: any) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </Select>
        <Select
          label="Grado y Título"
          value={viewDegreeId}
          onChange={(e) => setViewDegreeId(e.target.value)}
          disabled={!viewFamilyId}
        >
          <option value="">-- Selecciona Título --</option>
          {viewFamily?.degrees.map((d: any) => (
            <option key={d.id} value={d.id}>{d.level} - {d.name}</option>
          ))}
        </Select>
      </Card>

      <GroupList
        viewDegreeId={viewDegreeId}
        displayedGroups={displayedGroups}
        collapsedGroups={collapsedGroups}
        toggleGroup={toggleGroup}
        teachers={teachers}
        handleAssignTeacher={handleAssignTeacher}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <AddGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        families={families}
        selectedFamilyId={selectedFamilyId}
        setSelectedFamilyId={setSelectedFamilyId}
        selectedDegreeId={selectedDegreeId}
        setSelectedDegreeId={setSelectedDegreeId}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        handleAddGroup={handleAddGroup}
      />
    </div>
  );
}

// ─── TAB: Módulos ─────────────────────────────────────────────────────────────
function TabModulos() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [selectedDegreeId, setSelectedDegreeId] = useState<number | null>(null);
  const [modulesData, setModulesData] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          const order: Record<string, number> = { BASICA: 1, MEDIO: 2, SUPERIOR: 3, ESPECIALIZACION: 4 };
          const sorted = json.data.map((f: Family) => ({
            ...f,
            degrees: f.degrees.sort((a, b) => (order[a.level] || 99) - (order[b.level] || 99)),
          }));
          setFamilies(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load modules when a degree is selected
  useEffect(() => {
    if (!selectedDegreeId) { setModulesData([]); return; }
    setLoadingModules(true);
    fetch(`/api/modules?degree_id=${selectedDegreeId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setModulesData(json.data || []);
        else setModulesData([]);
        setLoadingModules(false);
      })
      .catch(() => { setModulesData([]); setLoadingModules(false); });
  }, [selectedDegreeId]);

  const toggleModule = (code: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectedFamily = families.find((f) => f.id === selectedFamilyId) || null;
  const selectedDegree = selectedFamily?.degrees.find((d) => d.id === selectedDegreeId) || null;

  const levelColor: Record<string, string> = {
    BASICA: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    MEDIO: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    SUPERIOR: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    ESPECIALIZACION: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  };
  const levelLabel: Record<string, string> = {
    BASICA: "Grado Básico",
    MEDIO: "Grado Medio",
    SUPERIOR: "Grado Superior",
    ESPECIALIZACION: "Especialización",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Selectors */}
      <Card className="p-5 flex flex-col md:flex-row gap-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted text-sm">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Cargando familias...
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Familia Profesional</label>
              <select
                value={selectedFamilyId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value) || null;
                  setSelectedFamilyId(id);
                  setSelectedDegreeId(null);
                  setModulesData([]);
                }}
                className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
              >
                <option value="">-- Selecciona Familia --</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Grado y Título</label>
              <select
                value={selectedDegreeId ?? ""}
                disabled={!selectedFamilyId}
                onChange={(e) => setSelectedDegreeId(Number(e.target.value) || null)}
                className="w-full bg-background border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">-- Selecciona Título --</option>
                {selectedFamily?.degrees.map((d) => (
                  <option key={d.id} value={d.id}>{levelLabel[d.level] || d.level} — {d.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </Card>

      {/* Empty states */}
      {!selectedDegreeId && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <span className="text-5xl">📦</span>
          <p className="text-lg">Selecciona una Familia y un Título para ver el desglose de módulos.</p>
        </Card>
      )}

      {selectedDegreeId && loadingModules && (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedDegreeId && !loadingModules && modulesData.length === 0 && (
        <Card className="p-12 text-center text-muted flex flex-col items-center justify-center gap-4">
          <span className="text-5xl">🔍</span>
          <p className="text-lg">No se encontraron módulos para este título en la base de datos.</p>
        </Card>
      )}

      {/* Modules list */}
      {selectedDegreeId && !loadingModules && modulesData.length > 0 && (
        <div className="space-y-4">
          {/* Header summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedDegree && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${levelColor[selectedDegree.level] || "text-muted border-white/10"}`}>
                  {levelLabel[selectedDegree.level] || selectedDegree.level}
                </span>
              )}
              <h2 className="text-lg font-bold text-foreground">{selectedDegree?.name}</h2>
            </div>
            <span className="text-sm text-muted">{modulesData.length} módulos</span>
          </div>

          {/* Modules table-like cards */}
          <div className="space-y-3">
            {modulesData.map((mod: any) => {
              const isExpanded = expandedModules.has(mod.code);
              const hasRas = mod.learning_outcomes && mod.learning_outcomes.length > 0;
              return (
                <Card key={mod.code} className="overflow-hidden">
                  <button
                    onClick={() => toggleModule(mod.code)}
                    className="w-full p-4 flex items-center justify-between gap-4 hover:bg-foreground/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded shrink-0">
                        {mod.code}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">{mod.name}</h3>
                        {mod.specialization && (
                          <p className="text-xs text-muted truncate">{mod.specialization}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {mod.hours_boa != null && (
                        <div className="text-right">
                          <div className="text-xs text-muted">Horas BOA</div>
                          <div className="text-base font-bold text-foreground">{mod.hours_boa}h</div>
                        </div>
                      )}
                      {hasRas && (
                        <div className="text-right">
                          <div className="text-xs text-muted">RA</div>
                          <div className="text-base font-bold text-accent">{mod.learning_outcomes.length}</div>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--glass-border)] p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      {/* Module details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {mod.hours_boa != null && (
                          <div className="bg-foreground/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-muted mb-1">Horas BOA</div>
                            <div className="text-2xl font-extrabold text-foreground">{mod.hours_boa}</div>
                          </div>
                        )}
                        {mod.hours_week != null && (
                          <div className="bg-foreground/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-muted mb-1">Horas/semana</div>
                            <div className="text-2xl font-extrabold text-foreground">{mod.hours_week}</div>
                          </div>
                        )}
                        {mod.credits != null && (
                          <div className="bg-foreground/5 rounded-xl p-3 text-center">
                            <div className="text-xs text-muted mb-1">Créditos ECTS</div>
                            <div className="text-2xl font-extrabold text-foreground">{mod.credits}</div>
                          </div>
                        )}
                        {hasRas && (
                          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-center">
                            <div className="text-xs text-muted mb-1">Resultados Aprendizaje</div>
                            <div className="text-2xl font-extrabold text-accent">{mod.learning_outcomes.length}</div>
                          </div>
                        )}
                      </div>

                      {/* Learning outcomes */}
                      {hasRas && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Resultados de Aprendizaje (RA)</h4>
                          {mod.learning_outcomes.map((ra: any, idx: number) => (
                            <div key={idx} className="bg-foreground/5 rounded-lg p-3 border border-white/5">
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded shrink-0 mt-0.5">
                                  RA{ra.raNumber ?? idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm text-foreground leading-snug">{ra.description}</p>
                                  {ra.criteria && ra.criteria.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Criterios de evaluación:</p>
                                      <ul className="space-y-0.5">
                                        {ra.criteria.map((ce: string, cidx: number) => (
                                          <li key={cidx} className="text-xs text-muted flex gap-2">
                                            <span className="text-accent shrink-0">CE{cidx + 1}.</span>
                                            <span>{ce}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
