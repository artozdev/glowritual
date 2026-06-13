import type { ReactNode } from 'react';

/** Une branche de laurier stylisée (réutilisée en miroir). */
function Branch({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 44 96"
      className="h-24 w-auto text-forest/70"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
      fill="currentColor"
    >
      {/* Tige */}
      <path
        d="M36 94 C 16 74, 14 40, 30 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Feuilles */}
      {[
        [33, 14, -35],
        [27, 26, -30],
        [22, 40, -22],
        [19, 54, -14],
        [18, 68, -6],
        [20, 82, 2],
      ].map(([cx, cy, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="8"
          ry="3.4"
          transform={`rotate(${rot} ${cx} ${cy})`}
        />
      ))}
    </svg>
  );
}

/**
 * Bloc de notation global « façon Cal AI » : deux lauriers encadrant
 * une note mise en valeur.
 */
export function Laurels({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-5">
      <Branch />
      <div className="text-center">{children}</div>
      <Branch flip />
    </div>
  );
}
