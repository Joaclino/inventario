'use client';

import { useState, useEffect } from 'react';
import { getCategories, saveCategory, addSubcategory } from '@/lib/storage';
import { Category } from '@/types/inventory';
import { FolderTree, Plus, PlusCircle, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatCode) return;

    saveCategory({
      name: newCatName,
      code: newCatCode.toUpperCase(),
      description: newCatDesc,
      is_custom: true
    });

    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setCategories(getCategories());
  };

  const handleAddSubcategory = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName) return;

    addSubcategory(catId, newSubName);
    setNewSubName('');
    setCategories(getCategories());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
          <FolderTree className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestão de Categorias e Subcategorias</h1>
          <p className="text-xs text-slate-400">Adicione novas categorias de bens sem alterar o código da aplicação</p>
        </div>
      </div>

      {/* Formulário para Nova Categoria */}
      <form onSubmit={handleAddCategory} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Criar Nova Categoria</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nome da Categoria *</label>
            <input
              type="text"
              placeholder="Ex: COZINHA, ALOJAMENTO..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Código (3 Letras) *</label>
            <input
              type="text"
              placeholder="Ex: COZ, ALO..."
              maxLength={4}
              value={newCatCode}
              onChange={(e) => setNewCatCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Descrição breve..."
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Categoria</span>
        </button>
      </form>

      {/* Lista de Categorias Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30 mr-2">
                  {cat.code}
                </span>
                <span className="font-bold text-white text-base">{cat.name}</span>
              </div>
              {cat.is_custom && (
                <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Personalizada
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">{cat.description || 'Sem descrição.'}</p>

            {/* Subcategorias */}
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">Subcategorias:</span>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  cat.subcategories.map(s => (
                    <span key={s.id} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-600 text-xs">Nenhuma subcategoria registada</span>
                )}
              </div>

              {/* Formulário Rápido de Subcategoria */}
              <form onSubmit={(e) => handleAddSubcategory(cat.id, e)} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nova subcategoria..."
                  value={selectedCatId === cat.id ? newSubName : ''}
                  onFocus={() => setSelectedCatId(cat.id)}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-bold"
                >
                  + Adicionar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
