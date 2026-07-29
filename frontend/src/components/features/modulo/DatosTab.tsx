"use client";
import { Calendar, FileEdit, Receipt, Scale, School, UserCircle, Settings , Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Family } from "@/types";
import { fileManager } from "@/services/fileManager";

export function DatosTab() {
  const {
    moduleData,
    setModuleData,
    updateInfoModulo,
    updateModuleData,
    groups,
    activeModuleId
  } = useAppStore();

  useEffect(() => {
    // Force reload of new demo values if they are missing
    if (moduleData?.info_modulo?.centro !== "IES Andalán" || (moduleData?.df_act && moduleData.df_act.length < 21)) {
      const db = fileManager.getDb();
      if (db['0237-ictve-pd']) {
        setModuleData(db['0237-ictve-pd']);
      }
    }
  }, [moduleData?.info_modulo?.centro, moduleData?.df_act?.length, setModuleData]);

  // --- States for Módulo didáctico ---
  const [families, setFamilies] = useState<Family[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState("");

  useEffect(() => {
    setViewFamilyId("");
    setViewDegreeId("");
    setSelectedModuleCode("");
  }, [activeModuleId]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then(r => r.json())
      .then(json => { if (json.status === "success") setFamilies(json.data); });
  }, []);

  useEffect(() => {
    if (families.length > 0 && moduleData?.info_modulo) {
      const { familia, titulo_fp, codigo } = moduleData.info_modulo;
      
      const cleanStr = (s: string) => s ? s.toLowerCase().replace(/^[a-z0-9]+\s*-\s*/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

      if (familia && !viewFamilyId) {
        const fam = families.find(f => cleanStr(f.name) === cleanStr(familia));
        if (fam) {
          setViewFamilyId(fam.id.toString());
          if (titulo_fp) {
            const deg = fam.degrees.find(d => {
              const dn = cleanStr(d.name);
              const cn = cleanStr(titulo_fp);
              return dn === cn || dn.includes(cn) || cn.includes(dn);
            });
            if (deg) {
              setViewDegreeId(deg.id.toString());
            }
          }
        }
      }
      
      if (codigo && !selectedModuleCode) {
        setSelectedModuleCode(codigo);
      }
    }
  }, [families, moduleData, viewFamilyId, selectedModuleCode]);

  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find(d => d.id.toString() === viewDegreeId);

  const clean = (str: string) =>
    str.toLowerCase()
      .replace(/^[a-z0-9]+\s*-\s*/i, "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();

  const displayedGroups = viewDegree
    ? groups.filter(g => { const gn = clean(g.degreeName); const dn = clean(viewDegree.name); return gn === dn || gn.includes(dn) || dn.includes(gn); })
    : [];

  const handleSelectModule = (code: string) => {
    setSelectedModuleCode(code);
    if (!code) return;

    const mod = displayedGroups.flatMap(g => g.modules).find(m => m.code === code);
    if (!mod) return;

    const group = displayedGroups.find(g => g.modules.some(m => m.code === code));
    const is2nd = group?.name.startsWith("2");
    const h_feoe = is2nd ? 360 : 140;

    const h_sem = mod.hours ? Math.round(mod.hours / 30) : 0;
    const curso = is2nd ? "2º" : "1º";

    updateInfoModulo("codigo", mod.code);
    updateInfoModulo("nombre", mod.name);
    updateInfoModulo("h_boa", mod.hours);
    updateInfoModulo("h_sem", h_sem);
    updateInfoModulo("p_ev", 15);
    updateInfoModulo("h_feoe", h_feoe);
    updateInfoModulo("curso", curso);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning_outcomes`)
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

  // --- Data Extraction ---
  const data = moduleData?.info_modulo || {};

  const h_sem = Number(data.h_sem) || 0;
  const h_boa = Number(data.h_boa) || 0;
  const p_ev = Number(data.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_boa);

  // --- Evaluación ---
  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);
  const sumaCriterios =
    (data.criterio_conocimiento || 0) +
    (data.criterio_procedimiento_practicas || 0) +
    (data.criterio_procedimiento_ejercicios || 0) +
    (data.criterio_tareas || 0);

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Centro y docente */}
      <Card className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-5">
<span>‍<span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Centro y docente
</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <Select
            label="Comunidad / Territorio"
            value={data.ccaa || ""}
            onChange={e => updateInfoModulo('ccaa', e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            <option value="andalucia">Andalucía</option>
            <option value="aragon">Aragón</option>
            <option value="asturias">Principado de Asturias</option>
            <option value="baleares">Islas Baleares</option>
            <option value="canarias">Canarias</option>
            <option value="cantabria">Cantabria</option>
            <option value="castilla-mancha">Castilla-La Mancha</option>
            <option value="castilla-leon">Castilla y León</option>
            <option value="cataluna">Cataluña</option>
            <option value="extremadura">Extremadura</option>
            <option value="galicia">Galicia</option>
            <option value="la-rioja">La Rioja</option>
            <option value="madrid">Comunidad de Madrid</option>
            <option value="murcia">Región de Murcia</option>
            <option value="navarra">Comunidad Foral de Navarra</option>
            <option value="pais-vasco">País Vasco</option>
            <option value="valencia">Comunidad Valenciana</option>
            <option value="ceuta">Ceuta (Ministerio)</option>
            <option value="melilla">Melilla (Ministerio)</option>
          </Select>
        </div>
      </Card>

      {/* 2. Módulo didáctico */}
      <Card className="p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground mb-5">
<span><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Módulo didáctico
</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label="Familia profesional"
            value={viewFamilyId}
            onChange={e => { setViewFamilyId(e.target.value); setViewDegreeId(""); setSelectedModuleCode(""); }}
          >
            <option value="">-- Selecciona Familia --</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
          <Select
            label="Título de FP (grado D)"
            value={viewDegreeId}
            onChange={e => { setViewDegreeId(e.target.value); setSelectedModuleCode(""); }}
            disabled={!viewFamilyId}
          >
            <option value="">-- Selecciona Título --</option>
            {viewFamily?.degrees.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-5">
          <div className="col-span-3">
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
          <div className="col-span-2">
            <Select
              label="Régimen dual LO 3/2022"
              value={moduleData?.dual_regimen || "ninguno"}
              onChange={e => updateModuleData('dual_regimen', e.target.value)}
            >
              <option value="ninguno">Ninguno / Tradicional</option>
              <option value="general">Dual General (25% - 35%)</option>
              <option value="intensivo">Dual Intensivo (35% - 50%)</option>
            </Select>
          </div>
          <div className="col-span-1">
            <Input 
              label="Curso"
              type="text"
              value={data.curso || ""}
              onChange={e => updateInfoModulo('curso', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Input 
            label="Nº de trimestres"
            type="text"
            className="text-muted cursor-not-allowed"
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
            label="% P.Ev. continua"
            type="number"
            value={data.p_ev || 15}
            onChange={e => updateInfoModulo('p_ev', Number(e.target.value))}
          />
          <Input 
            label={`Horas P.Ev. (${p_ev}%)`}
            type="text"
            className="text-warning cursor-not-allowed text-center font-bold"
            disabled 
            value={`${h_p_ev} h`}
          />
        </div>
      </Card>



      {/* 5. Evaluación */}
      <Card className="p-6 border-l-4 border-l-accent">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Scale className="w-[1.2em] h-[1.2em] mr-1" /></span></span> % Ponderación por trimestres</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
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

      <Card className="p-6 border-l-4 border-l-purple-500">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Receipt className="w-[1.2em] h-[1.2em] mr-1" /></span></span> % Instrumentos de evaluación</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sumaCriterios === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
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

      {/* 6. Reglas de redondeo y compensación */}
      <Card className="p-6 border-l-4 border-l-orange-500">
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Reglas de redondeo y compensación</span>
        </h4>
        {(() => {
          const config = moduleData?.config_redondeo || {
            nota_aprobado: 5.0,
            umbral_redondeo: 5.0,
            max_compensables: 0
          };
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nota mínima para aprobar</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={config.nota_aprobado ?? 5.0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, nota_aprobado: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-xs text-muted">Nota a partir de la cual un RA o Módulo se considera superado (típicamente 5.0).</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Umbral de redondeo al alza</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={config.umbral_redondeo ?? 5.0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, umbral_redondeo: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-xs text-muted">Si el alumnado obtiene esta nota o superior (ej. 4.8), se redondeará automáticamente a la nota de aprobado.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Criterios compensables por RA</label>
                <input 
                  type="number" 
                  step="1"
                  value={config.max_compensables ?? 0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, max_compensables: parseInt(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-xs text-muted">Número máximo de Criterios suspensos que se permiten para aprobar un RA.</p>
              </div>
            </div>
          );
        })()}
      </Card>

    </div>
    </>
  );
}

