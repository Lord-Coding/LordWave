# TODO — LordWave

> **Objectif du projet :** créer un lecteur musical Android élégant, rapide et fiable qui lit les fichiers audio présents sur le téléphone, fonctionne hors ligne et ne dépend pas d'un serveur pour l'utilisation quotidienne.

---

## 🔴 Priorité haute — Foundation & Infrastructure

### Configuration initiale

- [x] Créer le projet React Native avec Expo et TypeScript.
- [x] Configurer `expo-audio` pour la lecture en arrière-plan.
- [x] Définir le nom de l'application, son identifiant Android, son icône et son écran de lancement.
- [x] Installer les dépendances avec `npx expo install`.
- [ ] Vérifier l'organisation des routes et des écrans Expo Router.
- [ ] Vérifier la configuration native après toute modification d'un plugin ou d'une dépendance native.
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

### Tab-bar

- [x] Mettre en place la navigation par onglets (Playlist, Chansons, Favoris).
- [x] Appliquer la couleur primaire sur l'icône active.
- [x] Appliquer `tabBarInactiveTintColor` pour les icônes inactives.
- [x] Ajouter `borderTopLeftRadius` / `borderTopRightRadius` (bords arrondis).
- [x] Ajouter une ombre portée (`elevation` Android, `shadow*` iOS).
- [x] Ajuster `height` et `paddingBottom` pour centrer les icônes.
- [x] Connecter la couleur de fond au thème via `theme.tabBar`.
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

- [ ] Demander les autorisations Android nécessaires au bon moment.
- [ ] Parcourir les fichiers audio accessibles sur le téléphone.
- [ ] Afficher une liste de morceaux avec titre, artiste, album et durée.
- [ ] Gérer les métadonnées manquantes (`Artiste inconnu`, etc.).
- [ ] Gérer les fichiers déplacés, supprimés ou inaccessibles.
- [ ] Ajouter une action pour rescanner la bibliothèque.
- [ ] Tester avec MP3, M4A, WAV, FLAC.

### Pochettes

- [ ] Récupérer la pochette intégrée au fichier audio.
- [ ] Afficher la pochette sur l'écran lecteur.
- [ ] Afficher la pochette dans la notification et l'écran verrouillé.
- [ ] Prévoir une illustration de remplacement.
- [ ] Mettre en cache les pochettes.

### Lecteur audio complet

- [ ] Passer au morceau précédent / suivant.
- [ ] Modes répétition (désactivée / morceau / liste) et aléatoire.
- [ ] Gérer les appels, écouteurs débranchés et interruptions audio.
- [ ] Éviter les doubles lectures ou plusieurs instances du lecteur.
- [ ] Restaurer l'état du lecteur après navigation.

---

## 🟡 Priorité normale — Bibliothèque & Organisation

- [ ] Écran d'accueil avec les morceaux récemment écoutés.
- [ ] Onglet « Tous les morceaux ».
- [ ] Vues par artiste, album et dossier.
- [ ] Recherche par titre, artiste et album.
- [ ] Tri par titre, artiste, album, durée et date d'ajout.
- [ ] Favoris.
- [ ] Création, renommage et suppression de playlists.
- [ ] Ajout et retrait de morceaux dans une playlist.
- [ ] File d'attente de lecture + menu « Lire ensuite ».
- [ ] Historique d'écoute.
- [ ] Sauvegarde locale des playlists et préférences avec SQLite.

---

## 🟢 Priorité basse — Finition & Design

### Interface & UX

- [ ] Créer une identité visuelle cohérente pour LordWave.
- [ ] Concevoir les écrans : accueil, bibliothèque, lecteur, recherche, playlists, favoris, paramètres.
- [ ] Prévoir les états : chargement, liste vide, permission refusée, erreur de lecture.
- [ ] Assurer la lisibilité sur petits et grands écrans.
- [ ] Ajouter des animations sobres sans ralentir la lecture.
- [ ] Ajouter les libellés d'accessibilité aux boutons importants.
- [ ] Tester la navigation avec le bouton Retour Android.
- [ ] Ajouter un `headerRight` avec icône settings ou recherche dans les headers.
- [ ] Personnaliser la police du titre du header avec `headerTitleStyle.fontFamily`.
- [ ] Créer des états vides stylés (illustration + texte) pour la bibliothèque vide.
- [ ] Créer un hook `useThemedStyles(stylesheet)` _(fait)_ — l'utiliser dans tous les nouveaux composants.

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

- [ ] Configurer `eas.json` avec un profil `preview` qui produit un APK.
- [ ] Générer l'APK avec `eas build --platform android --profile preview`.
- [ ] Installer et tester l'APK sur appareil réel (sans serveur Metro).
- [ ] Vérifier le fonctionnement hors ligne, en arrière-plan et sur l'écran verrouillé.
- [ ] Garder le profil `production` en AAB pour la publication Play Store.

---

## 📋 Ordre de réalisation conseillé

1. [x] Prototype de lecture d'un fichier audio sélectionné manuellement.
2. [ ] Lecture en arrière-plan + notification + écran verrouillé sur appareil réel.
3. [ ] Bibliothèque locale complète et métadonnées.
4. [ ] Pochettes et illustrations de remplacement.
5. [ ] File de lecture, précédent/suivant, répétition et aléatoire.
6. [ ] Favoris, playlists, historique et SQLite.
7. [ ] Recherche, tri et navigation complète.
8. [ ] Finition visuelle et accessibilité.
9. [ ] Tests sur appareil réel et corrections.
10. [ ] APK autonome de test, puis préparation de la version de publication.

---

> **Règle de progression :** cocher une tâche uniquement après l'avoir testée. La lecture en arrière-plan et les commandes de l'écran verrouillé doivent être validées sur un appareil réel avant de consacrer trop de temps à la finition de l'interface.
