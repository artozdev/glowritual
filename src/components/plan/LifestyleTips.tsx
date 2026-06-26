import { Moon, Droplets, Salad, Wind, Footprints, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { lifestyleTips, type LifestyleTip } from '@/lib/glowPlan';
import type { UserProfile } from '@/types/profile';

const ICON: Record<LifestyleTip['key'], LucideIcon> = {
  sleep: Moon,
  hydration: Droplets,
  nutrition: Salad,
  stress: Wind,
  movement: Footprints,
};

/**
 * Conseils transverses (hygiène de vie) : sommeil, hydratation, alimentation
 * générale (jamais prescrite), stress, mouvement — dérivés de l'onboarding.
 */
export function LifestyleTips({ profile }: { profile: UserProfile }) {
  const tips = lifestyleTips(profile);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tips.map((tip) => {
        const Icon = ICON[tip.key];
        return (
          <Card key={tip.key} className="flex gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-50">
              <Icon className="h-5 w-5 text-sage-500" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sage-900">{tip.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-sage-600">
                {tip.text}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
