import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Instagram,
  Twitter,
  Facebook,
  Leaf,
  Check,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { StarRating } from '@/components/landing/StarRating';
import { AvatarStack } from '@/components/landing/AvatarStack';
import { HeroShowcase } from '@/components/landing/HeroShowcase';
import { FeatureExplorer } from '@/components/landing/FeatureExplorer';
import { ImpactSection } from '@/components/landing/ImpactSection';
import { BeforeAfterSlider } from '@/components/landing/BeforeAfterSlider';
import {
  TestimonialsCarousel,
  type Testimonial,
} from '@/components/landing/TestimonialsCarousel';
import { Laurels } from '@/components/landing/Laurels';

/* ── Données (placeholders clairement remplaçables) ─────────────── */

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Léa M.',
    color: 'bg-mint text-forest',
    quote:
      'En 3 semaines ma peau est métamorphosée. Les conseils sont précis et 100 % naturels, j’adore.',
  },
  {
    name: 'Thomas R.',
    color: 'bg-forest text-mint',
    quote:
      'Enfin une app qui me dit quoi faire au lieu de me vendre n’importe quoi. Ma routine est suivie au quotidien.',
  },
  {
    name: 'Inès B.',
    color: 'bg-gold text-forest',
    quote:
      'Le scan est hyper précis et les produits recommandés sont top. Mon teint n’a jamais été aussi lumineux.',
  },
  {
    name: 'Karim D.',
    color: 'bg-forest-light text-mint',
    quote:
      'Je suivais 0 routine avant. Maintenant c’est devenu un réflexe et les résultats se voient.',
  },
  {
    name: 'Sarah L.',
    color: 'bg-mint-deep text-forest',
    quote:
      'L’avant/après sur mon propre visage m’a motivée à fond. Bluffant et naturel.',
  },
];

/* ── Page ───────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-forest">
      <Header />
      <Hero />
      <BeforeAfterSection />
      <FeatureExplorer />
      <ImpactSection />
      <TestimonialsSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ── 1. Header ──────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-forest/70 md:flex">
          <a href="#fonctionnalites" className="transition-colors hover:text-forest">
            Fonctionnalités
          </a>
          <a href="#avantages" className="transition-colors hover:text-forest">
            Pourquoi Glow
          </a>
          <a href="#avis" className="transition-colors hover:text-forest">
            Avis
          </a>
        </nav>
        <Link
          to="/auth"
          state={{ mode: 'signup', from: '/scan' }}
          className="rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-sand shadow-soft transition-all hover:bg-forest-dark active:scale-[0.98] sm:px-5"
        >
          Commencer gratuitement
        </Link>
      </div>
    </header>
  );
}

/* ── 2. Hero ────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Halos doux + voile dégradé */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[460px] bg-gradient-to-b from-mint/20 via-sand/40 to-transparent" />
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-mint/40 blur-3xl" />
        <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute left-1/3 top-48 h-64 w-64 rounded-full bg-mint-deep/15 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-12 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-20">
        {/* Texte */}
        <div className="text-center lg:text-left">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-forest/10 bg-white py-1.5 pl-2 pr-4 text-xs font-semibold text-forest shadow-soft">
              <AvatarStack />
              <span className="flex items-center gap-1.5">
                <StarRating size={13} />
                Adoré par +100 utilisateurs
              </span>
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="mt-6 text-5xl font-bold leading-[0.98] tracking-tight text-forest sm:text-6xl lg:text-7xl">
              Révèle ton glow
              <br />
              <span className="bg-gradient-to-r from-forest-light via-mint-deep to-forest-light bg-clip-text text-transparent">
                naturel.
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-forest/70 lg:mx-0">
              Scanne ton visage et ton corps avec l’IA, et reçois une routine
              sur-mesure avec des produits 100 % naturels. Plus beau, plus sain
              — sans chirurgie, sans risque.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/auth"
                state={{ mode: 'signup', from: '/scan' }}
                className="w-full sm:w-auto"
              >
                <button className="w-full rounded-full bg-forest px-7 py-3.5 text-base font-semibold text-sand shadow-soft transition-all hover:bg-forest-dark active:scale-[0.98] sm:w-auto">
                  Commencer gratuitement
                </button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <button className="w-full rounded-full border border-forest/20 bg-white px-7 py-3.5 text-base font-semibold text-forest transition-all hover:bg-sand active:scale-[0.98] sm:w-auto">
                  Se connecter
                </button>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-forest/60 lg:justify-start">
              {['Premier scan gratuit', 'Sans carte bancaire', '100 % naturel'].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-forest-light" />
                    {t}
                  </span>
                ),
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Showcase deux téléphones */}
        <HeroShowcase />
      </div>
    </section>
  );
}

