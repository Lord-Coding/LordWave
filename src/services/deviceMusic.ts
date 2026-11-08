import { AssetField, MediaType, Query } from "expo-media-library";
import type { Track } from "@/constants/musicType";
import { readAudioMetadata } from "@/services/audioMetadata";

const PAGE_SIZE = 100;
const METADATA_WORKERS = 4;
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

export async function getDeviceMusic(): Promise<Track[]> {
  const tracks: Track[] = [];
  const seenIds = new Set<string>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .orderBy(AssetField.CREATION_TIME)
      .limit(PAGE_SIZE)
      .offset(offset)
      .exe();

    if (assets.length === 0) break;

    const pageTracks = await mapWithConcurrency(
      assets,
      METADATA_WORKERS,
      async (asset): Promise<Track | null> => {
        try {
          const info = await asset.getInfo();
          const extension = info.filename.split(".").pop()?.toLowerCase();

          if (
            info.mediaType !== MediaType.AUDIO ||
            !extension ||
            !SUPPORTED_EXTENSIONS.has(extension) ||
            seenIds.has(info.id)
          ) {
            return null;
          }

          const uri = info.uri || (await asset.getUri());
          if (!uri) return null;
          const fallback = titleFromFilename(info.filename);
          let metadata = null;
          try {
            metadata = await readAudioMetadata(uri);
          } catch (error) {
            console.warn(`Impossible de lire les métadonnées audio ${info.filename}.`, error);
          }

          seenIds.add(info.id);
          const durationSeconds =
            metadata?.duration && metadata.duration > 0
              ? metadata.duration / 1000
              : info.duration ?? 0;
          return {
            id: info.id,
            title: nonEmpty(metadata?.title, fallback.title),
            artist: nonEmpty(metadata?.artist, fallback.artist),
            album: nonEmpty(metadata?.album, fallback.album),
            cover: "",
            duration: formatDuration(durationSeconds),
            durationSeconds,
            uri,
          };
        } catch (error) {
          console.warn(`Impossible de lire le fichier audio ${asset.id}.`, error);
          return null;
        }
      },
    );

    tracks.push(...pageTracks.filter((track): track is Track => track !== null));
    if (assets.length < PAGE_SIZE) break;
  }

  return tracks;
}
