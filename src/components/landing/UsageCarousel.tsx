import { useTranslation } from 'react-i18next';
import { Camera, ListChecks, Images, Leaf, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Icônes des usages (ordre = items i18n). */
const ICONS: LucideIcon[] = [Camera, ListChecks, Images, Leaf];

/**
 * Carrousel « Glow au quotidien » : cartes d'usages réels, scroll horizontal
 * (masqué via .no-scrollbar). N&B premium, touche d'accent sur les icônes.
 */
export function UsageCarousel() {
  const { t } = useTranslation();
  const usages = t('daily.usages', { returnObjects: true }) as {
    title: string;
    text: string;
  }[];

  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
      {usages.map((u, i) => {
        const Icon = ICONS[i % ICONS.length]!;
        const featured = i === 0;
        return (
          <article
            key={u.title}
            className={cn(
              'flex w-[78%] shrink-0 snap-start flex-col rounded-[1.5rem] border p-6 transition-colors sm:w-[300px]',
              featured
                ? 'border-ink/10 bg-ink text-white'
                : 'border-ink/10 bg-neutral-50 text-ink',
            )}
          >
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl',
                featured ? 'bg-sage-300 text-ink' : 'bg-white text-ink shadow-soft',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <h4
              className={cn(
                'mt-5 text-lg font-bold',
                featured ? 'text-white' : 'text-ink',
              )}
            >
              {u.title}
            </h4>
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed',
                featured ? 'text-white/70' : 'text-neutral-500',
              )}
            >
              {u.text}
            </p>
          </article>
        );
      })}
    </div>
  );
}
