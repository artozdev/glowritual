import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Leaf, Sparkles, ShieldCheck, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { PremiumPlanCard } from '@/components/premium/PremiumPlanCard';
import { useCheckout } from '@/components/premium/useCheckout';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  { label: '1 scan facial offert', ok: true },
  { label: 'Aperçu de l’application', ok: true },
  { label: 'Résultats complets (scores, zones, routine)', ok: false },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isConfigured, refreshSubscription } = useAuth();
  const { busy, error, goCheckout, goPortal } = useCheckout();
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
    <div className="mx-auto max-w-4xl">
      <div className="text-center">
        <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-3 py-1 text-xs font-semibold text-forest">
          <Sparkles className="h-3 w-3" />
          Offre de lancement · −50 % en annuel
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forest">
          Révélez votre éclat, sans limite
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sage-600">
          Commencez gratuitement. Débloquez votre analyse complète et vos
          routines avec Glow Premium.
        </p>
      </div>

      {justSubscribed && isPremium && (
        <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-2xl border border-mint bg-mint/30 px-4 py-3 text-sm font-medium text-forest">
          <ShieldCheck className="h-4 w-4" />
          Bienvenue dans Glow Premium ✨ Votre analyse est débloquée.
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
        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-3">
          {/* Gratuit */}
          <div className="flex flex-col rounded-3xl border border-beige-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand">
                <Leaf className="h-4 w-4 text-forest" />
              </span>
              <h2 className="font-semibold text-forest">Gratuit</h2>
            </div>
            <p className="mt-4 text-4xl font-bold tracking-tight text-forest">0 €</p>
            <p className="mt-1 text-sm text-sage-500">Pour découvrir Glow</p>
            <ul className="mt-4 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li
                  key={f.label}
                  className={cn(
                    'flex items-start gap-2 text-sm',
                    f.ok ? 'text-sage-700' : 'text-sage-400',
                  )}
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      f.ok ? 'text-forest' : 'text-beige-300',
                    )}
                  />
                  {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex-1" />
            <Button
              variant="secondary"
              className="w-full"
              disabled={!!user}
              onClick={() => navigate(user ? '/scan' : '/auth')}
            >
              {user ? 'Votre plan actuel' : 'Commencer gratuitement'}
            </Button>
          </div>

          {/* Premium Mensuel */}
          <PremiumPlanCard
            interval="monthly"
            busy={busy === 'monthly'}
            disabled={busy !== null}
            onSelect={() => goCheckout('monthly')}
          />

          {/* Premium Annuel (mis en avant) */}
          <PremiumPlanCard
            interval="annual"
            busy={busy === 'annual'}
            disabled={busy !== null}
            onSelect={() => goCheckout('annual')}
          />
        </div>
      )}

      {isConfigured && !isPremium && (
        <p className="mt-6 text-center text-xs text-sage-400">
          Un code ambassadeur ? Saisissez-le à l’étape de paiement Stripe.
        </p>
      )}

      <MedicalDisclaimer className="mt-8" compact />
    </div>
  );
}
