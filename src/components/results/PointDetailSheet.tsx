import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Info, ShoppingBag, Sparkles, ArrowLeft } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProductCard } from './ProductCard';
import { CRITERION_ICON } from './criterionMeta';
import { scoreBand } from '@/lib/utils';
import { recommendForCriterion } from '@/lib/recommendationEngine';
import { useProfile } from '@/hooks/useProfile';
import type { CriterionResult } from '@/types/domain';

interface Props {
  criterion: CriterionResult | null;
  onClose: () => void;
}

const BAND_LABEL: Record<ReturnType<typeof scoreBand>, string> = {
  excellent: 'Point fort',
  good: 'Déjà très bien',
  nurture: 'À sublimer',
};

/** Fiche détaillée d'un critère : score, explication, recommandation naturelle. */
export function PointDetailSheet({ criterion, onClose }: Props) {
  const { profile } = useProfile();
  const configured = profile.onboardingCompleted;
  const open = criterion !== null;
  const Icon = criterion ? CRITERION_ICON[criterion.id] : Leaf;
  const band = criterion ? scoreBand(criterion.score) : 'good';

  // Recommandation produit adaptée au critère + profil utilisateur.
  const rec = useMemo(
    () => (criterion ? recommendForCriterion(criterion, profile) : null),
    [criterion, profile],
  );

  return (
    <Sheet open={open} onClose={onClose} ariaLabel={criterion?.label}>
      {criterion && (
        <div>
          {/* Bouton retour : ferme la fiche et revient à l'écran d'origine
              (résultats / liste des recommandations). Clé sur mobile. */}
          <button
            type="button"
            onClick={onClose}
            className="-ml-1.5 mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-sage-500 transition-colors hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="flex items-center gap-3 pr-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50">
              <Icon className="h-5 w-5 text-sage-500" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-sage-900">
                {criterion.label}
              </h3>
              <Badge tone={band === 'nurture' ? 'beige' : 'success'}>
                {BAND_LABEL[band]}
              </Badge>
            </div>
          </div>

          {/* Score */}
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-sage-600">Score</span>
              <span className="text-2xl font-semibold tracking-tight text-sage-900">
                {criterion.score}
                <span className="text-sm text-sage-400">/100</span>
              </span>
            </div>
            <ProgressBar value={criterion.score} className="mt-2" />
            {criterion.source === 'heuristic' && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-sage-400">
                <Info className="h-3 w-3" />
                Estimation indicative — affinée avec la détection avancée.
              </p>
            )}
          </div>

          {/* Explication */}
          <p className="mt-5 text-sm leading-relaxed text-sage-700">
            {criterion.explanation}
          </p>

          {/* Recommandation naturelle */}
          <div className="mt-4 rounded-2xl bg-sage-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-sage-800">
              <Leaf className="h-4 w-4 text-sage-500" />
              Conseil naturel
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-sage-700">
              {criterion.recommendation}
            </p>
          </div>

          {/* Recommandation produit naturel */}
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-sage-800">
              <ShoppingBag className="h-4 w-4 text-sage-500" />
              Produit naturel recommandé
            </p>
            {rec ? (
              <>
                <ProductCard rec={rec} />
                {!configured && (
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-beige-50 py-2.5 text-xs font-medium text-sage-600 transition-colors hover:bg-beige-100"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Personnalisez vos préférences pour affiner les conseils
                  </Link>
                )}
              </>
            ) : (
              <p className="rounded-2xl bg-beige-50 p-3 text-sm text-sage-500">
                Aucun produit vérifié ne correspond à vos critères pour ce
                besoin. Ajustez vos préférences dans votre profil.
              </p>
            )}
          </div>

          <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-sage-400">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Recommandations de bien-être : elles ne remplacent pas l’avis d’un
            dermatologue. Faites un test cutané avant toute nouvelle
            application.
          </p>
        </div>
      )}
    </Sheet>
  );
}
