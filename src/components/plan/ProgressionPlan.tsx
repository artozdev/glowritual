import { Check, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EvolutionChart } from '@/components/progress/EvolutionChart';
import { ScanReminderCard } from '@/components/progress/ScanReminderCard';
import { buildJourney } from '@/lib/glowPlan';
import { cn } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

/**
 * Plan de progression : parcours multi-semaines (jalons), courbe d'évolution
 * (sur de vraies photos — aucune projection IA) et rescan programmé.
 */
export function ProgressionPlan({ history }: { history: StoredScan[] }) {
  const { milestones, currentIndex } = buildJourney(history);

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <ol className="space-y-4">
          {milestones.map((m, i) => {
            const done = i < currentIndex;
            const current = i === currentIndex;
            return (
              <li key={m.range} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      done && 'bg-sage-500 text-white',
                      current && 'bg-sage-300 text-sage-900 ring-2 ring-sage-400',
                      !done && !current && 'bg-beige-200 text-sage-400',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  {i < milestones.length - 1 && (
                    <span className="mt-1 w-0.5 flex-1 rounded-full bg-beige-200" />
                  )}
                </div>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-sage-900">{m.title}</p>
                    <span className="text-xs font-medium text-sage-400">
                      {m.range}
                    </span>
                    {current && (
                      <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-semibold text-sage-700">
                        Tu es ici
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-sage-600">
                    {m.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {history.length >= 2 && (
        <Card className="p-5">
          <p className="mb-1 text-sm font-semibold text-sage-900">
            Évolution de ton score
          </p>
          <EvolutionChart history={history} />
        </Card>
      )}

      <ScanReminderCard />

      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-sage-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Ta progression se mesure sur tes <strong>vraies photos</strong> dans le
        temps — Glow ne génère jamais d’image « idéalisée » de ton visage.
      </p>
    </div>
  );
}
