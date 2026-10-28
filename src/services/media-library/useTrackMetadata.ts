import { Track } from "@/types/track";
import { getAudioMetadata } from "@missingcore/audio-metadata";
import { useEffect, useRef, useState } from "react";

const BATCH_SIZE = 10;

/**
 * Enrichit progressivement une liste de tracks avec les métadonnées ID3.
 * Traite par batches de 10 pour éviter de saturer la mémoire.
 */
export function useTrackMetadata(tracks: Track[]): {
  enrichedTracks: Track[];
  isLoading: boolean;
} {
  const [enrichedTracks, setEnrichedTracks] = useState<Track[]>(tracks);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Utiliser une ref pour éviter les re-runs infinis si le parent re-render.
  // Initialisée avec null pour que le premier appel passe toujours le guard.
  const tracksRef = useRef<Track[] | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Guard : si c'est exactement le même tableau (même référence), ne pas relancer.
    // Cela évite les re-runs infinis quand le parent re-render sans changer les tracks.
    if (tracks === tracksRef.current) return;

    // Initialiser immédiatement avec les tracks bruts
    setEnrichedTracks(tracks);
    tracksRef.current = tracks;

    if (tracks.length === 0) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const enrich = async (): Promise<void> => {
      const result = [...tracks];

      for (
        let batchStart = 0;
        batchStart < result.length;
        batchStart += BATCH_SIZE
      ) {
        if (cancelled) break;

        const batchEnd = Math.min(batchStart + BATCH_SIZE, result.length);

        for (let i = batchStart; i < batchEnd; i++) {
          if (cancelled) break;
          const track = result[i];
          if (!track.url) continue;

          try {
            const response = await getAudioMetadata(track.url, [
              "name",
              "artist",
              "album",
              "artwork",
            ] as const);

            const meta = response.metadata;
            result[i] = {
              ...track,
              title: meta.name ?? track.title,
              artist: meta.artist ?? track.artist,
              album: meta.album ?? track.album,
              artwork: meta.artwork ?? track.artwork,
            };
          } catch {
            // Conserver la track originale sans métadonnées enrichies
            console.warn(
              `[useTrackMetadata] Impossible de lire les métadonnées pour : ${track.url}`,
            );
          }
        }

        // Mise à jour progressive après chaque batch
        if (!cancelled) {
          const snapshot = [...result];
          setEnrichedTracks(snapshot);
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    enrich();

    return () => {
      cancelled = true;
    };
  }, [tracks]);

  return { enrichedTracks, isLoading };
}
