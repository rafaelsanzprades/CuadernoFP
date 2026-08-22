"use client";
import { Calendar, FileEdit, Receipt, Scale, School, UserCircle, Settings, Info, ListChecks, Plus, Trash2, ChevronDown } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Family } from "@/types";
import { DEFAULT_INSTRUMENTOS_PCT } from "@/data/defaultInstrumentosPct";
import { useTranslation } from "react-i18next";

// Semilla por defecto de "% Instrumentos de evaluación" por trimestre — se
// usa solo mientras el módulo no tenga ninguna fila guardada todavía.
// Estilo en línea (no clase Tailwind) para el grid de instrumentos — evita
// depender de que grid-cols-12 se genere correctamente en el build.
const INSTR_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 2.5rem",
  gap: "0.75rem",
};

// Semilla por defecto de "Escalas de evaluación cualitativas" — la escala
// oficial española de siempre (Insuficiente/Suficiente/Bien/Notable/
// Sobresaliente, IN/SU/BI/NT/SB), con el valor numérico central de cada
// tramo como coeficiente de conversión a la nota 0-10.
const DEFAULT_ESCALAS_EVALUACION = [
  { id: "eev_in", nombre: "Insuficiente (IN)", coeficiente: 3 },
  { id: "eev_su", nombre: "Suficiente (SU)", coeficiente: 5 },
  { id: "eev_bi", nombre: "Bien (BI)", coeficiente: 6 },
  { id: "eev_nt", nombre: "Notable (NT)", coeficiente: 7.5 },
  { id: "eev_sb", nombre: "Sobresaliente (SB)", coeficiente: 9.5 },
];

