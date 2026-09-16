'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, setCurrentUser, isUserAdmin } from '@/lib/storage';
import { UserProfile } from '@/types/inventory';
import {
  Boxes,
  LayoutDashboard,
  Building2,
  PlusCircle,
  Search,
  ShieldCheck,
  FolderTree,
  MapPin,
  SlidersHorizontal,
  FileCheck,
  Menu,
  X,
  User,
  Plus
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const isAdmin = isUserAdmin(user);

  const handleToggleAdminMode = () => {
    if (!user) return;
    const isCurrentlyAdmin = isAdmin;
    const updated: UserProfile = {
      id: 'usr-joaclinop',
      full_name: isCurrentlyAdmin ? 'Utilizador de Terreno' : 'Joaclinop',
      email: isCurrentlyAdmin ? 'utilizador@organizacao.org' : 'joaclinop@organizacao.org',
      role: isCurrentlyAdmin ? 'DEPARTMENT_USER' : 'ADMIN'
    };
    setCurrentUser(updated);
    setUser(updated);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Limpo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight block leading-none">
                INVENTÁRIO<span className="text-emerald-400">RÁPIDO</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Levantamento Simples</span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                pathname === '/' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Início</span>
            </Link>

            <Link
              href="/departments"
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                pathname.startsWith('/departments') || pathname.startsWith('/inventory')
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Inventários</span>
            </Link>

            {/* Apenas o Administrador (Joaclinop) vê a área de gestão master */}
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
                    pathname === '/admin' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Painel Admin (Joaclinop)</span>
                </Link>

                <div className="relative group">
                  <button className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1">
                    <span>Configurações</span>
                  </button>
                  <div className="absolute right-0 w-52 py-2 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl hidden group-hover:block z-50">
                    <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
                      <FolderTree className="w-4 h-4 text-blue-400" />
                      <span>Categorias</span>
                    </Link>
                    <Link href="/admin/locations" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Localizações</span>
                    </Link>
                    <Link href="/admin/states" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>Estados</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Perfil & Alternador de Admin (Joaclinop) */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleToggleAdminMode}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-500 transition-all flex items-center space-x-2"
              title="Clique para alternar o utilizador entre Joaclinop (Admin) e Utilizador de Terreno"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>{isAdmin ? 'Admin: Joaclinop' : 'Utilizador de Terreno'}</span>
            </button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-3 rounded-2xl text-slate-200 hover:bg-slate-800 font-bold text-sm"
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            <span>Início & Inventários</span>
          </Link>

          <Link
            href="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-3 rounded-2xl text-slate-200 hover:bg-slate-800 font-bold text-sm"
          >
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Ver Todos os Inventários</span>
          </Link>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500 px-3 tracking-wider">Painel Master Admin</span>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/40 text-sm font-semibold"
              >
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Painel Admin (Joaclinop)</span>
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleToggleAdminMode}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-between"
            >
              <span>Utilizador Atual:</span>
              <span className="text-emerald-400 font-bold">{isAdmin ? 'Joaclinop (Admin)' : 'Terreno'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
