import { StackScreenWidthSearchBar } from "@/constants/layout";
import { Stack } from "expo-router";

const FavoritesScreenLayout = () => {
  return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            ...StackScreenWidthSearchBar,
            headerTitle: "Favoris",
          }}
        />
      </Stack>
  );
};

export default FavoritesScreenLayout;
