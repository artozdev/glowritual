import type {
  CriterionId,
  GeneratedTask,
  ProductNeed,
  RoutinePeriod,
  ScanAnalysis,
} from '@/types/domain';
import type { RoutineTime, UserProfile } from '@/types/profile';
import { CONCERN_TO_CRITERION } from '@/data/profileOptions';

/**
 * Génère une routine naturelle et douce à partir d'une analyse.
 *
 * Chaque tâche embarque une explication concrète : l'objectif (à quoi ça sert),
 * comment la réaliser, et le besoin produit associé (pour proposer où le trouver).
 * Aucune tâche extrême : hydratation, soins doux, sommeil, mouvement léger.
 */

interface TaskTemplate {
  title: string;
  detail: string;
  period: RoutinePeriod;
  goal: string;
  how: string;
  productNeed?: ProductNeed;
}

/** Socle commun, indépendant du score. */
const BASE_FACE: TaskTemplate[] = [
  {
    title: 'Hydrater le visage',
    detail: 'Crème hydratante douce sur peau propre.',
    period: 'morning',
    goal: 'Renforcer la barrière de la peau pour éviter tiraillements et déshydratation, et garder un teint frais toute la journée.',
    how: 'Sur peau propre, applique une noisette de crème en massant du centre du visage vers l’extérieur. Matin (et idéalement le soir).',
    productNeed: 'hydration',
  },
  {
    title: 'Boire un grand verre d’eau',
    detail: 'Un réflexe simple pour une peau souple.',
    period: 'morning',
    goal: 'Une bonne hydratation interne se voit directement sur la peau : plus souple, plus repulpée, moins marquée.',
    how: 'Bois 25–30 cl dès le réveil, puis répartis environ 1,5 L sur la journée. Garde une bouteille à portée de main.',
  },
  {
    title: 'Nettoyage doux',
    detail: 'Démaquille et nettoie sans produit agressif.',
    period: 'evening',
    goal: 'Retirer pollution, sébum et résidus accumulés dans la journée pour des pores nets, sans décaper la peau.',
    how: 'Le soir, masse un nettoyant doux sans savon 30 s sur peau humide, rince à l’eau tiède et sèche en tamponnant.',
    productNeed: 'skin_renewal',
  },
  {
    title: 'Nuit réparatrice',
    detail: 'Visez 7 à 8 h de sommeil régulier.',
    period: 'evening',
    goal: 'Le sommeil est le moment où la peau se régénère (réparation cellulaire, collagène). Mal dormir = teint terne et cernes.',
    how: 'Vise 7–8 h à heures régulières. Coupe les écrans 30 min avant le coucher, chambre fraîche et sombre.',
  },
  {
    title: 'Gommage doux',
    detail: 'Une fois par semaine, pour un teint frais.',
    period: 'weekly',
    goal: 'Éliminer les cellules mortes en surface pour affiner le grain de peau et raviver l’éclat.',
    how: 'Une fois par semaine, applique un gommage doux (enzymatique ou grains fins) en cercles légers, évite le contour des yeux, rince.',
    productNeed: 'skin_renewal',
  },
];

const BASE_BODY: TaskTemplate[] = [
  {
    title: 'Mouvement doux',
    detail: '20–30 min de marche ou d’étirements.',
    period: 'morning',
    goal: 'Activer la circulation et l’oxygénation : bon pour le tonus, l’humeur et l’éclat de la peau.',
    how: 'Bouge 20–30 min à ton rythme : marche, étirements, vélo. La régularité compte plus que l’intensité.',
  },
  {
    title: 'Hydrater le corps',
    detail: 'Huile ou lait après la douche.',
    period: 'evening',
    goal: 'Nourrir la peau du corps pour la garder souple et confortable, surtout sur les zones sèches.',
    how: 'Juste après la douche, sur peau encore humide, masse une huile ou un lait jusqu’à pénétration complète.',
    productNeed: 'body_hydration',
  },
  {
    title: 'Séance bien-être',
    detail: 'Yoga, natation ou renforcement léger.',
    period: 'weekly',
    goal: 'Tonifier le corps et relâcher les tensions, pour une silhouette et une posture plus toniques.',
    how: 'Une séance par semaine de yoga, natation ou renforcement léger. Choisis une activité qui te plaît pour tenir dans la durée.',
  },
];

