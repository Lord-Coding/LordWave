import { NativeStackNavigationOptions } from "expo-router";
import { Platform } from "react-native";

import { Theme } from "./theme";

export const stackScreenWithSearchBar = (
  theme: Theme,
): NativeStackNavigationOptions => ({
  headerLargeTitle: true,
  headerLargeStyle: {
    backgroundColor: theme.background,
  },
  headerLargeTitleStyle: {
    color: theme.text,
  },
  headerStyle: {
    backgroundColor: theme.background,
  },
  headerTitleStyle: {
    color: theme.text,
    fontSize: 36,
    fontWeight: "800",
  },
  headerTintColor: theme.text,
  // headerTransparent + blur uniquement sur iOS
  headerTransparent: Platform.OS === "ios",
  headerBlurEffect: Platform.OS === "ios" ? "prominent" : undefined,
  headerShadowVisible: false,
});
