import {
    loadMetadataCache,
    saveMetadataToCache,
} from "@/database/repositories/trackMetadataCacheRepository";
import { Track } from "@/types/track";
import { getAudioMetadata } from "@missingcore/audio-metadata";
import { useEffect, useRef, useState } from "react";

const BATCH_SIZE = 10;

/** Formats supportés par @missingcore/audio-metadata */
const SUPPORTED_EXTENSIONS = new Set([".mp3", ".flac", ".mp4", ".m4a"]);

function isSupportedFormat(url: string): boolean {
  const lower = url.toLowerCase();
  return [...SUPPORTED_EXTENSIONS].some((ext) => lower.endsWith(ext));
}

/**
 * Enrichit progressivement une liste de tracks avec les métadonnées ID3.
 *
 * Stratégie cache :
 * 1. Au premier appel, charge le cache SQLite synchrone en O(1).
 * 2. Les tracks déjà en cache sont résolues immédiatement sans lecture fichier.
 * 3. Seules les tracks absentes du cache sont lues depuis le fichier audio.
 * 4. Les nouvelles métadonnées sont persistées en cache après lecture.
 *
 * Résultat : après le premier démarrage, les relancers sont quasi-instantanés.
 */
export function useTrackMetadata(tracks: Track[]): {
  enrichedTracks: Track[];
  isLoading: boolean;
} {
  const [enrichedTracks, setEnrichedTracks] = useState<Track[]>(tracks);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tracksRef = useRef<Track[] | null>(null);

  useEffect(() => {
    if (tracks === tracksRef.current) return;

    setEnrichedTracks(tracks);
    tracksRef.current = tracks;

    if (tracks.length === 0) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const enrich = async (): Promise<void> => {
      // Étape 1 — charger le cache synchrone en une seule requête
      const cache = loadMetadataCache();

      // Étape 2 — appliquer immédiatement les métadonnées en cache
      const result = tracks.map((track) => {
        if (!track.url) return track;
        const cached = cache.get(track.url);
        if (!cached) return track;
        return {
          ...track,
          title: cached.title ?? track.title,
          artist: cached.artist ?? track.artist,
          album: cached.album ?? track.album,
          artwork: cached.artwork ?? track.artwork,
        };
      });

      setEnrichedTracks([...result]);

      // Étape 3 — identifier les tracks absentes du cache ET de format supporté
      const uncachedIndexes = tracks
        .map((t, i) => ({ t, i }))
        .filter(
          ({ t }) => t.url && !cache.has(t.url) && isSupportedFormat(t.url),
        )
        .map(({ i }) => i);

      if (uncachedIndexes.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Étape 4 — lire et cacher par batches uniquement les tracks manquantes
      for (
        let batchStart = 0;
        batchStart < uncachedIndexes.length;
        batchStart += BATCH_SIZE
      ) {
        if (cancelled) break;

        const batchIndexes = uncachedIndexes.slice(
          batchStart,
          batchStart + BATCH_SIZE,
        );

        for (const idx of batchIndexes) {
          if (cancelled) break;
          const track = result[idx];
          if (!track.url) continue;

          try {
            // Décoder l'URI pour gérer les chemins avec caractères Unicode
            // (ex: fichiers japonais/chinois encodés en %XX dans le chemin)
            const decodedUrl = decodeURIComponent(track.url);
            const response = await getAudioMetadata(decodedUrl, [
              "name",
              "artist",
              "album",
              "artwork",
            ] as const);

            const meta = response.metadata;

            // Préfixer le base64 brut pour que expo-image puisse l'afficher.
            // @missingcore/audio-metadata retourne une string base64 sans préfixe data URI.
            const artworkUri = meta.artwork
              ? `data:image/jpeg;base64,${meta.artwork}`
              : track.artwork;

            const enriched: Track = {
              ...track,
              title: meta.name ?? track.title,
              artist: meta.artist ?? track.artist,
              album: meta.album ?? track.album,
              artwork: artworkUri,
            };

            result[idx] = enriched;

            // Persister en cache (sans await bloquant pour ne pas ralentir l'UI)
            saveMetadataToCache(track.url, enriched).catch(() => {
              // Erreur de cache non critique — la track est enrichie en mémoire
            });
          } catch {
            console.warn(
              `[useTrackMetadata] Impossible de lire les métadonnées : ${track.url}`,
            );
          }
        }

        if (!cancelled) {
          setEnrichedTracks([...result]);
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
