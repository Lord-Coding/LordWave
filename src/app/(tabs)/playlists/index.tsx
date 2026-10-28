import { EmptyState } from "@/components/EmptyState";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";

const PlaylistsScreen = () => {
  useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les playlists",
    },
  });

  return (
    <ScreenWrapper>
      <EmptyState
        icon="musical-notes-outline"
        title="Aucune playlist"
        subtitle="Créez votre première playlist pour organiser vos morceaux"
        action={{ label: "Créer une playlist", onPress: () => {} }}
      />
    </ScreenWrapper>
  );
};

export default PlaylistsScreen;
