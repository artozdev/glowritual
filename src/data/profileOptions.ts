import type {
  ActivityLevel,
  AgeBand,
  Concern,
  CurrentRoutine,
  Diet,
  Gender,
  Goal,
  HydrationBand,
  ProductPref,
  RoutineTime,
  ScanReminder,
  SkinType,
  SleepBand,
  StressLevel,
  UserProfile,
} from '@/types/profile';
import type { CriterionId } from '@/types/domain';

/** Profil par défaut (avant onboarding). */
export const DEFAULT_PROFILE: UserProfile = {
  onboardingCompleted: false,
  displayName: '',
  ageBand: '26to35',
  gender: 'prefer_not',
  skinType: 'unknown',
  concerns: [],
  goal: null,
  sleep: null,
  hydration: null,
  activity: null,
  stress: null,
  diet: 'omnivore',
  allergies: [],
  currentRoutine: null,
  routineTime: '15min',
  productPref: 'whatever',
  budget: 'mid',
  scanReminder: 'off',
};

export interface Option<T extends string> {
  value: T;
  label: string;
  emoji?: string;
  hint?: string;
}

export const AGE_OPTIONS: Option<AgeBand>[] = [
  { value: 'under18', label: '- de 18 ans', emoji: '🌱' },
  { value: '18to25', label: '18–25 ans', emoji: '✨' },
  { value: '26to35', label: '26–35 ans', emoji: '🌿' },
  { value: '36to45', label: '36–45 ans', emoji: '🌼' },
  { value: 'over45', label: '46 ans et +', emoji: '🌸' },
];

export const GENDER_OPTIONS: Option<Gender>[] = [
  { value: 'female', label: 'Femme', emoji: '♀️' },
  { value: 'male', label: 'Homme', emoji: '♂️' },
  { value: 'other', label: 'Autre', emoji: '🌈' },
  { value: 'prefer_not', label: 'Préfère ne pas dire', emoji: '🤍' },
];

export const SKIN_TYPE_OPTIONS: Option<SkinType>[] = [
  { value: 'normal', label: 'Normale', emoji: '😊' },
  { value: 'dry', label: 'Sèche', emoji: '🍂' },
  { value: 'oily', label: 'Grasse', emoji: '💧' },
  { value: 'combination', label: 'Mixte', emoji: '🌗' },
  { value: 'sensitive', label: 'Sensible', emoji: '🌸' },
  { value: 'unknown', label: 'Je ne sais pas', emoji: '🤔' },
];

export const CONCERN_OPTIONS: Option<Concern>[] = [
  { value: 'hydration', label: 'Hydratation', emoji: '💧' },
  { value: 'radiance', label: 'Éclat du teint', emoji: '✨' },
  { value: 'dark_circles', label: 'Cernes', emoji: '😴' },
  { value: 'texture', label: 'Texture', emoji: '🪞' },
  { value: 'acne', label: 'Imperfections', emoji: '🌿' },
  { value: 'firmness', label: 'Fermeté', emoji: '🌟' },
  { value: 'posture', label: 'Posture', emoji: '🧍' },
  { value: 'tone', label: 'Tonus', emoji: '🤸' },
];

export const GOAL_OPTIONS: Option<Goal>[] = [
  { value: 'good_looks', label: 'Avoir bonne mine', emoji: '🌞' },
  { value: 'healthy_skin', label: 'Une peau plus saine', emoji: '🌿' },
  { value: 'posture', label: 'Une meilleure posture', emoji: '🧘' },
  { value: 'confidence', label: 'Confiance en soi', emoji: '💛' },
  { value: 'wellness', label: 'Bien-être global', emoji: '🌸' },
];

export const SLEEP_OPTIONS: Option<SleepBand>[] = [
  { value: 'lt6', label: 'Moins de 6 h', emoji: '🌙' },
  { value: '6to8', label: '6 à 8 h', emoji: '😴' },
  { value: 'gt8', label: 'Plus de 8 h', emoji: '☁️' },
];

