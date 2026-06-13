import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { Img } from './Img';
import { BEFORE_AFTER } from './media';
import { cn } from '@/lib/utils';

/** Points d'analyse annotés sur la version « Avant ». */
const ANNOTATIONS = [
  { top: '34%', left: '30%', label: 'Hydratation' },
  { top: '44%', left: '66%', label: 'Imperfections' },
  { top: '66%', left: '44%', label: 'Texture' },
];

/**
 * Comparateur avant / après avec curseur glissant (drag tactile + souris).
 * Utilise les deux photos fournies (public/img/before.jpg & after.jpg).
 */
export function BeforeAfterSlider({ className }: { className?: string }) {
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
        'relative aspect-[4/5] w-full select-none overflow-hidden rounded-3xl bg-sand shadow-soft-lg',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
    >
      {/* APRÈS (base) */}
      <Img
        primary={BEFORE_AFTER.after}
        fallback={BEFORE_AFTER.afterFallback}
        alt="Après : peau plus nette et lumineuse"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-forest backdrop-blur">
        Après
      </span>

      {/* AVANT (superposé, clippé) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Img
          primary={BEFORE_AFTER.before}
          fallback={BEFORE_AFTER.beforeFallback}
          alt="Avant"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-forest/80 px-2.5 py-1 text-xs font-semibold text-mint backdrop-blur">
          Avant
        </span>

        {ANNOTATIONS.map((a) => (
          <div
            key={a.label}
            className="absolute flex items-center gap-1.5"
            style={{ top: a.top, left: a.left }}
          >
            <span className="h-3 w-3 rounded-full bg-mint ring-4 ring-mint/30" />
            <span className="whitespace-nowrap rounded-full bg-forest/85 px-2 py-0.5 text-[10px] font-medium text-mint backdrop-blur">
              {a.label}
            </span>
          </div>
        ))}
      </div>

      {/* Poignée */}
      <div
        className="absolute inset-y-0 z-10 flex w-0 items-center justify-center"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90" />
        <button
          type="button"
          aria-label="Glisser pour comparer"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(3, p - 4));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(97, p + 4));
          }}
          className="relative flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-white text-forest shadow-soft-lg"
        >
          <MoveHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
