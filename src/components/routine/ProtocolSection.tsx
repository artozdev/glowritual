import { Leaf, Sun, Moon, CalendarDays, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ProtocolItem } from '@/lib/protocol';
import type { RoutinePeriod, Severity } from '@/types/domain';

const PERIOD_META: Record<
  RoutinePeriod,
  { label: string; Icon: typeof Sun }
> = {
  morning: { label: 'Matin', Icon: Sun },
  evening: { label: 'Soir', Icon: Moon },
  weekly: { label: 'Hebdo', Icon: CalendarDays },
};

const SEVERITY_META: Record<
  Severity,
  { label: string; tone: 'success' | 'beige' }
> = {
  healthy: { label: 'Point fort', tone: 'success' },
  moderate: { label: 'À entretenir', tone: 'beige' },
  marked: { label: 'À sublimer', tone: 'beige' },
};

/**
 * Protocole personnalisé — par zone & par priorité. Chaque entrée : le geste
 * naturel à faire, le moment (matin/soir/hebdo) et le besoin produit associé.
 * Les zones les plus à sublimer apparaissent en premier.
 */
export function ProtocolSection({
  items,
  max = 5,
}: {
  items: ProtocolItem[];
  max?: number;
}) {
  const focus = items.slice(0, max);
  if (focus.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sage-500" />
        <h2 className="text-lg font-semibold text-sage-900">
          Ton protocole, par priorité
        </h2>
      </div>
      <p className="mt-1 text-sm text-sage-500">
        Les zones à sublimer en premier, avec le geste naturel et le bon moment.
        Tout est intégré à ta routine ci-dessous.
      </p>

      <div className="mt-3 space-y-3">
        {focus.map((item, i) => {
          const sev = SEVERITY_META[item.severity];
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-300 text-sm font-bold text-sage-900">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-sage-900">
                      {item.label}
                    </p>
                    <span className="shrink-0 text-sm font-semibold text-sage-700">
                      {item.score}
                      <span className="text-xs text-sage-400">/100</span>
                    </span>
                  </div>
                  <ProgressBar value={item.score} className="mt-1.5 h-1.5" />

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={sev.tone}>{sev.label}</Badge>
                    {item.periods.map((p) => {
                      const { label, Icon } = PERIOD_META[p];
                      return (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-xs font-medium text-sage-600"
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </span>
                      );
                    })}
                  </div>

                  <p className="mt-2.5 flex items-start gap-1.5 text-sm leading-relaxed text-sage-700">
                    <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" />
                    {item.geste}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
