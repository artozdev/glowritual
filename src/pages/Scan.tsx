import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Sparkles, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { CameraView } from '@/components/scan/CameraView';
import { CaptureButton } from '@/components/scan/CaptureButton';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useCamera } from '@/hooks/useCamera';
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker';
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
  const { user, upgradeDemo } = useAuth();
  const { profile } = useProfile();
  const { videoRef, status, error, start, stop, capture } = useCamera();
  const { prepare, detect } = useFaceLandmarker();

  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState<string>('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium = user?.plan === 'premium';
  const canScan = isPremium || realScanCount < FREE_SCAN_LIMIT;

  // Précharge le détecteur dès que la caméra est prête (UX : prêt à temps).
  useEffect(() => {
    if (status === 'ready') void prepare();
  }, [status, prepare]);

  /**
   * Capture → détection MediaPipe (locale) → analyse → résultats.
   * En l'absence de visage détecté (ou en mode démo sans image), on bascule
   * proprement sur le moteur heuristique.
   */
  async function runAnalysis(image: string | null) {
    // Garde-fou freemium : 1 scan offert, puis invitation Premium.
    if (!canScan) {
      setShowUpgrade(true);
      return;
    }
    setAnalyzing(true);

    let landmarks: NormalizedPoint[] | null = null;
    if (image) {
      setStep('Détection des repères du visage…');
      landmarks = await detect(image);
    }

    setStep('Analyse bienveillante en cours…');
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
    };
    saveScan(scan);
    stop();
    navigate(`/results/${scan.id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
          {profile.displayName
            ? `Prêt·e, ${profile.displayName} ?`
            : 'Analyse du visage'}
        </h1>
        <p className="mt-1 text-sage-600">
          Cadrez-vous dans le repère et capturez. L’analyse se fait sur votre
          appareil.
        </p>
        {/* Indicateur freemium */}
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

      {/* Caméra */}
      <div className="relative mt-6">
        <CameraView videoRef={videoRef} status={status} error={error} kind="face" />

        {/* Voile d'analyse */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-sage-900/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
                <Sparkles className="h-6 w-6 animate-pulse text-sage-500" />
              </span>
              <p className="px-6 text-center text-sm font-medium text-white">
                {step || 'Analyse en cours…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contrôles */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {status === 'ready' ? (
          <>
            <CaptureButton onClick={() => runAnalysis(capture())} disabled={analyzing} />
            <p className="text-xs text-sage-400">Appuyez pour capturer</p>
          </>
        ) : (
          <Button onClick={start} disabled={analyzing} className="w-full sm:w-auto">
            <Camera className="h-5 w-5" />
            {status === 'denied' || status === 'unavailable'
              ? 'Réessayer la caméra'
              : 'Activer la caméra'}
          </Button>
        )}

        {/* Repli démonstration (toujours dispo : utile sans caméra) */}
        <button
          type="button"
          onClick={() => runAnalysis(null)}
          disabled={analyzing}
          className="text-sm font-medium text-sage-500 underline-offset-4 hover:text-sage-700 hover:underline disabled:opacity-50"
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
        </div>
      </Sheet>
    </div>
  );
}
