import { utilsStyle } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { Track } from "@/types/track";
import { FlatList, FlatListProps, View } from "react-native";
import { TrackListItem } from "./TrackListItem";

export type TracksListProps = Partial<FlatListProps<Track>> & {
  tracks: Track[];
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

export const TracksList = ({ tracks, ...flatlistProps }: TracksListProps) => {
  return (
    <FlatList
      data={tracks}
      contentContainerStyle={{
        paddingTop: 10,
        paddingBottom: 130,
      }}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      renderItem={({ item: track }) => (
        <TrackListItem
          track={{
            ...track,
            image: track.artwork,
          }}
        />
      )}
      {...flatlistProps}
    />
  );
};
