import { EmptyState } from "@/components/EmptyState";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { TracksList } from "@/components/TracksList";
import { useAppTheme } from "@/context/theme-context";
import { type FavoriteRow } from "@/database/repositories/favoritesRepository";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { Track } from "@/types/track";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function favoriteRowToTrack(row: FavoriteRow): Track {
  return {
    url: row.trackUrl,
    title: row.trackTitle,
    artist: row.trackArtist ?? undefined,
    album: row.trackAlbum ?? undefined,
  };
}

const FavoritesScreen = () => {
  const theme = useAppTheme();
  const { favorites, isLoading, remove } = useFavorites();

  useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les favoris",
    },
  });

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (favorites.length === 0) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="heart-outline"
          title="Aucun favori pour l'instant"
          subtitle="Les morceaux que vous aimez apparaîtront ici"
        />
      </ScreenWrapper>
    );
  }

  const tracks = favorites.map(favoriteRowToTrack);
  const favoriteUrls = favorites.map((f) => f.trackUrl);

  return (
    <ScreenWrapper>
      <TracksList
        tracks={tracks}
        showFavoriteButton
        favoriteUrls={favoriteUrls}
        onFavoritePress={(track: Track) => {
          if (track.url) remove(track.url);
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FavoritesScreen;
