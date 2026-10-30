import { unknownTrackImage } from "@/constants/images";
import { FontSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { usePlayer } from "@/stores/PlayerProvider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Mini-player persistant affiché au-dessus de la tab-bar.
 * Visible dès qu'un morceau est dans la queue.
 * Tap → ouvre l'écran de lecture plein écran.
 */
export function MiniPlayer() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tracks, currentIndex, playing, play, pause } = usePlayer();

  const currentTrack = tracks[currentIndex] ?? null;

  // Ne rien afficher s'il n'y a pas de morceau chargé
  if (!currentTrack) return null;

  const artworkSource =
    currentTrack.artwork && currentTrack.artwork.length > 0
      ? { uri: currentTrack.artwork }
      : unknownTrackImage;

  return (
    <TouchableOpacity
      onPress={() => router.push("/player" as never)}
      activeOpacity={0.95}
      accessibilityLabel="Ouvrir le lecteur"
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          // Se positionne juste au-dessus de la tab-bar
          bottom: 60 + insets.bottom,
        },
      ]}
    >
      {/* Barre de progression fine en haut du mini-player */}
      <View
        style={[styles.progressBar, { backgroundColor: theme.backgroundSelected }]}
      />

      <View style={styles.content}>
        {/* Pochette */}
        <Image
          source={artworkSource}
          style={styles.artwork}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {/* Titre + Artiste */}
        <View style={styles.info}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.text }]}
          >
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

        {/* Bouton play/pause */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            playing ? pause() : play();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel={playing ? "Pause" : "Lecture"}
          style={styles.playButton}
        >
          <Ionicons
            name={playing ? "pause" : "play"}
            size={26}
            color={theme.primary}
          />
        </TouchableOpacity>

        {/* Bouton file d'attente (futur) */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            router.push("/player" as never);
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="File d'attente"
          style={styles.queueButton}
        >
          <Ionicons
            name="list"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.two,
    right: Spacing.two,
    borderRadius: 14,
    overflow: "hidden",
    // Ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBar: {
    height: 2,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    columnGap: Spacing.two,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  artist: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  playButton: {
    padding: 4,
  },
  queueButton: {
    padding: 4,
  },
});
