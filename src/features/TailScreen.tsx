import TrackRow from "@/components/TrackRow"
import { useTheme } from "@/hooks/use-theme"
import { usePlayer } from "@/hooks/usePlayer"
import { router } from "expo-router"
import { ArrowUp, ChevronDown, ListMusic, MoveDown, Trash2 } from "lucide-react-native"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { RipplePressable as Pressable } from "@/components/RipplePressable"

export default function TailScreen() {
  const theme = useTheme()
  const { currentTrack, tail, removeFromTail, moveInTail, clearTail } = usePlayer()

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.backgroundElement}]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ChevronDown color={theme.white} size={26} />
        </Pressable>

        <Text style={[styles.headerTitle, {color: theme.text}]}>File d'attente</Text>

        <Pressable onPress={clearTail}>
          <Trash2 size={21} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ListMusic color={theme.primary} size={20} />

            <Text style={[styles.sectionTitle, {color: theme.text}]}>En cours de lecture</Text>
          </View>

          {currentTrack ? (
            <TrackRow track={currentTrack} />
          ) : (
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>Aucun Morceau</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>À suivre ({tail.length}) </Text>
          </View>

          {tail.length === 0 ? (
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>Aucun morceau dans la file d'attente</Text>
          ) : (
            tail.map((track, index) => (
              <View key={track.id} style={styles.tailItem}>
                <View style={styles.track}>
                  <TrackRow track={track} />
                </View>

                <View style={styles.actions}>
                  <Pressable 
                    disabled={index === 0}
                    onPress={() => moveInTail(index, index - 1)}
                    style={styles.actionButton}
                  >
                    <ArrowUp size={17} color={index === 0 ? theme.inactive : theme.textSecondary} />
                  </Pressable>

                  <Pressable 
                    disabled={index === tail.length - 1}
                    onPress={() => moveInTail(index, index + 1)}
                    style={styles.actionButton}
                  >
                    <MoveDown  size={17} color={index === tail.length - 1 ? theme.inactive : theme.textSecondary} />
                  </Pressable>

                  <Pressable 
                    onPress={() => removeFromTail(track.id)}
                    style={styles.actionButton}
                  >
                    <Trash2  size={17} color={theme.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#17131F"
  },
  header: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
  },
  tailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  track: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 7,
  }
})
