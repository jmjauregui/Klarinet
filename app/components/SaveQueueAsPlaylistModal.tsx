"use client";

import { useState, type FormEvent } from "react";
import type { Track } from "./Player";
import type { Playlist } from "./AddToPlaylistModal";

interface SaveQueueAsPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  tracks: Track[];
  existingPlaylists: Playlist[];
  onSaveNew: (name: string, tracks: Track[]) => void;
  onAddToExisting: (playlistId: string, tracks: Track[]) => void;
}

export default function SaveQueueAsPlaylistModal({
  open,
  onClose,
  tracks,
  existingPlaylists,
  onSaveNew,
  onAddToExisting,
}: SaveQueueAsPlaylistModalProps) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(tracks.map((t) => t.id)));
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");

  if (!open) return null;

  const toggleTrack = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === tracks.length) setSelected(new Set());
    else setSelected(new Set(tracks.map((t) => t.id)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selected.size === 0) { setError("Selecciona al menos una canción"); return; }

    if (mode === "new") {
      const trimmed = name.trim();
      if (!trimmed) { setError("El nombre no puede estar vacío"); return; }
      if (existingPlaylists.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        setError("Ya existe una playlist con ese nombre");
        return;
      }
      onSaveNew(trimmed, tracks.filter((t) => selected.has(t.id)));
    } else {
      if (!selectedPlaylistId) { setError("Selecciona una playlist"); return; }
      onAddToExisting(selectedPlaylistId, tracks.filter((t) => selected.has(t.id)));
    }
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setError("");
    setMode("new");
    setSelectedPlaylistId("");
    setSelected(new Set(tracks.map((t) => t.id)));
    onClose();
  };

  const allSelected = selected.size === tracks.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-bold">Guardar como playlist</h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-hover transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-1 flex-shrink-0 mb-4">
          <button
            type="button"
            onClick={() => { setMode("new"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${mode === "new" ? "bg-accent text-white" : "bg-surface text-text-secondary hover:bg-hover"}`}
          >
            Nueva playlist
          </button>
          <button
            type="button"
            onClick={() => { setMode("existing"); setError(""); }}
            disabled={existingPlaylists.length === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${mode === "existing" ? "bg-accent text-white" : "bg-surface text-text-secondary hover:bg-hover"}`}
          >
            Agregar a existente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 flex-shrink-0">
            {mode === "new" ? (
              <>
                <label className="block text-sm text-text-secondary mb-1.5">Nombre de la playlist</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="Mi playlist..."
                  autoFocus
                  className="w-full bg-surface text-foreground text-sm rounded-xl px-4 py-3 outline-none placeholder:text-text-tertiary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </>
            ) : (
              <>
                <label className="block text-sm text-text-secondary mb-1.5">Selecciona una playlist</label>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {existingPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => { setSelectedPlaylistId(pl.id); setError(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${selectedPlaylistId === pl.id ? "bg-accent/15 border border-accent/30" : "hover:bg-hover border border-transparent"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedPlaylistId === pl.id ? "border-accent bg-accent" : "border-border"}`}>
                        {selectedPlaylistId === pl.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-medium truncate">{pl.name}</span>
                      <span className="text-xs text-text-tertiary ml-auto flex-shrink-0">{pl.tracks.length} canc.</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          {/* Selector de canciones */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2 flex-shrink-0">
            <span className="text-sm font-medium">
              Canciones
              <span className="ml-1.5 text-text-tertiary font-normal">({selected.size}/{tracks.length})</span>
            </span>
            <button type="button" onClick={toggleAll} className="text-xs text-accent hover:underline cursor-pointer">
              {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-1">
            {tracks.map((track) => {
              const isSelected = selected.has(track.id);
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer text-left ${isSelected ? "bg-accent/10" : "hover:bg-hover"}`}
                >
                  <span className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-accent border-accent" : "border-border"}`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 bg-surface">
                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{track.title}</span>
                    <span className="block text-xs text-text-secondary truncate">{track.artist}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-hover transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selected.size === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mode === "new" ? "Crear playlist" : "Agregar canciones"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
