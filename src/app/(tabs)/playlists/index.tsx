import { EmptyState } from "@/components/EmptyState";
import { FontSize, Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { usePlaylists } from "@/hooks/usePlaylists";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PlaylistsScreen = () => {
  const theme = useAppTheme();
  const router = useRouter();
  const { playlists, isLoading, create, remove } = usePlaylists();

  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les playlists",
    },
  });

  const handleCreatePlaylist = async (): Promise<void> => {
    const name = newPlaylistName.trim();
    if (!name) return;
    try {
      await create(name);
      setModalVisible(false);
      setNewPlaylistName("");
    } catch (err) {
      console.error("[Playlists] create failed:", err);
    }
  };

  const handleDeletePlaylist = (id: number, name: string): void => {
    Alert.alert("Supprimer la playlist", `Voulez-vous supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => remove(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <EmptyState icon="musical-notes-outline" title="Chargement…" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Bouton créer */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Créer une playlist"
      >
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Créer une playlist</Text>
      </TouchableOpacity>

      {playlists.length === 0 ? (
        <EmptyState
          icon="musical-notes-outline"
          title="Aucune playlist"
          subtitle="Créez votre première playlist pour organiser vos morceaux"
        />
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 130 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.playlistItem,
                { backgroundColor: theme.backgroundElement },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/playlist/[id]" as never,
                  params: { id: item.id },
                })
              }
              accessibilityLabel={`Ouvrir la playlist ${item.name}`}
            >
              <View
                style={[
                  styles.playlistIcon,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Ionicons name="musical-notes" size={20} color="#ffffff" />
              </View>
              <View style={styles.playlistInfo}>
                <Text
                  numberOfLines={1}
                  style={[styles.playlistName, { color: theme.text }]}
                >
                  {item.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeletePlaylist(item.id, item.name)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel={`Supprimer ${item.name}`}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* Modal création de playlist */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setNewPlaylistName("");
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Nouvelle playlist
            </Text>
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Nom de la playlist"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              autoFocus
              onSubmitEditing={handleCreatePlaylist}
              returnKeyType="done"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { borderColor: theme.backgroundSelected },
                ]}
                onPress={() => {
                  setModalVisible(false);
                  setNewPlaylistName("");
                }}
              >
                <Text style={{ color: theme.textSecondary }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreatePlaylist}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  Créer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    columnGap: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
    borderRadius: 12,
    columnGap: 12,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: Spacing.four,
  },
  modalTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: FontSize.sm,
    marginBottom: Spacing.three,
  },
  modalButtons: {
    flexDirection: "row",
    columnGap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
});

export default PlaylistsScreen;
