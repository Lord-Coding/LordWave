import {
  Asset,
  AssetField,
  MediaType,
  PermissionStatus,
  Query,
  usePermissions,
} from "expo-media-library";
import { useEffect, useState } from "react";
import { Track } from "@/types/track";

export type UseMediaLibraryResult = {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionStatus | null;
  refresh: () => void;
};

/** Retire l'extension du nom de fichier (ex: "song.mp3" → "song") */
function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export function useMediaLibrary(): UseMediaLibraryResult {
  const [permissionResponse, requestPermission] = usePermissions({
    granularPermissions: ["audio"],
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const permissionStatus = permissionResponse?.status ?? null;

  useEffect(() => {
    if (permissionStatus === null) {
      // Pas encore de réponse — demander la permission
      requestPermission();
      return;
    }

    if (permissionStatus !== PermissionStatus.GRANTED) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchTracks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const assets: Asset[] = await new Query()
          .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
          .exe();

        const resolvedTracks = await Promise.all(
          assets.map(async (asset): Promise<Track> => {
            const [filename, duration, uri] = await Promise.all([
              asset.getFilename(),
              asset.getDuration(),
              asset.getUri(),
            ]);

            return {
              title: stripExtension(filename),
              url: uri,
              duration: duration ?? undefined,
              artist: undefined,
              album: undefined,
              artwork: undefined,
            };
          })
        );

        if (!cancelled) {
          setTracks(resolvedTracks);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Erreur lors du chargement."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      cancelled = true;
    };
  }, [permissionStatus, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { tracks, isLoading, error, permissionStatus, refresh };
}
