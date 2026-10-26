import { StackScreenWidthSearchBar } from "@/constants/layout";
import { Stack } from "expo-router";

const SongsScreenLayout = () => {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          ...StackScreenWidthSearchBar,
          headerTitle: "Chansons",
        }}
      />
    </Stack>
  );
};

export default SongsScreenLayout;
