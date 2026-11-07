import { getAlbumTracks, mockAlbums } from "@/constants/mockMusic";
import { usePlayer } from "@/hooks/usePlayer";
import { openCollection } from "@/navigation/openCollection";
import { ScrollView, StyleSheet, View } from "react-native";
import AlbumCard from "./AlbumCard";
import SectionHeader from "./SectionHeader";

export default function RecommendedAlbums() {
  const { playTrack } = usePlayer();
  const openAlbum = (album: (typeof mockAlbums)[number]) => {
    openCollection("album", album.id);
  };

  const playAlbum = (album: (typeof mockAlbums)[number]) => {
    const tracks = getAlbumTracks(album.title);
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Albums recommandés"
        actionLabel="Voir tout"
        onActionPress={() => console.log("[LordWave] Voir tous les albums")}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {mockAlbums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onPress={openAlbum}
            onPlay={playAlbum}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 27,
  },
  list: {
    gap: 13,
    paddingRight: 20,
  },
});
