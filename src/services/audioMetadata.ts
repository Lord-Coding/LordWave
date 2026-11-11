import { Directory, File, Paths } from "expo-file-system";

type AudioMetadataModule = typeof import("react-native-audio-metadata");

type AudioMetadata = {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
};

let audioMetadataModulePromise: Promise<AudioMetadataModule | null> | null = null;
const artworkRequests = new Map<string, Promise<string | null>>();
const folderArtworkRequests = new Map<string, Promise<string | null>>();
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const preferredArtworkNames = ["cover", "folder", "front", "albumart", "artwork", "album"];

function getAudioMetadataModule() {
  if (!audioMetadataModulePromise) {
    audioMetadataModulePromise = import("react-native-audio-metadata").catch((error: unknown) => {
      console.warn("Le lecteur natif de métadonnées audio n’est pas disponible.", error);
      return null;
    });
  }

  return audioMetadataModulePromise;
}

function nativeFilePath(uri: string) {
  if (!uri.startsWith("file://")) return null;

  try {
    return decodeURIComponent(uri.slice("file://".length));
  } catch (error) {
    console.warn("Impossible de décoder l’URI du fichier audio.", error);
    return null;
  }
}

export async function readAudioMetadata(uri: string): Promise<AudioMetadata | null> {
  const filePath = nativeFilePath(uri);
  if (!filePath) return null;

  const metadataModule = await getAudioMetadataModule();
  if (!metadataModule) return null;

  return metadataModule.getMetadata(filePath);
}

async function createCachedEmbeddedArtwork(
  trackId: string,
  uri: string,
): Promise<string | null> {
  const filePath = nativeFilePath(uri);
  if (!filePath) return null;

  const safeTrackId = trackId.replace(/[^a-zA-Z0-9_-]/g, "_");
  let uriHash = 2166136261;
  for (let index = 0; index < uri.length; index++) {
    uriHash = Math.imul(uriHash ^ uri.charCodeAt(index), 16777619);
  }
  const artworkDirectory = new Directory(Paths.cache, "album-art");
  const artworkFile = new File(
    artworkDirectory,
    `${safeTrackId}_${(uriHash >>> 0).toString(16)}.jpg`,
  );
  if (artworkFile.exists) return artworkFile.uri;

  const metadataModule = await getAudioMetadataModule();
  if (!metadataModule) return null;

  const dataUri = await metadataModule.getArtwork(filePath);
  if (!dataUri) return null;

  const base64 = /^data:image\/[a-zA-Z0-9.+-]+;base64,([\s\S]+)$/.exec(dataUri)?.[1];
  if (!base64) {
    throw new Error("Le lecteur natif a retourné une pochette dans un format inattendu.");
  }

  artworkDirectory.create({ intermediates: true, idempotent: true });
  artworkFile.create({ intermediates: true, overwrite: true });
  try {
    await artworkFile.write(base64, { encoding: "base64" });
  } catch (error) {
    if (artworkFile.exists) artworkFile.delete();
    throw error;
  }
  return artworkFile.uri;
}

export function cacheEmbeddedArtwork(trackId: string, uri: string): Promise<string | null> {
  const key = `${trackId}:${uri}`;
  const existingRequest = artworkRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = createCachedEmbeddedArtwork(trackId, uri).finally(() => {
    artworkRequests.delete(key);
  });
  artworkRequests.set(key, request);
  return request;
}

async function findFolderArtwork(folder: Directory): Promise<string | null> {
  const imageFiles = folder.list().filter(
    (entry): entry is File =>
      entry instanceof File && imageExtensions.has(entry.extension.toLowerCase()),
  );
  if (imageFiles.length === 0) return null;

  const rankedFiles = imageFiles
    .map((file) => {
      const baseName = file.name
        .slice(0, -file.extension.length)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const priority = preferredArtworkNames.findIndex(
        (name) => baseName === name || baseName.startsWith(name),
      );
      return { file, priority };
    })
    .filter(({ priority }) => priority >= 0)
    .sort((left, right) => left.priority - right.priority);

  if (rankedFiles.length > 0) return rankedFiles[0].file.uri;
  return imageFiles.length === 1 ? imageFiles[0].uri : null;
}

export function findNearbyArtwork(uri: string): Promise<string | null> {
  const filePath = nativeFilePath(uri);
  if (!filePath) return Promise.resolve(null);

  const folder = new File(uri).parentDirectory;
  const existingRequest = folderArtworkRequests.get(folder.uri);
  if (existingRequest) return existingRequest;

  const request = findFolderArtwork(folder);
  folderArtworkRequests.set(folder.uri, request);
  return request.catch((error: unknown) => {
    folderArtworkRequests.delete(folder.uri);
    throw error;
  });
}

export function clearNearbyArtworkCache() {
  folderArtworkRequests.clear();
}
