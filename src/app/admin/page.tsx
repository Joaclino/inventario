'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDepartments, getInventories, getAssets } from '@/lib/storage';
import { Department, Inventory, Asset } from '@/types/inventory';
import { exportAllInventoriesToExcel, formatCurrencyKz } from '@/lib/export/excel';
import {
  ShieldCheck,
  Building2,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
  Wrench,
  XCircle,
  FolderTree,
  MapPin,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Printer,
  FileCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setDepartments(getDepartments());
    setInventories(getInventories());
    setAssets(getAssets());
  }, []);

  const totalAssetsCount = assets.length;
  const totalItemsCount = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);
  const totalValueKz = assets.reduce((sum, a) => sum + (a.acquisition_value || 0), 0);

  const completedInventories = inventories.filter(i => i.status === 'completed').length;
  const validatedInventories = inventories.filter(i => i.status === 'validated').length;
  const inProgressInventories = inventories.filter(i => i.status === 'in_progress').length;

  const damagedAssets = assets.filter(a => a.state_name.toLowerCase().includes('danificado') || a.situation === 'Danificado').length;
  const lostAssets = assets.filter(a => a.state_name.toLowerCase().includes('perdido') || a.situation === 'Perdido').length;
  const maintenanceAssets = assets.filter(a => a.state_name.toLowerCase().includes('reparação') || a.situation === 'Em manutenção').length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Banner Master Admin */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Painel de Controlo Master IT & Administração</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Dashboard Geral de Ativos</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">Visão global, estatísticas por departamento e relatórios da organização</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportAllInventoriesToExcel(departments, inventories, assets)}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs transition-all shadow-xl shadow-emerald-600/30 flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>[ EXPORTAR INVENTÁRIO GERAL (EXCEL) ]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartões Principais do Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total de Bens</span>
          <div className="text-3xl font-extrabold text-white">{totalAssetsCount}</div>
          <span className="text-xs text-emerald-400 mt-1 block font-semibold">{totalItemsCount} unidades físicas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Valor Total Geral</span>
          <div className="text-lg font-extrabold text-blue-400 truncate">{formatCurrencyKz(totalValueKz)}</div>
          <span className="text-xs text-slate-500 mt-1 block">Património total em Kz</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Inventários Validados</span>
          <div className="text-3xl font-extrabold text-purple-400">{validatedInventories}</div>
          <span className="text-xs text-purple-400/80 mt-1 block">Aprovados por IT</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Em Andamento</span>
          <div className="text-3xl font-extrabold text-amber-400">{inProgressInventories}</div>
          <span className="text-xs text-amber-400/80 mt-1 block">Levantamento ativo</span>
        </div>
      </div>

      {/* Alertas Críticos Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-950/40 border border-orange-500/30 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-orange-300 block uppercase">Bens Danificados</span>
            <span className="text-xl font-extrabold text-white">{damagedAssets} registos</span>
          </div>
        </div>

        <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-300 block uppercase">Bens Perdidos</span>
            <span className="text-xl font-extrabold text-white">{lostAssets} registos</span>
          </div>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-300 block uppercase">Em Manutenção</span>
            <span className="text-xl font-extrabold text-white">{maintenanceAssets} registos</span>
          </div>
        </div>
      </div>

      {/* Atalhos de Configuração sem Alterar Código */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link href="/admin/assets" className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-4 rounded-2xl transition-all flex items-center space-x-3">
          <Search className="w-6 h-6 text-blue-400" />
          <div>
            <span className="text-sm font-bold text-white block">Pesquisa Global</span>
            <span className="text-[10px] text-slate-400">Todos os bens da org.</span>
          </div>
        </Link>

        <Link href="/admin/categories" className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-4 rounded-2xl transition-all flex items-center space-x-3">
          <FolderTree className="w-6 h-6 text-cyan-400" />
          <div>
            <span className="text-sm font-bold text-white block">Categorias</span>
            <span className="text-[10px] text-slate-400">Criar & Editar sem código</span>
          </div>
        </Link>

        <Link href="/admin/locations" className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-4 rounded-2xl transition-all flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-emerald-400" />
          <div>
            <span className="text-sm font-bold text-white block">Localizações</span>
            <span className="text-[10px] text-slate-400">Edifícios, salas & viaturas</span>
          </div>
        </Link>

        <Link href="/admin/states" className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 p-4 rounded-2xl transition-all flex items-center space-x-3">
          <SlidersHorizontal className="w-6 h-6 text-amber-400" />
          <div>
            <span className="text-sm font-bold text-white block">Estados</span>
            <span className="text-[10px] text-slate-400">Novo, Excelente, Mau...</span>
          </div>
        </Link>
      </div>

      {/* Lista de Departamentos e Contagem de Bens */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Resumo do Inventário por Departamento</h2>
        <div className="space-y-3">
          {departments.map(dept => {
            const deptAssets = assets.filter(a => a.department_id === dept.id);
            const inv = inventories.find(i => i.department_id === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-500/30">
                    {dept.code}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{dept.name}</h3>
                    <span className="text-xs text-slate-400">Resp: {dept.responsible_name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <span className="font-bold text-white">{deptAssets.length} bens</span>

                  {inv?.status === 'validated' ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
                      Validado
                    </span>
                  ) : inv?.status === 'completed' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Concluído
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                      Em andamento
                    </span>
                  )}

                  <Link
                    href={`/inventory/${dept.id}`}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl font-bold flex items-center space-x-1"
                  >
                    <span>Abrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
