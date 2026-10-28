# TODO — LordWave

> **Objectif du projet :** créer un lecteur musical Android élégant, rapide et fiable qui lit les fichiers audio présents sur le téléphone, fonctionne hors ligne et ne dépend pas d'un serveur pour l'utilisation quotidienne.

---

## 🔴 Priorité haute — Foundation & Infrastructure

### Configuration initiale

- [x] Créer le projet React Native avec Expo et TypeScript.
- [x] Configurer `expo-audio` pour la lecture en arrière-plan.
- [x] Définir le nom de l'application, son identifiant Android, son icône et son écran de lancement.
- [x] Installer les dépendances avec `npx expo install`.
- [x] Vérifier l'organisation des routes et des écrans Expo Router.
- [x] Vérifier la configuration native après toute modification d'un plugin ou d'une dépendance native.
- [ ] Utiliser Git pour conserver l'historique des modifications.
- [ ] Lancer régulièrement `npx expo-doctor` et corriger les erreurs importantes.

### Architecture & Thème

- [x] Centraliser les couleurs et le thème dans `src/constants/theme.ts`.
- [x] Créer un `ThemeContext` avec `ThemeProvider` dans `src/context/theme-context.tsx`.
- [x] Créer le hook `useThemedStyles()` pour éviter de répéter `defaultStyles(theme)`.
- [x] Créer le composant `ScreenWrapper` pour encapsuler ScrollView + padding + thème.
- [x] Migrer `layout.ts` de `token.ts` vers `theme.ts`.
- [x] Supprimer `src/constants/token.ts` une fois tous les imports migrés.
- [x] Supprimer ou vider `src/styles/index.ts` une fois tous les imports migrés.
- [x] Corriger le type `Theme` pour accepter les thèmes clair et sombre (`typeof Colors.dark | typeof Colors.light`).
- [x] Transformer `stackScreenWithSearchBar` en fonction recevant le thème (headers adaptatifs).

### Tab-bar

- [x] Mettre en place la navigation par onglets (Playlist, Chansons, Favoris).
- [x] Appliquer la couleur primaire sur l'icône active.
- [x] Appliquer `tabBarInactiveTintColor` pour les icônes inactives.
- [x] Ajouter `borderTopLeftRadius` / `borderTopRightRadius` (bords arrondis).
- [x] Ajouter une ombre portée (`elevation` Android, `shadow*` iOS).
- [x] Ajuster `height` et `paddingBottom` pour centrer les icônes.
- [x] Connecter la couleur de fond au thème via `theme.tabBar`.
- [x] Ajouter un fond coloré + border radius sur l'icône active.
- [x] Retirer l'effet ripple Android sur les boutons de la tab-bar.
- [ ] Ajouter des animations sur les boutons de la tab-bar (Option 4 recommandée : scale au press via `tabBarButton` + bounce vertical au focus via `tabBarIcon`).
- [ ] Cacher la tab-bar sur les écrans enfants (ex: lecteur plein écran) via `tabBarStyle: { display: 'none' }`.
- [ ] Ajouter un `BlurView` comme fond pour un effet verre dépoli.
- [ ] Ajouter un badge de notification sur un onglet (`tabBarBadge`).
- [ ] Remplacer les icônes `@expo/vector-icons` par des SVG custom.
- [ ] Animer l'apparition/disparition de la tab-bar au scroll.

---

## 🟠 Priorité moyenne — Fonctionnalités core

### Prototype de lecture

- [x] Lire un fichier audio sélectionné manuellement via `DocumentPicker`.
- [x] Lecture, pause, seek ±10s fonctionnels.
- [x] Configuration `setAudioModeAsync` pour lecture en arrière-plan.
- [ ] Lecture en arrière-plan + notification + écran verrouillé validés sur appareil réel.
- [ ] Configurer la session audio pour autoriser la lecture en arrière-plan.
- [ ] Activer les commandes d'écran verrouillé avec les métadonnées du morceau.

### Accès à la bibliothèque locale

- [x] Demander les autorisations Android nécessaires (`READ_MEDIA_AUDIO`, plugin `expo-media-library` dans `app.json`).
- [x] Parcourir les fichiers audio accessibles sur le téléphone via `useMediaLibrary` (API Query SDK 58).
- [x] Afficher une liste de morceaux avec titre et durée.
- [x] Gérer les états : chargement, permission refusée, erreur, bibliothèque vide.
- [x] Afficher artiste et album (nécessite lecture des métadonnées ID3).
- [ ] Gérer les métadonnées manquantes (`Artiste inconnu`, etc.).
- [ ] Gérer les fichiers déplacés, supprimés ou inaccessibles.
- [ ] Ajouter une action pour rescanner la bibliothèque.
- [ ] Tester avec MP3, M4A, WAV, FLAC.

### Pochettes

- [ ] Récupérer la pochette intégrée au fichier audio.
- [x] Prévoir une illustration de remplacement (`unknown_artist.png`, `unknown_track.png`).
- [x] Afficher la pochette sur l'écran lecteur.
- [ ] Afficher la pochette dans la notification et l'écran verrouillé.
- [ ] Mettre en cache les pochettes.

