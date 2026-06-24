import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';

/**
 * Internationalisation (FR / EN).
 *
 * - Détection auto au 1er chargement : localStorage (« glow.lang ») puis langue
 *   du navigateur. `fr-*` → FR, sinon → EN (fallback).
 * - Choix persisté en localStorage (visiteur) et, en plus, dans le profil pour
 *   un utilisateur connecté (cf. useLanguage + LanguageSync).
 * - Changement instantané, sans rechargement.
 */

export const SUPPORTED_LANGS = ['fr', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    supportedLngs: ['fr', 'en'],
    fallbackLng: 'en',
    load: 'languageOnly', // fr-FR → fr
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'glow.lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18n;
