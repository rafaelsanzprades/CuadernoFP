import { AlertTriangle, ClipboardList, PartyPopper, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { isAlumnoActivo } from "@/utils/alumnado";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

interface AnalisisGrupalTabProps {
  setActiveTab?: (tab: string) => void;
}

export const AnalisisGrupalTab = ({ setActiveTab }: AnalisisGrupalTabProps = {}) => {
  const { t } = useTranslation();
  const { cursoData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];

  // Filter active students
  const activeAlumnado = df_al.filter(isAlumnoActivo);
  const activeIds = activeAlumnado.map((al: any) => al.ID);
  const df_eval_activos = df_eval.filter((e: any) => activeIds.includes(e.ID));

  if (df_eval_activos.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-subheading font-bold text-warning mb-2">{t('campos.analisis.faltanDatos', {defaultValue: 'Faltan datos'})}</h2>
        <p className="text-foreground/80">{t('campos.analisis.noHayDatosEvaluacion', {defaultValue: 'No hay datos de evaluación para alumnado activos. Ve a Evaluación competencial primero.'})}</p>
      </Card>
    );
  }

  // Calculate stats
  const notas_finales = df_eval_activos.map((e: any) => Number(e.Nota_Final_FO) || 0);
  const media_grupal = notas_finales.reduce((a, b) => a + b, 0) / (notas_finales.length || 1);
  const total = notas_finales.length;

  // Std dev
  const variance = notas_finales.reduce((a, b) => a + Math.pow(b - media_grupal, 2), 0) / (total || 1);
  const desv_tipica = Math.sqrt(variance);

  // Trend Data (Trimestres)
  const avg1T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['Nota_1T']) || 0), 0) / (total || 1);
  const avg2T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['Nota_2T']) || 0), 0) / (total || 1);
  const avg3T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['Nota_3T']) || 0), 0) / (total || 1);

  const trendData = [
    { name: t('campos.analisis.trim1', {defaultValue: '1º Trim'}), Media: Number(avg1T.toFixed(2)) },
    { name: t('campos.analisis.trim2', {defaultValue: '2º Trim'}), Media: Number(avg2T.toFixed(2)) },
    { name: t('campos.analisis.trim3', {defaultValue: '3º Trim'}), Media: Number(avg3T.toFixed(2)) },
    { name: t('campos.analisis.final', {defaultValue: 'Final'}), Media: Number(media_grupal.toFixed(2)) },
  ];

  // Risks
  const risks = df_eval_activos
    .filter((e: any) => (Number(e.Nota_Final_FO) || 0) < 5)
    .map((e: any) => {
      const al = activeAlumnado.find((a: any) => a.ID === e.ID);
      const nota = Number(e.Nota_Final_FO) || 0;
      let riskLevel = t('campos.analisis.riesgoModerado', {defaultValue: '🟡 Moderado'});
      let riskColor = "text-warning";
      if (nota < 3) { riskLevel = t('campos.analisis.riesgoMuyAlto', {defaultValue: 'Muy Alto'}); riskColor = "text-danger"; }
      else if (nota < 4) { riskLevel = t('campos.analisis.riesgoAlto', {defaultValue: '🟠 Alto'}); riskColor = "text-warning"; }
      
      return {
        id: e.ID,
        alumnado: `${al?.Apellidos || ""}, ${al?.Nombre || ""}`,
        nota,
        riskLevel,
        riskColor
      };
    })
    .sort((a: any, b: any) => a.nota - b.nota);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[var(--glass-border)] p-3 rounded-lg shadow-xl">
          <p className="text-foreground font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={entry.name || index} style={{ color: entry.color || entry.fill }} className="text-body font-semibold drop-shadow-md">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <h2 className="text-heading font-extrabold text-foreground tracking-tight flex items-center gap-3">
        <span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.analisis.resumenDatosGrupales', {defaultValue: 'Resumen datos grupales'})}
      </h2>

      <section className="grid grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
          <span className="text-muted text-body font-semibold tracking-wider mb-2">{t('campos.analisis.mediaGrupal', {defaultValue: 'Media grupal'})}</span>
          <span className="text-heading font-black text-info">{media_grupal.toFixed(2)}</span>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
          <span className="text-muted text-body font-semibold tracking-wider mb-2">{t('campos.analisis.numeroAlumnado', {defaultValue: 'Nº Alumnado'})}</span>
          <span className="text-heading font-black text-info">{total}</span>
        </Card>
        <Card className="p-6 border-l-4 border-l-pink-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
          <span className="text-muted text-body font-semibold tracking-wider mb-2">{t('campos.analisis.cohesionDesviacion', {defaultValue: 'Cohesión (Desv.)'})}</span>
          <span className="text-heading font-black text-danger">{desv_tipica.toFixed(2)}</span>
        </Card>
      </section>

      <Card className="p-6">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-6">
          <span className="inline-flex"><TrendingUp className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.analisis.evolucionTrimestres', {defaultValue: 'Evolución por Trimestres'})}
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Media" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMedia)" name={t('campos.analisis.mediaLegend', {defaultValue: 'Media'})} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-subheading font-bold mb-6"><span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('campos.analisis.seguimientoRiesgo', {defaultValue: 'Seguimiento de riesgo académico'})}</h2>
        {risks.length > 0 ? (
          <>
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-4 text-body font-semibold flex items-center gap-2">
              <span className="text-subheading"><span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
              {t('campos.analisis.alumnadoRiesgoDetectado', {count: risks.length, defaultValue: `Se han detectado ${risks.length} alumnado(s) con rendimiento insuficiente.`})}
            </div>
            <table className="w-full text-left text-body whitespace-nowrap">
              <thead>
                <tr className="text-muted border-b border-[var(--glass-border)]">
                  <th className="pb-2">{t('tablas.evaluacion.alumnado', {defaultValue: 'Alumnado'})}</th>
                  <th className="pb-2 text-center">{t('tablas.evaluacion.nota', {defaultValue: 'Nota'})}</th>
                  <th className="pb-2">{t('tablas.evaluacion.nivelRiesgo', {defaultValue: 'Nivel de riesgo'})}</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r: any, i: number) => (
                  <tr key={r.alumnado || i} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                    <td className="py-3 font-medium text-foreground/90">{r.alumnado}</td>
                    <td className="py-3 font-mono text-center font-bold text-foreground/80">{r.nota.toFixed(1)}</td>
                    <td className={`py-3 font-bold ${r.riskColor}`}>
                      <span className="bg-foreground/5 px-2 py-1 rounded-md">{r.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="bg-success/10 border border-success/30 text-success px-4 py-8 rounded-lg flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-heading"><span className="inline-flex"><PartyPopper className="w-[1.2em] h-[1.2em] mr-1" /></span></span>
            <span className="font-bold text-subheading">{t('campos.analisis.excelenteRendimiento', {defaultValue: '¡Excelente rendimiento!'})}</span>
            <span className="text-body opacity-80">{t('campos.analisis.noHayAlumnadoRiesgo', {defaultValue: 'No hay alumnado en riesgo según la proyección actual.'})}</span>
          </div>
        )}
      </Card>
    </div>
  );
};
