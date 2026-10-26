# TODO — LordWave

> **Objectif du projet :** créer un lecteur musical Android élégant, rapide et fiable qui lit les fichiers audio présents sur le téléphone, fonctionne hors ligne et ne dépend pas d'un serveur pour l'utilisation quotidienne.

## 1. Objectifs et critères de réussite

- [ ] Lire les fichiers audio locaux du téléphone.
- [ ] Permettre de lancer, mettre en pause, reprendre et contrôler la lecture.
- [ ] Continuer la lecture lorsque l'utilisateur quitte l'écran du lecteur ou met l'application en arrière-plan.
- [ ] Maintenir une notification multimédia avec le titre et les commandes de lecture.
- [ ] Afficher les commandes multimédias sur l'écran de verrouillage lorsque Android le permet.
- [ ] Continuer la lecture après avoir retiré l'application du volet des applications récentes (swipe pour fermer), dans la mesure où Android et le fabricant autorisent le service multimédia à continuer.
- [ ] Ne pas interrompre la lecture simplement parce que l'écran s'éteint.
- [ ] Fonctionner sans connexion Internet pour les fonctions musicales locales.
- [ ] Ne pas afficher de publicités intrusives.
- [ ] Produire un APK autonome installable qui ne nécessite ni Expo Go, ni écran de développement Expo, ni serveur Metro en cours d'exécution.

## 2. Configuration initiale et qualité du projet

- [ ] Créer le projet React Native avec Expo et TypeScript.
- [ ] Vérifier l'organisation des routes et des écrans Expo Router.
- [ ] Définir le nom de l'application, son identifiant Android, son icône et son écran de lancement.
- [ ] Installer les dépendances avec `npx expo install` afin de respecter les versions compatibles avec le SDK Expo du projet.
- [ ] Configurer `expo-audio` pour la lecture en arrière-plan.
- [ ] Vérifier la configuration native après toute modification d'un plugin ou d'une dépendance native.
- [ ] Utiliser Git pour conserver l'historique des modifications.
- [ ] Lancer régulièrement `npx expo-doctor` et corriger les erreurs importantes.

## 3. Accès aux musiques locales

- [ ] Demander les autorisations Android nécessaires au bon moment, avec une explication claire.
- [ ] Parcourir les fichiers audio accessibles sur le téléphone.
- [ ] Afficher une liste de morceaux avec titre, artiste, album et durée lorsqu'ils sont disponibles.
- [ ] Gérer les métadonnées manquantes avec des valeurs de remplacement comme « Artiste inconnu ».
- [ ] Gérer les fichiers déplacés, supprimés, inaccessibles ou non pris en charge.
- [ ] Ajouter une action pour actualiser ou rescanner la bibliothèque.
- [ ] Éviter de recopier inutilement tous les morceaux dans le stockage privé de l'application.
- [ ] Tester avec des fichiers MP3, M4A/AAC, WAV, FLAC et d'autres formats courants pris en charge par l'appareil.
- [ ] Tester les fichiers provenant du stockage interne, d'une carte SD et du dossier Téléchargements si Android les rend accessibles.

## 4. Pochette / cover de chaque musique

- [ ] Récupérer la pochette intégrée au fichier audio lorsqu'elle est disponible.
- [ ] Utiliser les métadonnées du morceau ou de l'album pour rechercher la pochette dans la bibliothèque multimédia locale si cette information est exposée par Android.
- [ ] Afficher la pochette sur l'écran du lecteur.
- [ ] Afficher la même pochette dans la notification multimédia et sur l'écran de verrouillage lorsque l'API Android et le lecteur le permettent.
- [ ] Prévoir une illustration de remplacement lorsque le morceau ne possède pas de pochette.
- [ ] Prévoir une illustration de remplacement si l'image est corrompue, introuvable ou trop lente à charger.
- [ ] Mettre en cache les pochettes afin d'éviter de les recalculer ou recharger à chaque ouverture.
- [ ] Redimensionner les images pour limiter la mémoire consommée.
- [ ] Vérifier le comportement avec des pochettes carrées, des images volumineuses et des albums sans pochette.

