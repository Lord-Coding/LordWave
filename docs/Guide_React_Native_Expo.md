# Guide pratique — React Native + Expo

Ce guide explique les équivalents HTML, une architecture à quatre pages avec Expo Router, les layouts, la navigation et les principaux composants React Native et modules Expo.

> **À savoir :** React Native fournit des composants d'interface ; Expo fournit des modules/API qui utilisent les fonctions du téléphone. Il n'existe pas de « balises Expo » universelles comme en HTML. Ce document couvre les éléments les plus utilisés, avec des liens officiels vers les listes complètes et actualisées.

## 1. Équivalents HTML → React Native

| Web HTML/React | React Native | Utilisation |
|---|---|---|
| `<div>` | `<View>` | Conteneur, mise en page |
| `<p>` | `<Text>` | Paragraphe |
| `<h1>`, `<h2>`, etc. | `<Text>` avec styles | Titres |
| `<span>` | `<Text>` | Portion de texte |
| `<strong>`, `<b>` | `<Text style={{fontWeight:'bold'}}>` | Gras |
| `<em>`, `<i>` | `<Text style={{fontStyle:'italic'}}>` | Italique |
| `<button>` | `<Pressable>` ou `<Button>` | Action tactile |
| `<input type="text">` | `<TextInput>` | Champ de saisie |
| `<textarea>` | `<TextInput multiline />` | Texte multiligne |
| `<input type="checkbox">` | Pas de composant universel intégré | Créer avec `Pressable` + état ou bibliothèque |
| `<input type="radio">` | Pas de composant universel intégré | Créer avec état ou bibliothèque |
| `<img>` | `<Image>` ou `expo-image` | Image, pochette |
| `<a>` | `<Link>` d'Expo Router | Navigation |
| `<ul>`, `<li>` | `<FlatList>` / `<SectionList>` | Listes performantes |
| `<form>` | Combinaison de composants | Saisie et validation |
| `<select>` | Picker d'une bibliothèque compatible | Liste de choix |
| `<video>` | `expo-video` | Vidéo |
| `<audio>` | `expo-audio` | Audio |
| `<table>` | `View` + styles ou liste | Pas de tableau standard intégré |
| CSS | `style` / `StyleSheet.create()` | Styles React Native |
| `onClick` | `onPress` | Interaction |
| `className` | `style` (React Native standard) | Style d'un composant |
| `document.querySelector` | état React / props / refs | Pas de DOM web dans React Native |

### Exemple de composant

```tsx
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function Example() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bienvenue sur LordWave</Text>
      <Text>Choisis une musique.</Text>
      <TextInput placeholder="Rechercher" style={styles.input} />
      <Pressable style={styles.button} onPress={() => console.log('Lire')}>
        <Text style={styles.buttonText}>Lire</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 12, backgroundColor: '#171B30', borderRadius: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  input: { padding: 12, borderWidth: 1, borderColor: '#777', borderRadius: 8, color: '#fff' },
  button: { padding: 14, backgroundColor: '#7865F5', borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
```

**Règle importante :** tout texte visible doit être dans `<Text>`. `<View>` sert à organiser les éléments ; ce n'est pas un paragraphe.

## 2. Styles et Flexbox

React Native n'utilise pas le CSS du navigateur tel quel. Les propriétés sont en camelCase : `backgroundColor`, `fontSize`, `borderRadius`.

```tsx
<View style={{
  flex: 1,
  padding: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
  <Text>Gauche</Text>
  <Text>Droite</Text>
</View>
```

- `flex: 1` : occupe l'espace disponible.
- `flexDirection: 'column'` : éléments empilés verticalement (par défaut).
- `flexDirection: 'row'` : éléments côte à côte.
- `justifyContent` : répartit les éléments sur l'axe principal.
- `alignItems` : aligne les éléments sur l'axe transversal.
- `padding`, `margin`, `gap` : espacements.
- Les dimensions numériques sont des unités logiques : `padding: 16`, `fontSize: 20`.
- Certaines propriétés CSS web (`:hover`, `cursor`, `position: sticky`, `document`) ne se transposent pas directement.

## 3. Architecture de quatre pages

