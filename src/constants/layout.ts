import { NativeStackNavigationOptions } from "expo-router";
import { Platform } from "react-native";

import { Colors } from "./theme";

// Utilise toujours le thème sombre pour les headers — cohérent avec l'app
const c = Colors.dark;

export const StackScreenWidthSearchBar: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerLargeStyle: {
    backgroundColor: c.background,
  },
  headerLargeTitleStyle: {
    color: c.text,
  },
  headerStyle: {
    backgroundColor: c.background,
  },
  headerTitleStyle: {
    color: c.text,
    fontSize: 36,
    fontWeight: "800",
  },
  headerTintColor: c.text,
  // headerTransparent + blur uniquement sur iOS
  headerTransparent: Platform.OS === "ios",
  headerBlurEffect: Platform.OS === "ios" ? "prominent" : undefined,
  headerShadowVisible: false,
};
