import { NextResponse } from 'next/server';
import { getGoogleAuth, uploadToDrive } from '@/lib/googleApi';
import { addArtwork } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Support multiple files with the same field name "file"
    const files = formData.getAll('file'); 
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const details = formData.get('details') as string;

    if (!files || files.length === 0 || !title) {
      return NextResponse.json({ error: "Faltan datos requeridos (Foto o Título)." }, { status: 400 });
    }

    const auth = await getGoogleAuth();
    
    // Array to hold the uploaded Drive file links and IDs
    const uploadedImages: { id: string, url: string }[] = [];

    // Subir cada foto a Drive
    for (const fileItem of files) {
      if (!(fileItem instanceof File)) continue;
      
      const buffer = Buffer.from(await fileItem.arrayBuffer());
      const fileName = fileItem.name || 'untitled_image';
      const fileType = fileItem.type || 'image/jpeg';
      
      const { id, url } = await uploadToDrive(auth, fileName, fileType, buffer);
      if (id && url) {
        uploadedImages.push({ id, url });
      }
    }
    
    const newEntry = {
      id: Date.now().toString(), // Generamos un ID único local
      title,
      price,
      details,
      images: uploadedImages, // Almacenamos el arreglo de la galería
      createdAt: new Date().toISOString()
    };
    
    // Guardar en nuestra BD en Google Sheets
    await addArtwork(newEntry);

    return NextResponse.json({ success: true, artworkId: newEntry.id });

  } catch (error: any) {
    console.error("Error al procesar la subida múltiple:", error);
    const errorMessage = error.message || "No se pudo publicar la obra.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
