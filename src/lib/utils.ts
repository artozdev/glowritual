import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes Tailwind de façon sûre (gère les conflits).
 * Usage : cn('px-2', condition && 'px-4') → 'px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Borne une valeur dans [min, max]. */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Formate une date ISO en libellé court FR (ex. « 10 juin 2026 »). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Formate une date ISO en jour court (ex. « 10/06 »). */
export function formatDayMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
}

/** Moyenne d'un tableau de nombres (0 si vide). */
export function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * Même graine → même séquence : indispensable pour des scores de démo stables.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Identifiant court unique (UUID si dispo, sinon repli). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Bande qualitative d'un score, pour adapter le ton (toujours positif). */
export function scoreBand(score: number): 'excellent' | 'good' | 'nurture' {
  if (score >= 85) return 'excellent';
  if (score >= 72) return 'good';
  return 'nurture';
}

/** Libellé bienveillant associé à un score global. */
export function scoreHeadline(score: number): string {
  const band = scoreBand(score);
  if (band === 'excellent') return 'Vous rayonnez ✨';
  if (band === 'good') return 'Belle mine ✨';
  return 'Plein de potentiel 🌱';
}
