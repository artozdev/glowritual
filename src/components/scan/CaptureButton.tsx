import { cn } from '@/lib/utils';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/** Bouton obturateur (anneau + disque) pour déclencher la capture. */
export function CaptureButton({ onClick, disabled, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Capturer"
      className={cn(
        'group relative flex h-18 w-18 items-center justify-center rounded-full',
        'transition-transform active:scale-95 disabled:opacity-50',
        className,
      )}
      style={{ width: 72, height: 72 }}
    >
      <span className="absolute inset-0 rounded-full border-4 border-sage-500/40" />
      <span className="h-14 w-14 rounded-full bg-sage-500 shadow-glow transition-colors group-hover:bg-sage-600" />
    </button>
  );
}
