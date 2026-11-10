import EmptyScreen from "@/components/EmptyScreen";
import PlaylistCard from "@/components/PlaylistCard";
import ScreenContainer from "@/components/ScreenContainer";
import { Playlist } from "@/constants/musicType";
import { RipplePressable as Pressable } from "@/components/RipplePressable";
import { useTheme } from "@/hooks/use-theme";
import { usePlayer } from "@/hooks/usePlayer";
import { openCollection } from "@/navigation/openCollection";
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { ListMusic, Plus, Shuffle, X } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";

type SortMode = "recent" | "title" | "tracks";

export default function PlaylistScreen() {
  const theme = useTheme();
  const {
    createPlaylist,
    deletePlaylist,
    libraryTracks,
    playlists,
    playTrack,
    isStorageReady,
    storageError,
    updatePlaylist,
  } = usePlayer();
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedPlaylists = useMemo(() => {
    const items = [...playlists];
    if (sortMode === "title") return items.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === "tracks") return items.sort((a, b) => b.trackCount - a.trackCount);
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [playlists, sortMode]);

  const openEditor = useCallback((playlist?: Playlist) => {
    setEditingPlaylist(playlist ?? null);
    setTitle(playlist?.title ?? "");
    setDescription(playlist?.description ?? "");
    setEditorError(null);
    setIsEditorVisible(true);
  }, []);

  const saveEditor = async () => {
    if (!title.trim()) {
      setEditorError("Saisissez un nom pour cette playlist.");
      return;
    }

    setIsSaving(true);
    setEditorError(null);
    try {
      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, title, description);
      } else {
        await createPlaylist(title, description);
      }
      setIsEditorVisible(false);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "La playlist n’a pas pu être enregistrée.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = useCallback((playlist: Playlist) => {
    Alert.alert(
      "Supprimer la playlist ?",
      `« ${playlist.title} » sera supprimée. Les fichiers audio ne seront pas affectés.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            void deletePlaylist(playlist.id).catch((error: unknown) => {
              console.error("La suppression de la playlist a échoué.", error);
            });
          },
        },
      ],
    );
  }, [deletePlaylist]);

  const handlePlaylistMore = useCallback((playlist: Playlist) => {
    Alert.alert(playlist.title, "Gérer cette playlist", [
      { text: "Modifier", onPress: () => openEditor(playlist) },
      { text: "Supprimer", style: "destructive", onPress: () => confirmDelete(playlist) },
      { text: "Annuler", style: "cancel" },
    ]);
  }, [confirmDelete, openEditor]);

  const libraryTracksById = useMemo(
    () => new Map(libraryTracks.map((track) => [track.id, track])),
    [libraryTracks],
  );
  const getTracks = useCallback(
    (playlist: Playlist) =>
      (playlist.trackIds ?? [])
        .map((trackId) => libraryTracksById.get(trackId))
        .filter((track): track is NonNullable<typeof track> => Boolean(track?.uri)),
    [libraryTracksById],
  );

  const handlePlaylistPlay = useCallback((playlist: Playlist) => {
    const tracks = getTracks(playlist);
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  }, [getTracks, playTrack]);

  const handleShuffleAll = useCallback(() => {
    const tracks = Array.from(
      new Map(
        sortedPlaylists.flatMap((playlist) => getTracks(playlist)).map((track) => [track.id, track]),
      ).values(),
    );
    if (tracks.length === 0) return;
    const shuffled = [...tracks];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    playTrack(shuffled[0], shuffled);
  }, [getTracks, playTrack, sortedPlaylists]);

  const handlePlaylistPress = useCallback(
    (playlist: Playlist) => openCollection("playlist", playlist.id),
    [],
  );
  const renderPlaylist = useCallback(
    ({ item }: { item: Playlist }) => (
      <PlaylistCard
        playlist={item}
        onPress={handlePlaylistPress}
        onPlay={handlePlaylistPlay}
        onMore={handlePlaylistMore}
      />
    ),
    [handlePlaylistMore, handlePlaylistPlay, handlePlaylistPress],
  );

  const nextSortMode: Record<SortMode, SortMode> = {
    recent: "title",
    title: "tracks",
    tracks: "recent",
  };
  const sortLabel: Record<SortMode, string> = {
    recent: "Récentes",
    title: "Titre",
    tracks: "Morceaux",
  };

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Mes playlists</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Votre musique, organisée à votre façon.
          </Text>
        </View>
        <Pressable
          onPress={() => openEditor()}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Créer une playlist"
        >
          <Plus size={21} color={theme.white} />
        </Pressable>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
        <View style={[styles.summaryIcon, { backgroundColor: theme.primary }]}>
          <ListMusic size={24} color={theme.white} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryNumber, { color: theme.text }]}>{playlists.length}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Playlists créées</Text>
        </View>
        <Pressable
          onPress={handleShuffleAll}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Mélanger toutes les playlists"
          style={[styles.shuffleButton, { backgroundColor: theme.backgroundElement }]}
        >
          <Shuffle size={19} color={theme.primary} />
        </Pressable>
      </View>

      {storageError ? (
        <Text style={[styles.error, { color: theme.danger }]}>{storageError}</Text>
      ) : null}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Votre collection</Text>
        <Pressable
          onPress={() => setSortMode((current) => nextSortMode[current])}
          accessibilityRole="button"
          accessibilityLabel={`Trier les playlists : ${sortLabel[sortMode]}`}
        >
          <Text style={[styles.sortText, { color: theme.primary }]}>{sortLabel[sortMode]}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        style={styles.list}
        contentContainerStyle={[styles.content, sortedPlaylists.length === 0 && styles.emptyContent]}
        data={sortedPlaylists}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderPlaylist}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={!isStorageReady ? (
          <View style={styles.loading}>
            {storageError ? (
              <Text style={[styles.error, { color: theme.danger }]}>{storageError}</Text>
            ) : (
              <>
                <ActivityIndicator color={theme.primary} />
                <Text style={{ color: theme.textSecondary }}>Chargement des playlists…</Text>
              </>
            )}
          </View>
        ) : (
          <EmptyScreen
            icon="musical-notes-outline"
            title="Aucune playlist"
            subtitle="Créez votre première playlist pour organiser vos morceaux."
            action={{ label: "Créer une playlist", onPress: () => openEditor() }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isEditorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditorVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.editor, { backgroundColor: theme.background }]}>
            <View style={styles.editorHeader}>
              <Text style={[styles.editorTitle, { color: theme.text }]}>
                {editingPlaylist ? "Modifier la playlist" : "Nouvelle playlist"}
              </Text>
              <Pressable
                onPress={() => setIsEditorVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
              >
                <X size={21} color={theme.textSecondary} />
              </Pressable>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nom"
              placeholderTextColor={theme.inactive}
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              maxLength={60}
              autoFocus
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description (facultative)"
              placeholderTextColor={theme.inactive}
              style={[styles.input, styles.descriptionInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              maxLength={240}
              multiline
            />
            {editorError ? <Text style={[styles.error, { color: theme.danger }]}>{editorError}</Text> : null}
            <Pressable
              onPress={() => void saveEditor()}
              disabled={isSaving}
              style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isSaving ? 0.6 : 1 }]}
            >
              <Text style={[styles.saveButtonText, { color: theme.white }]}>
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingTop: 20,
    paddingBottom: 35,
  },
  emptyContent: { flexGrow: 1 },
  loading: { flex: 1, minHeight: 220, alignItems: "center", justifyContent: "center", gap: 12 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 36,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: { fontSize: 12, marginTop: 6 },
  addButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 17,
    borderRadius: 17,
    marginBottom: 28,
  },
  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryInfo: { flex: 1, marginLeft: 14, gap: 3 },
  summaryNumber: { fontSize: 19, fontWeight: "800" },
  summaryLabel: { fontSize: 11 },
  shuffleButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  sortText: { fontSize: 12, fontWeight: "600" },
  gridRow: { justifyContent: "space-between", marginBottom: 22 },
  error: { marginBottom: 16, fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  editor: { borderRadius: 20, padding: 20, gap: 13 },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  editorTitle: { fontSize: 18, fontWeight: "700" },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: 12,
    fontSize: 14,
  },
  descriptionInput: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" },
  saveButton: {
    minHeight: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  saveButtonText: { fontSize: 14, fontWeight: "700" },
});
