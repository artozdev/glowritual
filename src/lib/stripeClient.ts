import { supabase } from '@/lib/supabase';

/**
 * Client des fonctions serveur Stripe (Vercel Functions sous /api/stripe).
 *
 * Le frontend ne manipule JAMAIS la clé secrète Stripe : il appelle nos
 * fonctions serveur en transmettant le JWT Supabase de l'utilisateur, et
 * celles-ci créent la session Checkout / le portail côté serveur.
 */

export type BillingInterval = 'monthly' | 'annual';

async function authedPost<T>(path: string, body: unknown): Promise<T> {
  if (!supabase) throw new Error('Supabase non configuré.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Vous devez être connecté.');

  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `Erreur serveur (${res.status}).`);
  }
  return (await res.json()) as T;
}

/** Lance le Checkout Stripe pour l'intervalle choisi → redirige vers Stripe. */
export async function startCheckout(interval: BillingInterval): Promise<void> {
  const { url } = await authedPost<{ url: string }>('/api/stripe/checkout', {
    interval,
  });
  window.location.href = url;
}

/** Ouvre le portail client Stripe (gérer / résilier l'abonnement). */
export async function openBillingPortal(): Promise<void> {
  const { url } = await authedPost<{ url: string }>('/api/stripe/portal', {});
  window.location.href = url;
}
