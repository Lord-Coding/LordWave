import * as SQLite from "expo-sqlite";
import { migration001 } from "./migrations/001_initial";

/** Singleton — ouvert une seule fois au démarrage */
export const db = SQLite.openDatabaseSync("lordwave.db");

async function runMigrations(): Promise<void> {
  let currentVersion = 0;

  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)`,
    );
    const row = await db.getFirstAsync<{ version: number }>(
      "SELECT version FROM schema_version LIMIT 1",
    );
    currentVersion = row?.version ?? 0;
  } catch {
    currentVersion = 0;
  }

  if (currentVersion < 1) {
    await migration001(db);
    // Écrire la version APRÈS le succès de la migration, jamais dedans.
    // Si migration001 plante, schema_version reste vide → la migration sera
    // rejouée au prochain démarrage sur un état propre.
    await db.runAsync("INSERT INTO schema_version (version) VALUES (?)", [1]);
  }
}

export async function initDatabase(): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  // Activer l'enforcement des clés étrangères (désactivé par défaut dans SQLite).
  // Sans cela, ON DELETE CASCADE sur playlist_tracks est silencieusement ignoré.
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await runMigrations();
}
