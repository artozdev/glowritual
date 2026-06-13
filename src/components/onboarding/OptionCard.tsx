import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Carte de sélection (radio ou checkbox) — grosse cible tactile. */
export function OptionCard({
  emoji,
  label,
  hint,
  selected,
  onClick,
}: {
  emoji?: string;
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]',
        selected
          ? 'border-sage-400 bg-sage-50 shadow-soft'
          : 'border-beige-200 bg-white hover:border-sage-200',
      )}
    >
      {emoji && <span className="text-2xl leading-none">{emoji}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-sage-900">{label}</span>
        {hint && <span className="block text-xs text-sage-500">{hint}</span>}
      </span>
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-sage-500 bg-sage-600 text-white' : 'border-beige-300',
        )}
      >
        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
