import { Album } from "@/constants/musicType"
import { useTheme } from "@/hooks/use-theme";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { Play } from "lucide-react-native";
import { FontSize } from "@/constants/theme";

interface Props {
    album: Album;
    onPress: (album: Album) => void;
    onPlay: (album: Album) => void;
}
export default function AlbumCard({ album, onPress, onPlay }: Props) {
    const theme = useTheme();

    return (
        <Pressable 
            onPress={() => onPress(album)}
            style={({pressed}) => [
                styles.card,
                pressed && styles.pressed,
            ]}
        >
            <View style={[ styles.artWrap, { backgroundColor: theme.backgroundElement } ]}>
                <Image 
                    source={{ uri: album.cover }}
                    style={styles.art}
                    contentFit="cover"
                    transition={180}
                />

                <Pressable 
                    hitSlop={8}
                    style={[ styles.play, { backgroundColor: "rgba(255,255,255,0.94)" } ]}
                    onPress={() => onPlay(album)}
                >
                    <Play size={16} color={theme.primary} fill={theme.primary} />
                </Pressable>
            </View>

            <Text numberOfLines={1} style={[ styles.title, { color: theme.text } ]}>{album.title}</Text>
            <Text numberOfLines={1} style={[ styles.artist, { color: theme.textSecondary } ]}>{album.artist}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 150,
        borderRadius: 0,
    },
    artWrap: {
        width: 150,
        height: 150,
        borderRadius: 0,
        overflow: "hidden",
    },
    art: {
        width: "100%",
        height: "100%",
    },
    play: {
        position: "absolute",
        right: 9,
        bottom: 9,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: FontSize.sm,
        fontWeight: "700",
        marginTop: 10,
    },
    artist: {
        fontSize: FontSize.xs,
        marginTop: 4,
    },
    pressed: {
        opacity: 0.82,
    }
})