**Point technique :** la récupération de la pochette intégrée aux tags audio n'est pas forcément fournie directement par les API Expo de base pour chaque format. Vérifier la méthode retenue et, si nécessaire, utiliser un module natif compatible avec Expo ou une extraction de métadonnées adaptée. Ne pas supposer qu'une simple URI de fichier audio est aussi une URI d'image.

## 5. Lecteur audio et commandes

- [ ] Lire et mettre en pause un morceau.
- [ ] Passer au morceau précédent et au suivant.
- [ ] Afficher la progression et la durée.
- [ ] Permettre de déplacer le curseur de lecture.
- [ ] Ajouter un retour/avance rapide de 10 secondes.
- [ ] Régler le volume sans perturber le volume système.
- [ ] Gérer la fin d'un morceau et le passage au suivant.
- [ ] Ajouter les modes répétition : désactivée, morceau, liste.
- [ ] Ajouter le mode aléatoire.
- [ ] Gérer les appels, les écouteurs débranchés et les interruptions audio.
- [ ] Éviter les doubles lectures ou plusieurs instances du lecteur.
- [ ] Restaurer l'état utile du lecteur après une navigation entre écrans.
- [ ] Tester les fichiers audio longs et les changements rapides de morceau.

## 6. Lecture en arrière-plan, notification et écran verrouillé

- [ ] Configurer le plugin `expo-audio` avec `enableBackgroundPlayback: true`.
- [ ] Configurer la session audio pour autoriser la lecture en arrière-plan.
- [ ] Activer les commandes d'écran verrouillé avec les métadonnées du morceau.
- [ ] Fournir au lecteur les informations de titre, artiste, album et pochette.
- [ ] Afficher une notification multimédia persistante pendant la lecture, avec lecture/pause et navigation si prises en charge.
- [ ] Vérifier que la notification se met à jour lors du changement de morceau.
- [ ] Vérifier que les commandes de l'écran verrouillé contrôlent réellement la lecture.
- [ ] Tester l'écran éteint pendant plusieurs minutes.
- [ ] Tester le bouton Accueil, le changement d'application et le verrouillage du téléphone.
- [ ] Tester le retrait de LordWave du volet des applications récentes.
- [ ] Tester le comportement après un swipe de fermeture sur plusieurs marques Android.
- [ ] Vérifier le comportement après l'arrêt forcé depuis les paramètres : Android arrête normalement l'application dans ce cas.
- [ ] Vérifier le comportement après redémarrage du téléphone et décider si la reprise automatique est souhaitée.
- [ ] Ne pas promettre une continuité après un arrêt forcé, un redémarrage ou une restriction agressive de batterie : le système peut interrompre le service.

**Critère de validation :** démarrer un morceau, verrouiller le téléphone, attendre au moins 5 minutes, utiliser pause/reprise depuis l'écran verrouillé, puis retirer l'application des applications récentes. La lecture et les commandes doivent rester fonctionnelles tant que le système ne force pas l'arrêt de l'application.

## 7. Bibliothèque et organisation

- [ ] Écran d'accueil avec les morceaux récemment écoutés.
- [ ] Onglet « Tous les morceaux ».
- [ ] Vues par artiste, album et dossier lorsque les données sont disponibles.
- [ ] Recherche par titre, artiste et album.
- [ ] Tri par titre, artiste, album, durée et date d'ajout.
- [ ] Favoris.
- [ ] Création, renommage et suppression de playlists.
- [ ] Ajout et retrait de morceaux dans une playlist.
- [ ] File d'attente de lecture.
- [ ] Historique d'écoute.
- [ ] Menu « Lire ensuite ».
- [ ] Gestion des doublons si cela apporte une vraie valeur.
- [ ] Sauvegarde locale des playlists et préférences.

## 8. Stockage local et fonctionnement hors ligne

