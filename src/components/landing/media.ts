/**
 * Médias de la landing. Images Unsplash réalistes + repli gracieux.
 *
 * ⚠️ Avant / Après : place tes deux photos dans `public/img/` sous les noms
 * `before.jpg` et `after.jpg`. Tant qu'elles sont absentes, un repli Unsplash
 * s'affiche automatiquement.
 */

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Portrait principal (mockups d'app). */
export const PORTRAIT = u('1544005313-94ddf0286df2', 900);

/** Repli si une image produit ne charge pas. */
export const PRODUCT_FALLBACK = u('1612817288484-6f916006741a', 400);

/** Avant / Après — photos fournies (URLs directes) + replis Unsplash. */
export const BEFORE_AFTER = {
  before:
    'https://cdn.phototourl.com/free/2026-06-12-8cb2909d-b5ac-487f-973e-f175e9a4174f.png',
  after:
    'https://cdn.phototourl.com/free/2026-06-12-50817523-8ac8-495e-b570-328b3ab31e89.jpg',
  beforeFallback: u('1607990281513-2c110a25bd8c', 900),
  afterFallback: u('1503443207922-dff7d543fd0e', 900),
};

/**
 * Image de fond plein écran du hero (portrait peau lumineuse, fond gris).
 * ⚠️ Place l'image fournie dans `public/img/hero-bg.jpg`.
 * Tant qu'elle est absente, un portrait Unsplash de repli s'affiche.
 */
export const HERO_BG = {
  primary: '/img/hero-bg.jpg',
  fallback: u('1544005313-94ddf0286df2', 1600),
};

/**
 * Portrait de la section « processus en 3 étapes » (homme, détouré).
 * ⚠️ Place le PNG détouré fourni dans `public/img/process-portrait.png`.
 * Tant qu'il est absent, un portrait Unsplash de repli s'affiche.
 */
export const PROCESS_PORTRAIT = {
  primary: '/img/process-portrait.png',
  fallback: u('1506794778202-cad84cf45f1d', 900),
};

/** Portraits pour les témoignages (avant/après par personne). */
export const TESTIMONIAL_FACES = [
  u('1531123897727-8f129e1688ce', 500),
  u('1500648767791-00dcc994a43e', 500),
  u('1524504388940-b1c1722653e1', 500),
  u('1506794778202-cad84cf45f1d', 500),
  u('1438761681033-6461ffad8d80', 500),
];

/** Petits avatars de preuve sociale (header hero). */
export const AVATARS = [
  u('1500648767791-00dcc994a43e', 80),
  u('1438761681033-6461ffad8d80', 80),
  u('1507003211169-0a1dd7228f2d', 80),
];
