import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Rangée de 5 étoiles pleines (preuve sociale). */
export function StarRating({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className="fill-gold text-gold"
        />
      ))}
    </div>
  );
}
