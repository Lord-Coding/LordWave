import { unknownArtistImage } from "@/constants/images";
import { defaultStyles, FontSize, palette } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { usePlayer } from "@/stores/PlayerProvider";
import { Track } from "@/types/track";
import { formatDuration } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";

export type TrackListItemProps = {
  track: Track & { image?: string };
  /** Toute la queue pour loadQueue (optionnel) */
  allTracks?: Track[];
  /** Index de ce track dans allTracks (optionnel) */
  trackIndex?: number;
  /** Si le cœur est plein ou vide */
  isFavorite?: boolean;
  /** Callback quand on presse le bouton favori */
  onFavoritePress?: () => void;
};

export const TrackListItem = ({
  track,
  allTracks,
  trackIndex,
  isFavorite,
  onFavoritePress,
}: TrackListItemProps) => {
  const theme = useAppTheme();
  const router = useRouter();
  const { loadQueue } = usePlayer();
  const isActiveTrack = false;

  const handlePress = () => {
    if (allTracks !== undefined && trackIndex !== undefined) {
      loadQueue(allTracks, trackIndex);
      router.push("/player" as never);
    } else {
      router.push("/player" as never);
    }
  };

  // Source artwork : base64 ou URI si disponible, sinon fallback require()
  const artworkUri = track.artwork ?? track.image;
  const artworkSource = artworkUri
    ? { uri: artworkUri, priority: FastImage.priority.normal }
    : unknownArtistImage;

  return (
    <TouchableHighlight onPress={handlePress} underlayColor="transparent">
      <View style={styles.trackItemContainer}>
        {/* Pochette */}
        <FastImage
          source={artworkSource}
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

        {/* Bouton favori (optionnel) */}
        {onFavoritePress !== undefined && (
          <TouchableOpacity
            onPress={onFavoritePress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={
              isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>
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
  favoriteButton: {
    paddingLeft: 8,
  },
});
