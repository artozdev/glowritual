import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { StoredScan } from '@/types/domain';
import { buildDemoHistory } from '@/data/demo';

/**
 * Store de session des scans (mode démo).
 *
 * Persiste l'historique en localStorage. À l'étape 5, ce store sera
 * remplaçable par des requêtes Supabase (table `scans` + storage), sans
 * changer l'API consommée par les écrans.
 */

const STORAGE_KEY = 'naturalme.scans.v1';

interface ScanSessionValue {
  history: StoredScan[];
  /** Scan le plus récent (ou null si aucun). */
  latest: StoredScan | null;
  /** Nombre de scans réels (hors historique de démo) — quota freemium. */
  realScanCount: number;
  getScan: (id: string) => StoredScan | undefined;
  /** Enregistre un scan et le place en tête d'historique. */
  saveScan: (scan: StoredScan) => void;
  /** Supprime un scan. */
  removeScan: (id: string) => void;
  /** Vide tout l'historique (confidentialité). */
  clearAll: () => void;
}

const ScanSessionContext = createContext<ScanSessionValue | undefined>(undefined);

function loadHistory(): StoredScan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredScan[];
  } catch {
    /* ignore */
  }
  // Premier lancement : on amorce avec l'historique de démonstration.
  const demo = buildDemoHistory();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  } catch {
    /* ignore */
  }
  return demo;
}

function persist(history: StoredScan[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<StoredScan[]>(() => loadHistory());

  const update = useCallback((next: StoredScan[]) => {
    setHistory(next);
    persist(next);
  }, []);

  const saveScan = useCallback(
    (scan: StoredScan) => {
      update(
        [scan, ...history].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    },
    [history, update],
  );

  const removeScan = useCallback(
    (id: string) => update(history.filter((s) => s.id !== id)),
    [history, update],
  );

  const clearAll = useCallback(() => update([]), [update]);

  const getScan = useCallback(
    (id: string) => history.find((s) => s.id === id),
    [history],
  );

  const value = useMemo<ScanSessionValue>(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return {
      history: sorted,
      latest: sorted[0] ?? null,
      realScanCount: sorted.filter((s) => !s.isDemo).length,
      getScan,
      saveScan,
      removeScan,
      clearAll,
    };
  }, [history, getScan, saveScan, removeScan, clearAll]);

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
