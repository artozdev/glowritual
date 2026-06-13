import { useState, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  globalSeries,
  criterionSeries,
  availableCriteria,
  CRITERION_LABEL,
} from '@/lib/progress';
import { cn } from '@/lib/utils';
import type { CriterionId, StoredScan } from '@/types/domain';

type Metric = 'global' | CriterionId;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-sage-600 text-white'
          : 'bg-beige-100 text-sage-600 hover:bg-beige-200',
      )}
    >
      {children}
    </button>
  );
}

/** Courbe d'évolution : score global ou par critère, sélectionnable. */
export function EvolutionChart({ history }: { history: StoredScan[] }) {
  const [metric, setMetric] = useState<Metric>('global');
  const criteria = availableCriteria(history);

  const data =
    metric === 'global'
      ? globalSeries(history)
      : criterionSeries(history, metric);
  const label = metric === 'global' ? 'Score global' : CRITERION_LABEL[metric];

  return (
    <div>
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <Chip active={metric === 'global'} onClick={() => setMetric('global')}>
          Global
        </Chip>
        {criteria.map((c) => (
          <Chip
            key={c.id}
            active={metric === c.id}
            onClick={() => setMetric(c.id)}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ddc8" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#0f7a37', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#0f7a37', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: '1px solid #e9ddc8',
                fontSize: 12,
              }}
              labelStyle={{ color: '#0f7a37', fontWeight: 600 }}
              formatter={(v: number) => [`${v}/100`, label]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#16a34a' }}
              activeDot={{ r: 6 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
