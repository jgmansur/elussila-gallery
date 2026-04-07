import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Elu Sila | Fine Art Gallery",
    template: "%s | Elu Sila"
  },
  description: "Galería de arte exclusiva de Elu Sila. Colecciones curadas de pintura, escultura y joyería para coleccionistas sofisticados.",
  keywords: ["arte", "galería", "joyería de autor", "escultura moderna", "pintura", "Elu Sila"],
  authors: [{ name: "Elu Sila" }],
  openGraph: {
    title: "Elu Sila | Fine Art Gallery",
    description: "Piezas únicas de arte físico y digital.",
    url: "https://elussila.art",
    siteName: "Elu Sila Gallery",
    locale: "es_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <header className="sticky top-0 z-40 border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="font-serif text-xl tracking-tight text-white">
              Elussila
            </Link>
            <div className="flex items-center gap-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
              <Link href="/" className="hover:text-white transition-colors">
                Obra
              </Link>
              <Link href="/bio" className="hover:text-white transition-colors">
                Bio
              </Link>
              <Link href="/contacto" className="hover:text-white transition-colors">
                Contacto
              </Link>
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin
              </Link>
            </div>
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-zinc-900 px-4 py-10 text-center text-xs tracking-wide text-zinc-500">
          © {new Date().getFullYear()} Elussila Gallery · Obra original de Eva Lucila González.
        </footer>
      </body>
    </html>
  );
}
