import Link from 'next/link';

// Placeholder data
const CACHED_ARTWORKS = Array.from({ length: 6 }).map((_, i) => ({
  id: i,
  title: `Obra Moderna ${i + 1}`,
  description: 'Acrílico sobre lienzo, 2026',
  price: '$5,000 MXN',
}));

export default function Gallery() {
  return (
    <main className="main-content">
      <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px', textAlign: 'center' }}>Colección de Arte</h1>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-text)', textAlign: 'center', marginBottom: '48px' }}>
        Obras disponibles.
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '40px',
        padding: '20px 0'
      }}>
        {CACHED_ARTWORKS.map(art => (
          <div key={art.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Aspect ratio container representing the large artwork */}
            <div style={{ 
                backgroundColor: '#e0dcd9', 
                aspectRatio: '3/4', 
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted-text)'
              }}>
              [Imagen de Arte]
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-md)', margin: '0 0 4px 0', fontFamily: 'var(--font-inter)' }}>{art.title}</h3>
              <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-base)', margin: 0 }}>{art.description}</p>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-md)', marginTop: '8px' }}>{art.price}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
