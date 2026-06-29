import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const SIGNUP_STATE = { mode: 'signup' as const, from: '/pricing' };
const PAYMENTS = ['Visa', 'Mastercard', 'Stripe', 'PayPal', 'Apple Pay'];

type PricingItem = { title: string; text: string; soon?: boolean };

/**
 * Section tarifs « ancrage de prix » (inspirée Qoves) — adaptée à Glow :
 * N&B premium, accent #85ff9c uniquement sur les coches + le prix réel.
 * Ton bienveillant/naturel (oppose le prix juste aux formations chères,
 * sans dénigrer). Avant/après = résultats réels, jamais une projection IA.
 */
export function PricingSection() {
  const { t } = useTranslation();
  const items = t('pricing.items', { returnObjects: true }) as PricingItem[];

  return (
    <section id="tarifs" className="scroll-mt-24 bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        {/* Titre — ancrage de prix */}
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            {t('pricing.titlePre')}
            <s className="font-semibold text-neutral-400">{t('pricing.old')}</s>
            {t('pricing.titleMid')}{' '}
            {t('pricing.glow')}
            <span className="text-sage-300">{t('pricing.price')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-neutral-500">
            {t('pricing.subtitle')}
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Avantages */}
          <ScrollReveal>
            <ul className="space-y-6">
              {items.map((it) => (
                <li key={it.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-300/20">
                    <Check className="h-4 w-4 text-sage-400" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                      {it.title}
                      {it.soon && (
                        <span className="rounded-full border border-ink/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                          {t('pricing.soon')}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                      {it.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Carte abonnement */}
          <ScrollReveal delay={0.1}>
            <div>
              <div className="relative overflow-hidden rounded-[2rem] border border-ink/5 bg-gradient-to-br from-neutral-100 via-white to-neutral-50 p-8 shadow-soft-lg">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sage-300/10 blur-3xl" />
                <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {t('pricing.cardName')}
                </p>
                <div className="relative mt-10 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-ink">
                    {t('pricing.price')}
                  </span>
                </div>
                <p className="relative mt-2 text-sm font-medium text-neutral-500">
                  {t('pricing.annual')}
                </p>
                <p className="relative mt-4 text-sm text-neutral-500">
                  {t('pricing.reassurance')}
                </p>
              </div>

              {/* Paiements + CTA */}
              <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-neutral-400">
                  {PAYMENTS.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </div>
                <Link to="/auth" state={SIGNUP_STATE} className="w-full sm:w-auto">
                  <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] sm:w-auto">
                    {t('pricing.cta')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
