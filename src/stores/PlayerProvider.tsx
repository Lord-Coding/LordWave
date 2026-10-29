import { Track } from "@/types/track";
import {
    useAudioPlaylist,
    useAudioPlaylistStatus,
    type AudioPlaylistLoopMode,
} from "expo-audio";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { PlayerContext, type PlayerContextValue } from "./playerStore";

/** Fisher-Yates shuffle — retourne un nouveau tableau mélangé */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type PlayerProviderProps = {
  children: ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  /** Ordre original avant shuffle (pour restaurer si on désactive) */
  const [originalTracks, setOriginalTracks] = useState<Track[]>([]);

  /**
   * Refs miroir de tracks et originalTracks.
   * Utilisées dans toggleShuffle pour éviter les closures périmées :
   * setIsShuffled(prev => ...) est un updater asynchrone qui lit ces refs
   * pour obtenir les valeurs actuelles au moment du commit React.
   */
  const tracksRef = useRef<Track[]>([]);
  const originalTracksRef = useRef<Track[]>([]);

  const playlist = useAudioPlaylist({
    sources: [],
    loop: "none",
    updateInterval: 250,
  });

  const status = useAudioPlaylistStatus(playlist);

  const loadQueue = useCallback(
    (newTracks: Track[], startIndex = 0): void => {
      const orderedTracks = isShuffled ? shuffleArray(newTracks) : newTracks;
      setOriginalTracks(newTracks);
      setTracks(orderedTracks);
      // Synchroniser les refs immédiatement pour que toggleShuffle ait des valeurs fraîches
      originalTracksRef.current = newTracks;
      tracksRef.current = orderedTracks;

      playlist.clear();
      orderedTracks.forEach((t) => {
        if (t.url) playlist.add({ uri: t.url, name: t.title });
      });

      // Trouver l'index dans la queue ordonnée
      const targetTrack = newTracks[startIndex];
      const targetIndex = isShuffled
        ? orderedTracks.findIndex((t) => t.url === targetTrack?.url)
        : startIndex;

      playlist.skipTo(Math.max(0, targetIndex));
      playlist.play();
    },
    [playlist, isShuffled],
  );

  /**
   * Ref miroir de status pour les callbacks qui lisent currentIndex et playing.
   * Évite d'avoir status dans les dépendances de useCallback, ce qui causerait
   * une recréation du callback toutes les 250ms (fréquence de useAudioPlaylistStatus).
   */
  const statusRef = useRef(status);
  // Toujours synchroniser la ref avant que les callbacks ne l'utilisent
  statusRef.current = status;

  const toggleShuffle = useCallback((): void => {
    setIsShuffled((prev) => {
      const next = !prev;
      // Lire depuis les refs pour avoir les valeurs actuelles au moment du commit,
      // et non la closure capturée à la création du callback.
      const currentTracks = tracksRef.current;
      const currentOriginalTracks = originalTracksRef.current;
      const currentStatus = statusRef.current;
      const currentTrackUrl = currentTracks[currentStatus.currentIndex]?.url;

      if (next) {
        // Activer le shuffle : mélanger autour du morceau courant
        const rest = currentOriginalTracks.filter(
          (t) => t.url !== currentTrackUrl,
        );
        const shuffled = shuffleArray(rest);
        const currentTrack = currentTracks[currentStatus.currentIndex];
        const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;

        tracksRef.current = newQueue;
        setTracks(newQueue);
        playlist.clear();
        newQueue.forEach((t) => {
          if (t.url) playlist.add({ uri: t.url, name: t.title });
        });
        playlist.skipTo(0);
        if (currentStatus.playing) playlist.play();
      } else {
        // Désactiver le shuffle : revenir à l'ordre original
        const restoredIndex = currentTrackUrl
          ? currentOriginalTracks.findIndex((t) => t.url === currentTrackUrl)
          : currentStatus.currentIndex;

        tracksRef.current = currentOriginalTracks;
        setTracks(currentOriginalTracks);
        playlist.clear();
        currentOriginalTracks.forEach((t) => {
          if (t.url) playlist.add({ uri: t.url, name: t.title });
        });
        playlist.skipTo(Math.max(0, restoredIndex));
        if (currentStatus.playing) playlist.play();
      }

      return next;
    });
  }, [playlist, tracksRef, originalTracksRef]); // status retiré — lu via statusRef

  const setLoop = useCallback(
    (mode: AudioPlaylistLoopMode): void => {
      playlist.loop = mode;
    },
    [playlist],
  );

  const value: PlayerContextValue = {
    tracks,
    currentIndex: status.currentIndex,
    currentTime: status.currentTime,
    duration: status.duration,
    playing: status.playing,
    loop: status.loop,
    isLoaded: status.isLoaded,
    isBuffering: status.isBuffering,
    isShuffled,
    loadQueue,
    play: () => playlist.play(),
    pause: () => playlist.pause(),
    next: () => playlist.next(),
    previous: () => playlist.previous(),
    seekTo: (s) => playlist.seekTo(s),
    setLoop,
    skipTo: (i) => playlist.skipTo(i),
    toggleShuffle,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

// Ré-export pour un import unique
export { usePlayer } from "./playerStore";
