import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Suppression complète des données utilisateur (confidentialité / RGPD).
 * - Toujours : purge des données locales.
 * - Si Supabase configuré : suppression des lignes + fichiers de l'utilisateur.
 */

const LOCAL_KEYS = [
  'naturalme.scans.v1',
  'naturalme.completions.v1',
  'naturalme.profile.v1',
  'naturalme.beauty-profile.v1', // ancienne clé (compat)
  'naturalme.reminders.v1',
  'naturalme.demo-user',
  'naturalme.demo-accounts.v1',
];

/** Efface toutes les données stockées localement. */
export function purgeLocalData(): void {
  for (const key of LOCAL_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/** Supprime les données de l'utilisateur côté Supabase (best-effort). */
export async function purgeSupabaseData(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  // Données relationnelles (la RLS limite déjà à l'utilisateur courant).
  await supabase.from('routine_tasks').delete().eq('user_id', userId);
  await supabase.from('routines').delete().eq('user_id', userId);
  await supabase.from('scans').delete().eq('user_id', userId); // scan_points en cascade

  // Fichiers du dossier de l'utilisateur dans le bucket privé.
  const { data: files } = await supabase.storage.from('scans').list(userId);
  if (files && files.length > 0) {
    await supabase.storage
      .from('scans')
      .remove(files.map((f) => `${userId}/${f.name}`));
  }

  // Réinitialise les préférences du profil (la ligne profile reste).
  await supabase
    .from('profiles')
    .update({ allergies: [], skin_type: 'normal' })
    .eq('id', userId);
}

/**
 * Supprime toutes les données de l'utilisateur (local + Supabase si dispo).
 * `userId` non fourni (session démo) → suppression locale uniquement.
 */
export async function deleteAllUserData(userId?: string): Promise<void> {
  if (userId) {
    try {
      await purgeSupabaseData(userId);
    } catch {
      /* on purge le local quoi qu'il arrive */
    }
  }
  purgeLocalData();
}
