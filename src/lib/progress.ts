import { formatDayMonth } from './utils';
import type { CriterionId, StoredScan } from '@/types/domain';
import type { ScanReminder } from '@/types/profile';

/** Libellé court par critère (axes de courbe, timeline). */
export const CRITERION_LABEL: Record<CriterionId, string> = {
  hydration: 'Hydratation',
  glow: 'Éclat',
  dark_circles: 'Cernes',
  skin_texture: 'Texture',
  lip_brow_care: 'Lèvres & sourcils',
  symmetry: 'Harmonie',
  posture: 'Posture',
  tone: 'Tonus',
  skin_hydration: 'Hydratation du corps',
};

/** Tournure pour le message de gain (« +12 points d'éclat »). */
const PHRASE: Record<CriterionId, string> = {
  hydration: "d'hydratation",
  glow: "d'éclat",
  dark_circles: 'sur les cernes',
  skin_texture: 'de texture',
  lip_brow_care: 'de soin',
  symmetry: "d'harmonie",
  posture: 'de posture',
  tone: 'de tonus',
  skin_hydration: "d'hydratation",
};

/** Nombre de jours entre deux dates ISO (≥ 0). */
export function daysBetween(aISO: string, bISO: string): number {
  return Math.max(
    0,
    Math.round(
      (new Date(bISO).getTime() - new Date(aISO).getTime()) / 86_400_000,
    ),
  );
}

/** Historique trié du plus ancien au plus récent. */
export function chronological(history: StoredScan[]): StoredScan[] {
  return [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export interface SeriesPoint {
  date: string;
  value: number;
}

/** Série du score global dans le temps. */
export function globalSeries(history: StoredScan[]): SeriesPoint[] {
  return chronological(history).map((s) => ({
    date: formatDayMonth(s.createdAt),
    value: s.overall,
  }));
}

/** Série d'un critère donné dans le temps. */
export function criterionSeries(
  history: StoredScan[],
  id: CriterionId,
): SeriesPoint[] {
  return chronological(history).map((s) => {
    const c = s.analysis.criteria.find((x) => x.id === id);
    return { date: formatDayMonth(s.createdAt), value: c ? c.score : 0 };
  });
}

/** Critères présents dans l'historique (sélecteur de courbe). */
export function availableCriteria(
  history: StoredScan[],
): { id: CriterionId; label: string }[] {
  const first = history[0];
  if (!first) return [];
  return first.analysis.criteria.map((c) => ({
    id: c.id,
    label: CRITERION_LABEL[c.id],
  }));
}

export interface Improvement {
  id: CriterionId;
  label: string;
  phrase: string;
  delta: number;
}

/** Critère ayant le plus progressé entre deux scans (ou null). */
export function bestImprovement(
  from: StoredScan,
  to: StoredScan,
): Improvement | null {
  let best: Improvement | null = null;
  for (const c of to.analysis.criteria) {
    const prev = from.analysis.criteria.find((x) => x.id === c.id);
    if (!prev) continue;
    const delta = c.score - prev.score;
    if (delta > 0 && (!best || delta > best.delta)) {
      best = {
        id: c.id,
        label: CRITERION_LABEL[c.id],
        phrase: PHRASE[c.id],
        delta,
      };
    }
  }
  return best;
}

/** Un scan est-il « dû » selon la fréquence et la date du dernier scan ? */
export function isScanDue(freq: ScanReminder, lastISO: string | null): boolean {
  if (freq === 'off') return false;
  if (!lastISO) return true;
  const days = (Date.now() - new Date(lastISO).getTime()) / 86_400_000;
  return freq === 'daily' ? days >= 1 : days >= 7;
}
