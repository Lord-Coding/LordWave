import { FontSize } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_HEIGHT = 60; // hauteur visible de la barre (icône + label)

const TabsNavigation = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // La hauteur totale = contenu + safe area bottom (barre de navigation Android)
  const tabBarHeight = TAB_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: "500",
        },
        // Supprime l'effet ripple Android et réduit l'opacité au press sur iOS
        tabBarPressColor: "transparent",
        tabBarPressOpacity: 0.6,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: theme.tabBar,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          // Ombre iOS
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          // Ombre Android
          elevation: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="playlists"
        options={{
          title: "Playlist",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="playlist-play"
              size={28}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(songs)"
        options={{
          title: "Chansons",
          tabBarIcon: ({ color }) => (
            <Ionicons name="musical-notes" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoris",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="heart" size={20} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsNavigation;
