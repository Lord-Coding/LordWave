import { EmptyState } from "@/components/EmptyState";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { TracksList } from "@/components/TracksList";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import {
    getPlaylistTracks,
    type PlaylistTrackRow,
} from "@/database/repositories/playlistRepository";
import { usePlayer } from "@/stores/PlayerProvider";
import { Track } from "@/types/track";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function playlistRowToTrack(row: PlaylistTrackRow): Track {
  return {
    url: row.trackUrl,
    title: row.trackTitle,
    artist: row.trackArtist ?? undefined,
    album: row.trackAlbum ?? undefined,
    artwork: row.trackArtwork ?? undefined,
  };
}

const PlaylistDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { loadQueue } = usePlayer();

  const [rows, setRows] = useState<PlaylistTrackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTracks = useCallback(async (): Promise<void> => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getPlaylistTracks(Number(id));
      setRows(data);
    } catch (err) {
      console.error("[PlaylistDetail] load failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const tracks = rows.map(playlistRowToTrack);

  const handlePlayAll = (): void => {
    if (tracks.length === 0) return;
    loadQueue(tracks, 0);
    router.push("/player" as never);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScreenWrapper>
      {tracks.length > 0 && (
        <TouchableOpacity
          style={[styles.playAllButton, { backgroundColor: theme.primary }]}
          onPress={handlePlayAll}
          accessibilityLabel="Lire tout"
        >
          <Ionicons name="play" size={18} color="#ffffff" />
          <Text style={styles.playAllText}>Lire tout</Text>
        </TouchableOpacity>
      )}

      {tracks.length === 0 ? (
        <EmptyState
          icon="musical-notes-outline"
          title="Playlist vide"
          subtitle="Ajoutez des morceaux à cette playlist"
        />
      ) : (
        <TracksList tracks={tracks} />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    columnGap: 8,
  },
  playAllText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PlaylistDetailScreen;
