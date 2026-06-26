import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { Highlight } from '@/components/landing/Highlight';
import { StarRating } from '@/components/landing/StarRating';
import { AvatarStack } from '@/components/landing/AvatarStack';
import { Img } from '@/components/landing/Img';
import { HERO_BG } from '@/components/landing/media';
import { BeforeAfterSlider } from '@/components/landing/BeforeAfterSlider';
import { ProcessSteps } from '@/components/landing/ProcessSteps';
import { CompareWays } from '@/components/landing/CompareWays';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { TestimonialsCarousel, type Testimonial } from '@/components/landing/TestimonialsCarousel';
import { UsageCarousel } from '@/components/landing/UsageCarousel';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { TawkChat } from '@/components/common/TawkChat';
import { cn } from '@/lib/utils';

/** Compteur honnête de lancement (badge + preuve sociale). */
const USER_COUNT = 100;
/** Destination des CTA d'inscription. */
const SIGNUP_STATE = { mode: 'signup' as const, from: '/scan' };

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-ink antialiased">
      <FloatingNav />
      <Hero />
      <BeforeAfterSection />
      <ProcessSteps />
      <CompareWays />
      <FeatureGrid />
      <TestimonialsSection />
      <DailySection />
      <FinalCta />
      <Footer />
      <TawkChat />
    </div>
  );
}

/* ── 1. Barre de navigation flottante (style Apprise) ───────────── */

function FloatingNav() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#top', label: t('header.home') },
    { href: '#fonctionnalites', label: t('header.features') },
    { href: '#avis', label: t('header.reviews') },
  ];

  // En haut : barre transparente et large (texte blanc sur le hero sombre).
  // Au scroll : pilule blanche rétrécie (texte foncé).
  const linkClass = cn(
    'transition-colors',
    scrolled ? 'text-ink/70 hover:text-ink' : 'text-white/80 hover:text-white',
  );

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300',
        scrolled ? 'px-4 pt-3' : 'px-0 pt-0',
      )}
    >
      <nav
        className={cn(
          'flex w-full items-center justify-between gap-4 border transition-all duration-300',
          scrolled
            ? 'max-w-5xl rounded-full border-ink/10 bg-white/85 px-4 py-2 pl-5 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl'
            : 'max-w-7xl rounded-none border-transparent bg-transparent px-6 py-5',
        )}
      >
        <a href="#top" aria-label="Glow" className="shrink-0">
          <Logo tone={scrolled ? 'image' : 'dark'} className="h-7" />
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </a>
          ))}
          <Link to="/pricing" className={linkClass}>
            {t('header.pricing')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher
            tone={scrolled ? 'light' : 'dark'}
            className="hidden sm:inline-flex"
          />
          <Link to="/auth" state={SIGNUP_STATE}>
            <button
              className={cn(
                'rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]',
                scrolled
                  ? 'bg-ink text-white hover:bg-ink-800'
                  : 'bg-white text-ink hover:bg-white/90',
              )}
            >
              {t('header.cta')}
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}

/* ── 2. Hero ────────────────────────────────────────────────────── */

/** Apparition douce (fondu + montée) au montage du hero. */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};
const EASE = [0.22, 1, 0.36, 1] as const;

