import type { AngleId, ScanZoneId } from '@/types/domain';
import type { QualityResult } from './scanZones';

/**
 * ════════════════════════════════════════════════════════════════
 *  PARCOURS DE CAPTURE MULTI-ANGLES
 * ════════════════════════════════════════════════════════════════
 *  6 angles, capturés à la caméra OU déposés (upload). Seul le
 *  « visage de face » est validé par repères (MediaPipe ne suit pas
 *  les profils / le cuir chevelu) ; les autres utilisent un guide de
 *  cadrage + un contrôle qualité léger sur l'image figée.
 * ════════════════════════════════════════════════════════════════
 */

export interface AngleStep {
  id: AngleId;
  /** Titre court de l'étape. */
  title: string;
  /** Consigne affichée. */
  instruction: string;
  /** Forme du guide de cadrage. */
  guide: 'oval' | 'profile' | 'rect';
  /** Validation temps réel par repères (visage de face uniquement). */
  usesLandmarks: boolean;
  /** Luminosité minimale acceptable (0..1). */
  minBrightness: number;
  /** Netteté minimale acceptable (0..1). */
  minSharpness: number;
}

/** Les 6 angles du parcours, dans l'ordre. */
export const ANGLE_STEPS: AngleStep[] = [
  {
    id: 'face',
    title: 'Visage de face',
    instruction: 'Cadre ton visage entier, bien droit et centré',
    guide: 'oval',
    usesLandmarks: true,
    minBrightness: 0.3,
    minSharpness: 0.18,
  },
  {
    id: 'profile_left',
    title: 'Profil gauche',
    instruction: 'Tourne la tête vers la droite pour montrer ton profil gauche',
    guide: 'profile',
    usesLandmarks: false,
    minBrightness: 0.3,
    minSharpness: 0.15,
  },
  {
    id: 'profile_right',
    title: 'Profil droit',
    instruction: 'Tourne la tête vers la gauche pour montrer ton profil droit',
    guide: 'profile',
    usesLandmarks: false,
    minBrightness: 0.3,
    minSharpness: 0.15,
  },
  {
    id: 'jaw',
    title: 'Mâchoire',
    instruction: 'Relève un peu le menton pour dégager la ligne de mâchoire',
    guide: 'oval',
    usesLandmarks: false,
    minBrightness: 0.3,
    minSharpness: 0.15,
  },
  {
    id: 'smile',
    title: 'Sourire',
    instruction: 'Souris naturellement, bien de face',
    guide: 'oval',
    usesLandmarks: false,
    minBrightness: 0.3,
    minSharpness: 0.15,
  },
  {
    id: 'scalp',
    title: 'Cuir chevelu & cheveux',
    instruction:
      'Penche le haut de la tête vers la caméra — ou importe une photo du dessus',
    guide: 'rect',
    usesLandmarks: false,
    minBrightness: 0.28,
    minSharpness: 0.13,
  },
];

/** Métadonnées d'affichage par angle (recap, résultats). */
export const ANGLE_META: Record<AngleId, { label: string; blurb: string }> = {
  face: { label: 'Visage de face', blurb: 'Éclat, teint & hydratation' },
  profile_left: { label: 'Profil gauche', blurb: 'Texture & contour' },
  profile_right: { label: 'Profil droit', blurb: 'Texture & contour' },
  jaw: { label: 'Mâchoire', blurb: 'Définition & fermeté' },
  smile: { label: 'Sourire', blurb: 'Lèvres & expression' },
  scalp: { label: 'Cuir chevelu', blurb: 'Cheveux & racines' },
};

/**
 * Sous-zones échantillonnées depuis la frame frontale (visage de face) —
 * alimentent l'analyse skin existante (`analyze()`), inchangée.
 */
export const FACE_ZONES: ScanZoneId[] = ['global', 'eyes', 'nose', 'mouth', 'jaw'];

/**
 * Contrôle qualité d'une photo figée (angles hors visage).
 * Avertit sans bloquer : l'utilisateur peut valider ou reprendre.
 */
export function evaluateStill(
  signals: { brightness: number; sharpness: number },
  step: AngleStep,
): QualityResult {
  const dark = signals.brightness < step.minBrightness;
  const blurry = signals.sharpness < step.minSharpness;
  const checks = [
    { key: 'light', label: 'Lumière', ok: !dark },
    { key: 'sharp', label: 'Netteté', ok: !blurry },
  ];
  if (dark)
    return {
      ok: false,
      tone: 'warn',
      message: 'Photo un peu sombre — ajoute de la lumière si tu peux',
      checks,
    };
  if (blurry)
    return {
      ok: false,
      tone: 'warn',
      message: 'Photo un peu floue — stabilise ou reprends',
      checks,
    };
  return { ok: true, tone: 'good', message: 'Photo nette et lumineuse ✨', checks };
}
