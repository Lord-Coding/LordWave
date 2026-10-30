import { Track } from "@/types/track";
import { db } from "../database";

type CacheRow = {
  trackUrl: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  artwork: string | null;
};

/**
 * Charge toutes les entrées du cache en une seule requête synchrone.
 * Retourne un Map<trackUrl, Partial<Track>> pour un accès O(1).
 */
export function loadMetadataCache(): Map<string, Partial<Track>> {
  const rows = db.getAllSync<CacheRow>(
    "SELECT trackUrl, title, artist, album, artwork FROM track_metadata_cache",
    [],
  );

  const cache = new Map<string, Partial<Track>>();
  for (const row of rows) {
    cache.set(row.trackUrl, {
      title: row.title ?? undefined,
      artist: row.artist ?? undefined,
      album: row.album ?? undefined,
      artwork: row.artwork ?? undefined,
    });
  }
  return cache;
}

/**
 * Persiste les métadonnées d'un morceau dans le cache.
 * Utilise INSERT OR REPLACE pour mettre à jour si l'URL existe déjà.
 */
export async function saveMetadataToCache(
  trackUrl: string,
  meta: Partial<Track>,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO track_metadata_cache
       (trackUrl, title, artist, album, artwork, cachedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      trackUrl,
      meta.title ?? null,
      meta.artist ?? null,
      meta.album ?? null,
      meta.artwork ?? null,
      Date.now(),
    ],
  );
}

/**
 * Vérifie si une URL est déjà dans le cache.
 */
export function isUrlCached(trackUrl: string): boolean {
  const row = db.getFirstSync<{ trackUrl: string }>(
    "SELECT trackUrl FROM track_metadata_cache WHERE trackUrl = ? LIMIT 1",
    [trackUrl],
  );
  return row !== null;
}
