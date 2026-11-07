import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { router } from "expo-router";
import {
  ArrowDown,
  Heart,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { Pressable, Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function durationToSeconds(duration: string) {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function NowPlayingScreen() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const {
    currentTrack,
    isPlaying,
    togglePlayback,
    nextTrack,
    currentTime,
    previousTrack,
    seekTo,
  } = usePlayer();
  const artworkSize = Math.min(width - 44, height * 0.4, 380);

  if (!currentTrack) {
    return (
      <SafeAreaView
        style={[styles.empty, { backgroundColor: theme.backgroundElement }]}
      >
        <Text style={{ color: theme.text }}>
          Aucun morceau en cours de lecture
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.primary }}>Retour</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const duration = durationToSeconds(currentTrack.duration);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fermer le lecteur"
        >
          <ArrowDown size={25} color={theme.white} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.headerLabel, { color: theme.textSecondary }]}>
            EN COURS DE LECTURE
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            LordWave
          </Text>
        </View>

        <View style={styles.headerActionPlaceholder} />
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: currentTrack.cover }}
          style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.trackInfo}>
          <View style={styles.trackText}>
            <Text
              numberOfLines={1}
              style={[styles.trackTitle, { color: theme.text }]}
            >
              {currentTrack.title}
            </Text>
            <Text style={[styles.artist, { color: theme.textSecondary }]}>
              {currentTrack.artist}
            </Text>
          </View>

          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Ajouter aux favoris"
          >
            <Heart size={27} color={theme.primary} />
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          <Slider
            minimumValue={0}
            maximumValue={Math.max(duration, 1)}
            value={Math.min(currentTime, duration)}
            onSlidingComplete={seekTo}
            minimumTrackTintColor={theme.tint}
            maximumTrackTintColor={theme.shade}
            thumbTintColor={theme.primary}
          />

          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {currentTrack.duration}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable hitSlop={10} accessibilityLabel="Lecture aléatoire">
            <Shuffle color={theme.textSecondary} size={23} />
          </Pressable>

          <Pressable
            onPress={previousTrack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Morceau précédent"
          >
            <SkipBack size={30} color={theme.white} />
          </Pressable>

          <Pressable
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            onPress={togglePlayback}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Mettre en pause" : "Lire"}
          >
            {isPlaying ? (
              <Pause size={30} color={theme.backgroundElement} fill={theme.backgroundElement} />
            ) : (
              <Play size={30} color={theme.backgroundElement} fill={theme.backgroundElement} />
            )}
          </Pressable>

          <Pressable
            onPress={nextTrack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Morceau suivant"
          >
            <SkipForward size={23} color={theme.white} />
          </Pressable>

          <Pressable hitSlop={10} accessibilityLabel="Répéter">
            <Repeat color={theme.textSecondary} size={23} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    alignItems: "center",
    gap: 4,
  },
  headerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerActionPlaceholder: {
    width: 25,
  },
  content: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingBottom: 16,
  },
  artwork: {
    maxWidth: "100%",
    borderRadius: 18,
    alignSelf: "center",
    backgroundColor: "#292596",
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  trackText: {
    flex: 1,
    gap: 7,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  artist: {
    fontSize: 15,
  },
  progressContainer: {
    gap: 2,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 11,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
