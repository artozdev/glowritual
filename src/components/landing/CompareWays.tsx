import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { Highlight } from './Highlight';
import { cn } from '@/lib/utils';

/**
 * Section « L'ancienne voie vs la nouvelle voie ».
 * Deux lignes d'étapes : l'ancienne en clair (atténuée), la nouvelle « Glow »
 * sur carte sombre mise en avant avec pastilles accent #85ff9c.
 */
export function CompareWays() {
  const { t } = useTranslation();
  const oldSteps = t('compare.oldSteps', { returnObjects: true }) as string[];
  const newSteps = t('compare.newSteps', { returnObjects: true }) as string[];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('compare.title')} />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-500">
            {t('compare.subtitle')}
          </p>
        </ScrollReveal>

        {/* Ancienne voie */}
        <ScrollReveal delay={0.05} className="mt-14">
          <Row
            title={t('compare.oldTitle')}
            steps={oldSteps}
            stepLabel={(n) => t('compare.stepLabel', { n })}
            tone="old"
          />
        </ScrollReveal>

        {/* Nouvelle voie (mise en avant) */}
        <ScrollReveal delay={0.1} className="mt-6">
          <Row
            title={t('compare.newTitle')}
            tag={t('compare.newTag')}
            steps={newSteps}
            stepLabel={(n) => t('compare.stepLabel', { n })}
            tone="new"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}

function Row({
  title,
  tag,
  steps,
  stepLabel,
  tone,
}: {
  title: string;
  tag?: string;
  steps: string[];
  stepLabel: (n: number) => string;
  tone: 'old' | 'new';
}) {
  const isNew = tone === 'new';
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border p-6 sm:p-8',
        isNew
          ? 'border-ink/10 bg-ink text-white shadow-accent-glow'
          : 'border-ink/10 bg-neutral-50 text-ink',
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[200px,1fr] lg:items-center lg:gap-8">
        {/* Libellé de la voie */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isNew ? 'bg-sage-300 text-ink' : 'bg-neutral-200 text-neutral-500',
            )}
          >
            {isNew ? (
              <Check className="h-5 w-5" strokeWidth={2.6} />
            ) : (
              <X className="h-5 w-5" strokeWidth={2.4} />
            )}
          </span>
          <span className="text-lg font-bold">
            {title}
            {tag && (
              <span className="ml-2 rounded-full bg-sage-300 px-2 py-0.5 align-middle text-xs font-bold text-ink">
                {tag}
              </span>
            )}
          </span>
        </div>

        {/* Étapes */}
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {steps.map((step, i) => (
            <li key={step} className="relative flex gap-3 lg:block">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                    isNew
                      ? 'bg-sage-300 text-ink'
                      : 'bg-neutral-300 text-neutral-600',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-wider',
                    isNew ? 'text-white/45' : 'text-neutral-400',
                  )}
                >
                  {stepLabel(i + 1)}
                </span>
              </div>
              <p
                className={cn(
                  'text-sm font-medium leading-snug lg:mt-2',
                  isNew ? 'text-white' : 'text-neutral-500',
                )}
              >
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
