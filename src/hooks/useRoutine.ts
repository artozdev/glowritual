import { useCallback, useMemo, useState } from 'react';
import { generateRoutine, groupByPeriod } from '@/lib/routine-generator';
import { useProfile } from '@/hooks/useProfile';
import type { StoredScan } from '@/types/domain';

const STORAGE_KEY = 'naturalme.completions.v1';

function load(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

/**
 * Génère la routine d'un scan et gère le suivi de complétion (persisté).
 * La génération auto + rappels Supabase seront finalisés à l'étape 5.
 */
export function useRoutine(scan: StoredScan | null) {
  const { profile } = useProfile();
  const tasks = useMemo(
    () => (scan ? generateRoutine(scan.id, scan.analysis, profile) : []),
    [scan, profile],
  );

  const [done, setDone] = useState<Record<string, boolean>>(() => load());

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

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
