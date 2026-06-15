import { useEffect, useRef, useState, type RefObject } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import {
  prepareFaceLandmarkerVideo,
  detectVideoFrame,
} from '@/lib/landmarks';
import {
  faceGeometry,
  sampleRegion,
  EMPTY_METRICS,
  type FaceMetrics,
} from '@/lib/faceMetrics';

/** Seuil de mouvement (EMA du déplacement du centre) sous lequel = stable. */
const STABLE_EMA = 0.006;
/** Cadence de rafraîchissement de l'état UI (ms). */
const UI_INTERVAL = 90;

/**
 * Suivi du visage en temps réel sur le flux caméra (MediaPipe, mode VIDEO).
 *
 * - `metricsRef` : mesures live, mises à jour à chaque image (sans re-render),
 *   à lire dans la boucle de capture automatique.
 * - `metrics` : copie throttlée pour l'affichage (cadre, retours).
 * - `ready` : vrai quand le détecteur vidéo est chargé.
 */
export function useFaceTracker(
  videoRef: RefObject<HTMLVideoElement>,
  active: boolean,
) {
  const metricsRef = useRef<FaceMetrics>(EMPTY_METRICS);
  const [metrics, setMetrics] = useState<FaceMetrics>(EMPTY_METRICS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let raf = 0;
    let lastVideoTime = -1;
    let lastUi = 0;
    let prevCx: number | null = null;
    let prevCy: number | null = null;
    let ema = 1;
    let landmarker: FaceLandmarker | null = null;
    const sampler = document.createElement('canvas');

    const loop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
      ) {
        lastVideoTime = video.currentTime;
        let lm = null;
        try {
          lm = detectVideoFrame(landmarker, video, performance.now());
        } catch {
          lm = null;
        }

        if (lm && lm.length) {
          const geo = faceGeometry(lm);
          const { brightness, sharpness, evenness } = sampleRegion(
            video,
            sampler,
            geo.box,
          );
          if (prevCx != null && prevCy != null) {
            const d = Math.hypot(geo.box.cx - prevCx, geo.box.cy - prevCy);
            ema = ema * 0.7 + d * 0.3;
          }
          prevCx = geo.box.cx;
          prevCy = geo.box.cy;
          metricsRef.current = {
            detected: true,
            box: geo.box,
            faceSize: geo.faceSize,
            roll: geo.roll,
            yaw: geo.yaw,
            brightness,
            sharpness,
            evenness,
            stable: ema < STABLE_EMA,
            landmarks: lm,
          };
        } else {
          prevCx = null;
          prevCy = null;
          ema = 1;
          metricsRef.current = {
            ...EMPTY_METRICS,
            brightness: metricsRef.current.brightness,
          };
        }

        const now = performance.now();
        if (now - lastUi > UI_INTERVAL) {
          lastUi = now;
          setMetrics(metricsRef.current);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    void (async () => {
      try {
        landmarker = await prepareFaceLandmarkerVideo();
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(false);
      }
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, videoRef]);

  return { ready, metrics, metricsRef };
}
