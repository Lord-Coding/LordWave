# Implementation Plan — LordWave V1 Sprint

> Generated after reading all key source files, node_modules type definitions, and the project TODO.
> Each task is ordered so that imports are never broken at the end of any step.

---

## API Notes (read from node_modules)

### expo-audio — AudioPlaylist (confirmed from `AudioModule.types.d.ts` + `Audio.types.d.ts`)

The correct hook is `useAudioPlaylist(options?: AudioPlaylistOptions): AudioPlaylist`.
Status is obtained via `useAudioPlaylistStatus(playlist: AudioPlaylist): AudioPlaylistStatus`.

**`AudioPlaylist` methods (exact names):**

- `play()` — void
- `pause()` — void
- `next()` — void
- `previous()` — void
- `skipTo(index: number)` — void
- `seekTo(seconds: number)` — Promise<void>
- `add(source: AudioSource)` — void
- `clear()` — void
- `destroy()` — void

**`AudioPlaylist` readable properties (exact names):**

- `playing: boolean`
- `currentIndex: number` (readonly)
- `trackCount: number` (readonly)
- `currentTime: number`
- `duration: number`
- `isLoaded: boolean`
- `isBuffering: boolean`
- `loop: AudioPlaylistLoopMode` — read/write
- `muted: boolean`
- `volume: number`

**`AudioPlaylistLoopMode`** (union type, NOT an enum):

```ts
type AudioPlaylistLoopMode = "none" | "single" | "all";
```

**`AudioPlaylistStatus`** fields relevant to player UI:
`id, currentIndex, trackCount, currentTime, duration, playing, isBuffering, isLoaded, playbackRate, muted, volume, loop, didJustFinish`

**`AudioSource`** accepted by playlist: `string | number | null | { uri?: string; assetId?: number; headers?: ...; name?: string }`

**`setAudioModeAsync`** must be called to enable background playback:

```ts
setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: "doNotMix",
});
```

### expo-sqlite — `SQLiteDatabase` (confirmed from `SQLiteDatabase.d.ts`)

- `openDatabaseSync(databaseName: string, options?, directory?): SQLiteDatabase` — synchronous open
- `openDatabaseAsync(...)` — async alternative; prefer sync for init at app startup
- **No `getAllSync` on the module itself**; methods are on the `SQLiteDatabase` instance:
  - `db.execAsync(sql: string): Promise<void>` — run raw DDL (CREATE TABLE, etc.)
  - `db.execSync(sql: string): void` — sync DDL
  - `db.runAsync(sql, params): Promise<SQLiteRunResult>` — INSERT / UPDATE / DELETE
  - `db.runSync(sql, params): SQLiteRunResult`
  - `db.getAllAsync<T>(sql, params): Promise<T[]>` — SELECT multiple rows
  - `db.getAllSync<T>(sql, params): T[]`
  - `db.getFirstAsync<T>(sql, params): Promise<T | null>`
  - `db.getFirstSync<T>(sql, params): T | null`
  - `db.withTransactionAsync(task: () => Promise<void>): Promise<void>` — auto commit/rollback
  - `db.withExclusiveTransactionAsync(task: (txn) => Promise<void>): Promise<void>` — exclusive
- Parameters: pass as array `[value1, value2]` or variadic `...values` — **never string-concatenate user values into SQL**.
- `SQLiteRunResult`: `{ changes: number; lastInsertRowId: number }`

### @missingcore/audio-metadata (confirmed from GitHub README)

```ts
import { getAudioMetadata } from "@missingcore/audio-metadata";
// Returns: { fileType, format, metadata: { name?, artist?, album?, artwork?, ... } }
const result = await getAudioMetadata(uri, [
  "name",
  "artist",
  "album",
  "artwork",
] as const);
// artwork is a base64 image string (data URI usable directly in <Image source={{ uri }}>)
```

Requires `expo-file-system` (already installed). **Must be installed first** before any import.

### react-native-reanimated (v4.7.1 — installed)

Use `FadeInDown` entering animation with `withDelay` for staggered list items.
Import: `import Animated, { FadeInDown } from 'react-native-reanimated'`
Wrap `TrackListItem` in `<Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>`.

---

## TÂCHE 1 — Couleur primaire

**Objectif :** Remplacer le violet `#b155e6` par l'orange `#F59127` dans la palette centrale. Toutes les références à `palette.primary/primaryTint/primaryShade` dans les composants s'en trouvent automatiquement mises à jour.

### Fichiers à modifier

- `c:\Users\lxrdf\Desktop\LordWave\src\constants\theme.ts`

