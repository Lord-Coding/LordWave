# BUGS — LordWave

Problèmes identifiés dans l'app avec leur cause exacte et leur solution.

---

## 🔴 Bugs actifs

_(aucun bug actif non corrigé)_

---

## ✅ Bugs corrigés

| ID       | Description                                                                          | Commit                      |
| -------- | ------------------------------------------------------------------------------------ | --------------------------- |
| BUG-001  | Shuffle remet la musique au début — `seekTo(currentTime)` ajouté après `skipTo(0)`   | `HEAD`                      |
| BUG-002  | Barre de progression non interactive — `TouchableOpacity` + `onLayout` + `seekTo()`  | `HEAD`                      |
| BUG-003  | Shuffle/Repeat sur ligne séparée — fusionné en une seule ligne de 5 boutons          | `HEAD`                      |
| BUG-004  | Pochettes non affichées — préfixe `data:image/jpeg;base64,` ajouté sur l'artwork ID3 | `959b8b9`                   |
| PERF-001 | Métadonnées relues à chaque démarrage — cache SQLite (`track_metadata_cache`) ajouté | `959b8b9`                   |
| PERF-002 | Loader visible sur Playlists — chargement synchrone via `getAllPlaylistsSync()`      | `959b8b9`                   |
| PERF-003 | `library.json` inutilisé — supprimé                                                  | `959b8b9`                   |
| —        | `FastImageView` introuvable au runtime (module natif manquant dans dev client)       | Nécessite nouveau build     |
| —        | `Image.resolveAssetSource` crash dans le bundle serveur EAS                          | `5c618f3`                   |
| —        | `PRAGMA foreign_keys` manquant — `ON DELETE CASCADE` ignoré                          | `50a2959`                   |
| —        | `toggleShuffle` recréé 4×/seconde à cause de `status` dans les deps                  | `50a2959`                   |
| —        | Migration SQLite rejouée si elle plantait à mi-chemin                                | `14afcb6`                   |
| —        | `useTrackMetadata` re-run infini                                                     | `14afcb6`                   |
| —        | Recherche favoris non branchée                                                       | `14afcb6`                   |
| —        | Permission `READ_MEDIA_AUDIO` manquante dans AndroidManifest                         | Nécessite nouveau build EAS |
