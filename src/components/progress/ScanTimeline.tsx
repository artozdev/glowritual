import { ScanPhoto } from './ScanPhoto';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

/**
 * Timeline chronologique des scans (plus récent en haut) :
 * miniature + date + score global + variation depuis le scan précédent.
 */
export function ScanTimeline({ history }: { history: StoredScan[] }) {
  return (
    <ol className="space-y-2.5">
      {history.map((s, i) => {
        const older = history[i + 1]; // l'historique est trié du + récent au + ancien
        const delta = older ? s.overall - older.overall : null;
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-2xl border border-beige-200/70 bg-white p-2.5 shadow-soft"
          >
            <ScanPhoto scan={s} className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sage-900">
                {formatDate(s.createdAt)}
              </p>
              <p className="text-xs text-sage-500">
                {i === 0 ? 'Dernier scan' : `Scan n°${history.length - i}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold leading-none text-sage-900">
                {s.overall}
                <span className="text-xs font-medium text-sage-400"> /100</span>
              </p>
              {delta !== null && (
                <p
                  className={cn(
                    'mt-1 text-xs font-semibold',
                    delta >= 0 ? 'text-sage-600' : 'text-amber-600',
                  )}
                >
                  {delta >= 0 ? '+' : ''}
                  {delta} pts
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
