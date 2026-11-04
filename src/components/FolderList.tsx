import { mockFolders } from "@/constants/mockMusic";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "burnt";
import { ChevronRight, Folder } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SectionHeader from "./SectionHeader";

export default function FolderList() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Dossiers musicaux"
        actionLabel="Parcourir"
        onActionPress={() => console.log("[LordWave] Parcourir le stockage")}
      />

      {mockFolders.map((folder) => (
        <Pressable
          key={folder.id}
          style={styles.row}
          onPress={() =>
            toast({ title: "Dossier ouvert", message: folder.name })
          }
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Folder size={22} color={theme.primary}></Folder>
          </View>

          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>
              {folder.name}
            </Text>
            <Text
              style={[styles.path, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {folder.path}
            </Text>
            <Text style={[styles.count, { color: theme.inactive }]}>
              {folder.trackCount}
            </Text>
          </View>

          <ChevronRight size={29} color={theme.inactive} />
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
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 8,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  path: {
    fontSize: 10.5,
  },
  count: {
    fontSize: 10.5,
  },
});
