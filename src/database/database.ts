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
  await runMigrations();
}
