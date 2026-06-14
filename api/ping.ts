import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Fonction témoin de diagnostic — AUCUN import runtime.
 * Si /api/ping répond mais pas /api/stripe/*, le souci vient des dépendances
 * des fonctions Stripe (et non de la config des Vercel Functions).
 */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, ts: Date.now() });
}
