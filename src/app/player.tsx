import { unknownTrackImage } from "@/constants/images";
import { FontSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { usePlayer } from "@/stores/PlayerProvider";
import { formatDuration } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { type AudioPlaylistLoopMode } from "expo-audio";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native-safe-area-context";

const LOOP_CYCLE: Record<AudioPlaylistLoopMode, AudioPlaylistLoopMode> = {
  none: "single",
  single: "all",
  all: "none",
};

const PlayerScreen = () => {
  const theme = useAppTheme();
  const router = useRouter();

  const {
    tracks,
    currentIndex,
    currentTime,
    duration,
    playing,
    loop,
    isShuffled,
    play,
    pause,
    next,
    previous,
    setLoop,
    toggleShuffle,
  } = usePlayer();

  const currentTrack = tracks[currentIndex] ?? null;

  if (!currentTrack) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Fermer le lecteur"
          >
            <Ionicons name="chevron-down" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="musical-notes-outline"
            size={72}
            color={theme.textSecondary}
            style={{ opacity: 0.4 }}
          />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucun morceau en lecture
          </Text>
          <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>
            Sélectionnez un morceau dans votre bibliothèque
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Source artwork : base64 si disponible, sinon fallback require()
  const artworkSource = currentTrack.artwork && currentTrack.artwork.length > 0
    ? { uri: currentTrack.artwork, priority: FastImage.priority.normal }
    : unknownTrackImage;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Fermer le lecteur"
        >
          <Ionicons name="chevron-down" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <FastImage
          source={artworkSource}
          style={styles.artwork}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {currentTrack.title}
        </Text>
        {currentTrack.artist ? (
          <Text
            numberOfLines={1}
            style={[styles.artist, { color: theme.textSecondary }]}
          >
            {currentTrack.artist}
          </Text>
        ) : null}
      </View>

      <View style={styles.progressSection}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => previous()}
          accessibilityLabel="Morceau précédent"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="play-skip-back" size={28} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (playing ? pause() : play())}
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          accessibilityLabel={playing ? "Pause" : "Lecture"}
        >
          <Ionicons
            name={playing ? "pause" : "play"}
            size={32}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => next()}
          accessibilityLabel="Morceau suivant"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="play-skip-forward" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.extras}>
        <TouchableOpacity
          onPress={() => toggleShuffle()}
          accessibilityLabel={isShuffled ? "Desactiver aleatoire" : "Activer aleatoire"}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="shuffle"
            size={22}
            color={isShuffled ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.loopContainer}>
          <TouchableOpacity
            onPress={() => setLoop(LOOP_CYCLE[loop])}
            accessibilityLabel={
              loop === "none"
                ? "Repetition desactivee"
                : loop === "single"
                  ? "Repetition du morceau"
                  : "Repetition de la liste"
            }
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="repeat"
              size={22}
              color={loop !== "none" ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>
          {loop === "single" && (
            <Text style={[styles.loopBadgeText, { color: theme.primary }]}>
              1
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  topBar: {
    alignItems: "flex-start",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  artwork: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
  },
  infoContainer: {
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: 4,
  },
  artist: {
    fontSize: FontSize.sm,
  },
  progressSection: {
    marginBottom: Spacing.four,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.two,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: FontSize.xs,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: Spacing.five,
    marginBottom: Spacing.four,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  extras: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  emptyText: {
    fontSize: FontSize.base,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: FontSize.sm,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  loopContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 2,
  },
  loopBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

export default PlayerScreen;
