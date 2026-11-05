# TODO — Feuille de route LordWave

Cette feuille de route décrit les prochaines étapes pour transformer l’interface actuelle en lecteur de musique local utilisable. Les priorités sont ordonnées par dépendance et par valeur pour une première version.

## P0 — Indispensable pour une première version fonctionnelle

- [ ] **Définir le périmètre produit** : confirmer que LordWave lit la musique stockée sur l’appareil, les plateformes cibles, les formats pris en charge et le comportement attendu sans connexion Internet.
- [ ] **Remplacer les données fictives** : définir une source unique pour les morceaux, albums et artistes, puis retirer progressivement les tableaux de démonstration de `src/constants/mockMusic.ts`.
- [ ] **Accéder à la bibliothèque locale** : demander les autorisations nécessaires au bon moment, récupérer les fichiers audio et leurs métadonnées, et traiter proprement les refus, bibliothèques vides et erreurs de lecture.
- [ ] **Construire un modèle de bibliothèque fiable** : gérer les identifiants, titres, artistes, albums, durées, pochettes et chemins/URI locaux, y compris les métadonnées manquantes ou incohérentes.
- [ ] **Implémenter la lecture audio** : lire, mettre en pause, reprendre, passer au morceau suivant/précédent et déplacer la position de lecture ; gérer la fin d’un morceau et les erreurs de décodage ou de fichier inaccessible.
- [ ] **Créer un état de lecture partagé** : exposer le morceau courant, la file d’attente, la position, la durée et les commandes afin que bibliothèque, mini-lecteur et écran de lecture restent synchronisés.
- [ ] **Ajouter un mini-lecteur et un écran de lecture** : rendre les commandes principales accessibles pendant la navigation et afficher la pochette, les informations du morceau, la progression et les commandes.
- [ ] **Fiabiliser la lecture en arrière-plan** : configurer et tester les contrôles de notification/écran verrouillé, les interruptions audio, le branchement/débranchement d’un casque et le retour de l’application au premier plan.
- [ ] **Persister les données utilisateur** : sauvegarder les favoris et les playlists localement, restaurer l’état au redémarrage et définir un comportement cohérent si une base locale est indisponible ou corrompue.

## P1 — Compléter les fonctionnalités principales

- [ ] **Rendre les favoris opérationnels** : l’écran Favoris et son état vide sont déjà en place dans `src/features/FavoritesScreen.tsx`, mais la liste est encore filtrée depuis `mockTracks`. La relier à la source de données réelle, permettre d’ajouter/retirer un favori depuis un morceau et refléter les changements immédiatement.
- [ ] **Créer et gérer les playlists** : création, renommage, suppression, ajout/retrait de morceaux, ordre personnalisé et lancement de la lecture.
- [ ] **Terminer la bibliothèque** : relier les catégories Chansons, Artistes, Albums et Dossiers aux données réelles ; ouvrir les détails associés et lancer la lecture depuis chaque vue.
- [ ] **Implémenter la recherche** : rechercher parmi les morceaux, artistes et albums, avec résultats vides, effacement de la requête et comportement clavier adapté au mobile.
- [ ] **Ajouter le tri et les filtres** : rendre fonctionnelle l’action « Trier » de l’écran Favoris (actuellement un `console.log`) ainsi que les autres actions de tri affichées ; proposer des critères prévisibles, par exemple titre, artiste, album ou date d’ajout.
- [ ] **Gérer la file d’attente** : ajouter un morceau ou un album à la file, afficher et réordonner les prochains titres, retirer des éléments et distinguer lecture immédiate / lecture suivante.
- [ ] **Permettre l’actualisation de la bibliothèque** : rescanner ou synchroniser les médias après ajout/suppression, sans perdre les favoris et playlists des éléments toujours présents.
- [ ] **Ajouter les états d’interface manquants** : chargement, erreur récupérable, absence de permission, aucune musique trouvée et absence de connexion si une fonctionnalité en dépend.

## P2 — Qualité d’usage et robustesse

- [ ] **Harmoniser les interactions** : remplacer dans l’écran Favoris les toasts provisoires de sélection, d’options et de lecture aléatoire, ainsi que l’action « Trier » actuellement en `console.log`, par les actions réelles et des retours d’erreur compréhensibles.
- [ ] **Soigner l’accessibilité** : libellés des boutons/icônes, zones tactiles adaptées, ordre de lecture, contraste, tailles de texte et prise en charge des lecteurs d’écran.
- [ ] **Vérifier l’adaptation mobile** : contrôler les petits et grands écrans, zones sûres, barre d’onglets, clavier, gestes de retour et orientations prises en charge.
- [ ] **Améliorer les performances** : optimiser les listes pour les grandes bibliothèques, limiter les rendus inutiles, charger les pochettes efficacement et éviter les traitements lourds sur le thread d’interface.
- [ ] **Renforcer le mode hors ligne** : s’assurer que l’index, les favoris, playlists et pochettes restent exploitables sans réseau ; afficher une solution de repli lorsque les métadonnées sont absentes.
- [ ] **Valider les thèmes clair et sombre** : vérifier les couleurs, états pressés, composants système et changements de thème sur iOS et Android.
- [ ] **Ajouter les réglages utiles** : préférences de lecture pertinentes (lecture aléatoire, répétition, reprise éventuelle) et options de gestion/actualisation de la bibliothèque.

## P3 — Tests, préparation et publication

- [ ] **Mettre en place des tests automatisés** : couvrir les commandes et transitions de lecture, la persistance des favoris/playlists, la recherche/tri et les états d’erreur importants.
- [ ] **Définir une recette manuelle** : tester sur appareils et versions iOS/Android cibles les autorisations, les formats audio, l’arrière-plan, les interruptions, les écouteurs et la reprise après fermeture.
- [ ] **Exécuter les contrôles du projet** : lint, vérification TypeScript, diagnostic Expo et builds de développement/préproduction ; corriger les régressions avant publication.
- [ ] **Vérifier la configuration de publication** : nom, icônes, écran de lancement, identifiants, permissions réellement nécessaires, profils EAS et informations de confidentialité.
- [ ] **Mettre à jour la documentation** : remplacer le README de démarrage Expo par les instructions d’installation, d’exécution, de test, de build et les limites connues de LordWave.
- [ ] **Préparer une version de préproduction** : générer les builds de test, vérifier l’installation et la mise à jour, puis recueillir les retours avant la première version publique.

## Critères de fin du MVP

- La bibliothèque reflète les fichiers audio accessibles sur l’appareil, avec des états explicites si l’accès est refusé ou si aucun morceau n’est trouvé.
- Un morceau peut être lancé, contrôlé depuis l’application et repris après navigation ; les comportements en arrière-plan annoncés sont validés sur appareils.
- Les favoris et playlists survivent au redémarrage de l’application.
- La recherche, les catégories de bibliothèque et les commandes visibles ne sont pas de simples placeholders.
- Les parcours principaux fonctionnent sur les plateformes annoncées et passent les vérifications de lint et de types.
