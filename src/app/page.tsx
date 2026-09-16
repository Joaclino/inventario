'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDepartments, getInventories, getAssets } from '@/lib/storage';
import { Department, Inventory, Asset } from '@/types/inventory';
import {
  Boxes,
  Building2,
  PlusCircle,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setDepartments(getDepartments());
    setInventories(getInventories());
    setAssets(getAssets());
  }, []);

  const getDeptStatus = (deptId: string) => {
    const inv = inventories.find(i => i.department_id === deptId);
    return inv ? inv.status : 'in_progress';
  };

  const getDeptAssetCount = (deptId: string) => {
    return assets.filter(a => a.department_id === deptId).length;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner Principal Mobile First */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border border-blue-500/20 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Institucional Mobile First</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Inventário Geral de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Bens e Ativos</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            Levantamento físico simplificado para telemóveis. Escolha o seu departamento para iniciar a contagem ou registrar novos ativos.
          </p>

          {/* Atalhos Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/departments"
              className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 group"
            >
              <Building2 className="w-5 h-5" />
              <span>Abrir Meu Departamento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/assets"
              className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5 text-blue-400" />
              <span>Pesquisa Rápida / QR Code</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cartões Estatísticos Rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total de Bens</div>
          <div className="text-2xl font-extrabold text-white">{assets.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center">
            <Layers className="w-3 h-3 mr-1" />
            {assets.reduce((sum, a) => sum + (a.quantity || 1), 0)} itens em stock
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Departamentos</div>
          <div className="text-2xl font-extrabold text-cyan-400">{departments.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ativos registrados</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Concluídos</div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {inventories.filter(i => i.status === 'completed' || i.status === 'validated').length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Prontos para validação</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Em Andamento</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {inventories.filter(i => i.status === 'in_progress').length}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Levantamento ativo</div>
        </div>
      </div>

      {/* Lista de Departamentos para Acesso Rápido */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Departamentos da Organização</h2>
            <p className="text-xs text-slate-400">Selecione o seu departamento para efetuar o inventário</p>
          </div>
          <Link
            href="/departments"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Ver Todos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const count = getDeptAssetCount(dept.id);
            const status = getDeptStatus(dept.id);

            return (
              <Link
                key={dept.id}
                href={`/inventory/${dept.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-500/30">
                      {dept.code}
                    </span>

                    {status === 'validated' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Validado</span>
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Concluído</span>
                      </span>
                    )}
                    {status === 'in_progress' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Em andamento</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    Resp: <span className="text-slate-300 font-medium">{dept.responsible_name}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">{count} bens registrados</span>
                  <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                    Entrar <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
