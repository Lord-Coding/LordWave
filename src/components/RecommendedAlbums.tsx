import type { Album, Track } from "@/constants/musicType";
import { usePlayer } from "@/hooks/usePlayer";
import { openCollection } from "@/navigation/openCollection";
import { albumCollectionId } from "@/services/collectionIds";
import { ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import AlbumCard from "./AlbumCard";
import SectionHeader from "./SectionHeader";

export default function RecommendedAlbums() {
  const { libraryTracks, playTrack } = usePlayer();
  const albums = useMemo(() => {
    const groups = new Map<string, Track[]>();
    for (const track of libraryTracks) {
      const key = `${track.album}\u0000${track.artist}`;
      const group = groups.get(key) ?? [];
      group.push(track);
      groups.set(key, group);
    }
    return Array.from(groups.values(), (tracks): { album: Album; tracks: Track[] } => ({
      album: {
        id: albumCollectionId(tracks[0].album, tracks[0].artist),
        title: tracks[0].album,
        artist: tracks[0].artist,
        cover: tracks.find((track) => track.cover)?.cover ?? "",
        trackCount: tracks.length,
      },
      tracks,
    })).slice(0, 10);
  }, [libraryTracks]);
  const openAlbum = (album: Album) => {
    openCollection("album", album.id);
  };

  const playAlbum = (album: Album) => {
    const tracks = albums.find((item) => item.album.id === album.id)?.tracks ?? [];
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Albums recommandés"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {albums.map(({ album }) => (
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
