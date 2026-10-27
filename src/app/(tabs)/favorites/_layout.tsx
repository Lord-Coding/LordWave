import { stackScreenWithSearchBar } from "@/constants/layout";
import { useAppTheme } from "@/context/theme-context";
import { Stack } from "expo-router";

const FavoritesScreenLayout = () => {
  const theme = useAppTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...stackScreenWithSearchBar(theme),
          headerTitle: "Favoris",
        }}
      />
    </Stack>
  );
};

export default FavoritesScreenLayout;
