import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import ca from './locales/ca.json';
import ba from './locales/ba.json';
import va from './locales/va.json';
import gl from './locales/gl.json';
import eu from './locales/eu.json';
import en from './locales/en.json';

const resources = {
  es: { translation: es },
  ca: { translation: ca },
  ba: { translation: ba },
  va: { translation: va },
  gl: { translation: gl },
  eu: { translation: eu },
  en: { translation: en }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['es', 'ca', 'ba', 'va', 'gl', 'eu', 'en'],
    interpolation: {
      escapeValue: false // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;
