import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Check,
  ChevronLeft,
  ImagePlus,
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
  evaluateQuality,
  zoneBox,
  type QualityResult,
} from '@/lib/scanZones';
import {
  ANGLE_STEPS,
  ANGLE_META,
  FACE_ZONES,
  evaluateStill,
  type AngleStep,
} from '@/lib/scanAngles';
import { sampleRegion, sampleStill, shrinkImage } from '@/lib/faceMetrics';
import { cn } from '@/lib/utils';
import type {
  AngleCapture,
  AngleId,
  NormalizedPoint,
  ScanConditions,
  ScanZoneCapture,
} from '@/types/domain';

const HOLD_MS = 1000;
const FLASH_MS = 700;

/** Étape qualité du visage de face (réutilise les seuils de la zone globale). */
const FACE_QUALITY_STEP = ZONE_STEPS[0]!;

export interface MultiAngleResult {
  /** Image principale (visage de face). */
  image: string | null;
  landmarks: NormalizedPoint[] | null;
  /** Signaux par sous-zone du visage (alimentent l'analyse). */
  zones: ScanZoneCapture[];
  conditions: ScanConditions;
  /** Les photos des 6 angles. */
  angles: AngleCapture[];
}

interface Props {
  onComplete: (result: MultiAngleResult) => void;
  onExit: () => void;
}

const IDLE_QUALITY: QualityResult = {
  ok: false,
  tone: 'idle',
  message: 'Préparation…',
  checks: [],
};

type Phase = 'capture' | 'flash' | 'review' | 'recap' | 'analyzing';

interface Pending {
  id: AngleId;
  image: string;
  signals: { brightness: number; sharpness: number };
  source: 'camera' | 'upload';
  quality: QualityResult;
}

