import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';
import { getGoogleAuth } from './googleApi';

export interface Artwork {
  id: string;
  title: string;
  price: string;
  details: string;
  images: { id: string; url: string }[];
  createdAt: string;
}

export interface AboutContent {
  title: string;
  bio: string;
  imageUrl: string;
}

interface LocalDB {
  artworks: Artwork[];
  about: AboutContent | null;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Inventario!A2:F';
const SHEET_NAME = 'Inventario';
const CONFIG_SHEET_NAME = 'Configuracion';
const DB_PATH = path.join(process.cwd(), 'db.json');

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

async function getAuthSafe() {
  try {
    return await getGoogleAuth();
  } catch (error: unknown) {
    console.warn('Google Auth no disponible, usando fallback local:', getErrorMessage(error));
    return null;
  }
}

function readLocalDB(): LocalDB {
  if (!fs.existsSync(DB_PATH)) {
    const initial: LocalDB = { artworks: [], about: null };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }

  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as LocalDB;
}

function writeLocalDB(data: LocalDB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function parseImages(raw: string | undefined): { id: string; url: string }[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is { id: string; url: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { url?: unknown }).url === 'string'
    );
  } catch {
    return [];
  }
}

async function initSheets(sheets: sheets_v4.Sheets): Promise<void> {
  if (!SPREADSHEET_ID) {
    return;
  }

  try {
    const inventoryHeader = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:F1`,
    });

    if (!inventoryHeader.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['ID', 'Title', 'Price', 'Details', 'Images_JSON', 'CreatedAt']],
        },
      });
    }

    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties.title',
    });

    const hasConfigSheet = (metadata.data.sheets ?? []).some(
      (sheet) => sheet.properties?.title === CONFIG_SHEET_NAME
    );

    if (!hasConfigSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: CONFIG_SHEET_NAME } } }],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONFIG_SHEET_NAME}!A1:C1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Title', 'Bio', 'ImageUrl']],
        },
      });
    }
  } catch (error: unknown) {
    console.error('Error initSheets:', getErrorMessage(error));
  }
}

function mapRowsToArtworks(rows: string[][]): Artwork[] {
  return rows.map((row) => ({
    id: row[0] ?? '',
    title: row[1] ?? '',
    price: row[2] ?? '',
    details: row[3] ?? '',
    images: parseImages(row[4]),
    createdAt: row[5] ?? '',
  }));
}

async function getSheetIdByName(
  sheets: sheets_v4.Sheets,
  sheetName: string
): Promise<number | null> {
  if (!SPREADSHEET_ID) {
    return null;
  }

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties(sheetId,title)',
  });

  const sheet = (metadata.data.sheets ?? []).find(
    (item) => item.properties?.title === sheetName
  );

  return sheet?.properties?.sheetId ?? null;
}

export async function getArtworks(): Promise<Artwork[]> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    return readLocalDB().artworks;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  await initSheets(sheets);

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return mapRowsToArtworks(rows as string[][]);
  } catch (error: unknown) {
    console.error('Error fetching artworks:', getErrorMessage(error));
    return readLocalDB().artworks;
  }
}

export async function addArtwork(artwork: Artwork): Promise<void> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    const db = readLocalDB();
    db.artworks.unshift(artwork);
    writeLocalDB(db);
    return;
  }

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const values = [
      [
        artwork.id,
        artwork.title,
        artwork.price,
        artwork.details,
        JSON.stringify(artwork.images),
        artwork.createdAt,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error('Error saving to Sheets:', message);
    throw new Error(`Google Sheets Fallo: ${message}`);
  }
}

export async function updateArtworkImages(
  artworkId: string,
  images: { id: string; url: string }[]
): Promise<boolean> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    const db = readLocalDB();
    const index = db.artworks.findIndex((artwork) => artwork.id === artworkId);
    if (index === -1) {
      return false;
    }

    db.artworks[index].images = images;
    writeLocalDB(db);
    return true;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const artworks = await getArtworks();
  const index = artworks.findIndex((artwork) => artwork.id === artworkId);
  if (index === -1) {
    return false;
  }

  const rowNumber = index + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!E${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[JSON.stringify(images)]],
    },
  });

  return true;
}

export async function deleteArtworkById(id: string): Promise<Artwork | null> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    const db = readLocalDB();
    const index = db.artworks.findIndex((artwork) => artwork.id === id);
    if (index === -1) {
      return null;
    }

    const deleted = db.artworks.splice(index, 1)[0];
    writeLocalDB(db);
    return deleted;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const artworks = await getArtworks();
  const index = artworks.findIndex((artwork) => artwork.id === id);
  if (index === -1) {
    return null;
  }

  const sheetId = await getSheetIdByName(sheets, SHEET_NAME);
  if (sheetId === null) {
    throw new Error(`No se encontró la hoja '${SHEET_NAME}' en el spreadsheet.`);
  }

  const toDelete = artworks[index];
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: index + 1,
              endIndex: index + 2,
            },
          },
        },
      ],
    },
  });

  return toDelete;
}

export async function getAboutContent(): Promise<AboutContent | null> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    return readLocalDB().about;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET_NAME}!A2:C2`,
    });

    const row = response.data.values?.[0];
    if (!row) {
      return null;
    }

    return {
      title: row[0] ?? '',
      bio: row[1] ?? '',
      imageUrl: row[2] ?? '',
    };
  } catch (error: unknown) {
    console.error('Error fetching about content:', getErrorMessage(error));
    return readLocalDB().about;
  }
}

export async function updateAboutContent(content: AboutContent): Promise<void> {
  const auth = await getAuthSafe();
  if (!auth || !SPREADSHEET_ID) {
    const db = readLocalDB();
    db.about = content;
    writeLocalDB(db);
    return;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONFIG_SHEET_NAME}!A2:C2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[content.title, content.bio, content.imageUrl]],
      },
    });
  } catch (error: unknown) {
    console.error('Error updating about content:', getErrorMessage(error));
    throw error;
  }
}
