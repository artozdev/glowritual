import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedPoint } from '@/types/domain';

/**
 * Wrapper MediaPipe Face Landmarker.
 *
 * • Chargé en LAZY (import dynamique) → le bundle MediaPipe + WASM reste
 *   hors du bundle initial.
 * • Détection 100 % LOCALE : l'image ne quitte jamais l'appareil. Seuls les
 *   assets statiques (runtime WASM + modèle) sont récupérés depuis un CDN.
 */

const MP_VERSION = '0.10.35';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type RunningMode = 'IMAGE' | 'VIDEO';

// Singletons : un détecteur par mode (IMAGE = capture figée, VIDEO = temps réel).
let imagePromise: Promise<FaceLandmarker> | null = null;
let videoPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(runningMode: RunningMode): Promise<FaceLandmarker> {
  // Import dynamique → chunk séparé.
  const { FilesetResolver, FaceLandmarker } = await import(
    '@mediapipe/tasks-vision'
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

  const options = {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode,
    numFaces: 1,
  };

  // GPU si possible, repli CPU sinon (environnements sans WebGL).
  try {
    return await FaceLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'GPU' },
    });
  } catch {
    return await FaceLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: 'CPU' },
    });
  }
}

/** Précharge le détecteur image (capture figée). */
export function prepareFaceLandmarker(): Promise<FaceLandmarker> {
  imagePromise ??= createLandmarker('IMAGE');
  return imagePromise;
}

/** Précharge le détecteur vidéo (suivi temps réel du flux caméra). */
export function prepareFaceLandmarkerVideo(): Promise<FaceLandmarker> {
  videoPromise ??= createLandmarker('VIDEO');
  return videoPromise;
}

/**
 * Détecte les repères sur une image vidéo (mode temps réel).
 * `timestampMs` doit être strictement croissant entre les appels.
 */
export function detectVideoFrame(
  landmarker: FaceLandmarker,
  video: HTMLVideoElement,
  timestampMs: number,
): NormalizedPoint[] | null {
  const result = landmarker.detectForVideo(video, timestampMs);
  const face = result.faceLandmarks?.[0];
  if (!face || face.length === 0) return null;
  return face.map((p) => ({ x: p.x, y: p.y }));
}

/** Charge une dataURL en élément image décodé. */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = dataUrl;
  });
}

/**
 * Détecte les repères du visage sur une image (dataURL).
 * Renvoie ~468 points normalisés (0..1), ou `null` si aucun visage trouvé.
 */
export async function detectFaceLandmarks(
  dataUrl: string,
): Promise<NormalizedPoint[] | null> {
  const landmarker = await prepareFaceLandmarker();
  const img = await loadImage(dataUrl);
  const result = landmarker.detect(img);
  const face = result.faceLandmarks?.[0];
  if (!face || face.length === 0) return null;
  return face.map((p) => ({ x: p.x, y: p.y }));
}
