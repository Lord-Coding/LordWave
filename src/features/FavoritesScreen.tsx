import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import TrackItem from "@/components/TrackItem";
import { Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { Heart, Shuffle } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, View, StyleSheet, Text, FlatList } from "react-native";

export default function FavoritesScreen() {
  const theme = useTheme();
  const {
    playTrack,
    favoriteTrackIds,
    libraryTracks,
    toggleFavorite,
    isStorageReady,
    storageError,
  } = usePlayer();
  const [sortByArtist, setSortByArtist] = useState(false);
  const favoriteTracks = useMemo(
    () =>
      libraryTracks
        .filter((track) => favoriteTrackIds.includes(track.id))
        .sort((left, right) =>
          (sortByArtist ? left.artist : left.title).localeCompare(
            sortByArtist ? right.artist : right.title,
          ),
        ),
    [favoriteTrackIds, libraryTracks, sortByArtist],
  );

  const handleTrackPress = (track: Track) => {
    playTrack(track, favoriteTracks);
  }

  const handleTrackMore = (track: Track) => {
    toggleFavorite(track.id);
  }

  const handleShuffle = () => {
    if (favoriteTracks.length === 0) return;

    const shuffledTracks = [...favoriteTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffledTracks[0], shuffledTracks);
  }

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.title, {color: theme.text}]}>Mes favoris</Text>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            Retrouvez ici vos morceaux préférés.
          </Text>
        </View>
      </View>

      <View style={[styles.hero, {backgroundColor: theme.backgroundElement}]}>
        <View style={[styles.heartContainer, {backgroundColor: theme.primary}]}>
          <Heart size={28} color={theme.white}></Heart>
        </View>

        <View style={styles.heroInfo}>
          <Text style={[styles.heroTitle, {color: theme.text}]}>Vos coups de coeur</Text>
          <Text style={[styles.heroSubtitle, {color: theme.textSecondary}]}>Retrouvez ici les morceaux que vous aimez.</Text>
        </View>
      </View>
      
      <View style={styles.summary}>
        <View>
          <Text style={[styles.count, {color: theme.text}]}>{favoriteTracks.length}</Text>
          <Text style={[styles.countLabel, {color: theme.textSecondary}]}>Morceaux favoris</Text>
        </View>

        <Pressable 
          onPress={handleShuffle}
          style={({ pressed }) => [
            styles.shuffleButton, 
            {backgroundColor: theme.primary, borderRadius: 20, },
            pressed && styles.pressed
          ]}
        >
          <Shuffle size={17} color={theme.white} />
          <Text style={[styles.shuffleText, {color: theme.white}]}>Melanger</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <SectionHeader
          title="Tous vos favoris"
          actionLabel={sortByArtist ? "Artiste" : "Titre"}
          onActionPress={() => setSortByArtist((current) => !current)}
        />
      </View>
      {storageError ? (
        <Text style={[styles.storageError, { color: theme.danger }]}>{storageError}</Text>
      ) : null}
    </View>
  )

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, {backgroundColor: theme.backgroundElement}]}>
        <Heart size={30} color={theme.inactive} />
      </View>
      <Text style={[styles.emptyTitle, {color: theme.text}]}>Aucun favori pour le moment</Text>
      <Text style={[styles.emptyDescription, {color: theme.textSecondary}]}>
        Ajoutez vos morceaux préférés à vos favoris
        pour les retrouver facilement ici.
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={favoriteTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem
            track={item}
            onPress={handleTrackPress}
            onMore={handleTrackMore}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isStorageReady ? renderEmpty : (
          <View style={styles.loading}>
            {storageError ? (
              <Text style={[styles.storageError, { color: theme.danger }]}>{storageError}</Text>
            ) : (
              <>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Chargement des favoris…</Text>
              </>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingBottom: 35,
    flexGrow: 1,
  },
  topHeader: {
    flexDirection: "row",
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 18,
    borderRadius: 18,
  },
  heartContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: { flex: 1, gap: 5 },
  heroTitle: { fontSize: 17, fontWeight: "700" },
  heroSubtitle: {
    fontSize: 11,
    lineHeight: 17,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 25,
  },
  count: { fontSize: 25, fontWeight: "800" },
  countLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  shuffleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
  },
  shuffleText: { fontSize: 12, fontWeight: "700" },
  sectionHeader: { marginBottom: 4 },
  storageError: { marginBottom: 12, fontSize: 12 },
  empty: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  loading: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },
  pressed: { opacity: 0.8 },
})
