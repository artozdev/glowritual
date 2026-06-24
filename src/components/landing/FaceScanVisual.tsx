import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Visuel signature de la landing : un « scan » de visage abstrait (wireframe IA)
 * dessiné en SVG — zéro dépendance image. Trait N&B, points d'analyse et ligne de
 * balayage en accent #85ff9c (sage-300). Réutilisé en hero et au centre de la
 * grille de fonctionnalités. Les valeurs affichées sont des repères de zones de
 * soin (hydratation, éclat, douceur), jamais un score de beauté global.
 */

/** Points d'analyse : position (%) + petite valeur de zone (repère de soin). */
const NODES = [
  { x: 33, y: 34, value: 82, side: 'left' as const },
  { x: 70, y: 30, value: 76, side: 'right' as const },
  { x: 62, y: 64, value: 88, side: 'right' as const },
];

export function FaceScanVisual({
  className,
  caption,
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={cn(
        'relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-ink/10 bg-neutral-50',
        className,
      )}
    >
      {/* Halo accent très discret en fond */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-sage-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-sage-300/15 blur-3xl" />

      {/* Wireframe du visage */}
      <svg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        {/* Contour du visage */}
        <path
          d="M200 70 C 268 70, 300 130, 300 210 C 300 300, 258 392, 200 420 C 142 392, 100 300, 100 210 C 100 130, 132 70, 200 70 Z"
          stroke="#0A0A0A"
          strokeOpacity="0.16"
          strokeWidth="1.5"
        />
        {/* Mailles du « mesh » (lignes de repère) */}
        <g stroke="#0A0A0A" strokeOpacity="0.08" strokeWidth="1">
          <path d="M200 70 L200 420" />
          <path d="M120 175 C 170 150, 230 150, 280 175" />
          <path d="M112 250 C 170 230, 230 230, 288 250" />
          <path d="M128 320 C 170 345, 230 345, 272 320" />
          <path d="M150 100 L150 400" />
          <path d="M250 100 L250 400" />
          <path d="M132 210 L200 250 L268 210" />
          <path d="M150 320 L200 300 L250 320" />
        </g>
        {/* Petits nœuds du mesh */}
        <g fill="#0A0A0A" fillOpacity="0.18">
          {[
            [150, 175], [200, 160], [250, 175],
            [132, 250], [200, 250], [268, 250],
            [150, 320], [200, 300], [250, 320],
            [200, 380],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" />
          ))}
        </g>
      </svg>

      {/* Cadre de scanner (coins accent) */}
      <div className="pointer-events-none absolute inset-5">
        {(['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'] as const).map(
          (pos) => (
            <span
              key={pos}
              className={cn('absolute h-6 w-6 rounded-[3px] border-sage-300', pos)}
            />
          ),
        )}
      </div>

      {/* Ligne de balayage animée */}
      <motion.div
        className="pointer-events-none absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-sage-300 to-transparent shadow-[0_0_18px_2px_rgba(133,255,156,0.6)]"
        initial={{ top: '14%' }}
        animate={{ top: ['14%', '84%', '14%'] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Points d'analyse + petites valeurs de zone */}
      {NODES.map((n, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {/* halo pulsé */}
          <motion.span
            className="absolute -inset-2 rounded-full bg-sage-300/30"
            animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}
          />
          <span className="relative block h-2.5 w-2.5 rounded-full bg-sage-300 ring-2 ring-white" />
          {/* pastille de valeur */}
          <span
            className={cn(
              'absolute top-1/2 flex -translate-y-1/2 items-center rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white',
              n.side === 'left' ? 'right-5' : 'left-5',
            )}
          >
            {n.value}
          </span>
        </div>
      ))}

      {/* Légende discrète en bas */}
      {caption && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-[11px] font-medium text-ink/70 backdrop-blur">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-sage-300"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}
