import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en /api/search:", error);
    return NextResponse.json(
      { status: "error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
