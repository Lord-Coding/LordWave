import AlbumGrid from "@/components/AlbumGrid";
import ArtistList from "@/components/ArtistList";
import CategorySelector from "@/components/CategorySelector";
import FolderList from "@/components/FolderList";
import RecommendedAlbums from "@/components/RecommendedAlbums";
import ScreenContainer from "@/components/ScreenContainer";
import TrackItem from "@/components/TrackItem";
import { mockTracks } from "@/constants/mockMusic";
import { MusicCategory, Track } from "@/constants/musicType";
import { FontSize } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "burnt";
import { ListFilter, Music2, Shuffle } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function LibraryScreen() {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] =
    useState<MusicCategory>("songs");

  const handleCategoryChange = useCallback((category: MusicCategory) => {
    setSelectedCategory(category);

    toast({ title: "Catégorie sélectionnée", message: category });
  }, []);

  const handleTrackPress = useCallback((track: Track) => {
    toast({ title: "Morceau sélectionné", message: track.title });
  }, []);

  const renderHeader = useCallback(
    () => (
      <View>
        <CategorySelector
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />

        {selectedCategory === "songs" && (
          <>
            <RecommendedAlbums />

            <View style={styles.quickRow}>
              <View style={styles.quickLabel}>
                <Music2 size={17} color={theme.primary} />

                <Text
                  style={[styles.quickText, { color: theme.textSecondary }]}
                >
                  Votre Bibliothèque
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
            </View>

            <Text style={[styles.heading, { color: theme.text }]}>
              Toutes les chansons
            </Text>
          </>
        )}

        {selectedCategory === "artists" && <ArtistList />}

        {selectedCategory === "albums" && <AlbumGrid />}

        {selectedCategory === "folders" && <FolderList />}
      </View>
    ),
    [selectedCategory, theme, handleCategoryChange],
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
        <Text style={[styles.title, { color: theme.text }]}>Bibliothèque</Text>
        <Pressable onPress={() => console.log("Recherche")}>
          <Ionicons name="search" size={24} style={{ color: theme.text }} />
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={selectedCategory === "songs" ? mockTracks : []}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    letterSpacing: 1,
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
    marginBottom: 9,
  },
});
