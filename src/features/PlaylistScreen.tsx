import EmptyScreen from "@/components/EmptyScreen";
import PlaylistCard from "@/components/PlaylistCard";
import ScreenContainer from "@/components/ScreenContainer";
import { getPlaylistTracks, mockPlaylists } from "@/constants/mockMusic";
import { Playlist } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { usePlayer } from "@/hooks/usePlayer";
import { openCollection } from "@/navigation/openCollection";
import { toast } from "burnt";
import { Plus, ListMusic, Shuffle } from "lucide-react-native";
import { View, Text, StyleSheet, FlatList } from "react-native";

export default function PlaylistScreen() {
  const theme = useTheme();
  const { playTrack } = usePlayer();

  const handleCreatePlaylist = () => {
    toast({ title: "Création d'une nouvelle playlist" });
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    openCollection("playlist", playlist.id);
  };

  const handlePlaylistPlay = (playlist: Playlist) => {
    const tracks = getPlaylistTracks(playlist.id);
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handlePlaylistMore = (playlist: Playlist) => {
    toast({ title:"Options de la playlist", message: playlist.title});
  };

  const handleShuffleAll = () => {
    toast({ title:"Mélanger toutes les playlists"});
  };

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.title, {color: theme.text}]}>Mes playlists</Text>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            Votre musique, organisée à votre façon.
          </Text>
        </View>
        <Pressable
          onPress={handleCreatePlaylist}
          style={({ pressed }) => [
            styles.addButton && {backgroundColor: theme.primary, borderRadius: 20, },
            pressed && styles.pressed,
          ]}
        >
          <Plus size={21} color={theme.white} />
        </Pressable>
      </View>

      <View style={[styles.summaryCard, {backgroundColor: theme.backgroundElement}]}>
        <View style={[styles.summaryIcon, {backgroundColor: theme.primary}]}>
          <ListMusic size={24} color={theme.white} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryNumber, {color: theme.text}]}>{mockPlaylists.length}</Text>
          <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>Playlists créées</Text>
        </View>
        <Pressable
          onPress={handleShuffleAll}
          hitSlop={10}
          style={[styles.shuffleButton, {backgroundColor: theme.backgroundElement}]}
        >
          <Shuffle size={19} color={theme.primary} />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>Votre collection</Text>
        <Pressable
          onPress={() =>
            toast({title: "Options de tri des playlists"})
          }
        >
          <Text style={[styles.sortText, {color: theme.primary}]}>Récentes</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      {mockPlaylists.length === 0 ? (
        <EmptyScreen
          icon="musical-notes-outline"
          title="Aucune playlist"
          subtitle="Créez votre première playlist pour organiser vos morceaux"
          action={{
            label: "Créer une playlist",
            onPress: handleCreatePlaylist,
          }}
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.content}
          data={mockPlaylists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <PlaylistCard
              playlist={item}
              onPress={handlePlaylistPress}
              onPlay={handlePlaylistPlay}
              onMore={handlePlaylistMore}
            />
          )}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  )
}


const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingBottom: 35,
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
  addButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    borderRadius: 17,
    marginBottom: 28,
  },
  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryInfo: { flex: 1, marginLeft: 14, gap: 3 },
  summaryNumber: { fontSize: 19, fontWeight: "800" },
  summaryLabel: { fontSize: 11 },
  shuffleButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  sortText: { fontSize: 12, fontWeight: "600" },
  gridRow: { justifyContent: "space-between", marginBottom: 22 },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});
