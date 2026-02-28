"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { SearchResultItem } from "../types/api";
import type { Track } from "./Player";

const FALLBACK_SUGGESTIONS = [
  "Bad Bunny", "Taylor Swift", "The Weeknd", "Peso Pluma",
  "Daft Punk", "Arctic Monkeys", "Billie Eilish", "Drake",
];

interface SearchResultsProps {
  query: string;
  results: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
  onPlayTrack: (track: Track) => void;
  currentTrackId: string | null;
  favoriteTracks: Track[];
  onToggleFavorite: (track: Track) => void;
  onSearch: (query: string) => void;
  recentlyPlayed: Track[];
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
  onSearch,
  recentlyPlayed,
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
    return <SearchLanding onSearch={onSearch} recentlyPlayed={recentlyPlayed} />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onSearch("")}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-surface hover:bg-hover border border-border transition-colors cursor-pointer shrink-0"
          title="Volver al buscador"
          aria-label="Volver al buscador"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">
          Resultados para &ldquo;{query}&rdquo;
        </h2>
      </div>

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

/* ====== Pantalla de búsqueda estilo Google ====== */

function SearchLanding({ onSearch, recentlyPlayed }: { onSearch: (q: string) => void; recentlyPlayed: Track[] }) {
  const [localQuery, setLocalQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const fetchedRef = useRef(false);

  const fetchSuggestions = () => {
    if (recentlyPlayed.length === 0) return;

    setLoadingSuggestions(true);

    const tracks = recentlyPlayed.slice(0, 10).map((t) => ({
      title: t.title,
      artist: t.artist,
    }));

    fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recentTracks: tracks }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setAiSuggestions(data.suggestions.slice(0, 8));
        }
      })
      .catch(() => {
        // silencioso, usa fallback
      })
      .finally(() => setLoadingSuggestions(false));
  };

  // Fetch AI suggestions on mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSuggestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentlyPlayed]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) onSearch(localQuery.trim());
  };

  const chips = aiSuggestions.length > 0 ? aiSuggestions : FALLBACK_SUGGESTIONS;
  const isPersonalized = aiSuggestions.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 -mt-4 md:-mt-8">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 md:mb-10 select-none">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
          <span className="text-white font-bold text-2xl md:text-3xl">K</span>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Klarinet</h1>
          <p className="text-text-tertiary text-xs md:text-sm -mt-0.5">Busca tu música favorita</p>
        </div>
      </div>

      {/* Barra de búsqueda grande */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-6">
        <div className="relative group">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Buscar canciones, artistas, álbumes..."
            autoFocus
            className="w-full bg-surface text-foreground text-base md:text-lg rounded-2xl pl-12 pr-14 py-4 outline-none placeholder:text-text-tertiary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm hover:shadow-md focus:shadow-md"
          />
          {localQuery ? (
            <button
              type="button"
              onClick={() => setLocalQuery("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-colors cursor-pointer p-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </form>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
        {loadingSuggestions ? (
          <>
            <span className="text-text-tertiary text-xs mr-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Pensando recomendaciones...
            </span>
            {[...Array(4)].map((_, i) => (
              <span key={i} className="px-3.5 py-1.5 rounded-full text-sm bg-surface border border-border animate-pulse w-24 h-8" />
            ))}
          </>
        ) : (
          <>
            <span className="text-text-tertiary text-xs mr-1 flex items-center gap-1">
              {isPersonalized && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              )}
              {isPersonalized ? "Para ti:" : "Prueba:"}
            </span>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onSearch(chip)}
                className="px-3.5 py-1.5 rounded-full text-sm bg-surface border border-border text-text-secondary hover:text-foreground hover:border-accent/50 hover:bg-hover transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Botón regenerar sugerencias */}
      {!loadingSuggestions && recentlyPlayed.length > 0 && (
        <button
          onClick={fetchSuggestions}
          className="mt-4 flex items-center gap-1.5 text-xs text-text-tertiary hover:text-accent transition-colors cursor-pointer group"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:rotate-180 transition-transform duration-500"
          >
            <polyline points="1 4 1 10 7 10" />
            <polyline points="23 20 23 14 17 14" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Regenerar sugerencias
        </button>
      )}

      {/* Texto decorativo */}
      <p className="mt-10 text-text-tertiary text-xs text-center max-w-sm leading-relaxed">
        Escucha millones de canciones en streaming. Busca por nombre de canción, artista o álbum.
      </p>
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
