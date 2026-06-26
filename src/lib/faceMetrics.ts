import type { NormalizedPoint } from '@/types/domain';

/**
 * ════════════════════════════════════════════════════════════════
 *  GÉOMÉTRIE & QUALITÉ DU VISAGE (temps réel)
 * ════════════════════════════════════════════════════════════════
 *  Fonctions pures dérivées des repères MediaPipe (468 points) pour
 *  guider la capture : cadrage, distance, angle, luminosité, stabilité.
 *  Tout est calculé en local, sur l'appareil.
 * ════════════════════════════════════════════════════════════════
 */

/** Boîte englobante normalisée (0..1) dans l'espace vidéo (non-miroir). */
export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/** Mesures du visage à un instant donné. */
export interface FaceMetrics {
  detected: boolean;
  box: Box | null;
  /** Taille du visage (fraction de la hauteur du cadre, 0..1). */
  faceSize: number;
  /** Inclinaison de la tête en degrés (0 = droit). */
  roll: number;
  /** Décalage de l'angle de face (-0.5..0.5, 0 = bien de face). */
  yaw: number;
  /** Luminosité moyenne (0..1). */
  brightness: number;
  /** Netteté / mise au point (0..1, plus haut = plus net). */
  sharpness: number;
  /** Homogénéité du teint (0..1, plus haut = plus uniforme). */
  evenness: number;
  /** Visage stable (peu de mouvement entre deux images). */
  stable: boolean;
  landmarks: NormalizedPoint[] | null;
}

export const EMPTY_METRICS: FaceMetrics = {
  detected: false,
  box: null,
  faceSize: 0,
  roll: 0,
  yaw: 0,
  brightness: 0.5,
  sharpness: 0.5,
  evenness: 0.7,
  stable: false,
  landmarks: null,
};

/** Boîte englobante d'un sous-ensemble de repères (ou de tous). */
export function boxOf(
  lm: ReadonlyArray<NormalizedPoint>,
  indices?: ReadonlyArray<number>,
): Box {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  const take = (p: NormalizedPoint | undefined) => {
    if (!p) return;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  };
  if (indices) {
    for (const i of indices) take(lm[i]);
  } else {
    for (const p of lm) take(p);
  }
  const w = Math.max(0, maxX - minX);
  const h = Math.max(0, maxY - minY);
  return { minX, minY, maxX, maxY, cx: minX + w / 2, cy: minY + h / 2, w, h };
}

/** Élargit une boîte d'une marge (clampée à [0,1]). */
export function padBox(box: Box, pad: number): Box {
  const minX = Math.max(0, box.minX - pad);
  const minY = Math.max(0, box.minY - pad);
  const maxX = Math.min(1, box.maxX + pad);
  const maxY = Math.min(1, box.maxY + pad);
  const w = maxX - minX;
  const h = maxY - minY;
  return { minX, minY, maxX, maxY, cx: minX + w / 2, cy: minY + h / 2, w, h };
}

/** Géométrie du visage : boîte, taille, inclinaison, angle de face. */
export function faceGeometry(lm: ReadonlyArray<NormalizedPoint>): {
  box: Box;
  faceSize: number;
  roll: number;
  yaw: number;
} {
  const box = boxOf(lm);
  const faceSize = box.h;

  // Inclinaison (roll) : angle de la ligne entre les coins externes des yeux.
  const eyeL = lm[33];
  const eyeR = lm[263];
  let roll = 0;
  if (eyeL && eyeR) {
    roll = (Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x) * 180) / Math.PI;
    // Normalise autour de 0 (la caméra frontale donne ~0 ou ~180).
    if (roll > 90) roll -= 180;
    if (roll < -90) roll += 180;
  }

  // Angle de face (yaw) : position du nez entre les deux bords du visage.
  const left = lm[234];
  const right = lm[454];
  const nose = lm[1];
  let yaw = 0;
  if (left && right && nose) {
    const span = right.x - left.x || 1;
    yaw = (nose.x - left.x) / span - 0.5;
  }
  return { box, faceSize, roll, yaw };
}

/**
 * Échantillonne luminosité ET netteté du flux — globale ou sur une sous-zone.
 *
 * Un seul rendu dans un petit canvas réutilisable (peu coûteux) :
 *  • luminosité = moyenne de la luma (0..1) ;
 *  • netteté    = énergie du gradient (différences entre pixels voisins),
 *    normalisée — une image floue/bougée a un gradient faible.
 */
