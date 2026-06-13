import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/**
 * Enveloppe d'apparition douce au scroll (fade + montée).
 * Réutilisée dans toutes les sections de la landing.
 */
export function ScrollReveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
