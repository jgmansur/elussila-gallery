import { NextResponse } from 'next/server';
import { getAboutContent, updateAboutContent } from '@/lib/db';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

export async function GET() {
  try {
    const data = await getAboutContent();
    return NextResponse.json(data || {});
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.bio) {
      return NextResponse.json({ error: 'Título y Biografía son requeridos.' }, { status: 400 });
    }
    await updateAboutContent(body);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
