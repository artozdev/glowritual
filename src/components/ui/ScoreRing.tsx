import { cn } from '@/lib/utils';
import { clamp } from '@/lib/utils';

type Props = {
  /** Score 0–100. */
  value: number;
  size?: number;
  /** Épaisseur de l'anneau en px. */
  stroke?: number;
  label?: string;
  className?: string;
};

/**
 * Jauge circulaire en dégradé (conic-gradient) avec centre blanc.
 * Légère, sans SVG : l'anneau est peint en CSS.
 */
export function ScoreRing({
  value,
  size = 120,
  stroke = 10,
  label = 'Score global',
  className,
}: Props) {
  const v = clamp(value);
  const deg = (v / 100) * 360;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label} : ${v} sur 100`}
    >
      {/* Anneau */}
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(#45dd74 ${deg}deg, #d6fbe1 ${deg}deg)`,
        }}
      />
      {/* Disque central */}
      <div
        className="absolute rounded-full bg-white shadow-soft"
        style={{ inset: stroke }}
      />
      {/* Valeur */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-sage-900">
          {v}
        </span>
        <span className="-mt-0.5 text-[10px] font-medium uppercase tracking-wide text-sage-400">
          /100
        </span>
      </div>
    </div>
  );
}
