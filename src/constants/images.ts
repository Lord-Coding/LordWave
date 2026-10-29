// Images statiques — importées comme requires, compatibles web/serveur et Android.
// Ne pas appeler Image.resolveAssetSource() ici : cette API n'existe pas dans
// l'environnement Node.js utilisé par Expo Router lors de l'export serveur (EAS Build).

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const unknownArtistImage =
  require("@/assets/covers/unknown_artist.png") as number;
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const unknownTrackImage =
  require("@/assets/covers/unknown_track.png") as number;