Exemple pour LordWave : Accueil, Playlists, Favoris et Paramètres.

```text
LordWave/
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx       # Accueil (/)
│       ├── playlists.tsx   # Playlists (/playlists)
│       ├── favorites.tsx   # Favoris (/favorites)
│       └── settings.tsx    # Paramètres (/settings)
├── components/
│   ├── SongRow.tsx
│   └── MiniPlayer.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── services/
│   └── audioService.ts
├── store/
│   └── playerStore.ts
├── types/
│   └── music.ts
├── app.json
└── package.json
```

- `app/` contient les routes/pages.
- `app/_layout.tsx` configure le navigateur racine.
- `app/(tabs)/_layout.tsx` configure la barre d'onglets.
- `components/` contient des morceaux d'interface réutilisables, pas des pages.
- `services/` contient les fonctions techniques.
- `store/` peut contenir l'état partagé du lecteur.
- `assets/` contient les images et polices.
- `(tabs)` est un groupe de routes : son nom entre parenthèses ne figure pas dans le chemin.

Si ton projet a déjà `app/(tabs)/index.tsx`, garde la structure existante et ajoute seulement les fichiers manquants.

## 4. Déclarer les layouts

### `app/_layout.tsx` — layout racine

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

Le `Stack` racine contient le groupe des onglets. Tu pourras ajouter d'autres écrans hors onglets plus tard, par exemple un écran de détail.

### `app/(tabs)/_layout.tsx` — barre d'onglets

Si tu veux les icônes, installe les dépendances :

```bat
npm install lucide-react-native
npx expo install react-native-svg
```

Puis écris :

```tsx
import { Tabs } from 'expo-router';
import { Home, ListMusic, Heart, Settings } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A99BFF',
        tabBarInactiveTintColor: '#9296AE',
        tabBarStyle: {
          backgroundColor: '#171B30',
          borderTopColor: '#292E48',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color, size }) => <ListMusic color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

**Comment un onglet apparaît-il ?**
1. Le fichier de route existe dans `app/(tabs)/`.
2. `_layout.tsx` déclare un `Tabs.Screen` dont `name` correspond au nom du fichier, sans `.tsx`.
3. Expo Router associe le nom à la route.
4. L'onglet apparaît et le toucher navigue vers la page.

## 5. Créer les pages

### `app/(tabs)/index.tsx` — Accueil

```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>LordWave</Text>
      <Text style={styles.description}>Ta musique, ton univers.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/playlists')}>
        <Text style={styles.buttonText}>Voir mes playlists</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.push('/favorites')}>
        <Text style={styles.buttonText}>Voir mes favoris</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#0D1020', gap: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  description: { fontSize: 16, color: '#A6AAC1' },
  button: { padding: 16, backgroundColor: '#7865F5', borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
```

### `app/(tabs)/playlists.tsx` — Playlists

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function PlaylistsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mes playlists</Text>
      <Text style={styles.description}>Tes playlists apparaîtront ici.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#0D1020' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  description: { marginTop: 12, color: '#A6AAC1', fontSize: 16 },
});
```

### `app/(tabs)/favorites.tsx` — Favoris

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mes favoris</Text>
      <Text style={styles.description}>Les morceaux aimés apparaîtront ici.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#0D1020' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  description: { marginTop: 12, color: '#A6AAC1', fontSize: 16 },
});
```

### `app/(tabs)/settings.tsx` — Paramètres

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Paramètres</Text>
      <Text style={styles.description}>Préférences de l'application.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: '#0D1020' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  description: { marginTop: 12, color: '#A6AAC1', fontSize: 16 },
});
```

Ces pages affichent un squelette d'interface. La logique réelle des playlists et favoris sera ajoutée ensuite.

## 6. Naviguer entre les pages

### Depuis un bouton

```tsx
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

<Pressable onPress={() => router.push('/favorites')}>
  <Text>Ouvrir les favoris</Text>
</Pressable>
```

- `router.push('/favorites')` : ouvre une route et l'ajoute à l'historique.
- `router.replace('/favorites')` : remplace la route courante.
- `router.back()` : revient en arrière si possible.

### Avec un lien déclaratif

