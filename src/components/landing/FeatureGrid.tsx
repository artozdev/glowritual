import { useTranslation } from 'react-i18next';
import { ScanFace, Leaf, RefreshCw, Users, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { Highlight } from './Highlight';
import { FaceScanVisual } from './FaceScanVisual';
import { cn } from '@/lib/utils';

/** Icônes des 4 cartes (ordre = items i18n). */
const ICONS: LucideIcon[] = [ScanFace, Leaf, RefreshCw, Users];

/**
 * Section « Fonctionnalités en grille » : 4 cartes disposées autour du visuel
 * central de scan facial (FaceScanVisual). N&B + accent #85ff9c parcimonieux.
 */
export function FeatureGrid() {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true }) as {
    title: string;
    text: string;
  }[];

  return (
    <section id="fonctionnalites" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('features.title')} />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-500">
            {t('features.subtitle')}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid items-center gap-5 lg:grid-cols-3">
          {/* Colonne gauche */}
          <div className="flex flex-col gap-5">
            <FeatureCard icon={ICONS[0]!} item={items[0]!} delay={0} />
            <FeatureCard icon={ICONS[1]!} item={items[1]!} delay={0.1} />
          </div>

          {/* Visuel central */}
          <ScrollReveal delay={0.05} className="order-first lg:order-none">
            <FaceScanVisual
              caption={t('features.scanCaption')}
              className="mx-auto max-w-sm shadow-soft-lg"
            />
          </ScrollReveal>

          {/* Colonne droite */}
          <div className="flex flex-col gap-5">
            <FeatureCard icon={ICONS[2]!} item={items[2]!} delay={0.15} />
            <FeatureCard icon={ICONS[3]!} item={items[3]!} delay={0.25} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  item,
  delay,
}: {
  icon: LucideIcon;
  item: { title: string; text: string };
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group rounded-[1.5rem] border border-ink/10 bg-white p-6 transition-all duration-300',
        'hover:-translate-y-1 hover:border-sage-300 hover:shadow-soft-lg',
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white transition-colors duration-300 group-hover:bg-sage-300 group-hover:text-ink">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.text}</p>
    </motion.article>
  );
}
