import { NextRequest, NextResponse } from "next/server";

const NON_MUSIC_KEYWORDS = [
  "trailer", "teaser", "entrevista", "interview", "reportaje", "report",
  "noticias", "news", "podcast", "documental", "documentary", "reaction",
  "reacción", "reaccion", "review", "reseña", "tutorial", "making of",
  "behind the scenes", "detrás de cámaras", "late show", "talk show",
  "highlights", "resumen", "gameplay", "unboxing",
];

function isMusicContent(item: { duration: number; title: string }): boolean {
  // Filtrar Shorts (<90s) y contenido muy largo como podcasts/documentales (>10min)
  if (item.duration < 90 || item.duration > 600) return false;
  const titleLower = item.title.toLowerCase();
  return !NON_MUSIC_KEYWORDS.some((kw) => titleLower.includes(kw));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { status: "error", message: "Parámetro 'q' requerido" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.yhimsical.com/searchyt?q=${encodeURIComponent(query)}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: "Error al buscar canciones" },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (data.status === "success" && Array.isArray(data.result)) {
      data.result = data.result.filter(isMusicContent);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en /api/search:", error);
    return NextResponse.json(
      { status: "error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
