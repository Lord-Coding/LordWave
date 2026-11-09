# LordWave

LordWave est un projet de lecteur musical local pour Android, développé avec Expo et React Native. L’objectif est de parcourir et lire la musique présente sur le téléphone, hors ligne, avec des favoris et des playlists.

> **État du projet :** la bibliothèque locale Android peut parcourir les morceaux, artistes et albums, et la lecture audio utilise les fichiers présents sur l’appareil. Les favoris et playlists ne sont pas encore persistés. Les fonctionnalités natives doivent être validées sur un appareil Android.

## Fonctionnalités prévues

- Parcourir les morceaux, artistes et albums présents sur l’appareil.
- Afficher les pochettes intégrées et lire la musique locale en arrière-plan.
- Gérer les favoris et les playlists localement.
- Rechercher et trier la bibliothèque musicale.

## Prérequis

- Node.js et npm.
- Un téléphone Android ou un environnement de développement Android compatible.
- Un compte Expo/EAS pour créer les builds Android dans le cloud.

Le projet utilise Expo SDK 58, Expo Router, React Native et TypeScript. Les dépendances `expo-media-library`, `expo-audio` et `expo-sqlite` sont déjà déclarées, mais leur présence ne signifie pas que les fonctionnalités associées sont terminées.

## Installation et lancement

Depuis la racine du projet :

```bash
npm install
npx expo start
```

Pour ouvrir la version Web ou iOS en développement :

```bash
npm run web
npm run ios
```

Le projet cible en priorité Android. Pour tester les fonctionnalités natives et la configuration audio, utilisez un **development build** plutôt qu’Expo Go. Le workflow du projet utilise les builds EAS dans le cloud ; aucun build Android local avec `expo run:android` ou `eas build --local` n’est prévu.

## Builds Android avec EAS

Connectez-vous à EAS si nécessaire :

```bash
npx eas-cli@latest login
```

Les profils sont définis dans [eas.json](./eas.json) :

```bash
# Client de développement (APK)
npx eas-cli@latest build --platform android --profile development

# APK autonome de test
npx eas-cli@latest build --platform android --profile preview

# Build de production (AAB)
npx eas-cli@latest build --platform android --profile production
```

Le profil `development` nécessite un Development Client et s’utilise avec Metro. Le profil `preview` produit un APK installable pour les tests sans serveur de développement. Le profil `production` produit un Android App Bundle (AAB).

La lecture en arrière-plan, les notifications et les permissions doivent être vérifiées sur un véritable appareil Android ; la configuration seule ne garantit pas leur bon fonctionnement.

## Vérifications

```bash
npx tsc --noEmit
npx expo-doctor
npm run lint
```

La configuration ESLint peut devoir être installée avant que la commande de lint fonctionne.

## Organisation du code

- `src/app/` : routes Expo Router et navigation par onglets.
- `src/features/` : écrans Bibliothèque, Favoris et Playlists.
- `src/components/` : composants d’interface réutilisables.
- `src/constants/` : types, thème et données de démonstration (`mockMusic.ts`).
- `src/hooks/` et `src/context/` : hooks et contexte du thème.

Les prochaines étapes de développement et critères de validation sont décrits dans [TODO.md](./TODO.md).
