import { db } from '../database';
import { Track } from '@/types/track';

export type PlaylistRow = {
  id: number;
  name: string;
  createdAt: number;
};

export type PlaylistTrackRow = {
  id: number;
  playlistId: number;
  trackUrl: string;
  trackTitle: string;
  trackArtist: string | null;
  trackAlbum: string | null;
  position: number;
};

export async function getAllPlaylists(): Promise<PlaylistRow[]> {
  return db.getAllAsync<PlaylistRow>(
    'SELECT id, name, createdAt FROM playlists ORDER BY createdAt DESC',
    [],
  );
}

export async function createPlaylist(name: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO playlists (name, createdAt) VALUES (?, ?)',
    [name, Date.now()],
  );
  return result.lastInsertRowId;
}

export async function deletePlaylist(id: number): Promise<void> {
  await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
}

export async function renamePlaylist(id: number, name: string): Promise<void> {
  await db.runAsync('UPDATE playlists SET name = ? WHERE id = ?', [name, id]);
}

export async function getPlaylistTracks(
  playlistId: number,
): Promise<PlaylistTrackRow[]> {
  return db.getAllAsync<PlaylistTrackRow>(
    `SELECT id, playlistId, trackUrl, trackTitle, trackArtist, trackAlbum, position
     FROM playlist_tracks WHERE playlistId = ? ORDER BY position ASC`,
    [playlistId],
  );
}

export async function addTrackToPlaylist(
  playlistId: number,
  track: Track,
): Promise<void> {
  const existing = await db.getFirstAsync<{ maxPos: number | null }>(
    'SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlistId = ?',
    [playlistId],
  );
  const nextPosition = (existing?.maxPos ?? -1) + 1;

  await db.runAsync(
    `INSERT INTO playlist_tracks (playlistId, trackUrl, trackTitle, trackArtist, trackAlbum, position, addedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      playlistId,
      track.url ?? '',
      track.title,
      track.artist ?? null,
      track.album ?? null,
      nextPosition,
      Date.now(),
    ],
  );
}

export async function removeTrackFromPlaylist(trackId: number): Promise<void> {
  await db.runAsync('DELETE FROM playlist_tracks WHERE id = ?', [trackId]);
}
