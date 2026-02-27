"use client";

import { useState, useMemo } from "react";
import type { Track } from "./Player";

interface FavoritesViewProps {
  favorites: Track[];
  currentTrackId: string | null;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  onRemoveFavorite: (trackId: string) => void;
}

export default function FavoritesView({
  favorites,
  currentTrackId,
  onPlayTrack,
  onRemoveFavorite,
}: FavoritesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar favoritos según búsqueda interna
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const query = searchQuery.toLowerCase();
    return favorites.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

  const handlePlay = (track: Track) => {
    onPlayTrack(track, filteredFavorites);
  };

  return (
    <div>
      {/* Header con contador */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Favoritos</h2>
        <p className="text-text-secondary text-sm">
          {favorites.length === 0
            ? "Aún no has agregado canciones a favoritos"
            : `${favorites.length} canción${favorites.length !== 1 ? "es" : ""} guardada${favorites.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {favorites.length > 0 && (
        <>
          {/* Buscador interno */}
          <div className="mb-6">
            <div className="relative">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar en tus favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Grid de favoritos */}
          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFavorites.map((track) => {
                const isPlaying = currentTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    className="group/fav relative"
                  >
                    {/* Botón eliminar de favoritos */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(track.id);
                      }}
                      className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover/fav:opacity-100 transition-opacity cursor-pointer hover:bg-red-500 shadow-lg"
                      title="Quitar de favoritos"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Tarjeta de canción */}
                    <button
                      onClick={() => handlePlay(track)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="aspect-square bg-surface rounded-lg mb-2 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Play overlay */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 ${
                            isPlaying
                              ? "opacity-100"
                              : "opacity-0 group-hover/fav:opacity-100"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                            {isPlaying ? (
                              <EqualizerIcon />
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="#fff"
                              >
                                <polygon points="7,3 21,12 7,21" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold leading-tight line-clamp-2 mb-1 ${
                          isPlaying ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {track.artist}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto mb-4 text-text-tertiary opacity-50"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-text-secondary">
                No se encontraron resultados para "{searchQuery}"
              </p>
            </div>
          )}
        </>
      )}

      {/* Estado vacío */}
      {favorites.length === 0 && (
        <div className="text-center py-16">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-4 text-text-tertiary opacity-50"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-text-secondary text-lg mb-2">
            Aún no tienes favoritos
          </p>
          <p className="text-text-tertiary text-sm">
            Usa el ícono de corazón para guardar tus canciones favoritas
          </p>
        </div>
      )}
    </div>
  );
}

function EqualizerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="#fff">
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
