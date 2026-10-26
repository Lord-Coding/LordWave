import { ScreenWrapper } from "@/components/screen-wrapper";
import { FontSize } from "@/constants/theme";
import { useThemedStyles } from "@/hooks/use-themed-styles";
import { Text } from "react-native";

const FavoritesScreen = () => {
  const styles = useThemedStyles((theme) => ({
    text: { fontSize: FontSize.base, color: theme.text },
  }));

  return (
    <ScreenWrapper>
      <Text style={styles.text}>Favoris Screen</Text>
    </ScreenWrapper>
  );
};

export default FavoritesScreen;
