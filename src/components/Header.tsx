'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="glass premium-header"
    >
      <Link href="/" style={{ fontSize: 'var(--text-md)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Elussila
      </Link>
      
      <nav className="header-nav">
        {[
          { name: 'Galería', href: '/gallery' },
          { name: 'Bio', href: '/about' },
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
            className="admin-pill"
          >
            <span className="admin-icon">❖</span> <span className="admin-text">Admin</span>
          </Link>
        </motion.div>
      </nav>
    </motion.header>
  );
}