### Changements exacts

```ts
// Avant
primary: "#b155e6",
primaryTint: "#cc88ee",
primaryShade: "#7a2fa1",

// Après
primary: "#F59127",
primaryTint: "#F8B46A",   // orange clair
primaryShade: "#C47015",  // orange sombre
```

Le commentaire de documentation JSDoc (`/** Couleur primaire : #b155e6 ... */`) doit être mis à jour pour décrire l'orange.

### Points d'attention

- `palette.secondary` (`#6f2e94` violet) reste inchangé — il n'est pas demandé de le modifier.
- `Colors.light` et `Colors.dark` lisent directement depuis `palette`, donc la propagation est automatique.
- Vérifier visuellement que `tabBarActiveTintColor`, les boutons primaires, la barre de progression et les icônes actives passent bien en orange.

### Vérification

```
npx tsc --noEmit
```

Aucune erreur TypeScript attendue. Vérification visuelle sur l'émulateur ou Expo Go.

---

## TÂCHE 2 — Métadonnées ID3 avec `@missingcore/audio-metadata`

**Dépendance :** Tâche 1 doit être terminée. Tâche 2 doit être terminée avant Tâche 3 (le hook `useTrackMetadata` est utilisé par le store).

### Étape 2.0 — Installation du paquet

```
npx expo install @missingcore/audio-metadata
```

À lancer depuis `c:\Users\lxrdf\Desktop\LordWave` dans PowerShell.
`expo-file-system` est déjà installé — aucune dépendance supplémentaire.

**Attention :** Ne pas modifier de fichier source avant que l'installation soit confirmée.

### Étape 2.1 — Mettre à jour `src/types/track.ts`

Le type `Track` doit exposer `id` pour permettre une déduplication propre en base de données (Tâche 5). Ajouter un champ `id?: string` dérivé de l'URL.

```ts
// c:\Users\lxrdf\Desktop\LordWave\src\types\track.ts
export type Track = {
  id?: string; // ← nouveau : hash stable basé sur l'URL, utilisé comme clé SQLite
  title: string;
  artist?: string;
  album?: string;
  artwork?: string; // base64 data URI ou URI fichier
  duration?: number;
  url?: string;
};
```

### Étape 2.2 — Créer `src/services/media-library/useTrackMetadata.ts`

Hook `useTrackMetadata(tracks: Track[]): { enrichedTracks: Track[]; isLoading: boolean }`.

Logique :

1. Démarrer avec `enrichedTracks = tracks` (les tracks originaux sans métadonnées enrichies).
2. Traiter les tracks par batches de 10 en boucle `for` séquentielle (pas `Promise.all` sur toutes les tracks pour éviter de saturer la mémoire).
3. Pour chaque track avec un `url`, appeler :
   ```ts
   const result = await getAudioMetadata(track.url, [
     "name",
     "artist",
     "album",
     "artwork",
   ] as const);
   ```
4. Fusionner les champs retournés : `name → title`, `artist → artist`, `album → album`, `artwork → artwork` (base64 string).
5. Sur erreur par track : `console.warn` + conserver le track original sans enrichissement — ne pas faire échouer tout le batch.
6. Après chaque batch : appeler `setEnrichedTracks(prev => [...prev.slice(0, batchStart), ...batchResults, ...prev.slice(batchStart + batchSize)])` pour mise à jour progressive.
7. Retourner `{ enrichedTracks, isLoading: true }` pendant le traitement, `isLoading: false` quand tous les batches sont finis.

Imports nécessaires :

```ts
import { getAudioMetadata } from "@missingcore/audio-metadata";
import { useEffect, useRef, useState } from "react";
import { Track } from "@/types/track";
```

**Point critique :** Utiliser `useRef` pour `tracks` dans le `useEffect` afin d'éviter les re-runs infinis si le parent re-render.

### Étape 2.3 — Mettre à jour `src/helpers/filter.ts`

Ajouter `trackFilter` qui cherche dans titre **ET** artiste **ET** album :

```ts
// Garder trackTitleFilter pour rétrocompatibilité (utilisé dans (songs)/index.tsx)
export const trackTitleFilter =
  (title: string) =>
  (track: { title?: string }): boolean =>
    track.title?.toLowerCase().includes(title.toLowerCase()) ?? false;

// Nouvelle fonction élargie
export const trackFilter =
  (query: string) =>
  (track: { title?: string; artist?: string; album?: string }): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (track.title?.toLowerCase().includes(q) ?? false) ||
      (track.artist?.toLowerCase().includes(q) ?? false) ||
      (track.album?.toLowerCase().includes(q) ?? false)
    );
  };
```

