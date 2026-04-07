import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
      <body className="font-sans min-h-full flex flex-col bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}
