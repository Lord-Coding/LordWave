import { mockTracks } from "@/constants/mockMusic";
import { Track } from "@/constants/musicType";
import { createContext, useCallback, useMemo, useState } from "react";

type PlayerContextType = {
  currentTrack: Track | null;
  tail: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  favoriteTrackIds: string[];
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  playTrack: (track: Track, tracks?: Track[]) => void;
  togglePlayback: () => void;
  toggleFavorite: (trackId: string) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  removeFromTail: (trackId: string) => void;
  moveInTail: (from: number, to: number) => void;
  clearTail: () => void;
  addToTail: (track: Track) => void;
};

export const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: React.PropsWithChildren) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0] ?? null);
  const [tail, setTail] = useState<Track[]>(mockTracks.slice(1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState(() =>
    mockTracks.filter((track) => track.isFavorite).map((track) => track.id),
  );
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [history, setHistory] = useState<Track[]>([]);

  const playTrack = useCallback((track: Track, list: Track[] = mockTracks) => {
    setCurrentTrack(track);
    setTail(list.filter((item) => item.id !== track.id));
    setHistory([]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying((previous) => !previous);
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavoriteTrackIds((current) =>
      current.includes(trackId)
        ? current.filter((id) => id !== trackId)
        : [...current, trackId],
    );
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffleEnabled((enabled) => !enabled);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeatEnabled((enabled) => !enabled);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, nextVolume)));
  }, []);

  const nextTrack = useCallback(() => {
    setTail((currentTail) => {
      if (currentTail.length === 0) {
        setIsPlaying(false);
        return currentTail;
      }

      if (currentTrack) {
        setHistory((currentHistory) => [currentTrack, ...currentHistory]);
      }

      const nextIndex = isShuffleEnabled
        ? Math.floor(Math.random() * currentTail.length)
        : 0;
      const remaining = [...currentTail];
      const [next] = remaining.splice(nextIndex, 1);

      setCurrentTrack(next);
      setCurrentTime(0);
      setIsPlaying(true);

      return remaining;
    });
  }, [currentTrack, isShuffleEnabled]);

  const previousTrack = useCallback(() => {
    if (history.length === 0) return;

    const [previous, ...remainingHistory] = history;
    setHistory(remainingHistory);

    if (currentTrack) {
      setTail((currentTail) => [currentTrack, ...currentTail]);
    }

    setCurrentTrack(previous);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentTrack, history]);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(Math.max(0, time));
  }, []);

  const removeFromTail = useCallback((trackId: string) => {
    setTail((current) => current.filter((track) => track.id !== trackId));
  }, []);

  const moveInTail = useCallback((from: number, to: number) => {
    setTail((current) => {
      if (
        from < 0 ||
        to < 0 ||
        from >= current.length ||
        to >= current.length
      ) {
        return current;
      }

      const updated = [...current];
      const [moved] = updated.splice(from, 1);

      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const clearTail = useCallback(() => {
    setTail([]);
  }, []);

  const addToTail = useCallback((track: Track) => {
    setTail((current) => [...current, track]);
  }, []);

  const value = useMemo(
    () => ({
      currentTrack,
      tail,
      isPlaying,
      currentTime,
      volume,
      favoriteTrackIds,
      isShuffleEnabled,
      isRepeatEnabled,
      playTrack,
      togglePlayback,
      toggleFavorite,
      toggleShuffle,
      toggleRepeat,
      setVolume,
      nextTrack,
      previousTrack,
      seekTo,
      removeFromTail,
      moveInTail,
      clearTail,
      addToTail,
    }),
    [
      currentTrack,
      tail,
      isPlaying,
      currentTime,
      volume,
      favoriteTrackIds,
      isShuffleEnabled,
      isRepeatEnabled,
      playTrack,
      togglePlayback,
      toggleFavorite,
      toggleShuffle,
      toggleRepeat,
      setVolume,
      nextTrack,
      previousTrack,
      seekTo,
      removeFromTail,
      moveInTail,
      clearTail,
      addToTail,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
