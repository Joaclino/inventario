'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getInventories, saveInventory, getAssets, clearAllStorageData, getCurrentUser, isUserAdmin } from '@/lib/storage';
import { Inventory, Asset, UserProfile } from '@/types/inventory';
import {
  PlusCircle,
  Package,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Boxes,
  FileSpreadsheet,
  X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modal para criar novo inventário em 2 segundos
  const [modalOpen, setModalOpen] = useState(false);
  const [responsibleName, setResponsibleName] = useState('');
  const [inventoryTitle, setInventoryTitle] = useState('');

  useEffect(() => {
    loadData();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) setResponsibleName(currentUser.full_name);
  }, []);

  const loadData = () => {
    setInventories(getInventories());
    setAssets(getAssets());
  };

  const handleCreateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibleName || !inventoryTitle) return;

    const newInv = saveInventory({
      department_id: `dept-${Date.now()}`,
      title: inventoryTitle,
      responsible_name: responsibleName,
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0]
    });

    setModalOpen(false);
    setInventoryTitle('');
    loadData();

    // Redireciona imediatamente para adicionar o primeiro item de forma simples!
    router.push(`/inventory/${newInv.department_id}/new-asset`);
  };

  const handleResetData = () => {
    if (confirm('Tem a certeza que deseja apagar todos os inventários e itens registados para começar do zero?')) {
      clearAllStorageData();
      loadData();
    }
  };

  const isAdmin = isUserAdmin(user);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* BANNER PRINCIPAL ULTRA SIMPLES */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/20 mb-4">
          <Boxes className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Inventário <span className="text-emerald-400">Simples & Rápido</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
          Sem burocracia nem complicações. Crie o seu inventário, tire fotos aos objetos e guarde tudo em segundos no telemóvel!
        </p>

        {/* BOTÃO PRINCIPAL GIGANTE — CRIAR INVENTÁRIO */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl text-base transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-3 transform active:scale-95"
          >
            <PlusCircle className="w-6 h-6" />
            <span>[ ➕ CRIAR NOVO INVENTÁRIO ]</span>
          </button>
        </div>
      </div>

      {/* LISTA DE INVENTÁRIOS CRIADOS */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Inventários Ativos</h2>
            <p className="text-xs text-slate-400">Clique para registar itens ou consultar a lista de objetos</p>
          </div>

          {isAdmin && inventories.length > 0 && (
            <button
              onClick={handleResetData}
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center space-x-1"
              title="Apagar dados e começar do zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar TUDO</span>
            </button>
          )}
        </div>

        {inventories.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 space-y-4">
            <Package className="w-12 h-12 mx-auto text-slate-600" />
            <div>
              <h3 className="text-base font-bold text-white">Nenhum inventário criado ainda</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Clique no botão verde acima para criar o seu primeiro inventário de forma super fácil!
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all inline-flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Criar O Meu Primeiro Inventário</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventories.map((inv) => {
              const deptAssets = assets.filter(a => a.department_id === inv.department_id);
              const totalItems = deptAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);

              return (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 space-y-4 transition-all duration-200 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Em Curso</span>
                      </span>

                      <span className="text-xs font-bold text-white bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                        {totalItems} item(ns)
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white leading-snug">{inv.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Responsável: <span className="text-white font-semibold">{inv.responsible_name}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <Link
                      href={`/inventory/${inv.department_id}/new-asset`}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>➕ Registar Item</span>
                    </Link>

                    <Link
                      href={`/inventory/${inv.department_id}`}
                      className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 transition-all"
                    >
                      <Package className="w-4 h-4 text-blue-400" />
                      <span>📋 Ver Lista</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL ULTRA SIMPLES: CRIAR NOVO INVENTÁRIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <PlusCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Criar Novo Inventário</h2>
              <p className="text-xs text-slate-400 mt-1">Preencha estes 2 campos simples para começar</p>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. O Seu Nome (Responsável) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Pereira, Maria Fernandes..."
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Nome / Local do Inventário *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Inventário da Cozinha, Armazém, Casa 2..."
                  value={inventoryTitle}
                  onChange={(e) => setInventoryTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>[ 🚀 INICIAR LEVANTAMENTO ]</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
