import { EmptyState } from "@/components/EmptyState";
import { ScreenWrapper } from "@/components/screen-wrapper";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";

const FavoritesScreen = () => {
  useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les favoris",
    },
  });

  return (
    <ScreenWrapper>
      <EmptyState
        icon="heart-outline"
        title="Aucun favori pour l'instant"
        subtitle="Les morceaux que vous aimez apparaîtront ici"
      />
    </ScreenWrapper>
  );
};

export default FavoritesScreen;
