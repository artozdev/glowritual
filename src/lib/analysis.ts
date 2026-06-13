import { mulberry32, average, clamp } from './utils';
import { FACE_CONTENT, BODY_CONTENT, type CriterionContent } from './recommendations';
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
  ScanAnalysis,
  ScoreSource,
} from '@/types/domain';

/** Besoin produit ciblé par chaque critère (pont vers le moteur de reco). */
const CRITERION_NEED: Record<CriterionId, ProductNeed> = {
  hydration: 'hydration',
  glow: 'radiance',
  dark_circles: 'eye_care',
  skin_texture: 'skin_renewal',
  lip_brow_care: 'lip_brow_care',
  symmetry: 'firmness',
  posture: 'posture_wellness',
  tone: 'body_firmness',
  skin_hydration: 'body_hydration',
};

/**
 * ════════════════════════════════════════════════════════════════
 *  MOTEUR DE SCORING MODULAIRE
 * ════════════════════════════════════════════════════════════════
 *  Principe : chaque critère est résolu par une fonction qui prend
 *  l'`AnalysisInput` et renvoie un score + sa provenance.
 *
 *  • `source: 'computed'`  → calculé depuis les repères MediaPipe (étape 4).
 *  • `source: 'heuristic'` → estimé/simulé tant que la détection ne suffit pas.
 *
 *  La frontière est volontairement nette : pour brancher une vraie API
 *  d'analyse de peau plus tard, il suffit de remplacer les fonctions
 *  `scoreXxx` ci-dessous — l'UI n'a pas à changer.
 * ════════════════════════════════════════════════════════════════
 */

const FACE_ORDER: FaceCriterionId[] = [
  'hydration',
  'glow',
  'dark_circles',
  'skin_texture',
  'lip_brow_care',
  'symmetry',
];

const BODY_ORDER: BodyCriterionId[] = ['posture', 'tone', 'skin_hydration'];

/**
 * Score heuristique déterministe dans une fourchette positive (58–94).
 * On reste volontairement encourageant : pas de scores décourageants.
 */
function heuristicScore(seed: number, salt: number): number {
  const rng = mulberry32(seed * 1000 + salt * 97 + 7);
  return Math.round(58 + rng() * 36);
}

/**
 * Paires de repères symétriques gauche/droite (modèle 468 points MediaPipe).
 */
const SYMMETRY_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [33, 263], // coins externes des yeux
  [133, 362], // coins internes des yeux
  [61, 291], // commissures des lèvres
  [50, 280], // joues
  [70, 300], // sourcils
  [234, 454], // tempes (largeur du visage)
];

/** Repère représentatif de chaque critère, pour positionner son point. */
const FACE_LANDMARK_INDEX: Record<FaceCriterionId, number> = {
  hydration: 10, // front
  glow: 50, // joue gauche
  dark_circles: 450, // sous l'œil droit
  skin_texture: 280, // joue droite
  lip_brow_care: 13, // lèvre supérieure
  symmetry: 1, // pointe du nez
};

/**
 * Symétrie calculée depuis les repères : à quel point les paires gauche/droite
 * se reflètent autour de l'axe médian du visage. `source: 'computed'`.
 */
export function computeSymmetry(
  landmarks: ReadonlyArray<NormalizedPoint>,
): number {
  // Repli simple si le modèle complet n'est pas disponible.
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
    const horizontal = Math.abs((L.x + R.x) / 2 - midline);
    const vertical = Math.abs(L.y - R.y);
    return horizontal + vertical;
  });

  const asymmetry = average(deviations) / faceWidth;
  return Math.round(clamp(100 - asymmetry * 220, 55, 99));
}

/**
 * Position du point d'un critère : issue des repères détectés si disponibles,
 * sinon position anatomique par défaut.
 */
function positionFor(
  id: CriterionId,
  content: CriterionContent,
  input: AnalysisInput,
): NormalizedPoint {
  if (input.kind === 'face' && input.landmarks && id in FACE_LANDMARK_INDEX) {
    const idx = FACE_LANDMARK_INDEX[id as FaceCriterionId];
    const p = input.landmarks[idx];
    if (p) return { x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) };
  }
  return content.position;
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

