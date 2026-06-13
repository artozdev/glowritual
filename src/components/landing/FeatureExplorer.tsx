import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ScanFace,
  Crosshair,
  Leaf,
  CalendarHeart,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import {
  ScanScreen,
  AnalyseScreen,
  ProductScreen,
  RoutineScreen,
  ProgressScreen,
} from './PhoneScreens';
import { ScrollReveal } from './ScrollReveal';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
  screen: ReactNode;
}

const FEATURES: Feature[] = [
  {
    icon: ScanFace,
    title: 'Scan IA visage & corps',
    text: 'Un simple scan avec ta caméra suffit. Notre IA analyse ta peau et ta silhouette en quelques secondes.',
    screen: <ScanScreen />,
  },
  {
    icon: Crosshair,
    title: 'Analyse point par point',
    text: 'Chaque zone reçoit un score, une explication claire et une recommandation précise. Tu sais enfin quoi faire et pourquoi.',
    screen: <AnalyseScreen />,
  },
  {
    icon: Leaf,
    title: 'Produits naturels vérifiés',
    text: 'Glow te recommande les bons produits, naturels et sains, avec image et lien. Zéro substance à risque.',
    screen: <ProductScreen />,
  },
  {
    icon: CalendarHeart,
    title: 'Routine automatique',
    text: 'Après chaque scan, ta routine personnalisée se crée toute seule, organisée dans un calendrier avec rappels.',
    screen: <RoutineScreen />,
  },
  {
    icon: TrendingUp,
    title: 'Suivi de tes progrès',
    text: 'Rescanne régulièrement et visualise ton évolution dans le temps. Ton glow up, en courbes.',
    screen: <ProgressScreen />,
  },
];

/**
 * Section « Que comprend Glow ? » — explorateur interactif à deux colonnes
 * (style Cal AI). Un téléphone fixe à gauche dont l'écran change selon la
 * carte active à droite (clic + survol sur desktop, tap sur mobile).
 */
export function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Sur mobile, on recentre le téléphone après un tap pour voir le changement.
  useEffect(() => {
    if (interacted && phoneRef.current && window.innerWidth < 1024) {
      phoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [active, interacted]);

  const current = FEATURES[active]!;

  return (
    <section id="fonctionnalites" className="bg-sand py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Que comprend Glow&nbsp;?
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Téléphone (fixe sur desktop) */}
          <div
            ref={phoneRef}
            className="flex justify-center lg:sticky lg:top-24"
          >
            <PhoneFrame width={252}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full"
                >
                  {current.screen}
                </motion.div>
              </AnimatePresence>
            </PhoneFrame>
          </div>

          {/* Cartes */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const isActive = i === active;
              return (
                <ScrollReveal key={f.title} delay={i * 0.04}>
                  <button
                    type="button"
                    onClick={() => {
                      setInteracted(true);
                      setActive(i);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      'w-full rounded-3xl border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-mint bg-mint/40 shadow-soft'
                        : 'border-forest/10 bg-white hover:border-mint/60',
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors',
                          isActive ? 'bg-forest text-mint' : 'bg-mint/40 text-forest',
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-forest">{f.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-forest/70">
                          {f.text}
                        </p>
                      </div>
                    </div>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
