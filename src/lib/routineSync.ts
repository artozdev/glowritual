import { supabase } from '@/lib/supabase';

/**
 * Synchronisation des complétions de routine avec Supabase.
 *
 * La routine est régénérée de façon déterministe (ids de tâche stables
 * `{scanId}-{période}-{slug}`) ; on ne persiste donc que l'état « coché ».
 * Présence d'une ligne = tâche complétée. Best-effort (ne casse jamais l'UI).
 */

/** Charge l'ensemble des ids de tâches complétées d'un utilisateur. */
export async function fetchCompletions(
  userId: string,
): Promise<Record<string, boolean>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('routine_completions')
    .select('task_id')
    .eq('user_id', userId);
  if (error || !data) return {};
  const map: Record<string, boolean> = {};
  for (const row of data) map[row.task_id] = true;
  return map;
}

/** Coche / décoche une tâche (insert ou delete). */
export async function setCompletion(
  userId: string,
  taskId: string,
  completed: boolean,
): Promise<void> {
  if (!supabase) return;
  if (completed) {
    // ON CONFLICT DO NOTHING : ne nécessite pas de policy UPDATE (rien à mettre à jour).
    await supabase
      .from('routine_completions')
      .upsert(
        { user_id: userId, task_id: taskId },
        { onConflict: 'user_id,task_id', ignoreDuplicates: true },
      );
  } else {
    await supabase
      .from('routine_completions')
      .delete()
      .eq('user_id', userId)
      .eq('task_id', taskId);
  }
}
