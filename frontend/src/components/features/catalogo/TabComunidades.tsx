"use client";

import React, { useState, useMemo } from "react";
import { MapPin, ExternalLink, BookOpen, Globe, FileText, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import spainMapData from "@/data/spain-paths.json";

const SPAIN_VIEWBOX = spainMapData.viewBox as string;
const SPAIN_PATHS = spainMapData.locations as {svgId:string;ccaaId:string;path:string}[];

/**
 * TAB "Comunidades" en /catalogo
 * Mapa SVG real de España (via @svg-maps/spain) con las 17 CCAA
 * Ceuta y Melilla no tienen path propio en el mapa base.
 */

interface CCAA {
  id: string;
  nombre: string;
  siglas: string;
  bo: string;
  boNombre: string;
  webCurriculo: string;
  nota?: string;
  color: string;
}

const COMUNIDADES: CCAA[] = [
  {
    id: "andalucia",
    nombre: "Andalucía",
    siglas: "AN",
    bo: "BOJA",
    boNombre: "Boletín Oficial de la Junta de Andalucía",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#10b981",
  },
  {
    id: "aragon",
    nombre: "Aragón",
    siglas: "AR",
    bo: "BOA",
    boNombre: "Boletín Oficial de Aragón",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    nota: "Currículo de referencia del entorno DEMO de esta aplicación.",
    color: "#3b82f6",
  },
  {
    id: "asturias",
    nombre: "Principado de Asturias",
    siglas: "AS",
    bo: "BOPA",
    boNombre: "Boletín Oficial del Principado de Asturias",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#8b5cf6",
  },
  {
    id: "baleares",
    nombre: "Islas Baleares",
    siglas: "IB",
    bo: "BOIB",
    boNombre: "Butlletí Oficial de les Illes Balears",
    webCurriculo: "https://www.caib.es/eboibfront/",
    nota: "Currículo propio para enseñanzas generales. En FP, aplica normativa estatal según ciclo.",
    color: "#f59e0b",
  },
  {
    id: "canarias",
    nombre: "Canarias",
    siglas: "CN",
    bo: "BOC",
    boNombre: "Boletín Oficial de Canarias",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#ef4444",
  },
  {
    id: "cantabria",
    nombre: "Cantabria",
    siglas: "CB",
    bo: "BOC",
    boNombre: "Boletín Oficial de Cantabria",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#ec4899",
  },
  {
    id: "castilla-mancha",
    nombre: "Castilla-La Mancha",
    siglas: "CM",
    bo: "DOCM",
    boNombre: "Diario Oficial de Castilla-La Mancha",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#14b8a6",
  },
  {
    id: "castilla-leon",
    nombre: "Castilla y León",
    siglas: "CL",
    bo: "BOCYL",
    boNombre: "Boletín Oficial de Castilla y León",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#6366f1",
  },
  {
    id: "cataluna",
    nombre: "Cataluña",
    siglas: "CT",
    bo: "DOGC",
    boNombre: "Diari Oficial de la Generalitat de Catalunya",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    nota: "Currículo disponible en castellano y catalán.",
    color: "#f97316",
  },
  {
    id: "extremadura",
    nombre: "Extremadura",
    siglas: "EX",
    bo: "DOE",
    boNombre: "Diario Oficial de Extremadura",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#84cc16",
  },
  {
    id: "galicia",
    nombre: "Galicia",
    siglas: "GA",
    bo: "DOG",
    boNombre: "Diario Oficial de Galicia",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    nota: "Currículo disponible en castellano y gallego.",
    color: "#06b6d4",
  },
  {
    id: "la-rioja",
    nombre: "La Rioja",
    siglas: "RI",
    bo: "BOR",
    boNombre: "Boletín Oficial de La Rioja",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#a855f7",
  },
  {
    id: "madrid",
    nombre: "Comunidad de Madrid",
    siglas: "MA",
    bo: "BOCM",
    boNombre: "Boletín Oficial de la Comunidad de Madrid",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#e11d48",
  },
  {
    id: "murcia",
    nombre: "Región de Murcia",
    siglas: "MU",
    bo: "BORM",
    boNombre: "Boletín Oficial de la Región de Murcia",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#ea580c",
  },
  {
    id: "navarra",
    nombre: "Comunidad Foral de Navarra",
    siglas: "NA",
    bo: "BON",
    boNombre: "Boletín Oficial de Navarra",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    color: "#dc2626",
  },
  {
    id: "pais-vasco",
    nombre: "País Vasco",
    siglas: "PV",
    bo: "BOPV",
    boNombre: "Boletín Oficial del País Vasco",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    nota: "Currículo disponible en castellano y euskera.",
    color: "#22c55e",
  },
  {
    id: "valencia",
    nombre: "Comunidad Valenciana",
    siglas: "VC",
    bo: "DOGV",
    boNombre: "Diari Oficial de la Generalitat Valenciana",
    webCurriculo: "https://todofp.es/que-estudiar/familias-profesionales/servicios-socioculturales-comunidad/integracion-social/curriculos-ccaa.html",
    nota: "Currículo disponible en castellano y valenciano.",
    color: "#0ea5e9",
  },
  {
    id: "ceuta",
    nombre: "Ceuta",
    siglas: "CE",
    bo: "BOE",
    boNombre: "Boletín Oficial del Estado",
    webCurriculo: "https://www.boe.es/",
    nota: "Ciudad Autónoma. Aplica directamente el currículo del Ministerio (BOE). Sin path en el mapa SVG.",
    color: "#78716c",
  },
  {
    id: "melilla",
    nombre: "Melilla",
    siglas: "ML",
    bo: "BOE",
    boNombre: "Boletín Oficial del Estado",
    webCurriculo: "https://www.boe.es/",
    nota: "Ciudad Autónoma. Aplica directamente el currículo del Ministerio (BOE). Sin path en el mapa SVG.",
    color: "#78716c",
  },
];

const CCAA_MAP: Record<string, CCAA> = {};
COMUNIDADES.forEach(c => { CCAA_MAP[c.id] = c; });

export function TabComunidades() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const activeId = hovered || selected;
  const activeCCAA = activeId ? CCAA_MAP[activeId] : null;

  // Build a lookup from svgId → ccaaId
  const svgToCcaa = useMemo(() => {
    const map: Record<string, string> = {};
    SPAIN_PATHS.forEach(p => { map[p.svgId] = p.ccaaId; });
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Mapa + Info lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Mapa SVG real */}
        <Card className="lg:col-span-3 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Mapa de CCAA con currículo FP</h3>
          </div>
          <p className="text-xs text-muted mb-4">
            Haz clic en una comunidad para ver su detalle. Fuente: <a href="https://todofp.es" target="_blank" rel="noopener" className="underline text-primary">todofp.es</a>
          </p>

          <div className="flex justify-center">
            <svg
              viewBox={SPAIN_VIEWBOX}
              className="w-full max-w-lg h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {SPAIN_PATHS.map((item) => {
                const ccaa = CCAA_MAP[item.ccaaId];
                if (!ccaa) return null;
                const isActive = activeId === item.ccaaId;
                const isDemo = item.ccaaId === "aragon";

                return (
                  <path
                    key={item.svgId}
                    d={item.path}
                    fill={
                      isActive
                        ? ccaa.color
                        : isDemo
                        ? "#dbeafe"
                        : "#e5e7eb"
                    }
                    stroke={isActive ? ccaa.color : "#9ca3af"}
                    strokeWidth={isActive ? 2.5 : 0.8}
                    opacity={isActive ? 0.85 : 0.7}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHovered(item.ccaaId)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === item.ccaaId ? null : item.ccaaId)}
                  >
                    <title>{ccaa.nombre} ({ccaa.siglas}) — {ccaa.bo}</title>
                  </path>
                );
              })}
            </svg>
          </div>

          {/* Tooltip flotante */}
          {activeCCAA && (
            <div className="mt-3 p-3 rounded-lg border bg-accent/5 text-center">
              <p className="font-semibold text-sm">{activeCCAA.nombre}</p>
              <p className="text-xs text-muted">
                {activeCCAA.siglas} — {activeCCAA.bo}
                {activeCCAA.id === "aragon" && (
                  <Badge variant="info" className="ml-2 text-[10px]">DEMO</Badge>
                )}
              </p>
            </div>
          )}
        </Card>

        {/* Card detalle CCAA seleccionada */}
        <Card className="lg:col-span-2 p-4">
          {selected && CCAA_MAP[selected] ? (
            <DetalleCCAA ccaa={CCAA_MAP[selected]} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MapPin className="w-10 h-10 text-muted mb-3" />
              <p className="text-sm text-muted">
                Selecciona una comunidad autónoma en el mapa para ver su información detallada.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Tabla de todas las CCAA */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Tabla de Comunidades Autónomas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-muted">#</th>
                <th className="text-left py-2 px-3 font-medium text-muted">Comunidad Autónoma</th>
                <th className="text-left py-2 px-3 font-medium text-muted">Siglas</th>
                <th className="text-left py-2 px-3 font-medium text-muted">Boletín Oficial</th>
                <th className="text-left py-2 px-3 font-medium text-muted">Tipo</th>
                <th className="text-left py-2 px-3 font-medium text-muted">Nota</th>
              </tr>
            </thead>
            <tbody>
              {COMUNIDADES.map((ccaa, i) => (
                <tr
                  key={ccaa.id}
                  className={`border-b cursor-pointer hover:bg-accent/10 transition-colors ${
                    selected === ccaa.id ? "bg-accent/15" : ""
                  }`}
                  onClick={() => setSelected(selected === ccaa.id ? null : ccaa.id)}
                >
                  <td className="py-2 px-3 text-muted">{i + 1}</td>
                  <td className="py-2 px-3 font-medium">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ccaa.color }} />
                    {ccaa.nombre}
                    {ccaa.id === "aragon" && (
                      <Badge variant="info" className="ml-2 text-[10px]">DEMO</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3">{ccaa.siglas}</td>
                  <td className="py-2 px-3">
                    <a
                      href={ccaa.webCurriculo}
                      target="_blank"
                      rel="noopener"
                      className="underline text-primary hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ccaa.bo}
                    </a>
                  </td>
                  <td className="py-2 px-3">
                    {ccaa.bo === "BOE" ? (
                      <Badge variant="info" className="text-[10px]">Ciudad Autónoma</Badge>
                    ) : (
                      <Badge variant="info" className="text-[10px]">CCAA</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-xs text-muted max-w-[200px]">
                    {ccaa.nota || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sección informativa */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm text-muted">
            <p>
              <strong>Fuente principal:</strong>{" "}
              <a href="https://todofp.es" target="_blank" rel="noopener" className="underline text-primary">
                todofp.es
              </a>{" "}
              — Portal oficial del Ministerio de Educación y Formación Profesional.
            </p>
            <p>
              Cada comunidad autónoma publica su propio currículo de FP en su boletín oficial.
              Los enlaces anteriores llevan a la página de <em>currículos por CCAA</em> de todofp.es,
              donde se puede consultar la normativa específica de cada territorio.
            </p>
            <p>
              <strong>Ceuta y Melilla</strong> aplican directamente el currículo del Ministerio (BOE),
              al no tener competencias transferadas en materia de educación.
            </p>
            <p className="text-xs">
              Mapa SVG:{" "}
              <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/spain" target="_blank" rel="noopener" className="underline">
                @svg-maps/spain
              </a>{" "}
              (CC-BY-4.0) — Victor Cazanave.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Detalle de una CCAA ── */
function DetalleCCAA({ ccaa }: { ccaa: CCAA }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: ccaa.color }}>
          {ccaa.siglas}
        </div>
        <div>
          <h4 className="font-semibold">{ccaa.nombre}</h4>
          <p className="text-xs text-muted">{ccaa.siglas}</p>
        </div>
      </div>

      {ccaa.id === "aragon" && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>🌍 Entorno DEMO:</strong> Los datos de ejemplo de esta aplicación usan el currículo de Aragón (BOA) como referencia.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted">Boletín Oficial</p>
            <p className="text-sm">{ccaa.boNombre}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Globe className="w-4 h-4 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted">Tipo</p>
            <p className="text-sm">{ccaa.bo === "BOE" ? "Ciudad Autónoma" : "Comunidad Autónoma"}</p>
          </div>
        </div>

        {ccaa.nota && (
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted">Nota</p>
              <p className="text-sm">{ccaa.nota}</p>
            </div>
          </div>
        )}
      </div>

      <a
        href={ccaa.webCurriculo}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 text-sm text-primary underline hover:text-primary/80 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Ver currículo oficial
      </a>
    </div>
  );
}

