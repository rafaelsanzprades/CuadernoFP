"use client";
import { Route, Info, GraduationCap, ArrowRight, Award, Calendar, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAppStore } from "@/store/useAppStore";

/**
 * TAB "Itinerario formativo" en /alumnado
 * Muestra el itinerario vertical del alumno (Grados A→E)
 * según Indicador 1.4 del Sistema Estatal:
 * "Porcentaje de alumnado matriculado en Grado X que posee alguna titulación de Grado X-1"
 */

const GRADOS = [
  { id: "A", nombre: "Acreditación parcial", color: "text-blue-500", bg: "bg-blue-500" },
  { id: "B", nombre: "Certificado de competencia", color: "text-emerald-500", bg: "bg-emerald-500" },
  { id: "C", nombre: "Certificado profesional", color: "text-amber-500", bg: "bg-amber-500" },
  { id: "D", nombre: "Ciclo formativo (GM/GS)", color: "text-violet-500", bg: "bg-violet-500" },
  { id: "E", nombre: "Especialización", color: "text-rose-500", bg: "bg-rose-500" },
];

interface TitulacionPrevia {
  grado: string;
  titulo: string;
  centro: string;
  anio: string;
}

export function ItinerarioTab() {
  const { cursoData, updateCursoData } = useAppStore();
  const alumnos = (cursoData as any)?.df_al || [];
  const [selectedAlumno, setSelectedAlumno] = useState<string>("");
  const [titulaciones, setTitulaciones] = useState<Record<string, TitulacionPrevia[]>>(
    (cursoData as any)?.itinerarios || {}
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TitulacionPrevia>({ grado: "", titulo: "", centro: "", anio: "" });
  const [saved, setSaved] = useState(false);

  const alumnoActual = useMemo(
    () => alumnos.find((a: any) => a.id === selectedAlumno),
    [alumnos, selectedAlumno]
  );

  const titulacionesAlumno = titulaciones[selectedAlumno] || [];

  const handleAdd = () => {
    if (!form.grado || !form.titulo) return;
    const nuevas = [...titulacionesAlumno, form];
    const nuevosItinerarios = { ...titulaciones, [selectedAlumno]: nuevas };
    setTitulaciones(nuevosItinerarios);
    updateCursoData("itinerarios", nuevosItinerarios);
    setForm({ grado: "", titulo: "", centro: "", anio: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = (idx: number) => {
    const nuevas = titulacionesAlumno.filter((_: any, i: number) => i !== idx);
    const nuevosItinerarios = { ...titulaciones, [selectedAlumno]: nuevas };
    setTitulaciones(nuevosItinerarios);
    updateCursoData("itinerarios", nuevosItinerarios);
  };

  // Stats
  const stats = useMemo(() => {
    const total = alumnos.filter((a: any) => a.Estado !== "Baja").length;
    const conItinerario = Object.keys(titulaciones).filter(
      (id) => (titulaciones[id] || []).length > 0
    ).length;
    const promocion = total > 0 ? ((conItinerario / total) * 100).toFixed(1) : "0";
    return { total, conItinerario, promocion };
  }, [alumnos, titulaciones]);

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Itinerario formativo vertical - Indicador 1.4</p>
          <p className="text-sm text-muted mt-1">
            Registra las titulaciones previas del alumnado para calcular la tasa de promoción entre grados (A→B→C→D→E).
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted">Alumnado activo</p>
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Route className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted">Con itinerario registrado</p>
            <p className="text-lg font-bold text-foreground">{stats.conItinerario}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <Award className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted">Tasa promoción</p>
            <p className="text-lg font-bold text-accent">{stats.promocion}%</p>
          </div>
        </Card>
      </div>

      {/* Selector de alumno */}
      <Card className="p-4">
        <label className="text-xs font-semibold text-muted mb-2 block">Seleccionar alumno</label>
        <Select value={selectedAlumno} onChange={(e) => setSelectedAlumno(e.target.value)}>
          <option value="">- Selecciona un alumno -</option>
          {alumnos
            .filter((a: any) => a.Estado !== "Baja")
            .map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.Apellido1} {a.Apellido2}, {a.Nombre}
              </option>
            ))}
        </Select>
      </Card>

      {/* Itinerario del alumno seleccionado */}
      {selectedAlumno && alumnoActual && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Route className="w-4 h-4 text-accent" />
              Itinerario de {alumnoActual.Apellido1} {alumnoActual.Apellido2}, {alumnoActual.Nombre}
            </h3>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              + Añadir titulación
            </Button>
          </div>

          {/* Timeline visual */}
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {GRADOS.map((g, i) => {
              const tiene = titulacionesAlumno.some((t: TitulacionPrevia) => t.grado === g.id);
              return (
                <div key={g.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      tiene
                        ? `${g.bg} text-white`
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {g.id}
                  </div>
                  {i < GRADOS.length - 1 && (
                    <ArrowRight className={`w-4 h-4 ${tiene ? "text-accent" : "text-gray-300"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulario nueva titulación */}
          {showForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Grado</label>
                <Select value={form.grado} onChange={(e) => setForm({ ...form, grado: e.target.value })}>
                  <option value="">- Grado -</option>
                  {GRADOS.map((g) => (
                    <option key={g.id} value={g.id}>
                      Grado {g.id} - {g.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Título / Certificado</label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Nombre del título" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Centro emisor</label>
                <Input value={form.centro} onChange={(e) => setForm({ ...form, centro: e.target.value })} placeholder="Centro educativo" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Año</label>
                <Input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} placeholder="2024" />
              </div>
              <div className="lg:col-span-4 flex gap-2">
                <Button size="sm" onClick={handleAdd}>Guardar titulación</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {/* Lista de titulaciones */}
          {titulacionesAlumno.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Sin titulaciones previas registradas.</p>
          ) : (
            <div className="space-y-2">
              {titulacionesAlumno.map((t: TitulacionPrevia, idx: number) => {
                const grado = GRADOS.find((g) => g.id === t.grado);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-[var(--glass-border)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${grado?.bg || "bg-gray-500"}`}>
                        {t.grado}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.titulo}</p>
                        <p className="text-xs text-muted">{t.centro} · {t.anio}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(idx)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded">
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {saved && <p className="text-sm text-green-500 font-semibold">✓ Guardado</p>}
        </Card>
      )}
    </div>
  );
}

