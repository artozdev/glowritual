import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import {
  codeForAmbassador,
  createCodeForAmbassador,
  statsFor,
} from '@/lib/promoStore';
import type { AmbassadorStats, PromoCode } from '@/types/promo';

/**
 * Côté ambassadeur : code personnalisé, statistiques et lien de partage.
 */
export function usePromo() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const uid = user?.id ?? null;

  const [myCode, setMyCode] = useState<PromoCode | null>(() =>
    uid ? codeForAmbassador(uid) : null,
  );
  const [stats, setStats] = useState<AmbassadorStats>(() =>
    uid ? statsFor(uid) : { uses: 0, rewardEur: 0 },
  );

  const becomeAmbassador = useCallback(() => {
    if (!uid) return null;
    const name =
      profile.displayName.trim() ||
      user?.email?.split('@')[0] ||
      'glow';
    const code = createCodeForAmbassador(uid, name);
    setMyCode(code);
    setStats(statsFor(uid));
    return code;
  }, [uid, profile.displayName, user?.email]);

  const shareLink = useCallback(
    (code: string) => `${window.location.origin}/?code=${code}`,
    [],
  );

  return { isAmbassador: Boolean(myCode), myCode, stats, becomeAmbassador, shareLink };
}
