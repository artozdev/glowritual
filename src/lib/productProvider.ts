import { PRODUCTS } from '@/data/products';
import { isCompositionSafe } from './ingredientBlacklist';
import type { Product, ProductNeed } from '@/types/products';

/**
 * ════════════════════════════════════════════════════════════════
 *  SERVICE DE RECOMMANDATION PRODUIT — abstraction
 * ════════════════════════════════════════════════════════════════
 *  Le moteur de matching ne dépend QUE de cette interface. On peut
 *  donc échanger la source sans toucher au reste de l'app :
 *
 *   1. localProductProvider     → catalogue interne (par défaut)
 *   2. supabaseProductProvider  → table Supabase `products` (stub)
 *   3. affiliateProductProvider → API marketplace/affiliation (stub)
 *
 *  ⚠️ Aucune source ne fait de scraping HTML : on s'appuie sur des
 *  données structurées (base interne, API officielle).
 * ════════════════════════════════════════════════════════════════
 */
export interface ProductProvider {
  readonly id: string;
  /** Catalogue complet (déjà filtré « composition sûre »). */
  list(): Product[];
  /** Sous-ensemble ciblant un besoin (principal ou secondaire). */
  byNeed(need: ProductNeed): Product[];
}

/**
 * Filet de sécurité GLOBAL : on ne laisse JAMAIS entrer un produit dont
 * la composition contient un ingrédient à risque. Appliqué à la source.
 */
const SAFE_PRODUCTS: Product[] = PRODUCTS.filter((p) =>
  isCompositionSafe(p.ingredients),
);

function matchesNeed(product: Product, need: ProductNeed): boolean {
  return product.need === need || (product.alsoHelps?.includes(need) ?? false);
}

/** Source par défaut : catalogue interne contrôlé. */
export const localProductProvider: ProductProvider = {
  id: 'local',
  list: () => SAFE_PRODUCTS,
  byNeed: (need) => SAFE_PRODUCTS.filter((p) => matchesNeed(p, need)),
};

/**
 * STUB — Provider Supabase (table `products`).
 * À implémenter à l'étape de branchement : charger la table en mémoire
 * (filtrée par `isCompositionSafe`) puis exposer la même interface.
 */
export function createSupabaseProductProvider(
  catalog: Product[],
): ProductProvider {
  const safe = catalog.filter((p) => isCompositionSafe(p.ingredients));
  return {
    id: 'supabase',
    list: () => safe,
    byNeed: (need) => safe.filter((p) => matchesNeed(p, need)),
  };
}

/**
 * STUB — Provider API d'affiliation / marketplace.
 * Brancher derrière la même interface (préchargement → cache mémoire).
 */
export function createAffiliateProductProvider(): ProductProvider {
  throw new Error(
    'affiliateProductProvider : non implémenté (brancher une API officielle).',
  );
}

/** Provider actif (par défaut : local). */
export function getProductProvider(): ProductProvider {
  return localProductProvider;
}
