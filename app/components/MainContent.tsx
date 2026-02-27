"use client";

import SearchBar from "./SearchBar";

interface MainContentProps {
  onSearch: (query: string) => void;
  children: React.ReactNode;
}

export default function MainContent({ onSearch, children }: MainContentProps) {
  return (
    <main className="md:ml-[var(--sidebar-width)] pb-[calc(var(--player-height)+var(--bottom-nav-height))] h-screen overflow-y-auto">
      {/* Header con búsqueda */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
        {/* Botones de navegación - solo desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-surface/60 flex items-center justify-center text-text-secondary hover:text-foreground transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-surface/60 flex items-center justify-center text-text-secondary hover:text-foreground transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* SearchBar - full width en móvil */}
        <div className="flex-1 md:flex-none">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Perfil placeholder */}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-semibold cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
          U
        </div>
      </header>

      {/* Contenido */}
      <div className="p-4 md:p-8">
        {children}
      </div>
    </main>
  );
}