```tsx
import { Link } from 'expo-router';
import { Text } from 'react-native';

<Link href="/playlists">
  <Text>Ouvrir les playlists</Text>
</Link>
```

Avec l'architecture précédente :
- `index.tsx` → `/`
- `playlists.tsx` → `/playlists`
- `favorites.tsx` → `/favorites`
- `settings.tsx` → `/settings`

Le groupe `(tabs)` n'est pas inclus dans l'URL. Les noms des `Tabs.Screen` doivent correspondre aux noms des fichiers.

## 7. Principaux composants React Native

| Composant / API | À quoi ça sert |
|---|---|
| `View` | Conteneur de mise en page |
| `Text` | Afficher du texte |
| `Image` | Afficher une image |
| `ImageBackground` | Image en fond |
| `TextInput` | Champ de saisie |
| `ScrollView` | Contenu défilant, plutôt limité |
| `FlatList` | Liste optimisée de données |
| `SectionList` | Liste groupée en sections |
| `Pressable` | Bouton ou zone tactile personnalisable |
| `Button` | Bouton natif simple, peu personnalisable |
| `Switch` | Interrupteur activé/désactivé |
| `ActivityIndicator` | Indicateur de chargement |
| `Modal` | Fenêtre modale |
| `StatusBar` | Apparence de la barre d'état |
| `KeyboardAvoidingView` | Ajustement quand le clavier apparaît |
| `RefreshControl` | Actualisation par glissement |
| `SafeAreaView` | Gestion des zones de sécurité selon l'API/version utilisée |
| `TouchableOpacity` | Ancien composant tactile, souvent remplacé par `Pressable` |
| `TouchableHighlight` | Ancien composant tactile avec surbrillance |
| `TouchableWithoutFeedback` | Interaction sans retour visuel |
| `StyleSheet` | Organisation des styles |
| `Animated` | Animations |
| `Platform` | Distinguer Android, iOS et web |
| `Dimensions` | Lire les dimensions d'écran |
| `useWindowDimensions` | Hook réactif des dimensions |

Exemple de liste :

```tsx
import { FlatList, Text, View } from 'react-native';

const songs = [
  { id: '1', title: 'Premier morceau' },
  { id: '2', title: 'Deuxième morceau' },
];

export default function SongList() {
  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text>{item.title}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>Aucun morceau pour le moment.</Text>}
    />
  );
}
```

Pour des milliers de morceaux, préfère `FlatList` à une longue série d'éléments dans `ScrollView`.

## 8. Hooks React utiles

| Hook | Fonction |
|---|---|
| `useState` | État local |
| `useEffect` | Effet secondaire et nettoyage |
| `useContext` | Lire un contexte partagé |
| `useMemo` | Mémoriser un calcul |
| `useCallback` | Mémoriser une fonction |
| `useRef` | Garder une référence mutable |
| `useReducer` | Gérer un état via des actions |
| `useId` | Identifiant stable pour les usages React compatibles |

```tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View>
      <Text>Compteur : {count}</Text>
      <Pressable onPress={() => setCount((value) => value + 1)}>
        <Text>Ajouter</Text>
      </Pressable>
    </View>
  );
}
```

Évite de manipuler un DOM : dans React Native, modifie l'état React et React actualise l'interface.

## 9. Principaux modules Expo

Expo fournit des bibliothèques installables. Ce ne sont pas des balises ; ce sont des API/modules.

