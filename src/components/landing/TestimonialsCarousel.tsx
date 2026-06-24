import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Img } from './Img';
import { TESTIMONIAL_FACES, PORTRAIT } from './media';
import { cn } from '@/lib/utils';

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

/**
 * Témoignages « façon référence » : cartes photo plein cadre (N&B premium),
 * prénom + rôle en haut, citation en bas. La carte mise en avant (centrale)
 * porte l'anneau accent #85ff9c. Grille sur desktop, carrousel sur mobile.
 */
export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const featured = Math.floor(items.length / 2);

  function cardStep(): number {
    const el = ref.current;
    const card = el?.querySelector<HTMLElement>('[data-card]');
    return card ? card.clientWidth + 16 : (el?.clientWidth ?? 1);
  }
  function scrollByDir(dir: 1 | -1) {
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
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:overflow-visible"
      >
        {items.map((t, i) => (
          <article
            key={t.name}
            data-card
            className={cn(
              'group relative flex aspect-[3/4] w-[82%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-neutral-900 sm:w-[58%] lg:w-1/3',
              i === featured
                ? 'ring-2 ring-sage-300 ring-offset-2 ring-offset-white'
                : 'ring-1 ring-ink/10',
            )}
          >
            <Img
              primary={TESTIMONIAL_FACES[i % TESTIMONIAL_FACES.length]!}
              fallback={PORTRAIT}
              alt={t.name}
              className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
            />
            {/* Voile dégradé pour la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/30" />

            {/* En-tête : prénom + rôle */}
            <div className="absolute inset-x-5 top-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/65">{t.role}</p>
              </div>
              {i === featured && (
                <span className="rounded-full bg-sage-300 px-2.5 py-0.5 text-[10px] font-bold text-ink">
                  ★ 4,9
                </span>
              )}
            </div>

            {/* Citation */}
            <blockquote className="absolute inset-x-5 bottom-5 text-[15px] font-medium leading-snug text-white">
              « {t.quote} »
            </blockquote>
          </article>
        ))}
      </div>

      {/* Flèches (mobile / tablette) */}
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        aria-label="Précédent"
        className="absolute -left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft-lg transition-transform hover:scale-105 lg:hidden"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByDir(1)}
        aria-label="Suivant"
        className="absolute -right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft-lg transition-transform hover:scale-105 lg:hidden"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination (mobile) */}
      <div className="mt-6 flex justify-center gap-2 lg:hidden">
        {items.map((t, i) => (
          <span
            key={t.name}
            className={cn(
              'h-2 rounded-full transition-all',
              active === i ? 'w-6 bg-sage-300' : 'w-2 bg-ink/15',
            )}
          />
        ))}
      </div>
    </div>
  );
}
