import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StarRating } from './StarRating';
import { Img } from './Img';
import { TESTIMONIAL_FACES, PORTRAIT } from './media';
import { cn } from '@/lib/utils';

export interface Testimonial {
  name: string;
  quote: string;
  /** Classes de couleur de l'avatar. */
  color: string;
}

/** Mini comparateur avant/après (même visage, filtres légers). */
function BeforeAfter({ face }: { face: string }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {/* Avant */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        <Img
          primary={face}
          fallback={PORTRAIT}
          alt="Avant"
          className="h-full w-full object-cover"
          style={{ filter: 'brightness(0.95) saturate(0.9) contrast(1.07)' }}
        />
        <span className="absolute left-1.5 top-1.5 rounded-full bg-forest/80 px-2 py-0.5 text-[9px] font-semibold text-mint backdrop-blur">
          Avant
        </span>
        <span className="absolute left-1/3 top-1/2 h-2.5 w-2.5 rounded-full bg-mint ring-4 ring-mint/30" />
      </div>
      {/* Après */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        <Img
          primary={face}
          fallback={PORTRAIT}
          alt="Après"
          className="h-full w-full object-cover"
          style={{ filter: 'brightness(1.07) saturate(1.14) contrast(0.98)' }}
        />
        <span className="absolute right-1.5 top-1.5 rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-semibold text-forest backdrop-blur">
          Après
        </span>
      </div>
    </div>
  );
}

/**
 * Carrousel de témoignages : chaque carte montre un avant/après
 * (photo gauche = avant, droite = après) + citation. Flèches + points.
 */
export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function cardStep(): number {
    const el = ref.current;
    const card = el?.querySelector<HTMLElement>('[data-card]');
    return card ? card.clientWidth + 16 : (el?.clientWidth ?? 1);
  }
  function scrollBy(dir: 1 | -1) {
    ref.current?.scrollBy({ left: dir * cardStep(), behavior: 'smooth' });
  }
  function onScroll() {
    const el = ref.current;
    if (el) setActive(Math.round(el.scrollLeft / cardStep()));
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {items.map((t, i) => (
          <article
            key={t.name}
            data-card
            className="flex w-[86%] shrink-0 snap-start flex-col rounded-3xl border border-forest/10 bg-white p-4 shadow-soft sm:w-[60%] lg:w-[40%]"
          >
            <BeforeAfter face={TESTIMONIAL_FACES[i % TESTIMONIAL_FACES.length]!} />
            <StarRating size={13} className="mt-4" />
            <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-forest/80">
              « {t.quote} »
            </blockquote>
            <div className="mt-4 flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                  t.color,
                )}
              >
                {t.name[0]}
              </span>
              <p className="text-sm font-semibold text-forest">{t.name}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Flèches */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Précédent"
        className="absolute -left-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-forest shadow-soft-lg transition-transform hover:scale-105 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Suivant"
        className="absolute -right-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-forest shadow-soft-lg transition-transform hover:scale-105 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {items.map((t, i) => (
          <span
            key={t.name}
            className={cn(
              'h-2 rounded-full transition-all',
              active === i ? 'w-6 bg-forest' : 'w-2 bg-forest/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}
