import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accordéon FAQ animé (Framer Motion). Une seule question ouverte à la fois.
 */
export function FaqAccordion() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as {
    q: string;
    a: string;
  }[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl">
      <h3 className="text-center text-2xl font-bold tracking-tight text-ink">
        {t('faq.title')}
      </h3>
      <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span
                  className={cn(
                    'text-base font-semibold transition-colors',
                    isOpen ? 'text-ink' : 'text-ink/80',
                  )}
                >
                  {item.q}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                    isOpen
                      ? 'rotate-45 border-sage-300 bg-sage-300 text-ink'
                      : 'border-ink/15 text-ink',
                  )}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-12 text-sm leading-relaxed text-neutral-500">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
