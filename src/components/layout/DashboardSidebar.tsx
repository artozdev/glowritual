import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Lock, LogOut, CalendarClock } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { SIDEBAR_NAV } from '@/lib/navigation';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useScanSession } from '@/hooks/useScanSession';
import { useProfile } from '@/hooks/useProfile';
import { nextScanLabel } from '@/lib/glowPlan';
import { cn } from '@/lib/utils';

/**
 * Sidebar fixe du dashboard (desktop ≥ lg) — direction landing : noir & blanc
 * premium, accent #85ff9c parcimonieux. Sous-menus dépliables + bas (scan, logout).
 */
export function DashboardSidebar() {
  const { locked } = usePremium();
  const { signOut } = useAuth();
  const { latest } = useScanSession();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>('Mon analyse');

  const logout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const rowBase =
    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink/10 bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link to="/home" aria-label="Accueil Glow">
          <Logo className="h-8" />
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon;
          const isLocked = Boolean(item.premium) && locked;

          if (item.children) {
            const isOpen = open === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.label)}
                  className={cn(
                    rowBase,
                    'w-full text-ink/70 hover:bg-neutral-100 hover:text-ink',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-neutral-400 transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-ink/10 pl-3">
                    {item.children.map((sub, i) => (
                      <Link
                        key={`${sub.label}-${i}`}
                        to={sub.to}
                        className="block rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                cn(
                  rowBase,
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-ink/70 hover:bg-neutral-100 hover:text-ink',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {isLocked && <Lock className="h-3 w-3 text-neutral-400" strokeWidth={2.5} />}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-ink/10 p-3">
        <Link
          to="/progress"
          className="flex items-center gap-2.5 rounded-2xl bg-sage-300/15 px-3 py-2.5 transition-colors hover:bg-sage-300/25"
        >
          <CalendarClock className="h-4 w-4 shrink-0 text-ink" />
          <span className="min-w-0">
            <span className="block text-[11px] text-neutral-500">Prochain scan</span>
            <span className="block truncate text-sm font-semibold text-ink">
              {nextScanLabel(profile.scanReminder, latest?.createdAt)}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(rowBase, 'w-full text-neutral-500 hover:bg-neutral-100 hover:text-ink')}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
