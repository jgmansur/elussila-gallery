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
      const theFile = fileItem as File;
      const buffer = Buffer.from(await theFile.arrayBuffer());
      
      const { id, url } = await uploadToDrive(auth, theFile.name, theFile.type, buffer);
      uploadedImages.push({ id, url });
    }
    
    const newEntry = {
      id: Date.now().toString(), // Generamos un ID único local
      title,
      price,
      details,
      images: uploadedImages, // Almacenamos el arreglo de la galería
      createdAt: new Date().toISOString()
    };
    
    // Guardar en nuestra BD local en lo que la UI está lista y la pasamos a Sheets
    addArtwork(newEntry);

    return NextResponse.json({ success: true, artworkId: newEntry.id });

  } catch (error) {
    console.error("Error al procesar la subida múltiple:", error);
    return NextResponse.json({ error: "No se pudo publicar la obra." }, { status: 500 });
  }
}
