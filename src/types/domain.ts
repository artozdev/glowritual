import type { ScanKind, RoutinePeriod } from './database';
import type { UserProfile } from './profile';

export type { ScanKind, RoutinePeriod };

/* ── Critères d'analyse ─────────────────────────────────────────── */

export type FaceCriterionId =
  | 'hydration' // hydratation / sécheresse
  | 'glow' // éclat / teint terne
  | 'imperfections' // boutons / acné / points noirs / sébum
  | 'post_acne_marks' // marques & cicatrices post-acné
  | 'skin_texture' // texture & pores
  | 'pigmentation' // taches / teint inégal
  | 'wrinkles' // rides & ridules
  | 'firmness' // fermeté / relâchement
  | 'dark_circles' // cernes & poches
  | 'shine' // brillance / zone T
  | 'lip_brow_care' // lèvres & sourcils (soin)
  | 'neck' // peau du cou (soin, estimé)
  | 'hair_scalp' // cuir chevelu & cheveux (soin, estimé)
  // — critère historique conservé (non produit par le scan visage) —
  | 'symmetry';

export type BodyCriterionId = 'posture' | 'tone' | 'skin_hydration';

export type CriterionId = FaceCriterionId | BodyCriterionId;

/** Provenance d'un score : mesuré depuis l'image/les repères, ou estimé. */
export type ScoreSource = 'computed' | 'heuristic';

/** Niveau de sévérité d'un critère (cadre honnête, jamais culpabilisant). */
export type Severity = 'healthy' | 'moderate' | 'marked';

/**
 * Besoin ciblé par un critère — sert de pont vers le moteur de
 * recommandation produit (`recommendationEngine.ts`).
 */
export type ProductNeed =
  | 'hydration' // hydratation du visage
  | 'radiance' // éclat / luminosité du teint
  | 'eye_care' // cernes / contour de l'œil
  | 'skin_renewal' // texture / grain de peau / exfoliation
  | 'imperfections' // acné, boutons, points noirs, sébum
  | 'post_acne_marks' // marques & cicatrices post-acné
  | 'pigmentation' // taches & teint inégal
  | 'anti_aging' // rides, fermeté, signes de l'âge
  | 'mattifying' // brillance / zone T
  | 'sun_protection' // protection solaire (SPF)
  | 'contour' // contour du visage / mâchoire / tonus (outils)
  | 'hair' // cheveux & cils
  | 'beard' // barbe
  | 'wellness' // bien-être, stress (in & out)
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
  /** Netteté mesurée (0..1) — proxy de texture/grain. */
  sharpness?: number;
  /** Homogénéité du teint (0..1, plus haut = plus uniforme). */
  evenness?: number;
  capturedAt: string; // ISO
}

/** Signaux réellement mesurés par zone (alimentent l'analyse hybride). */
export interface ZoneSignal {
  brightness: number;
  sharpness?: number;
  evenness?: number;
}

/* ── Parcours de capture multi-angles ───────────────────────────── */

/** Angle de prise de vue du parcours de capture multi-angles. */
export type AngleId =
  | 'face' // visage de face (validé par repères → alimente l'analyse skin)
  | 'profile_left'
  | 'profile_right'
  | 'jaw' // mâchoire (3/4)
  | 'smile'
  | 'scalp'; // cuir chevelu / cheveux

/** Photo capturée pour un angle (parcours multi-angles). */
export interface AngleCapture {
  id: AngleId;
  /** Image (dataURL en local/démo, conservée légère). */
  image: string | null;
  /** Luminosité mesurée (0..1). */
  brightness: number;
  /** Netteté mesurée (0..1). */
  sharpness: number;
  /** Provenance de la photo. */
  source: 'camera' | 'upload';
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
  /** Niveau de sévérité (cadre honnête : sain / modéré / marqué). */
  severity: Severity;
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
  /** Signaux mesurés par zone pendant le scan guidé (analyse hybride). */
  zones?: ReadonlyArray<ScanZoneCapture> | null;
  /** Profil utilisateur — pondère les scores estimés & priorités. */
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
  /** Photos du parcours multi-angles (face, profils, mâchoire, sourire, cuir chevelu). */
  angles?: AngleCapture[];
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
