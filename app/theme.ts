/**
 * Archivo de configuración de colores y tema de Klarinet.
 * Edita estos valores para cambiar la apariencia global de la aplicación.
 * Inspirado en Apple Music con tema light.
 */

export const theme = {
  colors: {
    /** Fondo principal de la aplicación */
    background: "#ffffff",
    /** Fondo de la barra lateral */
    sidebarBg: "#f5f5f7",
    /** Fondo del reproductor inferior */
    playerBg: "#f8f8fa",
    /** Fondo de las tarjetas y superficies elevadas */
    surface: "#f0f0f2",
    /** Fondo de inputs y campos de búsqueda */
    inputBg: "#e8e8ed",
    /** Color de texto principal */
    text: "#1d1d1f",
    /** Color de texto secundario / subtítulos */
    textSecondary: "#6e6e73",
    /** Color de texto terciario / placeholders */
    textTertiary: "#a1a1a6",
    /** Color de acento / resaltado principal */
    accent: "#fc3c44",
    /** Color de hover sobre botones de acento */
    accentHover: "#ff5e64",
    /** Color secundario / elementos inactivos */
    secondary: "#a1a1a6",
    /** Bordes sutiles */
    border: "#d2d2d7",
    /** Fondo de hover sobre elementos */
    hoverBg: "#e8e8ed",
    /** Fondo de elemento activo/seleccionado */
    activeBg: "#e0e0e5",
  },
  /** Dimensiones fijas del layout */
  layout: {
    sidebarWidth: "260px",
    playerHeight: "90px",
  },
} as const;

export type Theme = typeof theme;
