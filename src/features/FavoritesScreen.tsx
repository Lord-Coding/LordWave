import EmptyScreen from "@/components/EmptyScreen";
import ScreenContainer from "@/components/ScreenContainer";

export default function FavoritesScreen() {
  return (
    <ScreenContainer>
      <EmptyScreen 
        icon="heart-outline" 
        title="Aucun favoris" 
      />
    </ScreenContainer>
  )
}
