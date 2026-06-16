import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/profile';
import type { Database } from '@/types/database';

/**
 * Synchronisation du profil utilisateur avec Supabase (table `profiles`).
 *
 * - `fetchProfile` : charge les réponses d'onboarding/préférences au login,
 *   pour qu'un compte existant retrouve ses données automatiquement
 *   (multi-appareils, sans refaire le questionnaire).
 * - `saveProfile` : enregistre le profil (fin d'onboarding + modifications).
 *
 * La ligne `profiles` est créée automatiquement à l'inscription (trigger
 * `handle_new_user`) → on fait donc un simple `update`.
 */

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/** Colonne `profiles` (snake_case) → champ `UserProfile` (camelCase). */
export function rowToProfile(row: Partial<ProfileRow>): Partial<UserProfile> {
  const p: Partial<UserProfile> = {};
  if (row.onboarding_completed != null)
    p.onboardingCompleted = row.onboarding_completed;
  if (row.display_name != null) p.displayName = row.display_name;
  if (row.age_band) p.ageBand = row.age_band as UserProfile['ageBand'];
  if (row.gender) p.gender = row.gender as UserProfile['gender'];
  if (row.skin_type) p.skinType = row.skin_type as UserProfile['skinType'];
  if (row.concerns) p.concerns = row.concerns as UserProfile['concerns'];
  if (row.goal) p.goal = row.goal as UserProfile['goal'];
  if (row.sleep) p.sleep = row.sleep as UserProfile['sleep'];
  if (row.hydration) p.hydration = row.hydration as UserProfile['hydration'];
  if (row.activity) p.activity = row.activity as UserProfile['activity'];
  if (row.stress) p.stress = row.stress as UserProfile['stress'];
  if (row.diet) p.diet = row.diet as UserProfile['diet'];
  if (row.allergies) p.allergies = row.allergies;
  if (row.current_routine)
    p.currentRoutine = row.current_routine as UserProfile['currentRoutine'];
  if (row.routine_time)
    p.routineTime = row.routine_time as UserProfile['routineTime'];
  if (row.product_pref)
    p.productPref = row.product_pref as UserProfile['productPref'];
  if (row.budget) p.budget = row.budget as UserProfile['budget'];
  if (row.product_gender_pref)
    p.productGenderPref = row.product_gender_pref as UserProfile['productGenderPref'];
  return p;
}

/** Champ `UserProfile` (camelCase) → colonnes `profiles` (snake_case). */
export function profileToRow(profile: UserProfile): ProfileUpdate {
  return {
    onboarding_completed: profile.onboardingCompleted,
    display_name: profile.displayName || null,
    age_band: profile.ageBand,
    gender: profile.gender,
    skin_type: profile.skinType,
    concerns: profile.concerns,
    goal: profile.goal,
    sleep: profile.sleep,
    hydration: profile.hydration,
    activity: profile.activity,
    stress: profile.stress,
    diet: profile.diet,
    allergies: profile.allergies,
    current_routine: profile.currentRoutine,
    routine_time: profile.routineTime,
    product_pref: profile.productPref,
    budget: profile.budget,
    product_gender_pref: profile.productGenderPref ?? null,
  };
}

/** Charge le profil cloud d'un utilisateur (ou `null` si indisponible). */
export async function fetchProfile(
  userId: string,
): Promise<Partial<UserProfile> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data);
}

/** Enregistre le profil cloud (best-effort). */
export async function saveProfile(
  userId: string,
  profile: UserProfile,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: null };
  const { error } = await supabase
    .from('profiles')
    .update(profileToRow(profile))
    .eq('id', userId);
  return { error: error?.message ?? null };
}
