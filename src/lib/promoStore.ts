import { uid } from './utils';
import { generateCode, REWARD_PER_USE_EUR, DISCOUNT_PERCENT } from './ambassador';
import type { AmbassadorStats, PromoCode, PromoRedemption } from '@/types/promo';

/**
 * Persistance des codes promo & utilisations.
 *
 * Démo : localStorage. En production : tables Supabase `promo_codes` /
 * `promo_redemptions` (cf. schema.sql). La règle « un seul code par
 * utilisateur, une seule fois » est garantie côté serveur par une
 * contrainte UNIQUE sur `promo_redemptions.user_id` + la RLS.
 */

const CODES_KEY = 'glow.promo-codes.v1';
const REDEMPTIONS_KEY = 'glow.promo-redemptions.v1';

function loadCodes(): PromoCode[] {
  try {
    return JSON.parse(localStorage.getItem(CODES_KEY) ?? '[]') as PromoCode[];
  } catch {
    return [];
  }
}
function saveCodes(codes: PromoCode[]): void {
  try {
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
  } catch {
    /* ignore */
  }
}
function loadRedemptions(): PromoRedemption[] {
  try {
    return JSON.parse(
      localStorage.getItem(REDEMPTIONS_KEY) ?? '[]',
    ) as PromoRedemption[];
  } catch {
    return [];
  }
}
function saveRedemptions(rows: PromoRedemption[]): void {
  try {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function listCodes(): PromoCode[] {
  return loadCodes();
}

export function findCode(code: string): PromoCode | null {
  const c = code.trim().toUpperCase();
  return loadCodes().find((x) => x.code === c) ?? null;
}

export function codeForAmbassador(ambassadorId: string): PromoCode | null {
  return loadCodes().find((c) => c.ambassadorId === ambassadorId) ?? null;
}

/** Crée (ou récupère) le code d'un ambassadeur à partir de son prénom/pseudo. */
export function createCodeForAmbassador(
  ambassadorId: string,
  name: string,
): PromoCode {
  const codes = loadCodes();
  const existing = codes.find((c) => c.ambassadorId === ambassadorId);
  if (existing) return existing;

  const code = generateCode(name, new Set(codes.map((c) => c.code)));
  const pc: PromoCode = {
    code,
    ambassadorId,
    ambassadorName: name,
    percent: DISCOUNT_PERCENT,
    createdAt: new Date().toISOString(),
  };
  saveCodes([...codes, pc]);
  return pc;
}

/** Le code déjà utilisé par cet utilisateur (un seul autorisé), ou null. */
export function userRedemption(userId: string): PromoRedemption | null {
  return loadRedemptions().find((r) => r.userId === userId) ?? null;
}

export interface RedeemResult {
  ok: boolean;
  error?: string;
  redemption?: PromoRedemption;
}

/**
 * Applique un code pour un utilisateur (usage unique par personne).
 * Vérifie : code existant, pas son propre code, et aucun code déjà utilisé.
 */
export function redeem(code: string, userId: string): RedeemResult {
  const pc = findCode(code);
  if (!pc) return { ok: false, error: 'Code introuvable.' };
  if (pc.ambassadorId === userId)
    return { ok: false, error: 'Tu ne peux pas utiliser ton propre code.' };
  if (userRedemption(userId))
    return { ok: false, error: 'Tu as déjà utilisé un code promo.' };

  const redemption: PromoRedemption = {
    id: uid(),
    code: pc.code,
    userId,
    ambassadorId: pc.ambassadorId,
    createdAt: new Date().toISOString(),
  };
  saveRedemptions([...loadRedemptions(), redemption]);
  return { ok: true, redemption };
}

/** Statistiques d'un ambassadeur (utilisations + récompense estimée). */
export function statsFor(ambassadorId: string): AmbassadorStats {
  const uses = loadRedemptions().filter(
    (r) => r.ambassadorId === ambassadorId,
  ).length;
  return {
    uses,
    rewardEur: Math.round(uses * REWARD_PER_USE_EUR * 100) / 100,
  };
}
