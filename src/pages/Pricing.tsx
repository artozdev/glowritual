import { useEffect, useMemo, useState } from 'react';
import { Check, Sparkles, Crown, CreditCard, Leaf, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useAuth } from '@/hooks/useAuth';
import { findCode, userRedemption, redeem } from '@/lib/promoStore';
import { applyDiscount, DISCOUNT_PERCENT } from '@/lib/ambassador';
import { cn } from '@/lib/utils';
import type { PromoCode } from '@/types/promo';

const PREMIUM_PRICE = 6.99;
const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

const FREE_FEATURES = [
  '1 scan offert',
  'Score global & points à sublimer',
  'Routine de base',
];

const PREMIUM_FEATURES = [
  'Scans illimités',
  'Routines illimitées & personnalisées',
  'Suivi détaillé & comparaison avant/après',
  'Rappels planifiés',
  'Nouveaux critères en priorité',
];

export default function Pricing() {
  const { user, upgradeDemo } = useAuth();
  const uid = user?.id ?? null;
  const isPremium = user?.plan === 'premium';

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [applied, setApplied] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const alreadyRedeemed = useMemo(
    () => (uid ? Boolean(userRedemption(uid)) : false),
    [uid],
  );

  // Code dans l'URL → pré-rempli et auto-appliqué s'il est valide.
  useEffect(() => {
    let pending: string | null = null;
    try {
      pending = localStorage.getItem('glow.pending-promo');
    } catch {
      /* ignore */
    }
    if (!pending) return;
    setPromoInput(pending);
    if (!uid) return;
    const pc = findCode(pending);
    if (pc && pc.ambassadorId !== uid && !userRedemption(uid)) setApplied(pc);
  }, [uid]);

  function applyPromo() {
    setPromoError(null);
    const pc = findCode(promoInput);
    if (!pc) {
      setApplied(null);
      return setPromoError('Code introuvable.');
    }
    if (uid && pc.ambassadorId === uid) {
      setApplied(null);
      return setPromoError('Tu ne peux pas utiliser ton propre code.');
    }
    if (uid && userRedemption(uid)) {
      setApplied(null);
      return setPromoError('Tu as déjà utilisé un code promo.');
    }
    setApplied(pc);
  }

  function clearPromo() {
    setApplied(null);
    setPromoInput('');
    setPromoError(null);
  }

  const finalPrice = applied ? applyDiscount(PREMIUM_PRICE) : PREMIUM_PRICE;

  function confirmCheckout() {
    // Attribution + usage unique (vérifié côté store / serveur).
    if (applied && uid) redeem(applied.code, uid);
    upgradeDemo();
    setCheckoutOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <Badge tone="success" className="mx-auto">
          <Sparkles className="h-3 w-3" />
          Offre de lancement
        </Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sage-900">
          Sublimez-vous sans limite
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sage-600">
          Commencez gratuitement, passez en Premium quand vous le souhaitez.
        </p>
      </div>

      {/* Code promo */}
      {!isPremium && (
        <div className="mx-auto mt-6 max-w-md">
          {applied ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-sage-800">
                <Tag className="h-4 w-4 text-sage-500" />
                Code {applied.code} appliqué · −{DISCOUNT_PERCENT} %
              </p>
              <button
                type="button"
                onClick={clearPromo}
                aria-label="Retirer le code"
                className="text-sage-400 hover:text-sage-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className="h-11 flex-1 rounded-2xl border border-beige-200 bg-white px-4 text-sm uppercase tracking-wide text-sage-900 placeholder:text-sage-400 placeholder:normal-case focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-200"
              />
              <Button variant="secondary" onClick={applyPromo} disabled={!promoInput.trim()}>
                Appliquer
              </Button>
            </div>
          )}
          {promoError && (
            <p className="mt-2 text-xs text-red-500">{promoError}</p>
          )}
          {!applied && !promoError && alreadyRedeemed && (
            <p className="mt-2 text-xs text-sage-400">
              Tu as déjà profité d'un code promo (usage unique).
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Gratuit */}
        <div className="flex flex-col rounded-3xl border border-beige-200/70 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-beige-100">
              <Leaf className="h-4 w-4 text-sage-500" />
            </span>
            <h2 className="font-semibold text-sage-900">Gratuit</h2>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-sage-900">
            0 €
          </p>
          <p className="text-sm text-sage-500">Pour découvrir Glow</p>
          <ul className="mt-5 space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-sage-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex-1" />
          <Button variant="secondary" className="w-full" disabled={!isPremium}>
            {isPremium ? 'Revenir au gratuit' : 'Votre plan actuel'}
          </Button>
        </div>

        {/* Premium */}
        <div
          className={cn(
            'relative flex flex-col rounded-3xl border-2 p-6 shadow-soft-lg',
            'border-sage-400 bg-gradient-to-br from-sage-50 to-white',
          )}
        >
          <span className="absolute -top-3 right-6">
            <Badge tone="sage">Recommandé</Badge>
          </span>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-600 text-white">
              <Crown className="h-4 w-4" />
            </span>
            <h2 className="font-semibold text-sage-900">Premium</h2>
          </div>
          <p className="mt-4 flex items-baseline gap-2 text-3xl font-semibold tracking-tight text-sage-900">
            {applied && (
              <span className="text-lg font-normal text-sage-400 line-through">
                {eur(PREMIUM_PRICE)}
              </span>
            )}
            {eur(finalPrice)}
            <span className="text-base font-normal text-sage-500"> / mois</span>
          </p>
          <p className="text-sm text-sage-500">
            {applied
              ? `−${DISCOUNT_PERCENT} % avec le code ${applied.code}`
              : 'Sans engagement'}
          </p>
          <ul className="mt-5 space-y-2.5">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-sage-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex-1" />
          {isPremium ? (
            <Button className="w-full" disabled>
              <Crown className="h-4 w-4" />
              Vous êtes Premium
            </Button>
          ) : (
            <Button className="w-full" onClick={() => setCheckoutOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Passer en Premium
            </Button>
          )}
        </div>
      </div>

      <MedicalDisclaimer className="mt-8" compact />

      {/* Checkout stub (Stripe à brancher) */}
      <Sheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        ariaLabel="Paiement Premium"
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50">
            <CreditCard className="h-6 w-6 text-sage-500" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-sage-900">
            Paiement sécurisé
          </h3>

          {/* Récapitulatif */}
          <div className="mx-auto mt-4 max-w-xs space-y-1.5 rounded-2xl bg-beige-50 p-3 text-sm">
            <div className="flex justify-between text-sage-600">
              <span>Premium / mois</span>
              <span>{eur(PREMIUM_PRICE)}</span>
            </div>
            {applied && (
              <div className="flex justify-between font-medium text-sage-700">
                <span>Code {applied.code} (−{DISCOUNT_PERCENT} %)</span>
                <span>−{eur(PREMIUM_PRICE - finalPrice)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-beige-200 pt-1.5 font-semibold text-sage-900">
              <span>Total</span>
              <span>{eur(finalPrice)}</span>
            </div>
          </div>

          <p className="mx-auto mt-3 max-w-xs text-xs text-sage-500">
            L’intégration Stripe sera branchée ici. Active le mode démo pour
            explorer le Premium.
          </p>
          <Button className="mt-4 w-full" onClick={confirmCheckout}>
            <Crown className="h-4 w-4" />
            Activer Premium (démo)
          </Button>
          <button
            type="button"
            onClick={() => setCheckoutOpen(false)}
            className="mt-3 text-sm font-medium text-sage-500 hover:text-sage-700"
          >
            Plus tard
          </button>
        </div>
      </Sheet>
    </div>
  );
}
