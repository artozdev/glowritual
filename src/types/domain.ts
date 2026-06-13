import type { ScanKind, RoutinePeriod } from './database';
import type { UserProfile } from './profile';

export type { ScanKind, RoutinePeriod };

/* ── Critères d'analyse ─────────────────────────────────────────── */

export type FaceCriterionId =
  | 'hydration'
  | 'glow'
  | 'dark_circles'
  | 'skin_texture'
  | 'lip_brow_care'
  | 'symmetry';

export type BodyCriterionId = 'posture' | 'tone' | 'skin_hydration';

export type CriterionId = FaceCriterionId | BodyCriterionId;

/** Provenance d'un score : calculé depuis les repères, ou heuristique/simulé. */
export type ScoreSource = 'computed' | 'heuristic';

/**
 * Besoin ciblé par un critère — sert de pont vers le moteur de
 * recommandation produit (`recommendationEngine.ts`).
 */
export type ProductNeed =
  | 'hydration' // hydratation du visage
  | 'radiance' // éclat / luminosité du teint
  | 'eye_care' // cernes / contour de l'œil
  | 'skin_renewal' // texture / grain de peau
  | 'lip_brow_care' // lèvres & sourcils
  | 'firmness' // fermeté / tonus du visage
  | 'body_firmness' // tonus du corps
  | 'body_hydration' // hydratation du corps
  | 'posture_wellness'; // posture / bien-être

/** Point normalisé (0..1) relatif à l'image. */
export interface NormalizedPoint {
  x: number;
  y: number;
}

/** Zone faciale ciblée par le parcours de scan guidé. */
export type ScanZoneId = 'global' | 'eyes' | 'nose' | 'mouth' | 'jaw';

/** Capture d'une zone du visage (parcours guidé). */
export interface ScanZoneCapture {
  zone: ScanZoneId;
  /** Vignette de la zone (dataURL) — `null` si non conservée. */
  image: string | null;
  /** Luminosité mesurée sur la zone (0..1). */
  brightness: number;
  /** Taille du visage dans le cadre au moment de la capture (0..1). */
  faceSize: number;
  capturedAt: string; // ISO
}

/**
 * Conditions moyennes du scan — enregistrées pour guider l'utilisateur à
 * reproduire les mêmes conditions au scan suivant (comparaison fiable).
 */
export interface ScanConditions {
  /** Luminosité moyenne (0..1). */
  brightness: number;
  /** Distance moyenne (proxy : taille du visage, 0..1). */
  faceSize: number;
}

/** Résultat d'un critère unique. */
export interface CriterionResult {
  id: CriterionId;
  label: string;
  score: number; // 0..100
  explanation: string;
  recommendation: string;
  source: ScoreSource;
  /** Position du point interactif sur l'image. */
  position: NormalizedPoint;
  /** Besoin produit ciblé par ce critère. */
  need: ProductNeed;
  /** Priorité 0..100 (plus haut = plus à sublimer ; dérivé du score). */
  priority: number;
  /** Zone du visage analysée (parcours guidé) — absent pour le corps. */
  zone?: ScanZoneId;
}

/** Analyse complète d'un scan. */
export interface ScanAnalysis {
  kind: ScanKind;
  overall: number;
  criteria: CriterionResult[];
}

/** Entrée du moteur d'analyse. */
export interface AnalysisInput {
  kind: ScanKind;
  /** Graine déterministe (dérivée de la capture) pour des scores stables. */
  seed: number;
  /**
   * Repères du visage (MediaPipe) — branchés à l'étape 4.
   * `null`/absent → le moteur bascule sur le chemin heuristique.
   */
  landmarks?: ReadonlyArray<NormalizedPoint> | null;
  /** Profil utilisateur — pondère les scores heuristiques & priorités. */
  profile?: UserProfile | null;
}

/** Scan persisté (démo : image en dataURL ; réel : chemin storage). */
export interface StoredScan {
  id: string;
  kind: ScanKind;
  image: string | null;
  seed: number;
  overall: number;
  analysis: ScanAnalysis;
  createdAt: string; // ISO
  /** Captures par zone (parcours guidé multi-zones). */
  zones?: ScanZoneCapture[];
  /** Conditions du scan (luminosité, distance) pour la cohérence dans le temps. */
  conditions?: ScanConditions;
  /** Scan d'amorçage (historique de démo) — exclu du quota freemium. */
  isDemo?: boolean;
}

/** Tâche de routine générée. */
export interface GeneratedTask {
  id: string;
  title: string;
  detail: string;
  period: RoutinePeriod;
  criterion?: CriterionId;
  /** À quoi sert concrètement cette tâche. */
  goal: string;
  /** Comment la réaliser (étapes, fréquence). */
  how: string;
  /** Besoin produit lié → permet de proposer « où trouver le produit ». */
  productNeed?: ProductNeed;
}
