import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ScanFace,
  Award,
  Activity,
  Sparkles,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EvolutionChart } from '@/components/progress/EvolutionChart';
import { ScanCompare } from '@/components/progress/ScanCompare';
import { ScanTimeline } from '@/components/progress/ScanTimeline';
import { ShareCard } from '@/components/progress/ShareCard';
import { ScanReminderCard } from '@/components/progress/ScanReminderCard';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useScanSession } from '@/hooks/useScanSession';
import { useProfile } from '@/hooks/useProfile';
import { isScanDue } from '@/lib/progress';

export default function Progress() {
  const { history } = useScanSession();
  const { profile } = useProfile();

  // ── Aucun scan : invitation à démarrer.
  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50">
          <TrendingUp className="h-7 w-7 text-sage-500" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-sage-900">
          Ton évolution démarre ici
        </h1>
        <p className="mt-2 text-sage-600">
          Fais ton premier scan pour suivre tes progrès dans le temps.
        </p>
        <Link to="/scan" className="mt-6 inline-block">
          <Button size="lg">
            <ScanFace className="h-5 w-5" />
            Commencer mon analyse
          </Button>
        </Link>
      </div>
    );
  }

  // history est trié du plus récent au plus ancien.
  const latest = history[0]!;
  const previous = history[1];
  const best = Math.max(...history.map((s) => s.overall));
  const delta = previous ? latest.overall - previous.overall : 0;
  const due = isScanDue(profile.scanReminder, latest.createdAt);
  const hasTwo = history.length >= 2;

  const stats = [
    { icon: Activity, label: 'Score actuel', value: `${latest.overall}` },
    {
      icon: TrendingUp,
      label: 'Depuis le dernier',
      value: `${delta >= 0 ? '+' : ''}${delta}`,
    },
    { icon: Award, label: 'Meilleur score', value: `${best}` },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
        Mon évolution
      </h1>
      <p className="mt-1 text-sage-600">
        {history.length} scan{history.length > 1 ? 's' : ''} · suis ton glow up
        dans le temps.
      </p>

      {/* Rappel : un scan est dû */}
      {due && (
        <Link to="/scan" className="mt-5 block">
          <div className="flex items-center gap-3 rounded-2xl bg-sage-gradient p-4 transition-transform active:scale-[0.99]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft">
              <CalendarClock className="h-5 w-5 text-sage-500" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-sage-900">
                Ton scan du jour t’attend ✨
              </p>
              <p className="text-xs text-sage-600">
                Un scan régulier rend ta courbe encore plus parlante.
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-sage-500" />
          </div>
        </Link>
      )}

      {/* Statistiques clés */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4 text-center">
            <Icon className="mx-auto h-5 w-5 text-sage-500" />
            <p className="mt-2 text-2xl font-semibold tracking-tight text-sage-900">
              {value}
            </p>
            <p className="text-[11px] leading-tight text-sage-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Récap partageable */}
      {hasTwo && (
        <div className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-sage-900">
            Partage ta progression
          </h2>
          <ShareCard history={history} />
        </div>
      )}

      {/* Comparateur avant / après */}
      {hasTwo && (
        <Card className="mt-6 p-5">
          <h2 className="mb-3 text-sm font-semibold text-sage-900">
            Avant / Après
          </h2>
          <ScanCompare history={history} />
        </Card>
      )}

      {/* Courbe d'évolution */}
      <Card className="mt-4 p-5">
        <h2 className="mb-1 text-sm font-semibold text-sage-900">
          Évolution du score
        </h2>
        <EvolutionChart history={history} />
      </Card>

      {/* Rappel de scan */}
      <div className="mt-4">
        <ScanReminderCard />
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <h2 className="mb-2.5 text-sm font-semibold text-sage-900">
          Tous tes scans
        </h2>
        <ScanTimeline history={history} />
      </div>

      <div className="mt-6">
        <Link to="/scan">
          <Button className="w-full">
            <ScanFace className="h-5 w-5" />
            Nouveau scan
          </Button>
        </Link>
      </div>

      <MedicalDisclaimer className="mt-6" compact />
    </div>
  );
}
