import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Elussila Gallery | Arte Moderno',
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
        <Header />
        {children}
      </body>
    </html>
  );
}
