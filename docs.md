# docs — Guide de création, développement et génération APK de LordWave

Ce document est un guide pratique pour créer et développer **LordWave**, un lecteur musical local Android basé sur **React Native + Expo**. Les commandes sont écrites pour **Windows CMD ou PowerShell**.

## 0. Ce que tu veux obtenir

Il faut distinguer trois choses :

- **Expo Go** : application générique de test. Ce n'est pas la version finale de LordWave.
- **Development build** : APK de développement qui contient les composants natifs nécessaires, mais charge généralement le code JavaScript depuis un serveur de développement sur ton ordinateur.
- **APK autonome de preview/production** : APK qui contient l'application compilée et son bundle JavaScript. Une fois installé, il peut être utilisé sans Expo Go et sans lancer `npx expo start`.

Pour installer et utiliser LordWave au quotidien, le profil `preview` configuré en APK est le plus simple. Pour publier sur Google Play, on utilise généralement un fichier `.aab`.

## 1. Prérequis

Installe les outils suivants :

- Node.js LTS, qui fournit `node` et `npm`.
- Visual Studio Code pour éditer les fichiers.
- Un compte Expo pour EAS Build : https://expo.dev/
- Un téléphone Android et un câble USB ou une connexion Wi-Fi pour les tests.

Vérifie les installations dans CMD :

```bat
node -v
npm -v
```

**Utilité :** confirme que Node.js et npm sont installés. Si une commande n'est pas reconnue, réinstalle Node.js LTS puis rouvre le terminal.

## 2. Créer le projet

Place-toi dans le dossier où tu veux créer le projet :

```bat
cd %USERPROFILE%\Desktop
```

**Utilité :** va sur le Bureau Windows.

Crée le projet Expo :

```bat
npx create-expo-app@latest LordWave
```

**Utilité :** crée un projet React Native configuré pour Expo, généralement avec TypeScript et une structure de navigation. Si l'outil propose des choix, suis le modèle recommandé pour le projet et vérifie ensuite la structure des fichiers.

Entre dans le projet :

```bat
cd LordWave
```

Ouvre-le dans VS Code :

```bat
code .
```

**Utilité :** ouvre le dossier courant dans Visual Studio Code. Si `code` n'est pas reconnu, ouvre VS Code manuellement puis choisis **Fichier > Ouvrir le dossier**.

## 3. Installer les dépendances

Lance les commandes depuis la racine du projet, là où se trouve `package.json`.

```bat
npx expo install expo-audio expo-media-library expo-file-system expo-document-picker
```

- `expo-audio` : lecture audio et commandes multimédias.
- `expo-media-library` : accès à la bibliothèque multimédia Android selon les permissions et les API exposées.
- `expo-file-system` : opérations sur les fichiers accessibles à l'application.
- `expo-document-picker` : permet à l'utilisateur de choisir un fichier audio avec le sélecteur de documents Android.

```bat
npx expo install expo-sqlite
```

**Utilité :** ajoute SQLite pour stocker localement les favoris, playlists, historique et préférences.

```bat
npx expo install expo-image expo-linear-gradient expo-haptics expo-font expo-blur react-native-svg
```

**Utilité :** installe des outils d'interface facultatifs : affichage d'images, dégradés, retour haptique, polices, flou et graphiques vectoriels.

```bat
npm install lucide-react-native zustand
```

**Utilité :**
- `lucide-react-native` fournit des icônes.
- `zustand` peut gérer l'état partagé du lecteur et de l'interface. Il est facultatif : ne le garde que si tu en as besoin.

Pour les builds de développement :

```bat
npx expo install expo-dev-client
```

**Utilité :** ajoute le client de développement Expo. Il sert au développement, mais n'est pas nécessaire pour utiliser un APK autonome de preview.

Vérifie ensuite les dépendances :

```bat
npx expo install --check
npx expo-doctor
```

**Utilité :** la première commande vérifie les versions des paquets Expo ; la seconde détecte des problèmes de configuration fréquents. Corrige les erreurs signalées avant de générer un APK.

> Utilise `npx expo install` pour les bibliothèques Expo afin que les versions correspondent au SDK du projet. Les versions exactes évoluent ; évite de copier des numéros de version anciens sans vérifier la compatibilité.

## 4. Où écrire l'interface ?

Les projets Expo Router peuvent avoir des structures légèrement différentes. Regarde le dossier `app` :

- `app/(tabs)/index.tsx` est souvent l'écran d'accueil d'un projet avec onglets.
- `app/index.tsx` peut être l'écran d'entrée dans une structure plus simple.
- `app/_layout.tsx` configure la navigation générale.

Remplace le bon fichier de route pour afficher ton écran. Si l'application continue d'afficher l'écran de démarrage Expo, vérifie que tu as modifié la route réellement ouverte par l'application.

## 5. Configurer la lecture en arrière-plan

