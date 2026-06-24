import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/**
 * Rend un titre dont le(s) mot(s)-clé(s) sont mis en accent (#85ff9c = sage-300,
 * couleur signature partagée avec l'app). La convention i18n place le mot accentué
 * entre crochets, ex. « Révèle ton [glow] naturel ». Une seule mécanique, qui gère
 * n'importe quelle position du mot dans la phrase et reste lisible côté traduction.
 */
export function Highlight({
  text,
  className,
  accentClassName,
}: {
  text: string;
  className?: string;
  accentClassName?: string;
}) {
  // Découpe en segments alternés : texte normal / [accentué].
  const parts = text.split(/\[(.+?)\]/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={cn('text-sage-300', accentClassName)}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
