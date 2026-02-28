"use client";

import { useState, type FormEvent } from "react";

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  existingNames: string[];
}

export default function CreatePlaylistModal({
  open,
  onClose,
  onCreate,
  existingNames,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre no puede estar vacío");
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError("Ya existe una playlist con ese nombre");
      return;
    }
    onCreate(trimmed);
    setName("");
    setError("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setName("");
      setError("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold">Nueva Playlist</h2>
          <button
            onClick={() => { onClose(); setName(""); setError(""); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-hover transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mt-4">
            <label className="block text-sm text-text-secondary mb-1.5">Nombre de la playlist</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Mi playlist increíble..."
              autoFocus
              className="w-full bg-surface text-foreground text-sm rounded-xl px-4 py-3 outline-none placeholder:text-text-tertiary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => { onClose(); setName(""); setError(""); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-hover transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
