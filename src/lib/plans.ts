/**
 * Tarifs Premium — source unique (page Pricing + écran d'upgrade).
 *
 * Affichage annuel : 4,99 €/mois (−50 %), mais débité 59,90 €/an en une fois
 * via Stripe (price annuel). L'économie vs mensuel ≈ 60 €/an.
 */

export const MONTHLY_PRICE = 9.99; // €/mois (formule mensuelle)
export const ANNUAL_TOTAL = 59.9; // € débités en une fois / an
export const ANNUAL_PER_MONTH = 4.99; // €/mois équivalent en annuel
/** Économie annuelle vs paiement mensuel (≈ 60 €). */
export const ANNUAL_SAVINGS = Math.round(MONTHLY_PRICE * 12 - ANNUAL_TOTAL);

export const eur = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

/** Avantages Premium (identiques sur les deux formules). */
export const PREMIUM_FEATURES = [
  'Scans illimités',
  'Résultats détaillés débloqués (scores, zones, radar)',
  'Recommandations de produits naturels',
  'Routine automatique + calendrier',
  'Suivi des progrès & timeline avant/après',
];
