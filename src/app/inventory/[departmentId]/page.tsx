'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getDepartments,
  getInventories,
  getAssets,
  saveInventory,
  getCategories,
  getAssetStates,
  getCurrentUser
} from '@/lib/storage';
import { Department, Inventory, Asset, Category, AssetState, UserProfile } from '@/types/inventory';
import AssetCard from '@/components/AssetCard';
import QRCodeModal from '@/components/QRCodeModal';
import PrintHeader from '@/components/PrintHeader';
import { exportDepartmentInventoryToExcel, formatCurrencyKz } from '@/lib/export/excel';
import {
  Boxes,
  Building2,
  PlusCircle,
  Search,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  BarChart3,
  FileText,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  PenTool,
  Save,
  Check
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

export default function DepartmentInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<AssetState[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Aba ativa (1 = BENS, 2 = RESUMO, 3 = INFORMAÇÕES)
  const [activeTab, setActiveTab] = useState<'assets' | 'summary' | 'info'>('assets');

  // Filtros da Aba 1 (Bens)
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCheckStatus, setSelectedCheckStatus] = useState<string>('all');

  // Modal QR Code
  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  // Campos de Edição da Aba 3 (Informações & Assinatura)
  const [responsibleSignature, setResponsibleSignature] = useState('');
  const [adminSignature, setAdminSignature] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const depts = getDepartments();
    const currentDept = depts.find(d => d.id === departmentId);
    if (!currentDept) {
      router.push('/departments');
      return;
    }
    setDepartment(currentDept);

    let inv = getInventories().find(i => i.department_id === departmentId);
    if (!inv) {
      inv = saveInventory({
        department_id: departmentId,
        responsible_name: currentDept.responsible_name,
        title: `Inventário Geral — ${currentDept.name} 2026`,
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0]
      });
    }
    setInventory(inv);
    setGeneralNotes(inv.general_notes || '');
    setResponsibleSignature(inv.responsible_signature || '');
    setAdminSignature(inv.admin_validation_signature || '');

    setCategories(getCategories());
    setStates(getAssetStates());
    loadAssets();
  }, [departmentId]);

  const loadAssets = () => {
    const allAssets = getAssets();
    setAssets(allAssets.filter(a => a.department_id === departmentId));
  };

  // Filtragem de bens
  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.asset_code.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      (a.brand && a.brand.toLowerCase().includes(search.toLowerCase())) ||
      (a.model && a.model.toLowerCase().includes(search.toLowerCase())) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(search.toLowerCase())) ||
      a.responsible_name.toLowerCase().includes(search.toLowerCase()) ||
      a.location_name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || a.category_name === selectedCategory;
    const matchesState = selectedState === 'all' || a.state_name === selectedState;
    const matchesCheck = selectedCheckStatus === 'all' || a.physical_check_status === selectedCheckStatus;

    return matchesSearch && matchesCategory && matchesState && matchesCheck;
  });

  // Estatísticas para a Aba 2 (Resumo)
  const totalAssetsCount = assets.length;
  const totalQuantitySum = assets.reduce((sum, a) => sum + (a.quantity || 1), 0);
  const totalAcquisitionSum = assets.reduce((sum, a) => sum + (a.acquisition_value || 0), 0);
  const totalEstimatedSum = assets.reduce((sum, a) => sum + (a.estimated_current_value || 0), 0);

  // Totais por Categoria
  const categoryChartData: { name: string; value: number }[] = [];
  const catMap: Record<string, number> = {};
  assets.forEach(a => {
    catMap[a.category_name] = (catMap[a.category_name] || 0) + (a.quantity || 1);
  });
  Object.entries(catMap).forEach(([name, value]) => {
    categoryChartData.push({ name, value });
  });

  // Totais por Estado
  const stateChartData: { name: string; value: number }[] = [];
  const stateMap: Record<string, number> = {};
  assets.forEach(a => {
    stateMap[a.state_name] = (stateMap[a.state_name] || 0) + (a.quantity || 1);
  });
  Object.entries(stateMap).forEach(([name, value]) => {
    stateChartData.push({ name, value });
  });

  const CHART_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Ações da Aba 3 (Salvar Assinatura / Concluir / Validar)
  const handleSaveInfo = () => {
    if (!inventory || !department) return;
    const updated = saveInventory({
      ...inventory,
      general_notes: generalNotes,
      responsible_signature: responsibleSignature,
      admin_validation_signature: adminSignature
    });
    setInventory(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCompleteInventory = () => {
    if (!inventory) return;
    const updated = saveInventory({
      ...inventory,
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0],
      responsible_signature: responsibleSignature || `${inventory.responsible_name} - ${new Date().toLocaleDateString('pt-PT')}`
    });
    setInventory(updated);
  };

  const handleValidateInventory = () => {
    if (!inventory) return;
    const updated = saveInventory({
      ...inventory,
      status: 'validated',
      validated_by: user?.full_name || 'Administrador IT',
      validated_at: new Date().toISOString(),
      admin_validation_signature: adminSignature || `Admin IT - Validado em ${new Date().toLocaleDateString('pt-PT')}`
    });
    setInventory(updated);
  };

  if (!department) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Cabeçalho Imprimível em PDF */}
      <PrintHeader department={department} inventory={inventory || undefined} />

      {/* Cabeçalho do Inventário (Visível na Web) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-500/30">
                {department.code}
              </span>

              {inventory?.status === 'validated' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>🔵 Validado pelo Administrador</span>
                </span>
              )}
              {inventory?.status === 'completed' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>🟢 Concluído</span>
                </span>
              )}
              {inventory?.status === 'in_progress' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>🟡 Em Andamento</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Inventário — {department.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Responsável pelo levantamento: <span className="text-slate-200 font-semibold">{inventory?.responsible_name || department.responsible_name}</span>
            </p>
          </div>

          {/* Botões de Ação Principais (Exportar Excel & PDF) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportDepartmentInventoryToExcel(department, inventory || undefined, assets)}
              className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-2"
              title="Exportar Excel com 3 Folhas Formatas"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center space-x-2"
              title="Versão para Impressão e PDF"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* AS 3 ABAS PRINCIPAIS */}
      <div className="border-b border-slate-800 no-print">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'assets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>ABA 1 — BENS</span>
            <span className="ml-1.5 bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {assets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ABA 2 — RESUMO</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ABA 3 — INFORMAÇÕES</span>
          </button>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* ABA 1 — BENS */}
      {/* ============================================================== */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Barra de Ações & Filtros para Telemóvel */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar código, descrição, marca, nº série, responsável..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <Link
                href={`/inventory/${departmentId}/new-asset`}
                className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Adicionar Novo Bem (&lt; 1 min)</span>
              </Link>
            </div>

            {/* Selects de Filtro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos os Estados de Conservação</option>
                {states.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>

              <select
                value={selectedCheckStatus}
                onChange={(e) => setSelectedCheckStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas as Conferências Físicas</option>
                <option value="found">✅ Encontrado</option>
                <option value="not_found">❌ Não encontrado</option>
                <option value="needs_verification">⚠️ Precisa verificar</option>
              </select>
            </div>
          </div>

          {/* Cards no Telemóvel & Grelha em Desktop */}
          {filteredAssets.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Nenhum bem encontrado</h3>
              <p className="text-xs text-slate-400 mb-4">Ainda não foram registrados bens neste inventário com os filtros selecionados.</p>
              <Link
                href={`/inventory/${departmentId}/new-asset`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registar Primeiro Bem</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
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

      {/* ============================================================== */}
      {/* ABA 2 — RESUMO */}
      {/* ============================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Grelha de Métricas Visuais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Total de Bens</span>
              <div className="text-3xl font-extrabold text-white">{totalAssetsCount}</div>
              <span className="text-xs text-slate-500 mt-1 block">Registos patrimoniais</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Total de Quantidades</span>
              <div className="text-3xl font-extrabold text-emerald-400">{totalQuantitySum}</div>
              <span className="text-xs text-emerald-500/80 mt-1 block">Itens/unidades físicas</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Valor de Aquisição</span>
              <div className="text-xl font-extrabold text-blue-400 truncate">{formatCurrencyKz(totalAcquisitionSum)}</div>
              <span className="text-xs text-slate-500 mt-1 block">Investimento histórico em Kz</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Valor Estimado Atual</span>
              <div className="text-xl font-extrabold text-cyan-400 truncate">{formatCurrencyKz(totalEstimatedSum)}</div>
              <span className="text-xs text-slate-500 mt-1 block">Valor patrimonial atual em Kz</span>
            </div>
          </div>

          {/* Gráficos Visuais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico por Categoria */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">Total por Categoria</h3>
              {categoryChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      />
                      <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-12 text-xs">Sem dados suficientes</div>
              )}
            </div>

            {/* Gráfico por Estado de Conservação */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">Total por Estado de Conservação</h3>
              {stateChartData.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stateChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stateChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-12 text-xs">Sem dados suficientes</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ABA 3 — INFORMAÇÕES */}
      {/* ============================================================== */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Metadados & Estado do Inventário</h3>
              <p className="text-xs text-slate-400">Informações oficiais de controlo e validação</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block uppercase text-[10px] mb-1">Departamento</span>
                <span className="text-sm font-bold text-white">{department.name} ({department.code})</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block uppercase text-[10px] mb-1">Responsável pelo Levantamento</span>
                <span className="text-sm font-bold text-white">{inventory?.responsible_name || department.responsible_name}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block uppercase text-[10px] mb-1">Data de Início</span>
                <span className="text-sm font-bold text-white">{inventory?.start_date || '-'}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block uppercase text-[10px] mb-1">Data de Conclusão</span>
                <span className="text-sm font-bold text-white">{inventory?.end_date || 'Em andamento'}</span>
              </div>
            </div>

            {/* Observações Gerais */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Observações Gerais do Inventário
              </label>
              <textarea
                rows={3}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Insira notas explicativas ou observações sobre o levantamento..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Secção de Assinaturas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
              {/* Assinatura do Responsável */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Assinatura do Responsável pelo Levantamento</span>
                <input
                  type="text"
                  placeholder="Nome por extenso / Código de Assinatura"
                  value={responsibleSignature}
                  onChange={(e) => setResponsibleSignature(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCompleteInventory}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Levantamento</span>
                </button>
              </div>

              {/* Validação do Administrador / IT */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Validação do Administrador / IT</span>
                <input
                  type="text"
                  placeholder="Assinatura Digital do Administrador"
                  value={adminSignature}
                  onChange={(e) => setAdminSignature(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleValidateInventory}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validar Inventário (Admin)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Dados guardados com sucesso!
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveInfo}
                className="ml-auto py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1 shadow-lg shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Informações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      <QRCodeModal asset={selectedQRAsset} onClose={() => setSelectedQRAsset(null)} />
    </div>
  );
}
