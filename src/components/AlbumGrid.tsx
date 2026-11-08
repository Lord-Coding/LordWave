import { mockAlbums } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { openCollection } from "@/navigation/openCollection";
import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import SectionHeader from "./SectionHeader";

export default function AlbumGrid({ searchQuery = "" }: { searchQuery?: string }) {
  const theme = useTheme();
  const albums = mockAlbums.filter((album) =>
    [album.title, album.artist, String(album.year)].some((value) =>
      value.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
    ),
  );

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Tous les albums"
        actionLabel="Recents"
        onActionPress={() => console.log("[LordWave] Trier les albums")}
      />

      <View style={styles.grid}>
        {albums.map((album) => (
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
                source={{ uri: album.cover }}
                style={styles.art}
                contentFit="cover"
              />

              <View style={styles.play}>
                <Play size={14} color={theme.primary} fill={theme.primary} />
              </View>
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
              {album.artist} • {album.year}
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
