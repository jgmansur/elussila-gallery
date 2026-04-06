'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EditBiography() {
  const [preview, setPreview] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [bioText, setBioText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data) {
        setTitle(data.title || '');
        setBioText(data.bio || '');
        setImageUrl(data.imageUrl || '');
        setPreview(data.imageUrl || null);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, bio: bioText, imageUrl: imageUrl || preview || '' }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
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
        
        {/* Photo Status Info */}
        <section className="glass" style={{ padding: 'var(--space-sm)', fontSize: 'var(--text-xs)', opacity: 0.8 }}>
          ℹ️ La actualización de la foto requiere configuración de Drive. Por ahora se guarda la referencia actual.
        </section>

        {/* Text Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="glass">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Título Biográfico</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', padding: '12px 0', fontSize: 'var(--text-md)', fontFamily: 'var(--font-serif)', outline: 'none' }}
              placeholder="Ej: Eva González: Una Vida de Creación"
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              URL de foto principal
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                setPreview(e.target.value || null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '12px 0',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-main)',
                outline: 'none',
              }}
              placeholder="https://..."
            />
            {preview && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Vista previa biografia"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '8px' }}
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Relato Personal</label>
            <textarea 
              value={bioText} onChange={e => setBioText(e.target.value)} rows={12}
              style={{ background: 'transparent', border: 'none', padding: '12px 0', fontSize: 'var(--text-base)', fontFamily: 'var(--font-main)', outline: 'none', resize: 'none', lineHeight: 1.6 }}
              placeholder="Escribe tu historia aquí..."
              required
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={status === 'loading'}
          className="btn-premium"
          style={{ alignSelf: 'flex-start', background: status === 'success' ? '#008000' : status === 'error' ? '#D00000' : 'var(--text-primary)' }}
        >
          {status === 'loading' ? 'Guardando...' : status === 'success' ? '✓ Biografía Actualizada' : status === 'error' ? 'Error al Guardar' : 'Publicar Cambios'}
        </motion.button>

      </form>
    </main>
  );
}