### Étape 2.4 — Mettre à jour `src/app/(tabs)/(songs)/index.tsx`

- Importer `useTrackMetadata` et `trackFilter`.
- Obtenir `tracks` bruts depuis `useMediaLibrary`.
- Passer les tracks bruts dans `useTrackMetadata` pour obtenir `{ enrichedTracks, isLoading: isMetadataLoading }`.
- Filtrer avec `trackFilter` (au lieu de `trackTitleFilter`).
- Pendant `isMetadataLoading && enrichedTracks.length === 0` : afficher le spinner existant.
- Pendant `isMetadataLoading && enrichedTracks.length > 0` : afficher la liste avec un indicateur discret (ex: `ActivityIndicator` petit en bas de la liste, ou texte « Chargement des métadonnées… »).

### Points d'attention Tâche 2

- `getAudioMetadata` retourne `{ fileType, format, metadata }`. Le champ `artwork` dans `metadata` est une **string base64** (pas une URI `file://`). Elle peut être utilisée directement dans `<FastImage source={{ uri: artworkBase64 }}>` — FastImage accepte les data URIs.
- `name` dans les métadonnées correspond au **titre** du morceau (pas `title`).
- Si `result.metadata.name` est undefined, conserver `track.title` (le nom de fichier sans extension déjà extrait).
- Les URLs de `expo-media-library` sont des `content://` URIs sur Android — `@missingcore/audio-metadata` doit les accepter via `expo-file-system`.

### Vérification Tâche 2

```
npx tsc --noEmit
```

Aucune erreur TypeScript. Test fonctionnel : lancer l'app et vérifier que la liste de chansons affiche progressivement les artistes/albums au fil du chargement des métadonnées.

---

## TÂCHE 3 — Store de lecture global (PlayerStore)

**Dépendance :** Tâche 2 doit être terminée (le store reçoit des `Track[]` dont `artwork` peut être une base64).
**Doit être terminée avant :** Tâche 4.

### Étape 3.0 — Configurer le mode audio

Dans `src/app/_layout.tsx`, appeler `setAudioModeAsync` au démarrage de l'app :

```ts
import { setAudioModeAsync } from "expo-audio";
useEffect(() => {
  setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: "doNotMix",
  });
}, []);
```

### Étape 3.1 — Créer `src/stores/playerStore.ts`

Ce fichier définit :

1. Le type `PlayerContextValue` :

```ts
type PlayerContextValue = {
  // État
  tracks: Track[]; // queue complète
  currentIndex: number;
  currentTime: number;
  duration: number;
  playing: boolean;
  loop: AudioPlaylistLoopMode; // 'none' | 'single' | 'all'
  isLoaded: boolean;
  isBuffering: boolean;
  // Actions
  loadQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => Promise<void>;
  setLoop: (mode: AudioPlaylistLoopMode) => void;
  skipTo: (index: number) => void;
};
```

2. Le Context React :

```ts
const PlayerContext = createContext<PlayerContextValue | null>(null);
```

3. L'export `usePlayer()` :

```ts
export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
```

Imports nécessaires dans ce fichier :

```ts
import { AudioPlaylistLoopMode } from "expo-audio";
import { createContext, useContext } from "react";
import { Track } from "@/types/track";
```

**Décision d'architecture :** On utilise React Context (pas Zustand) pour encapsuler le `useAudioPlaylist` hook qui ne peut vivre que dans un composant React. Le Provider est le seul endroit où `useAudioPlaylist` et `useAudioPlaylistStatus` sont appelés, évitant tout double player.

### Étape 3.2 — Créer `src/stores/PlayerProvider.tsx`

C'est ici que `useAudioPlaylist` et `useAudioPlaylistStatus` sont réellement appelés.

```ts
import {
  useAudioPlaylist,
  useAudioPlaylistStatus,
  AudioPlaylistLoopMode,
  setAudioModeAsync,
} from "expo-audio";
```

Structure interne :

