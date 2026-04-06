'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function About() {
  const [data, setData] = useState<{title: string, bio: string, imageUrl: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(val => {
        setData(val);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="loading-text">Cargando historia...</p>
      </main>
    );
  }

  const titleParts = data?.title?.split(':') || ['Eva González', 'El Arte de Reinventarse'];

  return (
    <main className="main-content">
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.04em' }}
        >
          {titleParts[0]}
        </motion.h1>
        {titleParts[1] && (
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 'var(--text-md)', fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
          >
            {titleParts[1].trim()}
          </motion.p>
        )}
      </header>

      <section className="broken-grid" style={{ alignItems: 'start' }}>
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ 
            gridColumn: '1 / span 5', 
            aspectRatio: '3/4', 
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}
        >
            <Image
              src={data?.imageUrl || 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000&auto=format&fit=crop'}
              alt="Eva González"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              style={{ objectFit: 'cover' }}
            />
            <div className="glass-overlay" />
        </motion.div>

        <div style={{ gridColumn: '7 / span 6', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <motion.article 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}
          >
            {data?.bio}
          </motion.article>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass"
            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--text-primary)' }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-md)' }}>
              &ldquo;El alma joven siempre tiene un nuevo sueño por alcanzar.&rdquo;
            </p>
          </motion.div>
        </div>

      </section>

      <footer style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Trayectoria • Arte • Legado
        </p>
      </footer>
    </main>
  );
}