export function DatosTab() {
  const { t } = useTranslation();
  const {
    moduleData,
    setModuleData,
    updateInfoModulo,
    updateModuleData,
    activeModuleId
  } = useAppStore();

  // --- States for Módulo didáctico ---
  const [families, setFamilies] = useState<Family[]>([]);
  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [selectedModuleCode, setSelectedModuleCode] = useState("");
  const [degreeModules, setDegreeModules] = useState<any[]>([]);

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

  // Real módulos (con RA/CE) del título seleccionado, desde el catálogo oficial --
  // reemplaza el antiguo fixture hardcodeado initialGroups (solo cubría 2 títulos).
  useEffect(() => {
    if (!viewDegree?.code) {
      setDegreeModules([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalog/curriculum/${viewDegree.code}`)
      .then(r => r.json())
      .then(json => { setDegreeModules(json.status === "success" ? json.data.modulos : []); })
      .catch(() => setDegreeModules([]));
  }, [viewDegree?.code]);

  const handleSelectModule = (code: string) => {
    setSelectedModuleCode(code);
    if (!code) return;

    const mod = degreeModules.find(m => m.codigo === code);
    if (!mod) return;

    const h_feoe = mod.curso === "2º" ? 360 : 140;
    const h_sem = mod.horas ? Math.round(mod.horas / 30) : 0;

    updateInfoModulo("codigo", mod.codigo);
    updateInfoModulo("nombre", mod.nombre);
    updateInfoModulo("h_boa", mod.horas);
    updateInfoModulo("h_sem", h_sem);
    updateInfoModulo("p_ev", 15);
    updateInfoModulo("h_feoe", h_feoe);
    updateInfoModulo("curso", mod.curso);

    if (Array.isArray(mod.ra) && mod.ra.length > 0) {
      const pesoRa = Math.round(100 / mod.ra.length);
      const df_ra = mod.ra.map((ra: any) => ({
        id_ra: String(ra.id).replace(/\.$/, ''),
        desc_ra: ra.descripcion,
        peso_ra: pesoRa,
      }));
      const df_ce = mod.ra.flatMap((ra: any) => {
        const ces = Array.isArray(ra.ce) ? ra.ce : [];
        const pesoCe = ces.length > 0 ? Math.round(100 / ces.length) : 0;
        return ces.map((ce: any) => ({
          id_ra: String(ra.id).replace(/\.$/, ''),
          id_ce: ce.id,
          desc_ce: ce.descripcion,
          peso_ce: pesoCe,
        }));
      });
      updateModuleData("df_ra", df_ra);
      updateModuleData("df_ce", df_ce);
    }
  };

  // --- Data Extraction ---
  const data = moduleData?.info_modulo || {};

  const h_sem = Number(data.h_sem) || 0;
  const h_boa = Number(data.h_boa) || 0;
  const p_ev = Number(data.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_boa);

  // --- Evaluación ---
  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);

  const instrumentosPct = (moduleData?.instrumentos_pct_trimestre && moduleData.instrumentos_pct_trimestre.length > 0)
    ? moduleData.instrumentos_pct_trimestre
    : DEFAULT_INSTRUMENTOS_PCT;
  const sum1t = instrumentosPct.reduce((a, r) => a + (Number(r.pct_1t) || 0), 0);
  const sum2t = instrumentosPct.reduce((a, r) => a + (Number(r.pct_2t) || 0), 0);
  const sum3t = instrumentosPct.reduce((a, r) => a + (Number(r.pct_3t) || 0), 0);

  const updateInstrumentoPctField = (id: string, field: "categoria" | "nombre" | "pct_1t" | "pct_2t" | "pct_3t", value: string) => {
    const next = instrumentosPct.map(r => r.id === id
      ? { ...r, [field]: (field === "nombre" || field === "categoria") ? value : (Number(value) || 0) }
      : r);
    updateModuleData("instrumentos_pct_trimestre", next);
  };
  const addInstrumentoPct = () => {
    updateModuleData("instrumentos_pct_trimestre", [
      ...instrumentosPct,
      { id: `instr_${Date.now()}`, categoria: "Teoría", nombre: "", pct_1t: 0, pct_2t: 0, pct_3t: 0 },
    ]);
  };
  const removeInstrumentoPct = (id: string) => {
    updateModuleData("instrumentos_pct_trimestre", instrumentosPct.filter(r => r.id !== id));
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Centro y docente */}
      <Card className="p-6">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
<span>‍<span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span></span> {t('campos.modulo.tituloCentroDocente', {defaultValue: 'Centro y docente'})}
</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label={t('campos.modulo.centroEducativo', {defaultValue: 'Centro educativo'})}
            type="text"
            value={data.centro || ""}
            onChange={e => updateInfoModulo('centro', e.target.value)}
          />
          <Input
            label={t('campos.modulo.profesorado', {defaultValue: 'Profesorado'})}
            type="text"
            value={data.profesorado || data.profesor || ""}
            onChange={e => updateInfoModulo('profesorado', e.target.value)}
          />
          <Select
            label={t('campos.modulo.comunidadTerritorio', {defaultValue: 'Comunidad / Territorio'})}
            value={data.ccaa || ""}
            onChange={e => updateInfoModulo('ccaa', e.target.value)}
          >
            <option value="">{t('campos.modulo.placeholderSelecciona', {defaultValue: '-- Selecciona --'})}</option>
            <option value="andalucia">{t('checks.modulo.ccaaAndalucia', {defaultValue: 'Andalucía'})}</option>
            <option value="aragon">{t('checks.modulo.ccaaAragon', {defaultValue: 'Aragón'})}</option>
            <option value="asturias">{t('checks.modulo.ccaaAsturias', {defaultValue: 'Principado de Asturias'})}</option>
            <option value="baleares">{t('checks.modulo.ccaaBaleares', {defaultValue: 'Islas Baleares'})}</option>
            <option value="canarias">{t('checks.modulo.ccaaCanarias', {defaultValue: 'Canarias'})}</option>
            <option value="cantabria">{t('checks.modulo.ccaaCantabria', {defaultValue: 'Cantabria'})}</option>
            <option value="castilla-mancha">{t('checks.modulo.ccaaCastillaMancha', {defaultValue: 'Castilla-La Mancha'})}</option>
            <option value="castilla-leon">{t('checks.modulo.ccaaCastillaLeon', {defaultValue: 'Castilla y León'})}</option>
            <option value="cataluna">{t('checks.modulo.ccaaCataluna', {defaultValue: 'Cataluña'})}</option>
            <option value="extremadura">{t('checks.modulo.ccaaExtremadura', {defaultValue: 'Extremadura'})}</option>
            <option value="galicia">{t('checks.modulo.ccaaGalicia', {defaultValue: 'Galicia'})}</option>
            <option value="la-rioja">{t('checks.modulo.ccaaLaRioja', {defaultValue: 'La Rioja'})}</option>
            <option value="madrid">{t('checks.modulo.ccaaMadrid', {defaultValue: 'Comunidad de Madrid'})}</option>
            <option value="murcia">{t('checks.modulo.ccaaMurcia', {defaultValue: 'Región de Murcia'})}</option>
            <option value="navarra">{t('checks.modulo.ccaaNavarra', {defaultValue: 'Comunidad Foral de Navarra'})}</option>
            <option value="pais-vasco">{t('checks.modulo.ccaaPaisVasco', {defaultValue: 'País Vasco'})}</option>
            <option value="valencia">{t('checks.modulo.ccaaValencia', {defaultValue: 'Comunidad Valenciana'})}</option>
            <option value="ceuta">{t('checks.modulo.ccaaCeuta', {defaultValue: 'Ceuta (Ministerio)'})}</option>
            <option value="melilla">{t('checks.modulo.ccaaMelilla', {defaultValue: 'Melilla (Ministerio)'})}</option>
          </Select>
        </div>
      </Card>

      {/* 2. Módulo didáctico */}
      <Card className="p-6">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
<span><span className="inline-flex"><FileEdit className="w-[1.2em] h-[1.2em] mr-1" /></span></span> {t('campos.modulo.tituloModuloDidactico', {defaultValue: 'Módulo didáctico'})}
</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label={t('campos.modulo.familiaProfesional', {defaultValue: 'Familia profesional'})}
            value={viewFamilyId}
            onChange={e => { setViewFamilyId(e.target.value); setViewDegreeId(""); setSelectedModuleCode(""); }}
          >
            <option value="">{t('campos.modulo.placeholderSeleccionaFamilia', {defaultValue: '-- Selecciona Familia --'})}</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
          <Select
            label={t('campos.modulo.tituloFpGradoD', {defaultValue: 'Título de FP (grado D)'})}
            value={viewDegreeId}
            onChange={e => { setViewDegreeId(e.target.value); setSelectedModuleCode(""); }}
            disabled={!viewFamilyId}
          >
            <option value="">{t('campos.modulo.placeholderSeleccionaTitulo', {defaultValue: '-- Selecciona Título --'})}</option>
            {viewFamily?.degrees.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-6 gap-4 mb-5">
          <div className="col-span-3">
            <Select
              label={t('campos.modulo.labelModuloDidactico', {defaultValue: 'Módulo didáctico'})}
              value={selectedModuleCode}
              onChange={e => handleSelectModule(e.target.value)}
              disabled={!viewDegreeId}
            >
              <option value="">{t('campos.modulo.placeholderSeleccionaModulo', {defaultValue: '-- Selecciona Módulo --'})}</option>
              {degreeModules.map(mod => (
                <option key={mod.codigo} value={mod.codigo}>
                  {mod.codigo} · {mod.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <Select
              label={t('campos.modulo.regimenDualLabel', {defaultValue: 'Régimen dual LO 3/2022'})}
              value={moduleData?.dual_regimen || "ninguno"}
              onChange={e => updateModuleData('dual_regimen', e.target.value)}
            >
              <option value="ninguno">{t('checks.modulo.dualRegimenNinguno', {defaultValue: 'Ninguno / Tradicional'})}</option>
              <option value="general">{t('checks.modulo.dualRegimenGeneral', {defaultValue: 'Dual General (25% - 35%)'})}</option>
              <option value="intensivo">{t('checks.modulo.dualRegimenIntensivo', {defaultValue: 'Dual Intensivo (35% - 50%)'})}</option>
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              label={t('campos.modulo.cursoLabel', {defaultValue: 'Curso'})}
              type="text"
              value={data.curso || ""}
              onChange={e => updateInfoModulo('curso', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <Input
            label={t('campos.modulo.numTrimestres', {defaultValue: 'Nº de trimestres'})}
            type="text"
            className="text-muted cursor-not-allowed"
            disabled
            value="3"
          />
          <Input
            label={t('campos.modulo.horasSemanaClase', {defaultValue: 'Horas/semana clase'})}
            type="number"
            value={data.h_sem || 0}
            onChange={e => updateInfoModulo('h_sem', Number(e.target.value))}
          />
          <Input
            label={t('campos.modulo.horasBoa', {defaultValue: 'Horas BOA'})}
            type="number"
            value={data.h_boa || 0}
            onChange={e => updateInfoModulo('h_boa', Number(e.target.value))}
          />
          <Input
            label={t('campos.modulo.pctPEvContinua', {defaultValue: '% P.Ev. continua'})}
            type="number"
            value={data.p_ev || 15}
            onChange={e => updateInfoModulo('p_ev', Number(e.target.value))}
          />
          <Input
            label={t('campos.modulo.horasPEvLabel', {pev: p_ev, defaultValue: `Horas P.Ev. (${p_ev}%)`})}
            type="text"
            className="text-warning cursor-not-allowed text-center font-bold"
            disabled
            value={`${h_p_ev} h`}
          />
        </div>
      </Card>

      {/* Reglas de redondeo y compensación */}
      <Card className="p-6 border-l-4 border-l-orange-500">
        <h4 className="text-subheading font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><Settings className="w-[1.2em] h-[1.2em] mr-1" /> {t('campos.modulo.tituloReglasRedondeo', {defaultValue: 'Reglas de redondeo y compensación'})}</span>
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
                <label className="text-body font-semibold text-foreground">{t('campos.modulo.notaMinimaAprobar', {defaultValue: 'Nota mínima para aprobar'})}</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.nota_aprobado ?? 5.0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, nota_aprobado: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-caption text-muted">{t('campos.modulo.notaMinimaAprobarDesc', {defaultValue: 'Nota a partir de la cual un RA o Módulo se considera superado (típicamente 5.0).'})}</p>
              </div>

              <div className="space-y-2">
                <label className="text-body font-semibold text-foreground">{t('campos.modulo.umbralRedondeoAlza', {defaultValue: 'Umbral de redondeo al alza'})}</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.umbral_redondeo ?? 5.0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, umbral_redondeo: parseFloat(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-caption text-muted">{t('campos.modulo.umbralRedondeoAlzaDesc', {defaultValue: 'Si el alumnado obtiene esta nota o superior (ej. 4.8), se redondeará automáticamente a la nota de aprobado.'})}</p>
              </div>

              <div className="space-y-2">
                <label className="text-body font-semibold text-foreground">{t('campos.modulo.criteriosCompensablesRA', {defaultValue: 'Criterios compensables por RA'})}</label>
                <input
                  type="number"
                  step="1"
                  value={config.max_compensables ?? 0}
                  onChange={(e) => updateModuleData("config_redondeo", { ...config, max_compensables: parseInt(e.target.value) })}
                  className="w-full bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground text-center"
                />
                <p className="text-caption text-muted">{t('campos.modulo.criteriosCompensablesDescPre', {defaultValue: 'Número máximo de Criterios suspensos que se permiten para aprobar un RA. '})}<strong>0</strong>{t('campos.modulo.criteriosCompensablesDescPost', {defaultValue: ' = cualquier CE suspenso del RA topa su nota justo por debajo del aprobado (comportamiento estricto); sube este número para permitir compensar N criterios suspensos dentro del mismo RA. Cuando el tope está activo para un alumno, aparece marcado en Seguimiento → Detalle por alumnado.'})}</p>
              </div>
            </div>
          );
        })()}
      </Card>



      {/* 5. Evaluación */}
      <Card className="p-6 border-l-4 border-l-accent">
        <h4 className="text-subheading font-bold text-foreground mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2"><span><span className="inline-flex"><Scale className="w-[1.2em] h-[1.2em] mr-1" /></span></span> {t('campos.modulo.tituloPonderacionTrimestres', {defaultValue: '% Ponderación por trimestres'})}</span>
          <span className={`text-body font-semibold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
            {sumaTrimestres}% {sumaTrimestres !== 100 && t('campos.modulo.debeSumarCien', {defaultValue: '(Debe sumar 100%)'})}
          </span>
        </h4>
        <div className="grid grid-cols-3 gap-6">
          {[
            ['pond_1t', t('checks.modulo.pond1erTrimestre', {defaultValue: '1er trimestre (%)'})],
            ['pond_2t', t('checks.modulo.pond2doTrimestre', {defaultValue: '2º trimestre (%)'})],
            ['pond_3t', t('checks.modulo.pond3erTrimestre', {defaultValue: '3er trimestre (%)'})],
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

      <Card className="p-6 border-l-4 border-l-purple-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <h4 className="text-subheading font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-[1.2em] h-[1.2em]" /> {t('campos.modulo.tituloInstrumentosEvaluacion', {defaultValue: '% Instrumentos de evaluación'})}
          </h4>
          <div className="flex gap-2">
            {[
              [t('campos.modulo.chipTrim1', {defaultValue: '1er Trim.'}), sum1t],
              [t('campos.modulo.chipTrim2', {defaultValue: '2º Trim.'}), sum2t],
              [t('campos.modulo.chipTrim3', {defaultValue: '3er Trim.'}), sum3t],
            ].map(([label, sum]) => (
              <span key={label as string} className={`text-caption font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${sum === 100 ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'}`}>
                {label}: {sum}%
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div style={INSTR_GRID_STYLE} className="text-caption font-bold text-muted px-1">
            <span>{t('campos.modulo.colSeleccionTipo', {defaultValue: 'Selección del tipo'})}</span>
            <span>{t('campos.modulo.colDescripcionInstrumento', {defaultValue: 'Descripción del Instrumento de Evaluación (IE)'})}</span>
            <span className="text-center">{t('campos.modulo.colTrimestre1', {defaultValue: '1er Trimestre'})}</span>
            <span className="text-center">{t('campos.modulo.colTrimestre2', {defaultValue: '2º Trimestre'})}</span>
            <span className="text-center">{t('campos.modulo.colTrimestre3', {defaultValue: '3er Trimestre'})}</span>
            <span></span>
          </div>
          {instrumentosPct.map((row) => (
            <div key={row.id} style={INSTR_GRID_STYLE} className="items-center">
              <div className="relative">
                <select
                  value={row.categoria || "Teoría"}
                  onChange={(e) => updateInstrumentoPctField(row.id, "categoria", e.target.value)}
                  className="bg-background border border-[var(--glass-border)] rounded pl-2 pr-7 py-2 text-foreground w-full appearance-none"
                >
                  <option value="Teoría">{t('checks.modulo.instrCategoriaTeoria', {defaultValue: 'Teoría'})}</option>
                  <option value="Práctica">{t('checks.modulo.instrCategoriaPractica', {defaultValue: 'Práctica'})}</option>
                  <option value="Proyecto">{t('checks.modulo.instrCategoriaProyecto', {defaultValue: 'Proyecto'})}</option>
                  <option value="Ejercicios">{t('checks.modulo.instrCategoriaEjercicios', {defaultValue: 'Ejercicios'})}</option>
                  <option value="Tareas">{t('checks.modulo.instrCategoriaTareas', {defaultValue: 'Tareas'})}</option>
                  <option value="Recuperaciones">{t('checks.modulo.instrCategoriaRecuperaciones', {defaultValue: 'Recuperaciones'})}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <input
                type="text"
                value={row.nombre}
                onChange={(e) => updateInstrumentoPctField(row.id, "nombre", e.target.value)}
                placeholder={t('placeholders.modulo.nombreInstrumento', {defaultValue: 'Nombre del instrumento'})}
                className="bg-background border border-[var(--glass-border)] rounded px-3 py-2 text-foreground w-full"
              />
              {(["pct_1t", "pct_2t", "pct_3t"] as const).map((field) => (
                row.categoria === "Recuperaciones" ? (
                  <div key={field} className="text-center text-muted">-</div>
                ) : (
                  <div key={field} className="relative">
                    <input
                      type="number"
                      value={row[field]}
                      onChange={(e) => updateInstrumentoPctField(row.id, field, e.target.value)}
                      className="bg-background border border-[var(--glass-border)] rounded pl-2 pr-5 py-2 text-foreground text-center w-full"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted text-caption pointer-events-none">%</span>
                  </div>
                )
              ))}
              <button
                type="button"
                onClick={() => removeInstrumentoPct(row.id)}
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors justify-self-center"
                aria-label={t('aria.modulo.eliminarInstrumento', {defaultValue: 'Eliminar instrumento'})}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstrumentoPct}
            className="flex items-center gap-2 text-body font-semibold text-accent hover:underline mt-2"
          >
            <Plus className="w-4 h-4" /> {t('botones.modulo.anadirTipoInstrumento', {defaultValue: 'Añadir tipo de instrumento de evaluación'})}
          </button>
        </div>
      </Card>


      {/* 7. Escalas de evaluación cualitativas (EEv) */}
      <Card className="p-6 border-l-4 border-l-teal-500">
        <h4 className="text-subheading font-bold text-foreground mb-2 flex items-center gap-2">
          <ListChecks className="w-[1.2em] h-[1.2em]" /> {t('campos.modulo.tituloEscalasEvaluacion', {defaultValue: 'Escalas de evaluación cualitativas'})}
        </h4>
        <p className="text-caption text-muted mb-4">
          {t('campos.modulo.escalasEvaluacionDesc', {defaultValue: 'Niveles nombrados con un coeficiente de conversión a la nota 0-10, independientes de la nota numérica directa. Precargada con la escala oficial española (Insuficiente/Suficiente/Bien/Notable/Sobresaliente) — edítala o bórrala si usas otra.'})}
        </p>
        {(() => {
          const escalas = (moduleData?.escalas_evaluacion && moduleData.escalas_evaluacion.length > 0)
            ? moduleData.escalas_evaluacion
            : DEFAULT_ESCALAS_EVALUACION;
          const updateEscala = (id: string, field: "nombre" | "coeficiente", value: string) => {
            const next = escalas.map(e => e.id === id
              ? { ...e, [field]: field === "coeficiente" ? parseFloat(value) || 0 : value }
              : e);
            updateModuleData("escalas_evaluacion", next);
          };
          const addEscala = () => {
            const next = [...escalas, { id: `eev_${Date.now()}`, nombre: "", coeficiente: 5 }];
            updateModuleData("escalas_evaluacion", next);
          };
          const removeEscala = (id: string) => {
            updateModuleData("escalas_evaluacion", escalas.filter(e => e.id !== id));
          };
          const sortedEscalas = [...escalas].sort((a, b) => (Number(a.coeficiente) || 0) - (Number(b.coeficiente) || 0));

          return (
            <div className="flex flex-wrap md:flex-nowrap items-stretch gap-3 overflow-x-auto pb-2">
              {sortedEscalas.map((escala) => (
                <div key={escala.id} className="flex flex-col gap-2 min-w-[160px] p-3 border border-[var(--glass-border)] rounded-lg bg-background/50 relative group shadow-sm transition-all hover:border-white/20 hover:bg-background/80">
                  <button
                    type="button"
                    onClick={() => removeEscala(escala.id)}
                    className="absolute top-2 right-2 p-1.5 text-danger/60 hover:text-danger hover:bg-danger/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={t('aria.modulo.eliminarNivel', {defaultValue: 'Eliminar nivel'})}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    placeholder={t('placeholders.modulo.nombreNivel', {defaultValue: 'Nombre (ej. Suficiente)'})}
                    value={escala.nombre}
                    onChange={(e) => updateEscala(escala.id, "nombre", e.target.value)}
                    className="w-full bg-background border border-[var(--glass-border)] rounded px-2.5 py-1.5 text-foreground text-sm font-semibold pr-8"
                  />
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-caption text-muted font-medium">{t('campos.modulo.notaLabel', {defaultValue: 'Nota:'})}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0.0"
                      value={escala.coeficiente}
                      onChange={(e) => updateEscala(escala.id, "coeficiente", e.target.value)}
                      className="w-16 bg-background border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-center text-sm font-bold"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEscala}
                className="flex flex-col items-center justify-center min-w-[120px] min-h-full p-3 border border-dashed border-[var(--glass-border)] rounded-lg text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-colors gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="text-caption font-semibold">{t('common.anadir', {defaultValue: 'Añadir'})}</span>
              </button>
              {escalas.length === 0 && (
                <p className="text-caption text-muted italic">{t('campos.modulo.sinEscalasConfiguradas', {defaultValue: 'Sin escalas configuradas — la app sigue usando la nota 0-10 directamente.'})}</p>
              )}
            </div>
          );
        })()}
      </Card>

    </div>
    </>
  );
}

