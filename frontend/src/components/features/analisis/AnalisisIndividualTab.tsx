import { BarChart, RefreshCw, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa, loadCatalogForModule } from "@/services/catalogCache";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotas, getSigadInfo, DEFAULT_CONFIG_REDONDEO } from "@/utils/calificaciones";
import { useTranslation } from "react-i18next";

export const AnalisisIndividualTab = () => {
  const { t } = useTranslation();
  const { moduleData, cursoData, activeModuleId } = useAppStore();

  useEffect(() => { if (activeModuleId) loadCatalogForModule(activeModuleId); }, [activeModuleId]);
  const [selectedAlId, setSelectedAlId] = useState<string>("");
  const [simVals, setSimVals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (cursoData?.df_al && cursoData.df_al.length > 0 && !selectedAlId) {
      const activos = cursoData.df_al.filter(isAlumnoActivo);
      if (activos.length > 0) setSelectedAlId(activos[0].ID || "");
    }
  }, [cursoData, selectedAlId]);

  const df_al = cursoData?.df_al || [];
  const activeAlumnado = df_al.filter(isAlumnoActivo);
  activeAlumnado.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];

  if (activeAlumnado.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-subheading font-bold text-warning mb-2">Faltan datos</h2>
        <p className="text-foreground/80">No hay alumnado activos para analizar.</p>
      </Card>
    );
  }

  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  const currentAl = activeAlumnado.find((al: any) => al.ID === selectedAlId) || {};
  const currentEv = df_eval.find((e: any) => e.ID === selectedAlId) || {};

  // Real Note (Motor A — ver utils/calificaciones.ts, decisión A de la Fase 2)
  const realCalc = calcularNotas(currentEv, df_ra, df_ce, df_act, config_redondeo);
  const realSigad = getSigadInfo(realCalc.nota_final);

  // Simulated Note
  const simCalc = calcularNotas(currentEv, df_ra, df_ce, df_act, config_redondeo, simVals);
  const simSigad = getSigadInfo(simCalc.nota_final);

  // Group activities by trimester for the simulator
  const acts_by_tri: Record<string, any[]> = { "1T": [], "2T": [], "3T": [] };
  df_act.forEach((act: any) => {
    if (act.id_act && String(act.id_act).trim() !== "") {
      const tri = act.tri_act || "1T";
      if (acts_by_tri[tri]) acts_by_tri[tri].push(act);
    }
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <div className="flex items-center gap-3 bg-foreground/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 w-fit mt-6">
          <span className="text-muted text-body font-semibold">Viendo como:</span>
          <select 
            value={selectedAlId} 
            onChange={e => {
              setSelectedAlId(e.target.value);
              setSimVals({}); // Reset sim on student change
            }}
            className="bg-transparent border-none p-0 text-foreground focus:outline-none font-bold text-subheading cursor-pointer hover:text-success transition-colors pr-8"
            style={{ appearance: 'auto' }}
          >
            {activeAlumnado.map((al: any) => (
              <option key={al.ID} value={al.ID} className="bg-[#0d1726]">
                {al.Nombre} {al.Apellidos}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-teal-500 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-heading"><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></div>
          <span className="text-muted text-body font-semibold tracking-wider mb-2">Nota media actual</span>
          <span className="text-heading font-black text-success">{realCalc.nota_final !== null ? realCalc.nota_final.toFixed(2) : "-"}</span>
        </Card>
        <Card className="p-6 border-l-4 border-l-blue-500 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-heading"><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></div>
          <span className="text-muted text-body font-semibold tracking-wider mb-2">Estado</span>
          <span className="text-heading font-black text-info">{realCalc.nota_final === null ? 'Sin evaluar' : realCalc.nota_final >= 5 ? 'Apto' : 'En Proceso'}</span>
        </Card>
        <Card className="p-6 border-l-4" style={{ borderLeftColor: realSigad.col }}>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-muted text-body font-semibold tracking-wider mb-2">Calificación oficial</span>
            <div className="text-heading font-black" style={{ color: realSigad.col }}>{realSigad.n} · {realSigad.cod}</div>
            <div className="text-body mt-1 text-foreground/80 font-semibold">{realSigad.txt}</div>
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-subheading font-bold mb-6"><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> Adquisición de competencias (RA)</h2>
        <div className="grid grid-cols-2 gap-6">
          {df_ra.map((ra: any) => {
            if (!ra.id_ra) return null;
            const n_ra = realCalc.notas_ra[ra.id_ra] || 0;
            const progress = Math.min(100, (n_ra / 10) * 100);
            
            return (
              <div key={ra.id_ra} className="bg-foreground/10 border border-white/5 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-success">{ra.id_ra}</h3>
                    <p className="text-caption text-muted truncate max-w-xs">{resolveDescRa(activeModuleId, ra)}</p>
                  </div>
                  <div className="font-mono font-bold">{n_ra.toFixed(2)} / 10</div>
                </div>
                <div className="w-full bg-foreground/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 border-t-4 border-t-purple-500">
        <h2 className="text-subheading font-bold mb-2"> Simulador de calificaciones</h2>
        <p className="text-muted mb-6 text-body">Experimenta con tus notas para proyectar tu resultado final.</p>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {["1T", "2T", "3T"].map(tri => (
                <div key={tri} className="bg-foreground/10 rounded-xl p-4 border border-white/5">
                  <h3 className="font-bold text-center mb-4 border-b border-[var(--glass-border)] pb-2">{tri}</h3>
                  <div className="space-y-4">
                    {acts_by_tri[tri].map(act => {
                      const act_id = act.id_act;
                      const actual_val = Number(currentEv[act_id]) || 0;
                      const sim_val = simVals[act_id] !== undefined ? simVals[act_id] : actual_val;
                      
                      return (
                        <div key={act_id}>
                          <div className="flex justify-between text-caption mb-1">
                            <span className="text-foreground/80 truncate w-32" title={act.desc_act}>{act.desc_act || act_id}</span>
                            <span className="font-mono text-info font-bold">{sim_val.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="10" step="0.1" 
                            value={sim_val}
                            onChange={(e) => setSimVals(prev => ({ ...prev, [act_id]: Number(e.target.value) }))}
                            className="w-full accent-purple-500"
                          />
                        </div>
                      );
                    })}
                    {acts_by_tri[tri].length === 0 && <p className="text-caption text-muted text-center">Sin actividades</p>}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost"
              onClick={() => setSimVals({})} 
              className="text-body flex items-center gap-1"
            >
              <span className="inline-flex"><RefreshCw className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('botones.evaluacion.restaurarNotasReales', {defaultValue: 'Restaurar a notas reales'})}
            </Button>
          </div>

          <div className="w-80">
            <div 
              className="rounded-2xl p-8 text-center text-foreground relative overflow-hidden h-full flex flex-col justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(20,160,133,0.8), rgba(41,128,185,0.8))',
                boxShadow: '0 10px 30px rgba(20,160,133,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div className="text-body tracking-widest font-bold opacity-80 mb-4">Nota proyectada</div>
              <div className="text-heading font-black mb-4 drop-shadow-lg">{simCalc.nota_final !== null ? simCalc.nota_final.toFixed(2) : "-"}</div>
              <div className="text-subheading font-bold mb-1">{simSigad.txt}</div>
              <div className="text-subheading opacity-80">({simSigad.cod})</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
