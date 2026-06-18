import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Settings,
  Loader2,
  ScanFace,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { PremiumOffer } from '@/components/premium/PremiumOffer';
import { useCheckout } from '@/components/premium/useCheckout';
import { useAuth } from '@/hooks/useAuth';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isConfigured, refreshSubscription } = useAuth();
  const { busy, error, goPortal } = useCheckout();
  const [params, setParams] = useSearchParams();

  const isPremium = user?.plan === 'premium';
  const [justSubscribed, setJustSubscribed] = useState(false);

  // Retour de Stripe : on rafraîchit le statut (le webhook peut prendre 1-2 s).
  useEffect(() => {
    const status = params.get('checkout');
    if (!status) return;
    if (status === 'success') {
      let tries = 0;
      const poll = async () => {
        await refreshSubscription();
        tries += 1;
        if (tries < 6) window.setTimeout(poll, 1500);
      };
      void poll();
      setJustSubscribed(true);
    }
    params.delete('checkout');
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-3 py-1 text-xs font-semibold text-forest">
          <Sparkles className="h-3 w-3" />
          Offre de lancement · ~2 mois offerts en annuel
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forest">
          Révèle ton éclat, sans limite
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sage-600">
          Une seule offre, tout compris. Essaie d’abord gratuitement, débloque
          tout avec Glow Premium.
        </p>
      </div>

      {justSubscribed && isPremium && (
        <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-2xl border border-mint bg-mint/30 px-4 py-3 text-sm font-medium text-forest">
          <ShieldCheck className="h-4 w-4" />
          Bienvenue dans Glow Premium ✨ Tout est débloqué.
        </div>
      )}
      {error && (
        <p className="mx-auto mt-6 max-w-md rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {isPremium ? (
        /* Déjà Premium → gestion de l'abonnement */
        <div className="mx-auto mt-8 max-w-md rounded-3xl border-2 border-forest bg-gradient-to-br from-mint/30 to-cream p-6 text-center shadow-soft-lg">
          <h2 className="text-lg font-semibold text-forest">Tu es Premium ✨</h2>
          <p className="mt-1.5 text-sm text-sage-600">
            Merci ! Gère ta formule, ton moyen de paiement ou résilie via le
            portail sécurisé Stripe.
          </p>
          <Button
            className="mt-4 w-full border-0 bg-forest text-white hover:bg-forest-dark"
            onClick={goPortal}
            disabled={busy === 'portal'}
          >
            {busy === 'portal' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            Gérer mon abonnement
          </Button>
        </div>
      ) : (
        <>
          {/* Essai gratuit — une invitation, pas un plan. */}
          <div className="mx-auto mt-8 max-w-md rounded-3xl border border-beige-200 bg-white p-5 text-center shadow-soft">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-forest">
              <Sparkles className="h-4 w-4 text-forest-light" />
              Découvre Glow gratuitement
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-sage-600">
              Fais ton premier scan : tu vois ton score global et le nombre de
              zones détectées. Le reste se débloque avec Premium.
            </p>
            <button
              type="button"
              onClick={() => navigate(user ? '/scan' : '/auth')}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline-offset-4 hover:underline"
            >
              <ScanFace className="h-4 w-4" />
              Faire mon scan gratuit
            </button>
          </div>

          {/* L'offre unique */}
          <div className="mt-8">
            <PremiumOffer />
          </div>
        </>
      )}

      {isConfigured && !isPremium && (
        <p className="mt-6 text-center text-xs text-sage-400">
          Un code ambassadeur ? Saisis-le à l’étape de paiement Stripe.
        </p>
      )}

      <MedicalDisclaimer className="mt-8" compact />
    </div>
  );
}
