/**
 * Logique pure du programme ambassadeur : génération de code, remise.
 */

export const DISCOUNT_PERCENT = 15;
/** Récompense ambassadeur par utilisation du code (placeholder). */
export const REWARD_PER_USE_EUR = 2;

/** Normalise un prénom/pseudo : majuscules, sans accents/espaces, alphanumérique. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Génère un code unique : prénom + « 15 » (MIKE → MIKE15).
 * En cas de doublon, ajoute un suffixe (MIKE15B, MIKE15C, …).
 */
export function generateCode(name: string, existing: Set<string>): string {
  const base = `${normalizeName(name) || 'GLOW'}15`;
  if (!existing.has(base)) return base;
  for (const c of 'BCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (!existing.has(base + c)) return base + c;
  }
  let n = 2;
  while (existing.has(`${base}X${n}`)) n += 1;
  return `${base}X${n}`;
}

/** Applique la remise (-15 %) à un prix, arrondi au centime. */
export function applyDiscount(price: number): number {
  return Math.round(price * (1 - DISCOUNT_PERCENT / 100) * 100) / 100;
}
