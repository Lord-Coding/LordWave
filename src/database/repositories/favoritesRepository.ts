import { Track } from "@/types/track";
import { db } from "../database";

export type FavoriteRow = {
  id: number;
  trackUrl: string;
  trackTitle: string;
  trackArtist: string | null;
  trackAlbum: string | null;
  trackArtwork: string | null;
  addedAt: number;
};

export async function getAllFavorites(): Promise<FavoriteRow[]> {
  return db.getAllAsync<FavoriteRow>(
    `SELECT id, trackUrl, trackTitle, trackArtist, trackAlbum, trackArtwork, addedAt
     FROM favorites ORDER BY addedAt DESC`,
    [],
  );
}

export async function addFavorite(track: Track): Promise<void> {
  // Ne pas stocker les artworks base64 (trop volumineuses) — stocker uniquement les URI fichier
  const artworkToStore =
    track.artwork && !track.artwork.startsWith("data:") ? track.artwork : null;

  await db.runAsync(
    `INSERT OR IGNORE INTO favorites (trackUrl, trackTitle, trackArtist, trackAlbum, trackArtwork, addedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      track.url ?? "",
      track.title,
      track.artist ?? null,
      track.album ?? null,
      artworkToStore,
      Date.now(),
    ],
  );
}

export async function removeFavorite(trackUrl: string): Promise<void> {
  await db.runAsync("DELETE FROM favorites WHERE trackUrl = ?", [trackUrl]);
}

export async function isFavorite(trackUrl: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM favorites WHERE trackUrl = ? LIMIT 1",
    [trackUrl],
  );
  return row !== null;
}
