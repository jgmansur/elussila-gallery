import { NextResponse } from 'next/server';
import { getGoogleAuth, uploadToDrive, appendToSheet } from '@/lib/googleApi';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file');
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const details = formData.get('details') as string;

    if (!file || !title) {
      return NextResponse.json({ error: "Faltan datos requeridos (Foto o Título)." }, { status: 400 });
    }

    const theFile = file as File;

    const auth = await getGoogleAuth();
    
    const buffer = Buffer.from(await theFile.arrayBuffer());
    
    // En producción se usa un stream para subirlo a Drive, aquí simulamos que enviamos el buffer
    const driveUrl = await uploadToDrive(auth, theFile.name, theFile.type, buffer);
    
    const row = [title, price, details, driveUrl, new Date().toISOString()];
    await appendToSheet(auth, row);

    return NextResponse.json({ success: true, url: driveUrl });

  } catch (error) {
    console.error("Error al procesar la subida:", error);
    return NextResponse.json({ error: "No se pudo publicar la obra." }, { status: 500 });
  }
}
