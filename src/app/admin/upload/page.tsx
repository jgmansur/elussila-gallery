'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !title) {
       setMessage("❌ Por favor completa el título y sube al menos una foto.");
       return;
    }

    setLoading(true);
    setMessage("⏳ Publicando en tu galería... No cierres esta ventana.");

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file));
      formData.append('title', title);
      formData.append('price', price);
      formData.append('details', details);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ ¡Obra publicada con éxito! Redirigiendo...");
        setTimeout(() => router.push('/admin/inventory'), 1500);
      } else {
        setMessage(`❌ Error: ${data.error || "No se pudo publicar."}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error de red.';
      setMessage(`❌ Falla: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'var(--text-xl)' }}
        >
          Nueva <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Creación</span>
        </motion.h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>
          Publica tus últimas piezas directamente en la galería pública.
        </p>
      </header>

      <motion.form 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="glass"
        style={{ 
          padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', 
          display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Título de la Obra</label>
          <input 
            type="text" 
            placeholder="Ej. Abstracción en Azul"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ 
              backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', 
              padding: '16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-main)'
            }}
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Precio o Estado</label>
            <input 
              type="text" 
              placeholder="Ej. $1,200 MXN o VENDIDA"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ 
                backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', 
                padding: '16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-main)'
              }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Detalles del Formato</label>
            <input 
              type="text" 
              placeholder="Ej. Óleo sobre lienzo, 80x100cm"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ 
                backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', 
                padding: '16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-main)'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Seleccionar Fotografías</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ 
                position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer'
              }}
            />
            <div style={{ 
              border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', 
              padding: 'var(--space-lg)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              <span style={{ fontSize: 'var(--text-md)' }}>📁</span>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Haz clic para elegir archivos o arrástralos aquí.</p>
            </div>
          </div>
        </div>

        {/* Previews Grid */}
        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}
            >
              {previews.map((src, index) => (
                <motion.div 
                  key={src}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', paddingBottom: '100%' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Vista previa" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeFile(index)} 
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={loading}
          className="btn-premium"
          style={{ 
            opacity: loading ? 0.6 : 1, 
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Subiendo...' : 'Publicar Obra'}
        </motion.button>

        {message && (
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ textAlign: 'center', color: message.startsWith('✅') ? '#008000' : 'var(--text-primary)', fontWeight: 500 }}
          >
            {message}
          </motion.p>
        )}
      </motion.form>
    </main>
  );
}