### Lecteur audio complet

- [x] Créer l'écran lecteur modal plein écran (`src/app/player.tsx`) avec pochette, titre, artiste, barre de progression, contrôles play/pause/skip, shuffle, repeat.
- [x] Naviguer vers le lecteur au tap sur un morceau (`TrackListItem` → `router.push('/player')`).
- [x] Enregistrer la route `player` comme modal dans `_layout.tsx`.
- [x] Brancher `expo-audio` sur les contrôles du lecteur (lecture réelle).
- [x] Passer au morceau précédent / suivant.
- [x] Modes répétition (désactivée / morceau / liste) et aléatoire.
- [ ] Gérer les appels, écouteurs débranchés et interruptions audio.
- [ ] Éviter les doubles lectures ou plusieurs instances du lecteur.
- [ ] Restaurer l'état du lecteur après navigation.

---

## 🟡 Priorité normale — Bibliothèque & Organisation

- [ ] Écran d'accueil avec les morceaux récemment écoutés.
- [ ] Onglet « Tous les morceaux ».
- [ ] Vues par artiste, album et dossier.
- [x] Recherche par titre, artiste et album.
- [ ] Tri par titre, artiste, album, durée et date d'ajout.
- [x] Favoris.
- [x] Création, renommage et suppression de playlists.
- [x] Ajout et retrait de morceaux dans une playlist.
- [ ] File d'attente de lecture + menu « Lire ensuite ».
- [ ] Historique d'écoute.
- [x] Sauvegarde locale des playlists et préférences avec SQLite.

---

## 🟢 Priorité basse — Finition & Design

### Interface & UX

- [ ] Créer une identité visuelle cohérente pour LordWave.
- [ ] Concevoir les écrans : accueil, bibliothèque, lecteur, recherche, playlists, favoris, paramètres.
- [x] Prévoir les états : chargement, liste vide, permission refusée, erreur de lecture.
- [ ] Assurer la lisibilité sur petits et grands écrans.
- [x] Ajouter des animations sobres sans ralentir la lecture. _(transitions slide_from_right, FadeInDown sur listes)_
- [x] Ajouter les libellés d'accessibilité aux boutons importants (lecteur, tab-bar).
- [ ] Tester la navigation avec le bouton Retour Android.
- [ ] Ajouter un `headerRight` avec icône settings ou recherche dans les headers.
- [ ] Personnaliser la police du titre du header avec `headerTitleStyle.fontFamily`.
- [ ] Créer des états vides stylés (illustration + texte) pour la bibliothèque vide.
- [x] Créer un hook `useThemedStyles(stylesheet)` — utilisé dans les nouveaux composants.

### Tests & Robustesse

- [ ] Tester sur un vrai téléphone Android.
- [ ] Tester avec permission accordée, refusée et révoquée.
- [ ] Tester avec une bibliothèque vide et une bibliothèque contenant beaucoup de morceaux.
- [ ] Tester les morceaux sans titre, sans artiste et sans pochette.
- [ ] Tester les formats audio non pris en charge.
- [ ] Tester la notification, l'écran verrouillé, les écouteurs Bluetooth et filaires.
- [ ] Tester les appels et interruptions audio.
- [ ] Tester le passage en mode avion.
- [ ] Tester la persistance des playlists/favoris après redémarrage.

### APK autonome

- [x] Configurer `eas.json` avec un profil `preview` qui produit un APK.
- [x] Corriger le fichier `assets/covers/unknown_artist.png` (JPEG déguisé en PNG — corrigé avant le build EAS).
- [ ] Générer l'APK avec `eas build --platform android --profile preview` et l'installer sur appareil réel.
- [ ] Vérifier le fonctionnement hors ligne, en arrière-plan et sur l'écran verrouillé.
- [ ] Garder le profil `production` en AAB pour la publication Play Store.

---

## 📋 Ordre de réalisation conseillé

1. [x] Prototype de lecture d'un fichier audio sélectionné manuellement.
2. [x] Bibliothèque locale : hook `useMediaLibrary`, permissions, liste de morceaux.
3. [x] Écran lecteur modal (design statique).
4. [x] Brancher `expo-audio` sur le lecteur (lecture réelle, contrôles, background).
5. [ ] Lecture en arrière-plan + notification + écran verrouillé sur appareil réel.
6. [ ] Métadonnées complètes (artiste, album, pochette via ID3).
7. [ ] File de lecture, précédent/suivant, répétition et aléatoire.
8. [ ] Favoris, playlists, historique et SQLite.
9. [ ] Recherche, tri et navigation complète.
10. [ ] Finition visuelle et accessibilité.
11. [ ] Tests sur appareil réel et corrections.
12. [ ] APK autonome de test, puis préparation de la version de publication.

---

> **Règle de progression :** cocher une tâche uniquement après l'avoir testée. La lecture en arrière-plan et les commandes de l'écran verrouillé doivent être validées sur un appareil réel avant de consacrer trop de temps à la finition de l'interface.
