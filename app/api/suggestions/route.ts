import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { recentTracks } = await req.json();

    if (!Array.isArray(recentTracks) || recentTracks.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Construir la lista de canciones recientes para el prompt
    const trackList = recentTracks
      .slice(0, 10)
      .map((t: { title: string; artist: string }, i: number) => `${i + 1}. "${t.title}" de ${t.artist}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en música. El usuario te dará una lista de canciones que ha escuchado recientemente. Debes responder ÚNICAMENTE con un JSON array de exactamente 8 strings, donde cada string es el nombre de un artista que le podría gustar al usuario basándote en sus gustos. No repitas artistas que ya aparecen en la lista. Responde SOLO el JSON array, sin explicación ni markdown. Ejemplo: [\"Artista 1\",\"Artista 2\",\"Artista 3\",\"Artista 4\",\"Artista 5\",\"Artista 6\",\"Artista 7\",\"Artista 8\"]",
        },
        {
          role: "user",
          content: `Estas son mis últimas canciones escuchadas:\n${trackList}\n\nSugiéreme 8 artistas similares que me podrían gustar.`,
        },
      ],
      model: "deepseek-chat",
      temperature: 0.8,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";

    // Parsear el JSON, con fallback al array estático
    let suggestions: string[];
    try {
      // Intentar extraer JSON array desde la respuesta (puede venir con markdown)
      const match = raw.match(/\[[\s\S]*\]/);
      suggestions = match ? JSON.parse(match[0]) : [];

      // Validar que sea array de strings
      if (
        !Array.isArray(suggestions) ||
        suggestions.some((s) => typeof s !== "string")
      ) {
        suggestions = [];
      }
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error en /api/suggestions:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
