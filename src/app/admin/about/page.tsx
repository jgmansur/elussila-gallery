'use client';
import { useState, useRef } from 'react';

export default function EditBiography() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Default values initialized with the provided text
  const [title, setTitle] = useState('Eva González: El Arte de Reinventarse');
  const [bioText, setBioText] = useState(
`Originaria de Tamaulipas, Eva es una artista polifacética cuya vida ha sido un lienzo en constante evolución. Su camino en las artes comenzó con la música, donde destacó como una voz privilegiada, para después conquistar el mundo del diseño textil fundando su propia maquiladora en Ciudad Victoria.

Impulsada por el amor y la visión, Eva emprendió una misión fundamental: la carrera de sus hijos, Jay y Xeronimo Mansur. Con el apoyo incondicional y el legado de su esposo, el Dr. Juan Guillermo Mansur Arzola (Q.E.P.D.), se estableció en Miami, logrando posicionarse en la élite de la industria musical. Su paso por Sasha Enterprises la llevó a colaborar en el management de figuras de talla mundial como Chayanne, Alicia Machado y El Puma, además de impulsar el surgimiento de nuevos talentos del reggaetón.

Hoy, de regreso en su tierra, Eva ha volcado toda esa experiencia cosmopolita en las artes plásticas y la joyería de autor. A través del óleo con espátula, el acrílico y la intervención en madera, crea piezas de arte moderno que reflejan un espíritu que se niega a envejecer. Eva no solo pinta; captura la energía de una vida dedicada a la creación, demostrando que el alma joven siempre tiene un nuevo sueño por alcanzar.`
  );
  
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
    setStatus('loading');
    
    // Simulate updating the text and photo in a database
    setTimeout(() => {
      setStatus('success');
      alert("¡Tu biografía se actualizó exitosamente!");
    }, 1500);
  };

  return (
    <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', gap: '32px', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '8px' }}>Editar Mi Biografía</h1>
        <p style={{ color: 'var(--muted-text)', fontSize: 'var(--text-md)' }}>Actualiza tu foto de perfil o tu historia.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* BIG PHOTO BUTTON / PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>1. Foto de Perfil</label>
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            capture="user" // Hint to use front camera on mobile
          />
          <button type="button" onClick={handleImageClick} style={{ 
            backgroundColor: preview ? '#000' : '#EAE5E0', 
            minHeight: '240px',
            height: preview ? 'auto' : '240px',
            borderRadius: '16px', 
            border: '2px dashed #B0A8A0', 
            display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!preview && (
              <>
                <span style={{ fontSize: '64px' }}>🤳</span>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: '#666' }}>Tocar para Tomar Nueva Foto</span>
              </>
            )}
            {preview && (
              <>
                <img 
                  src={preview} 
                  alt="Vista previa de perfil" 
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '600px', objectFit: 'contain' }} 
                />
                <div style={{ position: 'absolute', bottom: 16, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontSize: '18px', fontWeight: 600 }}>
                  Tocar para Cambiar Foto
                </div>
              </>
            )}
          </button>
        </div>

        {/* BIO DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>2. Título de la Página</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. El Arte de Reinventarse" style={{ 
            padding: '24px', fontSize: 'var(--text-md)', borderRadius: '12px',
            border: '2px solid #CCC', width: '100%', fontFamily: 'var(--font-inter)'
          }} required />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>3. Texto de Biografía</label>
          <textarea value={bioText} onChange={e => setBioText(e.target.value)} rows={15} style={{ 
            padding: '24px', fontSize: 'var(--text-md)', borderRadius: '12px',
            border: '2px solid #CCC', width: '100%', fontFamily: 'var(--font-inter)', resize: 'none', lineHeight: 1.6
          }} />
        </div>

        <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ marginTop: '24px', padding: '32px', fontSize: 'var(--text-lg)', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Guardando Cambios...' : 'Guardar y Publicar Biografía'}
        </button>

      </form>
    </main>
  );
}
