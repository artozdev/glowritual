import {
  ScanFace,
  CalendarHeart,
  TrendingUp,
  User,
  Home,
  LayoutDashboard,
  Sparkles,
  ShoppingBag,
  Bot,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/**
 * Navigation centralisée — source unique pour les deux expériences :
 *  • MOBILE_TABS : barre d'onglets du bas (app mobile), Scan au centre.
 *  • SIDEBAR_NAV : arbre de la sidebar du dashboard (desktop), avec sous-menus.
 *
 * Le Scan reste gratuit (l'« aha moment ») ; Routine, Progrès et
 * Recommandations sont Premium (statut vérifié côté serveur).
 */

export interface MobileTab {
  to: string;
  label: string;
  icon: LucideIcon;
  premium?: boolean;
  /** Onglet central proéminent (le Scan). */
  center?: boolean;
}

/** Onglets mobiles, dans l'ordre d'affichage (Scan au centre). */
export const MOBILE_TABS: MobileTab[] = [
  { to: '/home', label: 'Accueil', icon: Home },
  { to: '/routine', label: 'Routine', icon: CalendarHeart, premium: true },
  { to: '/scan', label: 'Scan', icon: ScanFace, center: true },
  { to: '/progress', label: 'Progrès', icon: TrendingUp, premium: true },
  { to: '/profile', label: 'Profil', icon: User },
];

export interface SidebarSub {
  to: string;
  label: string;
}

export interface SidebarItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  premium?: boolean;
  /** Sous-menu dépliable. */
  children?: SidebarSub[];
}

/** Arbre de navigation de la sidebar desktop. */
export const SIDEBAR_NAV: SidebarItem[] = [
  { to: '/home', label: 'Accueil', icon: LayoutDashboard },
  {
    label: 'Mon analyse',
    icon: ScanFace,
    to: '/results',
    children: [
      { to: '/results#zones', label: 'Peau' },
      { to: '/results#zones', label: 'Yeux & cernes' },
      { to: '/results#zones', label: 'Sourcils' },
      { to: '/results#zones', label: 'Lèvres' },
      { to: '/results#zones', label: 'Joues' },
      { to: '/results#zones', label: 'Mâchoire' },
      { to: '/results#zones', label: 'Menton' },
      { to: '/results#zones', label: 'Cou' },
      { to: '/results#zones', label: 'Cheveux' },
    ],
  },
  { to: '/results#routine', label: 'Mon protocole', icon: Sparkles },
  { to: '/routine', label: 'Routine & Calendrier', icon: CalendarHeart, premium: true },
  { to: '/progress', label: 'Progrès', icon: TrendingUp, premium: true },
  { to: '/recommendations', label: 'Recommandations', icon: ShoppingBag, premium: true },
  { to: '/assistant', label: 'Assistant IA', icon: Bot },
  { to: '/profile', label: 'Paramètres', icon: Settings },
];
