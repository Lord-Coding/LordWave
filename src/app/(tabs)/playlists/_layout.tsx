import { stackScreenWithSearchBar } from "@/constants/layout";
import { useAppTheme } from "@/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

const PlaylistsScreenLayout = () => {
  const theme = useAppTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...stackScreenWithSearchBar(theme),
          headerTitle: "Playlists",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {}}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Paramètres"
              style={{ marginRight: 8 }}
            >
              <Ionicons name="settings-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default PlaylistsScreenLayout;
