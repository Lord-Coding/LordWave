import { ScreenWrapper } from "@/components/screen-wrapper";
import { FontSize } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/use-themed-styles";
import { Text } from "react-native";

const PlaylistsScreen = () => {
  const styles = useThemedStyles((theme) => ({
    text: { fontSize: FontSize.base, color: theme.text },
  }));

  return (
    <ScreenWrapper>
      <Text style={styles.text}>Playlist Screen</Text>
    </ScreenWrapper>
  );
};

export default PlaylistsScreen;
