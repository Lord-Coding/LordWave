import { mockArtists } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { openCollection } from "@/navigation/openCollection";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import SectionHeader from "./SectionHeader";

export default function ArtistList({ searchQuery = "" }: { searchQuery?: string }) {
  const theme = useTheme();
  const artists = mockArtists.filter((artist) =>
    [artist.name, artist.genre].some((value) =>
      value.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
    ),
  );

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Tous les artistes"
        actionLabel="A → Z"
        onActionPress={() => console.log("[LordWave] Trier les artistes")}
      />

      {artists.length ? artists.map((artist) => (
        <Pressable
          key={artist.id}
          style={styles.row}
          onPress={() => openCollection("artist", artist.id)}
        >
          <Image
            source={{ uri: artist.cover }}
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
              {artist.genre} • {artist.trackCount} titres
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
