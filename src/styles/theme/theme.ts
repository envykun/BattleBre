import Layout from "./constants/Layout";
import { getThemeColors, type ThemeScheme } from "./constants/Colors";

const radii = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export type ThemeColors = ReturnType<typeof getThemeColors>;

export type Theme = {
  scheme: ThemeScheme;
  colors: ThemeColors;
  spacing: typeof Layout.spacing;
  layout: typeof Layout;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
};

export type ThemeOptions = {
  scheme?: ThemeScheme;
  faction?: string | null;
};

export const createTheme = (options: ThemeOptions = {}): Theme => {
  const scheme = options.scheme ?? "light";
  const colors = getThemeColors(scheme, options.faction ?? undefined);

  return {
    scheme,
    colors,
    spacing: Layout.spacing,
    layout: Layout,
    radii,
    typography,
    shadows,
  };
};