```tsx
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);

  const playlist = useAudioPlaylist({
    sources: [],
    loop: "none",
    updateInterval: 250, // 250ms pour une barre de progression fluide
  });

  const status = useAudioPlaylistStatus(playlist);

  const loadQueue = useCallback(
    (newTracks: Track[], startIndex = 0) => {
      playlist.clear();
      newTracks.forEach((t) => {
        if (t.url) playlist.add({ uri: t.url, name: t.title });
      });
      setTracks(newTracks);
      playlist.skipTo(startIndex);
      playlist.play();
    },
    [playlist],
  );

  const setLoop = useCallback(
    (mode: AudioPlaylistLoopMode) => {
      playlist.loop = mode;
    },
    [playlist],
  );

  const value: PlayerContextValue = {
    tracks,
    currentIndex: status.currentIndex,
    currentTime: status.currentTime,
    duration: status.duration,
    playing: status.playing,
    loop: status.loop,
    isLoaded: status.isLoaded,
    isBuffering: status.isBuffering,
    loadQueue,
    play: () => playlist.play(),
    pause: () => playlist.pause(),
    next: () => playlist.next(),
    previous: () => playlist.previous(),
    seekTo: (s) => playlist.seekTo(s),
    setLoop,
    skipTo: (i) => playlist.skipTo(i),
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
```

**Points critiques :**

- `playlist.loop = mode` est une assignation directe (propriété read/write sur `AudioPlaylist`), pas un appel de méthode.
- `useAudioPlaylistStatus` retourne un snapshot `AudioPlaylistStatus` à chaque intervalle (`updateInterval`). Éviter de le mettre dans des dépendances de `useCallback` — utiliser la ref du playlist object directement dans les callbacks.
- `playlist.clear()` suivi de `playlist.add(...)` dans `loadQueue` : effectuer en synchrone dans le même tick pour éviter un état intermédiaire vide qui déclencherait un rendu inutile.

### Étape 3.3 — Mettre à jour `src/app/_layout.tsx`

Ajouter `<PlayerProvider>` **à l'intérieur** de `<ThemeProvider>` (car le Provider peut consommer le thème plus tard) mais **avant** `<RootNavigation />` :

```tsx
import { PlayerProvider } from '@/stores/PlayerProvider';

const App = () => {
  useEffect(() => {
    setAudioModeAsync({ ... });
  }, []);
  return (
    <ThemeProvider>
      <PlayerProvider>
        <RootNavigation />
        <StatusBar style="light" />
      </PlayerProvider>
    </ThemeProvider>
  );
};
```

### Points d'attention Tâche 3

- Ne pas appeler `useAudioPlaylist` ou `useAudioPlaylistStatus` dans plusieurs composants — un seul instance dans `PlayerProvider`.
- `AudioPlaylistLoopMode` est un **type union** (`'none' | 'single' | 'all'`), pas une enum. Utiliser les string literals directement.
- La propriété `loop` sur `AudioPlaylist` est en lecture ET écriture (`loop: AudioPlaylistLoopMode` dans la classe, non marquée `readonly`).

### Vérification Tâche 3

```
npx tsc --noEmit
```

Aucune erreur TypeScript. L'app doit démarrer sans crash. Vérifier dans la console qu'aucun warning "useAudioPlaylist outside component" n'apparaît.

---

## TÂCHE 4 — Brancher le lecteur sur le store

**Dépendance :** Tâche 3 doit être terminée.

### Étape 4.1 — Modifier `src/app/player.tsx`

**Supprimer :**

- L'import de `useLocalSearchParams` et le type `PlayerParams`.
- `const params = useLocalSearchParams<PlayerParams>()`.
- L'état local `const [isPlaying, setIsPlaying] = useState(false)`.
- La logique `const duration = parseFloat(params.duration ?? "0")`.
- L'affichage de `params.artwork`, `params.title`, `params.artist`.

**Ajouter :**

```ts
import { usePlayer } from "@/stores/playerStore";
const {
  tracks,
  currentIndex,
  currentTime,
  duration,
  playing,
  loop,
  isLoaded,
  isBuffering,
  play,
  pause,
  next,
  previous,
  seekTo,
  setLoop,
} = usePlayer();

const currentTrack = tracks[currentIndex] ?? null;
```

**Barre de progression réelle :**

```tsx
// Largeur dynamique en pourcentage
const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

// Dans le rendu :
<View style={[styles.progressFill, {
  backgroundColor: theme.primary,
  width: `${progressPercent}%`
}]} />

// Temps
<Text>{formatDuration(currentTime)}</Text>
<Text>{formatDuration(duration)}</Text>
```

**Artwork :** `currentTrack?.artwork` peut être une base64 string ou une URI. Si absent, utiliser `unknownTrackImageUri`.

**Bouton Play/Pause :**

```tsx
onPress={() => playing ? pause() : play()}
```

**Boutons Précédent / Suivant :**

