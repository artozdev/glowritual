import type {
  CriterionId,
  FaceCriterionId,
  NormalizedPoint,
  ScanZoneId,
} from '@/types/domain';
import { boxOf, padBox, type Box, type FaceMetrics } from './faceMetrics';

/**
 * ════════════════════════════════════════════════════════════════
 *  PARCOURS DE SCAN GUIDÉ — DÉFINITION DES ZONES
 * ════════════════════════════════════════════════════════════════
 *  Le scan se fait zone par zone. Chaque étape cible une zone du
 *  visage, valide la qualité du cadrage en temps réel, puis capture.
 * ════════════════════════════════════════════════════════════════
 */

/** Indices de repères (modèle 468 points) bornant chaque sous-zone. */
const ZONE_REGIONS: Record<Exclude<ScanZoneId, 'global'>, number[]> = {
  // Contour des yeux + sourcils.
  eyes: [
    33, 133, 159, 145, 160, 144, 153, 157, 173, 246, 70, 63, 105, 66, 107,
    263, 362, 386, 374, 385, 380, 388, 466, 336, 296, 334, 293, 300,
    23, 27, 230, 253, 257, 450,
  ],
  // Nez / zone T.
  nose: [1, 2, 4, 5, 6, 19, 94, 168, 197, 195, 98, 327, 129, 358, 115, 344],
  // Bouche + menton.
  mouth: [
    61, 291, 0, 17, 13, 14, 84, 314, 78, 308, 178, 402, 152, 148, 377, 175,
    18, 200, 199,
  ],
  // Ovale du visage / ligne de mâchoire.
  jaw: [
    234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379,
    365, 397, 288, 361, 454,
  ],
};

export interface ZoneStep {
  id: ScanZoneId;
  /** Titre court de l'étape. */
  title: string;
  /** Consigne affichée. */
  instruction: string;
  /** Forme du cadre de détection. */
  shape: 'oval' | 'rect';
  /** Critères d'analyse alimentés par cette zone. */
  criteria: FaceCriterionId[];
  /** Taille de visage attendue (distance) — fraction de hauteur. */
  minFaceSize: number;
  maxFaceSize: number;
  /** Luminosité minimale acceptable (0..1). */
  minBrightness: number;
}

/** Les 5 étapes du parcours, dans l'ordre. */
export const ZONE_STEPS: ZoneStep[] = [
  {
    id: 'global',
    title: 'Visage de face',
    instruction: 'Cadre ton visage entier, bien droit et centré',
    shape: 'oval',
    criteria: ['glow', 'hydration'],
    minFaceSize: 0.42,
    maxFaceSize: 0.9,
    minBrightness: 0.3,
  },
  {
    id: 'eyes',
    title: 'Contour des yeux',
    instruction: 'On observe le contour de tes yeux',
    shape: 'rect',
    criteria: ['dark_circles'],
    minFaceSize: 0.45,
    maxFaceSize: 0.95,
    minBrightness: 0.32,
  },
  {
    id: 'nose',
    title: 'Nez & zone T',
    instruction: 'Concentration sur le nez',
    shape: 'rect',
    criteria: ['skin_texture'],
    minFaceSize: 0.45,
    maxFaceSize: 0.95,
    minBrightness: 0.32,
  },
  {
    id: 'mouth',
    title: 'Bouche & menton',
    instruction: 'Le bas du visage : lèvres et menton',
    shape: 'rect',
    criteria: ['lip_brow_care'],
    minFaceSize: 0.45,
    maxFaceSize: 0.95,
    minBrightness: 0.32,
  },
  {
    id: 'jaw',
    title: 'Ovale & mâchoire',
    instruction: 'Le contour du visage et la ligne de mâchoire',
    shape: 'oval',
    criteria: ['symmetry'],
    minFaceSize: 0.42,
    maxFaceSize: 0.92,
    minBrightness: 0.3,
  },
];

