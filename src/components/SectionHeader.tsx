import { FontSize } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { View, Text, StyleSheet } from "react-native";

interface Props {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export default function SectionHeader({title, actionLabel, onActionPress}: Props) {
    const theme = useTheme();

    return (
        <View style={styles.row}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

            {actionLabel ? (
                <Pressable onPress={onActionPress} hitSlop={8}>
                    <Text style={[styles.action, { color: theme.primary }]}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    action: {
        fontSize: FontSize.xs,
        fontWeight: "600",
    }
})
