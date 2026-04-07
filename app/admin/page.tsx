"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { signInWithPopup, User, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, googleProvider, db, storage } from "@/lib/firebase";
import { deleteObject } from "firebase/storage";

// Lista de emails autorizados (Podés mover esto a Firestore después)
const ADMIN_EMAILS = ["elussila@gmail.com", "jgmansur2@gmail.com"]; 

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadingApp, setLoadingApp] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"available" | "reserved" | "sold">("available");
  const [savingEdit, setSavingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const category = "Pintura";

  useEffect(() => {
    const unsubApp = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && (ADMIN_EMAILS.includes(u.email || "") || u.email?.includes("jaystudio"))) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setLoadingApp(false);
    });

    // Fetch artworks for management
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubArt = onSnapshot(q, (snapshot) => {
      setArtworks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubApp();
      unsubArt();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Error al iniciar sesión.");
    }
  };

  const handleLogout = () => signOut(auth);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve({ width: img.width, height: img.height });
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Selecciona una foto primero.");
    if (!title || !price) return alert("Título y Precio son obligatorios.");

    setUploading(true);
    setProgress(0);

    try {
      const { width, height } = await getImageDimensions(file);
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `artworks/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error(error);
          alert("Error subiendo imagen.");
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Guardamos como OBRA completa
          await addDoc(collection(db, "artworks"), {
            title,
            price: Number(price),
            description,
            category,
            url: downloadUrl,
            storagePath: `artworks/${fileName}`,
            width,
            height,
            status: "available",
            createdAt: serverTimestamp()
          });

          // Reset Form
          setTitle("");
          setPrice("");
          setDescription("");
          setFile(null);
          setUploading(false);
          setProgress(0);
          alert("¡Obra publicada exitosamente!");
        }
      );
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  };

  const updateArtworkStatus = async (artwork: any, status: "available" | "reserved" | "sold") => {
    try {
      const artRef = doc(db, "artworks", artwork.id);
      await updateDoc(artRef, { status });
    } catch (e) {
      console.error(e);
      alert("Error actualizando estado.");
    }
  };

  const handleDelete = async (artwork: any) => {
    if (!confirm("¿Estás seguro de eliminar esta obra? Esta acción no se puede deshacer.")) return;
    
    try {
      // 1. Delete from Storage
      if (artwork.storagePath) {
        const fileRef = ref(storage, artwork.storagePath);
        await deleteObject(fileRef);
      }
      // 2. Delete from Firestore
      await deleteDoc(doc(db, "artworks", artwork.id));
    } catch (e) {
      console.error(e);
      alert("Error eliminando obra.");
    }
  };

  const openEditModal = (artwork: any) => {
    setEditingArtwork(artwork);
    setEditTitle(artwork.title || "");
    setEditPrice(String(artwork.price ?? ""));
    setEditDescription(artwork.description || "");
    setEditStatus((artwork.status || "available") as "available" | "reserved" | "sold");
  };

  const saveArtworkEdits = async () => {
    if (!editingArtwork) return;
    if (!editTitle.trim()) return alert("El título es obligatorio.");
    if (!editPrice || Number(editPrice) <= 0) return alert("El precio debe ser mayor a 0.");

    setSavingEdit(true);
    try {
      await updateDoc(doc(db, "artworks", editingArtwork.id), {
        title: editTitle.trim(),
        price: Number(editPrice),
        description: editDescription,
        status: editStatus,
        category: "Pintura",
      });
      setEditingArtwork(null);
    } catch (error) {
      console.error(error);
      alert("Error guardando cambios de la obra.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
          <span className="tracking-widest uppercase text-xs opacity-50">Iniciando Sistemas de Elussila</span>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Acceso Exclusivo</h1>
          <p className="text-zinc-400 mb-8 max-w-[240px] mx-auto text-sm leading-relaxed">
            {user ? "Tu cuenta no tiene permisos de administrador." : "Ingresá con tu cuenta para gestionar la galería."}
          </p>
          
          {user ? (
            <button onClick={handleLogout} className="text-zinc-500 hover:text-white transition-colors underline decoration-zinc-800 underline-offset-8">Cerrar sesión e intentar con otra</button>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black font-bold py-4 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continuar con Google
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 lg:p-20 selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-500/20">Admin Active</span>
              <h1 className="text-4xl font-bold tracking-tighter">ELUSSILA STUDIO</h1>
            </div>
            <p className="text-zinc-500 text-lg">Gestioná tu obra, biografía y ventas desde aquí.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/content" className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-xs uppercase tracking-[0.2em] text-zinc-300 hover:bg-zinc-800 transition-colors">
              CMS Sitio
            </Link>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.displayName}</p>
              <p className="text-xs text-zinc-600">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:bg-zinc-800 transition-colors">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Formulario de Nueva Obra */}
          <div className="lg:col-span-12">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center text-sm font-black">01</span>
              Publicar Nueva Obra
            </h2>
            
            <form onSubmit={handlePublish} className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Título de la Obra</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. El susurro del mar"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Precio (MXN)</label>
                     <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:outline-none focus:border-white transition-colors"
                    />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Categoría</label>
                     <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-300">
                       Pintura
                     </div>
                   </div>
                 </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Descripción</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contá la historia detrás de esta pieza..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:outline-none focus:border-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer ${
                  uploading ? "border-zinc-800 bg-zinc-900 pointer-events-none" : "border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900"
                } ${file ? "border-emerald-500/50" : ""}`}
              >
                {uploading ? (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-white animate-spin rounded-full mx-auto mb-4"></div>
                    <p className="font-bold text-xl">{Math.round(progress)}%</p>
                    <p className="text-zinc-500 text-sm">Subiendo a Cloud Storage...</p>
                  </div>
                ) : file ? (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-bold text-lg mb-1 truncate max-w-[200px] mx-auto">{file.name}</p>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest">Listo para publicar</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover archivo
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                      <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="font-bold text-lg text-zinc-400">Seleccioná la fotografía</p>
                    <p className="text-zinc-600 text-xs mt-2 font-medium">PNG, JPG o WEBP</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <div className="md:col-span-2 pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-xs text-zinc-600 max-w-sm">
                  Al publicar, la obra aparecerá automáticamente en la página principal y estará disponible para la venta.
                </div>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="w-full md:w-auto bg-white text-black font-black py-4 px-12 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                >
                  {uploading ? "PROCESANDO..." : "PUBLICAR OBRA"}
                </button>
              </div>

            </form>
          </div>

          {/* Gestión de Obras Existentes */}
          <div className="lg:col-span-12 mt-12 pb-24">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center text-sm font-black">02</span>
              Gestión de Colección
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <div key={art.id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group">
                  <div className="relative aspect-square overflow-hidden bg-black">
                    <img 
                      src={art.url} 
                      alt={art.title} 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${art.status === 'sold' ? 'grayscale opacity-50' : ''}`}
                    />
                    <div className="absolute top-4 left-4">
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                         art.status === 'available'
                           ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                           : art.status === 'reserved'
                             ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                             : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                       }`}>
                         {art.status === 'available' ? 'Disponible' : art.status === 'reserved' ? 'Reservada' : 'Vendida'}
                       </span>
                     </div>
                   </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{art.category}</p>
                      <h3 className="text-lg font-bold truncate">{art.title}</h3>
                      <p className="text-sm text-zinc-400 font-mono">${art.price}</p>
                    </div>

                     <div className="mt-auto grid grid-cols-2 gap-2">
                       <button
                         onClick={() => openEditModal(art)}
                         className="py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                       >
                         Editar
                       </button>
                       <button
                         onClick={() => updateArtworkStatus(art, 'available')}
                         className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                           art.status === 'available'
                             ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                             : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                         }`}
                       >
                         Disponible
                       </button>
                       <button
                         onClick={() => updateArtworkStatus(art, 'reserved')}
                         className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                           art.status === 'reserved'
                             ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                             : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                         }`}
                       >
                         Reservada
                       </button>
                       <button
                         onClick={() => updateArtworkStatus(art, 'sold')}
                         className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                           art.status === 'sold'
                             ? 'bg-zinc-700/40 border-zinc-500/50 text-zinc-200'
                             : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                         }`}
                       >
                         Vendida
                       </button>
                       <button 
                         onClick={() => handleDelete(art)}
                         className="py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                       >
                         Eliminar
                       </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {artworks.length === 0 && (
                <div className="col-span-full py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] text-center">
                  <p className="text-zinc-600 text-sm font-medium uppercase tracking-[0.2em]">No hay obras publicadas todavía</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

      {editingArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEditingArtwork(null)}>
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-6 text-2xl font-bold text-white">Editar obra</h3>

            <div className="space-y-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
              />
              <input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                type="number"
                placeholder="Precio"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                placeholder="Descripción"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
              />

              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "available" | "reserved" | "sold")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white"
              >
                <option value="available">Disponible</option>
                <option value="reserved">Reservada</option>
                <option value="sold">Vendida</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingArtwork(null)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={saveArtworkEdits}
                disabled={savingEdit}
                className="rounded-xl bg-white px-4 py-2 font-bold text-black disabled:opacity-60"
              >
                {savingEdit ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
