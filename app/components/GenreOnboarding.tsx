"use client";

import { useState } from "react";

const GENRES = [
  { id: "pop", label: "Pop", emoji: "🎤", color: "#e11d48" },
  { id: "rock", label: "Rock", emoji: "🎸", color: "#7c3aed" },
  { id: "hip-hop", label: "Hip Hop", emoji: "🎧", color: "#d97706" },
  { id: "electronica", label: "Electrónica", emoji: "🎛️", color: "#0891b2" },
  { id: "jazz", label: "Jazz", emoji: "🎷", color: "#059669" },
  { id: "clasica", label: "Clásica", emoji: "🎻", color: "#4338ca" },
  { id: "rnb", label: "R&B", emoji: "🎵", color: "#be185d" },
  { id: "latina", label: "Latina", emoji: "💃", color: "#ea580c" },
  { id: "reggaeton", label: "Reggaeton", emoji: "🔥", color: "#dc2626" },
  { id: "indie", label: "Indie", emoji: "🌿", color: "#16a34a" },
  { id: "metal", label: "Metal", emoji: "🤘", color: "#374151" },
  { id: "kpop", label: "K-Pop", emoji: "💜", color: "#a855f7" },
  { id: "country", label: "Country", emoji: "🤠", color: "#b45309" },
  { id: "blues", label: "Blues", emoji: "🎺", color: "#1d4ed8" },
  { id: "soul", label: "Soul", emoji: "✨", color: "#9333ea" },
  { id: "punk", label: "Punk", emoji: "⚡", color: "#65a30d" },
];

interface GenreOnboardingProps {
  onComplete: (genres: string[]) => void;
}

export default function GenreOnboarding({ onComplete }: GenreOnboardingProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContinue = () => {
    if (selected.size < 1) return;
    const genres = [...selected];
    localStorage.setItem("klarinet-preferences", JSON.stringify(genres));
    onComplete(genres);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6">
          <span className="text-white font-bold text-2xl">K</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Bienvenido a Klarinet
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8">
          Selecciona los géneros que más te gustan para personalizar tu
          experiencia musical.
        </p>

        {/* Grid de géneros */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {GENRES.map((genre) => {
            const isSelected = selected.has(genre.id);
            return (
              <button
                key={genre.id}
                onClick={() => toggle(genre.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border-2 ${
                  isSelected
                    ? "border-accent bg-accent/10 text-accent scale-105 shadow-sm"
                    : "border-border bg-surface/50 text-text-secondary hover:border-text-tertiary hover:bg-hover"
                }`}
              >
                <span className="text-base">{genre.emoji}</span>
                {genre.label}
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-0.5"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón continuar */}
        <button
          onClick={handleContinue}
          disabled={selected.size < 1}
          className={`w-full max-w-xs mx-auto py-3 px-8 rounded-full font-semibold text-sm transition-all cursor-pointer ${
            selected.size >= 1
              ? "bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/25"
              : "bg-surface text-text-tertiary cursor-not-allowed"
          }`}
        >
          {selected.size === 0
            ? "Selecciona al menos 1 género"
            : `Continuar con ${selected.size} género${selected.size > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}

export { GENRES };