export function MultiAngleScan({ onComplete, onExit }: Props) {
  const { videoRef, status, error, start, stop, capture } = useCamera();

  const [phase, setPhase] = useState<Phase>('capture');
  const [stepIndex, setStepIndex] = useState(0);
  const step = (ANGLE_STEPS[stepIndex] ?? ANGLE_STEPS[0])!;
  const isFace = step.usesLandmarks;
  const isLast = stepIndex === ANGLE_STEPS.length - 1;

  const trackerActive =
    status === 'ready' && isFace && (phase === 'capture' || phase === 'flash');
  const { ready: trackerReady, metrics, metricsRef } = useFaceTracker(
    videoRef,
    trackerActive,
  );

  const [quality, setQuality] = useState<QualityResult>(IDLE_QUALITY);
  const [hold, setHold] = useState(0);
  const [videoSize, setVideoSize] = useState({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [captures, setCaptures] = useState<Partial<Record<AngleId, AngleCapture>>>(
    {},
  );
  const [pending, setPending] = useState<Pending | null>(null);
  const [retakeId, setRetakeId] = useState<AngleId | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const validSince = useRef<number | null>(null);
  const capturesRef = useRef<Partial<Record<AngleId, AngleCapture>>>({});
  const sampleCanvas = useRef<HTMLCanvasElement | null>(null);
  // Données du visage de face (alimentent l'analyse).
  const faceImage = useRef<string | null>(null);
  const faceLandmarks = useRef<NormalizedPoint[] | null>(null);
  const faceZones = useRef<ScanZoneCapture[]>([]);

  // Caméra à l'ouverture.
  useEffect(() => {
    void start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mesure du conteneur (projection du cadre).
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

  const r2 = (n: number) => Math.round(n * 100) / 100;

  const storeAngle = useCallback((cap: AngleCapture) => {
    capturesRef.current[cap.id] = cap;
    setCaptures((prev) => ({ ...prev, [cap.id]: cap }));
  }, []);

  /** Avance après une capture validée (gère la reprise et la dernière étape). */
  const advance = useCallback(() => {
    if (retakeId) {
      setRetakeId(null);
      setPhase('recap');
    } else if (isLast) {
      setPhase('recap');
    } else {
      setStepIndex((i) => i + 1);
      setPhase('capture');
    }
  }, [retakeId, isLast]);

  /** Capture du visage de face : image + repères + signaux des 5 sous-zones. */
  const doFaceCapture = useCallback(() => {
    const m = metricsRef.current;
    const lm = m.landmarks;
    const full = capture();
    const video = videoRef.current;
    const canvas = (sampleCanvas.current ??= document.createElement('canvas'));

    const zones: ScanZoneCapture[] = [];
    if (lm && video) {
      for (const z of FACE_ZONES) {
        const sig = sampleRegion(video, canvas, zoneBox(lm, z));
        zones.push({
          zone: z,
          image: null,
          brightness: r2(sig.brightness),
          faceSize: r2(m.faceSize),
          sharpness: r2(sig.sharpness),
          evenness: r2(sig.evenness),
          capturedAt: new Date().toISOString(),
        });
      }
    }
    faceImage.current = full;
    faceLandmarks.current = lm;
    faceZones.current = zones;

    storeAngle({
      id: 'face',
      image: full,
      brightness: r2(m.brightness),
      sharpness: r2(m.sharpness),
      source: 'camera',
      capturedAt: new Date().toISOString(),
    });

    validSince.current = null;
    setHold(0);
    setPhase('flash');
    window.setTimeout(advance, FLASH_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture, storeAngle, advance]);

  // Boucle qualité + capture auto (visage de face uniquement).
  useEffect(() => {
    if (status !== 'ready' || phase !== 'capture' || !isFace) return;
    validSince.current = null;
    const interval = window.setInterval(() => {
      const m = metricsRef.current;
      if (m.box && (videoSize.w === 0 || videoSize.h === 0)) {
        const v = videoRef.current;
        if (v?.videoWidth) setVideoSize({ w: v.videoWidth, h: v.videoHeight });
      }
      const q = evaluateQuality(m, FACE_QUALITY_STEP);
      setQuality(q);
      if (q.ok) {
        if (validSince.current == null) validSince.current = performance.now();
        const held = performance.now() - validSince.current;
        setHold(Math.min(1, held / HOLD_MS));
        if (held >= HOLD_MS) doFaceCapture();
      } else {
        validSince.current = null;
        setHold(0);
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [status, phase, isFace, doFaceCapture, metricsRef, videoRef, videoSize.w, videoSize.h]);

  /** Prépare la revue d'une photo figée (angles hors visage). */
  const reviewStill = useCallback(
    async (image: string, source: 'camera' | 'upload', s: AngleStep) => {
      const sig = await sampleStill(image);
      setPending({
        id: s.id,
        image,
        source,
        signals: { brightness: sig.brightness, sharpness: sig.sharpness },
        quality: evaluateStill(sig, s),
      });
      setPhase('review');
    },
    [],
  );

  const captureFromCamera = useCallback(() => {
    const img = capture();
    if (img) void reviewStill(img, 'camera', step);
  }, [capture, reviewStill, step]);

  const onFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string')
          void reviewStill(reader.result, 'upload', step);
      };
      reader.readAsDataURL(file);
    },
    [reviewStill, step],
  );

  /** Valide la photo en revue → l'enregistre et avance. */
  const acceptPending = useCallback(() => {
    if (!pending) return;
    storeAngle({
      id: pending.id,
      image: pending.image,
      brightness: r2(pending.signals.brightness),
      sharpness: r2(pending.signals.sharpness),
      source: pending.source,
      capturedAt: new Date().toISOString(),
    });
    setPending(null);
    advance();
  }, [pending, storeAngle, advance]);

  const rejectPending = useCallback(() => {
    setPending(null);
    setPhase('capture');
  }, []);

  /** Finalise : compresse les photos, calcule les conditions, lance l'analyse. */
  const finish = useCallback(async () => {
    setPhase('analyzing');
    const zones = faceZones.current;
    const n = zones.length || 1;
    const conditions: ScanConditions = {
      brightness: r2(zones.reduce((a, z) => a + z.brightness, 0) / n),
      faceSize: r2(zones.reduce((a, z) => a + z.faceSize, 0) / n),
    };
    const angles = await Promise.all(
      ANGLE_STEPS.map(async (s) => {
        const cap = capturesRef.current[s.id];
        if (!cap) return null;
        const image = cap.image ? await shrinkImage(cap.image, 640) : null;
        return { ...cap, image };
      }),
    );
    stop();
    onComplete({
      image: faceImage.current,
      landmarks: faceLandmarks.current,
      zones,
      conditions,
      angles: angles.filter(Boolean) as AngleCapture[],
    });
  }, [onComplete, stop]);

  const goBack = () => {
    if (stepIndex === 0) return;
    validSince.current = null;
    setHold(0);
    setPending(null);
    setStepIndex((i) => i - 1);
    setPhase('capture');
  };

  const retake = (id: AngleId) => {
    const idx = ANGLE_STEPS.findIndex((s) => s.id === id);
    if (idx < 0) return;
    validSince.current = null;
    setHold(0);
    setPending(null);
    setRetakeId(id);
    setStepIndex(idx);
    setPhase('capture');
  };

  const displayBox = useMemo(() => {
    if (!isFace || !metrics.landmarks) return null;
    return zoneBox(metrics.landmarks, 'global');
  }, [isFace, metrics.landmarks]);

  const progressSteps = ANGLE_STEPS.map((s) => ({ id: s.id, title: s.title }));
  const progressCurrent = phase === 'recap' ? ANGLE_STEPS.length : stepIndex;
  const cameraVisible = phase === 'capture' || phase === 'flash';

  return (
    <div>
      <ScanProgress current={progressCurrent} steps={progressSteps} />

      {/* Consigne / récapitulatif */}
      <div className="mt-4 text-center">
        {phase === 'recap' ? (
          <>
            <h2 className="text-lg font-semibold text-sage-900">Récapitulatif</h2>
            <p className="mt-0.5 text-sm text-sage-600">
              Vérifie tes photos, reprends un angle si besoin, puis lance
              l’analyse.
            </p>
          </>
        ) : phase === 'review' ? (
          <>
            <h2 className="text-lg font-semibold text-sage-900">
              {ANGLE_META[step.id].label}
            </h2>
            <p className="mt-0.5 text-sm text-sage-600">
              Vérifie la photo, puis valide ou reprends.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-sage-900">{step.title}</h2>
            <p className="mt-0.5 text-sm text-sage-600">{step.instruction}</p>
          </>
        )}
      </div>

      {/* Cadre caméra / revue (masqué au récapitulatif, flux conservé) */}
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
          className={cn(
            'h-full w-full -scale-x-100 object-cover',
            phase === 'review' && 'hidden',
          )}
        />

        {/* Cadre de détection — visage de face (repères) */}
        {status === 'ready' && cameraVisible && isFace && (
          <ZoneOverlay
            box={displayBox}
            shape="oval"
            quality={quality}
            container={containerSize}
            video={videoSize}
          />
        )}

        {/* Guide de cadrage statique — autres angles */}
        {status === 'ready' && cameraVisible && !isFace && (
          <GuideOverlay guide={step.guide} />
        )}

        {/* Bandeau consigne temps réel (visage de face) */}
        {status === 'ready' && phase === 'capture' && isFace && (
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
        {status === 'ready' && phase === 'capture' && isFace && hold > 0 && (
          <div className="absolute inset-x-0 top-0 h-1 bg-white/20">
            <motion.div
              className="h-full bg-[#b6ffc4]"
              style={{ width: `${hold * 100}%` }}
            />
          </div>
        )}

        {/* Revue d'une photo figée */}
        {phase === 'review' && pending && (
          <>
            <img
              src={pending.image}
              alt={ANGLE_META[pending.id].label}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-soft backdrop-blur',
                  pending.quality.tone === 'good'
                    ? 'bg-[#b6ffc4]/95 text-forest'
                    : 'bg-white/90 text-sage-700',
                )}
              >
                {pending.quality.message}
              </span>
            </div>
          </>
        )}

        {/* Flash de capture (visage) */}
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

        {/* Voile d'analyse */}
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
                  {error ?? 'Autorisez la caméra, ou importez vos photos.'}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void start()}>
                    <Camera className="h-4 w-4" />
                    Réessayer
                  </Button>
                  {!isFace && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      <ImagePlus className="h-4 w-4" />
                      Importer
                    </Button>
                  )}
                </div>
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
                  {error ?? 'Importez vos photos pour continuer.'}
                </p>
                {!isFace && (
                  <Button size="sm" onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="h-4 w-4" />
                    Importer une photo
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Input fichier (dépôt photo) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={onFile}
        className="hidden"
      />

      {/* Pastilles qualité (visage de face) */}
      {status === 'ready' && phase === 'capture' && isFace && quality.checks.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quality.checks.map((c) => (
            <span
              key={c.key}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                c.ok ? 'bg-sage-50 text-sage-600' : 'bg-beige-100 text-sage-400',
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

      {/* Commandes — revue d'une photo figée */}
      {phase === 'review' && pending && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={rejectPending}>
            <RotateCcw className="h-4 w-4" />
            Reprendre
          </Button>
          <Button onClick={acceptPending}>
            <Check className="h-4 w-4" />
            Valider
          </Button>
        </div>
      )}

      {/* Commandes — capture (angles hors visage) */}
      {phase === 'capture' && !isFace && (
        <>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>

            <button
              type="button"
              onClick={captureFromCamera}
              disabled={status !== 'ready'}
              aria-label="Prendre la photo"
              className="group relative flex h-[68px] w-[68px] items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
            >
              <span className="absolute inset-0 rounded-full border-4 border-sage-500/40" />
              <span className="h-12 w-12 rounded-full bg-sage-500 shadow-glow transition-colors group-hover:bg-sage-600" />
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700"
            >
              <ImagePlus className="h-4 w-4" />
              Importer
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-sage-400">
            Prends la photo, ou importe-la depuis ta galerie.
          </p>
        </>
      )}

      {/* Commande — visage de face (capture auto, quitter) */}
      {phase === 'capture' && isFace && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-sage-500 hover:text-sage-700"
          >
            <X className="h-4 w-4" />
            Quitter
          </button>
        </div>
      )}

      {/* Récapitulatif */}
      {phase === 'recap' && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ANGLE_STEPS.map((s) => {
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
                        alt={ANGLE_META[s.id].label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-7 w-7 text-sage-300" />
                      </div>
                    )}
                    <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-sage-600 shadow-soft">
                      <Check className="h-3 w-3 text-sage-500" strokeWidth={3} />
                      {ANGLE_META[s.id].label}
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
            <Button size="lg" className="w-full sm:w-auto" onClick={() => void finish()}>
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

/** Guide de cadrage statique (angles hors visage). */
function GuideOverlay({ guide }: { guide: AngleStep['guide'] }) {
  const radius = guide === 'rect' ? '1.5rem' : '48% / 42%';
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={cn(
          'border-2 border-dashed border-white/70',
          guide === 'profile' ? 'h-[68%] w-[52%]' : 'h-[66%] w-[60%]',
        )}
        style={{ borderRadius: radius }}
      />
      <span className="absolute bottom-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-sage-700 backdrop-blur">
        Place-toi dans le cadre, puis prends la photo
      </span>
    </div>
  );
}
