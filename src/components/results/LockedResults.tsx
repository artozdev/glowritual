import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown, Check, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

const UNLOCKS = [
  'Ton score global et tes points à sublimer',
  'L’analyse détaillée zone par zone',
  'Les points interactifs et le radar',
  'Tes recommandations de produits naturels',
  'Ta routine automatique + le suivi des progrès',
];

/**
 * Écran « résultats verrouillés » pour le plan gratuit.
 *
 * Les scores ne sont volontairement PAS rendus dans le DOM : l'utilisateur
 * gratuit voit sa photo (floutée) et une invitation à passer au Premium.
 * Le statut Premium est vérifié via Supabase (table `subscriptions`).
 */
export function LockedResults({ scan }: { scan: StoredScan }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-forest">
          Ton analyse est prête ✨
        </h1>
        <p className="mt-1 text-sm text-sage-500">
          Scan du {formatDate(scan.createdAt)} · Visage
        </p>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-beige-200 bg-sand shadow-soft-lg">
        {/* Photo floutée (ou dégradé) */}
        <div className="aspect-[4/5] w-full">
          {scan.image ? (
            <img
              src={scan.image}
              alt=""
              aria-hidden
              className="h-full w-full scale-110 object-cover blur-xl"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-mint/40 to-sand" />
          )}
        </div>

        {/* Voile + carte de déblocage */}
        <div className="absolute inset-0 flex items-center justify-center bg-forest/35 p-5 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm rounded-3xl bg-white/95 p-6 text-center shadow-soft-lg"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-gold">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-forest">
              Débloque ton analyse complète avec Glow Premium
            </h2>
            <p className="mt-1.5 text-sm text-sage-600">
              Ton scan est enregistré. Passe au Premium pour révéler tes
              résultats.
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
          Retour au scan
        </Link>
      </div>
    </div>
  );
}
