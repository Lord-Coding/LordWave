import * as SQLite from "expo-sqlite";
import type { Playlist, Track } from "@/constants/musicType";

type PlaylistRow = {
  id: string;
  title: string;
  description: string;
  updated_at: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
const SCHEMA_VERSION = 1;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("lordwave.db")
      .then(async (database) => {
        await database.execAsync("PRAGMA foreign_keys = ON;");
        const integrity = await database.getFirstAsync<{ quick_check: string }>(
          "PRAGMA quick_check;",
        );
        if (integrity?.quick_check !== "ok") {
          throw new Error(`Contrôle d’intégrité SQLite en échec : ${integrity?.quick_check ?? "aucun résultat"}.`);
        }
        const version = await database.getFirstAsync<{ user_version: number }>(
          "PRAGMA user_version;",
        );
        if ((version?.user_version ?? 0) > SCHEMA_VERSION) {
          throw new Error("La base de données a été créée par une version plus récente de LordWave.");
        }
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS tracks (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            album TEXT NOT NULL,
            cover TEXT NOT NULL DEFAULT '',
            duration TEXT NOT NULL DEFAULT '0:00',
            duration_seconds REAL NOT NULL DEFAULT 0,
            uri TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS favorites (
            track_id TEXT PRIMARY KEY NOT NULL
              REFERENCES tracks(id) ON DELETE CASCADE
          );
          CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS playlist_tracks (
            playlist_id TEXT NOT NULL
              REFERENCES playlists(id) ON DELETE CASCADE,
            track_id TEXT NOT NULL
              REFERENCES tracks(id) ON DELETE CASCADE,
            position INTEGER NOT NULL,
            PRIMARY KEY (playlist_id, track_id),
            UNIQUE (playlist_id, position)
          );
          CREATE INDEX IF NOT EXISTS playlist_tracks_order
            ON playlist_tracks(playlist_id, position);
        `);
        if ((version?.user_version ?? 0) < SCHEMA_VERSION) {
          await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
        }
        return database;
      })
      .catch((error: unknown) => {
        databasePromise = null;
        throw error;
      });
  }
  return databasePromise;
}

export async function initializeLocalDatabase() {
  await getDatabase();
}

function playlistId() {
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")}`;
  return `${minutes} min`;
}

export async function loadLocalMusic() {
  const database = await getDatabase();
  const tracks = await database.getAllAsync<Track>(
    `SELECT id, title, artist, album, cover, duration, duration_seconds AS durationSeconds, uri
     FROM tracks ORDER BY title COLLATE NOCASE`,
  );
  const favoriteRows = await database.getAllAsync<{ track_id: string }>(
    "SELECT track_id FROM favorites",
  );
  const playlistRows = await database.getAllAsync<PlaylistRow>(
    "SELECT id, title, description, updated_at FROM playlists ORDER BY updated_at DESC",
  );

  const playlists = await Promise.all(
    playlistRows.map(async (row): Promise<Playlist> => {
      const playlistTracks = await database.getAllAsync<{
        id: string;
        cover: string;
        duration_seconds: number;
      }>(
        `SELECT tracks.id, tracks.cover, tracks.duration_seconds
         FROM playlist_tracks
         JOIN tracks ON tracks.id = playlist_tracks.track_id
         WHERE playlist_tracks.playlist_id = ?
         ORDER BY playlist_tracks.position`,
        row.id,
      );
      const durationSeconds = playlistTracks.reduce(
        (total, track) => total + track.duration_seconds,
        0,
      );
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        cover: playlistTracks.find((track) => track.cover)?.cover ?? "",
        trackCount: playlistTracks.length,
        duration: formatDuration(durationSeconds),
        updatedAt: row.updated_at,
        trackIds: playlistTracks.map((track) => track.id),
      };
    }),
  );

  return {
    tracks,
    favoriteTrackIds: favoriteRows.map((row) => row.track_id),
    playlists,
  };
}

export async function saveLibraryTracks(tracks: Track[]) {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.execAsync(
      "CREATE TEMP TABLE IF NOT EXISTS current_library_ids (id TEXT PRIMARY KEY NOT NULL); DELETE FROM current_library_ids;",
    );
    for (const track of tracks) {
      if (!track.uri) continue;
      await transaction.runAsync(
        `INSERT INTO tracks (id, title, artist, album, cover, duration, duration_seconds, uri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           artist = excluded.artist,
           album = excluded.album,
           cover = excluded.cover,
           duration = excluded.duration,
           duration_seconds = excluded.duration_seconds,
           uri = excluded.uri`,
        track.id,
        track.title,
        track.artist,
        track.album,
        track.cover,
        track.duration,
        track.durationSeconds ?? 0,
        track.uri,
      );
      await transaction.runAsync(
        "INSERT INTO current_library_ids (id) VALUES (?)",
        track.id,
      );
    }
    await transaction.execAsync(
      "DELETE FROM favorites WHERE track_id NOT IN (SELECT id FROM current_library_ids); DELETE FROM playlist_tracks WHERE track_id NOT IN (SELECT id FROM current_library_ids);",
    );
    await transaction.execAsync(
      "DELETE FROM tracks WHERE id NOT IN (SELECT id FROM current_library_ids);",
    );
  });
}

