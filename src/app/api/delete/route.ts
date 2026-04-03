import { NextResponse } from 'next/server';
import { getGoogleAuth, deleteFromDrive } from '@/lib/googleApi';
import { getArtworks, deleteArtworkById, updateArtworkImages } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { artworkId, imageId } = await request.json();
    
    if (!artworkId) {
      return NextResponse.json({ error: "Falta artworkId" }, { status: 400 });
    }

    const auth = await getGoogleAuth();
    const artworks = await getArtworks();
    const targetArtwork = artworks.find(a => a.id === artworkId);

    if (!targetArtwork) {
      return NextResponse.json({ error: "Obra no encontrada en bd local" }, { status: 404 });
    }

    // Modo 1: Borrar una sola foto de la colección de la obra
    if (imageId) {
      const imgToDelete = targetArtwork.images.find(img => img.id === imageId);
      if (!imgToDelete) return NextResponse.json({ error: "Imagen no existe" }, { status: 404 });

      // Borrar de drive
      await deleteFromDrive(auth, imgToDelete.id);
      
      // Actualizar DB en Sheets
      const remainingImgs = targetArtwork.images.filter(img => img.id !== imageId);
      await updateArtworkImages(artworkId, remainingImgs);

      return NextResponse.json({ success: true, message: "Foto individual eliminada con éxito" });
    }

    // Modo 2: Borrar la obra entera y TODO su Drive Storage
    for (const img of targetArtwork.images) {
      await deleteFromDrive(auth, img.id);
    }
    
    // Quitar de la BD
    await deleteArtworkById(artworkId);

    return NextResponse.json({ success: true, message: "Obra y archivos de Drive eliminados" });

  } catch (error) {
    console.error("Error al borrar elementos:", error);
    return NextResponse.json({ error: "Fallo eliminando recurso." }, { status: 500 });
  }
}
