import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest } from '@vercel/node';

/**
 * Clients partagés des fonctions serveur Stripe (Vercel Functions).
 *
 * ⚠️ Ce dossier /api ne tourne QUE côté serveur (Vercel). Les secrets
 * (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY…) ne sont jamais expédiés
 * au navigateur. Ne jamais importer ce module depuis /src.
 */

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

/** Client Supabase « service role » (bypass RLS) — pour le webhook. */
export function supabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Vérifie le JWT Supabase (header Authorization) → utilisateur, ou null. */
export async function getUser(
  req: VercelRequest,
): Promise<{ id: string; email: string | null } | null> {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

/** Price ID Stripe selon l'intervalle choisi. */
export function priceFor(interval: string): string | null {
  if (interval === 'annual') return process.env.STRIPE_PRICE_ANNUAL ?? null;
  if (interval === 'monthly') return process.env.STRIPE_PRICE_MONTHLY ?? null;
  return null;
}

/** URL du site (pour les redirections success/cancel/return). */
export function siteUrl(req: VercelRequest): string {
  return (
    process.env.SITE_URL ||
    (req.headers.origin as string) ||
    'https://glow-k429.vercel.app'
  );
}
