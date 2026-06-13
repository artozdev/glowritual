/**
 * ════════════════════════════════════════════════════════════════
 *  LISTE NOIRE D'INGRÉDIENTS À RISQUE
 * ════════════════════════════════════════════════════════════════
 *  Tout produit contenant l'un de ces ingrédients est écarté des
 *  recommandations. La correspondance se fait par sous-chaîne sur les
 *  tokens normalisés (minuscule, sans accents) de la composition.
 *
 *  ⚠️ On NE blackliste PAS les terpènes naturels (limonène, linalol…)
 *  présents naturellement dans les huiles essentielles : ils ne sont
 *  pas synthétiques. La gestion des allergies individuelles est faite
 *  séparément, via le profil utilisateur (exclusion stricte).
 * ════════════════════════════════════════════════════════════════
 */

export type BlacklistFamily =
  | 'paraben'
  | 'sulfate'
  | 'silicone'
  | 'phthalate'
  | 'formaldehyde'
  | 'controversial_preservative'
  | 'uv_filter'
  | 'antibacterial'
  | 'synthetic_antioxidant'
  | 'mineral_oil'
  | 'peg'
  | 'synthetic_fragrance'
  | 'other';

export interface BlacklistEntry {
  /** Motif recherché dans la composition (normalisé). */
  token: string;
  family: BlacklistFamily;
  /** Pourquoi on l'écarte (affiché si besoin). */
  reason: string;
}

export const INGREDIENT_BLACKLIST: BlacklistEntry[] = [
  // Parabènes (perturbateurs endocriniens suspectés)
  { token: 'paraben', family: 'paraben', reason: 'Parabène — perturbateur endocrinien suspecté' },
  // Sulfates agressifs
  { token: 'sodium lauryl sulfate', family: 'sulfate', reason: 'Tensioactif sulfaté irritant' },
  { token: 'sodium laureth sulfate', family: 'sulfate', reason: 'Tensioactif sulfaté irritant' },
  { token: 'ammonium lauryl sulfate', family: 'sulfate', reason: 'Tensioactif sulfaté irritant' },
  // Silicones controversés (occlusifs, non biodégradables)
  { token: 'dimethicone', family: 'silicone', reason: 'Silicone occlusif non biodégradable' },
  { token: 'cyclopentasiloxane', family: 'silicone', reason: 'Silicone volatil controversé' },
  { token: 'cyclohexasiloxane', family: 'silicone', reason: 'Silicone volatil controversé' },
  // Phtalates
  { token: 'phthalate', family: 'phthalate', reason: 'Phtalate — perturbateur endocrinien' },
  // Libérateurs de formaldéhyde
  { token: 'formaldehyde', family: 'formaldehyde', reason: 'Libérateur de formaldéhyde (allergène)' },
  { token: 'dmdm hydantoin', family: 'formaldehyde', reason: 'Libérateur de formaldéhyde' },
  { token: 'imidazolidinyl urea', family: 'formaldehyde', reason: 'Libérateur de formaldéhyde' },
  // Conservateurs controversés
  { token: 'phenoxyethanol', family: 'controversial_preservative', reason: 'Conservateur controversé' },
  { token: 'methylisothiazolinone', family: 'controversial_preservative', reason: 'Conservateur allergène (MIT)' },
  { token: 'methylchloroisothiazolinone', family: 'controversial_preservative', reason: 'Conservateur allergène' },
  { token: 'triclosan', family: 'antibacterial', reason: 'Antibactérien perturbateur endocrinien' },
  // Filtres UV controversés
  { token: 'oxybenzone', family: 'uv_filter', reason: 'Filtre UV perturbateur endocrinien' },
  { token: 'octinoxate', family: 'uv_filter', reason: 'Filtre UV controversé' },
  { token: 'benzophenone', family: 'uv_filter', reason: 'Filtre UV controversé' },
  // Antioxydants de synthèse
  { token: 'bha', family: 'synthetic_antioxidant', reason: 'BHA — antioxydant de synthèse suspecté' },
  { token: 'bht', family: 'synthetic_antioxidant', reason: 'BHT — antioxydant de synthèse suspecté' },
  // Huiles minérales / dérivés pétrole
  { token: 'paraffinum liquidum', family: 'mineral_oil', reason: 'Huile minérale issue du pétrole' },
  { token: 'mineral oil', family: 'mineral_oil', reason: 'Huile minérale issue du pétrole' },
  { token: 'petrolatum', family: 'mineral_oil', reason: 'Dérivé de pétrole occlusif' },
  // PEG (peuvent contenir des impuretés)
  { token: 'peg-', family: 'peg', reason: 'PEG — risque d’impuretés (1,4-dioxane)' },
  // Parfum/musc synthétique
  { token: 'galaxolide', family: 'synthetic_fragrance', reason: 'Musc synthétique bioaccumulable' },
  { token: 'tonalide', family: 'synthetic_fragrance', reason: 'Musc synthétique bioaccumulable' },
  { token: 'butylphenyl methylpropional', family: 'synthetic_fragrance', reason: 'Lilial — allergène interdit' },
  // Autres
  { token: 'triethanolamine', family: 'other', reason: 'Peut former des nitrosamines' },
  { token: 'aluminum chlorohydrate', family: 'other', reason: 'Sel d’aluminium controversé' },
];

/** Normalise un token d'ingrédient (minuscule, sans accents, espaces réduits). */
export function normalizeIngredient(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Renvoie les entrées de la liste noire détectées dans une composition.
 * Tableau vide ⇒ composition jugée sûre.
 */
export function findBlacklistedIngredients(
  ingredients: string[],
): BlacklistEntry[] {
  const normalized = ingredients.map(normalizeIngredient);
  const hits: BlacklistEntry[] = [];
  for (const entry of INGREDIENT_BLACKLIST) {
    if (normalized.some((ing) => ing.includes(entry.token))) {
      hits.push(entry);
    }
  }
  return hits;
}

/** Vrai si la composition ne contient aucun ingrédient à risque. */
export function isCompositionSafe(ingredients: string[]): boolean {
  return findBlacklistedIngredients(ingredients).length === 0;
}
