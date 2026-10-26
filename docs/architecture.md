# LordWave — Guide d'architecture du projet

## 1. Vue d'ensemble rapide

LordWave est un projet **Expo Router**. Ça veut dire qu'il n'y a **pas de `App.tsx`** comme dans un projet React Native classique. La navigation et le point d'entrée de l'app sont gérés automatiquement par Expo Router via le dossier `src/app/`.


---

## 2. L'équivalent de `App.tsx` ici

Dans un projet React Native classique, `App.tsx` est le fichier racine où tu déclares ton `NavigationContainer`, tes providers globaux, etc.

**Ici, ce rôle est rempli par `src/app/_layout.tsx`.**

C'est là que tu dois mettre :
- Les **providers globaux** (`ThemeProvider`, `QueryClientProvider`, un store Zustand si besoin, etc.)
- Le **composant de navigation racine** (actuellement `<AppTabs />`)
- La gestion du **splash screen**
- Tout ce qui doit envelopper **toute l'application**

```tsx
// src/app/_layout.tsx  ← l'équivalent de App.tsx
export default function RootLayout() {
  return (
    <ThemeProvider ...>
      <MonProvider>
        <AppTabs />
      </MonProvider>
    </ThemeProvider>
  );
}
```

---

## 3. Où déclarer les pages (routes/écrans)

**Expo Router = le fichier = la route.** Tout fichier dans `src/app/` devient automatiquement une page.

| Fichier                          | URL / Chemin de navigation       | Rôle                              |
|----------------------------------|----------------------------------|-----------------------------------|
| `src/app/index.tsx`              | `/` (onglet Home)                | Écran principal                   |
| `src/app/explore.tsx`            | `/explore` (onglet Explore)      | Deuxième onglet                   |
| `src/app/_layout.tsx`            | *(pas une page)*                 | Layout racine — providers, tabs   |
| `src/app/player/index.tsx`       | `/player`                        | Écran lecteur (à créer)           |
| `src/app/library/index.tsx`      | `/library`                       | Bibliothèque (à créer)            |
| `src/app/library/[id].tsx`       | `/library/album123`              | Détail d'un album (à créer)       |
| `src/app/(modal)/settings.tsx`   | `/settings` en modal             | Paramètres (à créer)              |

**Règle d'or :** Si c'est un écran que l'utilisateur navigue vers lui → `src/app/`. Si c'est juste un composant → ailleurs.

### Comment les onglets sont déclarés

Actuellement les onglets sont définis dans **`src/components/app-tabs.tsx`** via `NativeTabs`. C'est ce composant qui est rendu dans `_layout.tsx`. Chaque `NativeTabs.Trigger` pointe vers un nom de fichier dans `src/app/`.

Pour **ajouter un onglet** :
1. Crée `src/app/mapage.tsx`
2. Ajoute un `<NativeTabs.Trigger name="mapage">` dans `app-tabs.tsx`

---

## 4. Où mettre quoi — Carte complète

### `src/app/` — Pages uniquement
Uniquement des fichiers de **routes**. Pas de logique métier, pas de composants réutilisables. Un fichier de route doit idéalement juste composer des composants et connecter la navigation.

```
src/app/
  _layout.tsx          ← providers globaux + navigator (équivalent App.tsx)
  index.tsx            ← page Home
  explore.tsx          ← page Explore (template de départ, à remplacer)
  player/
    index.tsx          ← page lecteur plein écran
  library/
    index.tsx          ← liste de la bibliothèque
    [id].tsx           ← détail d'un album/artiste
  (modal)/
    settings.tsx       ← modale paramètres
```

---

### `src/components/` — Composants UI réutilisables
Composants **agnostiques** — ils ne savent pas d'où viennent les données, ils reçoivent des props et affichent quelque chose. Utilisables dans plusieurs pages.

**Exemples de ce qu'on met ici :**
```
src/components/
  themed-text.tsx          ← texte avec thème (déjà là)
  themed-view.tsx          ← view avec thème (déjà là)
  external-link.tsx        ← lien externe (déjà là)
  app-tabs.tsx             ← navigator d'onglets (déjà là)
  track-card.tsx           ← carte d'un morceau (à créer)
  player-controls.tsx      ← boutons play/pause/seek (à créer)
  progress-bar.tsx         ← barre de progression (à créer)
  empty-state.tsx          ← état vide générique (à créer)
  ui/
    collapsible.tsx        ← section dépliable (déjà là)
    button.tsx             ← bouton générique (à créer)
```

**Règle :** Si tu copierais ce composant dans un autre projet et qu'il marcherait → il va ici.

---

### `src/features/` — Logique métier par fonctionnalité *(à créer)*
Chaque grande fonctionnalité a son propre dossier avec ses composants spécifiques, ses hooks, et sa logique.

```
src/features/
  player/
    components/
      mini-player.tsx        ← lecteur réduit en bas d'écran
      full-player.tsx        ← lecteur plein écran
    hooks/
      use-player.ts          ← état du lecteur
    player-store.ts          ← état Zustand du lecteur
  library/
    components/
      track-list.tsx         ← liste de morceaux
      album-grid.tsx         ← grille d'albums
    hooks/
      use-library.ts         ← chargement de la bibliothèque
  playlists/
    components/
      playlist-card.tsx
    hooks/
      use-playlists.ts
  settings/
    components/
      settings-row.tsx
```

