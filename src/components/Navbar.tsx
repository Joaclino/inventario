'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';
import { UserProfile } from '@/types/inventory';
import {
  Boxes,
  LayoutDashboard,
  Building2,
  FolderTree,
  MapPin,
  SlidersHorizontal,
  LogOut,
  ShieldCheck,
  User,
  PlusCircle,
  Search,
  Menu,
  X,
  FileCheck
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const handleToggleRole = () => {
    if (!user) return;
    const newRole = user.role === 'ADMIN' ? 'DEPARTMENT_USER' : 'ADMIN';
    const updated = { ...user, role: newRole as any };
    setCurrentUser(updated);
    setUser(updated);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block leading-none">INVENTÁRIO<span className="text-blue-400">GERAL</span></span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Gestão de Bens & Ativos</span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                pathname === '/dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel</span>
            </Link>

            <Link
              href="/departments"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                pathname.startsWith('/departments') || pathname.startsWith('/inventory')
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Departamentos</span>
            </Link>

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    pathname === '/admin' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Master</span>
                </Link>

                <Link
                  href="/admin/assets"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    pathname === '/admin/assets' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Pesquisa Global</span>
                </Link>

                <div className="relative group">
                  <button className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1">
                    <span>Configurações</span>
                  </button>
                  <div className="absolute right-0 w-48 py-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl hidden group-hover:block z-50">
                    <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                      <FolderTree className="w-4 h-4 text-blue-400" />
                      <span>Categorias</span>
                    </Link>
                    <Link href="/admin/locations" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Localizações</span>
                    </Link>
                    <Link href="/admin/states" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>Estados</span>
                    </Link>
                    <Link href="/admin/audit" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
                      <FileCheck className="w-4 h-4 text-cyan-400" />
                      <span>Auditoria</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Perfis & Alternador de Perfil */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleToggleRole}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-500 transition-all flex items-center space-x-2"
              title="Clique para alternar o perfil de testes entre Admin e Utilizador de Departamento"
            >
              <span className={`w-2 h-2 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>{user?.role === 'ADMIN' ? 'Perfil: ADMIN / IT' : 'Perfil: UTILIZADOR'}</span>
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                {user?.full_name ? user.full_name.charAt(0) : 'A'}
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-medium text-white block">{user?.full_name || 'Administrador IT'}</span>
                <span className="text-[10px] text-slate-400 block">{user?.email || 'admin@org.ao'}</span>
              </div>
            </div>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800"
          >
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Painel Geral</span>
          </Link>

          <Link
            href="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800"
          >
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="font-medium">Departamentos</span>
          </Link>

          <Link
            href="/admin/assets"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800"
          >
            <Search className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">Pesquisar Bens</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-500 px-3 tracking-wider">Administração</span>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/40"
              >
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span className="font-medium">Painel Master Admin</span>
              </Link>
              <Link
                href="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
              >
                <FolderTree className="w-5 h-5 text-blue-400" />
                <span>Categorias & Subcategorias</span>
              </Link>
              <Link
                href="/admin/locations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
              >
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Localizações</span>
              </Link>
              <Link
                href="/admin/states"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
              >
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <span>Estados de Conservação</span>
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleToggleRole}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-between"
            >
              <span>Mudar Perfil:</span>
              <span className="text-blue-400 font-bold">{user?.role}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
