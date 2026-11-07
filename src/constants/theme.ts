/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/global.css";

import { Platform, StyleSheet } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    primary: "#ffaa33",
    shade: "#e0962d",
    tint: "#ffb347",
    success: "#2dd55b",
    danger: "#c5000f",
    white: "#ffffff",
    inactive: "#777780",
    tabBar: "#e3e3e3",
  },
  dark: {
    text: "#ffffff",
    background: "#323338",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#dbe0e8",
    primary: "#ffaa33",
    shade: "#e0962d",
    tint: "#ffb347",
    success: "#2dd55b",
    danger: "#c5000f",
    white: "#ffffff",
    inactive: "#777780",
    tabBar: "#21252d",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = (typeof Colors)[keyof typeof Colors];

export const Fonts = Platform.select({
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const FontSize = {
  xs: 12,
  sm: 16,
  base: 20,
  lg: 24,
  extra: 36,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const TAB_BAR_HEIGHT = 60;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const TAB_BAR_WIDTH = "100%";

export const MaxContentWidth = 800;

export const defaultStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    text: {
      fontSize: FontSize.base,
      color: theme.text,
    },
  });

export const utilsStyle = (theme: Theme) =>
  StyleSheet.create({
    contentWithTabBar: {
      paddingBottom: TAB_BAR_HEIGHT + BottomTabInset,
    },
    itemSeparator: {
      borderColor: theme.textSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      opacity: 0.3,
    },
  });
