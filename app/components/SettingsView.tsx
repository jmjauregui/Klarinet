"use client";

import { useState, useEffect } from "react";

/** Temas predeterminados con nombre + color accent + hover */
const PRESET_THEMES = [
  { name: "Rojo Klarinet", accent: "#fc3c44", hover: "#ff5e64" },
  { name: "Azul Océano", accent: "#007aff", hover: "#3395ff" },
  { name: "Morado Real", accent: "#af52de", hover: "#c77deb" },
  { name: "Verde Esmeralda", accent: "#30d158", hover: "#5ae07a" },
  { name: "Naranja Atardecer", accent: "#ff9500", hover: "#ffaa33" },
  { name: "Rosa Chicle", accent: "#ff2d55", hover: "#ff5c7c" },
  { name: "Cyan Neón", accent: "#00c7be", hover: "#33d6cf" },
  { name: "Índigo", accent: "#5856d6", hover: "#7a78e0" },
];

const DEFAULT_ACCENT = "#fc3c44";
const DEFAULT_ACCENT_HOVER = "#ff5e64";

function getStoredAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  return localStorage.getItem("klarinet-accent") || DEFAULT_ACCENT;
}

function getStoredAccentHover(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT_HOVER;
  return localStorage.getItem("klarinet-accent-hover") || DEFAULT_ACCENT_HOVER;
}

export function applyAccentColor(accent: string, hover: string) {
  document.documentElement.style.setProperty("--klarinet-accent", accent);
  document.documentElement.style.setProperty("--klarinet-accent-hover", hover);
  localStorage.setItem("klarinet-accent", accent);
  localStorage.setItem("klarinet-accent-hover", hover);
}

export function useAccentColor() {
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [accentHover, setAccentHover] = useState(DEFAULT_ACCENT_HOVER);

  useEffect(() => {
    const stored = getStoredAccent();
    const storedHover = getStoredAccentHover();
    setAccent(stored);
    setAccentHover(storedHover);
    applyAccentColor(stored, storedHover);
  }, []);

  const setColor = (newAccent: string, newHover: string) => {
    setAccent(newAccent);
    setAccentHover(newHover);
    applyAccentColor(newAccent, newHover);
  };

  return { accent, accentHover, setColor };
}

/** Genera un color hover a partir de un accent (mezcla con blanco ~25%) */
function lightenColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * 0.25));
  return `#${mix(r).toString(16).padStart(2, "0")}${mix(g).toString(16).padStart(2, "0")}${mix(b).toString(16).padStart(2, "0")}`;
}

interface SettingsViewProps {
  themeMode: "light" | "dark";
  onThemeToggle: () => void;
  accent: string;
  onAccentChange: (accent: string, hover: string) => void;
}

export default function SettingsView({
  themeMode,
  onThemeToggle,
  accent,
  onAccentChange,
}: SettingsViewProps) {
  const [customColor, setCustomColor] = useState(accent);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetAll = () => {
    // Limpiar todo el localStorage
    localStorage.clear();
    // Recargar la página para que se vuelva a inicializar todo
    window.location.reload();
  };

  const handlePresetSelect = (preset: (typeof PRESET_THEMES)[number]) => {
    setCustomColor(preset.accent);
    onAccentChange(preset.accent, preset.hover);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomColor(hex);
    onAccentChange(hex, lightenColor(hex));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8">Configuraciones</h2>

      {/* === Apariencia === */}
      <section className="mb-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-4">
          Apariencia
        </h3>

        {/* Modo claro / oscuro */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {themeMode === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
              <div>
                <p className="text-sm font-medium">Modo {themeMode === "dark" ? "oscuro" : "claro"}</p>
                <p className="text-xs text-text-tertiary">
                  Alternar entre tema claro y oscuro
                </p>
              </div>
            </div>
            <button
              onClick={onThemeToggle}
              className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
                themeMode === "dark" ? "bg-accent" : "bg-secondary"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  themeMode === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* === Color primario === */}
      <section className="mb-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-4">
          Color primario
        </h3>

        {/* Temas predeterminados */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-4">
          <div className="px-5 pt-4 pb-2">
            <p className="text-sm font-medium mb-3">Temas predeterminados</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pb-5">
            {PRESET_THEMES.map((preset) => {
              const isSelected = accent === preset.accent;
              return (
                <button
                  key={preset.accent}
                  onClick={() => handlePresetSelect(preset)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-transparent hover:border-border hover:bg-hover/50"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: preset.accent }}
                  >
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary font-medium text-center leading-tight">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color personalizado */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg border border-border"
                style={{ backgroundColor: customColor }}
              />
              <div>
                <p className="text-sm font-medium">Color personalizado</p>
                <p className="text-xs text-text-tertiary">
                  Elige cualquier color como acento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary font-mono uppercase">
                {customColor}
              </span>
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* === Restablecer === */}
      <section className="mb-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-4">
          Datos y caché
        </h3>

        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium">Restablecer configuraciones</p>
              <p className="text-xs text-text-tertiary">
                Borra historial, favoritos, preferencias y vuelve al estado
                inicial
              </p>
            </div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
              >
                Restablecer
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-hover transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Versión */}
      <p className="text-text-tertiary text-xs text-center">
        Klarinet v1.0.1 — Hecho con ❤️
      </p>
    </div>
  );
}
