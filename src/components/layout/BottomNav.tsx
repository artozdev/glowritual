import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { usePremium } from '@/hooks/usePremium';
import { cn } from '@/lib/utils';

/**
 * Barre de navigation inférieure — visible uniquement sur mobile.
 * Respecte la safe-area iOS (encoche / barre home).
 *
 * Les onglets Premium restent visibles en gratuit (pour donner envie) mais
 * portent un cadenas ; au clic, l'écran d'upgrade s'affiche (garde de route).
 */
export function BottomNav() {
  const { locked } = usePremium();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-beige-200/70 bg-white/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, premium }) => {
          const isLocked = Boolean(premium) && locked;
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    isActive ? 'text-sage-600' : 'text-sage-400 hover:text-sage-600',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'relative flex h-9 w-12 items-center justify-center rounded-2xl transition-colors',
                        isActive && 'bg-sage-50',
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                      {isLocked && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-gold shadow-soft">
                          <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                        </span>
                      )}
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
