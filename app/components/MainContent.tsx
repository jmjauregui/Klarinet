"use client";

import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

interface MainContentProps {
  onSearch: (query: string) => void;
  children: React.ReactNode;
  themeMode: "light" | "dark";
  onThemeToggle: () => void;
}

export default function MainContent({ onSearch, children, themeMode, onThemeToggle }: MainContentProps) {
  return (
    <main className="md:ml-[var(--sidebar-width)] pb-[calc(var(--player-height)+var(--bottom-nav-height))] h-screen overflow-y-auto">
      {/* Header con búsqueda */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex-1 md:flex-none w-full">
          <SearchBar onSearch={onSearch} />
        </div>
        {/* Toggle de tema visible en mobile (oculto en desktop donde está en sidebar) */}
        <div className="md:hidden shrink-0">
          <ThemeToggle mode={themeMode} onToggle={onThemeToggle} compact />
        </div>
      </header>
      <div className="p-4 md:p-8">
        {children}
      </div>
    </main>
  );
}
