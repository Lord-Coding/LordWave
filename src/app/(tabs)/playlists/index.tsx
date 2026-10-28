import { ScreenWrapper } from "@/components/screen-wrapper";
import { FontSize, Spacing } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/use-themed-styles";
import { useNavigationSearch } from "@/hooks/useNavigationSearch";
import { ScrollView, Text } from "react-native";

const PlaylistsScreen = () => {
  const styles = useThemedStyles((theme) => ({
    text: { fontSize: FontSize.base, color: theme.text },
  }));

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: "Rechercher dans les playlists",
    },
  });

  return (
    <ScreenWrapper>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ paddingHorizontal: Spacing.four }}
      >
        {/* TODO: afficher la liste des playlists */}
        <Text style={styles.text}>Playlist Screen</Text>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default PlaylistsScreen;
