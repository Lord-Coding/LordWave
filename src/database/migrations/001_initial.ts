import type { SQLiteDatabase } from 'expo-sqlite';

export async function migration001(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS playlists (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      playlistId   INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      trackUrl     TEXT NOT NULL,
      trackTitle   TEXT NOT NULL,
      trackArtist  TEXT,
      trackAlbum   TEXT,
      position     INTEGER NOT NULL,
      addedAt      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      trackUrl     TEXT NOT NULL UNIQUE,
      trackTitle   TEXT NOT NULL,
      trackArtist  TEXT,
      trackAlbum   TEXT,
      addedAt      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    INSERT OR IGNORE INTO schema_version (version) VALUES (1);
  `);
}