**Règle :** Un composant qui n'a de sens QUE dans la fonctionnalité player → `features/player/components/`. S'il peut servir ailleurs → `components/`.

---

### `src/services/` — Adaptateurs de plateformes *(à créer)*
Tout ce qui touche une **API native ou externe**. Ces fichiers ne savent rien de l'UI.

```
src/services/
  audio/
    audio-service.ts         ← wraps expo-audio (play, pause, seek, etc.)
  media-library/
    media-library-service.ts ← scan de la bibliothèque du téléphone
  file-system/
    file-service.ts          ← opérations sur les fichiers locaux
```

**Règle :** Si ton code appelle `expo-audio`, `expo-media-library`, ou `expo-file-system` → ça va dans `services/`. Le reste de l'app ne parle qu'au service, pas directement à l'API Expo.

---

### `src/database/` — Persistance locale *(à créer)*
Tout ce qui touche **SQLite**.

```
src/database/
  database.ts              ← initialisation de la DB
  migrations/
    001_initial.ts         ← création des tables
    002_add_favorites.ts   ← évolution du schéma
  repositories/
    tracks-repository.ts   ← CRUD des morceaux
    playlists-repository.ts← CRUD des playlists
    favorites-repository.ts← CRUD des favoris
```

**Règle :** Les requêtes SQL restent dans les `repositories`. Les composants et hooks n'écrivent jamais de SQL directement.

---

### `src/stores/` — État global partagé *(à créer)*
Si tu utilises Zustand (recommandé), les stores globaux vivent ici.

```
src/stores/
  player-store.ts          ← état de lecture (morceau actuel, position, etc.)
  queue-store.ts           ← file de lecture
```

---

### `src/hooks/` — Hooks React réutilisables
Hooks **partagés** entre plusieurs features ou pages.

```
src/hooks/
  use-color-scheme.ts      ← déjà là
  use-theme.ts             ← déjà là
  use-debounce.ts          ← à créer si besoin
  use-permissions.ts       ← gestion des permissions media
```

**Règle :** Un hook qui n'est utilisé que dans `features/player/` → il va dans `features/player/hooks/`. Un hook utilisé partout → `src/hooks/`.

---

### `src/types/` — Types TypeScript partagés *(à créer)*
Les types de domaine indépendants de l'UI.

```
src/types/
  track.ts                 ← type Track
  playlist.ts              ← type Playlist
  playback.ts              ← type PlaybackState
  album.ts                 ← type Album
```

---

### `src/utils/` — Fonctions utilitaires pures *(à créer)*
Petites fonctions sans effets de bord, sans contexte React.

```
src/utils/
  format-time.ts           ← formatTime(seconds) → "03:45"
  format-file-size.ts
  sort-tracks.ts
```

> La fonction `formatTime` qui est actuellement dans `src/app/index.tsx` est un bon exemple de ce qui devrait aller dans `src/utils/format-time.ts`.

---

### `src/constants/` — Constantes globales
```
src/constants/
  theme.ts                 ← couleurs, espacements, polices (déjà là)
```

---

## 5. Résumé visuel de la structure cible

```
src/
├── app/                   ← PAGES uniquement (Expo Router)
│   ├── _layout.tsx        ← équivalent App.tsx
│   ├── index.tsx          ← page Home
│   ├── player/
│   │   └── index.tsx
│   └── library/
│       ├── index.tsx
│       └── [id].tsx
│
├── components/            ← UI réutilisable, agnostique
│   └── ui/
│
├── features/              ← logique + UI propre à une feature
│   ├── player/
│   ├── library/
│   └── playlists/
│
├── services/              ← adaptateurs d'API natives (expo-audio, etc.)
├── database/              ← SQLite (init, migrations, repositories)
├── stores/                ← état global (Zustand)
├── hooks/                 ← hooks React partagés
├── types/                 ← types de domaine
├── utils/                 ← fonctions pures
└── constants/             ← thème, couleurs, espacements
```

---

## 6. État actuel du projet

| Fichier actuel | Statut | Note |
|---|---|---|
| `src/app/_layout.tsx` | ✅ Bien placé | C'est l'équivalent App.tsx |
| `src/app/index.tsx` | ⚠️ Page trop grosse | La logique audio et `formatTime` devraient aller dans `services/` et `utils/` |
| `src/app/explore.tsx` | ⚠️ Template par défaut | À remplacer par un vrai écran LordWave |
| `src/components/app-tabs.tsx` | ✅ Bien placé | Composant UI pour le navigator |
| `src/components/themed-*.tsx` | ✅ Bien placés | Composants de base réutilisables |
| `src/hooks/use-theme.ts` | ✅ Bien placé | Hook partagé |
| `src/constants/theme.ts` | ✅ Bien placé | Constantes globales |
| `src/features/` | ❌ Absent | À créer au fil des features |
| `src/services/` | ❌ Absent | La logique `expo-audio` de `index.tsx` devrait y aller |
| `src/database/` | ❌ Absent | À créer quand on ajoute SQLite |
| `src/types/` | ❌ Absent | Le type `SelectedTrack` de `index.tsx` devrait y aller |
| `src/utils/` | ❌ Absent | `formatTime` de `index.tsx` devrait y aller |
