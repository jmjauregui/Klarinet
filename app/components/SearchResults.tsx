"use client";

import type { SearchResultItem } from "../types/api";
import type { Track } from "./Player";

interface SearchResultsProps {
  query: string;
  results: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
  onPlayTrack: (track: Track) => void;
  currentTrackId: string | null;
  favoriteTracks: Track[];
  onToggleFavorite: (track: Track) => void;
}

export default function SearchResults({
  query,
  results,
  isLoading,
  error,
  onPlayTrack,
  currentTrackId,
  favoriteTracks,
  onToggleFavorite,
}: SearchResultsProps) {
  const isFavorite = (id: string) => favoriteTracks.some((t) => t.id === id);
  const handlePlay = (item: SearchResultItem) => {
    const track: Track = {
      title: item.title,
      artist: item.uploader.username,
      thumbnail: item.thumbnail_src,
      duration: item.duration,
      url: item.url,
      id: item.ID,
    };
    onPlayTrack(track);
  };

  const formatViews = (views: number): string => {
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views.toString();
  };

  if (!query) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Buscar</h2>
        <p className="text-text-secondary">
          Escribe algo en la barra de búsqueda para encontrar canciones y
          artistas
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Resultados para &ldquo;{query}&rdquo;
      </h2>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-text-tertiary border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Buscando canciones...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Sin resultados */}
      {!isLoading && !error && results.length === 0 && (
        <div className="text-center py-20">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--klarinet-text-tertiary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 opacity-50"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="text-text-secondary text-lg mb-1">
            No se encontraron resultados
          </p>
          <p className="text-text-tertiary text-sm">
            Intenta con otra búsqueda
          </p>
        </div>
      )}

      {/* Lista de resultados */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-1">
          {/* Header de la tabla */}
          <div className="hidden md:grid grid-cols-[40px_36px_1fr_120px_100px_80px] gap-4 px-4 py-2 text-xs text-text-tertiary uppercase tracking-wider border-b border-border mb-2">
            <span>#</span>
            <span></span>
            <span>Título</span>
            <span>Canal</span>
            <span className="text-right">Vistas</span>
            <span className="text-right">Duración</span>
          </div>

          {results.map((item, index) => {
            const isCurrentTrack = currentTrackId === item.ID;

            return (
              <button
                key={item.ID}
                onClick={() => handlePlay(item)}
                className={`w-full grid grid-cols-[32px_1fr_50px] md:grid-cols-[40px_36px_1fr_120px_100px_80px] gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-left transition-colors group cursor-pointer ${
                  isCurrentTrack
                    ? "bg-accent/15 text-accent"
                    : "hover:bg-hover"
                }`}
              >
                {/* Número / Play icon */}
                <span className="hidden md:flex items-center justify-center">
                  <span className="group-hover:hidden text-sm text-text-tertiary tabular-nums">
                    {isCurrentTrack ? (
                      <EqualizerIcon />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden group-hover:block text-foreground">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  </span>
                </span>

                {/* Corazón favorito */}
                <span
                  className="flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    const track: Track = {
                      title: item.title,
                      artist: item.uploader.username,
                      thumbnail: item.thumbnail_src,
                      duration: item.duration,
                      url: item.url,
                      id: item.ID,
                    };
                    onToggleFavorite(track);
                  }}
                >
                  {isFavorite(item.ID) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--klarinet-accent)" className="transition-transform hover:scale-110 flex-shrink-0">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-text-tertiary)" strokeWidth="2" className="transition-all hover:stroke-accent hover:scale-110 flex-shrink-0">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </span>

                {/* Thumbnail + Título */}
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded bg-surface overflow-hidden flex-shrink-0">
                    <img
                      src={item.thumbnail_src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium truncate ${
                        isCurrentTrack ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="block text-xs text-text-secondary truncate">
                      {item.uploader.username}
                      {item.uploader.verified && (
                        <VerifiedBadge />
                      )}
                    </span>
                  </span>
                </span>

                {/* Canal */}
                <span className="hidden md:flex items-center text-xs text-text-secondary truncate">
                  {item.uploader.username}
                </span>

                {/* Vistas */}
                <span className="hidden md:flex items-center justify-end text-xs text-text-secondary tabular-nums">
                  {formatViews(item.views)}
                </span>

                {/* Duración */}
                <span className="flex items-center justify-end text-xs text-text-secondary tabular-nums">
                  {item.duration_text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EqualizerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--klarinet-accent)">
      <rect x="1" y="8" width="3" height="6" rx="0.5">
        <animate
          attributeName="height"
          values="6;10;6"
          dur="0.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values="8;4;8"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="6" y="4" width="3" height="10" rx="0.5">
        <animate
          attributeName="height"
          values="10;6;10"
          dur="0.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values="4;8;4"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="11" y="6" width="3" height="8" rx="0.5">
        <animate
          attributeName="height"
          values="8;12;8"
          dur="0.7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values="6;2;6"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="var(--klarinet-accent)"
      className="inline-block ml-1 -mt-0.5"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}
