import {
  useAudioPlaylist,
  useAudioPlaylistStatus,
  type AudioPlaylistLoopMode,
} from 'expo-audio';
import { useCallback, useState, type ReactNode } from 'react';
import { Track } from '@/types/track';
import { PlayerContext, type PlayerContextValue } from './playerStore';

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

  const playlist = useAudioPlaylist({
    sources: [],
    loop: 'none',
    updateInterval: 250,
  });

  const status = useAudioPlaylistStatus(playlist);

  const loadQueue = useCallback(
    (newTracks: Track[], startIndex = 0): void => {
      const orderedTracks = isShuffled ? shuffleArray(newTracks) : newTracks;
      setOriginalTracks(newTracks);
      setTracks(orderedTracks);

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

  const toggleShuffle = useCallback((): void => {
    setIsShuffled((prev) => {
      const next = !prev;
      const currentTrackUrl = tracks[status.currentIndex]?.url;

      if (next) {
        // Activer le shuffle : mélanger autour du morceau courant
        const rest = originalTracks.filter((t) => t.url !== currentTrackUrl);
        const shuffled = shuffleArray(rest);
        const currentTrack = tracks[status.currentIndex];
        const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;

        setTracks(newQueue);
        playlist.clear();
        newQueue.forEach((t) => {
          if (t.url) playlist.add({ uri: t.url, name: t.title });
        });
        playlist.skipTo(0);
        if (status.playing) playlist.play();
      } else {
        // Désactiver le shuffle : revenir à l'ordre original
        const restoredIndex = currentTrackUrl
          ? originalTracks.findIndex((t) => t.url === currentTrackUrl)
          : status.currentIndex;

        setTracks(originalTracks);
        playlist.clear();
        originalTracks.forEach((t) => {
          if (t.url) playlist.add({ uri: t.url, name: t.title });
        });
        playlist.skipTo(Math.max(0, restoredIndex));
        if (status.playing) playlist.play();
      }

      return next;
    });
  }, [playlist, tracks, originalTracks, status]);

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
export { usePlayer } from './playerStore';
