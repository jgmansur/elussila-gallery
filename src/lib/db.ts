import fs from 'fs';
import path from 'path';

// Define the structure of our JSON DB
export interface Artwork {
  id: string; // Unique ID (e.g. timestamp)
  title: string;
  price: string;
  details: string;
  images: { id: string, url: string }[];
  createdAt: string;
}

const dbPath = path.join(process.cwd(), 'db.json');

// Initialize the DB file if it doesn't exist
function initDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ artworks: [] }, null, 2));
  }
}

export function getArtworks(): Artwork[] {
  initDB();
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  try {
    const data = JSON.parse(rawData);
    return data.artworks || [];
  } catch (e) {
    return [];
  }
}

export function addArtwork(artwork: Artwork) {
  const artworks = getArtworks();
  artworks.push(artwork);
  fs.writeFileSync(dbPath, JSON.stringify({ artworks }, null, 2));
}

export function deleteArtworkById(id: string) {
  let artworks = getArtworks();
  const toDelete = artworks.find(a => a.id === id);
  artworks = artworks.filter(a => a.id !== id);
  fs.writeFileSync(dbPath, JSON.stringify({ artworks }, null, 2));
  return toDelete;
}

export function updateArtworkImages(id: string, updatedImages: { id: string, url: string }[]) {
  const artworks = getArtworks();
  const idx = artworks.findIndex(a => a.id === id);
  if (idx !== -1) {
    artworks[idx].images = updatedImages;
    fs.writeFileSync(dbPath, JSON.stringify({ artworks }, null, 2));
  }
}
