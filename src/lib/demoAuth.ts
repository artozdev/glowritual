import { uid } from './utils';
import type { Plan } from '@/types/database';

/**
 * ════════════════════════════════════════════════════════════════
 *  AUTH DÉMO LOCALE (sans backend)
 * ════════════════════════════════════════════════════════════════
 *  Reproduit un vrai comportement d'authentification quand Supabase
 *  n'est pas configuré : l'inscription crée un compte, la connexion
 *  vérifie l'email + le mot de passe, les doublons sont refusés.
 *
 *  ⚠️ Le « hash » ci-dessous n'est PAS cryptographique : ces comptes
 *  restent locaux à l'appareil (démo). En production, c'est Supabase
 *  qui gère l'authentification et le stockage sécurisé des mots de passe.
 * ════════════════════════════════════════════════════════════════
 */

export interface DemoAccount {
  id: string;
  email: string;
  passHash: string;
  plan: Plan;
}

const STORAGE_KEY = 'naturalme.demo-accounts.v1';

function hashPassword(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function loadAccounts(): DemoAccount[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as DemoAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: DemoAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    /* ignore */
  }
}

type Result = { account?: DemoAccount; error?: string };

/** Inscription locale : refuse un email déjà utilisé. */
export function demoSignUp(email: string, password: string): Result {
  const accounts = loadAccounts();
  const normalized = normalizeEmail(email);
  if (accounts.some((a) => a.email === normalized)) {
    return { error: 'Un compte existe déjà avec cet email.' };
  }
  const account: DemoAccount = {
    id: uid(),
    email: normalized,
    passHash: hashPassword(password),
    plan: 'free',
  };
  saveAccounts([...accounts, account]);
  return { account };
}

/** Connexion locale : vérifie l'existence du compte puis le mot de passe. */
export function demoSignIn(email: string, password: string): Result {
  const accounts = loadAccounts();
  const normalized = normalizeEmail(email);
  const account = accounts.find((a) => a.email === normalized);
  if (!account) {
    return { error: 'Aucun compte ne correspond à cet email.' };
  }
  if (account.passHash !== hashPassword(password)) {
    return { error: 'Mot de passe incorrect.' };
  }
  return { account };
}

/** Met à jour le plan d'un compte démo (ex. passage Premium). */
export function demoUpdatePlan(id: string, plan: Plan): void {
  const accounts = loadAccounts();
  const next = accounts.map((a) => (a.id === id ? { ...a, plan } : a));
  saveAccounts(next);
}

/** Vrai si un compte démo existe pour cet email. */
export function demoAccountExists(email: string): boolean {
  return loadAccounts().some((a) => a.email === normalizeEmail(email));
}