Ouvre `app.json`. Dans `expo.plugins`, ajoute la configuration du plugin `expo-audio` en conservant les autres plugins déjà présents :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "enableBackgroundPlayback": true
        }
      ]
    ]
  }
}
```

**Important :** ce bloc illustre la configuration à intégrer, pas nécessairement le contenu complet de ton `app.json`. Ne supprime pas les autres paramètres du fichier. Si `expo-audio` figure déjà dans `plugins`, modifie son entrée au lieu de la dupliquer.

Cette option configure les éléments natifs nécessaires à la lecture en arrière-plan et au service multimédia Android. Le code doit aussi configurer la session audio et activer les commandes de l'écran verrouillé avec les métadonnées du morceau.

Après un changement de plugin natif ou l'ajout d'une dépendance native, il faut reconstruire l'APK : un simple rechargement JavaScript ne suffit pas.

## 6. Tester pendant le développement

Dans un terminal ouvert à la racine de `LordWave` :

```bat
npx expo start --dev-client
```

**Utilité :** démarre le serveur Metro et affiche un QR code de développement. Le téléphone et l'ordinateur doivent généralement être sur le même réseau Wi-Fi.

Ouvre ensuite **l'application de développement LordWave** déjà installée sur le téléphone et connecte-la au serveur. Le QR code affiché par cette commande est différent du QR code de la page EAS utilisé pour télécharger l'APK.

Si la connexion locale échoue :

```bat
npx expo start --dev-client --tunnel
```

**Utilité :** utilise un tunnel réseau. Il peut être plus lent, mais aide sur certains réseaux qui bloquent la connexion locale.

Arrêter le serveur avec `Ctrl + C` ferme le serveur de développement. C'est normal pour le développement. Un APK autonome ne doit pas dépendre de ce serveur pour démarrer.

## 7. Configurer EAS Build

Connecte-toi à Expo :

```bat
npx eas-cli login
```

Si la commande n'est pas reconnue, utilise :

```bat
npx eas-cli --help
```

Puis configure EAS Build :

```bat
npx eas-cli build:configure
```

**Utilité :** associe le projet au service de build Expo et crée ou configure `eas.json`. Suis les questions affichées. Tu peux aussi installer le CLI globalement, mais l'utilisation de `npx eas-cli` évite de dépendre d'une installation globale.

Si le projet n'est pas encore associé à un projet EAS, la commande peut te demander de le créer ou de le lier à ton compte.

## 8. Configurer les profils dans `eas.json`

Dans le fichier `eas.json` à la racine, vérifie que tu as des profils équivalents à ceux-ci. Tu peux remplacer le contenu si le fichier est simple, mais conserve toute configuration spécifique utile déjà présente.

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### À quoi servent ces profils ?

- `development` : APK de développement avec le launcher du dev client. Il faut généralement démarrer le serveur Metro pour charger le code.
- `preview` : APK installable pour tester l'application comme un utilisateur, sans serveur de développement. C'est le profil à utiliser pour ton test autonome.
- `production` : AAB adapté à Google Play. Si tu veux exceptionnellement un APK autonome de production à installer directement, change temporairement `android.buildType` en `apk` pour ce profil, puis reconstruis.

Un `.aab` n'est pas conçu pour être installé directement en appuyant dessus sur le téléphone. Pour une installation directe, demande un `.apk`.

## 9. Générer un APK autonome installable

### Étape A — Vérifier le projet

À la racine de `LordWave` :

```bat
npx expo-doctor
```

Corrige les problèmes bloquants. Vérifie également que le nom de l'application, l'identifiant Android et le plugin de lecture en arrière-plan sont corrects.

### Étape B — Lancer le build

```bat
npx eas-cli build --platform android --profile preview
```

**Utilité :** envoie le projet au service EAS Build, qui compile l'application Android et produit un APK avec le code de l'application intégré.

Lors des premières utilisations, suis les questions affichées à l'écran. Le service peut te demander un identifiant d'application Android, par exemple `com.tonnom.lordwave`, et la configuration de la clé de signature. Choisis un identifiant unique en minuscules et conserve un accès sûr aux identifiants de signature.

### Étape C — Télécharger le fichier

- Attends que le build soit terminé.
- Ouvre le lien EAS indiqué dans le terminal.
- Dans la page du build, ouvre la section de l'artefact et télécharge le fichier `.apk`.
- Sur ton téléphone Android, ouvre le lien de téléchargement ou transfère l'APK sur le téléphone.
- Autorise l'installation depuis cette source si Android le demande, puis installe l'application.

Le QR code de la page EAS sert à accéder au téléchargement de l'APK. Il ne lance pas le serveur JavaScript de développement.

### Étape D — Vérifier que l'application est autonome

1. Ferme le serveur de développement sur le PC avec `Ctrl + C`.
2. Désactive temporairement le Wi-Fi ou passe le téléphone en mode avion.
3. Ouvre LordWave depuis l'icône installée.
4. Sélectionne un fichier audio local et démarre la lecture.
5. Verrouille l'écran et teste les commandes multimédias.
6. Retire l'application du volet des applications récentes et vérifie la lecture.
7. Vérifie que les favoris et playlists restent enregistrés après fermeture et réouverture.

Si l'application demande de se connecter à un serveur de développement, tu as probablement installé le profil `development` au lieu du profil `preview`, ou bien le build n'a pas été généré avec le profil attendu.

## 10. Quand faut-il reconstruire l'APK ?

| Modification | Nouveau build natif nécessaire ? |
|---|---|
| Modifier un texte, une couleur ou la disposition dans un fichier `.tsx` | Non pour le développement ; oui pour inclure les changements dans un nouvel APK distribué |
| Ajouter ou supprimer une bibliothèque JavaScript pure | Généralement non, mais vérifie la compatibilité |
| Ajouter une bibliothèque native | Oui |
| Modifier `app.json` pour `expo-audio` ou un autre plugin natif | Oui |
| Modifier les permissions Android | Oui |
| Modifier l'icône, le nom ou des réglages natifs | Généralement oui |

L'APK installé ne se modifie pas automatiquement quand tu édites le code source. Pour intégrer tes changements dans une nouvelle version autonome, génère un nouveau build `preview`.

## 11. Commandes utiles

```bat
npx expo start --dev-client
```
Démarre le serveur de développement.

```bat
npx expo start --dev-client --tunnel
```
Démarre le serveur avec une connexion tunnel en cas de problème réseau.

```bat
npx expo-doctor
```
Contrôle la configuration du projet.

```bat
npx expo install --check
```
Vérifie les versions des paquets Expo.

```bat
npx eas-cli build --platform android --profile development
```
Construit un APK de développement ; il est destiné au travail avec le serveur de développement.

```bat
npx eas-cli build --platform android --profile preview
```
Construit l'APK autonome de test, installable sur un téléphone sans serveur de développement.

```bat
npx eas-cli build --platform android --profile production
```
Construit le paquet défini par le profil `production` ; avec la configuration ci-dessus, ce sera un AAB pour Google Play.

```bat
npx expo --help
npx eas-cli --help
```
Affiche l'aide et les options disponibles.

## 12. Dépannage

### L'application affiche le launcher Expo au lieu de l'interface LordWave
C'est attendu avec un APK de développement si aucun serveur Metro n'est connecté. Lance `npx expo start --dev-client`, puis connecte le client au QR code affiché dans le terminal.

### Le QR code ouvre une page web EAS
C'est le QR code d'installation. Télécharge l'APK depuis cette page, installe-le, puis lance l'application. Pour ouvrir le projet en développement, utilise le QR code affiché par `npx expo start --dev-client`.

### La lecture s'arrête quand l'écran se verrouille
Vérifie le plugin `expo-audio`, la session audio, `setActiveForLockScreen(true, ...)` et que tu as reconstruit l'APK après la modification native. Teste sur un appareil réel. Certains fabricants imposent des restrictions de batterie.

### La lecture s'arrête après le swipe dans les applications récentes
Le comportement peut dépendre de la version Android et du fabricant. Vérifie que la lecture en arrière-plan est configurée, que les commandes multimédias sont activées et que tu testes un APK récent. L'arrêt forcé depuis les paramètres peut toujours interrompre l'application.

### L'APK ne s'installe pas
Vérifie que tu as téléchargé un fichier `.apk` et non un `.aab`. Si une ancienne version portant le même identifiant est installée avec une signature différente, Android peut refuser la mise à jour ; désinstalle l'ancienne version si nécessaire (cela peut supprimer ses données locales).

### Le build échoue
Lis les premières erreurs utiles dans les logs EAS. Lance `npx expo-doctor`, vérifie les versions et confirme que `app.json` et `eas.json` sont des JSON valides.

## 13. Références officielles

- [Créer un projet Expo](https://docs.expo.dev/get-started/create-a-project/)
- [Expo CLI et serveur de développement](https://docs.expo.dev/more/expo-cli/)
- [Créer un build de développement Android](https://docs.expo.dev/tutorial/eas/android-development-build/)
- [Configurer EAS Build et `eas.json`](https://docs.expo.dev/build/eas-json/)
- [Construire un APK installable Android](https://docs.expo.dev/build-reference/apk/)
- [Documentation `expo-audio` (lecture en arrière-plan)](https://docs.expo.dev/versions/latest/sdk/audio/)

---

**Objectif final :** pour tester LordWave comme une application normale, utiliser `npx eas-cli build --platform android --profile preview`, installer l'APK produit et vérifier qu'il fonctionne après avoir arrêté le serveur de développement.
