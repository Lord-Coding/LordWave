import { type AudioPlaylistLoopMode } from 'expo-audio';
import { createContext, useContext } from 'react';
import { Track } from '@/types/track';

export type PlayerContextValue = {
  /** Queue complète de lecture */
  tracks: Track[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  /** La lecture est en cours */
  playing: boolean;
  loop: AudioPlaylistLoopMode;
  isLoaded: boolean;
  isBuffering: boolean;
  /** Indique si le mode aléatoire est actif */
  isShuffled: boolean;

  // Actions
  loadQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => Promise<void>;
  setLoop: (mode: AudioPlaylistLoopMode) => void;
  skipTo: (index: number) => void;
  toggleShuffle: () => void;
};

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer doit être utilisé dans un PlayerProvider');
  return ctx;
}
