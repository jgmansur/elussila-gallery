import Image from "next/image";

// Placeholder data representing future Firebase photos
const photos = [
  { id: 1, url: "https://images.unsplash.com/photo-1542038786656-148f9b418b0e?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[4/3]", alt: "Camera" },
  { id: 2, url: "https://images.unsplash.com/photo-1581458296305-653bc0e38622?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[2/3]", alt: "Portrait" },
  { id: 3, url: "https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[3/4]", alt: "Landscape" },
  { id: 4, url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-square", alt: "Architecture" },
  { id: 5, url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[4/5]", alt: "Nature" },
  { id: 6, url: "https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[3/2]", alt: "Street" },
  { id: 7, url: "https://images.unsplash.com/photo-1444491741275-3747c53d99b4?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-[3/4]", alt: "Abstract" },
  { id: 8, url: "https://images.unsplash.com/photo-1534067783941-51c9c23edfcc?q=80&w=600&auto=format&fit=crop", aspectRatio: "aspect-square", alt: "Fashion" },
];

export default function Home() {
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
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="masonry-item relative group overflow-hidden bg-zinc-900 rounded-lg shadow-xl cursor-pointer"
          >
            {/* Image Wrapper matches aspect ratio to avoid layout shift */}
            <div className={`relative w-full ${photo.aspectRatio}`}>
              <Image
                src={photo.url}
                alt={photo.alt}
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
        ))}
      </section>

      <footer className="mt-24 text-center pb-8 border-t border-zinc-800/50 pt-8">
        <p className="text-zinc-500 font-sans text-sm">
          © {new Date().getFullYear()} Elussila Gallery. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
