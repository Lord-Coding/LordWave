import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { openCollection } from "@/navigation/openCollection";
import { ChevronRight, Folder } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { getTrackFolder } from "@/services/deviceMusic";
import { folderCollectionId } from "@/services/collectionIds";
import SectionHeader from "./SectionHeader";

export default function FolderList({ searchQuery = "" }: { searchQuery?: string }) {
  const theme = useTheme();
  const { libraryTracks } = usePlayer();
  const folders = useMemo(() => {
    const groups = new Map<string, number>();
    for (const track of libraryTracks) {
      const path = getTrackFolder(track);
      if (path) groups.set(path, (groups.get(path) ?? 0) + 1);
    }
    return Array.from(groups, ([path, trackCount]) => ({
      id: folderCollectionId(path),
      name: path.split("/").filter(Boolean).slice(-1)[0] ?? path,
      path,
      trackCount,
    })).filter((folder) =>
      `${folder.name} ${folder.path}`.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
    );
  }, [libraryTracks, searchQuery]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Dossiers musicaux"
      />

      {folders.map((folder) => (
        <Pressable
          key={folder.id}
          style={styles.row}
          onPress={() => openCollection("folder", folder.id)}
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
      {folders.length === 0 && (
        <Text style={{ color: theme.textSecondary }}>Aucun dossier trouvé.</Text>
      )}
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
