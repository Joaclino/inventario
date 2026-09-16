'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAssets, getDepartments, getCategories, getAssetStates } from '@/lib/storage';
import { Asset, Department, Category, AssetState } from '@/types/inventory';
import AssetCard from '@/components/AssetCard';
import QRCodeModal from '@/components/QRCodeModal';
import { Search, Filter, Hash, Package, Building2, MapPin, SlidersHorizontal } from 'lucide-react';

export default function GlobalAssetSearchPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<AssetState[]>([]);

  // Filtros
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedSituation, setSelectedSituation] = useState('all');

  const [selectedQRAsset, setSelectedQRAsset] = useState<Asset | null>(null);

  useEffect(() => {
    setAssets(getAssets());
    setDepartments(getDepartments());
    setCategories(getCategories());
    setStates(getAssetStates());
  }, []);

  const filteredAssets = assets.filter(a => {
    const q = query.toLowerCase();
    const matchesQuery =
      a.asset_code.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.brand && a.brand.toLowerCase().includes(q)) ||
      (a.model && a.model.toLowerCase().includes(q)) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(q)) ||
      a.responsible_name.toLowerCase().includes(q) ||
      a.location_name.toLowerCase().includes(q) ||
      a.category_name.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'all' || a.department_id === selectedDept;
    const matchesCat = selectedCat === 'all' || a.category_name === selectedCat;
    const matchesState = selectedState === 'all' || a.state_name === selectedState;
    const matchesSituation = selectedSituation === 'all' || a.situation === selectedSituation;

    return matchesQuery && matchesDept && matchesCat && matchesState && matchesSituation;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pesquisa Global & Filtros de Ativos</h1>
          <p className="text-xs text-slate-400">Pesquise por código patrimonial, marca, modelo, número de série ou responsável em toda a organização</p>
        </div>

        {/* Input de Pesquisa Global */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder='Pesquise "HP", "ORG-000001", "Cisco", "Maria" ou número de série...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* Combinação de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Departamento</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Categoria</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Estado de Conservação</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Estados</option>
              {states.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Situação do Bem</label>
            <select
              value={selectedSituation}
              onChange={(e) => setSelectedSituation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as Situações</option>
              <option value="Em uso">Em uso</option>
              <option value="Em armazenamento">Em armazenamento</option>
              <option value="Em manutenção">Em manutenção</option>
              <option value="Em empréstimo">Em empréstimo</option>
              <option value="Sem uso">Sem uso</option>
              <option value="Danificado">Danificado</option>
              <option value="Perdido">Perdido</option>
              <option value="Abatido">Abatido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
          <span>{filteredAssets.length} bens encontrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onOpenQR={(ast) => setSelectedQRAsset(ast)}
            />
          ))}
        </div>
      </div>

      {/* Modal QR Code */}
      <QRCodeModal asset={selectedQRAsset} onClose={() => setSelectedQRAsset(null)} />
    </div>
  );
}
