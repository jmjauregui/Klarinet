"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GENRES } from "./GenreOnboarding";
import type { Track } from "./Player";
import type { SearchResultItem } from "../types/api";

interface HomeViewProps {
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  currentTrackId: string | null;
  recentlyPlayed: Track[];
  onRemoveFromHistory: (trackId: string) => void;
}

interface CustomTag {
  id: string;
  label: string;
}

interface GenreSection {
  genreId: string;
  label: string;
  emoji: string;
  color: string;
  tracks: SearchResultItem[];
  isLoading: boolean;
}

function resultToTrack(item: SearchResultItem): Track {
  return {
    title: item.title,
    artist: item.uploader.username,
    thumbnail: item.thumbnail_src,
    duration: item.duration,
    url: item.url,
    id: item.ID,
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function loadCustomTags(): CustomTag[] {
  try {
    const stored = localStorage.getItem("klarinet-custom-tags");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignorar
  }
  return [];
}

function saveCustomTags(tags: CustomTag[]) {
  localStorage.setItem("klarinet-custom-tags", JSON.stringify(tags));
}

export default function HomeView({
  onPlayTrack,
  currentTrackId,
  recentlyPlayed,
  onRemoveFromHistory,
}: HomeViewProps) {
  const [userGenres, setUserGenres] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [genreSections, setGenreSections] = useState<GenreSection[]>([]);
  const [newTagText, setNewTagText] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Cargar preferencias de géneros y tags personalizados
  useEffect(() => {
    try {
      const stored = localStorage.getItem("klarinet-preferences");
      if (stored) {
        setUserGenres(JSON.parse(stored));
      }
    } catch {
      // ignorar
    }
    setCustomTags(loadCustomTags());
  }, []);

  // Focus input cuando se muestra
  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  // Resolver la info de un tag (built-in o custom)
  const resolveTag = useCallback(
    (tagId: string) => {
      const builtIn = GENRES.find((g) => g.id === tagId);
      if (builtIn) return builtIn;
      const custom = customTags.find((t) => t.id === tagId);
      if (custom)
        return { id: custom.id, label: custom.label, emoji: "🏷️", color: "#6b7280" };
      return { id: tagId, label: tagId, emoji: "🎵", color: "#6b7280" };
    },
    [customTags]
  );

  // Buscar canciones por cada género/tag seleccionado
  useEffect(() => {
    if (userGenres.length === 0) {
      setGenreSections([]);
      return;
    }

    const sections: GenreSection[] = userGenres.map((gId) => {
      const info = resolveTag(gId);
      return {
        genreId: gId,
        label: info.label,
        emoji: info.emoji,
        color: info.color,
        tracks: [],
        isLoading: true,
      };
    });
    setGenreSections(sections);

    sections.forEach((section, i) => {
      setTimeout(() => {
        fetchGenreTracks(section.genreId, section.label);
      }, i * 400);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userGenres, customTags]);

  const fetchGenreTracks = useCallback(
    async (genreId: string, label: string) => {
      try {
        const query = `${label} music mix`;
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.result)) {
          setGenreSections((prev) =>
            prev.map((s) =>
              s.genreId === genreId
                ? { ...s, tracks: data.result.slice(0, 8), isLoading: false }
                : s
            )
          );
        } else {
          setGenreSections((prev) =>
            prev.map((s) =>
              s.genreId === genreId ? { ...s, isLoading: false } : s
            )
          );
        }
      } catch {
        setGenreSections((prev) =>
          prev.map((s) =>
            s.genreId === genreId ? { ...s, isLoading: false } : s
          )
        );
      }
    },
    []
  );

  const handleToggleGenre = (genreId: string) => {
    setUserGenres((prev) => {
      let next: string[];
      if (prev.includes(genreId)) {
        next = prev.filter((g) => g !== genreId);
      } else {
        next = [...prev, genreId];
      }
      localStorage.setItem("klarinet-preferences", JSON.stringify(next));
      return next;
    });
  };

  const handleAddCustomTag = () => {
    const label = newTagText.trim();
    if (!label) return;
    // Crear id slug
    const id = `custom-${label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
    // No duplicar
    if (
      customTags.some((t) => t.id === id) ||
      GENRES.some((g) => g.id === id)
    )
      return;

    const newTag: CustomTag = { id, label };
    const updatedTags = [...customTags, newTag];
    setCustomTags(updatedTags);
    saveCustomTags(updatedTags);

    // Activar automáticamente
    setUserGenres((prev) => {
      const next = [...prev, id];
      localStorage.setItem("klarinet-preferences", JSON.stringify(next));
      return next;
    });

    setNewTagText("");
    setShowTagInput(false);
  };

  const handleRemoveCustomTag = (tagId: string) => {
    setCustomTags((prev) => {
      const next = prev.filter((t) => t.id !== tagId);
      saveCustomTags(next);
      return next;
    });
    // Desactivar si estaba activo
    setUserGenres((prev) => {
      const next = prev.filter((g) => g !== tagId);
      localStorage.setItem("klarinet-preferences", JSON.stringify(next));
      return next;
    });
  };

  const handlePlayFromSection = (
    item: SearchResultItem,
    sectionTracks: SearchResultItem[]
  ) => {
    const track = resultToTrack(item);
    const trackList = sectionTracks.map(resultToTrack);
    onPlayTrack(track, trackList);
  };

  const handlePlayRecentTrack = (track: Track) => {
    onPlayTrack(track, recentlyPlayed);
  };

  return (
    <div>
      {/* Saludo */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-1">
          {getGreeting()}
        </h2>
        <p className="text-text-secondary text-sm md:text-base">
          Descubre nueva música y disfruta tus artistas favoritos
        </p>
      </section>

      {/* Chips de géneros + tags personalizados */}
      <section className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">
            Tus géneros
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Géneros predefinidos */}
          {GENRES.map((genre) => {
            const isActive = userGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                onClick={() => handleToggleGenre(genre.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface/40 text-text-tertiary hover:border-text-tertiary hover:text-text-secondary"
                }`}
              >
                <span>{genre.emoji}</span>
                {genre.label}
              </button>
            );
          })}

          {/* Tags personalizados */}
          {customTags.map((tag) => {
            const isActive = userGenres.includes(tag.id);
            return (
              <div key={tag.id} className="relative group/tag">
                <button
                  onClick={() => handleToggleGenre(tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface/40 text-text-tertiary hover:border-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  <span>🏷️</span>
                  {tag.label}
                </button>
                {/* Botón eliminar en hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCustomTag(tag.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none flex items-center justify-center opacity-0 group-hover/tag:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  title="Eliminar tag"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Botón agregar tag / input */}
          {showTagInput ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={tagInputRef}
                type="text"
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCustomTag();
                  if (e.key === "Escape") {
                    setShowTagInput(false);
                    setNewTagText("");
                  }
                }}
                placeholder="Ej: Lo-Fi, Cumbia..."
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-accent bg-accent/5 text-foreground placeholder:text-text-tertiary outline-none w-36 md:w-44"
                maxLength={30}
              />
              <button
                onClick={handleAddCustomTag}
                disabled={!newTagText.trim()}
                className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowTagInput(false);
                  setNewTagText("");
                }}
                className="w-7 h-7 rounded-full bg-surface border border-border text-text-tertiary flex items-center justify-center text-sm cursor-pointer hover:text-foreground transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-text-tertiary text-text-tertiary hover:border-accent hover:text-accent transition-all cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo tag
            </button>
          )}
        </div>
      </section>

      {/* Escuchado recientemente */}
      {recentlyPlayed.length > 0 && (
        <section className="mb-6 md:mb-10">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold">
              Escuchado recientemente
            </h3>
          </div>
          {/* Carrusel horizontal */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex gap-3 pb-2">
              {recentlyPlayed.slice(0, 20).map((track, idx) => {
                const isPlaying = currentTrackId === track.id;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className="group/card relative flex-shrink-0 w-32 md:w-36"
                  >
                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromHistory(track.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-black/70 backdrop-blur-sm text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-pointer hover:bg-red-500 shadow-sm"
                      title="Eliminar del historial"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => handlePlayRecentTrack(track)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="aspect-square bg-surface rounded-lg mb-1.5 overflow-hidden relative">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 ${
                            isPlaying
                              ? "opacity-100"
                              : "opacity-0 group-hover/card:opacity-100"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
                            {isPlaying ? (
                              <EqualizerIcon />
                            ) : (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="#fff"
                              >
                                <polygon points="6,3 20,12 6,21" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <p
                        className={`text-xs font-medium line-clamp-2 leading-tight mb-0.5 ${
                          isPlaying ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[10px] text-text-secondary truncate">
                        {track.artist}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Secciones por género */}
      {genreSections.map((section) => (
        <section key={section.genreId} className="mb-6 md:mb-10">
          <div className="flex items-center gap-2 mb-3 md:mb-5">
            <span className="text-lg">{section.emoji}</span>
            <h3 className="text-lg md:text-xl font-bold">{section.label}</h3>
          </div>

          {section.isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-surface rounded-lg mb-1.5" />
                  <div className="h-3 bg-surface rounded w-3/4 mb-1" />
                  <div className="h-2.5 bg-surface rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : section.tracks.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {section.tracks.map((item) => {
                const isPlaying = currentTrackId === item.ID;
                return (
                  <button
                    key={item.ID}
                    onClick={() =>
                      handlePlayFromSection(item, section.tracks)
                    }
                    className="group cursor-pointer text-left"
                  >
                    {/* Carátula tipo álbum */}
                    <div className="aspect-square bg-surface rounded-lg mb-1.5 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={item.thumbnail_src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Duración badge */}
                      <span className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium px-1 py-px rounded">
                        {item.duration_text}
                      </span>
                      {/* Play overlay */}
                      <div
                        className={`absolute inset-0 flex items-end justify-end p-1.5 transition-opacity ${
                          isPlaying
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 translate-y-1 group-hover:translate-y-0 transition-transform">
                          {isPlaying ? (
                            <EqualizerIcon />
                          ) : (
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="#fff"
                            >
                              <polygon points="7,3 21,12 7,21" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <p
                      className={`text-[11px] font-semibold leading-tight line-clamp-2 mb-0.5 ${
                        isPlaying ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[10px] text-text-secondary truncate">
                      {item.uploader.username}
                      {item.uploader.verified && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="var(--klarinet-accent)"
                          className="inline-block ml-0.5 -mt-0.5"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-text-tertiary text-sm">
              No se encontraron resultados para este género.
            </p>
          )}
        </section>
      ))}

      {/* Estado vacío si no hay géneros y no hay historial */}
      {userGenres.length === 0 && recentlyPlayed.length === 0 && (
        <section className="text-center py-16">
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
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <p className="text-text-secondary text-lg mb-1">
            Selecciona tus géneros favoritos
          </p>
          <p className="text-text-tertiary text-sm">
            Usa los chips de arriba para personalizar tu home
          </p>
        </section>
      )}
    </div>
  );
}

function EqualizerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
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
