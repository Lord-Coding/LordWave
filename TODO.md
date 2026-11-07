# LordWave — feuille de route V1

## Objectif

Finaliser un lecteur musical local pour Android avec Expo et React Native. La V1 doit parcourir et lire la musique présente sur le téléphone, fonctionner hors ligne, prendre en charge les favoris et playlists et continuer la lecture en arrière-plan.

Pas de compte, backend, synchronisation cloud ni partage pour la V1. Privilégier les solutions locales et les dépendances gratuites.

## État actuel à garder en tête

- Les dépendances `expo-media-library`, `expo-audio` et `expo-sqlite` sont déjà dans `package.json` ; leur présence ne signifie pas que les parcours fonctionnels sont terminés.
- Les profils EAS `development`, `preview` (APK) et `production` (AAB) sont déjà définis dans `eas.json` ; les builds restent à valider sur téléphone.
- Les écrans Favoris et Playlists ainsi que leurs états vides existent, mais utilisent encore des données fictives ou des actions provisoires.
- `app.json` utilise actuellement le slug `LordWave` et l’identifiant Android `com.lordsama.lordwave`. Le document de référence propose `com.lordcoding.lordwave` : confirmer l’identifiant définitif avant une première publication, sans le changer à la légère.
- Les permissions Android et la configuration audio sont déjà amorcées dans `app.json` ; vérifier qu’elles sont nécessaires et suffisantes pour la V1.

## Ordre de traitement recommandé

### 1. Stabiliser le périmètre et la configuration

- [ ] Confirmer que la V1 cible Android et la musique locale hors ligne.
- [ ] Confirmer les formats audio pris en charge et le comportement attendu sans permission ou sans morceau.
- [ ] Confirmer l’identifiant Android définitif, le slug et le scheme de l’application.
- [ ] Vérifier nom, icônes, écran de démarrage, permissions, plugins Expo et profils EAS.
- [ ] Exécuter `npx expo-doctor` et `npx tsc --noEmit` ; corriger les problèmes bloquants.
- [ ] Confirmer la séparation routes, écrans, composants, services et données, puis centraliser types et styles communs au fil des changements.

### 2. Implémenter l’accès réel à la musique — prochaine grande étape

- [ ] Valider l’accès Android aux fichiers audio avec la version Expo du projet.
- [ ] Demander la permission au moment utile, expliquer sa raison et gérer refus, accès limité et retour depuis les réglages.
- [ ] Récupérer les morceaux accessibles et leurs URI locales ; afficher un état clair si la bibliothèque est vide.
- [ ] Récupérer titre, artiste, album et durée ; prévoir des valeurs de remplacement lorsque les métadonnées manquent.
- [ ] Filtrer les formats non pris en charge et éviter les doublons.
- [ ] Tester les dossiers Music, Download, Bluetooth et les dossiers accessibles des applications.
- [ ] Tester avec une grande bibliothèque ; prévoir l’actualisation, la détection des ajouts et suppressions et éviter les rescans complets inutiles.
- [ ] Définir la stratégie des pochettes locales : métadonnées disponibles, pochette par défaut, cache et absence de dépendance aux images Internet.

**Validation :** les vrais morceaux accessibles sur le téléphone apparaissent sans connexion Internet, y compris avec métadonnées incomplètes, refus de permission ou bibliothèque vide.

### 3. Construire et valider le moteur de lecture

- [ ] Centraliser la lecture audio dans un service et un état partagés.
- [ ] Lire un morceau depuis son URI locale ; gérer lecture, pause, reprise, suivant, précédent et fin de morceau.
- [ ] Exposer morceau courant, durée et progression ; permettre le déplacement dans le morceau et afficher le temps écoulé.
- [ ] Gérer les erreurs de lecture, fichiers illisibles ou disparus et changements rapides de morceau.
- [ ] Créer une file d’attente : ajout, suppression, réorganisation et passage au morceau suivant.
- [ ] Ajouter lecture aléatoire et répétition si elles sont retenues pour la V1.
- [ ] Tester les formats courants et les interruptions audio, appels et branchements/débranchements d’écouteurs.

**Validation :** un fichier local peut être lu, mis en pause, repris, parcouru et remplacé sans blocage.

### 4. Assurer l’arrière-plan et les contrôles Android

- [ ] Valider les capacités et la configuration Expo Audio pour la lecture Android en arrière-plan.
- [ ] Vérifier les exigences du service média Android, les permissions et la notification persistante.
- [ ] Afficher titre, artiste et pochette dans la notification quand disponibles.
- [ ] Synchroniser précédent, lecture/pause et suivant entre notification, écran verrouillé et moteur audio.
- [ ] Tester écran verrouillé, application en arrière-plan, retour à l’accueil, écouteurs et appareils Bluetooth.
- [ ] Tester séparément le retrait des applications récentes et les restrictions de batterie selon les appareils.

**Validation :** la lecture en arrière-plan et les commandes média fonctionnent dans les scénarios Android pris en charge. Le retrait des applications récentes peut varier selon Android et le fabricant.

### 5. Persister bibliothèque et données utilisateur avec SQLite

