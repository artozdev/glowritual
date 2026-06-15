import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Lock,
  ScanFace,
  CalendarHeart,
  TrendingUp,
  Gift,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PremiumPlanCard } from './PremiumPlanCard';
import { useCheckout } from './useCheckout';

export type PremiumFeature = 'routine' | 'progress' | 'ambassador' | 'generic';

const FEATURES: Record<
  PremiumFeature,
  { icon: LucideIcon; title: string; blurb: string }
> = {
  routine: {
    icon: CalendarHeart,
    title: 'Ta routine & ton calendrier',
    blurb:
      'Une routine naturelle générée à partir de ton scan, avec rappels et calendrier pour t’y tenir en douceur.',
  },
  progress: {
    icon: TrendingUp,
    title: 'Ton suivi & ta timeline',
    blurb:
      'Compare tes scans dans le temps et visualise tes progrès avant/après, mois après mois.',
  },
  ambassador: {
    icon: Gift,
    title: 'Le programme ambassadeur',
    blurb: 'Ton code promo à partager et le suivi de tes récompenses.',
  },
  generic: {
    icon: Sparkles,
    title: 'Cette section',
    blurb: 'Cette fonctionnalité fait partie de Glow Premium.',
  },
};

/**
 * Écran affiché à la place d'une section réservée au Premium.
 * Bandeau bienveillant + les deux formules (mensuel / annuel) côte à côte.
 */
export function UpgradeScreen({ feature = 'generic' }: { feature?: PremiumFeature }) {
  const f = FEATURES[feature];
  const Icon = f.icon;
  const { busy, error, goCheckout } = useCheckout();

  return (
    <div className="mx-auto max-w-3xl py-2">
      {/* Bandeau */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint/40 to-cream px-6 py-8 text-center shadow-soft"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-gold shadow-soft">
          <Icon className="h-7 w-7" />
        </span>
        <span className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-forest shadow-soft">
          <Lock className="h-4 w-4" />
        </span>
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-forest">
          <Crown className="h-3 w-3 text-gold" />
          Glow Premium ✨
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-forest">
          {f.title}
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-sage-600">{f.blurb}</p>
      </motion.div>

      <p className="mt-6 text-center text-sm font-semibold text-sage-900">
        Choisis ta formule et débloque tout Glow
      </p>

      {error && (
        <p className="mx-auto mt-3 max-w-md rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Deux formules côte à côte */}
      <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2">
        <PremiumPlanCard
          interval="monthly"
          busy={busy === 'monthly'}
          disabled={busy !== null}
          onSelect={() => goCheckout('monthly')}
        />
        <PremiumPlanCard
          interval="annual"
          busy={busy === 'annual'}
          disabled={busy !== null}
          onSelect={() => goCheckout('annual')}
        />
      </div>

      <div className="mt-5 text-center">
        <Link
          to="/scan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-500 hover:text-forest"
        >
          <ScanFace className="h-4 w-4" />
          Revenir à mon scan gratuit
        </Link>
      </div>
    </div>
  );
}
