import { Link } from 'react-router-dom';
import { CalendarHeart, ScanFace, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { WeekCalendar } from '@/components/routine/WeekCalendar';
import { RoutineSection } from '@/components/routine/RoutineSection';
import { ReminderCard } from '@/components/routine/ReminderCard';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useScanSession } from '@/hooks/useScanSession';
import { useRoutine } from '@/hooks/useRoutine';
import { formatDate } from '@/lib/utils';

export default function Routine() {
  const { latest } = useScanSession();
  const { grouped, isDone, toggle, completed, total, progress } =
    useRoutine(latest);

  // Aucun scan → on invite à en faire un (la routine en découle).
  if (!latest) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50">
          <CalendarHeart className="h-7 w-7 text-sage-500" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-sage-900">
          Votre routine vous attend
        </h1>
        <p className="mt-2 text-sage-600">
          Faites un premier scan : Glow générera une routine douce et
          personnalisée.
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

  const allDone = total > 0 && completed === total;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
            Votre routine naturelle
          </h1>
          <p className="mt-1 text-sm text-sage-500">
            Générée d’après votre scan du {formatDate(latest.createdAt)}.
          </p>
        </div>
        <Badge tone="success">
          <CalendarHeart className="h-3 w-3" />
          Personnalisée
        </Badge>
      </div>

      {/* Calendrier de la semaine */}
      <Card className="mt-6 p-4">
        <WeekCalendar />
      </Card>

      {/* Progression du jour */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-sage-900">
              Progression du jour
            </p>
            <p className="text-xs text-sage-500">
              {completed} sur {total} gestes réalisés
            </p>
          </div>
          <span className="text-2xl font-semibold tracking-tight text-sage-900">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar value={progress} className="mt-3" />
        {allDone && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-sage-600">
            <Check className="h-4 w-4" />
            Bravo, routine du jour complète ! 🌿
          </p>
        )}
      </Card>

      {/* Sections de routine */}
      <div className="mt-6 space-y-6">
        <RoutineSection
          period="morning"
          tasks={grouped.morning}
          isDone={isDone}
          onToggle={toggle}
        />
        <RoutineSection
          period="evening"
          tasks={grouped.evening}
          isDone={isDone}
          onToggle={toggle}
        />
        <RoutineSection
          period="weekly"
          tasks={grouped.weekly}
          isDone={isDone}
          onToggle={toggle}
        />
      </div>

      {/* Rappels de routine */}
      <div className="mt-6">
        <ReminderCard />
      </div>

      <MedicalDisclaimer className="mt-6" compact />
    </div>
  );
}
