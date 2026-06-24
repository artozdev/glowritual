import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Img } from './Img';
import { BEFORE_AFTER } from './media';
import { cn } from '@/lib/utils';

/** Points d'analyse (purement décoratifs) sur la version « Avant ». */
const DOTS = [
  { top: '34%', left: '30%' },
  { top: '46%', left: '66%' },
  { top: '66%', left: '44%' },
];

/**
 * Comparateur avant / après avec curseur glissant (drag tactile + souris).
 * N&B premium : poignée et points d'analyse en accent #85ff9c (sage-300).
 */
export function BeforeAfterSlider({ className }: { className?: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(55);
  const [dragging, setDragging] = useState(false);

  function updateFromClientX(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(3, Math.min(97, pct)));
  }

  function onPointerDown(e: ReactPointerEvent) {
    setDragging(true);
    updateFromClientX(e.clientX);
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (dragging) updateFromClientX(e.clientX);
  }
  function stop() {
    setDragging(false);
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerLeave={stop}
      className={cn(
        'relative aspect-[4/5] w-full select-none overflow-hidden rounded-[2rem] border border-ink/10 bg-neutral-100 shadow-soft-lg',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
    >
      {/* APRÈS (base) */}
      <Img
        primary={BEFORE_AFTER.after}
        fallback={BEFORE_AFTER.afterFallback}
        alt={t('beforeAfter.after')}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
        {t('beforeAfter.after')}
      </span>

      {/* AVANT (superposé, clippé) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Img
          primary={BEFORE_AFTER.before}
          fallback={BEFORE_AFTER.beforeFallback}
          alt={t('beforeAfter.before')}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {t('beforeAfter.before')}
        </span>

        {DOTS.map((d) => (
          <span
            key={`${d.top}-${d.left}`}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage-300 ring-4 ring-sage-300/30"
            style={{ top: d.top, left: d.left }}
          />
        ))}
      </div>

      {/* Poignée */}
      <div
        className="absolute inset-y-0 z-10 flex w-0 items-center justify-center"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" />
        <button
          type="button"
          aria-label={`${t('beforeAfter.before')} / ${t('beforeAfter.after')}`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(3, p - 4));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(97, p + 4));
          }}
          className="relative flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft-lg ring-2 ring-sage-300"
        >
          <MoveHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
