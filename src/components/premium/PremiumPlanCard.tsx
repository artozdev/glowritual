import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  MONTHLY_PRICE,
  ANNUAL_TOTAL,
  ANNUAL_PER_MONTH,
  ANNUAL_SAVINGS,
  PREMIUM_FEATURES,
  eur,
} from '@/lib/plans';
import { cn } from '@/lib/utils';
import type { BillingInterval } from '@/lib/stripeClient';

interface Props {
  interval: BillingInterval;
  /** Cette formule est en cours de redirection vers Stripe. */
  busy?: boolean;
  /** Un autre paiement est en cours (désactive le bouton). */
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Carte d'une formule Premium. L'annuel est mis en avant (« Meilleure offre »,
 * bordure dorée, léger surdimensionnement) ; le débit reste 59,90 €/an en une
 * fois côté Stripe.
 */
export function PremiumPlanCard({ interval, busy, disabled, onSelect }: Props) {
  const annual = interval === 'annual';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-3xl p-6',
        annual
          ? 'border-2 border-gold bg-gradient-to-br from-mint/30 to-cream shadow-glow lg:-translate-y-1'
          : 'border border-beige-200 bg-white shadow-soft',
      )}
    >
      {annual && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-forest shadow-soft">
            <Sparkles className="h-3 w-3" />
            Meilleure offre
          </span>
        </span>
      )}

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl',
            annual ? 'bg-forest text-gold' : 'bg-sand text-forest',
          )}
        >
          <Crown className="h-4 w-4" />
        </span>
        <h2 className="font-semibold text-forest">
          Premium {annual ? 'Annuel' : 'Mensuel'}
        </h2>
      </div>

      {/* Prix */}
      <div className="mt-4 min-h-[84px]">
        {annual ? (
          <>
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-forest">
                {eur(ANNUAL_PER_MONTH)}
              </span>
              <span className="text-base font-normal text-sage-500">/ mois</span>
              <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-forest">
                −50 %
              </span>
            </p>
            <p className="mt-1 text-sm text-sage-600">
              soit <strong className="text-forest">{eur(ANNUAL_TOTAL)}</strong>{' '}
              facturés une fois par an
            </p>
            <p className="mt-1 text-sm font-medium text-forest">
              💚 Économise {ANNUAL_SAVINGS} € par an
            </p>
          </>
        ) : (
          <>
            <p className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-forest">
                {eur(MONTHLY_PRICE)}
              </span>
              <span className="text-base font-normal text-sage-500">/ mois</span>
            </p>
            <p className="mt-1 text-sm text-sage-600">
              Sans engagement, annulable à tout moment
            </p>
          </>
        )}
      </div>

      {annual && (
        <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs italic text-sage-600">
          L’engagement de celles et ceux qui veulent vraiment des résultats.
        </p>
      )}

      <ul className="mt-4 space-y-2.5">
        {PREMIUM_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-sage-800">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                annual ? 'bg-forest' : 'bg-sage-500',
              )}
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1" />
      <Button
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          'w-full',
          annual
            ? 'border-0 bg-gold text-forest hover:bg-gold-soft'
            : 'bg-forest text-white hover:bg-forest-dark',
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Crown className="h-4 w-4" />
        )}
        {annual ? 'Choisir l’annuel' : 'Choisir le mensuel'}
      </Button>
      <p className="mt-2 text-center text-[11px] text-sage-400">
        Paiement sécurisé Stripe ·{' '}
        {annual ? `${eur(ANNUAL_TOTAL)} / an` : `${eur(MONTHLY_PRICE)} / mois`}
      </p>
    </div>
  );
}
