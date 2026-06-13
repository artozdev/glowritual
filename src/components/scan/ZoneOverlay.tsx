import { motion } from 'framer-motion';
import { projectBox, type Box } from '@/lib/faceMetrics';
import type { QualityResult } from '@/lib/scanZones';

interface Props {
  /** Boîte de la zone (normalisée, espace vidéo) ou null si pas de visage. */
  box: Box | null;
  shape: 'oval' | 'rect';
  quality: QualityResult;
  /** Taille du conteneur d'affichage (px). */
  container: { w: number; h: number };
  /** Taille native de la vidéo (px). */
  video: { w: number; h: number };
}

const TONE_BORDER: Record<QualityResult['tone'], string> = {
  good: 'border-[#b6ffc4]',
  warn: 'border-rose-300/90',
  idle: 'border-white/70',
};

/**
 * Cadre de détection superposé au flux, positionné dynamiquement à partir
 * des repères. Rouge/neutre quand mal cadré, menthe quand la zone est validée.
 */
export function ZoneOverlay({ box, shape, quality, container, video }: Props) {
  const isGood = quality.tone === 'good';
  const radius = shape === 'oval' ? '48% / 42%' : '1.5rem';

  // Repli : pas de visage / dimensions inconnues → guide centré en pointillés.
  if (!box || !container.w || !video.w) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[64%] w-[58%] border-2 border-dashed border-white/70"
          style={{ borderRadius: shape === 'oval' ? '48% / 42%' : '1.5rem' }}
        />
      </div>
    );
  }

  const rect = projectBox(box, video.w, video.h, container.w, container.h, true);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className={`absolute border-2 ${TONE_BORDER[quality.tone]}`}
        style={{ borderRadius: radius }}
        animate={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          boxShadow: isGood
            ? '0 0 0 9999px rgba(15,42,28,0.45), 0 0 24px 4px rgba(182,255,196,0.55)'
            : '0 0 0 9999px rgba(15,42,28,0.32)',
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.12 }}
      >
        {/* Coins-repères */}
        {[
          'left-0 top-0 border-l-2 border-t-2 rounded-tl-lg',
          'right-0 top-0 border-r-2 border-t-2 rounded-tr-lg',
          'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg',
          'right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg',
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-5 w-5 ${
              isGood ? 'border-[#b6ffc4]' : 'border-white/80'
            } ${pos}`}
          />
        ))}

        {/* Halo pulsé quand la zone est validée */}
        {isGood && (
          <motion.span
            className="absolute inset-0"
            style={{ borderRadius: radius }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <span
              className="absolute inset-0 border-2 border-[#b6ffc4]"
              style={{ borderRadius: radius }}
            />
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
