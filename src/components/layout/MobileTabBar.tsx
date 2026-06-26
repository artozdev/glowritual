import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { MOBILE_TABS } from '@/lib/navigation';
import { usePremium } from '@/hooks/usePremium';
import { cn } from '@/lib/utils';

/**
 * Barre d'onglets du bas (expérience app mobile) — masquée en desktop (≥ lg).
 * 5 onglets, Scan au centre en bouton proéminent surélevé. Safe-area iOS.
 */
export function MobileTabBar() {
  const { locked } = usePremium();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-beige-200/70 bg-white/90 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-end justify-around px-2">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isLocked = Boolean(tab.premium) && locked;

          if (tab.center) {
            return (
              <li key={tab.to} className="flex-1">
                <NavLink
                  to={tab.to}
                  aria-label={tab.label}
                  className="flex flex-col items-center"
                >
                  <span className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage-500 text-white shadow-glow ring-4 ring-cream transition-transform active:scale-95">
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-sage-500">
                    {tab.label}
                  </span>
                </NavLink>
              </li>
            );
          }

          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    isActive
                      ? 'text-sage-600'
                      : 'text-sage-400 hover:text-sage-600',
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
                    {tab.label}
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
