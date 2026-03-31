'use client';
import { useState, useRef } from 'react';

export default function UploadArtwork() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Por favor, selecciona una fotografía y escribe el título.");
      return;
    }
    
    setStatus('loading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('price', price);
    formData.append('details', details);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setStatus('success');
        // Clear form
        setFile(null);
        setPreview(null);
        setTitle('');
        setPrice('');
        setDetails('');
        // Show success alert
        alert("¡Tu obra se subió exitosamente a la galería y al sistema!");
      } else {
        setStatus('error');
        alert("Error al subir la obra.");
      }
    } catch(err) {
      setStatus('error');
      alert("Error de conexión al cargar.");
    } finally {
      if(status !== 'success') setStatus('idle');
    }
  };

  return (
    <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', gap: '32px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Nueva Obra</h1>
        <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-md)' }}>Sube una foto directamente desde la cámara de tu celular.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* BIG PHOTO BUTTON / PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>1. Fotografía</label>
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            capture="environment" // Hint to use back camera on mobile
          />
          <button type="button" onClick={handleImageClick} style={{ 
            backgroundColor: preview ? '#000' : '#EAE5E0', 
            height: '240px', 
            borderRadius: '16px', 
            border: '2px dashed #B0A8A0', 
            display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: '16px',
            backgroundImage: preview ? `url(${preview})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}>
            {!preview && (
              <>
                <span style={{ fontSize: '64px' }}>📷</span>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: '#666' }}>Tocar para Tomar Foto</span>
              </>
            )}
            {preview && (
              <div style={{ position: 'absolute', bottom: 16, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '18px' }}>Cambiar Foto</div>
            )}
          </button>
        </div>

        {/* DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>2. Título de la Obra</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Atardecer Abstracto" style={{ 
            padding: '24px', fontSize: 'var(--text-md)', borderRadius: '12px',
            border: '2px solid #CCC', width: '100%', fontFamily: 'var(--font-inter)'
          }} required />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>3. Precio</label>
          <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej. $5,000" style={{ 
            padding: '24px', fontSize: 'var(--text-md)', borderRadius: '12px',
            border: '2px solid #CCC', width: '100%', fontFamily: 'var(--font-inter)'
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>4. Detalles Técnicos</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Ej. Acrílico sobre madera, 120x80cm..." rows={4} style={{ 
            padding: '24px', fontSize: 'var(--text-md)', borderRadius: '12px',
            border: '2px solid #CCC', width: '100%', fontFamily: 'var(--font-inter)', resize: 'none'
          }} />
        </div>

        <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ marginTop: '24px', padding: '32px', fontSize: 'var(--text-lg)', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Publicando...' : 'Publicar Obra en mi Galería'}
        </button>

      </form>
    </main>
  );
}
