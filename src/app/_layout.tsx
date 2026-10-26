import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "@/context/theme-context";

const App = () => {
  return (
    <ThemeProvider>
      <RootNavigation />
      <StatusBar style="light" />
    </ThemeProvider>
  );
};

const RootNavigation = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default App;
