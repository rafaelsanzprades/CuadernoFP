import { useTranslation } from "react-i18next";
import { es, enUS, ca, eu, gl, type Locale } from "date-fns/locale";

// ba/va (Balear/Valencià) no tienen locale propio en date-fns -- usan el
// mismo (ca) que el resto de contenido técnico de la app, mismo criterio que
// los locales JSON de i18n.
const DATE_FNS_LOCALES: Record<string, Locale> = {
  es,
  en: enUS,
  ca,
  ba: ca,
  va: ca,
  eu,
  gl,
};

export function useDateFnsLocale(): Locale {
  const { i18n } = useTranslation();
  return DATE_FNS_LOCALES[i18n.language] || es;
}

// Los idiomas románicos de la app (es/ca/ba/va/gl) usan la construcción
// "día DE mes"; inglés y euskera no llevan preposición y van en otro orden
// -- por eso el propio patrón de formato (no solo los nombres de mes/día)
// tiene que variar por idioma, o el conector "de" se queda fijo en español
// aunque el resto de la fecha ya esté traducida.
const ROMANCE_WITH_DE = new Set(["es", "ca", "ba", "va", "gl"]);

export interface DateFormatPatterns {
  /** "27 de abril" / "April 27" */
  dayMonth: string;
  /** "27 de abr" / "Apr 27" */
  dayMonthShort: string;
  /** "sábado 2 de mayo" / "Saturday May 2" */
  weekdayDayMonth: string;
}

export function useDateFormatPatterns(): DateFormatPatterns {
  const { i18n } = useTranslation();
  if (ROMANCE_WITH_DE.has(i18n.language)) {
    return {
      dayMonth: "d 'de' MMMM",
      dayMonthShort: "d 'de' MMM",
      weekdayDayMonth: "EEEE d 'de' MMMM",
    };
  }
  if (i18n.language === "eu") {
    return {
      dayMonth: "d MMMM",
      dayMonthShort: "d MMM",
      weekdayDayMonth: "EEEE d MMMM",
    };
  }
  // en (y cualquier otro no contemplado)
  return {
    dayMonth: "MMMM d",
    dayMonthShort: "MMM d",
    weekdayDayMonth: "EEEE MMMM d",
  };
}
