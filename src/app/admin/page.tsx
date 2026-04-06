'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const adminCards = [
    { 
      title: 'Subir Nueva Obra', 
      href: '/admin/upload', 
      icon: '📸', 
      description: 'Publica fotos directamente a Google Drive y Sheets.',
      primary: true 
    },
    { 
      title: 'Inventario y Drive', 
      href: '/admin/inventory', 
      icon: '🗑️', 
      description: 'Gestiona existencias y elimina archivos de la nube.' 
    },
    { 
      title: 'Mi Biografía', 
      href: '/admin/about', 
      icon: '✍️', 
      description: 'Actualiza tu perfil y texto de presentación.' 
    },
    { 
      title: 'Ver Galería', 
      href: '/gallery', 
      icon: '🏠', 
      description: 'Ver cómo luce tu sitio para el público.' 
    },
  ];

  return (
    <main className="main-content">
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-sm)' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
            }}
          >
            Cerrar sesión
          </button>
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-xs)' }}
        >
          Portal de <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>Gestión</span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}
        >
          Bienvenida, Elussila. Administra tu legado artístico desde aquí.
        </motion.p>
      </header>

      <section className="broken-grid" style={{ minHeight: '60vh' }}>
        {adminCards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, type: 'spring', damping: 25 }}
            style={{ 
              gridColumn: index % 2 === 0 ? 'span 6' : 'span 6',
              height: '100%'
            }}
          >
            <Link href={card.href}>
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="glass"
                style={{ 
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-lg)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                  border: card.primary ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  backgroundColor: card.primary ? 'rgba(0,0,0,0.02)' : 'var(--bg-surface)'
                }}
              >
                <span style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>{card.icon}</span>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{card.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{card.description}</p>
                
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', alignSelf: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Acceder →
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
