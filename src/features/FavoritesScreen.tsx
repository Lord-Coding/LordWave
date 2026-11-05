import EmptyScreen from "@/components/EmptyScreen";
import ScreenContainer from "@/components/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import TrackItem from "@/components/TrackItem";
import { mockTracks } from "@/constants/mockMusic";
import { Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "burnt";
import { Heart, Shuffle } from "lucide-react-native";
import { useMemo } from "react";
import { View, StyleSheet, Text, Pressable, FlatList } from "react-native";

export default function FavoritesScreen() {
  const theme = useTheme();
  const favoriteTracks = useMemo(() => mockTracks.filter((track) => track.isFavorite), []);

  const handleTrackPress = (track: Track) => {
    toast({ title: "Favori sélectionné", message: track.title});
  }

  const handleTrackMore = (track: Track) => {
    toast({ title: "Options du favori", message: track.title});
  }

  const handleShuffle = () => {
    toast({ title: "Lecture aléatoire des favoris"});
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
          actionLabel="Trier"
          onActionPress={() => console.log("[LordWave] Trier les favoris")}
        />
      </View>
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
        ListEmptyComponent={renderEmpty}
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
  empty: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
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
