import AlbumGrid from "@/components/AlbumGrid";
import ArtistList from "@/components/ArtistList";
import CategorySelector from "@/components/CategorySelector";
import FolderList from "@/components/FolderList";
import RecommendedAlbums from "@/components/RecommendedAlbums";
import ScreenContainer from "@/components/ScreenContainer";
import TrackItem from "@/components/TrackItem";
import { mockTracks } from "@/constants/mockMusic";
import { MusicCategory, Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { toast } from "burnt";
import { ListFilter, Music2, Search, Shuffle, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, StyleSheet, Text, TextInput, View } from "react-native";

export default function LibraryScreen() {
  const theme = useTheme();
  const { playTrack } = usePlayer();
  const [selectedCategory, setSelectedCategory] =
    useState<MusicCategory>("songs");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredTracks = useMemo(
    () =>
      mockTracks.filter((track) =>
        [track.title, track.artist, track.album].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
      ),
    [normalizedQuery],
  );

  const handleCategoryChange = useCallback((category: MusicCategory) => {
    setSelectedCategory(category);

    toast({ title: "Catégorie sélectionnée", message: category });
  }, []);

  const handleTrackPress = useCallback((track: Track) => {
    playTrack(track, mockTracks);
  }, [playTrack]);

  const renderHeader = useCallback(
    () => (
      <View>
        <CategorySelector
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />

        {selectedCategory === "songs" && (
          <>
            {!normalizedQuery && <RecommendedAlbums />}

            {!normalizedQuery && <View style={styles.quickRow}>
              <View style={styles.quickLabel}>
                <Music2 size={20} color={theme.primary} />

                <Text style={[styles.heading, { color: theme.text }]}>
                  Toutes les chansons
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => toast({ title: "Lecture aléatoire" })}
                  hitSlop={10}
                >
                  <Shuffle size={19} color={theme.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => console.log("[LordWave] Option de liste")}
                  hitSlop={10}
                >
                  <ListFilter size={19} color={theme.textSecondary} />
                </Pressable>
              </View>
            </View>}
          </>
        )}

        {selectedCategory === "artists" && <ArtistList searchQuery={searchQuery} />}

        {selectedCategory === "albums" && <AlbumGrid searchQuery={searchQuery} />}

        {selectedCategory === "folders" && <FolderList searchQuery={searchQuery} />}
      </View>
    ),
    [selectedCategory, searchQuery, normalizedQuery, theme, handleCategoryChange],
  );

  const renderTrack = useCallback(
    ({ item }: { item: Track }) => (
      <TrackItem
        track={item}
        onPress={handleTrackPress}
        onMore={(track) =>
          console.log("[LordWave] Menu du morceau :", track.title)
        }
      />
    ),
    [handleTrackPress],
  );

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
                Retrouvez tous vos morceaux, albums et artistes.
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
        data={selectedCategory === "songs" ? filteredTracks : []}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        ListEmptyComponent={
          selectedCategory === "songs" && normalizedQuery ? (
            <Text style={[styles.noResults, { color: theme.textSecondary }]}>
              Aucun morceau trouvé pour « {searchQuery.trim()} ».
            </Text>
          ) : undefined
        }
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
  },
});
