import { MusicCategory } from "@/constants/musicType";
import { FontSize } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { ScrollView, Text, StyleSheet } from "react-native";

interface Props {
    selected: MusicCategory;
    onSelect: (category: MusicCategory) => void;
}

const categories: { label: string; value: MusicCategory; }[] = [
    { label: "Chansons", value: "songs" },
    { label: "Artistes", value: "artists" },
    { label: "Albums", value: "albums" },
    { label: "Dossiers", value: "folders" },
]

export default function CategorySelector({ selected, onSelect}: Props) {
    const theme = useTheme()

    return (
        <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.content}
            style={styles.scroll}
        >
            {categories.map(({ label, value }) => {
                const active = selected === value;

                return (
                    <Pressable 
                        key={value}
                        onPress={() => onSelect(value)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        style={({ pressed }) => [
                            { 
                                backgroundColor: theme.backgroundElement,
                                minHeight: 42,
                                paddingHorizontal: 17,
                                borderRadius: 22,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 7,
                            },
                            active && {
                                backgroundColor: theme.primary,
                            },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text 
                            style={[
                                { fontSize: FontSize.sm, color: theme.textSecondary, fontWeight: "600" },
                                active && {color: theme.white},
                            ]}
                        >
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 0,
    },
    content: {
        gap: 9,
    },
    tab: {
        minHeight: 42,
        paddingHorizontal: 17,
        borderRadius: 22,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    pressed: { 
        opacity: 0.78, 
        transform: [{ scale: 0.98 }] 
    }
})
