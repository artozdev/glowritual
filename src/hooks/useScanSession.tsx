import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type { StoredScan } from '@/types/domain';
import { buildDemoHistory } from '@/data/demo';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchScans,
  insertScan,
  deleteScan,
  clearScans,
} from '@/lib/scanSync';

/**
 * Store de session des scans.
 *
 * - Supabase configuré : historique chargé depuis le cloud au login et
 *   synchronisé (insert/delete). Les photos vivent dans le bucket « scans ».
 * - Mode démo (pas de backend) : persistance localStorage + historique d'amorçage.
 *
 * Les écritures cloud sont « best-effort » : l'UI est mise à jour immédiatement
 * (optimiste) et n'est jamais bloquée par une erreur réseau.
 */

const STORAGE_KEY = 'naturalme.scans.v1';

interface ScanSessionValue {
  history: StoredScan[];
  /** Scan le plus récent (ou null si aucun). */
  latest: StoredScan | null;
  /** Nombre de scans réels (hors historique de démo) — quota freemium. */
  realScanCount: number;
  /** Vrai quand l'historique a fini de charger (local ou cloud). */
  hydrated: boolean;
  getScan: (id: string) => StoredScan | undefined;
  /** Enregistre un scan et le place en tête d'historique. */
  saveScan: (scan: StoredScan) => void;
  /** Supprime un scan. */
  removeScan: (id: string) => void;
  /** Vide tout l'historique (confidentialité). */
  clearAll: () => void;
}

const ScanSessionContext = createContext<ScanSessionValue | undefined>(undefined);

function loadLocal(): StoredScan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredScan[];
  } catch {
    /* ignore */
  }
  // Premier lancement (mode démo) : on amorce avec un historique de démonstration.
  const demo = buildDemoHistory();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  } catch {
    /* ignore */
  }
  return demo;
}

function persistLocal(history: StoredScan[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

const byDateDesc = (a: StoredScan, b: StoredScan) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user && !user.isDemo ? user.id : null;
  const cloud = isSupabaseConfigured && !!userId;

  const [history, setHistory] = useState<StoredScan[]>(() =>
    isSupabaseConfigured ? [] : loadLocal(),
  );
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured);

  // Charge l'historique au changement d'utilisateur (login / logout).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHistory(loadLocal());
      setHydrated(true);
      return;
    }
    if (!userId) {
      setHistory([]);
      setHydrated(false);
      return;
    }
    let cancelled = false;
    setHydrated(false);
    void (async () => {
      const cloudScans = await fetchScans(userId);
      if (cancelled) return;
      setHistory(cloudScans.sort(byDateDesc));
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveScan = useCallback(
    (scan: StoredScan) => {
      // Optimiste : on garde la version locale (dataURLs) pour l'affichage immédiat.
      setHistory((prev) => {
        const next = [scan, ...prev].sort(byDateDesc);
        if (!cloud) persistLocal(next);
        return next;
      });
      if (cloud && userId) void insertScan(userId, scan);
    },
    [cloud, userId],
  );

  const removeScan = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (!cloud) persistLocal(next);
        return next;
      });
      if (cloud && userId) void deleteScan(userId, id);
    },
    [cloud, userId],
  );

  const clearAll = useCallback(() => {
    setHistory([]);
    if (cloud && userId) void clearScans(userId);
    else persistLocal([]);
  }, [cloud, userId]);

  const getScan = useCallback(
    (id: string) => history.find((s) => s.id === id),
    [history],
  );

  const value = useMemo<ScanSessionValue>(() => {
    const sorted = [...history].sort(byDateDesc);
    return {
      history: sorted,
      latest: sorted[0] ?? null,
      realScanCount: sorted.filter((s) => !s.isDemo).length,
      hydrated,
      getScan,
      saveScan,
      removeScan,
      clearAll,
    };
  }, [history, hydrated, getScan, saveScan, removeScan, clearAll]);

  return (
    <ScanSessionContext.Provider value={value}>
      {children}
    </ScanSessionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScanSession(): ScanSessionValue {
  const ctx = useContext(ScanSessionContext);
  if (!ctx)
    throw new Error('useScanSession doit être utilisé dans <ScanSessionProvider>.');
  return ctx;
}
