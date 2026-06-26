import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZONE_STEPS } from '@/lib/scanZones';

interface Props {
  /** Index de l'étape en cours (0-based). */
  current: number;
  /** Étapes affichées (défaut : zones du scan visage). */
  steps?: { id: string; title: string }[];
}

/** Barre de progression des étapes du scan (1/5, 2/5…). */
export function ScanProgress({ current, steps = ZONE_STEPS }: Props) {
  const total = steps.length;
  return (
    <div>
      <div className="flex items-center justify-between px-0.5">
        <p className="text-xs font-medium text-sage-600">
          Étape {Math.min(current + 1, total)}/{total}
        </p>
        <p className="text-xs text-sage-400">{steps[current]?.title}</p>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {steps.map((step, i) => {
          const done = i < current;
          const activeStep = i === current;
          return (
            <div key={step.id} className="flex flex-1 items-center gap-1.5">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                  done && 'bg-sage-500 text-white',
                  activeStep && 'bg-sage-100 text-sage-700 ring-2 ring-sage-400',
                  !done && !activeStep && 'bg-beige-200 text-sage-400',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              {i < total - 1 && (
                <span
                  className={cn(
                    'h-0.5 flex-1 rounded-full transition-colors',
                    done ? 'bg-sage-400' : 'bg-beige-200',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
