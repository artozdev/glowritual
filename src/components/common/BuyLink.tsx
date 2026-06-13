import type { ReactNode } from 'react';
import { resolveAffiliateUrl, recordAffiliateClick } from '@/lib/affiliate';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types/products';

/**
 * Lien d'achat affilié : résout l'URL trackée du produit, enregistre le clic
 * (mesure de performance) et ouvre dans un nouvel onglet. `rel="sponsored"`
 * pour rester transparent sur la nature affiliée du lien.
 */
export function BuyLink({
  product,
  children,
  className,
}: {
  product: Product;
  children: ReactNode;
  className?: string;
}) {
  const { user } = useAuth();
  const { url } = resolveAffiliateUrl(product);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => void recordAffiliateClick(product, user?.id ?? null)}
      className={className}
    >
      {children}
    </a>
  );
}
