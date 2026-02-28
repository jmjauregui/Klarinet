"use client";

import { useState } from "react";
import type { Track } from "./Player";

const navItems = [
  { label: "Inicio", icon: HomeIcon, id: "home" },
  { label: "Buscar", icon: SearchIcon, id: "search" },
  { label: "Biblioteca", icon: LibraryIcon, id: "library" },
  { label: "Favoritos", icon: HeartIcon, id: "favorites" },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  currentTrack: Track | null;
}

export default function Sidebar({ activeSection, onNavigate, currentTrack }: SidebarProps) {
  const [playlists] = useState<string[]>([]);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleClearCache = async () => {
    if (isClearingCache) return;
    if (!confirm("¿Limpiar caché de la aplicación? Esto recargará la página.")) return;
    setIsClearingCache(true);
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      window.location.reload();
    } catch {
      alert("Error al limpiar caché. Intenta recargar manualmente.");
      setIsClearingCache(false);
    }
  };

  return (
    <>
      {/* ===== Desktop sidebar (≥768px) ===== */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-[var(--player-height)] w-[var(--sidebar-width)] flex-col border-r border-border z-10 overflow-hidden">
        {/* Fondo con carátula difuminada (efecto glass) */}
        {currentTrack && (
          <div className="absolute inset-0 z-0">
            <img
              src={currentTrack.thumbnail}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110 opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sidebar/80 via-sidebar/90 to-sidebar/95" />
          </div>
        )}
        
        {/* Contenido con efecto glass */}
        <div className="relative z-10 flex flex-col h-full backdrop-blur-xl bg-sidebar/60">
          {/* Logo */}
          <div className="px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Klarinet</h1>
          </div>

          {/* Navegación principal */}
          <nav className="px-3 mt-2">
          {navItems.slice(0, 3).map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 cursor-pointer ${
                  isActive
                    ? "bg-active text-foreground"
                    : "text-text-secondary hover:bg-hover hover:text-foreground"
                }`}
              >
                <item.icon active={isActive} />
                {item.label}
              </button>
            );
          })}
          </nav>

          {/* Separador */}
          <div className="mx-5 my-4 h-px bg-border" />

          {/* Sección de playlists */}
          <div className="px-5 mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Playlists
          </span>
          <button className="text-text-tertiary hover:text-foreground transition-colors cursor-pointer">
            <PlusIcon />
          </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
          {playlists.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-text-tertiary text-sm">
                Aún no tienes playlists
              </p>
              <button className="mt-3 text-accent hover:text-accent-hover text-sm font-medium transition-colors cursor-pointer">
                Crear playlist
              </button>
            </div>
          ) : (
            <ul>
              {playlists.map((pl, i) => (
                <li key={i}>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-hover hover:text-foreground transition-colors cursor-pointer">
                    {pl}
                  </button>
                </li>
              ))}
            </ul>
          )}
          </div>

          {/* Separador */}
          <div className="mx-5 my-3 h-px bg-border" />

          {/* Favoritos */}
          <div className="px-3 pb-3">
          <button
            onClick={() => onNavigate("favorites")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeSection === "favorites"
                ? "bg-active text-foreground"
                : "text-text-secondary hover:bg-hover hover:text-foreground"
            }`}
          >
            <HeartIcon active={activeSection === "favorites"} />
            Favoritos
          </button>
          </div>

          {/* Configuraciones */}
          <div className="px-3 pb-4">
          <button
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeSection === "settings"
                ? "bg-active text-foreground"
                : "text-text-secondary hover:bg-hover hover:text-foreground"
            }`}
          >
            <SettingsIcon active={activeSection === "settings"} />
            Configuraciones
          </button>
          </div>

          {/* Limpiar caché */}
          <div className="px-3 pb-4">
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-tertiary hover:text-foreground hover:bg-hover/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpiar caché y recargar"
            >
              {isClearingCache ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  <span>Limpiando...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                  <span>Limpiar caché</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Mobile bottom tab bar (<768px) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[var(--bottom-nav-height)] bg-sidebar border-t border-border z-30 flex items-center justify-around px-2 safe-area-pb">
        {[...navItems, { label: "Ajustes", icon: SettingsIcon, id: "settings" }].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 cursor-pointer transition-colors ${
                isActive ? "text-accent" : "text-text-secondary"
              }`}
            >
              <item.icon active={isActive} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ====== Iconos SVG inline ====== */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {!active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "var(--klarinet-accent)" : "none"}
      stroke={active ? "var(--klarinet-accent)" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PlusIcon() {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
