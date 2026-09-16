import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TWFTW — Inventário Geral de Bens e Ativos',
  description: 'Sistema simples e fluído de inventário físico para a equipa da organização.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-bold text-slate-800">TWFTW Bible Translators • Inventário Geral de Bens</p>
            <p className="text-slate-500">Plataforma Simples de Levantamento Físico no Terreno</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
