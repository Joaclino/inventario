'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getInventories,
  getAssets,
  saveInventory,
  getCurrentUser,
  isUserAdmin,
  updatePhysicalCheckStatus
} from '@/lib/storage';
import { Inventory, Asset, UserProfile, PhysicalCheckStatus } from '@/types/inventory';
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
  Check,
  List,
  LayoutGrid,
  FileDown,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact');
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

  const handleCheckStatusChange = (assetId: string, status: PhysicalCheckStatus) => {
    updatePhysicalCheckStatus(assetId, status, inventory?.responsible_name);
    loadAssets();
  };

  const filteredAssets = assets.filter(a =>
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code.toLowerCase().includes(search.toLowerCase()) ||
    a.location_name.toLowerCase().includes(search.toLowerCase()) ||
    a.responsible_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalQty = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);

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
      {/* Cabeçalho de Impressão PDF */}
      <PrintHeader
        department={{ id: departmentId, code: 'TWFTW', name: inventory.title, responsible_name: inventory.responsible_name }}
        inventory={inventory}
      />

      {/* Botões Superiores */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.push('/')}
          className="py-2 px-3.5 bg-white border border-slate-300 text-slate-700 hover:text-twftw-navy rounded-xl text-xs font-bold flex items-center shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Início
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 bg-twftw-navy hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>[ 📄 EXPORTAR PDF / IMPRIMIR ]</span>
          </button>

          <button
            onClick={() => exportDepartmentInventoryToExcel(
              { id: departmentId, code: 'TWFTW', name: inventory.title, responsible_name: inventory.responsible_name },
              inventory,
              assets
            )}
            className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* CABEÇALHO DO INVENTÁRIO TEMA CLARO TWFTW */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center space-x-1 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Em Andamento</span>
            </span>

            <h1 className="text-2xl font-black text-twftw-navy">{inventory.title}</h1>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Responsável: <span className="text-slate-900">{inventory.responsible_name}</span> • <span className="text-twftw-navy font-bold">{assets.length} bens registados ({totalQty} itens)</span>
            </p>
          </div>

          <Link
            href={`/inventory/${departmentId}/new-asset`}
            className="py-3.5 px-6 bg-twftw-navy hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <span>[ ➕ REGISTAR NOVO ITEM ]</span>
          </Link>
        </div>
      </div>

      {/* AS 3 ABAS */}
      <div className="border-b border-slate-200 no-print">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-4 font-black text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'assets'
                ? 'border-twftw-navy text-twftw-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Lista de Bens ({assets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 font-black text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'border-twftw-navy text-twftw-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Resumo</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-black text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'info'
                ? 'border-twftw-navy text-twftw-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assinatura & Notas</span>
          </button>
        </nav>
      </div>

      {/* ABA 1 — LISTA DE BENS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Pesquisar objeto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-twftw-navy shadow-sm"
              />
            </div>

            {/* Alternador Modo Lista Compacta vs Cards */}
            <div className="flex items-center space-x-1 bg-slate-200 p-1 rounded-2xl w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'compact' ? 'bg-white text-twftw-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Lista Compacta</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'cards' ? 'bg-white text-twftw-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </button>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 space-y-3 shadow-sm">
              <Package className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-800">Nenhum item registado ainda</p>
              <Link
                href={`/inventory/${departmentId}/new-asset`}
                className="py-2.5 px-5 bg-twftw-navy text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1 shadow"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Registar Primeiro Item</span>
              </Link>
            </div>
          ) : viewMode === 'compact' ? (
            /* TABELA COMPACTA ULTRA LÍMPIDA */
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Descrição do Objeto</th>
                      <th className="py-3 px-4 text-center">Qtd</th>
                      <th className="py-3 px-4">Localização</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Conferência Física</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAssets.map((asset, index) => (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-twftw-navy">
                          {asset.asset_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{asset.description}</div>
                          {asset.photos && asset.photos.length > 0 && (
                            <span className="text-[10px] text-blue-600 font-semibold">📷 Foto anexada</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {asset.quantity || 1}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {asset.location_name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 px-2.5 py-0.5 rounded-full bg-slate-100">
                            {asset.state_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              onClick={() => handleCheckStatusChange(asset.id, 'found')}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                asset.physical_check_status === 'found'
                                  ? 'bg-emerald-600 text-white shadow'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100'
                              }`}
                              title="Marcar como Encontrado"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCheckStatusChange(asset.id, 'not_found')}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                                asset.physical_check_status === 'not_found'
                                  ? 'bg-red-600 text-white shadow'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-100'
                              }`}
                              title="Marcar como Ausente"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRELHA DE CARDS */
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
          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-sm">
            <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Registos de Bens</span>
            <span className="text-4xl font-black text-twftw-navy">{assets.length}</span>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-sm">
            <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Total de Itens</span>
            <span className="text-4xl font-black text-emerald-600">{totalQty}</span>
          </div>
        </div>
      )}

      {/* ABA 3 — INFORMAÇÕES */}
      {activeTab === 'info' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-black text-twftw-navy">Assinatura & Notas Finais</h3>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Observações do Inventário</label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Escreva alguma nota sobre a contagem..."
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-twftw-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Assinatura do Responsável</label>
            <input
              type="text"
              value={responsibleSignature}
              onChange={(e) => setResponsibleSignature(e.target.value)}
              placeholder="Digite o seu nome por extenso..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-twftw-navy"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center">
                <Check className="w-4 h-4 mr-1" /> Guardado!
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              className="ml-auto py-2.5 px-5 bg-twftw-navy text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow"
            >
              <Save className="w-4 h-4 text-amber-400" />
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
