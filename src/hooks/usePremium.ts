import { useAuth } from '@/hooks/useAuth';

/**
 * Statut Premium pour le verrouillage de l'app.
 *
 * `isPremium` provient de la table Supabase `subscriptions` (écrite par le
 * webhook Stripe, lecture seule côté client) → vérification côté serveur.
 *
 * `locked` = vrai quand l'utilisateur n'a PAS le Premium et que le backend
 * est configuré. En mode démo (sans Supabase), rien n'est verrouillé.
 */
export function usePremium(): { isPremium: boolean; locked: boolean } {
  const { user, isConfigured } = useAuth();
  const isPremium = user?.plan === 'premium';
  return { isPremium, locked: isConfigured && !isPremium };
}
