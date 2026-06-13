import { useEffect, useState } from 'react';
import {
  Star,
  ShieldCheck,
  ExternalLink,
  Droplet,
  Droplets,
  FlaskConical,
  Flower2,
  Layers,
  Pill,
  Wand2,
  HeartPulse,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BuyLink } from '@/components/common/BuyLink';
import {
  verifyComposition,
  type CompositionVerdict,
} from '@/lib/openBeautyFacts';
import type { ProductCategory, ProductRecommendation } from '@/types/products';

const CATEGORY_ICON: Record<ProductCategory, LucideIcon> = {
  cream: Droplet,
  serum: FlaskConical,
  oil: Droplets,
  balm: Flower2,
  mask: Layers,
  supplement: Pill,
  tool: Wand2,
  wellness: HeartPulse,
};

/** Carte produit affichée dans la fiche d'un point d'amélioration. */
export function ProductCard({ rec }: { rec: ProductRecommendation }) {
  const { product, reason } = rec;
  const [imgError, setImgError] = useState(false);
  const [verdict, setVerdict] = useState<CompositionVerdict | null>(null);

  const Icon = CATEGORY_ICON[product.category];

  // Vérifie la composition (Open Beauty Facts si code-barres, sinon interne).
  useEffect(() => {
    let active = true;
    verifyComposition(product.ingredients, product.barcode).then((v) => {
      if (active) setVerdict(v);
    });
    return () => {
      active = false;
    };
  }, [product.ingredients, product.barcode]);

  return (
    <div className="overflow-hidden rounded-2xl border border-beige-200/70 bg-white">
      {/* En-tête : visuel + identité */}
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sage-100 to-beige-100">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon className="h-8 w-8 text-sage-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sage-400">
            {product.brand}
          </p>
          <p className="text-sm font-semibold leading-snug text-sage-900">
            {product.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-sage-700">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-sage-400">
              ({product.reviewCount.toLocaleString('fr-FR')} avis)
            </span>
            <span className="ml-auto text-sm font-semibold text-sage-900">
              {product.price} €
            </span>
          </div>
        </div>
      </div>

      {/* Labels naturels */}
      {product.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3">
          {product.labels.map((l) => (
            <Badge key={l} tone="success">
              <Leaf className="h-3 w-3" />
              {l}
            </Badge>
          ))}
        </div>
      )}

      {/* Explication personnalisée */}
      <p className="px-3 pt-3 text-sm leading-relaxed text-sage-700">{reason}</p>

      {/* Ingrédients clés bénéfiques */}
      <div className="px-3 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sage-400">
          Ingrédients clés
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {product.keyIngredients.map((k) => (
            <span
              key={k.name}
              className="rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700"
              title={k.benefit}
            >
              {k.name}
            </span>
          ))}
        </div>
      </div>

      {/* Vérification de composition */}
      <div className="flex items-center gap-1.5 px-3 pt-3 text-[11px] text-sage-500">
        <ShieldCheck className="h-3.5 w-3.5 text-sage-500" />
        {verdict === null
          ? 'Vérification de la composition…'
          : verdict.verifiedVia === 'openbeautyfacts'
            ? 'Composition vérifiée via Open Beauty Facts'
            : 'Composition vérifiée (sans ingrédient à risque)'}
      </div>

      {/* Action (lien affilié) */}
      <div className="p-3">
        <BuyLink product={product}>
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-4 w-4" />
            Voir le produit
          </Button>
        </BuyLink>
        <p className="mt-2 text-center text-[10px] text-sage-400">
          Lien partenaire — Glow peut percevoir une commission, sans coût pour
          vous.
        </p>
      </div>
    </div>
  );
}
