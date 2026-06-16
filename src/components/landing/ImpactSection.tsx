import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

/**
 * Section « impact » — fond sombre contrastant, onglets cliquables et
 * bénéfices en lignes (titre accentué à gauche, explication à droite).
 * Remplace l'ancienne grille d'avantages. Transition douce (Framer Motion).
 */

interface Benefit {
  /** Mot(s) accentué(s) en couleur. */
  accent: string;
  /** Reste du titre. */
  rest: string;
  text: string;
}

const TABS: { id: string; label: string; benefits: Benefit[] }[] = [
  {
    id: 'confiance',
    label: 'Confiance',
    benefits: [
      {
        accent: 'Plus',
        rest: 'de confiance',
        text: 'Prendre soin de sa peau et voir ses progrès renforce l’estime de soi au quotidien.',
      },
      {
        accent: 'Moins',
        rest: 'de complexes',
        text: 'Comprendre sa peau et savoir quoi faire apaise l’anxiété liée à l’apparence.',
      },
      {
        accent: 'Une',
        rest: 'fierté personnelle',
        text: 'Tenir sa routine et constater les résultats procure un vrai sentiment d’accomplissement.',
      },
    ],
  },
  {
    id: 'peau',
    label: 'Peau',
    benefits: [
      {
        accent: 'Une',
        rest: 'peau plus saine',
        text: 'Une routine régulière et adaptée améliore visiblement l’éclat et la qualité de la peau.',
      },
      {
        accent: 'Des',
        rest: 'gestes adaptés',
        text: 'Fini les produits au hasard : chaque recommandation est ciblée sur tes besoins réels.',
      },
      {
        accent: 'Du',
        rest: 'naturel, sans risque',
        text: 'Uniquement des produits sains, sans substances agressives pour ta peau.',
      },
    ],
  },
  {
    id: 'habitudes',
    label: 'Habitudes',
    benefits: [
      {
        accent: 'Une',
        rest: 'routine qui tient',
        text: 'Glow transforme le soin en habitude simple, suivie jour après jour.',
      },
      {
        accent: 'Du',
        rest: 'suivi motivant',
        text: 'Voir sa progression dans le temps donne envie de continuer.',
      },
      {
        accent: 'Moins',
        rest: 'de charge mentale',
        text: 'L’app décide quoi faire et quand, tu n’as plus à y penser.',
      },
    ],
  },
  {
    id: 'bienetre',
    label: 'Bien-être',
    benefits: [
      {
        accent: 'Un',
        rest: 'rituel pour soi',
        text: 'Un moment quotidien de soin, rien que pour toi, qui fait du bien au moral.',
      },
      {
        accent: 'Une',
        rest: 'approche globale',
        text: 'Peau, sommeil, hydratation, stress : Glow prend soin de toi en entier.',
      },
      {
        accent: 'Du',
        rest: 'positif, pas de pression',
        text: 'Une démarche bienveillante, axée progrès personnel et jamais jugement.',
      },
    ],
  },
];

export function ImpactSection() {
  const [active, setActive] = useState(0);
  const tab = TABS[active]!;

  return (
    <section
      id="avantages"
      className="relative overflow-hidden bg-gradient-to-b from-forest-dark via-[#10271b] to-[#0a1712] py-24 text-white sm:py-32"
    >
      {/* Halos profonds */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mint/80">
            L’impact de Glow sur toi
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Prendre soin de soi change tout
          </h2>
        </ScrollReveal>

        {/* Onglets (scrollables sur mobile) */}
        <ScrollReveal delay={0.05}>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 sm:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                  i === active
                    ? 'bg-white/10 text-white shadow-soft ring-1 ring-mint/40'
                    : 'text-white/45 hover:text-white/80',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Bénéfices en lignes */}
        <ScrollReveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {tab.benefits.map((b, i) => (
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
