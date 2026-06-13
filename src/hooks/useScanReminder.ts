import { useEffect } from 'react';
import { useProfile } from './useProfile';
import { useScanSession } from './useScanSession';
import { isScanDue } from '@/lib/progress';

// Une seule notification par session pour ne pas spammer.
let notifiedThisSession = false;

/**
 * Déclenche une notification douce quand un scan est « dû » (selon la
 * fréquence choisie) — tant que l'app est ouverte et que la permission
 * est accordée. À appeler une fois, haut dans l'arbre (AppShell).
 */
export function useScanReminder() {
  const { profile } = useProfile();
  const { latest } = useScanSession();

  useEffect(() => {
    if (notifiedThisSession) return;
    if (profile.scanReminder === 'off') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted')
      return;
    if (!isScanDue(profile.scanReminder, latest?.createdAt ?? null)) return;

    notifiedThisSession = true;
    try {
      new Notification('Glow', { body: 'Ton scan du jour t’attend ✨' });
    } catch {
      /* ignore */
    }
  }, [profile.scanReminder, latest]);
}
