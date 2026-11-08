import MiniPlayer from "@/components/MiniPlayer";
import { FontSize } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { BottomTabBar } from "expo-router/build/layouts/Tabs";
import { Heart, ListVideo, type LucideIcon } from "lucide-react-native";
import { View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_HEIGHT = 60;

function makeTabBarIcon(Icon: LucideIcon) {
  return ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <Icon
      color={color as string}
      size={size}
      fill={focused ? (color as string) : "none"}
    />
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          paddingTop: 8,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
        },
        tabBarButton: ({ ref: _ref, ...props }) => (
          <Pressable
            {...props}
          />
        ),
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: "600",
        },
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => (
        <View style={{ backgroundColor: "transparent" }}>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tabs.Screen
        name="playlist"
        options={{
          title: "Playlist",
          tabBarIcon: makeTabBarIcon(ListVideo),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Bibliothèque",
          headerShown: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          tabBarIcon: ({
            color,
            size,
            focused,
          }: {
            color: ColorValue;
            size: number;
            focused: boolean;
          }) => (
            <Ionicons
              name={focused ? "musical-notes" : "musical-notes-outline"}
              color={color as string}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoris",
          tabBarIcon: makeTabBarIcon(Heart),
        }}
      />
    </Tabs>
  );
}
