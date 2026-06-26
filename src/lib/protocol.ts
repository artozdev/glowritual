import type {
  CriterionId,
  ProductNeed,
  RoutinePeriod,
  ScanAnalysis,
  ScanZoneId,
  Severity,
} from '@/types/domain';

/**
 * ════════════════════════════════════════════════════════════════
 *  PROTOCOLE PERSONNALISÉ — par zone & par priorité (100 % naturel)
 * ════════════════════════════════════════════════════════════════
 *  Dérive un « plan » clair à partir de l'analyse : les zones à
 *  sublimer en premier (priorité = dérivée du score, jamais un score
 *  de beauté), le geste naturel à faire, le produit naturel associé
 *  et le moment (matin / soir / hebdo) — relié à la routine & au suivi.
 * ════════════════════════════════════════════════════════════════
 */

/** Moments conseillés par critère (sinon : matin & soir). */
const CRITERION_PERIODS: Partial<Record<CriterionId, RoutinePeriod[]>> = {
  hydration: ['morning', 'evening'],
  glow: ['morning'],
  imperfections: ['evening'],
  post_acne_marks: ['evening'],
  skin_texture: ['evening', 'weekly'],
  pigmentation: ['morning'],
  wrinkles: ['evening'],
  firmness: ['evening', 'weekly'],
  dark_circles: ['evening'],
  shine: ['morning'],
  lip_brow_care: ['evening'],
  neck: ['evening'],
  hair_scalp: ['weekly'],
  posture: ['morning'],
  tone: ['weekly'],
  skin_hydration: ['evening'],
};

export interface ProtocolItem {
  id: CriterionId;
  /** Libellé du critère/zone à sublimer. */
  label: string;
  score: number;
  /** Priorité 0..100 (plus haut = à sublimer en premier). */
  priority: number;
  severity: Severity;
  /** Le geste naturel à faire (massage, gua sha, hygiène de vie…). */
  geste: string;
  /** Besoin produit naturel associé. */
  need: ProductNeed;
  /** Zone du visage (si applicable). */
  zone?: ScanZoneId;
  /** Moments de la routine où agir. */
  periods: RoutinePeriod[];
}

/**
 * Construit le protocole : critères triés par priorité (à sublimer d'abord).
 * Pur et synchrone — chaque entrée porte le geste + le produit + les moments.
 */
export function buildProtocol(analysis: ScanAnalysis): ProtocolItem[] {
  return [...analysis.criteria]
    .sort((a, b) => b.priority - a.priority)
    .map((c) => ({
      id: c.id,
      label: c.label,
      score: c.score,
      priority: c.priority,
      severity: c.severity,
      geste: c.recommendation,
      need: c.need,
      zone: c.zone,
      periods: CRITERION_PERIODS[c.id] ?? ['morning', 'evening'],
    }));
}
