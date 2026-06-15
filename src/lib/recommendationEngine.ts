import { getProductProvider, type ProductProvider } from './productProvider';
import { normalizeIngredient } from './ingredientBlacklist';
import type { CriterionResult, ProductNeed } from '@/types/domain';
import type { Budget, UserProfile } from '@/types/profile';
import type { Product, ProductRecommendation } from '@/types/products';

/**
 * ════════════════════════════════════════════════════════════════
 *  MOTEUR DE MATCHING PRODUIT
 * ════════════════════════════════════════════════════════════════
 *  Croise le besoin d'un critère avec le catalogue (déjà filtré
 *  « composition sûre ») en tenant compte du profil : type de peau,
 *  allergies (exclusion STRICTE), préférence produits, budget, genre, âge.
 * ════════════════════════════════════════════════════════════════
 */

const MIN_RATING = 4.2; // ne propose que des produits bien notés
const MIN_REVIEWS = 100; // avec un minimum d'avis

const BIO_LABELS = ['Bio', 'Cosmébio', 'Ecocert', 'COSMOS Organic'];

const BUDGET_CEILING: Record<Budget, number> = {
  low: 18,
  mid: 30,
  high: Number.POSITIVE_INFINITY,
};

const NEED_PHRASE: Record<ProductNeed, string> = {
  hydration: 'votre hydratation',
  radiance: 'l’éclat de votre teint',
  eye_care: 'votre regard',
  skin_renewal: 'la texture de votre peau',
  imperfections: 'la netteté de votre peau',
  post_acne_marks: 'l’estompage des marques',
  pigmentation: 'l’uniformité de votre teint',
  anti_aging: 'la fermeté et les signes de l’âge',
  mattifying: 'l’équilibre de votre zone T',
  sun_protection: 'la protection de votre peau',
  contour: 'le contour de votre visage',
  hair: 'vos cheveux et cils',
  beard: 'votre barbe',
  wellness: 'votre bien-être de l’intérieur',
  lip_brow_care: 'le soin de vos lèvres et sourcils',
  firmness: 'la fermeté de votre visage',
  body_firmness: 'le tonus de votre corps',
  body_hydration: 'l’hydratation de votre peau',
  posture_wellness: 'votre bien-être au quotidien',
};

/** L'utilisateur souhaite-t-il avant tout des produits bio ? */
function prefersBio(profile: UserProfile): boolean {
  return profile.productPref !== 'whatever';
}

/** Peau ou préférence sensible → on privilégie les formules très douces. */
function isSensitive(profile: UserProfile): boolean {
  return profile.skinType === 'sensitive' || profile.productPref === 'sensitive';
}

/** Exclusion STRICTE : aucun produit contenant un allergène déclaré. */
function hasAllergyConflict(product: Product, profile: UserProfile): boolean {
  if (profile.allergies.length === 0) return false;
  const ingredients = product.ingredients.map(normalizeIngredient);
  return profile.allergies.some((raw) => {
    const token = normalizeIngredient(raw);
    return token.length > 0 && ingredients.some((ing) => ing.includes(token));
  });
}

/** Score qualité (note, confiance des avis, labels). */
function qualityScore(product: Product): number {
  const rating = (product.rating - MIN_RATING) * 20;
  const reviews = Math.min(Math.log10(product.reviewCount + 1) * 4, 12);
  const labels = Math.min(product.labels.length * 2, 8);
  return rating + reviews + labels;
}

/** Adéquation au profil utilisateur. */
function profileFitScore(product: Product, profile: UserProfile): number {
  let s = 0;

  // Type de peau (ignoré si « je ne sais pas »).
  if (profile.skinType !== 'unknown') {
    if (!product.skinTypes || product.skinTypes.includes(profile.skinType)) s += 8;
    else s -= 4;
  }

  // Sensibilité : on privilégie l'absence de parfum / huiles essentielles.
  if (isSensitive(profile)) {
    const joined = product.ingredients.map(normalizeIngredient).join(' ');
    if (!/essential|parfum|fragrance|huile essentielle/.test(joined)) s += 5;
  }

  // Préférence bio.
  if (prefersBio(profile) && product.labels.some((l) => BIO_LABELS.includes(l))) {
    s += 6;
  }

  // Budget.
  if (product.price <= BUDGET_CEILING[profile.budget]) s += 4;
  else s -= 6;

  // Genre (uniquement si déclaré des deux côtés).
  if (
    product.gender &&
    product.gender !== 'all' &&
    (profile.gender === 'female' || profile.gender === 'male') &&
    product.gender !== profile.gender
  ) {
    s -= 6;
  }

  // Âge : léger bonus fermeté/tonus après 36 ans.
  if (
    (profile.ageBand === '36to45' || profile.ageBand === 'over45') &&
    (product.need === 'firmness' || product.need === 'body_firmness')
  ) {
    s += 3;
  }

  return s;
}

