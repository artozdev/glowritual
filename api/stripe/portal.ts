import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe, supabaseAdmin, getUser, siteUrl } from '../_lib/clients';

/**
 * POST /api/stripe/portal
 * Ouvre le portail client Stripe (gérer / changer / résilier l'abonnement).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const { data } = await supabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const customer = data?.stripe_customer_id as string | undefined;
    if (!customer) return res.status(400).json({ error: 'Aucun abonnement trouvé' });

    const session = await getStripe().billingPortal.sessions.create({
      customer,
      return_url: `${siteUrl(req)}/profile`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
