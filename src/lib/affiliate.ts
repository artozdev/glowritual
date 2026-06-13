import { supabase, isSupabaseConfigured } from './supabase';
import type { AffiliateNetwork, Product } from '@/types/products';

/**
 * ════════════════════════════════════════════════════════════════
 *  AFFILIATION — gestion centralisée des liens & du tracking
 * ════════════════════════════════════════════════════════════════
 *  Chaque réseau (Amazon Partenaires, Awin, …) sait construire un lien
 *  tracké à partir de l'URL produit. Interface abstraite → ajouter un
 *  réseau = ajouter un builder dans BUILDERS.
 *
 *  ⚠️ Tags/IDs ci-dessous = placeholders, à remplacer par vos identifiants.
 * ════════════════════════════════════════════════════════════════
 */

const CONFIG = {
  amazonTag: 'glowapp-21', // tag Amazon Partenaires
  awin: { affid: '1234567', mid: '9999' }, // identifiants Awin
};

interface NetworkBuilder {
  readonly id: AffiliateNetwork;
  /** Construit le lien tracké à partir de l'URL produit. */
  build(rawUrl: string): string;
}

const amazonBuilder: NetworkBuilder = {
  id: 'amazon',
  build(rawUrl) {
    const u = new URL(rawUrl);
    u.searchParams.set('tag', CONFIG.amazonTag);
    return u.toString();
  },
};

const awinBuilder: NetworkBuilder = {
  id: 'awin',
  build(rawUrl) {
    return `https://www.awin1.com/cread.php?awinmid=${CONFIG.awin.mid}&awinaffid=${CONFIG.awin.affid}&ued=${encodeURIComponent(rawUrl)}`;
  },
};

const directBuilder: NetworkBuilder = {
  id: 'direct',
  build(rawUrl) {
    return rawUrl;
  },
};

const BUILDERS: Record<AffiliateNetwork, NetworkBuilder> = {
  amazon: amazonBuilder,
  awin: awinBuilder,
  direct: directBuilder,
};

export interface ResolvedAffiliate {
  url: string;
  network: AffiliateNetwork;
}

/**
 * Résout le lien d'achat affilié d'un produit :
 * lien pré-construit s'il existe, sinon construit selon le réseau.
 */
export function resolveAffiliateUrl(product: Product): ResolvedAffiliate {
  const network = product.network ?? 'direct';
  if (product.affiliateUrl) return { url: product.affiliateUrl, network };
  try {
    return { url: BUILDERS[network].build(product.link), network };
  } catch {
    return { url: product.link, network: 'direct' };
  }
}

/* ── Tracking des clics ─────────────────────────────────────────── */

const CLICKS_KEY = 'glow.affiliate-clicks.v1';

export interface AffiliateClick {
  productId: string;
  userId: string | null;
  network: AffiliateNetwork;
  at: string;
}

/** Enregistre un clic affilié (Supabase si dispo, sinon localStorage démo). */
export async function recordAffiliateClick(
  product: Product,
  userId: string | null,
): Promise<void> {
  const network = product.network ?? 'direct';

  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase
        .from('affiliate_clicks')
        .insert({ user_id: userId, product_id: product.id, network });
      return;
    } catch {
      /* repli local */
    }
  }

  try {
    const arr = JSON.parse(
      localStorage.getItem(CLICKS_KEY) ?? '[]',
    ) as AffiliateClick[];
    arr.push({ productId: product.id, userId, network, at: new Date().toISOString() });
    localStorage.setItem(CLICKS_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

/** Clics enregistrés localement (mesure de performance en démo). */
export function getAffiliateClicks(): AffiliateClick[] {
  try {
    return JSON.parse(localStorage.getItem(CLICKS_KEY) ?? '[]') as AffiliateClick[];
  } catch {
    return [];
  }
}
