import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { stripe, supabaseAdmin } from '../_lib/clients';

/**
 * POST /api/stripe/webhook
 * Reçoit les événements Stripe et met à jour la table `subscriptions`.
 *
 * Événements gérés :
 *   - checkout.session.completed       → activation
 *   - customer.subscription.updated    → maj statut / période
 *   - customer.subscription.deleted    → résiliation
 *
 * La signature est vérifiée sur le corps BRUT (bodyParser désactivé).
 */
export const config = { api: { bodyParser: false } };

/** Lit le corps brut de la requête (nécessaire à la vérif de signature). */
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  // Selon la config runtime, le corps peut déjà être présent.
  const anyReq = req as unknown as { body?: unknown };
  if (Buffer.isBuffer(anyReq.body)) return anyReq.body;
  if (typeof anyReq.body === 'string') return Buffer.from(anyReq.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/** Retrouve l'utilisateur via l'id client Stripe (fallback). */
async function userIdByCustomer(
  admin: SupabaseClient,
  customerId: string,
): Promise<string | null> {
  const { data } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return (data?.user_id as string) ?? null;
}

/** Écrit/maj la ligne `subscriptions` à partir d'un objet Subscription Stripe. */
async function upsertSubscription(
  admin: SupabaseClient,
  userId: string | null,
  subscription: Stripe.Subscription,
): Promise<void> {
  if (!userId) return;
  const item = subscription.items?.data?.[0];
  const customer =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null;

  await admin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customer,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: item?.price?.id ?? null,
    plan_interval: item?.price?.recurring?.interval ?? null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig as string, secret);
  } catch (err) {
    return res.status(400).send(`Webhook signature error: ${(err as Error).message}`);
  }

  const admin = supabaseAdmin();
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ||
          (session.metadata?.user_id as string | undefined) ||
          null;
        if (session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(admin, userId, subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id ?? '';
        const userId =
          (subscription.metadata?.user_id as string | undefined) ||
          (await userIdByCustomer(admin, customerId));
        await upsertSubscription(admin, userId, subscription);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    // 500 → Stripe réessaiera l'événement.
    return res.status(500).json({ error: (e as Error).message });
  }

  return res.status(200).json({ received: true });
}
