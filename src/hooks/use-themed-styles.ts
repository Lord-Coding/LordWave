import { useMemo } from "react";
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from "react-native";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Crée un StyleSheet à partir d'une factory qui reçoit le thème courant.
 * Le résultat est mémoïsé — il ne recalcule que si le thème change.
 *
 * @example
 * const styles = useThemedStyles((theme) => ({
 *   container: { flex: 1, backgroundColor: theme.background },
 *   title:     { color: theme.text, fontSize: 20 },
 * }));
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useAppTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
