import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/database';
import type { StoredScan } from '@/types/domain';

/**
 * Synchronisation des scans avec Supabase.
 *
 * - Métadonnées + analyse complète (analyse, zones, conditions, seed) :
 *   colonne `data` (jsonb) de la table `scans`.
 * - Photo globale : bucket privé « scans » (chiffré au repos), chemin
 *   `{userId}/{scanId}.jpg` → URL signée à la lecture.
 *
 * Toutes les écritures sont « best-effort » : une erreur réseau (ou un schéma
 * pas encore migré) ne casse jamais l'expérience — le scan reste affiché.
 */

const BUCKET = 'scans';
/** Validité des URLs signées (7 jours). */
const SIGNED_TTL = 60 * 60 * 24 * 7;

/** Chemin de la photo d'un scan dans le bucket. */
function imagePath(userId: string, scanId: string): string {
  return `${userId}/${scanId}.jpg`;
}

/** dataURL (base64) → Blob, pour l'upload storage. */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [head, b64] = dataUrl.split(',');
    if (!b64) return null;
    const mime = /data:(.*?);/.exec(head ?? '')?.[1] ?? 'image/jpeg';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

/** Version « légère » du scan pour la colonne jsonb (sans images base64). */
function stripImages(scan: StoredScan): StoredScan {
  return {
    ...scan,
    image: null,
    zones: scan.zones?.map((z) => ({ ...z, image: null })),
  };
}

/** Enregistre un scan : ligne `scans` + upload de la photo (best-effort). */
export async function insertScan(
  userId: string,
  scan: StoredScan,
): Promise<void> {
  if (!supabase) return;
  let image_path: string | null = null;

  // Upload de la photo globale (hors démo) — n'interrompt pas en cas d'échec.
  if (scan.image && scan.image.startsWith('data:') && !scan.isDemo) {
    const blob = dataUrlToBlob(scan.image);
    if (blob) {
      const path = imagePath(userId, scan.id);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (!error) image_path = path;
    }
  }

  await supabase.from('scans').insert({
    id: scan.id,
    user_id: userId,
    kind: scan.kind,
    overall_score: scan.overall,
    created_at: scan.createdAt,
    is_demo: Boolean(scan.isDemo),
    image_path,
    data: stripImages(scan) as unknown as Json,
  });
}

/** Charge tous les scans d'un utilisateur (plus récents d'abord). */
export async function fetchScans(userId: string): Promise<StoredScan[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('scans')
    .select('id, image_path, data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];

  const scans = data
    .map((row) => (row.data ? (row.data as unknown as StoredScan) : null))
    .filter((s): s is StoredScan => Boolean(s));

  // URLs signées pour les photos présentes dans le bucket (en lot).
  const paths = data
    .filter((r) => r.image_path)
    .map((r) => r.image_path as string);
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, SIGNED_TTL);
    const byPath = new Map(
      (signed ?? []).map((s) => [s.path ?? '', s.signedUrl]),
    );
    for (const row of data) {
      if (!row.image_path) continue;
      const url = byPath.get(row.image_path);
      const scan = scans.find((s) => s.id === row.id);
      if (scan && url) scan.image = url;
    }
  }
  return scans;
}

/** Supprime un scan (ligne + photo). */
export async function deleteScan(userId: string, scanId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('scans').delete().eq('id', scanId).eq('user_id', userId);
  await supabase.storage.from(BUCKET).remove([imagePath(userId, scanId)]);
}

/** Supprime tous les scans d'un utilisateur (ligne + photos). */
export async function clearScans(userId: string): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase
    .from('scans')
    .select('image_path')
    .eq('user_id', userId);
  await supabase.from('scans').delete().eq('user_id', userId);
  const paths = (data ?? [])
    .map((r) => r.image_path)
    .filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}
