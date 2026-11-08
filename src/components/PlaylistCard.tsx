import { getPlaylistTracks } from "@/constants/mockMusic";
import { Playlist } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { MoreVertical, Music2, Play } from "lucide-react-native";

interface Props {
    playlist: Playlist;
    onPress: (playlist: Playlist) => void;
    onPlay: (playlist: Playlist) => void;
    onMore: (playlist: Playlist) => void;
}

export default function PlaylistCard({playlist, onPress, onPlay, onMore}: Props) {
    const theme = useTheme();
    const availableTrackCount = getPlaylistTracks(playlist.id).length;

    return (
        <Pressable 
            onPress={() => onPress(playlist)}
            style={({ pressed }) => [
                styles.card, 
                pressed && styles.pressed
            ]}
        >
            <View style={[styles.coverContainer, {backgroundColor: theme.backgroundElement}]}>
                <Image 
                    source={{ uri: playlist.cover }}
                    style={styles.cover}
                    contentFit="cover"
                    transition={200}
                />

                <View style={styles.overlay} />

                <Pressable
                    style={[styles.playButton, {backgroundColor: theme.white}]}
                    onPress={() => onPlay(playlist)}
                    hitSlop={8}
                >
                    <Play size={17} color={theme.primary} fill={theme.primary} />
                </Pressable>

                <Pressable
                    style={styles.moreButton}
                    onPress={() => onMore(playlist)}
                    hitSlop={8}
                >
                    <MoreVertical size={19} color={theme.white} />
                </Pressable>

                <View style={styles.trackBadge}>
                    <Music2 size={11} color={theme.white} />
                    <Text style={[styles.trackCount, {color: theme.white}]}>{availableTrackCount}</Text>
                </View>
            </View>

            <Text numberOfLines={1} style={[styles.title, {color: theme.text}]}>{playlist.title}</Text>
            <Text numberOfLines={1} style={[styles.description, {color: theme.textSecondary}]}>{playlist.description}</Text>
            <Text style={[styles.duration, {color: theme.inactive}]}>{playlist.duration} • {playlist.updatedAt}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: { width: "48%" },
    coverContainer: {
        aspectRatio: 1,
        borderRadius: 14,
        overflow: "hidden",
    },
    cover: { width: "100%", height: "100%" },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.12)",
    },
    playButton: {
        position: "absolute",
        right: 10,
        bottom: 10,
        width: 37,
        height: 37,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    moreButton: {
        position: "absolute",
        right: 9,
        top: 9,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    trackBadge: {
        position: "absolute",
        left: 9,
        bottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.55",
    },
    trackCount: { 
        fontSize: 10, 
        fontWeight: "600",
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        marginTop: 10,
    },
    description: {
        fontSize: 11,
        marginTop: 4,
    },
    duration: {
        fontSize: 10,
        marginTop: 5,
    },
    pressed: {
        opacity: 0.75,
    }
})
