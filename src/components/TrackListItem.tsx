import { unknownArtistImageUri } from "@/constants/images";
import { defaultStyles, FontSize, palette } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { Track } from "@/types/track";
import { formatDuration } from "@/utils/formatDuration";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import FastImage from "react-native-fast-image";

export type TrackListItemProps = {
  track: Track & { image?: string };
};

export const TrackListItem = ({ track }: TrackListItemProps) => {
  const theme = useAppTheme();
  const router = useRouter();
  const isActiveTrack = false;

  const handlePress = () => {
    router.push({
      // Le cast est nécessaire car les types de routes typedRoutes
      // sont régénérés au prochain démarrage du serveur Metro
      pathname: "/player" as never,
      params: {
        title: track.title,
        artist: track.artist ?? "",
        artwork: track.image ?? track.artwork ?? "",
        duration: String(track.duration ?? ""),
      },
    });
  };

  return (
    <TouchableHighlight onPress={handlePress} underlayColor="transparent">
      <View style={styles.trackItemContainer}>
        {/* Pochette */}
        <FastImage
          source={{
            uri: track.image ?? track.artwork ?? unknownArtistImageUri,
            priority: FastImage.priority.normal,
          }}
          style={{
            ...styles.trackArtworkImage,
            opacity: isActiveTrack ? 0.6 : 1,
          }}
        />

        {/* Titre + Artiste */}
        <View style={styles.trackInfo}>
          <Text
            numberOfLines={1}
            style={{
              ...defaultStyles(theme).text,
              fontSize: FontSize.sm,
              color: isActiveTrack ? palette.primaryTint : theme.text,
            }}
          >
            {track.title}
          </Text>

          {track.artist && (
            <Text
              numberOfLines={1}
              style={{
                ...defaultStyles(theme).text,
                color: theme.textSecondary,
                marginTop: 2,
                fontSize: FontSize.xs,
              }}
            >
              {track.artist}
            </Text>
          )}
        </View>

        {/* Durée */}
        {track.duration !== undefined && (
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: FontSize.xs,
            }}
          >
            {formatDuration(track.duration)}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  trackItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 14,
    paddingRight: 20,
    paddingVertical: 8,
  },
  trackArtworkImage: {
    borderRadius: 8,
    width: 50,
    height: 50,
  },
  trackInfo: {
    flex: 1,
  },
});
