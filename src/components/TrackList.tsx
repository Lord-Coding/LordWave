import { mockTracks } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "burnt";
import { StyleSheet, View } from "react-native";
import SectionHeader from "./SectionHeader";
import TrackItem from "./TrackItem";

export default function TrackList() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Toutes les chansons"
        actionLabel="Trie"
        onActionPress={() => console.log("[LordWave] Options de tri")}
      />

      {mockTracks.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          onPress={(item) =>
            toast({ title: "Morceau sélectionné", message: item.title })
          }
          onMore={(item) =>
            console.log("[LordWave] Menu du morceau :", item.title)
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingBottom: 24,
  },
});
