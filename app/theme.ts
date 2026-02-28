/**
 * Archivo de configuración de colores y tema de Klarinet.
 * Edita estos valores para cambiar la apariencia global de la aplicación.
 * Inspirado en Apple Music con temas light y dark.
 */

export const lightTheme = {
  colors: {
    background: "#ffffff",
    sidebarBg: "#f5f5f7",
    playerBg: "#f8f8fa",
    surface: "#f0f0f2",
    inputBg: "#e8e8ed",
    text: "#1d1d1f",
    textSecondary: "#6e6e73",
    textTertiary: "#a1a1a6",
    accent: "#fc3c44",
    accentHover: "#ff5e64",
    secondary: "#a1a1a6",
    border: "#d2d2d7",
    hoverBg: "#e8e8ed",
    activeBg: "#e0e0e5",
  },
} as const;

export const darkTheme = {
  colors: {
    background: "#0a0a0a",
    sidebarBg: "#111113",
    playerBg: "#141416",
    surface: "#1c1c1e",
    inputBg: "#2c2c2e",
    text: "#f5f5f7",
    textSecondary: "#98989d",
    textTertiary: "#636366",
    accent: "#fc3c44",
    accentHover: "#ff5e64",
    secondary: "#636366",
    border: "#38383a",
    hoverBg: "#2c2c2e",
    activeBg: "#3a3a3c",
  },
} as const;

export const theme = {
  colors: lightTheme.colors,
  layout: {
    sidebarWidth: "260px",
    playerHeight: "90px",
  },
} as const;

export type ThemeMode = "light" | "dark";
export type Theme = typeof theme;
