import { mockArtists } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "burnt";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SectionHeader from "./SectionHeader";

export default function ArtistList() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Tous les artistes"
        actionLabel="A → Z"
        onActionPress={() => console.log("[LordWave] Trier les artistes")}
      />

      {mockArtists.map((artist) => (
        <Pressable
          key={artist.id}
          style={styles.row}
          onPress={() =>
            toast({ title: "Artiste sélectionné", message: artist.name })
          }
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
      ))}
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
