import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Check,
  ChevronLeft,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScanProgress } from './ScanProgress';
import { ZoneOverlay } from './ZoneOverlay';
import { useCamera } from '@/hooks/useCamera';
import { useFaceTracker } from '@/hooks/useFaceTracker';
import {
  ZONE_STEPS,
  ZONE_META,
  evaluateQuality,
  zoneBox,
  type QualityResult,
} from '@/lib/scanZones';
import { cn } from '@/lib/utils';
import type {
  NormalizedPoint,
  ScanConditions,
  ScanZoneCapture,
  ScanZoneId,
} from '@/types/domain';

/** Durée de maintien « zone validée » avant capture auto (ms). */
const HOLD_MS = 1000;
/** Durée du flash de capture (ms). */
const FLASH_MS = 700;

export interface GuidedScanResult {
  image: string | null;
  landmarks: NormalizedPoint[] | null;
  zones: ScanZoneCapture[];
  conditions: ScanConditions;
}

interface Props {
  onComplete: (result: GuidedScanResult) => void;
  onExit: () => void;
}

const IDLE_QUALITY: QualityResult = {
  ok: false,
  tone: 'idle',
  message: 'Préparation…',
  checks: [],
};

type Phase = 'scanning' | 'flash' | 'recap' | 'analyzing';

