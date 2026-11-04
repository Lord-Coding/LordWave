import { useTheme } from "@/hooks/use-theme";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"
import { FontSize, Spacing } from "@/constants/theme";

type EmptyStateProps = {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    title: string;
    subtitle?: string;
    action?: { label: string; onPress: () => void };
}

export default function EmptyScreen({ icon, title, subtitle, action }: EmptyStateProps) {
    const theme = useTheme();

    return (
        <View 
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: Spacing.four,
            }}
        >
            <Ionicons 
                name={icon}
                size={72}
                color={theme.textSecondary}
                style={{ opacity: 0.4 }}
            />
            <Text 
                style={{
                    fontSize: FontSize.base,
                    color: theme.text,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginTop: 16,
                }}
            >
                {title}
            </Text>

            {subtitle ? (
                <Text 
                    style={{
                        fontSize: FontSize.sm,
                        color: theme.textSecondary,
                        textAlign: "center",
                        marginTop: 8,
                    }}
                >
                    {subtitle}
                </Text>
            ) : null}

            {action ? (
                <TouchableOpacity 
                    onPress={action.onPress}
                    style={{
                        backgroundColor: theme.primary,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 24,
                        marginTop: 24,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                >
                    <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                        {action.label}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    )
}

