import type { CriterionId, ScanAnalysis, StoredScan } from '@/types/domain';
import type { ScanReminder, UserProfile } from '@/types/profile';
import { daysBetween } from './progress';
import { formatDate } from './utils';

/** Libellé court de la prochaine date de scan (sidebar/header dashboard). */
export function nextScanLabel(reminder: ScanReminder, lastISO?: string): string {
  if (!lastISO) return 'Fais ton premier scan';
  if (reminder === 'off') return 'À reprogrammer';
  const next = new Date(lastISO);
  next.setDate(next.getDate() + (reminder === 'daily' ? 1 : 7));
  if (next.getTime() <= Date.now()) return "Aujourd'hui";
  return formatDate(next.toISOString());
}

/**
 * ════════════════════════════════════════════════════════════════
 *  GLOW PLAN — assemblage du rapport de soin personnalisé
 * ════════════════════════════════════════════════════════════════
 *  Dérive, à partir de l'analyse + du profil + de l'historique :
 *   • un objectif réaliste + un délai HONNÊTE par critère ;
 *   • un parcours de progression sur plusieurs semaines (jalons) ;
 *   • des conseils d'hygiène de vie (jamais de plan nutritionnel prescrit).
 *  Ton bienveillant, progression personnelle — jamais un score de beauté.
 * ════════════════════════════════════════════════════════════════
 */

interface Goal {
  objective: string;
  delay: string;
}

const GOAL_BY_CRITERION: Partial<Record<CriterionId, Goal>> = {
  hydration: {
    objective: 'Une peau plus souple et confortable',
    delay: 'Confort dès quelques jours, éclat en 2–3 semaines',
  },
  glow: {
    objective: 'Un teint plus lumineux et frais',
    delay: 'Visible en 3–4 semaines avec régularité',
  },
  imperfections: {
    objective: 'Une peau plus nette',
    delay: 'Amélioration progressive sur 4–6 semaines',
  },
  post_acne_marks: {
    objective: 'Des marques estompées',
    delay: 'De plusieurs semaines à quelques mois — la patience paie',
  },
  skin_texture: {
    objective: 'Un grain de peau affiné',
    delay: '4–6 semaines de soin doux',
  },
  pigmentation: {
    objective: 'Un teint plus homogène',
    delay: 'Quelques semaines, surtout avec une protection solaire',
  },
  wrinkles: {
    objective: 'Des ridules repulpées',
    delay: 'Souplesse en quelques semaines, durable sur la durée',
  },
  firmness: {
    objective: 'Un contour plus tonique',
    delay: 'Effet « bonne mine » rapide, tonus sur la durée',
  },
  dark_circles: {
    objective: 'Un regard plus reposé',
    delay: 'Dès que le sommeil s’améliore — quelques jours',
  },
  shine: {
    objective: 'Une zone T équilibrée',
    delay: 'Quelques jours à 2 semaines',
  },
  lip_brow_care: {
    objective: 'Des lèvres nourries, des sourcils soignés',
    delay: 'Confort immédiat, densité sur 1–2 mois',
  },
  neck: {
    objective: 'Une peau du cou souple et tonique',
    delay: 'Quelques semaines avec régularité',
  },
  hair_scalp: {
    objective: 'Un cuir chevelu sain, des cheveux plus forts',
    delay: 'Plusieurs semaines — au rythme du cycle du cheveu',
  },
};

const DEFAULT_GOAL: Goal = {
  objective: 'Sublimer cette zone en douceur',
  delay: 'Visible en quelques semaines avec régularité',
};

/** Objectif réaliste + délai honnête pour un critère. */
export function goalFor(id: CriterionId): Goal {
  return GOAL_BY_CRITERION[id] ?? DEFAULT_GOAL;
}

/* ── Parcours de progression (jalons) ───────────────────────────── */

export interface Milestone {
  range: string;
  title: string;
  text: string;
}

