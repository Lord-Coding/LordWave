import {
    ScrollView,
    ScrollViewProps,
    StyleProp,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/theme-context";

const TAB_CONTENT_HEIGHT = 60;

type ScreenWrapperProps = ScrollViewProps & {
  paddingHorizontal?: number;
  paddingTop?: number;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenWrapper({
  children,
  paddingHorizontal = 16,
  paddingTop = 24,
  contentStyle,
  ...rest
}: ScreenWrapperProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

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
