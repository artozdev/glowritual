import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Lock, ScanFace, Sparkles, Wand2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { GuidedScan, type GuidedScanResult } from '@/components/scan/GuidedScan';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { ZONE_STEPS } from '@/lib/scanZones';
import { useScanSession } from '@/hooks/useScanSession';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { analyze, seedFromLandmarks } from '@/lib/analysis';
import { uid } from '@/lib/utils';
import type { NormalizedPoint, StoredScan } from '@/types/domain';

const FREE_SCAN_LIMIT = 1;

export default function Scan() {
  const navigate = useNavigate();
  const { saveScan, realScanCount } = useScanSession();
  const { user, upgradeDemo, isConfigured } = useAuth();
  const { profile } = useProfile();

  const [started, setStarted] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium = user?.plan === 'premium';
  const canScan = isPremium || realScanCount < FREE_SCAN_LIMIT;

  /** Construit l'analyse à partir des repères + zones, puis ouvre les résultats. */
  function buildAndSave(
    image: string | null,
    landmarks: NormalizedPoint[] | null,
    result?: GuidedScanResult,
  ) {
    const seed = landmarks
      ? seedFromLandmarks(landmarks)
      : Math.floor(Math.random() * 1_000_000_000);
    const analysis = analyze({ kind: 'face', seed, landmarks, profile });

    const scan: StoredScan = {
      id: uid(),
      kind: 'face',
      image,
      seed,
      overall: analysis.overall,
      analysis,
      createdAt: new Date().toISOString(),
      zones: result?.zones,
      conditions: result?.conditions,
    };
    saveScan(scan);
    navigate(`/results/${scan.id}`);
  }

  function handleComplete(result: GuidedScanResult) {
    buildAndSave(result.image, result.landmarks, result);
  }

  function startScan() {
    if (!canScan) {
      setShowUpgrade(true);
      return;
    }
    setStarted(true);
  }

  // ── Parcours de scan guidé en cours ──────────────────────────────
  if (started) {
    return (
      <div className="mx-auto max-w-xl">
        <GuidedScan onComplete={handleComplete} onExit={() => setStarted(false)} />
      </div>
    );
  }

  // ── Écran d'accueil du scan ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
          {profile.displayName
            ? `Prêt·e, ${profile.displayName} ?`
            : 'Analyse guidée du visage'}
        </h1>
        <p className="mt-1.5 text-sage-600">
          Un parcours étape par étape, zone par zone, pour une analyse précise.
          Tout se passe sur votre appareil — vos photos ne quittent jamais le
          téléphone.
        </p>
        <div className="mt-3 flex justify-center">
          {isPremium ? (
            <Badge tone="sage">
              <Crown className="h-3 w-3" />
              Premium · scans illimités
            </Badge>
          ) : (
            <Badge tone="muted">
              Offre gratuite · {Math.min(realScanCount, FREE_SCAN_LIMIT)}/
              {FREE_SCAN_LIMIT} scan utilisé
            </Badge>
          )}
        </div>
      </div>

      {/* Aperçu des étapes */}
      <div className="mt-6 rounded-3xl border border-beige-200 bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 text-sm font-semibold text-sage-900">
          <Wand2 className="h-4 w-4 text-sage-500" />
          Les {ZONE_STEPS.length} étapes du scan
        </p>
        <ol className="mt-3 grid gap-2">
          {ZONE_STEPS.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-beige-50 px-3 py-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sage-900">{s.title}</p>
                <p className="truncate text-xs text-sage-500">{s.instruction}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-sage-50 px-3 py-2.5 text-xs text-sage-600">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" />
          Placez-vous face à une source de lumière douce. Le cadre devient vert
          quand la zone est bien positionnée : restez immobile, la capture est
          automatique.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button size="lg" className="w-full sm:w-auto" onClick={startScan}>
          <ScanFace className="h-5 w-5" />
          Commencer le scan guidé
        </Button>
        <button
          type="button"
          onClick={() => {
            if (!canScan) {
              setShowUpgrade(true);
              return;
            }
            buildAndSave(null, null);
          }}
          className="text-sm font-medium text-sage-500 underline-offset-4 hover:text-sage-700 hover:underline"
        >
          Analyser une photo de démonstration
        </button>
      </div>

      <MedicalDisclaimer className="mt-8" />

      {/* Invitation Premium (quota gratuit atteint) */}
      <Sheet
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        ariaLabel="Passer en Premium"
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-50">
            <Lock className="h-6 w-6 text-sage-500" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-sage-900">
            Votre scan gratuit est utilisé
          </h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-sage-600">
            Passez en Premium pour des scans illimités, des routines complètes
            et le suivi de vos progrès.
          </p>
          <Link to="/pricing" onClick={() => setShowUpgrade(false)} className="mt-5 block">
            <Button className="w-full">
              <Sparkles className="h-4 w-4" />
              Découvrir Premium
            </Button>
          </Link>
          {!isConfigured && (
            <button
              type="button"
              onClick={() => {
                upgradeDemo();
                setShowUpgrade(false);
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sage-500 hover:text-sage-700"
            >
              <Crown className="h-4 w-4" />
              Activer Premium (démo)
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}
