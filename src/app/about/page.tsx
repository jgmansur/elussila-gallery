'use client';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <main className="main-content">
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.04em' }}
        >
          Eva <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text-muted)' }}>González</span>
        </motion.h1>
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'var(--text-md)', fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)' }}
        >
          El Arte de Reinventarse
        </motion.p>
      </header>

      <section className="broken-grid" style={{ alignItems: 'start' }}>
        
        {/* Visual Element - Asymmetrical */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ 
            gridColumn: '1 / span 5', 
            aspectRatio: '3/4', 
            background: 'linear-gradient(135deg, #E0DCD9 0%, #C8C2BE 100%)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
           <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
             Retrato en Proceso
           </span>
        </motion.div>

        {/* Biography Content - High Whitespace */}
        <div style={{ gridColumn: '7 / span 6', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <motion.article 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, color: 'var(--text-secondary)' }}
          >
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Originaria de Tamaulipas, Eva es una artista polifacética cuya vida ha sido un lienzo en constante evolución. Su camino en las artes comenzó con la música, donde destacó como una voz privilegiada, para después conquistar el mundo del diseño textil fundando su propia maquiladora en Ciudad Victoria.
            </p>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Impulsada por el amor y la visión, Eva emprendió una misión fundamental: la carrera de sus hijos, Jay y Xeronimo Mansur. Con el apoyo incondicional y el legado de su esposo, el Dr. Juan Guillermo Mansur Arzola (Q.E.P.D.), se estableció en Miami, logrando posicionarse en la élite de la industria musical.
            </p>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              Colaboró en el management de figuras de talla mundial como Chayanne, Alicia Machado y El Puma, además de impulsar el surgimiento de nuevos talentos del reggaetón en Sasha Enterprises.
            </p>
            <p>
              Hoy, de regreso en su tierra, Eva ha volcado toda esa experiencia cosmopolita en las artes plásticas y la joyería de autor. A través del óleo con espátula, el acrílico y la intervención en madera, crea piezas de arte moderno que reflejan un espíritu que se niega a envejecer.
            </p>
          </motion.article>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass"
            style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--text-primary)' }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-md)' }}>
              "Eva no solo pinta; captura la energía de una vida dedicada a la creación."
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
