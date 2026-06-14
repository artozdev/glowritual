import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe, supabaseAdmin, getUser, priceFor, siteUrl } from '../_lib/clients';

/**
 * POST /api/stripe/checkout  { interval: 'monthly' | 'annual' }
 * Crée une session Stripe Checkout (abonnement) et renvoie son URL.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const body = (req.body ?? {}) as { interval?: string };
    const price = priceFor(body.interval ?? 'annual');
    if (!price) return res.status(400).json({ error: 'Prix non configuré (STRIPE_PRICE_*)' });

    const stripe = getStripe();
    const admin = supabaseAdmin();

    // Réutilise le client Stripe existant, sinon en crée un.
    const { data: existing } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customer = existing?.stripe_customer_id as string | undefined;
    if (!customer) {
      const created = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customer = created.id;
      await admin
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: customer });
    }

    const base = siteUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${base}/pricing?checkout=success`,
      cancel_url: `${base}/pricing?checkout=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
