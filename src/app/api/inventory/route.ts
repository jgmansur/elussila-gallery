import { NextResponse } from 'next/server';
import { getArtworks } from '@/lib/db';

export async function GET() {
  try {
    const artworks = await getArtworks();
    return NextResponse.json(artworks);
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return NextResponse.json({ error: "No se pudo obtener el inventario." }, { status: 500 });
  }
}
