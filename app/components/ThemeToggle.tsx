"use client";

import { useState, useEffect } from "react";

type ThemeMode = "light" | "dark";

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("klarinet-theme") as ThemeMode) || "light";
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("klarinet-theme", mode);
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = getStoredTheme();
    setMode(stored);
    applyTheme(stored);
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    applyTheme(next);
  };

  return { mode, toggle };
}

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
  /** Variante compacta para mobile header */
  compact?: boolean;
}

export default function ThemeToggle({ mode, onToggle, compact }: ThemeToggleProps) {
  const isDark = mode === "dark";

  if (compact) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-input hover:bg-hover transition-colors cursor-pointer"
        title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-foreground hover:bg-hover/50 transition-colors cursor-pointer"
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span>{isDark ? "Tema claro" : "Tema oscuro"}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
