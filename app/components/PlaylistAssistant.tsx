"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import type { Track } from "./Player";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PlaylistAssistantProps {
  playlistName: string;
  playlistTracks: Track[];
}

export default function PlaylistAssistant({
  playlistName,
  playlistTracks,
}: PlaylistAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          playlistContext: {
            name: playlistName,
            tracks: playlistTracks.map((t) => ({ title: t.title, artist: t.artist })),
          },
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Hubo un error. Intenta de nuevo." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(var(--player-height)+16px)] right-4 md:bottom-[calc(var(--player-height)+24px)] md:right-8 z-40 w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-pointer"
          title="Asistente Klarinet AI"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <line x1="9" y1="22" x2="15" y2="22" />
            <line x1="10" y1="19" x2="14" y2="19" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-[calc(var(--player-height)+12px)] right-3 md:right-6 z-40 w-[340px] max-w-[calc(100vw-24px)] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ height: "min(520px, calc(100vh - var(--player-height) - 80px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  <line x1="9" y1="22" x2="15" y2="22" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">Klarinet AI</h3>
                <p className="text-[10px] text-text-tertiary leading-tight">Asistente musical</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
                  title="Limpiar chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-hover transition-colors cursor-pointer"
                title="Cerrar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    <line x1="9" y1="22" x2="15" y2="22" />
                    <line x1="10" y1="19" x2="14" y2="19" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold mb-1">¡Hola! Soy Klarinet AI</h4>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Tu asistente musical. Pregúntame sobre esta playlist, pide recomendaciones, o cualquier cosa sobre música.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    "¿Qué género tiene esta playlist?",
                    "Recomiéndame canciones similares",
                    "Cuéntame sobre estos artistas",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="px-3 py-1.5 rounded-full text-[11px] bg-surface border border-border text-text-secondary hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-surface border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--klarinet-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                      </svg>
                      <span className="text-[10px] font-medium text-accent">Klarinet AI</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-border bg-surface/30 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isLoading}
                className="flex-1 bg-surface border border-border text-sm text-foreground rounded-xl px-3.5 py-2.5 outline-none placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
