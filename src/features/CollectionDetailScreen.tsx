import { getAlbumTracks, getArtistTracks, getFolderTracks, getPlaylistTracks, mockAlbums, mockArtists, mockFolders, mockPlaylists } from "@/constants/mockMusic";
import type { CollectionType, Track } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme"
import { usePlayer } from "@/hooks/usePlayer";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { router, useLocalSearchParams } from "expo-router"
import { Image } from "expo-image"
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ArrowLeft, Play, Shuffle } from "lucide-react-native";
import TrackRow from "@/components/TrackRow";
import ScreenContainer from "@/components/ScreenContainer";

function isCollectionType(value: string | undefined): value is CollectionType {
    return value === "playlist" || value === "album" || value === "artist" || value === "folder";
}

export default function CollectionDetailScreen() {
    const theme = useTheme()
    const { type: typeParam, id: idParam } = useLocalSearchParams<{ type?: string | string[]; id?: string | string[]; }>()
    const rawType = Array.isArray(typeParam) ? typeParam[0] : typeParam;
    const type = isCollectionType(rawType) ? rawType : undefined;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { playTrack } = usePlayer();

    let title = ""
    let subtitle = ""
    let cover = ""
    let description = ""
    let tracks: Track[] = []

    switch (type) {
        case "playlist": {
            const playlist = mockPlaylists.find(
                (item) => item.id === id
            );

            if (playlist) {
                title = playlist.title;
                tracks = getPlaylistTracks(playlist.id);
                subtitle = `${tracks.length} morceaux • ${playlist.duration}`;
                cover = playlist.cover;
                description = playlist.description;
            }
            break;
        }

        case "album": {
            const album = mockAlbums.find(
                (item) => item.id === id
            );

            if (album) {
                title = album.title;
                subtitle = `${album.artist} • ${album.year}`;
                cover = album.cover;
                tracks = getAlbumTracks(album.title);
                description = `${tracks.length} morceaux`;
            }
            break;
        }

        case "artist": {
            const artist = mockArtists.find(
                (item) => item.id === id
            );

            if (artist) {
                title = artist.name;
                subtitle = artist.genre;
                cover = artist.cover;
                tracks = getArtistTracks(artist.name);
                description = `${tracks.length} morceaux`;
            }
            break;
        }

        case "folder": {
            const folder = mockFolders.find(
                (item) => item.id === id
            );

            if (folder) {
                title = folder.name;
                subtitle = folder.path;
                cover = "";
                tracks = getFolderTracks(folder.id);
                description = `${tracks.length} morceaux`;
            }
            break;
        }
    }

    const handlePlay = () => {
        if (tracks.length > 0) {
            playTrack(tracks[0], tracks);
        }
    }

    const handleShuffle = () => {
        if (tracks.length === 0) return;

        const shuffled = [...tracks].sort(
            () => Math.random() - 0.5
        );

        playTrack(shuffled[0], shuffled);
    }

    if (!title) {
        return (
            <ScreenContainer
                backgroundColor={theme.backgroundElement}
                includeBottomSafeArea
            >
                <View style={styles.empty}>
                    <Text style={[styles.emptyText, {color: theme.textSecondary}]}>Élément introuvable.</Text>
                    <Pressable onPress={() => router.back()}>
                        <Text style={{ color: theme.tint}}>Retour</Text>
                    </Pressable>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer
            backgroundColor={theme.backgroundElement}
            includeBottomSafeArea
        >
          <View style={styles.fixedHeader}>
            <Pressable
                onPress={() => router.back()}
                style={[styles.backButton, {backgroundColor: theme.backgroundElement}]}
                accessibilityRole="button"
                accessibilityLabel="Retour"
            >
                <ArrowLeft size={23} color={theme.white} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {cover ? (
                <Image 
                    source={{ uri: cover }}
                    style={[
                        styles.cover,
                        {backgroundColor: theme.backgroundElement},
                        type === "artist" && styles.artistCover,
                    ]}
                    contentFit="cover"
                />
            ) : (
                <View style={[styles.folderCover, {backgroundColor: theme.backgroundElement}]}>
                    <Text style={[styles.folderInitial, {color: theme.primary}]}>{title.charAt(0).toUpperCase()}</Text>
                </View>
            )}

            <View style={styles.heading}>
                <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
                <Text style={[styles.subtitle, {color: theme.tint}]}>{subtitle}</Text>
                <Text style={[styles.description, {color: theme.textSecondary}]}>{description}</Text>
            </View>

            <View style={styles.buttons}>
                <Pressable 
                    style={[styles.playButton, {backgroundColor: theme.backgroundElement}]}
                    onPress={handlePlay}
                    disabled={tracks.length === 0}
                >
                    <Play size={19} color={theme.text} fill={theme.text} />
                    <Text style={[styles.playButtonText, {color: theme.text}]}>Lecture</Text>
                </Pressable>
                <Pressable
                    style={[styles.shuffleButton, {backgroundColor: theme.backgroundElement}]}
                    onPress={handleShuffle}
                    disabled={tracks.length === 0}
                >
                    <Shuffle size={19} color={theme.white} />
                    <Text style={[styles.shuffleText, {color: theme.text}]}>Aléatoire</Text>
                </Pressable>
            </View>

            <View style={styles.trackSection}>
                <Text style={[styles.trackSectionTitle, {color: theme.text}]}>Morceaux</Text>
            </View>

            {tracks.length === 0 ? (
                <Text style={[styles.emptyText,  {color: theme.textSecondary}]}>Aucun morceau de démonstration associé à cet élément.</Text>
            ) : (
                tracks.map((track) => (
                    <TrackRow 
                        key={track.id}
                        track={track}
                        tracks={tracks}
                    />
                ))
            )}
          </ScrollView>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 45,
    },
    fixedHeader: {
        height: 54,
        justifyContent: "center",
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
    },
    emptyText: {
        fontSize: 13,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
    },
    cover: {
        width: 230,
        height: 230,
        borderRadius: 16,
        alignSelf: "center",
    },
    artistCover: {
        borderRadius: 115,
    },
    folderCover: {
        width: 230,
        height: 230,
        borderRadius: 15,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    folderInitial: {
        fontSize: 80,
        fontWeight: "800",
    },
    heading: {
        alignItems: "center",
        marginTop: 24,
        gap: 8,
    },
    title: {
        fontSize: 25,
        fontWeight: "800",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 13,
    },
    description: {
        fontSize: 12,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 25,
    },
    playButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    playButtonText: {
        fontWeight: "700",
    },
    shuffleButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    shuffleText: {
        fontWeight: "600",
    },
    trackSection: {
        marginTop: 32,
    },
    trackSectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 12,
    }
})