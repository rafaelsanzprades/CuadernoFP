import React from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AccordionBlock } from "@/components/ui/AccordionBlock";
import type { ProcedenciaTitulo, CotejoModulo, EstadoComunidad } from "@/types/procedencia";

type Variante = "success" | "danger" | "warning" | "info" | "default";

const COTEJO_VARIANTE: Record<CotejoModulo, Variante> = {
  igual: "success",
  corregido_boe: "success",
  rd659_2023: "info",
  autonomico: "info",
  sin_cotejo: "warning",
  difiere: "danger",
  sin_ra: "default",
};

const ESTADO_VARIANTE: Record<EstadoComunidad, Variante> = {
  verificado: "success",
  enlaces_oficiales: "info",
  heredado: "warning",
  a_completar: "warning",
  sin_cargar: "default",
  no_disponible: "danger",
  no_ofertado: "default",
};

/** Etiqueta del estado de cotejo de un módulo con el BOE (para la lista de módulos y para los resúmenes). */
export function CotejoBadge({ cotejo, ambito }: { cotejo?: string; ambito?: string }) {
  const { t } = useTranslation();
  if (!cotejo && !ambito) return null;
  const clave = (ambito === "autonomico" ? "autonomico" : cotejo || "sin_cotejo") as CotejoModulo;
  return (
    <Badge variant={COTEJO_VARIANTE[clave] ?? "default"} title={t("campos.catalogo.procedencia.ayudaCotejo", { defaultValue: "Procedencia del texto de los RA y CE" })}>
      {t(`campos.catalogo.procedencia.cotejo.${clave}`, { defaultValue: DEFECTO_COTEJO[clave] ?? clave })}
    </Badge>
  );
}

const DEFECTO_COTEJO: Record<string, string> = {
  igual: "Igual que el BOE",
  corregido_boe: "Corregido desde el BOE",
  rd659_2023: "Texto del RD 659/2023",
  autonomico: "Propio de la comunidad",
  sin_cotejo: "Sin cotejar con el BOE",
  difiere: "Difiere del BOE",
  sin_ra: "Sin RA",
};

const DEFECTO_ESTADO: Record<string, string> = {
  verificado: "Verificado",
  enlaces_oficiales: "Enlaces oficiales",
  heredado: "Heredado de la base",
  a_completar: "A completar a mano",
  sin_cargar: "Sin cargar",
  no_disponible: "No disponible",
  no_ofertado: "No se ofrece",
};

interface Props {
  procedencia?: ProcedenciaTitulo | null;
  /** Cotejo de cada módulo del título, para resumir cuántos hay de cada tipo. */
  modulos?: { cotejo?: string; ambito?: string }[];
}

