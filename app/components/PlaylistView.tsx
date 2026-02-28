"use client";

import { useState, useMemo } from "react";
import type { Track } from "./Player";
import type { Playlist } from "./AddToPlaylistModal";

interface PlaylistViewProps {
  playlist: Playlist;
  currentTrackId: string | null;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  onRemoveTrack: (playlistId: string, trackId: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onGoBack: () => void;
}

export default function PlaylistView({
  playlist,
  currentTrackId,
  onPlayTrack,
  onRemoveTrack,
  onDeletePlaylist,
  onGoBack,
}: PlaylistViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return playlist.tracks;
    const query = searchQuery.toLowerCase();
    return playlist.tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
    );
  }, [playlist.tracks, searchQuery]);

  const handlePlay = (track: Track) => {
    onPlayTrack(track, filteredTracks);
  };

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      onPlayTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-text-secondary hover:text-foreground text-sm mb-4 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{playlist.name}</h2>
            <p className="text-text-secondary text-sm">
              {playlist.tracks.length === 0
                ? "Esta playlist está vacía"
                : `${playlist.tracks.length} canción${playlist.tracks.length !== 1 ? "es" : ""} · Creada el ${formatDate(playlist.createdAt)}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {playlist.tracks.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
                <span className="hidden sm:inline">Reproducir</span>
              </button>
            )}
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Eliminar playlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showConfirmDelete && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
          <p className="text-sm text-foreground mb-3">
            ¿Eliminar la playlist <strong>{playlist.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onDeletePlaylist(playlist.id);
              }}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Eliminar
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-4 py-2 rounded-lg text-text-secondary hover:bg-hover text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Search within playlist */}
      {playlist.tracks.length > 0 && (
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
              placeholder="Buscar en esta playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Track list */}
      {playlist.tracks.length > 0 && filteredTracks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTracks.map((track) => {
            const isPlaying = currentTrackId === track.id;
            return (
              <div key={track.id} className="group/pl relative">
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(playlist.id, track.id);
                  }}
                  className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover/pl:opacity-100 transition-opacity cursor-pointer hover:bg-red-500 shadow-lg"
                  title="Quitar de playlist"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Track card */}
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
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 ${
                        isPlaying
                          ? "opacity-100"
                          : "opacity-0 group-hover/pl:opacity-100"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                        {isPlaying ? (
                          <EqualizerIcon />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
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
      ) : playlist.tracks.length > 0 && filteredTracks.length === 0 ? (
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
            No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
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
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <p className="text-text-secondary text-lg mb-2">
            Playlist vacía
          </p>
          <p className="text-text-tertiary text-sm">
            Busca canciones y agrégalas a esta playlist
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
        <animate attributeName="height" values="6;10;6" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;4;8" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="6" y="4" width="3" height="10" rx="0.5">
        <animate attributeName="height" values="10;6;10" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="4;8;4" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="11" y="6" width="3" height="8" rx="0.5">
        <animate attributeName="height" values="8;12;8" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;2;6" dur="0.7s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
