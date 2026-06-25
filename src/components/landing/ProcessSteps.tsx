import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { Highlight } from './Highlight';
import { Img } from './Img';
import { PROCESS_PORTRAIT } from './media';
import { cn } from '@/lib/utils';

/**
 * Section « processus en 3 étapes » (inspirée d'Althea, adaptée au style Glow).
 * Portrait central détouré avec fondu vers le bas + grands numéros en filigrane,
 * étapes décrites à droite. Numéro de l'étape active légèrement teinté #85ff9c.
 * Garde-fou : on n'évalue que ce qui se sublime au naturel (peau), jamais la
 * morphologie du visage.
 */
export function ProcessSteps() {
  const { t } = useTranslation();
  const steps = t('process.steps', { returnObjects: true }) as {
    title: string;
    text: string;
  }[];
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        {/* En-tête */}
        <ScrollReveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {t('process.eyebrow')}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('process.title')} />
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Portrait détouré + fondu */}
          <ScrollReveal>
            <div className="relative mx-auto w-full max-w-sm">
              {/* Halo accent discret */}
              <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-sage-300/15 blur-3xl" />
              <Img
                primary={PROCESS_PORTRAIT.primary}
                fallback={PROCESS_PORTRAIT.fallback}
                alt="Glow"
                draggable={false}
                className="relative z-10 mx-auto w-full object-contain"
              />
              {/* Fondu doux vers le bas */}
              <div className="absolute inset-x-0 bottom-0 z-20 h-1/4 bg-gradient-to-t from-white to-transparent" />
            </div>
          </ScrollReveal>

          {/* Étapes */}
          <ol className="space-y-1 sm:space-y-2">
            {steps.map((s, i) => {
              const n = String(i + 1).padStart(2, '0');
              const isActive = active === i;
              return (
                <motion.li
                  key={s.title}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  tabIndex={0}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-5 rounded-3xl p-3 outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 sm:gap-7 sm:p-4"
                >
                  <span
                    className={cn(
                      'select-none font-extrabold leading-[0.85] tabular-nums tracking-tighter transition-colors duration-300',
                      'text-6xl sm:text-7xl',
                      isActive ? 'text-sage-300' : 'text-neutral-200',
                    )}
                    aria-hidden
                  >
                    {n}
                  </span>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-neutral-500">
                      {s.text}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
