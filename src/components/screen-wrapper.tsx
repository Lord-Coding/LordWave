import {
    ScrollView,
    ScrollViewProps,
    StyleProp,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaxContentWidth } from "@/constants/theme";
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
          flexGrow: 1,
        },
        contentStyle,
      ]}
      {...rest}
    >
      <View
        style={{
          maxWidth: MaxContentWidth,
          width: "100%",
          alignSelf: "center",
          flex: 1,
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
