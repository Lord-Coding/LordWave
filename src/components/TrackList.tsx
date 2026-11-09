import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { StyleSheet, View } from "react-native";
import { useCallback } from "react";
import TrackItem from "./TrackItem";

export default function TrackList() {
  const { libraryTracks, playTrack, toggleFavorite } = usePlayer();
  const handleTrackMore = useCallback((track: (typeof libraryTracks)[number]) => {
    toggleFavorite(track.id);
  }, [libraryTracks, toggleFavorite]);

  return (
    <View style={styles.container}>
      {libraryTracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          onPress={(item) => playTrack(item, libraryTracks)}
          onMore={handleTrackMore}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
});
