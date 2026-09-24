'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getInventories,
  getInventoriesByResponsible,
  saveInventory,
  getAssets,
  clearAllStorageData,
  getCurrentUser,
  isUserAdmin,
  getFieldResponsibleName,
  setFieldResponsibleName,
  syncWithSupabase
} from '@/lib/storage';
import { Inventory, Asset, UserProfile } from '@/types/inventory';
import TWFTWLogo from '@/components/TWFTWLogo';
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
  X,
  UserCheck,
  Building2,
  Search
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [responsibleName, setResponsibleName] = useState('');
  const [isResponsibleSaved, setIsResponsibleSaved] = useState(false);

  const [myInventories, setMyInventories] = useState<Inventory[]>([]);
  const [allInventories, setAllInventories] = useState<Inventory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modal para criar novo inventário
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryTitle, setInventoryTitle] = useState('');

  useEffect(() => {
    const savedName = getFieldResponsibleName();
    if (savedName) {
      setResponsibleName(savedName);
      setIsResponsibleSaved(true);
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);

    loadData(savedName);

    // Sincronizar em segundo plano com o Supabase ao abrir a página
    syncWithSupabase().then(() => {
      loadData(savedName);
    });
  }, []);

  const loadData = (respName?: string) => {
    const all = getInventories();
    setAllInventories(all);

    const nameToFilter = respName !== undefined ? respName : responsibleName;
    if (nameToFilter && nameToFilter.trim()) {
      setMyInventories(getInventoriesByResponsible(nameToFilter));
    } else {
      setMyInventories(all);
    }
    setAssets(getAssets());
  };

  const handleSaveResponsibleName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibleName.trim()) return;

    setFieldResponsibleName(responsibleName);
    setIsResponsibleSaved(true);
    loadData(responsibleName);
  };

  const handleCreateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibleName.trim() || !inventoryTitle.trim()) return;

    const newInv = saveInventory({
      department_id: `dept-${Date.now()}`,
      title: inventoryTitle.trim(),
      responsible_name: responsibleName.trim(),
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0]
    });

    setModalOpen(false);
    setInventoryTitle('');
    loadData();

    router.push(`/inventory/${newInv.department_id}/new-asset`);
  };

  const handleResetData = () => {
    if (confirm('Tem a certeza que deseja apagar todos os inventários registados?')) {
      clearAllStorageData();
      loadData();
    }
  };

  const isAdmin = isUserAdmin(user);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* BANNER PRINCIPAL COM O LOGÓTIPO OFICIAL TWFTW */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-sm">
        <div className="w-20 h-20 rounded-full bg-twftw-navy flex items-center justify-center mx-auto p-3 shadow-md mb-4">
          <TWFTWLogo className="w-full h-full" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-twftw-navy bg-slate-100 px-3 py-1 rounded-full inline-block mb-2">
          The Word For The World • Bible Translators
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-twftw-navy tracking-tight">
          Inventário <span className="text-amber-500">de Bens & Ativos</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed font-medium">
          Plataforma simples de levantamento físico. Introduza o seu nome para ver ou criar o seu inventário no terreno.
        </p>

        {/* CADASTRO BÁSICO DO RESPONSÁVEL DO TERRENO */}
        <div className="mt-6 max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner">
          <form onSubmit={handleSaveResponsibleName} className="space-y-3">
            <label className="block text-xs font-extrabold uppercase text-twftw-navy text-left">
              👤 Quem está a fazer o inventário? (O Seu Nome)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Digite o seu nome por extenso..."
                value={responsibleName}
                onChange={(e) => {
                  setResponsibleName(e.target.value);
                  setIsResponsibleSaved(false);
                }}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-twftw-navy shadow-sm"
                required
              />
              <button
                type="submit"
                className="py-3 px-4 bg-twftw-navy hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow transition-all flex items-center space-x-1"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Guardar</span>
              </button>
            </div>
            {isResponsibleSaved && (
              <p className="text-[11px] font-bold text-emerald-600 text-left flex items-center">
                ✓ Nome confirmado: <span className="underline ml-1">{responsibleName}</span>
              </p>
            )}
          </form>
        </div>

        {/* BOTÃO PRINCIPAL GIGANTE — CRIAR NOVO INVENTÁRIO */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (!responsibleName.trim()) {
                alert('Por favor, digite o seu nome acima primeiro!');
                return;
              }
              setModalOpen(true);
            }}
            className="w-full sm:w-auto py-4 px-8 bg-twftw-navy hover:bg-slate-800 text-white font-black rounded-2xl text-base transition-all shadow-lg flex items-center justify-center space-x-3 transform active:scale-95 mx-auto"
          >
            <PlusCircle className="w-6 h-6 text-amber-400" />
            <span>[ ➕ CRIAR NOVO INVENTÁRIO ]</span>
          </button>
        </div>
      </div>

      {/* LISTA DOS INVENTÁRIOS DO RESPONSÁVEL */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-black text-twftw-navy tracking-tight">
              {responsibleName ? `Inventários de: ${responsibleName}` : 'Todos os Inventários'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Lista de inventários registados no terreno</p>
          </div>

          {isAdmin && allInventories.length > 0 && (
            <button
              onClick={handleResetData}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
              title="Apagar dados e começar do zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar TUDO (Admin)</span>
            </button>
          )}
        </div>

        {myInventories.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 space-y-4 shadow-sm">
            <Package className="w-12 h-12 mx-auto text-slate-400" />
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {responsibleName ? `Nenhum inventário encontrado para "${responsibleName}"` : 'Nenhum inventário criado'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Clique no botão para criar o seu inventário de forma super simples!
              </p>
            </div>
            <button
              onClick={() => {
                if (!responsibleName.trim()) {
                  alert('Por favor, digite o seu nome acima primeiro!');
                  return;
                }
                setModalOpen(true);
              }}
              className="py-3 px-6 bg-twftw-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all inline-flex items-center space-x-2 shadow"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Criar Inventário Agora</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myInventories.map((inv) => {
              const deptAssets = assets.filter(a => a.department_id === inv.department_id || a.inventory_id === inv.id);
              const totalItems = deptAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);

              return (
                <div
                  key={inv.id}
                  className="bg-white border border-slate-200 hover:border-twftw-navy rounded-3xl p-5 space-y-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Em Curso</span>
                      </span>

                      <span className="text-xs font-extrabold text-twftw-navy bg-slate-100 px-3 py-1 rounded-xl">
                        {deptAssets.length} bens ({totalItems} itens)
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-twftw-navy leading-snug">{inv.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Responsável: <span className="text-slate-900">{inv.responsible_name}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/inventory/${inv.department_id}/new-asset`}
                      className="py-3 px-3 bg-twftw-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 shadow transition-all"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>➕ Registar Item</span>
                    </Link>

                    <Link
                      href={`/inventory/${inv.department_id}`}
                      className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-twftw-navy font-bold rounded-2xl text-xs text-center flex items-center justify-center space-x-1 transition-all"
                    >
                      <Package className="w-4 h-4 text-blue-600" />
                      <span>📋 Ver Lista</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL SIMPLES: CRIAR NOVO INVENTÁRIO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-twftw-navy text-amber-400 flex items-center justify-center mx-auto p-2 mb-2">
                <TWFTWLogo className="w-full h-full" />
              </div>
              <h2 className="text-xl font-black text-twftw-navy">Criar Novo Inventário</h2>
              <p className="text-xs text-slate-500 mt-1">Dê um nome ao seu inventário para começar</p>
            </div>

            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-twftw-navy mb-1">
                  1. Responsável pelo Levantamento
                </label>
                <input
                  type="text"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-twftw-navy"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-twftw-navy mb-1">
                  2. Nome do Inventário *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Inventário da Cozinha, Armazém, Alojamento..."
                  value={inventoryTitle}
                  onChange={(e) => setInventoryTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-twftw-navy"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-twftw-navy hover:bg-slate-800 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
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