- [ ] Utiliser SQLite pour les données structurées : favoris, playlists, historique et préférences.
- [ ] Conserver seulement les références/URI et métadonnées nécessaires, pas de copie audio superflue.
- [ ] Prévoir une stratégie lorsque le chemin d'un morceau devient invalide.
- [ ] Tester l'application en mode avion.
- [ ] Vérifier que les écrans principaux et les commandes n'ont pas besoin d'une API distante.
- [ ] Éviter toute dépendance à un serveur pour démarrer l'application installée.
- [ ] Ne demander aucune permission réseau si elle n'est pas utilisée par une fonctionnalité réelle.

## 9. Interface et expérience utilisateur

- [ ] Créer une identité visuelle cohérente pour LordWave.
- [ ] Concevoir les écrans : accueil, bibliothèque, lecteur, recherche, playlists, favoris et paramètres.
- [ ] Prévoir les états de chargement, liste vide, permission refusée et erreur de lecture.
- [ ] Assurer la lisibilité sur petits et grands écrans.
- [ ] Prévoir les thèmes clair/sombre ou choisir un thème par défaut cohérent.
- [ ] Ajouter des animations sobres, sans ralentir la lecture.
- [ ] Ajouter les libellés d'accessibilité aux boutons importants.
- [ ] Tester la navigation avec le bouton Retour Android.
- [ ] Vérifier que le lecteur ne masque pas les commandes système et respecte les zones de sécurité de l'écran.

## 10. Tests et robustesse

- [ ] Tester sur un vrai téléphone Android, pas uniquement dans un simulateur.
- [ ] Tester avec permission accordée, refusée et révoquée.
- [ ] Tester avec une bibliothèque vide et une bibliothèque contenant beaucoup de morceaux.
- [ ] Tester les morceaux sans titre, sans artiste et sans pochette.
- [ ] Tester les formats audio non pris en charge et afficher une erreur compréhensible.
- [ ] Tester la notification, l'écran verrouillé, les écouteurs Bluetooth et les écouteurs filaires.
- [ ] Tester les appels et les interruptions audio.
- [ ] Tester le passage en mode avion.
- [ ] Tester le redémarrage de l'application et la persistance des playlists/favoris.
- [ ] Tester un APK de preview propre, sans serveur de développement.
- [ ] Vérifier les journaux et corriger les plantages avant publication.

## 11. Génération et installation de l'APK autonome

- [ ] Configurer `eas.json` avec un profil `preview` qui produit un APK.
- [ ] Vérifier le nom de l'application et l'identifiant Android dans `app.json` / `app.config.*`.
- [ ] Vérifier que `expo-audio` est configuré pour la lecture en arrière-plan.
- [ ] Installer les dépendances et exécuter `npx expo-doctor`.
- [ ] Générer l'APK avec `eas build --platform android --profile preview`.
- [ ] Attendre la fin du build et télécharger le fichier `.apk` depuis la page de build.
- [ ] Installer l'APK sur le téléphone Android.
- [ ] Couper le serveur de développement et fermer le terminal.
- [ ] Ouvrir LordWave, sélectionner un morceau et vérifier que la lecture fonctionne toujours.
- [ ] Vérifier le fonctionnement hors ligne, en arrière-plan et sur l'écran verrouillé.
- [ ] Garder le profil `production` en AAB pour une future publication Play Store, sauf besoin explicite d'un APK de production.

## 12. Ordre de réalisation conseillé

1. [ ] Prototype de lecture d'un fichier audio sélectionné manuellement.
2. [ ] Lecture en arrière-plan + notification + écran verrouillé.
3. [ ] Bibliothèque locale complète et métadonnées.
4. [ ] Pochettes et illustrations de remplacement.
5. [ ] File de lecture, précédent/suivant, répétition et aléatoire.
6. [ ] Favoris, playlists, historique et SQLite.
7. [ ] Recherche, tri et navigation complète.
8. [ ] Finition visuelle et accessibilité.
9. [ ] Tests sur appareil réel et corrections.
10. [ ] APK autonome de test, puis préparation de la version de publication.

---
**Règle de progression :** cocher une tâche uniquement après l'avoir testée. La lecture en arrière-plan et les commandes de l'écran verrouillé doivent être validées sur un appareil réel avant de consacrer trop de temps à la finition de l'interface.
