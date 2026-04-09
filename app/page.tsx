"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Artwork = {
  id: string;
  url: string;
  width: number;
  height: number;
  title: string;
  price: string | number;
  description: string;
  category: string;
  itemId?: string;
  location?: string;
  status: "available" | "reserved" | "sold";
  provider?: "drive" | "firebase" | string;
  driveFileId?: string;
};

type ImageFallbackState = {
  currentIndex: number;
  attempts: number;
};

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [imageFallbackById, setImageFallbackById] = useState<Record<string, ImageFallbackState>>({});

  const categories = ["Todas", "Pintura"];

  useEffect(() => {
    // Escuchar cambios en la colección 'artworks'
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedArtworks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          width: data.width || 800,
          height: data.height || 800,
          title: data.title || "Untitled",
          price: data.price || "",
          description: data.description || "",
          category: data.category || "Pintura",
          itemId: data.itemId || "",
          location: data.location || "",
          status: data.status || "available",
          provider: data.provider,
          driveFileId: data.driveFileId,
        } as Artwork;
      });
      setArtworks(fetchedArtworks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openWhatsApp = (artwork: Artwork, action: "reserve" | "purchase" | "waitlist" = "reserve") => {
    const reference = artwork.itemId ? ` (ID: ${artwork.itemId})` : "";
    const messageByAction = {
      reserve: `Hola Elussila! Me gustaría reservar o consultar por la pieza "${artwork.title}"${reference}. ¿Sigue disponible?`,
      purchase: `Hola Elussila! Quiero comprar la pieza "${artwork.title}"${reference}. ¿Me compartís los pasos para pago y envío?`,
      waitlist: `Hola Elussila! Vi que la pieza "${artwork.title}"${reference} está reservada. ¿Puedo quedar en lista de espera?`,
    };

    const message = messageByAction[action];
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5491136531320?text=${encodedMessage}`, "_blank");
  };

  const formatPrice = (price: any) => {
    if (!price) return "Price on Request";
    if (isNaN(price)) return price;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredArtworks = selectedCategory === "Todas" 
    ? artworks 
    : artworks.filter(a => a.category === selectedCategory);

  const resolveImageCandidates = (artwork: Artwork) => {
    if (artwork.provider === "drive" && artwork.driveFileId) {
      // Distintas variantes porque Drive puede responder distinto según región/cookies
      return [
        `https://drive.google.com/thumbnail?id=${artwork.driveFileId}&sz=w2000`,
        `https://drive.google.com/uc?export=view&id=${artwork.driveFileId}`,
        `https://lh3.googleusercontent.com/d/${artwork.driveFileId}=w2000`,
      ];
    }

    return [artwork.url];
  };

  const resolveImageUrl = (artwork: Artwork) => {
    const candidates = resolveImageCandidates(artwork);
    const currentIndex = imageFallbackById[artwork.id]?.currentIndex ?? 0;
    return candidates[currentIndex] ?? candidates[0];
  };

  const advanceImageFallback = (artwork: Artwork) => {
    const candidates = resolveImageCandidates(artwork);

    setImageFallbackById((prev) => {
      const current = prev[artwork.id] ?? { currentIndex: 0, attempts: 0 };
      const nextIndex = current.currentIndex + 1;
      const hasFallback = nextIndex < candidates.length;

      return {
        ...prev,
        [artwork.id]: {
          currentIndex: hasFallback ? nextIndex : current.currentIndex,
          attempts: current.attempts + 1,
        },
      };
    });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_#111_0%,_transparent_50%)] pointer-events-none" />
      
      <header className="relative pt-24 pb-12 px-4 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 mb-2">
          Fine Art Gallery
        </div>
        <h1 className="font-serif text-6xl md:text-8xl font-thin tracking-tighter text-white">
          Elu<span className="text-zinc-500">SSila</span>
        </h1>
        <p className="max-w-xl mx-auto text-zinc-400 font-light leading-relaxed text-balance text-lg">
          Exclusive digital and physical artworks curated for sophisticated collectors.
        </p>

        {/* Filter Buttons */}
        <div className="pt-8 flex flex-wrap justify-center gap-2 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 rounded-full border ${
                selectedCategory === cat 
                  ? "bg-white text-black border-white" 
                  : "text-zinc-500 border-zinc-900 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <section className="relative masonry-grid px-4 sm:px-8 pb-24 mx-auto max-w-[1600px]">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="masonry-item relative bg-zinc-900/30 rounded-lg overflow-hidden animate-pulse border border-zinc-900"
              style={{ 
                paddingBottom: i % 3 === 0 ? "130%" : i % 2 === 0 ? "90%" : "110%" 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent" />
            </div>
          ))
        ) : filteredArtworks.length === 0 ? (
          <div className="col-span-full py-32 text-center text-zinc-600 font-light">
            No artworks found in this category.
          </div>
        ) : (
          filteredArtworks.map((artwork) => {
            const paddingPercentage = (artwork.height / artwork.width) * 100;
            const isSold = artwork.status === "sold";
            const isReserved = artwork.status === "reserved";
            const imageUrl = resolveImageUrl(artwork);

            return (
              <div
                key={artwork.id}
                onClick={() => setSelectedArtwork(artwork)}
                className="masonry-item mb-6 group relative bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all duration-700 cursor-pointer overflow-hidden rounded-sm shadow-2xl shadow-black/50"
              >
                <div 
                  className="relative w-full"
                  style={{ paddingBottom: `${paddingPercentage}%` }}
                >
                  {artwork.provider === "drive" ? (
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 group-hover:brightness-110 ${isSold ? "grayscale opacity-60" : ""}`}
                      loading="lazy"
                      onError={() => advanceImageFallback(artwork)}
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={artwork.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-cover transition-all duration-1000 ease-out group-hover:scale-105 group-hover:brightness-110 ${isSold ? "grayscale opacity-60" : ""}`}
                      loading="lazy"
                      onError={() => advanceImageFallback(artwork)}
                    />
                  )}
                  
                  {/* Item Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-400">
                        {artwork.category}
                      </p>
                      <h3 className="font-serif text-xl font-light text-white tracking-wide">
                        {artwork.title}
                      </h3>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-white/90 tabular-nums">
                          {isSold ? "Vendida" : formatPrice(artwork.price)}
                        </span>
                        {!isSold && !isReserved && (
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                        {isReserved && (
                          <span className="text-[9px] uppercase tracking-wider text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Reservada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Side Panel / Detail Modal */}
      {selectedArtwork && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md transition-all duration-500 group/modal"
          onClick={() => setSelectedArtwork(null)}
        >
          {/* Close Area */}
          <button 
            className="absolute top-8 left-8 text-white/30 hover:text-white transition-colors group z-50"
            onClick={() => setSelectedArtwork(null)}
          >
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.3em] font-light">Close</span>
            </div>
          </button>

          {/* Panel content */}
          <div 
            className="h-full w-full max-w-[96vw] flex flex-col md:flex-row bg-[#080808] animate-in slide-in-from-right duration-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Viewer Section */}
            <div className="relative overflow-hidden bg-black flex items-center justify-center group/viewer md:flex-[1.65]">
              {selectedArtwork.provider === "drive" ? (
                <img
                  src={resolveImageUrl(selectedArtwork)}
                  alt={selectedArtwork.title}
                  className="h-full w-full object-contain p-3 md:p-6 lg:p-8 transition-transform duration-1000 group-hover/viewer:scale-[1.02]"
                  loading="eager"
                  onError={() => advanceImageFallback(selectedArtwork)}
                />
              ) : (
                <Image
                  src={resolveImageUrl(selectedArtwork)}
                  alt={selectedArtwork.title}
                  fill
                  className="object-contain p-3 md:p-6 lg:p-8 transition-transform duration-1000 group-hover/viewer:scale-[1.02]"
                  priority
                  onError={() => advanceImageFallback(selectedArtwork)}
                />
              )}
            </div>

            {/* Info Section */}
            <div className="w-full md:w-[390px] p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a] border-l border-zinc-900 shadow-2xl">
              <div className="space-y-12">
                <header className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-500">
                    {selectedArtwork.category}
                  </p>
                  <h2 className="font-serif text-4xl md:text-5xl font-thin text-white tracking-tight leading-tight">
                    {selectedArtwork.title}
                  </h2>
                  {selectedArtwork.itemId && (
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">ID item: {selectedArtwork.itemId}</p>
                  )}
                </header>

                <div className="space-y-6">
                  <p className="text-zinc-400 font-light leading-relaxed text-lg">
                    {selectedArtwork.description || "Experimental piece exploring the intersection of digital textures and organic forms, part of the exclusive 2024 collection."}
                  </p>
                  
                  <div className="h-px w-12 bg-zinc-800" />
                  
                  <div className="flex items-baseline space-x-4">
                     <span className="text-3xl font-serif text-white/90">
                       {selectedArtwork.status === "sold"
                         ? "Vendida"
                         : selectedArtwork.status === "reserved"
                           ? "Reservada"
                           : formatPrice(selectedArtwork.price)}
                     </span>
                     {selectedArtwork.status === "available" && (
                       <span className="text-[10px] uppercase tracking-widest text-zinc-600 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                         Disponible
                       </span>
                     )}
                     {selectedArtwork.status === "reserved" && (
                       <span className="text-[10px] uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                         En reserva
                       </span>
                     )}
                   </div>
                 </div>

                 <div className="pt-8 space-y-4">
                   {selectedArtwork.status === "available" ? (
                     <>
                       <button
                         onClick={() => openWhatsApp(selectedArtwork, "reserve")}
                         className="w-full bg-white text-black py-5 px-8 rounded-sm text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-all duration-300 transform active:scale-[0.98] shadow-lg hover:shadow-white/10"
                       >
                         Reservar / Consultar
                       </button>
                       <button
                         onClick={() => openWhatsApp(selectedArtwork, "purchase")}
                         className="w-full bg-zinc-900 text-white py-5 px-8 rounded-sm text-xs uppercase tracking-[0.2em] font-bold border border-zinc-700 hover:border-zinc-500 transition-all duration-300 transform active:scale-[0.98]"
                       >
                         Comprar ahora
                       </button>
                     </>
                   ) : selectedArtwork.status === "reserved" ? (
                     <button
                       onClick={() => openWhatsApp(selectedArtwork, "waitlist")}
                       className="w-full bg-amber-500/10 text-amber-300 py-5 px-8 rounded-sm text-xs uppercase tracking-[0.2em] font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-300"
                     >
                       Quiero lista de espera
                     </button>
                   ) : (
                     <button 
                       disabled
                       className="w-full bg-zinc-900 text-zinc-600 py-5 px-8 rounded-sm text-xs uppercase tracking-[0.2em] font-bold cursor-not-allowed border border-zinc-800"
                     >
                       Vendida
                     </button>
                   )}
                  
                  <p className="text-center text-[10px] text-zinc-600 tracking-wider">
                    Certificate of Authenticity Included
                  </p>
                </div>

                {/* Additional Stats */}
                <footer className="pt-16 grid grid-cols-2 gap-8 border-t border-zinc-900">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-zinc-700 mb-1">Dimensions</h4>
                    <p className="text-xs text-zinc-500 font-light">Original Aspect Ratio</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-zinc-700 mb-1">Release</h4>
                    <p className="text-xs text-zinc-500 font-light">Edition 1/1</p>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
