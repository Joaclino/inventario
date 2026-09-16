'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getInventories,
  getAssets,
  saveInventory,
  getCurrentUser,
  isUserAdmin
} from '@/lib/storage';
import { Inventory, Asset, UserProfile } from '@/types/inventory';
import AssetCard from '@/components/AssetCard';
import QRCodeModal from '@/components/QRCodeModal';
import PrintHeader from '@/components/PrintHeader';
import { exportDepartmentInventoryToExcel } from '@/lib/export/excel';
import {
  Package,
  PlusCircle,
  Search,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  FileText,
  BarChart3,
  Plus,
  Save,
  Check
} from 'lucide-react';

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'assets' | 'summary' | 'info'>('assets');
  const [search, setSearch] = useState('');
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  const [responsibleSignature, setResponsibleSignature] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const invs = getInventories();
    let inv = invs.find(i => i.department_id === departmentId || i.id === departmentId);

    if (!inv) {
      inv = saveInventory({
        department_id: departmentId,
        title: 'Inventário Geral',
        responsible_name: currentUser?.full_name || 'Responsável',
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0]
      });
    }

    setInventory(inv);
    setGeneralNotes(inv.general_notes || '');
    setResponsibleSignature(inv.responsible_signature || '');
    loadAssets();
  }, [departmentId]);

  const loadAssets = () => {
    const all = getAssets();
    setAssets(all.filter(a => a.department_id === departmentId || a.inventory_id === departmentId));
  };

  const filteredAssets = assets.filter(a =>
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code.toLowerCase().includes(search.toLowerCase()) ||
    a.location_name.toLowerCase().includes(search.toLowerCase()) ||
    a.responsible_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalQty = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);
  const isAdmin = isUserAdmin(user);

  const handleSaveNotes = () => {
    if (!inventory) return;
    const updated = saveInventory({
      ...inventory,
      general_notes: generalNotes,
      responsible_signature: responsibleSignature
    });
    setInventory(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!inventory) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Botão de Voltar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.push('/')}
          className="py-2 px-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Início
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportDepartmentInventoryToExcel(
              { id: departmentId, code: 'INV', name: inventory.title, responsible_name: inventory.responsible_name },
              inventory,
              assets
            )}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="py-2 px-3 bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* CABEÇALHO DO INVENTÁRIO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Em Andamento</span>
            </span>

            <h1 className="text-2xl font-extrabold text-white">{inventory.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Responsável: <span className="text-white font-semibold">{inventory.responsible_name}</span> • <span className="text-emerald-400 font-bold">{assets.length} bens registados ({totalQty} itens)</span>
            </p>
          </div>

          <Link
            href={`/inventory/${departmentId}/new-asset`}
            className="py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>[ ➕ REGISTAR NOVO ITEM ]</span>
          </Link>
        </div>
      </div>

      {/* AS 3 ABAS */}
      <div className="border-b border-slate-800 no-print">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-4 font-extrabold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'assets'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Bens ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 font-extrabold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Resumo</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-extrabold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'info'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Informações & Assinatura</span>
          </button>
        </nav>
      </div>

      {/* ABA 1 — BENS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Pesquisar objeto na lista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Link
              href={`/inventory/${departmentId}/new-asset`}
              className="w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Item</span>
            </Link>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 space-y-3">
              <Package className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-white">Nenhum item registado nesta lista</p>
              <Link
                href={`/inventory/${departmentId}/new-asset`}
                className="py-2.5 px-5 bg-emerald-600 text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Registar Primeiro Item</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onOpenQR={(ast) => setSelectedQRAsset(ast)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2 — RESUMO */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center">
            <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Registos de Bens</span>
            <span className="text-3xl font-black text-white">{assets.length}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center">
            <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Total de Quantidades</span>
            <span className="text-3xl font-black text-emerald-400">{totalQty}</span>
          </div>
        </div>
      )}

      {/* ABA 3 — INFORMAÇÕES */}
      {activeTab === 'info' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-extrabold text-white">Informações & Observações</h3>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Observações do Inventário</label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Escreva alguma nota importante sobre a contagem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assinatura do Responsável</label>
            <input
              type="text"
              value={responsibleSignature}
              onChange={(e) => setResponsibleSignature(e.target.value)}
              placeholder="Digite o seu nome por extenso..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center">
                <Check className="w-4 h-4 mr-1" /> Guardado!
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              className="ml-auto py-2.5 px-5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Informações</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      <QRCodeModal asset={selectedQRAsset} onClose={() => setSelectedQRAsset(null)} />
    </div>
  );
}
