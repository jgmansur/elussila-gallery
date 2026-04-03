import Image from 'next/image';

export default function About() {
  return (
    <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-base) * 8 var(--spacing-base) * 3' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', alignItems: 'center' }}>
        
        {/* Elegant header */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: 'var(--text-xxl)', marginBottom: '16px' }}>Eva González</h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--muted-text)', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
            El Arte de Reinventarse
          </p>
        </header>

        {/* Content Layout (Image + Text) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '64px', 
          alignItems: 'start' 
        }}>
          
          {/* Photo Placeholder */}
          <div style={{ 
            backgroundColor: '#e0dcd9', 
            borderRadius: '16px',
            overflow: 'hidden',
            aspectRatio: '3/4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            position: 'relative'
          }}>
            <span style={{ color: 'var(--muted-text)', fontSize: 'var(--text-lg)', fontFamily: 'var(--font-playfair)' }}>
               [ Foto de Eva González ]
            </span>
          </div>

          {/* Biography Text Formatted elegantly */}
          <article style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-color)' }}>
            <p>
              Originaria de Tamaulipas, Eva es una artista polifacética cuya vida ha sido un lienzo en constante evolución. Su camino en las artes comenzó con la música, donde destacó como una voz privilegiada, para después conquistar el mundo del diseño textil fundando su propia maquiladora en Ciudad Victoria.
            </p>
            <p>
              Impulsada por el amor y la visión, Eva emprendió una misión fundamental: la carrera de sus hijos, Jay y Xeronimo Mansur. Con el apoyo incondicional y el legado de su esposo, el Dr. Juan Guillermo Mansur Arzola (Q.E.P.D.), se estableció en Miami, logrando posicionarse en la élite de la industria musical. Su paso por Sasha Enterprises la llevó a colaborar en el management de figuras de talla mundial como Chayanne, Alicia Machado y El Puma, además de impulsar el surgimiento de nuevos talentos del reggaetón.
            </p>
            <p>
              Hoy, de regreso en su tierra, Eva ha volcado toda esa experiencia cosmopolita en las artes plásticas y la joyería de autor. A través del óleo con espátula, el acrílico y la intervención en madera, crea piezas de arte moderno que reflejan un espíritu que se niega a envejecer. Eva no solo pinta; captura la energía de una vida dedicada a la creación, demostrando que el alma joven siempre tiene un nuevo sueño por alcanzar.
            </p>
          </article>

        </div>
      </div>

    </main>
  );
}
