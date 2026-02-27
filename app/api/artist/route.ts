import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");

  if (!artist) {
    return NextResponse.json(
      { status: "error", message: "Parámetro 'artist' requerido" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.yhimsical.com/getartist?artist=${encodeURIComponent(artist)}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", message: "Error al obtener artista" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en /api/artist:", error);
    return NextResponse.json(
      { status: "error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
