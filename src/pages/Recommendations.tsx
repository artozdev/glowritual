import { Link } from 'react-router-dom';
import { ScanFace, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/results/ProductCard';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useScanSession } from '@/hooks/useScanSession';
import { useProfile } from '@/hooks/useProfile';
import { recommendForCriterion } from '@/lib/recommendationEngine';
import type { ProductRecommendation } from '@/types/products';

export default function Recommendations() {
  const { latest } = useScanSession();
  const { profile } = useProfile();

  if (!latest) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50">
          <ShoppingBag className="h-7 w-7 text-sage-500" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-sage-900">
          Tes recommandations t’attendent
        </h1>
        <p className="mt-2 text-sage-600">
          Fais un scan : on te proposera des produits naturels adaptés à ta peau.
        </p>
        <Link to="/scan" className="mt-6 inline-block">
          <Button size="lg">
            <ScanFace className="h-5 w-5" />
            Commencer mon analyse
          </Button>
        </Link>
      </div>
    );
  }

  // Du plus prioritaire au moins, un produit par critère, dédoublonné.
  const ordered = [...latest.analysis.criteria].sort(
    (a, b) => b.priority - a.priority,
  );
  const seen = new Set<string>();
  const recs: { label: string; rec: ProductRecommendation }[] = [];
  for (const c of ordered) {
    const rec = recommendForCriterion(c, profile);
    if (!rec) continue;
    const key = `${rec.product.brand}-${rec.product.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    recs.push({ label: c.label, rec });
    if (recs.length >= 8) break;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
        Tes recommandations naturelles
      </h1>
      <p className="mt-1 text-sage-600">
        Des produits sains et vérifiés, choisis selon ton analyse et ton profil.
      </p>

      {recs.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {recs.map(({ label, rec }) => (
            <div key={`${rec.product.brand}-${rec.product.name}`}>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-sage-500">
                Pour {label.toLowerCase()}
              </p>
              <ProductCard rec={rec} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-beige-50 p-4 text-sm text-sage-500">
          Aucun produit vérifié ne correspond à tes critères pour le moment.
          Ajuste tes préférences dans ton profil pour affiner les conseils.
        </p>
      )}

      <MedicalDisclaimer className="mt-6" />
    </div>
  );
}
