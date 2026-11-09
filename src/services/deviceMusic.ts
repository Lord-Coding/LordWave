import { Asset, AssetField, MediaType, Query } from "expo-media-library";
import type { Track } from "@/constants/musicType";
import { cacheEmbeddedArtwork, readAudioMetadata } from "@/services/audioMetadata";

const PAGE_SIZE = 200;
const URI_WORKERS = 12;
const METADATA_WORKERS = 3;
const SUPPORTED_EXTENSIONS = new Set([
  "aac",
  "amr",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
  "weba",
]);

function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function titleFromFilename(filename: string) {
  const filenameWithoutExtension = filename.replace(/\.[^.]+$/, "").trim();
  const parts = filenameWithoutExtension.split(" - ").map((part) => part.trim());

  if (parts.length >= 3 && parts[0] && parts[1] && parts[parts.length - 1]) {
    return {
      artist: parts[0],
      album: parts.slice(1, -1).join(" - "),
      title: parts[parts.length - 1],
    };
  }

  if (parts.length === 2 && parts[0] && parts[1]) {
    return { artist: parts[0], album: "Album inconnu", title: parts[1] };
  }

  return {
    artist: "Artiste inconnu",
    album: "Album inconnu",
    title: filenameWithoutExtension || "Morceau sans titre",
  };
}

function nonEmpty(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function getTrackFolder(track: Track): string | null {
  if (!track.uri?.startsWith("file://")) return null;
  try {
    const path = decodeURIComponent(track.uri.slice("file://".length));
    const separator = path.lastIndexOf("/");
    return separator > 0 ? path.slice(0, separator) : null;
  } catch (error) {
    console.warn(`Impossible de déterminer le dossier de « ${track.title} ».`, error);
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await worker(items[index]);
      }
    }),
  );

  return results;
}

export async function getDeviceMusic(
  onPage?: (tracks: Track[]) => void,
): Promise<Track[]> {
  const tracks: Track[] = [];
  const seenIds = new Set<string>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .orderBy(AssetField.CREATION_TIME)
      .limit(PAGE_SIZE)
      .offset(offset)
      .exeForMetadata();

    if (assets.length === 0) break;

    const pageTracks = await mapWithConcurrency(
      assets,
      URI_WORKERS,
      async (asset): Promise<Track | null> => {
        try {
          const filename = asset.filename ?? "";
          const extension = filename.split(".").pop()?.toLowerCase();

          if (
            asset.mediaType !== MediaType.AUDIO ||
            !extension ||
            !SUPPORTED_EXTENSIONS.has(extension) ||
            seenIds.has(asset.id)
          ) {
            return null;
          }

          const uri = await new Asset(asset.id).getUri();
          if (!uri) return null;
          const fallback = titleFromFilename(filename);
          seenIds.add(asset.id);
          const durationSeconds = asset.duration ?? 0;
          return {
            id: asset.id,
            title: fallback.title,
            artist: fallback.artist,
            album: fallback.album,
            cover: "",
            duration: formatDuration(durationSeconds),
            durationSeconds,
            uri,
          };
        } catch (error) {
          console.warn(`Impossible de récupérer le fichier audio ${asset.id}.`, error);
          return null;
        }
      },
    );

    const validPageTracks = pageTracks.filter(
      (track): track is Track => track !== null,
    );
    tracks.push(...validPageTracks);
    onPage?.(validPageTracks);
    if (assets.length < PAGE_SIZE) break;
  }

  return tracks;
}

export async function enrichDeviceMusic(
  tracks: Track[],
  onTrackUpdated: (track: Track) => void,
): Promise<void> {
  await mapWithConcurrency(tracks, METADATA_WORKERS, async (track) => {
    if (!track.uri) return;

    const [metadata, cover] = await Promise.all([
      readAudioMetadata(track.uri).catch((error: unknown) => {
        console.warn(`Impossible de lire les métadonnées audio ${track.title}.`, error);
        return null;
      }),
      cacheEmbeddedArtwork(track.id, track.uri).catch((error: unknown) => {
        console.warn(`Impossible de récupérer la pochette de « ${track.title} ».`, error);
        return null;
      }),
    ]);

    onTrackUpdated({
      ...track,
      title: nonEmpty(metadata?.title, track.title),
      artist: nonEmpty(metadata?.artist, track.artist),
      album: nonEmpty(metadata?.album, track.album),
      ...(cover ? { cover } : {}),
      ...(metadata?.duration && metadata.duration > 0
        ? {
            durationSeconds: metadata.duration / 1000,
            duration: formatDuration(metadata.duration / 1000),
          }
        : {}),
    });
  });
}
