import { EmptyState } from "@/components/EmptyState";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { TracksList } from "@/components/TracksList";
import { Spacing } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { trackTitleFilter } from "@/helpers/filter";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { useMediaLibrary } from "@/services/media-library/useMediaLibrary";
import { PermissionStatus } from "expo-media-library";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SongScreen = () => {
  const theme = useAppTheme();

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les chansons",
    },
  });

  const { tracks, isLoading, error, permissionStatus } = useMediaLibrary();

  const filteredTracks = useMemo(() => {
    if (!search) return tracks;
    return tracks.filter(trackTitleFilter(search));
  }, [tracks, search]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (permissionStatus === PermissionStatus.DENIED) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            LordWave n'a pas accès à votre bibliothèque audio.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openSettings()}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>Ouvrir les paramètres</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {error}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (filteredTracks.length === 0) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="library-outline"
          title="Bibliothèque vide"
          subtitle="Aucun fichier audio trouvé sur cet appareil"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ paddingHorizontal: Spacing.four }}
      >
        <TracksList tracks={filteredTracks} scrollEnabled={false} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SongScreen;
