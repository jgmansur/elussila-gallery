'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Fetch real data from the local API DB
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArtworks(data);
        }
      })
      .catch();
  }, []);

  const openModal = (art: Artwork) => {
    setSelectedArtwork(art);
    setCurrentImageIndex(0); // Always start at the first image
    document.body.style.overflow = 'hidden'; 
  };

  const closeModal = () => {
    setSelectedArtwork(null);
    document.body.style.overflow = 'auto'; 
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedArtwork) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedArtwork.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedArtwork) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedArtwork.images.length) % selectedArtwork.images.length);
    }
  };

  return (
    <main className="main-content">
      <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px', textAlign: 'center' }}>Colección de Arte</h1>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-text)', textAlign: 'center', marginBottom: '48px' }}>
        Obras disponibles en distintos formatos.
      </p>
      
      {artworks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted-text)', fontSize: 'var(--text-lg)' }}>
          No hay obras publicadas en la galería aún.
        </p>
      ) : (
        <div className="masonry-grid">
          {artworks.map(art => (
            <div key={art.id} className="masonry-item" onClick={() => openModal(art)} style={{ cursor: 'pointer' }}>
              <div style={{ 
                  backgroundColor: '#e0dcd9', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {/* Always show the FIRST image as the grid cover */}
                {art.images.length > 0 && (
                  <img 
                    src={art.images[0].url} 
                    alt={art.title} 
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                  />
                )}
                {/* Indicator if there are multiple photos */}
                {art.images.length > 1 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 600 }}>
                    {art.images.length} fotos
                  </div>
                )}
              </div>
              <div style={{ paddingTop: '16px' }}>
                <h3 style={{ fontSize: 'var(--text-md)', margin: '0 0 4px 0', fontFamily: 'var(--font-inter)' }}>{art.title}</h3>
                <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-base)', margin: 0 }}>{art.details}</p>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-md)', marginTop: '8px' }}>{art.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Carousel Modal */}
      {selectedArtwork && selectedArtwork.images.length > 0 && (
        <div 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(10, 10, 10, 0.98)', // Darker, cinematic background
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px', // Reduced padding for maximizing image size
            cursor: 'zoom-out'
          }}
        >
          {/* Close button */}
          <button 
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              color: 'var(--bg-color)',
              fontSize: '48px',
              lineHeight: 1,
              fontFamily: 'var(--font-inter)',
              zIndex: 1010
            }}
          >
            &times;
          </button>

          {/* Modal Content container: Maximized space */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              backgroundColor: 'transparent',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              cursor: 'default',
              position: 'relative'
            }}
          >
            {/* CAROUSEL CONTROLS */}
            {selectedArtwork.images.length > 1 && (
              <>
                <button onClick={prevImage} style={{ 
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                  width: '64px', height: '64px', borderRadius: '50%', fontSize: '32px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1010
                }}>
                  &#10094;
                </button>
                <button onClick={nextImage} style={{ 
                  position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                  width: '64px', height: '64px', borderRadius: '50%', fontSize: '32px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1010
                }}>
                  &#10095;
                </button>
                
                {/* Dots indicator */}
                <div style={{ position: 'absolute', bottom: '100px', display: 'flex', gap: '8px', zIndex: 1010 }}>
                  {selectedArtwork.images.map((_, idx) => (
                    <div key={idx} style={{ 
                      width: '10px', height: '10px', borderRadius: '50%', 
                      backgroundColor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.3)',
                      transition: 'background-color 0.3s'
                    }} />
                  ))}
                </div>
              </>
            )}

            {/* Enlarged Image section */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxHeight: 'calc(100vh - 120px)' }}>
              <img 
                src={selectedArtwork.images[currentImageIndex].url} 
                alt={`${selectedArtwork.title} - ${currentImageIndex + 1}`} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain', 
                  display: 'block',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.5)'
                }} 
              />
            </div>

            {/* Details section floating at the bottom */}
            <div style={{ 
              width: '100%', maxWidth: '800px', padding: '24px', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '16px', marginTop: '16px', color: 'white',
              backdropFilter: 'blur(10px)'
            }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', margin: '0 0 4px 0', fontFamily: 'var(--font-playfair)' }}>
                  {selectedArtwork.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-base)', margin: 0 }}>
                  {selectedArtwork.details}
                </p>
              </div>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-lg)', margin: 0 }}>
                {selectedArtwork.price}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
