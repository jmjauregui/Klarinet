"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Player from "./components/Player";
import HomeView from "./components/HomeView";
import SearchResults from "./components/SearchResults";
import GenreOnboarding from "./components/GenreOnboarding";
import FavoritesView from "./components/FavoritesView";
import SettingsView from "./components/SettingsView";
import PlaylistView from "./components/PlaylistView";
import CreatePlaylistModal from "./components/CreatePlaylistModal";
import AddToPlaylistModal from "./components/AddToPlaylistModal";
import SaveQueueAsPlaylistModal from "./components/SaveQueueAsPlaylistModal";
import { useTheme } from "./components/ThemeToggle";
import { useAccentColor } from "./components/SettingsView";
import type { Track } from "./components/Player";
import type { SearchResultItem } from "./types/api";
import type { Playlist } from "./components/AddToPlaylistModal";

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

function loadPlaylists(): Playlist[] {
  try {
    const stored = localStorage.getItem("klarinet-playlists");
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem("klarinet-playlists");
  }
  return [];
}

function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem("klarinet-playlists", JSON.stringify(playlists));
}

export default function Home() {
  const { mode: themeMode, toggle: toggleTheme } = useTheme();
  const { accent, setColor: setAccentColor } = useAccentColor();
  const [activeSection, setActiveSection] = useState("home");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isSongSearch, setIsSongSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [trackForPlaylist, setTrackForPlaylist] = useState<Track | null>(null);
  const [showSaveQueueModal, setShowSaveQueueModal] = useState(false);
  const [queueForPlaylist, setQueueForPlaylist] = useState<Track[]>([]);
  const [navVisible, setNavVisible] = useState(true);

  // Ref para evitar duplicar el guardado de historial
  const lastHistoryTrackId = useRef<string | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para controlar si ya se cargaron canciones relacionadas en esta sesión de búsqueda
  const relatedFetchedRef = useRef(false);
  // Ref para indicar que la siguiente canción exitosa debe disparar el fetch de similares
  const needsRelatedFetchRef = useRef(false);

  // Auto-ocultar nav mobile tras 5s de inactividad, mostrar al interactuar
  useEffect(() => {
    const showNav = () => {
      setNavVisible(true);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      navTimerRef.current = setTimeout(() => setNavVisible(false), 5000);
    };
    showNav();
    const events = ["touchstart", "touchmove", "scroll"] as const;
    events.forEach((e) => document.addEventListener(e, showNav, { passive: true }));
    return () => {
      events.forEach((e) => document.removeEventListener(e, showNav));
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

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
    setPlaylists(loadPlaylists());

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
    relatedFetchedRef.current = false;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.status === "success" && Array.isArray(data.result)) {
        const results: SearchResultItem[] = data.result;
        setSearchResults(results);

        const queryLower = query.toLowerCase();
        // Artista: mayoría de uploaders coinciden con la query
        const artistMatches = results.filter((r) =>
          r.uploader.username.toLowerCase().includes(queryLower) ||
          queryLower.includes(r.uploader.username.toLowerCase())
        );
        const detectedArtist = results.length > 0 && artistMatches.length > results.length / 2;
        // Canción: la query aparece en algún título (y no es búsqueda de artista)
        const titleMatches = results.filter((r) => r.title.toLowerCase().includes(queryLower));
        setIsSongSearch(!detectedArtist && titleMatches.length > 0);
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

  const fetchRelated = useCallback((track: Track) => {
    if (isLoadingRelated) return;
    relatedFetchedRef.current = true;
    setIsLoadingRelated(true);
    fetch("/api/related", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: track.title, artist: track.artist, searchQuery }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.results) && data.results.length > 0) {
          const related = data.results as SearchResultItem[];
          setSearchResults((prev) => {
            const ids = new Set(prev.map((r) => r.ID));
            const fresh = related.filter((r) => !ids.has(r.ID));
            return [...prev, ...fresh];
          });
          setQueue((prev) => {
            const ids = new Set(prev.map((t) => t.id));
            const freshTracks = searchResultsToTracks(related).filter((t) => !ids.has(t.id));
            return [...prev, ...freshTracks];
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingRelated(false));
  }, [isLoadingRelated, searchQuery]);

  const handlePlayTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setQueue(searchResultsToTracks(searchResults));

    const isLastInList = searchResults[searchResults.length - 1]?.ID === track.id;
    const shouldFetch = isLastInList || (isSongSearch && !relatedFetchedRef.current);

    if (!shouldFetch) return;

    // Solo limpiar la lista en la primera vez Y cuando NO es la última canción
    if (!relatedFetchedRef.current && !isLastInList) {
      const asResult = searchResults.find((r) => r.ID === track.id);
      if (asResult) setSearchResults([asResult]);
    }

    fetchRelated(track);
  }, [searchResults, isSongSearch, fetchRelated]);

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
    // Si el reproductor llegó automáticamente a la última canción, buscar más similares
    setQueue((prev) => {
      if (prev[prev.length - 1]?.id === track.id) {
        fetchRelated(track);
      }
      return prev;
    });
  }, [fetchRelated]);

  const handleOnboardingComplete = useCallback((genres: string[]) => {
    setShowOnboarding(false);
    void genres;
  }, []);

  const handleTrackError = useCallback((track: Track) => {
    setSearchResults((prev) => prev.filter((r) => r.ID !== track.id));
    setQueue((prev) => prev.filter((t) => t.id !== track.id));
    // Si aún no hubo un fetch exitoso de similares, marcar que la próxima canción exitosa lo dispare
    if (!relatedFetchedRef.current) {
      needsRelatedFetchRef.current = true;
    }
  }, []);

  const handleTrackReady = useCallback((track: Track) => {
    if (needsRelatedFetchRef.current) {
      needsRelatedFetchRef.current = false;
      relatedFetchedRef.current = false; // resetear para que fetchRelated no lo bloquee
      fetchRelated(track);
    }
  }, [fetchRelated]);

  // ---- Playlist handlers ----
  const handleCreatePlaylist = useCallback((name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const handleAddTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.tracks.some((t) => t.id === track.id)) return pl;
        return { ...pl, tracks: [...pl.tracks, track] };
      });
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const handleRemoveTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
      });
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const handleDeletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((pl) => pl.id !== playlistId);
      savePlaylists(updated);
      return updated;
    });
    setActiveSection("home");
  }, []);

  const handleSelectPlaylist = useCallback((id: string) => {
    setActiveSection(`playlist-${id}`);
  }, []);

  const handleOpenAddToPlaylist = useCallback((track: Track) => {
    setTrackForPlaylist(track);
    setShowAddToPlaylistModal(true);
  }, []);

  const handleOpenSaveQueueAsPlaylist = useCallback((tracks: Track[]) => {
    setQueueForPlaylist(tracks);
    setShowSaveQueueModal(true);
  }, []);

  const handleSaveQueueAsPlaylist = useCallback((name: string, tracks: Track[]) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      tracks,
      createdAt: Date.now(),
    };
    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      savePlaylists(updated);
      return updated;
    });
    setActiveSection(`playlist-${newPlaylist.id}`);
  }, []);

  const handleAddQueueToExistingPlaylist = useCallback((playlistId: string, tracks: Track[]) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const existingIds = new Set(pl.tracks.map((t) => t.id));
        const newTracks = tracks.filter((t) => !existingIds.has(t.id));
        return { ...pl, tracks: [...pl.tracks, ...newTracks] };
      });
      savePlaylists(updated);
      return updated;
    });
    setActiveSection(`playlist-${playlistId}`);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "search":
        return (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            isLoading={isSearching}
            isLoadingRelated={isLoadingRelated}
            error={searchError}
            onPlayTrack={handlePlayTrack}
            currentTrackId={currentTrack?.id ?? null}
            favoriteTracks={favoriteTracks}
            onToggleFavorite={handleToggleFavorite}
            onSearch={handleSearch}
            recentlyPlayed={recentlyPlayed}
            onAddToPlaylist={handleOpenAddToPlaylist}
            onSaveQueueAsPlaylist={handleOpenSaveQueueAsPlaylist}
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
      case "settings":
        return (
          <SettingsView
            themeMode={themeMode}
            onThemeToggle={toggleTheme}
            accent={accent}
            onAccentChange={setAccentColor}
          />
        );
      default:
        // Handle playlist-* routes
        if (activeSection.startsWith("playlist-")) {
          const playlistId = activeSection.replace("playlist-", "");
          const playlist = playlists.find((pl) => pl.id === playlistId);
          if (playlist) {
            return (
              <PlaylistView
                playlist={playlist}
                currentTrackId={currentTrack?.id ?? null}
                onPlayTrack={(track, trackList) => {
                  setCurrentTrack(track);
                  if (trackList) setQueue(trackList);
                  else setQueue([track]);
                }}
                onRemoveTrack={handleRemoveTrackFromPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onGoBack={() => setActiveSection("home")}
              />
            );
          }
        }
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
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        currentTrack={currentTrack}
        playlists={playlists}
        onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
        onSelectPlaylist={handleSelectPlaylist}
        navVisible={navVisible}
      />
      <MainContent onSearch={handleSearch} themeMode={themeMode} onThemeToggle={toggleTheme}>
        {renderContent()}
      </MainContent>
      <Player currentTrack={currentTrack} queue={queue} onTrackChange={handleTrackChange} onTrackError={handleTrackError} onTrackReady={handleTrackReady} favoriteTracks={favoriteTracks} onToggleFavorite={handleToggleFavorite} navVisible={navVisible} />

      {/* Playlist Modals */}
      <CreatePlaylistModal
        open={showCreatePlaylistModal}
        onClose={() => setShowCreatePlaylistModal(false)}
        onCreate={handleCreatePlaylist}
        existingNames={playlists.map((pl) => pl.name)}
      />
      <AddToPlaylistModal
        open={showAddToPlaylistModal}
        onClose={() => setShowAddToPlaylistModal(false)}
        track={trackForPlaylist}
        playlists={playlists}
        onAddToPlaylist={handleAddTrackToPlaylist}
        onCreateNew={() => {
          setShowAddToPlaylistModal(false);
          setShowCreatePlaylistModal(true);
        }}
      />
      <SaveQueueAsPlaylistModal
        open={showSaveQueueModal}
        onClose={() => setShowSaveQueueModal(false)}
        tracks={queueForPlaylist}
        existingPlaylists={playlists}
        onSaveNew={handleSaveQueueAsPlaylist}
        onAddToExisting={handleAddQueueToExistingPlaylist}
      />
    </div>
  );
}
