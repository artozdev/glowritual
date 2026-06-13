import {
  findBlacklistedIngredients,
  type BlacklistEntry,
} from './ingredientBlacklist';

/**
 * Connecteur Open Beauty Facts (API publique, gratuite, sans clé).
 * https://world.openbeautyfacts.org
 *
 * Usage : VÉRIFIER / ENRICHIR la composition d'un produit (via son code-barres)
 * et filtrer automatiquement les ingrédients à risque. Best-effort : en cas
 * d'indisponibilité réseau, on retombe proprement sur la composition interne.
 */

const OBF_BASE = 'https://world.openbeautyfacts.org/api/v2/product';

export interface OBFResult {
  found: boolean;
  ingredients: string[];
  productName?: string;
  source: 'openbeautyfacts' | 'unavailable';
}

/** Récupère la composition d'un produit OBF par code-barres (avec timeout). */
export async function fetchOpenBeautyFactsProduct(
  barcode: string,
  timeoutMs = 6000,
): Promise<OBFResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${OBF_BASE}/${encodeURIComponent(
      barcode,
    )}.json?fields=product_name,ingredients_tags,ingredients_text`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { found: false, ingredients: [], source: 'unavailable' };

    const data = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        ingredients_tags?: string[];
        ingredients_text?: string;
      };
    };

    if (data.status !== 1 || !data.product) {
      return { found: false, ingredients: [], source: 'unavailable' };
    }

    // Préfère les tags structurés ; sinon découpe le texte libre.
    const tags = (data.product.ingredients_tags ?? []).map((t) =>
      t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' '),
    );
    const fromText = (data.product.ingredients_text ?? '')
      .split(/[,•;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const ingredients = tags.length ? tags : fromText;
    return {
      found: ingredients.length > 0,
      ingredients,
      productName: data.product.product_name,
      source: 'openbeautyfacts',
    };
  } catch {
    return { found: false, ingredients: [], source: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}

export interface CompositionVerdict {
  /** Composition jugée saine (aucun ingrédient à risque trouvé). */
  safe: boolean;
  blacklisted: BlacklistEntry[];
  /** D'où vient la vérification. */
  verifiedVia: 'openbeautyfacts' | 'internal';
}

/**
 * Vérifie la composition d'un produit.
 * - Si un code-barres est fourni → tente Open Beauty Facts.
 * - Sinon (ou en cas d'échec) → vérifie la composition interne fournie.
 *
 * On applique TOUJOURS la liste noire : un produit n'est jamais recommandé
 * avec une composition inconnue ou contenant un ingrédient à risque.
 */
export async function verifyComposition(
  internalIngredients: string[],
  barcode?: string,
): Promise<CompositionVerdict> {
  if (barcode) {
    const obf = await fetchOpenBeautyFactsProduct(barcode);
    if (obf.found) {
      const blacklisted = findBlacklistedIngredients(obf.ingredients);
      return {
        safe: blacklisted.length === 0,
        blacklisted,
        verifiedVia: 'openbeautyfacts',
      };
    }
  }
  const blacklisted = findBlacklistedIngredients(internalIngredients);
  return {
    safe: blacklisted.length === 0,
    blacklisted,
    verifiedVia: 'internal',
  };
}
