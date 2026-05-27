// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import DatePicker from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export default function Home() {
  const {
    activeModuleId,
    moduleData, setModuleData,
    updateInfoModulo, updateModuleData,
    groups
  } = useAppStore();
  const [loading, setLoading] = useState(true);

  // ── Selector state ──────────────────────────────────────────
  const [families, setFamilies] = useState<any[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetch("/api/families")
      .then(r => r.json())
      .then(json => { if (json.status === "success") setFamilies(json.data); });
  }, []);

  // Carga el módulo activo al montar / cambiar
  useEffect(() => {
    fetch(`/api/module/${activeModuleId}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") setModuleData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeModuleId, setModuleData]);

  // ── Helpers selector ─────────────────────────────────────────
  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find((d: any) => d.id.toString() === viewDegreeId);

  const clean = (str: string) =>
    str.toLowerCase()
      .replace(/^[a-z0-9]+\s*-\s*/i, "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();

  const displayedGroups = viewDegree
    ? groups.filter(g => clean(g.degreeName) === clean(viewDegree.name))
    : [];

  // Al seleccionar un módulo del desplegable → autocompletar campos desde datos del store
  const handleSelectModule = (code: string) => {
    setSelectedModuleCode(code);
    if (!code) return;

    const mod = displayedGroups.flatMap(g => g.modules).find(m => m.code === code);
    if (!mod) return;

    // Determinar el curso (1º o 2º) según el nombre del grupo
    const group = displayedGroups.find(g => g.modules.some(m => m.code === code));
    const is2nd = group?.name.startsWith("2");
    const h_feoe = is2nd ? 360 : 140;

    // Calcular horas/semana: h_boa / 30 semanas aprox → redondeado
    const h_sem = mod.hours ? Math.round(mod.hours / 30) : 0;
    const curso = is2nd ? "2º" : "1º";

    // Autocompletar info_modulo con los datos del módulo de la BBDD (store)
    updateInfoModulo("modulo", `${mod.code} - ${mod.name}`);
    updateInfoModulo("h_boa", mod.hours);
    updateInfoModulo("h_sem", h_sem);
    updateInfoModulo("p_ev", 15);         // siempre 15% por defecto
    updateInfoModulo("h_feoe", h_feoe);
    updateInfoModulo("curso", curso);

    // Cargar RAs desde la API y almacenarlas en moduleData
    fetch("/api/learning_outcomes")
      .then(r => r.json())
      .then(json => {
        if (json.status === "success" && json.data[code]) {
          const ras = json.data[code].map((ra: any) => ({
            id_ra: `RA${ra.raNumber}`,
            desc_ra: ra.description,
            peso_ra: Math.round(100 / json.data[code].length)
          }));
          updateModuleData("df_ra", ras);
        }
      })
      .catch(() => { });
  };

  // ── Pantalla de carga ─────────────────────────────────────────
  if (loading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a085] mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  const data = moduleData.info_modulo || {};
  const horario = moduleData.horario || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
  const h_sem = Number(data.h_sem) || 0;
  const suma_horario = ["Lun", "Mar", "Mié", "Jue", "Vie"].reduce((acc, day) => acc + (Number(horario[day]) || 0), 0);

  const handleUpdateHorario = (day: string, val: number) =>
    updateModuleData("horario", { ...horario, [day]: val });

  const info_fechas = moduleData.info_fechas || {};
  const calendar_notes = moduleData.calendar_notes || {};
  const pad = (n: number) => String(n).padStart(2, "0");

  const handleUpdateFechas = (field: string, value: string | number) =>
    updateModuleData("info_fechas", { ...info_fechas, [field]: value });

  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      let total = 0, curr = new Date(start);
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch { return 0; }
  };

  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;
  const h_boa = Number(data.h_boa) || 0;
  const p_ev = Number(data.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_real);

  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);
  const sumaCriterios =
    (data.criterio_conocimiento || 0) +
    (data.criterio_procedimiento_practicas || 0) +
    (data.criterio_procedimiento_ejercicios || 0) +
    (data.criterio_tareas || 0);

  const numExamTeo = moduleData.df_act?.filter((a: any) => a.Tipo === "Teoria")?.length || 0;
  const numExamPrac = moduleData.df_act?.filter((a: any) => a.Tipo === "Practica")?.length || 0;
  const numInfEj = moduleData.df_act?.filter((a: any) => a.Tipo === "Informes")?.length || 0;
  const numTareas = moduleData.df_act?.filter((a: any) => a.Tipo === "Tareas")?.length || 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="space-y-8 pb-12">

            {/* ── Título ─────────────────────────────────────────── */}
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-1">
                ⚙️ Configuración
              </h1>
              <p className="text-gray-400 mt-1">Configuración básica del módulo didáctico.</p>
            </div>

            <div className="flex border-b border-white/10 mt-6 mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: "general", label: "📄 Datos Generales" },
                { id: "horarios", label: "🕒 Horarios y Fechas" },
                { id: "evaluacion", label: "⚖️ Evaluación" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-[#14a085] text-[#14a085]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ============================================================== */}
            {/* PESTAÑA: DATOS GENERALES                                       */}
            {/* ============================================================== */}
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* ── Tarjeta Datos ─────────────────────────────────── */}
            <Card className="p-6">
              <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>📝</span> Selección del Módulo didáctico
              </h4>

              {/* Fila 1: Familia + Grado */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select
                  label="Familia Profesional"
                  value={viewFamilyId}
                  onChange={e => { setViewFamilyId(e.target.value); setViewDegreeId(""); setSelectedModuleCode(""); }}
                >
                  <option value="">-- Selecciona Familia --</option>
                  {families.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </Select>
                <Select
                  label="Grado y Título"
                  value={viewDegreeId}
                  onChange={e => { setViewDegreeId(e.target.value); setSelectedModuleCode(""); }}
                  disabled={!viewFamilyId}
                >
                  <option value="">-- Selecciona Título --</option>
                  {viewFamily?.degrees.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.level} · {d.name}</option>
                  ))}
                </Select>
              </div>

              {/* Fila 2: Módulo (desplegable DB) + Curso */}
              <div className="grid grid-cols-5 gap-4 mb-5">
                <div className="col-span-4">
                  <Select
                    label="Módulo didáctico"
                    value={selectedModuleCode}
                    onChange={e => handleSelectModule(e.target.value)}
                    disabled={!viewDegreeId}
                  >
                    <option value="">-- Selecciona Módulo --</option>
                    {displayedGroups.flatMap(g => g.modules).map(mod => (
                      <option key={mod.id} value={mod.code}>
                        {mod.code} · {mod.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Input 
                  label="Curso"
                  type="text"
                  value={data.curso || ""}
                  onChange={e => updateInfoModulo('curso', e.target.value)}
                />
              </div>

              {/* Fila 3: Campos numéricos (autocompletados desde BBDD al seleccionar módulo) */}
              <div className="grid grid-cols-6 gap-4">
                <Input 
                  label="Nº de trimestres"
                  type="text"
                  className="text-gray-500 cursor-not-allowed"
                  disabled 
                  value="3"
                />
                <Input 
                  label="Horas/semana clase"
                  type="number"
                  value={data.h_sem || 0}
                  onChange={e => updateInfoModulo('h_sem', Number(e.target.value))}
                />
                <Input 
                  label="Horas BOA"
                  type="number"
                  value={data.h_boa || 0}
                  onChange={e => updateInfoModulo('h_boa', Number(e.target.value))}
                />
                <Input 
                  label="% P.Ev.Continua"
                  type="number"
                  value={data.p_ev || 15}
                  onChange={e => updateInfoModulo('p_ev', Number(e.target.value))}
                />
                <Input 
                  label={`Horas P.Ev. (${p_ev}%)`}
                  type="text"
                  className="text-yellow-400 cursor-not-allowed text-center font-bold"
                  disabled 
                  value={`${h_p_ev} h`}
                />
                <Input 
                  label="Horas FEOE"
                  type="number"
                  value={data.h_feoe || 0}
                  onChange={e => updateInfoModulo('h_feoe', Number(e.target.value))}
                />
              </div>
            </Card>

            {/* ── Título Datos ────────────────────────────────────── */}
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-1">
                📋 Datos
              </h1>
              <p className="text-gray-400 mt-1">Información del docente, horarios y ponderaciones del módulo.</p>
            </div>

            {/* ── Tarjeta Datos del docente ─────────────────────── */}
            <Card className="p-6">
              <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>🧑‍🏫</span> Datos del docente
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Centro educativo"
                  type="text"
                  value={data.centro || ""}
                  onChange={e => updateInfoModulo('centro', e.target.value)}
                />
                <Input 
                  label="Profesorado"
                  type="text"
                  value={data.profesorado || data.profesor || ""}
                  onChange={e => updateInfoModulo('profesorado', e.target.value)}
                />
              </div>
            </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA: HORARIOS Y FECHAS                                     */}
            {/* ============================================================== */}
            {activeTab === "horarios" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* ── Sesiones semanales ─────────────────────────────── */}
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🕒</span> Sesiones semanales
                </h4>
                <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-sm">
                  Desfase con H/Semanal:{" "}
                  <span className={`font-bold ${suma_horario === h_sem ? "text-green-400" : "text-yellow-400"}`}>
                    {suma_horario - h_sem} h
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                  <Input 
                    key={day}
                    label={day}
                    type="number" min="0" max="8"
                    value={Number(horario[day]) || 0}
                    onChange={e => handleUpdateHorario(day, Number(e.target.value))}
                    className="text-center text-xl font-mono"
                  />
                ))}
              </div>
            </Card>

            {/* ── Sesiones trimestrales ───────────────────────────── */}
            <Card className="p-6 border-l-4 border-l-emerald-500">
              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <span>📅</span> Sesiones trimestrales
              </h4>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "1er trimestre", value: h1 },
                  { label: "2º trimestre", value: h2 },
                  { label: "3er trimestre", value: h3 },
                ].map(t => (
                  <div key={t.label}>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 text-center">{t.label}</label>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">{t.value} h</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {[
                  { label: "Horas BOA", value: `${h_boa} h`, cls: "text-white" },
                  { label: "Horas clases real", value: `${h_real} h`, cls: "text-emerald-400" },
                  { label: `Horas P.Ev. (${p_ev}%)`, value: `${h_p_ev} h`, cls: "text-yellow-400" },
                ].map(s => (
                  <div key={s.label}>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 text-center">{s.label}</label>
                    <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                      <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              </Card>

              {/* ── FEOE ─────────────────────────────────────────── */}
              <Card className="p-6 border-l-4 border-l-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-shadow">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><span>🏢</span> Formación en Empresa (FEOE)</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-semibold text-center">Inicio FEOE</label>
                    <DatePicker value={info_fechas.ini_feoe || ""} onChange={v => handleUpdateFechas("ini_feoe", v)} className="text-center" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block font-semibold text-center">Fin FEOE</label>
                    <DatePicker value={info_fechas.fin_feoe || ""} onChange={v => handleUpdateFechas("fin_feoe", v)} className="text-center" />
                  </div>
                  <Input 
                    label="Horas/día FEOE"
                    type="number" value={Number(info_fechas.h_sem_feoe) || 8}
                    onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))}
                    className="text-center" 
                  />
                </div>
              </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA: EVALUACIÓN                                            */}
            {/* ============================================================== */}
            {activeTab === "evaluacion" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* ── % Ponderación por trimestres ─────────────────── */}
            <Card className="p-6 border-l-4 border-l-accent">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>⚖️</span> % Ponderación por trimestres</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {sumaTrimestres}% {sumaTrimestres !== 100 && "(Debe sumar 100%)"}
                </span>
              </h4>
              <div className="grid grid-cols-3 gap-6">
                {[['pond_1t', '1er trimestre (%)'], ['pond_2t', '2º trimestre (%)'], ['pond_3t', '3er trimestre (%)']].map(([k, label]) => (
                  <Input 
                    key={k}
                    label={label}
                    type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
                    className="text-center" 
                  />
                ))}
              </div>
            </Card>

            {/* ── % Instrumentos de evaluación ─────────────────── */}
            <Card className="p-6 border-l-4 border-l-purple-500">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🧾</span> % Instrumentos de evaluación</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaCriterios === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {sumaCriterios}% {sumaCriterios !== 100 && "(Debe sumar 100%)"}
                </span>
              </h4>
              <div className="grid grid-cols-4 gap-6">
                {[
                  ['criterio_conocimiento', 'Exámenes teóricos'],
                  ['criterio_procedimiento_practicas', 'Exámenes prácticos'],
                  ['criterio_procedimiento_ejercicios', 'Informes de ejercicios'],
                  ['criterio_tareas', 'Cuaderno de tareas'],
                ].map(([k, label]) => (
                  <Input 
                    key={k}
                    label={label}
                    type="number" value={data[k] || 0} onChange={e => updateInfoModulo(k, Number(e.target.value))}
                    className="text-center" 
                  />
                ))}
              </div>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}
