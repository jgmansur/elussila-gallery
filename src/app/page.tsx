import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-xxl)', marginBottom: '24px' }}>Arte Moderno, Visión Única</h1>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--muted-text)', maxWidth: '800px', marginBottom: '48px' }}>
        Descubre nuestra colección exclusiva de obra contemporánea.
      </p>
      <Link href="/gallery" className="btn-primary">
        Ver Galería Completa
      </Link>
    </main>
  );
}
