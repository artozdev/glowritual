import { useState } from 'react';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useCheckout } from './useCheckout';
import {
  MONTHLY_PRICE,
  ANNUAL_TOTAL,
  ANNUAL_PER_MONTH,
  ANNUAL_SAVINGS_PCT,
  PREMIUM_FEATURES,
  eur,
} from '@/lib/plans';
import { cn } from '@/lib/utils';
import type { BillingInterval } from '@/lib/stripeClient';

/**
 * Offre UNIQUE Glow Premium : un seul produit, deux rythmes de paiement
 * (annuel mis en avant). Liste d'avantages partagée, avec badge « Bientôt »
 * pour les fonctionnalités à venir (clic → message « arrive bientôt »).
 */
export function PremiumOffer() {
  const { busy, error, goCheckout } = useCheckout();
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [soonOpen, setSoonOpen] = useState(false);
  const loading = busy === 'monthly' || busy === 'annual';

  const RHYTHMS: {
    id: BillingInterval;
    label: string;
    price: string;
    note: string;
    badge?: string;
  }[] = [
    {
      id: 'annual',
      label: 'Annuel',
      price: `${eur(ANNUAL_TOTAL)} / an`,
      note: `soit ${eur(ANNUAL_PER_MONTH)} / mois · environ 2 mois offerts`,
      badge: `Économisez ${ANNUAL_SAVINGS_PCT} %`,
    },
    {
      id: 'monthly',
      label: 'Mensuel',
      price: `${eur(MONTHLY_PRICE)} / mois`,
      note: 'Sans engagement, annulable à tout moment',
    },
  ];

  return (
    <div className="mx-auto max-w-md">
      <div className="relative rounded-3xl border-2 border-forest bg-gradient-to-br from-mint/30 to-cream p-6 shadow-soft-lg">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white shadow-soft">
            <Crown className="h-3 w-3 text-gold" />
            Glow Premium
          </span>
        </span>

        {/* Rythmes de paiement (les deux visibles, annuel par défaut) */}
        <div className="mt-3 grid gap-2.5">
          {RHYTHMS.map((r) => {
            const selected = interval === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setInterval(r.id)}
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 bg-white/70 p-3.5 text-left transition-all',
                  selected
                    ? 'border-gold ring-2 ring-gold/30'
                    : 'border-transparent hover:border-forest/15',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    selected ? 'border-gold bg-gold' : 'border-forest/25',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-forest" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-forest">{r.label}</span>
                    {r.badge && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-forest">
                        {r.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-lg font-bold text-forest">{r.price}</span>
                  <span className="block text-xs text-sage-600">{r.note}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Avantages débloqués */}
        <ul className="mt-5 space-y-2.5">
          {PREMIUM_FEATURES.map((f) =>
            f.soon ? (
              <li key={f.label}>
                <button
                  type="button"
                  onClick={() => setSoonOpen(true)}
                  className="flex w-full items-start gap-2 text-left text-sm text-sage-700"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/30">
                    <Sparkles className="h-2.5 w-2.5 text-gold" />
                  </span>
                  <span>
                    {f.label}{' '}
                    <span className="ml-0.5 rounded-full bg-gold/25 px-1.5 py-0.5 text-[10px] font-bold text-forest">
                      Bientôt
                    </span>
                  </span>
                </button>
              </li>
            ) : (
              <li key={f.label} className="flex items-start gap-2 text-sm text-sage-800">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-forest">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                {f.label}
              </li>
            ),
          )}
        </ul>

        {error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          className="mt-6 w-full border-0 bg-gold text-forest hover:bg-gold-soft"
          onClick={() => goCheckout(interval)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crown className="h-4 w-4" />
          )}
          Passer au Premium
        </Button>
        <p className="mt-2 text-center text-[11px] text-sage-400">
          Paiement sécurisé Stripe ·{' '}
          {interval === 'annual'
            ? `${eur(ANNUAL_TOTAL)} / an`
            : `${eur(MONTHLY_PRICE)} / mois`}
        </p>
      </div>

      {/* Message « fonctionnalité à venir » */}
      <Sheet open={soonOpen} onClose={() => setSoonOpen(false)} ariaLabel="Bientôt disponible">
        <div className="py-2 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20">
            <Sparkles className="h-6 w-6 text-gold" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-forest">
            Cette fonctionnalité arrive bientôt
          </h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-sage-600">
            Elle est en préparation (phase bêta). Tu seras notifié·e dès son
            lancement 🌿
          </p>
          <Button className="mt-5 w-full" onClick={() => setSoonOpen(false)}>
            J’ai hâte !
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
