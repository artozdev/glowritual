import { Link } from 'react-router-dom';
import {
  ScanFace,
  Sparkles,
  CalendarHeart,
  TrendingUp,
  ArrowRight,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { useScanSession } from '@/hooks/useScanSession';
import { useProfile } from '@/hooks/useProfile';
import { overviewSplit, nextScanLabel } from '@/lib/glowPlan';
import { scoreHeadline, formatDate } from '@/lib/utils';

const QUICK_LINKS = [
  { to: '/scan', label: 'Faire un scan', icon: ScanFace },
  { to: '/results', label: 'Mon Glow Plan', icon: Sparkles },
  { to: '/routine', label: 'Ma routine', icon: CalendarHeart },
  { to: '/progress', label: 'Ma progression', icon: TrendingUp },
];

export default function Home() {
  const { latest } = useScanSession();
  const { profile } = useProfile();
  const name = profile.displayName.trim();
  const overview = latest ? overviewSplit(latest.analysis) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
        {name ? `Bonjour ${name} 🌿` : 'Bienvenue sur Glow 🌿'}
      </h1>
      <p className="mt-1 text-sage-600">Voici ton tableau de bord du jour.</p>

      {/* Carte d'accueil : score ou invitation à scanner */}
      {latest ? (
        <Card className="mt-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <ScoreRing value={latest.overall} size={116} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-sage-900">
              {scoreHeadline(latest.overall)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-sage-600">
              Dernier scan du {formatDate(latest.createdAt)}. Continue en douceur,
              tu es sur la bonne voie.
            </p>
            <Link to="/results" className="mt-3 inline-block">
              <Button size="sm">
                <Sparkles className="h-4 w-4" />
                Voir mon Glow Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 flex flex-col items-center gap-3 bg-sage-gradient p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
            <ScanFace className="h-7 w-7 text-sage-500" />
          </span>
          <p className="text-lg font-semibold text-sage-900">
            Lance ta première analyse
          </p>
          <p className="max-w-sm text-sm text-sage-600">
            Quelques photos guidées suffisent pour générer ton Glow Plan
            personnalisé, 100 % naturel.
          </p>
          <Link to="/scan">
            <Button size="lg">
              <ScanFace className="h-5 w-5" />
              Commencer mon analyse
            </Button>
          </Link>
        </Card>
      )}

      {/* Accès rapides */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex h-full flex-col items-center gap-2 p-4 text-center transition-colors hover:border-sage-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-50">
                <Icon className="h-5 w-5 text-sage-500" />
              </span>
              <span className="text-sm font-medium text-sage-800">{label}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Priorités du moment */}
      {overview && overview.priorities.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-sage-900">
            Tes priorités à sublimer
          </h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {overview.priorities.map((c, i) => (
              <Link key={c.id} to="/results">
                <Card className="p-3 transition-colors hover:border-sage-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-300 text-xs font-bold text-sage-900">
                    {i + 1}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-sage-900">
                    {c.label}
                  </p>
                  <p className="text-xs text-sage-500">Score {c.score}/100</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prochain scan */}
      <Link to="/progress" className="mt-6 block">
        <Card className="flex items-center gap-3 p-4 transition-colors hover:border-sage-200">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-50">
            <CalendarClock className="h-5 w-5 text-sage-500" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-sage-900">Prochain scan</p>
            <p className="text-xs text-sage-500">
              {nextScanLabel(profile.scanReminder, latest?.createdAt)} · un scan
              régulier rend ta courbe plus parlante.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-sage-300" />
        </Card>
      </Link>
    </div>
  );
}