/** Métadonnées d'affichage par zone. */
export const ZONE_META: Record<ScanZoneId, { label: string; blurb: string }> = {
  global: { label: 'Visage global', blurb: 'Éclat, teint & hydratation' },
  eyes: { label: 'Contour des yeux', blurb: 'Cernes, poches & ridules' },
  nose: { label: 'Nez & zone T', blurb: 'Pores & brillance' },
  mouth: { label: 'Bouche & menton', blurb: 'Lèvres, texture, imperfections' },
  jaw: { label: 'Ovale & mâchoire', blurb: 'Fermeté & définition du contour' },
};

/** Zone d'origine de chaque critère (pour regrouper les résultats). */
export const CRITERION_ZONE: Partial<Record<CriterionId, ScanZoneId>> = {
  glow: 'global',
  hydration: 'global',
  dark_circles: 'eyes',
  skin_texture: 'nose',
  lip_brow_care: 'mouth',
  symmetry: 'jaw',
};

/** Boîte normalisée d'une zone à partir des repères (avec marge). */
export function zoneBox(
  lm: ReadonlyArray<NormalizedPoint>,
  id: ScanZoneId,
  pad = 0.05,
): Box {
  const base = id === 'global' ? boxOf(lm) : boxOf(lm, ZONE_REGIONS[id]);
  return padBox(base, pad);
}

/* ── Évaluation de la qualité en temps réel ─────────────────────── */

export interface QualityCheck {
  key: string;
  label: string;
  ok: boolean;
}

export interface QualityResult {
  ok: boolean;
  tone: 'idle' | 'warn' | 'good';
  message: string;
  checks: QualityCheck[];
}

const CENTER_TOL = 0.17;
const YAW_TOL = 0.13;
const ROLL_TOL = 11;
/** Netteté minimale (0..1) — volontairement bas : ne bloque qu'un net flou. */
const MIN_SHARPNESS = 0.18;

/**
 * Évalue si la zone est correctement cadrée et renvoie un retour utilisateur.
 * Bloque la capture (`ok: false`) tant qu'un critère n'est pas rempli.
 */
export function evaluateQuality(m: FaceMetrics, step: ZoneStep): QualityResult {
  if (!m.detected || !m.box) {
    return {
      ok: false,
      tone: 'idle',
      message: 'Place ton visage dans le cadre',
      checks: [],
    };
  }

  const tooFar = m.faceSize < step.minFaceSize;
  const tooClose = m.faceSize > step.maxFaceSize;
  const offCenter =
    Math.abs(m.box.cx - 0.5) > CENTER_TOL ||
    Math.abs(m.box.cy - 0.5) > CENTER_TOL;
  const turned = Math.abs(m.yaw) > YAW_TOL;
  const tilted = Math.abs(m.roll) > ROLL_TOL;
  const dark = m.brightness < step.minBrightness;
  const blurry = m.sharpness < MIN_SHARPNESS;

  const checks: QualityCheck[] = [
    { key: 'center', label: 'Centré', ok: !offCenter },
    { key: 'distance', label: 'Bonne distance', ok: !tooFar && !tooClose },
    { key: 'angle', label: 'De face', ok: !turned && !tilted },
    { key: 'light', label: 'Lumière', ok: !dark },
    { key: 'sharp', label: 'Netteté', ok: !blurry },
    { key: 'stable', label: 'Stable', ok: m.stable },
  ];

  let message = 'Parfait, ne bouge plus ✨';
  let ok = true;
  let tone: QualityResult['tone'] = 'good';
  const fail = (msg: string) => {
    ok = false;
    tone = 'warn';
    message = msg;
  };

  // Ordre de priorité des consignes.
  if (tooFar) fail('Rapproche-toi un peu');
  else if (tooClose) fail('Éloigne-toi légèrement');
  else if (offCenter) fail('Centre ton visage dans le cadre');
  else if (turned) fail('Regarde bien en face');
  else if (tilted) fail('Redresse un peu la tête');
  else if (dark) fail('Place-toi dans un endroit plus lumineux');
  else if (blurry) fail('Image floue — stabilise ton téléphone');
  else if (!m.stable) fail('Ne bouge plus…');

  return { ok, tone, message, checks };
}
