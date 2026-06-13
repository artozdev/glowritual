import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Client Supabase — OPTIONNEL.
 *
 * L'app fonctionne en « mode démo » tant que les variables d'environnement
 * ne sont pas renseignées (cf. .env.example). Dès que vous fournissez
 * VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, l'auth réelle s'active.
 */

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/**
 * Normalise l'URL du projet : on ne garde que `https://xxxx.supabase.co`.
 *
 * Erreur fréquente : coller l'URL de l'API REST (`…supabase.co/rest/v1/`)
 * dans `VITE_SUPABASE_URL`. Le client y ajoute alors `/auth/v1/…`, ce qui
 * produit `/rest/v1/auth/v1/token` → « Invalid path specified in request URL ».
 * On retire donc tout chemin (/rest/v1, /auth/v1, /storage/v1) et le slash final.
 */
function normalizeSupabaseUrl(value: string | undefined): string | undefined {
  if (!value) return value;
  let v = value.trim().replace(/\/+$/, ''); // slash(es) de fin
  v = v.replace(/\/(rest|auth|storage|realtime)\/v1$/i, ''); // chemin d'API collé par erreur
  return v;
}

const url = normalizeSupabaseUrl(rawUrl);

/** Vrai uniquement si des clés réelles (≠ placeholders) sont présentes. */
export const isSupabaseConfigured: boolean = Boolean(
  url &&
    anonKey &&
    !url.includes('votre-projet') &&
    !anonKey.includes('votre-cle'),
);

/** Client typé, ou `null` en mode démo. */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
