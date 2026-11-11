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
- [x] Demander la permission au moment utile, expliquer sa raison et gérer refus, accès limité et retour depuis les réglages.
- [x] Récupérer les morceaux accessibles et leurs URI locales ; afficher un état clair si la bibliothèque est vide.
- [x] Récupérer les tags titre, artiste et album ; utiliser le nom de fichier et la durée MediaLibrary disponibles, avec des valeurs de remplacement lorsque les métadonnées manquent.
- [x] Filtrer les formats non pris en charge et éviter les doublons.
- [ ] Tester les dossiers Music, Download, Bluetooth et les dossiers accessibles des applications.
- [ ] Tester avec une grande bibliothèque ; prévoir l’actualisation, la détection des ajouts et suppressions et éviter les rescans complets inutiles.
- [x] Extraire et mettre en cache la pochette intégrée quand elle existe ; conserver le visuel local de remplacement sans réseau lorsqu’elle manque.

**Travail réalisé :** l’écran Bibliothèque demande l’autorisation audio Android à la première utilisation, explique son usage, propose les réglages après un refus définitif et actualise la permission au retour dans l’application. Les assets sont récupérés par pages de 200 via les métadonnées légères de MediaLibrary, filtrés par extension et dédupliqués par identifiant ; les résultats apparaissent sans attendre l’extraction des tags et pochettes. `react-native-audio-metadata` enrichit ensuite titre, artiste, album, durée et pochette intégrée en arrière-plan, avec des valeurs de remplacement si nécessaire. Les URI `file://` permettent aussi de grouper les fichiers par dossier ; les URI `content://` sans chemin exploitable restent dans les autres catégories. Les données et pochettes disponibles sont utilisables hors ligne. L’accès et les formats restent à valider sur téléphone.

**Validation :** les vrais morceaux accessibles sur le téléphone apparaissent sans connexion Internet, y compris avec métadonnées incomplètes, refus de permission ou bibliothèque vide.

### 3. Construire et valider le moteur de lecture

- [x] Centraliser la lecture audio dans un service et un état partagés.
- [x] Lire un morceau depuis son URI locale ; gérer lecture, pause, reprise, suivant, précédent et fin de morceau.
- [x] Exposer morceau courant, durée et progression ; permettre le déplacement dans le morceau et afficher le temps écoulé.
- [x] Gérer les erreurs natives de lecture Android et les fichiers locaux déjà disparus ; protéger les métadonnées et pochettes asynchrones contre les changements rapides de morceau.
- [x] Créer une file d’attente : ajout, suppression, réorganisation et passage au morceau suivant.
- [x] Ajouter lecture aléatoire et répétition si elles sont retenues pour la V1.
- [ ] Tester les formats courants et les interruptions audio, appels et branchements/débranchements d’écouteurs.

**Travail réalisé :** le contexte partagé utilise Expo Audio pour charger et lire l’URI du morceau choisi, reflète le temps et la durée du lecteur natif, applique le volume et gère la pause, la reprise, la recherche temporelle, la file, précédent/suivant, le mélange et la répétition à la fin. Les fichiers locaux disparus sont refusés avant le démarrage ; les erreurs de lecture Android sont relayées à l’interface avec le titre et une indication pour passer au morceau suivant. Les résultats d’extraction de pochette obsolètes sont écartés quand la sélection change. Les erreurs de décodage iOS restent à valider sur appareil.

**Validation :** un fichier local peut être lu, mis en pause, repris, parcouru et remplacé sans blocage.

### 4. Assurer l’arrière-plan et les contrôles Android

- [x] Valider les capacités et la configuration Expo Audio pour la lecture Android en arrière-plan.
- [x] Vérifier les exigences du service média Android, déclarer les permissions et demander l’autorisation des notifications sur Android.
- [x] Afficher titre, artiste et pochette extraite localement dans la notification Android quand disponibles.
- [x] Synchroniser précédent, lecture/pause et suivant entre notification, écran verrouillé et moteur audio.
- [x] Tester écran verrouillé, application en arrière-plan, retour à l’accueil, écouteurs et appareils Bluetooth.
- [ ] Tester séparément le retrait des applications récentes et les restrictions de batterie selon les appareils.

**Travail réalisé :** le lecteur partagé utilise `useAudioPlaylist`, dont le service média Android relaie les commandes précédent/suivant au moteur. La file, le morceau courant, la progression, la répétition et les commandes de notification sont synchronisés avec l’index de la playlist native. Le mode arrière-plan et le service média sont configurés dans Expo ; l’application demande aussi la permission de notifications Android. Les métadonnées texte et les pochettes disponibles sont transmises. La pochette intégrée est extraite à la demande, mise en cache localement et associée à la notification ; sans pochette, l’interface utilise le visuel de remplacement intégré à l’application. Le rendu de notification doit encore être validé sur appareil Android.

**Validation :** la configuration et le raccordement sont implémentés, mais le fonctionnement réel de la notification persistante, de l’écran verrouillé et des interruptions reste à vérifier avec un build EAS sur un appareil Android. Le retrait des applications récentes peut varier selon Android et le fabricant.

### 5. Persister bibliothèque et données utilisateur avec SQLite ✅

### 6. Connecter et terminer les écrans ✅

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

## Prochaine priorité

Les étapes 5 et 6 sont implémentées. Priorité suivante : valider sur un appareil Android la persistance après redémarrage, la lecture et les parcours de bibliothèque/favoris/playlists ; puis poursuivre les tests de performance et de distribution de l’étape 7.

## Contraintes de développement et de validation

- Conserver le workflow EAS dans le cloud : ne pas utiliser `expo run:android` ni `eas build --local` dans ce projet.
- Le profil `development` sert au Development Client avec Metro ; le profil `preview` doit produire un APK autonome testable sans serveur de développement.
- La configuration seule ne prouve pas que la lecture en arrière-plan fonctionne : valider sur un véritable appareil Android.
- `expo-image` affiche les pochettes mais ne suffit pas à extraire celles intégrées aux fichiers audio.
- Les données fictives de `mockMusic.ts` ne sont plus utilisées ; la bibliothèque et les données utilisateur s’appuient sur les sources locales et SQLite.

## Critères d’acceptation V1

- [ ] L’application Android s’installe de manière autonome et ne demande que les permissions nécessaires.
- [ ] L’utilisateur peut parcourir et lire sa musique locale hors ligne, avec gestion des bibliothèques vides, accès refusé et fichiers indisponibles.
- [ ] Lecture, pause, reprise, changement de morceau, file d’attente et contrôles Android sont fonctionnels dans les scénarios annoncés.
- [ ] Favoris et playlists peuvent être gérés et restent présents après redémarrage.
- [ ] Les écrans et commandes visibles sont reliés aux fonctionnalités réelles, sans placeholders majeurs.
- [ ] Les parcours essentiels ont été testés sur un vrai téléphone Android et le build de distribution a été vérifié.
