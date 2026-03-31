import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
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
          <div className="gallery-logo">Elussila</div>
          <nav className="main-navigation">
            <a href="/gallery">Galería</a>
            <a href="/admin" className="admin-link">Acceso Administración</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
