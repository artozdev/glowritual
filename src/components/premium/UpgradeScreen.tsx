import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Lock,
  Check,
  ScanFace,
  CalendarHeart,
  TrendingUp,
  Gift,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

const PREMIUM_PERKS = [
  'Tes résultats complets débloqués (scores, zones, radar)',
  'Tes recommandations de produits naturels',
  'Ta routine automatique + calendrier',
  'Le suivi de tes progrès & la timeline avant/après',
  'Scans illimités',
];

/**
 * Écran affiché à la place d'une section réservée au Premium.
 * Ton bienveillant : l'utilisateur comprend ce qu'il gagne, sans se sentir piégé.
 */
export function UpgradeScreen({ feature = 'generic' }: { feature?: PremiumFeature }) {
  const f = FEATURES[feature];
  const Icon = f.icon;

  return (
    <div className="mx-auto max-w-md py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-beige-200 bg-white shadow-soft-lg"
      >
        {/* Bandeau */}
        <div className="relative bg-gradient-to-br from-mint/40 to-cream px-6 pb-6 pt-8 text-center">
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
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-sage-600">{f.blurb}</p>
        </div>

        {/* Avantages */}
        <div className="px-6 py-5">
          <p className="text-sm font-semibold text-sage-900">
            En passant Premium, tu débloques :
          </p>
          <ul className="mt-3 space-y-2">
            {PREMIUM_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-sage-700">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint">
                  <Check className="h-3 w-3 text-forest" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <Link to="/pricing" className="mt-5 block">
            <Button className="w-full border-0 bg-gold text-forest hover:bg-gold-soft">
              <Crown className="h-4 w-4" />
              Passer au Premium
            </Button>
          </Link>
          <Link
            to="/scan"
            className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-sage-500 hover:text-forest"
          >
            <ScanFace className="h-4 w-4" />
            Revenir à mon scan gratuit
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