export async function saveTrack(track: Track) {
  if (!track.uri) return;
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO tracks (id, title, artist, album, cover, duration, duration_seconds, uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       artist = excluded.artist,
       album = excluded.album,
       cover = excluded.cover,
       duration = excluded.duration,
       duration_seconds = excluded.duration_seconds,
       uri = excluded.uri`,
    track.id,
    track.title,
    track.artist,
    track.album,
    track.cover,
    track.duration,
    track.durationSeconds ?? 0,
    track.uri,
  );
}

export async function setTrackFavorite(track: Track, isFavorite: boolean) {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (transaction) => {
    if (track.uri) {
      await transaction.runAsync(
        `INSERT INTO tracks (id, title, artist, album, cover, duration, duration_seconds, uri)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title, artist = excluded.artist, album = excluded.album,
           cover = excluded.cover, duration = excluded.duration,
           duration_seconds = excluded.duration_seconds, uri = excluded.uri`,
        track.id,
        track.title,
        track.artist,
        track.album,
        track.cover,
        track.duration,
        track.durationSeconds ?? 0,
        track.uri,
      );
    }
    if (isFavorite) {
      if (!track.uri) {
        const storedTrack = await transaction.getFirstAsync<{ id: string }>(
          "SELECT id FROM tracks WHERE id = ?",
          track.id,
        );
        if (!storedTrack) throw new Error("Ce morceau n’existe plus dans la bibliothèque locale.");
      }
      await transaction.runAsync(
        "INSERT OR IGNORE INTO favorites (track_id) VALUES (?)",
        track.id,
      );
    } else {
      await transaction.runAsync("DELETE FROM favorites WHERE track_id = ?", track.id);
    }
  });
}

export async function createPlaylist(title: string, description = "") {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) throw new Error("Le nom de la playlist ne peut pas être vide.");
  const id = playlistId();
  const database = await getDatabase();
  await database.runAsync(
    "INSERT INTO playlists (id, title, description, updated_at) VALUES (?, ?, ?, ?)",
    id,
    normalizedTitle,
    description.trim(),
    new Date().toISOString(),
  );
  return id;
}

export async function updatePlaylist(
  id: string,
  title: string,
  description: string,
) {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) throw new Error("Le nom de la playlist ne peut pas être vide.");
  const database = await getDatabase();
  const result = await database.runAsync(
    "UPDATE playlists SET title = ?, description = ?, updated_at = ? WHERE id = ?",
    normalizedTitle,
    description.trim(),
    new Date().toISOString(),
    id,
  );
  if (result.changes === 0) throw new Error("Cette playlist n’existe plus.");
}

export async function deletePlaylist(id: string) {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const result = await transaction.runAsync("DELETE FROM playlists WHERE id = ?", id);
    if (result.changes === 0) throw new Error("Cette playlist n’existe plus.");
    await transaction.runAsync("DELETE FROM playlist_tracks WHERE playlist_id = ?", id);
  });
}

export async function setPlaylistTrackOrder(playlistId: string, trackIds: string[]) {
  const database = await getDatabase();
  const uniqueTrackIds = Array.from(new Set(trackIds));
  await database.withExclusiveTransactionAsync(async (transaction) => {
    const result = await transaction.runAsync(
      "UPDATE playlists SET updated_at = ? WHERE id = ?",
      new Date().toISOString(),
      playlistId,
    );
    if (result.changes === 0) throw new Error("Cette playlist n’existe plus.");
    await transaction.runAsync(
      "DELETE FROM playlist_tracks WHERE playlist_id = ?",
      playlistId,
    );
    for (const [position, trackId] of uniqueTrackIds.entries()) {
      const track = await transaction.getFirstAsync<{ id: string }>(
        "SELECT id FROM tracks WHERE id = ?",
        trackId,
      );
      if (!track) throw new Error("Un morceau de cette playlist n’est plus disponible.");
      await transaction.runAsync(
        "INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)",
        playlistId,
        trackId,
        position,
      );
    }
  });
}
