'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditBiography() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [title, setTitle] = useState('Eva González: El Arte de Reinventarse');
  const [bioText, setBioText] = useState(
    `Originaria de Tamaulipas, Eva es una artista polifacética cuya vida ha sido un lienzo en constante evolución. Su camino en las artes comenzó con la música, donde destacó como una voz privilegiada, para después conquistar el mundo del diseño textil fundando su propia maquiladora en Ciudad Victoria.\n\nImpulsada por el amor y la visión, Eva emprendió una misión fundamental: la carrera de sus hijos, Jay y Xeronimo Mansur. Con el apoyo incondicional y el legado de su esposo, el Dr. Juan Guillermo Mansur Arzola (Q.E.P.D.), se estableció en Miami, logrando posicionarse en la élite de la industria musical. Su paso por Sasha Enterprises la llevó a colaborar en el management de figuras de talla mundial como Chayanne, Alicia Machado y El Puma, además de impulsar el surgimiento de nuevos talentos del reggaetón.\n\nHoy, de regreso en su tierra, Eva ha volcado toda esa experiencia cosmopolita en las artes plásticas y la joyería de autor. A través del óleo con espátula, el acrílico y la intervención en madera, crea piezas de arte moderno que reflejan un espíritu que se niega a envejecer. Eva no solo pinta; captura la energía de una vida dedicada a la creación, demostrando que el alma joven siempre tiene un nuevo sueño por alcanzar.`
  );
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <main className="main-content" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)', letterSpacing: '-0.04em' }}
        >
          Editar <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Biografía</span>
        </motion.h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>Diseña tu historia personal y tu presencia visual.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        
        {/* Photo Selection */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>1. Fotografía de Perfil</h2>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} capture="user" />
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleImageClick}
            className="glass"
            style={{ 
              minHeight: '300px', cursor: 'pointer', borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '1px dashed var(--border)', background: 'rgba(0,0,0,0.02)'
            }}
          >
            {preview ? (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
                <img src={preview} alt="Perfil" style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '600px' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)' }} className="glass">
                  <span style={{ padding: '8px 16px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Cambiar Fotografía</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>🤳</span>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Capturar o seleccionar foto</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Text Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="glass">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Título Biográfico</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '12px 0', fontSize: 'var(--text-md)', fontFamily: 'var(--font-serif)', outline: 'none' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Relato Personal</label>
            <textarea 
              value={bioText} onChange={e => setBioText(e.target.value)} rows={12}
              style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: 'var(--text-base)', fontFamily: 'var(--font-main)', outline: 'none', resize: 'none', lineHeight: 1.6 }}
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={status === 'loading'}
          className="btn-premium"
          style={{ alignSelf: 'flex-start', background: status === 'success' ? '#008000' : 'var(--text-primary)' }}
        >
          {status === 'loading' ? 'Guardando...' : status === 'success' ? '✓ Biografía Actualizada' : 'Publicar Cambios'}
        </motion.button>

      </form>
    </main>
  );
}
