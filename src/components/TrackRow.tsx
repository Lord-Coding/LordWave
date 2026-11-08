import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Track } from "@/constants/musicType";
import { usePlayer } from "@/hooks/usePlayer";
import { MoreVertical, Play } from "lucide-react-native";

type Props = {
    track: Track;
    tracks?: Track[];
    onMorePress?: (track: Track) => void;
}

export default function TrackRow({track, tracks, onMorePress}: Props) {
    const theme = useTheme()
    const { playTrack } = usePlayer()

    return (
        <Pressable onPress={() => playTrack(track, tracks)} style={styles.container}>
            <Image 
                source={track.cover ? { uri: track.cover } : require("../../assets/images/explore.png")}
                style={[styles.cover, {backgroundColor: theme.backgroundElement}]}
                contentFit="cover"
            />

            <View style={styles.info}>
                <Text numberOfLines={1} style={[styles.title, {color: theme.text}]}>{track.title}</Text>
                <Text numberOfLines={1} style={[styles.subtitle, {color: theme.textSecondary}]}>{track.artist} • {track.album}</Text>
            </View>

            <Text style={[styles.duration, {color: theme.textSecondary}]}>{track.duration}</Text>

            {onMorePress ? (
                <Pressable 
                    hitSlop={10}
                    onPress={() => onMorePress(track)}
                >
                    <MoreVertical size={20} color={theme.white} />
                </Pressable>
            ) : ( 
                <Play size={18} color={theme.white} />
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 9,
    },

    cover: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    info: {
        flex: 1,
        gap: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 12,
    },
    duration: {
        fontSize: 12,
    }
})