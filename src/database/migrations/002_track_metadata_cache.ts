import type { SQLiteDatabase } from "expo-sqlite";

/**
 * Migration 002 — table de cache pour les métadonnées ID3.
 * Évite de relire les fichiers audio à chaque démarrage.
 *
 * trackUrl est la clé — une URL de fichier local unique par morceau.
 * cachedAt permet de détecter les entrées périmées si nécessaire.
 */
export async function migration002(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS track_metadata_cache (
      trackUrl    TEXT PRIMARY KEY NOT NULL,
      title       TEXT,
      artist      TEXT,
      album       TEXT,
      artwork     TEXT,
      cachedAt    INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);
}
