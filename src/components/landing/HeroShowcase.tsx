import { motion } from 'framer-motion';
import { PhoneFrame } from './PhoneFrame';
import { ScanScreen, ResultScreen } from './PhoneScreens';
import { cn } from '@/lib/utils';

/** Bulles d'analyse qui « sortent » du téléphone de résultats. */
const CALLOUTS = [
  { label: 'Hydratation', value: '82', className: 'left-0 top-6' },
  { label: 'Éclat', value: '76', className: 'right-0 top-0' },
  { label: 'Cernes', value: '71', className: 'right-2 top-28' },
];

/**
 * Scène hero : deux téléphones (scan → analyse) reliés par une flèche
 * dessinée, avec des bulles d'analyse flottantes. Inspiré de Cal AI.
 */
export function HeroShowcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto origin-top scale-[0.82] sm:scale-100',
        'h-[440px] w-[316px] -mb-14 sm:-mb-0 sm:h-[500px] sm:w-[440px]',
        className,
      )}
    >
      {/* Téléphone Résultats (arrière, droite) */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 6 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-0"
      >
        <PhoneFrame width={200}>
          <ResultScreen />
        </PhoneFrame>

        {/* Bulles flottantes */}
        {CALLOUTS.map((c, i) => (
          <motion.span
            key={c.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
            className={cn(
              'absolute z-20 flex items-center gap-1.5 rounded-2xl bg-white px-2.5 py-1.5 shadow-soft-lg',
              c.className,
            )}
          >
            <span className="text-[11px] font-semibold text-forest">{c.label}</span>
            <span className="rounded-full bg-mint px-1.5 text-[11px] font-bold text-forest">
              {c.value}
            </span>
          </motion.span>
        ))}
      </motion.div>

      {/* Téléphone Scan (avant, gauche) */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -7 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-12 z-10"
      >
        <PhoneFrame width={200}>
          <ScanScreen />
        </PhoneFrame>
      </motion.div>

      {/* Flèche dessinée */}
      <svg
        viewBox="0 0 120 70"
        className="absolute left-1/2 top-[42%] z-30 h-16 w-24 -translate-x-1/2 text-forest"
        fill="none"
        aria-hidden
      >
        <path
          d="M6 40 C 30 64, 70 64, 96 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0.1 9"
        />
        <path
          d="M86 36 L97 28 L99 41"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
