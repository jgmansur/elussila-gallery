import { google } from 'googleapis';
import { getGoogleAuth } from './googleApi';

// Define the structure of our JSON DB
export interface Artwork {
  id: string; // Unique ID (e.g. timestamp)
  title: string;
  price: string;
  details: string;
  images: { id: string, url: string }[];
  createdAt: string;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Inventario!A2:F'; // Data starts on A2 (A1 is header)
const SHEET_NAME = 'Inventario';

// Initialize the Sheet with headers if it's empty
async function initSheet(sheets: any) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:F1`,
    });
    
    if (!response.data.values) {
      // Sheet is empty or doesn't exist, create headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'Title', 'Price', 'Details', 'Images_JSON', 'CreatedAt']],
        },
      });
    }
  } catch (e: any) {
    console.error("Error initSheet:", e.message);
  }
}

export async function getArtworks(): Promise<Artwork[]> {
  const auth = await getGoogleAuth();
  if (!auth) return [];
  
  const sheets = google.sheets({ version: 'v4', auth });
  await initSheet(sheets);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row: any) => ({
      id: row[0],
      title: row[1] || '',
      price: row[2] || '',
      details: row[3] || '',
      images: row[4] ? JSON.parse(row[4]) : [],
      createdAt: row[5] || '',
    }));
  } catch (e: any) {
    console.error("Error fetching artworks:", e.message);
    return [];
  }
}

export async function addArtwork(artwork: Artwork) {
  const auth = await getGoogleAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: 'v4', auth });
  
  const values = [
    [
      artwork.id,
      artwork.title,
      artwork.price,
      artwork.details,
      JSON.stringify(artwork.images),
      artwork.createdAt
    ]
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

export async function deleteArtworkById(id: string) {
  const auth = await getGoogleAuth();
  if (!auth) return null;

  const sheets = google.sheets({ version: 'v4', auth });
  const artworks = await getArtworks();
  const index = artworks.findIndex(a => a.id === id);

  if (index !== -1) {
    const toDelete = artworks[index];
    // We can't easily "delete a row" via simple range values without batchUpdate
    // For simplicity, we clear the row or empty it, here we use batchUpdate to delete the specific row
    const rowToRemove = index + 2; // +1 for 0-index -> 1-index, +1 for header
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Using default sheet ID
              dimension: 'ROWS',
              startIndex: index + 1, // index 0 is first data row (row 2)
              endIndex: index + 2,
            }
          }
        }]
      }
    });

    return toDelete;
  }
  return null;
}

export async function updateArtworkImages(id: string, updatedImages: { id: string, url: string }[]) {
  const auth = await getGoogleAuth();
  if (!auth) return;

  const sheets = google.sheets({ version: 'v4', auth });
  const artworks = await getArtworks();
  const index = artworks.findIndex(a => a.id === id);

  if (index !== -1) {
    const rowToUpdate = index + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!E${rowToUpdate}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[JSON.stringify(updatedImages)]]
      }
    });
  }
}
