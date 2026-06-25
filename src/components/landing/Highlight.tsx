import { Fragment } from 'react';
import { cn } from '@/lib/utils';

/**
 * Rend un titre dont certains mots sont mis en valeur. Convention i18n :
 *  - `[mot]` → accent signature #85ff9c (sage-300)
 *  - `{mot}` → atténué (gris/blanc plus léger), pour les nuances de titre
 * Ex. « Révèle ton [glow] naturel, {sans chirurgie} ». Une seule mécanique,
 * lisible côté traduction, qui gère n'importe quelle position des mots.
 */
export function Highlight({
  text,
  className,
  accentClassName,
  mutedClassName,
}: {
  text: string;
  className?: string;
  accentClassName?: string;
  mutedClassName?: string;
}) {
  const tokens = text.split(/(\[[^\]]+\]|\{[^}]+\})/g);
  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        if (tok.startsWith('[') && tok.endsWith(']')) {
          return (
            <span key={i} className={cn('text-sage-300', accentClassName)}>
              {tok.slice(1, -1)}
            </span>
          );
        }
        if (tok.startsWith('{') && tok.endsWith('}')) {
          return (
            <span key={i} className={cn('text-neutral-400', mutedClassName)}>
              {tok.slice(1, -1)}
            </span>
          );
        }
        return <Fragment key={i}>{tok}</Fragment>;
      })}
    </span>
  );
}
