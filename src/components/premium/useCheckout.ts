import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  startCheckout,
  openBillingPortal,
  type BillingInterval,
} from '@/lib/stripeClient';

/**
 * État + actions de paiement Stripe (mutualisés entre la page Pricing et
 * l'écran d'upgrade) : lancer le Checkout selon la formule, ou ouvrir le
 * portail client. Gère le « busy » par formule et les erreurs.
 */
export function useCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState<BillingInterval | 'portal' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goCheckout = useCallback(
    async (interval: BillingInterval) => {
      setError(null);
      if (!user) {
        navigate('/auth', { state: { from: '/pricing', mode: 'signup' } });
        return;
      }
      setBusy(interval);
      try {
        await startCheckout(interval);
      } catch (e) {
        setError(
          (e as Error).message ||
            'Le paiement n’est pas disponible pour le moment. Réessaie plus tard.',
        );
        setBusy(null);
      }
    },
    [user, navigate],
  );

  const goPortal = useCallback(async () => {
    setError(null);
    setBusy('portal');
    try {
      await openBillingPortal();
    } catch (e) {
      setError((e as Error).message || 'Portail indisponible pour le moment.');
      setBusy(null);
    }
  }, []);

  return { busy, error, goCheckout, goPortal };
}
