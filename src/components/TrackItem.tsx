import { Track } from "@/constants/musicType"
import { useTheme } from "@/hooks/use-theme"
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { EllipsisVertical, Heart } from "lucide-react-native";
import { usePlayer } from "@/hooks/usePlayer";

interface Props {
    track: Track;
    onPress: (track: Track) => void;
    onMore: (track: Track) => void;
}

export default function TrackItem({ track, onPress, onMore }: Props) {
    const theme = useTheme()
    const { favoriteTrackIds } = usePlayer()
    const isFavorite = favoriteTrackIds.includes(track.id)

    return (
        <Pressable 
            onPress={() => onPress(track)}
            style={({ pressed }) => [
                styles.row,
                pressed && styles.pressed,
            ]}
        >
            <Image 
                source={track.cover ? { uri: track.cover } : require("../../assets/images/explore.png")}
                style={[styles.cover, {backgroundColor: theme.backgroundElement}]}
                contentFit="cover"
                transition={150}
            />

            <View style={styles.details}>
                <Text numberOfLines={1} style={[styles.title, {color: theme.text}]}>{track.title}</Text>
                <Text numberOfLines={1} style={[styles.subtitle, {color: theme.textSecondary}]}>{track.artist} • {track.album}</Text>
            </View>

            {isFavorite ? (
                <Heart size={14} color={theme.primary} fill={theme.primary} />
            ) : null}

            <Text style={[styles.duration, {color: theme.textSecondary}]}>{track.duration}</Text>

            <Pressable 
                onPress={() => onMore(track)}
                hitSlop={10}
                style={styles.more}
            >
                <EllipsisVertical size={20} color={theme.textSecondary} />
            </Pressable>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        minHeight: 70,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 7,
    },
    cover: {
        width: 52,
        height: 52,
        borderRadius: 10,
    },
    details: {
        flex: 1,
        gap: 5,
        minWidth: 0,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 11.5,
    },
    duration: {
        fontSize: 11,
        fontVariant: ["tabular-nums"],
    },
    more: {
        paddingLeft: 2,
        paddingVertical: 8,
    },
    pressed: {
        opacity: 0.65,
    }
})