import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { useScanSession } from '@/hooks/useScanSession';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { nextScanLabel } from '@/lib/glowPlan';

/**
 * Header du dashboard (desktop ≥ lg) — direction landing : noir & blanc premium,
 * accent #85ff9c parcimonieux. Score Glow, prochain scan, profil.
 */
export function DashboardHeader() {
  const { latest } = useScanSession();
  const { profile } = useProfile();
  const { user } = useAuth();
  const score = latest?.overall;
  const initial = (
    profile.displayName.trim()[0] ??
    user?.email?.[0] ??
    'G'
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-ink/10 bg-white/80 px-6 backdrop-blur-md lg:flex">
      <div>
        <p className="text-sm font-semibold text-ink">
          Bonjour{profile.displayName ? ` ${profile.displayName}` : ''} 🌿
        </p>
        <p className="text-xs text-neutral-500">
          Bienvenue sur ton tableau de bord Glow.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {score != null && (
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sage-300" />
            <span className="text-xs text-neutral-500">Score Glow</span>
            <span className="text-sm font-bold text-ink">{score}</span>
          </div>
        )}
        <div className="hidden items-center gap-1.5 text-xs text-neutral-500 xl:flex">
          <CalendarClock className="h-4 w-4 text-neutral-400" />
          Prochain scan&nbsp;:
          <span className="font-medium text-ink">
            {nextScanLabel(profile.scanReminder, latest?.createdAt)}
          </span>
        </div>
        <Link
          to="/profile"
          aria-label="Profil"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
