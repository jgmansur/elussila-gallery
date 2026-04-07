"use client";

import { useEffect, useState, useRef } from "react";
import { signInWithPopup, User, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db, storage } from "@/lib/firebase";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingApp(false);
    });
    return () => unsub();
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

  // Util to extract width & height before uploading
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
    });
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      return;
    }
    setUploading(true);
    setProgress(0);

    try {
      const { width, height } = await getImageDimensions(file);
      
      // Upload to storage
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `gallery/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error("Upload error", error);
          alert("Error subiendo la imagen.");
          setUploading(false);
        },
        async () => {
          // Success
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save to Firestore
          await addDoc(collection(db, "gallery"), {
            url: downloadUrl,
            storagePath: `gallery/${fileName}`,
            width,
            height,
            createdAt: serverTimestamp()
          });

          setUploading(false);
          setProgress(0);
          alert("¡Foto publicada exitosamente!");
        }
      );
    } catch (e) {
      console.error(e);
      alert("Error inesperado en subida.");
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  if (loadingApp) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Cargando Sistema...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center shadow-2xl">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Panel Privado</h1>
          <p className="text-zinc-400 text-sm mb-8">Debes identificarte para continuar</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Entrar con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
            <p className="text-zinc-500 mt-1">Sube tus fotos a la galería (Hola, {user.displayName})</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg transition-all">
            Cerrar Sesión
          </button>
        </div>

        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
            uploading ? "border-zinc-700 bg-zinc-900" : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-900"
          }`}
        >
          {uploading ? (
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-zinc-800 border-t-white animate-spin"></div>
              <h3 className="font-semibold text-lg">Subiendo ({Math.round(progress)}%)</h3>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="max-w-sm mx-auto space-y-6">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Arrastra una imagen aquí</h3>
                <p className="text-zinc-500 text-sm">Soporta JPG, PNG, WEBP. Calidad original.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
              >
                O selecciona un archivo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex gap-4 items-start text-sm text-zinc-400">
          <svg className="w-6 h-6 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p>
            Cada imagen subida se agregará inmediatamente a tu galería pública usando el grid Masonry.
            El sistema calculará las proporciones automáticamente para encajar la foto perfectamente sin recortarla.
          </p>
        </div>

      </div>
    </div>
  );
}
