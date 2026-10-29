# BUGS — LordWave

Problèmes identifiés dans l'app avec leur cause exacte et leur solution.

---

## 🔴 Bugs actifs

### BUG-001 — Shuffle remet la musique au début

**Symptôme :** appuyer sur le bouton aléatoire coupe le morceau en cours et relance depuis le début.

**Cause :** dans `PlayerProvider.tsx`, `toggleShuffle` appelle `playlist.clear()` puis recharge tous les morceaux via `playlist.add()`, puis appelle `playlist.skipTo(0)`. Ce `skipTo(0)` positionne toujours sur le premier item de la nouvelle queue — même si le morceau courant était placé en tête, `expo-audio` repart du début du fichier.

**Fichier :** `src/stores/PlayerProvider.tsx` — fonction `toggleShuffle`

**Solution :** après `playlist.skipTo(0)` (le morceau courant est en position 0 dans la nouvelle queue shufflée), appeler `playlist.seekTo(statusRef.current.currentTime)` pour restaurer la position de lecture avant de rappeler `play()`. Cela reprend exactement là où on en était.

```ts
playlist.skipTo(0);
playlist.seekTo(currentStatus.currentTime); // ← ajouter cette ligne
if (currentStatus.playing) playlist.play();
```

---

### BUG-002 — Barre de progression non interactive

**Symptôme :** impossible de toucher la barre de progression pour avancer ou reculer dans le morceau.

**Cause :** la barre est composée de deux `View` imbriquées — une piste et un remplissage. Aucun gestionnaire de toucher n'est branché dessus. La barre affiche la progression en lecture seule.

**Fichier :** `src/app/player.tsx` — section `progressSection`

**Solution :** remplacer la barre custom par `@react-native-community/slider` (vérifier s'il est installé) ou implémenter un `TouchableOpacity` sur la piste qui calcule la position du toucher via `onLayout` + `event.nativeEvent.locationX` et appelle `seekTo()`.

Approche recommandée avec `TouchableOpacity` (sans dépendance supplémentaire) :

```tsx
const progressTrackRef = useRef<View>(null);
const [trackWidth, setTrackWidth] = useState(0);

// Sur la View piste :
onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}

// Wrappé dans un TouchableOpacity :
onPress={(e) => {
  const x = e.nativeEvent.locationX;
  const ratio = Math.max(0, Math.min(1, x / trackWidth));
  seekTo(ratio * duration);
}}
```

---

### BUG-003 — Shuffle et Repeat sur une ligne séparée des contrôles

**Symptôme :** shuffle (aléatoire) et repeat (répétition) apparaissent en dessous de prev/play/next au lieu d'être sur la même ligne.

**Cause :** dans `player.tsx`, les contrôles principaux sont dans `styles.controls` et shuffle/repeat dans `styles.extras` — deux `View` séparées avec des `marginBottom` entre elles.

**Fichier :** `src/app/player.tsx`

**Solution :** fusionner les deux `View` en une seule ligne `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, avec les 5 boutons dans cet ordre : shuffle — prev — play — next — repeat. Supprimer `styles.extras` et adapter `styles.controls`.

```tsx
<View style={styles.controls}>
  <TouchableOpacity onPress={toggleShuffle}>
    <Ionicons
      name="shuffle"
      size={22}
      color={isShuffled ? theme.primary : theme.textSecondary}
    />
  </TouchableOpacity>
  <TouchableOpacity onPress={previous}>
    <Ionicons name="play-skip-back" size={28} color={theme.text} />
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.playButton, { backgroundColor: theme.primary }]}
    onPress={playing ? pause : play}
  >
    <Ionicons name={playing ? "pause" : "play"} size={32} color="#ffffff" />
  </TouchableOpacity>
  <TouchableOpacity onPress={next}>
    <Ionicons name="play-skip-forward" size={28} color={theme.text} />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setLoop(LOOP_CYCLE[loop])}>
    <Ionicons
      name="repeat"
      size={22}
      color={loop !== "none" ? theme.primary : theme.textSecondary}
    />
  </TouchableOpacity>
