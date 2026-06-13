import { motion } from 'framer-motion';
import { clamp, cn } from '@/lib/utils';

interface Props {
  /** Valeur 0..100. */
  value: number;
  className?: string;
  barClassName?: string;
}

/** Barre de progression animée. */
export function ProgressBar({ value, className, barClassName }: Props) {
  const v = clamp(value);
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-beige-100', className)}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn('h-full rounded-full bg-sage-500', barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}