| Module | Utilité |
|---|---|
| `expo-audio` | Lecture audio et contrôles multimédias |
| `expo-video` | Lecture vidéo |
| `expo-image` | Affichage d'images avancé |
| `expo-image-picker` | Choisir une image/vidéo |
| `expo-document-picker` | Choisir un fichier |
| `expo-media-library` | Bibliothèque média et permissions |
| `expo-file-system` | Accès aux fichiers autorisés |
| `expo-sqlite` | Base de données locale |
| `expo-secure-store` | Stockage sécurisé de petites valeurs |
| `expo-notifications` | Notifications |
| `expo-haptics` | Retour haptique |
| `expo-location` | Localisation avec permission |
| `expo-camera` | Caméra |
| `expo-clipboard` | Presse-papiers |
| `expo-sharing` | Partage de fichiers |
| `expo-linking` | Liens profonds et URLs |
| `expo-font` | Polices personnalisées |
| `expo-splash-screen` | Écran de lancement |
| `expo-status-bar` | Barre d'état |
| `expo-screen-orientation` | Orientation de l'écran |
| `expo-application` | Informations de l'application |
| `expo-device` | Informations sur l'appareil |
| `expo-network` | État du réseau |
| `expo-battery` | Informations batterie |
| `expo-constants` | Configuration Expo |
| `expo-updates` | Mises à jour OTA compatibles |
| `expo-dev-client` | Client de développement |
| `expo-router` | Navigation basée sur les fichiers |
| `expo-linear-gradient` | Dégradés |
| `expo-blur` | Effet de flou |
| `expo-web-browser` | Ouvrir une page web |

Installe les modules Expo avec `npx expo install` pour obtenir une version compatible avec le SDK du projet. Exemple :

```bat
npx expo install expo-audio
```

Pour LordWave, le noyau utile sera probablement `expo-audio`, `expo-media-library` et/ou `expo-document-picker`, `expo-sqlite`, `expo-image` et `expo-router`. N'installe pas tous les modules si tu n'en as pas besoin.

**Pochettes audio :** le fait d'avoir une URI audio ne signifie pas que la pochette intégrée est disponible comme une image séparée. Selon les formats et la méthode d'accès, un module de métadonnées supplémentaire peut être nécessaire.

## 10. Erreurs fréquentes

1. Employer `<div>` ou `<p>` : utiliser `View` et `Text`.
2. Mettre du texte directement dans `View` : placer le texte dans `Text`.
3. Copier du CSS web tel quel : utiliser les styles React Native.
4. Créer un composant dans `components/` et attendre qu'il apparaisse comme page : une page doit être une route dans `app/`.
5. Oublier de déclarer les onglets dans `(tabs)/_layout.tsx`.
6. Confondre un composant (`Text`) et un module (`expo-audio`).
7. Installer des modules Expo avec des versions incompatibles : utiliser `npx expo install`.
8. Utiliser `ScrollView` pour une immense bibliothèque : préférer `FlatList`.
9. Tout mettre dans un seul fichier : séparer pages, composants et services.
10. Confondre build `development` et APK autonome : le development build charge généralement le code depuis le serveur Metro ; un build `preview` correctement configuré embarque le code pour fonctionner sans serveur.

## 11. Parcours conseillé pour LordWave

1. Apprendre `View`, `Text`, `Pressable`, `Image`, `TextInput` et `FlatList`.
2. Créer les quatre pages et les deux layouts.
3. Tester les onglets et les boutons de navigation.
4. Extraire les éléments réutilisables dans `components/`.
5. Ajouter les morceaux et le lecteur audio.
6. Ajouter favoris, playlists et SQLite.
7. Tester sur un téléphone Android réel.
8. Générer un APK `preview` autonome et vérifier qu'il fonctionne sans serveur.

## 12. Documentation officielle

- Composants et API React Native : https://reactnative.dev/docs/components-and-apis
- Composants de base : https://reactnative.dev/docs/intro-react-native-components
- Styles : https://reactnative.dev/docs/style
- Flexbox : https://reactnative.dev/docs/flexbox
- `TextInput` : https://reactnative.dev/docs/textinput
- `FlatList` : https://reactnative.dev/docs/flatlist
- Introduction Expo Router : https://docs.expo.dev/router/introduction/
- Layouts Expo Router : https://docs.expo.dev/router/basics/layout/
- Navigation Expo Router : https://docs.expo.dev/router/basics/navigation/
- Catalogue des modules Expo : https://docs.expo.dev/versions/latest/
- Expo Audio : https://docs.expo.dev/versions/latest/sdk/audio/
- Expo SQLite : https://docs.expo.dev/versions/latest/sdk/sqlite/

**Conseil :** tu n'as pas besoin de mémoriser tous les composants. Apprends les six de base, comprends les deux fichiers `_layout.tsx`, puis ajoute les modules seulement quand une fonctionnalité le demande.
