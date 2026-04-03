import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

export async function getGoogleAuth() {
  try {
    const rawCredentials = process.env.GOOGLE_CREDENTIALS;
    if (!rawCredentials) {
      console.warn("GOOGLE_CREDENTIALS NO ESTÁN CONFIGURADAS.");
      return null;
    }

    const credentials = JSON.parse(rawCredentials);
    
    // Vercel fix: Ensure private_key newlines are handled correctly
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return auth;
  } catch (error: any) {
    console.error("Error al parsear GOOGLE_CREDENTIALS:", error.message);
    return null;
  }
}

export async function uploadToDrive(auth: any, fileName: string, mimeType: string, fileStream: any) {
  if (!auth) return { id: "mock_id_123", url: "MOCK_DRIVE_URL_12345" };

  const drive = google.drive({ version: 'v3', auth });
   
  const fileMetadata = {
    name: fileName,
    parents: ['1BrBgwCSercYBcRJBuEsm27Q_OgjVX_Yu'], // Hardcoded Folder ID provided by user
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

  return { 
    id: response.data.id, 
    url: response.data.webViewLink 
  };
}

export async function deleteFromDrive(auth: any, fileId: string) {
  if (!auth) {
    console.log("MOCK: Deleted file", fileId);
    return true;
  }
  
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId });
  return true;
}

export async function appendToSheet(auth: any, rowData: any[]) {
  if (!auth) return "MOCK_SHEET_UPDATE_SUCCESS";

  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Inventario!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}
