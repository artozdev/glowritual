import { mulberry32, average, clamp } from './utils';
import { FACE_CONTENT, BODY_CONTENT, type CriterionContent } from './recommendations';
import { CRITERION_ZONE } from './scanZones';
import { CONCERN_TO_CRITERION } from '@/data/profileOptions';
import type { UserProfile } from '@/types/profile';
import type {
  AnalysisInput,
  CriterionId,
  CriterionResult,
  FaceCriterionId,
  BodyCriterionId,
  NormalizedPoint,
  ProductNeed,
  ScanZoneId,
  ScanAnalysis,
  ScoreSource,
  Severity,
  ZoneSignal,
} from '@/types/domain';

/**
 * ════════════════════════════════════════════════════════════════
 *  MOTEUR DE SCORING — ANALYSE HYBRIDE & HONNÊTE DU VISAGE
 * ════════════════════════════════════════════════════════════════
 *  Chaque critère est résolu par une fonction ISOLÉE et remplaçable.
 *
 *  • `source: 'computed'`  → calculé depuis des signaux RÉELS mesurés
 *    pendant le scan (luminosité, homogénéité du teint par zone).
 *  • `source: 'heuristic'` → estimation prudente, pondérée par le profil,
 *    là où une webcam ne permet pas une mesure fiable.
 *
 *  Honnêteté : scores volontairement positifs (on ne « fabrique » pas de
 *  problème pour vendre), on indique quand une zone est SAINE, et il s'agit
 *  d'un score de progression personnelle — jamais d'un « score de beauté ».
 *  Ne remplace pas un avis dermatologique.
 * ════════════════════════════════════════════════════════════════
 */

/** Critères produits par le scan visage (dans l'ordre d'affichage). */
const FACE_ORDER: FaceCriterionId[] = [
  'hydration',
  'glow',
  'imperfections',
  'post_acne_marks',
  'skin_texture',
  'pigmentation',
  'wrinkles',
  'firmness',
  'dark_circles',
  'shine',
  // Critères de soin par zone (estimés, pondérés profil) — Phase 2.
  'lip_brow_care',
  'neck',
  'hair_scalp',
];

const BODY_ORDER: BodyCriterionId[] = ['posture', 'tone', 'skin_hydration'];

/** Besoin produit ciblé par chaque critère (pont vers le moteur de reco). */
const CRITERION_NEED: Record<CriterionId, ProductNeed> = {
  hydration: 'hydration',
  glow: 'radiance',
  imperfections: 'imperfections',
  post_acne_marks: 'post_acne_marks',
  skin_texture: 'skin_renewal',
  pigmentation: 'pigmentation',
  wrinkles: 'anti_aging',
  firmness: 'firmness',
  dark_circles: 'eye_care',
  shine: 'mattifying',
  lip_brow_care: 'lip_brow_care',
  neck: 'firmness',
  hair_scalp: 'hair',
  symmetry: 'firmness',
  posture: 'posture_wellness',
  tone: 'body_firmness',
  skin_hydration: 'body_hydration',
};

/** Repère représentatif de chaque critère, pour positionner son point. */
const FACE_LANDMARK_INDEX: Partial<Record<FaceCriterionId, number>> = {
  hydration: 10, // front
  glow: 50, // joue gauche
  imperfections: 205, // joue gauche basse
  post_acne_marks: 425, // joue droite basse
  skin_texture: 350, // aile du nez droite
  pigmentation: 280, // joue droite haute
  wrinkles: 46, // coin externe œil gauche
  firmness: 172, // ligne de mâchoire gauche
  dark_circles: 450, // sous l'œil droit
  shine: 9, // haut du nez / zone T
};

/* ── Sévérité (cadre honnête) ───────────────────────────────────── */
function severityOf(score: number): Severity {
  if (score >= 78) return 'healthy';
  if (score >= 62) return 'moderate';
  return 'marked';
}

/* ── Signaux mesurés par zone ───────────────────────────────────── */
type Signals = Partial<Record<ScanZoneId, ZoneSignal>>;

function buildSignals(input: AnalysisInput): Signals {
  const map: Signals = {};
  for (const z of input.zones ?? []) {
    map[z.zone] = {
      brightness: z.brightness,
      sharpness: z.sharpness,
      evenness: z.evenness,
    };
  }
  return map;
}

/**
 * Score estimé déterministe, dans une fourchette positive (60–94).
 * Volontairement encourageant : aucun score décourageant « par défaut ».
 */
function heuristicScore(seed: number, salt: number): number {
  const rng = mulberry32(seed * 1000 + salt * 97 + 7);
  return Math.round(60 + rng() * 34);
}

/* ── Critères calculés depuis des signaux réels ─────────────────── */

