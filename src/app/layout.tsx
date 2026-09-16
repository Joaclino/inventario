import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventário Geral de Bens e Ativos',
  description: 'Sistema profissional mobile-first para levantamento físico e gestão de património e ativos organizacionais.'
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
    <html lang="pt-PT" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium text-slate-400">Plataforma de Inventário Geral de Bens e Ativos</p>
            <p className="mt-1">Sistema Mobile First • IT & Gestão Patrimonial • 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
