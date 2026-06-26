import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Leaf, Target, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProductCard } from '@/components/results/ProductCard';
import { CRITERION_ICON } from '@/components/results/criterionMeta';
import { goalFor } from '@/lib/glowPlan';
import { recommendForCriterion } from '@/lib/recommendationEngine';
import { cn } from '@/lib/utils';
import type { CriterionResult, Severity } from '@/types/domain';
import type { UserProfile } from '@/types/profile';

const NIVEAU: Record<Severity, { label: string; tone: 'success' | 'beige' }> = {
  healthy: { label: 'Sain', tone: 'success' },
  moderate: { label: 'Modéré', tone: 'beige' },
  marked: { label: 'Marqué', tone: 'beige' },
};

/**
 * Plan par zone : une fiche dépliable par critère/zone — score & niveau,
 * explication, geste naturel, objectif + délai honnête, produit naturel reco.
 * Trié par priorité (à sublimer en premier).
 */
export function ZonePlan({
  criteria,
  profile,
}: {
  criteria: CriterionResult[];
  profile: UserProfile;
}) {
  const ordered = [...criteria].sort((a, b) => b.priority - a.priority);
  const [open, setOpen] = useState<string | null>(ordered[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {ordered.map((c) => {
        const Icon = CRITERION_ICON[c.id];
        const niveau = NIVEAU[c.severity];
        const goal = goalFor(c.id);
        const isOpen = open === c.id;
        const rec = isOpen ? recommendForCriterion(c, profile) : null;
        return (
          <Card key={c.id} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : c.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50">
                <Icon className="h-5 w-5 text-sage-500" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-sage-900">
                    {c.label}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-sage-700">
                    {c.score}
                    <span className="text-xs text-sage-400">/100</span>
                  </span>
                </div>
                <ProgressBar value={c.score} className="mt-1.5 h-1.5" />
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-sage-300 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-4 pb-4">
                    <Badge tone={niveau.tone}>Niveau : {niveau.label}</Badge>
                    <p className="text-sm leading-relaxed text-sage-700">
                      {c.explanation}
                    </p>

                    <div className="rounded-2xl bg-sage-50 p-3">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-sage-800">
                        <Leaf className="h-4 w-4 text-sage-500" />
                        Le geste naturel
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-sage-700">
                        {c.recommendation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-beige-200 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-sage-600">
                          <Target className="h-3.5 w-3.5 text-sage-500" />
                          Objectif
                        </p>
                        <p className="mt-1 text-sm text-sage-700">{goal.objective}</p>
                      </div>
                      <div className="rounded-2xl border border-beige-200 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-sage-600">
                          <Clock className="h-3.5 w-3.5 text-sage-500" />
                          Délai indicatif
                        </p>
                        <p className="mt-1 text-sm text-sage-700">{goal.delay}</p>
                      </div>
                    </div>

                    {rec && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-sage-600">
                          Produit naturel recommandé
                        </p>
                        <ProductCard rec={rec} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
