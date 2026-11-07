import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  includeBottomSafeArea?: boolean;
}

export default function ScreenContainer({
  children,
  backgroundColor,
  includeBottomSafeArea = false,
}: ScreenContainerProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: backgroundColor ?? theme.background },
      ]}
      edges={
        includeBottomSafeArea
          ? ["top", "left", "right", "bottom"]
          : ["top", "left", "right"]
      }
    >
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