/* ── 3. Avant / Après ───────────────────────────────────────────── */

function BeforeAfterSection() {
  return (
    <section className="bg-sand py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2">
        <ScrollReveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-forest-light">
            Des résultats visibles, naturellement
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Ton meilleur toi, sans bistouri.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest/70">
            Glow analyse chaque zone de ta peau, identifie ce qui peut être
            sublimé, et te guide avec des soins naturels. Le résultat : une peau
            plus douce, plus nette et plus lumineuse — naturellement. Glisse
            pour voir la différence.
          </p>
          <p className="mt-5 text-xs text-forest/50">
            Résultats illustratifs. Ils varient selon chaque personne et la
            régularité de la routine.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <BeforeAfterSlider />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 6. Témoignages ─────────────────────────────────────────────── */

function TestimonialsSection() {
  return (
    <section id="avis" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Ils ont retrouvé confiance.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="mt-12">
          <TestimonialsCarousel items={TESTIMONIALS} />
        </ScrollReveal>

        {/* Bloc de notation global (lauriers) */}
        <ScrollReveal delay={0.1} className="mt-16">
          <div className="mx-auto max-w-md text-center">
            <Laurels>
              <div className="mt-1 flex justify-center">
                <StarRating size={18} />
              </div>
              <p className="mt-3 text-2xl font-bold text-forest">
                Déjà adopté par +100 utilisateurs
              </p>
              <p className="mt-1 text-sm font-semibold text-forest-light">
                au lancement de Glow
              </p>
            </Laurels>
            <p className="mt-4 text-sm text-forest/60">
              Une communauté qui rayonne au naturel.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ── 7. CTA final ───────────────────────────────────────────────── */

/** Fond image de la bannière CTA (repli sur le dégradé si absente). */
function CtaBackground() {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      src="/img/cta-bg.png"
      alt=""
      onError={() => setOk(false)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function FinalCta() {
  return (
    <section id="telecharger" className="px-5 py-12 sm:px-6 sm:py-20">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-forest to-forest-dark px-6 py-16 text-center sm:px-12 sm:py-24">
        {/* Image de fond + voile pour la lisibilité */}
        <CtaBackground />
        <div className="absolute inset-0 bg-forest-dark/55" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mint/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        </div>

        <div className="relative">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-mint backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Ton glow up commence ici
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">
              Commence ton glow up dès aujourd’hui.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/90">
              Ton premier scan est gratuit. Découvre ton potentiel en 30
              secondes.
            </p>

            {/* Boutons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/auth"
                state={{ mode: 'signup', from: '/scan' }}
                className="w-full sm:w-auto"
              >
                <button className="w-full rounded-full bg-white px-7 py-3.5 text-base font-semibold text-forest shadow-soft transition-all hover:bg-sand active:scale-[0.98] sm:w-auto">
                  Commencer gratuitement
                </button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <button className="w-full rounded-full border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98] sm:w-auto">
                  Se connecter
                </button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/70">
              Sans engagement · Annulable à tout moment.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── 8. Footer ──────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-forest-dark text-sand">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Marque */}
          <div className="max-w-xs">
            <span className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint">
                <Leaf className="h-5 w-5 text-forest" strokeWidth={2.4} />
              </span>
              <span className="text-xl font-bold lowercase text-sand">glow</span>
            </span>
            <p className="mt-4 text-sm text-sand/70">
              Ton glow naturel, guidé par l’IA.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sand transition-colors hover:bg-white/20"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens légaux */}
          <nav className="flex flex-col gap-3 text-sm text-sand/70">
            <p className="text-xs font-semibold uppercase tracking-widest text-mint">
              Légal
            </p>
            <a href="#" className="transition-colors hover:text-sand">
              Confidentialité
            </a>
            <a href="#" className="transition-colors hover:text-sand">
              CGU
            </a>
            <a href="#" className="transition-colors hover:text-sand">
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-sand/50">
          <p>
            Glow ne remplace pas l’avis d’un dermatologue ou d’un professionnel
            de santé.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Glow · Avis et chiffres illustratifs.
          </p>
        </div>
      </div>
    </footer>
  );
}
