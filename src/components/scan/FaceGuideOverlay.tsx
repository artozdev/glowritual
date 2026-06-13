import type { ScanKind } from '@/types/domain';

/**
 * Guide de cadrage superposé au flux caméra.
 * Visage : ovale. Corps : cadre arrondi vertical. Avec coins-repères animés.
 */
export function FaceGuideOverlay({ kind }: { kind: ScanKind }) {
  const isFace = kind === 'face';
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={
          isFace
            ? 'relative h-[68%] w-[58%] rounded-[50%] border-2 border-dashed border-white/80'
            : 'relative h-[82%] w-[52%] rounded-[2.5rem] border-2 border-dashed border-white/80'
        }
      >
        {/* Coins-repères */}
        {[
          'left-0 top-0 border-l-2 border-t-2 rounded-tl-xl',
          'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl',
          'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl',
          'right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl',
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-6 w-6 border-sage-300 ${pos}`}
          />
        ))}
      </div>
    </div>
  );
}
