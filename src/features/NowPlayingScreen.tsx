import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
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
  ListMusic,
  Volume2,
} from "lucide-react-native";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function durationToSeconds(duration: string) {
  const [minutes, seconds] = duration.split(":").map(Number);
  return minutes * 60 + seconds;
}

function formatTime(seconds: number) {
  const totalSeconds = Math.floor(Number.isFinite(seconds) ? Math.max(0, seconds) : 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
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
    volume,
    setVolume,
    favoriteTrackIds,
    toggleFavorite,
    isShuffleEnabled,
    isRepeatEnabled,
    toggleShuffle,
    toggleRepeat,
    tail,
    duration: playerDuration,
    playbackError,
  } = usePlayer();
  const artworkSize = Math.min(width - 44, height * 0.36, 380);
  const isFavorite = favoriteTrackIds.includes(currentTrack?.id ?? "");

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

  const duration = playerDuration || currentTrack.durationSeconds || durationToSeconds(currentTrack.duration);

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

        <Pressable
          onPress={() => router.push("/tails")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir la file d'attente, ${tail.length} morceaux à suivre`}
        >
          <ListMusic size={23} color={theme.white} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Image
          source={currentTrack.cover ? { uri: currentTrack.cover } : require("../../assets/images/explore.png")}
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
            {playbackError ? (
              <Text style={[styles.playbackError, { color: theme.danger }]}>
                {playbackError}
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={() => toggleFavorite(currentTrack.id)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            accessibilityState={{ selected: isFavorite }}
          >
            <Heart
              size={27}
              color={theme.primary}
              fill={isFavorite ? theme.primary : "transparent"}
            />
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
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={toggleShuffle}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Lecture aléatoire"
            accessibilityState={{ selected: isShuffleEnabled }}
          >
            <Shuffle color={isShuffleEnabled ? theme.primary : theme.textSecondary} size={23} />
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

          <Pressable
            onPress={toggleRepeat}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Répéter"
            accessibilityState={{ selected: isRepeatEnabled }}
          >
            <Repeat color={isRepeatEnabled ? theme.primary : theme.textSecondary} size={23} />
          </Pressable>
        </View>

        <View style={[styles.volumePanel, { backgroundColor: theme.backgroundSelected }]}>
          <View style={styles.volumeHeader}>
            <View style={styles.volumeTitle}>
              <Volume2 size={17} color={theme.textSecondary} />
              <Text style={[styles.volumeLabel, { color: theme.textSecondary }]}>VOLUME</Text>
            </View>
            <Text style={[styles.volumeValue, { color: theme.text }]}>
              {Math.round(volume * 100)}%
            </Text>
          </View>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={setVolume}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.inactive}
            thumbTintColor={theme.primary}
            accessibilityLabel="Volume"
          />
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
  content: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingBottom: 16,
  },
  artwork: {
    maxWidth: "100%",
    borderRadius: 0,
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
  playbackError: {
    fontSize: 11,
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
  volumePanel: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 4,
    borderRadius: 16,
    gap: 3,
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  volumeTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  volumeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  volumeValue: {
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  volumeSlider: {
    width: "100%",
    height: 32,
    margin: 0,
  },
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
