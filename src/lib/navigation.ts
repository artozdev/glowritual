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
};

/**
 * Items de navigation principaux (barre inférieure mobile + sidebar desktop).
 * Centralisés ici pour rester cohérents partout.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/scan', label: 'Scan', icon: ScanFace },
  { to: '/routine', label: 'Routine', icon: CalendarHeart },
  { to: '/progress', label: 'Évolution', icon: TrendingUp },
  { to: '/profile', label: 'Profil', icon: User },
];
