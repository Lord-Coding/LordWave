import { FontSize } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_HEIGHT = 60;

const TabsNavigation = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_HEIGHT + insets.bottom;

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontSize: FontSize.xs,
            fontWeight: "500",
          },
          // Ripple totalement retiré via style overlay transparent
          tabBarButton: ({ ref: _ref, ...props }) => (
            <Pressable
              {...props}
              android_ripple={{ color: "transparent", radius: 0 }}
            />
          ),
          tabBarStyle: {
            position: "absolute",
            backgroundColor: theme.tabBar,
            borderTopWidth: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: tabBarHeight,
            paddingBottom: insets.bottom,
            elevation: 12,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="playlists"
          options={{
            title: "Playlist",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 50,
                  height: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused
                    ? `${theme.primary}22`
                    : "transparent",
                  borderRadius: 12,
                }}
              >
                <MaterialCommunityIcons
                  name="playlist-play"
                  size={28}
                  color={color as string}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="(songs)"
          options={{
            title: "Chansons",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 50,
                  height: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused
                    ? `${theme.primary}22`
                    : "transparent",
                  borderRadius: 12,
                }}
              >
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={color as string}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favoris",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 50,
                  height: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused
                    ? `${theme.primary}22`
                    : "transparent",
                  borderRadius: 12,
                }}
              >
                <FontAwesome name="heart" size={20} color={color as string} />
              </View>
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
};

export default TabsNavigation;
