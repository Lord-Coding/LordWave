import { useAppTheme } from "@/context/theme-context";
import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { SearchBarProps } from "react-native-screens";

export const useNavigationSearch = ({searchBarOptions}: {searchBarOptions?: SearchBarProps}) => {
  const theme = useAppTheme();
  const [search, setSearch] = useState('');

  const navigation = useNavigation()
  const handleOnChangeText: SearchBarProps['onChangeText'] = ({nativeEvent: {text}}) => {
    setSearch(text)
  }
  
  useLayoutEffect(() => {
    navigation.setOptions({
        headerSearchOptions: {
            ...defaultSearchOptions,
            ...searchBarOptions,
            onChangeText: handleOnChangeText,
        }
    })
  }, [navigation, searchBarOptions])

  const defaultSearchOptions: SearchBarProps = {
    tintColor: theme.primary,
    hideWhenScrolling: false,
  };

  return search;
};