export function sampleRegion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  box?: Box,
): { brightness: number; sharpness: number; evenness: number } {
  const FALLBACK = { brightness: 0.5, sharpness: 0.5, evenness: 0.7 };
  const W = 48;
  const H = 48;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !video.videoWidth) return FALLBACK;
  try {
    if (box) {
      const sx = box.minX * video.videoWidth;
      const sy = box.minY * video.videoHeight;
      const sw = box.w * video.videoWidth;
      const sh = box.h * video.videoHeight;
      if (sw < 2 || sh < 2) return FALLBACK;
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    } else {
      ctx.drawImage(video, 0, 0, W, H);
    }
    return computeSignals(ctx.getImageData(0, 0, W, H).data, W, H);
  } catch {
    return FALLBACK;
  }
}

/** Luminosité + netteté + homogénéité à partir d'un buffer RGBA (W×H). */
function computeSignals(
  data: Uint8ClampedArray,
  W: number,
  H: number,
): { brightness: number; sharpness: number; evenness: number } {
  // Luma par pixel (réutilisée pour luminosité, gradient et homogénéité).
  const luma = new Float32Array(W * H);
  let sum = 0;
  for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    const y =
      0.299 * (data[i] ?? 0) +
      0.587 * (data[i + 1] ?? 0) +
      0.114 * (data[i + 2] ?? 0);
    luma[p] = y;
    sum += y;
  }
  const mean = sum / (W * H);
  const brightness = mean / 255;

  // Gradient (voisins droite + bas) → mesure de mise au point / texture.
  let acc = 0;
  let count = 0;
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const p = y * W + x;
      const dx = luma[p + 1]! - luma[p]!;
      const dy = luma[p + W]! - luma[p]!;
      acc += dx * dx + dy * dy;
      count++;
    }
  }
  const grad = count ? Math.sqrt(acc / count) / 255 : 0; // ~0..0.15
  const sharpness = clamp01(grad / 0.08); // calibré : 0.08 ≈ net

  // Homogénéité du teint : faible écart-type de luma = teint uniforme.
  let varSum = 0;
  for (let p = 0; p < W * H; p++) varSum += (luma[p]! - mean) ** 2;
  const std = Math.sqrt(varSum / (W * H)); // 0..~80
  const evenness = clamp01(1 - std / 70);

  return { brightness, sharpness, evenness };
}

const STILL_FALLBACK = { brightness: 0.5, sharpness: 0.5, evenness: 0.7 };

/** Qualité d'une image figée (dataURL) : luminosité, netteté, homogénéité. */
export function sampleStill(
  dataUrl: string,
): Promise<{ brightness: number; sharpness: number; evenness: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const W = 48;
        const H = 48;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(STILL_FALLBACK);
        ctx.drawImage(img, 0, 0, W, H);
        resolve(computeSignals(ctx.getImageData(0, 0, W, H).data, W, H));
      } catch {
        resolve(STILL_FALLBACK);
      }
    };
    img.onerror = () => resolve(STILL_FALLBACK);
    img.src = dataUrl;
  });
}

/** Réduit une image (dataURL) à `max` px sur son plus grand côté (JPEG léger). */
export function shrinkImage(dataUrl: string, max = 640): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/* ── Projection vers l'écran (le flux est affiché en object-cover + miroir) ── */

/** Paramètres du recadrage `object-cover` d'une vidéo dans un conteneur. */
function coverParams(vw: number, vh: number, cw: number, ch: number) {
  const scale = Math.max(cw / vw, ch / vh);
  const dispW = vw * scale;
  const dispH = vh * scale;
  return { scale, offX: (cw - dispW) / 2, offY: (ch - dispH) / 2 };
}

/** Projette un point normalisé (espace vidéo) en pixels du conteneur affiché. */
export function projectPoint(
  nx: number,
  ny: number,
  vw: number,
  vh: number,
  cw: number,
  ch: number,
  mirror: boolean,
): { x: number; y: number } {
  const { scale, offX, offY } = coverParams(vw, vh, cw, ch);
  const x = mirror ? 1 - nx : nx;
  return { x: x * vw * scale + offX, y: ny * vh * scale + offY };
}

/** Projette une boîte normalisée en rectangle d'affichage (pixels conteneur). */
export function projectBox(
  box: Box,
  vw: number,
  vh: number,
  cw: number,
  ch: number,
  mirror: boolean,
): { left: number; top: number; width: number; height: number } {
  const a = projectPoint(box.minX, box.minY, vw, vh, cw, ch, mirror);
  const b = projectPoint(box.maxX, box.maxY, vw, vh, cw, ch, mirror);
  const left = Math.min(a.x, b.x);
  const top = Math.min(a.y, b.y);
  return { left, top, width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
}
