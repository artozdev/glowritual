import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

/**
 * Section « impact » — fond sombre contrastant, onglets cliquables et
 * bénéfices en lignes (titre accentué à gauche, explication à droite).
 * Contenu issu de l'i18n (FR/EN), transition douce (Framer Motion).
 */

interface Benefit {
  accent: string;
  rest: string;
  text: string;
}

const TAB_IDS = ['confidence', 'skin', 'habits', 'wellbeing'] as const;

export function ImpactSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const tabId = TAB_IDS[active]!;
  const benefits = t(`impact.benefits.${tabId}`, {
    returnObjects: true,
  }) as Benefit[];

  return (
    <section
      id="avantages"
      className="relative overflow-hidden bg-gradient-to-b from-forest-dark via-[#10271b] to-[#0a1712] py-24 text-white sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mint/80">
            {t('impact.eyebrow')}
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('impact.title')}
          </h2>
        </ScrollReveal>

        {/* Onglets (scrollables sur mobile) */}
        <ScrollReveal delay={0.05}>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 sm:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TAB_IDS.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                  i === active
                    ? 'bg-white/10 text-white shadow-soft ring-1 ring-mint/40'
                    : 'text-white/45 hover:text-white/80',
                )}
              >
                {t(`impact.tabs.${id}`)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Bénéfices en lignes */}
        <ScrollReveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={tabId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {benefits.map((b, i) => (
                  <div
                    key={b.rest}
                    className={cn(
                      'grid gap-2 px-6 py-7 sm:grid-cols-[1fr_1.3fr] sm:items-center sm:gap-10 sm:px-9 sm:py-8',
                      i > 0 && 'border-t border-white/10',
                    )}
                  >
                    <h3 className="text-xl font-bold leading-tight sm:text-2xl">
                      <span className="text-mint">{b.accent}</span>{' '}
                      <span className="text-white/90">{b.rest}</span>
                    </h3>
                    <p className="text-base leading-relaxed text-white/65">
                      {b.text}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