</View>
```

---

### BUG-004 — Pochettes non affichées

**Symptôme :** les pochettes n'apparaissent pas dans la liste de morceaux ni dans le lecteur.

**Cause :** deux problèmes distincts.

**Cause A — Base64 sans préfixe data URI :**
`@missingcore/audio-metadata` retourne l'artwork comme une chaîne base64 brute, par exemple :

```
/9j/4AAQSkZJRgABAQAAAQABAAD...
```

Pour que `FastImage` (ou `Image`) puisse l'afficher, il faut le préfixe complet :

```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
```

Sans ce préfixe, `FastImage` reçoit une URI invalide et n'affiche rien — silencieusement.

**Fichier :** `src/services/media-library/useTrackMetadata.ts` — mapping du résultat `meta.artwork`

**Solution A :**

```ts
artwork: meta.artwork
  ? `data:image/jpeg;base64,${meta.artwork}`
  : track.artwork,
```

**Cause B — Fallback `require()` non supporté par FastImage dans certains contextes :**
`FastImage` est optimisé pour les URIs réseau et les URIs locales. Les assets statiques via `require()` peuvent ne pas s'afficher correctement selon la version. Si le préfixe base64 ne suffit pas, remplacer le fallback `unknownTrackImage` / `unknownArtistImage` par `Image` natif de React Native pour les assets locaux, ou utiliser `FastImage.cacheControl.immutable` avec une URI résolue.

**Fichier :** `src/components/TrackListItem.tsx`, `src/app/player.tsx`

---

## 🟡 Problèmes de performance

### PERF-001 — Lecture des métadonnées ID3 à chaque démarrage

**Symptôme :** l'app est lente à charger, surtout avec une grande bibliothèque.

**Cause :** `useTrackMetadata` relit les métadonnées ID3 de tous les fichiers à chaque démarrage de l'app. Pour 200 morceaux, cela représente 200 lectures fichier séquentielles par batches de 10.

**Solution :** persister les métadonnées enrichies dans SQLite après la première lecture. Au démarrage suivant, charger depuis la base. Ne relire que les fichiers dont l'URI n'est pas encore en base ou dont la date de modification a changé.

**Fichiers à créer/modifier :**

- `src/database/repositories/trackMetadataRepository.ts` — CRUD cache métadonnées
- `src/database/migrations/002_track_metadata_cache.ts` — nouvelle table
- `src/services/media-library/useTrackMetadata.ts` — lire le cache avant de relire le fichier

---

### PERF-002 — Loader visible sur la page Playlists

**Symptôme :** un indicateur de chargement apparaît brièvement à chaque ouverture de l'onglet Playlists.

**Cause :** `usePlaylists` initialise `isLoading: true` et fait une requête SQLite async au montage. Même si SQLite est rapide, le cycle render → loading → data est visible.

**Solution :** utiliser `SQLite.openDatabaseSync` avec `getAllSync()` (requête synchrone) pour le chargement initial des playlists. Les données sont disponibles avant le premier rendu, pas de flash de loading.

---

### PERF-003 — `library.json` présent mais inutilisé

**Symptôme :** `assets/data/library.json` existe dans le projet mais n'est importé nulle part.

**Cause :** fichier de données statiques du prototype initial, remplacé par `useMediaLibrary`.

**Solution :** supprimer `assets/data/library.json`. Aucun impact sur le code.

---

## ✅ Bugs corrigés

| ID      | Description                                                                         | Commit                      |
| ------- | ----------------------------------------------------------------------------------- | --------------------------- |
| BUG-001 | Shuffle remet la musique au début — `seekTo(currentTime)` ajouté après `skipTo(0)`  | en cours                    |
| BUG-002 | Barre de progression non interactive — `TouchableOpacity` + `onLayout` + `seekTo()` | en cours                    |
| BUG-003 | Shuffle/Repeat sur ligne séparée — fusionné en une seule ligne de 5 boutons         | en cours                    |
| —       | `FastImageView` introuvable au runtime (module natif manquant dans dev client)      | Nécessite nouveau build     |
| —       | `Image.resolveAssetSource` crash dans le bundle serveur EAS                         | `5c618f3`                   |
| —       | `PRAGMA foreign_keys` manquant — `ON DELETE CASCADE` ignoré                         | `50a2959`                   |
| —       | `toggleShuffle` recréé 4×/seconde à cause de `status` dans les deps                 | `50a2959`                   |
| —       | Migration SQLite rejouée si elle plantait à mi-chemin                               | `14afcb6`                   |
| —       | `useTrackMetadata` re-run infini                                                    | `14afcb6`                   |
| —       | Recherche favoris non branchée                                                      | `14afcb6`                   |
| —       | Permission `READ_MEDIA_AUDIO` manquante dans AndroidManifest                        | Nécessite nouveau build EAS |
