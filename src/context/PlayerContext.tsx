import { Playlist, Track } from "@/constants/musicType";
import {
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  useAudioPlaylist,
  useAudioPlaylistStatus,
  type AudioPlaylistStatus,
} from "expo-audio";
import { File } from "expo-file-system";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Platform } from "react-native";
import { cacheEmbeddedArtwork } from "@/services/audioMetadata";
import {
  createPlaylist as createStoredPlaylist,
  deletePlaylist as deleteStoredPlaylist,
  initializeLocalDatabase,
  loadLocalMusic,
  saveLibraryTracks,
  saveTrack,
  setPlaylistTrackOrder,
  setTrackFavorite,
  updatePlaylist as updateStoredPlaylist,
} from "@/services/localDatabase";

type PlayerContextType = {
  currentTrack: Track | null;
  libraryTracks: Track[];
  tail: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  favoriteTrackIds: string[];
  playlists: Playlist[];
  isStorageReady: boolean;
  storageError: string | null;
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  playbackError: string | null;
  setLibraryTracks: Dispatch<SetStateAction<Track[]>>;
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
  persistLibraryTracks: (tracks: Track[]) => Promise<void>;
  createPlaylist: (title: string, description?: string) => Promise<string>;
  updatePlaylist: (id: string, title: string, description: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  setPlaylistTrackOrder: (id: string, trackIds: string[]) => Promise<void>;
};

export const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: React.PropsWithChildren) {
  const player = useAudioPlaylist({ updateInterval: 250 });
  const playerStatus = useAudioPlaylistStatus(player);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tail, setTail] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [audioModeReady, setAudioModeReady] = useState(false);
  const playlistTracksRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(0);
  const currentTrackIdRef = useRef<string | null>(null);
  const notificationPermissionRequestRef = useRef<Promise<void> | null>(null);

  const reloadStoredPlaylists = useCallback(async () => {
    const stored = await loadLocalMusic();
    setPlaylists(stored.playlists);
  }, []);

  const reportStorageError = useCallback((action: string, error: unknown) => {
    console.error(action, error);
    setStorageError("Les données locales sont illisibles ou indisponibles. Elles n’ont pas été effacées.");
  }, []);

  const persistTrack = useCallback((track: Track) => {
    void saveTrack(track).catch((error: unknown) => {
      reportStorageError("Impossible d’enregistrer les métadonnées du morceau.", error);
    });
  }, [reportStorageError]);

  useEffect(() => {
    let active = true;
    initializeLocalDatabase()
      .then(loadLocalMusic)
      .then((stored) => {
        if (!active) return;
        setLibraryTracks(stored.tracks);
        setFavoriteTrackIds(stored.favoriteTrackIds);
        setPlaylists(stored.playlists);
        setIsStorageReady(true);
      })
      .catch((error: unknown) => {
        reportStorageError("Impossible d’initialiser les données locales.", error);
      });

    return () => {
      active = false;
    };
  }, [reportStorageError]);

  useEffect(() => {
    let active = true;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    })
      .then(() => {
        if (active) setAudioModeReady(true);
      })
      .catch((error: unknown) => {
        console.error("Impossible de configurer la session audio.", error);
        if (active) {
          setPlaybackError("La lecture audio n’a pas pu être initialisée.");
        }
      });

    return () => {
      active = false;
      player.clearLockScreenControls();
    };
  }, [player]);

  useEffect(() => {
    player.volume = volume;
  }, [player, volume]);

  useEffect(() => {
    const statusSubscription = player.addListener("playlistStatusUpdate", (status) => {
      const error = (status as AudioPlaylistStatus & {
        error?: string | { message?: string; code?: number };
      }).error;
      const failedTrack = playlistTracksRef.current[status.currentIndex];
      if (
        !error ||
        !failedTrack ||
        status.currentIndex !== currentIndexRef.current ||
        failedTrack.id !== currentTrackIdRef.current
      ) {
        return;
      }

      const nativeMessage = typeof error === "string" ? error : error.message;
      console.error(`Impossible de lire « ${failedTrack.title} ».`, error);
      setPlaybackError(
        nativeMessage
          ? `La lecture de « ${failedTrack.title} » a échoué. Vérifiez que le fichier est toujours accessible.`
          : `« ${failedTrack.title} » est indisponible ou illisible. Vous pouvez passer au morceau suivant.`,
      );
    });
    const trackChangedSubscription = player.addListener("trackChanged", ({ currentIndex }) => {
      currentIndexRef.current = currentIndex;
      currentTrackIdRef.current = playlistTracksRef.current[currentIndex]?.id ?? null;
    });

    return () => {
      statusSubscription.remove();
      trackChangedSubscription.remove();
    };
  }, [player]);

  useEffect(() => {
    player.loop = isRepeatEnabled ? "single" : "none";
  }, [isRepeatEnabled, player]);

  useEffect(() => {
    const index = playerStatus.currentIndex;
    const tracks = playlistTracksRef.current;
    if (index >= 0 && index < tracks.length && index !== currentIndexRef.current) {
      currentIndexRef.current = index;
      const nextTrack = tracks[index];
      setCurrentTrack(nextTrack);
      setTail(tracks.slice(index + 1));
      setCurrentTime(0);
      setDuration(nextTrack.durationSeconds ?? 0);
      setPlaybackError(null);
    }

    if (playerStatus.isLoaded) {
      setCurrentTime(playerStatus.currentTime);
      if (playerStatus.duration > 0) setDuration(playerStatus.duration);
    }
  }, [
    playerStatus.currentIndex,
    playerStatus.currentTime,
    playerStatus.duration,
    playerStatus.isLoaded,
  ]);

  const requestNotificationPermission = useCallback(() => {
    if (Platform.OS !== "android") return Promise.resolve();

    if (!notificationPermissionRequestRef.current) {
      notificationPermissionRequestRef.current = requestNotificationPermissionsAsync()
        .then((permission) => {
          if (!permission.granted) {
            console.warn(
              "La permission de notification est refusée ; la lecture continue sans notification média.",
            );
          }
        })
        .catch((error: unknown) => {
          console.error("Impossible de demander la permission de notification Android.", error);
        });
    }

    return notificationPermissionRequestRef.current;
  }, []);

  useEffect(() => {
    if (!currentTrack?.uri || !audioModeReady) {
      player.clearLockScreenControls();
      return;
    }

    let active = true;
    requestNotificationPermission().then(() => {
      if (!active) return;
      player.setActiveForLockScreen(
        true,
        {
          title: currentTrack.title,
          artist: currentTrack.artist,
          albumTitle: currentTrack.album,
          ...(currentTrack.cover.startsWith("http://") ||
          currentTrack.cover.startsWith("https://") ||
          currentTrack.cover.startsWith("file://")
            ? { artworkUrl: currentTrack.cover }
            : {}),
        },
        { showNextTrack: true, showPreviousTrack: true },
      );
    });

    return () => {
      active = false;
    };
  }, [audioModeReady, currentTrack, player, requestNotificationPermission]);

  useEffect(() => {
    if (!currentTrack?.uri || currentTrack.cover || playbackError) return;

    let active = true;
    const trackId = currentTrack.id;
    cacheEmbeddedArtwork(trackId, currentTrack.uri)
      .then((cover) => {
        if (!active || !cover) return;

        const updateCover = (track: Track) =>
          track.id === trackId ? { ...track, cover } : track;
        playlistTracksRef.current = playlistTracksRef.current.map(updateCover);
        setCurrentTrack((track) =>
          track?.id === trackId ? { ...track, cover } : track,
        );
        setLibraryTracks((tracks) => tracks.map(updateCover));
        setTail((tracks) => tracks.map(updateCover));
        persistTrack({ ...currentTrack, cover });
      })
      .catch((error: unknown) => {
        console.warn(`Impossible d’extraire la pochette de « ${currentTrack.title} ».`, error);
      });

    return () => {
      active = false;
    };
  }, [currentTrack, persistTrack, playbackError]);

  const playTrack = useCallback((track: Track, list?: Track[]) => {
    try {
      player.clear();
      currentTrackIdRef.current = track.id;
      if (!track.uri) {
        playlistTracksRef.current = [];
        currentIndexRef.current = 0;
        setCurrentTrack(track);
        setTail([]);
        setCurrentTime(0);
        setDuration(0);
        setPlaybackError("Ce morceau de démonstration n’est pas un fichier local lisible.");
        return;
      }

      if (track.uri.startsWith("file://") && !new File(track.uri).exists) {
        playlistTracksRef.current = [];
        currentIndexRef.current = 0;
        setCurrentTrack(track);
        setTail([]);
        setCurrentTime(0);
        setDuration(0);
        setPlaybackError(`« ${track.title} » n’est plus disponible sur l’appareil.`);
        return;
      }

      const upcomingTracks = (list ?? libraryTracks).filter(
        (item) => item.id !== track.id && item.uri,
      );
      if (isShuffleEnabled) {
        for (let index = upcomingTracks.length - 1; index > 0; index--) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [upcomingTracks[index], upcomingTracks[randomIndex]] = [
            upcomingTracks[randomIndex],
            upcomingTracks[index],
          ];
        }
      }
      const queue = [track, ...upcomingTracks];
      playlistTracksRef.current = queue;
      currentIndexRef.current = 0;
      queue.forEach((item) => {
        if (item.uri) player.add({ uri: item.uri });
      });
      player.skipTo(0);
      player.play();
      setCurrentTrack(track);
      setTail(queue.slice(1));
      setCurrentTime(0);
      setDuration(track.durationSeconds ?? 0);
      setPlaybackError(null);
    } catch (error) {
      console.error(`Impossible de lire « ${track.title} ».`, error);
      playlistTracksRef.current = [];
      currentIndexRef.current = 0;
      currentTrackIdRef.current = track.id;
      setCurrentTrack(track);
      setTail([]);
      setCurrentTime(0);
      setDuration(track.durationSeconds ?? 0);
      setPlaybackError("Ce fichier audio n’a pas pu être lu.");
    }
  }, [isShuffleEnabled, libraryTracks, player]);

  const togglePlayback = useCallback(() => {
    if (!currentTrack?.uri) {
      setPlaybackError("Choisissez un morceau de votre bibliothèque locale.");
      return;
    }
    try {
      if (playerStatus.playing) {
        player.pause();
      } else {
        player.play();
        setPlaybackError(null);
      }
    } catch (error) {
      console.error("Impossible de modifier l’état de lecture.", error);
      setPlaybackError("La lecture de ce fichier audio a échoué.");
    }
  }, [currentTrack, player, playerStatus.playing]);

  const toggleFavorite = useCallback((trackId: string) => {
    const track = libraryTracks.find((item) => item.id === trackId)
      ?? (currentTrack?.id === trackId ? currentTrack : undefined);
    if (!track) {
      setStorageError("Ce morceau n’est plus disponible dans la bibliothèque.");
      return;
    }

    const isFavorite = !favoriteTrackIds.includes(trackId);
    setFavoriteTrackIds((current) =>
      isFavorite ? [...current, trackId] : current.filter((id) => id !== trackId),
    );
    setTrackFavorite(track, isFavorite)
      .then(() => setStorageError(null))
      .catch((error: unknown) => {
        void loadLocalMusic()
          .then((stored) => setFavoriteTrackIds(stored.favoriteTrackIds))
          .catch((reloadError: unknown) =>
            reportStorageError("Impossible de restaurer les favoris après une erreur.", reloadError),
          );
        reportStorageError("Impossible d’enregistrer le favori.", error);
      });
  }, [currentTrack, favoriteTrackIds, libraryTracks, reportStorageError]);

  const persistLibraryTracks = useCallback(async (tracks: Track[]) => {
    try {
      await saveLibraryTracks(tracks);
      const stored = await loadLocalMusic();
      setFavoriteTrackIds(stored.favoriteTrackIds);
      setPlaylists(stored.playlists);
      setStorageError(null);
    } catch (error) {
      reportStorageError("Impossible d’enregistrer la bibliothèque locale.", error);
      throw error;
    }
  }, [reportStorageError]);

  const createPlaylist = useCallback(async (title: string, description = "") => {
    try {
      const id = await createStoredPlaylist(title, description);
      await reloadStoredPlaylists();
      setStorageError(null);
      return id;
    } catch (error) {
      reportStorageError("Impossible de créer la playlist.", error);
      throw error;
    }
  }, [reloadStoredPlaylists, reportStorageError]);

  const updatePlaylist = useCallback(async (
    id: string,
    title: string,
    description: string,
  ) => {
    try {
      await updateStoredPlaylist(id, title, description);
      await reloadStoredPlaylists();
      setStorageError(null);
    } catch (error) {
      reportStorageError("Impossible de modifier la playlist.", error);
      throw error;
    }
  }, [reloadStoredPlaylists, reportStorageError]);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      await deleteStoredPlaylist(id);
      await reloadStoredPlaylists();
      setStorageError(null);
    } catch (error) {
      reportStorageError("Impossible de supprimer la playlist.", error);
      throw error;
    }
  }, [reloadStoredPlaylists, reportStorageError]);

  const updatePlaylistTrackOrder = useCallback(async (id: string, trackIds: string[]) => {
    try {
      await setPlaylistTrackOrder(id, trackIds);
      await reloadStoredPlaylists();
      setStorageError(null);
    } catch (error) {
      reportStorageError("Impossible de modifier les morceaux de la playlist.", error);
      throw error;
    }
  }, [reloadStoredPlaylists, reportStorageError]);

  const replaceTail = useCallback((nextTail: Track[]) => {
    const index = currentIndexRef.current;
    const currentQueue = playlistTracksRef.current;
    const prefix = currentQueue.slice(0, index + 1);
    for (let queueIndex = currentQueue.length - 1; queueIndex > index; queueIndex--) {
      player.remove(queueIndex);
    }
    nextTail.forEach((track, tailIndex) => {
      if (track.uri) player.insert({ uri: track.uri }, index + 1 + tailIndex);
    });

    const nextQueue = [...prefix, ...nextTail.filter((track) => track.uri)];
    playlistTracksRef.current = nextQueue;
    setTail(nextQueue.slice(index + 1));
  }, [player]);

  const toggleShuffle = useCallback(() => {
    if (!isShuffleEnabled) {
      const shuffledTail = [...tail];
      for (let index = shuffledTail.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledTail[index], shuffledTail[randomIndex]] = [
          shuffledTail[randomIndex],
          shuffledTail[index],
        ];
      }
      replaceTail(shuffledTail);
    }
    setIsShuffleEnabled((enabled) => !enabled);
  }, [isShuffleEnabled, replaceTail, tail]);

  const toggleRepeat = useCallback(() => {
    setIsRepeatEnabled((enabled) => !enabled);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, nextVolume));
    setVolumeState(clampedVolume);
    player.volume = clampedVolume;
  }, [player]);

  const previousTrack = useCallback(() => {
    if (currentIndexRef.current > 0) {
      player.previous();
      return;
    }

    player.seekTo(0).catch((error: unknown) => {
      console.error("Impossible de revenir au début du morceau.", error);
      setPlaybackError("Impossible de déplacer la lecture.");
    });
  }, [player]);

  const nextTrack = useCallback(() => {
    player.next();
  }, [player]);

  const seekTo = useCallback((time: number) => {
    const targetTime = Math.max(0, Math.min(time, duration || time));
    setCurrentTime(targetTime);
    player.seekTo(targetTime).catch((error: unknown) => {
      console.error("Impossible de déplacer la lecture.", error);
      setPlaybackError("Impossible de déplacer la lecture dans ce fichier.");
    });
  }, [duration, player]);

  const removeFromTail = useCallback((trackId: string) => {
    const index = currentIndexRef.current;
    const queueIndexes = playlistTracksRef.current.flatMap((track, trackIndex) =>
      trackIndex > index && track.id === trackId ? [trackIndex] : [],
    );
    if (queueIndexes.length === 0) return;

    queueIndexes.reverse().forEach((queueIndex) => player.remove(queueIndex));
    const nextQueue = playlistTracksRef.current.filter(
      (track, trackIndex) => trackIndex <= index || track.id !== trackId,
    );
    playlistTracksRef.current = nextQueue;
    setTail(nextQueue.slice(index + 1));
  }, [player]);

  const moveInTail = useCallback((from: number, to: number) => {
    const index = currentIndexRef.current;
    const queue = [...playlistTracksRef.current];
    const tailLength = queue.length - index - 1;
    if (from < 0 || to < 0 || from >= tailLength || to >= tailLength || from === to) {
      return;
    }

    const fromIndex = index + 1 + from;
    const toIndex = index + 1 + to;
    const [moved] = queue.splice(fromIndex, 1);
    queue.splice(toIndex, 0, moved);
    if (moved.uri) {
      player.remove(fromIndex);
      player.insert({ uri: moved.uri }, toIndex);
    }
    playlistTracksRef.current = queue;
    setTail(queue.slice(index + 1));
  }, [player]);

  const clearTail = useCallback(() => {
    const index = currentIndexRef.current;
    for (
      let queueIndex = playlistTracksRef.current.length - 1;
      queueIndex > index;
      queueIndex--
    ) {
      player.remove(queueIndex);
    }
    playlistTracksRef.current = playlistTracksRef.current.slice(0, index + 1);
    setTail([]);
  }, [player]);

  const addToTail = useCallback((track: Track) => {
    if (!track.uri) {
      setPlaybackError("Ce morceau ne peut pas être ajouté à la file de lecture.");
      return;
    }
    player.add({ uri: track.uri });
    playlistTracksRef.current = [...playlistTracksRef.current, track];
    setTail((current) => [...current, track]);
  }, [player]);

  const value = useMemo(
    () => ({
      currentTrack,
      libraryTracks,
      tail,
      isPlaying: playerStatus.playing,
      currentTime,
      duration,
      volume,
      favoriteTrackIds,
      playlists,
      isStorageReady,
      storageError,
      isShuffleEnabled,
      isRepeatEnabled,
      playbackError,
      setLibraryTracks,
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
      persistLibraryTracks,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      setPlaylistTrackOrder: updatePlaylistTrackOrder,
    }),
    [
      currentTrack,
      libraryTracks,
      tail,
      playerStatus.playing,
      currentTime,
      duration,
      volume,
      favoriteTrackIds,
      playlists,
      isStorageReady,
      storageError,
      isShuffleEnabled,
      isRepeatEnabled,
      playbackError,
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
      persistLibraryTracks,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      updatePlaylistTrackOrder,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