export const HYDRATION_OPTIONS: Option<HydrationBand>[] = [
  { value: 'low', label: 'Moins d’1 L', emoji: '🥤' },
  { value: 'medium', label: '1 à 2 L', emoji: '💧' },
  { value: 'high', label: 'Plus de 2 L', emoji: '🌊' },
];

export const ACTIVITY_OPTIONS: Option<ActivityLevel>[] = [
  { value: 'low', label: 'Plutôt sédentaire', emoji: '🛋️' },
  { value: 'moderate', label: 'Modérée', emoji: '🚶' },
  { value: 'active', label: 'Active', emoji: '🏃' },
];

export const STRESS_OPTIONS: Option<StressLevel>[] = [
  { value: 'low', label: 'Plutôt serein·e', emoji: '🍃' },
  { value: 'medium', label: 'Modéré', emoji: '🌤️' },
  { value: 'high', label: 'Souvent stressé·e', emoji: '⛅' },
];

export const DIET_OPTIONS: Option<Diet>[] = [
  { value: 'omnivore', label: 'Omnivore', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Végétarien·ne', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
];

export const CURRENT_ROUTINE_OPTIONS: Option<CurrentRoutine>[] = [
  { value: 'none', label: 'Aucune', emoji: '🌱' },
  { value: 'basic', label: 'Basique', emoji: '🌿' },
  { value: 'elaborate', label: 'Élaborée', emoji: '🌳' },
];

export const ROUTINE_TIME_OPTIONS: Option<RoutineTime>[] = [
  { value: '5min', label: '5 min', emoji: '⏱️' },
  { value: '15min', label: '15 min', emoji: '⏲️' },
  { value: '30min', label: '30 min et +', emoji: '🕰️' },
];

export const SCAN_REMINDER_OPTIONS: Option<ScanReminder>[] = [
  { value: 'off', label: 'Désactivé', emoji: '🔕' },
  { value: 'daily', label: 'Chaque jour', emoji: '☀️' },
  { value: 'weekly', label: 'Chaque semaine', emoji: '🗓️' },
];

export const PRODUCT_PREF_OPTIONS: Option<ProductPref>[] = [
  { value: 'bio_only', label: 'Bio uniquement', emoji: '🌿' },
  { value: 'whatever', label: 'Peu importe', emoji: '🤷' },
  { value: 'sensitive', label: 'Sensible à certains ingrédients', emoji: '🌸' },
];

/** Allergènes courants → tokens d'ingrédients à exclure strictement. */
export const ALLERGEN_OPTIONS: { label: string; tokens: string[] }[] = [
  { label: 'Parfum / fragrance', tokens: ['parfum', 'fragrance'] },
  { label: 'Huiles essentielles', tokens: ['huile essentielle', 'essential oil'] },
  {
    label: 'Fruits à coque',
    tokens: ['amande', 'amygdalus', 'noisette', 'noix', 'macadamia', 'argania'],
  },
  { label: 'Arachide', tokens: ['arachis', 'arachide'] },
  {
    label: 'Produits de la ruche',
    tokens: ['cire abeille', 'beeswax', 'cera alba', 'miel', 'honey', 'propolis'],
  },
  { label: 'Lanoline', tokens: ['lanolin', 'lanoline'] },
  { label: 'Gluten / avoine', tokens: ['avena', 'avoine', 'gluten', 'triticum', 'wheat'] },
  { label: 'Soja', tokens: ['soja', 'glycine soja', 'soy'] },
];

/** Préoccupation → critère d'analyse correspondant (pour pondérer le scoring). */
export const CONCERN_TO_CRITERION: Record<Concern, CriterionId> = {
  hydration: 'hydration',
  radiance: 'glow',
  dark_circles: 'dark_circles',
  texture: 'skin_texture',
  acne: 'skin_texture',
  firmness: 'symmetry',
  posture: 'posture',
  tone: 'tone',
};
