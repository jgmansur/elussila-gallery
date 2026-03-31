import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

export async function getGoogleAuth() {
  const credentials = process.env.GOOGLE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_CREDENTIALS) : null;
  
  if (!credentials) {
    console.warn("GOOGLE_CREDENTIALS NO ESTÁN CONFIGURADAS. Modo desarrollo activado.");
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth;
}

export async function uploadToDrive(auth: any, fileName: string, mimeType: string, fileStream: any) {
  if (!auth) return "MOCK_DRIVE_URL_12345";

  const drive = google.drive({ version: 'v3', auth });
   
  const fileMetadata = {
    name: fileName,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''],
  };
  
  const media = {
    mimeType: mimeType,
    body: fileStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  return response.data.webViewLink;
}

export async function appendToSheet(auth: any, rowData: any[]) {
  if (!auth) return "MOCK_SHEET_UPDATE_SUCCESS";

  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Inventario!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}
