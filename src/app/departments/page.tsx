'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDepartments, getInventories, getAssets } from '@/lib/storage';
import { Department, Inventory, Asset } from '@/types/inventory';
import { Building2, Plus, ArrowRight, CheckCircle2, Clock, Search, ChevronRight } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setDepartments(getDepartments());
    setInventories(getInventories());
    setAssets(getAssets());
  }, []);

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.responsible_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Departamentos da Organização</h1>
          <p className="text-xs text-slate-400">Escolha um departamento para consultar ou realizar o inventário físico</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const deptAssets = assets.filter(a => a.department_id === dept.id);
          const inv = inventories.find(i => i.department_id === dept.id);
          const status = inv?.status || 'in_progress';
          const totalQty = deptAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group"
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

                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Responsável: <span className="text-slate-200 font-semibold">{dept.responsible_name}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Registos</span>
                    <span className="font-bold text-white text-sm">{deptAssets.length} bens</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Itens</span>
                    <span className="font-bold text-emerald-400 text-sm">{totalQty} unidades</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/inventory/${dept.id}`}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all text-center flex items-center justify-center space-x-1 shadow-lg shadow-blue-600/20"
                >
                  <span>Abrir Inventário</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/inventory/${dept.id}/new-asset`}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  title="Novo Bem em < 1 min"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Registar</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
