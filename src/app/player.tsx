import { unknownTrackImage } from "@/constants/images";
import { FontSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { usePlayer } from "@/stores/PlayerProvider";
import { formatDuration } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { type AudioPlaylistLoopMode } from "expo-audio";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
    GestureResponderEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
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
    volume,
    play,
    pause,
    next,
    previous,
    seekTo,
    setLoop,
    toggleShuffle,
    setVolume,
  } = usePlayer();

  const currentTrack = tracks[currentIndex] ?? null;

  // BUG-002 — barre de progression interactive
  const progressTrackWidth = useRef(0);
  // Barre de volume interactive
  const volumeTrackWidth = useRef(0);

  const handleProgressPress = (e: GestureResponderEvent) => {
    if (progressTrackWidth.current <= 0 || duration <= 0) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / progressTrackWidth.current));
    seekTo(ratio * duration);
  };

  const handleVolumePress = (e: GestureResponderEvent) => {
    if (volumeTrackWidth.current <= 0) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / volumeTrackWidth.current));
    setVolume(ratio);
  };

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

  const artworkSource =
    currentTrack.artwork && currentTrack.artwork.length > 0
      ? { uri: currentTrack.artwork }
      : unknownTrackImage;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Bouton fermer */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Fermer le lecteur"
        >
          <Ionicons name="chevron-down" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Pochette */}
      <View style={styles.artworkContainer}>
        <Image
          source={artworkSource}
          style={styles.artwork}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View>

      {/* Titre + Artiste */}
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

      {/* Barre de progression — BUG-002 : interactive via TouchableOpacity */}
      <View style={styles.progressSection}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleProgressPress}
          accessibilityLabel="Barre de progression"
          accessibilityRole="adjustable"
        >
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.backgroundElement },
            ]}
            onLayout={(e) => {
              progressTrackWidth.current = e.nativeEvent.layout.width;
            }}
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
            {/* Curseur visible sur la progression */}
            <View
              style={[
                styles.progressThumb,
                {
                  backgroundColor: theme.primary,
                  left: `${progressPercent}%`,
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>

      {/* BUG-003 — tous les contrôles sur une seule ligne : shuffle — prev — play — next — repeat */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => toggleShuffle()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel={
            isShuffled ? "Désactiver aléatoire" : "Activer aléatoire"
          }
        >
          <Ionicons
            name="shuffle"
            size={22}
            color={isShuffled ? theme.primary : theme.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => previous()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Morceau précédent"
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
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Morceau suivant"
        >
          <Ionicons name="play-skip-forward" size={28} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.loopContainer}>
          <TouchableOpacity
            onPress={() => setLoop(LOOP_CYCLE[loop])}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={
              loop === "none"
                ? "Répétition désactivée"
                : loop === "single"
                  ? "Répétition du morceau"
                  : "Répétition de la liste"
            }
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

      {/* Barre de volume */}
      <View style={styles.volumeSection}>
        <Ionicons name="volume-low" size={16} color={theme.textSecondary} />
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleVolumePress}
          accessibilityLabel="Volume"
          accessibilityRole="adjustable"
          style={styles.volumeTrackWrapper}
        >
          <View
            style={[
              styles.volumeTrack,
              { backgroundColor: theme.backgroundElement },
            ]}
            onLayout={(e) => {
              volumeTrackWidth.current = e.nativeEvent.layout.width;
            }}
          >
            <View
              style={[
                styles.volumeFill,
                {
                  backgroundColor: theme.primary,
                  width: `${(volume ?? 1) * 100}%`,
                },
              ]}
            />
            <View
              style={[
                styles.volumeThumb,
                {
                  backgroundColor: theme.primary,
                  left: `${(volume ?? 1) * 100}%`,
                },
              ]}
            />
          </View>
        </TouchableOpacity>
        <Ionicons name="volume-high" size={16} color={theme.textSecondary} />
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
    marginBottom: Spacing.five,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "visible",
    marginBottom: Spacing.two,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -4,
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: FontSize.xs,
  },
  // BUG-003 — une seule ligne pour les 5 contrôles
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.four,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
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
  volumeSection: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  volumeTrackWrapper: {
    flex: 1,
  },
  volumeTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "visible",
    position: "relative",
  },
  volumeFill: {
    height: "100%",
    borderRadius: 2,
  },
  volumeThumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
    marginLeft: -6,
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
});

export default PlayerScreen;
