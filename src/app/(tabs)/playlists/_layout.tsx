import { StackScreenWidthSearchBar } from "@/constants/layout";
import { Stack } from "expo-router";

const PlaylistsScreenLayout = () => {
  return (
    <Stack>
        <Stack.Screen
            name="index"
            options={{
            ...StackScreenWidthSearchBar,
            headerTitle: "Playlists",
            }}
        />
    </Stack>
  );
};

export default PlaylistsScreenLayout;
