import { setAudioModeAsync } from "expo-audio";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { ThemeProvider } from "@/context/theme-context";
import { initDatabase } from "@/database/database";
import { PlayerProvider } from "@/stores/PlayerProvider";

const App = () => {
  useEffect(() => {
    // Configurer le mode audio pour la lecture en arrière-plan
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((err) => console.error("[Audio] setAudioModeAsync failed:", err));

    // Initialiser la base de données SQLite
    initDatabase().catch((err) =>
      console.error("[DB] initDatabase failed:", err),
    );
  }, []);

  return (
    <ThemeProvider>
      <PlayerProvider>
        <RootNavigation />
        <StatusBar style="light" />
      </PlayerProvider>
    </ThemeProvider>
  );
};

const RootNavigation = () => {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="playlist/[id]"
        options={{
          headerShown: true,
          title: "Playlist",
        }}
      />
    </Stack>
  );
};

export default App;
