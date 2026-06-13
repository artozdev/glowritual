import { Sunrise, Moon, CalendarRange, type LucideIcon } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { GeneratedTask, RoutinePeriod } from '@/types/domain';

const META: Record<RoutinePeriod, { label: string; icon: LucideIcon }> = {
  morning: { label: 'Matin', icon: Sunrise },
  evening: { label: 'Soir', icon: Moon },
  weekly: { label: 'Cette semaine', icon: CalendarRange },
};

interface Props {
  period: RoutinePeriod;
  tasks: GeneratedTask[];
  isDone: (id: string) => boolean;
  onToggle: (id: string) => void;
}

/** Bloc de routine pour un moment donné (matin / soir / hebdo). */
export function RoutineSection({ period, tasks, isDone, onToggle }: Props) {
  if (tasks.length === 0) return null;
  const { label, icon: Icon } = META[period];
  const doneCount = tasks.filter((t) => isDone(t.id)).length;

  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-50">
          <Icon className="h-4 w-4 text-sage-500" />
        </span>
        <h3 className="text-sm font-semibold text-sage-900">{label}</h3>
        <span className="text-xs text-sage-400">
          {doneCount}/{tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            done={isDone(t.id)}
            onToggle={() => onToggle(t.id)}
          />
        ))}
      </div>
    </section>
  );
}
