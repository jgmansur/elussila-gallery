'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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

  const fetchInventory = async () => {
    try {
      const result = await fetch('/api/inventory');
      if (result.ok) {
        setArtworks(await result.json());
      }
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const deleteArtwork = async (artworkId: string) => {
    const confirm = window.confirm("🚨 ¿Estás segura de querer borrar esta obra por completo?");
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
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="main-content">
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)' }}
        >
          Gestión de <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Inventario</span>
        </motion.h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
          Mantén tu catálogo actualizado. Todos los cambios se reflejan en Google Sheets.
        </p>
      </header>

      {status === 'loading' ? (
        <div style={{ height: '20vh', display: 'flex', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Cargando inventario...</p>
        </div>
      ) : artworks.length === 0 ? (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ padding: 'var(--space-xl)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>Tu inventario está vacío actualmente.</p>
        </motion.section>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <AnimatePresence mode="popLayout">
            {artworks.map((art) => (
              <motion.article
                key={art.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="glass"
                style={{ 
                  padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)',
                  display: 'flex', justifyContent: 'space-between', gap: 'var(--space-lg)',
                  opacity: deletingId === art.id ? 0.5 : 1
                }}
              >
                {/* Info Section */}
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{art.title}</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{art.price}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '8px' }}>{art.details}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {art.images.map((img, idx) => (
                      <div key={img.id} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--border)' }}>
                        <Image src={img.url} alt={`Obra ${idx}`} width={64} height={64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ alignSelf: 'flex-start' }}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteArtwork(art.id)}
                    disabled={!!deletingId}
                    style={{ 
                      padding: '12px 24px', backgroundColor: '#FFF0F0', color: '#CC0000',
                      borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--text-sm)',
                      cursor: deletingId === art.id ? 'not-allowed' : 'pointer',
                      border: '1px solid #FFE5E5'
                    }}
                  >
                    {deletingId === art.id ? 'Borrando...' : 'Eliminar Obra'}
                  </motion.button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
