import { analyze } from '@/lib/analysis';
import { uid } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

/**
 * Historique de démonstration : quelques scans antérieurs avec un score
 * en progression, pour peupler les écrans Progrès / Résultats avant la
 * première capture réelle. Les images sont nulles (placeholder à l'écran).
 */
const DAY = 24 * 60 * 60 * 1000;

function demoScan(seed: number, daysAgo: number): StoredScan {
  const analysis = analyze({ kind: 'face', seed, landmarks: null });
  return {
    id: uid(),
    kind: 'face',
    image: null,
    seed,
    overall: analysis.overall,
    analysis,
    createdAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
    isDemo: true,
  };
}

/** Construit un historique trié par date, avec un score globalement croissant. */
export function buildDemoHistory(): StoredScan[] {
  const seeds = [12, 7, 25, 41];
  const scans = seeds.map((s) => demoScan(s, 0));

  // Score croissant → on assigne les dates de la plus ancienne à la plus récente.
  scans.sort((a, b) => a.overall - b.overall);
  const spacing = 9; // ~9 jours entre deux scans
  return scans.map((scan, i) => ({
    ...scan,
    createdAt: new Date(
      Date.now() - (scans.length - 1 - i) * spacing * DAY,
    ).toISOString(),
  }));
}
