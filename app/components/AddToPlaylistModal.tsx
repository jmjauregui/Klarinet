"use client";

import type { Track } from "./Player";

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

interface AddToPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onCreateNew: () => void;
}

export default function AddToPlaylistModal({
  open,
  onClose,
  track,
  playlists,
  onAddToPlaylist,
  onCreateNew,
}: AddToPlaylistModalProps) {
  if (!open || !track) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isInPlaylist = (pl: Playlist) => pl.tracks.some((t) => t.id === track.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold">Agregar a playlist</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-hover transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Track info */}
        <div className="px-6 py-3 flex items-center gap-3">
          <img src={track.thumbnail} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{track.title}</p>
            <p className="text-xs text-text-secondary truncate">{track.artist}</p>
          </div>
        </div>

        {/* Playlist list */}
        <div className="px-4 pb-2 max-h-64 overflow-y-auto">
          {playlists.length === 0 ? (
            <p className="text-text-tertiary text-sm text-center py-6">
              No tienes playlists aún
            </p>
          ) : (
            <div className="space-y-1">
              {playlists.map((pl) => {
                const alreadyIn = isInPlaylist(pl);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      if (!alreadyIn) {
                        onAddToPlaylist(pl.id, track);
                        onClose();
                      }
                    }}
                    disabled={alreadyIn}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                      alreadyIn
                        ? "text-text-tertiary bg-surface cursor-not-allowed"
                        : "text-foreground hover:bg-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate font-medium">{pl.name}</p>
                        <p className="text-xs text-text-tertiary">{pl.tracks.length} canciones</p>
                      </div>
                    </div>
                    {alreadyIn && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new */}
        <div className="px-4 pb-5 pt-2 border-t border-border mt-2">
          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            Nueva playlist
          </button>
        </div>
      </div>
    </div>
  );
}
