'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCurrentUser } from '@/lib/storage';
import { UserRole } from '@/types/inventory';
import { ShieldCheck, User, LogIn, Boxes, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@organizacao.org');
  const [fullName, setFullName] = useState('Administrador IT');
  const [role, setRole] = useState<UserRole>('ADMIN');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      id: `usr-${Date.now()}`,
      full_name: fullName,
      email: email,
      role: role
    });
    router.push(role === 'ADMIN' ? '/admin' : '/departments');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/30 mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Acesso ao Inventário</h1>
          <p className="text-xs text-slate-400 mt-1">Selecione o perfil pretendido ou introduza as credenciais</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Perfil de Acesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('ADMIN');
                  setEmail('admin@organizacao.org');
                  setFullName('Administrador IT');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === 'ADMIN'
                    ? 'bg-purple-950/50 border-purple-500/60 ring-2 ring-purple-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className={`w-6 h-6 ${role === 'ADMIN' ? 'text-purple-400' : 'text-slate-400'}`} />
                  {role === 'ADMIN' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <span className="font-bold text-sm block">ADMIN / IT</span>
                <span className="text-[10px] text-slate-400">Acesso Global Master</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('DEPARTMENT_USER');
                  setEmail('joao.pereira@organizacao.org');
                  setFullName('João Pereira (Finanças)');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === 'DEPARTMENT_USER'
                    ? 'bg-blue-950/50 border-blue-500/60 ring-2 ring-blue-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <User className={`w-6 h-6 ${role === 'DEPARTMENT_USER' ? 'text-blue-400' : 'text-slate-400'}`} />
                  {role === 'DEPARTMENT_USER' && <Check className="w-4 h-4 text-blue-400" />}
                </div>
                <span className="font-bold text-sm block">DEPARTAMENTO</span>
                <span className="text-[10px] text-slate-400">Levantamento Físico</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Endereço de E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar na Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
