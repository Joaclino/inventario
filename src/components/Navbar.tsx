'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getCurrentUser,
  isUserAdmin,
  authenticateAdmin,
  logoutAdmin,
  getFieldResponsibleName
} from '@/lib/storage';
import { UserProfile } from '@/types/inventory';
import {
  Boxes,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  FolderTree,
  MapPin,
  SlidersHorizontal,
  Menu,
  X,
  Lock,
  LogOut,
  User,
  KeyRound
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const isAdmin = isUserAdmin(user);
  const responsibleName = getFieldResponsibleName();

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authenticateAdmin(adminPassword);
    if (success) {
      setPasswordError(false);
      setAdminPassword('');
      setAdminModalOpen(false);
      setUser(getCurrentUser());
    } else {
      setPasswordError(true);
    }
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    setUser(getCurrentUser());
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo TWFTW Bible Translators */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-twftw-navy flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Boxes className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-black text-twftw-navy tracking-tight block leading-none">
                TWFTW<span className="text-amber-600">INVENTÁRIO</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bible Translators</span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                pathname === '/' ? 'bg-twftw-navy text-white shadow-sm' : 'text-slate-700 hover:text-twftw-navy hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Início</span>
            </Link>

            <Link
              href="/departments"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                pathname.startsWith('/departments') || pathname.startsWith('/inventory')
                  ? 'bg-twftw-navy text-white shadow-sm'
                  : 'text-slate-700 hover:text-twftw-navy hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Inventários</span>
            </Link>

            {/* Links Exclusivos do Admin (Joaclinop) após introduzir a senha */}
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    pathname === '/admin' ? 'bg-purple-700 text-white' : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Painel Admin (Joaclinop)</span>
                </Link>

                <div className="relative group">
                  <button className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-twftw-navy hover:bg-slate-100 flex items-center space-x-1">
                    <span>Configurações</span>
                  </button>
                  <div className="absolute right-0 w-52 py-2 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl hidden group-hover:block z-50">
                    <Link href="/admin/categories" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-twftw-navy">
                      <FolderTree className="w-4 h-4 text-blue-600" />
                      <span>Categorias</span>
                    </Link>
                    <Link href="/admin/locations" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-twftw-navy">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Localizações</span>
                    </Link>
                    <Link href="/admin/states" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-twftw-navy">
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <span>Estados</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Área do Utilizador / Botão de Acesso Admin com Senha */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Joaclinop (Admin)</span>
                </span>
                <button
                  onClick={handleLogoutAdmin}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sair do modo Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAdminModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-all flex items-center space-x-1.5"
                title="Acesso reservado ao Administrador Joaclinop"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Área Admin</span>
              </button>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-3 rounded-2xl text-slate-800 hover:bg-slate-50 font-bold text-sm"
          >
            <LayoutDashboard className="w-5 h-5 text-twftw-navy" />
            <span>Início & Inventários</span>
          </Link>

          <Link
            href="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-3 rounded-2xl text-slate-800 hover:bg-slate-50 font-bold text-sm"
          >
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Ver Todos os Inventários</span>
          </Link>

          {isAdmin ? (
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400 px-3">Painel Admin Joaclinop</span>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-purple-700 hover:bg-purple-50 text-sm font-bold"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Painel Admin</span>
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Acesso Reservado Joaclinop (Admin)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO POR SENHA DO ADMIN (JOACLINOP) */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setAdminModalOpen(false);
                setPasswordError(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-twftw-navy">Acesso Admin (Joaclinop)</h2>
              <p className="text-xs text-slate-500 mt-1">Introduza a sua palavra-passe de administrador</p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Palavra-passe do Admin..."
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                  required
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs font-bold text-red-600 mt-1.5 text-center">
                    Palavra-passe incorreta. Tente novamente!
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar como Administrador</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
