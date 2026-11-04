import { mockAlbums } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "burnt";
import { ScrollView, StyleSheet, View } from "react-native";
import AlbumCard from "./AlbumCard";
import SectionHeader from "./SectionHeader";

export default function RecommendedAlbums() {
  const theme = useTheme();
  const openAlbum = (album: (typeof mockAlbums)[number]) => {
    // Remplacer par une vraie fonction d'ouverture d'album
    toast({ title: "Album sélectionné", message: album.title });
  };

  const playAlbum = (album: (typeof mockAlbums)[number]) => {
    // Remplacer par une vraie fonction de lancement de lecture d'album
    toast({ title: "Lecture de l'album", message: album.title });
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
