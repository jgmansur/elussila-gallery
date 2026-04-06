import { google } from 'googleapis';
import type { Auth, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const MAKE_FILES_PUBLIC = process.env.GOOGLE_DRIVE_PUBLIC !== 'false';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

export async function getGoogleAuth(): Promise<Auth.GoogleAuth> {
  const rawCredentials = process.env.GOOGLE_CREDENTIALS;
  if (!rawCredentials) {
    throw new Error("ERROR CRÍTICO: La variable GOOGLE_CREDENTIALS no está configurada en el servidor (Vercel).");
  }

  let credentials;
  try {
    credentials = JSON.parse(rawCredentials);
  } catch (parseError: unknown) {
    throw new Error(`ERROR DE SINTAXIS JSON: Las credenciales en Vercel tienen un formato inválido. Asegúrate de que no tengan comillas extra al principio. Detalle: ${getErrorMessage(parseError)}`);
  }
  
  if (!credentials.private_key) {
    throw new Error("ERROR DE CREDENCIALES: El JSON de Google no contiene la 'private_key'.");
  }

  // Vercel fix: Ensure private_key newlines are handled correctly
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth;
}

export async function uploadToDrive(
  auth: Auth.GoogleAuth,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
): Promise<{ id: string; url: string }> {
  if (!DRIVE_FOLDER_ID) {
    throw new Error('Falta GOOGLE_DRIVE_FOLDER_ID. Define una carpeta fija de tu Drive para subir fotos.');
  }

  const drive = google.drive({ version: 'v3', auth });
  const fileStream = Readable.from(fileBuffer);
   
  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: [DRIVE_FOLDER_ID],
  };
  
  const media = {
    mimeType: mimeType,
    body: fileStream,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('Drive no devolvió un ID de archivo.');
    }

    if (MAKE_FILES_PUBLIC) {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    return {
      id: fileId,
      url: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  } catch (error: unknown) {
    throw new Error(
      `Error subiendo a Drive. Verifica que la carpeta exista y esté compartida al service account con permiso de Editor. Detalle: ${getErrorMessage(error)}`
    );
  }
}

export async function deleteFromDrive(auth: Auth.GoogleAuth, fileId: string): Promise<void> {
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId });
}