const JOURNEY: Milestone[] = [
  {
    range: 'Semaine 1–2',
    title: 'Mise en place',
    text: 'Tu installes ta routine et tes gestes. La peau s’habitue en douceur — la régularité prime sur l’intensité.',
  },
  {
    range: 'Semaine 3–4',
    title: 'Premiers résultats',
    text: 'Les premiers effets apparaissent : plus de confort, un teint plus frais et plus régulier.',
  },
  {
    range: 'Semaine 5–8',
    title: 'Ancrage',
    text: 'Les bons gestes deviennent un réflexe et les progrès se confirment scan après scan.',
  },
  {
    range: 'Au-delà',
    title: 'Entretien',
    text: 'Tu maintiens tes acquis et tu ajustes ton plan selon tes nouveaux scans.',
  },
];

export interface Journey {
  milestones: Milestone[];
  /** Jalon courant (selon le temps écoulé depuis le 1ᵉʳ scan). */
  currentIndex: number;
}

/** Construit le parcours et situe l'utilisateur selon l'ancienneté de son suivi. */
export function buildJourney(history: StoredScan[]): Journey {
  const first = history[history.length - 1];
  let currentIndex = 0;
  if (first) {
    const weeks = daysBetween(first.createdAt, new Date().toISOString()) / 7;
    if (weeks >= 8) currentIndex = 3;
    else if (weeks >= 4) currentIndex = 2;
    else if (weeks >= 2) currentIndex = 1;
  }
  return { milestones: JOURNEY, currentIndex };
}

/* ── Conseils d'hygiène de vie (jamais prescrits) ───────────────── */

export interface LifestyleTip {
  key: 'sleep' | 'hydration' | 'nutrition' | 'stress' | 'movement';
  title: string;
  text: string;
}

/**
 * Conseils de bien-être généraux, dérivés des réponses d'onboarding.
 * Volontairement non prescriptifs (l'alimentation reste un conseil général).
 */
export function lifestyleTips(profile: UserProfile): LifestyleTip[] {
  const tips: LifestyleTip[] = [];

  tips.push({
    key: 'sleep',
    title: 'Sommeil',
    text:
      profile.sleep === 'lt6'
        ? 'Vise 7 à 8 h : c’est la nuit que la peau se régénère (cernes et teint terne s’améliorent vite).'
        : 'Tes nuits régulières sont un vrai atout pour ta peau — continue ainsi.',
  });

  tips.push({
    key: 'hydration',
    title: 'Hydratation',
    text:
      profile.hydration === 'low'
        ? 'Un peu plus d’eau (~1,5 L/j) et la peau gagne vite en souplesse et en éclat.'
        : 'Belle hydratation au quotidien : garde ce réflexe, ta peau le rend bien.',
  });

  tips.push({
    key: 'nutrition',
    title: 'Alimentation',
    text: 'Des assiettes variées et colorées (fruits, légumes, oméga-3) soutiennent l’éclat — pas de régime, juste de la variété. Pour un suivi nutritionnel, voir un professionnel.',
  });

  tips.push({
    key: 'stress',
    title: 'Stress',
    text:
      profile.stress === 'high'
        ? 'Quelques minutes de respiration ou de marche apaisent la peau — le stress se voit sur le teint.'
        : 'Tu gardes un bon équilibre : ces moments pour toi profitent aussi à ta peau.',
  });

  if (profile.activity === 'low') {
    tips.push({
      key: 'movement',
      title: 'Mouvement',
      text: 'Bouge un peu chaque jour (marche, étirements) : la circulation booste naturellement l’éclat.',
    });
  }

  return tips;
}

/* ── Vue d'ensemble (forces & priorités) ────────────────────────── */

/** Forces (≥ 80) et 3 priorités (priorité la plus haute), pour la vue d'ensemble. */
export function overviewSplit(analysis: ScanAnalysis) {
  const strengths = analysis.criteria
    .filter((c) => c.score >= 80)
    .sort((a, b) => b.score - a.score);
  const priorities = [...analysis.criteria]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
  return { strengths, priorities };
}
