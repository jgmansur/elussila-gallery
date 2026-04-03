'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="main-content">
      <section className="broken-grid" style={{ minHeight: '80vh', alignItems: 'center' }}>
        
        {/* Massive Typography - Asymmetrical */}
        <div style={{ gridColumn: '1 / span 8', zIndex: 10 }}>
          <motion.h1 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)', lineHeight: 1.1, letterSpacing: '-0.04em' }}
          >
            Arte <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Moderno</span>,<br />
            Visión Única.
          </motion.h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ marginTop: 'var(--space-lg)', maxWidth: '500px' }}
          >
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Una curaduría exclusiva de piezas contemporáneas que desafían la percepción y celebran la técnica artesanal. 
            </p>
            <Link href="/gallery" className="btn-premium">
              Explorar Colección
            </Link>
          </motion.div>
        </div>

        {/* Decorative element / Background depth - Hidden on small mobile to prevent overlap or styled to stack */}
        <div style={{ gridColumn: '7 / span 6', position: 'relative', height: '100%', minHeight: '300px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'var(--space-xl)' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.2, ease: 'easeOut' }}
            style={{ 
              width: '100%', 
              height: '400px', 
              background: 'linear-gradient(135deg, #EAE5E0 0%, #D8D2CB 100%)',
              borderRadius: 'var(--radius-lg)',
              transform: 'rotate(-2deg)'
            }} 
          />
          <motion.div 
            initial={{ x: 30, y: 30, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{ 
              position: 'absolute', 
              top: '10%', 
              left: '-10%',
              width: '100%', 
              height: '400px', 
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              zIndex: -1
            }} 
          />
        </div>

      </section>

      {/* Subtle Footer-like teaser */}
      <section style={{ marginTop: 'var(--space-xxl)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Basado en México
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Colección 2024
        </div>
      </section>
    </main>
  );
}
