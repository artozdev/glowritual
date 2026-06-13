import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Libellé accessible du panneau. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Panneau modal : bottom-sheet sur mobile, dialog centré sur desktop.
 * Ferme au clic sur le fond, à la touche Échap, et verrouille le scroll.
 */
export function Sheet({ open, onClose, children, ariaLabel, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Fond */}
          <motion.div
            className="absolute inset-0 bg-sage-900/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panneau */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              'relative z-10 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-soft-lg',
              'sm:m-4 sm:rounded-3xl',
              className,
            )}
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            {/* Poignée mobile */}
            <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-beige-200 sm:hidden" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-beige-50 text-sage-500 transition-colors hover:bg-beige-100"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
