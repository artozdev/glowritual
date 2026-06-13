import { cn } from '@/lib/utils';

const DAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Bande de calendrier hebdomadaire (lun→dim), jour courant mis en avant.
 * Les rappels planifiés seront ajoutés à l'étape 5.
 */
export function WeekCalendar() {
  const today = new Date();
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors',
              isToday ? 'bg-sage-600 text-white shadow-soft' : 'bg-beige-50 text-sage-500',
            )}
          >
            <span className="text-[10px] font-medium uppercase opacity-80">
              {DAY_INITIALS[i]}
            </span>
            <span
              className={cn(
                'text-sm font-semibold',
                isToday ? 'text-white' : 'text-sage-800',
              )}
            >
              {d.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