/** Éclat : luminosité + homogénéité du teint global. */
function scoreRadiance(s: Signals): { score: number; source: ScoreSource } | null {
  const g = s.global;
  if (!g) return null;
  const even = g.evenness ?? 0.7;
  const score = clamp(Math.round(56 + g.brightness * 28 + even * 14), 55, 98);
  return { score, source: 'computed' };
}

/** Brillance / zone T : excès de luminosité du nez vs reste du visage. */
function scoreShine(s: Signals): { score: number; source: ScoreSource } | null {
  const nose = s.nose;
  const ref = s.global ?? s.jaw;
  if (!nose || !ref) return null;
  const rel = clamp(nose.brightness - ref.brightness, 0, 0.35);
  const score = clamp(Math.round(95 - rel * 110), 60, 96);
  return { score, source: 'computed' };
}

/** Cernes : contour de l'œil plus sombre que le reste du visage. */
function scoreDarkCircles(s: Signals): { score: number; source: ScoreSource } | null {
  const eyes = s.eyes;
  const ref = s.global ?? s.jaw;
  if (!eyes || !ref) return null;
  const rel = clamp(ref.brightness - eyes.brightness, 0, 0.32);
  const score = clamp(Math.round(94 - rel * 105), 58, 96);
  return { score, source: 'computed' };
}

/** Taches / teint inégal : homogénéité (faible homogénéité = teint irrégulier). */
function scorePigmentation(s: Signals): { score: number; source: ScoreSource } | null {
  const g = s.global;
  if (!g || g.evenness == null) return null;
  const score = clamp(Math.round(52 + g.evenness * 46), 55, 97);
  return { score, source: 'computed' };
}

/** Texture / pores : régularité (homogénéité du nez/zone T). */
function scoreTexture(s: Signals): { score: number; source: ScoreSource } | null {
  const nose = s.nose;
  if (!nose || nose.evenness == null) return null;
  const score = clamp(Math.round(58 + nose.evenness * 38), 58, 96);
  return { score, source: 'computed' };
}

/** Table des fonctions de score « réelles » (sinon → estimation profil). */
const COMPUTED: Partial<
  Record<FaceCriterionId, (s: Signals) => { score: number; source: ScoreSource } | null>
> = {
  glow: scoreRadiance,
  shine: scoreShine,
  dark_circles: scoreDarkCircles,
  pigmentation: scorePigmentation,
  skin_texture: scoreTexture,
};

/* ── Symétrie (héritée, conservée pour compatibilité) ───────────── */
const SYMMETRY_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [33, 263],
  [133, 362],
  [61, 291],
  [50, 280],
  [70, 300],
  [234, 454],
];

export function computeSymmetry(
  landmarks: ReadonlyArray<NormalizedPoint>,
): number {
  if (landmarks.length < 468) {
    if (landmarks.length < 2) return 75;
    const axis = average(landmarks.map((p) => p.x));
    const spread = average(landmarks.map((p) => Math.abs(p.x - axis)));
    return Math.round(clamp(100 - spread * 200, 40, 99));
  }
  const at = (i: number): NormalizedPoint => landmarks[i] ?? { x: 0.5, y: 0.5 };
  const midline = average(SYMMETRY_PAIRS.map(([l, r]) => (at(l).x + at(r).x) / 2));
  const faceWidth = Math.abs(at(234).x - at(454).x) || 1;
  const deviations = SYMMETRY_PAIRS.map(([l, r]) => {
    const L = at(l);
    const R = at(r);
    return Math.abs((L.x + R.x) / 2 - midline) + Math.abs(L.y - R.y);
  });
  return Math.round(clamp(100 - (average(deviations) / faceWidth) * 220, 55, 99));
}

/** Graine déterministe dérivée des repères → scores stables pour un visage. */
export function seedFromLandmarks(
  landmarks: ReadonlyArray<NormalizedPoint>,
): number {
  let acc = 0;
  for (let i = 0; i < landmarks.length; i += 7) {
    const p = landmarks[i];
    if (!p) continue;
    acc = (acc + Math.round((p.x + p.y) * 100_000)) % 2_000_000_000;
  }
  return acc || 1;
}

/* ── Position du point ──────────────────────────────────────────── */
function positionFor(
  id: CriterionId,
  content: CriterionContent,
  input: AnalysisInput,
): NormalizedPoint {
  const idx = FACE_LANDMARK_INDEX[id as FaceCriterionId];
  if (input.kind === 'face' && input.landmarks && idx != null) {
    const p = input.landmarks[idx];
    // Image conservée en miroir (selfie) → on reflète l'abscisse.
    if (p) return { x: clamp(1 - p.x, 0, 1), y: clamp(p.y, 0, 1) };
  }
  return content.position;
}

