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

// Singleton : on ne crée le détecteur qu'une seule fois.
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(): Promise<FaceLandmarker> {
  // Import dynamique → chunk séparé.
  const { FilesetResolver, FaceLandmarker } = await import(
    '@mediapipe/tasks-vision'
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);

  const options = {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'IMAGE' as const,
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

/** Précharge le détecteur (à appeler quand la caméra est prête, par ex.). */
export function prepareFaceLandmarker(): Promise<FaceLandmarker> {
  landmarkerPromise ??= createLandmarker();
  return landmarkerPromise;
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
