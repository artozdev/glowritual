import { useState, type CSSProperties } from 'react';

/**
 * Image avec repli automatique : tente `primary`, bascule sur `fallback`
 * en cas d'erreur de chargement (image manquante / indisponible).
 */
export function Img({
  primary,
  fallback,
  alt,
  className,
  style,
  draggable,
}: {
  primary: string;
  fallback: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
}) {
  const [src, setSrc] = useState(primary);
  return (
    <img
      src={src}
      alt={alt}
      draggable={draggable}
      style={style}
      onError={() => src !== fallback && setSrc(fallback)}
      className={className}
    />
  );
}
