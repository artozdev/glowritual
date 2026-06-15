import type { ReactNode } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { UpgradeScreen, type PremiumFeature } from './UpgradeScreen';

/**
 * Garde une section réservée au Premium.
 *
 * En gratuit (statut vérifié côté serveur via `subscriptions`), affiche
 * l'écran d'upgrade À LA PLACE de la section — y compris en accès direct
 * par URL. En Premium (ou en mode démo), laisse passer.
 */
export function PremiumOnly({
  feature,
  children,
}: {
  feature: PremiumFeature;
  children: ReactNode;
}) {
  const { locked } = usePremium();
  if (locked) return <UpgradeScreen feature={feature} />;
  return <>{children}</>;
}
