import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Rangée de 5 étoiles pleines (preuve sociale).
 * Noir par défaut (esprit N&B) — surcharge possible via `className`
 * (ex. `text-white fill-white` sur fond sombre).
 */
export function StarRating({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-0.5 text-ink', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className="fill-current"
        />
      ))}
    </div>
  );
}
