import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

/** Case à cocher arrondie, animée, du design system. */
export function Checkbox({ checked, onChange, label, className }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-200',
        checked
          ? 'border-sage-500 bg-sage-600 text-white'
          : 'border-beige-300 bg-white text-transparent hover:border-sage-300',
        className,
      )}
    >
      <Check
        className={cn(
          'h-4 w-4 transition-transform',
          checked ? 'scale-100' : 'scale-0',
        )}
        strokeWidth={3}
      />
    </button>
  );
}
