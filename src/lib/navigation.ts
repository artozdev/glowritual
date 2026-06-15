import {
  ScanFace,
  CalendarHeart,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Section réservée au Premium (cadenas en gratuit + écran d'upgrade). */
  premium?: boolean;
};

/**
 * Items de navigation principaux (barre inférieure mobile + sidebar desktop).
 * Centralisés ici pour rester cohérents partout.
 *
 * Le Scan reste gratuit (l'« aha moment ») ; Routine et Évolution sont
 * réservés au Premium. Le Profil reste accessible (gestion du compte).
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/scan', label: 'Scan', icon: ScanFace },
  { to: '/routine', label: 'Routine', icon: CalendarHeart, premium: true },
  { to: '/progress', label: 'Évolution', icon: TrendingUp, premium: true },
  { to: '/profile', label: 'Profil', icon: User },
];
