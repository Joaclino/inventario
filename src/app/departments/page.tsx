'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInventories, getAssets, syncWithSupabase } from '@/lib/storage';
import { Inventory, Asset } from '@/types/inventory';
import { Building2, Plus, CheckCircle2, Clock, Search, ChevronRight, Package, User, Printer } from 'lucide-react';

export default function DepartmentsPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setInventories(getInventories());
    setAssets(getAssets());
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Sincronizar em tempo real com o Supabase ao abrir a página
    syncWithSupabase().then(() => {
      loadData();
    });
  }, []);

  const filteredInventories = inventories.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.responsible_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-twftw-navy tracking-tight">Inventários da Organização</h1>
          <p className="text-xs text-slate-500 font-medium">Lista de todos os inventários registados na nuvem (TWFTW - Angola)</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Pesquisar por área ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white border border-slate-300 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-twftw-navy shadow-sm"
            />
          </div>

          <Link
            href="/inventory/blank-form"
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-twftw-navy border border-slate-300 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Folha Manual (A4)</span>
          </Link>
        </div>
      </div>

      {loading && inventories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <div className="w-8 h-8 border-4 border-twftw-navy border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-700">A carregar inventários da nuvem (Supabase)...</p>
        </div>
      ) : filteredInventories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-4 shadow-sm">
          <Package className="w-12 h-12 mx-auto text-slate-400" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Nenhum inventário encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Não existem inventários registados que correspondam à sua pesquisa.
            </p>
          </div>
          <Link
            href="/"
            className="py-3 px-6 bg-twftw-navy text-white font-bold rounded-2xl text-xs inline-flex items-center space-x-2 shadow"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Criar Novo Inventário</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventories.map((inv) => {
            const deptAssets = assets.filter(a => a.department_id === inv.department_id || a.inventory_id === inv.id);
            const status = inv.status || 'in_progress';
            const totalQty = deptAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);

            return (
              <div
                key={inv.id}
                className="bg-white border border-slate-200 hover:border-twftw-navy rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-twftw-navy border border-slate-200">
                      Área / Inventário
                    </span>

                    {status === 'validated' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-600" />
                        <span>Validado</span>
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Concluído</span>
                      </span>
                    )}
                    {status === 'in_progress' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>Em curso</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-twftw-navy group-hover:text-blue-700 transition-colors mb-1">
                    {inv.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mb-3 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Responsável: <strong className="text-slate-900">{inv.responsible_name}</strong></span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-extrabold">Bens Registados</span>
                      <span className="font-black text-twftw-navy text-sm">{deptAssets.length} bens</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-extrabold">Total Itens</span>
                      <span className="font-black text-emerald-600 text-sm">{totalQty} unidades</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/inventory/${inv.department_id}/new-asset`}
                    className="py-3 px-3 bg-twftw-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 shadow transition-all"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Registar Item</span>
                  </Link>

                  <Link
                    href={`/inventory/${inv.department_id}`}
                    className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-twftw-navy font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 transition-all"
                  >
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Ver Lista</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
