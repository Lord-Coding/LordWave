export type Track = {
  /** Hash stable basé sur l'URL, utilisé comme clé SQLite */
  id?: string;
  title: string;
  artist?: string;
  album?: string;
  /** Base64 data URI ou URI fichier — ne pas stocker en SQLite si base64 */
  artwork?: string;
  duration?: number;
  url?: string;
};
