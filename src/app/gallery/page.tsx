'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Align with the DB Artwork interface
interface Artwork {
  id: string;
  title: string;
  price: string;
  details: string;
  images: { id: string, url: string }[];
  createdAt: string;
}

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArtworks(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openModal = (art: Artwork) => {
    setSelectedArtwork(art);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; 
  };

  const closeModal = () => {
    setSelectedArtwork(null);
    document.body.style.overflow = 'auto'; 
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedArtwork) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedArtwork.images.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedArtwork) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedArtwork.images.length) % selectedArtwork.images.length);
    }
  };

  return (
    <main className="main-content">
      <header style={{ marginBottom: 'var(--space-xl)', textAlign: 'left' }}>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.04em' }}
        >
          Colección <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Curada</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: 'var(--space-sm)' }}
        >
          Una exploración de la forma y la materia. Cada pieza ha sido seleccionada por su diálogo único con el espacio contemporáneo.
        </motion.p>
      </header>
      
      {loading ? (
        <div style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '2px solid var(--border)', borderTopColor: 'var(--text-primary)', borderRadius: '50%' }} />
        </div>
      ) : artworks.length === 0 ? (
        <section style={{ height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>Próximamente nuevas obras.</p>
        </section>
      ) : (
        <div className="artwork-grid">
          {artworks.map((art, index) => (
            <motion.div 
              key={art.id} 
              layoutId={art.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="artwork-card" 
              onClick={() => openModal(art)} 
              style={{ cursor: 'pointer' }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#F0EBE6' }}>
                {art.images.length > 0 && (
                  <img 
                    src={art.images[0].url} 
                    alt={art.title} 
                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    className="artwork-image"
                  />
                )}
                {art.images.length > 1 && (
                  <div className="glass" style={{ position: 'absolute', bottom: '16px', right: '16px', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                    {art.images.length} Fotos
                  </div>
                )}
              </div>
              <div style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{art.title}</h3>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>{art.price}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>{art.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Premium Carousel Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 2000,
              display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', cursor: 'zoom-out',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Close UI */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              style={{ position: 'absolute', top: '32px', right: '32px', fontSize: '32px', zIndex: 2100 }}
            >
              ×
            </motion.button>

            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'default' }}
            >
              {/* Main Image Container */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '70vh', display: 'flex', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={selectedArtwork.images[currentImageIndex].url}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                    onClick={() => selectedArtwork.images.length > 1 && nextImage()}
                  />
                </AnimatePresence>

                {selectedArtwork.images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '-48px', display: 'flex', gap: '12px' }}>
                    <button onClick={prevImage} style={{ fontSize: '1.5rem', opacity: 0.5 }}>←</button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {selectedArtwork.images.map((_, i) => (
                        <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentImageIndex ? 'var(--text-primary)' : 'var(--border)' }} />
                      ))}
                    </div>
                    <button onClick={nextImage} style={{ fontSize: '1.5rem', opacity: 0.5 }}>→</button>
                  </div>
                )}
              </div>

              {/* Artwork Info - Clean & Floating */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginTop: 'var(--space-xl)', textAlign: 'center', maxWidth: '600px' }}
              >
                <h2 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-serif)' }}>{selectedArtwork.title}</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{selectedArtwork.details}</p>
                <div style={{ marginTop: '16px', fontWeight: 600, fontSize: 'var(--text-md)' }}>{selectedArtwork.price}</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
