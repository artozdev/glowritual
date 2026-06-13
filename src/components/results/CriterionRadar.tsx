import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import type { CriterionResult } from '@/types/domain';
import { FACE_CONTENT, BODY_CONTENT } from '@/lib/recommendations';

/** Libellé court d'un critère pour les axes du radar. */
function shortLabel(id: CriterionResult['id']): string {
  const all = { ...FACE_CONTENT, ...BODY_CONTENT } as Record<
    string,
    { short: string }
  >;
  return all[id]?.short ?? id;
}

/** Graphique radar des critères (score par axe). */
export function CriterionRadar({ criteria }: { criteria: CriterionResult[] }) {
  const data = criteria.map((c) => ({ label: shortLabel(c.id), score: c.score }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e9ddc8" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#0f7a37', fontSize: 11, fontWeight: 500 }}
          />
          <Radar
            dataKey="score"
            stroke="#16a34a"
            strokeWidth={2}
            fill="#45dd74"
            fillOpacity={0.3}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
