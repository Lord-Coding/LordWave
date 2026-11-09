import type { Album, Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { openCollection } from "@/navigation/openCollection";
import { albumCollectionId } from "@/services/collectionIds";
import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader";

export default function AlbumGrid({ searchQuery = "" }: { searchQuery?: string }) {
  const theme = useTheme();
  const { libraryTracks, playTrack } = usePlayer();
  const [descending, setDescending] = useState(false);
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
    }))
      .filter(({ album }) =>
        [album.title, album.artist].some((value) =>
          value.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
        ),
      )
      .sort((left, right) => left.album.title.localeCompare(right.album.title) * (descending ? -1 : 1));
  }, [descending, libraryTracks, searchQuery]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Tous les albums"
        actionLabel={descending ? "Z → A" : "A → Z"}
        onActionPress={() => setDescending((value) => !value)}
      />

      <View style={styles.grid}>
        {albums.map(({ album, tracks }) => (
          <Pressable
            key={album.id}
            style={styles.card}
            onPress={() => openCollection("album", album.id)}
          >
            <View
              style={[
                styles.artWrap,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Image
                source={album.cover ? { uri: album.cover } : require("../../assets/images/explore.png")}
                style={styles.art}
                contentFit="cover"
              />

              <Pressable
                style={styles.play}
                onPress={() => {
                  if (tracks.length) playTrack(tracks[0], tracks);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Lire l’album ${album.title}`}
              >
                <Play size={14} color={theme.primary} fill={theme.primary} />
              </Pressable>
            </View>

            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              {album.title}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.meta, { color: theme.textSecondary }]}
            >
              {album.artist} • {album.trackCount} morceaux
            </Text>
          </Pressable>
        ))}
      </View>
      {albums.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun album trouvé.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 27,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  card: {
    width: "48%",
  },
  artWrap: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  art: {
    width: "100%",
    height: "100%",
  },
  play: {
    position: "absolute",
    right: 9,
    bottom: 9,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
  },
  meta: {
    fontSize: 11,
    marginTop: 4,
  },
});
