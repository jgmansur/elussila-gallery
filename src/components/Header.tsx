'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="glass"
      style={{
        position: 'fixed',
        top: 'var(--space-md)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - var(--space-xl))',
        maxWidth: '1200px',
        zIndex: 1000,
        borderRadius: 'var(--radius-full)',
        padding: 'var(--space-sm) var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link href="/" style={{ fontSize: 'var(--text-md)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Elussila
      </Link>
      
      <nav style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        {[
          { name: 'Galería', href: '/gallery' },
          { name: 'Biografía', href: '/about' },
        ].map((link) => (
          <motion.div key={link.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link 
              href={link.href} 
              style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              {link.name}
            </Link>
          </motion.div>
        ))}
        
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Link 
            href="/admin" 
            style={{ 
              fontSize: 'var(--text-sm)', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.03)'
            }}
          >
            Admisión
          </Link>
        </motion.div>
      </nav>
    </motion.header>
  );
}
