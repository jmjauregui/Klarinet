"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player/youtube";
import type { OnProgressProps } from "react-player/base";

export interface Track {
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  url: string;
  id: string;
}

interface PlayerProps {
  currentTrack: Track | null;
  queue: Track[];
  onTrackChange: (track: Track) => void;
  onTrackError: (track: Track) => void;
  onTrackReady: (track: Track) => void;
  favoriteTracks: Track[];
  onToggleFavorite: (track: Track) => void;
  navVisible: boolean;
}

export default function Player({ currentTrack, queue, onTrackChange, onTrackError, onTrackReady, favoriteTracks, onToggleFavorite, navVisible }: PlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null);
  const pendingRemovalRef = useRef<Track | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0); // 0-1 fraction
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // 0-1
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isFavorite = currentTrack
    ? favoriteTracks.some((t) => t.id === currentTrack.id)
    : false;

  const currentIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;
  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0;

  const playNext = useCallback(() => {
    if (hasNext) {
      onTrackChange(queue[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, queue, onTrackChange]);

  const playPrev = useCallback(() => {
    // Si llevamos más de 3 segundos, reinicia la canción actual
    if (playedSeconds > 3 && playerRef.current) {
      playerRef.current.seekTo(0, "fraction");
      setPlayed(0);
      setPlayedSeconds(0);
      return;
    }
    if (hasPrev) {
      onTrackChange(queue[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, queue, onTrackChange, playedSeconds]);

  // Wake Lock: mantener pantalla encendida mientras reproduce
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    const acquire = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Silencioso: permisos denegados o no soportado
      }
    };

    const release = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    // Re-adquirir cuando la pestaña vuelve al primer plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        acquire();
      }
    };

    if (isPlaying) {
      acquire();
    } else {
      release();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      release();
    };
  }, [isPlaying]);

  // Auto-play cuando cambia la canción
  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true);
      setPlayed(0);
      setPlayedSeconds(0);
      setIsReady(false);
    }
  }, [currentTrack?.id]);

  const handleProgress = useCallback(
    (state: OnProgressProps) => {
      if (!isSeeking) {
        setPlayed(state.played);
        setPlayedSeconds(state.playedSeconds);
      }
    },
    [isSeeking]
  );

  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
    // Si había un track con error pendiente de eliminar, eliminarlo ahora que el siguiente está listo
    if (pendingRemovalRef.current) {
      onTrackError(pendingRemovalRef.current);
      pendingRemovalRef.current = null;
    }
    // Notificar que esta canción cargó correctamente
    if (currentTrack) onTrackReady(currentTrack);
  }, [onTrackError, onTrackReady, currentTrack]);

  const handleEnded = useCallback(() => {
    if (hasNext) {
      playNext();
    } else {
      setIsPlaying(false);
      setPlayed(0);
      setPlayedSeconds(0);
    }
  }, [hasNext, playNext]);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  }, []);

  const handleSeekMouseDown = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      setIsSeeking(false);
      const value = parseFloat((e.target as HTMLInputElement).value);
      playerRef.current?.seekTo(value, "fraction");
    },
    []
  );

  const handleSeekTouchStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLInputElement>) => {
      setIsSeeking(false);
      const value = parseFloat((e.target as HTMLInputElement).value);
      playerRef.current?.seekTo(value, "fraction");
    },
    []
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      if (isMuted && v > 0) setIsMuted(false);
    },
    [isMuted]
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalDuration = duration || currentTrack?.duration || 0;

  return (
    <>
      {/* ReactPlayer oculto - reproduce el audio/video de YouTube */}
      {currentTrack && (
        <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
          <ReactPlayer
            ref={playerRef}
            url={currentTrack.url}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onReady={handleReady}
            onEnded={handleEnded}
            onError={(e) => {
              console.warn("ReactPlayer error:", e);
              if (hasNext) {
                // Guardar para eliminar cuando el siguiente track esté listo
                pendingRemovalRef.current = currentTrack;
                playNext();
              } else {
                // Sin siguiente, eliminar inmediatamente
                if (currentTrack) onTrackError(currentTrack);
                setIsPlaying(false);
              }
            }}
            width="0"
            height="0"
            config={{
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
          />
        </div>
      )}

      {/* ===== Desktop player (≥768px) ===== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 h-[var(--player-height)] bg-player border-t border-border items-center px-4 z-20">
        {/* Información de la canción */}
        <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
          {currentTrack ? (
            <>
              <div className="w-14 h-14 rounded-md overflow-hidden bg-surface flex-shrink-0 relative">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                {!isReady && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-text-tertiary border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button className="ml-2 text-text-tertiary hover:text-accent transition-colors flex-shrink-0 cursor-pointer">
                <HeartIcon />
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
                <MusicNoteIcon />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-tertiary">
                  No hay canción en reproducción
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controles centrales */}
        <div className="flex-1 flex flex-col items-center max-w-[600px] mx-auto">
          {/* Botones de control */}
          <div className="flex items-center gap-5 mb-1.5">
            <button className="text-text-secondary hover:text-foreground transition-colors cursor-pointer">
              <ShuffleIcon />
            </button>
            <button
              onClick={playPrev}
              disabled={!currentTrack}
              className={`text-text-secondary hover:text-foreground transition-colors cursor-pointer ${
                !currentTrack ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <PrevIcon />
            </button>
            <button
              onClick={() => {
                if (currentTrack) setIsPlaying(!isPlaying);
              }}
              disabled={!currentTrack}
              className={`w-9 h-9 rounded-full bg-foreground flex items-center justify-center transition-transform cursor-pointer ${
                currentTrack ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={playNext}
              disabled={!hasNext}
              className={`text-text-secondary hover:text-foreground transition-colors cursor-pointer ${
                !hasNext ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <NextIcon />
            </button>
            <button className="text-text-secondary hover:text-foreground transition-colors cursor-pointer">
              <RepeatIcon />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-text-tertiary w-10 text-right tabular-nums">
              {formatTime(playedSeconds)}
            </span>
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="flex-1 h-1 accent-white"
            />
            <span className="text-xs text-text-tertiary w-10 tabular-nums">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Volumen y opciones */}
        <div className="flex items-center gap-3 w-[30%] min-w-[180px] justify-end">
          <button className="text-text-secondary hover:text-foreground transition-colors cursor-pointer">
            <QueueIcon />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-text-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 accent-white"
          />
        </div>
      </footer>

      {/* ===== Mobile mini-player (<768px) ===== */}
      <div
        className="md:hidden fixed left-0 right-0 z-20 transition-all duration-300"
        style={{ bottom: navVisible ? "var(--bottom-nav-height)" : "0" }}
      >
        {/* Progress bar interactiva — área táctil amplia */}
        {currentTrack && (
          <div className="relative w-full h-5 flex items-center bg-transparent">
            {/* Track visual */}
            <div className="absolute left-0 right-0 bottom-0 h-1 bg-border rounded-full overflow-hidden pointer-events-none">
              <div
                className="h-full bg-accent transition-none"
                style={{ width: `${played * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onTouchStart={handleSeekTouchStart}
              onChange={handleSeekChange}
              onTouchEnd={handleSeekTouchEnd}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
        )}

        <div className="flex items-center h-[var(--player-height)] bg-player/95 backdrop-blur-xl border-t border-border px-3 gap-3">
          {currentTrack ? (
            <>
              {/* Thumbnail + Title — abre modal */}
              <button
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                onClick={() => setShowModal(true)}
              >
                <div className="w-11 h-11 rounded-md overflow-hidden bg-surface flex-shrink-0 relative">
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                  {!isReady && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-text-tertiary border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate leading-tight">{currentTrack.title}</p>
                  <p className="text-xs text-text-secondary truncate leading-tight">{currentTrack.artist}</p>
                </div>
              </button>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onToggleFavorite(currentTrack)}
                  className="w-9 h-9 flex items-center justify-center cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24"
                    fill={isFavorite ? "var(--klarinet-accent)" : "none"}
                    stroke={isFavorite ? "var(--klarinet-accent)" : "currentColor"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 flex items-center justify-center cursor-pointer text-foreground"
                >
                  {isPlaying ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="3" width="5" height="18" rx="1" />
                      <rect x="14" y="3" width="5" height="18" rx="1" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={playNext}
                  disabled={!hasNext}
                  className={`w-9 h-9 flex items-center justify-center cursor-pointer text-foreground ${
                    !hasNext ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="18.5" y="5" width="2.5" height="14" rx="0.5" />
                    <polygon points="3,5 15,12 3,19" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
                <MusicNoteIcon />
              </div>
              <p className="text-sm text-text-tertiary flex-1">
                No hay canción en reproducción
              </p>
            </>
          )}
        </div>
      </div>

      {/* ===== Modal Now Playing ===== */}
      {showModal && currentTrack && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-background animate-in slide-in-from-bottom duration-300">
          {/* Fondo con portada difuminada */}
          <div className="absolute inset-0 z-0">
            <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-30" />
            <div className="absolute inset-0 bg-background/70" />
          </div>

          <div className="relative z-10 flex flex-col h-full px-6 pt-safe">
            {/* Header */}
            <div className="flex items-center justify-between py-4">
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-foreground cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-foreground">Reproduciendo ahora</span>
              <div className="w-10" />
            </div>

            {/* Portada grande */}
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info + Favorito */}
            <div className="flex items-center justify-between mb-6">
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-xl font-bold truncate">{currentTrack.title}</p>
                <p className="text-text-secondary truncate mt-0.5">{currentTrack.artist}</p>
              </div>
              <button onClick={() => onToggleFavorite(currentTrack)} className="w-10 h-10 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <svg width="26" height="26" viewBox="0 0 24 24"
                  fill={isFavorite ? "var(--klarinet-accent)" : "none"}
                  stroke={isFavorite ? "var(--klarinet-accent)" : "currentColor"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Barra de progreso */}
            <div className="mb-2">
              <div className="relative h-10 flex items-center">
                <div className="absolute left-0 right-0 h-1 bg-border rounded-full overflow-hidden pointer-events-none">
                  <div className="h-full bg-accent transition-none rounded-full" style={{ width: `${played * 100}%` }} />
                </div>
                <input
                  type="range" min={0} max={0.999999} step="any" value={played}
                  onTouchStart={handleSeekTouchStart} onChange={handleSeekChange} onTouchEnd={handleSeekTouchEnd}
                  onMouseDown={handleSeekMouseDown} onMouseUp={handleSeekMouseUp}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                />
              </div>
              <div className="flex justify-between text-xs text-text-tertiary tabular-nums -mt-1">
                <span>{formatTime(playedSeconds)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between pb-10 mt-2">
              <button onClick={playPrev} disabled={!currentTrack} className="w-[72px] h-[72px] flex items-center justify-center text-foreground cursor-pointer disabled:opacity-40">
                <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="5" width="2.5" height="14" rx="0.5" />
                  <polygon points="21,5 9,12 21,19" />
                </svg>
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg cursor-pointer text-foreground"
              >
                {isPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="3" width="5" height="18" rx="1" />
                    <rect x="14" y="3" width="5" height="18" rx="1" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                )}
              </button>
              <button onClick={playNext} disabled={!hasNext} className="w-[72px] h-[72px] flex items-center justify-center text-foreground cursor-pointer disabled:opacity-40">
                <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="18.5" y="5" width="2.5" height="14" rx="0.5" />
                  <polygon points="3,5 15,12 3,19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ====== Iconos SVG ====== */

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
      <rect x="5" y="3" width="5" height="18" rx="1" />
      <rect x="14" y="3" width="5" height="18" rx="1" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="5" width="2.5" height="14" rx="0.5" />
      <polygon points="21,5 9,12 21,19" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="18.5" y="5" width="2.5" height="14" rx="0.5" />
      <polygon points="3,5 15,12 3,19" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--klarinet-text-tertiary)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeMuteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
