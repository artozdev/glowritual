/**
 * Offre UNIQUE Glow Premium — source de vérité des tarifs (Pricing + upgrade).
 *
 * Deux rythmes de paiement, une seule offre :
 *  • Mensuel : 16 €/mois
 *  • Annuel  : 149 €/an, débité en une fois (≈ 12,42 €/mois, −22 %).
 *
 * ⚠️ Les montants RÉELS débités sont définis par les prix Stripe
 * (STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL). Garder ces valeurs alignées.
 */

export const MONTHLY_PRICE = 16; // €/mois
export const ANNUAL_TOTAL = 149; // € débités en une fois / an
export const ANNUAL_PER_MONTH = Math.round((ANNUAL_TOTAL / 12) * 100) / 100; // ≈ 12,42
/** Économie de l'annuel vs mensuel, en %. */
export const ANNUAL_SAVINGS_PCT = Math.round(
  (1 - ANNUAL_TOTAL / (MONTHLY_PRICE * 12)) * 100,
);

/** Format € sans décimales inutiles (16 € ; 12,42 €). */
export const eur = (n: number) =>
  n % 1 === 0 ? `${n} €` : `${n.toFixed(2).replace('.', ',')} €`;

export interface PremiumFeature {
  label: string;
  /** Fonctionnalité à venir (badge « Bientôt », non encore active). */
  soon?: boolean;
}

/** Tout ce que débloque l'offre unique. */
export const PREMIUM_FEATURES: PremiumFeature[] = [
  { label: 'Re-scans illimités' },
  { label: 'Suivi de progression' },
  { label: 'Routine personnalisée' },
  { label: 'Historique des analyses' },
  { label: 'Recommandations personnalisées (+100 produits)' },
  { label: 'Conseils skincare' },
  { label: 'Conseils hygiène de vie' },
  { label: 'Assistant IA beauté disponible 24h/24', soon: true },
  { label: 'Plan de transformation personnalisé', soon: true },
];
