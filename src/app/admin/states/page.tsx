'use client';

import { useState, useEffect } from 'react';
import { getAssetStates, saveAssetState } from '@/lib/storage';
import { AssetState } from '@/types/inventory';
import { SlidersHorizontal, Plus } from 'lucide-react';

export default function AdminStatesPage() {
  const [states, setStates] = useState<AssetState[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('blue');

  useEffect(() => {
    setStates(getAssetStates());
  }, []);

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    saveAssetState({
      name,
      code: code.toUpperCase(),
      color,
      is_custom: true
    });

    setName('');
    setCode('');
    setStates(getAssetStates());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Estados de Conservação</h1>
          <p className="text-xs text-slate-400">Personalizar opções de estado de conservação dos bens</p>
        </div>
      </div>

      {/* Formulário Novo Estado */}
      <form onSubmit={handleAddState} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Criar Novo Estado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Estado *</label>
            <input
              type="text"
              placeholder="Ex: Em Garantia, Sucata..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Código Único *</label>
            <input
              type="text"
              placeholder="Ex: GARANTIA, SUCATA..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Cor do Destaque</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="blue">Azul</option>
              <option value="green">Verde</option>
              <option value="emerald">Verde Esmeralda</option>
              <option value="yellow">Amarelo</option>
              <option value="amber">Âmbar</option>
              <option value="orange">Laranja</option>
              <option value="red">Vermelho</option>
              <option value="purple">Roxo</option>
              <option value="rose">Rosa</option>
              <option value="slate">Cinzento</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Estado</span>
        </button>
      </form>

      {/* Lista de Estados */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">Estados Ativos ({states.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {states.map(s => (
            <div key={s.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="font-bold text-xs text-white block mb-0.5">{s.name}</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">{s.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
