'use client';
import { useState, useRef } from 'react';

export default function UploadArtwork() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
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
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImagePreview = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !title) {
      alert("Por favor, selecciona al menos una fotografía y escribe el título.");
      return;
    }
    
    setStatus('loading');
    const formData = new FormData();
    files.forEach(file => {
      formData.append('file', file);
    });
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
        setFiles([]);
        setPreviews([]);
        setTitle('');
        setPrice('');
        setDetails('');
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
        <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-md)' }}>Puedes subir o tomar varias fotos para esta misma obra.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* MULTI-PHOTO UPLOAD SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>1. Fotografías</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            capture="environment"
          />
          
          <button type="button" onClick={handleImageClick} style={{ 
            backgroundColor: '#EAE5E0', 
            height: '240px',
            borderRadius: '16px', 
            border: '2px dashed #B0A8A0', 
            display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <span style={{ fontSize: '64px' }}>📷</span>
             <span style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: '#666' }}>Tocar para Añadir Foto(s)</span>
          </button>
          
          {/* Photos Grid Preview */}
          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {previews.map((previewSrc, index) => (
                <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc' }}>
                  <img src={previewSrc} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removeImagePreview(index)} 
                    style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    X
                  </button>
                  {index === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, backgroundColor: '#1A1A1A', color: 'white', fontSize: '12px', padding: '4px 8px', borderRadius: '8px' }}>Portada</span>}
                </div>
              ))}
            </div>
          )}
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

        <button type="submit" disabled={status === 'loading' || files.length === 0} className="btn-primary" style={{ marginTop: '24px', padding: '32px', fontSize: 'var(--text-lg)', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? `Subiendo ${files.length} fotos...` : 'Publicar Obra en mi Galería'}
        </button>

      </form>
    </main>
  );
}
