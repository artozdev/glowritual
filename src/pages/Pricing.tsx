import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Crown,
  Leaf,
  Sparkles,
  Loader2,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useAuth } from '@/hooks/useAuth';
import { startCheckout, openBillingPortal, type BillingInterval } from '@/lib/stripeClient';
import { cn } from '@/lib/utils';

/* ── Tarifs (centralisés) ──────────────────────────────────────── */
const MONTHLY = 9.99; // €/mois en mensuel
const ANNUAL_TOTAL = 59.9; // € facturés en une fois
const ANNUAL_PER_MONTH = 4.99; // €/mois équivalent en annuel
const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

const FREE_FEATURES = [
  { label: '1 scan facial offert', ok: true },
  { label: 'Aperçu de l’application', ok: true },
  { label: 'Résultats complets (scores, zones, routine)', ok: false },
];

const PREMIUM_FEATURES = [
  'Scans illimités',
  'Résultats complets débloqués (scores, points, radar)',
  'Analyse détaillée zone par zone',
  'Recommandations de produits naturels',
  'Routine automatique + calendrier',
  'Suivi des progrès & timeline avant/après',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isConfigured, refreshSubscription } = useAuth();
  const [params, setParams] = useSearchParams();

  const isPremium = user?.plan === 'premium';
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [busy, setBusy] = useState<null | 'checkout' | 'portal'>(null);
  const [error, setError] = useState<string | null>(null);
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
    // Nettoie le paramètre d'URL.
    params.delete('checkout');
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function goPremium() {
    setError(null);
    if (!user) {
      navigate('/auth', { state: { from: '/pricing', mode: 'signup' } });
      return;
    }
    setBusy('checkout');
    try {
      await startCheckout(interval);
    } catch (e) {
      setError(
        (e as Error).message ||
          'Le paiement n’est pas encore disponible. Réessayez plus tard.',
      );
      setBusy(null);
    }
  }

  async function manage() {
    setError(null);
    setBusy('portal');
    try {
      await openBillingPortal();
    } catch (e) {
      setError((e as Error).message || 'Portail indisponible pour le moment.');
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
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

      {/* Bandeau succès après paiement */}
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

      <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-2">
        {/* ── Gratuit ─────────────────────────────────────────── */}
        <div className="flex flex-col rounded-3xl border border-beige-200/70 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand">
              <Leaf className="h-4 w-4 text-forest" />
            </span>
            <h2 className="font-semibold text-forest">Gratuit</h2>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-forest">
            0 €
          </p>
          <p className="text-sm text-sage-500">Pour découvrir Glow</p>

          <ul className="mt-5 space-y-2.5">
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
            disabled={!!user && !isPremium}
            onClick={() => navigate(user ? '/scan' : '/auth')}
          >
            {user
              ? isPremium
                ? 'Inclus dans Premium'
                : 'Votre plan actuel'
              : 'Commencer gratuitement'}
          </Button>
        </div>

        {/* ── Premium ─────────────────────────────────────────── */}
        <div className="relative flex flex-col rounded-3xl border-2 border-forest bg-gradient-to-br from-mint/30 to-cream p-6 shadow-soft-lg">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white shadow-soft">
              <Crown className="h-3 w-3 text-gold" />
              Recommandé
            </span>
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-gold">
                <Crown className="h-4 w-4" />
              </span>
              <h2 className="font-semibold text-forest">Premium</h2>
            </div>
          </div>

          {/* Switch Mensuel / Annuel */}
          <div className="mt-4 inline-flex self-start rounded-full bg-white/70 p-1 text-xs font-medium shadow-soft">
            {(['monthly', 'annual'] as BillingInterval[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setInterval(opt)}
                className={cn(
                  'rounded-full px-3 py-1.5 transition-colors',
                  interval === opt
                    ? 'bg-forest text-white shadow-soft'
                    : 'text-forest/70 hover:text-forest',
                )}
              >
                {opt === 'monthly' ? 'Mensuel' : 'Annuel'}
                {opt === 'annual' && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      interval === 'annual'
                        ? 'bg-gold text-forest'
                        : 'bg-gold/30 text-forest',
                    )}
                  >
                    −50 %
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Prix */}
          <div className="mt-4 min-h-[78px]">
            {interval === 'annual' ? (
              <motion.div
                key="annual"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-forest">
                    {eur(ANNUAL_PER_MONTH)}
                  </span>
                  <span className="text-base font-normal text-sage-500">
                    / mois
                  </span>
                  <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-forest">
                    Économise 50 %
                  </span>
                </p>
                <p className="mt-1 text-sm text-sage-500">
                  soit <strong className="text-forest">{eur(ANNUAL_TOTAL)}</strong>{' '}
                  facturés une fois par an
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="monthly"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-forest">
                    {eur(MONTHLY)}
                  </span>
                  <span className="text-base font-normal text-sage-500">
                    / mois
                  </span>
                </p>
                <p className="mt-1 text-sm text-sage-500">
                  Sans engagement, résiliable à tout moment
                </p>
              </motion.div>
            )}
          </div>

          <ul className="mt-4 space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-sage-800">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-forest">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex-1" />
          {isPremium ? (
            <Button
              className="w-full bg-forest text-white hover:bg-forest-dark"
              onClick={manage}
              disabled={busy === 'portal'}
            >
              {busy === 'portal' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Gérer mon abonnement
            </Button>
          ) : (
            <Button
              className="w-full border-0 bg-gold text-forest hover:bg-gold-soft"
              onClick={goPremium}
              disabled={busy === 'checkout'}
            >
              {busy === 'checkout' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Passer au Premium
            </Button>
          )}
          <p className="mt-2 text-center text-[11px] text-sage-400">
            Paiement sécurisé par Stripe · {interval === 'annual' ? `${eur(ANNUAL_TOTAL)} / an` : `${eur(MONTHLY)} / mois`}
          </p>
        </div>
      </div>

      {isConfigured && (
        <p className="mt-6 text-center text-xs text-sage-400">
          Un code ambassadeur ? Saisissez-le à l’étape de paiement Stripe.
        </p>
      )}

      <MedicalDisclaimer className="mt-8" compact />
    </div>
  );
}
