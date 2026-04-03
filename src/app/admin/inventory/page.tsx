'use client';
import { useState, useEffect } from 'react';

// Basic type mirroring the db structure
interface Artwork {
  id: string;
  title: string;
  price: string;
  details: string;
  images: { id: string, url: string }[];
  createdAt: string;
}

export default function Inventory() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [status, setStatus] = useState<'loading' | 'idle' | 'error'>('loading');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load from local API to fetch db JSON
  const fetchInventory = async () => {
    try {
      // Create a small API route later to just GET all works, for now let's mock the UI logic to visualize
      // The actual fetch would go to `/api/inventory`
      const mockResult = await fetch('/api/inventory');
      if (mockResult.ok) {
        setArtworks(await mockResult.json());
      } else {
        // Fallback or error
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchInventory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteArtwork = async (artworkId: string) => {
    const confirm = window.confirm("🚨 ¿Estás segura de querer borrar esta obra de tu galería y de tu Google Drive de forma permanente?");
    if (!confirm) return;

    setDeletingId(artworkId);
    try {
      const resp = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId })
      });
      if (resp.ok) {
        setArtworks(prev => prev.filter(a => a.id !== artworkId));
        alert("Obra y fotos eliminadas por completo.");
      } else {
        alert("Error al intentar borrar la obra.");
      }
    } catch (e) {
      alert("Falla de red al borrar.");
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSingleImage = async (artworkId: string, imageId: string) => {
     const confirm = window.confirm("¿Segura de borrar solo esta fotografía específica? (También de Google Drive)");
     if (!confirm) return;

     setDeletingId(imageId);
     try {
       const resp = await fetch('/api/delete', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ artworkId, imageId })
       });
       if (resp.ok) {
         setArtworks(prev => prev.map(art => {
           if (art.id === artworkId) {
             return { ...art, images: art.images.filter(img => img.id !== imageId) };
           }
           return art;
         }));
       } else {
         alert("Error al intentar borrar la fotografía.");
       }
     } catch (e) {
       alert("Error de conexión al borrar la fotografía.");
     } finally {
       setDeletingId(null);
     }
  };

  return (
    <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', gap: '32px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Mi Inventario</h1>
        <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-md)' }}>Administra tus obras o elimina fotos no deseadas de Google Drive.</p>
      </header>

      {status === 'loading' && <p style={{ fontSize: 'var(--text-lg)' }}>Cargando inventario...</p>}

      {status === 'idle' && artworks.length === 0 && (
        <div style={{ backgroundColor: '#F0EBE6', padding: '48px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--muted-text)' }}>Tu inventario está vacío actualmente.</p>
        </div>
      )}

      {status === 'idle' && artworks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {artworks.map(art => (
            <div key={art.id} style={{ 
              backgroundColor: '#FFF', border: '1px solid #EAE5E0', borderRadius: '16px', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 8px 0', fontFamily: 'var(--font-inter)' }}>{art.title}</h2>
                  <p style={{ fontSize: 'var(--text-md)', margin: 0, fontWeight: 500 }}>{art.price}</p>
                </div>
                
                {/* Big Danger Delete Button for entire Artwork */}
                <button 
                  onClick={() => deleteArtwork(art.id)}
                  disabled={deletingId === art.id}
                  style={{ 
                    backgroundColor: '#ffebeb', color: '#cc0000', border: '1px solid #ffcccc', 
                    padding: '16px 24px', borderRadius: '12px', fontSize: 'var(--text-md)',
                    fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center',
                    opacity: deletingId === art.id ? 0.5 : 1
                  }}>
                  🗑️ {deletingId === art.id ? 'Borrando Obra y Drive...' : 'Borrar Toda la Obra'}
                </button>
              </div>

              {/* Display Images associated with this artwork */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Fotografías subidas a Drive:</p>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                   {art.images.map((img, index) => (
                     <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e0dcd9', paddingBottom: '100%' }}>
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={img.url} alt={`Foto ${index}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                       
                       <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
                         {index === 0 ? 'Portada' : `Foto ${index + 1}`}
                       </div>
                       
                       <button 
                          onClick={() => deleteSingleImage(art.id, img.id)}
                          disabled={deletingId === img.id}
                          style={{ 
                            position: 'absolute', bottom: 8, right: 8, backgroundColor: '#cc0000', color: 'white', 
                            border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px',
                            fontWeight: 600, cursor: 'pointer', opacity: deletingId === img.id ? 0.5 : 1
                          }}>
                          {deletingId === img.id ? '...' : 'Borrar Foto'}
                       </button>

                     </div>
                   ))}
                 </div>
                 {art.images.length === 0 && <p style={{ color: 'var(--muted-text)' }}>No hay fotos registradas para esta obra.</p>}
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  );
}