```tsx
onPress={() => previous()} // skip back
onPress={() => next()}     // skip forward
```

**Shuffle :** Le `AudioPlaylist` de `expo-audio` ne supporte pas nativement le shuffle. L'implémenter côté `PlayerProvider` via une fonction `shuffleQueue()` qui réordonne `tracks` avec Fisher-Yates et recharge la queue via `loadQueue`. Pour V1, afficher le bouton shuffle comme toggle d'état local `isShuffle` dans `PlayerProvider` (réordonne à l'appel de `loadQueue`). Exposer `shuffle: boolean` et `toggleShuffle: () => void` dans le contexte.

**Cycle de loop :** Trois états — `'none' → 'single' → 'all' → 'none'`. Le bouton appelle :

```ts
const nextLoop: Record<AudioPlaylistLoopMode, AudioPlaylistLoopMode> = {
  none: "single",
  single: "all",
  all: "none",
};
setLoop(nextLoop[loop]);
```

L'icône change selon l'état :

- `'none'` : `repeat`, couleur `theme.textSecondary`
- `'single'` : `repeat`, couleur `theme.primary` + afficher "1" en overlay ou utiliser `repeat-one` si disponible
- `'all'` : `repeat`, couleur `theme.primary`

### Étape 4.2 — Modifier `src/components/TrackListItem.tsx`

**Nouvelles props :**

```ts
export type TrackListItemProps = {
  track: Track & { image?: string };
  allTracks?: Track[]; // toute la queue (pour loadQueue)
  trackIndex?: number; // index de ce track dans allTracks
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};
```

**Nouveau comportement de `handlePress` :**

```ts
const { loadQueue } = usePlayer();

const handlePress = () => {
  if (allTracks && trackIndex !== undefined) {
    loadQueue(allTracks, trackIndex);
    router.push('/player' as never);
  } else {
    // comportement existant (compatibilité ascendante)
    router.push({ pathname: '/player' as never, params: { ... } });
  }
};
```

**Icône favori (optionnelle) :**

```tsx
{
  onFavoritePress && (
    <TouchableOpacity
      onPress={onFavoritePress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={18}
        color={isFavorite ? theme.primary : theme.textSecondary}
      />
    </TouchableOpacity>
  );
}
```

**Point d'attention :** `usePlayer()` est maintenant utilisé dans `TrackListItem`. S'assurer que ce composant est toujours rendu à l'intérieur de `<PlayerProvider>`.

### Étape 4.3 — Modifier `src/components/TracksList.tsx`

Passer `allTracks` et l'index à chaque `TrackListItem` :

```tsx
renderItem={({ item: track, index }) => (
  <TrackListItem
    track={{ ...track, image: track.artwork }}
    allTracks={tracks}
    trackIndex={index}
  />
)}
```

`TracksList` reçoit déjà `tracks: Track[]` — utiliser directement ce prop pour `allTracks`.

### Points d'attention Tâche 4

- Le `player.tsx` actuel utilise `params.artwork` comme string URI. Après la refonte, `currentTrack.artwork` peut être une base64 string longue — `FastImage` l'accepte via `{ uri: 'data:image/jpeg;base64,...' }`.
- S'assurer que `router.push('/player' as never)` dans `TrackListItem` ne passe plus de params (le lecteur les ignore désormais).

### Vérification Tâche 4

```
npx tsc --noEmit
```

Test fonctionnel : tap sur un morceau → naviguer vers le lecteur → vérifier que le titre/artiste s'affiche, que play/pause fonctionne, que la barre de progression avance.

---

## TÂCHE 5 — SQLite Playlists et Favoris

**Dépendance :** Tâche 2 doit être terminée (le type `Track` est stabilisé).
**Peut être développée en parallèle de Tâche 4** (pas de dépendance directe entre 4 et 5).

### Étape 5.1 — Créer `src/database/database.ts`

```ts
import * as SQLite from "expo-sqlite";

// Singleton — ouvert une seule fois au démarrage
export const db = SQLite.openDatabaseSync("lordwave.db");

export async function initDatabase(): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await runMigrations();
}
```

La fonction `openDatabaseSync` prend juste le nom du fichier ; expo-sqlite stocke dans le dossier documents de l'app.

### Étape 5.2 — Créer `src/database/migrations/001_initial.ts`

```ts
import { SQLiteDatabase } from "expo-sqlite";

export async function migration001(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );

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

    INSERT OR IGNORE INTO schema_version (version) VALUES (1);
  `);
}
```

**Choix de design :**

- `favorites.trackUrl` est `UNIQUE` — un même fichier ne peut être favori qu'une fois.
- Les métadonnées (titre, artiste, artwork) sont **dénormalisées** dans `playlist_tracks` et `favorites` pour résister aux fichiers qui se déplacent (l'URL peut changer, mais on garde le titre affiché).
- `ON DELETE CASCADE` sur `playlist_tracks` : supprimer une playlist supprime ses pistes.

Système de migration dans `database.ts` :

```ts
async function runMigrations() {
  const row = db.getFirstSync<{ version: number }>(
    "SELECT version FROM schema_version LIMIT 1",
  );
  const currentVersion = row?.version ?? 0;
  if (currentVersion < 1) await migration001(db);
}
```

**Note :** `getFirstSync` peut lancer une exception si la table `schema_version` n'existe pas encore — encapsuler dans un try/catch, assumer version 0 en cas d'erreur.

### Étape 5.3 — Créer `src/database/repositories/playlistRepository.ts`

Types retournés :

```ts
export type PlaylistRow = { id: number; name: string; createdAt: number };
export type PlaylistTrackRow = {
  id: number;
  playlistId: number;
  trackUrl: string;
  trackTitle: string;
  trackArtist: string | null;
  trackAlbum: string | null;
  trackArtwork: string | null;
  position: number;
};
```

Fonctions :

```ts
export async function getAllPlaylists(): Promise<PlaylistRow[]>;
export async function createPlaylist(name: string): Promise<number>; // retourne lastInsertRowId
export async function deletePlaylist(id: number): Promise<void>;
export async function renamePlaylist(id: number, name: string): Promise<void>;
export async function getPlaylistTracks(
  playlistId: number,
): Promise<PlaylistTrackRow[]>;
export async function addTrackToPlaylist(
  playlistId: number,
  track: Track,
): Promise<void>;
export async function removeTrackFromPlaylist(trackId: number): Promise<void>;
```

Toutes les requêtes utilisent des paramètres liés (`db.runAsync(sql, [param1, param2])`), jamais de concaténation.

### Étape 5.4 — Créer `src/database/repositories/favoritesRepository.ts`

```ts
export type FavoriteRow = {
  id: number;
  trackUrl: string;
  trackTitle: string;
  trackArtist: string | null;
  trackAlbum: string | null;
  trackArtwork: string | null;
  addedAt: number;
};