function Hero() {
  const { t } = useTranslation();
  const items = t('hero.items', { returnObjects: true }) as {
    title: string;
    text: string;
  }[];

  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Image de fond plein écran (visage côté droit) */}
      <Img
        primary={HERO_BG.primary}
        fallback={HERO_BG.fallback}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
      />
      {/* Voiles pour la lisibilité : sombre à gauche (desktop), renfort global
          sur mobile, et dégradé bas pour les 3 repères. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/10 sm:via-ink/40 sm:to-transparent" />
      <div className="absolute inset-0 bg-ink/35 sm:bg-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />

      {/* Contenu texte (centré verticalement) */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="max-w-xl">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center gap-2 text-sm font-medium text-white/80"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage-300" />
            {t('hero.eyebrow', { count: USER_COUNT })}
          </motion.p>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="mt-5 text-balance font-montserrat text-5xl font-light leading-[1.1] text-white sm:text-6xl lg:text-7xl"
          >
            <Highlight text={t('hero.title')} />
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            className="mt-7 flex flex-col gap-3 sm:flex-row"
          >
            <Link to="/auth" state={SIGNUP_STATE} className="w-full sm:w-auto">
              <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] sm:w-auto">
                {t('hero.ctaPrimary')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
            <a href="#process" className="w-full sm:w-auto">
              <button className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-ink/40 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-ink/60 active:scale-[0.98] sm:w-auto">
                {t('hero.ctaSecondary')}
              </button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* 3 repères en bas, séparés par des traits */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
        className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 sm:pb-20"
      >
        <div className="grid grid-cols-1 divide-y divide-white/15 border-t border-white/15 pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map((it) => (
            <div key={it.title} className="py-3 sm:px-6 sm:py-0 sm:first:pl-0">
              <p className="text-sm font-semibold text-white">{it.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">{it.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ── 3. Avant / Après ───────────────────────────────────────────── */

function BeforeAfterSection() {
  const { t } = useTranslation();
  return (
    <section id="demo" className="scroll-mt-24 bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {t('beforeAfter.eyebrow')}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('beforeAfter.title')} />
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-500">
            {t('beforeAfter.body')}
          </p>
          <p className="mt-5 text-xs text-neutral-400">
            {t('beforeAfter.disclaimer')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <BeforeAfterSlider className="mx-auto max-w-md lg:max-w-none" />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 6. Témoignages ─────────────────────────────────────────────── */

function TestimonialsSection() {
  const { t } = useTranslation();
  const items = t('testimonials.items', { returnObjects: true }) as Testimonial[];

  return (
    <section id="avis" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-md text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('testimonials.title')} />
          </h2>
          <div className="flex items-center gap-3">
            <AvatarStack />
            <div>
              <StarRating size={14} />
              <p className="mt-0.5 text-xs font-medium text-neutral-500">
                {t('hero.rating')} · {t('testimonials.ratingNote')}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="mt-12">
          <TestimonialsCarousel items={items} />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 7. Quotidien + FAQ ─────────────────────────────────────────── */

function DailySection() {
  const { t } = useTranslation();
  return (
    <section className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {t('daily.eyebrow')}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <Highlight text={t('daily.title')} />
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-500">
            <StarRating size={14} />
            <span>
              {t('hero.rating')} · {t('daily.note', { count: USER_COUNT })}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="mt-12">
          <UsageCarousel />
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mt-20">
          <FaqAccordion />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 8. CTA final (fond noir) ───────────────────────────────────── */

function FinalCta() {
  const { t } = useTranslation();
  return (
    <section className="bg-white px-5 pb-16 pt-4 sm:px-6">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center sm:px-12 sm:py-24">
        {/* Halo accent discret */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sage-300/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-sage-300/10 blur-3xl" />
        </div>

        <ScrollReveal className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            <Highlight text={t('finalCta.title')} />
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
            {t('finalCta.subtitle')}
          </p>

          <div className="mt-9 flex justify-center">
            <Link to="/auth" state={SIGNUP_STATE} className="w-full sm:w-auto">
              <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-ink transition-all hover:bg-neutral-100 active:scale-[0.98] sm:w-auto">
                {t('finalCta.cta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>

          <p className="mt-5 text-xs text-white/50">{t('finalCta.note')}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 9. Footer ──────────────────────────────────────────────────── */

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo tone="dark" />
            <p className="mt-4 text-sm text-white/60">{t('footer.tagline')}</p>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-300">
              {t('footer.legalTitle')}
            </p>
            <Link to="/legal/confidentialite" className="transition-colors hover:text-white">
              {t('footer.privacy')}
            </Link>
            <Link to="/legal/cgu" className="transition-colors hover:text-white">
              {t('footer.terms')}
            </Link>
            <Link to="/legal/mentions-legales" className="transition-colors hover:text-white">
              {t('footer.legalNotice')}
            </Link>
            <a href="mailto:glowritualio@gmail.com" className="transition-colors hover:text-white">
              {t('footer.contact')}
            </a>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/45">
          <p>{t('footer.disclaimer')}</p>
          <p className="mt-2">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
