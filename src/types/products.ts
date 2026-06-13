import type { ProductNeed } from './domain';
import type { SkinType } from './profile';

export type { ProductNeed };

/* ── Catalogue produit ──────────────────────────────────────────── */

export type ProductCategory =
  | 'cream'
  | 'serum'
  | 'oil'
  | 'balm'
  | 'mask'
  | 'supplement'
  | 'tool'
  | 'wellness';

/** Genre ciblé par un produit (ou universel). */
export type ProductGender = 'female' | 'male' | 'all';

/** Réseau d'affiliation pour monétiser une recommandation. */
export type AffiliateNetwork = 'amazon' | 'awin' | 'direct';

/** Label de confiance naturel / bio. */
export type NaturalLabel =
  | 'Cosmébio'
  | 'Ecocert'
  | 'COSMOS Organic'
  | 'Bio'
  | 'Vegan'
  | 'Cruelty-free'
  | 'Slow Cosmétique';

export interface KeyIngredient {
  /** Nom de l'actif (ex. « Acide hyaluronique végétal »). */
  name: string;
  /** Ce qu'il apporte (ex. « retient l'eau dans l'épiderme »). */
  benefit: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  /** Besoin principal ciblé. */
  need: ProductNeed;
  /** Besoins secondaires éventuels. */
  alsoHelps?: ProductNeed[];
  price: number; // €
  rating: number; // 0..5
  reviewCount: number;
  labels: NaturalLabel[];
  imageUrl: string;
  link: string;
  /** Composition normalisée (tokens en minuscules). */
  ingredients: string[];
  keyIngredients: KeyIngredient[];
  /** Mode + fréquence d'application. */
  application: string;
  /** Types de peau adaptés (vide = tous). */
  skinTypes?: SkinType[];
  gender?: ProductGender;
  vegan?: boolean;
  /** Code-barres pour vérification Open Beauty Facts (optionnel). */
  barcode?: string;
  /** Réseau d'affiliation associé (défaut : direct). */
  network?: AffiliateNetwork;
  /** Lien affilié pré-construit (sinon généré par lib/affiliate.ts). */
  affiliateUrl?: string;
}

/** Recommandation produit retournée par le moteur de matching. */
export interface ProductRecommendation {
  product: Product;
  /** Explication personnalisée : besoin → actif → effet → application. */
  reason: string;
  /** Score de pertinence interne (tri). */
  matchScore: number;
}
