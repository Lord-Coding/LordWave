import type { SQLiteDatabase } from "expo-sqlite";

/**
 * Migration initiale — crée uniquement les tables métier.
 * NE PAS écrire dans schema_version ici : c'est runMigrations dans database.ts
 * qui insère la version après le succès de cette fonction.
 * Cela garantit que si la migration plante à mi-chemin, schema_version reste
 * vide (version 0) et la migration sera rejouée au prochain démarrage.
 */
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
      trackArtwork TEXT,
      position     INTEGER NOT NULL,
      addedAt      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      trackUrl     TEXT NOT NULL UNIQUE,
      trackTitle   TEXT NOT NULL,
      trackArtist  TEXT,
      trackAlbum   TEXT,
      trackArtwork TEXT,
      addedAt      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);
}
