import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Client Supabase — OPTIONNEL.
 *
 * L'app fonctionne en « mode démo » tant que les variables d'environnement
 * ne sont pas renseignées (cf. .env.example). Dès que vous fournissez
 * VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, l'auth réelle s'active.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
