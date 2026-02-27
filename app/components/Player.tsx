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
}

export default function Player({ currentTrack, queue, onTrackChange }: PlayerProps) {
  const playerRef = useRef<ReactPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0); // 0-1 fraction
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // 0-1
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
  }, []);

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
            onError={(e) => console.error("ReactPlayer error:", e)}
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
      <div className="md:hidden fixed left-0 right-0 z-20" style={{ bottom: "var(--bottom-nav-height)" }}>
        {/* Progress bar ultra-thin on top */}
        {currentTrack && (
          <div className="h-0.5 bg-border w-full">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${played * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center h-[var(--player-height)] bg-player/95 backdrop-blur-xl border-t border-border px-3 gap-3">
          {currentTrack ? (
            <>
              {/* Thumbnail */}
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

              {/* Title + Artist */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-text-secondary truncate leading-tight">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
