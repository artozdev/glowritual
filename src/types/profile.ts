/**
 * Profil utilisateur unifié — rempli par l'onboarding puis exploité partout
 * (personnalisation des analyses, du scoring et des routines).
 *
 * Ces données sont privées et ne servent qu'à personnaliser l'expérience.
 */

export type AgeBand = 'under18' | '18to25' | '26to35' | '36to45' | 'over45';
export type Gender = 'female' | 'male' | 'other' | 'prefer_not';
export type SkinType =
  | 'normal'
  | 'dry'
  | 'oily'
  | 'combination'
  | 'sensitive'
  | 'unknown';

export type Concern =
  | 'hydration'
  | 'radiance'
  | 'dark_circles'
  | 'texture'
  | 'acne'
  | 'firmness'
  | 'posture'
  | 'tone';

export type Goal =
  | 'good_looks'
  | 'healthy_skin'
  | 'posture'
  | 'confidence'
  | 'wellness';

export type SleepBand = 'lt6' | '6to8' | 'gt8';
export type HydrationBand = 'low' | 'medium' | 'high';
export type ActivityLevel = 'low' | 'moderate' | 'active';
export type StressLevel = 'low' | 'medium' | 'high';
export type Diet = 'omnivore' | 'vegetarian' | 'vegan';
export type CurrentRoutine = 'none' | 'basic' | 'elaborate';
export type RoutineTime = '5min' | '15min' | '30min';
export type ProductPref = 'bio_only' | 'whatever' | 'sensitive';
export type Budget = 'low' | 'mid' | 'high';
/** Fréquence de rappel de scan. */
export type ScanReminder = 'off' | 'daily' | 'weekly';
/**
 * Préférence d'affichage des produits selon le genre.
 *  female  → produits femme + universels
 *  male    → produits homme + universels
 *  all     → tout (mixte)
 *  unisex  → uniquement les produits universels
 */
export type ProductGenderPref = 'female' | 'male' | 'all' | 'unisex';

export interface UserProfile {
  /** Vrai une fois l'onboarding terminé. */
  onboardingCompleted: boolean;
  /** Prénom / nom d'usage choisi. */
  displayName: string;
  ageBand: AgeBand;
  gender: Gender;
  skinType: SkinType;
  /** Préoccupations principales (sélection multiple). */
  concerns: Concern[];
  goal: Goal | null;
  sleep: SleepBand | null;
  hydration: HydrationBand | null;
  activity: ActivityLevel | null;
  stress: StressLevel | null;
  diet: Diet;
  /** Tokens d'ingrédients à exclure strictement (allergies). */
  allergies: string[];
  currentRoutine: CurrentRoutine | null;
  routineTime: RoutineTime;
  productPref: ProductPref;
  /** Budget produits (non demandé en onboarding, défaut « modéré »). */
  budget: Budget;
  /** Fréquence de rappel de scan (« off » par défaut). */
  scanReminder: ScanReminder;
  /**
   * Préférence d'affichage produits (genre). Modifiable dans les paramètres.
   * Absent → dérivé du genre d'onboarding (femme/homme → leur catalogue,
   * autre/non précisé → universels).
   */
  productGenderPref?: ProductGenderPref;
}

/** Filtre genre effectif (préférence explicite, sinon dérivé du genre). */
export function effectiveProductGender(
  profile: Pick<UserProfile, 'gender' | 'productGenderPref'>,
): ProductGenderPref {
  if (profile.productGenderPref) return profile.productGenderPref;
  if (profile.gender === 'female') return 'female';
  if (profile.gender === 'male') return 'male';
  return 'unisex'; // autre / préfère ne pas dire → universels par défaut
}

/** Vrai si l'utilisateur est mineur (ton adapté, pas d'objectif corporel). */
export function isMinor(profile: Pick<UserProfile, 'ageBand'>): boolean {
  return profile.ageBand === 'under18';
}
