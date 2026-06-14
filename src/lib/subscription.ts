import { supabase } from '@/lib/supabase';

/**
 * Statut d'abonnement Premium.
 *
 * La table `subscriptions` est écrite UNIQUEMENT par le webhook Stripe
 * (service role) et l'utilisateur ne peut que la LIRE → c'est la source de
 * vérité « côté serveur » du statut Premium (impossible à forger côté client).
 */

export interface SubscriptionInfo {
  premium: boolean;
  status: string | null;
  interval: string | null;
  currentPeriodEnd: string | null;
}

const NONE: SubscriptionInfo = {
  premium: false,
  status: null,
  interval: null,
  currentPeriodEnd: null,
};

/** Un statut Stripe donne-t-il droit au Premium ? */
export function isPremiumStatus(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}

/** Lit l'abonnement de l'utilisateur (best-effort). */
export async function fetchSubscription(
  userId: string,
): Promise<SubscriptionInfo> {
  if (!supabase) return NONE;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, plan_interval, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return NONE;
  return {
    premium: isPremiumStatus(data.status),
    status: data.status,
    interval: data.plan_interval,
    currentPeriodEnd: data.current_period_end,
  };
}
