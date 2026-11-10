import CategorySelector from "@/components/CategorySelector";
import ScreenContainer from "@/components/ScreenContainer";
import TrackItem from "@/components/TrackItem";
import { MusicCategory, Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { enrichDeviceMusic, getDeviceMusic, getTrackFolder } from "@/services/deviceMusic";
import {
  albumCollectionId,
  artistCollectionId,
  folderCollectionId,
} from "@/services/collectionIds";
import { Image } from "expo-image";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
  addListener,
  type PermissionResponse,
} from "expo-media-library";
import { openCollection } from "@/navigation/openCollection";
import { Music2, RefreshCw, Search, Shuffle, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type LibraryGroup = {
  type: "artist" | "album" | "folder";
  id: string;
  name: string;
  subtitle: string;
  cover: string;
  tracks: Track[];
};
type LibrarySort = "title" | "artist" | "device";

function albumKey(album: string, artist: string) {
  if (album === "Album inconnu" || artist === "Artiste inconnu") return null;
  return `${album}\u0000${artist}`;
}

export default function LibraryScreen() {
  const theme = useTheme();
  const {
    playTrack,
    libraryTracks,
    setLibraryTracks,
    persistLibraryTracks,
    favoriteTrackIds,
    toggleFavorite,
    storageError,
  } = usePlayer();
  const [selectedCategory, setSelectedCategory] =
    useState<MusicCategory>("songs");
  const [sortMode, setSortMode] = useState<LibrarySort>("title");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scanPromiseRef = useRef<Promise<void> | null>(null);
  const enrichmentGenerationRef = useRef(0);
  const libraryTracksRef = useRef(libraryTracks);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredTracks = useMemo(
    () =>
      libraryTracks.filter((track) =>
        [track.title, track.artist, track.album].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      ),
    [libraryTracks, normalizedQuery],
  );
  const sortedTracks = useMemo(() => {
    const tracks = [...filteredTracks];
    if (sortMode === "title") tracks.sort((left, right) => left.title.localeCompare(right.title));
    if (sortMode === "artist") tracks.sort((left, right) =>
      left.artist.localeCompare(right.artist) || left.title.localeCompare(right.title),
    );
    return tracks;
  }, [filteredTracks, sortMode]);

  useEffect(() => {
    libraryTracksRef.current = libraryTracks;
  }, [libraryTracks]);

  const refreshLibrary = useCallback(async (afterCurrentScan = false): Promise<void> => {
    if (Platform.OS !== "android") return;
    if (scanPromiseRef.current) {
      await scanPromiseRef.current;
      if (afterCurrentScan) await refreshLibrary();
      return;
    }

    const scan = (async () => {
      setIsLoading(true);
      setLoadError(null);
      const generation = ++enrichmentGenerationRef.current;
      try {
        const currentPermission = await getPermissionsAsync(false, ["audio"]);
        setPermission(currentPermission);
        if (!currentPermission.granted) {
          setLibraryTracks([]);
          return;
        }

        const cachedTracks = new Map(
          libraryTracksRef.current.map((track) => [track.id, track]),
        );
        const cachedAlbumCovers = new Map<string, string>();
        for (const track of cachedTracks.values()) {
          const key = albumKey(track.album, track.artist);
          if (track.cover && key) {
            cachedAlbumCovers.set(key, track.cover);
          }
        }
        const restoreCachedData = (track: Track): Track => {
          const cachedTrack = cachedTracks.get(track.id);
          const album = cachedTrack?.album || track.album;
          const artist = cachedTrack?.artist || track.artist;
          const key = albumKey(album, artist);
          return {
            ...track,
            title: cachedTrack?.title || track.title,
            artist,
            album,
            cover:
              track.cover ||
              cachedTrack?.cover ||
              (key ? cachedAlbumCovers.get(key) : undefined) ||
              "",
            ...(cachedTrack?.durationSeconds && !track.durationSeconds
              ? {
                  duration: cachedTrack.duration,
                  durationSeconds: cachedTrack.durationSeconds,
                }
              : {}),
          };
        };

        let scannedTracks: Track[] = [];
        const tracks = await getDeviceMusic((pageTracks) => {
          if (generation === enrichmentGenerationRef.current) {
            scannedTracks = [...scannedTracks, ...pageTracks.map(restoreCachedData)];
            setLibraryTracks(scannedTracks);
          }
        });
        if (generation !== enrichmentGenerationRef.current) return;
        const tracksWithCachedData = tracks.map(restoreCachedData);
        setLibraryTracks(tracksWithCachedData);
        void persistLibraryTracks(tracksWithCachedData)
          .then(async () => {
            const enrichedTracks = [...tracksWithCachedData];
            const trackIndexes = new Map(
              enrichedTracks.map((track, index) => [track.id, index]),
            );
            const pendingUpdates = new Map<string, Track>();
            const albumCovers = new Map(cachedAlbumCovers);
            let updateTimer: ReturnType<typeof setTimeout> | null = null;
            const flushEnrichmentUpdates = () => {
              if (updateTimer !== null) {
                clearTimeout(updateTimer);
                updateTimer = null;
              }
              if (generation !== enrichmentGenerationRef.current) {
                pendingUpdates.clear();
                return;
              }

              const updates = new Map(pendingUpdates);
              pendingUpdates.clear();
              for (const track of updates.values()) {
                const key = albumKey(track.album, track.artist);
                if (track.cover && key) {
                  albumCovers.set(key, track.cover);
                }
                const index = trackIndexes.get(track.id);
                if (index !== undefined) enrichedTracks[index] = track;
              }

              for (const [index, track] of enrichedTracks.entries()) {
                const key = albumKey(track.album, track.artist);
                const cover = key ? albumCovers.get(key) : undefined;
                if (!track.cover && cover) {
                  const updatedTrack = { ...track, cover };
                  enrichedTracks[index] = updatedTrack;
                  updates.set(track.id, updatedTrack);
                }
              }

              if (updates.size > 0) {
                setLibraryTracks((currentTracks) =>
                  currentTracks.map((track) => updates.get(track.id) ?? track),
                );
              }
            };

            await enrichDeviceMusic(tracks, (updatedTrack) => {
              if (generation !== enrichmentGenerationRef.current) return;
              pendingUpdates.set(updatedTrack.id, updatedTrack);
              if (pendingUpdates.size >= 24) {
                flushEnrichmentUpdates();
              } else if (updateTimer === null) {
                updateTimer = setTimeout(flushEnrichmentUpdates, 120);
              }
            });
            flushEnrichmentUpdates();
            if (generation === enrichmentGenerationRef.current) {
              await persistLibraryTracks(enrichedTracks);
            }
          })
          .catch((error: unknown) => {
            console.error("Impossible d’enregistrer ou d’enrichir la bibliothèque locale.", error);
          });
      } catch (error) {
        console.error("Impossible de charger la bibliothèque audio locale.", error);
        setLoadError("La bibliothèque musicale n’a pas pu être chargée. Réessayez.");
      } finally {
        setIsLoading(false);
      }
    })();

    scanPromiseRef.current = scan;
    try {
      await scan;
    } finally {
      if (scanPromiseRef.current === scan) scanPromiseRef.current = null;
    }
  }, [persistLibraryTracks, setLibraryTracks]);

  useEffect(() => {
    void refreshLibrary();
    const subscription = addListener(() => {
      void refreshLibrary();
    });
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshLibrary();
    });
    return () => {
      enrichmentGenerationRef.current++;
      subscription.remove();
      appStateSubscription.remove();
    };
  }, [refreshLibrary]);

  const requestLibraryAccess = useCallback(async () => {
    if (Platform.OS !== "android") return;
    setIsRequestingPermission(true);
    setLoadError(null);
    try {
      const response = await requestPermissionsAsync(false, ["audio"]);
      setPermission(response);
      if (response.granted) {
        await refreshLibrary(true);
      }
    } catch (error) {
      console.error("Impossible de demander l’accès à la musique.", error);
      setLoadError("La demande d’autorisation a échoué. Réessayez.");
    } finally {
      setIsRequestingPermission(false);
    }
  }, [refreshLibrary]);

  const handleCategoryChange = useCallback((category: MusicCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleTrackPress = useCallback((track: Track) => playTrack(track, libraryTracks), [libraryTracks, playTrack]);

  const artists = useMemo<LibraryGroup[]>(() => {
    const groups = new Map<string, Track[]>();
    for (const track of libraryTracks) {
      const tracks = groups.get(track.artist) ?? [];
      tracks.push(track);
      groups.set(track.artist, tracks);
    }
    return Array.from(groups, ([name, tracks]): LibraryGroup => ({
      type: "artist",
      id: artistCollectionId(name),
      name,
      subtitle: `${tracks.length} morceau${tracks.length === 1 ? "" : "x"}`,
      cover: tracks.find((track) => track.cover)?.cover ?? "",
      tracks,
    }))
      .filter((group) => group.name.toLocaleLowerCase().includes(normalizedQuery))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [libraryTracks, normalizedQuery]);

  const albums = useMemo<LibraryGroup[]>(() => {
    const groups = new Map<string, Track[]>();
    for (const track of libraryTracks) {
      const key = `${track.album}\u0000${track.artist}`;
      const tracks = groups.get(key) ?? [];
      tracks.push(track);
      groups.set(key, tracks);
    }
    return Array.from(groups.values(), (tracks): LibraryGroup => ({
      type: "album",
      id: albumCollectionId(tracks[0].album, tracks[0].artist),
      name: tracks[0].album,
      subtitle: tracks[0].artist,
      cover: tracks.find((track) => track.cover)?.cover ?? "",
      tracks,
    }))
      .filter((group) =>
        `${group.name} ${group.subtitle}`.toLocaleLowerCase().includes(normalizedQuery),
      )
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [libraryTracks, normalizedQuery]);

  const folders = useMemo<LibraryGroup[]>(() => {
    const groups = new Map<string, Track[]>();
    for (const track of libraryTracks) {
      const path = getTrackFolder(track);
      if (!path) continue;
      const tracks = groups.get(path) ?? [];
      tracks.push(track);
      groups.set(path, tracks);
    }
    return Array.from(groups, ([path, tracks]): LibraryGroup => ({
      type: "folder",
      id: folderCollectionId(path),
      name: path.split("/").filter(Boolean).at(-1) ?? path,
      subtitle: path,
      cover: tracks.find((track) => track.cover)?.cover ?? "",
      tracks,
    }))
      .filter((group) => `${group.name} ${group.subtitle}`.toLocaleLowerCase().includes(normalizedQuery))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [libraryTracks, normalizedQuery]);

  const listData = useMemo<(Track | LibraryGroup)[]>(() => {
    if (selectedCategory === "songs") return sortedTracks;
    if (selectedCategory === "artists") return artists;
    if (selectedCategory === "albums") return albums;
    if (selectedCategory === "folders") return folders;
    return [];
  }, [albums, artists, folders, selectedCategory, sortedTracks]);

  const handleShuffle = useCallback(() => {
    if (filteredTracks.length === 0) return;
    const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  }, [filteredTracks, playTrack]);

  const renderHeader = useCallback(
    () => (
      <View>
        <CategorySelector
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />

        {selectedCategory === "songs" && !normalizedQuery && libraryTracks.length > 0 && (
          <View style={styles.quickRow}>
              <View style={styles.quickLabel}>
                <Music2 size={20} color={theme.primary} />

                <Text style={[styles.heading, { color: theme.text }]}>
                  {libraryTracks.length} morceaux sur cet appareil
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    setSortMode((current) =>
                      current === "title" ? "artist" : current === "artist" ? "device" : "title",
                    )
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Changer le tri de la bibliothèque"
                >
                  <Text style={[styles.sortAction, { color: theme.textSecondary }]}>
                    {sortMode === "title" ? "A → Z" : sortMode === "artist" ? "Artiste" : "Appareil"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleShuffle}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Mélanger les morceaux"
                >
                  <Shuffle size={19} color={theme.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => void refreshLibrary()}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Actualiser la bibliothèque"
                >
                  <RefreshCw size={19} color={theme.textSecondary} />
                </Pressable>
              </View>
          </View>
        )}
        {selectedCategory === "albums" && libraryTracks.length > 0 ? (
          <Text style={[styles.heading, styles.albumHeading, { color: theme.text }]}>
            {albums.length} album{albums.length === 1 ? "" : "s"}
          </Text>
        ) : null}
        {loadError || storageError ? (
          <Text style={[styles.error, { color: theme.danger }]}>{loadError ?? storageError}</Text>
        ) : null}
      </View>
    ),
    [selectedCategory, normalizedQuery, libraryTracks, albums.length, storageError, sortMode, theme, handleCategoryChange, handleShuffle, refreshLibrary],
  );

  const renderTrack = useCallback(
    ({ item }: { item: Track | LibraryGroup }) => {
      if ("tracks" in item) {
        return (
          <Pressable
            style={styles.collectionRow}
            onPress={() => openCollection(item.type, item.id)}
          >
            <Image
              source={item.cover
                ? { uri: item.cover }
                : item.type === "artist"
                  ? require("../../assets/images/unknown_artist.png")
                  : require("../../assets/images/unknown_track.png")}
              style={[styles.collectionCover, { backgroundColor: theme.backgroundElement }]}
              contentFit="cover"
              transition={150}
            />
            <View style={styles.collectionDetails}>
              <Text numberOfLines={1} style={[styles.collectionTitle, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textSecondary }]}>
                {item.subtitle} · {item.tracks.length} morceau{item.tracks.length === 1 ? "" : "x"}
              </Text>
            </View>
          </Pressable>
        );
      }

      return (
        <TrackItem
          track={item}
          onPress={handleTrackPress}
          onMore={(track) =>
            Alert.alert(track.title, track.artist, [
              { text: "Lire", onPress: () => handleTrackPress(track) },
              {
                text: favoriteTrackIds.includes(track.id) ? "Retirer des favoris" : "Ajouter aux favoris",
                onPress: () => toggleFavorite(track.id),
              },
              { text: "Annuler", style: "cancel" },
            ])
          }
        />
      );
    },
    [favoriteTrackIds, handleTrackPress, theme, toggleFavorite],
  );

  if (Platform.OS !== "android") {
    return (
      <ScreenContainer>
        <View style={styles.permissionState}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Bibliothèque locale Android
          </Text>
          <Text style={[styles.permissionDescription, { color: theme.textSecondary }]}>
            L’accès aux fichiers musicaux de cette version est disponible sur Android.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission?.granted) {
    if (permission === null && isLoading) {
      return (
        <ScreenContainer>
          <View style={styles.permissionState}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.permissionDescription, { color: theme.textSecondary }]}>
              Vérification de l’accès à la bibliothèque…
            </Text>
          </View>
        </ScreenContainer>
      );
    }

    return (
      <ScreenContainer>
        <View style={styles.permissionState}>
          <Music2 size={38} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Accéder à votre musique</Text>
          <Text style={[styles.permissionDescription, { color: theme.textSecondary }]}>
            LordWave a besoin de l’autorisation audio Android pour afficher et lire les morceaux enregistrés sur cet appareil. Vos fichiers restent sur votre téléphone.
          </Text>
          {loadError ? <Text style={[styles.error, { color: theme.danger }]}>{loadError}</Text> : null}
          <Pressable
            onPress={permission?.canAskAgain === false ? () => void Linking.openSettings() : requestLibraryAccess}
            style={[styles.permissionButton, { backgroundColor: theme.primary }]}
            disabled={isRequestingPermission}
            accessibilityRole="button"
          >
            <Text style={[styles.permissionButtonText, { color: theme.white }]}>
              {isRequestingPermission
                ? "Demande en cours…"
                : permission?.canAskAgain === false
                  ? "Ouvrir les réglages"
                  : "Autoriser l’accès"}
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          {isSearchVisible ? (
            <Text style={[styles.title, { color: theme.text }]}>Rechercher</Text>
          ) : (
            <>
              <Text style={[styles.title, {color: theme.text}]}>Ma Bibliothèque</Text>
              <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
                Musique enregistrée sur cet appareil.
              </Text>
            </>
          )}
        </View>
        <Pressable
          onPress={() => {
            if (isSearchVisible) {
              setSearchQuery("");
              Keyboard.dismiss();
            }
            setIsSearchVisible((visible) => !visible);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={isSearchVisible ? "Fermer la recherche" : "Ouvrir la recherche"}
        >
          {isSearchVisible ? (
            <X size={23} color={theme.text} />
          ) : (
            <Search size={23} color={theme.text} />
          )}
        </Pressable>
      </View>

      {isSearchVisible && (
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Morceau, artiste, album..."
            placeholderTextColor={theme.inactive}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Rechercher dans la bibliothèque"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
            >
              <X size={17} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Chargement des morceaux…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.loadingState}>
            <Text style={[styles.error, { color: theme.danger }]}>{loadError}</Text>
            <Pressable onPress={() => void refreshLibrary()} accessibilityRole="button">
              <Text style={{ color: theme.primary }}>Réessayer</Text>
            </Pressable>
          </View>
        ) : libraryTracks.length === 0 ? (
          <Text style={[styles.noResults, { color: theme.textSecondary }]}>
            Aucun fichier audio trouvé. Ajoutez de la musique dans Music ou Download puis actualisez.
          </Text>
        ) : (
          <Text style={[styles.noResults, { color: theme.textSecondary }]}>
            Aucun résultat{normalizedQuery ? ` pour « ${searchQuery.trim()} »` : ""}.
          </Text>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 36,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 12, marginTop: 6 },
  searchBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: -10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 14,
  },
  noResults: {
    paddingVertical: 28,
    textAlign: "center",
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 35,
  },
  quickRow: {
    marginTop: 28,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sortAction: {
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
  },
  permissionState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  permissionButton: {
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 6,
  },
  permissionButtonText: {
    fontWeight: "700",
  },
  error: {
    textAlign: "center",
  },
  loadingState: {
    alignItems: "center",
    gap: 12,
    padding: 28,
  },
  collectionRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  collectionCover: {
    width: 56,
    height: 56,
    borderRadius: 0,
  },
  collectionDetails: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  collectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  albumHeading: {
    marginTop: 22,
    marginBottom: 8,
  },
});
