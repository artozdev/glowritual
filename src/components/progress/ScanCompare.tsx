import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { MoveHorizontal, Sparkles } from 'lucide-react';
import { ScanPhoto } from './ScanPhoto';
import {
  bestImprovement,
  chronological,
  daysBetween,
} from '@/lib/progress';
import { formatDayMonth } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

/**
 * Comparateur avant/après automatique entre deux scans (le plus ancien et le
 * plus récent par défaut), avec curseur glissant et message de gain.
 */
export function ScanCompare({ history }: { history: StoredScan[] }) {
  const sorted = useMemo(() => chronological(history), [history]); // asc
  const [fromId, setFromId] = useState(sorted[0]!.id);
  const [toId, setToId] = useState(sorted[sorted.length - 1]!.id);

  const from = sorted.find((s) => s.id === fromId) ?? sorted[0]!;
  const to = sorted.find((s) => s.id === toId) ?? sorted[sorted.length - 1]!;

  // Ordonne chronologiquement la paire (avant = plus ancien).
  const [older, newer] =
    new Date(from.createdAt) <= new Date(to.createdAt) ? [from, to] : [to, from];

  const overallDelta = newer.overall - older.overall;
  const best = bestImprovement(older, newer);
  const days = daysBetween(older.createdAt, newer.createdAt);

  // Curseur
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(55);
  const [dragging, setDragging] = useState(false);
  function update(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(3, Math.min(97, ((clientX - r.left) / r.width) * 100)));
  }
  const onDown = (e: ReactPointerEvent) => {
    setDragging(true);
    update(e.clientX);
  };
  const onMove = (e: ReactPointerEvent) => dragging && update(e.clientX);
  const stop = () => setDragging(false);

  const optionLabel = (s: StoredScan) =>
    `${formatDayMonth(s.createdAt)} · ${s.overall}/100`;

  return (
    <div>
      {/* Sélecteurs */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[
          { label: 'Avant', value: fromId, set: setFromId },
          { label: 'Après', value: toId, set: setToId },
        ].map((sel) => (
          <label key={sel.label} className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-sage-400">
              {sel.label}
            </span>
            <select
              value={sel.value}
              onChange={(e) => sel.set(e.target.value)}
              className="h-9 w-full rounded-xl border border-beige-200 bg-white px-2.5 text-sm text-sage-800 focus:border-sage-300 focus:outline-none"
            >
              {sorted.map((s) => (
                <option key={s.id} value={s.id}>
                  {optionLabel(s)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {/* Curseur de comparaison */}
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={stop}
        onPointerLeave={stop}
        className={cn(
          'relative aspect-[4/5] w-full select-none overflow-hidden rounded-3xl bg-sand shadow-soft-lg',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        {/* Après (base) */}
        <ScanPhoto scan={newer} className="absolute inset-0 h-full w-full" />
        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-sage-700 backdrop-blur">
          Après · {newer.overall}
        </span>

        {/* Avant (clippé) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <ScanPhoto scan={older} className="absolute inset-0 h-full w-full" />
          <span className="absolute left-3 top-3 rounded-full bg-sage-700/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            Avant · {older.overall}
          </span>
        </div>

        {/* Poignée */}
        <div
          className="absolute inset-y-0 z-10 flex w-0 items-center justify-center"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90" />
          <span className="relative flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-sage-700 shadow-soft-lg">
            <MoveHorizontal className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Message de gain */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sage-gradient p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft">
          <Sparkles className="h-5 w-5 text-sage-500" />
        </span>
        <div>
          {best && best.delta > 0 ? (
            <p className="text-sm font-semibold text-sage-900">
              +{best.delta} points {best.phrase} en {days} jour
              {days > 1 ? 's' : ''} 🌿
            </p>
          ) : (
            <p className="text-sm font-semibold text-sage-900">
              Score global {older.overall} → {newer.overall}
              {overallDelta !== 0 && (
                <> ({overallDelta > 0 ? '+' : ''}
                  {overallDelta})</>
              )}{' '}
              en {days} jour{days > 1 ? 's' : ''}
            </p>
          )}
          <p className="mt-0.5 text-xs text-sage-600">
            Continue ta routine, ton glow up se construit jour après jour.
          </p>
        </div>
      </div>
    </div>
  );
}
