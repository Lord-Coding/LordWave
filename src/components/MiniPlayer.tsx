import { usePlayer } from "@/hooks/usePlayer"
import { RipplePressable as Pressable } from "@/components/RipplePressable"
import { View, Text, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { useTheme } from "@/hooks/use-theme";
import { ListMusic, Pause, Play, SkipForward, SkipBack } from "lucide-react-native";
import { router } from "expo-router";

export default function MiniPlayer() {
    const theme = useTheme();
    const { currentTrack, isPlaying, togglePlayback, nextTrack, previousTrack, tail } = usePlayer()

    if (!currentTrack) return null;

    return (
        <View style={[styles.container, {backgroundColor: theme.shade}]}>
            <Pressable
                style={styles.trackArea}
                onPress={() => router.push("/now-playing")}
            >
                <Image 
                    source={{ uri: currentTrack.cover }}
                    style={styles.cover}
                    contentFit="cover"
                />

                <View style={styles.info}>
                    <Text numberOfLines={1} style={[styles.title, {color: theme.text}]}>{currentTrack.title}</Text>
                    <Text numberOfLines={1} style={[styles.artist, {color: theme.textSecondary}]}>{currentTrack.artist}</Text>
                </View>
            </Pressable>

            <Pressable
                style={styles.control}
                onPress={previousTrack}
                hitSlop={8}
            >
                <SkipBack size={23} color={theme.white} fill={theme.white} />
            </Pressable>

            <Pressable
                style={styles.control}
                onPress={togglePlayback}
                hitSlop={8}
            >
                {isPlaying ? (
                    <Pause size={23} color={theme.white} fill={theme.white} />
                ) : (
                    <Play size={23} color={theme.white} fill={theme.white} />
                )}
            </Pressable>

            <Pressable
                style={styles.control}
                onPress={nextTrack}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Morceau suivant"
            >
                <SkipForward size={23} color={theme.white} fill={theme.white} />
            </Pressable>

            <Pressable
                style={styles.control}
                onPress={() => router.push("/tails")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir la file d'attente, ${tail.length} morceaux à suivre`}
            >
                <ListMusic size={20} color={theme.white} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 66,
        marginHorizontal: 12,
        marginBottom: 5,
        paddingRight: 10,
        paddingLeft: 8,
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "#292596",
        borderRadius: 50,
    },
    trackArea: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    cover: {
        width: 50,
        height: 50,
        borderRadius: 30,
    },
    info: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
    },
    artist: {
        fontSize: 11,
    },
    control: {
        padding: 8,
    }
})