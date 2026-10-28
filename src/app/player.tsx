import { unknownTrackImageUri } from "@/constants/images";
import { FontSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { formatDuration } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native-safe-area-context";

type PlayerParams = {
  title: string;
  artist: string;
  artwork: string;
  duration: string;
};

const PlayerScreen = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<PlayerParams>();

  const [isPlaying, setIsPlaying] = useState(false);

  const duration = parseFloat(params.duration ?? "0");
  const artworkUri =
    params.artwork && params.artwork.length > 0
      ? params.artwork
      : unknownTrackImageUri;

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
        <FastImage
          source={{ uri: artworkUri, priority: FastImage.priority.normal }}
          style={styles.artwork}
        />
      </View>

      {/* Titre + Artiste */}
      <View style={styles.infoContainer}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: theme.text }]}
        >
          {params.title ?? "Titre inconnu"}
        </Text>
        {params.artist ? (
          <Text
            numberOfLines={1}
            style={[styles.artist, { color: theme.textSecondary }]}
          >
            {params.artist}
          </Text>
        ) : null}
      </View>

      {/* Barre de progression */}
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
              { backgroundColor: theme.primary, width: "0%" },
            ]}
          />
        </View>

        {/* Temps */}
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(0)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <TouchableOpacity
          accessibilityLabel="Morceau précédent"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="play-skip-back" size={28} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsPlaying((p) => !p)}
          style={[
            styles.playButton,
            { backgroundColor: theme.primary },
          ]}
          accessibilityLabel={isPlaying ? "Pause" : "Lecture"}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Morceau suivant"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="play-skip-forward" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Shuffle + Repeat */}
      <View style={styles.extras}>
        <TouchableOpacity accessibilityLabel="Aléatoire">
          <Ionicons name="shuffle" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel="Répétition">
          <Ionicons name="repeat" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
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
});

export default PlayerScreen;
