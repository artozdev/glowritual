import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** Variante compacte sur une ligne (ex. pied de page de fiche). */
  compact?: boolean;
};

/**
 * Garde-fou affiché partout où c'est pertinent.
 * Rappel : Glow ne remplace pas un avis médical ou dermatologique.
 */
export function MedicalDisclaimer({ className, compact = false }: Props) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-2xl bg-beige-50 text-sage-700',
        compact ? 'p-3 text-xs' : 'p-4 text-sm',
        'border border-beige-200/70',
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
      <p className="leading-relaxed">
        Glow ne remplace pas un avis médical ou dermatologique. Nos
        suggestions visent uniquement à valoriser votre beauté naturelle.
      </p>
    </div>
  );
}
