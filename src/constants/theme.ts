import { Platform, StyleSheet } from "react-native";

// ---------------------------------------------------------------------------
// Palette de couleurs
// ---------------------------------------------------------------------------

/** Couleur primaire : #F59127 (orange)
 *  tint  = version plus claire (~+25% luminosité)
 *  shade = version plus sombre (~-20% luminosité)
 */
export const palette = {
  primary: "#F59127",
  primaryTint: "#F8B46A", // orange clair — hover, highlight, icônes actives
  primaryShade: "#C47015", // orange sombre — pressed, bordures, accents forts

  secondary: "#6f2e94", // violet profond — éléments secondaires
  secondaryTint: "#9a5bbb",
  secondaryShade: "#4a1d63",

  // Neutres
  white: "#ffffff",
  black: "#000000",
} as const;

// ---------------------------------------------------------------------------
// Thèmes light / dark
// ---------------------------------------------------------------------------

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#60646C",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    tabBar: "#e3e3e3", // fond de la tab-bar en mode clair
    primary: palette.primary,
    primaryTint: palette.primaryTint,
    primaryShade: palette.primaryShade,
    secondary: palette.secondary,
    secondaryTint: palette.secondaryTint,
    secondaryShade: palette.secondaryShade,
  },
  dark: {
    text: "#ffffff",
    textSecondary: "#B0B4BA",
    background: "#14161b",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    tabBar: "#21252d", // fond de la tab-bar en mode sombre
    primary: palette.primary,
    primaryTint: palette.primaryTint,
    primaryShade: palette.primaryShade,
    secondary: palette.secondary,
    secondaryTint: palette.secondaryTint,
    secondaryShade: palette.secondaryShade,
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = typeof Colors.dark | typeof Colors.light;

// ---------------------------------------------------------------------------
// Typographie & espacements (inchangés)
// ---------------------------------------------------------------------------

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
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

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const TAB_BAR_HEIGHT = Platform.select({ ios: 88, android: 80 }) ?? 70;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ---------------------------------------------------------------------------
// Styles globaux réutilisables
// ---------------------------------------------------------------------------

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
      paddingBottom: TAB_BAR_HEIGHT,
    },
    itemSeparator: {
      borderColor: theme.textSecondary,
      borderWidth: StyleSheet.hairlineWidth,
      opacity: 0.3,
    },
  });
