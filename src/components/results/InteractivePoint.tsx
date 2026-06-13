import { motion } from 'framer-motion';
import type { CriterionResult } from '@/types/domain';
import { cn } from '@/lib/utils';

interface Props {
  criterion: CriterionResult;
  index: number;
  active: boolean;
  onClick: () => void;
}

/**
 * Point vert interactif superposé à l'image, positionné via les coordonnées
 * normalisées du critère. Au survol/focus : aperçu du libellé.
 */
export function InteractivePoint({ criterion, index, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${criterion.label} : ${criterion.score} sur 100`}
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${criterion.position.x * 100}%`,
        top: `${criterion.position.y * 100}%`,
      }}
    >
      {/* Halo pulsé */}
      <motion.span
        className="absolute inset-0 -z-10 rounded-full bg-sage-500/40"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.25 }}
        style={{ width: 18, height: 18, marginLeft: -1, marginTop: -1 }}
      />
      <span
        className={cn(
          'block h-4 w-4 rounded-full border-2 border-white shadow-soft transition-all',
          active ? 'scale-125 bg-sage-600' : 'bg-sage-500 group-hover:scale-110',
        )}
      />
      {/* Bulle libellé */}
      <span
        className={cn(
          'pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-sage-700 shadow-soft transition-opacity',
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        {criterion.label}
      </span>
    </button>
  );
}
