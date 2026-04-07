"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Photo = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPhotos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          width: data.width || 800,
          height: data.height || 800,
        };
      });
      setPhotos(fetchedPhotos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <header className="mb-16 text-center space-y-4">
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-white drop-shadow-sm">
          Elussila Gallery
        </h1>
        <p className="text-zinc-400 font-sans tracking-wide uppercase text-sm md:text-base font-medium">
          The Art of Perspective
        </p>
      </header>

      {/* Masonry Grid */}
      <section className="masonry-grid">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-500">Cargando galería...</div>
        ) : photos.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500">La galería está vacía. ¡Sube tu primera foto desde el Panel Administrativo!</div>
        ) : (
          photos.map((photo) => {
            // Generar padding bottom porcentual para asegurar que el contenedor mantiene la proporción (aspect ratio dinámico)
            const paddingPercentage = (photo.height / photo.width) * 100;

            return (
              <div
                key={photo.id}
                className="masonry-item relative group overflow-hidden bg-zinc-900 rounded-lg shadow-xl cursor-pointer"
              >
                {/* Dynamically size image wrapper */}
                <div 
                  className="relative w-full"
                  style={{ paddingBottom: `${paddingPercentage}%` }}
                >
                  <Image
                    src={photo.url}
                    alt={"Photography"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="font-serif text-white font-medium tracking-widest uppercase text-sm border-b border-white/50 pb-1">
                      View
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <footer className="mt-24 text-center pb-8 border-t border-zinc-800/50 pt-8">
        <p className="text-zinc-500 font-sans text-sm">
          © {new Date().getFullYear()} Elussila Gallery. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