- [ ] Définir les tables, relations, migrations et transactions nécessaires pour morceaux indexés, favoris, playlists et morceaux d’une playlist.
- [ ] Prévoir la gestion des erreurs et des données corrompues ou indisponibles.
- [ ] Persister les favoris, synchroniser leur état dans les différentes vues et gérer les morceaux supprimés du téléphone.
- [ ] Permettre de créer, modifier et supprimer une playlist, avec confirmation si nécessaire.
- [ ] Ajouter et retirer des morceaux, gérer leur ordre et les éventuels doublons.
- [ ] Calculer le nombre de morceaux et la durée réelle ; gérer les URI qui ne sont plus valides.
- [ ] Enregistrer éventuellement le dernier morceau, la position et l’historique d’écoute si retenus pour la V1.

**Validation :** favoris et playlists sont conservés après fermeture et réouverture de l’application.

### 6. Connecter et terminer les écrans

- [ ] Remplacer progressivement les données de démonstration de `mockMusic.ts` par les données locales.
- [ ] Terminer Accueil et Bibliothèque : chansons, artistes, albums, dossiers, recherche, tri et états de chargement/erreur/vide.
- [ ] Connecter Favoris à SQLite ; afficher le vrai nombre, lire ou mélanger les favoris, trier et retirer un favori depuis cet écran.
- [ ] Connecter Playlists à SQLite ; finaliser création, tri, menu d’actions, état vide et page de détail (description, pochette, morceaux, lecture et mélange).
- [ ] Créer l’écran « En lecture » et le mini-lecteur ; synchroniser contrôles, progression, favoris, file d’attente et notification.
- [ ] Finaliser la recherche par titre, artiste et album, les catégories de résultats et les détails artiste/album nécessaires.
- [ ] Ajouter les paramètres utiles : actualisation de la bibliothèque, permissions, préférences de lecture, thème et informations « À propos » si retenus.
- [ ] Remplacer les toasts et `console.log` provisoires par les actions réelles, confirmations utiles et erreurs compréhensibles.

### 7. Tester, optimiser et préparer la distribution

- [ ] Vérifier l’accessibilité : libellés, zones tactiles, contraste, tailles de texte et lecteurs d’écran.
- [ ] Tester zones sûres, navigation/retour Android, tailles d’écran et tailles de police augmentées.
- [ ] Tester avec des centaines ou milliers de morceaux ; optimiser listes, chargement des pochettes, mémoire et batterie.
- [ ] Tester fichiers déplacés, renommés, supprimés, URI invalides, formats non pris en charge et stockage presque plein.
- [ ] Ajouter des tests automatisés pour lecture, persistance, favoris, playlists, recherche et erreurs importantes.
- [ ] Générer un APK autonome avec le profil EAS `preview` et le tester sur téléphone sans Metro ni Development Client.
- [ ] Tester permissions, bibliothèque, formats, lecture, favoris, playlists, arrière-plan, notifications, écran verrouillé, mode hors ligne, fermeture forcée et redémarrage du téléphone.
- [ ] Valider le profil `production` (AAB), la signature, le keystore, les icônes, captures d’écran, description et politique de confidentialité avant publication éventuelle.
- [ ] Retirer les logs inutiles, lancer lint, vérification TypeScript, Expo Doctor et build final.

## Par quelle priorité commencer ?

Après une courte vérification de configuration et la confirmation de l’identifiant Android, commence par **l’étape 2 : l’accès réel à la bibliothèque audio**. C’est le socle des écrans Accueil, Favoris et Playlists. Valide les permissions, la récupération des morceaux et les métadonnées sur un vrai téléphone avant d’investir dans SQLite ou la finition visuelle.

## Contraintes de développement et de validation

- Conserver le workflow EAS dans le cloud : ne pas utiliser `expo run:android` ni `eas build --local` dans ce projet.
- Le profil `development` sert au Development Client avec Metro ; le profil `preview` doit produire un APK autonome testable sans serveur de développement.
- La configuration seule ne prouve pas que la lecture en arrière-plan fonctionne : valider sur un véritable appareil Android.
- `expo-image` affiche les pochettes mais ne suffit pas à extraire celles intégrées aux fichiers audio.
- Remplacer progressivement les exemples de `mockMusic.ts` après validation des sources réelles et de leur modèle de données.

## Critères d’acceptation V1

- [ ] L’application Android s’installe de manière autonome et ne demande que les permissions nécessaires.
- [ ] L’utilisateur peut parcourir et lire sa musique locale hors ligne, avec gestion des bibliothèques vides, accès refusé et fichiers indisponibles.
- [ ] Lecture, pause, reprise, changement de morceau, file d’attente et contrôles Android sont fonctionnels dans les scénarios annoncés.
- [ ] Favoris et playlists peuvent être gérés et restent présents après redémarrage.
- [ ] Les écrans et commandes visibles sont reliés aux fonctionnalités réelles, sans placeholders majeurs.
- [ ] Les parcours essentiels ont été testés sur un vrai téléphone Android et le build de distribution a été vérifié.
