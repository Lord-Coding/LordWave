import { utilsStyle } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { Track } from "@/types/track";
import { FlatList, FlatListProps, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { TrackListItem } from "./TrackListItem";

export type TracksListProps = Partial<FlatListProps<Track>> & {
  tracks: Track[];
  /** Afficher le bouton favori sur chaque item */
  showFavoriteButton?: boolean;
  /** Callback appelé quand l'utilisateur presse le bouton favori */
  onFavoritePress?: (track: Track) => void;
  /** Tableau des URLs de favoris (pour savoir si le cœur est plein) */
  favoriteUrls?: string[];
  /** Callback personnalisé quand on presse un item */
  onTrackPress?: (track: Track, index: number) => void;
};

const ItemDivider = () => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        ...utilsStyle(theme).itemSeparator,
        marginVertical: 9,
        marginLeft: 60,
      }}
    />
  );
};

export const TracksList = ({
  tracks,
  showFavoriteButton,
  onFavoritePress,
  favoriteUrls,
  onTrackPress: _onTrackPress,
  ...flatlistProps
}: TracksListProps) => {
  return (
    <FlatList
      data={tracks}
      contentContainerStyle={{
        paddingTop: 10,
        paddingBottom: 130,
      }}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      renderItem={({ item: track, index }) => {
        const isFav = favoriteUrls
          ? favoriteUrls.includes(track.url ?? "")
          : undefined;

        return (
          <Animated.View
            entering={
              index < 15
                ? FadeInDown.delay(Math.min(index, 14) * 30).duration(300)
                : undefined
            }
          >
            <TrackListItem
              track={{ ...track, image: track.artwork }}
              allTracks={tracks}
              trackIndex={index}
              isFavorite={isFav}
              onFavoritePress={
                showFavoriteButton && onFavoritePress
                  ? () => onFavoritePress(track)
                  : undefined
              }
            />
          </Animated.View>
        );
      }}
      {...flatlistProps}
    />
  );
};
