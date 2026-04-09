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
  dimensions?: string;
  collections?: string[];
  featured?: boolean;
  galleryUrls?: string[];
  galleryDriveFileIds?: string[];
  status: "available" | "reserved" | "sold";
  provider?: "drive" | "firebase" | string;
  driveFileId?: string;
};

type ImageFallbackState = {
  currentIndex: number;
  attempts: number;
};

const CATEGORY_OPTIONS = ["Todas", "Pintura"] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
type GalleryView = "artworks" | "collections";

type InitialRouteFilters = {
  category: CategoryOption;
  view: GalleryView;
  query: string;
  collection: string;
};

const getInitialRouteFilters = (): InitialRouteFilters => {
  if (typeof window === "undefined") {
    return {
      category: "Todas",
      view: "artworks",
      query: "",
      collection: "all",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const view = params.get("view");

  return {
    category: category && CATEGORY_OPTIONS.includes(category as CategoryOption) ? (category as CategoryOption) : "Todas",
    view: view === "collections" ? "collections" : "artworks",
    query: params.get("q") || "",
    collection: params.get("collection") || "all",
  };
};

export default function Home() {
  const initialFilters = getInitialRouteFilters();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImageFallbackIndex, setSelectedImageFallbackIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [pinturaView, setPinturaView] = useState<GalleryView>(initialFilters.view);
  const [clientSearch, setClientSearch] = useState(initialFilters.query);
  const [selectedCollection, setSelectedCollection] = useState(initialFilters.collection);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imageFallbackById, setImageFallbackById] = useState<Record<string, ImageFallbackState>>({});

  const categories = [...CATEGORY_OPTIONS];

  const parseCollections = (value: unknown): string[] => {
    const values = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];

    const unique = new Set<string>();
    const normalized: string[] = [];

    for (const raw of values) {
      const text = String(raw || "").trim();
      if (!text) continue;

      const key = text.toLowerCase();
      if (unique.has(key)) continue;

      unique.add(key);
      normalized.push(text);
    }

    return normalized;
  };

  const parseStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  };

  const buildDriveCandidates = (fileId: string, size: number) => [
    `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];

  const shuffleArtworks = (items: Artwork[]) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

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
          dimensions: data.dimensions || "",
          collections: parseCollections(data.collections),
          featured: Boolean(data.featured),
          galleryUrls: parseStringArray(data.galleryUrls),
          galleryDriveFileIds: parseStringArray(data.galleryDriveFileIds),
          status: data.status || "available",
          provider: data.provider,
          driveFileId: data.driveFileId,
        } as Artwork;
      });

      const featured = fetchedArtworks.filter((artwork) => artwork.featured);
      const regular = fetchedArtworks.filter((artwork) => !artwork.featured);
      setArtworks([...shuffleArtworks(featured), ...shuffleArtworks(regular)]);
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

  const normalizedClientSearch = clientSearch.trim().toLowerCase();

  const categoryFilteredArtworks = selectedCategory === "Todas"
    ? artworks
    : artworks.filter((artwork) => artwork.category === selectedCategory);

  const searchFilteredArtworks = categoryFilteredArtworks.filter((artwork) => {
    const searchable = [
      artwork.title,
      artwork.description,
      artwork.category,
      String(artwork.price ?? ""),
      artwork.status,
      artwork.itemId || "",
      artwork.dimensions || "",
      ...(artwork.collections || []),
    ].join(" ").toLowerCase();

    return !normalizedClientSearch || searchable.includes(normalizedClientSearch);
  });

  const artworksWithCollections = searchFilteredArtworks.filter((artwork) => (artwork.collections || []).length > 0);
  const collectionsMap = new Map<string, Artwork[]>();
  for (const artwork of artworksWithCollections) {
    for (const collectionName of artwork.collections || []) {
      if (!collectionsMap.has(collectionName)) {
        collectionsMap.set(collectionName, []);
      }
      collectionsMap.get(collectionName)?.push(artwork);
    }
  }
  const collectionGroups = Array.from(collectionsMap.entries()).sort(([a], [b]) => a.localeCompare(b, "es"));
  const activeCollectionFilter = selectedCollection === "all"
    ? "all"
    : collectionGroups.some(([name]) => name.toLowerCase() === selectedCollection.toLowerCase())
      ? selectedCollection
      : "all";
  const visibleCollectionGroups = activeCollectionFilter === "all"
    ? collectionGroups
    : collectionGroups.filter(([name]) => name.toLowerCase() === activeCollectionFilter.toLowerCase());

  const isCollectionsView = selectedCategory === "Pintura" && pinturaView === "collections";
  const artworksToRender = isCollectionsView ? artworksWithCollections : searchFilteredArtworks;

  const getArtworkImages = (artwork: Artwork) => {
    const galleryDriveIds = parseStringArray(artwork.galleryDriveFileIds);
    if (galleryDriveIds.length > 0) {
      return galleryDriveIds.map((id) => buildDriveCandidates(id, 2200)[0]);
    }

    const gallery = parseStringArray(artwork.galleryUrls);
    if (gallery.length > 0) {
      return gallery;
    }

    if (artwork.provider === "drive" && artwork.driveFileId) {
      return [buildDriveCandidates(artwork.driveFileId, 2200)[0]];
    }

    return artwork.url ? [artwork.url] : [];
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();
    params.set("category", selectedCategory);

    if (selectedCategory === "Pintura") {
      params.set("view", pinturaView);
      if (pinturaView === "collections" && activeCollectionFilter !== "all") {
        params.set("collection", activeCollectionFilter);
      }
    }

    if (clientSearch.trim()) {
      params.set("q", clientSearch.trim());
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [activeCollectionFilter, clientSearch, pinturaView, selectedCategory]);

  const resolveImageCandidates = (artwork: Artwork) => {
    const primaryGalleryDriveId = parseStringArray(artwork.galleryDriveFileIds)[0];
    if (primaryGalleryDriveId) {
      return buildDriveCandidates(primaryGalleryDriveId, 2000);
    }

    const primaryGalleryUrl = parseStringArray(artwork.galleryUrls)[0];
    if (primaryGalleryUrl) {
      return [primaryGalleryUrl];
    }

    if (artwork.provider === "drive" && artwork.driveFileId) {
      return buildDriveCandidates(artwork.driveFileId, 2000);
    }

    return [artwork.url];
  };

  const resolvePrimaryImageUrl = (artwork: Artwork) => {
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

  const renderArtworkCard = (artwork: Artwork, cardKey?: string) => {
    const paddingPercentage = (artwork.height / artwork.width) * 100;
    const isSold = artwork.status === "sold";
    const isReserved = artwork.status === "reserved";
    const imageUrl = resolvePrimaryImageUrl(artwork);

    return (
      <div
        key={cardKey || artwork.id}
        onClick={() => {
          setSelectedArtwork(artwork);
          setSelectedImageIndex(0);
          setSelectedImageFallbackIndex(0);
        }}
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

          {artwork.featured && (
            <span className="absolute top-3 left-3 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-amber-200">
              Featured
            </span>
          )}

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
  };

  const selectedArtworkImages = selectedArtwork ? getArtworkImages(selectedArtwork) : [];

  const getSelectedImageCandidates = () => {
    if (!selectedArtwork) return [];

    const galleryDriveIds = parseStringArray(selectedArtwork.galleryDriveFileIds);
    const galleryUrls = parseStringArray(selectedArtwork.galleryUrls);

    if (galleryDriveIds[selectedImageIndex]) {
      return buildDriveCandidates(galleryDriveIds[selectedImageIndex], 2400);
    }
    if (galleryUrls[selectedImageIndex]) {
      return [galleryUrls[selectedImageIndex]];
    }
    if (selectedImageIndex === 0 && selectedArtwork.provider === "drive" && selectedArtwork.driveFileId) {
      return buildDriveCandidates(selectedArtwork.driveFileId, 2400);
    }
    if (selectedImageIndex === 0 && selectedArtwork.url) {
      return [selectedArtwork.url];
    }
    return [];
  };

  const selectedImageCandidates = getSelectedImageCandidates();
  const activeSelectedImage = selectedImageCandidates[selectedImageFallbackIndex] || selectedArtworkImages[selectedImageIndex] || selectedArtworkImages[0] || "";

  const handleSelectedImageError = () => {
    if (selectedImageFallbackIndex < selectedImageCandidates.length - 1) {
      setSelectedImageFallbackIndex((prev) => prev + 1);
    }
  };

  const goToPrevImage = () => {
    if (selectedArtworkImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev - 1 + selectedArtworkImages.length) % selectedArtworkImages.length);
    setSelectedImageFallbackIndex(0);
  };

  const goToNextImage = () => {
    if (selectedArtworkImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % selectedArtworkImages.length);
    setSelectedImageFallbackIndex(0);
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
              onClick={() => {
                setSelectedCategory(cat);
                if (cat !== "Pintura") {
                  setPinturaView("artworks");
                  setSelectedCollection("all");
                }
              }}
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

        {selectedCategory === "Pintura" && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setPinturaView("artworks");
                setSelectedCollection("all");
              }}
              className={`px-4 py-1 text-[10px] uppercase tracking-[0.22em] rounded-full border transition-all ${
                pinturaView === "artworks"
                  ? "bg-zinc-100 text-black border-zinc-100"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Obras
            </button>
            <button
              onClick={() => setPinturaView("collections")}
              className={`px-4 py-1 text-[10px] uppercase tracking-[0.22em] rounded-full border transition-all ${
                pinturaView === "collections"
                  ? "bg-zinc-100 text-black border-zinc-100"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Colecciones
            </button>
          </div>
        )}

        <div className="mx-auto mt-3 w-full max-w-md">
          <input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar obra, ID, dimensiones o colección"
            className="w-full rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </header>

      {/* Grid */}
      {loading ? (
        <section className="relative masonry-grid px-4 sm:px-8 pb-24 mx-auto max-w-[1600px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="masonry-item relative bg-zinc-900/30 rounded-lg overflow-hidden animate-pulse border border-zinc-900"
              style={{
                paddingBottom: i % 3 === 0 ? "130%" : i % 2 === 0 ? "90%" : "110%"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent" />
            </div>
          ))}
        </section>
      ) : isCollectionsView ? (
        <section className="px-4 sm:px-8 pb-24 mx-auto max-w-[1600px] space-y-12">
          {collectionGroups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCollection("all")}
                className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${
                  activeCollectionFilter === "all"
                    ? "bg-zinc-100 text-black border-zinc-100"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Todas
              </button>
              {collectionGroups.map(([collectionName]) => (
                <button
                  key={`filter-${collectionName}`}
                  onClick={() => setSelectedCollection(collectionName)}
                  className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] ${
                    activeCollectionFilter.toLowerCase() === collectionName.toLowerCase()
                      ? "bg-zinc-100 text-black border-zinc-100"
                      : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {collectionName}
                </button>
              ))}
            </div>
          )}

          {visibleCollectionGroups.length === 0 ? (
            <div className="py-32 text-center text-zinc-600 font-light">
              No hay obras asignadas a colecciones para esta búsqueda.
            </div>
          ) : (
            visibleCollectionGroups.map(([collectionName, groupArtworks]) => (
              <div key={collectionName} className="space-y-4">
                <div className="flex items-center justify-between gap-3 px-1">
                  <h3 className="text-xs uppercase tracking-[0.25em] text-zinc-400">{collectionName}</h3>
                  <button
                    type="button"
                    onClick={async () => {
                      const params = new URLSearchParams(window.location.search);
                      params.set("category", "Pintura");
                      params.set("view", "collections");
                      params.set("collection", collectionName);
                      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        alert("Link de colección copiado.");
                      } catch {
                        alert(`Copiá este link: ${shareUrl}`);
                      }
                    }}
                    className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-200"
                  >
                    Copiar link
                  </button>
                </div>
                <div className="masonry-grid">
                  {groupArtworks.map((artwork) => renderArtworkCard(artwork, `${collectionName}-${artwork.id}`))}
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        <section className="relative masonry-grid px-4 sm:px-8 pb-24 mx-auto max-w-[1600px]">
          {artworksToRender.length === 0 ? (
            <div className="py-32 text-center text-zinc-600 font-light">
              No artworks found in this category.
            </div>
          ) : (
            artworksToRender.map((artwork) => renderArtworkCard(artwork))
          )}
        </section>
      )}

      {/* Side Panel / Detail Modal */}
      {selectedArtwork && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md transition-all duration-500 group/modal"
          onClick={() => {
            setSelectedArtwork(null);
            setSelectedImageIndex(0);
            setSelectedImageFallbackIndex(0);
          }}
        >
          {/* Close Area */}
          <button 
            className="absolute top-8 left-8 text-white/30 hover:text-white transition-colors group z-50"
            onClick={() => {
              setSelectedArtwork(null);
              setSelectedImageIndex(0);
              setSelectedImageFallbackIndex(0);
            }}
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
            className="h-full w-full max-w-[99vw] flex flex-col md:flex-row bg-[#080808] animate-in slide-in-from-right duration-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Viewer Section */}
            <div
              className="relative h-[66vh] min-h-[360px] overflow-hidden bg-black flex items-center justify-center group/viewer md:h-full md:min-h-0 md:flex-[2.2]"
              onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return;
                const endX = e.changedTouches[0]?.clientX ?? touchStartX;
                const delta = endX - touchStartX;
                if (delta > 40) goToPrevImage();
                if (delta < -40) goToNextImage();
                setTouchStartX(null);
              }}
            >
              {selectedArtworkImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevImage}
                    className="absolute left-3 z-20 rounded-full border border-zinc-700/80 bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 z-20 rounded-full border border-zinc-700/80 bg-black/50 px-3 py-2 text-white hover:bg-black/70"
                  >
                    ›
                  </button>
                </>
              )}

              <img
                src={activeSelectedImage}
                alt={`${selectedArtwork.title} ${selectedImageIndex + 1}`}
                className="h-full w-full object-contain p-0 md:p-2 transition-transform duration-700 group-hover/viewer:scale-[1.01]"
                loading="eager"
                onError={handleSelectedImageError}
              />

              {selectedArtworkImages.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 z-20 px-3">
                  <div className="mx-auto flex max-w-full gap-2 overflow-x-auto rounded-full bg-black/40 p-2">
                    {selectedArtworkImages.map((imageUrl, index) => (
                      <button
                        key={`${selectedArtwork.id}-thumb-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setSelectedImageFallbackIndex(0);
                        }}
                        className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border ${selectedImageIndex === index ? "border-white" : "border-zinc-700"}`}
                      >
                        <img src={imageUrl} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="w-full h-[34vh] min-h-[230px] overflow-y-auto md:h-full md:min-h-0 md:w-[340px] p-6 md:p-10 flex flex-col justify-start md:justify-center bg-[#0a0a0a] border-t md:border-t-0 border-l-0 md:border-l border-zinc-900 shadow-2xl">
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
                  {(selectedArtwork.collections || []).length > 0 && (
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Colecciones: {(selectedArtwork.collections || []).join(" · ")}
                    </p>
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
                    <p className="text-xs text-zinc-500 font-light">{selectedArtwork.dimensions || "Original Aspect Ratio"}</p>
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
