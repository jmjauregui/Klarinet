import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, playlistContext } = (await req.json()) as {
      messages: ChatMessage[];
      playlistContext?: { name: string; tracks: { title: string; artist: string }[] };
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Build system prompt with playlist context
    let systemPrompt =
      "Eres Klarinet AI, un asistente musical amigable y entusiasta integrado en la plataforma de música Klarinet. " +
      "Respondes siempre en español. Eres experto en música, artistas, géneros, historia musical, letras y recomendaciones. " +
      "Sé conciso pero útil. Usa un tono cercano y cálido. Puedes usar emojis ocasionalmente.";

    if (playlistContext) {
      const trackList = playlistContext.tracks
        .slice(0, 30)
        .map((t, i) => `${i + 1}. "${t.title}" — ${t.artist}`)
        .join("\n");

      systemPrompt +=
        `\n\nEl usuario está viendo la playlist "${playlistContext.name}" que contiene ${playlistContext.tracks.length} canciones.` +
        (trackList ? `\nCanciones en la playlist:\n${trackList}` : "\nLa playlist está vacía.");
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "Lo siento, no pude generar una respuesta.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Assistant API error:", error);
    return NextResponse.json(
      { error: "Error al comunicarse con el asistente" },
      { status: 500 }
    );
  }
}
