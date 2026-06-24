import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import type { Lang } from '@/i18n';

/**
 * Langue courante + changement (instantané, persisté).
 * - i18next persiste en localStorage (visiteur).
 * - on enregistre aussi dans le profil (cloud si connecté).
 */
export function useLanguage(): { lang: Lang; setLang: (l: Lang) => void } {
  const { i18n } = useTranslation();
  const { profile, update } = useProfile();
  const lang = ((i18n.resolvedLanguage ?? i18n.language ?? 'fr').slice(0, 2) ===
  'fr'
    ? 'fr'
    : 'en') as Lang;

  const setLang = (l: Lang) => {
    void i18n.changeLanguage(l);
    if (profile.language !== l) update({ language: l });
  };

  return { lang, setLang };
}
