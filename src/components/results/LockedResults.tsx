import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown, Check, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { formatDate } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

const UNLOCKS = [
  'Ton score global et tes points à sublimer',
  'L’analyse détaillée zone par zone',
  'Les points interactifs et le radar',
  'Tes recommandations de produits naturels',
  'Ta routine automatique + le suivi des progrès',
];

/** Nombre de zones détectées par le scan (pour le teaser). */
function zonesDetected(scan: StoredScan): number {
  if (scan.zones?.length) return scan.zones.length;
  const z = new Set(
    scan.analysis.criteria.map((c) => c.zone).filter(Boolean) as string[],
  );
  return z.size || scan.analysis.criteria.length;
}

/**
 * Teaser « résultats verrouillés » pour le plan gratuit.
 *
 * L'utilisateur vient de vivre son scan (l'aha moment) : on lui montre un
 * aperçu FLOUTÉ (score global + nombre de zones détectées) pour créer l'envie,
 * puis l'invitation à passer au Premium. Le statut est vérifié côté serveur.
 */
export function LockedResults({ scan }: { scan: StoredScan }) {
  const zones = zonesDetected(scan);

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-forest">
          Ton analyse est prête ✨
        </h1>
        <p className="mt-1 text-sm text-sage-500">
          Scan du {formatDate(scan.createdAt)} · {zones} zones analysées
        </p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-beige-200 bg-white shadow-soft-lg">
        {/* Teaser flouté : score global + zones détectées */}
        <div
          aria-hidden
          className="pointer-events-none select-none blur-[7px]"
        >
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-mint/25 to-white px-6 py-8">
            <ScoreRing value={scan.overall} size={132} />
            <div className="mt-1 flex gap-2">
              {Array.from({ length: Math.min(zones, 5) }).map((_, i) => (
                <span key={i} className="h-2.5 w-10 rounded-full bg-sage-200" />
              ))}
            </div>
            <div className="mt-2 grid w-full max-w-xs gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sage-300" />
                  <span className="h-2 flex-1 rounded-full bg-beige-200" />
                  <span className="h-2 w-6 rounded-full bg-sage-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voile + carte de déblocage (lisible, cliquable) */}
        <div className="absolute inset-0 flex items-center justify-center bg-forest/30 p-5 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-3xl bg-white/95 p-6 text-center shadow-soft-lg"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-gold">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-forest">
              Débloque ton analyse complète avec Glow Premium
            </h2>
            <p className="mt-1.5 text-sm text-sage-600">
              Ton scan et ses <strong>{zones} zones</strong> sont enregistrés.
              Passe au Premium pour révéler tes résultats.
            </p>

            <ul className="mx-auto mt-4 space-y-2 text-left">
              {UNLOCKS.map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm text-sage-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint">
                    <Check className="h-3 w-3 text-forest" strokeWidth={3} />
                  </span>
                  {u}
                </li>
              ))}
            </ul>

            <Link to="/pricing" className="mt-5 block">
              <Button className="w-full border-0 bg-gold text-forest hover:bg-gold-soft">
                <Crown className="h-4 w-4" />
                Passer au Premium
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link
          to="/scan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-500 hover:text-forest"
        >
          <ScanFace className="h-4 w-4" />
          Refaire un scan
        </Link>
      </div>
    </div>
  );
}