/** Résout le score d'un critère + sa provenance. */
function resolveScore(
  id: CriterionId,
  input: AnalysisInput,
  salt: number,
): { score: number; source: ScoreSource } {
  // Seul critère réellement calculable aujourd'hui dès qu'on a les repères.
  if (id === 'symmetry' && input.landmarks && input.landmarks.length > 0) {
    return { score: computeSymmetry(input.landmarks), source: 'computed' };
  }
  return { score: heuristicScore(input.seed, salt), source: 'heuristic' };
}

/** Choisit l'explication selon la bande de score (ton toujours positif). */
function explanationFor(content: CriterionContent, score: number): string {
  return score >= 80 ? content.good : content.nurture;
}

/** Le critère fait-il partie des préoccupations déclarées par l'utilisateur ? */
function isDeclaredConcern(
  id: CriterionId,
  profile?: UserProfile | null,
): boolean {
  if (!profile) return false;
  return profile.concerns.some((c) => CONCERN_TO_CRITERION[c] === id);
}

/**
 * Pondère un score HEURISTIQUE selon le profil (les scores calculés depuis
 * les repères ne sont jamais modifiés). Reste borné et positif (50..99).
 * Corrélations douces et défendables — pas de promesse, pas de jugement.
 */
function personalizeHeuristic(
  id: CriterionId,
  score: number,
  profile?: UserProfile | null,
): number {
  if (!profile) return score;
  let s = score;

  // Préoccupation déclarée → on la fait remonter parmi les points à sublimer.
  if (isDeclaredConcern(id, profile)) s -= 8;

  // Type de peau.
  if (id === 'hydration' && profile.skinType === 'dry') s -= 6;
  if (id === 'hydration' && profile.skinType === 'oily') s += 3;
  if (id === 'skin_texture' && profile.skinType === 'oily') s -= 5;

  // Hygiène de vie.
  if (id === 'dark_circles' && profile.sleep === 'lt6') s -= 6;
  if (id === 'hydration' && profile.hydration === 'low') s -= 5;
  if (id === 'glow' && profile.stress === 'high') s -= 4;
  if (id === 'glow' && profile.hydration === 'high' && profile.sleep === 'gt8')
    s += 3;

  return clamp(Math.round(s), 50, 99);
}

function buildCriterion(
  id: CriterionId,
  content: CriterionContent,
  input: AnalysisInput,
  salt: number,
): CriterionResult {
  const { score: rawScore, source } = resolveScore(id, input, salt);
  const score =
    source === 'heuristic'
      ? personalizeHeuristic(id, rawScore, input.profile)
      : rawScore;

  // La priorité grimpe pour les préoccupations déclarées.
  let priority = clamp(100 - score, 0, 100);
  if (isDeclaredConcern(id, input.profile)) priority = clamp(priority + 15, 0, 100);

  return {
    id,
    label: content.label,
    score,
    source,
    position: positionFor(id, content, input),
    explanation: explanationFor(content, score),
    recommendation: content.recommendation,
    need: CRITERION_NEED[id],
    priority,
  };
}

/**
 * Analyse principale : produit le score global + le détail par critère.
 * Pure et synchrone — facile à tester et à remplacer.
 */
export function analyze(input: AnalysisInput): ScanAnalysis {
  const order: CriterionId[] =
    input.kind === 'face' ? FACE_ORDER : BODY_ORDER;
  const contentMap =
    input.kind === 'face'
      ? (FACE_CONTENT as Record<CriterionId, CriterionContent>)
      : (BODY_CONTENT as Record<CriterionId, CriterionContent>);

  const criteria = order.map((id, index) =>
    buildCriterion(id, contentMap[id], input, index + 1),
  );

  const overall = Math.round(average(criteria.map((c) => c.score)));
  return { kind: input.kind, overall, criteria };
}
