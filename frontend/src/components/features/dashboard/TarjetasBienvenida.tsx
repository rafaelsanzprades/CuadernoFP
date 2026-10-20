"use client";
import { BookOpen, Check, Download, FolderGit2, Monitor, Send, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useMounted } from "@/hooks/useMounted";
import { UpdateChecker } from "@/components/features/dashboard/UpdateChecker";

const RELEASES_URL = "https://github.com/rafaelsanzprades/CuadernoFP/releases/latest";
const REPO_URL = "https://github.com/rafaelsanzprades/CuadernoFP";
const TELEGRAM_URL = "https://t.me/cuadernofp";
const WEB_URL = "https://www.rafaelsanzprades.es/";

const BOTON = "self-end px-5 py-2.5 rounded-lg bg-accent text-background font-bold hover:bg-accent/80 transition-colors flex items-center gap-2 text-body";

// Bienvenida: tres bloques en horizontal con subtítulo (escritorio, comunidad de Telegram y web con todos los contenidos).
// El botón va abajo a la derecha de cada bloque. Dentro de Tauri, UpdateChecker (autoactualización) sustituye al de descarga.
export function TarjetasBienvenida() {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const versionLabel = !rawVersion || rawVersion === "unknown" ? "Desconocida" : rawVersion;

  const lista = (items: string[]) => (
    <ul className="space-y-2 text-body text-muted leading-snug">
      {items.map((txt, i) => (
        <li key={i} className="flex gap-2.5">
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <span>{txt}</span>
        </li>
      ))}
    </ul>
  );

  const bloque = (id: string, icono: LucideIcon, titulo: string, cuerpo: ReactNode, pie: ReactNode) => (
    <section className="flex flex-col gap-4 min-w-0">
      <SectionHeading id={id} icon={icono} scrollMt="260px">{titulo}</SectionHeading>
      <div className="space-y-4 text-body text-muted leading-relaxed">{cuerpo}</div>
      <div className="mt-auto flex flex-col gap-3 pt-2">{pie}</div>
    </section>
  );

  const k = (clave: string, def: string) => t(`campos.inicio.tarjetas.${clave}`, { defaultValue: def });

  return (
    <div className="flex flex-col gap-12 max-w-5xl">
      {bloque(
        "bienvenida-escritorio",
        Monitor,
        k("escritorio.titulo", "Aplicación de escritorio"),
        <>
          <p>{k("escritorio.intro", "Cuaderno FP también es un programa para Windows. Lo instalas una vez y tienes la aplicación en tu propio ordenador, con todo lo bueno de trabajar en local.")}</p>
          {lista([
            k("escritorio.b1", "Tus ficheros se abren y se guardan con los diálogos de Windows, y los recientes siguen ahí al reiniciar."),
            k("escritorio.b2", "Los documentos (PDF y Word) se generan en tu equipo: nada de tu alumnado sale de él."),
            k("escritorio.b3", "Funciona sin conexión, sin cuenta y sin servidor que guarde tu trabajo."),
            k("escritorio.b4", "Se actualiza desde la propia aplicación cuando hay una versión nueva."),
          ])}
          <p className="text-caption">{k("escritorio.nota", "Si trabajas con ordenadores que no son tuyos, el navegador te basta; para tu portátil, el programa es más cómodo.")}</p>
        </>,
        <>
          <p className="text-caption text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
            <span suppressHydrationWarning className="font-mono whitespace-nowrap">
              {t("campos.descargaEscritorio.version", { defaultValue: "Versión" })}: {isMounted ? versionLabel : "..."}
            </span>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold whitespace-nowrap">
              <FolderGit2 className="w-4 h-4 shrink-0" /> {t("campos.descargaEscritorio.repo", { defaultValue: "Código fuente en GitHub" })}
            </a>
          </p>
          {isTauri() ? (
            <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl"><UpdateChecker /></div>
          ) : (
            <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
              <Download className="w-4 h-4" />
              {t("campos.descargaEscritorio.boton", { defaultValue: "Descargar para Windows" })}
            </a>
          )}
        </>,
      )}

      {bloque(
        "bienvenida-telegram",
        Send,
        k("telegram.titulo", "Comunidad en Telegram"),
        <>
          <p>{k("telegram.intro", "Grupo oficial de desarrollo y testeo de la aplicación web gratuita cuadernofp.web.app. Sube tus sugerencias, reporta bugs o colabora aportando el currículo oficial de tu comunidad autónoma.")}</p>
          <p className="text-foreground font-semibold">{k("telegram.queHacemos", "¿Qué hacemos aquí?")}</p>
          {lista([
            k("telegram.b1", "Proponer ideas y nuevas funciones para la aplicación."),
            k("telegram.b2", "Ayudar a integrar los currículos y normativas de otras comunidades autónomas."),
            k("telegram.b3", "Reportar fallos o dudas sobre el uso de la herramienta."),
            k("telegram.b4", "Compartir metodologías ágiles, trucos de evaluación y experiencias de clase."),
          ])}
          <p>{k("telegram.importa", "Participar importa: el catálogo, los calendarios y las plantillas son colaborativos y solo crecen con aportaciones del profesorado de cada comunidad. Preséntate y dinos tu familia profesional y tu comunidad: siéntete como en la sala de profesorado.")}</p>
        </>,
        <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
          <Send className="w-4 h-4" />
          {k("telegram.boton", "Unirme al grupo de Telegram")}
        </a>,
      )}

      {bloque(
        "bienvenida-guia",
        BookOpen,
        k("web.titulo", "Web con todos los contenidos"),
        <>
          <p>{k("web.intro", "En rafaelsanzprades.es está todo lo que acompaña a la aplicación, en abierto y sin registro. Úsala cuando no sepas qué escribir en un apartado o quieras entender de dónde sale una exigencia.")}</p>
          {lista([
            k("web.b1", "Programación didáctica: el libro, con la norma explicada y un ejemplo en cada capítulo."),
            k("web.b2", "CCAA y Nueva ley: lo que cambia en cada comunidad autónoma y la ley de FP."),
            k("web.b3", "Orientación alumnado y Bibliografía: la guía para el alumnado y las leyes y normas, con copia."),
            k("web.b4", "Manual Cuaderno FP, Calendarios y Recursos: cada página y pestaña de la aplicación, los calendarios oficiales y las plantillas."),
          ])}
        </>,
        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
          <BookOpen className="w-4 h-4" />
          {k("web.boton", "Abrir la web")}
        </a>,
      )}
    </div>
  );
}
