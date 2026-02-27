"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Player from "./components/Player";
import HomeView from "./components/HomeView";
import SearchResults from "./components/SearchResults";
import GenreOnboarding from "./components/GenreOnboarding";
import FavoritesView from "./components/FavoritesView";
import type { Track } from "./components/Player";
import type { SearchResultItem } from "./types/api";

const MAX_HISTORY = 50;
const currentVersion = "1.0.1";

function searchResultsToTracks(results: SearchResultItem[]): Track[] {
  return results.map((item) => ({
    title: item.title,
    artist: item.uploader.username,
    thumbnail: item.thumbnail_src,
    duration: item.duration,
    url: item.url,
    id: item.ID,
  }));
}

function loadHistory(): Track[] {
  try {
    const stored = localStorage.getItem("klarinet-history");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignorar
  }
  return [];
}

function saveHistory(tracks: Track[]) {
  localStorage.setItem("klarinet-history", JSON.stringify(tracks));
}

function loadFavorites(): Track[] {
  try {
    const stored = localStorage.getItem("klarinet-favorites");
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Migrar formato antiguo (array de IDs) al nuevo formato (array de Tracks)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Si el primer elemento es string, es formato viejo - limpiar
        if (typeof parsed[0] === "string") {
          console.log("Migrando favoritos de formato antiguo (IDs) - se limpiarán");
          localStorage.removeItem("klarinet-favorites");
          return [];
        }
        // Si el primer elemento tiene las propiedades de Track, es formato nuevo
        if (parsed[0].id && parsed[0].title && parsed[0].url) {
          return parsed as Track[];
        }
      }
    }
  } catch {
    // Error al parsear - limpiar
    localStorage.removeItem("klarinet-favorites");
  }
  return [];
}

function saveFavorites(tracks: Track[]) {
  localStorage.setItem("klarinet-favorites", JSON.stringify(tracks));
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Ref para evitar duplicar el guardado de historial
  const lastHistoryTrackId = useRef<string | null>(null);

  // Cargar favoritos e historial desde localStorage al montar
  useEffect(() => {
    // Verificar versión y limpiar caché si cambió
    const checkVersion = async () => {
      const storedVersion = localStorage.getItem("klarinet-version");
      
      if (storedVersion && storedVersion !== currentVersion) {
        console.log(`🔄 Nueva versión detectada: ${storedVersion} → ${currentVersion}`);
        console.log("🧹 Limpiando caché automáticamente...");
        
        try {
          // Limpiar todos los caches del service worker
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log(`✅ ${cacheNames.length} caches eliminados`);
          }

          // Unregister service workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(
              registrations.map(registration => registration.unregister())
            );
            console.log(`✅ ${registrations.length} service workers desregistrados`);
          }

          // Actualizar versión en localStorage
          localStorage.setItem("klarinet-version", currentVersion);
          console.log("✅ Versión actualizada, recargando...");
          
          // Recargar la página
          window.location.reload();
          return;
        } catch (error) {
          console.error("❌ Error limpiando caché:", error);
        }
      }

      // Si no hay versión guardada, guardarla
      if (!storedVersion) {
        localStorage.setItem("klarinet-version", currentVersion);
      }
    };

    checkVersion();

    setFavoriteTracks(loadFavorites());
    setRecentlyPlayed(loadHistory());

    // Verificar si necesita onboarding
    const prefs = localStorage.getItem("klarinet-preferences");
    if (!prefs) {
      setShowOnboarding(true);
    }
    setOnboardingChecked(true);
  }, []);

  // Guardar en historial cada vez que cambia la canción
  useEffect(() => {
    if (!currentTrack) return;
    if (lastHistoryTrackId.current === currentTrack.id) return;
    lastHistoryTrackId.current = currentTrack.id;

    setRecentlyPlayed((prev) => {
      // Eliminar duplicado si ya está en el historial
      const filtered = prev.filter((t) => t.id !== currentTrack.id);
      // Agregar al inicio
      const updated = [currentTrack, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, [currentTrack]);

  const handleToggleFavorite = useCallback((track: Track) => {
    setFavoriteTracks((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      let updated: Track[];
      if (exists) {
        // Quitar de favoritos
        updated = prev.filter((t) => t.id !== track.id);
      } else {
        // Agregar a favoritos al inicio
        updated = [track, ...prev];
      }
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const handleRemoveFavorite = useCallback((trackId: string) => {
    setFavoriteTracks((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setActiveSection("search");
    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.status === "success" && Array.isArray(data.result)) {
        setSearchResults(data.result);
      } else {
        setSearchResults([]);
        setSearchError(data.message || "No se pudieron obtener resultados");
      }
    } catch {
      setSearchError("Error de conexión. Intenta de nuevo.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePlayTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    // Construir la cola a partir de los resultados de búsqueda actuales
    const tracks = searchResultsToTracks(searchResults);
    setQueue(tracks);
  }, [searchResults]);

  const handleHomePlayTrack = useCallback((track: Track, trackList?: Track[]) => {
    setCurrentTrack(track);
    if (trackList) {
      setQueue(trackList);
    } else {
      setQueue([track]);
    }
  }, []);

  const handleRemoveFromHistory = useCallback((trackId: string) => {
    setRecentlyPlayed((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleTrackChange = useCallback((track: Track) => {
    setCurrentTrack(track);
  }, []);

  const handleOnboardingComplete = useCallback((genres: string[]) => {
    setShowOnboarding(false);
    // genres ya se guardaron en localStorage dentro del componente
    void genres; // uso implícito
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "search":
        return (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            isLoading={isSearching}
            error={searchError}
            onPlayTrack={handlePlayTrack}
            currentTrackId={currentTrack?.id ?? null}
            favoriteTracks={favoriteTracks}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "library":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Tu Biblioteca</h2>
            <p className="text-text-secondary">
              Tu biblioteca está vacía. Busca artistas y canciones para agregarlas.
            </p>
          </div>
        );
      case "favorites":
        return (
          <FavoritesView
            favorites={favoriteTracks}
            currentTrackId={currentTrack?.id ?? null}
            onPlayTrack={(track, trackList) => {
              setCurrentTrack(track);
              if (trackList) {
                setQueue(trackList);
              } else {
                setQueue([track]);
              }
            }}
            onRemoveFavorite={handleRemoveFavorite}
          />
        );
      case "home":
      default:
        return (
          <HomeView
            onPlayTrack={handleHomePlayTrack}
            currentTrackId={currentTrack?.id ?? null}
            recentlyPlayed={recentlyPlayed}
            onRemoveFromHistory={handleRemoveFromHistory}
          />
        );
    }
  };

  // No renderizar nada hasta verificar onboarding
  if (!onboardingChecked) return null;

  // Mostrar onboarding si es la primera vez
  if (showOnboarding) {
    return <GenreOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} currentTrack={currentTrack} />
      <MainContent onSearch={handleSearch}>
        {renderContent()}
      </MainContent>
      <Player currentTrack={currentTrack} queue={queue} onTrackChange={handleTrackChange} />
    </div>
  );
}
