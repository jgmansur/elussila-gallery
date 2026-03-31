import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', gap: '32px' }}>
      <header>
        <h1 style={{ fontSize: 'var(--text-xl)' }}>Portal de Administración</h1>
        <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-md)' }}>
          Bienvenida, Elussila. ¿Qué te gustaría hacer hoy?
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <Link href="/admin/upload" style={{ 
          backgroundColor: 'var(--text-color)', color: 'var(--bg-color)', 
          padding: '40px 24px', borderRadius: '16px', fontSize: 'var(--text-lg)',
          fontWeight: 600, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'
        }}>
          <span style={{ fontSize: '48px' }}>📸</span>
          Subir Nueva Obra
        </Link>
        
        <Link href="/gallery" style={{ 
          backgroundColor: '#EAE5E0', color: 'var(--text-color)', 
          padding: '32px 24px', borderRadius: '16px', fontSize: 'var(--text-md)',
          fontWeight: 500, textAlign: 'center'
        }}>
          Ver Mi Galería Pública
        </Link>
      </section>
    </main>
  );
}
