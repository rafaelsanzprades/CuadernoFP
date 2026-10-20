"use client";
import { BookOpen, Check, Download, FolderGit2, Monitor, Send } from "lucide-react";
import type { ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { useMounted } from "@/hooks/useMounted";
import { UpdateChecker } from "@/components/features/dashboard/UpdateChecker";

const RELEASES_URL = "https://github.com/rafaelsanzprades/CuadernoFP/releases/latest";
const REPO_URL = "https://github.com/rafaelsanzprades/CuadernoFP";
const TELEGRAM_URL = "https://t.me/cuadernofp";
const WEB_URL = "https://www.rafaelsanzprades.es/";

const BOTON = "mt-auto w-full justify-center px-5 py-2.5 rounded-lg bg-accent text-background font-bold hover:bg-accent/80 transition-colors flex items-center gap-2 text-body";

// Bienvenida: tres tarjetones en horizontal (escritorio, comunidad de Telegram y web con todos los contenidos).
// Dentro de Tauri, UpdateChecker (autoactualización) sustituye al botón de descarga.
export function TarjetasBienvenida() {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const rawVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const versionLabel = !rawVersion || rawVersion === "unknown" ? "Desconocida" : rawVersion;

  const lista = (items: string[]) => (
    <ul className="space-y-2.5 text-body text-muted leading-snug">
      {items.map((txt, i) => (
        <li key={i} className="flex gap-2.5">
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <span>{txt}</span>
        </li>
      ))}
    </ul>
  );

  const tarjeta = (id: string, icono: ReactNode, titulo: string, intro: string, cuerpo: ReactNode, pie: ReactNode, destacada?: string) => (
    <Card id={id} className={`h-full p-6 flex flex-col gap-4 border bg-[var(--glass-bg)] ${destacada ?? "border-[var(--glass-border)]"}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-accent">{icono}</div>
        <h3 className="text-subheading font-bold">{titulo}</h3>
      </div>
      <p className="text-body text-foreground leading-relaxed">{intro}</p>
      {cuerpo}
      {pie}
    </Card>
  );

  const k = (clave: string, def: string) => t(`campos.inicio.tarjetas.${clave}`, { defaultValue: def });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
      {tarjeta(
        "bienvenida-escritorio",
        <Monitor className="w-6 h-6" />,
        k("escritorio.titulo", "Aplicación de escritorio"),
        k("escritorio.intro", "Cuaderno FP también es un programa para Windows. Lo instalas una vez y tienes la aplicación en tu propio ordenador, con todo lo bueno de trabajar en local."),
        lista([
          k("escritorio.b1", "Tus ficheros se abren y se guardan con los diálogos de Windows, y los recientes siguen ahí al reiniciar."),
          k("escritorio.b2", "Los documentos (PDF y Word) se generan en tu equipo: nada de tu alumnado sale de él."),
          k("escritorio.b3", "Funciona sin conexión, sin cuenta y sin servidor que guarde tu trabajo."),
          k("escritorio.b4", "Se actualiza desde la propia aplicación cuando hay una versión nueva."),
        ]),
        <div className="mt-auto space-y-3">
          <p className="text-caption text-muted">{k("escritorio.nota", "Si trabajas con ordenadores que no son tuyos, el navegador te basta; para tu portátil, el programa es más cómodo.")}</p>
          <p className="text-caption text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
            <span suppressHydrationWarning className="font-mono whitespace-nowrap">
              {t("campos.descargaEscritorio.version", { defaultValue: "Versión" })}: {isMounted ? versionLabel : "..."}
            </span>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold whitespace-nowrap">
              <FolderGit2 className="w-4 h-4 shrink-0" /> {t("campos.descargaEscritorio.repo", { defaultValue: "Código fuente en GitHub" })}
            </a>
          </p>
          {isTauri() ? (
            <div className="p-4 bg-background/40 border border-[var(--glass-border)] rounded-xl"><UpdateChecker /></div>
          ) : (
            <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
              <Download className="w-4 h-4" />
              {t("campos.descargaEscritorio.boton", { defaultValue: "Descargar para Windows" })}
            </a>
          )}
        </div>,
      )}

      {tarjeta(
        "bienvenida-telegram",
        <Send className="w-6 h-6" />,
        k("telegram.titulo", "Comunidad en Telegram"),
        k("telegram.intro", "Cuaderno FP lo hace un docente, pero mejora con todos. El grupo de Telegram es donde la aplicación y su web se corrigen, se completan y se deciden."),
        <>
          {lista([
            k("telegram.b1", "Sugiere mejoras o avisa de fallos: así se decide qué se arregla primero."),
            k("telegram.b2", "Aporta el currículo oficial y el calendario escolar de tu comunidad: cada comunidad que se suma ayuda a todo el profesorado."),
            k("telegram.b3", "Comparte tus programaciones como plantilla (.fpp): se publican con tu nombre y la licencia CC BY-NC-SA 4.0."),
            k("telegram.b4", "Señala las normas y los enlaces que faltan en la bibliografía."),
          ])}
          <p className="text-body text-muted leading-relaxed">{k("telegram.importa", "Participar importa: el catálogo, los calendarios y las plantillas son colaborativos y solo crecen con aportaciones de docentes de otras comunidades.")}</p>
        </>,
        <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
          <Send className="w-4 h-4" />
          {k("telegram.boton", "Unirme al grupo de Telegram")}
        </a>,
      )}

      {tarjeta(
        "bienvenida-guia",
        <BookOpen className="w-6 h-6" />,
        k("web.titulo", "Web con todos los contenidos"),
        k("web.intro", "En rafaelsanzprades.es está todo lo que acompaña a la aplicación, en abierto y sin registro. Úsala cuando no sepas qué escribir en un apartado o quieras entender de dónde sale una exigencia."),
        lista([
          k("web.b1", "Programación didáctica: el libro, con la norma explicada y un ejemplo en cada capítulo."),
          k("web.b2", "CCAA y Nueva ley: lo que cambia en cada comunidad autónoma y la ley de FP."),
          k("web.b3", "Orientación alumnado y Bibliografía: la guía para el alumnado y las leyes y normas, con copia."),
          k("web.b4", "Manual Cuaderno FP, Calendarios y Recursos: cada página y pestaña de la aplicación, los calendarios oficiales y las plantillas."),
        ]),
        <a href={WEB_URL} target="_blank" rel="noopener noreferrer" className={BOTON}>
          <BookOpen className="w-4 h-4" />
          {k("web.boton", "Abrir la web")}
        </a>,
      )}
    </div>
  );
}
