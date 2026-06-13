import type {
  FaceCriterionId,
  BodyCriterionId,
  NormalizedPoint,
} from '@/types/domain';

/**
 * Base de contenu par critère : libellé, position du point sur l'image,
 * explications (selon le score) et recommandation 100 % naturelle.
 *
 * ⚠️ Volontairement séparé du moteur (`analysis.ts`) : on pourra enrichir
 * ou remplacer ces textes (ou les brancher sur une API) sans toucher au calcul.
 * Ton : bienveillant, inclusif, jamais culpabilisant. Aucun conseil extrême.
 */
export interface CriterionContent {
  /** Libellé complet (fiche). */
  label: string;
  /** Libellé court (axes du radar). */
  short: string;
  /** Position normalisée du point interactif (0..1). */
  position: NormalizedPoint;
  /** Explication quand le score est élevé. */
  good: string;
  /** Explication quand le critère peut être sublimé. */
  nurture: string;
  /** Recommandation naturelle (toujours affichée). */
  recommendation: string;
}

export const FACE_CONTENT: Record<FaceCriterionId, CriterionContent> = {
  hydration: {
    label: 'Hydratation',
    short: 'Hydratation',
    position: { x: 0.5, y: 0.2 },
    good: 'Votre peau paraît souple et bien hydratée. Continuez ainsi !',
    nurture:
      'Votre peau gagnerait en confort avec un peu plus d’hydratation au quotidien.',
    recommendation:
      'Buvez régulièrement et appliquez une crème hydratante douce matin et soir. Une huile végétale légère (jojoba) aide à sceller l’hydratation.',
  },
  glow: {
    label: 'Éclat du teint',
    short: 'Éclat',
    position: { x: 0.33, y: 0.54 },
    good: 'Votre teint est lumineux et homogène.',
    nurture:
      'Un petit coup d’éclat mettrait votre teint encore plus en valeur.',
    recommendation:
      'Misez sur des fruits et légumes colorés (vitamine C), un sommeil suffisant et un gommage doux une fois par semaine.',
  },
  dark_circles: {
    label: 'Cernes',
    short: 'Regard',
    position: { x: 0.63, y: 0.42 },
    good: 'Votre regard est frais et reposé.',
    nurture:
      'Vos yeux trahissent un brin de fatigue — rien qu’un bon repos ne sublime.',
    recommendation:
      'Privilégiez 7 à 8 h de sommeil, une bonne hydratation et un léger massage du contour de l’œil (huile d’amande douce).',
  },
  skin_texture: {
    label: 'Texture de peau',
    short: 'Texture',
    position: { x: 0.67, y: 0.58 },
    good: 'Votre grain de peau est régulier et doux.',
    nurture: 'Votre grain de peau peut être affiné tout en douceur.',
    recommendation:
      'Nettoyez matin et soir avec un produit doux, exfoliez une fois par semaine et hydratez. Évitez les produits agressifs.',
  },
  lip_brow_care: {
    label: 'Soin lèvres & sourcils',
    short: 'Lèvres',
    position: { x: 0.5, y: 0.76 },
    good: 'Lèvres et sourcils sont soignés et harmonieux.',
    nurture: 'Vos lèvres et sourcils méritent un petit soin régulier.',
    recommendation:
      'Baume à lèvres nourrissant (karité), brossage des sourcils et une goutte d’huile de ricin le soir pour les densifier naturellement.',
  },
  symmetry: {
    label: 'Symétrie',
    short: 'Harmonie',
    position: { x: 0.5, y: 0.48 },
    good: 'Vos traits sont équilibrés et harmonieux.',
    nurture:
      'Vos traits sont naturellement expressifs — une légère asymétrie fait tout votre charme.',
    recommendation:
      'La symétrie parfaite n’existe pas et n’est pas un objectif. Mettez en valeur vos atouts (coiffure, sourire, posture). Aucun geste correctif n’est nécessaire.',
  },
};

export const BODY_CONTENT: Record<BodyCriterionId, CriterionContent> = {
  posture: {
    label: 'Posture',
    short: 'Posture',
    position: { x: 0.5, y: 0.28 },
    good: 'Votre posture est droite et ouverte.',
    nurture: 'Une posture plus ouverte renforcerait votre présence naturelle.',
    recommendation:
      'Quelques étirements doux chaque jour, un peu de gainage léger et des pauses pour redresser les épaules suffisent.',
  },
  tone: {
    label: 'Tonus',
    short: 'Tonus',
    position: { x: 0.5, y: 0.55 },
    good: 'Votre tonus musculaire paraît harmonieux.',
    nurture: 'Un peu d’activité douce tonifierait agréablement votre silhouette.',
    recommendation:
      'Marche quotidienne, yoga ou natation : la régularité prime toujours sur l’intensité. Bougez à votre rythme.',
  },
  skin_hydration: {
    label: 'Hydratation de la peau',
    short: 'Hydratation',
    position: { x: 0.34, y: 0.62 },
    good: 'Votre peau paraît souple et nourrie.',
    nurture: 'Votre peau corporelle gagnerait à être davantage nourrie.',
    recommendation:
      'Hydratez juste après la douche (huile d’amande douce ou beurre de karité) et veillez à boire suffisamment.',
  },
};
