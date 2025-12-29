import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { createTheme, type Theme } from "./theme";
import type { ThemeScheme } from "./constants/Colors";

export type ThemeMode = ThemeScheme | "system";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  faction: string | null;
  setFaction: (faction: string | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialFaction?: string | null;
};

export function ThemeProvider({
  children,
  initialMode = "system",
  initialFaction = null,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme() ?? "light";
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [faction, setFaction] = useState<string | null>(initialFaction);
  const scheme: ThemeScheme = mode === "system" ? systemScheme : mode;

  const theme = useMemo(
    () => createTheme({ scheme, faction }),
    [scheme, faction],
  );
  const value = useMemo(
    () => ({ theme, mode, setMode, faction, setFaction }),
    [theme, mode, faction],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }
  return context;
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: Theme) => T,
) {
  const { theme } = useTheme();
  return useMemo(
    () => StyleSheet.create(createStyles(theme)),
    [createStyles, theme],
  );
}
