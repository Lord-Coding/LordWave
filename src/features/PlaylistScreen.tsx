import EmptyScreen from "@/components/EmptyScreen";
import ScreenContainer from "@/components/ScreenContainer";


export default function PlaylistScreen() {
  return (
    <ScreenContainer>
      <EmptyScreen 
        icon="musical-notes-outline" 
        title="Aucune playlist" 
        subtitle="Créez votre première playlist pour organiser vos morceaux" 
      />
    </ScreenContainer>
  )
}
