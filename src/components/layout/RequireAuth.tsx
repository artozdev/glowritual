import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AppShell } from './AppShell';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';

/**
 * Garde d'accès aux écrans applicatifs.
 *
 * - Auth réelle (Supabase configuré) : redirige vers /auth si non connecté.
 * - Mode démo (pas de Supabase) : ouvre une session de démo de façon
 *   transparente pour que l'app reste pleinement utilisable.
 */
export function RequireAuth() {
  const { user, loading, isConfigured, signInDemo } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && !isConfigured) {
      signInDemo();
    }
  }, [loading, user, isConfigured, signInDemo]);

  if (loading) return <FullScreenLoader />;

  if (!user) {
    // Auth réelle requise → vers la page de connexion (on mémorise la cible).
    if (isConfigured) {
      return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }
    // Mode démo : court instant avant l'activation automatique.
    return <FullScreenLoader />;
  }

  // Onboarding obligatoire tant qu'il n'est pas terminé.
  if (!profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppShell />;
}