/* ── Résolution du score d'un critère ───────────────────────────── */
function resolveScore(
  id: CriterionId,
  input: AnalysisInput,
  signals: Signals,
  salt: number,
): { score: number; source: ScoreSource } {
  const computed = COMPUTED[id as FaceCriterionId];
  if (computed) {
    const r = computed(signals);
    if (r) return r;
  }
  return { score: heuristicScore(input.seed, salt), source: 'heuristic' };
}

function explanationFor(content: CriterionContent, severity: Severity): string {
  // On dit clairement quand la zone est saine.
  return severity === 'healthy' ? content.good : content.nurture;
}

function isDeclaredConcern(id: CriterionId, profile?: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.concerns.some((c) => CONCERN_TO_CRITERION[c] === id);
}

/**
 * Pondère un score ESTIMÉ selon le profil (les scores mesurés ne sont jamais
 * modifiés). Corrélations douces et défendables — bornées et positives.
 */
function personalizeHeuristic(
  id: CriterionId,
  score: number,
  profile?: UserProfile | null,
): number {
  if (!profile) return score;
  let s = score;

  if (isDeclaredConcern(id, profile)) s -= 8;

  // Type de peau
  if (id === 'hydration' && profile.skinType === 'dry') s -= 7;
  if (id === 'hydration' && profile.skinType === 'oily') s += 3;
  if (id === 'imperfections' && profile.skinType === 'oily') s -= 8;
  if (id === 'imperfections' && profile.skinType === 'dry') s += 3;
  if (id === 'shine' && profile.skinType === 'oily') s -= 8;
  if (id === 'shine' && profile.skinType === 'dry') s += 4;
  if (id === 'skin_texture' && profile.skinType === 'oily') s -= 5;

  // Hygiène de vie
  if (id === 'dark_circles' && profile.sleep === 'lt6') s -= 6;
  if (id === 'hydration' && profile.hydration === 'low') s -= 5;
  if (id === 'glow' && profile.stress === 'high') s -= 4;
  if (id === 'imperfections' && profile.stress === 'high') s -= 4;

  // Âge (signes de l'âge) — toujours bienveillant
  if (id === 'wrinkles' || id === 'firmness') {
    if (profile.ageBand === '36to45') s -= 6;
    if (profile.ageBand === 'over45') s -= 11;
    if (profile.ageBand === 'under18' || profile.ageBand === '18to25') s += 4;
  }

  // Marques post-acné : pertinentes surtout si imperfections déclarées
  if (id === 'post_acne_marks' && !isDeclaredConcern('imperfections', profile)) {
    s += 6; // sinon, on reste très positif (rien d'observé)
  }

  // Soin par zone (estimé) — corrélations douces et défendables.
  if (id === 'neck') {
    if (profile.ageBand === '36to45') s -= 5;
    if (profile.ageBand === 'over45') s -= 9;
  }
  if (id === 'hair_scalp' && profile.stress === 'high') s -= 4;
  if (id === 'lip_brow_care' && profile.skinType === 'dry') s -= 4;

  return clamp(Math.round(s), 50, 99);
}

function buildCriterion(
  id: CriterionId,
  content: CriterionContent,
  input: AnalysisInput,
  signals: Signals,
  salt: number,
): CriterionResult {
  const { score: rawScore, source } = resolveScore(id, input, signals, salt);
  const score =
    source === 'heuristic'
      ? personalizeHeuristic(id, rawScore, input.profile)
      : rawScore;

  const severity = severityOf(score);

  let priority = clamp(100 - score, 0, 100);
  if (isDeclaredConcern(id, input.profile)) priority = clamp(priority + 15, 0, 100);

  return {
    id,
    label: content.label,
    score,
    source,
    severity,
    position: positionFor(id, content, input),
    explanation: explanationFor(content, severity),
    recommendation: content.recommendation,
    need: CRITERION_NEED[id],
    priority,
    zone: CRITERION_ZONE[id],
  };
}

/**
 * Analyse principale : produit le score global + le détail par critère.
 * Pure et synchrone — facile à tester et à remplacer.
 */
export function analyze(input: AnalysisInput): ScanAnalysis {
  const order: CriterionId[] = input.kind === 'face' ? FACE_ORDER : BODY_ORDER;
  const contentMap =
    input.kind === 'face'
      ? (FACE_CONTENT as Record<CriterionId, CriterionContent>)
      : (BODY_CONTENT as Record<CriterionId, CriterionContent>);

  const signals = buildSignals(input);
  const criteria = order.map((id, index) =>
    buildCriterion(id, contentMap[id], input, signals, index + 1),
  );

  // Score de progression personnelle (jamais un « score de beauté »).
  const overall = Math.round(average(criteria.map((c) => c.score)));
  return { kind: input.kind, overall, criteria };
}
