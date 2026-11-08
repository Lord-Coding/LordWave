import {
  Pressable as NativePressable,
  Platform,
  StyleSheet,
} from "react-native";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NativePressable>;

export function RipplePressable({ style, ...props }: Props) {
  return (
    <NativePressable
      {...props}
      android_ripple={{ color: "rgba(176, 175, 174, 0.2)" }}
      style={(state) => [
        styles.base,
        typeof style === "function" ? style(state) : style,
        Platform.OS !== "android" && state.pressed && styles.pressed,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.72,
  },
});
