import { AlertTriangle, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { isAlumnoActivo } from "@/utils/alumnado";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Seguimiento de riesgo académico: alumnado activo con la nota final del
// módulo por debajo de 5, ordenado de menor a mayor. Estaba dentro del
// Análisis grupal de Cierre -> Resumen; ahora vive en Seguimiento -> Riesgo
// de abandono, junto al resumen de abandono (2026-10-05).
export const RiesgoAcademicoTab = () => {
  const { t } = useTranslation();
  const { cursoData } = useAppStore();

  const activeAlumnado = (cursoData?.df_al || []).filter(isAlumnoActivo);
  const activeIds = activeAlumnado.map((al: any) => al.ID);
  const df_eval_activos = (cursoData?.df_eval || []).filter((e: any) => activeIds.includes(e.ID));

  // Risks
  const risks = df_eval_activos
    .filter((e: any) => (Number(e.Nota_Final_FO) || 0) < 5)
    .map((e: any) => {
      const al = activeAlumnado.find((a: any) => a.ID === e.ID);
      const nota = Number(e.Nota_Final_FO) || 0;
      let riskLevel = t('campos.analisis.riesgoModerado', {defaultValue: '🟡 Moderado'});
      let riskColor = "text-warning";
      if (nota < 3) { riskLevel = t('campos.analisis.riesgoMuyAlto', {defaultValue: 'Muy alto'}); riskColor = "text-danger"; }
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

  return (
      <div className="space-y-3">
      <SectionHeading id="calificaciones-riesgo-academico" icon={AlertTriangle} scrollMt="260px">
        {t('campos.analisis.seguimientoRiesgo', {defaultValue: 'Control de rendimiento académico'})}
      </SectionHeading>
      <Card className="p-6">
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
