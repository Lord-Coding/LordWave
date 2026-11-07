import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/theme-context";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <AnimatedSplashOverlay />
        <StatusBar />
        <RootNavigation />
      </PlayerProvider>
    </ThemeProvider>
  );
}

const RootNavigation = () => {
  const theme = useTheme();

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen 
          name="now-playing"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen 
          name="tails"
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen 
          name="details/[type]/[id]"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
};
