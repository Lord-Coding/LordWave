import { mockTracks } from "@/constants/mockMusic";
import { Track } from "@/constants/musicType";
import { createContext, useCallback, useMemo, useState } from "react";

type PlayerContextType = {
  currentTrack: Track | null;
  tail: Track[];
  isPlaying: boolean;
  currentTime: number;
  playTrack: (track: Track, tracks?: Track[]) => void;
  togglePlayback: () => void;
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
    const [currentTrack, setCurrentTrack] = useState<Track | null>(mockTracks[0] ?? null,)
    const [tail, setTail] = useState<Track[]>(mockTracks.slice(1))
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    const playTrack = useCallback((track: Track, list: Track[] = mockTracks) => {
        setCurrentTrack(track);
        setTail(list.filter((item) => item.id !== track.id));
        setCurrentTime(0);
        setIsPlaying(true);
    }, [])

    const togglePlayback = useCallback(() => {
        setIsPlaying((previous) => !previous);
    }, [])

    const nextTrack = useCallback(() => {
        setTail((currentTail) => {
            if (currentTail.length === 0) {
                setIsPlaying(false);
                return currentTail;
            }

            const [next, ...remaining] = currentTail;
        
            setCurrentTrack(next);
            setCurrentTime(0);
            setIsPlaying(true);

            return remaining;
        });
    }, [tail])

    const previousTrack = useCallback(() => {
        setCurrentTime(0);
    }, [])

    const seekTo = useCallback((time: number) => {
        setCurrentTime(Math.max(0, time));
    }, [])

    const removeFromTail = useCallback((trackId: string) => {
        setTail((current) => current.filter((track) => track.id !== trackId));
    }, [])

    const moveInTail = useCallback((from: number, to: number) => {
        setTail((current) => {
        if (
            from < 0 ||
            to < 0 || current.length ||
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
    }, [])

    const clearTail = useCallback(() => {
        setTail([]);
    }, [])

    const addToTail = useCallback((track: Track) => {
        setTail((current) => [...current, track]);
    }, [])

    const value = useMemo(
        () => ({
            currentTrack,
            tail,
            isPlaying,
            currentTime,
            playTrack,
            togglePlayback,
            nextTrack,
            previousTrack,
            seekTo,
            removeFromTail,
            moveInTail,
            clearTail,
            addToTail,
        }),
        [currentTrack, tail, isPlaying, currentTime, playTrack, togglePlayback, nextTrack, previousTrack, seekTo, removeFromTail, moveInTail, clearTail, addToTail],
    );

    return (
        <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
    );
}