export async function getAllFavorites(): Promise<FavoriteRow[]>;
export async function addFavorite(track: Track): Promise<void>; // INSERT OR IGNORE
export async function removeFavorite(trackUrl: string): Promise<void>;
export async function isFavorite(trackUrl: string): Promise<boolean>;
```

### Étape 5.5 — Créer `src/hooks/usePlaylists.ts`

```ts
export function usePlaylists() {
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => { ... }, []);

  const create = useCallback(async (name: string) => {
    const id = await createPlaylist(name);
    await refresh();
    return id;
  }, [refresh]);

  const remove = useCallback(async (id: number) => { ... }, [refresh]);
  const rename = useCallback(async (id: number, name: string) => { ... }, [refresh]);

  useEffect(() => { refresh(); }, []);

  return { playlists, isLoading, create, remove, rename, refresh };
}
```

### Étape 5.6 — Créer `src/hooks/useFavorites.ts`

```ts
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => { ... }, []);
  const add = useCallback(async (track: Track) => { ... }, [refresh]);
  const remove = useCallback(async (trackUrl: string) => { ... }, [refresh]);
  const checkIsFavorite = useCallback(async (trackUrl: string) => isFavorite(trackUrl), []);

  useEffect(() => { refresh(); }, []);

  return { favorites, isLoading, add, remove, checkIsFavorite, refresh };
}
```

### Étape 5.7 — Mettre à jour `src/app/_layout.tsx`

```tsx
import { initDatabase } from "@/database/database";

