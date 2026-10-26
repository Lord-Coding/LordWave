import {
    ScrollView,
    ScrollViewProps,
    StyleProp,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/theme-context";

// Hauteur visible de la tab-bar (icône + label), sans la safe area
const TAB_CONTENT_HEIGHT = 60;

type ScreenWrapperProps = ScrollViewProps & {
  /** Padding intérieur horizontal du contenu. Défaut : 16 */
  paddingHorizontal?: number;
  /** Padding intérieur en haut du contenu. Défaut : 24 */
  paddingTop?: number;
  /** Style supplémentaire appliqué au contentContainerStyle */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Wrapper standard pour les pages à défilement.
 * Gère automatiquement :
 *  - la couleur de fond depuis le thème
 *  - le padding bottom dynamique (tab-bar + safe area)
 *  - le padding haut et horizontal par défaut
 */
export function ScreenWrapper({
  children,
  paddingHorizontal = 16,
  paddingTop = 24,
  contentStyle,
  ...rest
}: ScreenWrapperProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // Même calcul que dans la tab-bar
  const paddingBottom = TAB_CONTENT_HEIGHT + insets.bottom + 8;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[
        {
          paddingTop,
          paddingHorizontal,
          paddingBottom,
        },
        contentStyle,
      ]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
