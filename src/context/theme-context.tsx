import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import { Colors, Theme } from "@/constants/theme";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<Theme>(Colors.dark);

export function useAppTheme(): Theme {
  return useContext(ThemeContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const scheme = useColorScheme();
  const theme = useMemo(
    () => (scheme === "dark" ? Colors.dark : Colors.light),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
