import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const NON_MUSIC_KEYWORDS = [
  "trailer", "teaser", "entrevista", "interview", "reportaje", "report",
  "noticias", "news", "podcast", "documental", "documentary", "reaction",
  "reacción", "reaccion", "review", "reseña", "tutorial", "making of",
  "behind the scenes", "detrás de cámaras", "late show", "talk show",
  "highlights", "resumen", "gameplay", "unboxing",
];

function isMusicContent(item: { duration: number; title: string }): boolean {
  if (item.duration < 90 || item.duration > 600) return false;
  const titleLower = item.title.toLowerCase();
  return !NON_MUSIC_KEYWORDS.some((kw) => titleLower.includes(kw));
}

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, artist, searchQuery } = (await req.json()) as {
      title: string;
      artist: string;
      searchQuery?: string;
    };

    if (!title || !artist) {
      return NextResponse.json({ results: [] }, { status: 400 });
    }

    // Detectar si la búsqueda original es un género/mood (no un artista o canción específica)
    const userContext = searchQuery
      ? `El usuario buscó "${searchQuery}" y seleccionó "${title}" de ${artist}.`
      : `Canción: "${title}" de ${artist}.`;

    // DeepSeek genera 20 queries de canciones similares
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en música. Tu tarea es generar una playlist de canciones similares. " +
            "Responde ÚNICAMENTE con un JSON array de exactamente 20 strings. " +
            "Cada string es una query de búsqueda en formato \"Nombre Canción Artista\" (sin comillas internas). " +
            "Si el contexto indica un género o mood (reggaeton, hip hop, rock, etc.), recomienda canciones populares de ese género. " +
            "Si es una canción específica, recomienda canciones similares en estilo, tempo y energía. " +
            "Mezcla canciones del mismo artista con artistas similares. " +
            "No incluyas la canción original. Responde SOLO el JSON array, sin markdown ni explicación.",
        },
        {
          role: "user",
          content: `${userContext} Dame 20 canciones similares para una playlist.`,
        },
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    let queries: string[] = [];
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      const parsed = match ? JSON.parse(match[0]) : [];
      if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
        queries = parsed.slice(0, 20);
      }
    } catch {
      return NextResponse.json({ results: [] });
    }

    // Busca cada query en yhimsical en paralelo, toma el primer resultado
    const settled = await Promise.allSettled(
      queries.map((q) =>
        fetch(`https://api.yhimsical.com/searchyt?q=${encodeURIComponent(q)}`, {
          next: { revalidate: 0 },
        })
          .then((r) => r.json())
          .then((data) => {
            if (!Array.isArray(data.result)) return null;
            const valid = data.result.find(isMusicContent);
            return valid ?? null;
          })
          .catch(() => null)
      )
    );

    // Deduplicar por ID y filtrar nulos
    const seen = new Set<string>();
    const results = settled
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<unknown>).value)
      .filter((item) => {
        const i = item as { ID: string };
        if (seen.has(i.ID)) return false;
        seen.add(i.ID);
        return true;
      });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error en /api/related:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
