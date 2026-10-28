import { stackScreenWithSearchBar } from "@/constants/layout";
import { useAppTheme } from "@/context/theme-context";
import { Stack } from "expo-router";

const SongsScreenLayout = () => {
  const theme = useAppTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...stackScreenWithSearchBar(theme),
          headerTitle: "Chansons",
          // headerSearchBarOptions
        }}
      />
    </Stack>
  );
};

export default SongsScreenLayout;
