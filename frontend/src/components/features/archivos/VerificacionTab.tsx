"use client";
import { AlertTriangle, ArrowRight, BarChart2, BookOpen, Building2, CalendarDays, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Rocket, Shield, Users, Wrench, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import type { Family } from "@/types";
import { NuevoCursoWizard } from "@/components/features/dashboard/NuevoCursoWizard";

type CheckStatus = "ok" | "warning" | "empty";

interface CheckItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  href: string;
  hrefLabel: string;
  status: CheckStatus;
  lines: string[];
  actionHref?: string;
  actionLabel?: string;
}

function pct(n: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function sumPesos(arr: { peso_ra?: string | number; peso_ce?: string | number }[], field: "peso_ra" | "peso_ce") {
  return arr.reduce((acc, item) => acc + (parseFloat(String(item[field] ?? 0)) || 0), 0);
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const { t } = useTranslation();
  if (status === "ok")
    return <Badge variant="success" className="bg-success/10 text-success border-success/30 shrink-0">{t('checks.verificacion.correcto', {defaultValue: 'Correcto'})}</Badge>;
  if (status === "warning")
    return <Badge variant="warning" className="bg-warning/10 text-warning border-warning/30 shrink-0">{t('checks.verificacion.advertencia', {defaultValue: 'Advertencia'})}</Badge>;
  return <Badge variant="default" className="bg-danger/10 text-danger border-danger/30 shrink-0">{t('checks.verificacion.sinDatos', {defaultValue: 'Sin datos'})}</Badge>;
}

function CheckCard({ item }: { item: CheckItem }) {
  const { t } = useTranslation();
  return (
    <Card className="p-5 border border-white/5 rounded-2xl bg-foreground/5 shadow h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-3 flex-1 mb-3">
          <div className="mt-0.5 text-muted">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-body leading-tight">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            <ul className="space-y-0.5">
              {item.lines.map((line, i) => (
                <li key={line || i} className="text-body text-muted flex items-start gap-1.5">
                  <span className="text-foreground/40 font-bold px-1 mt-0.5">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 pt-3 mt-auto border-t border-white/5">
          <Link
            href={item.href}
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent hover:underline"
          >
            {t('botones.verificacion.irA', {destino: item.hrefLabel, defaultValue: 'Ir a {{destino}}'})} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {item.actionHref && item.actionLabel && (
            <Link
              href={item.actionHref}
              className="inline-flex items-center gap-1.5 text-caption font-semibold px-3 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
            >
              {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export function VerificacionTab() {
  const { moduleData, cursoData, activeModuleId, activeCursoId, dataSource } = useAppStore();
  const { t } = useTranslation();
  const dataSourceLabel = dataSource === 'demo' ? 'datos DEMO' : 'datos reales';
  const [nuevoCursoWizardOpen, setNuevoCursoWizardOpen] = useState(false);

  // ── Catálogo oficial (fijo) + resolución de familia/título del módulo activo ──
  const [catalogFamilies, setCatalogFamilies] = useState<Family[]>([]);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/families`)
      .then(r => r.json())
      .then(json => { if (json.status === "success") setCatalogFamilies(json.data); })
      .catch(() => {});
  }, []);

  const catalogFamiliasCount = catalogFamilies.length;
  const catalogDegrees = catalogFamilies.flatMap(f => f.degrees);
  const catalogTitulosCount = catalogDegrees.length;
  const catalogPorNivel = catalogDegrees.reduce((acc: Record<string, number>, d) => {
    acc[d.level] = (acc[d.level] || 0) + 1;
    return acc;
  }, {});

  const cleanStr = (s: string) => s ? s.toLowerCase().replace(/^[a-z0-9]+\s*-\s*/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim() : "";
  const infoModuloGrupo: Record<string, any> = moduleData?.info_modulo || {};
  const grupoFamilia = catalogFamilies.find(f => cleanStr(f.name) === cleanStr(infoModuloGrupo.familia));
  const grupoTitulo = grupoFamilia?.degrees.find(d => {
    const dn = cleanStr(d.name);
    const cn = cleanStr(infoModuloGrupo.titulo_fp);
    return dn === cn || (cn && (dn.includes(cn) || cn.includes(dn)));
  });

  // ── Comprobaciones Programación didáctica ────────────────────────────
  const m = moduleData;

  const udCount = m?.df_ud?.length ?? 0;
  const udHoras = (m?.df_ud ?? []).reduce((a: number, u: any) => a + (parseFloat(String(u.horas_ud ?? 0)) || 0), 0);
  const moduloHoras = parseFloat(String(m?.info_modulo?.h_boa ?? 0)) || 0;
  const horasDiff = Math.abs(udHoras - moduloHoras);

  const raCount = m?.df_ra?.length ?? 0;
  const raPesoSum = sumPesos(m?.df_ra ?? [], "peso_ra");

  const ceList = m?.df_ce ?? [];
  const ceCount = ceList.length;
  const ceHuerfanos = ceList.filter((ce: any) => {
    if (!ce.id_ra) return true;
    return !(m?.df_ra ?? []).some((ra: any) => ra.id_ra === ce.id_ra);
  }).length;

  const instrCount = m?.df_instr?.length ?? 0;
  const indsList = m?.df_indicadores ?? [];
  const indCount = indsList.length;
  const indSinCE = indsList.filter((ind: any) => {
    return !ceList.some((ce: any) => ind.id_ce === ce.id_ce);
  }).length;

  const tareasCount = m?.df_tareas?.length ?? 0;
  const tareasSinRA = (m?.df_tareas ?? []).filter((t: any) => {
    if (!t.RA_Asociados) return true;
    if ((m?.df_ra ?? []).length === 0) return true;
    return false;
  }).length;

  const sesionesCount = m?.df_sesiones?.length ?? 0;
  const sesionesSinUD = (m?.df_sesiones ?? []).filter((s: any) => {
    if (!s.id_ud) return true;
    return !(m?.df_ud ?? []).some((ud: any) => ud.id_ud === s.id_ud);
  }).length;

  const tieneHorario = !!(cursoData?.horario && Object.keys(cursoData.horario).length > 0);
  const tieneFechas = !!(cursoData?.info_fechas && Object.keys(cursoData.info_fechas).length > 0);
  const tieneContexto = !!(m?.config_contexto && Object.keys(m.config_contexto).length > 0);

  // ── Comprobaciones de campos que usan los generadores PD+ (JEG) / pd= / pd- ──
  const infoMod: Record<string, any> = m?.info_modulo || {};
  const cc: Record<string, any> = m?.config_contexto || {};
  const identificacionFaltan = ["centro", "profesorado", "familia"].filter(k => !infoMod[k]);

  const modData: Record<string, any> = m || {};
  const NARRATIVOS_PDPLUS: { key: string; label: string; source: Record<string, any> }[] = [
    { key: "entorno_geografico", label: t('campos.verificacion.entornoGeografico', {defaultValue: 'Entorno geográfico'}), source: cc },
    { key: "entorno_socioeconomico", label: t('campos.verificacion.entornoSocioeconomico', {defaultValue: 'Entorno socioeconómico'}), source: cc },
    { key: "contexto_escolar", label: t('campos.verificacion.contextoEscolar', {defaultValue: 'Contexto escolar'}), source: cc },
    { key: "contingencia_profesor", label: t('campos.verificacion.contingenciaProfesorado', {defaultValue: 'Contingencia (profesorado)'}), source: cc },
    { key: "contingencia_alumnado", label: t('campos.verificacion.contingenciaAlumnado', {defaultValue: 'Contingencia (alumnado)'}), source: cc },
    { key: "textos_pd_bibliografia", label: t('campos.verificacion.bibliografiaLabel', {defaultValue: 'Bibliografía'}), source: modData },
    { key: "textos_pd_publicidad", label: t('campos.verificacion.publicidadLabel', {defaultValue: 'Publicidad'}), source: modData },
  ];
  const narrativosRellenos = NARRATIVOS_PDPLUS.filter(f => !!f.source[f.key]).length;
  const narrativosFaltan = NARRATIVOS_PDPLUS.filter(f => !f.source[f.key]).map(f => f.label);

  const moduleChecks: CheckItem[] = [
    {
      id: "modulo",
      icon: <BookOpen className="w-5 h-5" />,
      title: t('campos.verificacion.moduloDidacticoTitulo', {defaultValue: 'Módulo didáctico'}),
      href: "/contexto?tab=identificacion",
      hrefLabel: t('nav.contexto', {defaultValue: 'Contexto'}),
      status: !m ? "empty" : "ok",
      lines: !m
        ? [t('campos.verificacion.sinDatosProgramacion', {defaultValue: 'Sin datos de programación cargados'})]
        : [
          t('campos.verificacion.moduloActivo', {id: activeModuleId, defaultValue: 'Módulo activo: {{id}}'}),
          t('campos.verificacion.horasSemanales', {h: m.info_modulo?.h_sem || "-", defaultValue: 'Horas semanales: {{h}} h'}),
          t('campos.verificacion.horasBoa', {h: m.info_modulo?.h_boa || "-", defaultValue: 'Horas BOA: {{h}} h'}),
        ],
      actionHref: !m ? "/contexto?tab=identificacion" : undefined,
      actionLabel: !m ? t('botones.verificacion.configurarModulo', {defaultValue: 'Configurar módulo'}) : undefined,
    },
    {
      id: "ud",
      icon: <Layers className="w-5 h-5" />,
      title: t('campos.verificacion.udTitulo', {defaultValue: 'Unidades didácticas (UD)'}),
      href: "/curriculo?tab=unidades",
      hrefLabel: t('nav.curriculo', {defaultValue: 'Currículo'}),
      status: udCount === 0 ? "empty" : horasDiff > 2 ? "warning" : "ok",
      lines: udCount === 0
        ? [t('campos.verificacion.sinUdDefinidas', {defaultValue: 'No hay UD definidas'})]
        : [
          t('campos.verificacion.udDefinidas', {count: udCount, defaultValue: '{{count}} UD definidas'}),
          t('campos.verificacion.horasDeclaradas', {udHoras, moduloHoras: moduloHoras || "-", defaultValue: 'Horas declaradas: {{udHoras}} / {{moduloHoras}} h del módulo'}),
          horasDiff > 2 ? t('campos.verificacion.diferenciaHoras', {h: horasDiff, defaultValue: 'Diferencia de {{h}} h'}) : t('campos.verificacion.horasCuadranCorrectamente', {defaultValue: 'Horas cuadran correctamente'}),
        ],
      actionHref: udCount === 0 ? "/curriculo?tab=unidades" : undefined,
      actionLabel: udCount === 0 ? t('botones.verificacion.anadirPrimeraUd', {defaultValue: 'Añadir primera UD'}) : undefined,
    },
    {
      id: "ra",
      icon: <GraduationCap className="w-5 h-5" />,
      title: t('campos.verificacion.raTitulo', {defaultValue: 'Resultados de aprendizaje (RA)'}),
      href: "/curriculo?tab=ponderacion-ra-ce",
      hrefLabel: t('nav.curriculo', {defaultValue: 'Currículo'}),
      status: raCount === 0 ? "empty" : Math.abs(raPesoSum - 100) > 1 ? "warning" : "ok",
      lines: raCount === 0
        ? [t('campos.verificacion.sinRaDefinidos', {defaultValue: 'No hay RA definidos'})]
        : [
          t('campos.verificacion.raDefinidos', {count: raCount, defaultValue: '{{count}} RA definidos'}),
          t('campos.verificacion.sumaPesos', {pct: raPesoSum.toFixed(1), estado: Math.abs(raPesoSum - 100) > 1 ? "(⚠️ no suman 100%)" : "(✅)", defaultValue: 'Suma de pesos: {{pct}}% {{estado}}'}),
        ],
      actionHref: raCount === 0 ? "/curriculo?tab=ponderacion-ra-ce" : undefined,
      actionLabel: raCount === 0 ? t('botones.verificacion.anadirPrimerRa', {defaultValue: 'Añadir primer RA'}) : undefined,
    },
    {
      id: "ce",
      icon: <ClipboardList className="w-5 h-5" />,
      title: t('campos.verificacion.ceTitulo', {defaultValue: 'Criterios de evaluación (CE)'}),
      href: "/curriculo?tab=ponderacion-ra-ce",
      hrefLabel: t('nav.curriculo', {defaultValue: 'Currículo'}),
      status: ceCount === 0 ? "empty" : ceHuerfanos > 0 ? "warning" : "ok",
      lines: ceCount === 0
        ? [t('campos.verificacion.sinCeDefinidos', {defaultValue: 'No hay CE definidos'})]
        : [
          t('campos.verificacion.ceDefinidos', {count: ceCount, defaultValue: '{{count}} CE definidos'}),
          ceHuerfanos > 0 ? t('campos.verificacion.ceSinRa', {count: ceHuerfanos, defaultValue: '{{count}} CE sin RA asignado'}) : t('campos.verificacion.todosLosCeTienenRa', {defaultValue: 'Todos los CE tienen RA'}),
        ],
      actionHref: ceHuerfanos > 0 ? "/curriculo?tab=ponderacion-ra-ce" : undefined,
      actionLabel: ceHuerfanos > 0 ? t('botones.verificacion.revisarAsignaciones', {defaultValue: 'Revisar asignaciones'}) : undefined,
    },
    {
      id: "instr",
      icon: <Wrench className="w-5 h-5" />,
      title: t('campos.verificacion.instrumentosIndicadoresTitulo', {defaultValue: 'Instrumentos e Indicadores'}),
      href: "/archivos?tab=autores",
      hrefLabel: t('nav.archivos', {defaultValue: 'Archivos'}),
      status: (instrCount === 0 || indCount === 0) ? "empty" : indSinCE > 0 ? "warning" : "ok",
      lines: (instrCount === 0 || indCount === 0)
        ? [t('campos.verificacion.sinInstrumentosIndicadores', {defaultValue: 'No hay instrumentos o indicadores'})]
        : [
          t('campos.verificacion.instrumentosIndicadoresCount', {instr: instrCount, ind: indCount, defaultValue: '{{instr}} instrumentos y {{ind}} indicadores'}),
          indSinCE > 0 ? t('campos.verificacion.indicadoresSinCe', {count: indSinCE, defaultValue: '{{count}} indicadores sin CE asociado'}) : t('campos.verificacion.todosLosIndicadoresEvaluanCe', {defaultValue: 'Todos los indicadores evalúan algún CE'}),
        ],
      actionHref: (instrCount === 0 || indCount === 0) ? "/archivos?tab=autores" : undefined,
      actionLabel: (instrCount === 0 || indCount === 0) ? t('botones.verificacion.importarDeEditorial', {defaultValue: 'Importar de un editorial'}) : undefined,
    },
    {
      id: "tareas",
      icon: <FileText className="w-5 h-5" />,
      title: t('campos.verificacion.tareasCompetencialesTitulo', {defaultValue: 'Tareas competenciales'}),
      href: "/curriculo?tab=competenciales",
      hrefLabel: t('nav.curriculo', {defaultValue: 'Currículo'}),
      status: tareasCount === 0 ? "empty" : tareasSinRA > 0 ? "warning" : "ok",
      lines: tareasCount === 0
        ? [t('campos.verificacion.sinTareasDefinidas', {defaultValue: 'No hay tareas definidas'})]
        : [
          t('campos.verificacion.tareasDefinidas', {count: tareasCount, defaultValue: '{{count}} tareas definidas'}),
          tareasSinRA > 0 ? t('campos.verificacion.tareasSinRa', {count: tareasSinRA, defaultValue: '{{count}} tareas sin RA asociado'}) : t('campos.verificacion.todasLasTareasTienenRa', {defaultValue: 'Todas las tareas tienen RA'}),
        ],
      actionHref: tareasCount === 0 ? "/curriculo?tab=competenciales" : undefined,
      actionLabel: tareasCount === 0 ? t('botones.verificacion.crearPrimeraTarea', {defaultValue: 'Crear primera tarea'}) : undefined,
    },
    {
      id: "sesiones",
      icon: <CalendarDays className="w-5 h-5" />,
      title: t('campos.verificacion.sesionesClaseTitulo', {defaultValue: 'Sesiones de clase'}),
      href: "/curriculo?tab=unidades",
      hrefLabel: t('nav.curriculo', {defaultValue: 'Currículo'}),
      status: sesionesCount === 0 ? "empty" : sesionesSinUD > 0 ? "warning" : "ok",
      lines: sesionesCount === 0
        ? [t('campos.verificacion.sinSesionesPlanificadas', {defaultValue: 'No hay sesiones planificadas'})]
        : [
          t('campos.verificacion.sesionesPlanificadasCount', {count: sesionesCount, defaultValue: '{{count}} sesiones planificadas'}),
          sesionesSinUD > 0 ? t('campos.verificacion.sesionesSinUd', {count: sesionesSinUD, defaultValue: '{{count}} sesiones sin UD asignada'}) : t('campos.verificacion.todasLasSesionesTienenUd', {defaultValue: 'Todas las sesiones tienen UD'}),
        ],
      actionHref: sesionesCount === 0 ? "/curriculo?tab=unidades" : undefined,
      actionLabel: sesionesCount === 0 ? t('botones.verificacion.planificarSesiones', {defaultValue: 'Planificar sesiones'}) : undefined,
    },
    {
      id: "contexto",
      icon: <BookOpen className="w-5 h-5" />,
      title: t('campos.verificacion.contextoModuloTitulo', {defaultValue: 'Contexto del módulo'}),
      href: "/contexto?tab=contextualizacion",
      hrefLabel: t('nav.contexto', {defaultValue: 'Contexto'}),
      status: tieneContexto ? "ok" : "empty",
      lines: tieneContexto
        ? [t('campos.verificacion.contextoAulaConfigurado', {defaultValue: 'Contexto del aula configurado'})]
        : [t('campos.verificacion.sinDescripcionContexto', {defaultValue: 'Sin descripción de contexto ni configuración de aula'})],
      actionHref: !tieneContexto ? "/contexto?tab=contextualizacion" : undefined,
      actionLabel: !tieneContexto ? t('botones.verificacion.anadirContexto', {defaultValue: 'Añadir contexto'}) : undefined,
    },
    {
      id: "dual",
      icon: <Building2 className="w-5 h-5" />,
      title: t('campos.verificacion.fpDualTitulo', {defaultValue: 'FP Dual'}),
      href: "/contexto?tab=identificacion",
      hrefLabel: t('nav.contexto', {defaultValue: 'Contexto'}),
      status: (m?.dual_regimen && m.dual_regimen !== "ninguno") ? "ok" : "empty",
      lines: (m?.dual_regimen && m.dual_regimen !== "ninguno")
        ? [t('campos.verificacion.regimenDual', {regimen: m.dual_regimen === 'general' ? t('campos.verificacion.dualGeneralLabel', {defaultValue: 'General'}) : t('campos.verificacion.dualIntensivoLabel', {defaultValue: 'Intensivo'}), defaultValue: 'Régimen: Dual {{regimen}}'})]
        : [t('campos.verificacion.regimenTradicional', {defaultValue: 'Régimen tradicional (sin FP Dual configurada)'})],
      actionHref: "/contexto?tab=identificacion",
      actionLabel: t('botones.verificacion.configurarFpDual', {defaultValue: 'Configurar FP Dual'}),
    },
    {
      id: "eqavet",
      icon: <Shield className="w-5 h-5" />,
      title: t('campos.verificacion.calidadEqavetTitulo', {defaultValue: 'Calidad EQAVET'}),
      href: "/inicio?tab=mejora",
      hrefLabel: t('campos.verificacion.mejoraLabel', {defaultValue: 'Mejora'}),
      status: (m?.eqavet_evaluacion && Object.keys(m.eqavet_evaluacion).length > 0) ? "ok" : "empty",
      lines: (m?.eqavet_evaluacion && Object.keys(m.eqavet_evaluacion).length > 0)
        ? [t('campos.verificacion.indicadoresEqavetValorados', {count: Object.keys(m.eqavet_evaluacion).length, defaultValue: '{{count}} indicadores EQAVET valorados'})]
        : [t('campos.verificacion.sinIndicadoresEqavet', {defaultValue: 'Sin indicadores EQAVET valorados'})],
      actionHref: "/inicio?tab=mejora",
      actionLabel: t('botones.verificacion.valorarCalidad', {defaultValue: 'Valorar calidad'}),
    },
    {
      id: "identificacion-pd",
      icon: <FileText className="w-5 h-5" />,
      title: t('campos.verificacion.identificacionPdTitulo', {defaultValue: 'Identificación (para PD+/pd=/pd-)'}),
      href: "/contexto?tab=identificacion",
      hrefLabel: t('nav.contexto', {defaultValue: 'Contexto'}),
      status: !m ? "empty" : identificacionFaltan.length === 0 ? "ok" : identificacionFaltan.length < 3 ? "warning" : "empty",
      lines: !m
        ? [t('campos.verificacion.sinDatosProgramacion', {defaultValue: 'Sin datos de programación cargados'})]
        : identificacionFaltan.length === 0
          ? [t('campos.verificacion.centroProfesoradoFamiliaConfigurados', {defaultValue: 'Centro, profesorado y familia profesional configurados'})]
          : [t('campos.verificacion.faltanCampos', {campos: identificacionFaltan.join(", "), defaultValue: 'Faltan: {{campos}}'}), t('campos.verificacion.camposRellenanPortada', {defaultValue: 'Estos campos rellenan la portada de los 3 modelos de PD'})],
      actionHref: identificacionFaltan.length > 0 ? "/contexto?tab=identificacion" : undefined,
      actionLabel: identificacionFaltan.length > 0 ? t('botones.verificacion.completarIdentificacion', {defaultValue: 'Completar identificación'}) : undefined,
    },
    {
      id: "narrativos-pd",
      icon: <FileText className="w-5 h-5" />,
      title: t('campos.verificacion.textosNarrativosTitulo', {defaultValue: 'Textos narrativos (PD+/JEG)'}),
      href: "/contexto?tab=contextualizacion",
      hrefLabel: t('nav.contexto', {defaultValue: 'Contexto'}),
      status: !m ? "empty" : narrativosRellenos === NARRATIVOS_PDPLUS.length ? "ok" : narrativosRellenos > 0 ? "warning" : "empty",
      lines: !m
        ? [t('campos.verificacion.sinDatosProgramacion', {defaultValue: 'Sin datos de programación cargados'})]
        : [
          t('campos.verificacion.textosRedactadosCount', {rellenos: narrativosRellenos, total: NARRATIVOS_PDPLUS.length, defaultValue: '{{rellenos}} / {{total}} textos redactados'}),
          narrativosFaltan.length > 0 ? t('campos.verificacion.faltanCampos', {campos: narrativosFaltan.join(", "), defaultValue: 'Faltan: {{campos}}'}) : t('campos.verificacion.todosLosTextosRedactados', {defaultValue: 'Todos los textos narrativos están redactados'}),
        ],
      actionHref: narrativosFaltan.length > 0 ? "/contexto?tab=contextualizacion" : undefined,
      actionLabel: narrativosFaltan.length > 0 ? t('botones.verificacion.redactarTextos', {defaultValue: 'Redactar textos'}) : undefined,
    }
  ];

  // ── Comprobaciones Curso activo ──────────────────────────────────────
  const c = cursoData;

  const alumnosCount = c?.df_al?.length ?? 0;
  const alumnosIncompletos = (c?.df_al ?? []).filter((a: any) => !a.Nombre || !a.Apellidos).length;
  const sgmtCount = Object.keys(c?.daily_ledger ?? {}).length;
  const tutoriaEntradas = Object.keys(c?.tutoria_ledger ?? {}).length;
  const planoCount = Object.keys(c?.plano_clase ?? {}).length;

  const evalCount = c?.df_eval?.length ?? 0;
  const evalTotal = alumnosCount;

  const courseChecks: CheckItem[] = [
    {
      id: "calendario",
      icon: <CalendarDays className="w-5 h-5" />,
      title: t('campos.verificacion.calendarioAcademicoTitulo', {defaultValue: 'Calendario académico'}),
      href: "/calendario",
      hrefLabel: t('nav.calendario', {defaultValue: 'Calendario'}),
      status: !tieneHorario && !tieneFechas ? "empty" : (!tieneHorario || !tieneFechas) ? "warning" : "ok",
      lines: [
        tieneHorario ? t('campos.verificacion.horarioSemanalDefinido', {defaultValue: 'Horario semanal definido'}) : t('campos.verificacion.sinHorarioSemanal', {defaultValue: 'Sin horario semanal'}),
        tieneFechas ? t('campos.verificacion.fechasEvaluacionConfiguradas', {defaultValue: 'Fechas de evaluación configuradas'}) : t('campos.verificacion.sinFechasEvaluacion', {defaultValue: 'Sin fechas de evaluación'}),
      ],
      actionHref: !tieneHorario ? "/calendario" : undefined,
      actionLabel: !tieneHorario ? t('botones.verificacion.configurarCalendario', {defaultValue: 'Configurar calendario'}) : undefined,
    },
    {
      id: "alumnado",
      icon: <Users className="w-5 h-5" />,
      title: t('nav.alumnado', {defaultValue: 'Alumnado'}),
      href: "/alumnado",
      hrefLabel: t('nav.alumnado', {defaultValue: 'Alumnado'}),
      status: alumnosCount === 0 ? "empty" : alumnosIncompletos > 0 ? "warning" : "ok",
      lines: alumnosCount === 0
        ? [t('campos.verificacion.sinAlumnadoRegistrado', {defaultValue: 'No hay alumnado registrado'})]
        : [
          t('campos.verificacion.alumnosRegistrados', {count: alumnosCount, defaultValue: '{{count}} alumnos registrados'}),
          alumnosIncompletos > 0 ? t('campos.verificacion.registrosIncompletos', {count: alumnosIncompletos, defaultValue: '{{count}} registros incompletos (sin nombre/apellidos)'}) : t('campos.verificacion.todosLosRegistrosCompletos', {defaultValue: 'Todos los registros completos'}),
        ],
      actionHref: alumnosCount === 0 ? "/alumnado" : undefined,
      actionLabel: alumnosCount === 0 ? t('botones.verificacion.anadirAlumnado', {defaultValue: 'Añadir alumnado'}) : undefined,
    },
    {
      id: "seguimiento",
      icon: <ClipboardList className="w-5 h-5" />,
      title: t('campos.verificacion.diarioAulaTitulo', {defaultValue: 'Diario de aula'}),
      href: "/seguimiento?tab=clases",
      hrefLabel: t('campos.verificacion.seguimientoLabel', {defaultValue: 'Seguimiento'}),
      status: sgmtCount === 0 ? "empty" : "ok",
      lines: sgmtCount === 0
        ? [t('campos.verificacion.sinEntradasDiario', {defaultValue: 'Sin entradas en el diario de aula'})]
        : [t('campos.verificacion.sesionesRegistradasDiario', {count: sgmtCount, defaultValue: '{{count}} sesiones registradas en el diario'})],
      actionHref: sgmtCount === 0 ? "/seguimiento?tab=clases" : undefined,
      actionLabel: sgmtCount === 0 ? t('botones.verificacion.registrarPrimeraSesion', {defaultValue: 'Registrar primera sesión'}) : undefined,
    },
    {
      id: "evaluaciones",
      icon: <BarChart2 className="w-5 h-5" />,
      title: t('nav.calificaciones', {defaultValue: 'Calificaciones'}),
      href: "/calificaciones",
      hrefLabel: t('nav.calificaciones', {defaultValue: 'Calificaciones'}),
      status: evalCount === 0 ? "empty" : evalTotal > 0 && evalCount < evalTotal ? "warning" : "ok",
      lines: evalCount === 0
        ? [t('campos.verificacion.sinCalificacionesIntroducidas', {defaultValue: 'Sin calificaciones introducidas'})]
        : [
          t('campos.verificacion.alumnosConRegistro', {count: evalCount, total: evalTotal > 0 ? evalTotal : "?", pct: pct(evalCount, evalTotal), defaultValue: '{{count}} alumnos con registro de {{total}} posibles ({{pct}})'}),
          evalTotal > 0 && evalCount < evalTotal
            ? t('campos.verificacion.faltanAlumnosEvaluar', {count: evalTotal - evalCount, defaultValue: 'Faltan {{count}} alumnos por evaluar'})
            : t('campos.verificacion.todosLosAlumnosTienenRegistro', {defaultValue: 'Todos los alumnos tienen registros de calificación'}),
        ],
      actionHref: evalCount === 0 ? "/seguimiento?tab=detalle" : undefined,
      actionLabel: evalCount === 0 ? t('botones.verificacion.introducirNotas', {defaultValue: 'Introducir notas'}) : undefined,
    },
    {
      id: "tutoria",
      icon: <HeartHandshake className="w-5 h-5" />,
      title: t('campos.verificacion.tutoriaAlertasTitulo', {defaultValue: 'Tutoría y alertas'}),
      href: "/alumnado?tab=tutoria",
      hrefLabel: t('campos.verificacion.seguimientoLabel', {defaultValue: 'Seguimiento'}),
      status: tutoriaEntradas === 0 ? "empty" : "ok",
      lines: tutoriaEntradas === 0
        ? [t('campos.verificacion.sinEntradasTutoria', {defaultValue: 'Sin entradas de tutoría o alertas registradas'})]
        : [t('campos.verificacion.entradasTutoriaRegistradas', {count: tutoriaEntradas, defaultValue: '{{count}} entradas de tutoría registradas'})],
      actionHref: tutoriaEntradas === 0 ? "/alumnado?tab=tutoria" : undefined,
      actionLabel: tutoriaEntradas === 0 ? t('botones.verificacion.registrarTutoria', {defaultValue: 'Registrar tutoría'}) : undefined,
    },
    {
      id: "plano",
      icon: <Users className="w-5 h-5" />,
      title: t('campos.verificacion.planoClaseTitulo', {defaultValue: 'Plano de clase'}),
      href: "/alumnado?tab=plano",
      hrefLabel: t('nav.alumnado', {defaultValue: 'Alumnado'}),
      status: planoCount === 0 ? "empty" : "ok",
      lines: planoCount === 0
        ? [t('campos.verificacion.sinAlumnosPlano', {defaultValue: 'No hay alumnos ubicados en el plano'})]
        : [t('campos.verificacion.alumnosUbicadosAulaVisual', {count: planoCount, defaultValue: '{{count}} alumnos ubicados en el aula visual'})],
      actionHref: planoCount === 0 ? "/alumnado?tab=plano" : undefined,
      actionLabel: planoCount === 0 ? t('botones.verificacion.disenarAula', {defaultValue: 'Diseñar aula'}) : undefined,
    },
  ];

  const allChecks = [...moduleChecks, ...courseChecks];
  const okCount = allChecks.filter(chk => chk.status === "ok").length;
  const warnCount = allChecks.filter(chk => chk.status === "warning").length;
  const emptyCount = allChecks.filter(chk => chk.status === "empty").length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full">

      {nuevoCursoWizardOpen && (
        <NuevoCursoWizard onClose={() => setNuevoCursoWizardOpen(false)} />
      )}

      <div className="space-y-4">
        <h2 className="text-body font-bold text-foreground flex items-center gap-2 border-b border-white/5 pb-2">
          <Building2 className="w-4 h-4 text-accent" />
          {t('campos.verificacion.grupoTitulo', {defaultValue: 'Grupo'})}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-white/5 bg-foreground/5">
            <p className="text-caption font-semibold text-muted mb-3">{t('campos.verificacion.catalogoOficialTitulo', {defaultValue: 'Catálogo oficial (fijo)'})}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-heading font-extrabold text-foreground">{catalogFamiliasCount || "-"}</div>
                <div className="text-caption text-muted mt-0.5">{t('campos.verificacion.familiasProfesionalesLabel', {defaultValue: 'Familias profesionales'})}</div>
              </div>
              <div className="text-center">
                <div className="text-heading font-extrabold text-foreground">{catalogTitulosCount || "-"}</div>
                <div className="text-caption text-muted mt-0.5">{t('campos.verificacion.titulosTotalesLabel', {defaultValue: 'Títulos totales'})}</div>
              </div>
              {[
                { nivel: "Grado Básico", label: t('campos.verificacion.gradoBasicoLabel', {defaultValue: 'Grado Básico (GB/GM/GS)'}) },
                { nivel: "Grado Medio", label: t('campos.verificacion.gradoMedioLabel', {defaultValue: 'Grado Medio (GB/GM/GS)'}) },
                { nivel: "Grado Superior", label: t('campos.verificacion.gradoSuperiorLabel', {defaultValue: 'Grado Superior (GB/GM/GS)'}) },
              ].map(({ nivel, label }) => (
                <div key={nivel} className="text-center">
                  <div className="text-subheading font-bold text-foreground">{catalogPorNivel[nivel] ?? 0}</div>
                  <div className="text-caption text-muted mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 border border-white/5 bg-foreground/5">
            <p className="text-caption font-semibold text-muted mb-3">
              {t('campos.verificacion.ficheroCargado', {origen: dataSourceLabel, defaultValue: 'Fichero cargado ({{origen}})'})}
            </p>
            {infoModuloGrupo.familia || infoModuloGrupo.titulo_fp ? (
              <div className="space-y-2">
                <div>
                  <span className="text-caption text-muted">{t('campos.catalogo.labelFamiliaProfesional', {defaultValue: 'Familia profesional'})}</span>
                  <p className="text-body font-semibold text-foreground">{infoModuloGrupo.familia || "-"}</p>
                </div>
                <div>
                  <span className="text-caption text-muted">{t('campos.catalogo.labelTitulo', {defaultValue: 'Título'})}</span>
                  <p className="text-body font-semibold text-foreground">{infoModuloGrupo.titulo_fp || "-"}</p>
                </div>
                <div>
                  <span className="text-caption text-muted">{t('campos.verificacion.gradoLabel', {defaultValue: 'Grado'})}</span>
                  <p className="text-body font-semibold text-foreground">{grupoTitulo?.level || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-body text-muted">{t('campos.verificacion.sinFamiliaTituloAsignados', {defaultValue: 'Sin familia/título asignados todavía. Ve a Contexto > Identificación.'})}</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border border-success/30 bg-success/10 rounded-2xl text-center">
          <CheckCircle className="w-7 h-7 text-success mx-auto mb-1" />
          <div className="text-heading font-extrabold text-success">{okCount}</div>
          <div className="text-caption text-muted mt-0.5">{t('checks.verificacion.correctos', {defaultValue: 'Correctos'})}</div>
        </Card>
        <Card className="p-4 border border-warning/30 bg-warning/10 rounded-2xl text-center">
          <AlertTriangle className="w-7 h-7 text-warning mx-auto mb-1" />
          <div className="text-heading font-extrabold text-warning">{warnCount}</div>
          <div className="text-caption text-muted mt-0.5">{t('checks.verificacion.advertencias', {defaultValue: 'Advertencias'})}</div>
        </Card>
        <Card className="p-4 border border-danger/30 bg-danger/10 rounded-2xl text-center">
          <XCircle className="w-7 h-7 text-danger mx-auto mb-1" />
          <div className="text-heading font-extrabold text-danger">{emptyCount}</div>
          <div className="text-caption text-muted mt-0.5">{t('checks.verificacion.sinDatos', {defaultValue: 'Sin datos'})}</div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
          <h2 className="text-body font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            {t('campos.verificacion.programacionDidacticaTitulo', {defaultValue: 'Programación didáctica'})}
          </h2>
          <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-caption text-muted">
            {t('campos.verificacion.programacionActivaLabel', {defaultValue: 'Programación activa:'})} <span className="font-semibold text-foreground">{activeModuleId || "-"}</span>
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {moduleChecks.map(item => (
            <CheckCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
          <h2 className="text-body font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            {t('campos.verificacion.cursoActivoTitulo', {defaultValue: 'Curso activo'})}
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-caption text-muted">
              {t('campos.verificacion.cursoActivoLabel', {defaultValue: 'Curso Activo:'})} <span className="font-semibold text-foreground">{activeCursoId || "-"}</span>
            </span>
            {activeModuleId && (
              <Button
                onClick={() => setNuevoCursoWizardOpen(true)}
                className="text-caption bg-info/10 hover:bg-info/20 text-info border border-info/30 gap-2"
              >
                <Rocket className="w-3.5 h-3.5" /> {t('botones.dashboard.nuevoCursoDeEstaProgramacion', {defaultValue: 'Nuevo curso a partir de esta programación'})}
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courseChecks.map(item => (
            <CheckCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