/** Indicador «Procedencia de los datos»: de dónde sale el currículo de un título y qué está cotejado y qué falta. */
export function ProcedenciaDatos({ procedencia, modulos = [] }: Props) {
  const { t } = useTranslation();
  if (!procedencia) return null;

  const cuenta: Record<string, number> = {};
  modulos.forEach(m => {
    const k = m.ambito === "autonomico" ? "autonomico" : m.cotejo || "sin_cotejo";
    cuenta[k] = (cuenta[k] ?? 0) + 1;
  });

  const ofrecen = procedencia.comunidades.filter(c => c.estado !== "no_ofertado");
  const heredadas = modulos.length > 0;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-accent" />
        <h2 className="text-subheading font-bold text-foreground">{t("campos.catalogo.procedencia.titulo", { defaultValue: "Procedencia de los datos" })}</h2>
      </div>

      <div className="space-y-1 text-body">
        <p className="text-foreground">
          <span className="font-semibold">{t("campos.catalogo.procedencia.norma", { defaultValue: "Norma estatal (BOE)" })}: </span>
          {procedencia.norma_estatal ? (
            procedencia.url_norma_estatal ? (
              <a href={procedencia.url_norma_estatal} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                {procedencia.norma_estatal} <ExternalLink className="w-3 h-3" />
              </a>
            ) : procedencia.norma_estatal
          ) : (
            <span className="text-muted">{t("campos.catalogo.procedencia.sinNorma", { defaultValue: "sin registrar" })}</span>
          )}
        </p>
        <p className="text-muted">
          {procedencia.verificado_el
            ? t("campos.catalogo.procedencia.cotejado", { fecha: procedencia.verificado_el, defaultValue: "Cotejado con el BOE el {{fecha}}." })
            : t("campos.catalogo.procedencia.sinFechaCotejo", { defaultValue: "Sin fecha de cotejo con el BOE." })}
        </p>
      </div>

      {Object.keys(cuenta).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(cuenta).map(([k, n]) => (
            <span key={k} className="flex items-center gap-1">
              <CotejoBadge cotejo={k} />
              <span className="text-caption text-muted">× {n}</span>
            </span>
          ))}
        </div>
      )}

      {procedencia.verificacion && (
        <AccordionBlock title={t("campos.catalogo.procedencia.comoSeCoteja", { defaultValue: "Cómo se cotejó con el BOE" })}>
          <p className="text-body text-muted p-4 pt-0">{procedencia.verificacion}</p>
        </AccordionBlock>
      )}

      <AccordionBlock
        title={t("campos.catalogo.procedencia.comunidades", { defaultValue: "Currículo por comunidad autónoma" })}
        badge={<Badge variant="info">{ofrecen.filter(c => c.estado !== "sin_cargar").length}/{ofrecen.length}</Badge>}
      >
        <div className="p-4 pt-0 space-y-3">
          <p className="text-caption text-muted">
            {t("campos.catalogo.procedencia.ayudaComunidades", { defaultValue: "El Estado fija el título y los RA y CE; cada comunidad publica su currículo en su boletín. Se muestra lo que ya está cargado y dónde está lo oficial." })}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-body border-collapse">
              <thead>
                <tr className="text-left text-caption text-muted">
                  <th className="p-2">{t("campos.catalogo.procedencia.colComunidad", { defaultValue: "Comunidad" })}</th>
                  <th className="p-2">{t("campos.catalogo.procedencia.colBoletin", { defaultValue: "Boletín" })}</th>
                  <th className="p-2">{t("campos.catalogo.procedencia.colEstado", { defaultValue: "Estado" })}</th>
                  <th className="p-2">{t("campos.catalogo.procedencia.colEnlaces", { defaultValue: "Enlaces oficiales" })}</th>
                </tr>
              </thead>
              <tbody>
                {procedencia.comunidades.map(c => (
                  <tr key={c.comunidad} className="border-t border-[var(--glass-border)] align-top">
                    <td className="p-2 font-medium text-foreground">{c.comunidad}</td>
                    <td className="p-2 text-muted">{c.boletin ?? "—"}</td>
                    <td className="p-2">
                      <Badge variant={ESTADO_VARIANTE[c.estado] ?? "default"}>
                        {t(`campos.catalogo.procedencia.estado.${c.estado}`, { defaultValue: DEFECTO_ESTADO[c.estado] ?? c.estado })}
                      </Badge>
                    </td>
                    <td className="p-2 space-x-2">
                      {c.url_curriculo && <EnlaceOficial href={c.url_curriculo} texto={t("campos.catalogo.procedencia.curriculo", { defaultValue: "Currículo" })} />}
                      {c.url_horario && <EnlaceOficial href={c.url_horario} texto={t("campos.catalogo.procedencia.horario", { defaultValue: "Horario" })} />}
                      {c.url_horario_ley_fp && <EnlaceOficial href={c.url_horario_ley_fp} texto={t("campos.catalogo.procedencia.horarioLeyFp", { defaultValue: "Horario (Ley de FP)" })} />}
                      {!c.url_curriculo && c.url_portal && c.estado !== "no_ofertado" && (
                        <EnlaceOficial href={c.url_portal} texto={t("campos.catalogo.procedencia.portal", { defaultValue: "Portal de normativa" })} />
                      )}
                      {c.nota && <span className="block text-caption text-muted">{c.nota}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AccordionBlock>

      {heredadas && (
        <p className="text-caption text-muted">
          {t("campos.catalogo.procedencia.notaHoras", {
            defaultValue: "Las horas y el curso de cada módulo son los de Aragón, heredados de la base y pendientes de contrastar con su orden. Tu comunidad puede repartirlos de otra forma: cámbialos en tu programación.",
          })}
        </p>
      )}
    </Card>
  );
}

function EnlaceOficial({ href, texto }: { href: string; texto: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-0.5 text-caption">
      {texto} <ExternalLink className="w-3 h-3" />
    </a>
  );
}
