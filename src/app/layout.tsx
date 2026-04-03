import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Elussila Gallery',
  description: 'Colección Exclusiva de Arte Moderno por Elussila',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="layout-container">
        <header className="main-header">
          <Link href="/" className="gallery-logo">Elussila</Link>
          <nav className="main-navigation">
            <Link href="/gallery">Galería</Link>
            <Link href="/about">Biografía</Link>
            <Link href="/admin" className="admin-link">Autores</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
