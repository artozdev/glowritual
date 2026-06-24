import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';

/**
 * Applique la langue mémorisée dans le profil (utile après connexion :
 * un compte existant retrouve sa langue, quel que soit l'appareil).
 */
export function LanguageSync() {
  const { i18n } = useTranslation();
  const { profile } = useProfile();
  useEffect(() => {
    const l = profile.language;
    if (l && i18n.resolvedLanguage !== l) void i18n.changeLanguage(l);
  }, [profile.language, i18n]);
  return null;
}
