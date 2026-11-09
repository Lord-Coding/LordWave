import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { openCollection } from "@/navigation/openCollection";
import { artistCollectionId } from "@/services/collectionIds";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader";

export default function ArtistList({ searchQuery = "" }: { searchQuery?: string }) {
  const theme = useTheme();
  const { libraryTracks } = usePlayer();
  const [descending, setDescending] = useState(false);
  const artists = useMemo(() => {
    const groups = new Map<string, typeof libraryTracks>();
    for (const track of libraryTracks) {
      const group = groups.get(track.artist) ?? [];
      group.push(track);
      groups.set(track.artist, group);
    }
    return Array.from(groups, ([name, tracks]) => ({
      id: artistCollectionId(name),
      name,
      cover: tracks.find((track) => track.cover)?.cover ?? "",
      trackCount: tracks.length,
    }))
      .filter((artist) =>
        artist.name.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
      )
      .sort((left, right) => left.name.localeCompare(right.name) * (descending ? -1 : 1));
  }, [descending, libraryTracks, searchQuery]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Tous les artistes"
        actionLabel={descending ? "Z → A" : "A → Z"}
        onActionPress={() => setDescending((value) => !value)}
      />

      {artists.length ? artists.map((artist) => (
        <Pressable
          key={artist.id}
          style={styles.row}
          onPress={() => openCollection("artist", artist.id)}
        >
          <Image
            source={artist.cover ? { uri: artist.cover } : require("../../assets/images/explore.png")}
            style={[
              styles.avatar,
              { backgroundColor: theme.backgroundElement },
            ]}
            contentFit="cover"
          />

          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>
              {artist.name}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {artist.trackCount} morceaux
            </Text>
          </View>

          <ChevronRight size={19} color={theme.inactive} />
        </Pressable>
      )) : <Text style={{ color: theme.textSecondary }}>Aucun artiste trouvé.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 27,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 9,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    fontSize: 11.5,
  },
});
