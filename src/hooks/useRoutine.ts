import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateRoutine, groupByPeriod } from '@/lib/routine-generator';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchCompletions, setCompletion } from '@/lib/routineSync';
import type { StoredScan } from '@/types/domain';

const STORAGE_KEY = 'naturalme.completions.v1';

function loadLocal(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Génère la routine d'un scan (déterministe) et gère le suivi de complétion.
 *
 * - Supabase configuré : complétions chargées/écrites dans `routine_completions`
 *   (suivi retrouvé sur tout appareil). - Mode démo : localStorage.
 * Best-effort : l'UI réagit immédiatement, les erreurs réseau sont ignorées.
 */
export function useRoutine(scan: StoredScan | null) {
  const { profile } = useProfile();
  const { user } = useAuth();
  const userId = user && !user.isDemo ? user.id : null;
  const cloud = isSupabaseConfigured && !!userId;

  const tasks = useMemo(
    () => (scan ? generateRoutine(scan.id, scan.analysis, profile) : []),
    [scan, profile],
  );

  const [done, setDone] = useState<Record<string, boolean>>(() =>
    isSupabaseConfigured ? {} : loadLocal(),
  );

  // Charge les complétions au changement d'utilisateur.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDone(loadLocal());
      return;
    }
    if (!userId) {
      setDone({});
      return;
    }
    let cancelled = false;
    void (async () => {
      const map = await fetchCompletions(userId);
      if (!cancelled) setDone(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const completed = !prev[id];
        const next = { ...prev, [id]: completed };
        if (cloud && userId) void setCompletion(userId, id, completed);
        else {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
        }
        return next;
      });
    },
    [cloud, userId],
  );

  const isDone = useCallback((id: string) => Boolean(done[id]), [done]);

  const completed = tasks.filter((t) => done[t.id]).length;
  const total = tasks.length;
  const progress = total ? (completed / total) * 100 : 0;

  return {
    tasks,
    grouped: groupByPeriod(tasks),
    isDone,
    toggle,
    completed,
    total,
    progress,
  };
}