// Dans le composant App
useEffect(() => {
  initDatabase().catch((err) => console.error("DB init failed:", err));
}, []);
```

L'initialisation est async — les écrans de playlists/favoris gèrent `isLoading` eux-mêmes.

### Étape 5.8 — Créer `src/app/playlist/[id].tsx`

Écran de détail d'une playlist :

- Header avec le nom de la playlist.
- Liste des morceaux via `getPlaylistTracks(id)`.
- Bouton « Lecture » → `loadQueue(tracks, 0)` + `router.push('/player')`.
- Swipe-to-delete sur chaque piste (ou bouton poubelle) → `removeTrackFromPlaylist(trackId)`.
- État vide stylé avec `EmptyState`.

### Étape 5.9 — Mettre à jour `src/app/(tabs)/playlists/index.tsx`

- Utiliser `usePlaylists()` pour afficher la liste réelle.
- Bouton « Créer une playlist » : `Alert.prompt` (iOS) ou un modal simple (Android) pour saisir le nom → `create(name)`.
- Navigation vers `playlist/[id]` au tap.
- État vide : conserver `EmptyState` avec `action` branché sur `create`.
- État de chargement : `ActivityIndicator`.

### Étape 5.10 — Mettre à jour `src/app/(tabs)/favorites/index.tsx`

- Utiliser `useFavorites()` pour afficher la liste des favoris.
- Réutiliser `TracksList` avec les favoris convertis en `Track[]`.
- Passer `isFavorite=true` et `onFavoritePress={() => remove(track.url!)}` aux `TrackListItem`.
- État vide : conserver `EmptyState`.

### Points d'attention Tâche 5

- `expo-sqlite` v58 : la fonction `openDatabaseSync` est sur le module (`SQLite.openDatabaseSync`), pas besoin de `useSQLiteContext`. Ouvrir en singleton en dehors du cycle de rendu React.
- Les `artwork` base64 ne doivent **pas** être stockées en SQLite — trop volumineuses. Stocker `trackArtwork` seulement comme URI (pas base64). Si `track.artwork` est une base64 string, stocker `null` dans la colonne et re-charger l'artwork depuis les métadonnées à l'affichage.
- `withTransactionAsync` pour les opérations multi-étapes (ex: créer playlist + insérer les pistes).
- La route `playlist/[id].tsx` nécessite un dossier `src/app/playlist/` (hors du dossier `(tabs)`).

### Vérification Tâche 5

```
npx tsc --noEmit
```

Test fonctionnel :

1. Créer une playlist → vérifier qu'elle apparaît dans la liste.
2. Ajouter un favori → le voir dans l'onglet Favoris.
3. Redémarrer l'app → vérifier la persistance.

---

## TÂCHE 6 — Animations sobres

**Dépendance :** Tâches 4 et 5 doivent être terminées (les composants finaux sont animés).
`react-native-reanimated` v4.7.1 est déjà installé.

### Étape 6.1 — Transitions d'écrans dans `src/app/_layout.tsx`

Ajouter `animation: 'slide_from_right'` comme valeur par défaut du Stack, et **conserver** `slide_from_bottom` pour le modal player :

```tsx
<Stack screenOptions={{ animation: "slide_from_right" }}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen
    name="player"
    options={{
      headerShown: false,
      presentation: "modal",
      animation: "slide_from_bottom",
    }}
  />
</Stack>
```

**Note :** `screenOptions` sur `<Stack>` définit le défaut ; les `<Stack.Screen options>` individuels le surchargent.

### Étape 6.2 — Animation d'entrée de la liste dans `src/components/TracksList.tsx`

- Importer `Animated` et `FadeInDown` depuis `react-native-reanimated`.
- Remplacer le `<View>` wrappant `<TrackListItem>` par `<Animated.View>`.
- Appliquer l'animation seulement aux 15 premiers items (les autres apparaissent instantanément).
- Délai = `index * 30` ms, durée = `300` ms.

```tsx
import Animated, { FadeInDown } from 'react-native-reanimated';