export function GuidedScan({ onComplete, onExit }: Props) {
  const { videoRef, status, error, start, stop, capture, captureRegion } =
    useCamera();

  const [phase, setPhase] = useState<Phase>('scanning');
  // Le suivi temps réel tourne pendant le cadrage (et le flash, pour rester
  // « chaud » entre deux étapes) ; il s'arrête au récapitulatif et à l'analyse.
  const trackerActive =
    status === 'ready' && (phase === 'scanning' || phase === 'flash');
  const { ready: trackerReady, metrics, metricsRef } = useFaceTracker(
    videoRef,
    trackerActive,
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [quality, setQuality] = useState<QualityResult>(IDLE_QUALITY);
  const [hold, setHold] = useState(0);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  // Vignettes capturées (pour le récapitulatif) + zone en cours de reprise.
  const [captures, setCaptures] = useState<
    Partial<Record<ScanZoneId, ScanZoneCapture>>
  >({});
  const [retakeZone, setRetakeZone] = useState<ScanZoneId | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const validSince = useRef<number | null>(null);
  const capturesRef = useRef<Partial<Record<ScanZoneId, ScanZoneCapture>>>({});
  const globalImage = useRef<string | null>(null);
  const globalLandmarks = useRef<NormalizedPoint[] | null>(null);

  const step = (ZONE_STEPS[stepIndex] ?? ZONE_STEPS[0])!;
  const isLast = stepIndex === ZONE_STEPS.length - 1;

  // Démarre la caméra à l'ouverture.
  useEffect(() => {
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mesure le conteneur d'affichage (pour projeter le cadre).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const finish = useCallback(() => {
    setPhase('analyzing');
    const zones = ZONE_STEPS.map((s) => capturesRef.current[s.id]).filter(
      Boolean,
    ) as ScanZoneCapture[];
    const n = zones.length || 1;
    const conditions: ScanConditions = {
      brightness:
        Math.round((zones.reduce((a, z) => a + z.brightness, 0) / n) * 100) /
        100,
      faceSize:
        Math.round((zones.reduce((a, z) => a + z.faceSize, 0) / n) * 100) / 100,
    };
    stop();
    onComplete({
      image: globalImage.current,
      landmarks: globalLandmarks.current,
      zones,
      conditions,
    });
  }, [onComplete, stop]);

  // Capture de l'étape courante (auto quand validé, ou manuelle).
  const doCapture = useCallback(() => {
    if (phase !== 'scanning') return;
    const m = metricsRef.current;
    const lm = m.landmarks;
    const full = capture();
    const id = step.id;

    let image = full;
    if (id !== 'global' && lm) {
      image = captureRegion(zoneBox(lm, id), 0.02) ?? full;
    }
    const cap: ScanZoneCapture = {
      zone: id,
      image,
      brightness: Math.round(m.brightness * 100) / 100,
      faceSize: Math.round(m.faceSize * 100) / 100,
      capturedAt: new Date().toISOString(),
    };
    capturesRef.current[id] = cap;
    setCaptures((prev) => ({ ...prev, [id]: cap }));
    if (id === 'global') {
      globalImage.current = full;
      globalLandmarks.current = lm;
    }

    validSince.current = null;
    setHold(0);
    const wasRetake = retakeZone === id;
    setPhase('flash');
    window.setTimeout(() => {
      // Reprise d'une zone, ou dernière étape → on passe au récapitulatif.
      if (wasRetake) {
        setRetakeZone(null);
        setPhase('recap');
      } else if (isLast) {
        setPhase('recap');
      } else {
        setStepIndex((i) => i + 1);
        setPhase('scanning');
      }
    }, FLASH_MS);
  }, [phase, step, capture, captureRegion, isLast, retakeZone, metricsRef]);

  // Boucle d'évaluation qualité + capture automatique.
  useEffect(() => {
    if (status !== 'ready' || phase !== 'scanning') return;
    validSince.current = null;
    const interval = window.setInterval(() => {
      const m = metricsRef.current;
      if (m.box && (videoSize.w === 0 || videoSize.h === 0)) {
        const v = videoRef.current;
        if (v?.videoWidth)
          setVideoSize({ w: v.videoWidth, h: v.videoHeight });
      }
      const q = evaluateQuality(m, step);
      setQuality(q);

      if (q.ok) {
        if (validSince.current == null) validSince.current = performance.now();
        const held = performance.now() - validSince.current;
        setHold(Math.min(1, held / HOLD_MS));
        if (held >= HOLD_MS) doCapture();
      } else {
        validSince.current = null;
        setHold(0);
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [status, phase, step, doCapture, metricsRef, videoRef, videoSize.w, videoSize.h]);

  const displayBox = useMemo(() => {
    if (!metrics.landmarks) return null;
    return zoneBox(metrics.landmarks, step.id);
  }, [metrics.landmarks, step.id]);

  const goBack = () => {
    if (stepIndex === 0) return;
    validSince.current = null;
    setHold(0);
    setStepIndex((i) => i - 1);
    setPhase('scanning');
  };

  // Reprend une zone depuis le récapitulatif (l'utilisateur n'est pas satisfait).
  const retake = (zone: ScanZoneId) => {
    const idx = ZONE_STEPS.findIndex((s) => s.id === zone);
    if (idx < 0) return;
    validSince.current = null;
    setHold(0);
    setRetakeZone(zone);
    setStepIndex(idx);
    setPhase('scanning');
  };

  return (
    <div>
      <ScanProgress current={phase === 'recap' ? ZONE_STEPS.length : stepIndex} />

      {/* Consigne de l'étape / récapitulatif */}
      <div className="mt-4 text-center">
        {phase === 'recap' ? (
          <>
            <h2 className="text-lg font-semibold text-sage-900">Récapitulatif</h2>
            <p className="mt-0.5 text-sm text-sage-600">
              Vérifie tes captures, reprends une zone si besoin, puis lance
              l’analyse.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-sage-900">{step.title}</h2>
            <p className="mt-0.5 text-sm text-sage-600">{step.instruction}</p>
          </>
        )}
      </div>

      {/* Cadre caméra (masqué pendant le récapitulatif, flux conservé) */}
      <div
        ref={containerRef}
        className={cn(
          'relative mx-auto mt-4 aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-beige-200 bg-sage-900 shadow-soft-lg',
          phase === 'recap' && 'hidden',
        )}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full -scale-x-100 object-cover"
        />

        {/* Cadre de détection (flux prêt) */}
        {status === 'ready' && (
          <ZoneOverlay
            box={displayBox}
            shape={step.shape}
            quality={quality}
            container={containerSize}
            video={videoSize}
          />
        )}

        {/* Bandeau consigne en temps réel */}
        {status === 'ready' && phase === 'scanning' && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
            <motion.div
              key={quality.message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium shadow-soft backdrop-blur',
                quality.tone === 'good'
                  ? 'bg-[#b6ffc4]/95 text-forest'
                  : 'bg-white/90 text-sage-700',
              )}
            >
              {trackerReady ? quality.message : 'Préparation de l’analyse…'}
            </motion.div>
          </div>
        )}

        {/* Barre de maintien (capture imminente) */}
        {status === 'ready' && phase === 'scanning' && hold > 0 && (
          <div className="absolute inset-x-0 top-0 h-1 bg-white/20">
            <motion.div
              className="h-full bg-[#b6ffc4]"
              style={{ width: `${hold * 100}%` }}
            />
          </div>
        )}

        {/* Flash + coche de capture */}
        <AnimatePresence>
          {phase === 'flash' && (
            <>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b6ffc4] shadow-glow">
                  <Check className="h-8 w-8 text-forest" strokeWidth={3} />
                </span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Voile d'analyse finale */}
        <AnimatePresence>
          {phase === 'analyzing' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sage-900/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90">
                <Sparkles className="h-6 w-6 animate-pulse text-sage-500" />
              </span>
              <p className="text-sm font-medium text-white">
                Analyse bienveillante en cours…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* États sans flux */}
        {status !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-sage-100 to-beige-100 p-6 text-center">
            {(status === 'idle' || status === 'requesting') && (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-sage-500" />
                <p className="text-sm text-sage-600">Activation de la caméra…</p>
              </>
            )}
            {status === 'denied' && (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                  <ShieldAlert className="h-7 w-7 text-sage-500" />
                </span>
                <p className="text-sm font-medium text-sage-700">
                  Accès caméra refusé
                </p>
                <p className="max-w-xs text-xs text-sage-500">
                  {error ?? 'Autorisez la caméra dans votre navigateur.'}
                </p>
                <Button size="sm" onClick={() => void start()}>
                  <Camera className="h-4 w-4" />
                  Réessayer
                </Button>
              </>
            )}
            {status === 'unavailable' && (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                  <CameraOff className="h-7 w-7 text-sage-500" />
                </span>
                <p className="text-sm font-medium text-sage-700">
                  Caméra indisponible
                </p>
                <p className="max-w-xs text-xs text-sage-500">
                  {error ?? 'Utilisez la photo de démonstration.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pastilles de contrôle qualité */}
      {status === 'ready' && phase === 'scanning' && quality.checks.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quality.checks.map((c) => (
            <span
              key={c.key}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                c.ok
                  ? 'bg-sage-50 text-sage-600'
                  : 'bg-beige-100 text-sage-400',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  c.ok ? 'bg-sage-500' : 'bg-beige-300',
                )}
              />
              {c.label}
            </span>
          ))}
        </div>
      )}

      {/* Commandes (phase de cadrage) */}
      {phase !== 'recap' && (
        <>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0 || phase !== 'scanning'}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Étape précédente
            </button>

            <button
              type="button"
              onClick={doCapture}
              disabled={status !== 'ready' || phase !== 'scanning'}
              aria-label="Capturer cette zone"
              className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
            >
              <span
                className={cn(
                  'absolute inset-0 rounded-full border-4',
                  quality.ok ? 'border-[#b6ffc4]' : 'border-sage-500/40',
                )}
              />
              <span className="h-12 w-12 rounded-full bg-sage-500 shadow-glow transition-colors group-hover:bg-sage-600" />
            </button>

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700"
            >
              <X className="h-4 w-4" />
              Quitter
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-sage-400">
            Capture automatique dès que la zone est validée — ou appuyez pour
            capturer.
          </p>
        </>
      )}

      {/* Récapitulatif : toutes les captures, reprise possible, puis analyse */}
      {phase === 'recap' && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ZONE_STEPS.map((s) => {
              const cap = captures[s.id];
              return (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-2xl border border-beige-200 bg-white shadow-soft"
                >
                  <div className="relative aspect-square bg-gradient-to-b from-sage-100 to-beige-100">
                    {cap?.image ? (
                      <img
                        src={cap.image}
                        alt={ZONE_META[s.id].label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-7 w-7 text-sage-300" />
                      </div>
                    )}
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-sage-600 shadow-soft">
                      <Check className="h-3 w-3 text-sage-500" strokeWidth={3} />
                      {ZONE_META[s.id].label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => retake(s.id)}
                    className="flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-sage-500 transition-colors hover:bg-sage-50 hover:text-sage-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reprendre
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            <Button size="lg" className="w-full sm:w-auto" onClick={finish}>
              <Sparkles className="h-5 w-5" />
              Lancer l’analyse
            </Button>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700"
            >
              <X className="h-4 w-4" />
              Quitter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
