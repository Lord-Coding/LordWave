import { db } from '../database';
import { Track } from '@/types/track';

export type FavoriteRow = {
  id: number;
  trackUrl: string;
  trackTitle: string;
  trackArtist: string | null;
  trackAlbum: string | null;
  addedAt: number;
};

export async function getAllFavorites(): Promise<FavoriteRow[]> {
  return db.getAllAsync<FavoriteRow>(
    `SELECT id, trackUrl, trackTitle, trackArtist, trackAlbum, addedAt
     FROM favorites ORDER BY addedAt DESC`,
    [],
  );
}

export async function addFavorite(track: Track): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO favorites (trackUrl, trackTitle, trackArtist, trackAlbum, addedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      track.url ?? '',
      track.title,
      track.artist ?? null,
      track.album ?? null,
      Date.now(),
    ],
  );
}

export async function removeFavorite(trackUrl: string): Promise<void> {
  await db.runAsync('DELETE FROM favorites WHERE trackUrl = ?', [trackUrl]);
}

export async function isFavorite(trackUrl: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM favorites WHERE trackUrl = ? LIMIT 1',
    [trackUrl],
  );
  return row !== null;
}