renderItem={({ item: track, index }) => (
  <Animated.View
    entering={index < 15 ? FadeInDown.delay(index * 30).duration(300) : undefined}
  >
    <TrackListItem
      track={{ ...track, image: track.artwork }}
      allTracks={tracks}
      trackIndex={index}
    />
  </Animated.View>
)}
```

**Points d'attention :**

- `FadeInDown` combine `opacity: 0→1` et `translateY: 20→0` — sobre et naturel.
- Ne pas animer les `ItemSeparatorComponent` (pas de `Animated.View` dessus).
- Sur un scroll rapide, les items hors des 15 premiers apparaissent directement sans animation (performance).
- La prop `entering` accepte `undefined` — quand `index >= 15`, passer `undefined` désactive l'animation pour cet item.

### Vérification Tâche 6

Lancer l'app et naviguer entre les onglets : vérifier le slide_from_right. Ouvrir le lecteur : vérifier le slide_from_bottom. Sur l'écran Chansons : vérifier le fade-in progressif de la liste.

```
npx tsc --noEmit
```

---

## TÂCHE 7 — TypeScript + TODO final

**Dépendance :** Toutes les tâches précédentes doivent être terminées.

### Étape 7.1 — Vérification TypeScript complète

```powershell
cd c:\Users\lxrdf\Desktop\LordWave
npx tsc --noEmit
```

Corriger **toutes** les erreurs retournées. Catégories d'erreurs probables :

- Types `any` résiduels dans les nouveaux fichiers.
- Props manquantes sur `TrackListItem` (nouvelles props optionnelles — vérifier que `?` est bien présent).
- Type de retour de `loadQueue` (void, pas Promise).
- Import de `AudioPlaylistLoopMode` comme type vs valeur.
- `playlist.loop = mode` — si TypeScript signale que `loop` est `readonly`, utiliser `(playlist as any).loop = mode` en dernier recours et documenter le bug.

### Étape 7.2 — Mettre à jour `TODO.md`

Cocher les tâches accomplies :

- `[ ] Recherche par titre, artiste et album.` → `[x]`
- `[ ] Sauvegarde locale des playlists et préférences avec SQLite.` → `[x]`
- `[ ] Brancher expo-audio sur les contrôles du lecteur (lecture réelle).` → `[x]`
- `[ ] Passer au morceau précédent / suivant.` → `[x]`
- `[ ] Modes répétition (désactivée / morceau / liste) et aléatoire.` → `[x]`
- `[ ] Ajouter des animations sobres sans ralentir la lecture.` → `[x]`
- `[ ] Afficher artiste et album (nécessite lecture des métadonnées ID3).` → `[x]`
- `[ ] Afficher la pochette sur l'écran lecteur.` → `[x]`
- `[ ] Créer des états vides stylés (illustration + texte) pour la bibliothèque vide.` → déjà existant, vérifier

Laisser non coché (V2 ou nécessite test sur appareil réel) :

- Lecture en arrière-plan + notification + écran verrouillé validés sur appareil réel.
- Configurer la session audio pour autoriser la lecture en arrière-plan.

### Étape 7.3 — Créer `TODO-V2.md`

Créer `c:\Users\lxrdf\Desktop\LordWave\TODO-V2.md` avec toutes les fonctionnalités V2 identifiées :

- Écran d'accueil avec morceaux récemment écoutés.
- Vues par artiste et album.
- Tri par titre, artiste, durée, date.
- File d'attente + "Lire ensuite".
- Historique d'écoute.
- Artwork en cache (éviter de recharger depuis les métadonnées à chaque affichage).
- Lecture en arrière-plan + notification + lock screen validée sur appareil réel.
- Animations tab-bar (scale au press, bounce au focus).
- BlurView sur la tab-bar.
- Badge de notification sur onglet.
- Icônes SVG custom.
- `headerRight` avec icône settings/recherche.
- Recherche globale (toutes sections).
- Personnalisation de la police du titre du header.

### Étape 7.4 — Commit final

```powershell
cd c:\Users\lxrdf\Desktop\LordWave
git add src\constants\theme.ts
git add src\types\track.ts
git add src\services\media-library\useTrackMetadata.ts
git add src\helpers\filter.ts
git add "src\app\(tabs)\(songs)\index.tsx"
git add src\stores\playerStore.ts
git add src\stores\PlayerProvider.tsx
git add src\app\_layout.tsx
git add src\app\player.tsx
git add src\components\TrackListItem.tsx
git add src\components\TracksList.tsx
git add src\database\database.ts
git add "src\database\migrations\001_initial.ts"
git add src\database\repositories\playlistRepository.ts
git add src\database\repositories\favoritesRepository.ts
git add src\hooks\usePlaylists.ts
git add src\hooks\useFavorites.ts
git add "src\app\playlist\[id].tsx"
git add "src\app\(tabs)\playlists\index.tsx"
git add "src\app\(tabs)\favorites\index.tsx"
git add TODO.md
git add TODO-V2.md
git commit -m "feat: audio queue, SQLite playlists/favorites, ID3 metadata, animations"
```

### Vérification finale

```powershell
npx tsc --noEmit
npx expo-doctor
```

---

## Ordre de réalisation récapitulatif

```
T1 (theme) → T2 (metadata) → T3 (store) → T4 (player branché)
                           ↘ T5 (SQLite) ↗
T4 + T5 → T6 (animations) → T7 (TS + commit)
```

T3 dépend de T2 car le store reçoit des `Track[]` avec artwork base64.
T4 dépend de T3.
T5 dépend de T2 (type Track stable) mais est indépendant de T3/T4 — peut être développé en parallèle.
T6 dépend de T4 et T5 (composants finaux).
T7 clôture tout.
