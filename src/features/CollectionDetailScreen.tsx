import ScreenContainer from "@/components/ScreenContainer";
import TrackRow from "@/components/TrackRow";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { Track, type CollectionType } from "@/constants/musicType";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { getTrackFolder } from "@/services/deviceMusic";
import { decodeCollectionKey } from "@/services/collectionIds";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Play, Shuffle, Trash2, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";

function isCollectionType(value: string | undefined): value is CollectionType {
  return value === "playlist" || value === "album" || value === "artist" || value === "folder";
}

export default function CollectionDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ type?: string | string[]; id?: string | string[] }>();
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const type = isCollectionType(rawType) ? rawType : undefined;
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const {
    libraryTracks,
    playlists,
    playTrack,
    isStorageReady,
    setPlaylistTrackOrder,
    storageError,
  } = usePlayer();
  const [isAddingTracks, setIsAddingTracks] = useState(false);
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const playlist = type === "playlist" ? playlists.find((item) => item.id === rawId) : undefined;
  const albumId = type === "album" && rawId.startsWith("album:")
    ? rawId.slice("album:".length)
    : "";
  const [encodedAlbum = "", encodedArtist = ""] = albumId.split(":");
  const albumTitle = decodeCollectionKey(encodedAlbum);
  const albumArtist = decodeCollectionKey(encodedArtist);
  const artistName = type === "artist" && rawId.startsWith("artist:")
    ? decodeCollectionKey(rawId.slice("artist:".length))
    : "";
  const folderPath = type === "folder" && rawId.startsWith("folder:")
    ? decodeCollectionKey(rawId.slice("folder:".length))
    : "";

  const tracks = useMemo(() => {
    if (playlist) {
      return (playlist.trackIds ?? [])
        .map((trackId) => libraryTracks.find((track) => track.id === trackId))
        .filter((track): track is Track => track !== undefined);
    }
    if (type === "album") {
      return libraryTracks.filter(
        (track) => track.album === albumTitle && track.artist === albumArtist,
      );
    }
    if (type === "artist") {
      return libraryTracks.filter((track) => track.artist === artistName);
    }
    if (type === "folder") {
      return libraryTracks.filter((track) => getTrackFolder(track) === folderPath);
    }
    return [];
  }, [albumArtist, albumTitle, artistName, folderPath, libraryTracks, playlist, type]);

  const title = playlist?.title ?? (
    type === "album" ? albumTitle
      : type === "artist" ? artistName
        : type === "folder" ? folderPath.split("/").filter(Boolean).slice(-1)[0] ?? ""
          : ""
  );
  const cover = playlist?.cover ?? tracks.find((track) => track.cover)?.cover ?? "";
  const subtitle = playlist
    ? `${tracks.length} morceau${tracks.length === 1 ? "" : "x"} · ${playlist.duration}`
    : type === "album"
      ? `${albumArtist} · ${tracks.length} morceau${tracks.length === 1 ? "" : "x"}`
      : type === "artist"
        ? `${tracks.length} morceau${tracks.length === 1 ? "" : "x"}`
        : type === "folder"
          ? folderPath
        : "";
  const description = playlist?.description ?? "";

  const playAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };

  const shuffleAll = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    playTrack(shuffled[0], shuffled);
  };

  const updateTrackOrder = async (trackIds: string[]) => {
    if (!playlist || isUpdatingPlaylist) return;
    setIsUpdatingPlaylist(true);
    setActionError(null);
    try {
      await setPlaylistTrackOrder(playlist.id, trackIds);
    } catch (error) {
      console.error("Impossible de modifier la playlist.", error);
      setActionError("Les morceaux de cette playlist n’ont pas pu être modifiés.");
    } finally {
      setIsUpdatingPlaylist(false);
    }
  };

  const addTrack = (track: Track) => {
    if (!playlist) return;
    void updateTrackOrder([...(playlist.trackIds ?? []), track.id]);
  };

  const removeTrack = (trackId: string) => {
    if (!playlist) return;
    void updateTrackOrder((playlist.trackIds ?? []).filter((id) => id !== trackId));
  };

  const moveTrack = (index: number, direction: -1 | 1) => {
    if (!playlist) return;
    const trackIds = [...(playlist.trackIds ?? [])];
    const target = index + direction;
    if (target < 0 || target >= trackIds.length) return;
    [trackIds[index], trackIds[target]] = [trackIds[target], trackIds[index]];
    void updateTrackOrder(trackIds);
  };

  const availableTracks = libraryTracks.filter(
    (track) => track.uri && !playlist?.trackIds?.includes(track.id),
  );

  if (!title) {
    return (
      <ScreenContainer backgroundColor={theme.backgroundElement} includeBottomSafeArea>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {type === "playlist" && !isStorageReady ? "Chargement de la playlist…" : "Élément introuvable."}
          </Text>
          {storageError ? <Text style={[styles.error, { color: theme.danger }]}>{storageError}</Text> : null}
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: theme.tint }}>Retour</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor={theme.backgroundElement} includeBottomSafeArea>
      <View style={styles.fixedHeader}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <ArrowLeft size={23} color={theme.white} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={cover ? { uri: cover } : require("../../assets/images/explore.png")}
          style={[styles.cover, { backgroundColor: theme.backgroundElement }, type === "artist" && styles.artistCover]}
          contentFit="cover"
        />
        <View style={styles.heading}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.tint }]}>{subtitle}</Text>
          {description ? <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text> : null}
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.playButton, { backgroundColor: theme.backgroundSelected }]}
            onPress={playAll}
            disabled={tracks.length === 0}
          >
            <Play size={19} color={theme.text} fill={theme.text} />
            <Text style={[styles.buttonText, { color: theme.text }]}>Lecture</Text>
          </Pressable>
          <Pressable
            style={[styles.playButton, { backgroundColor: theme.backgroundSelected }]}
            onPress={shuffleAll}
            disabled={tracks.length === 0}
          >
            <Shuffle size={19} color={theme.text} />
            <Text style={[styles.buttonText, { color: theme.text }]}>Aléatoire</Text>
          </Pressable>
        </View>

        <View style={styles.trackSection}>
          <Text style={[styles.trackSectionTitle, { color: theme.text }]}>Morceaux</Text>
          {playlist ? (
            <Pressable onPress={() => setIsAddingTracks(true)} style={styles.addButton}>
              <Plus size={18} color={theme.primary} />
              <Text style={{ color: theme.primary, fontWeight: "600" }}>Ajouter</Text>
            </Pressable>
          ) : null}
        </View>
        {actionError || storageError ? (
          <Text style={[styles.error, { color: theme.danger }]}>{actionError ?? storageError}</Text>
        ) : null}
        {tracks.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {playlist ? "Cette playlist est vide. Ajoutez-y des morceaux de votre bibliothèque." : "Aucun morceau disponible pour cet élément."}
          </Text>
        ) : tracks.map((track, index) => (
          <View key={track.id} style={styles.trackRow}>
            <View style={styles.track}>
              <TrackRow track={track} tracks={tracks} onMorePress={playlist ? () => removeTrack(track.id) : undefined} />
            </View>
            {playlist ? (
              <View style={styles.trackActions}>
                <Pressable
                  onPress={() => moveTrack(index, -1)}
                  disabled={isUpdatingPlaylist || index === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Déplacer vers le haut"
                >
                  <ArrowUp size={17} color={index === 0 ? theme.inactive : theme.textSecondary} />
                </Pressable>
                <Pressable
                  onPress={() => moveTrack(index, 1)}
                  disabled={isUpdatingPlaylist || index === tracks.length - 1}
                  accessibilityRole="button"
                  accessibilityLabel="Déplacer vers le bas"
                >
                  <ArrowDown size={17} color={index === tracks.length - 1 ? theme.inactive : theme.textSecondary} />
                </Pressable>
                <Pressable
                  onPress={() => removeTrack(track.id)}
                  disabled={isUpdatingPlaylist}
                  accessibilityRole="button"
                  accessibilityLabel="Retirer de la playlist"
                >
                  <Trash2 size={17} color={theme.danger} />
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isAddingTracks}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddingTracks(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.addModal, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ajouter des morceaux</Text>
              <Pressable
                onPress={() => setIsAddingTracks(false)}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
              >
                <X size={21} color={theme.textSecondary} />
              </Pressable>
            </View>
            {availableTracks.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Tous les morceaux de la bibliothèque sont déjà dans cette playlist.
              </Text>
            ) : (
              <ScrollView>
                {availableTracks.map((track) => (
                  <Pressable
                    key={track.id}
                    onPress={() => addTrack(track)}
                    disabled={isUpdatingPlaylist}
                    style={styles.availableTrack}
                  >
                    <Image
                      source={track.cover ? { uri: track.cover } : require("../../assets/images/explore.png")}
                      style={styles.availableCover}
                      contentFit="cover"
                    />
                    <View style={styles.availableDetails}>
                      <Text numberOfLines={1} style={{ color: theme.text, fontWeight: "600" }}>{track.title}</Text>
                      <Text numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12 }}>{track.artist}</Text>
                    </View>
                    <Plus size={18} color={theme.primary} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 45 },
  fixedHeader: { height: 54, justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
  emptyText: { fontSize: 13 },
  error: { marginVertical: 10, fontSize: 12 },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  cover: { width: 230, height: 230, borderRadius: 0, alignSelf: "center" },
  artistCover: { borderRadius: 115 },
  heading: { alignItems: "center", marginTop: 24, gap: 8 },
  title: { fontSize: 25, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center" },
  description: { fontSize: 12, textAlign: "center" },
  buttons: { flexDirection: "row", gap: 12, marginTop: 25 },
  playButton: { flex: 1, height: 48, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { fontWeight: "700" },
  trackSection: { marginTop: 32, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trackSectionTitle: { fontSize: 17, fontWeight: "700" },
  addButton: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  track: { flex: 1 },
  trackActions: { flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 5 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  addModal: { maxHeight: "82%", minHeight: "45%", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  availableTrack: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12 },
  availableCover: { width: 46, height: 46, borderRadius: 0 },
  availableDetails: { flex: 1, gap: 4 },
});
