import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * Barre de navigation inférieure — visible uniquement sur mobile.
 * Respecte la safe-area iOS (encoche / barre home).
 */
export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-beige-200/70 bg-white/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
                      'flex h-9 w-12 items-center justify-center rounded-2xl transition-colors',
                      isActive && 'bg-sage-50',
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
