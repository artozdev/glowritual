import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { Highlight } from '@/components/landing/Highlight';
import { StarRating } from '@/components/landing/StarRating';
import { AvatarStack } from '@/components/landing/AvatarStack';
import { FaceScanVisual } from '@/components/landing/FaceScanVisual';
import { BeforeAfterSlider } from '@/components/landing/BeforeAfterSlider';
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#top', label: t('header.home') },
    { href: '#fonctionnalites', label: t('header.features') },
    { href: '#avis', label: t('header.reviews') },
  ];

  return (
    <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-4">
      <nav
        className={cn(
          'flex w-full max-w-4xl items-center justify-between gap-4 rounded-full border border-ink/10 py-2 pl-5 pr-2 backdrop-blur-xl transition-all duration-300',
          scrolled
            ? 'bg-white/85 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.35)]'
            : 'bg-white/65',
        )}
      >
        <a href="#top" aria-label="Glow" className="shrink-0">
          <Logo className="h-7" />
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
          <Link to="/pricing" className="transition-colors hover:text-ink">
            {t('header.pricing')}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link to="/auth" state={SIGNUP_STATE}>
            <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98]">
              {t('header.cta')}
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}

/* ── 2. Hero ────────────────────────────────────────────────────── */

function Hero() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -56]);

  // Badge « Nouveau · texte » → puce sombre + texte.
  const badge = t('hero.badge');
  const [badgeTag, ...badgeRest] = badge.split(' · ');
  const badgeText = badgeRest.join(' · ');

  return (
    <section
      id="top"
      ref={ref}
      className="relative overflow-hidden scroll-mt-24 pb-16 pt-28 sm:pb-24 sm:pt-36"
    >
      {/* Halo accent discret */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sage-300/20 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-10">
        {/* Texte */}
        <div className="text-center lg:text-left">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1 pl-1 pr-3.5 text-sm font-medium text-ink/70 shadow-sm">
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">
                {badgeTag}
              </span>
              {badgeText}
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              <Highlight text={t('hero.title')} />
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-500 lg:mx-0">
              {t('hero.subtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/auth" state={SIGNUP_STATE} className="w-full sm:w-auto">
                <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] sm:w-auto">
                  {t('hero.ctaPrimary')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-7 py-3.5 text-base font-semibold text-ink transition-all hover:bg-neutral-50 active:scale-[0.98] sm:w-auto">
                  <Play className="h-4 w-4 fill-current" />
                  {t('hero.ctaSecondary')}
                </button>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <AvatarStack />
              <div className="text-left">
                <StarRating size={14} />
                <p className="mt-0.5 text-xs font-medium text-neutral-500">
                  {t('hero.rating')} · {t('hero.social', { count: USER_COUNT })}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Visuel showcase (parallax léger) */}
        <motion.div style={{ y: visualY }} className="relative">
          <ScrollReveal delay={0.1}>
            <FaceScanVisual
              caption={t('features.scanCaption')}
              className="mx-auto max-w-sm shadow-soft-lg lg:max-w-md"
            />
          </ScrollReveal>
        </motion.div>
      </div>
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
            <Logo className="h-8" />
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