/** Construit l'explication personnalisée : besoin → actif → effet → usage. */
function buildReason(
  criterion: CriterionResult,
  product: Product,
  profile: UserProfile,
): string {
  const need = NEED_PHRASE[criterion.need];
  const actives = product.keyIngredients
    .map((k) => `${k.name} qui ${k.benefit}`)
    .join(', et ');

  let text = `Pour sublimer ${need} (score ${criterion.score}/100), ${product.brand} — ${product.name} mise sur ${actives}. ${product.application}`;

  if (isSensitive(profile)) {
    text +=
      ' Privilégiez un test sur une petite zone avant la première application (peau sensible).';
  }
  return text;
}

function scoreCandidate(
  product: Product,
  criterion: CriterionResult,
  profile: UserProfile,
): number {
  const primaryBonus = product.need === criterion.need ? 10 : 0;
  return primaryBonus + qualityScore(product) + profileFitScore(product, profile);
}

function candidatesFor(
  criterion: CriterionResult,
  profile: UserProfile,
  provider: ProductProvider,
): Product[] {
  return provider
    .byNeed(criterion.need)
    .filter((p) => p.rating >= MIN_RATING && p.reviewCount >= MIN_REVIEWS)
    .filter((p) => !hasAllergyConflict(p, profile));
}

/** Recommande le meilleur produit pour un critère, ou `null` si aucun. */
export function recommendForCriterion(
  criterion: CriterionResult,
  profile: UserProfile,
  provider: ProductProvider = getProductProvider(),
): ProductRecommendation | null {
  const ranked = candidatesFor(criterion, profile, provider)
    .map((product) => ({
      product,
      matchScore: scoreCandidate(product, criterion, profile),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const best = ranked[0];
  if (!best) return null;
  return {
    product: best.product,
    matchScore: best.matchScore,
    reason: buildReason(criterion, best.product, profile),
  };
}

/** Meilleur produit pour un besoin donné (utilisé par les tâches de routine). */
export function recommendProductForNeed(
  need: ProductNeed,
  profile: UserProfile,
  provider: ProductProvider = getProductProvider(),
): Product | null {
  const ranked = provider
    .byNeed(need)
    .filter((p) => p.rating >= MIN_RATING && p.reviewCount >= MIN_REVIEWS)
    .filter((p) => !hasAllergyConflict(p, profile))
    .map((product) => ({
      product,
      score:
        (product.need === need ? 10 : 0) +
        qualityScore(product) +
        profileFitScore(product, profile),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.product ?? null;
}

/**
 * Propose une « routine globale » (solution complète) si elle couvre l'un des
 * besoins détectés (critères non sains). Renvoie `null` sinon.
 */
export function recommendRoutine(
  criteria: CriterionResult[],
  profile: UserProfile,
  provider: ProductProvider = getProductProvider(),
): ProductRecommendation | null {
  const needs = criteria
    .filter((c) => c.severity !== 'healthy')
    .sort((a, b) => a.score - b.score)
    .map((c) => c.need);
  const seen = new Set<ProductNeed>();
  for (const need of needs) {
    if (seen.has(need)) continue;
    seen.add(need);
    const routine = provider
      .byNeed(need)
      .find(
        (p) =>
          p.isRoutine &&
          p.rating >= MIN_RATING &&
          !hasAllergyConflict(p, profile),
      );
    if (routine) {
      return {
        product: routine,
        matchScore: 100,
        reason:
          'Une routine complète qui agit sur plusieurs de vos besoins à la fois, de l’intérieur comme en surface — idéale pour démarrer simplement.',
      };
    }
  }
  return null;
}

/** Recommande jusqu'à `max` produits pour un critère (du meilleur au moins bon). */
export function recommendManyForCriterion(
  criterion: CriterionResult,
  profile: UserProfile,
  max = 2,
  provider: ProductProvider = getProductProvider(),
): ProductRecommendation[] {
  return candidatesFor(criterion, profile, provider)
    .map((product) => ({
      product,
      matchScore: scoreCandidate(product, criterion, profile),
      reason: buildReason(criterion, product, profile),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, max);
}