/** Tâches ciblées par critère (ajoutées si le critère est à sublimer). */
const TARGETED: Partial<Record<CriterionId, TaskTemplate>> = {
  glow: {
    title: 'Boost d’éclat',
    detail: 'Fruits & légumes riches en vitamine C au menu.',
    period: 'morning',
    goal: 'Soutenir l’éclat du teint de l’intérieur grâce aux antioxydants (vitamine C) qui protègent la peau.',
    how: 'Ajoute des fruits/légumes colorés (kiwi, agrumes, poivron) à chaque repas. En option, un sérum éclat le matin avant la crème.',
    productNeed: 'radiance',
  },
  dark_circles: {
    title: 'Soin du regard',
    detail: 'Massage léger du contour de l’œil.',
    period: 'evening',
    goal: 'Décongestionner le contour de l’œil et atténuer cernes et poches liés à la fatigue.',
    how: 'Le soir, tapote une petite quantité de soin du regard de l’angle interne vers l’externe, sans frotter.',
    productNeed: 'eye_care',
  },
  skin_texture: {
    title: 'Affiner le grain de peau',
    detail: 'Sérum doux + hydratation ciblée le soir.',
    period: 'evening',
    goal: 'Lisser le relief de la peau et resserrer l’aspect des pores pour une texture plus régulière.',
    how: 'Le soir, applique un sérum doux (bakuchiol/niacinamide) sur peau propre, puis hydrate. Évite les gommages agressifs.',
    productNeed: 'skin_renewal',
  },
  lip_brow_care: {
    title: 'Soin lèvres & sourcils',
    detail: 'Baume au karité et huile de ricin.',
    period: 'evening',
    goal: 'Nourrir des lèvres souvent négligées et densifier naturellement les sourcils.',
    how: 'Le soir, applique un baume nourrissant sur les lèvres et une goutte d’huile de ricin au pinceau sur les sourcils.',
    productNeed: 'lip_brow_care',
  },
  hydration: {
    title: 'Sceller l’hydratation',
    detail: 'Quelques gouttes d’huile de jojoba après la crème.',
    period: 'evening',
    goal: 'Verrouiller l’hydratation pour éviter qu’elle ne s’évapore pendant la nuit.',
    how: 'Le soir, après ta crème, chauffe 2–3 gouttes d’huile végétale légère (jojoba) entre les mains et presse sur le visage.',
    productNeed: 'hydration',
  },
  posture: {
    title: 'Réveil de la posture',
    detail: 'Étirements du dos + épaules en arrière.',
    period: 'morning',
    goal: 'Ouvrir la posture et relâcher le haut du dos pour une allure plus tonique et confiante.',
    how: 'Le matin, 2–3 min : étire le dos, roule les épaules vers l’arrière, grandis-toi. À refaire si tu restes assis longtemps.',
    productNeed: 'posture_wellness',
  },
  tone: {
    title: 'Renfort tonus',
    detail: 'Gainage léger 5 min, à votre rythme.',
    period: 'weekly',
    goal: 'Renforcer en douceur les muscles profonds pour une silhouette plus tonique.',
    how: 'Une fois par semaine (ou plus), 5 min de gainage léger (planche, à genoux si besoin), à ton rythme et sans forcer.',
    productNeed: 'body_firmness',
  },
  skin_hydration: {
    title: 'Nourrir la peau',
    detail: 'Beurre de karité sur les zones sèches.',
    period: 'evening',
    goal: 'Réparer et nourrir les zones sèches du corps (coudes, genoux, jambes).',
    how: 'Le soir, masse un beurre de karité ou une huile riche sur les zones sèches jusqu’à absorption.',
    productNeed: 'body_hydration',
  },
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Nombre de tâches max par période selon le temps disponible. */
const PERIOD_CAPS: Record<RoutineTime, Record<RoutinePeriod, number>> = {
  '5min': { morning: 1, evening: 1, weekly: 1 },
  '15min': { morning: 2, evening: 2, weekly: 1 },
  '30min': { morning: 9, evening: 9, weekly: 9 },
};

/** Limite le nombre de tâches par période (essentielles d'abord). */
function capByTime(tasks: GeneratedTask[], time: RoutineTime): GeneratedTask[] {
  const caps = PERIOD_CAPS[time];
  const counts: Record<RoutinePeriod, number> = {
    morning: 0,
    evening: 0,
    weekly: 0,
  };
  const out: GeneratedTask[] = [];
  for (const t of tasks) {
    if (counts[t.period] < caps[t.period]) {
      out.push(t);
      counts[t.period] += 1;
    }
  }
  return out;
}

export function generateRoutine(
  scanId: string,
  analysis: ScanAnalysis,
  profile?: UserProfile,
): GeneratedTask[] {
  const base = analysis.kind === 'face' ? BASE_FACE : BASE_BODY;

  // Les 2 critères les plus bas → tâches ciblées prioritaires.
  const toNurture = [...analysis.criteria]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  const templates: { tpl: TaskTemplate; criterion?: CriterionId }[] = [
    ...base.map((tpl) => ({ tpl })),
  ];

  for (const c of toNurture) {
    const tpl = TARGETED[c.id];
    if (tpl) templates.push({ tpl, criterion: c.id });
  }

  // Préoccupations déclarées dans l'onboarding → tâches ciblées en plus.
  if (profile) {
    for (const concern of profile.concerns) {
      const critId = CONCERN_TO_CRITERION[concern];
      const tpl = TARGETED[critId];
      if (tpl) templates.push({ tpl, criterion: critId });
    }
  }

  // Dédoublonnage par titre, puis identifiants stables.
  const seen = new Set<string>();
  const tasks: GeneratedTask[] = [];
  for (const { tpl, criterion } of templates) {
    const key = slug(tpl.title);
    if (seen.has(key)) continue;
    seen.add(key);
    tasks.push({
      id: `${scanId}-${tpl.period}-${key}`,
      title: tpl.title,
      detail: tpl.detail,
      period: tpl.period,
      criterion,
      goal: tpl.goal,
      how: tpl.how,
      productNeed: tpl.productNeed,
    });
  }

  // Calibrage selon le temps que l'utilisateur souhaite y consacrer.
  return capByTime(tasks, profile?.routineTime ?? '15min');
}

/** Regroupe les tâches par moment de la journée. */
export function groupByPeriod(
  tasks: GeneratedTask[],
): Record<RoutinePeriod, GeneratedTask[]> {
  return {
    morning: tasks.filter((t) => t.period === 'morning'),
    evening: tasks.filter((t) => t.period === 'evening'),
    weekly: tasks.filter((t) => t.period === 'weekly'),
  };
}
